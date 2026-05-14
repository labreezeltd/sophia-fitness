import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Workout days based on Huberman's foundational protocol
export const workoutDays = sqliteTable("workout_days", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // e.g. "Legs Day", "Torso & Neck", "Arms & Calves"
  dayType: text("day_type").notNull(), // 'strength', 'endurance_long', 'endurance_moderate', 'hiit', 'recovery'
  description: text("description").notNull(),
  icon: text("icon").notNull(), // lucide icon name
});

// Workout sessions logged by Sophia
export const workoutSessions = sqliteTable("workout_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dayTypeId: integer("day_type_id").notNull(), // which day template
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  schedule: text("schedule").notNull().default("A"), // 'A' (strength: 4-8 reps) or 'B' (hypertrophy: 8-15 reps)
  durationMinutes: integer("duration_minutes"),
  notes: text("notes"),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  energyLevel: integer("energy_level"), // 1-5
});

// Exercise sets logged per session
export const exerciseSets = sqliteTable("exercise_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull(),
  exerciseName: text("exercise_name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  rangeType: text("range_type").notNull(), // 'shortened' or 'lengthened'
  setNumber: integer("set_number").notNull(),
  reps: integer("reps"),
  weightKg: real("weight_kg"),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
});

// Personal records tracker
export const personalRecords = sqliteTable("personal_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exerciseName: text("exercise_name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  weightKg: real("weight_kg").notNull(),
  reps: integer("reps").notNull(),
  date: text("date").notNull(),
  sessionId: integer("session_id"),
});

// Cardio sessions
export const cardioSessions = sqliteTable("cardio_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  cardioType: text("cardio_type").notNull(), // 'zone2', 'moderate', 'hiit'
  activity: text("activity").notNull(), // 'running', 'cycling', 'rowing', etc.
  durationMinutes: integer("duration_minutes").notNull(),
  notes: text("notes"),
});

// Insert schemas
export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({ id: true });
export const insertExerciseSetSchema = createInsertSchema(exerciseSets).omit({ id: true });
export const insertPersonalRecordSchema = createInsertSchema(personalRecords).omit({ id: true });
export const insertCardioSessionSchema = createInsertSchema(cardioSessions).omit({ id: true });

// Types
export type WorkoutDay = typeof workoutDays.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type ExerciseSet = typeof exerciseSets.$inferSelect;
export type PersonalRecord = typeof personalRecords.$inferSelect;
export type CardioSession = typeof cardioSessions.$inferSelect;

export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type InsertExerciseSet = z.infer<typeof insertExerciseSetSchema>;
export type InsertPersonalRecord = z.infer<typeof insertPersonalRecordSchema>;
export type InsertCardioSession = z.infer<typeof insertCardioSessionSchema>;
