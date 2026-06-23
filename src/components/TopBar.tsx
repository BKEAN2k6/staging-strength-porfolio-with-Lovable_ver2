import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Pencil } from "lucide-react";
import { toast } from "sonner";

export function TopBar({ subtitle }: { subtitle?: string }) {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("Opiskelija");
  const [missing, setMissing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUserId(u.user.id);
      const { data: prof } = await supabase
        .from("profiles" as never)
        .select("display_name")
        .eq("id", u.user.id)
        .maybeSingle();
      const p = prof as { display_name?: string | null } | null;
      const trimmed = p?.display_name?.trim();
      if (trimmed) {
        setName(trimmed);
        setMissing(false);
      } else {
        setName("Lisää nimesi");
        setMissing(true);
      }
    })();
  }, []);

  async function editName() {
    if (!userId) return;
    const current = missing ? "" : name;
    const next = window.prompt("Kirjoita nimesi (näkyy opettajalle):", current);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) {
      toast.error("Nimi ei voi olla tyhjä.");
      return;
    }
    const { error } = await supabase
      .from("profiles" as never)
      .update({ display_name: trimmed } as never)
      .eq("id", userId as never);
    if (error) {
      toast.error("Tallennus epäonnistui.");
      return;
    }
    setName(trimmed);
    setMissing(false);
    toast.success("Nimi tallennettu.");
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
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={editName}
          title={missing ? "Lisää nimesi" : "Muokkaa nimeä"}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-base sm:text-lg leading-none truncate max-w-[40vw] transition-colors ${
            missing
              ? "bg-[color:var(--coral)] text-white hover:bg-[color:var(--coral)]/90 animate-pulse"
              : "text-foreground hover:bg-white/10"
          }`}
        >
          <span className="truncate">{name}</span>
          <Pencil className="h-3.5 w-3.5 opacity-80" />
        </button>
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
