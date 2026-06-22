import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vahvuusseikkailu" },
      { name: "description", content: "Digitaalinen vahvuusportfolio lukiolaiselle." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        navigate({ to: "/auth", replace: true });
      } else {
        // _authenticated layout will route to /liity-yhteisoon or /seikkailu/$screen
        navigate({ to: "/seikkailu", replace: true });
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-lg opacity-80">Ladataan…</p>
    </div>
  );
}

