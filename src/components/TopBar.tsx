import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

export function TopBar({ subtitle }: { subtitle?: string }) {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("Opiskelija");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: prof } = await supabase
        .from("profiles" as never)
        .select("display_name")
        .eq("id", u.user.id)
        .maybeSingle();
      const p = prof as { display_name?: string | null } | null;
      const fallback = u.user.email ? u.user.email.split("@")[0] : null;
      setName((p?.display_name && p.display_name.trim()) || fallback || "Opiskelija");
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-[color:var(--purple-dark)]/70 px-3 backdrop-blur">
      <SidebarTrigger className="text-foreground" />
      <div className="font-display text-lg leading-none">Vahvuusseikkailu</div>
      {subtitle && <div className="hidden md:block text-sm opacity-80 truncate">— {subtitle}</div>}
      <div className="ml-auto flex items-center gap-2">
        <span
          className="font-display text-base sm:text-lg leading-none truncate max-w-[40vw]"
          title={name}
        >
          {name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          aria-label="Kirjaudu ulos"
          title="Kirjaudu ulos"
          className="text-foreground hover:bg-white/10 rounded-full"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
