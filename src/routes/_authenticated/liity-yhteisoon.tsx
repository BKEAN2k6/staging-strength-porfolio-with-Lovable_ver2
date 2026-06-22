import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CornerBlobs } from "@/components/CornerBlobs";
import { StickyNote } from "@/components/StickyNote";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/liity-yhteisoon")({
  component: JoinCommunityPage,
});

function JoinCommunityPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("join_class" as never, { p_join_code: code } as never);
      if (error) throw error;
      const result = data as { ok: boolean; error?: string; class_name?: string };
      if (!result?.ok) {
        toast.error("Koodia ei löytynyt. Tarkista koodi opettajaltasi.");
        return;
      }
      toast.success(`Olet liittynyt luokkaan: ${result.class_name}`);
      navigate({ to: "/seikkailu", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Liittyminen epäonnistui.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center px-4 py-10">
      <CornerBlobs />
      <button onClick={signOut} className="absolute top-4 right-4 z-20 text-sm opacity-80 hover:opacity-100 underline">
        Kirjaudu ulos
      </button>
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Liity yhteisöön</h1>
          <p className="mt-2 opacity-90">Syötä opettajaltasi saamasi koodi.</p>
        </div>
        <StickyNote seed="join-card">
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">Luokan koodi</Label>
              <Input
                id="code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="esim. 9A-VAHVUUS-25"
                className="uppercase tracking-wider"
                autoComplete="off"
              />
            </div>
            <Button type="submit" disabled={busy || !code.trim()}
              className="w-full rounded-full bg-[color:var(--coral)] hover:bg-[color:var(--coral)]/90 text-white font-bold py-6 text-base">
              {busy ? "Liitytään…" : "Liity luokkaan"}
            </Button>
          </form>
          <p className="mt-5 text-xs text-muted-foreground">
            Et voi aloittaa seikkailua ennen kuin olet liittynyt opettajasi luokkaan.
          </p>
        </StickyNote>
      </div>
    </div>
  );
}