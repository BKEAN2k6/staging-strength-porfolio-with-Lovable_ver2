import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StickyNote } from "@/components/StickyNote";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useRoleGuard } from "@/lib/role-guard";
import { useTr } from "@/lib/i18n";
import { WORLDS } from "@/lib/screens";
import { computeStudentStats, TOTAL_REQUIRED, worldCompletion } from "@/lib/teacher-data";
import { getStrengthName } from "@/lib/strengths-i18n";
import { useLanguage } from "@/lib/i18n";
import {
  getSchoolAdminData,
  createTeacherCode,
  revokeTeacherCode,
  promoteToSchoolAdmin,
  type SchoolAdminData,
} from "@/lib/schooladmin.functions";

export const Route = createFileRoute("/school-admin/dashboard")({
  head: () => ({
    meta: [
      { title: "School admin dashboard — Vahvuusseikkailu" },
      {
        name: "description",
        content:
          "School-wide overview of students, teachers, registration codes and strengths progress in Vahvuusseikkailu.",
      },
      { property: "og:title", content: "School admin dashboard — Vahvuusseikkailu" },
      {
        property: "og:description",
        content: "Manage teachers, students and teacher codes for your school.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SchoolAdminDashboard,
});

function fmtDate(v: string | null): string {
  return v ? new Date(v).toLocaleDateString() : "—";
}

function statusTone(pct: number): string {
  if (pct >= 60) return "bg-green-600/15 text-green-800";
  if (pct >= 25) return "bg-yellow-500/25 text-yellow-900";
  return "bg-red-600/15 text-red-800";
}

function SchoolAdminDashboard() {
  const tr = useTr();
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : language === "en" ? "en" : "fi";
  const guard = useRoleGuard(["school_admin"]);
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState<SchoolAdminData | null>(null);

  const fetchData = useServerFn(getSchoolAdminData);
  const genCode = useServerFn(createTeacherCode);
  const revoke = useServerFn(revokeTeacherCode);
  const promote = useServerFn(promoteToSchoolAdmin);

  const load = useCallback(async () => {
    try {
      setData(await fetchData());
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [fetchData]);

  useEffect(() => {
    if (guard.ready) void load();
  }, [guard.ready, load]);

  const derived = useMemo(() => {
    const students = data?.students ?? [];
    const rows = students.map((s) => {
      const filled = new Set(s.filledKeys);
      const stats = computeStudentStats(filled);
      return {
        ...s,
        screensFilled: stats.screensFilled,
        pct: Math.round((stats.screensFilled / TOTAL_REQUIRED) * 100),
        worlds: worldCompletion(filled),
      };
    });
    const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
    const activeThisMonth = rows.filter(
      (r) => r.lastActive && new Date(r.lastActive).getTime() > monthAgo,
    ).length;
    const avgCompletion = rows.length
      ? Math.round(rows.reduce((a, r) => a + r.pct, 0) / rows.length)
      : 0;
    const modules = WORLDS.map((w, i) => {
      let done = 0;
      let total = 0;
      for (const r of rows) {
        const x = r.worlds[i];
        done += x.done;
        total += x.total;
      }
      return { id: w.id, label: w.title, pct: total ? Math.round((done / total) * 100) : 0 };
    });
    return { rows, activeThisMonth, avgCompletion, modules };
  }, [data]);

  if (!guard.ready) return null;

  const tabs = [
    { id: "overview", label: tr("Yhteenveto") },
    { id: "students", label: tr("Opiskelijat") },
    { id: "teachers", label: tr("Opettajat") },
    { id: "codes", label: tr("Opettajakoodit") },
    { id: "reports", label: tr("Raportit") },
    { id: "settings", label: tr("Asetukset") },
  ];

  async function onGenerate() {
    try {
      const res = await genCode({});
      toast.success(`${tr("Koodi luotu!")} ${res.code}`);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <DashboardShell
      title={tr("Koulun hallintapaneeli")}
      tabs={tabs}
      active={tab}
      onSelect={setTab}
      schoolName={data?.school?.name ?? guard.schoolName}
    >
      {tab === "overview" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label={tr("Opiskelijoiden määrä")} value={String(derived.rows.length)} />
            <MetricCard label={tr("Opettajien määrä")} value={String(data?.teachers.length ?? 0)} />
            <MetricCard
              label={tr("Aktiiviset tässä kuussa")}
              value={String(derived.activeThisMonth)}
            />
            <MetricCard
              label={tr("Keskimääräinen valmistuminen")}
              value={`${derived.avgCompletion} %`}
            />
          </div>
          <StickyNote seed="sa-modules" className="space-y-3">
            <h2 className="text-2xl font-bold">{tr("Moduulien valmistuminen")}</h2>
            {derived.modules.map((m) => (
              <div key={m.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{tr(m.label)}</span>
                  <span>{m.pct} %</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-[color:var(--purple)]"
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </StickyNote>
        </>
      )}

      {tab === "students" && (
        <StickyNote seed="sa-students" className="overflow-x-auto">
          {derived.rows.length === 0 ? (
            <p className="opacity-70">{tr("Ei opiskelijoita.")}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="py-2 pr-3">{tr("Nimi")}</th>
                  <th className="py-2 pr-3">{tr("Sähköposti")}</th>
                  <th className="py-2 pr-3">{tr("Luokka")}</th>
                  <th className="py-2 pr-3">{tr("Viimeksi aktiivinen")}</th>
                  <th className="py-2 pr-3">{tr("Valmistuminen %")}</th>
                  <th className="py-2">{tr("Tila")}</th>
                </tr>
              </thead>
              <tbody>
                {derived.rows.map((s) => (
                  <tr key={s.id} className="border-b border-black/5">
                    <td className="py-2 pr-3 font-medium">{s.name ?? "—"}</td>
                    <td className="py-2 pr-3 opacity-80">{s.email ?? "—"}</td>
                    <td className="py-2 pr-3">{s.className ?? "—"}</td>
                    <td className="py-2 pr-3 opacity-70">{fmtDate(s.lastActive)}</td>
                    <td className="py-2 pr-3 tabular-nums">{s.pct} %</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone(s.pct)}`}
                      >
                        {s.pct >= 60 ? tr("Aktiivinen") : s.pct >= 25 ? tr("Kesken") : tr("Ei aloitettu")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </StickyNote>
      )}

      {tab === "teachers" && (
        <StickyNote seed="sa-teachers" className="overflow-x-auto">
          {(data?.teachers.length ?? 0) === 0 ? (
            <p className="opacity-70">{tr("Ei opettajia.")}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="py-2 pr-3">{tr("Nimi")}</th>
                  <th className="py-2 pr-3">{tr("Sähköposti")}</th>
                  <th className="py-2 pr-3">{tr("Luokkia")}</th>
                  <th className="py-2 pr-3">{tr("Opiskelijoita")}</th>
                  <th className="py-2 pr-3">{tr("Viimeksi aktiivinen")}</th>
                  <th className="py-2">{tr("Toiminnot")}</th>
                </tr>
              </thead>
              <tbody>
                {(data?.teachers ?? []).map((t) => (
                  <TeacherRow
                    key={t.id}
                    teacher={t}
                    onPromote={async () => {
                      try {
                        await promote({ data: { userId: t.id } });
                        toast.success(tr("Sinut on nimitetty koulun adminiksi!"));
                        await load();
                      } catch (e) {
                        toast.error((e as Error).message);
                      }
                    }}
                  />
                ))}
              </tbody>
            </table>
          )}
        </StickyNote>
      )}

      {tab === "codes" && (
        <>
          <StickyNote seed="sa-codes-new">
            <Button
              onClick={() => void onGenerate()}
              className="rounded-full bg-[color:var(--purple)] font-bold text-white hover:bg-[color:var(--purple)]/90"
            >
              {tr("Luo opettajakoodi")}
            </Button>
          </StickyNote>
          <StickyNote seed="sa-codes" className="overflow-x-auto">
            {(data?.codes.length ?? 0) === 0 ? (
              <p className="opacity-70">{tr("Ei vielä koodeja.")}</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="py-2 pr-3">{tr("Koodi")}</th>
                    <th className="py-2 pr-3">{tr("Tila")}</th>
                    <th className="py-2 pr-3">{tr("Käyttäjä")}</th>
                    <th className="py-2 pr-3">{tr("Luotu")}</th>
                    <th className="py-2">{tr("Toiminnot")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.codes ?? []).map((c) => (
                    <tr key={c.id} className="border-b border-black/5">
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-2">
                          <code className="font-mono">{c.code}</code>
                          <button
                            type="button"
                            aria-label={tr("Kopioi")}
                            title={tr("Kopioi")}
                            className="opacity-60 hover:opacity-100"
                            onClick={() => {
                              void navigator.clipboard.writeText(c.code);
                              toast.success(tr("Kopioitu!"));
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        {c.is_revoked
                          ? tr("Poista")
                          : c.is_used
                            ? tr("Käytetty")
                            : tr("Käyttämätön")}
                      </td>
                      <td className="py-2 pr-3">{c.used_by ?? "—"}</td>
                      <td className="py-2 pr-3 opacity-70">{fmtDate(c.created_at)}</td>
                      <td className="py-2">
                        {!c.is_revoked && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={async () => {
                              await revoke({ data: { id: c.id } });
                              await load();
                            }}
                          >
                            {tr("Poista")}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </StickyNote>
        </>
      )}

      {tab === "reports" && (
        <>
          <StickyNote seed="sa-report-eng" className="space-y-2">
            <h2 className="text-2xl font-bold">{tr("Raportit")}</h2>
            <p className="opacity-80">
              {tr("Opiskelijat")}: {derived.rows.length} · {tr("Opettajat")}:{" "}
              {data?.teachers.length ?? 0} · {tr("Keskimääräinen valmistuminen")}:{" "}
              {derived.avgCompletion} %
            </p>
          </StickyNote>
          <StickyNote seed="sa-report-strength" className="space-y-2">
            <h3 className="text-xl font-bold">{tr("Suosituimmat vahvuudet")}</h3>
            {(data?.strengthCounts.length ?? 0) === 0 ? (
              <p className="opacity-70">{tr("Ei annettuja vahvuuksia.")}</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {(data?.strengthCounts ?? []).slice(0, 10).map((s) => (
                  <li key={s.strengthId}>
                    {getStrengthName(Number(s.strengthId), lang)} — {s.count}
                  </li>
                ))}
              </ul>
            )}
          </StickyNote>
          <StickyNote seed="sa-report-risk" className="space-y-2">
            <h3 className="text-xl font-bold">{tr("Riskissä olevat opiskelijat")}</h3>
            <ul className="space-y-1 text-sm">
              {derived.rows
                .filter(
                  (r) =>
                    !r.lastActive ||
                    Date.now() - new Date(r.lastActive).getTime() > 14 * 24 * 3600 * 1000,
                )
                .map((r) => (
                  <li key={r.id}>
                    {r.name ?? "—"} — {tr("Ei aktiivinen 14 päivään")}
                  </li>
                ))}
            </ul>
          </StickyNote>
        </>
      )}

      {tab === "settings" && (
        <ProfileSettings
          schoolName={data?.school?.name ?? guard.schoolName}
          displayName={guard.displayName}
          email={guard.email}
        />
      )}
    </DashboardShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
      <div className="text-[0.7rem] uppercase tracking-wider opacity-60">{label}</div>
      <div className="text-3xl font-bold text-[color:var(--ink)]">{value}</div>
    </div>
  );
}

function TeacherRow({
  teacher,
  onPromote,
}: {
  teacher: SchoolAdminData["teachers"][number];
  onPromote: () => Promise<void>;
}) {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className="border-b border-black/5">
        <td className="py-2 pr-3 font-medium">{teacher.name ?? "—"}</td>
        <td className="py-2 pr-3 opacity-80">{teacher.email ?? "—"}</td>
        <td className="py-2 pr-3">{teacher.classCount}</td>
        <td className="py-2 pr-3">{teacher.studentCount}</td>
        <td className="py-2 pr-3 opacity-70">{fmtDate(teacher.lastActive)}</td>
        <td className="py-2">
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => setOpen((v) => !v)}
            >
              {tr("Näytä luokat")}
            </Button>
            {teacher.role !== "school_admin" && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => void onPromote()}
              >
                {tr("Nimeä adminiksi")}
              </Button>
            )}
          </div>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-black/5 bg-black/5">
          <td colSpan={6} className="px-3 py-2 text-xs">
            {teacher.classNames.length ? teacher.classNames.join(", ") : tr("Ei luokkia.")}
          </td>
        </tr>
      )}
    </>
  );
}

export function ProfileSettings({
  schoolName,
  displayName,
  email,
}: {
  schoolName?: string | null;
  displayName: string | null;
  email: string | null;
}) {
  const tr = useTr();
  const [name, setName] = useState(displayName ?? "");
  const [mail, setMail] = useState(email ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(displayName ?? "");
    setMail(email ?? "");
  }, [displayName, email]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase
        .from("profiles" as never)
        .update({ display_name: name.trim() } as never)
        .eq("id", u.user.id);
      const patch: { email?: string; password?: string } = {};
      if (mail && mail !== email) patch.email = mail;
      if (password) patch.password = password;
      if (Object.keys(patch).length) {
        const { error } = await supabase.auth.updateUser(patch);
        if (error) throw error;
      }
      setPassword("");
      toast.success(tr("Tallennettu!"));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <StickyNote seed="settings-profile" className="space-y-4">
      <div>
        <div className="text-[0.7rem] uppercase tracking-wider opacity-60">{tr("Koulun nimi")}</div>
        <div className="font-bold">{schoolName ?? "—"}</div>
      </div>
      <form onSubmit={save} className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="set-name">{tr("Nimi")}</Label>
          <Input id="set-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="set-mail">{tr("Sähköposti")}</Label>
          <Input
            id="set-mail"
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="set-pass">{tr("Uusi salasana")}</Label>
          <Input
            id="set-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="md:col-span-3">
          <Button
            type="submit"
            disabled={busy}
            className="rounded-full bg-[color:var(--purple)] font-bold text-white hover:bg-[color:var(--purple)]/90"
          >
            {tr("Tallenna")}
          </Button>
        </div>
      </form>
    </StickyNote>
  );
}
