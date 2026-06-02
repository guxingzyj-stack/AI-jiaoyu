"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FOREST_MAP_ASSETS } from "../lib/forestMapContentSource";
import type { S4ChapterAssets, S4ChapterContent, S4ChapterNode } from "../lib/s4ChapterTypes";

type NodeStatus = "locked" | "available" | "completed";

type S4ChapterRunnerProps = {
  assets: S4ChapterAssets;
  content: S4ChapterContent;
};

const s4VisualTheme = {
  shell: "min-h-screen overflow-x-hidden bg-[#070b2c] bg-[radial-gradient(circle_at_top,#1f2a6b,#0d1546_55%,#070b2c)] px-3 py-3 text-white",
  card: "rounded-[22px] border border-cyan-300/25 bg-[#101957]/85 shadow-[0_0_24px_rgba(71,150,255,0.22)] backdrop-blur-md",
  mapCard: "relative w-full overflow-hidden rounded-[24px] border border-cyan-300/25 shadow-[0_0_30px_rgba(71,150,255,0.25)]",
  primaryButton:
    "min-h-12 w-full rounded-[18px] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-3 py-3 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(252,211,77,0.4)] transition active:scale-95 disabled:opacity-40 disabled:shadow-none",
  secondaryButton:
    "min-h-11 rounded-full border border-cyan-200/35 bg-cyan-300/15 px-3 py-2 text-xs font-black text-cyan-50 active:scale-95"
};

export function S4ChapterRunner({ assets, content }: S4ChapterRunnerProps) {
  const firstNode = content.nodes[0];
  const [started, setStarted] = useState(false);
  const [currentId, setCurrentId] = useState(firstNode.id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [message, setMessage] = useState(content.nova.intro);
  const [selected, setSelected] = useState<string[]>([]);
  const [moving, setMoving] = useState(false);
  const [attemptCountByNode, setAttemptCountByNode] = useState<Record<string, number>>({});

  const current = content.nodes.find((node) => node.id === currentId) ?? firstNode;
  const coreNode = content.nodes[content.nodes.length - 1];
  const rewardTotal = content.nodes.filter((node) => node.id !== coreNode.id).length;
  const rewardCount = completed.filter((id) => id !== coreNode.id).length;
  const chapterDone = completed.includes(coreNode.id);

  const statusById = useMemo(() => {
    const map = new Map<string, NodeStatus>();
    for (const node of content.nodes) {
      if (completed.includes(node.id)) {
        map.set(node.id, "completed");
        continue;
      }
      const unlocked = (node.unlockAfter ?? []).every((id) => completed.includes(id));
      map.set(node.id, unlocked ? "available" : "locked");
    }
    return map;
  }, [completed, content.nodes]);

  function startChapter() {
    setStarted(true);
    setMessage(content.nova.idle);
  }

  function pickNode(node: S4ChapterNode) {
    if (moving) return;
    const status = statusById.get(node.id) ?? "locked";
    if (status === "locked") {
      setMessage("前面的星光还没亮，先完成正在发光的地点。");
      return;
    }
    if (node.id === currentId) return;
    setSelected([]);
    setMoving(true);
    setMessage(`正走向${node.shortTitle}，到达后再看看这里发生了什么。`);
    window.setTimeout(() => {
      setCurrentId(node.id);
      setMoving(false);
      setMessage(status === "completed" ? "这里已经亮起来了，可以回看，也可以去下一个发光地点。" : node.mechanic.hint);
    }, 650);
  }

  function completeNode(node: S4ChapterNode) {
    setCompleted((prev) => (prev.includes(node.id) ? prev : [...prev, node.id]));
    setSelected([]);
    setAttemptCountByNode((prev) => ({ ...prev, [node.id]: 0 }));
    setMessage(node.mechanic.successSummary ?? node.mechanic.success);
  }

  function resetChapter() {
    setStarted(false);
    setCurrentId(firstNode.id);
    setCompleted([]);
    setMessage(content.nova.intro);
    setSelected([]);
    setMoving(false);
    setAttemptCountByNode({});
  }

  return (
    <main className={`${s4VisualTheme.shell} ${themeClass(content.theme)}`}>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_22px_24px,rgba(255,255,255,0.14)_1px,transparent_2px)] bg-[size:34px_34px] opacity-45" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_12%,rgba(125,211,252,0.18),transparent_32%),radial-gradient(circle_at_82%_22%,rgba(252,211,77,0.16),transparent_30%),radial-gradient(circle_at_54%_86%,rgba(167,139,250,0.16),transparent_34%)]" />

      <div className="relative mx-auto flex w-full max-w-md flex-col gap-3">
        <ChapterHud content={content} rewardCount={rewardCount} rewardTotal={rewardTotal} coreDone={chapterDone} />

        {!started ? (
          <IntroPanel assets={assets} content={content} onStart={startChapter} />
        ) : (
          <>
            <ChapterStage
              assets={assets}
              chapterDone={chapterDone}
              completed={completed}
              content={content}
              currentId={currentId}
              onPick={pickNode}
              statusById={statusById}
            />
            <ActionPanel
              assets={assets}
              completed={completed}
              content={content}
              current={current}
              currentStatus={statusById.get(current.id) ?? "locked"}
              message={message}
              moving={moving}
              onComplete={completeNode}
              rewardCount={rewardCount}
              rewardTotal={rewardTotal}
              selected={selected}
              attemptCount={attemptCountByNode[current.id] ?? 0}
              setMessage={setMessage}
              setAttemptCountByNode={setAttemptCountByNode}
              setSelected={setSelected}
            />
            <button className="mx-auto rounded-full border border-cyan-300/25 bg-blue-950/45 px-4 py-1.5 text-[11px] font-black text-cyan-200 active:scale-95" onClick={resetChapter} type="button">
              重新开始
            </button>
          </>
        )}

        {chapterDone && <CompleteOverlay assets={assets} content={content} onReplay={resetChapter} rewardCount={rewardTotal} />}
      </div>
    </main>
  );
}

