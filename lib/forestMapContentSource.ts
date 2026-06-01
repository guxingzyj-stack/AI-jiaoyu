// S4E1-R2《第一章：睡着的森林》内容源（1+3 架构「内容」层）。
// 围绕森林主题讲完整：救醒三位森林朋友、恢复三种森林能力、进入森林核心唤醒星光种子。
// 三位朋友 = 三种不同机关：光果小精灵(凑10) / 藤桥小精灵(左右平衡) / 风铃小精灵(数字规律)。
// 只放数据 / 文案 / 资产 / Nova 提示；状态机与渲染在 page.tsx。复用 forest-rpg 现有资产，
// 不新增图片、不接 AI、不加数据库。遵守 S3 叙事圣经：唤醒 / 点亮 / 修复 / 驱散迷雾，无战斗表达。

export const FOREST_MAP_ASSETS = {
  bgDark: "/assets/forest-rpg/forest-dark-background.png",
  bgBright: "/assets/forest-rpg/forest-bright-background.png",
  player: "/assets/forest-rpg/player-avatar.png",
  nova: "/assets/forest-rpg/nova-companion.png",
  sleepingSpirit: "/assets/forest-rpg/sleeping-spirit.png",
  awakeSpirit: "/assets/forest-rpg/awake-spirit.png",
  fruit: "/assets/forest-rpg/energy-fruit.png",
  fragment: "/assets/forest-rpg/starlight-fragment.png",
  fog: "/assets/forest-rpg/sleepy-fog.png",
  lampOff: "/assets/forest-rpg/starlight-lamp-off.png",
  lampOn: "/assets/forest-rpg/starlight-lamp-on.png"
} as const;

export type ForestLocationId =
  | "forest-entrance"
  | "glowfruit-grove"
  | "glowfruit-spirit"
  | "vinebridge-spirit"
  | "windbell-spirit"
  | "forest-core";

export type ForestLocationKind = "entrance" | "grove" | "spirit" | "core";

// 机关类型（本章四种）：三位森林朋友各一种，森林核心是放回碎片。
export type MechanismType = "make-ten" | "balance" | "pattern" | "restore-seed";

export type ForestLocation = {
  id: ForestLocationId;
  name: string; // title
  short: string; // 地图节点短标签
  blurb: string; // description：当前处境
  pos: { x: number; y: number };
  kind: ForestLocationKind;
  mechanism?: MechanismType;
  unlockRequirement?: string; // 锁定原因
  successEffect?: string; // 救醒后恢复的森林能力（剧情意义）
  novaHint: string; // 该地点的方向提示（不报答案）
  reward?: { fragment: true; friend: true; star: true }; // 三位朋友各给一片碎片/一个朋友/一道森林星光
};

// 三位森林朋友（按机关区分）。星光碎片来源 = 这三位。
export const SPIRIT_IDS: ForestLocationId[] = ["glowfruit-spirit", "vinebridge-spirit", "windbell-spirit"];
export const FRAGMENT_SOURCES = SPIRIT_IDS;

// 小地图节点（百分比定位，随容器缩放，手机不溢出）。
export const FOREST_LOCATIONS: ForestLocation[] = [
  {
    id: "forest-entrance",
    name: "森林入口",
    short: "入口",
    blurb: "你和 Nova 走进一片睡着的森林，星光循环断开了。",
    pos: { x: 16, y: 84 },
    kind: "entrance",
    novaHint: "森林睡着了。先去星光果园拿能量果，再到地图上四处看看。"
  },
  {
    id: "glowfruit-grove",
    name: "星光果园",
    short: "果园",
    blurb: "星光果园变暗了，能量果还能摘，但光不太亮。背包最多带 2 颗。",
    pos: { x: 16, y: 50 },
    kind: "grove",
    novaHint: "挑几颗能量果带上，不同的森林朋友需要不同的办法。"
  },
  {
    id: "glowfruit-spirit",
    name: "光果小精灵",
    short: "光果",
    blurb: "光果小精灵睡着了，它的星光灯喜欢刚刚好 10 点能量。",
    pos: { x: 44, y: 70 },
    kind: "spirit",
    mechanism: "make-ten",
    successEffect: "星光果园重新发光，能量果亮了起来。",
    novaHint: "这盏星光灯喜欢刚刚好的 10 点能量，去果园带两颗果子来。",
    reward: { fragment: true, friend: true, star: true }
  },
  {
    id: "vinebridge-spirit",
    name: "藤桥小精灵",
    short: "藤桥",
    blurb: "苔藓断桥裂开了，藤桥小精灵睡着了，要让桥两边一样重才会连起来。",
    pos: { x: 66, y: 50 },
    kind: "spirit",
    mechanism: "balance",
    unlockRequirement: "需要先救醒光果小精灵。",
    successEffect: "苔藓断桥两边平衡，断桥连了起来。",
    novaHint: "这座桥要两边一样重，才会稳稳连起来，挑一颗和左边一样的放上去。",
    reward: { fragment: true, friend: true, star: true }
  },
  {
    id: "windbell-spirit",
    name: "风铃小精灵",
    short: "风铃",
    blurb: "迷雾树门关着，风铃小精灵睡着了，门上的数字在按规律往前走。",
    pos: { x: 74, y: 24 },
    kind: "spirit",
    mechanism: "pattern",
    unlockRequirement: "需要先修复苔藓断桥（藤桥小精灵）。",
    successEffect: "风铃响了，迷雾树门被吹开了。",
    novaHint: "门上的数字好像在按一个规律往前走，看看每次多了几？",
    reward: { fragment: true, friend: true, star: true }
  },
  {
    id: "forest-core",
    name: "森林核心",
    short: "森林核心",
    blurb: "森林核心的星光种子还在沉睡，要三位森林朋友和三片星光碎片才能唤醒。",
    pos: { x: 44, y: 12 },
    kind: "core",
    mechanism: "restore-seed",
    unlockRequirement: "需要 3 位森林朋友和 3 片星光碎片。",
    successEffect: "三位森林朋友一起发挥能力，星光种子醒来。",
    novaHint: "三片星光碎片都找齐了，我们可以去森林核心了。"
  }
];

