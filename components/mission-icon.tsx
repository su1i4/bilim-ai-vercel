import {
  Brain, Coins, Gamepad2, Image as ImageIcon, Leaf, Lock, Route, ScanLine, Share2, Sparkles, Trophy, Zap,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/lib/types";
import { cn } from "./ui";

const MAP: Record<IconKey, LucideIcon> = {
  brain: Brain, gamepad: Gamepad2, image: ImageIcon, lock: Lock, share: Share2, sparkles: Sparkles,
  coins: Coins, route: Route, zap: Zap, leaf: Leaf, trophy: Trophy, scan: ScanLine,
};

export function MissionIcon({ name, className }: { name: IconKey; className?: string }) {
  const Icon = MAP[name];
  return (
    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600", className)}>
      <Icon size={17} />
    </span>
  );
}