function ChapterHud({
  content,
  coreDone,
  rewardCount,
  rewardTotal
}: {
  content: S4ChapterContent;
  coreDone: boolean;
  rewardCount: number;
  rewardTotal: number;
}) {
  return (
    <header className={`${s4VisualTheme.card} p-3`}>
      <div className="flex items-center justify-between gap-2">
        <Link className="inline-flex min-h-9 items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 text-xs font-black text-cyan-50 active:scale-95" href="/adventure">
          返回
        </Link>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-sm font-black tracking-wide text-amber-100">{content.chapterTitle}</h1>
          <p className="truncate text-[10px] font-bold text-cyan-200/80">{content.chapterSubtitle}</p>
        </div>
        <span className="w-12" />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <HudPill label={content.hud.rewardLabel} value={`${rewardCount}/${rewardTotal}`} tone="amber" />
        <HudPill label={stageHudLabel(content.theme)} value={coreDone ? "完成" : "进行中"} tone="cyan" />
        <HudPill label={content.hud.coreLabel} value={coreDone ? "已亮" : "未亮"} tone="emerald" />
      </div>
      <p className="mt-2 text-center text-[11px] font-bold leading-4 text-cyan-200/90">{content.mapHint}</p>
    </header>
  );
}

function HudPill({ label, tone, value }: { label: string; tone: "emerald" | "amber" | "cyan"; value: string }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200/30 text-emerald-100"
      : tone === "amber"
        ? "border-amber-200/30 text-amber-100"
        : "border-cyan-200/30 text-cyan-100";
  return (
    <div className={`flex min-h-[54px] flex-col items-center justify-center rounded-[14px] border bg-blue-950/55 px-1 py-1.5 text-center ${toneClass}`}>
      <span className="h-3.5 w-3.5 rounded-full bg-current opacity-80 shadow-[0_0_10px_currentColor]" />
      <span className="mt-0.5 max-w-full truncate text-[9px] font-bold leading-none opacity-90">{label}</span>
      <span className="text-[11px] font-black leading-tight">{value}</span>
    </div>
  );
}

function IntroPanel({ assets, content, onStart }: { assets: S4ChapterAssets; content: S4ChapterContent; onStart: () => void }) {
  return (
    <section className={`${s4VisualTheme.mapCard} flex min-h-[calc(100dvh-132px)] items-end bg-[#06122c]`}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${assets.background})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06122c] via-[#06122c]/45 to-[#06122c]/12" />
      <div className="relative w-full p-4">
        <div className="rounded-[24px] border border-white/15 bg-[#101957]/82 p-4 text-center shadow-[0_0_26px_rgba(34,211,238,0.18)] backdrop-blur-md">
          <Image alt="Nova" className="mx-auto h-16 w-16 rounded-full object-cover shadow-[0_0_20px_rgba(125,211,252,0.35)]" height={128} src={assets.nova} width={128} />
          <h2 className="mt-3 text-xl font-black leading-tight text-white">{content.intro.title}</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">{content.intro.body}</p>
          <button className={`${s4VisualTheme.primaryButton} mt-4`} onClick={onStart} type="button">
            {content.intro.button}
          </button>
        </div>
      </div>
    </section>
  );
}

