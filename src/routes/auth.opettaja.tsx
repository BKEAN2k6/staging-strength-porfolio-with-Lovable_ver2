import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CornerBlobs } from "@/components/CornerBlobs";
import { StickyNote } from "@/components/StickyNote";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/opettaja")({
  component: TeacherAuthPage,
});

function TeacherAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: displayName || email.split("@")[0] } },
        });
        if (error) throw error;
        // Sign-in (in case email confirm is off)
        await supabase.auth.signInWithPassword({ email, password });
        const { data, error: rpcErr } = await supabase.rpc("claim_teacher_role" as never, { p_code: teacherCode } as never);
        if (rpcErr) throw rpcErr;
        if (data !== true) {
          toast.error("Opettajan koodi oli virheellinen.");
          return;
        }
        toast.success("Opettajatunnus luotu.");
        navigate({ to: "/opettaja", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/opettaja", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tuntematon virhe");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center px-4 py-10">
      <CornerBlobs />
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Opettajille</h1>
          <p className="mt-2 opacity-90">Hallinnoi luokkiasi ja seuraa edistymistä.</p>
        </div>
        <StickyNote seed="teacher-card">
          <div className="flex gap-2 mb-5">
            <button type="button" onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "signup" ? "bg-[color:var(--purple)] text-white" : "bg-muted text-ink"}`}>
              Rekisteröidy
            </button>
            <button type="button" onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-[color:var(--purple)] text-white" : "bg-muted text-ink"}`}>
              Kirjaudu sisään
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nimi</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Sähköposti</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Salasana</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="code">Opettajan koodi</Label>
                <Input id="code" required value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} placeholder="Saat koodin koulultasi" />
              </div>
            )}
            <Button type="submit" disabled={busy} className="w-full rounded-full bg-[color:var(--coral)] hover:bg-[color:var(--coral)]/90 text-white font-bold py-6 text-base">
              {busy ? "Hetki…" : mode === "signup" ? "Rekisteröidy opettajana" : "Kirjaudu sisään"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Oletko oppilas?{" "}
            <Link to="/auth" className="font-semibold text-[color:var(--purple)] underline">Oppilaan kirjautuminen</Link>
          </p>
        </StickyNote>
      </div>
    </div>
  );
}