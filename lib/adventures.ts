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
export type AnswerOption = number | string;

export type SequenceQuestion = {
  sequence: string[];
  answer: AnswerOption;
  options: AnswerOption[];
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

  // 题型表达方式：默认 "number-path"（数字路/找规律，如倍数海）；
  // "make-ten" 走凑成10/数字组合的渲染（如拆分森林），让两岛在视觉上明显不同。
  // 仅影响渲染分支，不改变 7-Beat 状态机。
  kind?: "number-path" | "make-ten";
  // make-ten 关卡专用：Beat 3 显示 have + ? = target（还差几颗用 stone.answer）；
  // Beat 4 胜利显示 have + answer = target。
  makeTen?: { have: number; target: number };
  // make-ten 关卡 Beat 5 的目标数（配对题“凑成几”），配对卡复用 towerSteps[0].options。
  pairTarget?: number;

  // 数学内容
  stone: SequenceQuestion & { step: number }; // Beat 3：第一条简单数字路
  towerSteps: SequenceQuestion[]; // Beat 5：三段连续、更难的数字路
  towerStep: number; // 倍数塔每段的步长（与 stone.step 不同，制造“别过度概括”的对照）
  truthStatement: string; // Beat 6：Nova 故意说错（把 stone.step 概括到所有数字路）

  reflectionStickers: Record<ReflectionChoice, string>;
  // 复盘贴纸按钮的中文标签；留空则用引擎默认（找规律/问 Nova/点亮新岛/不全信 Nova）。
  reflectionStickerLabels?: Record<ReflectionChoice, string>;
  forestRescue?: {
    entry: {
      title: string;
      novaLine: string;
      primaryButton: string;
    };
    observe: {
      goal: string;
      hint?: string;
      button?: string;
    };
    firstQuestion: {
      correct: string;
      wrongFirst: string;
      wrongSecond: string;
      victory: string;
    };
    secondQuestion: {
      treasureTitle: string;
      description: string;
      correct: string;
      wrongFirst: string;
      wrongSecond: string;
      button: string;
    };
    reflectionBadges: Record<ReflectionChoice, string>;
    completeResults: {
      island: string;
      firstChallenge: string;
      secondChallenge: string;
      truthDetector: string;
    };
    novaEncouragement: {
      default: string;
      usedHelp: string;
      detectedTruth: string;
    };
    reflection: {
      prompt: string;
      badgeEyebrow: string;
      collectButton: string;
      summary: string;
    };
    nextRoundLine: string;
    retryButton: string;
  };

  // Nova 求助文案覆写（make-ten 关卡用；全部留空时走引擎默认 + 倍数海原“+step 规律选择器”）。
  // 提供 l1Stone/l1Tower 时，对应题目的 L1 改为“引导卡”而非加几选择器；
  // L2/L3 的正文仍来自 feedback.helpL2*/helpL3*，这里只补标题与菜单按钮文案。
  help?: {
    menuL1Label?: string; // 菜单里进入 L1 的按钮，默认“我看到一些规律”
    l1TitleStone?: string; // 第一题 L1 卡片标题
    l1TitleTower?: string; // 第二题 L1 卡片标题
    l1Stone?: string; // 第一题 L1 引导卡正文（提供则启用引导卡模式）
    l1Tower?: string; // 第二题 L1 引导卡正文
    l2Title?: string; // L2 卡片标题（两题共用）
    l3Title?: string; // L3 卡片标题（两题共用）
  };
  feedback?: {
    stoneCorrect?: string;
    stoneWrongFirst?: string;
    stoneSecondWrong?: string;
    towerCorrectAll?: string;
    towerCorrectStep?: string;
    towerWrongFirst?: string;
    towerSecondWrong?: string;
    helpL2Stone?: string;
    helpL2Tower?: string;
    helpL3NoStarStone?: string;
    helpL3NoStarTower?: string;
    helpL3AnswerStone?: string;
    helpL3AnswerTower?: string;
    truthOptionA?: string;
    truthThinkAgain?: string;
    truthSuccess?: string;
  };
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
    // 以下均为可选，留空时用引擎默认值（保持倍数海原样）。
    jumpButton?: string; // Beat 4 胜利按钮，默认“登上新岛”
    towerEyebrow?: string; // Beat 5 场景眉标，默认“数字路机关”
    towerContinue?: string; // Beat 5 答对后的继续按钮，默认“继续”
    helpReturnLabel?: string; // Nova 帮助里的返回按钮，默认“回到数字路”
    islandResultLabel?: string; // 纪念卡第一行标签，默认“新岛屿”
    firstChallengeValue?: string; // 纪念卡第一关结果值，默认“已发现”
    secondChallengeValue?: string; // 纪念卡第二关结果值，默认“已点亮”
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

// 第 2 关：拆分森林。复用同一套 7-Beat 引擎，但题型改为凑成10和数字组合，
// 用来和倍数海的数字路形成差异。Nova 在 Beat 6 故意说错，引导孩子用真相探测器检查。
export const forestIslandConfig: AdventureConfig = {
  islandId: "forest",
  levelId: "forest_island_make_ten",
  reward: { exp: 40, coins: 15 },

  fallbackScene:
    "radial-gradient(circle at 50% 14%, rgba(190,242,100,0.22), rgba(34,120,67,0.7) 42%, rgba(6,28,16,0.98))",

  assets: {
    ...forestIslandAssets
  },

  kind: "make-ten",
  makeTen: { have: 7, target: 10 },
  pairTarget: 10,

  stone: { sequence: ["7", "8", "9", "10"], answer: 3, options: [2, 3, 4], step: 1 },
  towerSteps: [{ sequence: ["6", "4", "10"], answer: "6 和 4", options: ["6 和 4", "7 和 2", "8 和 3"] }],
  towerStep: 10,
  truthStatement: "我明白了！凑成10的时候，大数字一定要配大数字。",

  feedback: {
    stoneCorrect: "对啦！7 再加 3，就能凑成 10。",
    stoneWrongFirst: "差一点！从 7 往后数：8、9、10，还差几步？",
    stoneSecondWrong: "我们一起数一数：8、9、10，还差 3 颗。",
    towerCorrectAll: "你找到了！6 和 4 正好凑成 10。",
    towerWrongFirst: "再看看这两个数加起来是不是 10。",
    towerSecondWrong: "可以问问 Nova，看看哪一对果子合起来是 10。",
    helpL2Stone: "从 7 开始数：8、9、10。数一数，一共补了几颗？",
    helpL2Tower: "6 和 4 合起来是 10。再看看其他两对是不是也等于 10。",
    helpL3NoStarStone: "灵感星用完啦。我们先一起数：8、9、10，看看补了几颗。",
    helpL3NoStarTower: "灵感星用完啦。我们先看看：哪一对果子合起来正好是 10？",
    helpL3AnswerStone: "还差 3 颗。因为 7 + 3 = 10。",
    helpL3AnswerTower: "选择 6 和 4。因为 6 + 4 = 10。",
    truthOptionA: "A 凑成10只看合起来是不是10",
    truthThinkAgain: "再看看刚才的能量果：6 和 4 合起来是 10。",
    truthSuccess: "你抓到我啦！凑成 10 只要合起来是 10，不管数字大还是小。"
  },

  reflectionStickers: {
    pattern: "你今天发现了凑成10的小秘密：先看已经有几颗，再想还差几颗。",
    ask_nova: "你今天学会了问 Nova。卡住时，可以说出自己已经看到了什么。",
    island_light: "你今天点亮了森林树屋！能量果把森林小路照亮了。",
    not_blind_trust: "你今天打开了真相探测器！Nova 说错时，你能自己检查。"
  },
  reflectionStickerLabels: {
    pattern: "我会凑成10",
    ask_nova: "我会问 Nova",
    island_light: "我点亮了森林",
    not_blind_trust: "我学会了不全信 Nova"
  },

  help: {
    menuL1Label: "先自己看一看",
    l1TitleStone: "先自己看一看",
    l1TitleTower: "先看看每一对",
    l1Stone: "树上已经有 7 颗能量果。你可以从 7 往后数到 10，看看走了几步。",
    l1Tower: "把每一对加起来，看哪一对正好等于 10。",
    l2Title: "Nova 给一点提示",
    l3Title: "Nova 直接告诉你"
  },

  stageTitles: {
    map_intro: "星球地图",
    beach_observe: "能量树救援",
    stone_question: "能量果问题",
    help_menu: "问问 Nova",
    island_jump: "点亮森林",
    tower_question: "森林树屋",
    truth_moment: "Nova 的一句话",
    truth_question: "真相探测器",
    reflection: "探险笔记",
    complete: "纪念卡"
  },

  novaLines: {
    map_intro: "森林里的能量树醒啦！",
    beach_observe: "树上已经有 7 颗能量果。",
    stone_question: "还差几颗，就能凑成 10？",
    help_menu: "",
    island_jump: "能量树亮起来了！",
    tower_question: "找一对果子，帮树屋凑满 10。",
    truth_moment: "我好像发现了一个规律。",
    truth_question: "",
    reflection: "选一张今天最喜欢的贴纸。",
    complete: "森林岛被你点亮啦！",
    helpStone: "我们一起数能量果。",
    helpTower: "我们一起找一对果子。"
  },

  goals: {
    map_intro: "去能量树看看",
    beach_observe: "看看树上有几颗能量果",
    stone_question: "算出还差几颗",
    help_menu: "选择一种问法",
    island_jump: "继续探索森林",
    tower_question: "找一对能凑成10的果子",
    truth_moment: "听听 Nova 的话",
    truth_question: "打开真相探测器",
    reflection: "贴上探险贴纸",
    complete: "收下纪念卡"
  },

  copy: {
    routeTitle: "森林岛：能量树救援",
    mapEyebrow: "数学星球地图",
    mapTitle: "森林岛：能量树救援",
    mapButton: "去能量树看看",
    observeEyebrow: "能量树救援",
    observeTitle: "树上已有 7 颗能量果",
    stoneEyebrow: "凑成10",
    stoneTitle: "还差几颗能量果？",
    jumpEyebrow: "森林小路",
    jumpTitle: "能量树亮起来了！",
    towerTitlePrefix: "哪一对能量果能凑成10？",
    truthEyebrow: "森林树屋",
    truthTitle: "Nova 的一句话",
    reflectionEyebrow: "探险笔记本",
    reflectionTitle: "今天最酷的发现是什么？",
    completeEyebrow: "森林岛纪念卡",
    completeTitle: "今日探险完成",
    firstChallengeLabel: "能量果",
    secondChallengeLabel: "森林小路",
    jumpButton: "继续探索森林",
    towerEyebrow: "森林树屋",
    towerContinue: "继续看看 Nova 的发现",
    helpReturnLabel: "回到题目",
    islandResultLabel: "森林岛",
    firstChallengeValue: "已凑成10",
    secondChallengeValue: "已打开"
  },

  forestRescue: {
    entry: {
      title: "森林岛：能量树救援",
      novaLine: "能量树快睡着了，我们一起帮它补满 10 颗能量果。",
      primaryButton: "去救援能量树"
    },
    observe: {
      goal: "能量树快睡着了，帮它补满 10 颗能量果，让森林重新发光。",
      hint: "数一数，还差几颗能量果？",
      button: "帮能量树补果子"
    },
    firstQuestion: {
      correct: "能量果补对啦！",
      wrongFirst: "差一点，再数数还差几颗。",
      wrongSecond: "没关系，我们从已有的能量果数到 10。",
      victory: "能量树亮起来了一点！"
    },
    secondQuestion: {
      treasureTitle: "森林宝箱打开啦",
      description: "找出能凑成 10 的一对能量果，宝箱就会发光。",
      correct: "宝箱发光啦，这一对正好凑成 10。",
      wrongFirst: "再试一对，看看合起来是不是 10。",
      wrongSecond: "可以让 Nova 给一点线索，再找一次。",
      button: "打开森林宝箱"
    },
    reflectionBadges: {
      pattern: "凑成10星章",
      ask_nova: "小小提问家",
      island_light: "森林点灯员",
      not_blind_trust: "我没有全信 Nova"
    },
    completeResults: {
      island: "森林岛重新发光",
      firstChallenge: "能量树补满 10 颗能量果",
      secondChallenge: "森林宝箱找到凑十配对",
      truthDetector: "检查 Nova 的说法"
    },
    novaEncouragement: {
      default: "你自己把能量树救醒了，森林正在发光。",
      usedHelp: "你会在卡住时问清楚问题，这也是很棒的探险本领。",
      detectedTruth: "你没有全信 Nova，而是自己检查了一遍。真厉害！"
    },
    reflection: {
      prompt: "今天你最厉害的一招是什么？",
      badgeEyebrow: "今日星章",
      collectButton: "收下今日星章",
      summary: "今天的救援发现已经收进探险笔记。"
    },
    nextRoundLine: "下一轮题目会变哦。",
    retryButton: "挑战新题目"
  }
};
export const adventureConfigs: Record<string, AdventureConfig> = {
  [multiplesSeaConfig.islandId]: multiplesSeaConfig,
  [forestIslandConfig.islandId]: forestIslandConfig
};
