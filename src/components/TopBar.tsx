import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MUTE_KEY = "vs.mute";

export function TopBar({ subtitle }: { subtitle?: string }) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMuted(localStorage.getItem(MUTE_KEY) === "1");
  }, []);
  function toggleMute() {
    const next = !muted;
    setMuted(next);
    localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-[color:var(--purple-dark)]/70 px-3 backdrop-blur">
      <SidebarTrigger className="text-foreground" />
      <div className="font-display text-lg leading-none">Vahvuusseikkailu</div>
      {subtitle && <div className="hidden md:block text-sm opacity-80 truncate">— {subtitle}</div>}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleMute} aria-label={muted ? "Avaa ääni" : "Vaimenna ääni"}
          className="text-foreground hover:bg-white/10 rounded-full">
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" onClick={signOut} className="text-foreground hover:bg-white/10 rounded-full">
          Kirjaudu ulos
        </Button>
      </div>
    </header>
  );
}