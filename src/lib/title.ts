import path from "node:path";

export function titleFromFilename(fileName: string): string {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function titleFromH1(content: string): string | undefined {
  return /^#\s+(.+)$/m.exec(content)?.[1]?.trim();
}
