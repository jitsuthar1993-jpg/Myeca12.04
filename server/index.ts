import "dotenv/config";
import app, { _routesReady } from "./app";
import { log } from "./vite";

const port = Number(process.env.PORT ?? 5000);

void _routesReady.then(() => {
  app.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
});
