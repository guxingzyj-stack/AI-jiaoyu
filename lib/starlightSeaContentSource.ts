// S4E2《第二章：星光海 · 跳岛航线》内容源（1+3 架构「内容」层）。
// 保留小地图探索结构；数学核心是「跳数 / 倍数 / 重复加法 / 共同落点」，做成小船跳岛的游戏规则，
// 不做凑 10、不做选择题。只放数据 / 文案 / 提示；状态机与渲染在 page.tsx。
// 本章为原型阶段：星光海 / 浮岛 / 小船 / 灯塔 / 漩涡门用 CSS 光效与少量 emoji 占位，后续补正式图片资产。
// 遵守 S3 叙事圣经：点亮 / 修复 / 唤醒，无战斗、敌人、攻击表达。

export type SeaLocationId =
  | "starlight-dock"
  | "two-step-bay"
  | "three-step-route"
  | "starfish-lighthouse"
  | "whirlpool-gate"
  | "sea-core";

export type SeaMechanismType =
  | "chapter-intro"
  | "hop-route"
  | "choose-rhythm"
  | "common-landing"
  | "restore-lighthouse";

// hop-route：孩子先选跳岛节奏(rhythmOptions)，再试航线；选中 correctStep 才点亮 goalIslands。
export type HopRouteData = { maxIsland: number; correctStep: number; rhythmOptions: number[]; goalIslands: number[]; wrongHint: string };
export type RhythmData = { maxIsland: number; options: number[]; answer: number; routes: Record<number, number[]> };
export type LandingData = { maxIsland: number; stepA: number; stepB: number; litA: number[]; litB: number[]; common: number[]; answer: number };

export type SeaLocation = {
  id: SeaLocationId;
  name: string; // title
  short: string; // 地图节点短标签
  icon: string; // 原型占位图标（CSS 阶段）
  blurb: string; // description
  pos: { x: number; y: number };
  mechanism: SeaMechanismType;
  unlockRequirement?: string;
  successEffect?: string;
  novaHint: string;
  routeData?: HopRouteData;
  rhythmData?: RhythmData;
  landingData?: LandingData;
};

// 给出星潮碎片 / 点亮航线的三处：二步跳岛湾、三步航线、海星灯塔。
export const FRAGMENT_SOURCES: SeaLocationId[] = ["two-step-bay", "three-step-route", "starfish-lighthouse"];
export const TOTAL_ROUTES = 3;

export const SEA_LOCATIONS: SeaLocation[] = [
  {
    id: "starlight-dock",
    name: "星光码头",
    short: "码头",
    icon: "⚓",
    blurb: "森林外，是一片蓝金色的星光海。海上的航线暗了，小船不知道该往哪里走。",
    pos: { x: 16, y: 84 },
    mechanism: "chapter-intro",
    successEffect: "扬帆出发，去修复 3 条星光航线。",
    novaHint: "这片海不是随便走的，小船要按节奏跳岛。先从二步跳岛湾出发吧。"
  },
  {
    id: "two-step-bay",
    name: "二步跳岛湾",
    short: "二步湾",
    icon: "🌊",
    blurb: "这片海的亮岛隔一个出现，选一个跳岛节奏试试。",
    pos: { x: 40, y: 70 },
    mechanism: "hop-route",
    unlockRequirement: "先在星光码头扬帆出发。",
    successEffect: "第一条星光航线点亮了。",
    novaHint: "这些亮岛隔一个出现，试试哪种跳岛节奏能把它们连起来。",
    routeData: { maxIsland: 8, correctStep: 2, rhythmOptions: [1, 2, 3], goalIslands: [2, 4, 6, 8], wrongHint: "这条航线没有把亮岛连起来，换个节奏试试。" }
  },
  {
    id: "three-step-route",
    name: "三步航线",
    short: "三步线",
    icon: "🌊",
    blurb: "这条航线更长了，选一个节奏让小船跳到发光岛。",
    pos: { x: 62, y: 56 },
    mechanism: "hop-route",
    unlockRequirement: "先点亮二步跳岛湾的航线。",
    successEffect: "第二条星光航线点亮了。",
    novaHint: "这条航线更长，换几种节奏，看哪种能踩到所有发光岛。",
    routeData: { maxIsland: 12, correctStep: 3, rhythmOptions: [2, 3, 4], goalIslands: [3, 6, 9, 12], wrongHint: "这条节奏还没连上三步航线，再换一个试试。" }
  },
  {
    id: "starfish-lighthouse",
    name: "海星灯塔",
    short: "灯塔",
    icon: "🗼",
    blurb: "海星灯塔喜欢 4 拍节奏。选一个节奏，让小船去点亮它。",
    pos: { x: 80, y: 34 },
    mechanism: "choose-rhythm",
    unlockRequirement: "先点亮三步航线。",
    successEffect: "海星灯塔被 4 拍节奏点亮了。",
    novaHint: "灯塔喜欢 4 拍节奏，试试哪条航线能点亮它。",
    rhythmData: {
      maxIsland: 16,
      options: [2, 3, 4],
      answer: 4,
      routes: { 2: [2, 4, 6, 8, 10, 12, 14, 16], 3: [3, 6, 9, 12, 15], 4: [4, 8, 12, 16] }
    }
  },
  {
    id: "whirlpool-gate",
    name: "漩涡门",
    short: "漩涡门",
    icon: "🌀",
    blurb: "漩涡门前有两条航线：蓝船每次跳 2 格，金船每次跳 3 格。找出它们第一个共同落点。",
    pos: { x: 52, y: 26 },
    mechanism: "common-landing",
    unlockRequirement: "先点亮海星灯塔。",
    successEffect: "找到了共同落点，漩涡门稳定了下来。",
    novaHint: "两条航线都亮过的岛，就是它们相遇的地方。",
    landingData: {
      maxIsland: 12,
      stepA: 2,
      stepB: 3,
      litA: [2, 4, 6, 8, 10, 12],
      litB: [3, 6, 9, 12],
      common: [6, 12],
      answer: 6
    }
  },
  {
    id: "sea-core",
    name: "灯塔核心",
    short: "灯塔核心",
    icon: "🌟",
    blurb: "灯塔核心需要 3 片星潮碎片，把它们放回去，海星灯塔就会完全亮起。",
    pos: { x: 40, y: 12 },
    mechanism: "restore-lighthouse",
    unlockRequirement: "需要 3 片星潮碎片，并先稳定漩涡门。",
    successEffect: "海星灯塔完全亮起，星光海第一片海域恢复。",
    novaHint: "三片星潮碎片都找齐了，把它们放回灯塔核心吧。"
  }
];

