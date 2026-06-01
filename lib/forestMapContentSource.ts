// S4E1-R1《森林小地图机关差异化》内容源（1+3 架构的「内容」层）。
// 保留小地图探索结构，但每个地点用不同的数学机关，避免「换皮同一道凑10题」：
//   精灵① make-ten（凑10教学）/ 精灵② make-ten-practice（凑10巩固，提示更少）
//   迷雾门 pattern（找数字规律）/ 星光桥 balance（左右平衡）/ 森林中心 restore-seed（放回碎片，不做题）
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
  | "fruit-grove"
  | "sleepy-spirit-1"
  | "sleepy-spirit-2"
  | "mist-gate"
  | "star-bridge"
  | "forest-heart";

export type ForestLocationKind = "entrance" | "grove" | "spirit" | "gate" | "bridge" | "heart";

// 机关类型：每个地点明确声明自己的玩法，渲染与判定按它分支。
export type MechanismType =
  | "none"
  | "make-ten"
  | "make-ten-practice"
  | "balance"
  | "pattern"
  | "restore-seed";

export type ForestLocation = {
  id: ForestLocationId;
  name: string;
  short: string;
  blurb: string;
  pos: { x: number; y: number };
  kind: ForestLocationKind;
  mechanism: MechanismType;
};

// 地图节点（百分比定位，随容器缩放，手机不溢出）。
export const FOREST_LOCATIONS: ForestLocation[] = [
  { id: "forest-entrance", name: "森林入口", short: "入口", blurb: "你和 Nova 站在森林入口，森林还睡着。", pos: { x: 16, y: 84 }, kind: "entrance", mechanism: "none" },
  { id: "fruit-grove", name: "能量果园", short: "果园", blurb: "果园里挂着会发光的能量果，可以挑两颗放进背包。", pos: { x: 16, y: 50 }, kind: "grove", mechanism: "none" },
  { id: "sleepy-spirit-1", name: "第一只小精灵", short: "精灵①", blurb: "一只小精灵睡着了，它的星光灯喜欢刚刚好 10 点能量。", pos: { x: 44, y: 68 }, kind: "spirit", mechanism: "make-ten" },
  { id: "sleepy-spirit-2", name: "第二只小精灵", short: "精灵②", blurb: "第二只小精灵也睡着了，自己想一想，带哪两颗合起来是 10。", pos: { x: 52, y: 40 }, kind: "spirit", mechanism: "make-ten-practice" },
  { id: "mist-gate", name: "迷雾门", short: "迷雾门", blurb: "迷雾门上有一串数字，按规律找出下一个就能打开。", pos: { x: 78, y: 54 }, kind: "gate", mechanism: "pattern" },
  { id: "star-bridge", name: "星光桥", short: "星光桥", blurb: "星光桥断了，要让桥两边一样重，桥才会稳稳连起来。", pos: { x: 72, y: 24 }, kind: "bridge", mechanism: "balance" },
  { id: "forest-heart", name: "森林中心", short: "森林中心", blurb: "森林中心的星光种子在沉睡，要 3 片星光碎片才能唤醒。", pos: { x: 44, y: 12 }, kind: "heart", mechanism: "restore-seed" }
];

// 仅用于画地图连线、营造路线感（移动不受连线限制）。
export const FOREST_EDGES: [ForestLocationId, ForestLocationId][] = [
  ["forest-entrance", "fruit-grove"],
  ["forest-entrance", "sleepy-spirit-1"],
  ["fruit-grove", "sleepy-spirit-1"],
  ["sleepy-spirit-1", "sleepy-spirit-2"],
  ["sleepy-spirit-2", "mist-gate"],
  ["mist-gate", "star-bridge"],
  ["star-bridge", "forest-heart"]
];

export const FRUIT_VALUES = [6, 4, 7, 3, 5, 8];
export const MAKE_TEN_TARGET = 10;
export const BAG_CAPACITY = 2;
export const TOTAL_FRAGMENTS = 3;
export const SPIRIT_IDS: ForestLocationId[] = ["sleepy-spirit-1", "sleepy-spirit-2"];
// 给出星光碎片的地点：两只精灵 + 星光桥 = 3 片（迷雾门是规律门，不给碎片）。
export const FRAGMENT_SOURCES: ForestLocationId[] = ["sleepy-spirit-1", "sleepy-spirit-2", "star-bridge"];

// 迷雾门：找规律（每次 +2，下一个是 8）。用现有果子/星光石资产表现数字石。
export const PATTERN_PUZZLE = {
  display: ["2", "4", "6"], // 已知数列
  options: [3, 5, 8],
  answer: 8
};

