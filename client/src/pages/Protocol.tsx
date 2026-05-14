import { Dumbbell, Heart, Flame, Zap, Thermometer, Clock, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const protocol = [
  {
    day: "Sunday",
    abbr: "Sun",
    name: "Rest Day",
    type: "recovery",
    icon: Thermometer,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    duration: "No training",
    detail: "Full rest. Sleep, light walking, or gentle stretching only. Muscles grow during rest — this day is non-negotiable.",
    activities: ["Sleep 8-9 hours", "Light walk", "Gentle stretching or yoga", "Meal prep for the week"],
    tips: ["Rest days are where strength is actually built", "Prioritise 8-9 hours of sleep — Huberman calls sleep the 'bedrock of performance'", "Avoid intense activity — it delays recovery", "Use this day for meal prep"],
  },
  {
    day: "Monday",
    abbr: "Mon",
    name: "Legs Day",
    type: "strength",
    icon: Dumbbell,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    duration: "50-60 min",
    detail: "10 min warm-up + 50 min. Target Quadriceps, Hamstrings, and Calves. 2 exercises per muscle group.",
    exercises: [
      { muscle: "Hamstrings", ex1: "Leg Curl (shortened)", ex2: "Romanian Deadlift (lengthened)" },
      { muscle: "Quadriceps", ex1: "Leg Extension (shortened)", ex2: "Deep Squat / Hack Squat (lengthened)" },
      { muscle: "Calves", ex1: "Seated Calf Raise (shortened)", ex2: "Standing Calf Raise (lengthened)" },
      { muscle: "Tibialis", ex1: "Tibialis Raise × 3 sets 6-10 reps heavy", ex2: "" },
    ],
    tips: ["Huberman does NOT include barbell squats or deadlifts", "Tibialis raises help with knee health and posture", "Knees-over-toes principle applies here"],
  },
  {
    day: "Tuesday",
    abbr: "Tue",
    name: "Long Endurance",
    type: "endurance_long",
    icon: Heart,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    duration: "60-75 min",
    detail: "Zone 2 cardio — breathing faster than normal but still able to hold a conversation.",
    activities: ["Jogging", "Rowing", "Cycling", "Swimming", "Hiking"],
    tips: ["Emphasise nasal breathing when possible", "Add a weighted vest to increase difficulty", "Target 65-75 min for optimal Zone 2 adaptation", "Alternatively: 2-3 hour hike"],
  },
  {
    day: "Wednesday",
    abbr: "Wed",
    name: "Torso & Neck",
    type: "strength",
    icon: Dumbbell,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    duration: "50-60 min",
    detail: "Push-pull supersets for chest, back, and shoulders. Include neck strengthening.",
    exercises: [
      { muscle: "Chest", ex1: "Cable Chest Crossover (shortened)", ex2: "Incline Dumbbell Press (lengthened)" },
      { muscle: "Back", ex1: "Seated Cable Row (shortened)", ex2: "Pull-Up / Lat Pulldown (lengthened)" },
      { muscle: "Shoulders", ex1: "Lateral Raise (shortened)", ex2: "Overhead Press (lengthened)" },
      { muscle: "Neck", ex1: "Neck Lateral Raise", ex2: "Neck Head Raise" },
    ],
    tips: ["Superset push + pull exercises", "Neck training is often skipped — Huberman emphasises it", "Use lighter weights for neck work with high control"],
  },
  {
    day: "Thursday",
    abbr: "Thu",
    name: "HIIT Sprints",
    type: "hiit",
    icon: Flame,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    duration: "20-35 min",
    detail: "20-60 second all-out sprint + 10 seconds rest. Repeat 8-12 rounds at maximum effort.",
    activities: ["Assault bike", "Rowing machine", "Sprint intervals", "Sand sprints", "Ski erg"],
    tips: ["Only go all-out on movements you can perform with perfect form", "90-95% effort if unsure about form", "8 rounds minimum, 12 maximum", "This also indirectly trains your legs from Monday"],
  },
  {
    day: "Friday",
    abbr: "Fri",
    name: "Arms, Calves & Neck",
    type: "strength",
    icon: Dumbbell,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    duration: "40-50 min",
    detail: "Biceps, triceps, calves, and neck work. End the training week strong before the weekend rest.",
    exercises: [
      { muscle: "Biceps", ex1: "Preacher Curl (shortened)", ex2: "Incline Dumbbell Curl (lengthened)" },
      { muscle: "Triceps", ex1: "Tricep Kickback (shortened)", ex2: "Overhead Extension (lengthened)" },
      { muscle: "Calves", ex1: "Seated Calf Raise (shortened)", ex2: "Standing Calf Raise (lengthened)" },
      { muscle: "Bonus", ex1: "Chin-Ups", ex2: "Dips" },
    ],
    tips: ["Chin-ups also train your biceps and back indirectly", "Dips hit triceps and chest", "Finish with neck work for posture and strength"],
  },
  {
    day: "Saturday",
    abbr: "Sat",
    name: "Rest Day",
    type: "recovery",
    icon: Thermometer,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    duration: "No training",
    detail: "Full rest. Enjoy the weekend. Your body is rebuilding and getting stronger today.",
    activities: ["Sleep in", "Light walk or bike ride", "Social activities", "Meal prep for next week"],
    tips: ["Two rest days bookending the week gives full recovery", "Weekend rest makes Mon–Fri training sustainable long-term", "Huberman emphasises sleep as the #1 recovery tool — aim for 8-9 hrs", "Optional: gentle stretching or yoga"],
  },
];

const dayTypeColors: Record<string, string> = {
  strength: "bg-primary/10 text-primary border-primary/20",
  endurance_long: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  endurance_moderate: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  hiit: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  recovery: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
};

function DayCard({ day }: { day: typeof protocol[0] }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = day.icon;

  return (
    <Card className={`border ${day.borderColor} hover:shadow-md transition-all`} data-testid={`protocol-card-${day.abbr.toLowerCase()}`}>
      <button className="w-full text-left" onClick={() => setExpanded((e) => !e)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${day.bgColor} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${day.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">{day.day}</span>
                  <Badge variant="outline" className={`text-xs ${dayTypeColors[day.type]}`}>
                    {day.type === "strength" ? "Strength" : day.type === "endurance_long" ? "Zone 2" : day.type === "endurance_moderate" ? "Cardio" : day.type === "hiit" ? "HIIT" : "Recovery"}
                  </Badge>
                </div>
                <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>{day.name}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {day.duration}
              </div>
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
          <p className="text-sm text-muted-foreground pl-13 ml-13">{day.detail}</p>
        </CardHeader>
      </button>

      {expanded && (
        <CardContent className="pt-0 border-t border-border">
          <div className="pt-4 space-y-4">
            {/* Exercises table for strength days */}
            {"exercises" in day && day.exercises && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Exercise Selection</p>
                <div className="space-y-3">
                  {day.exercises.map((ex, i) => (
                    <div key={i} className="py-2 border-b border-border/50 last:border-0">
                      <span className="text-xs font-bold text-foreground block mb-1">{ex.muscle}</span>
                      <div className="space-y-0.5">
                        {ex.ex1 && <p className="text-xs text-muted-foreground"><span className="text-primary font-medium">↓ </span>{ex.ex1}</p>}
                        {ex.ex2 && <p className="text-xs text-muted-foreground"><span className="text-amber-500 font-medium">↑ </span>{ex.ex2}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities for cardio days */}
            {"activities" in day && day.activities && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Activity Options</p>
                <div className="flex flex-wrap gap-1.5">
                  {day.activities.map((a) => (
                    <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Huberman Tips</p>
              <ul className="space-y-1.5">
                {day.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-primary mt-0.5 shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function Protocol() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>The Protocol</h1>
        <p className="text-sm text-muted-foreground">Andrew Huberman's Foundational Fitness Protocol — adapted for Sophia</p>
      </div>

      {/* Periodization Card */}
      <Card className="mb-6 border-primary/30 bg-primary/3">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-primary" />
            </div>
            <p className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>Periodization — Alternate Monthly</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
              <div className="schedule-a inline-block text-xs px-2 py-0.5 rounded-full font-bold mb-2">Schedule A</div>
              <p className="text-sm font-semibold">Heavy & Low Rep</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 mt-1.5">
                <li>• 4-8 reps per set</li>
                <li>• 3-4 sets per exercise</li>
                <li>• 2-4 minutes rest</li>
                <li>• Heavier weight</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="schedule-b inline-block text-xs px-2 py-0.5 rounded-full font-bold mb-2">Schedule B</div>
              <p className="text-sm font-semibold">Moderate & High Rep</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 mt-1.5">
                <li>• 8-15 reps per set</li>
                <li>• 2-3 sets per exercise</li>
                <li>• ~90 seconds rest</li>
                <li>• Moderate weight</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Huberman alternates between these schedules monthly to optimise both strength and muscle hypertrophy.
            Keep workouts to <strong>50-60 min</strong> of hard work after warm-up (75 min max).
          </p>
        </CardContent>
      </Card>

      {/* Key Principle */}
      <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Core Exercise Principle</p>
          <p className="text-sm font-medium mb-1">2 exercises per muscle group, per session:</p>
          <p className="text-xs text-muted-foreground">
            <strong>Exercise 1:</strong> Muscle in a <em>shortened/contracted</em> position at end range (e.g. leg curl, preacher curl, cable crossover)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>Exercise 2:</strong> Muscle in a <em>lengthened</em> position at end range (e.g. Romanian deadlift, incline curl, incline press)
          </p>
        </CardContent>
      </Card>

      {/* Day-by-day protocol */}
      <div className="space-y-3">
        {protocol.map((day) => (
          <DayCard key={day.day} day={day} />
        ))}
      </div>

      {/* Footer note */}
      <Card className="mt-6 border-muted">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            Based on <strong>Andrew Huberman's Foundational Fitness Protocol</strong> from the Huberman Lab podcast.
            Sophia is 17 — prioritise form and gradual progressive overload over maximum weight.
            <br />Full protocol: <a href="https://www.hubermanlab.com/newsletter/foundational-fitness-protocol" target="_blank" rel="noopener" className="text-primary underline underline-offset-2">hubermanlab.com</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
