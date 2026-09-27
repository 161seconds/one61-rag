import { InjectRedisCache } from "./cache.decorator"
import { Injectable } from "@nestjs/common"
import type { Cache } from "cache-manager"
import superjson from "superjson"

interface SetParams<T> {
  key: string
  value: T
  ttl?: number
}

@Injectable()
export class CacheService {
  constructor(
    @InjectRedisCache()
    private readonly redisCacheManager: Cache
  ) {}

  private serialize<T>(value: T): string {
    return superjson.stringify(value)
  }

  private deserialize<T>(value: string): T {
    return superjson.parse<T>(value)
  }

  public async set<T>({ key, value, ttl }: SetParams<T>): Promise<void> {
    const serialized = this.serialize(value)
    await this.redisCacheManager.set(key, serialized, ttl)
  }

  public async get<T>(key: string): Promise<T | null> {
    const value = await this.redisCacheManager.get<string>(key)
    return value ? this.deserialize<T>(value) : null
  }

  public async mget<T>(keys: string[]): Promise<T[] | null> {
    const results: Array<T | null> = new Array(keys.length).fill(null)
    keys.forEach(async (key, index) => {
      const value = await this.redisCacheManager.get<string>(key)
      if (value) {
        results[index] = this.deserialize<T>(value)
      }
    })
    return results.filter((result): result is T => result !== null)
  }

  public async mset<T>(keyValues: SetParams<T>[]): Promise<void> {
    keyValues.forEach(({ key, value, ttl }) => {
      const serialized = this.serialize(value)
      this.redisCacheManager.set(key, serialized, ttl)
    })
  }

  public async del(key: string): Promise<void> {
    await this.redisCacheManager.del(key)
  }

  public async mdel(keys: string[]): Promise<void> {
    await this.redisCacheManager.mdel(keys)
  }
}