function ChapterStage({
  assets,
  chapterDone,
  completed,
  content,
  currentId,
  onPick,
  statusById
}: {
  assets: S4ChapterAssets;
  chapterDone: boolean;
  completed: string[];
  content: S4ChapterContent;
  currentId: string;
  onPick: (node: S4ChapterNode) => void;
  statusById: Map<string, NodeStatus>;
}) {
  const current = content.nodes.find((node) => node.id === currentId) ?? content.nodes[0];
  const workNodes = content.nodes.filter((node) => node.mechanic.type !== "core");
  const coreNode = content.nodes.find((node) => node.mechanic.type === "core");
  const coreReady = workNodes.every((node) => completed.includes(node.id));

  if (content.theme === "geometry") {
    return (
      <StageFrame assets={assets} tone="violet" topLine={chapterDone ? "山门完全打开，山脊光路亮起。" : "把合适的形状石装进机关槽。"}>
        <div className="absolute left-1/2 top-[46%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-[34px] border-2 border-violet-200/35 bg-[#111b56]/78 shadow-[0_0_32px_rgba(167,139,250,0.34)]">
          <div className={`absolute inset-8 rounded-[26px] border-4 ${coreReady ? "border-amber-200 bg-amber-300/12 shadow-[0_0_24px_rgba(252,211,77,0.55)]" : "border-dashed border-cyan-100/35 bg-[#06122c]/55"}`} />
          <div className="absolute left-1/2 top-8 -translate-x-1/2">
            <ShapeCard active={completed.includes("gate") || current.id === "gate"} label="形状槽" shape={completed.includes("gate") ? "三角形" : "空位"} />
          </div>
          <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-1.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <span key={index} className={`flex h-9 w-10 items-center justify-center rounded-[10px] border ${completed.includes("triangle-path") ? "border-amber-200 bg-amber-300/25" : "border-violet-100/30 bg-[#06122c]/60"}`}>
                <TriangleIcon lit={completed.includes("triangle-path")} />
              </span>
            ))}
          </div>
          <div className={`absolute right-6 top-16 h-16 w-11 rounded-full border ${completed.includes("mirror-cave") ? "border-cyan-100 bg-cyan-300/20 shadow-[0_0_18px_rgba(103,232,249,0.55)]" : "border-cyan-100/30 bg-[#06122c]/60"}`} />
        </div>
        <PlayerBadge className="absolute bottom-[92px] left-8" />
        <StepBar current={current} nodes={content.nodes} onPick={onPick} statusById={statusById} word="机槽" />
      </StageFrame>
    );
  }

  if (content.theme === "time") {
    return (
      <StageFrame assets={assets} tone="cyan" topLine={chapterDone ? "小火车准点运行，时间城重新转动。" : "调度时钟、站台和小火车。"}>
        <div className="absolute left-5 top-[82px] w-24 rounded-[18px] border border-cyan-200/25 bg-[#0a2350]/78 p-2 text-center">
          <p className="text-[10px] font-black text-cyan-100">调度台</p>
          <ClockFace lit={completed.includes("station")} time={completed.includes("station") ? "3:00" : "0:00"} />
        </div>
        <div className="absolute right-5 top-[82px] h-32 w-24 rounded-[20px] border border-amber-200/25 bg-[#0a2350]/78 p-2 text-center">
          <p className="text-[10px] font-black text-amber-100">钟楼</p>
          <div className={`mx-auto mt-3 h-16 w-10 rounded-full border ${chapterDone ? "border-amber-200 bg-amber-300/20" : "border-cyan-100/30 bg-[#06122c]/65"}`} />
        </div>
        <div className="absolute left-10 right-10 top-[224px] h-2 rounded-full bg-cyan-100/28 shadow-[0_0_12px_rgba(103,232,249,0.35)]" />
        <div className={`absolute left-[42%] top-[202px] h-16 w-20 rounded-[18px] border-2 ${completed.includes("arrival-bridge") ? "border-amber-200 bg-amber-300/25 shadow-[0_0_20px_rgba(252,211,77,0.55)]" : "border-cyan-100/35 bg-[#0a2350]/85"}`}>
          <div className="mx-auto mt-4 h-5 w-12 rounded-full bg-cyan-200/50" />
        </div>
        <PlayerBadge className="absolute left-[calc(42%+8px)] top-[174px]" />
        <StepBar current={current} nodes={content.nodes} onPick={onPick} statusById={statusById} word="轨道" />
      </StageFrame>
    );
  }

  if (content.theme === "fraction") {
    return (
      <StageFrame assets={assets} tone="emerald" topLine={chapterDone ? "分享泉亮起来，大家分得一样公平。" : "在分享桌上把圆饼、花园和星光分公平。"}>
        <div className="absolute left-1/2 top-[44%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-emerald-200/30 bg-[#0a2f42]/80 p-4 shadow-[0_0_30px_rgba(52,211,153,0.24)]">
          <div className="grid grid-cols-[42px_1fr_42px] items-center gap-2">
            <div className="h-11 w-11 rounded-full border border-emerald-100/35 bg-emerald-300/18" />
            <div className="rounded-[22px] border border-emerald-100/35 bg-[#06122c]/65 p-3">
              <div className="mx-auto grid h-24 w-24 grid-cols-2 overflow-hidden rounded-full border-2 border-emerald-100/55">
                {Array.from({ length: 4 }).map((_, index) => (
                  <span key={index} className={`border border-emerald-100/20 ${index < (completed.includes("quarter-garden") ? 2 : completed.includes("gate") ? 1 : 0) ? "bg-emerald-300/45" : "bg-[#06122c]/45"}`} />
                ))}
              </div>
              <div className="mt-3">
                <FractionBar label="小河" parts={4} litParts={completed.includes("equal-river") ? 2 : 0} />
              </div>
            </div>
            <PlayerBadge />
          </div>
        </div>
        <StepBar current={current} nodes={content.nodes} onPick={onPick} statusById={statusById} word="分享" />
      </StageFrame>
    );
  }

  return (
    <StageFrame assets={assets} tone="amber" topLine={chapterDone ? "五个星环都回到星核，守护者能量汇集完成。" : "把五个区域的星光送回中央星核。"}>
      <div className="absolute left-1/2 top-[45%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/25 bg-[#101957]/75 shadow-[0_0_34px_rgba(252,211,77,0.26)]">
        <button
          className={`absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 text-[11px] font-black transition active:scale-95 ${coreReady ? "border-amber-200 bg-amber-300/25 text-amber-50 shadow-[0_0_28px_rgba(252,211,77,0.72)]" : "border-amber-100/35 bg-[#06122c]/70 text-amber-100/60"}`}
          onClick={() => coreNode && onPick(coreNode)}
          type="button"
        >
          星核
        </button>
        {workNodes.map((node, index) => {
          const angle = -90 + index * 72;
          const lit = completed.includes(node.id);
          return (
            <button
              key={node.id}
              className={`absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[9px] font-black transition active:scale-95 ${lit ? "border-amber-200 bg-amber-300/25 text-amber-50 shadow-[0_0_16px_rgba(252,211,77,0.55)]" : statusById.get(node.id) === "available" ? "border-cyan-200/70 bg-cyan-300/14 text-cyan-50" : "border-slate-300/30 bg-slate-800/60 text-slate-200/55"}`}
              onClick={() => onPick(node)}
              style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-96px) rotate(${-angle}deg)` }}
              type="button"
            >
              {node.shortTitle}
            </button>
          );
        })}
      </div>
      <PlayerBadge className="absolute bottom-[92px] left-1/2 -translate-x-1/2" />
    </StageFrame>
  );
}

function StageFrame({ assets, children, tone, topLine }: { assets: S4ChapterAssets; children: React.ReactNode; tone: "amber" | "cyan" | "emerald" | "violet"; topLine: string }) {
  const toneClass = tone === "emerald" ? "border-emerald-100/25 text-emerald-50" : tone === "amber" ? "border-amber-100/25 text-amber-50" : tone === "violet" ? "border-violet-100/25 text-violet-50" : "border-cyan-100/25 text-cyan-50";
  return (
    <section className={`${s4VisualTheme.mapCard} min-h-[390px] bg-[#06122c]`}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${assets.background})` }} />
      <div className="absolute inset-0 bg-[#06122c]/62" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(252,211,77,0.18),transparent_34%),radial-gradient(circle_at_24%_78%,rgba(34,211,238,0.18),transparent_40%)]" />
      <div className={`absolute left-3 right-3 top-3 rounded-full border bg-[#06122c]/72 px-3 py-1.5 text-center text-[10px] font-black leading-4 backdrop-blur-md ${toneClass}`}>{topLine}</div>
      {children}
    </section>
  );
}

function StepBar({ current, nodes, onPick, statusById, word }: { current: S4ChapterNode; nodes: S4ChapterNode[]; onPick: (node: S4ChapterNode) => void; statusById: Map<string, NodeStatus>; word: string }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))` }}>
      {nodes.map((node, index) => (
        <StageStepButton key={node.id} active={current.id === node.id} index={index + 1} node={node} onPick={onPick} status={statusById.get(node.id) ?? "locked"} word={word} />
      ))}
    </div>
  );
}

function StageStepButton({ active, index, node, onPick, status, word }: { active: boolean; index: number; node: S4ChapterNode; onPick: (node: S4ChapterNode) => void; status: NodeStatus; word: string }) {
  const tone =
    status === "locked"
      ? "border-slate-400/35 bg-[#1b2740]/82 text-slate-200/65"
      : status === "completed"
        ? "border-amber-300/80 bg-amber-300/18 text-amber-50 shadow-[0_0_14px_rgba(252,211,77,0.42)]"
        : "border-cyan-200/75 bg-cyan-300/14 text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.34)]";
  return (
    <button className={`min-h-16 rounded-[16px] border px-1.5 py-2 text-center transition active:scale-95 ${tone} ${active ? "ring-2 ring-white/70" : ""}`} data-testid={`stage-step-${node.id}`} onClick={() => onPick(node)} type="button">
      <span className="text-[10px] font-black opacity-75">{word} {index}</span>
      <span className="mt-1 block truncate text-xs font-black">{node.shortTitle}</span>
      <span className="mt-1 block text-[9px] font-black opacity-80">{status === "completed" ? "已亮" : status === "available" ? "可操作" : "未开启"}</span>
    </button>
  );
}

function PlayerBadge({ className = "" }: { className?: string }) {
  return <span aria-label="你在这里" className={`pointer-events-none z-20 h-9 w-9 bg-contain bg-bottom bg-no-repeat drop-shadow-[0_0_10px_rgba(103,232,249,0.6)] ${className}`} style={{ backgroundImage: `url(${FOREST_MAP_ASSETS.player})` }} />;
}

function ActionPanel({
  assets,
  completed,
  content,
  current,
  currentStatus,
  message,
  moving,
  onComplete,
  rewardCount,
  rewardTotal,
  selected,
  attemptCount,
  setMessage,
  setAttemptCountByNode,
  setSelected
}: {
  assets: S4ChapterAssets;
  completed: string[];
  content: S4ChapterContent;
  current: S4ChapterNode;
  currentStatus: NodeStatus;
  message: string;
  moving: boolean;
  onComplete: (node: S4ChapterNode) => void;
  rewardCount: number;
  rewardTotal: number;
  selected: string[];
  attemptCount: number;
  setMessage: (message: string) => void;
  setAttemptCountByNode: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const currentDone = currentStatus === "completed";
  const isCore = current.mechanic.type === "core";
  const coreReady = isCore && rewardCount >= rewardTotal && (current.unlockAfter ?? []).every((id) => completed.includes(id));

  function showWrongHint() {
    const nextCount = attemptCount + 1;
    setAttemptCountByNode((prev) => ({ ...prev, [current.id]: nextCount }));
    setMessage(nextCount >= 2 ? (current.mechanic.strongHint ?? current.mechanic.hint) : (current.mechanic.wrongHint ?? current.mechanic.hint));
  }

  function choose(option: string) {
    if (currentDone) {
      setMessage("这个地点已经点亮了，去看看下一个发光地点。");
      return;
    }
    const answer = current.mechanic.answer;
    if (Array.isArray(answer)) {
      const expected = answer[selected.length];
      if (option !== expected) {
        setSelected([]);
        showWrongHint();
        return;
      }
      const next = [...selected, option];
      setSelected(next);
      if (next.length >= answer.length) {
        onComplete(current);
      } else {
        setMessage(`很好，已放好 ${next.length}/${answer.length} 步，继续找下一步。`);
      }
      return;
    }
    if (option === answer) {
      onComplete(current);
    } else {
      showWrongHint();
    }
  }

  return (
    <section className={`${s4VisualTheme.card} p-3`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black text-white">{current.title}</h2>
        </div>
        <span className="rounded-full border border-cyan-300/30 bg-blue-950/55 px-2 py-0.5 text-[10px] font-black text-cyan-100">
          {moving ? "移动中" : currentDone ? "已点亮" : "可操作"}
        </span>
      </div>
      <p className="mt-1 text-xs font-bold leading-5 text-cyan-100/90">{current.description}</p>

      <div className="mt-2 flex items-start gap-2 rounded-[16px] border border-violet-300/25 bg-blue-950/55 p-2">
        <Image alt="Nova" className="h-9 w-9 shrink-0 rounded-full object-cover shadow-[0_0_14px_rgba(125,211,252,0.35)]" height={72} src={assets.nova} width={72} />
        <p className="text-xs font-bold leading-5 text-cyan-50">{message}</p>
      </div>

      <div className="mt-3 rounded-[16px] border border-white/10 bg-[#06122c]/58 p-2.5">
        <p className="mt-1 text-sm font-black leading-5 text-cyan-50">{moving ? "角色正在走过去..." : current.mechanic.prompt}</p>
        {selected.length > 0 && <p className="mt-1 text-[11px] font-bold text-amber-100">当前尝试：{selected.join(" → ")}</p>}
      </div>

      {!isCore && <MechanicStage current={current} currentDone={currentDone} selected={selected} />}

      {isCore ? (
        <button className={`${s4VisualTheme.primaryButton} mt-3`} disabled={!coreReady || currentDone} onClick={() => onComplete(current)} type="button">
          {currentDone ? coreDoneLabel(content.theme) : coreActionLabel(content.theme)}
        </button>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(current.mechanic.options ?? []).map((option, index) => {
            const picked = selected.includes(option);
            return (
              <button
                key={`${option}-${index}`}
                className={`min-h-12 rounded-[16px] border px-2 py-2 text-sm font-black transition active:scale-95 disabled:opacity-45 ${
                  picked ? "border-amber-200 bg-amber-300/25 text-amber-50" : optionTone(current.mechanic.type)
                }`}
                disabled={currentDone || moving}
                onClick={() => choose(option)}
                type="button"
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px] font-black text-cyan-100">
        <div className="rounded-[14px] border border-cyan-200/15 bg-[#06122c]/55 px-2 py-2">{content.hud.rewardLabel} {rewardCount}/{rewardTotal}</div>
        <div className="rounded-[14px] border border-cyan-200/15 bg-[#06122c]/55 px-2 py-2">{content.hud.coreLabel}</div>
      </div>
    </section>
  );
}

function MechanicStage({
  current,
  currentDone,
  selected
}: {
  current: S4ChapterNode;
  currentDone: boolean;
  selected: string[];
}) {
  const type = current.mechanic.type;
  const answer = current.mechanic.answer;
  const correctList = Array.isArray(answer) ? answer : typeof answer === "string" ? [answer] : [];

  if (type === "shape-match" || type === "mirror-pair" || type === "path-build") {
    const labels = current.mechanic.options ?? [];
    return (
      <div className="mt-3 rounded-[16px] border border-violet-200/18 bg-violet-300/10 p-2.5">
        {type === "mirror-pair" ? (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <ShapeCard label="左边" shape="三角形" active />
            <div className="h-16 w-1 rounded-full bg-cyan-200/50 shadow-[0_0_12px_rgba(103,232,249,0.45)]" />
            <div className="grid grid-cols-3 gap-1">
              {labels.map((label) => (
                <ShapeCard key={label} label={label} shape={label} active={currentDone || selected.includes(label)} />
              ))}
            </div>
          </div>
        ) : type === "path-build" ? (
          <div className="grid gap-2">
            <div className="flex items-center justify-center gap-1.5">
              {Array.from({ length: current.mechanic.targetCount ?? correctList.length }).map((_, index) => (
                <div
                  key={index}
                  className={`flex h-10 w-12 items-center justify-center rounded-[12px] border-2 ${
                    currentDone || index < selected.length
                      ? "border-amber-200 bg-amber-300/25 shadow-[0_0_14px_rgba(252,211,77,0.45)]"
                      : "border-dashed border-cyan-100/35 bg-[#06122c]/45"
                  }`}
                >
                  <TriangleIcon lit={currentDone || index < selected.length} />
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] font-bold text-cyan-100/80">只把三角石放进缺口。</p>
          </div>
        ) : (
          <div className="grid gap-2">
            <div className="flex items-center justify-center gap-2">
              {correctList.map((label, index) => (
                <div key={`${label}-${index}`} className="rounded-[12px] border-2 border-dashed border-cyan-100/35 bg-[#06122c]/45 p-1.5">
                  <ShapeCard label={selected[index] ?? "空位"} shape={selected[index] ?? "空位"} active={Boolean(selected[index]) || currentDone} />
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] font-bold text-cyan-100/80">看空位，再选对应形状。</p>
          </div>
        )}
      </div>
    );
  }

  if (type === "set-clock" || type === "duration-bridge" || type === "order-train") {
    return (
      <div className="mt-3 rounded-[16px] border border-cyan-200/18 bg-cyan-300/10 p-2.5">
        {type === "order-train" ? (
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-1.5">
              {["第1班", "第2班", "第3班"].map((label, index) => (
                <div key={label} className={`rounded-[12px] border p-1.5 text-center ${index < selected.length || currentDone ? "border-amber-200 bg-amber-300/20" : "border-cyan-100/25 bg-[#06122c]/45"}`}>
                  <p className="text-[9px] font-black text-cyan-100/80">{label}</p>
                  <p className="mt-1 text-xs font-black text-white">{selected[index] ?? "--:--"}</p>
                </div>
              ))}
            </div>
            <TrainTrack lit={currentDone} stops={currentDone ? ["2:00", "3:00", "4:00"] : selected} />
          </div>
        ) : (
          <div className="grid grid-cols-[78px_1fr] items-center gap-3">
            <ClockFace time={currentDone ? String(current.mechanic.answer ?? "3:00") : "0:00"} lit={currentDone} />
            <div>
              <p className="text-[11px] font-black text-cyan-50">{type === "set-clock" ? "目标时间" : "到达时间"}</p>
              <p className="mt-1 text-xl font-black text-amber-100">{currentDone ? String(current.mechanic.answer ?? "") : "看选项试一试"}</p>
              <p className="mt-1 text-[10px] font-bold leading-4 text-cyan-100/80">从出发时间往后数。</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "make-half" || type === "quarter-garden" || type === "equal-river") {
    return (
      <div className="mt-3 rounded-[16px] border border-emerald-200/18 bg-emerald-300/10 p-2.5">
        {type === "quarter-garden" ? (
          <div className="grid gap-2">
            <FractionGrid selected={selected} lit={currentDone} />
            <p className="text-center text-[10px] font-bold text-emerald-50/80">四块一样大，点亮两块。</p>
          </div>
        ) : type === "equal-river" ? (
          <div className="grid gap-2">
            <FractionBar label="左岸" parts={2} litParts={1} />
            <FractionBar label="右岸" parts={4} litParts={currentDone || selected.includes("2/4") ? 2 : 0} />
          </div>
        ) : (
          <div className="grid grid-cols-3 items-end gap-1.5">
            <SplitBlock label="左边大" left={70} right={30} active={selected.includes("左边大一点")} />
            <SplitBlock label="一样大" left={50} right={50} active={currentDone || selected.includes("两边一样大") || selected.includes("一半")} />
            <SplitBlock label="右边大" left={30} right={70} active={selected.includes("右边大一点")} />
          </div>
        )}
      </div>
    );
  }

  if (type === "memory-choice" || type === "memory-sequence") {
    return (
      <div className="mt-3 rounded-[16px] border border-amber-200/18 bg-amber-300/10 p-2.5">
        {current.id === "sea-memory" ? (
          <div className="flex flex-wrap justify-center gap-1.5">
            {Array.from({ length: 9 }).map((_, index) => {
              const value = String(index + 1);
              const lit = selected.includes(value) || (currentDone && ["3", "6", "9"].includes(value));
              return <span key={value} className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black ${lit ? "border-amber-200 bg-amber-300/30 text-amber-50" : "border-cyan-100/25 bg-[#06122c]/45 text-cyan-100/65"}`}>{value}</span>;
            })}
          </div>
        ) : current.id === "shape-time-memory" ? (
          <div className="grid gap-2">
            <div className="flex items-center justify-center gap-3">
              <ShapeCard label={selected.includes("三角形") || currentDone ? "三角形" : "形状石"} shape={selected.includes("三角形") || currentDone ? "三角形" : "空位"} active={selected.includes("三角形") || currentDone} />
              <ClockFace time="3:30" lit={selected.includes("3:30") || currentDone} />
            </div>
            <p className="text-center text-[10px] font-bold text-amber-50/80">先三角形，再 3:30。</p>
          </div>
        ) : current.id === "share-memory" ? (
          <div className="grid gap-2">
            <FractionBar label="左岸" parts={2} litParts={1} />
            <FractionBar label="右岸" parts={4} litParts={currentDone || selected.includes("2/4") ? 2 : 0} />
          </div>
        ) : (
          <p className="text-center text-xs font-bold leading-5 text-amber-50/85">选出真正帮世界变亮的方法。</p>
        )}
      </div>
    );
  }

  return null;
}

