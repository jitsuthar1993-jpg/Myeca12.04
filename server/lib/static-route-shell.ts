import fs from "fs";
import path from "path";

export function resolveStaticRouteShell(
  distPath: string,
  requestPath: string,
  existsSync: (candidate: string) => boolean = fs.existsSync,
) {
  let decodedPath: string;

  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch {
    return null;
  }

  if (decodedPath === "/" || decodedPath.endsWith("/")) return null;

  const routeIndex = path.resolve(distPath, decodedPath.replace(/^\/+/, ""), "index.html");
  const relativePath = path.relative(distPath, routeIndex);
  const escapesDistPath = relativePath.startsWith("..") || path.isAbsolute(relativePath);

  return !escapesDistPath && existsSync(routeIndex) ? routeIndex : null;
}
