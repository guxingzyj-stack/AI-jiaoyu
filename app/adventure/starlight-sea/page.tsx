"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FRAGMENT_SOURCES,
  SEA_COPY,
  SEA_EDGES,
  SEA_LOCATIONS,
  TOTAL_ROUTES,
  getSeaNovaHint,
  type SeaLocation,
  type SeaLocationId
} from "../../../lib/starlightSeaContentSource";

type LocationStatus = "locked" | "available" | "completed";

const byId = (id: SeaLocationId): SeaLocation => SEA_LOCATIONS.find((l) => l.id === id) as SeaLocation;

export default function StarlightSeaPage() {
  const [currentLocation, setCurrentLocation] = useState<SeaLocationId>("starlight-dock");
  const [boatAt, setBoatAt] = useState<SeaLocationId>("starlight-dock");
  const [completed, setCompleted] = useState<SeaLocationId[]>([]);
  const [message, setMessage] = useState<string>(SEA_COPY.intro);
  const [moving, setMoving] = useState(false);
  const [hopCount, setHopCount] = useState(0); // 跳岛动画：已点亮的浮岛数
  const [hopRunning, setHopRunning] = useState(false);
  const [rhythm, setRhythm] = useState<number | null>(null); // 海星灯塔选的节奏
  const [landingPick, setLandingPick] = useState<number | null>(null); // 漩涡门点的浮岛

  const routesLit = completed.filter((id) => FRAGMENT_SOURCES.includes(id)).length;
  const fragments = routesLit;
  const seaCoreDone = completed.includes("sea-core");
  const busy = moving || hopRunning;

  const statusOf = (id: SeaLocationId): LocationStatus => {
    if (completed.includes(id)) return "completed";
    switch (id) {
      case "starlight-dock":
        return "available";
      case "two-step-bay":
        return completed.includes("starlight-dock") ? "available" : "locked";
      case "three-step-route":
        return completed.includes("two-step-bay") ? "available" : "locked";
      case "starfish-lighthouse":
        return completed.includes("three-step-route") ? "available" : "locked";
      case "whirlpool-gate":
        return completed.includes("starfish-lighthouse") ? "available" : "locked";
      case "sea-core":
        return fragments >= TOTAL_ROUTES && completed.includes("whirlpool-gate") ? "available" : "locked";
      default:
        return "locked";
    }
  };

  const boatPos = byId(boatAt).pos;
  const brightOpacity = seaCoreDone ? 1 : Math.min(1, routesLit / TOTAL_ROUTES);

  const novaLine = useMemo(() => getSeaNovaHint({ location: currentLocation, routesLit }), [currentLocation, routesLit]);

  const resetMechState = () => {
    setHopCount(0);
    setHopRunning(false);
    setRhythm(null);
    setLandingPick(null);
  };

  const goTo = (id: SeaLocationId) => {
    if (busy) return;
    const st = statusOf(id);
    if (st === "locked") {
      setMessage(byId(id).unlockRequirement ?? "这条航线还没打开，先看看别处。");
      return;
    }
    if (id === currentLocation) return;
    setMoving(true);
    resetMechState();
    setBoatAt(id);
    window.setTimeout(() => {
      setCurrentLocation(id);
      setMoving(false);
      setMessage(byId(id).blurb);
    }, 650);
  };

  const complete = (id: SeaLocationId, msg: string) => {
    setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setMessage(msg);
  };

  // 星光码头：扬帆出发
  const launch = () => complete("starlight-dock", "扬帆出发！沿着浮岛去修复星光航线吧。");

  // 跳岛航线：小船按节奏一格格点亮浮岛
  const runHop = (loc: SeaLocation) => {
    if (busy || !loc.routeData) return;
    const lit = loc.routeData.litIslands;
    setHopRunning(true);
    setHopCount(0);
    lit.forEach((_, i) => window.setTimeout(() => setHopCount(i + 1), (i + 1) * 450));
    window.setTimeout(() => {
      setHopRunning(false);
      complete(loc.id, SEA_COPY.hopSummary[loc.id] ?? loc.successEffect ?? "航线点亮了！");
    }, lit.length * 450 + 350);
  };

  // 海星灯塔：选节奏
  const chooseRhythm = (loc: SeaLocation, r: number) => {
    if (!loc.rhythmData) return;
    setRhythm(r);
    if (r === loc.rhythmData.answer) {
      complete(loc.id, SEA_COPY.rhythmOk);
    } else {
      setMessage(SEA_COPY.rhythmWrong);
    }
  };

  // 漩涡门：找共同落点
  const pickLanding = (loc: SeaLocation, n: number) => {
    if (!loc.landingData) return;
    setLandingPick(n);
    if (n === loc.landingData.answer) {
      complete(loc.id, SEA_COPY.landingOk);
    } else {
      setMessage(SEA_COPY.landingWrong);
    }
  };

  // 灯塔核心：放回碎片
  const restoreCore = () => {
    if (fragments < TOTAL_ROUTES || !completed.includes("whirlpool-gate")) {
      setMessage(SEA_COPY.coreNotReady);
      return;
    }
    complete("sea-core", SEA_COPY.coreComplete);
  };

  const restart = () => {
    setCompleted([]);
    setCurrentLocation("starlight-dock");
    setBoatAt("starlight-dock");
    setMessage(SEA_COPY.intro);
    setMoving(false);
    resetMechState();
  };

  const askNova = () => setMessage(novaLine);

  const current = byId(currentLocation);
  const currentDone = completed.includes(currentLocation);

  const seaBg = "radial-gradient(circle at 28% 18%, rgba(56,189,248,0.28), transparent 46%), linear-gradient(160deg, #0a1b3a 0%, #0d2a4a 52%, #06203c 100%)";
  const seaGlow = "radial-gradient(circle at 72% 30%, rgba(252,211,77,0.30), transparent 42%), radial-gradient(circle at 40% 78%, rgba(34,211,238,0.30), transparent 44%)";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#06122c] bg-[radial-gradient(circle_at_top,#13315f,#0a1c3f_55%,#06122c)] px-3 py-3 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-3">
        {/* 顶部 HUD */}
        <header className="rounded-[22px] border border-cyan-300/25 bg-[#0d1f47]/85 p-3 shadow-[0_0_24px_rgba(71,150,255,0.22)]">
          <div className="flex items-center justify-between gap-2">
            <Link className="inline-flex min-h-9 items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 text-xs font-black text-cyan-50 active:scale-95" href="/adventure">
              ← 返回
            </Link>
            <div className="text-center">
              <h1 className="text-sm font-black tracking-wide text-white">{SEA_COPY.chapter}</h1>
              <p className="text-[10px] font-bold text-cyan-200/80">{SEA_COPY.subtitle}</p>
            </div>
            <span className="w-12" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <HudPill glyph="🌟" label="星潮碎片" value={`${fragments}/${TOTAL_ROUTES}`} tone="amber" />
            <HudPill glyph="🧭" label="已点亮航线" value={`${routesLit}/${TOTAL_ROUTES}`} tone="cyan" />
            <HudPill glyph="🗼" label="海星灯塔" value={seaCoreDone ? "已点亮" : "未点亮"} tone="emerald" />
          </div>
          <p className="mt-2 text-center text-[11px] font-bold leading-4 text-cyan-200/90">目标：{SEA_COPY.goal}</p>
        </header>

        {/* 小地图（星光海） */}
        <section className="relative w-full overflow-hidden rounded-[24px] border border-cyan-300/25 shadow-[0_0_30px_rgba(71,150,255,0.25)]" style={{ aspectRatio: "1 / 1" }}>
          <div className="absolute inset-0" style={{ backgroundImage: seaBg }} />
          <div className="absolute inset-0 transition-opacity duration-700" style={{ backgroundImage: seaGlow, opacity: brightOpacity }} />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {SEA_EDGES.map(([a, b]) => {
              const pa = byId(a).pos;
              const pb = byId(b).pos;
              return <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="rgba(190,242,255,0.35)" strokeWidth={0.8} strokeDasharray="2 2" />;
            })}
          </svg>

          {SEA_LOCATIONS.map((loc) => {
            const st = statusOf(loc.id);
            const done = st === "completed";
            const isCurrent = loc.id === currentLocation;
            const ring =
              st === "locked"
                ? "border-slate-400/40 bg-slate-800/70 opacity-70"
                : done
                  ? "border-amber-300/80 bg-amber-400/15 shadow-[0_0_16px_rgba(252,211,77,0.6)]"
                  : "border-cyan-200/80 bg-cyan-300/15 shadow-[0_0_16px_rgba(34,211,238,0.6)]";
            return (
              <button
                key={loc.id}
                aria-label={loc.name}
                data-testid={`node-${loc.id}`}
                className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-2xl backdrop-blur-[1px] transition active:scale-95 ${ring} ${isCurrent ? "ring-2 ring-white/70" : ""}`}
                style={{ left: `${loc.pos.x}%`, top: `${loc.pos.y}%` }}
                onClick={() => goTo(loc.id)}
                type="button"
              >
                <span className={st === "locked" ? "opacity-50 grayscale" : ""}>{loc.icon}</span>
                {st === "locked" && <span className="absolute -right-1 -top-1 text-xs">🔒</span>}
                {done && <span className="absolute -right-1 -top-1 text-xs">✅</span>}
                <span className="pointer-events-none absolute -bottom-4 whitespace-nowrap rounded-full bg-[#06122c]/85 px-1.5 text-[9px] font-black text-cyan-50">{loc.short}</span>
              </button>
            );
          })}

          {/* 小船（点击地点后滑过去） */}
          <span
            className="pointer-events-none absolute z-10 -translate-x-1/2 text-2xl drop-shadow-[0_0_10px_rgba(103,232,249,0.7)]"
            style={{ left: `${boatPos.x}%`, top: `calc(${boatPos.y}% - 26px)`, transition: "left 0.6s ease, top 0.6s ease" }}
          >
            ⛵
          </span>
        </section>

        {/* 底部：地点信息 + Nova + 操作 */}
        <section className="rounded-[24px] border border-cyan-300/25 bg-[#0d1f47]/85 p-3 shadow-[0_0_24px_rgba(71,150,255,0.22)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black text-white">{current.name}</h2>
            <span className="rounded-full border border-cyan-300/30 bg-[#06122c]/55 px-2 py-0.5 text-[10px] font-black text-cyan-100">
              {busy ? "航行中…" : currentDone ? "已点亮" : "可探索"}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold leading-5 text-cyan-100/90">{current.blurb}</p>

          <div className="mt-2 flex items-start gap-2 rounded-[16px] border border-violet-300/25 bg-[#06122c]/55 p-2">
            <span className="text-lg leading-none" aria-label="Nova">🤖</span>
            <p className="text-xs font-bold leading-5 text-cyan-50">{message}</p>
          </div>

          <div className="mt-3">{renderAction()}</div>

          <button className="mt-3 w-full rounded-full border border-violet-300/30 bg-violet-500/20 py-2 text-xs font-black text-violet-50 active:scale-95" onClick={askNova} type="button">
            ？问 Nova
          </button>
        </section>

        <button className="mx-auto rounded-full border border-cyan-300/25 bg-[#06122c]/45 px-4 py-1.5 text-[11px] font-black text-cyan-200 active:scale-95" onClick={restart} type="button">
          重新开始
        </button>
      </div>

      {/* 灯塔核心完成：第二章高潮 + 下一章预告 */}
      {seaCoreDone && (
        <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#06122c]/85 p-4 backdrop-blur-sm">
          <div className="relative my-auto w-full max-w-sm overflow-hidden rounded-[28px] border border-amber-200/40 bg-[#0d1f47]/95 p-5 text-center shadow-[0_0_40px_rgba(252,211,77,0.35)]">
            <div className="absolute inset-0" style={{ backgroundImage: seaGlow, opacity: 0.5 }} />
            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-200/50 bg-amber-300/15 text-5xl shadow-[0_0_24px_rgba(252,211,77,0.5)]">🗼</div>
              <h2 className="mt-3 text-xl font-black text-amber-100">第二章完成！</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50">{SEA_COPY.coreComplete}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-black text-cyan-100">
                <span className="rounded-[12px] border border-cyan-200/25 bg-[#06122c]/55 py-1.5">星潮碎片 3/3</span>
                <span className="rounded-[12px] border border-cyan-200/25 bg-[#06122c]/55 py-1.5">航线 3/3</span>
                <span className="rounded-[12px] border border-cyan-200/25 bg-[#06122c]/55 py-1.5">灯塔已点亮</span>
              </div>
              <div className="mt-4 rounded-[18px] border border-cyan-300/30 bg-[#06122c]/55 p-3 text-left">
                <p className="text-[11px] font-bold leading-5 text-cyan-100">{SEA_COPY.nextPreviewLine}</p>
                <p className="mt-2 inline-flex rounded-full border border-cyan-200/40 bg-cyan-300/10 px-3 py-1 text-[11px] font-black text-cyan-50">{SEA_COPY.nextPreviewChapter}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="rounded-full bg-gradient-to-r from-amber-300 to-amber-400 py-2 text-xs font-black text-slate-950 active:scale-95" onClick={restart} type="button">再玩一次</button>
                <Link className="inline-flex items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-300/20 py-2 text-xs font-black text-cyan-50 active:scale-95" href="/adventure">回到入口</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  function renderAction() {
    if (moving) return <p className="text-xs font-bold text-cyan-200/80">小船正在航行…</p>;

    switch (current.mechanism) {
      case "chapter-intro":
        if (currentDone) return <DonePill>已经扬帆出发，去点亮星光航线吧。</DonePill>;
        return <ActionButton dataTestId="action-launch" onClick={launch}>扬帆出发</ActionButton>;

      case "hop-route": {
        const rd = current.routeData!;
        const litSoFar = rd.litIslands.slice(0, hopCount);
        const boatIsland = litSoFar.length ? litSoFar[litSoFar.length - 1] : 0;
        return (
          <div className="grid gap-3">
            <IslandRow
              max={rd.maxIsland}
              variant={(n) => (litSoFar.includes(n) ? "lit" : "off")}
              boatIsland={boatIsland}
            />
            {currentDone ? (
              <DonePill>{SEA_COPY.hopSummary[current.id] ?? "航线点亮了！"}</DonePill>
            ) : (
              <ActionButton dataTestId="action-hop" disabled={hopRunning} onClick={() => runHop(current)}>
                {`按 ${rd.step} 拍跳岛`}
              </ActionButton>
            )}
          </div>
        );
      }

      case "choose-rhythm": {
        const rh = current.rhythmData!;
        const lit = rhythm ? rh.routes[rhythm] ?? [] : [];
        return (
          <div className="grid gap-3">
            <p className="text-[11px] font-black text-cyan-200">海星灯塔喜欢 4 拍节奏，选一个节奏让小船试航线：</p>
            <div className="grid grid-cols-3 gap-2">
              {rh.options.map((opt) => (
                <button
                  key={opt}
                  data-testid={`rhythm-${opt}`}
                  className={`flex h-12 items-center justify-center rounded-[16px] border text-sm font-black active:scale-95 ${rhythm === opt ? "border-amber-200/80 bg-amber-300/25 text-amber-50" : "border-cyan-200/45 bg-cyan-300/12 text-cyan-50"}`}
                  disabled={currentDone}
                  onClick={() => chooseRhythm(current, opt)}
                  type="button"
                >
                  {opt} 拍
                </button>
              ))}
            </div>
            {rhythm !== null && <IslandRow max={rh.maxIsland} variant={(n) => (lit.includes(n) ? (rhythm === rh.answer ? "lit" : "blue") : "off")} />}
            {currentDone && <DonePill>{SEA_COPY.rhythmOk}</DonePill>}
          </div>
        );
      }

      case "common-landing": {
        const ld = current.landingData!;
        return (
          <div className="grid gap-3">
            <p className="text-[11px] font-black text-cyan-200">蓝船每次跳 2 格、金船每次跳 3 格。点出它们第一个共同落点：</p>
            <IslandRow
              max={ld.maxIsland}
              clickable={!currentDone}
              onPick={(n) => pickLanding(current, n)}
              picked={landingPick}
              variant={(n) => {
                const inA = ld.litA.includes(n);
                const inB = ld.litB.includes(n);
                if (inA && inB) return "both";
                if (inA) return "blue";
                if (inB) return "gold";
                return "off";
              }}
            />
            <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold">
              <Legend color="bg-cyan-400/70" label="蓝船(2)" />
              <Legend color="bg-amber-400/80" label="金船(3)" />
              <Legend color="bg-fuchsia-400/80" label="都亮过" />
            </div>
            {currentDone && <DonePill>{SEA_COPY.landingOk}</DonePill>}
          </div>
        );
      }

      case "restore-lighthouse":
        return (
          <ActionButton dataTestId="action-restore-core" disabled={fragments < TOTAL_ROUTES || !completed.includes("whirlpool-gate")} onClick={restoreCore}>
            放入星潮碎片，点亮海星灯塔
          </ActionButton>
        );

      default:
        return <p className="text-xs font-bold leading-5 text-cyan-100/80">点地图上的地点去探索。</p>;
    }
  }
}

type IslandVariant = "off" | "lit" | "blue" | "gold" | "both";

function IslandRow({
  boatIsland,
  clickable,
  max,
  onPick,
  picked,
  variant
}: {
  boatIsland?: number;
  clickable?: boolean;
  max: number;
  onPick?: (n: number) => void;
  picked?: number | null;
  variant: (n: number) => IslandVariant;
}) {
  const islands = Array.from({ length: max }, (_, i) => i + 1);
  const styleFor = (v: IslandVariant) => {
    switch (v) {
      case "lit":
        return "border-amber-200/80 bg-amber-300/30 text-amber-50 shadow-[0_0_12px_rgba(252,211,77,0.65)]";
      case "blue":
        return "border-cyan-300/70 bg-cyan-400/30 text-cyan-50 shadow-[0_0_10px_rgba(34,211,238,0.5)]";
      case "gold":
        return "border-amber-300/70 bg-amber-400/30 text-amber-50 shadow-[0_0_10px_rgba(252,211,77,0.5)]";
      case "both":
        return "border-fuchsia-300/80 bg-fuchsia-400/30 text-fuchsia-50 shadow-[0_0_12px_rgba(232,121,249,0.6)]";
      default:
        return "border-cyan-100/25 bg-[#06122c]/50 text-cyan-200/60";
    }
  };
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {islands.map((n) => {
        const v = variant(n);
        const isBoat = boatIsland === n;
        const Comp = clickable ? "button" : "div";
        return (
          <Comp
            key={n}
            {...(clickable ? { type: "button" as const, onClick: () => onPick?.(n), "data-testid": `island-${n}` } : {})}
            className={`relative flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black transition ${styleFor(v)} ${clickable ? "active:scale-95" : ""} ${picked === n ? "ring-2 ring-white/70" : ""}`}
          >
            {n}
            {isBoat && <span className="absolute -top-3 text-[11px]">⛵</span>}
          </Comp>
        );
      })}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-cyan-100/80">
      <span className={`inline-block h-3 w-3 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function HudPill({ glyph, label, value, tone }: { glyph: string; label: string; value: string; tone: "emerald" | "amber" | "cyan" }) {
  const border = tone === "emerald" ? "border-emerald-200/30 text-emerald-100" : tone === "amber" ? "border-amber-200/30 text-amber-100" : "border-cyan-200/30 text-cyan-100";
  return (
    <div className={`flex flex-col items-center justify-center rounded-[14px] border bg-[#06122c]/55 px-1 py-1.5 text-center ${border}`}>
      <span className="text-sm leading-none">{glyph}</span>
      <span className="mt-0.5 text-[9px] font-bold leading-none opacity-90">{label}</span>
      <span className="text-[11px] font-black leading-tight">{value}</span>
    </div>
  );
}

function DonePill({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[14px] bg-amber-400/15 p-2 text-center text-xs font-black text-amber-100">{children}</p>;
}

function ActionButton({
  children,
  dataTestId,
  disabled,
  onClick
}: {
  children: React.ReactNode;
  dataTestId?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full rounded-[18px] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 py-3 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(252,211,77,0.4)] transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
      data-testid={dataTestId}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
