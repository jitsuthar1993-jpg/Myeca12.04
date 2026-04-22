import "dotenv/config";
import app, { _routesReady } from "./app.js";
import { log, setupVite, serveStatic } from "./vite.js";

const port = Number(process.env.PORT ?? 5000);

void _routesReady.then(async () => {
  const server = app.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });

  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
});
