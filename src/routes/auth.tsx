import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CornerBlobs } from "@/components/CornerBlobs";
import { StickyNote } from "@/components/StickyNote";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    idle: s.idle === "1" ? "1" : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/seikkailu", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !displayName.trim()) {
      toast.error("Kirjoita nimesi — opettaja näkee sen luokkalistassa.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName.trim() },
          },
        });
        if (error) throw error;
        toast.success("Tunnus luotu. Tervetuloa!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/seikkailu", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tuntematon virhe";
      toast.error(
        msg.includes("Invalid login") ? "Väärä sähköposti tai salasana." :
        msg.includes("already registered") ? "Tällä sähköpostilla on jo tunnus." :
        msg
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center px-4 py-10">
      <CornerBlobs />
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Vahvuusseikkailu</h1>
          <p className="mt-2 opacity-90">Huomaa hyvä! — vahvuusportfolio lukiolaiselle</p>
        </div>

        {search.idle && (
          <StickyNote tone="yellow" seed="idle" className="text-sm">
            Istunto vanheni — kirjaudu sisään uudelleen.
          </StickyNote>
        )}

        <StickyNote seed="auth-card">
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-[color:var(--purple)] text-white" : "bg-muted text-ink"}`}
            >Kirjaudu sisään</button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "signup" ? "bg-[color:var(--purple)] text-white" : "bg-muted text-ink"}`}
            >Luo tunnus</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nimi (näkyy opettajalle)</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Etunimi Sukunimi" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">{mode === "signup" ? "Koulun sähköposti" : "Sähköposti"}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="etunimi.sukunimi@koulu.fi" autoComplete="email" />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">Käytä sähköpostia, johon pääset käsiksi — tarvitset sitä salasanan palauttamiseen.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Salasana</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-full bg-[color:var(--coral)] hover:bg-[color:var(--coral)]/90 text-white font-bold py-6 text-base">
              {busy ? "Hetki…" : mode === "signup" ? "Luo tunnus" : "Kirjaudu sisään"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Opettaja?{" "}
            <Link to="/auth/opettaja" className="font-semibold text-[color:var(--purple)] underline">
              Rekisteröidy opettajana
            </Link>
          </p>
        </StickyNote>
      </div>
    </div>
  );
}// trigger
