import type { Express } from "express";
import { type Server } from "http";
import { registerCommandRoute } from "./command";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Command Center — AI agent orchestration (SSE)
  registerCommandRoute(app);
  return httpServer;
}