function stageHudLabel(theme: S4ChapterContent["theme"]) {
  switch (theme) {
    case "geometry":
      return "拼装中";
    case "time":
      return "小火车";
    case "fraction":
      return "朋友心情";
    case "core":
      return "守护者能量";
    default:
      return "进行中";
  }
}

function coreActionLabel(theme: S4ChapterContent["theme"]) {
  switch (theme) {
    case "geometry":
      return "打开几何山门";
    case "time":
      return "启动钟楼转动";
    case "fraction":
      return "点亮分享泉";
    case "core":
      return "点亮数学星核";
    default:
      return "完成任务";
  }
}

function coreDoneLabel(theme: S4ChapterContent["theme"]) {
  switch (theme) {
    case "geometry":
      return "山门已打开";
    case "time":
      return "钟楼已转动";
    case "fraction":
      return "分享泉已亮";
    case "core":
      return "星核已点亮";
    default:
      return "已完成";
  }
}

function optionTone(type: S4ChapterNode["mechanic"]["type"]) {
  if (type === "make-half" || type === "quarter-garden" || type === "equal-river") return "border-emerald-200/30 bg-emerald-300/12 text-emerald-50";
  if (type === "set-clock" || type === "duration-bridge" || type === "order-train") return "border-cyan-200/30 bg-cyan-300/12 text-cyan-50";
  if (type === "memory-choice" || type === "memory-sequence") return "border-amber-200/30 bg-amber-300/12 text-amber-50";
  return "border-violet-200/30 bg-violet-300/12 text-violet-50";
}

