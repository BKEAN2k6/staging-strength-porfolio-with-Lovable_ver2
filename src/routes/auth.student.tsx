import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CornerBlobs } from "@/components/CornerBlobs";
import { StickyNote } from "@/components/StickyNote";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/student")({
  component: StudentSignup,
});

function StudentSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/seikkailu", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Kirjoita nimesi — opettaja näkee sen luokkalistassa.");
      return;
    }
    if (!joinCode.trim()) {
      toast.error("Anna luokan koodi.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: displayName.trim() },
        },
      });
      if (error) throw error;
      // In case email confirmation is off, ensure we're signed in for the RPC.
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        await supabase.auth.signInWithPassword({ email, password });
      }

      // Validate + join class
      const { data: rpcData, error: rpcErr } = await supabase.rpc(
        "join_class" as never,
        { p_join_code: joinCode.trim() } as never,
      );
      if (rpcErr) throw rpcErr;
      const res = rpcData as { ok?: boolean; error?: string } | null;
      if (!res?.ok) {
        toast.error("Koodi ei ole voimassa. Tarkista koodi opettajaltasi.");
        navigate({ to: "/liity-yhteisoon", replace: true });
        return;
      }
      toast.success("Tervetuloa seikkailuun!");
      navigate({ to: "/seikkailu", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tuntematon virhe";
      toast.error(
        msg.includes("already registered") ? "Tällä sähköpostilla on jo tunnus." : msg
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
          <h1 className="text-4xl font-bold">Luo opiskelija-tunnus</h1>
          <p className="mt-2 opacity-90">Liity yhteisöön koulun koodilla</p>
        </div>

        <StickyNote seed="student-signup-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nimi (näkyy opettajalle) <span className="text-[color:var(--coral)]">*</span></Label>
              <Input id="name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Etunimi Sukunimi" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Sähköposti</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="etunimi.sukunimi@koulu.fi" autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Salasana</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Luokan koodi</Label>
              <Input id="code" required value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="esim. ABC123" />
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-full bg-[color:var(--coral)] hover:bg-[color:var(--coral)]/90 text-white font-bold py-6 text-base">
              {busy ? "Hetki…" : "Rekisteröidy opiskelijana"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Onko sinulla jo tunnus?{" "}
            <Link to="/auth/login" className="font-semibold text-[color:var(--purple)] underline">
              Kirjaudu sisään
            </Link>
          </p>
        </StickyNote>
      </div>
    </div>
  );
}
