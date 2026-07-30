import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StickyNote } from "@/components/StickyNote";
import { useTr } from "@/lib/i18n";
import { buildReportSeries, type RangeDays, type ReportEvent } from "@/lib/report-series";

const RANGES: { days: RangeDays; label: string }[] = [
  { days: 7, label: "7 päivää" },
  { days: 30, label: "30 päivää" },
  { days: 90, label: "90 päivää" },
  { days: 365, label: "1 vuosi" },
];

export function RangeSelector({
  value,
  onChange,
}: {
  value: RangeDays;
  onChange: (d: RangeDays) => void;
}) {
  const tr = useTr();
  return (
    <div className="flex flex-wrap gap-2">
      {RANGES.map((r) => (
        <button
          key={r.days}
          type="button"
          onClick={() => onChange(r.days)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
            value === r.days
              ? "bg-[color:var(--purple)] text-white"
              : "bg-black/10 hover:bg-black/20"
          }`}
        >
          {tr(r.label)}
        </button>
      ))}
    </div>
  );
}

interface TrendProps {
  events: ReportEvent[];
  days: RangeDays;
  studentCount: number;
  totalRequired: number;
  classes?: { id: string; name: string }[];
  seedPrefix: string;
}

const PURPLE = "var(--purple)";
const CORAL = "var(--coral)";
const YELLOW = "var(--yellow)";

function ChartCard({
  seed,
  title,
  children,
}: {
  seed: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <StickyNote seed={seed} className="space-y-3">
      <h3 className="text-xl font-bold">{title}</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </StickyNote>
  );
}

const axisProps = { stroke: "currentColor", fontSize: 11, tickLine: false } as const;

export function ReportTrends({
  events,
  days,
  studentCount,
  totalRequired,
  classes,
  seedPrefix,
}: TrendProps) {
  const tr = useTr();
  const series = useMemo(
    () => buildReportSeries(events, { days, studentCount, totalRequired }),
    [events, days, studentCount, totalRequired],
  );

  const perClass = useMemo(() => {
    if (!classes?.length) return [];
    return classes.map((c) => ({
      ...c,
      series: buildReportSeries(events, {
        days,
        studentCount,
        totalRequired,
        classId: c.id,
      }),
    }));
  }, [classes, events, days, studentCount, totalRequired]);

  if (series.length === 0) {
    return <p className="opacity-70">{tr("Ei dataa tällä aikavälillä.")}</p>;
  }

  return (
    <>
      <ChartCard seed={`${seedPrefix}-growth`} title={tr("Vahvuuksien keräämisen kasvu")}>
        <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id={`${seedPrefix}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PURPLE} stopOpacity={0.6} />
              <stop offset="100%" stopColor={PURPLE} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} allowDecimals={false} />
          <Tooltip formatter={(v: number) => [v, tr("Kerätyt vahvuudet")]} />
          <Area
            type="monotone"
            dataKey="strengths"
            stroke={PURPLE}
            strokeWidth={3}
            fill={`url(#${seedPrefix}-fill)`}
            name={tr("Kerätyt vahvuudet")}
          />
        </AreaChart>
      </ChartCard>

      <ChartCard seed={`${seedPrefix}-completion`} title={tr("Valmistumisen edistyminen")}>
        <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} unit="%" />
          <Tooltip formatter={(v: number) => [`${v} %`, tr("Keskimääräinen valmistuminen %")]} />
          <Line
            type="monotone"
            dataKey="completion"
            stroke={CORAL}
            strokeWidth={3}
            dot={false}
            name={tr("Keskimääräinen valmistuminen %")}
          />
        </LineChart>
      </ChartCard>

      <ChartCard seed={`${seedPrefix}-active`} title={tr("Aktiiviset opiskelijat")}>
        <BarChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} allowDecimals={false} />
          <Tooltip formatter={(v: number) => [v, tr("Aktiiviset opiskelijat")]} />
          <Bar
            dataKey="active"
            fill={YELLOW}
            radius={[6, 6, 0, 0]}
            name={tr("Aktiiviset opiskelijat")}
          />
        </BarChart>
      </ChartCard>

      {perClass.length > 0 && (
        <ChartCard seed={`${seedPrefix}-byclass`} title={tr("Luokkakohtainen kasvu")}>
          <LineChart margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="label" type="category" allowDuplicatedCategory={false} {...axisProps} />
            <YAxis {...axisProps} allowDecimals={false} />
            <Tooltip />
            {perClass.map((c, i) => (
              <Line
                key={c.id}
                data={c.series}
                dataKey="strengths"
                name={c.name}
                stroke={[PURPLE, CORAL, YELLOW][i % 3]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartCard>
      )}
    </>
  );
}
