import { multiplesSeaAssets } from "./multiplesSeaAssets";
import { forestIslandAssets } from "./forestIslandAssets";

// 7-Beat 探险母模板：把一关“探险”拆成固定的 10 个阶段，所有变化（数学规律、文案、
// 美术、奖励）都收进 AdventureConfig，渲染与状态机由 components/AdventureRunner 统一驱动。
export type AdventureStage =
  | "map_intro"
  | "beach_observe"
  | "stone_question"
  | "help_menu"
  | "island_jump"
  | "tower_question"
  | "truth_moment"
  | "truth_question"
  | "reflection"
  | "complete";

export type CurrentQuestion = "stone" | "tower";
export type ReflectionChoice = "pattern" | "ask_nova" | "not_blind_trust" | "island_light";

export type AdventureSession = {
  stage: AdventureStage;
  currentQuestion: CurrentQuestion;
  inspirationStars: number;
  wrongAttemptsStone: number;
  wrongAttemptsTower: number;
  towerStep: number;
  l1Count: number;
  l2Count: number;
  l3Count: number;
  truthDetectorOpened: boolean;
  truthDetectorSuccess: boolean;
  reflectionChoice: ReflectionChoice | null;
  completed: boolean;
};

export const initialAdventureSession: AdventureSession = {
  stage: "map_intro",
  currentQuestion: "stone",
  inspirationStars: 3,
  wrongAttemptsStone: 0,
  wrongAttemptsTower: 0,
  towerStep: 0,
  l1Count: 0,
  l2Count: 0,
  l3Count: 0,
  truthDetectorOpened: false,
  truthDetectorSuccess: false,
  reflectionChoice: null,
  completed: false
};

// 一段连续数字路的题：展示的数列 + 正确答案 + 三个选项。
export type SequenceQuestion = {
  sequence: string[];
  answer: number;
  options: number[];
};

export type AdventureConfig = {
  islandId: string; // 对应 /map 的岛屿 id，用于 markIslandCompleted
  levelId: string; // 埋点用关卡 id
  reward: { exp: number; coins: number };

  // 无专属背景（asset-light）时的主题渐变，写进 CSS 变量 --scene-bg。
  // 留空则用引擎默认的蓝色星空渐变；森林岛用它换成森林绿，和倍数海区分开。
  fallbackScene?: string;

  // 美术资源；留空（undefined）的阶段会退回到渐变背景（asset-light 关卡可用）。
  assets: {
    map?: string;
    beach?: string;
    stoneQuestion?: string;
    islandVictory?: string;
    tower?: string;
    truth?: string;
    notebook?: string;
    complete?: string;
    novaGuide: string;
    novaHappy: string;
    novaThinking: string;
  };

  // 数学内容
  stone: SequenceQuestion & { step: number }; // Beat 3：第一条简单数字路
  towerSteps: SequenceQuestion[]; // Beat 5：三段连续、更难的数字路
  towerStep: number; // 倍数塔每段的步长（与 stone.step 不同，制造“别过度概括”的对照）
  truthStatement: string; // Beat 6：Nova 故意说错（把 stone.step 概括到所有数字路）

  reflectionStickers: Record<ReflectionChoice, string>;
  stageTitles: Record<AdventureStage, string>;
  novaLines: Record<AdventureStage, string> & { helpStone: string; helpTower: string };
  goals: Record<AdventureStage, string>;

  copy: {
    routeTitle: string;
    mapEyebrow: string;
    mapTitle: string;
    mapButton: string;
    observeEyebrow: string;
    observeTitle: string;
    stoneEyebrow: string;
    stoneTitle: string;
    jumpEyebrow: string;
    jumpTitle: string;
    towerTitlePrefix: string;
    truthEyebrow: string;
    truthTitle: string;
    reflectionEyebrow: string;
    reflectionTitle: string;
    completeEyebrow: string;
    completeTitle: string;
    firstChallengeLabel: string; // 纪念卡上第一关结果行标签，如“石头规律”
    secondChallengeLabel: string; // 纪念卡上第二关结果行标签，如“倍数塔”
  };
};

