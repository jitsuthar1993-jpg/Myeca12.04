import path from "node:path";

export const rootDir = process.cwd();
export const distPublicDir = path.join(rootDir, "dist", "public");
export const distMetaDir = path.join(rootDir, "dist", "meta");
export const contentContextPath = path.join(distMetaDir, "content-context.json");