function ShapeCard({ active, label, shape }: { active?: boolean; label: string; shape: string }) {
  return (
    <div className={`flex min-h-14 flex-col items-center justify-center rounded-[12px] border px-1.5 py-1.5 text-center ${active ? "border-amber-200 bg-amber-300/20" : "border-cyan-100/25 bg-[#06122c]/45"}`}>
      {shape === "空位" ? <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border-2 border-dashed border-cyan-100/50 text-[10px] text-cyan-100/70">?</span> : shape.includes("圆") ? <span className="h-7 w-7 rounded-full border-4 border-cyan-100 bg-cyan-300/25" /> : shape.includes("正方") || shape.includes("方") ? <span className="h-7 w-7 rounded-[6px] border-4 border-emerald-100 bg-emerald-300/25" /> : <TriangleIcon lit={active} />}
      <span className="mt-1 max-w-[52px] truncate text-[9px] font-black text-cyan-50">{label}</span>
    </div>
  );
}

function TriangleIcon({ lit }: { lit?: boolean }) {
  return <span className={`block h-0 w-0 border-x-[13px] border-b-[24px] border-x-transparent ${lit ? "border-b-amber-200 drop-shadow-[0_0_10px_rgba(252,211,77,0.6)]" : "border-b-violet-200/80"}`} />;
}

function ClockFace({ lit, time }: { lit?: boolean; time: string }) {
  const minute = time.endsWith(":30") ? "rotate-90" : "rotate-0";
  const hour = time.startsWith("3") ? "rotate-90" : time.startsWith("4") ? "rotate-[120deg]" : "rotate-[60deg]";
  return (
    <div className={`relative mx-auto h-16 w-16 rounded-full border-4 ${lit ? "border-amber-200 bg-amber-300/15" : "border-cyan-100/45 bg-[#06122c]/65"}`}>
      <span className="absolute left-1/2 top-1 h-2.5 w-1 -translate-x-1/2 rounded-full bg-cyan-100/75" />
      <span className="absolute left-1/2 top-1/2 h-1 w-5 origin-left rounded-full bg-cyan-100" />
      <span className={`absolute left-1/2 top-1/2 h-1 w-6 origin-left rounded-full bg-amber-200 ${minute}`} />
      <span className={`absolute left-1/2 top-1/2 h-1 w-4 origin-left rounded-full bg-white ${hour}`} />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
    </div>
  );
}

function TrainTrack({ lit, stops }: { lit?: boolean; stops: string[] }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {["2:00", "3:00", "4:00"].map((stop, index) => {
        const active = lit || stops[index] === stop;
        return (
          <div key={stop} className={`flex min-h-9 flex-1 items-center justify-center rounded-[12px] border text-xs font-black ${active ? "border-amber-200 bg-amber-300/20 text-amber-50" : "border-cyan-100/25 bg-[#06122c]/45 text-cyan-100/65"}`}>
            {stops[index] ?? stop}
          </div>
        );
      })}
    </div>
  );
}

