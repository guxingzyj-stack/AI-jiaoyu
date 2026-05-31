"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { mapAssets } from "../../lib/mapAssets";
import { readAdventureProgress } from "../../lib/adventureProgress";

type IslandStatus = "home" | "available" | "locked" | "completed";

type Island = {
  id: string;
  name: string;
  subtitle: string;
  x: number; // 百分比坐标（相对地图容器）
  y: number;
  status: IslandStatus;
  href?: string;
  lockedHint?: string;
};

// 坐标是相对占位横图估的，等竖向 world-map.png 到位后再对位微调。
const ISLANDS: Island[] = [
  { id: "nova-home", name: "Nova 之家", subtitle: "出发点", x: 22, y: 77, status: "home" },
  { id: "snow", name: "雪山岛", subtitle: "几何 · 敬请期待", x: 49, y: 18, status: "locked", lockedHint: "雪山岛还在结冰，敬请期待❄️" },
  { id: "forest", name: "森林岛", subtitle: "跳数 · 可探索", x: 21, y: 32, status: "available", href: "/adventure/forest-island" },
  { id: "waterfall", name: "瀑布岛", subtitle: "敬请期待", x: 73, y: 79, status: "locked", lockedHint: "瀑布岛水流还没通，敬请期待💧" },
  {
    id: "new-island",
    name: "发光新岛",
    subtitle: "倍数海 · NEW",
    x: 84,
    y: 31,
    status: "available",
    href: "/adventure/multiples-sea"
  }
];

// 角色从 Nova 之家滑向目标岛时途经的路径点（贴着右侧能量环估的）。
const PATHS: Record<string, { x: number; y: number }[]> = {
  "new-island": [
    { x: 22, y: 77 },
    { x: 52, y: 64 },
    { x: 74, y: 46 },
    { x: 84, y: 31 }
  ],
  forest: [
    { x: 22, y: 77 },
    { x: 18, y: 56 },
    { x: 21, y: 32 }
  ]
};

// 当前可探索（已开放探险）的岛屿 id，用于地图右上角的目标提示。
const EXPLORABLE_ISLAND_IDS = ["new-island", "forest"];

const HOME = ISLANDS.find((i) => i.id === "nova-home")!;

