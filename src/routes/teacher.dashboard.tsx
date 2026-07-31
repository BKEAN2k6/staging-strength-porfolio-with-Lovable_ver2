import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StickyNote } from "@/components/StickyNote";
import { DashboardShell } from "@/components/DashboardShell";
import { ProfileSettings } from "@/components/ProfileSettings";
import { supabase } from "@/integrations/supabase/client";
import { useRoleGuard } from "@/lib/role-guard";
import { useLanguage, useTr, LANGUAGES, LANGUAGE_LABEL, type Language } from "@/lib/i18n";
import { WORLDS } from "@/lib/screens";
import { formatLastActive, TOTAL_REQUIRED, worldCompletion } from "@/lib/teacher-data";
import { useTeacherData, type TeacherStudent, type TeacherClass } from "@/lib/teacher-dashboard-data";
import { ALL_STRENGTHS } from "@/lib/strength-jar-data";
import { getStrengthName } from "@/lib/strengths-i18n";
import { cn } from "@/lib/utils";
import { WorldIcon } from "@/components/icons/AppIcons";
import { TopStrengthCards } from "@/components/strengths/TopStrengthCards";
import { ReportTrends, RangeSelector } from "@/components/reports/ReportTrends";
import type { RangeDays, ReportEvent } from "@/lib/report-series";

