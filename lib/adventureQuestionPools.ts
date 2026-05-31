// S2.1 两岛题库池 + 二刷不重复。
// 进入关卡（挂载）与「再玩一次」时，从对应岛屿的题库里抽一组题，优先避开上一轮，
// 用 localStorage 记录最近一次的索引（不可用时退回纯随机）。只产出「基础配置 + 本轮题目覆盖」
// 的 AdventureConfig，不改 7-Beat 流程、不改引擎渲染。倍数海仍是数字路、森林岛仍是凑成10。
import type { AdventureConfig, AnswerOption, SequenceQuestion } from "./adventures";

const LAST_KEY = "zx_adventurer_last_questions";
type LastEntry = { stone?: number; tower?: number };
type LastMap = Record<string, LastEntry>;

function readLast(): LastMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LAST_KEY) || "{}") as LastMap;
  } catch {
    return {};
  }
}

function writeLast(map: LastMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_KEY, JSON.stringify(map));
  } catch {
    /* localStorage 不可用：忽略，仍能随机运行 */
  }
}

// 随机挑一个索引：优先满足 allow 且不等于 avoid（上一轮）；都不满足时逐步放宽。
function pickIndex(length: number, opts: { avoid?: number; allow?: (i: number) => boolean } = {}): number {
  const all = Array.from({ length }, (_, i) => i);
  const allowed = opts.allow ? all.filter(opts.allow) : all;
  const avoiding = allowed.filter((i) => i !== opts.avoid);
  const pool = avoiding.length ? avoiding : allowed.length ? allowed : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== 倍数海（数字路 / 找规律）=====
type PathSeed = { start: number[]; step: number };

const multiplesStonePool: PathSeed[] = [
  { start: [2, 4, 6, 8], step: 2 },
  { start: [5, 10, 15, 20], step: 5 },
  { start: [10, 20, 30, 40], step: 10 },
  { start: [4, 8, 12, 16], step: 4 },
  { start: [6, 12, 18, 24], step: 6 }
];

const multiplesTowerPool: PathSeed[] = [
  { start: [3, 6, 9, 12], step: 3 },
  { start: [4, 8, 12, 16], step: 4 },
  { start: [6, 12, 18, 24], step: 6 },
  { start: [5, 10, 15, 20], step: 5 },
  { start: [7, 14, 21, 28], step: 7 }
];

// 三个互不相同、含正确答案的近似选项（答案、答案-1、答案+步长）。
function pathOptions(answer: number, step: number): AnswerOption[] {
  const uniq = Array.from(new Set([answer - 1, answer, answer + step].filter((n) => n > 0)));
  let k = 2;
  while (uniq.length < 3) {
    const c = answer + k;
    if (c > 0 && !uniq.includes(c)) uniq.push(c);
    k++;
  }
  return uniq.slice(0, 3).sort((a, b) => a - b);
}

function buildPathQuestion(seed: PathSeed): SequenceQuestion & { step: number } {
  const answer = seed.start[seed.start.length - 1] + seed.step;
  return { sequence: seed.start.map(String), answer, options: pathOptions(answer, seed.step), step: seed.step };
}

// 由种子按原规律生成 3 段递进数字路（与倍数海原塔结构一致，仅数字随抽到的题变化）。
function buildClimb(seed: PathSeed, segments = 3): SequenceQuestion[] {
  const result: SequenceQuestion[] = [];
  let window = [...seed.start];
  for (let s = 0; s < segments; s++) {
    const answer = window[window.length - 1] + seed.step;
    result.push({ sequence: window.map(String), answer, options: pathOptions(answer, seed.step) });
    window = window.map((n) => n + seed.step);
  }
  return result;
}

function resolveMultiplesSea(base: AdventureConfig): AdventureConfig {
  const last = readLast();
  const entry = last[base.islandId] ?? {};
  const si = pickIndex(multiplesStonePool.length, { avoid: entry.stone });
  const stoneSeed = multiplesStonePool[si];
  // 塔的步长必须与石头不同，才能让 Beat 6「别过度概括」成立（Nova 把 +石头步长 说成普适规律）。
  const ti = pickIndex(multiplesTowerPool.length, {
    avoid: entry.tower,
    allow: (i) => multiplesTowerPool[i].step !== stoneSeed.step
  });
  const towerSeed = multiplesTowerPool[ti];
  last[base.islandId] = { stone: si, tower: ti };
  writeLast(last);

  return {
    ...base,
    stone: buildPathQuestion(stoneSeed),
    towerSteps: buildClimb(towerSeed, 3),
    towerStep: towerSeed.step,
    truthStatement: `今天你学会了数字路！所有这样的数字路都是每次加${stoneSeed.step}。`
  };
}

// ===== 森林岛（凑成10 / 数字组合）=====
type ForestStoneSeed = { have: number; target: number };
const forestStonePool: ForestStoneSeed[] = [
  { have: 1, target: 10 },
  { have: 2, target: 10 },
  { have: 3, target: 10 },
  { have: 4, target: 10 },
  { have: 5, target: 10 },
  { have: 6, target: 10 },
  { have: 7, target: 10 },
  { have: 8, target: 10 },
  { have: 9, target: 10 }
];

type ForestPairSeed = { a: number; b: number };
const forestPairPool: ForestPairSeed[] = [
  { a: 1, b: 9 },
  { a: 2, b: 8 },
  { a: 3, b: 7 },
  { a: 4, b: 6 },
  { a: 5, b: 5 },
  { a: 6, b: 4 },
  { a: 7, b: 3 },
  { a: 8, b: 2 },
  { a: 9, b: 1 }
];

// 「还差几颗」的三个选项：含正确答案，邻近，范围 1~9。
function makeTenOptions(answer: number): AnswerOption[] {
  const set = new Set<number>([answer]);
  let d = 1;
  while (set.size < 3 && d <= 9) {
    if (answer - d >= 1) set.add(answer - d);
    if (set.size < 3 && answer + d <= 9) set.add(answer + d);
    d++;
  }
  return Array.from(set).sort((a, b) => a - b);
}

// 把和拆成两个 >=1 的数（用于生成「不等于 target」的干扰配对）。
function splitPair(sum: number): [number, number] {
  const x = Math.max(1, Math.floor(sum / 2));
  return [sum - x, x];
}

// 配对题三选项：正确对（和=target）+ 两个干扰对（和=target-1 / target+1），顺序打乱。
function pairOptions(a: number, b: number, target: number): AnswerOption[] {
  const correct = `${a} 和 ${b}`;
  const [d1a, d1b] = splitPair(target - 1);
  const [d2a, d2b] = splitPair(target + 1);
  return shuffle([correct, `${d1a} 和 ${d1b}`, `${d2a} 和 ${d2b}`]);
}

// 由抽到的数字生成所有「带数字」的森林文案，保证题面/提示/答案/复盘与本轮题一致。
function buildForestCopy(have: number, answer: number, a: number, b: number, target: number) {
  const countUp: number[] = [];
  for (let n = have + 1; n <= target; n++) countUp.push(n);
  const countStr = countUp.join("、");
  return {
    observeTitle: `树上已有 ${have} 颗能量果`,
    novaBeach: `树上已经有 ${have} 颗能量果。`,
    feedback: {
      stoneCorrect: `对啦！${have} 再加 ${answer}，就能凑成 ${target}。`,
      stoneWrongFirst: `差一点！从 ${have} 往后数：${countStr}，还差几步？`,
      stoneSecondWrong: `我们一起数一数：${countStr}，还差 ${answer} 颗。`,
      towerCorrectAll: `你找到了！${a} 和 ${b} 正好凑成 ${target}。`,
      towerWrongFirst: `再看看这两个数加起来是不是 ${target}。`,
      towerSecondWrong: `可以问问 Nova，看看哪一对果子合起来是 ${target}。`,
      helpL2Stone: `从 ${have} 开始数：${countStr}。数一数，一共补了几颗？`,
      helpL2Tower: `${a} 和 ${b} 合起来是 ${target}。再看看其他两对是不是也等于 ${target}。`,
      helpL3NoStarStone: `灵感星用完啦。我们先一起数：${countStr}，看看补了几颗。`,
      helpL3NoStarTower: `灵感星用完啦。我们先看看：哪一对果子合起来正好是 ${target}？`,
      helpL3AnswerStone: `还差 ${answer} 颗。因为 ${have} + ${answer} = ${target}。`,
      helpL3AnswerTower: `选择 ${a} 和 ${b}。因为 ${a} + ${b} = ${target}。`,
      truthThinkAgain: `再看看刚才的能量果：${a} 和 ${b} 合起来是 ${target}。`
    },
    l1Stone: `树上已经有 ${have} 颗能量果。你可以从 ${have} 往后数到 ${target}，看看走了几步。`
  };
}

function resolveForest(base: AdventureConfig): AdventureConfig {
  const last = readLast();
  const entry = last[base.islandId] ?? {};
  const si = pickIndex(forestStonePool.length, { avoid: entry.stone });
  const stoneSeed = forestStonePool[si];
  const answer = stoneSeed.target - stoneSeed.have;
  const ti = pickIndex(forestPairPool.length, { avoid: entry.tower });
  const pairSeed = forestPairPool[ti];
  last[base.islandId] = { stone: si, tower: ti };
  writeLast(last);

  const target = stoneSeed.target;
  const seq: string[] = [];
  for (let n = stoneSeed.have; n <= target; n++) seq.push(String(n));
  const stone: SequenceQuestion & { step: number } = {
    sequence: seq,
    answer,
    options: makeTenOptions(answer),
    step: 1
  };
  const pairAnswer = `${pairSeed.a} 和 ${pairSeed.b}`;
  const towerSteps: SequenceQuestion[] = [
    {
      sequence: [String(pairSeed.a), String(pairSeed.b), String(target)],
      answer: pairAnswer,
      options: pairOptions(pairSeed.a, pairSeed.b, target)
    }
  ];
  const ov = buildForestCopy(stoneSeed.have, answer, pairSeed.a, pairSeed.b, target);

  return {
    ...base,
    stone,
    makeTen: { have: stoneSeed.have, target },
    pairTarget: target,
    towerSteps,
    towerStep: target,
    copy: { ...base.copy, observeTitle: ov.observeTitle },
    novaLines: { ...base.novaLines, beach_observe: ov.novaBeach },
    feedback: { ...base.feedback, ...ov.feedback },
    help: base.help ? { ...base.help, l1Stone: ov.l1Stone } : { l1Stone: ov.l1Stone }
  };
}

// 入口：按岛屿抽题并返回「基础配置 + 本轮覆盖」的新配置。未知岛屿原样返回。
export function resolveIslandConfig(base: AdventureConfig): AdventureConfig {
  if (base.islandId === "forest") return resolveForest(base);
  if (base.islandId === "new-island") return resolveMultiplesSea(base);
  return base;
}
