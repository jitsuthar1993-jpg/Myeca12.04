import app, { _routesReady } from "../server/app.js";

export default async function handler(req: any, res: any) {
  await _routesReady;
  return app(req, res);
}