export const multiplesSeaConfig: AdventureConfig = {
  islandId: "new-island",
  levelId: "multiples_sea_new_island",
  reward: { exp: 40, coins: 15 },

  assets: {
    map: multiplesSeaAssets.mapBackground,
    beach: multiplesSeaAssets.beachBackground,
    stoneQuestion: multiplesSeaAssets.beachBackground,
    islandVictory: multiplesSeaAssets.islandVictoryBackground,
    tower: multiplesSeaAssets.towerBackground,
    truth: multiplesSeaAssets.truthBackground,
    notebook: multiplesSeaAssets.notebookBackground,
    complete: multiplesSeaAssets.completeBackground,
    novaGuide: multiplesSeaAssets.novaGuide,
    novaHappy: multiplesSeaAssets.novaHappy,
    novaThinking: multiplesSeaAssets.novaThinking
  },

  stone: { sequence: ["2", "4", "6", "8"], answer: 10, options: [9, 10, 12], step: 2 },
  towerSteps: [
    { sequence: ["3", "6", "9", "12"], answer: 15, options: [14, 15, 18] },
    { sequence: ["6", "9", "12", "15"], answer: 18, options: [16, 18, 21] },
    { sequence: ["9", "12", "15", "18"], answer: 21, options: [19, 21, 24] }
  ],
  towerStep: 3,
  truthStatement: "今天你学会了数字路！所有这样的数字路都是每次加2。",

  reflectionStickers: {
    pattern: "你今天找到了数字路的秘密：每次增加一样多，就能知道下一个数字。",
    ask_nova: "你今天学会了向 Nova 求助。先说自己看到什么，再一步一步问。",
    island_light: "你今天点亮了一座新岛！下一次还有新的地方等你发现。",
    not_blind_trust: "你今天打开了真相探测器！Nova 说错时，你能自己检查。"
  },

  stageTitles: {
    map_intro: "星球地图",
    beach_observe: "倍数海边",
    stone_question: "石头数字路",
    help_menu: "问问 Nova",
    island_jump: "跳向新岛",
    tower_question: "倍数塔",
    truth_moment: "Nova 的一句话",
    truth_question: "真相探测器",
    reflection: "探险笔记",
    complete: "纪念卡"
  },

  novaLines: {
    map_intro: "倍数海好像出现了新岛屿……",
    beach_observe: "看！算出第5块，我们就能跳过去！",
    stone_question: "先看数字路，每次多了几个？",
    help_menu: "",
    island_jump: "我们成功啦！",
    tower_question: "塔上也有一条数字路！",
    truth_moment: "我们登顶啦！我把今天的发现记下来。",
    truth_question: "",
    reflection: "选一张今天最喜欢的贴纸。",
    complete: "这次探险很漂亮。",
    helpStone: "我们看看石头数字路。",
    helpTower: "我们看看塔上的数字路。"
  },

  goals: {
    map_intro: "去看看发光的新岛屿",
    beach_observe: "点击问号石头",
    stone_question: "算出第5块石头",
    help_menu: "选择一种问法",
    island_jump: "登上新岛",
    tower_question: "点亮倍数塔",
    truth_moment: "听听 Nova 的话",
    truth_question: "打开真相探测器",
    reflection: "贴上探险贴纸",
    complete: "收下纪念卡"
  },

  copy: {
    routeTitle: "倍数海新岛探险",
    mapEyebrow: "数学星球地图",
    mapTitle: "发现倍数海新岛",
    mapButton: "去看看新岛",
    observeEyebrow: "倍数海边",
    observeTitle: "海面上的数字石头",
    stoneEyebrow: "数字路机关",
    stoneTitle: "第5块石头应该是多少？",
    jumpEyebrow: "跳向新岛",
    jumpTitle: "新岛屿点亮！",
    towerTitlePrefix: "塔上的下一个数字是多少？",
    truthEyebrow: "塔顶平台",
    truthTitle: "Nova 的一句话",
    reflectionEyebrow: "探险笔记本",
    reflectionTitle: "今天最酷的发现是什么？",
    completeEyebrow: "倍数海纪念卡",
    completeTitle: "今日探险完成",
    firstChallengeLabel: "石头规律",
    secondChallengeLabel: "倍数塔"
  }
};

