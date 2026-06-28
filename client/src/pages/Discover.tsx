import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin } from "lucide-react";
import type { Partner } from "@shared/schema";
import { PartnerCard } from "@/components/PartnerCard";
import { Footer } from "@/components/Footer";
import { CATEGORIES } from "@/lib/savora";
import { cn } from "@/lib/utils";

export default function Discover() {
  const { data: partners, isLoading } = useQuery<Partner[]>({ queryKey: ["/api/partners"] });
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");

  const cities = useMemo(() => {
    const set = new Set((partners ?? []).map((p) => p.city));
    return ["all", ...Array.from(set).sort()];
  }, [partners]);

  const filtered = useMemo(() => {
    return (partners ?? []).filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (city !== "all" && p.city !== city) return false;
      if (q.trim()) {
        const hay = `${p.name} ${p.cuisine} ${p.neighborhood} ${p.city} ${p.offerText}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [partners, category, city, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Discover</p>
      <h1 className="mt-1 text-4xl font-bold">Where will you save today?</h1>
      <p className="mt-2 text-muted-foreground">
        Members-only offers at every venue below. Show your card before the bill.
      </p>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search venues, cuisines, areas…"
            className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-3 text-sm outline-none ring-primary/40 focus:ring-2"
          />
        </div>
        <div className="relative sm:w-52">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full appearance-none rounded-xl border border-input bg-card py-3 pl-10 pr-8 text-sm outline-none ring-primary/40 focus:ring-2"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All cities" : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition",
              category === c.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary",
            )}
          >
            <span className="mr-1">{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="mt-6 text-sm text-muted-foreground">
        {isLoading ? "Loading venues…" : `${filtered.length} venue${filtered.length === 1 ? "" : "s"}`}
      </p>
      <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => <PartnerCard key={p.id} partner={p} />)}
      </div>
      {!isLoading && filtered.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No venues match that search yet. Try clearing a filter.
        </div>
      )}

      <Footer />
    </div>
  );
}
