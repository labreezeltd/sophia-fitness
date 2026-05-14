import { useState } from "react";
import {
  Utensils, Sun, Moon, ChevronDown, ChevronUp, Zap, Leaf, Info,
  Droplets, Plus, Minus, Sparkles, Heart, ShieldCheck, Apple
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// ─── Data ───────────────────────────────────────────────────────────────────

const breakfasts = [
  {
    name: "Protein Overnight Oats",
    time: "5 min prep night before",
    calories: "~520 kcal",
    protein: "35g protein",
    tags: ["High Protein", "Slow Carbs", "Easy Prep"],
    ingredients: ["80g rolled oats", "250ml milk (or oat milk)", "1 scoop whey protein", "1 tbsp chia seeds", "1 tbsp almond butter", "Handful of blueberries", "Drizzle of honey"],
    method: "Mix oats, milk, protein powder, and chia seeds in a jar. Refrigerate overnight. Top with almond butter and blueberries in the morning.",
    hubermanNote: "Slow-release carbs + protein keep cortisol stable and sustain energy for morning training.",
    skinNote: "Blueberries are packed with antioxidants that protect skin from oxidative stress and support collagen production.",
    emoji: "🫙",
  },
  {
    name: "Scrambled Eggs & Avocado Toast",
    time: "10 min",
    calories: "~480 kcal",
    protein: "28g protein",
    tags: ["High Protein", "Healthy Fats", "Classic"],
    ingredients: ["3 eggs", "2 slices wholegrain bread", "½ avocado", "Handful of spinach", "Cherry tomatoes", "Salt, pepper, chilli flakes", "Olive oil"],
    method: "Scramble eggs in olive oil over low heat. Mash avocado on toasted bread, layer spinach and tomatoes, top with eggs.",
    hubermanNote: "Eggs provide choline and complete amino acids. Avocado adds healthy fats that support hormone production.",
    skinNote: "Avocado is rich in vitamin E and healthy fats — essential for keeping skin hydrated and supple from the inside.",
    emoji: "🥑",
  },
  {
    name: "Greek Yogurt Power Bowl",
    time: "5 min",
    calories: "~420 kcal",
    protein: "30g protein",
    tags: ["High Protein", "Gut Health", "No Cook"],
    ingredients: ["200g full-fat Greek yogurt", "2 tbsp granola", "1 tbsp honey", "Mixed berries", "1 tbsp flaxseeds", "Handful of walnuts"],
    method: "Layer Greek yogurt in a bowl, top with granola, berries, walnuts, flaxseeds, and a drizzle of honey.",
    hubermanNote: "Greek yogurt contains casein protein for sustained muscle support. Berries are high in antioxidants that reduce exercise-induced inflammation.",
    skinNote: "Probiotics in Greek yogurt support gut health, which directly impacts skin clarity and reduces hormonal breakouts.",
    emoji: "🫐",
  },
  {
    name: "Banana Protein Smoothie",
    time: "5 min",
    calories: "~510 kcal",
    protein: "32g protein",
    tags: ["Quick", "Pre-Workout", "Easy"],
    ingredients: ["1 frozen banana", "1 scoop vanilla whey protein", "250ml milk", "1 tbsp peanut butter", "1 tsp cocoa powder", "Handful of spinach (you won't taste it)", "Ice"],
    method: "Blend everything until smooth. Drink immediately or take in a bottle to school.",
    hubermanNote: "Bananas provide fast carbs for pre-workout fuel. Whey protein rapidly elevates amino acids for muscle priming.",
    skinNote: "Spinach provides iron and vitamin C — iron prevents dull skin and dark circles; vitamin C helps produce collagen.",
    emoji: "🍌",
  },
  {
    name: "Breakfast Wrap",
    time: "10 min",
    calories: "~490 kcal",
    protein: "33g protein",
    tags: ["High Protein", "Portable", "Batch Prep"],
    ingredients: ["3 eggs (scrambled)", "1 wholegrain tortilla", "30g cheddar cheese", "Handful of spinach", "2 tbsp salsa", "½ tsp cumin"],
    method: "Scramble eggs with cumin and cheese. Layer spinach, eggs, salsa onto tortilla and wrap tightly. Can be made in batches and frozen.",
    hubermanNote: "Perfect portable option. Eggs + cheese provide complete protein. Can be made ahead and reheated in 90 seconds.",
    skinNote: "Eggs contain biotin (vitamin B7), which is essential for healthy hair, skin, and nail growth — especially important during teen years.",
    emoji: "🌯",
  },
];

const lunches = [
  {
    name: "Chicken & Quinoa Bowl",
    time: "20 min (or use leftover chicken)",
    calories: "~520 kcal",
    protein: "42g protein",
    tags: ["High Protein", "Meal Prep", "Complete Amino Acids"],
    ingredients: ["150g grilled chicken breast", "80g quinoa (dry weight)", "½ cucumber diced", "Cherry tomatoes", "Baby spinach", "Lemon juice + olive oil dressing", "Feta crumbles"],
    method: "Cook quinoa, grill or reheat chicken, assemble bowl with vegetables, drizzle with lemon-olive oil dressing, top with feta.",
    hubermanNote: "Quinoa is one of the few plants with a complete amino acid profile — great for muscle repair mid-day.",
    skinNote: "The olive oil + lemon combination delivers vitamin E and C together — a powerful duo for brightening and protecting skin.",
    emoji: "🍲",
  },
  {
    name: "Tuna & Hummus Bento Box",
    time: "5 min",
    calories: "~430 kcal",
    protein: "38g protein",
    tags: ["Quick", "School-Friendly", "No Cook"],
    ingredients: ["1 can tuna in olive oil", "3 tbsp hummus", "Wholegrain crackers", "Baby carrots", "Celery sticks", "Cherry tomatoes", "1 apple"],
    method: "Drain tuna, assemble in a lunchbox with crackers, hummus, vegetables, and fruit. No cooking required.",
    hubermanNote: "Tuna is one of the highest protein-per-calorie foods. Hummus adds fibre and healthy fats for sustained energy through school.",
    skinNote: "Carrots are rich in beta-carotene, which converts to vitamin A — the skin vitamin that regulates cell turnover and prevents blocked pores.",
    emoji: "🐟",
  },
  {
    name: "Turkey & Avocado Wrap",
    time: "8 min",
    calories: "~470 kcal",
    protein: "35g protein",
    tags: ["High Protein", "Portable", "School-Friendly"],
    ingredients: ["120g turkey breast slices", "1 wholegrain tortilla", "½ avocado sliced", "Lettuce", "Tomato slices", "Mustard or light mayo", "Cucumber"],
    method: "Layer turkey, avocado, vegetables on tortilla, add condiment, roll tightly and wrap in foil.",
    hubermanNote: "Turkey is rich in tryptophan, which supports serotonin and focus in the afternoon. Avocado fats sustain energy without a crash.",
    skinNote: "Turkey contains zinc, which helps regulate oil production and supports wound healing — great for acne-prone teenage skin.",
    emoji: "🥙",
  },
  {
    name: "Salmon & Brown Rice Bowl",
    time: "15 min",
    calories: "~550 kcal",
    protein: "40g protein",
    tags: ["Omega-3", "Recovery", "Anti-Inflammatory"],
    ingredients: ["150g salmon fillet", "80g brown rice (dry)", "Edamame", "Cucumber", "Avocado", "Soy sauce + sesame oil dressing", "Sesame seeds"],
    method: "Cook rice, pan-fry or bake salmon, assemble bowl with vegetables and dressing.",
    hubermanNote: "Salmon is the gold standard for omega-3 fatty acids — critical for reducing inflammation post-workout and supporting brain health.",
    skinNote: "Omega-3s in salmon are the most evidence-backed nutrient for skin — they reduce redness, strengthen the skin barrier, and keep pores clear.",
    emoji: "🍱",
  },
  {
    name: "Chicken Pita & Greek Salad",
    time: "10 min",
    calories: "~460 kcal",
    protein: "36g protein",
    tags: ["Mediterranean", "Easy", "School-Friendly"],
    ingredients: ["120g grilled chicken strips", "1 wholemeal pitta", "Greek salad (cucumber, olives, tomato, red onion, feta)", "Tzatziki or hummus", "Olive oil + lemon"],
    method: "Stuff pita with chicken and salad, serve with tzatziki. Pack separately to keep bread from getting soggy.",
    hubermanNote: "Mediterranean-style eating aligns with Huberman's whole-food, minimally processed diet guidelines.",
    skinNote: "Olive oil is one of the best dietary sources of squalene, which mimics the skin's natural sebum and keeps it soft and moisturised.",
    emoji: "🫓",
  },
];

const dinners = [
  {
    name: "Baked Salmon with Sweet Potato & Broccoli",
    time: "30 min",
    calories: "~560 kcal",
    protein: "42g protein",
    tags: ["Omega-3", "Recovery", "Huberman-Approved"],
    ingredients: ["180g salmon fillet", "1 medium sweet potato", "200g broccoli florets", "Olive oil", "Garlic, lemon, dill", "Salt & pepper"],
    method: "Roast sweet potato at 200°C for 20 min. Steam broccoli. Bake salmon with garlic, lemon, and dill for 15 min. Serve together.",
    hubermanNote: "Huberman's own routine often ends with starchy carbs at dinner (sweet potato) which raise serotonin and tryptophan, improving sleep quality.",
    skinNote: "Broccoli is a top source of sulforaphane — a compound shown to protect skin from UV damage and reduce redness.",
    emoji: "🐟",
  },
  {
    name: "Chicken Stir-Fry with Rice",
    time: "25 min",
    calories: "~520 kcal",
    protein: "44g protein",
    tags: ["High Protein", "Starchy Carbs", "Easy"],
    ingredients: ["150g chicken breast strips", "80g jasmine rice", "Broccoli, bell pepper, snap peas, carrot", "Soy sauce, sesame oil, ginger, garlic", "Spring onions", "Sesame seeds"],
    method: "Cook rice. Stir-fry chicken in sesame oil, add vegetables and sauce, toss together. Serve over rice, garnish with spring onions.",
    hubermanNote: "Rice at dinner replenishes glycogen stores from today's workout and supports recovery overnight.",
    skinNote: "Colourful bell peppers contain more vitamin C than oranges — vitamin C is essential for collagen synthesis that keeps skin firm.",
    emoji: "🥢",
  },
  {
    name: "Turkey Meatballs & Pasta",
    time: "30 min",
    calories: "~600 kcal",
    protein: "46g protein",
    tags: ["Starchy Carbs", "High Protein", "Family Meal"],
    ingredients: ["200g minced turkey", "80g wholegrain pasta", "1 egg", "Breadcrumbs", "Garlic, Italian herbs", "Tomato passata", "Parmesan to serve"],
    method: "Mix turkey with egg, breadcrumbs, and herbs, roll into balls, bake at 190°C for 20 min. Cook pasta, heat passata, combine.",
    hubermanNote: "Pasta is one of Huberman's own go-to dinner carbs. Lean turkey keeps protein high without heavy meat that disrupts sleep.",
    skinNote: "Tomatoes are rich in lycopene — a powerful antioxidant that protects skin from sun damage and improves skin texture over time.",
    emoji: "🍝",
  },
  {
    name: "Beef & Vegetable Stew",
    time: "40 min",
    calories: "~580 kcal",
    protein: "45g protein",
    tags: ["Iron-Rich", "Recovery", "Batch Cook"],
    ingredients: ["180g lean beef chunks", "2 medium potatoes", "Carrots, celery, onion", "Beef stock", "Tomato puree", "Rosemary, thyme", "Wholegrain bread to serve"],
    method: "Brown beef, add vegetables and stock, simmer 30 min. Serve with bread. Make a double batch for next day's lunch.",
    hubermanNote: "Red meat provides iron and zinc — essential for teenage girls doing resistance training. Keep portions moderate at dinner for sleep quality.",
    skinNote: "Iron from beef helps carry oxygen to skin cells — iron deficiency is one of the most common causes of dull, pale skin in teenage girls.",
    emoji: "🥩",
  },
  {
    name: "Lemon Herb Chicken & Roasted Veg",
    time: "35 min",
    calories: "~490 kcal",
    protein: "43g protein",
    tags: ["Clean Eating", "High Protein", "Whole Food"],
    ingredients: ["180g chicken breast", "Courgette, cherry tomatoes, red onion, pepper", "Olive oil", "Lemon zest & juice", "Garlic, rosemary, thyme", "80g couscous or quinoa"],
    method: "Marinate chicken in lemon, olive oil, and herbs. Roast chicken and vegetables at 200°C for 25-30 min. Serve over couscous.",
    hubermanNote: "Lean chicken + colourful vegetables hits Huberman's guideline of 75-80% minimally processed whole foods.",
    skinNote: "Lemon zest contains limonene and vitamin C — both support collagen production and help fade post-workout skin redness.",
    emoji: "🍋",
  },
];

const snacks = [
  { name: "Greek yogurt + honey", protein: "15g", emoji: "🫙" },
  { name: "Hard-boiled eggs × 2", protein: "12g", emoji: "🥚" },
  { name: "Apple + almond butter", protein: "5g", emoji: "🍎" },
  { name: "Handful of mixed nuts", protein: "6g", emoji: "🥜" },
  { name: "Protein shake", protein: "25g", emoji: "🥛" },
  { name: "Cottage cheese + fruit", protein: "14g", emoji: "🫐" },
  { name: "Rice cake + tuna", protein: "18g", emoji: "🐟" },
  { name: "Edamame", protein: "11g", emoji: "🟢" },
];

const hubermanRules = [
  { icon: "☀️", title: "Delay caffeine 90 min", body: "Don't have coffee the moment you wake up. Wait 90 minutes to let your natural cortisol peak first — this prevents the mid-morning crash." },
  { icon: "🥩", title: "Protein at every meal", body: "Aim for 1.6–2g protein per kg of bodyweight. At ~55-60kg that's around 90-120g/day across all meals." },
  { icon: "🌙", title: "Starchy carbs at dinner", body: "Huberman eats most of his carbs at dinner — pasta, rice, sweet potato. These raise serotonin and tryptophan, improving sleep quality." },
  { icon: "⏰", title: "Stop eating 2 hrs before bed", body: "Eating right before sleep disrupts sleep architecture. Finish your last meal at least 2 hours before bedtime." },
  { icon: "🥦", title: "75-80% whole foods", body: "Most of your diet should be minimally processed. Meat, fish, eggs, vegetables, fruit, whole grains. Limit ultra-processed foods." },
  { icon: "💧", title: "Hydrate early", body: "Drink 500ml of water soon after waking. Exercise increases fluid needs. Aim for 2-2.5L/day on training days." },
];

const skinTips = [
  {
    icon: "💧",
    title: "Hydration = glowing skin",
    body: "Skin is the last organ to receive water from the body. If you're even mildly dehydrated, skin looks dull, feels tight, and fine lines become more visible. 2–2.5L daily is non-negotiable.",
    color: "text-blue-500",
    bg: "bg-blue-500/8 border-blue-500/20",
  },
  {
    icon: "🐟",
    title: "Omega-3s are your skin's best friend",
    body: "Salmon, sardines, walnuts, and chia seeds contain omega-3 fatty acids that reduce skin inflammation, keep pores clear, and maintain the skin's moisture barrier. Aim for fatty fish 2–3× per week.",
    color: "text-amber-500",
    bg: "bg-amber-500/8 border-amber-500/20",
  },
  {
    icon: "🥕",
    title: "Eat the rainbow for a natural glow",
    body: "Beta-carotene (orange/red veg) converts to vitamin A — it regulates skin cell turnover and prevents blocked pores. Lycopene (tomatoes) protects against UV damage. Lutein (leafy greens) improves skin elasticity.",
    color: "text-orange-500",
    bg: "bg-orange-500/8 border-orange-500/20",
  },
  {
    icon: "🩷",
    title: "Collagen: eat the building blocks",
    body: "Your body makes collagen from vitamin C + protein. Eat vitamin C foods (peppers, citrus, strawberries) with protein sources at every meal. Collagen keeps skin firm and reduces the appearance of pores.",
    color: "text-pink-500",
    bg: "bg-pink-500/8 border-pink-500/20",
  },
  {
    icon: "⚡",
    title: "Sugar is the enemy of clear skin",
    body: "High-sugar foods spike insulin, which triggers androgen hormones and increases sebum production — the main driver of teen acne. Swap fizzy drinks and sweets for whole fruit and water. Your skin will thank you in 2 weeks.",
    color: "text-red-500",
    bg: "bg-red-500/8 border-red-500/20",
  },
  {
    icon: "🧘",
    title: "Stress → cortisol → breakouts",
    body: "Chronic stress raises cortisol which directly increases oil production and skin inflammation. Exercise actually helps here — Sophia's strength training lowers cortisol and improves skin tone over time.",
    color: "text-violet-500",
    bg: "bg-violet-500/8 border-violet-500/20",
  },
  {
    icon: "😴",
    title: "Beauty sleep is real",
    body: "Skin repairs itself almost entirely during deep sleep. Huberman's sleep protocols — dark room, cool temperature, consistent bedtime — double up as skin recovery protocols. Aim for 8–9 hours at age 17.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/8 border-indigo-500/20",
  },
  {
    icon: "🦴",
    title: "Zinc & iron for teenage skin",
    body: "Teenage girls are commonly deficient in zinc (which regulates oil) and iron (which carries oxygen to skin). Red meat, seeds, legumes, and eggs cover both. Deficiency shows up as dull skin, slow healing, and hair thinning.",
    color: "text-green-600",
    bg: "bg-green-500/8 border-green-500/20",
  },
];

const balancedDietPillars = [
  {
    title: "Protein",
    range: "90–120g/day",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: "💪",
    purpose: "Muscle repair, enzymes, hormones, healthy hair & nails",
    sources: "Chicken, fish, eggs, Greek yogurt, legumes, whey protein",
  },
  {
    title: "Complex Carbs",
    range: "200–280g/day",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    icon: "⚡",
    purpose: "Brain fuel, workout energy, sleep quality",
    sources: "Oats, brown rice, sweet potato, wholegrain pasta, quinoa",
  },
  {
    title: "Healthy Fats",
    range: "60–80g/day",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    icon: "🥑",
    purpose: "Hormone production, brain health, skin glow, vitamin absorption",
    sources: "Salmon, avocado, olive oil, nuts, seeds, eggs",
  },
  {
    title: "Fibre",
    range: "25–30g/day",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    icon: "🥦",
    purpose: "Gut health, blood sugar control, skin clarity",
    sources: "Vegetables, fruit, legumes, oats, wholegrain bread",
  },
  {
    title: "Micronutrients",
    range: "Every meal",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
    icon: "🌈",
    purpose: "Iron, zinc, calcium, B vitamins, vitamin D — essential for teenage development",
    sources: "Colourful veg, dairy, red meat 2×/week, sunlight for vitamin D",
  },
];

// ─── Components ─────────────────────────────────────────────────────────────

type MealItem = typeof breakfasts[0];

function MealCard({ meal }: { meal: MealItem }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`meal-card-${meal.name.replace(/\s/g, "-").toLowerCase()}`}>
      <button className="w-full text-left" onClick={() => setOpen((o) => !o)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0 mt-0.5">{meal.emoji}</span>
              <div>
                <p className="font-semibold text-sm leading-tight">{meal.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{meal.time}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant="outline" className="text-xs bg-primary/8 text-primary border-primary/20 px-2 py-0">{meal.protein}</Badge>
                  <Badge variant="outline" className="text-xs px-2 py-0">{meal.calories}</Badge>
                  {meal.tags.slice(0, 1).map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs px-2 py-0">{t}</Badge>
                  ))}
                </div>
              </div>
            </div>
            {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
          </div>
        </CardContent>
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {/* Ingredients */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Ingredients</p>
            <ul className="space-y-0.5">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary shrink-0 mt-0.5">·</span>{ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Method */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">How to Make</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{meal.method}</p>
          </div>

          {/* Huberman note */}
          <div className="flex gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-primary/80 leading-relaxed">{meal.hubermanNote}</p>
          </div>

          {/* Skin note */}
          <div className="flex gap-2 p-2.5 rounded-lg bg-pink-500/5 border border-pink-500/15">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
            <p className="text-xs text-pink-600 dark:text-pink-400 leading-relaxed">{meal.skinNote}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Water Tracker ────────────────────────────────────────────────────────────

const WATER_GOAL = 8; // glasses (250ml each = 2L)

function WaterTracker() {
  const [glasses, setGlasses] = useState(0);
  const pct = Math.min(100, Math.round((glasses / WATER_GOAL) * 100));
  const mlDrank = glasses * 250;

  return (
    <Card className="mb-5 overflow-hidden" data-testid="card-water-tracker">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <p className="text-sm font-semibold">Daily Water Tracker</p>
          </div>
          <p className="text-xs text-muted-foreground">Goal: 2L / 8 glasses</p>
        </div>

        {/* Glasses grid */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from({ length: WATER_GOAL }).map((_, i) => (
            <button
              key={i}
              onClick={() => setGlasses(i < glasses ? i : i + 1)}
              className={`w-10 h-12 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                i < glasses
                  ? "border-blue-500 bg-blue-500/15 text-blue-500"
                  : "border-border text-muted-foreground/40 hover:border-blue-400 hover:text-blue-400"
              }`}
              data-testid={`button-glass-${i}`}
              aria-label={`Glass ${i + 1}`}
            >
              <Droplets className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-medium">250ml</span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2.5 mb-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {mlDrank}ml drank · {(2000 - mlDrank > 0 ? 2000 - mlDrank : 0)}ml to go
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGlasses((g) => Math.max(0, g - 1))}
              data-testid="button-water-minus"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-sm font-bold text-blue-500 w-4 text-center">{glasses}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGlasses((g) => Math.min(WATER_GOAL, g + 1))}
              data-testid="button-water-plus"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {glasses >= WATER_GOAL && (
          <div className="mt-2 text-center text-xs font-semibold text-blue-500">
            🎉 Goal reached! Amazing hydration Sophia!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Nutrition() {
  const [activeSection, setActiveSection] = useState<"meals" | "balance" | "skin">("meals");

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Nutrition</h1>
        <p className="text-sm text-muted-foreground">Fuelling Sophia's training, vitality & glowing skin</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
        {[
          { key: "meals", icon: Utensils, label: "Meals" },
          { key: "balance", icon: Apple, label: "Balanced Diet" },
          { key: "skin", icon: Sparkles, label: "Skin & Vitality" },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              activeSection === key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
            data-testid={`button-section-${key}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── MEALS ── */}
      {activeSection === "meals" && (
        <>
          {/* Daily targets banner */}
          <Card className="mb-5 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Daily Targets for Sophia (age 17, ~55-60kg)</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "Protein", value: "90-120g", color: "text-primary" },
                  { label: "Calories", value: "2,000-2,400", color: "text-amber-500" },
                  { label: "Water", value: "2-2.5L", color: "text-blue-500" },
                  { label: "Meals", value: "3 + snacks", color: "text-green-500" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-2 rounded-lg bg-background/60">
                    <p className={`text-base font-bold ${color}`} style={{ fontFamily: "var(--font-display)" }}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Water Tracker */}
          <WaterTracker />

          {/* Meal tabs */}
          <Tabs defaultValue="breakfast" className="mb-5">
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="breakfast" className="gap-1.5 text-xs sm:text-sm">
                <Sun className="w-3.5 h-3.5" />Breakfast
              </TabsTrigger>
              <TabsTrigger value="lunch" className="gap-1.5 text-xs sm:text-sm">
                <Utensils className="w-3.5 h-3.5" />Lunch
              </TabsTrigger>
              <TabsTrigger value="dinner" className="gap-1.5 text-xs sm:text-sm">
                <Moon className="w-3.5 h-3.5" />Dinner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breakfast" className="space-y-3 mt-0">
              <p className="text-xs text-muted-foreground mb-1">Tap any meal for ingredients, method & a skin tip ✨</p>
              {breakfasts.map((m) => <MealCard key={m.name} meal={m} />)}
            </TabsContent>

            <TabsContent value="lunch" className="space-y-3 mt-0">
              <p className="text-xs text-muted-foreground mb-1">School-friendly, packable, high protein — tap for skin tips ✨</p>
              {lunches.map((m) => <MealCard key={m.name} meal={m} />)}
            </TabsContent>

            <TabsContent value="dinner" className="space-y-3 mt-0">
              <p className="text-xs text-muted-foreground mb-1">Starchy carbs at dinner improve sleep — tap for skin tips ✨</p>
              {dinners.map((m) => <MealCard key={m.name} meal={m} />)}
            </TabsContent>
          </Tabs>

          {/* Snacks */}
          <Card className="mb-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />Snacks & Between Meals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {snacks.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                    <span className="text-lg shrink-0">{s.emoji}</span>
                    <div>
                      <p className="text-xs font-medium leading-tight">{s.name}</p>
                      <p className="text-xs text-primary font-semibold">{s.protein}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Huberman Rules */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-500" />Huberman Nutrition Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {hubermanRules.map((r) => (
                <div key={r.title} className="flex gap-3 p-3 rounded-xl bg-muted/40">
                  <span className="text-xl shrink-0">{r.icon}</span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.body}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* ── BALANCED DIET ── */}
      {activeSection === "balance" && (
        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/3">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">Why balanced nutrition matters at 17</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sophia is still growing — bones, muscles, hormones, and brain are all developing rapidly. A balanced diet doesn't just fuel workouts; it determines energy levels, mood, skin health, hormonal balance, and long-term athletic performance. Each macronutrient has a specific role below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {balancedDietPillars.map((pillar) => (
            <Card key={pillar.title}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${pillar.bg} flex items-center justify-center shrink-0 text-xl`}>
                    {pillar.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-bold">{pillar.title}</p>
                      <Badge variant="outline" className={`text-xs px-2 py-0 ${pillar.color} border-current/20`}>
                        {pillar.range}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5 leading-relaxed">{pillar.purpose}</p>
                    <div className="flex items-start gap-1.5">
                      <span className="text-xs text-primary shrink-0 mt-0.5">→</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{pillar.sources}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-muted/40">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-2">The 80/20 rule — no guilt</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    Huberman recommends that 75-80% of your diet comes from whole, minimally processed foods. The remaining 20% is flexible. A balanced diet is sustainable — rigid diets cause stress which actually worsens hormones and skin.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Sophia's mantra:</strong> Fill 80% of her plate with real food, enjoy the rest without guilt, stay consistent over weeks — not perfect over days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── SKIN & VITALITY ── */}
      {activeSection === "skin" && (
        <div className="space-y-4">
          <Card className="border-pink-500/20 bg-pink-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">Skin is your largest organ — feed it well</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Everything Sophia eats and does directly shows up on her skin within days. The connection between diet, sleep, stress, and skin is well-documented. Here's exactly what to eat — and avoid — for clear, glowing skin as a teen athlete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {skinTips.map((tip) => (
            <div key={tip.title} className={`flex gap-3 p-4 rounded-xl border ${tip.bg}`}>
              <span className="text-2xl shrink-0">{tip.icon}</span>
              <div>
                <p className={`text-sm font-bold mb-1 ${tip.color}`}>{tip.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.body}</p>
              </div>
            </div>
          ))}

          {/* Top skin foods */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Apple className="w-4 h-4 text-pink-500" />Top 10 Skin Foods for Sophia
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { food: "Salmon", benefit: "Omega-3 · moisture barrier", emoji: "🐟" },
                  { food: "Avocado", benefit: "Vit E · hydration", emoji: "🥑" },
                  { food: "Blueberries", benefit: "Antioxidants · collagen", emoji: "🫐" },
                  { food: "Sweet potato", benefit: "Beta-carotene · glow", emoji: "🍠" },
                  { food: "Walnuts", benefit: "Omega-3 & 6 · barrier", emoji: "🥜" },
                  { food: "Spinach", benefit: "Iron · brightness", emoji: "🥬" },
                  { food: "Eggs", benefit: "Biotin · hair & nails", emoji: "🥚" },
                  { food: "Tomatoes", benefit: "Lycopene · UV protect", emoji: "🍅" },
                  { food: "Greek yogurt", benefit: "Probiotics · clear skin", emoji: "🫙" },
                  { food: "Bell peppers", benefit: "Vit C · collagen", emoji: "🫑" },
                ].map((item) => (
                  <div key={item.food} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                    <span className="text-lg shrink-0">{item.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold leading-tight">{item.food}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{item.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skin routine */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />Daily Vitality Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2.5">
              {[
                { time: "Morning", habit: "500ml water immediately on waking. SPF 30+ before going outside — UV is the #1 cause of premature ageing.", emoji: "🌅" },
                { time: "Pre-workout", habit: "Eat a light carb snack 30-60 min before training. Exercising on empty causes cortisol spikes that worsen skin.", emoji: "💪" },
                { time: "Post-workout", habit: "Shower within 30 min to remove sweat (which can clog pores). Eat protein + carbs within 1 hour to kickstart recovery.", emoji: "🚿" },
                { time: "Evening", habit: "Double cleanse if you wear SPF. Apply a simple moisturiser. Sleep 8-9 hours — growth hormone peaks during deep sleep and repairs skin.", emoji: "🌙" },
                { time: "Always", habit: "Never sleep with makeup on. Change pillowcase 2× per week. Don't touch your face during the day. Stay hydrated — every single day.", emoji: "✨" },
              ].map((item) => (
                <div key={item.time} className="flex gap-3 p-3 rounded-xl bg-background/60">
                  <span className="text-xl shrink-0">{item.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-primary mb-0.5">{item.time}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.habit}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
