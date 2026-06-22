import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CornerBlobs } from "@/components/CornerBlobs";
import { StickyNote } from "@/components/StickyNote";

export const Route = createFileRoute("/_authenticated/seikkailu/$screen")({
  component: ScreenView,
});

function ScreenView() {
  const { screen } = Route.useParams();
  const navigate = useNavigate();
  const n = Math.max(1, Math.min(76, Number(screen) || 1));

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <CornerBlobs />
      <header className="no-print relative z-10 flex items-center justify-between px-6 py-4">
        <div className="text-sm opacity-90">Näyttö {n} / 76</div>
        <Button variant="ghost" onClick={signOut} className="text-foreground hover:bg-white/10 rounded-full">Kirjaudu ulos</Button>
      </header>
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        <StickyNote seed={`s${n}`}>
          <h1 className="text-3xl mb-3">Näyttö {n}</h1>
          <p className="text-muted-foreground">Tämä on paikanvaraaja. Vahvuusseikkailun näytöt rakennetaan seuraavissa erissä.</p>
        </StickyNote>
      </main>
      <nav className="no-print fixed bottom-0 inset-x-0 z-10 flex items-center justify-between px-6 py-4 bg-[color:var(--purple-dark)]/80 backdrop-blur">
        <Button
          variant="secondary"
          disabled={n <= 1}
          onClick={() => navigate({ to: "/seikkailu/$screen", params: { screen: String(n - 1) } })}
          className="rounded-full"
        >← Edellinen</Button>
        <span className="text-sm opacity-80">Tallennettu ✓</span>
        <Button
          disabled={n >= 76}
          onClick={() => navigate({ to: "/seikkailu/$screen", params: { screen: String(n + 1) } })}
          className="rounded-full bg-[color:var(--coral)] text-white"
        >Seuraava →</Button>
      </nav>
    </div>
  );
}