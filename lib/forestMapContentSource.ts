// S4E1《森林小地图探索版》内容源（1+3 架构的「内容」层）。
// 这里只放数据 / 文案 / 资产路径 / Nova 提示生成；游戏状态机与渲染在 page.tsx（容器层）。
// 复用 public/assets/forest-rpg/ 现有正式资产，不新增图片、不烘焙文字、不接 AI、不加数据库。
// 数学动作：凑成 10（带两颗能量果，合起来正好 10 才能点亮/唤醒）。遵守 S3 叙事圣经：
// 唤醒 / 点亮 / 修复 / 驱散迷雾，无任何战斗、敌人、攻击表达。

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

export type ForestLocation = {
  id: ForestLocationId;
  name: string; // 地点全名
  short: string; // 地图节点上的短标签
  blurb: string; // 当前地点信息区的一句话处境
  pos: { x: number; y: number }; // 在小地图里的百分比位置
  kind: ForestLocationKind;
};

// 地图节点（位置用百分比，随容器缩放，手机不溢出）。
export const FOREST_LOCATIONS: ForestLocation[] = [
  { id: "forest-entrance", name: "森林入口", short: "入口", blurb: "你和 Nova 站在森林入口，森林还睡着。", pos: { x: 16, y: 84 }, kind: "entrance" },
  { id: "fruit-grove", name: "能量果园", short: "果园", blurb: "果园里挂着会发光的能量果，可以挑两颗放进背包。", pos: { x: 16, y: 50 }, kind: "grove" },
  { id: "sleepy-spirit-1", name: "第一只小精灵", short: "精灵①", blurb: "一只小精灵睡着了，它的灯要合起来是 10 的能量果才会亮。", pos: { x: 44, y: 68 }, kind: "spirit" },
  { id: "sleepy-spirit-2", name: "第二只小精灵", short: "精灵②", blurb: "第二只小精灵也睡着了，同样要凑成 10 的能量果。", pos: { x: 52, y: 40 }, kind: "spirit" },
  { id: "mist-gate", name: "迷雾门", short: "迷雾门", blurb: "一道瞌睡迷雾门挡住了去路。", pos: { x: 78, y: 54 }, kind: "gate" },
  { id: "star-bridge", name: "星光桥", short: "星光桥", blurb: "星光桥断了，桥心灯需要凑成 10 才能点亮。", pos: { x: 72, y: 24 }, kind: "bridge" },
  { id: "forest-heart", name: "森林中心", short: "森林中心", blurb: "森林中心的星光种子在沉睡，要 3 片星光碎片才能唤醒。", pos: { x: 44, y: 12 }, kind: "heart" }
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
// 给出星光碎片的地点：两只精灵 + 星光桥 = 3 片。
export const FRAGMENT_SOURCES: ForestLocationId[] = ["sleepy-spirit-1", "sleepy-spirit-2", "star-bridge"];

// Nova 建议的「最自然的一对」——只用于温和方向提示，规则本身是「合起来=10」。
export const SUGGESTED_PAIR: Partial<Record<ForestLocationId, [number, number]>> = {
  "sleepy-spirit-1": [6, 4],
  "sleepy-spirit-2": [7, 3],
  "star-bridge": [5, 5]
};

export const FOREST_COPY = {
  title: "森林小路 · 星光唤醒",
  goal: "找回 3 片星光碎片，唤醒森林中心的星光种子。",
  intro: "森林睡着了。先去果园拿两颗能量果，再去叫醒小精灵吧。",
  bagFull: "背包满啦，先放回一颗，或清空背包。",
  needTwoFruits: "先去果园拿两颗能量果，再来试一试。",
  sumLow: "灯亮了一点，还差一些。",
  sumHigh: "能量太多啦，灯有点晃。",
  spirit1Success: "小精灵醒啦！它成了你的森林朋友，还送你一片星光碎片。",
  spirit2Success: "第二只小精灵也醒啦！它也成了朋友，迷雾门那边好像有动静。",
  bridgeSuccess: "桥心灯亮了，星光桥修好啦！又一片星光碎片到手。",
  gateOpened: "两只小精灵在门两侧一起发光，瞌睡迷雾散开了，星光桥出现啦！",
  heartComplete: "三片星光碎片飞进星光种子，种子醒了，森林重新亮了起来。第一章完成！",
  lockReason: {
    "sleepy-spirit-2": "需要先救醒第一只小精灵。",
    "mist-gate": "需要 2 个森林朋友才能打开。",
    "star-bridge": "需要先打开迷雾门。",
    "forest-heart": "需要 3 片星光碎片才能进入。"
  } as Partial<Record<ForestLocationId, string>>
};

export type NovaContext = {
  location: ForestLocationId;
  bag: number[];
  fragments: number;
  companions: number;
  gateOpen: boolean;
};

// Nova 是伙伴：只给方向，不报答案、不报具体哪一对。
export function getNovaHint(ctx: NovaContext): string {
  const sum = ctx.bag.reduce((a, b) => a + b, 0);
  switch (ctx.location) {
    case "forest-entrance":
      return "森林睡着了。先去果园拿果子，再去叫醒小精灵吧。";
    case "fruit-grove":
      return ctx.bag.length < 2
        ? "挑两颗能量果放进背包，想一想它们合起来是不是 10。"
        : "背包准备好了，去找需要点亮的小灯试试吧。";
    case "sleepy-spirit-1":
    case "sleepy-spirit-2":
      if (ctx.bag.length < 2) return "你现在有几颗果子？要不要先去果园准备？";
      if (sum < 10) return "这盏灯还差一点，可以回果园换更亮的果子。";
      if (sum > 10) return "能量太多了，回果园换小一点的果子试试。";
      return "看起来正好是 10，点亮它试试看！";
    case "mist-gate":
      return ctx.companions < 2
        ? "这个地方好像还打不开，需要更多森林朋友。"
        : "两个森林朋友都在了，试着打开迷雾门吧。";
    case "star-bridge":
      if (ctx.bag.length < 2) return "桥心灯也要凑成 10，先去果园拿两颗果子。";
      if (sum < 10) return "桥心灯还差一点亮，换更亮的果子看看。";
      if (sum > 10) return "能量太多了，桥心灯有点晃，换小一点的。";
      return "正好是 10，点亮桥心灯吧！";
    case "forest-heart":
      return ctx.fragments < 3
        ? "星光种子要 3 片碎片才会醒，先把碎片找齐。"
        : "碎片齐了，把它们放进星光种子吧。";
    default:
      return "慢慢来，先看看地图上还能去哪里。";
  }
}
