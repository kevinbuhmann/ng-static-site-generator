import { existsSync, mkdirSync, statSync, writeFileSync } from 'fs';
import { dirname, normalize } from 'path';

export function safeWriteFileSync(filePath: string, contents: string) {
  filePath = normalize(filePath);

  ensureDirectoryExists(filePath);
  writeFileSync(filePath, contents);
}

export function ensureDirectoryExists(filePath: string) {
  const dirPath = dirname(filePath);

  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    ensureDirectoryExists(dirPath);
    mkdirSync(dirPath);
  }
}