export const SEA_EDGES: [SeaLocationId, SeaLocationId][] = [
  ["starlight-dock", "two-step-bay"],
  ["two-step-bay", "three-step-route"],
  ["three-step-route", "starfish-lighthouse"],
  ["starfish-lighthouse", "whirlpool-gate"],
  ["whirlpool-gate", "sea-core"]
];

export const SEA_COPY = {
  chapter: "第二章：星光海 · 跳岛航线",
  subtitle: "星光海 · 海星灯塔",
  goal: "修复 3 条星光航线，点亮海星灯塔。",
  intro: "森林外，是一片蓝金色的星光海。海上的航线暗了，我们要修复 3 条星光航线。",
  // hop-route 成功总结（成功后才讲倍数）
  hopSummary: {
    "two-step-bay": "每次跳 2 格，小船踩亮了 2、4、6、8。",
    "three-step-route": "每次跳 3 格，小船踩亮了 3、6、9、12。"
  } as Record<string, string>,
  // choose-rhythm
  rhythmWrong: "这条航线没有点亮灯塔，再换一个节奏试试。",
  rhythmOk: "4 拍节奏点亮了海星灯塔！每次跳 4 格，会踩到 4、8、12、16。",
  // common-landing
  landingWrong: "两条航线都亮过的岛，才是共同落点。再找找。",
  landingOk: "6 是两条航线第一个共同落点，漩涡门稳定了！",
  // sea-core
  coreNotReady: "灯塔核心还没准备好，需要 3 条航线和稳定的漩涡门。",
  coreComplete: "星光海航线重新亮起来了！海星灯塔完全点亮，第一片海域恢复了。",
  // 下一章预告（仅完成后出现）
  nextPreviewLine: "远处出现了一座几何山的影子。",
  nextPreviewChapter: "下一章：几何山 · 形状机关"
};

const LOC_BY_ID: Record<SeaLocationId, SeaLocation> = SEA_LOCATIONS.reduce(
  (acc, l) => {
    acc[l.id] = l;
    return acc;
  },
  {} as Record<SeaLocationId, SeaLocation>
);

export type SeaNovaContext = { location: SeaLocationId; routesLit: number };

// Nova 是伙伴：只给方向（按节奏跳岛 / 找共同落点），不直接报答案。
export function getSeaNovaHint(ctx: SeaNovaContext): string {
  const loc = LOC_BY_ID[ctx.location];
  if (loc.mechanism === "restore-lighthouse") {
    return ctx.routesLit < TOTAL_ROUTES
      ? "三条航线还没全亮，先把航线一条条点亮。"
      : "三片星潮碎片都找齐了，把它们放回灯塔核心吧。";
  }
  return loc.novaHint;
}
