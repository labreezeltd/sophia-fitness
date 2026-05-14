import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import LogWorkout from "@/pages/LogWorkout";
import Progress from "@/pages/Progress";
import Protocol from "@/pages/Protocol";
import Nutrition from "@/pages/Nutrition";
import NotFound from "@/pages/not-found";

function AppLayout() {
  return (
    <Router hook={useHashLocation}>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        {/* On mobile: push content below the top bar (56px) and above bottom nav (64px) */}
        <main className="flex-1 overflow-y-auto pt-14 pb-16 md:pt-0 md:pb-0">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/log" component={LogWorkout} />
            <Route path="/progress" component={Progress} />
            <Route path="/nutrition" component={Nutrition} />
            <Route path="/protocol" component={Protocol} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppLayout />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
