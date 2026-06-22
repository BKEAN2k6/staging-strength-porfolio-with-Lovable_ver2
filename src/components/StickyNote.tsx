import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function seedRotation(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ((h % 400) / 100) - 2; // -2..+2 deg
}

export function StickyNote({
  children,
  seed = "",
  className,
  tone = "white",
}: {
  children: ReactNode;
  seed?: string;
  className?: string;
  tone?: "white" | "yellow" | "mint" | "coral";
}) {
  const rot = seedRotation(seed);
  const bg =
    tone === "yellow" ? "bg-[color:var(--yellow)]"
    : tone === "mint" ? "bg-[color:var(--mint)]"
    : tone === "coral" ? "bg-[color:var(--coral)] text-white"
    : "bg-card text-card-foreground";
  return (
    <div
      className={cn("sticky-note", bg, className)}
      style={{ transform: `rotate(${rot}deg)` }}
    >
      {children}
    </div>
  );
}