import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { CornerBlobs } from "@/components/CornerBlobs";
import { getCurrentRole, getStudentClassMembership } from "@/lib/auth-helpers";

export const Route = createFileRoute("/_authenticated/seikkailu")({
  component: SeikkailuLayout,
});

function SeikkailuLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const role = await getCurrentRole();
      if (role === "teacher") {
        navigate({ to: "/opettaja", replace: true });
        return;
      }
      const m = await getStudentClassMembership();
      if (!m) {
        navigate({ to: "/liity-yhteisoon", replace: true });
        return;
      }
      setReady(true);
    })();
  }, [navigate]);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-foreground">Ladataan…</div>;
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background text-foreground">
        <CornerBlobs />
        <AppSidebar />
        <div className="relative z-10 flex min-h-screen flex-1 flex-col">
          <TopBar />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}