"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  forestRpgContent,
  type ForestFruit,
  type ForestRpgStage,
  type LampState
} from "../../../lib/forestRpgContentSource";
import {
  playClickSound,
  playCompleteSound,
  playCorrectSound,
  playRewardSound,
  playWrongSound
} from "../../../lib/soundEffects";

type PlayerPosition = "start" | "lamp" | string;

export default function ForestRpgPage() {
  const content = forestRpgContent;
  const [stage, setStage] = useState<ForestRpgStage>("intro");
  const [selectedFruits, setSelectedFruits] = useState<ForestFruit[]>([]);
  const [pickedFruitIds, setPickedFruitIds] = useState<string[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>("start");
  const [targetPosition, setTargetPosition] = useState<PlayerPosition>("start");
  const [lampState, setLampState] = useState<LampState>("sleeping");
  const [novaLine, setNovaLine] = useState(content.novaLines.intro);
  const [moving, setMoving] = useState(false);
  const [lampPulse, setLampPulse] = useState(false);
  const [lastTry, setLastTry] = useState<{ fruits: ForestFruit[]; sum: number } | null>(null);

  const bagSum = selectedFruits.reduce((sum, fruit) => sum + fruit.value, 0);
  const stageLabel = useMemo(() => {
    if (stage === "intro") return "小路变暗";
    if (stage === "map" || stage === "collect") return "采集能量果";
    if (stage === "lamp") return "星光灯";
    if (stage === "result") return lampState === "lit" && attemptCount === 1 ? "完美点亮" : "成功点亮";
    return "完成";
  }, [attemptCount, lampState, stage]);

  const startAdventure = () => {
    playClickSound();
    setStage("map");
    setNovaLine(content.novaLines.map);
  };

  const moveTo = (position: PlayerPosition, done?: () => void) => {
    setTargetPosition(position);
    setMoving(true);
    window.setTimeout(() => {
      setPlayerPosition(position);
      setMoving(false);
      done?.();
    }, 760);
  };

  const collectFruit = (fruit: ForestFruit) => {
    if (stage === "intro" || stage === "result" || stage === "complete") return;
    if (pickedFruitIds.includes(fruit.id) || moving) return;

    playClickSound();
    moveTo(fruit.id, () => {
      if (selectedFruits.length >= 2) {
        setNovaLine(content.novaLines.bagFull);
        return;
      }

      playRewardSound();
      const next = [...selectedFruits, fruit];
      setSelectedFruits(next);
      setPickedFruitIds((prev) => [...prev, fruit.id]);
      setStage("collect");
      if (next.length === 1) {
        setNovaLine(content.novaLines.firstFruit(fruit.value));
      } else {
        setNovaLine(content.novaLines.bagFull);
      }
    });
  };

  const clearBag = () => {
    playClickSound();
    setSelectedFruits([]);
    setPickedFruitIds([]);
    setLastTry(null);
    setLampState("sleeping");
    setStage("map");
    setNovaLine(content.novaLines.map);
  };

  const tryLamp = () => {
    if (selectedFruits.length < 2 || moving) {
      setNovaLine(selectedFruits.length === 0 ? content.novaLines.map : content.novaLines.firstFruit(selectedFruits[0].value));
      return;
    }

    playClickSound();
    setStage("lamp");
    setNovaLine(content.novaLines.goLamp);
    moveTo("lamp", () => {
      const sum = selectedFruits.reduce((total, fruit) => total + fruit.value, 0);
      setAttemptCount((count) => count + 1);
      setLastTry({ fruits: selectedFruits, sum });
      setLampPulse(true);
      window.setTimeout(() => setLampPulse(false), 520);

      if (sum === content.targetEnergy) {
        playCorrectSound();
        setLampState("lit");
        setNovaLine(content.novaLines.justRight);
        window.setTimeout(() => {
          playRewardSound();
          setStage("result");
        }, 820);
        return;
      }

      playWrongSound();
      setLampState(sum < content.targetEnergy ? "too-low" : "too-high");
      setNovaLine(sum < content.targetEnergy ? content.novaLines.tooLow : content.novaLines.tooHigh);
      window.setTimeout(() => {
        setSelectedFruits([]);
        setPickedFruitIds([]);
        setStage("map");
      }, 900);
    });
  };

  const completeAdventure = () => {
    playCompleteSound();
    setStage("complete");
    setNovaLine(content.novaLines.complete);
  };

  const resetAdventure = () => {
    playClickSound();
    setStage("intro");
    setSelectedFruits([]);
    setPickedFruitIds([]);
    setAttemptCount(0);
    setPlayerPosition("start");
    setTargetPosition("start");
    setLampState("sleeping");
    setNovaLine(content.novaLines.intro);
    setMoving(false);
    setLampPulse(false);
    setLastTry(null);
  };

  const isAwake = stage === "result" || stage === "complete";
  const playerPoint = getPoint(targetPosition);
  const playerRestPoint = getPoint(playerPosition);
  const visiblePlayerPoint = moving ? playerPoint : playerRestPoint;

  return (
    <main className={`min-h-screen overflow-hidden bg-[#07102f] text-white ${isAwake ? "forest-lit" : ""}`}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(70,230,255,0.24),transparent_34%),radial-gradient(circle_at_82%_20%,rgba(168,85,247,0.26),transparent_34%),linear-gradient(180deg,#121d62,#07102f_58%,#05101e)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.13)_1px,transparent_2px)] bg-[size:34px_34px] opacity-30" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-3 px-3 py-3 sm:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[auto_1fr] lg:gap-4 lg:py-5">
        <header className="flex items-center justify-between gap-2 rounded-[24px] border border-cyan-200/25 bg-blue-950/70 px-3 py-2 shadow-[0_0_30px_rgba(34,211,238,0.16)] backdrop-blur-xl lg:col-span-2">
          <Link className="inline-flex min-h-10 items-center rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 text-xs font-black text-cyan-50" href="/adventure">
            ← 入口
          </Link>
          <div className="min-w-0 text-center">
            <h1 className="truncate text-base font-black sm:text-2xl">{content.name}</h1>
            <p className="mt-0.5 text-[10px] font-black text-amber-200 sm:text-xs">{stageLabel}</p>
          </div>
          <div className="rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">
            碎片 {stage === "complete" ? content.rewards.amount : 0}
          </div>
        </header>

        <section className="relative min-h-[560px] overflow-hidden rounded-[30px] border border-cyan-200/25 bg-[#0d1850]/82 shadow-[0_0_42px_rgba(34,211,238,0.2)] sm:min-h-[640px] lg:min-h-[700px]">
          <ForestMap
            contentFruits={content.fruits}
            isAwake={isAwake}
            lampPulse={lampPulse}
            lampState={lampState}
            onCollect={collectFruit}
            pickedFruitIds={pickedFruitIds}
            playerPoint={visiblePlayerPoint}
            selectedFruits={selectedFruits}
            showMap={stage !== "intro"}
          />

          {stage === "intro" && (
            <SceneCard className="bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[380px]">
              <p className="text-xs font-black tracking-[0.22em] text-cyan-200">冷开场</p>
              <h2 className="mt-2 text-2xl font-black leading-tight">{content.narrative.introTitle}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">{content.narrative.introLine}</p>
              <PrimaryButton onClick={startAdventure}>{content.buttons.start}</PrimaryButton>
            </SceneCard>
          )}

          {(stage === "map" || stage === "collect") && (
            <SceneCard className="bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[400px]">
              <p className="text-xs font-black tracking-[0.22em] text-cyan-200">森林小路</p>
              <h2 className="mt-2 text-2xl font-black leading-tight">找到两颗能量果</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">{content.narrative.mapGoal}</p>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                <Bag fruits={selectedFruits} />
                <button className="rounded-[18px] border border-cyan-200/25 bg-cyan-200/10 px-3 text-xs font-black text-cyan-50 transition active:scale-95" onClick={clearBag} type="button">
                  {content.buttons.clearBag}
                </button>
              </div>
              <PrimaryButton onClick={tryLamp}>{content.buttons.tryLamp}</PrimaryButton>
            </SceneCard>
          )}

          {stage === "lamp" && (
            <SceneCard className="bottom-4 left-4 right-4 text-center sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2">
              <p className="text-xs font-black tracking-[0.22em] text-amber-200">试试星光灯</p>
              <h2 className="mt-2 text-2xl font-black">{content.narrative.lampTitle}</h2>
              <LampMeter state={lampState} sum={bagSum} />
              <Bag fruits={selectedFruits} />
            </SceneCard>
          )}

          {stage === "result" && lastTry && (
            <SceneCard className="bottom-4 left-4 right-4 text-center sm:left-1/2 sm:w-[430px] sm:-translate-x-1/2">
              <p className="text-xs font-black tracking-[0.22em] text-amber-200">
                {attemptCount === 1 ? content.narrative.resultPerfectTitle : content.narrative.resultSuccessTitle}
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight">小精灵醒来了！</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">
                {content.novaLines.successSummary(lastTry.fruits[0].value, lastTry.fruits[1].value)}
              </p>
              <p className="mt-3 rounded-full bg-amber-300 px-4 py-2 text-sm font-black text-slate-950">
                获得：{content.rewards.item} +{content.rewards.amount}
              </p>
              <PrimaryButton onClick={completeAdventure}>{content.buttons.seeSpirit}</PrimaryButton>
            </SceneCard>
          )}

          {stage === "complete" && (
            <SceneCard className="bottom-4 left-4 right-4 text-center sm:left-1/2 sm:w-[440px] sm:-translate-x-1/2">
              <p className="text-xs font-black tracking-[0.22em] text-amber-200">星光灯救援完成</p>
              <h2 className="mt-2 text-3xl font-black leading-tight">{content.narrative.completeTitle}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-cyan-50/88">{content.narrative.completeLine}</p>
              <p className="mt-3 rounded-full bg-cyan-200/18 px-4 py-2 text-sm font-black text-cyan-50">
                {content.rewards.item}：{content.rewards.amount}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <PrimaryButton onClick={resetAdventure}>{content.buttons.replay}</PrimaryButton>
                <Link className="inline-flex min-h-12 items-center justify-center rounded-[22px] border border-cyan-200/30 bg-cyan-200/12 px-4 text-sm font-black text-cyan-50 transition active:scale-95" href="/adventure">
                  {content.buttons.backToAdventure}
                </Link>
              </div>
            </SceneCard>
          )}
        </section>

        <aside className="rounded-[28px] border border-cyan-200/25 bg-blue-950/72 p-3 shadow-[0_0_30px_rgba(34,211,238,0.14)] backdrop-blur-xl lg:p-4">
          <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3 lg:grid-cols-1">
            <div className="nova-bot relative mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-[24px] border border-cyan-100/35 bg-[radial-gradient(circle_at_50%_30%,#dffbff,#38bdf8_48%,#1d4ed8)] shadow-[0_0_26px_rgba(34,211,238,0.32)] lg:h-40 lg:w-40 lg:rounded-[38px]" aria-label="Nova" />
            <div className="min-w-0">
              <p className="text-sm font-black text-cyan-100 lg:text-center lg:text-xl">Nova</p>
              <p className="mt-1 rounded-[18px] border border-cyan-200/20 bg-slate-950/36 p-3 text-sm font-bold leading-6 text-cyan-50">{novaLine}</p>
            </div>
          </div>

          <div className="mt-3 rounded-[22px] border border-amber-200/25 bg-amber-300/10 p-3">
            <p className="text-xs font-black tracking-[0.18em] text-amber-200">背包</p>
            <Bag fruits={selectedFruits} compact />
          </div>
        </aside>
      </section>

      <style jsx global>{`
        @keyframes mistDrift {
          0%, 100% { transform: translateX(-8px) scale(1); opacity: 0.88; }
          50% { transform: translateX(10px) scale(1.06); opacity: 0.7; }
        }
        @keyframes fruitGlow {
          0%, 100% { box-shadow: 0 0 18px rgba(250,204,21,0.34); }
          50% { box-shadow: 0 0 34px rgba(250,204,21,0.72); }
        }
        @keyframes lampGlow {
          0%, 100% { box-shadow: 0 0 22px rgba(250,204,21,0.28); }
          50% { box-shadow: 0 0 54px rgba(250,204,21,0.78); }
        }
        .energy-fruit { animation: fruitGlow 2.8s ease-in-out infinite; }
        .lamp-lit { animation: lampGlow 1.8s ease-in-out infinite; }
        .sleepy-mist { animation: mistDrift 4s ease-in-out infinite; }
        .forest-lit .sleepy-mist { opacity: 0; transition: opacity 0.8s ease; }
        .forest-lit .forest-light { opacity: 1; }
        .nova-bot::before {
          content: "";
          position: absolute;
          width: 46%;
          height: 30%;
          border-radius: 999px;
          background: #061634;
          box-shadow: inset 0 0 0 2px rgba(186,230,253,0.34);
        }
        .nova-bot::after {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #67e8f9;
          box-shadow: 18px 0 #67e8f9, 0 0 10px #67e8f9, 18px 0 10px #67e8f9;
        }
        @media (prefers-reduced-motion: reduce) {
          .energy-fruit, .lamp-lit, .sleepy-mist { animation: none; }
        }
      `}</style>
    </main>
  );

  function getPoint(position: PlayerPosition) {
    if (position === "start") return { x: 10, y: 76 };
    if (position === "lamp") return { x: 58, y: 45 };
    const fruit = content.fruits.find((item) => item.id === position);
    return fruit?.position ?? { x: 10, y: 76 };
  }
}

function ForestMap({
  contentFruits,
  isAwake,
  lampPulse,
  lampState,
  onCollect,
  pickedFruitIds,
  playerPoint,
  selectedFruits,
  showMap
}: {
  contentFruits: ForestFruit[];
  isAwake: boolean;
  lampPulse: boolean;
  lampState: LampState;
  onCollect: (fruit: ForestFruit) => void;
  pickedFruitIds: string[];
  playerPoint: { x: number; y: number };
  selectedFruits: ForestFruit[];
  showMap: boolean;
}) {
  const spiritAwake = isAwake;

  return (
    <div className={`absolute inset-0 overflow-hidden ${isAwake ? "bg-emerald-500/10" : "bg-slate-950/20"}`}>
      <div className="absolute inset-x-[-10%] bottom-0 h-[58%] rounded-t-[50%] bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.28),rgba(21,128,61,0.22)_36%,rgba(5,46,22,0.72)_78%)]" />
      <div className="forest-light pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 bg-[radial-gradient(circle_at_60%_42%,rgba(250,204,21,0.3),transparent_30%),radial-gradient(circle_at_35%_72%,rgba(134,239,172,0.26),transparent_34%)]" />
      <div className="absolute bottom-[21%] left-[8%] right-[8%] h-12 rounded-[50%] bg-amber-100/12 blur-sm ring-1 ring-amber-200/20" />
      <div className="absolute bottom-[22%] left-[9%] right-[9%] h-2 rounded-full bg-gradient-to-r from-cyan-200/10 via-amber-200/30 to-emerald-200/18" />

      {Array.from({ length: 9 }).map((_, index) => (
        <span
          className="absolute bottom-[30%] h-20 w-10 rounded-t-full bg-gradient-to-b from-emerald-300/24 to-emerald-950/50"
          key={index}
          style={{ left: `${4 + index * 11}%`, height: `${72 + (index % 3) * 24}px` }}
        />
      ))}

      <div className="absolute left-[58%] top-[45%] z-20 -translate-x-1/2 -translate-y-1/2">
        <div className={`relative flex h-24 w-20 items-center justify-center rounded-[34px] border border-amber-100/50 bg-blue-950/72 shadow-[0_0_26px_rgba(250,204,21,0.18)] ${lampState === "lit" ? "lamp-lit bg-amber-300/80" : ""} ${lampPulse ? "scale-105" : ""}`} data-testid="starlight-lamp">
          <div className={`h-12 w-10 rounded-full ${lampState === "lit" ? "bg-amber-100" : lampState === "too-low" ? "bg-amber-200/45" : lampState === "too-high" ? "bg-violet-300/55" : "bg-cyan-200/24"} transition`} />
          <span className="absolute -bottom-7 whitespace-nowrap rounded-full bg-blue-950/70 px-2 py-1 text-[10px] font-black text-amber-100">星光灯</span>
        </div>
      </div>

      <div className="absolute right-[14%] top-[24%] z-20 flex flex-col items-center gap-2 sm:right-[18%]">
        <div className={`relative h-20 w-20 rounded-[42%] border border-cyan-100/35 ${spiritAwake ? "bg-[radial-gradient(circle_at_50%_30%,#fef3c7,#86efac_52%,#22c55e)] shadow-[0_0_42px_rgba(134,239,172,0.7)]" : "bg-[radial-gradient(circle_at_50%_30%,#dbeafe,#94a3b8_54%,#475569)] shadow-[0_0_28px_rgba(148,163,184,0.48)]"}`}>
          <span className="absolute left-5 top-8 h-2 w-2 rounded-full bg-slate-900 shadow-[28px_0_0_#0f172a]" />
          <span className="absolute bottom-4 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-slate-900/45" />
        </div>
        <p className="rounded-full border border-cyan-100/25 bg-blue-950/58 px-3 py-1 text-xs font-black text-cyan-50">{spiritAwake ? "醒来了" : "睡着了"}</p>
      </div>

      <div className="sleepy-mist absolute right-[4%] top-[12%] z-10 h-72 w-72 rounded-full bg-slate-300/22 blur-2xl sm:right-[12%]" />
      <div className="sleepy-mist absolute right-[20%] top-[26%] z-10 h-48 w-64 rounded-full bg-cyan-200/16 blur-2xl" />

      {showMap && contentFruits.map((fruit) => {
        const picked = pickedFruitIds.includes(fruit.id);
        const carried = selectedFruits.some((item) => item.id === fruit.id);
        return (
          <button
            className={`energy-fruit absolute z-30 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-100/60 bg-[radial-gradient(circle_at_35%_28%,#fef3c7,#facc15_34%,#22c55e_72%,#15803d)] text-xl font-black text-slate-950 transition active:scale-95 ${picked ? "opacity-35 grayscale" : "hover:scale-105"} ${carried ? "ring-4 ring-cyan-100/60" : ""}`}
            data-testid={fruit.id}
            disabled={picked}
            key={fruit.id}
            onClick={() => onCollect(fruit)}
            style={{ left: `${fruit.position.x}%`, top: `${fruit.position.y}%` }}
            type="button"
          >
            {fruit.label}
          </button>
        );
      })}

      {showMap && (
        <div
          className="absolute z-40 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-100/35 bg-cyan-300 text-xl font-black text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.46)] transition-[left,top] duration-700 ease-in-out"
          data-testid="forest-rpg-player"
          style={{ left: `${playerPoint.x}%`, top: `${playerPoint.y}%` }}
        >
          你
        </div>
      )}
    </div>
  );
}

function SceneCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`absolute z-50 rounded-[28px] border border-cyan-200/25 bg-blue-950/78 p-4 shadow-[0_0_36px_rgba(34,211,238,0.18)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function Bag({ compact, fruits }: { compact?: boolean; fruits: ForestFruit[] }) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${compact ? "mt-2" : ""}`} data-testid="fruit-bag">
      {[0, 1].map((index) => {
        const fruit = fruits[index];
        return (
          <div className="flex min-h-12 items-center justify-center rounded-[18px] border border-cyan-100/28 bg-blue-950/50 px-2 text-sm font-black text-cyan-50" key={index}>
            {fruit ? `${fruit.label} 号果` : "空"}
          </div>
        );
      })}
    </div>
  );
}

function LampMeter({ state, sum }: { state: LampState; sum: number }) {
  const width = Math.min(100, Math.max(8, sum * 10));
  const color = state === "too-high" ? "from-violet-300 to-fuchsia-300" : state === "lit" ? "from-amber-200 to-yellow-300" : "from-cyan-200 to-emerald-200";

  return (
    <div className="my-4 rounded-[22px] border border-cyan-200/25 bg-slate-950/40 p-3" data-testid="lamp-meter">
      <p className="text-xs font-black tracking-[0.18em] text-cyan-200">星光灯能量</p>
      <div className="mt-2 h-5 overflow-hidden rounded-full bg-slate-950/70">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[22px] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-5 text-base font-black text-slate-950 shadow-[0_0_28px_rgba(250,204,21,0.42)] transition active:scale-95" onClick={onClick} type="button">
      {children}
    </button>
  );
}
