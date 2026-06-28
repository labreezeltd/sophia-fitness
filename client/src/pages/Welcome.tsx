import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2, Check, AlertCircle } from "lucide-react";
import type { Member } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { setMemberId } from "@/lib/savora";

// Stripe redirects here after payment: /?session_id=...#/welcome
export default function Welcome() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<"working" | "error">("working");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) { setState("error"); return; }
    (async () => {
      try {
        const res = await apiRequest("POST", "/api/checkout/confirm", { sessionId });
        const member = (await res.json()) as Member;
        setMemberId(member.id);
        queryClient.invalidateQueries({ queryKey: ["/api/overview"] });
        queryClient.invalidateQueries({ queryKey: ["/api/members"] });
        // Clear the query string and head to the card.
        window.history.replaceState(null, "", window.location.pathname + "#/card");
        navigate("/card");
      } catch {
        setState("error");
      }
    })();
  }, [navigate]);

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
      {state === "working" ? (
        <div>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <h1 className="mt-4 text-2xl font-bold">Confirming your membership…</h1>
          <p className="mt-2 text-muted-foreground">One moment while we set up your card.</p>
          <Check className="sr-only" />
        </div>
      ) : (
        <div>
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">We couldn't confirm that</h1>
          <p className="mt-2 text-muted-foreground">
            If you completed payment, your membership is safe — try opening your card, or contact support.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/card" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Open my card</Link>
            <Link href="/join" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary">Back to join</Link>
          </div>
        </div>
      )}
    </div>
  );
}
