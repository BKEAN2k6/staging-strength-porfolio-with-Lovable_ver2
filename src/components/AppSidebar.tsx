import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Map as MapIcon, Lock, Candy, User } from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";
import { WORLDS } from "@/lib/screens";
import { useNavGate } from "@/lib/screen-completion";
import { REQUIREMENTS } from "@/lib/screen-completion";
import { useStudentProgress } from "@/lib/progress";
import { supabase } from "@/integrations/supabase/client";
import { useT, useTr } from "@/lib/i18n";

function pickResumeTarget(
  start: number,
  end: number,
  currentScreen: number | null,
  completedScreens: Set<number> | undefined,
): number {
  if (currentScreen != null && currentScreen >= start && currentScreen <= end) {
    return currentScreen;
  }
  for (let n = start; n <= end; n++) {
    const req = REQUIREMENTS[n];
    if (!req || req.length === 0) continue;
    if (!completedScreens?.has(n)) return n;
  }
  return start;
}

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { canNavigateTo, currentScreen } = useNavGate();
  const [userId, setUserId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const t = useT();
  const tr = useTr();
  const hint = t("nav.finishFirst");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;
      const { data: profile } = await supabase
        .from("profiles" as never)
        .select("school_id")
        .eq("id", uid)
        .maybeSingle();
      const schoolId = (profile as { school_id?: string | null } | null)?.school_id;
      if (!schoolId) return;
      const { data: school } = await supabase
        .from("schools" as never)
        .select("name")
        .eq("id", schoolId)
        .maybeSingle();
      setSchoolName((school as { name?: string } | null)?.name ?? null);
    })();
  }, []);

  const progress = useStudentProgress(userId);

  const isMap = path === "/seikkailu";
  const activeScreen = (() => {
    const m = path.match(/\/seikkailu\/(\d+)/);
    return m ? Number(m[1]) : null;
  })();

  function go(target: number) {
    return (e: React.MouseEvent) => {
      if (!canNavigateTo(target)) {
        e.preventDefault();
        toast(hint);
        return;
      }
      e.preventDefault();
      navigate({ to: "/seikkailu/$screen", params: { screen: String(target) } });
    };
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.general")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMap}>
                  <Link to="/seikkailu" className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4" /> <span>{t("sidebar.worldmap")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/student/strengths"}>
                  <Link to="/student/strengths" className="flex items-center gap-2">
                    <Candy className="h-4 w-4" /> <span>{tr("Vahvuuteni")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/student/profile"}>
                  <Link to="/student/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> <span>{tr("Profiili")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.modules")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {WORLDS.map((w) => {
                const inWorld = activeScreen != null && activeScreen >= w.start && activeScreen <= w.end;
                const target = pickResumeTarget(
                  w.start,
                  w.end,
                  inWorld ? activeScreen : currentScreen,
                  progress?.completedScreens,
                );
                const locked = currentScreen != null && target > currentScreen && !canNavigateTo(target);
                const title = tr(w.title);
                const subtitle = tr(w.subtitle);
                const stats = progress?.byWorld[w.id];
                const pct = stats && stats.total > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0;
                return (
                  <SidebarMenuItem key={w.id}>
                    <SidebarMenuButton asChild isActive={inWorld} className="h-auto items-start py-2">
                      <a
                        href={`/seikkailu/${target}`}
                        onClick={go(target)}
                        className="flex items-start gap-2 whitespace-normal"
                        aria-disabled={locked || undefined}
                        title={locked ? hint : `${title} — ${subtitle}`}
                      >
                        <span className="mt-0.5 text-base leading-none" aria-hidden>{w.emoji}</span>
                        <span className="min-w-0 flex-1 space-y-1">
                          <span className="block break-words text-sm font-bold leading-snug">
                            {title}
                            {locked && <Lock className="ml-1 inline h-3 w-3 opacity-60" aria-hidden />}
                          </span>
                          <span className="block break-words text-xs leading-snug opacity-80">
                            {subtitle}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="h-1 flex-1 overflow-hidden rounded-full bg-black/15">
                              <span
                                className="block h-full rounded-full bg-[color:var(--purple)] transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </span>
                            <span className="shrink-0 text-[10px] tabular-nums opacity-70">
                              {pct}%{pct === 100 ? " ✓" : ""}
                            </span>
                          </span>
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {schoolName && (
        <SidebarFooter>
          <div className="truncate px-2 pb-2 text-xs opacity-60" title={schoolName}>
            {schoolName}
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