function FractionGrid({ lit, selected }: { lit?: boolean; selected: string[] }) {
  return (
    <div className="mx-auto grid h-24 w-24 grid-cols-2 overflow-hidden rounded-[16px] border-2 border-emerald-100/60">
      {["第1块", "第2块", "第3块", "第4块"].map((label) => (
        <div key={label} className={`border border-emerald-100/25 ${lit || selected.includes(label) ? "bg-emerald-300/45" : "bg-[#06122c]/45"}`} />
      ))}
    </div>
  );
}

function FractionBar({ label, litParts, parts }: { label: string; litParts: number; parts: number }) {
  return (
    <div className="grid grid-cols-[36px_1fr] items-center gap-2">
      <span className="text-xs font-black text-emerald-50">{label}</span>
      <div className="grid h-8 overflow-hidden rounded-[10px] border border-emerald-100/45" style={{ gridTemplateColumns: `repeat(${parts}, minmax(0, 1fr))` }}>
        {Array.from({ length: parts }).map((_, index) => (
          <span key={index} className={`border-r border-emerald-100/25 last:border-r-0 ${index < litParts ? "bg-emerald-300/45" : "bg-[#06122c]/45"}`} />
        ))}
      </div>
    </div>
  );
}

function SplitBlock({ active, label, left, right }: { active?: boolean; label: string; left: number; right: number }) {
  return (
    <div className={`rounded-[12px] border p-1.5 ${active ? "border-amber-200 bg-amber-300/15" : "border-emerald-100/25 bg-[#06122c]/45"}`}>
      <div className="flex h-12 overflow-hidden rounded-[8px] border border-emerald-100/35">
        <span className="bg-emerald-300/45" style={{ width: `${left}%` }} />
        <span className="bg-cyan-300/30" style={{ width: `${right}%` }} />
      </div>
      <p className="mt-1 text-center text-[9px] font-black text-emerald-50">{label}</p>
    </div>
  );
}

