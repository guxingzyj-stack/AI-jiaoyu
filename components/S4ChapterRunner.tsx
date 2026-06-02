"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
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
  const [playerAt, setPlayerAt] = useState(firstNode.id);
  const [targetId, setTargetId] = useState<string | null>(null);
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
    setTargetId(node.id);
    setSelected([]);
    setMoving(true);
    setMessage(`正走向${node.shortTitle}，到达后再看看这里发生了什么。`);
    window.setTimeout(() => {
      setPlayerAt(node.id);
      setCurrentId(node.id);
      setMoving(false);
      setTargetId(null);
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
    setPlayerAt(firstNode.id);
    setCompleted([]);
    setMessage(content.nova.intro);
    setSelected([]);
    setMoving(false);
    setTargetId(null);
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
            <MapStage
              assets={assets}
              chapterDone={chapterDone}
              completed={completed}
              content={content}
              currentId={currentId}
              onPick={pickNode}
              playerAt={playerAt}
              statusById={statusById}
              targetId={targetId}
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
        <HudPill label="星片" value={`${rewardCount}/${rewardTotal}`} tone="amber" />
        <HudPill label="地点" value={`${rewardCount + (coreDone ? 1 : 0)}/${rewardTotal + 1}`} tone="cyan" />
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

function MapStage({
  assets,
  chapterDone,
  completed,
  content,
  currentId,
  onPick,
  playerAt,
  statusById,
  targetId
}: {
  assets: S4ChapterAssets;
  chapterDone: boolean;
  completed: string[];
  content: S4ChapterContent;
  currentId: string;
  onPick: (node: S4ChapterNode) => void;
  playerAt: string;
  statusById: Map<string, NodeStatus>;
  targetId: string | null;
}) {
  const markerNode = content.nodes.find((node) => node.id === (targetId ?? playerAt)) ?? content.nodes[0];
  return (
    <section className={`${s4VisualTheme.mapCard} bg-[#06122c]`} style={{ aspectRatio: "1 / 1" }}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${assets.background})` }} />
      <div className={`absolute inset-0 ${mapOverlayClass(content.theme)}`} />
      <div className="absolute inset-0 bg-[#06122c]/35" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(252,211,77,0.2),transparent_38%),radial-gradient(circle_at_24%_76%,rgba(34,211,238,0.2),transparent_42%)]" />

      <div className="absolute left-3 right-3 top-3 rounded-full border border-cyan-100/20 bg-[#06122c]/64 px-3 py-1.5 text-center text-[10px] font-black leading-4 text-cyan-50 backdrop-blur-md">
        {chapterDone ? content.nova.complete : "点发光地点，修好这一段。"}
      </div>

      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {content.edges.map(([from, to]) => {
          const a = content.nodes.find((node) => node.id === from);
          const b = content.nodes.find((node) => node.id === to);
          if (!a || !b) return null;
          const lit = completed.includes(from) && (completed.includes(to) || statusById.get(to) === "available");
          return (
            <line
              key={`${from}-${to}`}
              x1={a.position.x}
              x2={b.position.x}
              y1={a.position.y}
              y2={b.position.y}
              className={lit ? "stroke-amber-200/80" : "stroke-cyan-100/35"}
              strokeDasharray={lit ? undefined : "2 2"}
              strokeLinecap="round"
              strokeWidth="0.9"
            />
          );
        })}
      </svg>

      {content.nodes.map((node) => (
        <MapNode
          key={node.id}
          asset={assets.nodes[node.assetKey]}
          isCurrent={currentId === node.id}
          node={node}
          onClick={() => onPick(node)}
          status={statusById.get(node.id) ?? "locked"}
        />
      ))}
      <PlayerMarker node={markerNode} />
    </section>
  );
}

function MapNode({
  asset,
  isCurrent,
  node,
  onClick,
  status
}: {
  asset: string;
  isCurrent: boolean;
  node: S4ChapterNode;
  onClick: () => void;
  status: NodeStatus;
}) {
  const available = status === "available";
  const completed = status === "completed";
  const ring =
    status === "locked"
      ? "border-slate-400/45 bg-[#1b2740]/85 opacity-80"
      : completed
        ? "border-amber-300/85 bg-[#0b1f44]/85 shadow-[0_0_16px_rgba(252,211,77,0.6)]"
        : "border-cyan-200/85 bg-[#0b1f44]/85 shadow-[0_0_16px_rgba(34,211,238,0.6)]";

  return (
    <button
      aria-label={node.title}
      className={`absolute z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 backdrop-blur-[1px] transition active:scale-95 ${ring} ${isCurrent ? "ring-2 ring-white/70" : ""}`}
      data-testid={`map-node-${node.id}`}
      onClick={onClick}
      style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
      type="button"
    >
      <span className={`block h-9 w-9 overflow-hidden rounded-full ${status === "locked" ? "opacity-50 grayscale" : ""}`}>
        <Image alt="" className="h-full w-full object-cover" height={72} src={asset} width={72} />
      </span>
      {status === "locked" && <span className="absolute -right-1 -top-1 rounded-full bg-slate-700 px-1 text-[9px] font-black text-cyan-50">锁</span>}
      {completed && <span className="absolute -right-1 -top-1 rounded-full bg-amber-300 px-1.5 text-[9px] font-black text-slate-950">亮</span>}
      {available && !completed && <span className="absolute -top-3 rounded-full bg-cyan-200 px-1.5 py-0.5 text-[9px] font-black text-slate-950">可去</span>}
      <span className="pointer-events-none absolute -bottom-7 max-w-[58px] truncate whitespace-nowrap rounded-full bg-[#06122c]/85 px-1.5 py-0.5 text-[9px] font-black text-cyan-50">{node.shortTitle}</span>
    </button>
  );
}

function PlayerMarker({ node }: { node: S4ChapterNode }) {
  return (
    <span
      className="pointer-events-none absolute z-20 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-cyan-300 text-[10px] font-black text-slate-950 shadow-[0_0_14px_rgba(103,232,249,0.85)] transition-[left,top] duration-[650ms] ease-out"
      style={{ left: `${node.position.x}%`, top: `calc(${node.position.y}% - 34px)` }}
    >
      你
    </span>
  );
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
          {currentDone ? "核心已点亮" : "放入星光，点亮核心"}
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

function mapOverlayClass(theme: S4ChapterContent["theme"]) {
  switch (theme) {
    case "geometry":
      return "bg-[radial-gradient(circle_at_72%_34%,rgba(167,139,250,0.28),transparent_42%),radial-gradient(circle_at_26%_78%,rgba(252,211,77,0.18),transparent_38%)]";
    case "time":
      return "bg-[radial-gradient(circle_at_62%_24%,rgba(252,211,77,0.25),transparent_40%),radial-gradient(circle_at_28%_76%,rgba(34,211,238,0.2),transparent_42%)]";
    case "fraction":
      return "bg-[radial-gradient(circle_at_70%_28%,rgba(110,231,183,0.23),transparent_42%),radial-gradient(circle_at_30%_78%,rgba(252,211,77,0.18),transparent_38%)]";
    case "core":
      return "bg-[radial-gradient(circle_at_50%_28%,rgba(252,211,77,0.26),transparent_38%),radial-gradient(circle_at_24%_78%,rgba(125,211,252,0.18),transparent_42%)]";
    default:
      return "";
  }
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
