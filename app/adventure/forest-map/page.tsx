"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BAG_CAPACITY,
  BALANCE_PUZZLE,
  FOREST_COPY,
  FOREST_EDGES,
  FOREST_LOCATIONS,
  FOREST_MAP_ASSETS,
  FRAGMENT_SOURCES,
  FRUIT_VALUES,
  MAKE_TEN_TARGET,
  PATTERN_PUZZLE,
  SPIRIT_IDS,
  TOTAL_FRIENDS,
  getNovaHint,
  type ForestLocation,
  type ForestLocationId
} from "../../../lib/forestMapContentSource";

type LocationStatus = "locked" | "available" | "completed";

const byId = (id: ForestLocationId): ForestLocation =>
  FOREST_LOCATIONS.find((l) => l.id === id) as ForestLocation;

// 地点节点贴图（凭状态在沉睡/点亮间切换）。三位朋友都用小精灵贴图，森林核心用星光灯。
function nodeSprite(loc: ForestLocation, done: boolean): string {
  switch (loc.kind) {
    case "entrance":
      return FOREST_MAP_ASSETS.player;
    case "grove":
      return FOREST_MAP_ASSETS.fruit;
    case "spirit":
      return done ? FOREST_MAP_ASSETS.awakeSpirit : FOREST_MAP_ASSETS.sleepingSpirit;
    case "core":
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
  const [balancePlaced, setBalancePlaced] = useState<number | null>(null);

  // 派生进度：三位森林朋友 = 三片星光碎片 = 三道森林星光（都从救醒的小精灵数推导）。
  const friends = completed.filter((id) => SPIRIT_IDS.includes(id)).length;
  const fragments = completed.filter((id) => FRAGMENT_SOURCES.includes(id)).length;
  const stars = friends;
  const coreDone = completed.includes("forest-core");
  const bagSum = inventory.reduce((a, b) => a + b, 0);

  const statusOf = (id: ForestLocationId): LocationStatus => {
    if (completed.includes(id)) return "completed";
    switch (id) {
      case "forest-entrance":
      case "glowfruit-grove":
      case "glowfruit-spirit":
        return "available";
      case "vinebridge-spirit":
        return completed.includes("glowfruit-spirit") ? "available" : "locked";
      case "windbell-spirit":
        return completed.includes("vinebridge-spirit") ? "available" : "locked";
      case "forest-core":
        return friends >= TOTAL_FRIENDS ? "available" : "locked";
      default:
        return "locked";
    }
  };

  const playerPos = byId(playerAt).pos;
  const brightOpacity = coreDone ? 1 : Math.min(1, stars / TOTAL_FRIENDS);

  const novaLine = useMemo(
    () => getNovaHint({ location: currentLocation, bag: inventory, friends }),
    [currentLocation, inventory, friends]
  );

  // ---- 移动 / 背包 ----
  const goTo = (id: ForestLocationId) => {
    if (moving) return;
    const st = statusOf(id);
    if (st === "locked") {
      setMessage(byId(id).unlockRequirement ?? "这里现在还去不了，先看看别处。");
      return;
    }
    if (id === playerAt) {
      setCurrentLocation(id);
      return;
    }
    setMoving(true);
    setBalancePlaced(null);
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
    setMessage("背包清空了，可以重新挑能量果。");
  };

  const completeSpirit = (id: ForestLocationId) => {
    setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setMessage(FOREST_COPY.spiritSuccess[id] ?? "森林朋友醒啦！");
  };

  // ---- 机关：凑 10（光果小精灵）----
  const tryMakeTen = (id: ForestLocationId) => {
    if (inventory.length < BAG_CAPACITY) {
      setMessage(FOREST_COPY.needTwoFruits);
      return;
    }
    if (bagSum < MAKE_TEN_TARGET) {
      setMessage(FOREST_COPY.makeTenLow);
      return;
    }
    if (bagSum > MAKE_TEN_TARGET) {
      setMessage(FOREST_COPY.makeTenHigh);
      return;
    }
    setInventory([]);
    completeSpirit(id);
  };

  // ---- 机关：左右平衡（藤桥小精灵）----
  const tryBalance = (id: ForestLocationId, value: number) => {
    setBalancePlaced(value);
    if (value === BALANCE_PUZZLE.needValue) {
      setInventory([]);
      completeSpirit(id);
      return;
    }
    setMessage(value < BALANCE_PUZZLE.needValue ? FOREST_COPY.balanceLight : FOREST_COPY.balanceHeavy);
  };

  // ---- 机关：数字规律（风铃小精灵）----
  const tryPattern = (id: ForestLocationId, value: number) => {
    if (value !== PATTERN_PUZZLE.answer) {
      setMessage(FOREST_COPY.patternWrong);
      return;
    }
    completeSpirit(id);
  };

  // ---- 机关：放回碎片（森林核心）----
  const awakenSeed = () => {
    if (friends < TOTAL_FRIENDS) {
      setMessage(FOREST_COPY.coreNotReady);
      return;
    }
    setCompleted((prev) => (prev.includes("forest-core") ? prev : [...prev, "forest-core"]));
    setMessage(FOREST_COPY.coreComplete);
  };

  const restart = () => {
    setCompleted([]);
    setInventory([]);
    setCurrentLocation("forest-entrance");
    setPlayerAt("forest-entrance");
    setBalancePlaced(null);
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
            <div className="text-center">
              <h1 className="text-sm font-black tracking-wide text-white">{FOREST_COPY.chapter}</h1>
              <p className="text-[10px] font-bold text-cyan-200/80">{FOREST_COPY.subtitle}</p>
            </div>
            <span className="w-12" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <HudPill icon={FOREST_MAP_ASSETS.awakeSpirit} label="森林朋友" value={`${friends}/${TOTAL_FRIENDS}`} tone="emerald" />
            <HudPill icon={FOREST_MAP_ASSETS.fragment} label="星光碎片" value={`${fragments}/${TOTAL_FRIENDS}`} tone="amber" />
            <HudPill icon={FOREST_MAP_ASSETS.lampOn} label="森林星光" value={`${stars}/${TOTAL_FRIENDS}`} tone="cyan" />
          </div>
          <p className="mt-2 text-center text-[11px] font-bold leading-4 text-cyan-200/90">目标：{FOREST_COPY.goal}</p>
        </header>

        {/* 小地图 */}
        <section className="relative w-full overflow-hidden rounded-[24px] border border-cyan-300/25 shadow-[0_0_30px_rgba(71,150,255,0.25)]" style={{ aspectRatio: "1 / 1" }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.bgDark})` }} />
          <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-700" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.bgBright})`, opacity: brightOpacity }} />
          <div className="absolute inset-0 bg-[#070b2c]/35" />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {FOREST_EDGES.map(([a, b]) => {
              const pa = byId(a).pos;
              const pb = byId(b).pos;
              return <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="rgba(190,242,255,0.35)" strokeWidth={0.8} strokeDasharray="2 2" />;
            })}
          </svg>

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
                <span className={`h-8 w-8 bg-contain bg-center bg-no-repeat ${st === "locked" ? "opacity-50 grayscale" : ""}`} style={{ backgroundImage: `url(${nodeSprite(loc, done)})` }} />
                {st === "locked" && <span className="absolute -right-1 -top-1 text-xs">🔒</span>}
                {done && <span className="absolute -right-1 -top-1 text-xs">✅</span>}
                <span className="pointer-events-none absolute -bottom-4 whitespace-nowrap rounded-full bg-blue-950/80 px-1.5 text-[9px] font-black text-cyan-50">{loc.short}</span>
              </button>
            );
          })}

          <span
            className="pointer-events-none absolute z-10 h-9 w-9 -translate-x-1/2 bg-contain bg-bottom bg-no-repeat drop-shadow-[0_0_10px_rgba(103,232,249,0.6)]"
            style={{ left: `${playerPos.x}%`, top: `calc(${playerPos.y}% - 30px)`, backgroundImage: `url(${FOREST_MAP_ASSETS.player})`, transition: "left 0.6s ease, top 0.6s ease" }}
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
                <button key={`slot-${i}`} aria-label={`放回 ${v}`} data-testid={`bag-slot-${i}`} className="relative flex h-10 w-10 items-center justify-center rounded-[12px] border-2 border-amber-200/60 bg-amber-300/15 active:scale-95" onClick={() => removeFruit(i)} type="button">
                  <span className="absolute inset-1 bg-contain bg-center bg-no-repeat opacity-90" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.fruit})` }} />
                  <span className="relative text-base font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{v}</span>
                </button>
              );
            })}
            {inventory.length > 0 && (
              <button className="ml-auto rounded-full border border-cyan-300/35 bg-blue-950/55 px-3 py-1 text-[11px] font-black text-cyan-50 active:scale-95" onClick={clearBag} type="button">清空</button>
            )}
          </div>

          <div className="mt-3">{renderAction()}</div>

          <button className="mt-3 w-full rounded-full border border-violet-300/30 bg-violet-500/20 py-2 text-xs font-black text-violet-50 active:scale-95" onClick={askNova} type="button">
            ？问 Nova
          </button>
        </section>

        <button className="mx-auto rounded-full border border-cyan-300/25 bg-blue-950/45 px-4 py-1.5 text-[11px] font-black text-cyan-200 active:scale-95" onClick={restart} type="button">
          重新开始
        </button>
      </div>

      {/* 森林核心完成：本章高潮 + 星光海远景预告 */}
      {coreDone && (
        <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#070b2c]/85 p-4 backdrop-blur-sm">
          <div className="relative my-auto w-full max-w-sm overflow-hidden rounded-[28px] border border-amber-200/40 bg-[#101957]/95 p-5 text-center shadow-[0_0_40px_rgba(252,211,77,0.35)]">
            <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.bgBright})` }} />
            <div className="relative">
              <div className="mx-auto h-20 w-20 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.lampOn})` }} />
              <h2 className="mt-3 text-xl font-black text-amber-100">星光种子醒来了！</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50">{FOREST_COPY.coreComplete}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                {SPIRIT_IDS.map((id) => (
                  <span key={id} className="h-8 w-8 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.awakeSpirit})` }} />
                ))}
              </div>

              {/* 下一章：星光海（已是可玩章节，入口可点击） */}
              <div className="mt-4 rounded-[18px] border border-cyan-300/30 bg-blue-950/55 p-3 text-left">
                <p className="text-[11px] font-black text-amber-200">{FOREST_COPY.seaNextTitle}</p>
                <p className="mt-1 text-[11px] font-bold leading-5 text-cyan-100">{FOREST_COPY.seaNextLine1}</p>
                <p className="mt-0.5 text-[11px] font-bold leading-5 text-cyan-200/90">{FOREST_COPY.seaNextLine2}</p>
              </div>

              <div className="mt-4 grid gap-2">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-4 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(252,211,77,0.4)] active:scale-95"
                  data-testid="enter-chapter-2"
                  href={FOREST_COPY.seaRoute}
                >
                  {FOREST_COPY.seaEnterLabel}
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <button className="rounded-full border border-cyan-200/35 bg-cyan-300/15 py-2 text-xs font-black text-cyan-50 active:scale-95" onClick={restart} type="button">再玩一次</button>
                  <Link className="inline-flex items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-300/20 py-2 text-xs font-black text-cyan-50 active:scale-95" href="/adventure">回到入口</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  function renderAction() {
    if (moving) return <p className="text-xs font-bold text-cyan-200/80">正在走过去…</p>;

    if (current.kind === "grove") {
      return (
        <div className="grid gap-2">
          <p className="text-[11px] font-black text-amber-200">挑能量果（背包最多 {BAG_CAPACITY} 颗）：</p>
          <div className="grid grid-cols-3 gap-2">
            {FRUIT_VALUES.map((v, i) => (
              <button key={`${v}-${i}`} data-testid={`grove-fruit-${v}`} className="relative flex h-14 items-center justify-center rounded-[16px] border border-amber-200/45 bg-amber-300/12 active:scale-95 disabled:opacity-40" disabled={inventory.length >= BAG_CAPACITY} onClick={() => pickFruit(v)} type="button">
                <span className="absolute inset-2 bg-contain bg-center bg-no-repeat opacity-85" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.fruit})` }} />
                <span className="relative text-2xl font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">{v}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    switch (current.mechanism) {
      case "make-ten":
        if (currentDone) return <DonePill>光果小精灵已经醒来，星光果园重新发光了。</DonePill>;
        return (
          <ActionButton dataTestId="action-wake-spirit" disabled={inventory.length < BAG_CAPACITY} onClick={() => tryMakeTen(currentLocation)}>
            用能量果点亮星光灯
          </ActionButton>
        );

      case "balance":
        if (currentDone) return <DonePill>藤桥小精灵已经醒来，苔藓断桥连起来了。</DonePill>;
        return (
          <div className="grid gap-3">
            <p className="text-[11px] font-black text-cyan-200">让桥两边一样重：</p>
            <div className="flex items-center justify-center gap-3">
              <BalancePan label="桥左边" value={BALANCE_PUZZLE.leftFixed} />
              <span className="text-lg font-black text-cyan-200/80">⟺</span>
              <BalancePan label="桥右边" value={balancePlaced} placeholder />
            </div>
            {inventory.length === 0 ? (
              <p className="rounded-[12px] border border-amber-200/25 bg-amber-300/10 p-2 text-center text-[11px] font-bold text-amber-100">{FOREST_COPY.balanceNeedFruit}</p>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {inventory.map((v, i) => (
                  <button key={`place-${i}`} data-testid={`balance-place-${v}`} className="relative flex h-12 w-12 items-center justify-center rounded-[14px] border border-amber-200/55 bg-amber-300/15 active:scale-95" onClick={() => tryBalance(currentLocation, v)} type="button">
                    <span className="absolute inset-1 bg-contain bg-center bg-no-repeat opacity-85" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.fruit})` }} />
                    <span className="relative text-lg font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{v}</span>
                  </button>
                ))}
                <span className="w-full text-center text-[10px] font-bold text-cyan-200/70">点一颗放到桥右边试试</span>
              </div>
            )}
          </div>
        );

      case "pattern":
        if (currentDone) return <DonePill>风铃小精灵已经醒来，迷雾树门打开了。</DonePill>;
        return (
          <div className="grid gap-3">
            <p className="text-[11px] font-black text-cyan-200">门上的数字，下一个是几？</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PATTERN_PUZZLE.display.map((n, i) => (
                <span key={`seq-${i}`} className="flex items-center gap-2">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/50 bg-blue-950/70 text-xl font-black text-cyan-50">{n}</span>
                  <span className="text-cyan-200/80">→</span>
                </span>
              ))}
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-amber-200/70 bg-amber-300/10 text-xl font-black text-amber-200">?</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PATTERN_PUZZLE.options.map((opt) => (
                <button key={opt} data-testid={`pattern-option-${opt}`} className="flex h-14 items-center justify-center rounded-[16px] border border-cyan-200/45 bg-gradient-to-br from-violet-700 via-blue-700 to-cyan-500 text-2xl font-black text-white shadow-[0_0_14px_rgba(34,211,238,0.3)] active:scale-95" onClick={() => tryPattern(currentLocation, opt)} type="button">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case "restore-seed":
        return <ActionButton dataTestId="action-awaken-seed" disabled={friends < TOTAL_FRIENDS} onClick={awakenSeed}>放回星光碎片，唤醒星光种子</ActionButton>;

      default:
        return <p className="text-xs font-bold leading-5 text-cyan-100/80">点地图上的地点去探索：先去星光果园拿能量果，不同的森林朋友需要不同的办法。</p>;
    }
  }
}

