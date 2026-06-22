import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Map as MapIcon, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { WORLDS } from "@/lib/screens";
import { useNavGate, COMPLETION_HINT } from "@/lib/screen-completion";

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { canNavigateTo, currentScreen } = useNavGate();

  const isMap = path === "/seikkailu";
  const activeScreen = (() => {
    const m = path.match(/\/seikkailu\/(\d+)/);
    return m ? Number(m[1]) : null;
  })();

  function go(target: number) {
    return (e: React.MouseEvent) => {
      if (!canNavigateTo(target)) {
        e.preventDefault();
        toast(COMPLETION_HINT);
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
          <SidebarGroupLabel>Yleiset</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMap}>
                  <Link to="/seikkailu" className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4" /> <span>Maailmankartta</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Moduulit</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {WORLDS.map((w) => {
                const inWorld = activeScreen != null && activeScreen >= w.start && activeScreen <= w.end;
                const target = activeScreen != null && inWorld ? activeScreen : w.start;
                const locked = currentScreen != null && target > currentScreen && !canNavigateTo(target);
                return (
                  <SidebarMenuItem key={w.id}>
                    <SidebarMenuButton asChild isActive={inWorld}>
                      <a
                        href={`/seikkailu/${target}`}
                        onClick={go(target)}
                        className="flex items-center gap-2"
                        aria-disabled={locked || undefined}
                        title={locked ? COMPLETION_HINT : `${w.title} — ${w.subtitle}`}
                      >
                        <span className="text-base leading-none" aria-hidden>{w.emoji}</span>
                        <span className="truncate flex-1">{w.title} — {w.subtitle}</span>
                        {locked && <Lock className="h-3 w-3 opacity-60" aria-hidden />}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
