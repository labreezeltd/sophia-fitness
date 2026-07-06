import { Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { LayoutDashboard, PlusCircle, TrendingUp, BookOpen, Utensils, Sun, Moon, Command } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/log", icon: PlusCircle, label: "Log" },
  { href: "/progress", icon: TrendingUp, label: "Progress" },
  { href: "/nutrition", icon: Utensils, label: "Nutrition" },
  { href: "/protocol", icon: BookOpen, label: "Protocol" },
  { href: "/command", icon: Command, label: "Command" },
];

export function Sidebar() {
  const [location] = useHashLocation();
  const { theme, toggle } = useTheme();

  return (
    <>
      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col shrink-0" data-testid="sidebar">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <svg aria-label="Sophia Strength" viewBox="0 0 36 36" fill="none" className="w-9 h-9 shrink-0">
              <rect width="36" height="36" rx="10" fill="hsl(18 86% 52%)" />
              <path d="M9 18h4M23 18h4M13 13v10M23 13v10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="18" r="2.5" fill="white" />
            </svg>
            <div>
              <p className="font-semibold text-sm leading-tight" style={{ fontFamily: "var(--font-body)" }}>Sophia's</p>
              <p className="text-xs text-muted-foreground leading-tight">Strength Tracker</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1" data-testid="nav-menu">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "nav-active" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Protocol info */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-primary/8 border border-primary/20">
          <p className="text-xs font-semibold text-primary mb-1">Current Protocol</p>
          <p className="text-xs text-muted-foreground">Alternate Schedule A & B monthly</p>
          <div className="flex gap-1.5 mt-2">
            <span className="schedule-a text-xs px-2 py-0.5 rounded-full font-medium">A: 4-8 reps</span>
            <span className="schedule-b text-xs px-2 py-0.5 rounded-full font-medium">B: 8-15 reps</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Huberman Protocol</p>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggle} data-testid="button-theme-toggle" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {/* ─── Mobile top bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <svg aria-label="Sophia Strength" viewBox="0 0 36 36" fill="none" className="w-7 h-7 shrink-0">
            <rect width="36" height="36" rx="9" fill="hsl(18 86% 52%)" />
            <path d="M9 18h4M23 18h4M13 13v10M23 13v10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="18" cy="18" r="2.5" fill="white" />
          </svg>
          <span className="font-semibold text-sm">Sophia's Strength</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      {/* ─── Mobile bottom nav ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-card border-t border-border flex items-center safe-area-bottom" data-testid="mobile-nav">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
              data-testid={`mobile-nav-${label.toLowerCase()}`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                <Icon className="w-[18px] h-[18px] shrink-0" />
              </div>
              <span className={`text-[9px] font-medium leading-none tracking-tight ${isActive ? "text-primary" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
