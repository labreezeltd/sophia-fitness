import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, CheckCircle2, Circle, Dumbbell, Timer, Flame, Heart, Zap, Thermometer, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { WorkoutDay, WorkoutSession, ExerciseSet } from "@shared/schema";

const dayTypeIcons: Record<string, any> = {
  strength: Dumbbell,
  endurance_long: Heart,
  endurance_moderate: Zap,
  hiit: Flame,
  recovery: Thermometer,
};

// Weight guidance for a 17-year-old female beginner/intermediate (kg)
// Format: { scheduleA: "X-Xkg", scheduleB: "X-Xkg", tip: "form tip" }
const weightGuide: Record<string, { scheduleA: string; scheduleB: string; tip: string }> = {
  "Leg Curl":               { scheduleA: "15–25kg", scheduleB: "10–20kg", tip: "Control the lowering phase — 2-3 seconds down." },
  "Romanian Deadlift":      { scheduleA: "20–35kg", scheduleB: "15–25kg", tip: "Hinge at the hips, soft bend in knees, bar close to legs." },
  "Leg Extension":          { scheduleA: "15–25kg", scheduleB: "10–20kg", tip: "Squeeze at the top for 1 second before lowering." },
  "Deep Squat":             { scheduleA: "20–40kg", scheduleB: "15–30kg", tip: "Feet shoulder-width, chest up, knees track over toes." },
  "Seated Calf Raise":      { scheduleA: "20–40kg", scheduleB: "15–30kg", tip: "Full range — heel all the way down, full rise up." },
  "Standing Calf Raise":    { scheduleA: "BW–30kg", scheduleB: "BW–20kg", tip: "Slow 3-second lowering phase for max stimulus." },
  "Tibialis Raise":         { scheduleA: "BW",       scheduleB: "BW",       tip: "Stand against wall, toes up as high as possible — no weight needed." },
  "Cable Chest Crossover":  { scheduleA: "8–14kg",  scheduleB: "6–10kg",  tip: "Arms slightly bent, bring hands together in front of chest." },
  "Incline Dumbbell Press": { scheduleA: "8–14kg ea", scheduleB: "6–10kg ea", tip: "Elbows at 45°, lower slowly to full stretch." },
  "Seated Cable Row":       { scheduleA: "20–35kg", scheduleB: "15–25kg", tip: "Squeeze shoulder blades together at the end of each rep." },
  "Pull-Up / Lat Pulldown": { scheduleA: "BW or 25–40kg", scheduleB: "BW or 20–30kg", tip: "Pull elbows down to pockets — don't shrug." },
  "Lateral Raise":          { scheduleA: "4–8kg ea", scheduleB: "3–6kg ea", tip: "Slight lean forward, raise to shoulder height only." },
  "Overhead Press":         { scheduleA: "10–18kg", scheduleB: "8–14kg", tip: "Bar in front of face, full lockout at the top." },
  "Neck Lateral Raise":     { scheduleA: "2–4kg",   scheduleB: "1–3kg",   tip: "Very slow and controlled — neck muscles are delicate." },
  "Neck Head Raise":        { scheduleA: "2–4kg",   scheduleB: "1–3kg",   tip: "Lie on bench, use a plate on forehead, go gently." },
  "Preacher Curl":          { scheduleA: "8–14kg",  scheduleB: "6–10kg",  tip: "Full stretch at the bottom, squeeze hard at the top." },
  "Incline Dumbbell Curl":  { scheduleA: "5–10kg ea", scheduleB: "4–8kg ea", tip: "Let arms hang fully — this is the lengthened position." },
  "Tricep Kickback":        { scheduleA: "4–8kg ea", scheduleB: "3–6kg ea", tip: "Keep upper arm parallel to floor throughout." },
  "Overhead Extension":     { scheduleA: "8–14kg",  scheduleB: "6–10kg",  tip: "Hold one dumbbell with both hands, full stretch overhead." },
  "Chin-Up":                { scheduleA: "BW",       scheduleB: "BW",       tip: "Supinated grip (palms toward you), chin over the bar." },
  "Dips":                   { scheduleA: "BW",       scheduleB: "BW",       tip: "Slight forward lean to target chest; upright for triceps." },
};

