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

export function S4ChapterRunner({ assets, content }: S4ChapterRunnerProps) {
  const firstNode = content.nodes[0];
  const [started, setStarted] = useState(false);
  const [currentId, setCurrentId] = useState(firstNode.id);
  const [playerAt, setPlayerAt] = useState(firstNode.id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [message, setMessage] = useState(content.nova.intro);
  const [selected, setSelected] = useState<string[]>([]);
  const [moving, setMoving] = useState(false);

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
    const status = statusById.get(node.id) ?? "locked";
    if (status === "locked") {
      setMessage("前面的星光还没亮，先完成正在发光的地点。");
      return;
    }
    setCurrentId(node.id);
    setSelected([]);
    setMoving(true);
    window.setTimeout(() => {
      setPlayerAt(node.id);
      setMoving(false);
      setMessage(status === "completed" ? "这里已经亮起来了，可以去下一个地点。" : node.mechanic.prompt);
    }, 260);
  }

  function completeNode(node: S4ChapterNode) {
    setCompleted((prev) => (prev.includes(node.id) ? prev : [...prev, node.id]));
    setSelected([]);
    setMessage(node.mechanic.success);
  }

  function resetChapter() {
    setStarted(false);
    setCurrentId(firstNode.id);
    setPlayerAt(firstNode.id);
    setCompleted([]);
    setMessage(content.nova.intro);
    setSelected([]);
    setMoving(false);
  }

  return (
    <main className={`min-h-screen overflow-x-hidden bg-[#081437] text-white ${themeClass(content.theme)}`}>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_24px_28px,rgba(255,255,255,0.12)_1px,transparent_2px)] bg-[size:34px_34px] opacity-50" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 pb-4 pt-3 sm:px-5">
        <header className="mb-2 grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[22px] border border-white/15 bg-[#06122c]/70 px-2.5 py-2 shadow-[0_0_22px_rgba(56,189,248,0.18)] backdrop-blur-md">
          <Link className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 py-2 text-xs font-black text-cyan-50 active:scale-95" href="/adventure">
            入口
          </Link>
          <div className="min-w-0 text-center">
            <h1 className="truncate text-base font-black leading-tight sm:text-xl">{content.chapterTitle}</h1>
            <p className="truncate text-[10px] font-bold text-cyan-100/75 sm:text-xs">{content.chapterSubtitle}</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-200/25 bg-amber-300/10 px-2.5 py-2 text-[11px] font-black text-amber-100">
            <span>{content.hud.rewardLabel}</span>
            <span>{rewardCount}/{rewardTotal}</span>
          </div>
        </header>

        {!started ? (
          <IntroPanel assets={assets} content={content} onStart={startChapter} />
        ) : (
          <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <section className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-cyan-200/18 bg-[#06122c] shadow-[0_0_28px_rgba(56,189,248,0.2)] sm:min-h-[560px] lg:min-h-[720px]">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${assets.background})` }} />
              <div className="absolute inset-0 bg-gradient-to-b from-[#06122c]/15 via-transparent to-[#06122c]/76" />
              <div className="absolute left-3 right-3 top-3 rounded-full border border-cyan-100/20 bg-[#06122c]/58 px-3 py-2 text-center text-xs font-black text-cyan-50 backdrop-blur-md">
                {chapterDone ? content.nova.complete : content.mapHint}
              </div>

              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {content.edges.map(([from, to]) => {
                  const a = content.nodes.find((node) => node.id === from);
                  const b = content.nodes.find((node) => node.id === to);
                  if (!a || !b) return null;
                  const lit = completed.includes(from) && (completed.includes(to) || (statusById.get(to) === "available" && currentId === to));
                  return (
                    <line
                      key={`${from}-${to}`}
                      x1={a.position.x}
                      x2={b.position.x}
                      y1={a.position.y}
                      y2={b.position.y}
                      className={lit ? "stroke-amber-200/70" : "stroke-cyan-100/25"}
                      strokeDasharray={lit ? undefined : "2 3"}
                      strokeWidth="1.2"
                    />
                  );
                })}
              </svg>

              {content.nodes.map((node) => (
                <MapNode
                  key={node.id}
                  asset={assets.nodes[node.assetKey]}
                  isCurrent={currentId === node.id}
                  isPlayerHere={playerAt === node.id}
                  node={node}
                  onClick={() => pickNode(node)}
                  status={statusById.get(node.id) ?? "locked"}
                />
              ))}
            </section>

            <aside className="grid gap-2">
              <ActionPanel
                assets={assets}
                completed={completed}
                content={content}
                current={current}
                currentStatus={statusById.get(current.id) ?? "locked"}
                moving={moving}
                onComplete={completeNode}
                rewardCount={rewardCount}
                rewardTotal={rewardTotal}
                selected={selected}
                setMessage={setMessage}
                setSelected={setSelected}
              />
              <NovaPanel assets={assets} message={message} />
            </aside>
          </div>
        )}

        {chapterDone && <CompleteOverlay assets={assets} content={content} onReplay={resetChapter} rewardCount={rewardTotal} />}
      </div>
    </main>
  );
}

