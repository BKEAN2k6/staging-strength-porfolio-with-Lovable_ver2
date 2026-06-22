import { Link, useRouterState } from "@tanstack/react-router";
import { Map as MapIcon, Trophy } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
} from "@/components/ui/sidebar";
import { WORLDS } from "@/lib/screens";

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isMap = path === "/seikkailu";
  const currentScreen = (() => {
    const m = path.match(/\/seikkailu\/(\d+)/);
    return m ? Number(m[1]) : null;
  })();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3">
        <div className="font-display text-lg">Vahvuusseikkailu</div>
      </SidebarHeader>
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
          <SidebarGroupLabel>Maailmat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {WORLDS.map((w) => {
                const inWorld = currentScreen != null && currentScreen >= w.start && currentScreen <= w.end;
                return (
                  <SidebarMenuItem key={w.id}>
                    <SidebarMenuButton asChild isActive={inWorld}>
                      <Link to="/seikkailu/$screen" params={{ screen: String(w.start) }} className="flex items-center gap-2">
                        <span className="text-base leading-none" aria-hidden>{w.emoji}</span>
                        <span className="truncate">{w.title} — {w.subtitle}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tulokset</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/seikkailu/$screen" params={{ screen: "73" }} className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> <span>Aarre — Portfolio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}