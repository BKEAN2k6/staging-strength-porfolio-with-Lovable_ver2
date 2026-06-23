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
  component: TeacherSignup,
});

function TeacherSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (teacherCode.trim() !== "OPETTAJA-2026") {
      toast.error("Opettajan koodi ei kelpaa. Pyydä koodi koulustasi.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { school: school.trim() },
        },
      });
      if (error) throw error;
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        await supabase.auth.signInWithPassword({ email, password });
      }
      const { data, error: rpcErr } = await supabase.rpc(
        "claim_teacher_role" as never,
        { p_code: teacherCode.trim() } as never,
      );
      if (rpcErr) throw rpcErr;
      if (data !== true) {
        toast.error("Opettajan koodi ei kelpaa. Pyydä koodi koulustasi.");
        await supabase.auth.signOut();
        return;
      }
      navigate({ to: "/opettaja", replace: true });
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
        </div>

        <StickyNote seed="teacher-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Sähköposti</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="opettaja@koulu.fi"
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
              <Label htmlFor="school">Koulun nimi</Label>
              <Input
                id="school"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="esim. Espoo High School"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Opettajan koodi</Label>
              <Input
                id="code"
                required
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                placeholder="esim. OPETTAJA-2026"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[color:var(--coral)] hover:bg-[color:var(--coral)]/90 text-white font-bold py-6 text-base"
            >
              {busy ? "Hetki…" : "Rekisteröidy opettajana"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Onko sinulla jo opettajatunnus?{" "}
            <Link to="/auth/login" className="font-semibold text-[color:var(--purple)] underline">
              Kirjaudu sisään
            </Link>
          </p>
        </StickyNote>
      </div>
    </div>
  );
}
