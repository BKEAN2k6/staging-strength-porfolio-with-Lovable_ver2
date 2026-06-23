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
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/seikkailu", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      toast.error("Anna luokan koodi.");
      return;
    }
    setBusy(true);
    try {
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (signUpErr) {
        const msg = signUpErr.message;
        toast.error(
          msg.includes("already registered") ? "Tällä sähköpostilla on jo tunnus." : msg,
        );
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        await supabase.auth.signInWithPassword({ email, password });
      }
      const { data: rpcData, error: rpcErr } = await supabase.rpc(
        "join_class" as never,
        { p_join_code: code } as never,
      );
      if (rpcErr) throw rpcErr;
      const res = rpcData as { ok?: boolean; error?: string } | null;
      if (!res?.ok) {
        toast.error("Koodi ei ole voimassa. Tarkista opettajaltasi.");
        await supabase.auth.signOut();
        return;
      }
      navigate({ to: "/liity-yhteisoon", replace: true });
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
          <h1 className="text-4xl font-bold">Luo opiskelija-tunnus</h1>
        </div>

        <StickyNote seed="student-signup-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Sähköposti</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="etunimi.sukunimi@koulu.fi"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Salasana</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Luokan koodi</Label>
              <Input
                id="code"
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="esim. ABC123"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[color:var(--coral)] hover:bg-[color:var(--coral)]/90 text-white font-bold py-6 text-base"
            >
              {busy ? "Hetki…" : "Rekisteröidy opiskelijana"}
            </Button>
          </form>

          <div className="mt-5 flex justify-between text-xs text-muted-foreground">
            <Link to="/auth" className="font-semibold text-[color:var(--purple)] underline">
              Takaisin
            </Link>
            <Link to="/auth/login" className="font-semibold text-[color:var(--purple)] underline">
              Kirjaudu sisään
            </Link>
          </div>
        </StickyNote>
      </div>
    </div>
  );
}
