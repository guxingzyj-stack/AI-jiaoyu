"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Shield, Sparkles, Swords, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultProgress, readProgress, type LearningProgress } from "../lib/learningProgress";
import { calculateSkillCards } from "../lib/skillEngine";

type NavTab = {
  label: string;
  icon: LucideIcon;
  href: string;
  testId: string;
};

// 常驻底部 Tab 栏：在大厅与四个功能页之间快速切换，按当前路由高亮。
const TABS: NavTab[] = [
  { label: "挑战", icon: Swords, href: "/challenge", testId: "nav-challenge" },
  { label: "怪兽", icon: Shield, href: "/monsters", testId: "nav-monsters" },
  { label: "技能", icon: Sparkles, href: "/skills", testId: "nav-skills" },
  { label: "报告", icon: BarChart3, href: "/report", testId: "nav-report" }
];

export default function BottomNav() {
  const pathname = usePathname();
  const [progress, setProgress] = useState<LearningProgress>(defaultProgress);

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(readProgress()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const activeMonsterCount = progress.monsters.filter((monster) => monster.status === "active").length;
  const hasSkillUpgrade = calculateSkillCards(progress).some((skill) => skill.level >= 2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 w-screen max-w-full overflow-hidden border-t border-white/10 bg-[#090d22]/90 px-3 py-2 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-[calc(100vw-24px)] grid-cols-4 gap-1.5 sm:max-w-md sm:gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          // 当前页（或其子路径）对应的 Tab 高亮；在大厅等非 Tab 页时四个都不高亮。
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const className = `relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold ${
            active ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`;

          return (
            <Link className={className} data-testid={tab.testId} href={tab.href} key={tab.label}>
              <Icon size={20} />
              {tab.label}
              {tab.href === "/monsters" && activeMonsterCount > 0 && (
                <span className="absolute right-2 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[11px] font-black text-slate-950">
                  {activeMonsterCount}
                </span>
              )}
              {tab.href === "/skills" && hasSkillUpgrade && (
                <span className="absolute right-1 top-1 rounded-full bg-emerald-300 px-1.5 py-0.5 text-[10px] font-black text-slate-950">
                  升级
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
