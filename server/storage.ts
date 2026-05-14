import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, and } from "drizzle-orm";
import {
  workoutDays,
  workoutSessions,
  exerciseSets,
  personalRecords,
  cardioSessions,
  type WorkoutDay,
  type WorkoutSession,
  type ExerciseSet,
  type PersonalRecord,
  type CardioSession,
  type InsertWorkoutSession,
  type InsertExerciseSet,
  type InsertPersonalRecord,
  type InsertCardioSession,
} from "@shared/schema";

const sqlite = new Database("data.db");
const db = drizzle(sqlite);

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS workout_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    day_type TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workout_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_type_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    schedule TEXT NOT NULL DEFAULT 'A',
    duration_minutes INTEGER,
    notes TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    energy_level INTEGER
  );

  CREATE TABLE IF NOT EXISTS exercise_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    range_type TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    reps INTEGER,
    weight_kg REAL,
    completed INTEGER NOT NULL DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS personal_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    reps INTEGER NOT NULL,
    date TEXT NOT NULL,
    session_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS cardio_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    cardio_type TEXT NOT NULL,
    activity TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    notes TEXT
  );
`);

// Seed default workout days if empty
const existingDays = sqlite.prepare("SELECT COUNT(*) as count FROM workout_days").get() as { count: number };
if (existingDays.count === 0) {
  sqlite.exec(`
    INSERT INTO workout_days (name, day_type, description, icon) VALUES
    ('Long Endurance', 'endurance_long', 'Zone 2 cardio: 60-75 min at conversational pace. Jogging, rowing, cycling, or hiking.', 'Heart'),
    ('Legs Day', 'strength', 'Quadriceps, hamstrings, and calves. 2 exercises per muscle group — one shortened, one lengthened position.', 'Dumbbell'),
    ('Recovery & Heat/Cold', 'recovery', 'Deliberate heat and cold exposure. No structured workout. Active recovery only.', 'Thermometer'),
    ('Torso & Neck', 'strength', 'Push-pull superset for chest, back, and shoulders. Include neck work.', 'Activity'),
    ('Moderate Cardio', 'endurance_moderate', '35 min at 75-80% max effort. Running, rowing, cycling, or stair climb.', 'Zap'),
    ('HIIT Sprints', 'hiit', '20-60 sec all-out sprint + 10 sec rest × 8-12 rounds. Bike, rowing, or sprints.', 'Flame'),
    ('Arms, Calves & Neck', 'strength', 'Biceps, triceps, calves, and neck. Dips, chin-ups, curls, kickbacks.', 'Dumbbell');
  `);
}

export interface IStorage {
  // Workout Days (templates)
  getWorkoutDays(): WorkoutDay[];

  // Sessions
  getSessions(): WorkoutSession[];
  getSessionById(id: number): WorkoutSession | undefined;
  createSession(data: InsertWorkoutSession): WorkoutSession;
  updateSession(id: number, data: Partial<InsertWorkoutSession>): WorkoutSession | undefined;
  deleteSession(id: number): void;

  // Exercise Sets
  getSetsBySession(sessionId: number): ExerciseSet[];
  createSet(data: InsertExerciseSet): ExerciseSet;
  updateSet(id: number, data: Partial<InsertExerciseSet>): ExerciseSet | undefined;
  deleteSet(id: number): void;
  deleteSetsBySession(sessionId: number): void;

  // Personal Records
  getPersonalRecords(): PersonalRecord[];
  createPersonalRecord(data: InsertPersonalRecord): PersonalRecord;

  // Cardio Sessions
  getCardioSessions(): CardioSession[];
  createCardioSession(data: InsertCardioSession): CardioSession;

  // Stats
  getWeeklySessionCount(): number;
  getTotalWorkouts(): number;
}

class Storage implements IStorage {
  getWorkoutDays(): WorkoutDay[] {
    return db.select().from(workoutDays).all();
  }

  getSessions(): WorkoutSession[] {
    return db.select().from(workoutSessions).orderBy(desc(workoutSessions.date)).all();
  }

  getSessionById(id: number): WorkoutSession | undefined {
    return db.select().from(workoutSessions).where(eq(workoutSessions.id, id)).get();
  }

  createSession(data: InsertWorkoutSession): WorkoutSession {
    return db.insert(workoutSessions).values(data).returning().get();
  }

  updateSession(id: number, data: Partial<InsertWorkoutSession>): WorkoutSession | undefined {
    return db.update(workoutSessions).set(data).where(eq(workoutSessions.id, id)).returning().get();
  }

  deleteSession(id: number): void {
    db.delete(workoutSessions).where(eq(workoutSessions.id, id)).run();
  }

  getSetsBySession(sessionId: number): ExerciseSet[] {
    return db.select().from(exerciseSets).where(eq(exerciseSets.sessionId, sessionId)).all();
  }

  createSet(data: InsertExerciseSet): ExerciseSet {
    return db.insert(exerciseSets).values(data).returning().get();
  }

  updateSet(id: number, data: Partial<InsertExerciseSet>): ExerciseSet | undefined {
    return db.update(exerciseSets).set(data).where(eq(exerciseSets.id, id)).returning().get();
  }

  deleteSet(id: number): void {
    db.delete(exerciseSets).where(eq(exerciseSets.id, id)).run();
  }

  deleteSetsBySession(sessionId: number): void {
    db.delete(exerciseSets).where(eq(exerciseSets.sessionId, sessionId)).run();
  }

  getPersonalRecords(): PersonalRecord[] {
    return db.select().from(personalRecords).orderBy(desc(personalRecords.date)).all();
  }

  createPersonalRecord(data: InsertPersonalRecord): PersonalRecord {
    return db.insert(personalRecords).values(data).returning().get();
  }

  getCardioSessions(): CardioSession[] {
    return db.select().from(cardioSessions).orderBy(desc(cardioSessions.date)).all();
  }

  createCardioSession(data: InsertCardioSession): CardioSession {
    return db.insert(cardioSessions).values(data).returning().get();
  }

  getWeeklySessionCount(): number {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];
    const result = sqlite
      .prepare("SELECT COUNT(*) as count FROM workout_sessions WHERE date >= ? AND completed = 1")
      .get(dateStr) as { count: number };
    return result.count;
  }

  getTotalWorkouts(): number {
    const result = sqlite.prepare("SELECT COUNT(*) as count FROM workout_sessions WHERE completed = 1").get() as {
      count: number;
    };
    return result.count;
  }
}

export const storage = new Storage();
