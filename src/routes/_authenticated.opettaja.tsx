import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CornerBlobs } from "@/components/CornerBlobs";
import { StickyNote } from "@/components/StickyNote";
import { getCurrentRole } from "@/lib/auth-helpers";

export const Route = createFileRoute("/_authenticated/opettaja")({
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    getCurrentRole().then((r) => {
      setRole(r);
      if (r !== "teacher") navigate({ to: "/seikkailu", replace: true });
    });
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (role !== "teacher") {
    return <div className="flex min-h-screen items-center justify-center">Ladataan…</div>;
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <CornerBlobs />
      <header className="no-print relative z-10 flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl">Opettajan näkymä</h1>
        <Button variant="ghost" onClick={signOut} className="text-foreground hover:bg-white/10 rounded-full">Kirjaudu ulos</Button>
      </header>
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        <StickyNote seed="teacher-placeholder">
          <h2 className="text-2xl mb-3">Luokkani</h2>
          <p className="text-muted-foreground">Opettajan kojelauta rakennetaan myöhemmässä erässä.</p>
        </StickyNote>
      </main>
    </div>
  );
}