// Preset exercises per workout type
const presetExercises: Record<string, { name: string; muscle: string; rangeType: "shortened" | "lengthened" }[]> = {
  "Legs Day": [
    { name: "Leg Curl", muscle: "Hamstrings", rangeType: "shortened" },
    { name: "Romanian Deadlift", muscle: "Hamstrings", rangeType: "lengthened" },
    { name: "Leg Extension", muscle: "Quadriceps", rangeType: "shortened" },
    { name: "Deep Squat", muscle: "Quadriceps", rangeType: "lengthened" },
    { name: "Seated Calf Raise", muscle: "Calves", rangeType: "shortened" },
    { name: "Standing Calf Raise", muscle: "Calves", rangeType: "lengthened" },
    { name: "Tibialis Raise", muscle: "Tibialis", rangeType: "shortened" },
  ],
  "Torso & Neck": [
    { name: "Cable Chest Crossover", muscle: "Chest", rangeType: "shortened" },
    { name: "Incline Dumbbell Press", muscle: "Chest", rangeType: "lengthened" },
    { name: "Seated Cable Row", muscle: "Back", rangeType: "shortened" },
    { name: "Pull-Up / Lat Pulldown", muscle: "Back", rangeType: "lengthened" },
    { name: "Lateral Raise", muscle: "Shoulders", rangeType: "shortened" },
    { name: "Overhead Press", muscle: "Shoulders", rangeType: "lengthened" },
    { name: "Neck Lateral Raise", muscle: "Neck", rangeType: "shortened" },
    { name: "Neck Head Raise", muscle: "Neck", rangeType: "lengthened" },
  ],
  "Arms, Calves & Neck": [
    { name: "Preacher Curl", muscle: "Biceps", rangeType: "shortened" },
    { name: "Incline Dumbbell Curl", muscle: "Biceps", rangeType: "lengthened" },
    { name: "Tricep Kickback", muscle: "Triceps", rangeType: "shortened" },
    { name: "Overhead Extension", muscle: "Triceps", rangeType: "lengthened" },
    { name: "Seated Calf Raise", muscle: "Calves", rangeType: "shortened" },
    { name: "Standing Calf Raise", muscle: "Calves", rangeType: "lengthened" },
    { name: "Chin-Up", muscle: "Biceps / Back", rangeType: "lengthened" },
    { name: "Dips", muscle: "Triceps / Chest", rangeType: "shortened" },
  ],
};

type SetEntry = {
  id?: number;
  exerciseName: string;
  muscleGroup: string;
  rangeType: "shortened" | "lengthened";
  setNumber: number;
  reps: string;
  weightKg: string;
  completed: boolean;
};

// Weight guide tooltip for an exercise
function WeightGuideChip({ exerciseName, schedule }: { exerciseName: string; schedule: "A" | "B" }) {
  const [open, setOpen] = useState(false);
  const guide = weightGuide[exerciseName];
  if (!guide) return null;
  const range = schedule === "A" ? guide.scheduleA : guide.scheduleB;
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 transition-colors"
        data-testid={`button-weight-guide-${exerciseName.replace(/\s/g, "-").toLowerCase()}`}
      >
        <Info className="w-3 h-3" />
        <span className="font-medium">{range}</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 w-56 p-2.5 rounded-lg bg-popover border border-border shadow-lg text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground mb-1">Form tip</p>
          <p>{guide.tip}</p>
        </div>
      )}
    </div>
  );
}

