import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CornerBlobs } from "@/components/CornerBlobs";
import { StickyNote } from "@/components/StickyNote";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    idle: s.idle === "1" ? "1" : undefined,
  }),
  component: AuthLanding,
});

function AuthLanding() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/seikkailu", replace: true });
    });
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center px-4 py-10">
      <CornerBlobs />
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Vahvuusseikkailu</h1>
          <p className="mt-2 opacity-90">Huomaa hyvä! — vahvuusportfolio lukiolaiselle</p>
        </div>

        {search.idle && (
          <StickyNote tone="yellow" seed="idle" className="text-sm">
            Istunto vanheni — kirjaudu sisään uudelleen.
          </StickyNote>
        )}

        <StickyNote seed="landing-card" className="space-y-3 text-center">
          <p className="text-base text-ink">Tervetuloa! Aloita seikkailusi.</p>
          <Link
            to="/auth/login"
            className="block w-full rounded-full bg-[color:var(--purple)] hover:bg-[color:var(--purple-dark)] text-white font-bold py-4 text-base"
          >
            Kirjaudu sisään
          </Link>
          <Link
            to="/auth/student"
            className="block w-full rounded-full bg-[color:var(--coral)] hover:bg-[color:var(--coral)]/90 text-white font-bold py-4 text-base"
          >
            Luo tunnus
          </Link>
        </StickyNote>
      </div>
    </div>
  );
}