function HudPill({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: "emerald" | "amber" | "cyan" }) {
  const border = tone === "emerald" ? "border-emerald-200/30 text-emerald-100" : tone === "amber" ? "border-amber-200/30 text-amber-100" : "border-cyan-200/30 text-cyan-100";
  return (
    <div className={`flex flex-col items-center justify-center rounded-[14px] border bg-blue-950/55 px-1 py-1.5 text-center ${border}`}>
      <span className="inline-block h-4 w-4 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${icon})` }} />
      <span className="mt-0.5 text-[9px] font-bold leading-none opacity-90">{label}</span>
      <span className="text-[11px] font-black leading-tight">{value}</span>
    </div>
  );
}

function DonePill({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[14px] bg-emerald-400/15 p-2 text-center text-xs font-black text-emerald-100">{children}</p>;
}

function BalancePan({ label, placeholder, value }: { label: string; placeholder?: boolean; value: number | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative flex h-14 w-14 items-center justify-center rounded-[16px] border-2 ${value === null ? "border-dashed border-cyan-100/40 bg-blue-950/40" : "border-amber-200/60 bg-amber-300/15"}`}>
        {value === null ? (
          <span className="text-xl font-black text-cyan-200/60">{placeholder ? "?" : ""}</span>
        ) : (
          <>
            <span className="absolute inset-1 bg-contain bg-center bg-no-repeat opacity-85" style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.fruit})` }} />
            <span className="relative text-2xl font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">{value}</span>
          </>
        )}
      </div>
      <span className="text-[10px] font-black text-cyan-200/80">{label}</span>
    </div>
  );
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
