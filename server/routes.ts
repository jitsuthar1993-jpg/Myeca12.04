import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import documentsRouter from "./routes/documents";
import referralsRouter from "./routes/referrals";
import notificationsRouter from "./routes/notifications";
import teamsRouter from "./routes/teams";
import workflowsRouter from "./routes/workflows";
import reportsRouter from "./routes/reports";
import cmsRouter from "./routes/cms";
import analyticsRouter from "./routes/analytics";
import dbAdminRouter from "./routes/db-admin";
import systemRouter from "./routes/system";
import userRouter from "./routes/user";
import profilesRouter from "./routes/profiles";
import adminRouter from "./routes/admin";
import auditRouter from "./routes/audit";
import publicRouter from "./routes/public";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Error logging endpoint
  app.post("/api/errors/log", (req: Request, res: Response) => {
    res.status(200).json({ status: "logged" });
  });
  
  // Auth endpoint for Supabase integration
  const authRouter = (await import("./routes/auth")).default;
  app.use("/api/v1/auth", authRouter);

  // Mount feature routers
  app.use("/api/documents", documentsRouter);
  app.use("/api/referrals", referralsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/teams", teamsRouter);
  app.use("/api/workflows", workflowsRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/cms", cmsRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/db", dbAdminRouter);
  app.use("/api/system", systemRouter);
  app.use("/api/audit", auditRouter);
  
  // User-facing routes
  app.use("/api", userRouter);
  app.use("/api/profiles", profilesRouter);
  app.use("/api/public", publicRouter);

  // Admin routes
  app.use("/api/admin", adminRouter);

  return httpServer;
}
