"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BAG_CAPACITY,
  FOREST_COPY,
  FOREST_EDGES,
  FOREST_LOCATIONS,
  FOREST_MAP_ASSETS,
  FRAGMENT_SOURCES,
  FRUIT_VALUES,
  SPIRIT_IDS,
  TOTAL_FRAGMENTS,
  getNovaHint,
  type ForestLocation,
  type ForestLocationId
} from "../../../lib/forestMapContentSource";

type LocationStatus = "locked" | "available" | "completed";

const byId = (id: ForestLocationId): ForestLocation =>
  FOREST_LOCATIONS.find((l) => l.id === id) as ForestLocation;

// 地点节点的代表贴图（凭状态在沉睡/点亮间切换）。
function nodeSprite(loc: ForestLocation, done: boolean): string {
  switch (loc.kind) {
    case "entrance":
      return FOREST_MAP_ASSETS.player;
    case "grove":
      return FOREST_MAP_ASSETS.fruit;
    case "spirit":
      return done ? FOREST_MAP_ASSETS.awakeSpirit : FOREST_MAP_ASSETS.sleepingSpirit;
    case "gate":
      return done ? FOREST_MAP_ASSETS.lampOn : FOREST_MAP_ASSETS.fog;
    case "bridge":
    case "heart":
      return done ? FOREST_MAP_ASSETS.lampOn : FOREST_MAP_ASSETS.lampOff;
    default:
      return FOREST_MAP_ASSETS.lampOff;
  }
}

