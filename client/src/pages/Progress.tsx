import { useQuery } from "@tanstack/react-query";
import { Trophy, Dumbbell, Heart, Flame, Zap, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid
} from "recharts";
import type { WorkoutSession, PersonalRecord, WorkoutDay } from "@shared/schema";

const dayTypeIcons: Record<string, any> = {
  strength: Dumbbell,
  endurance_long: Heart,
  endurance_moderate: Zap,
  hiit: Flame,
  recovery: Heart,
};

const ORANGE = "hsl(18, 86%, 52%)";
const AMBER = "hsl(36, 92%, 58%)";

function PRCard({ pr }: { pr: PersonalRecord }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-colors" data-testid={`pr-card-${pr.id}`}>
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Trophy className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{pr.exerciseName}</p>
        <p className="text-xs text-muted-foreground">{pr.muscleGroup}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-primary">{pr.weightKg}kg × {pr.reps}</p>
        <p className="text-xs text-muted-foreground">{new Date(pr.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
      </div>
    </div>
  );
}

export default function Progress() {
  const { data: sessions, isLoading: sessionsLoading } = useQuery<WorkoutSession[]>({ queryKey: ["/api/sessions"] });
  const { data: prs, isLoading: prsLoading } = useQuery<PersonalRecord[]>({ queryKey: ["/api/prs"] });
  const { data: days } = useQuery<WorkoutDay[]>({ queryKey: ["/api/workout-days"] });

  // Build weekly workout count chart (last 8 weeks)
  const weeklyData = (() => {
    if (!sessions) return [];
    const weeks: Record<string, number> = {};
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const wk = `W${i === 0 ? "0" : i}`;
      weeks[wk] = 0;
    }
    sessions.filter((s) => s.completed).forEach((s) => {
      const daysAgo = Math.floor((Date.now() - new Date(s.date).getTime()) / 86400000);
      const weekIdx = Math.floor(daysAgo / 7);
      if (weekIdx <= 7) {
        const key = `W${weekIdx}`;
        if (weeks[key] !== undefined) weeks[key]++;
      }
    });
    return Object.entries(weeks).reverse().map(([week, count]) => ({
      week: week === "W0" ? "This wk" : week,
      count,
    }));
  })();

  // Workout type distribution
  const typeData = (() => {
    if (!sessions || !days) return [];
    const counts: Record<string, number> = {};
    sessions.filter((s) => s.completed).forEach((s) => {
      const day = days.find((d) => d.id === s.dayTypeId);
      if (day) {
        counts[day.name] = (counts[day.name] ?? 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name: name.split(" ")[0], count }));
  })();

  const completedSessions = sessions?.filter((s) => s.completed) ?? [];
  const totalDuration = completedSessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const avgDuration = completedSessions.length ? Math.round(totalDuration / completedSessions.length) : 0;

  // Last 10 sessions for timeline
  const recentCompleted = completedSessions.slice(0, 10);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Progress</h1>
        <p className="text-sm text-muted-foreground">Track Sophia's strength journey</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Sessions</p>
            <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
              {completedSessions.length}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {avgDuration}<span className="text-sm text-muted-foreground ml-1">min</span>
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Personal Records</p>
            <p className="text-2xl font-bold text-amber-500" style={{ fontFamily: "var(--font-display)" }}>
              {prs?.length ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Strength Days</p>
            <p className="text-2xl font-bold text-green-500" style={{ fontFamily: "var(--font-display)" }}>
              {completedSessions.filter((s) => {
                const day = days?.find((d) => d.id === s.dayTypeId);
                return day?.dayType === "strength";
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Volume Chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Weekly Workout Volume
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {sessionsLoading ? (
            <Skeleton className="h-44 w-full rounded-lg" />
          ) : weeklyData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
              No data yet — complete some workouts first!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} barSize={28}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(220 5% 52%)" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(220 5% 52%)" }} axisLine={false} tickLine={false} width={24} />
                <Tooltip
                  contentStyle={{ background: "hsl(220 13% 12%)", border: "1px solid hsl(220 10% 22%)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(30 8% 88%)" }}
                  itemStyle={{ color: ORANGE }}
                  formatter={(v: any) => [`${v} sessions`, "Workouts"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((_, i) => (
                    <Cell key={i} fill={i === weeklyData.length - 1 ? ORANGE : "hsl(18 86% 52% / 0.35)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Workout Type Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" />
              By Workout Type
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {sessionsLoading ? (
              <Skeleton className="h-40 w-full rounded-lg" />
            ) : typeData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={typeData} layout="vertical" barSize={16}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(220 5% 52%)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(220 5% 52%)" }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip contentStyle={{ background: "hsl(220 13% 12%)", border: "1px solid hsl(220 10% 22%)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill={AMBER} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Personal Records */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 max-h-[200px] overflow-y-auto space-y-2 pr-1">
            {prsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)
            ) : prs?.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-sm text-muted-foreground text-center">
                No PRs yet — log workouts and set your records!
              </div>
            ) : (
              prs?.map((pr) => <PRCard key={pr.id} pr={pr} />)
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {sessionsLoading ? (
            <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : recentCompleted.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No completed sessions yet.</div>
          ) : (
            <div className="space-y-2">
              {recentCompleted.map((session) => {
                const day = days?.find((d) => d.id === session.dayTypeId);
                const Icon = day ? dayTypeIcons[day.dayType] : Dumbbell;
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                    data-testid={`history-session-${session.id}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{day?.name ?? "Workout"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={`text-xs ${session.schedule === "A" ? "schedule-a" : "schedule-b"}`}>
                        {session.schedule}
                      </Badge>
                      {session.energyLevel && (
                        <span className="text-xs text-muted-foreground">⚡{session.energyLevel}/5</span>
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
