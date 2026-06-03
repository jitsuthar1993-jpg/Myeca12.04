import "dotenv/config";
import app, { _routesReady } from "./app.js";
import { getServerListenConfig } from "./lib/listen-config.js";
import { log, setupVite, serveStatic } from "./vite.js";

const { host, port } = getServerListenConfig();

void _routesReady.then(async () => {
  const server = app.listen(port, host, () => {
    log(`serving on ${host}:${port}`);
  });

  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
});