function IntroPanel({ assets, content, onStart }: { assets: S4ChapterAssets; content: S4ChapterContent; onStart: () => void }) {
  return (
    <section className="relative flex min-h-[calc(100dvh-88px)] items-end overflow-hidden rounded-[30px] border border-cyan-200/20 bg-[#06122c] shadow-[0_0_28px_rgba(56,189,248,0.22)]">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${assets.background})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06122c] via-[#06122c]/30 to-[#06122c]/5" />
      <div className="relative w-full p-4 sm:p-6">
        <div className="mx-auto max-w-lg rounded-[28px] border border-white/15 bg-[#071537]/76 p-5 text-center shadow-[0_0_26px_rgba(34,211,238,0.18)] backdrop-blur-md">
          <Image alt="Nova" className="mx-auto h-20 w-20 rounded-full object-cover shadow-[0_0_24px_rgba(125,211,252,0.35)]" height={160} src={assets.nova} width={160} />
          <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">{content.intro.title}</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">{content.intro.body}</p>
          <button
            className="mt-4 w-full rounded-[22px] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-5 py-3 text-base font-black text-slate-950 shadow-[0_0_22px_rgba(252,211,77,0.4)] active:scale-95"
            onClick={onStart}
            type="button"
          >
            {content.intro.button}
          </button>
        </div>
      </div>
    </section>
  );
}

function MapNode({
  asset,
  isCurrent,
  isPlayerHere,
  node,
  onClick,
  status
}: {
  asset: string;
  isCurrent: boolean;
  isPlayerHere: boolean;
  node: S4ChapterNode;
  onClick: () => void;
  status: NodeStatus;
}) {
  const available = status === "available";
  const completed = status === "completed";
  return (
    <button
      aria-label={node.title}
      className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 transition active:scale-95 ${status === "locked" ? "opacity-45 grayscale" : ""}`}
      data-testid={`map-node-${node.id}`}
      onClick={onClick}
      style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
      type="button"
    >
      <span
        className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-full border bg-[#071537]/72 shadow-[0_0_18px_rgba(34,211,238,0.2)] sm:h-[88px] sm:w-[88px] ${
          completed
            ? "border-amber-200/80 shadow-[0_0_26px_rgba(252,211,77,0.55)]"
            : available
              ? "border-cyan-200/80 shadow-[0_0_22px_rgba(34,211,238,0.55)]"
              : "border-white/20"
        } ${isCurrent ? "ring-2 ring-white/70" : ""}`}
      >
        <Image alt="" className="h-[58px] w-[58px] rounded-full object-cover sm:h-[70px] sm:w-[70px]" height={140} src={asset} width={140} />
        {available && !completed && <span className="absolute -top-3 rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black text-slate-950">点这里</span>}
        {completed && <span className="absolute -right-1 -top-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-black text-slate-950">已亮</span>}
        {isPlayerHere && <span className="absolute -bottom-3 h-5 w-5 rounded-full border-2 border-white bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.8)]" />}
      </span>
      <span className="mt-2 block max-w-[90px] rounded-full bg-[#06122c]/70 px-2 py-1 text-[10px] font-black text-cyan-50 backdrop-blur-sm">{node.shortTitle}</span>
    </button>
  );
}