export default function ForestMapPage() {
  const [currentLocation, setCurrentLocation] = useState<ForestLocationId>("forest-entrance");
  const [playerAt, setPlayerAt] = useState<ForestLocationId>("forest-entrance");
  const [inventory, setInventory] = useState<number[]>([]);
  const [completed, setCompleted] = useState<ForestLocationId[]>([]);
  const [message, setMessage] = useState<string>(FOREST_COPY.intro);
  const [moving, setMoving] = useState(false);

  // 派生进度（碎片 / 朋友 / 各门状态都从 completed 推导，避免多份状态漂移）。
  const companions = completed.filter((id) => SPIRIT_IDS.includes(id));
  const fragments = completed.filter((id) => FRAGMENT_SOURCES.includes(id)).length;
  const gateOpen = completed.includes("mist-gate");
  const heartDone = completed.includes("forest-heart");
  const bagSum = inventory.reduce((a, b) => a + b, 0);

  const statusOf = (id: ForestLocationId): LocationStatus => {
    if (completed.includes(id)) return "completed";
    switch (id) {
      case "forest-entrance":
      case "fruit-grove":
      case "sleepy-spirit-1":
        return "available";
      case "sleepy-spirit-2":
        return completed.includes("sleepy-spirit-1") ? "available" : "locked";
      case "mist-gate":
        return companions.length >= 2 ? "available" : "locked";
      case "star-bridge":
        return completed.includes("mist-gate") ? "available" : "locked";
      case "forest-heart":
        return fragments >= TOTAL_FRAGMENTS ? "available" : "locked";
      default:
        return "locked";
    }
  };

  const playerPos = byId(playerAt).pos;
  const brightOpacity = heartDone ? 1 : Math.min(1, fragments / TOTAL_FRAGMENTS);

  const novaLine = useMemo(
    () => getNovaHint({ location: currentLocation, bag: inventory, fragments, companions: companions.length, gateOpen }),
    [currentLocation, inventory, fragments, companions.length, gateOpen]
  );

  // ---- 操作 ----
  const goTo = (id: ForestLocationId) => {
    if (moving) return;
    const st = statusOf(id);
    if (st === "locked") {
      setMessage(FOREST_COPY.lockReason[id] ?? "这里现在还去不了，先看看别处。");
      return;
    }
    if (id === playerAt) {
      setCurrentLocation(id);
      return;
    }
    // 角色沿地图滑过去（CSS 过渡），到达后再切换底部地点信息，不是瞬间切页面。
    setMoving(true);
    setPlayerAt(id);
    window.setTimeout(() => {
      setCurrentLocation(id);
      setMoving(false);
      setMessage(byId(id).blurb);
    }, 650);
  };

  const pickFruit = (value: number) => {
    if (inventory.length >= BAG_CAPACITY) {
      setMessage(FOREST_COPY.bagFull);
      return;
    }
    setInventory([...inventory, value]);
    setMessage("能量果放进背包啦。");
  };

  const removeFruit = (index: number) => setInventory(inventory.filter((_, i) => i !== index));
  const clearBag = () => {
    setInventory([]);
    setMessage("背包清空了，可以重新挑两颗。");
  };

  const tryLight = (id: ForestLocationId) => {
    if (inventory.length < BAG_CAPACITY) {
      setMessage(FOREST_COPY.needTwoFruits);
      return;
    }
    if (bagSum < 10) {
      setMessage(FOREST_COPY.sumLow);
      return;
    }
    if (bagSum > 10) {
      setMessage(FOREST_COPY.sumHigh);
      return;
    }
    const success =
      id === "sleepy-spirit-1"
        ? FOREST_COPY.spirit1Success
        : id === "sleepy-spirit-2"
          ? FOREST_COPY.spirit2Success
          : FOREST_COPY.bridgeSuccess;
    setInventory([]);
    setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setMessage(success);
  };

  const openGate = () => {
    if (companions.length < 2) {
      setMessage(FOREST_COPY.lockReason["mist-gate"] ?? "");
      return;
    }
    setCompleted((prev) => (prev.includes("mist-gate") ? prev : [...prev, "mist-gate"]));
    setMessage(FOREST_COPY.gateOpened);
  };

  const awakenSeed = () => {
    if (fragments < TOTAL_FRAGMENTS) {
      setMessage(FOREST_COPY.lockReason["forest-heart"] ?? "");
      return;
    }
    setCompleted((prev) => (prev.includes("forest-heart") ? prev : [...prev, "forest-heart"]));
    setMessage(FOREST_COPY.heartComplete);
  };

  const restart = () => {
    setCompleted([]);
    setInventory([]);
    setCurrentLocation("forest-entrance");
    setPlayerAt("forest-entrance");
    setMoving(false);
    setMessage(FOREST_COPY.intro);
  };

  const askNova = () => setMessage(novaLine);

  const current = byId(currentLocation);
  const currentDone = completed.includes(currentLocation);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b2c] bg-[radial-gradient(circle_at_top,#1f2a6b,#0d1546_55%,#070b2c)] px-3 py-3 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-3">
        {/* 顶部 HUD */}
        <header className="rounded-[22px] border border-cyan-300/25 bg-[#101957]/85 p-3 shadow-[0_0_24px_rgba(71,150,255,0.22)]">
          <div className="flex items-center justify-between gap-2">
            <Link className="inline-flex min-h-9 items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 text-xs font-black text-cyan-50 active:scale-95" href="/adventure">
              ← 返回
            </Link>
            <h1 className="text-center text-base font-black tracking-wide text-white">{FOREST_COPY.title}</h1>
            <span className="w-12" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="flex items-center justify-center gap-1 rounded-[14px] border border-amber-200/30 bg-blue-950/55 px-2 py-1.5 text-xs font-black text-amber-100">
              <span
                className="inline-block h-4 w-4 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.fragment})` }}
              />
              星光碎片 {fragments}/{TOTAL_FRAGMENTS}
            </div>
            <div className="flex items-center justify-center gap-1 rounded-[14px] border border-emerald-200/30 bg-blue-950/55 px-2 py-1.5 text-xs font-black text-emerald-100">
              <span
                className="inline-block h-4 w-4 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.awakeSpirit})` }}
              />
              森林朋友 {companions.length}/2
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] font-bold leading-4 text-cyan-200/90">目标：{FOREST_COPY.goal}</p>
        </header>

        {/* 小地图 */}
        <section className="relative w-full overflow-hidden rounded-[24px] border border-cyan-300/25 shadow-[0_0_30px_rgba(71,150,255,0.25)]" style={{ aspectRatio: "1 / 1" }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.bgDark})` }} />
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.bgBright})`, opacity: brightOpacity }}
          />
          <div className="absolute inset-0 bg-[#070b2c]/35" />

          {/* 连线 */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {FOREST_EDGES.map(([a, b]) => {
              const pa = byId(a).pos;
              const pb = byId(b).pos;
              return (
                <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="rgba(190,242,255,0.35)" strokeWidth={0.8} strokeDasharray="2 2" />
              );
            })}
          </svg>

          {/* 节点 */}
          {FOREST_LOCATIONS.map((loc) => {
            const st = statusOf(loc.id);
            const done = st === "completed";
            const isCurrent = loc.id === currentLocation;
            const ring =
              st === "locked"
                ? "border-slate-400/40 bg-slate-800/70 opacity-70"
                : done
                  ? "border-emerald-300/80 bg-emerald-400/15 shadow-[0_0_16px_rgba(110,231,183,0.55)]"
                  : "border-amber-200/80 bg-amber-300/15 shadow-[0_0_16px_rgba(252,211,77,0.55)]";
            return (
              <button
                key={loc.id}
                aria-label={loc.name}
                data-testid={`node-${loc.id}`}
                className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 backdrop-blur-[1px] transition active:scale-95 ${ring} ${isCurrent ? "ring-2 ring-white/70" : ""}`}
                style={{ left: `${loc.pos.x}%`, top: `${loc.pos.y}%` }}
                onClick={() => goTo(loc.id)}
                type="button"
              >
                <span
                  className={`h-8 w-8 bg-contain bg-center bg-no-repeat ${st === "locked" ? "opacity-50 grayscale" : ""}`}
                  style={{ backgroundImage: `url(${nodeSprite(loc, done)})` }}
                />
                {st === "locked" && <span className="absolute -right-1 -top-1 text-xs">🔒</span>}
                {done && <span className="absolute -right-1 -top-1 text-xs">✅</span>}
                <span className="pointer-events-none absolute -bottom-4 whitespace-nowrap rounded-full bg-blue-950/80 px-1.5 text-[9px] font-black text-cyan-50">{loc.short}</span>
              </button>
            );
          })}

          {/* 玩家角色（点击地点后滑过去） */}
          <span
            className="pointer-events-none absolute z-10 h-9 w-9 -translate-x-1/2 bg-contain bg-bottom bg-no-repeat drop-shadow-[0_0_10px_rgba(103,232,249,0.6)]"
            style={{
              left: `${playerPos.x}%`,
              top: `calc(${playerPos.y}% - 30px)`,
              backgroundImage: `url(${FOREST_MAP_ASSETS.player})`,
              transition: "left 0.6s ease, top 0.6s ease"
            }}
          />
        </section>

        {/* 底部：地点信息 + 背包 + Nova + 操作 */}
        <section className="rounded-[24px] border border-cyan-300/25 bg-[#101957]/85 p-3 shadow-[0_0_24px_rgba(71,150,255,0.22)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black text-white">{current.name}</h2>
            <span className="rounded-full border border-cyan-300/30 bg-blue-950/55 px-2 py-0.5 text-[10px] font-black text-cyan-100">
              {moving ? "移动中…" : currentDone ? "已完成" : "可探索"}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold leading-5 text-cyan-100/90">{current.blurb}</p>

          {/* Nova 提示 */}
          <div className="mt-2 flex items-start gap-2 rounded-[16px] border border-violet-300/25 bg-blue-950/55 p-2">
            <span className="mt-0.5 h-7 w-7 shrink-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.nova})` }} aria-label="Nova" />
            <p className="text-xs font-bold leading-5 text-cyan-50">{message}</p>
          </div>

          {/* 背包 2 格 */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-black text-amber-200">背包</span>
            {Array.from({ length: BAG_CAPACITY }).map((_, i) => {
              const v = inventory[i];
              return v === undefined ? (
                <span key={`slot-${i}`} className="flex h-10 w-10 items-center justify-center rounded-[12px] border-2 border-dashed border-cyan-100/35 bg-blue-950/40 text-[10px] text-cyan-200/60">空</span>
              ) : (
                <button
                  key={`slot-${i}`}
                  aria-label={`放回 ${v}`}
                  data-testid={`bag-slot-${i}`}
                  className="relative flex h-10 w-10 items-center justify-center rounded-[12px] border-2 border-amber-200/60 bg-amber-300/15 active:scale-95"
                  onClick={() => removeFruit(i)}
                  type="button"
                >
                  <span className="absolute inset-1 bg-contain bg-center bg-no-repeat opacity-90" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.fruit})` }} />
                  <span className="relative text-base font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{v}</span>
                </button>
              );
            })}
            {inventory.length > 0 && (
              <button className="ml-auto rounded-full border border-cyan-300/35 bg-blue-950/55 px-3 py-1 text-[11px] font-black text-cyan-50 active:scale-95" onClick={clearBag} type="button">
                清空
              </button>
            )}
          </div>

          {/* 操作区（随地点变化） */}
          <div className="mt-3">{renderAction()}</div>

          <button className="mt-3 w-full rounded-full border border-violet-300/30 bg-violet-500/20 py-2 text-xs font-black text-violet-50 active:scale-95" onClick={askNova} type="button">
            ？问 Nova
          </button>
        </section>

        <button className="mx-auto rounded-full border border-cyan-300/25 bg-blue-950/45 px-4 py-1.5 text-[11px] font-black text-cyan-200 active:scale-95" onClick={restart} type="button">
          重新开始
        </button>
      </div>

      {/* 完成页 */}
      {heartDone && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070b2c]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-amber-200/40 bg-[#101957]/95 p-5 text-center shadow-[0_0_40px_rgba(252,211,77,0.35)]">
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.bgBright})` }} />
            <div className="relative">
              <div className="mx-auto h-20 w-20 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.lampOn})` }} />
              <h2 className="mt-3 text-xl font-black text-amber-100">第一章完成！</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50">{FOREST_COPY.heartComplete}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                {Array.from({ length: TOTAL_FRAGMENTS }).map((_, i) => (
                  <span key={i} className="h-8 w-8 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.fragment})` }} />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link className="inline-flex items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-300/20 py-2 text-xs font-black text-cyan-50 active:scale-95" href="/adventure">回到冒险</Link>
                <button className="rounded-full bg-gradient-to-r from-amber-300 to-amber-400 py-2 text-xs font-black text-slate-950 active:scale-95" onClick={restart} type="button">再玩一次</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  function renderAction() {
    if (moving) return <p className="text-xs font-bold text-cyan-200/80">正在走过去…</p>;
    switch (current.kind) {
      case "grove":
        return (
          <div className="grid gap-2">
            <p className="text-[11px] font-black text-amber-200">挑两颗能量果（最多 2 颗）：</p>
            <div className="grid grid-cols-3 gap-2">
              {FRUIT_VALUES.map((v, i) => (
                <button
                  key={`${v}-${i}`}
                  data-testid={`grove-fruit-${v}`}
                  className="relative flex h-14 items-center justify-center rounded-[16px] border border-amber-200/45 bg-amber-300/12 active:scale-95 disabled:opacity-40"
                  disabled={inventory.length >= BAG_CAPACITY}
                  onClick={() => pickFruit(v)}
                  type="button"
                >
                  <span className="absolute inset-2 bg-contain bg-center bg-no-repeat opacity-85" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.fruit})` }} />
                  <span className="relative text-2xl font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">{v}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case "spirit":
        if (currentDone) return <p className="rounded-[14px] bg-emerald-400/15 p-2 text-center text-xs font-black text-emerald-100">这只小精灵已经醒来，成了你的森林朋友。</p>;
        return (
          <ActionButton dataTestId="action-wake-spirit" disabled={inventory.length < BAG_CAPACITY} onClick={() => tryLight(currentLocation)}>
            用能量果唤醒小精灵
          </ActionButton>
        );
      case "gate":
        if (currentDone) return <p className="rounded-[14px] bg-emerald-400/15 p-2 text-center text-xs font-black text-emerald-100">迷雾门已经打开，星光桥出现了。</p>;
        return (
          <ActionButton dataTestId="action-open-gate" onClick={openGate}>打开迷雾门</ActionButton>
        );
      case "bridge":
        if (currentDone) return <p className="rounded-[14px] bg-emerald-400/15 p-2 text-center text-xs font-black text-emerald-100">星光桥已经修好，可以去森林中心了。</p>;
        return (
          <ActionButton dataTestId="action-light-bridge" disabled={inventory.length < BAG_CAPACITY} onClick={() => tryLight(currentLocation)}>
            点亮桥心灯
          </ActionButton>
        );
      case "heart":
        return (
          <ActionButton dataTestId="action-awaken-seed" onClick={awakenSeed}>放入星光碎片，唤醒星光种子</ActionButton>
        );
      case "entrance":
      default:
        return <p className="text-xs font-bold leading-5 text-cyan-100/80">点地图上的地点去探索：先去果园拿果子，再去叫醒小精灵。</p>;
    }
  }
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
