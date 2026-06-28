import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NavBar } from "@/components/NavBar";
import Home from "@/pages/Home";
import Discover from "@/pages/Discover";
import PartnerDetail from "@/pages/PartnerDetail";
import Join from "@/pages/Join";
import MemberCard from "@/pages/MemberCard";
import ForPartners from "@/pages/ForPartners";
import Console from "@/pages/Console";
import Growth from "@/pages/Growth";
import NotFound from "@/pages/not-found";

function AppLayout() {
  return (
    <Router hook={useHashLocation}>
      <div className="flex min-h-screen flex-col bg-background">
        <NavBar />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/discover" component={Discover} />
            <Route path="/partner/:id" component={PartnerDetail} />
            <Route path="/join" component={Join} />
            <Route path="/card" component={MemberCard} />
            <Route path="/partners" component={ForPartners} />
            <Route path="/console" component={Console} />
            <Route path="/growth" component={Growth} />
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