export default function MapPage() {
  const router = useRouter();
  const [heroPos, setHeroPos] = useState({ x: HOME.x, y: HOME.y });
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState(1); // 角色朝向：1 朝右，-1 朝左
  const [idleHop, setIdleHop] = useState(false); // 站立时偶尔蹦一下 / 到达落地
  const [lockedHint, setLockedHint] = useState<{ id: string; text: string } | null>(null);
  const [completedIslands, setCompletedIslands] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // 待机小动作：静止时每隔几秒轻轻蹦一下，让角色"活"着；行走时不打扰。
  useEffect(() => {
    if (walking) return;
    const id = window.setInterval(() => {
      setIdleHop(true);
      const t = window.setTimeout(() => setIdleHop(false), 560);
      timers.current.push(t);
    }, 5200);
    return () => window.clearInterval(id);
  }, [walking]);

  useEffect(() => {
    // 延后到下一帧读取，避免在 effect 中同步 setState 触发级联渲染（与其它页面一致）。
    const timer = window.setTimeout(() => setCompletedIslands(readAdventureProgress().completedIslands), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // 通关后的岛屿在地图上标记为 completed（仍可重新进入）。
  const islands = ISLANDS.map((island) =>
    completedIslands.includes(island.id) ? { ...island, status: "completed" as const } : island
  );

  // 角色动效：行走时摆动，到达/待机时小跳，平时缓慢呼吸浮动。
  const heroAnim = walking
    ? "animate-[wiggle_0.4s_ease-in-out_infinite]"
    : idleHop
      ? "animate-[hop_0.55s_ease-in-out]"
      : "animate-[bob_3.2s_ease-in-out_infinite]";

  const handleIsland = useCallback(
    (island: Island) => {
      if (walking) return;

      if (island.status === "locked") {
        setLockedHint({ id: island.id, text: island.lockedHint ?? "敬请期待" });
        const t = window.setTimeout(() => setLockedHint(null), 2200);
        timers.current.push(t);
        return;
      }

      if ((island.status === "available" || island.status === "completed") && island.href) {
        const path = PATHS[island.id] ?? [
          { x: HOME.x, y: HOME.y },
          { x: island.x, y: island.y }
        ];
        setWalking(true);
        setIdleHop(false);
        // 依次走到每个路径点，CSS transition 负责平滑；同时按移动方向翻转朝向。
        path.forEach((point, idx) => {
          const prev = path[idx - 1] ?? point;
          const t = window.setTimeout(() => {
            setHeroPos(point);
            if (point.x !== prev.x) setFacing(point.x > prev.x ? 1 : -1);
          }, idx * 700);
          timers.current.push(t);
        });
        // 到达终点时落地小跳一下，再进入关卡。
        const land = window.setTimeout(() => setIdleHop(true), (path.length - 1) * 700 + 120);
        timers.current.push(land);
        const arrive = window.setTimeout(() => {
          router.push(island.href!);
        }, path.length * 700 + 400);
        timers.current.push(arrive);
      }
    },
    [router, walking]
  );

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#070b2c] text-white">
      {/* 地图背景：竖屏铺满 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(7,11,44,0.18), rgba(7,11,44,0.5)), url(${mapAssets.worldMap})`
        }}
      />

      {/* 岛屿热点层 */}
      <div className="absolute inset-0">
        {islands.map((island) => (
          <IslandNode
            key={island.id}
            island={island}
            showHint={lockedHint?.id === island.id}
            hintText={lockedHint?.text}
            onClick={() => handleIsland(island)}
          />
        ))}

        {/* 角色精灵：按脚底对齐坐标，坐标点即站立点 */}
        <div
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full transition-all duration-700 ease-in-out"
          style={{ left: `${heroPos.x}%`, top: `${heroPos.y}%` }}
        >
          {/* 外层负责朝向翻转，内层负责动效，避免 transform 互相覆盖。 */}
          <span className="block transition-transform duration-300" style={{ transform: `scaleX(${facing})` }}>
            {mapAssets.heroIdle ? (
              <img
                alt="你的角色"
                src={walking && mapAssets.heroWalk ? mapAssets.heroWalk : mapAssets.heroIdle}
                className={`h-20 w-20 object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.55)] ${heroAnim}`}
              />
            ) : (
              <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-200/70 bg-amber-300/30 text-xs font-black text-amber-100 shadow-[0_0_20px_rgba(252,211,77,0.5)] backdrop-blur-sm ${heroAnim}`}>
                你
              </div>
            )}
          </span>
        </div>
      </div>

      {/* 四角 HUD */}
      {/* 左上：返回 + 标题 */}
      <div className="absolute left-3 top-3 z-40 flex items-center gap-2">
        <Link
          href="/adventure"
          className="flex h-10 items-center rounded-full border border-cyan-200/30 bg-blue-950/60 px-4 text-sm font-black text-cyan-100 backdrop-blur-md active:scale-95"
        >
          ← 返回
        </Link>
        <div className="rounded-full border border-cyan-200/25 bg-blue-950/55 px-4 py-2 backdrop-blur-md">
          <p className="text-[10px] font-black tracking-[0.18em] text-cyan-200">数学星球</p>
        </div>
      </div>

      {/* 右上：星星 + 当前目标 */}
      {(() => {
        const doneCount = EXPLORABLE_ISLAND_IDS.filter((id) => completedIslands.includes(id)).length;
        const allDone = doneCount === EXPLORABLE_ISLAND_IDS.length;
        const goalText = allDone
          ? "已开放岛屿都点亮了！⭐"
          : doneCount > 0
            ? "去点亮下一座岛屿"
            : "点亮发光的新岛屿";
        const starCount = completedIslands.length;
        return (
          <div className="absolute right-3 top-3 z-40 flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 rounded-full border border-amber-200/30 bg-blue-950/55 px-3 py-2 backdrop-blur-md">
              <span className="text-sm">{starCount > 0 ? "⭐".repeat(Math.min(starCount, 3)) : "☆☆☆"}</span>
            </div>
            <div className="max-w-[60vw] rounded-2xl border border-cyan-200/25 bg-blue-950/65 px-4 py-3 text-right backdrop-blur-md">
              <p className="text-[10px] font-black tracking-[0.14em] text-cyan-200">当前目标</p>
              <p className="mt-0.5 text-sm font-black text-white">{goalText}</p>
            </div>
          </div>
        );
      })()}

      {/* 右下：问 Nova（辅助提示，降级后的入口） */}
      <button
        type="button"
        className="absolute bottom-4 right-3 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-violet-200/35 bg-violet-500/30 text-lg font-black text-violet-50 backdrop-blur-md active:scale-95"
        aria-label="问 Nova"
      >
        ?
      </button>

      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes hop {
          0%, 100% { transform: translateY(0); }
          35% { transform: translateY(-16px); }
          60% { transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[wiggle_0\\.4s_ease-in-out_infinite\\],
          .animate-\\[bob_3\\.2s_ease-in-out_infinite\\],
          .animate-\\[hop_0\\.55s_ease-in-out\\] { animation: none; }
        }
      `}</style>
    </main>
  );
}

function IslandNode({
  island,
  showHint,
  hintText,
  onClick
}: {
  island: Island;
  showHint: boolean;
  hintText?: string;
  onClick: () => void;
}) {
  const isLocked = island.status === "locked";
  const isAvailable = island.status === "available";
  const isCompleted = island.status === "completed";
  const isHome = island.status === "home";

  return (
    <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${island.x}%`, top: `${island.y}%` }}>
      <button
        type="button"
        onClick={onClick}
        data-testid={`island-${island.id}`}
        className={`relative flex flex-col items-center gap-1 transition active:scale-95 ${isLocked ? "opacity-70" : ""}`}
      >
        {isAvailable && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full border border-amber-200/50 bg-blue-950/70 px-2 py-0.5 text-[10px] font-black text-amber-100 shadow-[0_0_18px_rgba(252,211,77,0.4)]">
            NEW
          </span>
        )}
        {isCompleted && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full border border-emerald-200/60 bg-blue-950/70 px-2 py-0.5 text-[10px] font-black text-emerald-100 shadow-[0_0_18px_rgba(52,211,153,0.45)]">
            已通关
          </span>
        )}
        {/* 起点由角色精灵代表，不画图标圆，避免与机器人重叠 */}
        {!isHome && (
          <span
            className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-2xl backdrop-blur-sm ${
              isCompleted
                ? "border-emerald-200/60 bg-emerald-300/20 shadow-[0_0_30px_rgba(52,211,153,0.45)]"
                : isAvailable
                  ? "border-amber-200/60 bg-amber-300/20 shadow-[0_0_30px_rgba(252,211,77,0.45)] animate-pulse"
                  : "border-slate-300/30 bg-slate-800/50 grayscale"
            }`}
          >
            {isCompleted ? "✅" : isLocked ? "🔒" : "✨"}
          </span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-black backdrop-blur-sm ${
            isHome ? "translate-y-[44px] bg-cyan-300/20 text-cyan-50" : isCompleted ? "bg-emerald-300/25 text-emerald-50" : isAvailable ? "bg-amber-300/25 text-amber-50" : "bg-slate-800/60 text-slate-300"
          }`}
        >
          {island.name}
        </span>
      </button>

      {showHint && (
        <div className="absolute -top-12 left-1/2 z-50 w-max max-w-[180px] -translate-x-1/2 rounded-2xl border border-slate-300/30 bg-slate-900/90 px-3 py-2 text-center text-xs font-black text-slate-100 shadow-xl backdrop-blur-md">
          {hintText}
        </div>
      )}
    </div>
  );
}
