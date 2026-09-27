import { User } from "@aqua-calendar/database"

export type CreateUserDto = Pick<
  User,
  | "email"
  | "displayName"
  | "passwordHash"
  | "authProvider"
  | "status"
  | "photoURL"
>
