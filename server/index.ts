import "dotenv/config";
import app, { _routesReady } from "./app.js";
import { log } from "./vite.js";

const port = Number(process.env.PORT ?? 5000);

void _routesReady.then(() => {
  app.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
});
