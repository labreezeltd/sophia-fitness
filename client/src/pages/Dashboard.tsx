import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Flame, Dumbbell, Trophy, Calendar, ChevronRight, Heart, Zap, Thermometer, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkoutSession, WorkoutDay } from "@shared/schema";

const dayTypeIcons: Record<string, any> = {
  strength: Dumbbell,
  endurance_long: Heart,
  endurance_moderate: Zap,
  hiit: Flame,
  recovery: Thermometer,
};

const dayTypeColors: Record<string, string> = {
  strength: "bg-primary/10 text-primary border-primary/20",
  endurance_long: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  endurance_moderate: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  hiit: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  recovery: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
};

const dayTypeLabels: Record<string, string> = {
  strength: "Strength",
  endurance_long: "Zone 2",
  endurance_moderate: "Cardio",
  hiit: "HIIT",
  recovery: "Recovery",
};

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <Card className="stat-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Weekly schedule template — 5 days on, Sat+Sun rest
const weekSchedule = [
  { day: "Sun", label: "Rest", type: "recovery", detail: "Full rest day" },
  { day: "Mon", label: "Legs", type: "strength", detail: "Quads, Hamstrings, Calves" },
  { day: "Tue", label: "Zone 2", type: "endurance_long", detail: "60-75 min easy cardio" },
  { day: "Wed", label: "Torso & Neck", type: "strength", detail: "Push-Pull Supersets" },
  { day: "Thu", label: "HIIT", type: "hiit", detail: "8-12 rounds × 20-60s" },
  { day: "Fri", label: "Arms & Calves", type: "strength", detail: "Biceps, Triceps, Calves, Neck" },
  { day: "Sat", label: "Rest", type: "recovery", detail: "Full rest day" },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    weeklyCount: number;
    totalWorkouts: number;
    prCount: number;
    recentSessions: WorkoutSession[];
  }>({ queryKey: ["/api/stats"] });

  const { data: days } = useQuery<WorkoutDay[]>({ queryKey: ["/api/workout-days"] });

  const today = new Date();
  const todayIndex = today.getDay(); // 0=Sun
  const todaySchedule = weekSchedule[todayIndex];
  const TodayIcon = dayTypeIcons[todaySchedule.type];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Hey Sophia 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          {today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} — Huberman Foundational Protocol
        </p>
      </div>

      {/* Today's Workout Hero */}
      <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden" data-testid="card-today-workout">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={dayTypeColors[todaySchedule.type]}>
                  {dayTypeLabels[todaySchedule.type]}
                </Badge>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                {todaySchedule.label}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{todaySchedule.detail}</p>
              <Link href="/log">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow-orange hover:bg-primary/90 transition-colors" data-testid="button-start-today">
                  <TodayIcon className="w-4 h-4" />
                  Start Workout
                </button>
              </Link>
            </div>
            <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 shrink-0">
              <TodayIcon className="w-10 h-10 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard icon={Flame} label="This Week" value={stats?.weeklyCount ?? 0} sub="workouts completed" color="bg-primary/10 text-primary" />
            <StatCard icon={Dumbbell} label="Total Workouts" value={stats?.totalWorkouts ?? 0} sub="sessions logged" color="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <StatCard icon={Trophy} label="Personal Records" value={stats?.prCount ?? 0} sub="PRs set" color="bg-green-500/10 text-green-600 dark:text-green-400" />
            <StatCard icon={Calendar} label="Split Type" value="7-Day" sub="Sun–Sat full split" color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
          </>
        )}
      </div>

      {/* Weekly Schedule */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">This Week's Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-7 gap-1.5">
            {weekSchedule.map(({ day, label, type }, i) => {
              const Icon = dayTypeIcons[type];
              const isToday = i === todayIndex;
              return (
                <div
                  key={day}
                  className={`rounded-xl p-2 text-center transition-all ${
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                  data-testid={`schedule-day-${day.toLowerCase()}`}
                >
                  <p className={`text-xs font-medium mb-1.5 ${isToday ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {day}
                  </p>
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${isToday ? "text-primary-foreground" : ""}`} />
                  <p className={`text-[10px] leading-tight font-medium ${isToday ? "text-primary-foreground" : ""}`}>
                    {label.split(" ")[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Sessions</CardTitle>
            <Link href="/progress">
              <button className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="button-view-all-progress">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {statsLoading ? (
            <div className="space-y-2">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : stats?.recentSessions?.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No workouts logged yet — let's get started!</p>
              <Link href="/log">
                <button className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors" data-testid="button-log-first">Log First Workout</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats?.recentSessions?.map((session) => {
                const day = days?.find((d) => d.id === session.dayTypeId);
                const Icon = day ? dayTypeIcons[day.dayType] : Dumbbell;
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                    data-testid={`session-item-${session.id}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{day?.name ?? "Workout"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${session.schedule === "A" ? "schedule-a" : "schedule-b"}`}>
                        Schedule {session.schedule}
                      </Badge>
                      {session.completed && (
                        <span className="text-green-500 text-xs font-medium">✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
