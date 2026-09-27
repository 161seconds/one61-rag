import { existsSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

export const DEFAULT_ENV_FILE_PATH = [
  ".env",
  ".env.development",
  ".env.production",
]

const WORKSPACE_SENTINEL = "pnpm-workspace.yaml"

function findWorkspaceRoot(startDirectory: string): string {
  let currentDirectory = resolve(startDirectory)

  while (true) {
    if (existsSync(join(currentDirectory, WORKSPACE_SENTINEL))) {
      return currentDirectory
    }

    const parentDirectory = dirname(currentDirectory)
    if (parentDirectory === currentDirectory) {
      return startDirectory
    }
    currentDirectory = parentDirectory
  }
}

export function getEnvFilePath(environment: string | undefined): string[] {
  const runtimeEnvironment = environment ?? "development"
  if (runtimeEnvironment !== "development") {
    return DEFAULT_ENV_FILE_PATH
  }

  const workspaceRoot = findWorkspaceRoot(process.cwd())
  return DEFAULT_ENV_FILE_PATH.map((fileName) => join(workspaceRoot, fileName))
}
