import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    idle: s.idle === "1" ? "1" : undefined,
  }),
  component: () => <Outlet />,
});