function CompleteOverlay({
  assets,
  content,
  onReplay,
  rewardCount
}: {
  assets: S4ChapterAssets;
  content: S4ChapterContent;
  onReplay: () => void;
  rewardCount: number;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#06122c]/88 p-4 backdrop-blur-sm">
      <section className="relative my-auto w-full max-w-sm overflow-hidden rounded-[28px] border border-amber-200/40 bg-[#101957]/95 p-5 text-center shadow-[0_0_40px_rgba(252,211,77,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(252,211,77,0.25),transparent_55%),radial-gradient(circle_at_20%_90%,rgba(34,211,238,0.18),transparent_38%)]" />
        <div className="relative">
          <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-amber-300/70 bg-amber-300/15 shadow-[0_0_26px_rgba(252,211,77,0.55)]">
            <Image alt="" className="h-[72px] w-[72px] rounded-full object-cover" height={144} src={assets.reward} width={144} />
          </div>
          <h2 className="mt-3 text-xl font-black text-amber-100">{content.completion.title}</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-cyan-50">{content.completion.summary}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-black text-cyan-100">
            {content.completion.stats.slice(0, 3).map((stat) => (
              <span key={stat} className="flex min-h-12 items-center justify-center rounded-[12px] border border-cyan-200/25 bg-[#06122c]/55 px-1.5 py-1.5 leading-4">
                {stat}
              </span>
            ))}
          </div>
          <p className="mt-3 rounded-[16px] border border-amber-200/25 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">
            {content.hud.rewardLabel} x{rewardCount}
          </p>
          <div className="mt-4 grid gap-2">
            <Link className="inline-flex min-h-12 items-center justify-center rounded-[18px] bg-gradient-to-r from-amber-300 to-amber-400 px-3 py-3 text-sm font-black text-slate-950 active:scale-95" href={content.completion.nextHref}>
              {content.completion.nextLabel}
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <button className={s4VisualTheme.secondaryButton} onClick={onReplay} type="button">
                {content.completion.replayLabel}
              </button>
              <Link className={`inline-flex items-center justify-center ${s4VisualTheme.secondaryButton}`} href="/adventure">
                回到入口
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function themeClass(theme: S4ChapterContent["theme"]) {
  switch (theme) {
    case "geometry":
      return "selection:bg-violet-300/40";
    case "time":
      return "selection:bg-cyan-300/40";
    case "fraction":
      return "selection:bg-emerald-300/40";
    case "core":
      return "selection:bg-amber-300/40";
    default:
      return "";
  }
}