// 第 2 关：森林岛跳数探险。复用同一套 7-Beat 引擎，暂为 asset-light（无专属美术，
// 退回渐变背景 + emoji），Nova 立绘沿用同一角色。教学对照：脚印每次 +5，大树每次 +4，
// Nova 在 Beat 6 故意把“+5”概括到所有数字路，引导孩子用真相探测器识破。
export const forestIslandConfig: AdventureConfig = {
  islandId: "forest",
  levelId: "forest_island_skip_count",
  reward: { exp: 40, coins: 15 },

  // 森林主题渐变：无专属背景时和倍数海的蓝色星空区分开（森林绿 + 暖光顶）。
  fallbackScene:
    "radial-gradient(circle at 50% 14%, rgba(190,242,100,0.22), rgba(34,120,67,0.7) 42%, rgba(6,28,16,0.98))",

  // 森林岛专属美术已到位（见 public/assets/forest-island/）：整关用真图。
  // fallbackScene 保留作兜底——某张图加载失败时仍退回森林绿渐变。
  assets: {
    ...forestIslandAssets
  },

  stone: { sequence: ["5", "10", "15", "20"], answer: 25, options: [24, 25, 30], step: 5 },
  towerSteps: [
    { sequence: ["4", "8", "12", "16"], answer: 20, options: [18, 20, 24] },
    { sequence: ["8", "12", "16", "20"], answer: 24, options: [22, 24, 28] },
    { sequence: ["12", "16", "20", "24"], answer: 28, options: [26, 28, 32] }
  ],
  towerStep: 4,
  truthStatement: "今天你学会了数字路！所有这样的数字路都是每次加5。",

  reflectionStickers: {
    pattern: "你今天找到了数字路的秘密：每次增加一样多，就能知道下一个数字。",
    ask_nova: "你今天学会了向 Nova 求助。先说自己看到什么，再一步一步问。",
    island_light: "你今天点亮了森林岛！下一次还有新的地方等你发现。",
    not_blind_trust: "你今天打开了真相探测器！Nova 说错时，你能自己检查。"
  },

  stageTitles: {
    map_intro: "星球地图",
    beach_observe: "森林入口",
    stone_question: "脚印数字路",
    help_menu: "问问 Nova",
    island_jump: "点亮森林",
    tower_question: "大树数字",
    truth_moment: "Nova 的一句话",
    truth_question: "真相探测器",
    reflection: "探险笔记",
    complete: "纪念卡"
  },

  novaLines: {
    map_intro: "森林岛深处好像有发光的脚印……",
    beach_observe: "看！数出第5个脚印，小径就会亮起来！",
    stone_question: "先看脚印路，每次多了几个？",
    help_menu: "",
    island_jump: "我们成功啦！",
    tower_question: "大树上也有一条数字路！",
    truth_moment: "我们爬到树顶啦！我把今天的发现记下来。",
    truth_question: "",
    reflection: "选一张今天最喜欢的贴纸。",
    complete: "这次探险很漂亮。",
    helpStone: "我们看看脚印数字路。",
    helpTower: "我们看看大树上的数字路。"
  },

  goals: {
    map_intro: "走进发光的森林岛",
    beach_observe: "点击问号脚印",
    stone_question: "数出第5个脚印",
    help_menu: "选择一种问法",
    island_jump: "点亮森林小径",
    tower_question: "点亮大树数字",
    truth_moment: "听听 Nova 的话",
    truth_question: "打开真相探测器",
    reflection: "贴上探险贴纸",
    complete: "收下纪念卡"
  },

  copy: {
    routeTitle: "森林岛跳数探险",
    mapEyebrow: "数学星球地图",
    mapTitle: "发现森林岛",
    mapButton: "走进森林岛",
    observeEyebrow: "森林入口",
    observeTitle: "林间发光的脚印",
    stoneEyebrow: "脚印数字路",
    stoneTitle: "第5个脚印应该是多少？",
    jumpEyebrow: "点亮森林",
    jumpTitle: "森林小径点亮！",
    towerTitlePrefix: "大树上的下一个数字是多少？",
    truthEyebrow: "树顶平台",
    truthTitle: "Nova 的一句话",
    reflectionEyebrow: "探险笔记本",
    reflectionTitle: "今天最酷的发现是什么？",
    completeEyebrow: "森林岛纪念卡",
    completeTitle: "今日探险完成",
    firstChallengeLabel: "脚印规律",
    secondChallengeLabel: "大树数字"
  }
};

export const adventureConfigs: Record<string, AdventureConfig> = {
  [multiplesSeaConfig.islandId]: multiplesSeaConfig,
  [forestIslandConfig.islandId]: forestIslandConfig
};
