import { Link } from "wouter";
import { Star, MapPin } from "lucide-react";
import type { Partner } from "@shared/schema";

export function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <Link
      href={`/partner/${partner.id}`}
      className="lift group flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="relative grid h-32 place-items-center brand-gradient text-5xl">
        <span aria-hidden>{partner.emoji}</span>
        <span className="absolute right-3 top-3 rounded-full bg-[hsl(38_78%_52%)] px-2.5 py-1 text-xs font-bold text-[hsl(340_40%_14%)] shadow">
          {partner.discountPercent}% off
        </span>
        {partner.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            ★ Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight group-hover:text-primary">{partner.name}</h3>
          <span className="flex items-center gap-0.5 text-sm font-medium text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-[hsl(38_78%_52%)] text-[hsl(38_78%_52%)]" />
            {partner.rating}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {partner.cuisine} · {partner.priceRange}
        </p>
        <p className="line-clamp-2 text-sm text-muted-foreground">{partner.offerText}</p>
        <div className="mt-auto flex items-center gap-1 pt-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {partner.neighborhood}, {partner.city}
        </div>
      </div>
    </Link>
  );
}