export default function LogWorkout() {
  const { toast } = useToast();
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [schedule, setSchedule] = useState<"A" | "B">("A");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [energyLevel, setEnergyLevel] = useState<string>("3");
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [customExercise, setCustomExercise] = useState({ name: "", muscle: "", rangeType: "shortened" as const });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const { data: days, isLoading: daysLoading } = useQuery<WorkoutDay[]>({ queryKey: ["/api/workout-days"] });

  const selectedDay = days?.find((d) => d.id === parseInt(selectedDayId));
  const presets = selectedDay ? presetExercises[selectedDay.name] ?? [] : [];

  const createSessionMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/sessions", data),
    onSuccess: async (res: any) => {
      const session = await res.json();
      setActiveSession(session);
      setStartTime(new Date());
      toast({ title: "Workout started!", description: "Track your sets below." });
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/sessions/${activeSession?.id}`, data),
    onSuccess: async () => {
      // Save all sets
      for (const s of sets) {
        if (s.completed || s.reps) {
          await apiRequest("POST", "/api/sets", {
            sessionId: activeSession!.id,
            exerciseName: s.exerciseName,
            muscleGroup: s.muscleGroup,
            rangeType: s.rangeType,
            setNumber: s.setNumber,
            reps: parseInt(s.reps) || null,
            weightKg: parseFloat(s.weightKg) || null,
            completed: s.completed,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({ title: "Workout complete! 💪", description: "Great work Sophia!" });
      // Reset
      setActiveSession(null);
      setSets([]);
      setSelectedDayId("");
      setDuration("");
      setNotes("");
      setStartTime(null);
    },
  });

  const loadPresets = () => {
    if (!presets.length) return;
    const targetSets = schedule === "A" ? 4 : 3;
    const newSets: SetEntry[] = presets.flatMap((ex) =>
      Array.from({ length: targetSets }, (_, i) => ({
        exerciseName: ex.name,
        muscleGroup: ex.muscle,
        rangeType: ex.rangeType,
        setNumber: i + 1,
        reps: "",
        weightKg: "",
        completed: false,
      }))
    );
    setSets(newSets);
  };

  const addCustomExercise = () => {
    if (!customExercise.name.trim()) return;
    const targetSets = schedule === "A" ? 4 : 3;
    const newSets: SetEntry[] = Array.from({ length: targetSets }, (_, i) => ({
      exerciseName: customExercise.name,
      muscleGroup: customExercise.muscle || "Other",
      rangeType: customExercise.rangeType,
      setNumber: i + 1,
      reps: "",
      weightKg: "",
      completed: false,
    }));
    setSets((prev) => [...prev, ...newSets]);
    setCustomExercise({ name: "", muscle: "", rangeType: "shortened" });
    setShowCustomForm(false);
  };

  const toggleSet = (index: number) => {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s))
    );
  };

  const updateSet = (index: number, field: "reps" | "weightKg", value: string) => {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const removeExercise = (name: string) => {
    setSets((prev) => prev.filter((s) => s.exerciseName !== name));
  };

  const startWorkout = () => {
    if (!selectedDayId) return;
    createSessionMutation.mutate({
      dayTypeId: parseInt(selectedDayId),
      date: new Date().toISOString().split("T")[0],
      schedule,
      completed: false,
    });
  };

  const finishWorkout = () => {
    const elapsed = startTime ? Math.round((Date.now() - startTime.getTime()) / 60000) : parseInt(duration) || null;
    completeSessionMutation.mutate({
      completed: true,
      durationMinutes: elapsed,
      notes,
      energyLevel: parseInt(energyLevel),
    });
  };

  // Group sets by exercise
  const groupedSets = sets.reduce((acc, set, idx) => {
    const key = set.exerciseName;
    if (!acc[key]) acc[key] = { sets: [], startIdx: idx, muscle: set.muscleGroup, rangeType: set.rangeType };
    acc[key].sets.push({ ...set, originalIdx: idx });
    return acc;
  }, {} as Record<string, { sets: (SetEntry & { originalIdx: number })[]; startIdx: number; muscle: string; rangeType: string }>);

  const repRange = schedule === "A" ? "4-8 reps · 2-4 min rest" : "8-15 reps · 90s rest";
  const completedSets = sets.filter((s) => s.completed).length;
  const totalSets = sets.length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Log Workout</h1>
        <p className="text-sm text-muted-foreground">Huberman Foundational Protocol · Sophia Mirza</p>
      </div>

      {!activeSession ? (
        /* Setup Phase */
        <Card data-testid="card-workout-setup">
          <CardHeader>
            <CardTitle className="text-base">Configure Today's Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Day Selection */}
            <div className="space-y-2">
              <Label htmlFor="select-day">Workout Day</Label>
              {daysLoading ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : (
                <Select value={selectedDayId} onValueChange={setSelectedDayId}>
                  <SelectTrigger id="select-day" data-testid="trigger-select-day">
                    <SelectValue placeholder="Select today's workout…" />
                  </SelectTrigger>
                  <SelectContent>
                    {days?.map((d) => {
                      const Icon = dayTypeIcons[d.dayType];
                      return (
                        <SelectItem key={d.id} value={String(d.id)} data-testid={`option-day-${d.id}`}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" />
                            {d.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              {selectedDay && (
                <p className="text-xs text-muted-foreground">{selectedDay.description}</p>
              )}
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <Label>Protocol Schedule</Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSchedule("A")}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                    schedule === "A" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                  data-testid="button-schedule-a"
                >
                  <div className="font-semibold">Schedule A</div>
                  <div className="text-xs opacity-70">4-8 reps · Heavy · 3-4 sets</div>
                  <div className="text-xs opacity-60">2-4 min rest</div>
                </button>
                <button
                  onClick={() => setSchedule("B")}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                    schedule === "B" ? "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400" : "border-border text-muted-foreground hover:border-amber-500/50"
                  }`}
                  data-testid="button-schedule-b"
                >
                  <div className="font-semibold">Schedule B</div>
                  <div className="text-xs opacity-70">8-15 reps · Moderate · 2-3 sets</div>
                  <div className="text-xs opacity-60">90 sec rest</div>
                </button>
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-2">
              <Label>Energy Level</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setEnergyLevel(String(n))}
                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                      energyLevel === String(n) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`button-energy-${n}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">1 = exhausted, 5 = full energy</p>
            </div>

            <Button
              onClick={startWorkout}
              disabled={!selectedDayId || createSessionMutation.isPending}
              className="w-full gap-2"
              data-testid="button-start-workout"
            >
              <Dumbbell className="w-4 h-4" />
              {createSessionMutation.isPending ? "Starting…" : "Start Workout"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Active Workout Phase */
        <div className="space-y-4">
          {/* Active Header */}
          <Card className="border-primary/30 bg-primary/5" data-testid="card-active-session">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary pulse-active" />
                    <span className="text-sm font-semibold text-primary">Active Workout</span>
                  </div>
                  <p className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {selectedDay?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{repRange} · Schedule {schedule}</p>
                </div>
                {totalSets > 0 && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                      {completedSets}/{totalSets}
                    </p>
                    <p className="text-xs text-muted-foreground">sets done</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Load Presets */}
          {presets.length > 0 && sets.length === 0 && (
            <Button variant="outline" className="w-full gap-2" onClick={loadPresets} data-testid="button-load-presets">
              <Dumbbell className="w-4 h-4" />
              Load Preset Exercises for {selectedDay?.name}
            </Button>
          )}

          {/* Weight guide banner */}
          {sets.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/8 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p>Tap the <strong>blue weight suggestion</strong> under each exercise name to see the recommended starting weight and a form tip for Sophia.</p>
            </div>
          )}

          {/* Exercise Sets */}
          {Object.entries(groupedSets).map(([exName, { sets: exSets, muscle, rangeType }]) => (
            <Card key={exName} data-testid={`card-exercise-${exName.replace(/\s/g, "-").toLowerCase()}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{exName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Badge variant="outline" className="text-xs px-1.5 py-0">{muscle}</Badge>
                      <Badge variant="outline" className={`text-xs px-1.5 py-0 ${rangeType === "shortened" ? "text-primary border-primary/30" : "text-amber-600 border-amber-500/30 dark:text-amber-400"}`}>
                        {rangeType === "shortened" ? "Shortened ↓" : "Lengthened ↑"}
                      </Badge>
                    </div>
                    <div className="mt-1.5">
                      <WeightGuideChip exerciseName={exName} schedule={schedule} />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeExercise(exName)}
                    data-testid={`button-remove-${exName.replace(/\s/g, "-").toLowerCase()}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {/* Column headers */}
                <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 px-1">
                  <span className="text-xs text-muted-foreground">Set</span>
                  <span className="text-xs text-muted-foreground">kg</span>
                  <span className="text-xs text-muted-foreground">Reps</span>
                  <span />
                </div>
                {exSets.map(({ originalIdx, setNumber, completed, reps, weightKg }) => (
                  <div
                    key={originalIdx}
                    className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center p-2 rounded-lg transition-colors ${
                      completed ? "bg-green-500/8 dark:bg-green-500/10" : "bg-muted/40"
                    }`}
                    data-testid={`set-row-${originalIdx}`}
                  >
                    <span className="text-xs text-muted-foreground font-mono text-center">{setNumber}</span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="kg"
                      value={weightKg}
                      onChange={(e) => updateSet(originalIdx, "weightKg", e.target.value)}
                      className="h-10 text-sm"
                      data-testid={`input-weight-${originalIdx}`}
                    />
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={schedule === "A" ? "4-8" : "8-15"}
                      value={reps}
                      onChange={(e) => updateSet(originalIdx, "reps", e.target.value)}
                      className="h-10 text-sm"
                      data-testid={`input-reps-${originalIdx}`}
                    />
                    <button
                      onClick={() => toggleSet(originalIdx)}
                      className="flex items-center justify-center w-10 h-10"
                      data-testid={`button-complete-set-${originalIdx}`}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 check-appear" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Add Custom Exercise */}
          <Card>
            <CardContent className="p-4">
              {!showCustomForm ? (
                <Button variant="outline" className="w-full gap-2" onClick={() => setShowCustomForm(true)} data-testid="button-show-custom-exercise">
                  <Plus className="w-4 h-4" />
                  Add Exercise
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Add Custom Exercise</p>
                  <Input
                    placeholder="Exercise name"
                    value={customExercise.name}
                    onChange={(e) => setCustomExercise((p) => ({ ...p, name: e.target.value }))}
                    data-testid="input-custom-exercise-name"
                  />
                  <Input
                    placeholder="Muscle group"
                    value={customExercise.muscle}
                    onChange={(e) => setCustomExercise((p) => ({ ...p, muscle: e.target.value }))}
                    data-testid="input-custom-muscle"
                  />
                  <Select value={customExercise.rangeType} onValueChange={(v: any) => setCustomExercise((p) => ({ ...p, rangeType: v }))}>
                    <SelectTrigger data-testid="select-range-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shortened">Shortened position</SelectItem>
                      <SelectItem value="lengthened">Lengthened position</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button onClick={addCustomExercise} size="sm" className="flex-1" data-testid="button-add-custom-exercise">Add</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowCustomForm(false)} data-testid="button-cancel-custom">Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Label htmlFor="notes">Session Notes</Label>
              <Textarea
                id="notes"
                placeholder="How did it feel? Any PRs? Form notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={2}
                data-testid="textarea-notes"
              />
            </CardContent>
          </Card>

          {/* Finish */}
          <Button
            onClick={finishWorkout}
            disabled={completeSessionMutation.isPending}
            className="w-full gap-2 glow-orange"
            size="lg"
            data-testid="button-finish-workout"
          >
            <CheckCircle2 className="w-5 h-5" />
            {completeSessionMutation.isPending ? "Saving…" : "Finish Workout"}
          </Button>
        </div>
      )}
    </div>
  );
}