// 仅用于画地图连线、营造路线感（移动不受连线限制）。
export const FOREST_EDGES: [ForestLocationId, ForestLocationId][] = [
  ["forest-entrance", "glowfruit-grove"],
  ["forest-entrance", "glowfruit-spirit"],
  ["glowfruit-grove", "glowfruit-spirit"],
  ["glowfruit-spirit", "vinebridge-spirit"],
  ["vinebridge-spirit", "windbell-spirit"],
  ["windbell-spirit", "forest-core"]
];

export const FRUIT_VALUES = [6, 4, 7, 3, 5, 8];
export const MAKE_TEN_TARGET = 10;
export const BAG_CAPACITY = 2;
export const TOTAL_FRIENDS = 3;

// 藤桥：左右平衡（左边固定 6，右边放一颗一样重的能量果 = 6）。
export const BALANCE_PUZZLE = { leftFixed: 6, needValue: 6 };
// 迷雾树门：找规律（每次 +2，下一个是 8）。
export const PATTERN_PUZZLE = { display: ["2", "4", "6"], options: [3, 5, 8], answer: 8 };

export const FOREST_COPY = {
  chapter: "第一章：睡着的森林",
  subtitle: "森林小路 · 星光种子",
  goal: "唤醒三位森林朋友，修复森林星光循环，叫醒森林中心的星光种子。",
  intro: "森林睡着了。先去星光果园拿能量果，不同的森林朋友需要不同的办法。",
  bagFull: "背包满啦，先放回一颗，或清空背包。",
  needTwoFruits: "先去星光果园拿两颗能量果，再来试一试。",
  // 凑 10（光果小精灵）
  makeTenLow: "灯亮了一点，还差一些。",
  makeTenHigh: "能量太多啦，灯有点晃。",
  // 左右平衡（藤桥小精灵）
  balanceNeedFruit: "先去果园带一颗能量果，放到桥的另一边。",
  balanceLight: "这一边轻了一点，还需要更亮的能量。",
  balanceHeavy: "这一边太重了，桥有点晃。",
  // 数字规律（风铃小精灵）
  patternWrong: "这些数字好像每次都多 2。再看看下一个会是多少？",
  // 各森林朋友救醒文案
  spiritSuccess: {
    "glowfruit-spirit": "光果小精灵醒啦！它让星光果园重新发光，能量果亮了起来。星光碎片 +1。",
    "vinebridge-spirit": "藤桥小精灵醒啦！它让苔藓断桥两边平衡，断桥连了起来。星光碎片 +1。",
    "windbell-spirit": "风铃小精灵醒啦！风铃一响，迷雾树门被吹开了。星光碎片 +1。"
  } as Record<string, string>,
  // 森林核心
  coreNotReady: "森林核心还没打开，需要 3 位森林朋友和 3 片星光碎片。",
  coreComplete: "星光种子醒来了！睡着的森林重新发光了！三位森林朋友回到了自己的岗位。",
  // 星光海远景预告（仅完成后出现）
  seaPreviewLine: "森林外的远方，出现了一片蓝金色星光海。",
  seaPreviewNova: "Nova：那边也有星光在变暗，不过今天我们先把森林救醒了。",
  seaPreviewNext: "下一章：星光海"
};

const LOC_BY_ID: Record<ForestLocationId, ForestLocation> = FOREST_LOCATIONS.reduce(
  (acc, l) => {
    acc[l.id] = l;
    return acc;
  },
  {} as Record<ForestLocationId, ForestLocation>
);

export type NovaContext = {
  location: ForestLocationId;
  bag: number[];
  friends: number;
};

// Nova 是伙伴：按机关给不同方向的话，只给方向、不报答案。
export function getNovaHint(ctx: NovaContext): string {
  const loc = LOC_BY_ID[ctx.location];
  const sum = ctx.bag.reduce((a, b) => a + b, 0);
  switch (loc.mechanism) {
    case "make-ten":
      if (ctx.bag.length < 2) return "这盏星光灯喜欢刚刚好的 10 点能量，去果园带两颗果子来。";
      if (sum < 10) return "这盏灯还差一点，回果园换更亮的果子。";
      if (sum > 10) return "能量太多了，回果园换小一点的果子。";
      return "刚刚好是 10，点亮它试试！";
    case "balance":
      if (ctx.bag.length < 1) return "这座桥要两边一样亮，先去果园带一颗能量果来。";
      return "这座桥要两边一样重，才会稳稳连起来，挑一颗和左边一样的放上去。";
    case "pattern":
      return "门上的数字好像在按一个规律往前走，看看每次多了几？";
    case "restore-seed":
      return ctx.friends < TOTAL_FRIENDS
        ? "三位森林朋友还没到齐，先去把它们都救醒。"
        : "三片星光碎片都找齐了，我们可以去森林核心了。";
    default:
      return loc.novaHint;
  }
}