export const Route = createFileRoute("/teacher/dashboard")({
  head: () => ({
    meta: [
      { title: "Teacher dashboard — Vahvuusseikkailu" },
      {
        name: "description",
        content:
          "Follow your classes, review student progress and gift strength candies in Vahvuusseikkailu.",
      },
      { property: "og:title", content: "Teacher dashboard — Vahvuusseikkailu" },
      {
        property: "og:description",
        content: "Classes, student progress and strength assignment for teachers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherDashboardPage,
});

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(): string {
  let s = "LK-";
  for (let i = 0; i < 4; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s + "-" + Math.floor(10 + Math.random() * 90);
}

function pctOf(s: TeacherStudent): number {
  return Math.round((s.screensFilled / TOTAL_REQUIRED) * 100);
}

function TeacherDashboardPage() {
  const tr = useTr();
  const guard = useRoleGuard(["teacher"]);
  const [tab, setTab] = useState("classes");
  const [openClass, setOpenClass] = useState<string | null>(null);
  const [openStudent, setOpenStudent] = useState<string | null>(null);
  const { classes, deletedClasses, students, assigned, events, refresh } = useTeacherData();

  if (!guard.ready) return null;

  const tabs = [
    { id: "classes", label: tr("Luokat") },
    { id: "students", label: tr("Opiskelijat") },
    { id: "strengths", label: tr("Vahvuuksien antaminen") },
    { id: "reports", label: tr("Raportit") },
    { id: "settings", label: tr("Asetukset") },
  ];

  function openStudentView(id: string) {
    setOpenStudent(id);
    setTab("students");
  }

  const selectedStudent = students.find((s) => s.studentId === openStudent) ?? null;

  return (
    <DashboardShell
      title={tr("Opettajan hallintapaneeli")}
      tabs={tabs}
      active={tab}
      onSelect={(id) => {
        setTab(id);
        setOpenStudent(null);
      }}
      schoolName={guard.schoolName}
    >
      {tab === "classes" && !openClass && (
        <TopStrengths students={students} classes={classes} assigned={assigned} />
      )}

      {tab === "classes" && !openClass && (
        <div className="grid gap-3 md:grid-cols-2">
          {classes.length === 0 && <p className="opacity-70">{tr("Ei luokkia.")}</p>}
          {classes.map((c) => {
            const inClass = students.filter((s) => s.classId === c.id);
            const avg = inClass.length
              ? Math.round(inClass.reduce((a, s) => a + pctOf(s), 0) / inClass.length)
              : 0;
            return (
              <StickyNote key={c.id} seed={`cls-${c.id}`} className="space-y-2">
                <button
                  type="button"
                  onClick={() => setOpenClass(c.id)}
                  className="text-left text-xl font-bold underline-offset-2 hover:underline"
                >
                  {c.name}
                </button>
                <div className="text-sm opacity-80">
                  {tr("Luokan koodi")}: <code className="font-mono">{c.join_code}</code> ·{" "}
                  {tr("Kieli")}: {LANGUAGE_LABEL[c.language] ?? c.language}
                </div>
                <div className="text-sm">
                  {tr("Opiskelijoita")}: {inClass.length} · {tr("Valmistuminen %")}: {avg} % ·{" "}
                  {tr("Luotu")}: {new Date(c.created_at).toLocaleDateString()}
                </div>
                <div className="pt-1">
                  <DeleteClassButton
                    klass={c}
                    studentCount={inClass.length}
                    teacherId={guard.userId}
                    onDone={refresh}
                  />
                </div>
              </StickyNote>
            );
          })}
          {deletedClasses.length > 0 && (
            <div className="md:col-span-2">
              <DeletedClasses classes={deletedClasses} onDone={refresh} />
            </div>
          )}
        </div>
      )}

      {tab === "classes" && openClass && (
        <StickyNote seed={`cls-detail-${openClass}`} className="space-y-3 overflow-x-auto">
          <Button variant="outline" className="rounded-full" onClick={() => setOpenClass(null)}>
            {tr("Takaisin luokkiin")}
          </Button>
          <h2 className="text-2xl font-bold">
            {classes.find((c) => c.id === openClass)?.name ?? ""}
          </h2>
          <StudentTable
            students={students.filter((s) => s.classId === openClass)}
            onOpen={openStudentView}
          />
        </StickyNote>
      )}

      {tab === "students" && !selectedStudent && (
        <StickyNote seed="teacher-students" className="overflow-x-auto">
          <StudentTable students={students} onOpen={openStudentView} showClass />
        </StickyNote>
      )}

      {tab === "students" && selectedStudent && (
        <StudentDetail student={selectedStudent} onBack={() => setOpenStudent(null)} />
      )}

      {tab === "strengths" && (
        <AssignStrengths
          classes={classes}
          students={students}
          assigned={assigned}
          teacherId={guard.userId}
          onDone={refresh}
        />
      )}

      {tab === "reports" && (
        <TeacherReports students={students} classes={classes} events={events} />
      )}

      {tab === "settings" && (
        <>
          <ProfileSettings
            schoolName={guard.schoolName}
            displayName={guard.displayName}
            email={guard.email}
          />
          <CreateClass onCreated={refresh} />
        </>
      )}
    </DashboardShell>
  );
}

function StudentTable({
  students,
  onOpen,
  showClass = false,
}: {
  students: TeacherStudent[];
  onOpen: (id: string) => void;
  showClass?: boolean;
}) {
  const tr = useTr();
  if (students.length === 0) return <p className="opacity-70">{tr("Ei opiskelijoita.")}</p>;
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-black/10">
          <th className="py-2 pr-3">{tr("Nimi")}</th>
          {showClass && <th className="py-2 pr-3">{tr("Luokka")}</th>}
          <th className="py-2 pr-3">{tr("Viimeksi aktiivinen")}</th>
          <th className="py-2 pr-3">{tr("Nykyinen ruutu")}</th>
          <th className="py-2 pr-3">{tr("Valmistuminen %")}</th>
          <th className="py-2">{tr("Tila")}</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => {
          const pct = pctOf(s);
          return (
            <tr key={`${s.classId}-${s.studentId}`} className="border-b border-black/5">
              <td className="py-2 pr-3 font-medium">
                <button
                  type="button"
                  className="underline-offset-2 hover:underline"
                  onClick={() => onOpen(s.studentId)}
                >
                  {s.displayName?.trim() || s.studentId.slice(0, 8)}
                </button>
              </td>
              {showClass && <td className="py-2 pr-3">{s.className}</td>}
              <td className="py-2 pr-3 opacity-70">{formatLastActive(s.lastActive)}</td>
              <td className="py-2 pr-3 tabular-nums">{s.currentScreen}</td>
              <td className="py-2 pr-3 tabular-nums">{pct} %</td>
              <td className="py-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    pct >= 60
                      ? "bg-green-600/15 text-green-800"
                      : pct >= 25
                        ? "bg-yellow-500/25 text-yellow-900"
                        : "bg-red-600/15 text-red-800",
                  )}
                >
                  {pct >= 60 ? tr("Valmis") : pct >= 25 ? tr("Kesken") : tr("Ei aloitettu")}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function StudentDetail({ student, onBack }: { student: TeacherStudent; onBack: () => void }) {
  const tr = useTr();
  const worlds = useMemo(() => worldCompletion(new Set(student.filledKeys)), [student.filledKeys]);
  const pct = pctOf(student);

  return (
    <StickyNote seed={`student-${student.studentId}`} className="space-y-4">
      <Button variant="outline" className="rounded-full" onClick={onBack}>
        {tr("Takaisin")}
      </Button>
      <div>
        <h2 className="text-2xl font-bold">
          {student.displayName?.trim() || student.studentId.slice(0, 8)}
        </h2>
        <p className="text-sm opacity-80">
          {tr("Luokka")}: {student.className} · {tr("Viimeksi aktiivinen")}:{" "}
          {formatLastActive(student.lastActive)}
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs font-semibold">
          <span>
            {tr("Näytöt")}: {student.screensFilled} / {TOTAL_REQUIRED}
          </span>
          <span>{pct} %</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[color:var(--coral)]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold">{tr("Tasojen valmistuminen")}</h3>
        {worlds.map((w, i) => {
          const meta = WORLDS[i];
          const state = w.done === 0 ? "Ei aloitettu" : w.done === w.total ? "Valmis" : "Kesken";
          return (
            <div key={w.id} className="flex justify-between border-b border-black/5 py-1 text-sm">
              <span>
                <><WorldIcon id={meta.id} size={18} className="inline align-[-3px]" /> {tr(meta.title)}</>
              </span>
              <span className="tabular-nums opacity-80">
                {w.done}/{w.total} · {tr(state)}
              </span>
            </div>
          );
        })}
      </div>

      <Link
        to="/opettaja/oppilas/$userId"
        params={{ userId: student.studentId }}
        className="inline-flex items-center gap-1 rounded-full bg-[color:var(--purple)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--purple)]/90"
      >
        {tr("Avaa portfolio")} <ExternalLink className="h-3 w-3" />
      </Link>
    </StickyNote>
  );
}

function AssignStrengths({
  classes,
  students,
  assigned,
  teacherId,
  onDone,
}: {
  classes: TeacherClass[];
  students: TeacherStudent[];
  assigned: { id: string; student_id: string; strength_id: string; message: string | null; created_at: string }[];
  teacherId: string | null;
  onDone: () => Promise<void>;
}) {
  const tr = useTr();
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : language === "en" ? "en" : "fi";
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [strengthId, setStrengthId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const unique = useMemo(() => {
    const map = new Map<string, TeacherStudent>();
    for (const s of students) if (!map.has(s.studentId)) map.set(s.studentId, s);
    return Array.from(map.values());
  }, [students]);

  const nameOf = (id: string) =>
    unique.find((s) => s.studentId === id)?.displayName?.trim() || id.slice(0, 8);

  const classNameOf = (id: string) =>
    unique.find((s) => s.studentId === id)?.className ?? "—";

  const inClass = useMemo(
    () => (classId ? unique.filter((s) => s.classId === classId) : []),
    [unique, classId],
  );

  async function submit() {
    if (!teacherId || !studentId || strengthId == null) return;
    const ok = window.confirm(
      `${tr("Haluatko lahjoittaa vahvuuden")} ${getStrengthName(strengthId, lang)} ${tr("opiskelijalle")} ${nameOf(studentId)}?`,
    );
    if (!ok) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("teacher_assigned_strengths" as never).insert({
        teacher_id: teacherId,
        student_id: studentId,
        strength_id: String(strengthId),
        message: message.trim() || null,
      } as never);
      if (error) throw error;
      toast.success(tr("Vahvuus lahjoitettu!"));
      setMessage("");
      setStrengthId(null);
      await onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <StickyNote seed="assign-strength" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="as-class">{tr("Valitse luokka")}</Label>
            <select
              id="as-class"
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setStudentId("");
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">—</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="as-student">{tr("Valitse opiskelija")}</Label>
            <select
              id="as-student"
              value={studentId}
              disabled={!classId}
              onChange={(e) => setStudentId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
            >
              <option value="">
                {classId ? "—" : tr("Valitse ensin luokka")}
              </option>
              {inClass.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.displayName?.trim() || s.studentId.slice(0, 8)}
                </option>
              ))}
            </select>
            {classId && inClass.length === 0 && (
              <p className="text-xs opacity-70">{tr("Ei opiskelijoita.")}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{tr("Valitse vahvuus")}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {ALL_STRENGTHS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStrengthId(s.id)}
                aria-pressed={strengthId === s.id}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border-2 bg-white px-3 py-2 text-left text-xs font-medium text-[color:var(--ink)] transition-all hover:-translate-y-0.5",
                  strengthId === s.id
                    ? "border-[color:var(--coral)] shadow-md"
                    : "border-black/10",
                )}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: s.color }}
                  aria-hidden
                />
                <span className="truncate">{getStrengthName(s.id, lang)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="as-msg">{tr("Viesti opiskelijalle (vapaaehtoinen)")}</Label>
          <Input
            id="as-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={tr("esim. Osoitit hienoa rohkeutta tänään!")}
          />
        </div>

        <Button
          disabled={busy || !studentId || strengthId == null}
          onClick={() => void submit()}
          className="rounded-full bg-[color:var(--purple)] font-bold text-white hover:bg-[color:var(--purple)]/90"
        >
          {tr("Lahjoita vahvuus")}
        </Button>
      </StickyNote>

      <StickyNote seed="assign-history" className="overflow-x-auto">
        <h3 className="mb-2 text-xl font-bold">{tr("Annetut vahvuudet")}</h3>
        {assigned.length === 0 ? (
          <p className="opacity-70">{tr("Ei annettuja vahvuuksia.")}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10">
                <th className="py-2 pr-3">{tr("Opiskelija")}</th>
                <th className="py-2 pr-3">{tr("Luokka")}</th>
                <th className="py-2 pr-3">{tr("Vahvuus")}</th>
                <th className="py-2 pr-3">{tr("Viesti")}</th>
                <th className="py-2">{tr("Päivämäärä")}</th>
              </tr>
            </thead>
            <tbody>
              {assigned.map((a) => (
                <tr key={a.id} className="border-b border-black/5">
                  <td className="py-2 pr-3">{nameOf(a.student_id)}</td>
                  <td className="py-2 pr-3 opacity-80">{classNameOf(a.student_id)}</td>
                  <td className="py-2 pr-3">{getStrengthName(Number(a.strength_id), lang)}</td>
                  <td className="py-2 pr-3 opacity-80">{a.message ?? "—"}</td>
                  <td className="py-2 opacity-70">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </StickyNote>
    </>
  );
}

/** Counts every collected strength id for a set of students (+ teacher gifts). */
function countStrengths(students: TeacherStudent[], assigned: { student_id: string; strength_id: string }[]) {
  const ids = new Set(students.map((s) => s.studentId));
  const counts = new Map<number, { total: number; students: Set<string> }>();
  const add = (id: number, studentId: string) => {
    if (id < 1 || id > 26) return;
    let e = counts.get(id);
    if (!e) {
      e = { total: 0, students: new Set() };
      counts.set(id, e);
    }
    e.total += 1;
    e.students.add(studentId);
  };
  for (const s of students) for (const id of s.strengthIds) add(id, s.studentId);
  for (const g of assigned) {
    if (!ids.has(g.student_id)) continue;
    add(Number(g.strength_id), g.student_id);
  }
  return [...counts.entries()]
    .map(([id, e]) => ({ id, total: e.total, students: e.students.size }))
    .sort((a, b) => b.total - a.total || a.id - b.id);
}

function TopStrengths({
  students,
  classes,
  assigned,
}: {
  students: TeacherStudent[];
  classes: TeacherClass[];
  assigned: { student_id: string; strength_id: string }[];
}) {
  const tr = useTr();
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : language === "en" ? "en" : "fi";
  const top = useMemo(() => countStrengths(students, assigned).slice(0, 5), [students, assigned]);

  const colorOf = (id: number) => ALL_STRENGTHS.find((s) => s.id === id)?.color ?? "var(--purple)";

  return (
    <StickyNote seed="t-top-strengths" className="space-y-4 md:col-span-2">
      <h2 className="text-2xl font-bold">{tr("Ryhmän suosituimmat vahvuudet")}</h2>
      {top.length === 0 ? (
        <p className="opacity-70">{tr("Opiskelijasi eivät ole vielä keränneet vahvuuksia.")}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {top.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "flex flex-col items-center gap-2 rounded-3xl bg-white/90 p-4 text-center text-slate-900 shadow-md",
                i === 0 && "border-4 border-[color:var(--yellow)] shadow-lg sm:scale-105",
              )}
            >
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">#{i + 1}</span>
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full font-display text-2xl font-bold tabular-nums text-white shadow-inner"
                style={{ background: colorOf(s.id) }}
              >
                {s.total}
              </span>
              <span className="text-sm font-bold leading-tight">{getStrengthName(s.id, lang)}</span>
              <span className="text-xs opacity-70">
                {s.students} {tr("opiskelijaa")}
              </span>

            </div>
          ))}
        </div>
      )}

      {classes.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {classes.map((c) => {
            const inClass = students.filter((s) => s.classId === c.id);
            const list = countStrengths(inClass, assigned);
            return (
              <div key={c.id} className="rounded-2xl bg-white/70 p-3 text-slate-900">
                <div className="font-bold">{c.name}</div>
                {list.length === 0 ? (
                  <p className="text-sm opacity-70">
                    {tr("Opiskelijasi eivät ole vielä keränneet vahvuuksia.")}
                  </p>
                ) : (
                  <>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {list.slice(0, 3).map((s, i) => (
                        <span
                          key={s.id}
                          className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm"
                        >
                          <span className="opacity-60">#{i + 1}</span>
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ background: colorOf(s.id) }}
                            aria-hidden
                          />
                          {getStrengthName(s.id, lang)} ×{s.total}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs opacity-70">
                      {list.length}/26 · {tr("uusia vahvuuksia kerätty")}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </StickyNote>
  );
}

function TeacherReports({
  students,
  classes,
  events,
}: {
  students: TeacherStudent[];
  classes: { id: string; name: string }[];
  events: ReportEvent[];
}) {
  const tr = useTr();
  const [days, setDays] = useState<RangeDays>(30);
  const atRisk = students.filter(
    (s) => !s.lastActive || Date.now() - s.lastActive.getTime() > 14 * 24 * 3600 * 1000,
  );
  return (
    <>
      <StickyNote seed="t-reports" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-bold">{tr("Raportit")}</h2>
          <RangeSelector value={days} onChange={setDays} />
        </div>
        <p className="opacity-80">
          {tr("Opiskelijoita")}: {students.length} · {tr("Luokkia")}: {classes.length}
        </p>
        <ul className="space-y-1 text-sm">
          {classes.map((c) => {
            const inClass = students.filter((s) => s.classId === c.id);
            const avg = inClass.length
              ? Math.round(inClass.reduce((a, s) => a + pctOf(s), 0) / inClass.length)
              : 0;
            return (
              <li key={c.id}>
                {c.name} — {avg} %
              </li>
            );
          })}
        </ul>
      </StickyNote>
      <ReportTrends
        events={events}
        days={days}
        studentCount={students.length}
        totalRequired={TOTAL_REQUIRED}
        seedPrefix="t"
      />
      <StickyNote seed="t-risk" className="space-y-2">
        <h3 className="text-xl font-bold">{tr("Riskissä olevat opiskelijat")}</h3>
        {atRisk.length === 0 ? (
          <p className="opacity-70">—</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {atRisk.map((s) => (
              <li key={`${s.classId}-${s.studentId}`}>
                {s.displayName ?? s.studentId.slice(0, 8)} — {tr("Ei aktiivinen 14 päivään")}
              </li>
            ))}
          </ul>
        )}
      </StickyNote>
    </>
  );
}

function CreateClass({ onDoneNoop, onCreated }: { onDoneNoop?: never; onCreated: () => Promise<void> }) {
  const tr = useTr();
  const [name, setName] = useState("");
  const [language, setLanguageChoice] = useState<Language>("fi");
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { error } = await supabase.from("classes" as never).insert({
        name: name.trim(),
        teacher_id: u.user.id,
        join_code: randomCode(),
        language,
      } as never);
      if (error) throw error;
      setName("");
      toast.success(tr("Tallennettu!"));
      await onCreated();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <StickyNote seed="t-create-class" className="space-y-3">
      <h3 className="text-xl font-bold">{tr("Luo luokka")}</h3>
      <form onSubmit={create} className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="cc-name">{tr("Luokan nimi")}</Label>
          <Input id="cc-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cc-lang">{tr("Kieli")}</Label>
          <select
            id="cc-lang"
            value={language}
            onChange={(e) => setLanguageChoice(e.target.value as Language)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {LANGUAGE_LABEL[l]} ({l})
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <Button
            type="submit"
            disabled={busy}
            className="rounded-full bg-[color:var(--purple)] font-bold text-white hover:bg-[color:var(--purple)]/90"
          >
            {tr("Luo luokka")}
          </Button>
        </div>
      </form>
      <p className="text-xs opacity-60">
        <Copy className="mr-1 inline h-3 w-3" />
        {tr("Luokan koodi")}
      </p>
    </StickyNote>
  );
}

function DeleteClassButton({
  klass,
  studentCount,
  teacherId,
  onDone,
}: {
  klass: TeacherClass;
  studentCount: number;
  teacherId: string | null;
  onDone: () => Promise<void>;
}) {
  const tr = useTr();
  const [busy, setBusy] = useState(false);

  async function remove() {
    const ok = window.confirm(
      `${tr("Haluatko varmasti poistaa luokan")} "${klass.name}"? ${tr("Opiskelijat menettävät pääsyn seikkailuun. Voit palauttaa luokan 60 päivän ajan.")} (${tr("Opiskelijoita")}: ${studentCount})`,
    );
    if (!ok) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("classes" as never)
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: teacherId,
        } as never)
        .eq("id", klass.id);
      if (error) throw error;
      toast.success(tr("Luokka poistettu."));
      await onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={busy}
      onClick={() => void remove()}
      className="rounded-full bg-red-600 font-bold text-white hover:bg-red-700"
    >
      <Trash2 className="mr-1 h-4 w-4" /> {tr("Poista luokka")}
    </Button>
  );
}

function DeletedClasses({
  classes,
  onDone,
}: {
  classes: TeacherClass[];
  onDone: () => Promise<void>;
}) {
  const tr = useTr();
  const [busy, setBusy] = useState<string | null>(null);

  function daysLeft(deletedAt?: string | null): number {
    if (!deletedAt) return 60;
    const passed = (Date.now() - new Date(deletedAt).getTime()) / 86400000;
    return Math.max(0, Math.ceil(60 - passed));
  }

  async function restore(id: string) {
    setBusy(id);
    try {
      const { error } = await supabase
        .from("classes" as never)
        .update({ is_deleted: false, deleted_at: null, deleted_by: null } as never)
        .eq("id", id);
      if (error) throw error;
      toast.success(tr("Luokka palautettu."));
      await onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <StickyNote seed="deleted-classes" className="space-y-3">
      <h3 className="text-xl font-bold">{tr("Poistetut luokat")}</h3>
      <ul className="space-y-2">
        {classes.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/70 px-3 py-2 text-sm"
          >
            <span>
              <strong>{c.name}</strong> ·{" "}
              <span className="opacity-70">
                {tr("Poistetaan pysyvästi")}: {daysLeft(c.deleted_at)} {tr("päivän kuluttua")}
              </span>
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy === c.id}
              onClick={() => void restore(c.id)}
              className="rounded-full"
            >
              <RotateCcw className="mr-1 h-4 w-4" /> {tr("Palauta luokka")}
            </Button>
          </li>
        ))}
      </ul>
    </StickyNote>
  );
}