function ActionPanel({
  assets,
  completed,
  content,
  current,
  currentStatus,
  moving,
  onComplete,
  rewardCount,
  rewardTotal,
  selected,
  setMessage,
  setSelected
}: {
  assets: S4ChapterAssets;
  completed: string[];
  content: S4ChapterContent;
  current: S4ChapterNode;
  currentStatus: NodeStatus;
  moving: boolean;
  onComplete: (node: S4ChapterNode) => void;
  rewardCount: number;
  rewardTotal: number;
  selected: string[];
  setMessage: (message: string) => void;
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const currentDone = currentStatus === "completed";
  const isCore = current.mechanic.type === "core";
  const coreReady = isCore && rewardCount >= rewardTotal && (current.unlockAfter ?? []).every((id) => completed.includes(id));

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
        setMessage(current.mechanic.hint);
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
      setMessage(current.mechanic.hint);
    }
  }

  return (
    <section className="rounded-[24px] border border-cyan-200/18 bg-[#071537]/82 p-3 shadow-[0_0_20px_rgba(56,189,248,0.12)] backdrop-blur-md">
      <div className="mb-3 flex items-center gap-3">
        <Image alt="" className="h-14 w-14 rounded-full object-cover" height={112} src={assets.nodes[current.assetKey]} width={112} />
        <div className="min-w-0">
          <p className="text-[10px] font-black text-amber-100">{currentStatus === "locked" ? "未解锁" : currentDone ? "已完成" : "当前地点"}</p>
          <h2 className="truncate text-lg font-black text-white">{current.title}</h2>
          <p className="line-clamp-2 text-xs font-bold leading-5 text-cyan-50/80">{current.description}</p>
        </div>
      </div>

      <div className="rounded-[18px] border border-white/10 bg-[#06122c]/58 p-3">
        <p className="text-sm font-black leading-6 text-cyan-50">{moving ? "角色正在走过去..." : current.mechanic.prompt}</p>
        {selected.length > 0 && <p className="mt-1 text-[11px] font-bold text-amber-100">已点：{selected.join(" → ")}</p>}
      </div>

      {!isCore && (
        <MechanicStage current={current} currentDone={currentDone} selected={selected} />
      )}

      {isCore ? (
        <button
          className="mt-3 w-full rounded-[20px] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 py-3 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(252,211,77,0.35)] active:scale-95 disabled:opacity-45 disabled:shadow-none"
          disabled={!coreReady || currentDone}
          onClick={() => onComplete(current)}
          type="button"
        >
          {currentDone ? "核心已点亮" : "放入星光，点亮核心"}
        </button>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(current.mechanic.options ?? []).map((option, index) => {
            const picked = selected.includes(option);
            return (
              <button
                key={`${option}-${index}`}
                className={`min-h-12 rounded-[18px] border px-2 text-sm font-black transition active:scale-95 ${
                  picked ? "border-amber-200 bg-amber-300/25 text-amber-50" : `${optionTone(current.mechanic.type)}`
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
      <div className="mt-3 rounded-[18px] border border-violet-200/18 bg-violet-300/10 p-3">
        {type === "mirror-pair" ? (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <ShapeCard label="左边镜像" shape="三角形" active />
            <div className="h-20 w-1 rounded-full bg-cyan-200/50 shadow-[0_0_12px_rgba(103,232,249,0.45)]" />
            <div className="grid grid-cols-3 gap-1.5">
              {labels.map((label) => (
                <ShapeCard key={label} label={label} shape={label} active={currentDone || selected.includes(label)} />
              ))}
            </div>
          </div>
        ) : type === "path-build" ? (
          <div className="grid gap-3">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: current.mechanic.targetCount ?? correctList.length }).map((_, index) => (
                <div
                  key={index}
                  className={`flex h-12 w-14 items-center justify-center rounded-[14px] border-2 ${
                    currentDone || index < selected.length
                      ? "border-amber-200 bg-amber-300/25 shadow-[0_0_14px_rgba(252,211,77,0.45)]"
                      : "border-dashed border-cyan-100/35 bg-[#06122c]/45"
                  }`}
                >
                  <TriangleIcon lit={currentDone || index < selected.length} />
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] font-bold text-cyan-100/80">只把三角石放进缺口，山路才会连起来。</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="flex items-center justify-center gap-2">
              {correctList.map((label, index) => (
                <div key={`${label}-${index}`} className="rounded-[14px] border-2 border-dashed border-cyan-100/35 bg-[#06122c]/45 p-2">
                  <ShapeCard label={selected[index] ?? "空位"} shape={selected[index] ?? label} active={Boolean(selected[index]) || currentDone} />
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] font-bold text-cyan-100/80">先看机关空位，再从按钮里选对应形状。</p>
          </div>
        )}
      </div>
    );
  }

  if (type === "set-clock" || type === "duration-bridge" || type === "order-train") {
    return (
      <div className="mt-3 rounded-[18px] border border-cyan-200/18 bg-cyan-300/10 p-3">
        {type === "order-train" ? (
          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-2">
              {["第1班", "第2班", "第3班"].map((label, index) => (
                <div key={label} className={`rounded-[14px] border p-2 text-center ${index < selected.length || currentDone ? "border-amber-200 bg-amber-300/20" : "border-cyan-100/25 bg-[#06122c]/45"}`}>
                  <p className="text-[10px] font-black text-cyan-100/80">{label}</p>
                  <p className="mt-1 text-sm font-black text-white">{selected[index] ?? "--:--"}</p>
                </div>
              ))}
            </div>
            <TrainTrack lit={currentDone} stops={currentDone ? ["2:00", "3:00", "4:00"] : selected} />
          </div>
        ) : (
          <div className="grid grid-cols-[92px_1fr] items-center gap-3">
            <ClockFace time={String(current.mechanic.answer ?? "3:00")} lit={currentDone} />
            <div>
              <p className="text-xs font-black text-cyan-50">{type === "set-clock" ? "目标时间" : "到达时间"}</p>
              <p className="mt-1 text-2xl font-black text-amber-100">{String(current.mechanic.answer ?? "")}</p>
              <p className="mt-1 text-[11px] font-bold leading-4 text-cyan-100/80">从题目里的出发时间往后数，再点正确站台。</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "make-half" || type === "quarter-garden" || type === "equal-river") {
    return (
      <div className="mt-3 rounded-[18px] border border-emerald-200/18 bg-emerald-300/10 p-3">
        {type === "quarter-garden" ? (
          <div className="grid gap-2">
            <FractionGrid selected={selected} lit={currentDone} />
            <p className="text-center text-[11px] font-bold text-emerald-50/80">四块一样大，点亮两块就是 2/4。</p>
          </div>
        ) : type === "equal-river" ? (
          <div className="grid gap-2">
            <FractionBar label="一半" parts={2} litParts={1} />
            <FractionBar label="2/4" parts={4} litParts={currentDone || selected.includes("2/4") ? 2 : 0} />
          </div>
        ) : (
          <div className="grid grid-cols-3 items-end gap-2">
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
      <div className="mt-3 rounded-[18px] border border-amber-200/18 bg-amber-300/10 p-3">
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
              <ShapeCard label="三角形" shape="三角形" active={selected.includes("三角形") || currentDone} />
              <ClockFace time="3:30" lit={selected.includes("3:30") || currentDone} />
            </div>
            <p className="text-center text-[11px] font-bold text-amber-50/80">先修三角路，再算列车到 3:30。</p>
          </div>
        ) : current.id === "share-memory" ? (
          <div className="grid gap-2">
            <FractionBar label="1/2" parts={2} litParts={1} />
            <FractionBar label="2/4" parts={4} litParts={currentDone || selected.includes("2/4") ? 2 : 0} />
          </div>
        ) : (
          <p className="text-center text-xs font-bold leading-5 text-amber-50/85">从之前的冒险里选出真正帮世界变亮的方法。</p>
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
    <div className={`flex min-h-16 flex-col items-center justify-center rounded-[14px] border px-2 py-2 text-center ${active ? "border-amber-200 bg-amber-300/20" : "border-cyan-100/25 bg-[#06122c]/45"}`}>
      {shape.includes("圆") ? <span className="h-8 w-8 rounded-full border-4 border-cyan-100 bg-cyan-300/25" /> : shape.includes("正方") || shape.includes("方") ? <span className="h-8 w-8 rounded-[6px] border-4 border-emerald-100 bg-emerald-300/25" /> : <TriangleIcon lit={active} />}
      <span className="mt-1 text-[10px] font-black text-cyan-50">{label}</span>
    </div>
  );
}

function TriangleIcon({ lit }: { lit?: boolean }) {
  return <span className={`block h-0 w-0 border-x-[16px] border-b-[28px] border-x-transparent ${lit ? "border-b-amber-200 drop-shadow-[0_0_10px_rgba(252,211,77,0.6)]" : "border-b-violet-200/80"}`} />;
}

function ClockFace({ lit, time }: { lit?: boolean; time: string }) {
  const minute = time.endsWith(":30") ? "rotate-90" : "rotate-0";
  const hour = time.startsWith("3") ? "rotate-90" : time.startsWith("4") ? "rotate-[120deg]" : "rotate-[60deg]";
  return (
    <div className={`relative mx-auto h-20 w-20 rounded-full border-4 ${lit ? "border-amber-200 bg-amber-300/15" : "border-cyan-100/45 bg-[#06122c]/65"}`}>
      <span className="absolute left-1/2 top-1 h-3 w-1 -translate-x-1/2 rounded-full bg-cyan-100/75" />
      <span className="absolute left-1/2 top-1/2 h-1 w-6 origin-left rounded-full bg-cyan-100" />
      <span className={`absolute left-1/2 top-1/2 h-1 w-7 origin-left rounded-full bg-amber-200 ${minute}`} />
      <span className={`absolute left-1/2 top-1/2 h-1 w-5 origin-left rounded-full bg-white ${hour}`} />
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
          <div key={stop} className={`flex min-h-10 flex-1 items-center justify-center rounded-[12px] border text-xs font-black ${active ? "border-amber-200 bg-amber-300/20 text-amber-50" : "border-cyan-100/25 bg-[#06122c]/45 text-cyan-100/65"}`}>
            {stops[index] ?? stop}
          </div>
        );
      })}
    </div>
  );
}

function FractionGrid({ lit, selected }: { lit?: boolean; selected: string[] }) {
  return (
    <div className="mx-auto grid h-28 w-28 grid-cols-2 overflow-hidden rounded-[18px] border-2 border-emerald-100/60">
      {["第1块", "第2块", "第3块", "第4块"].map((label) => (
        <div key={label} className={`border border-emerald-100/25 ${lit || selected.includes(label) ? "bg-emerald-300/45" : "bg-[#06122c]/45"}`} />
      ))}
    </div>
  );
}

function FractionBar({ label, litParts, parts }: { label: string; litParts: number; parts: number }) {
  return (
    <div className="grid grid-cols-[42px_1fr] items-center gap-2">
      <span className="text-xs font-black text-emerald-50">{label}</span>
      <div className="grid h-9 overflow-hidden rounded-[12px] border border-emerald-100/45" style={{ gridTemplateColumns: `repeat(${parts}, minmax(0, 1fr))` }}>
        {Array.from({ length: parts }).map((_, index) => (
          <span key={index} className={`border-r border-emerald-100/25 last:border-r-0 ${index < litParts ? "bg-emerald-300/45" : "bg-[#06122c]/45"}`} />
        ))}
      </div>
    </div>
  );
}

function SplitBlock({ active, label, left, right }: { active?: boolean; label: string; left: number; right: number }) {
  return (
    <div className={`rounded-[14px] border p-2 ${active ? "border-amber-200 bg-amber-300/15" : "border-emerald-100/25 bg-[#06122c]/45"}`}>
      <div className="flex h-16 overflow-hidden rounded-[10px] border border-emerald-100/35">
        <span className="bg-emerald-300/45" style={{ width: `${left}%` }} />
        <span className="bg-cyan-300/30" style={{ width: `${right}%` }} />
      </div>
      <p className="mt-1 text-center text-[10px] font-black text-emerald-50">{label}</p>
    </div>
  );
}

function NovaPanel({ assets, message }: { assets: S4ChapterAssets; message: string }) {
  return (
    <section className="flex items-center gap-2 rounded-[22px] border border-cyan-200/18 bg-[#071537]/78 p-2.5 backdrop-blur-md">
      <Image alt="Nova" className="h-14 w-14 shrink-0 rounded-full object-cover shadow-[0_0_18px_rgba(125,211,252,0.35)]" height={112} src={assets.nova} width={112} />
      <p className="text-sm font-bold leading-5 text-cyan-50/90">{message}</p>
    </section>
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
      <section className="relative my-auto w-full max-w-md overflow-hidden rounded-[30px] border border-amber-200/40 bg-[#0d1f47]/96 p-5 text-center shadow-[0_0_42px_rgba(252,211,77,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(252,211,77,0.25),transparent_55%)]" />
        <div className="relative">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-200/70 bg-amber-300/15 shadow-[0_0_30px_rgba(252,211,77,0.5)]">
            <Image alt="" className="h-20 w-20 rounded-full object-cover" height={160} src={assets.reward} width={160} />
          </div>
          <h2 className="mt-3 text-2xl font-black text-amber-100">{content.completion.title}</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-cyan-50">{content.completion.summary}</p>
          <div className="mt-4 grid gap-2">
            {content.completion.stats.map((stat) => (
              <p key={stat} className="rounded-[16px] border border-cyan-200/18 bg-[#06122c]/55 px-3 py-2 text-xs font-black text-cyan-50">
                {stat}
              </p>
            ))}
            <p className="rounded-[16px] border border-amber-200/25 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">
              {content.hud.rewardLabel} x{rewardCount}
            </p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link className="inline-flex min-h-12 items-center justify-center rounded-[20px] bg-gradient-to-r from-amber-300 to-amber-400 px-3 text-sm font-black text-slate-950 active:scale-95" href={content.completion.nextHref}>
              {content.completion.nextLabel}
            </Link>
            <button className="min-h-12 rounded-[20px] border border-cyan-200/35 bg-cyan-300/14 px-3 text-sm font-black text-cyan-50 active:scale-95" onClick={onReplay} type="button">
              {content.completion.replayLabel}
            </button>
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
