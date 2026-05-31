"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { forestRpgContent, type ForestRpgStage } from "../../../lib/forestRpgContentSource";
import {
  playClickSound,
  playCompleteSound,
  playCorrectSound,
  playRewardSound,
  playWrongSound
} from "../../../lib/soundEffects";

type SlotValue = number | null;

export default function ForestRpgPage() {
  const content = forestRpgContent;
  const [stage, setStage] = useState<ForestRpgStage>("intro");
  const [slots, setSlots] = useState<[SlotValue, SlotValue]>([null, null]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isPerfectAwakening, setIsPerfectAwakening] = useState(false);
  const [novaLine, setNovaLine] = useState(content.novaLines.intro);
  const [formulaText, setFormulaText] = useState("");
  const [slotFlash, setSlotFlash] = useState(false);
  const [mistShake, setMistShake] = useState(false);
  const [awakened, setAwakened] = useState(false);

  const stageLabel = useMemo(() => {
    if (stage === "intro") return "冷开场";
    if (stage === "moving") return "森林小路";
    if (stage === "encounter") return "迷雾小精灵";
    if (stage === "awaken") return "星光合成";
    if (stage === "reward") return "星光碎片";
    return "完成";
  }, [stage]);

  useEffect(() => {
    if (stage !== "moving") return;

    const timer = window.setTimeout(() => {
      setStage("encounter");
      setNovaLine(content.novaLines.encounter);
      playClickSound();
    }, 1700);

    return () => window.clearTimeout(timer);
  }, [content.novaLines.encounter, stage]);

  const goMoving = () => {
    playClickSound();
    setStage("moving");
    setNovaLine(content.novaLines.moving);
  };

  const beginAwaken = () => {
    playClickSound();
    setStage("awaken");
    setNovaLine(content.novaLines.awaken);
  };

  const resetRun = () => {
    playClickSound();
    setStage("intro");
    setSlots([null, null]);
    setAttemptCount(0);
    setIsPerfectAwakening(false);
    setNovaLine(content.novaLines.intro);
    setFormulaText("");
    setSlotFlash(false);
    setMistShake(false);
    setAwakened(false);
  };

  const chooseEnergy = (value: number) => {
    if (stage !== "awaken" || awakened) return;
    if (slots[0] !== null && slots[1] !== null) return;

    playClickSound();
    const nextSlots: [SlotValue, SlotValue] = slots[0] === null ? [value, null] : [slots[0], value];
    setSlots(nextSlots);
    setSlotFlash(true);
    window.setTimeout(() => setSlotFlash(false), 240);

    if (nextSlots[0] !== null && nextSlots[1] === null) {
      setFormulaText("");
      setNovaLine(content.novaLines.firstPick(nextSlots[0]));
      return;
    }

    const x = nextSlots[0] ?? 0;
    const y = nextSlots[1] ?? 0;
    const sum = x + y;
    const nextAttemptCount = attemptCount + 1;
    setAttemptCount(nextAttemptCount);
    setFormulaText(`${x} + ${y} = ${sum}`);

    if (sum === content.target) {
      const perfect = nextAttemptCount === 1;
      setIsPerfectAwakening(perfect);
      setAwakened(true);
      setNovaLine(content.novaLines.correctPair(x, y));
      playCorrectSound();
      window.setTimeout(() => {
        playRewardSound();
        setStage("reward");
        setNovaLine(perfect ? content.novaLines.perfectReward : content.novaLines.retryReward);
      }, 900);
      return;
    }

    setNovaLine(content.novaLines.wrongPair(x, y, sum));
    setMistShake(true);
    playWrongSound();
    window.setTimeout(() => {
      setSlots([null, null]);
      setMistShake(false);
    }, 720);
  };

  const completePrototype = () => {
    playCompleteSound();
    setStage("complete");
    setNovaLine(content.novaLines.complete);
  };

  const sceneLit = stage === "reward" || stage === "complete";
  const showSpirit = stage === "encounter" || stage === "awaken" || stage === "reward" || stage === "complete";

  return (
    <main className={`min-h-screen overflow-hidden bg-[#07102f] text-white ${sceneLit ? "forest-awake" : ""}`}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(70,230,255,0.26),transparent_34%),radial-gradient(circle_at_82%_20%,rgba(168,85,247,0.28),transparent_34%),linear-gradient(180deg,#121d62,#07102f_58%,#05101e)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.14)_1px,transparent_2px)] bg-[size:34px_34px] opacity-30" />

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
            星光 +{stage === "complete" ? content.rewards.amount : 0}
          </div>
        </header>

        <section className="relative min-h-[520px] overflow-hidden rounded-[30px] border border-cyan-200/25 bg-[#0d1850]/82 shadow-[0_0_42px_rgba(34,211,238,0.2)] sm:min-h-[600px] lg:min-h-[680px]">
          <ForestScene lit={sceneLit} mistShake={mistShake} showSpirit={showSpirit} stage={stage} />

          {stage === "intro" && (
            <SceneCard className="bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[360px]">
              <p className="text-xs font-black tracking-[0.22em] text-cyan-200">冷开场</p>
              <h2 className="mt-2 text-2xl font-black leading-tight">{content.narrative.introTitle}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">{content.narrative.introLine}</p>
              <PrimaryButton onClick={goMoving}>{content.buttons.start}</PrimaryButton>
            </SceneCard>
          )}

          {stage === "moving" && (
            <SceneCard className="bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[360px]">
              <p className="text-xs font-black tracking-[0.22em] text-cyan-200">正在靠近</p>
              <h2 className="mt-2 text-2xl font-black leading-tight">沿着森林小路前进</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">{content.narrative.movingGoal}</p>
            </SceneCard>
          )}

          {stage === "encounter" && (
            <SceneCard className="bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[390px]">
              <p className="text-xs font-black tracking-[0.22em] text-cyan-200">遭遇</p>
              <h2 className="mt-2 text-2xl font-black leading-tight">{content.narrative.encounterTitle}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">{content.narrative.encounterLine}</p>
              <PrimaryButton onClick={beginAwaken}>{content.buttons.beginAwaken}</PrimaryButton>
            </SceneCard>
          )}

          {stage === "awaken" && (
            <div className="absolute inset-x-3 bottom-3 z-30 rounded-[28px] border border-cyan-200/25 bg-blue-950/80 p-3 shadow-[0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:inset-x-6 sm:bottom-5 sm:p-5">
              <div className="grid gap-3 lg:grid-cols-[280px_1fr] lg:items-center">
                <div className="text-center lg:text-left">
                  <p className="text-xs font-black tracking-[0.22em] text-amber-200">当前任务</p>
                  <h2 className="mt-1 text-xl font-black">{content.narrative.awakenTitle}</h2>
                  <div className={`mt-3 flex justify-center gap-3 lg:justify-start ${slotFlash ? "slot-flash" : ""}`}>
                    <EnergySlot value={slots[0]} />
                    <EnergySlot value={slots[1]} />
                  </div>
                  <p className="mt-2 min-h-6 text-base font-black text-amber-100">{formulaText || "选择两个数字能量球"}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-9 lg:grid-cols-9">
                  {content.energyNumbers.map((value) => (
                    <button
                      className="energy-ball flex aspect-square min-h-14 items-center justify-center rounded-full border border-cyan-100/50 bg-[radial-gradient(circle_at_35%_28%,#fef3c7,#facc15_34%,#06b6d4_72%,#1d4ed8)] text-xl font-black text-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.36)] transition hover:scale-105 active:scale-95 sm:min-h-12 lg:min-h-14"
                      data-testid={`energy-${value}`}
                      key={value}
                      onClick={() => chooseEnergy(value)}
                      type="button"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {stage === "reward" && (
            <SceneCard className="bottom-4 left-4 right-4 text-center sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2">
              <p className="text-xs font-black tracking-[0.22em] text-amber-200">{isPerfectAwakening ? "完美唤醒！" : "成功唤醒！"}</p>
              <h2 className="mt-2 text-3xl font-black leading-tight">{content.narrative.rewardTitle}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">森林亮起了一小段。</p>
              <p className="mt-3 rounded-full bg-amber-300 px-4 py-2 text-sm font-black text-slate-950">
                获得：{content.rewards.item} +{content.rewards.amount}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <PrimaryButton onClick={completePrototype}>{content.buttons.continueForward}</PrimaryButton>
                <SecondaryButton onClick={resetRun}>{content.buttons.replay}</SecondaryButton>
              </div>
            </SceneCard>
          )}

          {stage === "complete" && (
            <SceneCard className="bottom-4 left-4 right-4 text-center sm:left-1/2 sm:w-[440px] sm:-translate-x-1/2">
              <p className="text-xs font-black tracking-[0.22em] text-amber-200">星光唤醒完成</p>
              <h2 className="mt-2 text-3xl font-black leading-tight">{content.narrative.completeTitle}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-cyan-50/88">{content.narrative.completeLine}</p>
              <p className="mt-3 rounded-full bg-cyan-200/18 px-4 py-2 text-sm font-black text-cyan-50">
                {content.rewards.item}：{content.rewards.amount}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <PrimaryButton onClick={resetRun}>{content.buttons.replay}</PrimaryButton>
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
            <p className="text-xs font-black tracking-[0.18em] text-amber-200">目标</p>
            <p className="mt-1 text-sm font-black text-white">
              {stage === "awaken" ? content.narrative.awakenTitle : stage === "complete" ? "森林重新亮起来" : "找到迷雾里的小精灵"}
            </p>
          </div>
        </aside>
      </section>

      <style jsx global>{`
        @keyframes pathWalk {
          0% { transform: translateX(0) translateY(0) scale(1); }
          45% { transform: translateX(38vw) translateY(-10px) scale(1.03); }
          100% { transform: translateX(min(64vw, 620px)) translateY(4px) scale(1); }
        }
        @keyframes mistDrift {
          0%, 100% { transform: translateX(-8px) scale(1); opacity: 0.88; }
          50% { transform: translateX(10px) scale(1.06); opacity: 0.7; }
        }
        @keyframes mistShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 18px rgba(250,204,21,0.34); }
          50% { box-shadow: 0 0 34px rgba(250,204,21,0.7); }
        }
        .runner-moving { animation: pathWalk 1.55s ease-in-out forwards; }
        .sleepy-mist { animation: mistDrift 4s ease-in-out infinite; }
        .mist-shake { animation: mistShake 0.52s ease-in-out; }
        .energy-ball { animation: glowPulse 2.8s ease-in-out infinite; }
        .slot-flash [data-slot='filled'] { transform: scale(1.08); }
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
        .forest-awake .sleepy-mist { opacity: 0; transition: opacity 0.8s ease; }
        .forest-awake .forest-light { opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .runner-moving, .sleepy-mist, .mist-shake, .energy-ball { animation: none; }
        }
      `}</style>
    </main>
  );
}

function ForestScene({ lit, mistShake, showSpirit, stage }: { lit: boolean; mistShake: boolean; showSpirit: boolean; stage: ForestRpgStage }) {
  const runnerClass = stage === "moving" || stage === "encounter" || stage === "awaken" || stage === "reward" || stage === "complete" ? "runner-moving" : "";
  const spiritAwake = stage === "reward" || stage === "complete";

  return (
    <div className={`absolute inset-0 overflow-hidden ${lit ? "bg-emerald-500/10" : "bg-slate-950/20"}`}>
      <div className="absolute inset-x-[-10%] bottom-0 h-[58%] rounded-t-[50%] bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.28),rgba(21,128,61,0.22)_36%,rgba(5,46,22,0.72)_78%)]" />
      <div className="forest-light pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 bg-[radial-gradient(circle_at_70%_42%,rgba(250,204,21,0.28),transparent_30%),radial-gradient(circle_at_35%_72%,rgba(134,239,172,0.26),transparent_34%)]" />
      <div className="absolute bottom-[21%] left-[8%] right-[8%] h-12 rounded-[50%] bg-amber-100/12 blur-sm ring-1 ring-amber-200/20" />
      <div className="absolute bottom-[22%] left-[9%] right-[9%] h-2 rounded-full bg-gradient-to-r from-cyan-200/10 via-amber-200/30 to-emerald-200/18" />

      {Array.from({ length: 9 }).map((_, index) => (
        <span
          className="absolute bottom-[30%] h-20 w-10 rounded-t-full bg-gradient-to-b from-emerald-300/24 to-emerald-950/50"
          key={index}
          style={{ left: `${4 + index * 11}%`, height: `${72 + (index % 3) * 24}px` }}
        />
      ))}

      <div className={`absolute bottom-[24%] left-[8%] z-20 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-100/35 bg-cyan-300 text-xl font-black text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.46)] ${runnerClass}`} data-testid="forest-rpg-runner">
        你
      </div>

      {showSpirit && (
        <div className="absolute right-[15%] top-[28%] z-20 flex flex-col items-center gap-2 sm:right-[20%]">
          <div className={`relative h-24 w-24 rounded-[42%] border border-cyan-100/35 ${spiritAwake ? "bg-[radial-gradient(circle_at_50%_30%,#fef3c7,#86efac_52%,#22c55e)] shadow-[0_0_42px_rgba(134,239,172,0.7)]" : "bg-[radial-gradient(circle_at_50%_30%,#dbeafe,#94a3b8_54%,#475569)] shadow-[0_0_28px_rgba(148,163,184,0.48)]"}`}>
            <span className="absolute left-6 top-10 h-2 w-2 rounded-full bg-slate-900 shadow-[32px_0_0_#0f172a]" />
            <span className="absolute bottom-5 left-1/2 h-2 w-9 -translate-x-1/2 rounded-full bg-slate-900/45" />
          </div>
          <p className="rounded-full border border-cyan-100/25 bg-blue-950/58 px-3 py-1 text-xs font-black text-cyan-50">{spiritAwake ? "醒来了" : "轻轻睡着"}</p>
        </div>
      )}

      <div className={`sleepy-mist absolute right-[4%] top-[14%] z-10 h-72 w-72 rounded-full bg-slate-300/22 blur-2xl sm:right-[12%] ${mistShake ? "mist-shake" : ""}`} />
      <div className={`sleepy-mist absolute right-[20%] top-[26%] z-10 h-48 w-64 rounded-full bg-cyan-200/16 blur-2xl ${mistShake ? "mist-shake" : ""}`} />
    </div>
  );
}

function SceneCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`absolute z-40 rounded-[28px] border border-cyan-200/25 bg-blue-950/76 p-4 shadow-[0_0_36px_rgba(34,211,238,0.18)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function EnergySlot({ value }: { value: SlotValue }) {
  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-[24px] border-2 text-2xl font-black transition ${value === null ? "border-dashed border-cyan-100/45 bg-blue-950/54 text-cyan-100/60" : "border-amber-100/60 bg-amber-300 text-slate-950 shadow-[0_0_28px_rgba(250,204,21,0.6)]"}`}
      data-slot={value === null ? "empty" : "filled"}
    >
      {value ?? "?"}
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

function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="inline-flex min-h-12 items-center justify-center rounded-[22px] border border-cyan-200/30 bg-cyan-200/12 px-4 text-sm font-black text-cyan-50 transition active:scale-95" onClick={onClick} type="button">
      {children}
    </button>
  );
}