// 星光桥：左右平衡（左边固定 6，右边要放一颗一样重的能量果 = 6）。
export const BALANCE_PUZZLE = {
  leftFixed: 6,
  needValue: 6
};

export const FOREST_COPY = {
  title: "森林小路 · 星光唤醒",
  goal: "找回 3 片星光碎片，唤醒森林中心的星光种子。",
  intro: "森林睡着了。先去果园拿能量果，不同的地方需要不同的办法。",
  bagFull: "背包满啦，先放回一颗，或清空背包。",
  needTwoFruits: "先去果园拿两颗能量果，再来试一试。",
  // 凑 10 反馈
  makeTenLow: "灯亮了一点，还差一些。",
  makeTenHigh: "能量太多啦，灯有点晃。",
  spirit1Success: "星光灯刚刚好亮起来了！第一只小精灵醒啦，成了你的森林朋友，送你一片星光碎片。",
  spirit2Success: "星光灯又刚刚好亮起来！第二只小精灵也成了朋友，迷雾门那边有了动静。",
  // 规律门反馈
  patternWrong: "这些数字好像每次都多 2。再看看下一个会是多少？",
  patternOk: "数字规律亮起来了，迷雾门打开了！",
  // 平衡桥反馈
  balanceNeedFruit: "先去果园带一颗能量果，放到桥的另一边。",
  balanceLight: "这一边轻了一点，还需要更亮的能量。",
  balanceHeavy: "这一边太重了，桥有点晃。",
  balanceOk: "星光桥两边平衡了！桥修好啦，又一片星光碎片到手。",
  // 森林中心
  heartLow: "星光种子还需要 3 片星光碎片。",
  heartComplete: "3 片星光碎片回来了，星光种子醒来了！森林重新亮了起来，第一章完成！",
  lockReason: {
    "sleepy-spirit-2": "需要先救醒第一只小精灵。",
    "mist-gate": "需要 2 个森林朋友才能打开。",
    "star-bridge": "需要先打开迷雾门。",
    "forest-heart": "需要 3 片星光碎片才能进入。"
  } as Partial<Record<ForestLocationId, string>>
};

const MECHANISM_BY_ID: Record<ForestLocationId, MechanismType> = FOREST_LOCATIONS.reduce(
  (acc, l) => {
    acc[l.id] = l.mechanism;
    return acc;
  },
  {} as Record<ForestLocationId, MechanismType>
);

export type NovaContext = {
  location: ForestLocationId;
  bag: number[];
  fragments: number;
  companions: number;
  gateOpen: boolean;
};

// Nova 是伙伴：按机关给不同方向的话，只给方向、不报答案。
export function getNovaHint(ctx: NovaContext): string {
  const sum = ctx.bag.reduce((a, b) => a + b, 0);
  const mech = MECHANISM_BY_ID[ctx.location];
  switch (mech) {
    case "make-ten":
      if (ctx.bag.length < 2) return "这盏星光灯喜欢刚刚好的 10 点能量，去果园带两颗果子来。";
      if (sum < 10) return "这盏灯还差一点，回果园换更亮的果子。";
      if (sum > 10) return "能量太多了，回果园换小一点的果子。";
      return "刚刚好是 10，点亮它试试！";
    case "make-ten-practice":
      if (ctx.bag.length < 2) return "想一想，哪两颗合起来正好是 10？去果园把它们带来。";
      if (sum < 10) return "再想想，是不是还差一点点？";
      if (sum > 10) return "好像多了一点，换一颗小一些的看看。";
      return "看起来正好，点亮它吧！";
    case "pattern":
      return "门上的数字好像在按一个规律往前走，看看每次多了几？";
    case "balance":
      if (ctx.bag.length < 1) return "这座桥要两边一样亮，先去果园带一颗能量果来。";
      return "这座桥要两边一样重，才会稳稳连起来，挑一颗和左边一样的放上去。";
    case "restore-seed":
      return ctx.fragments < TOTAL_FRAGMENTS
        ? "星光种子要 3 片碎片才会醒，先把碎片找齐。"
        : "星光碎片已经找齐了，把它们送回星光种子吧。";
    case "none":
      if (ctx.location === "fruit-grove") {
        return ctx.bag.length < 2
          ? "挑几颗能量果带上，不同的小灯和机关需要不同的能量。"
          : "背包准备好了，去地图上找需要帮忙的地方吧。";
      }
      return "森林睡着了。先去果园拿果子，再到地图上四处看看。";
    default:
      return "慢慢来，先看看地图上还能去哪里。";
  }
}
