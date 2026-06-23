import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CornerBlobs } from "@/components/CornerBlobs";
import { StickyNote } from "@/components/StickyNote";
import { getCurrentRole } from "@/lib/auth-helpers";
import { toast } from "sonner";
import { Copy, Download, ExternalLink, RefreshCw } from "lucide-react";
import { WORLDS, worldForScreen } from "@/lib/screens";
import {
  useClassRoster,
  summariseClass,
  formatLastActive,
  rosterToCsv,
  downloadCsv,
  type RosterStudent,
} from "@/lib/teacher-data";

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
        if ((error as { code?: string }).code !== "23505") break;
      }
      throw lastError;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Luokan luonti epäonnistui.");
    } finally {
      setBusy(false);
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

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-6 space-y-6">
        <StickyNote seed="teacher-create">
          <h2 className="text-2xl mb-1">Luo uusi luokka</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Luokan koodin avulla oppilaat liittyvät luokkaan.
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
            <ClassDashboard key={c.id} c={c} tone={i % 2 === 0 ? "white" : "yellow"} />
          ))}
        </div>
      </main>
    </div>
  );
}

type SortKey = "progress_behind" | "name_asc" | "last_active_oldest";

function ClassDashboard({ c, tone }: { c: ClassRow; tone: "white" | "yellow" }) {
  const { students, loading, refresh } = useClassRoster(c.id);
  const [sort, setSort] = useState<SortKey>("progress_behind");

  const stats = useMemo(() => summariseClass(students ?? []), [students]);

  const sortedStudents = useMemo<RosterStudent[]>(() => {
    if (!students) return [];
    const list = [...students];
    switch (sort) {
      case "name_asc":
        list.sort((a, b) =>
          (a.displayName ?? "").localeCompare(b.displayName ?? "", "fi"),
        );
        break;
      case "last_active_oldest":
        list.sort((a, b) => (a.lastActive?.getTime() ?? 0) - (b.lastActive?.getTime() ?? 0));
        break;
      case "progress_behind":
      default:
        list.sort((a, b) => a.screensFilled - b.screensFilled);
        break;
    }
    return list;
  }, [students, sort]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(c.join_code);
      toast.success("Koodi kopioitu.");
    } catch {
      toast.error("Kopiointi epäonnistui — kopioi käsin.");
    }
  }

  function exportCsv() {
    if (!students || students.length === 0) return;
    const csv = rosterToCsv(students);
    const safeName = c.name.replace(/[^\w\-]+/g, "_");
    downloadCsv(`${safeName}_oppilaat.csv`, csv);
  }

  return (
    <StickyNote tone={tone}>
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

      {/* Stats bar */}
      <div className="mt-3 grid gap-2 sm:grid-cols-4 rounded-2xl bg-black/5 p-3 text-sm">
        <Stat label="Oppilaita" value={String(stats.totalStudents)} />
        <Stat label="Keskimäärin" value={stats.totalStudents ? stats.worldLabel : "–"} />
        <Stat
          label="Näytöt täytetty (ka.)"
          value={
            stats.totalStudents
              ? `${stats.avgScreensFilled.toFixed(1)} / ${students?.[0]?.totalRequiredScreens ?? "?"}`
              : "–"
          }
        />
        <Stat label="Viimeksi aktiivinen" value={formatLastActive(stats.lastActivity)} />
      </div>

      {/* Toolbar */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-display">Lajittele:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm"
          >
            <option value="progress_behind">Edistyminen (jäljessä ensin)</option>
            <option value="name_asc">Nimi (A–Z)</option>
            <option value="last_active_oldest">Vähiten aktiiviset ensin</option>
          </select>
        </label>
        <Button type="button" variant="secondary" size="sm" onClick={refresh} className="rounded-full">
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Päivitä
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={copyCode} className="rounded-full">
          <Copy className="h-4 w-4 mr-1" /> Kopioi koodi
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={exportCsv}
          disabled={!students || students.length === 0}
          className="rounded-full bg-[color:var(--ink)] text-white hover:bg-[color:var(--ink)]/90"
        >
          <Download className="h-4 w-4 mr-1" /> Lataa tiedot (CSV)
        </Button>
      </div>

      {/* Body */}
      <div className="mt-4">
        {students === null ? (
          <p className="text-sm opacity-70">Ladataan…</p>
        ) : students.length === 0 ? (
          <EmptyState code={c.join_code} />
        ) : (
          <RosterTable students={sortedStudents} />
        )}
      </div>
    </StickyNote>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="leading-tight">
      <div className="text-[0.7rem] uppercase tracking-wider opacity-60">{label}</div>
      <div className="font-display text-base">{value}</div>
    </div>
  );
}

function EmptyState({ code }: { code: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-5 text-center">
      <p className="text-sm mb-3">Ei oppilaita vielä. Jaa luokan koodi oppilaiden kanssa.</p>
      <div className="inline-block rounded-2xl bg-[color:var(--yellow)] px-5 py-3 font-mono text-2xl font-bold tracking-wider text-[color:var(--ink)]">
        {code}
      </div>
    </div>
  );
}

function RosterTable({ students }: { students: RosterStudent[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white/60">
      <table className="w-full text-sm">
        <thead className="bg-black/5 text-left">
          <tr>
            <th className="px-3 py-2 font-display">Oppilas</th>
            <th className="px-3 py-2 font-display">Edistyminen</th>
            <th className="px-3 py-2 font-display">Maailmat</th>
            <th className="px-3 py-2 font-display">Viimeksi aktiivinen</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.studentId} className="border-t border-black/5">
              <td className="px-3 py-2 font-medium text-[color:var(--ink)]">
                {s.displayName?.trim() || "Nimi puuttuu"}
              </td>
              <td className="px-3 py-2 tabular-nums">
                Maailma {worldIndexForScreen(s.currentScreen)}, näytöt{" "}
                <strong>{s.screensFilled}</strong>/{s.totalRequiredScreens}
              </td>
              <td className="px-3 py-2 tabular-nums">{s.worldsCompleted} / 7</td>
              <td className="px-3 py-2">{formatLastActive(s.lastActive)}</td>
              <td className="px-3 py-2 text-right">
                <Link
                  to="/opettaja/oppilas/$userId"
                  params={{ userId: s.studentId }}
                  className="inline-flex items-center gap-1 rounded-full bg-[color:var(--ink)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[color:var(--coral)] transition-colors"
                >
                  Näytä portfolio <ExternalLink className="h-3 w-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function displayLabel(_s: RosterStudent): string {
  return "";
}



function worldIndexForScreen(n: number): number {
  const w = worldForScreen(n);
  const idx = WORLDS.findIndex((x) => x.id === w.id);
  return idx; // 0 = Prologi, 1 = M1, …
}
