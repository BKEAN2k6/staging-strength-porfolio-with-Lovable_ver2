import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CornerBlobs } from "@/components/CornerBlobs";
import { StickyNote } from "@/components/StickyNote";
import { getCurrentRole } from "@/lib/auth-helpers";
import { toast } from "sonner";
import { Copy, Users, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/opettaja")({
  component: TeacherDashboard,
});

type ClassRow = { id: string; name: string; join_code: string; created_at: string };

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
function randomCode(): string {
  let s = "LK-";
  for (let i = 0; i < 4; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  s += "-" + Math.floor(10 + Math.random() * 90);
  return s;
}

function TeacherDashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCurrentRole().then((r) => {
      setRole(r);
      if (r !== "teacher") navigate({ to: "/seikkailu", replace: true });
      else loadClasses();
    });
  }, [navigate]);

  async function loadClasses() {
    const { data, error } = await supabase
      .from("classes" as never)
      .select("id,name,join_code,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Luokkien lataus epäonnistui.");
      return;
    }
    setClasses((data as ClassRow[] | null) ?? []);
  }

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Ei istuntoa.");
      let lastError: unknown = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const payload = { name: name.trim(), teacher_id: u.user.id, join_code: randomCode() };
        const { error } = await supabase.from("classes" as never).insert(payload as never);
        if (!error) {
          setName("");
          await loadClasses();
          toast.success("Luokka luotu.");
          return;
        }
        lastError = error;
        // 23505 = unique_violation → retry once with new code
        if ((error as { code?: string }).code !== "23505") break;
      }
      throw lastError;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Luokan luonti epäonnistui.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Koodi kopioitu.");
    } catch {
      toast.error("Kopiointi epäonnistui — kopioi käsin.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (role !== "teacher") {
    return <div className="flex min-h-screen items-center justify-center text-foreground">Ladataan…</div>;
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <CornerBlobs />
      <header className="no-print relative z-10 flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-display">Opettajan näkymä</h1>
        <Button variant="ghost" onClick={signOut} className="text-foreground hover:bg-white/10 rounded-full">
          Kirjaudu ulos
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-6 space-y-6">
        <StickyNote seed="teacher-create">
          <h2 className="text-2xl mb-1">Luo uusi luokka</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tämä on väliaikainen versio. Varsinainen kojelauta tulee myöhemmin.
          </p>
          <form onSubmit={createClass} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="className">Luokan nimi</Label>
              <Input
                id="className"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="esim. 9A — Vahvuusryhmä"
                maxLength={80}
              />
            </div>
            <Button
              type="submit"
              disabled={busy || !name.trim()}
              className="rounded-full bg-[color:var(--coral)] hover:bg-[color:var(--coral)]/90 text-white font-bold py-6 px-6"
            >
              {busy ? "Luodaan…" : "Luo luokka"}
            </Button>
          </form>
        </StickyNote>

        <div className="space-y-4">
          <h2 className="font-display text-2xl">Luokkani ({classes.length})</h2>
          {classes.length === 0 && (
            <p className="opacity-80 text-sm">Ei vielä luokkia. Luo ensimmäinen yllä.</p>
          )}
          {classes.map((c, i) => (
            <StickyNote key={c.id} seed={`cls-${c.id}`} tone={i % 2 === 0 ? "white" : "yellow"}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-70">Luokka</div>
                  <div className="font-display text-xl leading-tight">{c.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider opacity-70">Liittymiskoodi</div>
                  <div className="font-mono text-2xl font-bold tracking-wider">{c.join_code}</div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => copyCode(c.join_code)}
                  className="rounded-full"
                >
                  <Copy className="h-4 w-4 mr-2" /> Kopioi koodi
                </Button>
              </div>
            </StickyNote>
          ))}
        </div>
      </main>
    </div>
  );
}