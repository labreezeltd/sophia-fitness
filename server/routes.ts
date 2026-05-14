import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertWorkoutSessionSchema, insertExerciseSetSchema, insertPersonalRecordSchema, insertCardioSessionSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Workout Days (templates)
  app.get("/api/workout-days", (_req, res) => {
    const days = storage.getWorkoutDays();
    res.json(days);
  });

  // Sessions
  app.get("/api/sessions", (_req, res) => {
    const sessions = storage.getSessions();
    res.json(sessions);
  });

  app.get("/api/sessions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const session = storage.getSessionById(id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  });

  app.post("/api/sessions", (req, res) => {
    const result = insertWorkoutSessionSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const session = storage.createSession(result.data);
    res.status(201).json(session);
  });

  app.patch("/api/sessions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const updated = storage.updateSession(id, req.body);
    if (!updated) return res.status(404).json({ error: "Session not found" });
    res.json(updated);
  });

  app.delete("/api/sessions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    storage.deleteSetsBySession(id);
    storage.deleteSession(id);
    res.json({ success: true });
  });

  // Exercise Sets
  app.get("/api/sessions/:id/sets", (req, res) => {
    const sessionId = parseInt(req.params.id);
    const sets = storage.getSetsBySession(sessionId);
    res.json(sets);
  });

  app.post("/api/sets", (req, res) => {
    const result = insertExerciseSetSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const set = storage.createSet(result.data);
    res.status(201).json(set);
  });

  app.patch("/api/sets/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const updated = storage.updateSet(id, req.body);
    if (!updated) return res.status(404).json({ error: "Set not found" });
    res.json(updated);
  });

  app.delete("/api/sets/:id", (req, res) => {
    const id = parseInt(req.params.id);
    storage.deleteSet(id);
    res.json({ success: true });
  });

  // Personal Records
  app.get("/api/prs", (_req, res) => {
    const prs = storage.getPersonalRecords();
    res.json(prs);
  });

  app.post("/api/prs", (req, res) => {
    const result = insertPersonalRecordSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const pr = storage.createPersonalRecord(result.data);
    res.status(201).json(pr);
  });

  // Cardio Sessions
  app.get("/api/cardio", (_req, res) => {
    const sessions = storage.getCardioSessions();
    res.json(sessions);
  });

  app.post("/api/cardio", (req, res) => {
    const result = insertCardioSessionSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const session = storage.createCardioSession(result.data);
    res.status(201).json(session);
  });

  // Stats
  app.get("/api/stats", (_req, res) => {
    const weeklyCount = storage.getWeeklySessionCount();
    const totalWorkouts = storage.getTotalWorkouts();
    const prs = storage.getPersonalRecords();
    const sessions = storage.getSessions().slice(0, 10);
    res.json({ weeklyCount, totalWorkouts, prCount: prs.length, recentSessions: sessions });
  });

  return httpServer;
}
