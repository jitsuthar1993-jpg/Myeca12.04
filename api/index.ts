import app, { _routesReady } from "../server/app";

export default async function handler(req: any, res: any) {
  await _routesReady;
  return app(req, res);
}
