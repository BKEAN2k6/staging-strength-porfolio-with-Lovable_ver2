import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStudentProgress } from "@/lib/progress";
import { useStrengthJar } from "@/hooks/useStrengthJar";
import { useReceivedGifts } from "@/hooks/useReceivedGifts";
import { WORLDS, type WorldId } from "@/lib/screens";

export interface Achievement {
  id: string;
  /** Finnish source strings — render through tr(). */
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  /** 0–1 for tiered/progress achievements. */
  progress: number;
  progressLabel?: string;
}

const MODULE_META: Array<{ id: WorldId; label: string; emoji: string }> = [
  { id: "m1", label: "Moduuli 1", emoji: "🌟" },
  { id: "m2", label: "Moduuli 2", emoji: "🎓" },
  { id: "m3", label: "Moduuli 3", emoji: "🏠" },
  { id: "m4", label: "Moduuli 4", emoji: "🎨" },
  { id: "m5", label: "Moduuli 5", emoji: "🤝" },
  { id: "m6", label: "Moduuli 6", emoji: "🏆" },
];

const COLLECTOR_TIERS = [10, 15, 20, 26];

function ratio(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, done / total);
}

/** Derives all trophies from existing progress + strength data. Read-only. */
export function useAchievements() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled) setUserId(data.user?.id ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const progress = useStudentProgress(userId);
  const jar = useStrengthJar();
  const { gifts } = useReceivedGifts();

  return useMemo<{ achievements: Achievement[]; unlockedCount: number; total: number; loading: boolean }>(() => {
    const filled = progress?.filledKeys ?? new Set<string>();
    const byWorld = progress?.byWorld;

    const giftIds = new Set(
      gifts.map((g) => Number(g.strength_id)).filter((n) => Number.isFinite(n)),
    );
    const allStrengths = new Set<number>([...jar.selected, ...jar.collected, ...giftIds]);
    const strengthCount = allStrengths.size;

    const list: Achievement[] = [];

    list.push({
      id: "adventure-started",
      title: "Seikkailu alkoi",
      description: "Aloitit vahvuusseikkailun.",
      emoji: "🚀",
      unlocked: filled.size > 0 || (progress?.currentScreen ?? 1) > 1,
      progress: filled.size > 0 ? 1 : 0,
    });

    list.push({
      id: "candy-shop",
      title: "Karkkikaupan tutkija",
      description: "Valitsit vahvuutesi karkkikaupasta.",
      emoji: "🍬",
      unlocked: filled.has("screen_12_karkkikauppa_picks"),
      progress: filled.has("screen_12_karkkikauppa_picks") ? 1 : 0,
    });

    for (const m of MODULE_META) {
      const w = byWorld?.[m.id];
      const done = w?.completed ?? 0;
      const total = w?.total ?? 0;
      list.push({
        id: `module-${m.id}`,
        title: `${m.label} mestari`,
        description: "Täytit kaikki moduulin tehtävät.",
        emoji: m.emoji,
        unlocked: total > 0 && done >= total,
        progress: ratio(done, total),
        progressLabel: `${done}/${total}`,
      });
    }

    const meter = byWorld?.m7;
    list.push({
      id: "meter-master",
      title: "Vahvuusmittarin mestari",
      description: "Teit vahvuusmittarin kokonaan.",
      emoji: "📏",
      unlocked: (meter?.total ?? 0) > 0 && (meter?.completed ?? 0) >= (meter?.total ?? 0),
      progress: ratio(meter?.completed ?? 0, meter?.total ?? 0),
      progressLabel: `${meter?.completed ?? 0}/${meter?.total ?? 0}`,
    });

    for (const tier of COLLECTOR_TIERS) {
      list.push({
        id: `collector-${tier}`,
        title: `Vahvuuksien kerääjä ${tier}`,
        description: "Keräsit vahvuuksia purkkiisi.",
        emoji: tier >= 26 ? "👑" : tier >= 20 ? "🏅" : tier >= 15 ? "🥈" : "🥉",
        unlocked: strengthCount >= tier,
        progress: ratio(strengthCount, tier),
        progressLabel: `${Math.min(strengthCount, tier)}/${tier}`,
      });
    }

    list.push({
      id: "teachers-pick",
      title: "Opettajan valinta",
      description: "Sait vahvuuskarkin opettajaltasi.",
      emoji: "🎁",
      unlocked: gifts.length > 0,
      progress: gifts.length > 0 ? 1 : 0,
    });

    list.push({
      id: "reflection-champion",
      title: "Pohdinnan mestari",
      description: "Kirjoitit 50 vastausta seikkailun aikana.",
      emoji: "✍️",
      unlocked: filled.size >= 50,
      progress: ratio(filled.size, 50),
      progressLabel: `${Math.min(filled.size, 50)}/50`,
    });

    const worldsDone = WORLDS.filter((w) => {
      const s = byWorld?.[w.id];
      return s && s.total > 0 && s.completed >= s.total;
    }).length;
    const worldsTotal = WORLDS.filter((w) => (byWorld?.[w.id]?.total ?? 0) > 0).length;
    list.push({
      id: "adventure-complete",
      title: "Seikkailu suoritettu",
      description: "Sait koko vahvuusseikkailun valmiiksi.",
      emoji: "🏆",
      unlocked: worldsTotal > 0 && worldsDone >= worldsTotal,
      progress: ratio(worldsDone, worldsTotal),
      progressLabel: `${worldsDone}/${worldsTotal}`,
    });

    return {
      achievements: list,
      unlockedCount: list.filter((a) => a.unlocked).length,
      total: list.length,
      loading: progress == null || jar.loading,
    };
  }, [progress, jar.selected, jar.collected, jar.loading, gifts]);
}
