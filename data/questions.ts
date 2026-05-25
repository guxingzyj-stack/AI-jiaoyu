export type Question = {
  id: string;
  grade: "三年级";
  knowledgePoint: string;
  difficulty: 1 | 2;
  type: "choice" | "blank";
  stem: string;
  options?: string[];
  answer: string;
  explanation: string;
  hint1: string;
  hint2: string;
  mistakeTags: string[];
};

export const questions: Question[] = [
  {
    id: "q_g3_001",
    grade: "三年级",
    knowledgePoint: "万以内加法",
    difficulty: 1,
    type: "choice",
    stem: "小明上午读了 128 页书，下午读了 96 页。他一天一共读了多少页？",
    options: ["214", "224", "234", "244"],
    answer: "224",
    explanation: "128 + 96 = 224，所以一共读了 224 页。",
    hint1: "先看题目问的是“一共”，通常要用加法。",
    hint2: "把 128 和 96 相加，注意个位和十位进位。",
    mistakeTags: ["计算错误", "审题错误"]
  },
  {
    id: "q_g3_002",
    grade: "三年级",
    knowledgePoint: "万以内减法",
    difficulty: 1,
    type: "choice",
    stem: "图书馆原来有 520 本故事书，借出去 185 本，还剩多少本？",
    options: ["335", "345", "355", "365"],
    answer: "335",
    explanation: "520 - 185 = 335，所以还剩 335 本。",
    hint1: "借出去后变少了，要用减法。",
    hint2: "计算 520 - 185 时，注意退位。",
    mistakeTags: ["计算错误", "审题错误"]
  },
  {
    id: "q_g3_003",
    grade: "三年级",
    knowledgePoint: "两位数乘一位数",
    difficulty: 1,
    type: "choice",
    stem: "一盒彩笔有 24 支，3 盒彩笔一共有多少支？",
    options: ["62", "72", "82", "92"],
    answer: "72",
    explanation: "24 × 3 = 72，所以一共有 72 支。",
    hint1: "每盒一样多，求 3 盒一共多少，可以用乘法。",
    hint2: "先算 20 × 3，再算 4 × 3，最后合起来。",
    mistakeTags: ["计算错误", "乘法口诀不熟"]
  },
  {
    id: "q_g3_004",
    grade: "三年级",
    knowledgePoint: "除法平均分",
    difficulty: 1,
    type: "choice",
    stem: "有 36 颗糖，平均分给 4 个小朋友，每人分到多少颗？",
    options: ["7", "8", "9", "10"],
    answer: "9",
    explanation: "36 ÷ 4 = 9，所以每人分到 9 颗。",
    hint1: "“平均分”通常要用除法。",
    hint2: "想一想 4 × 几 = 36。",
    mistakeTags: ["计算错误", "乘法口诀不熟"]
  },
  {
    id: "q_g3_005",
    grade: "三年级",
    knowledgePoint: "两步应用题",
    difficulty: 2,
    type: "choice",
    stem: "小红有 25 枚贴纸，妈妈又给了她 18 枚，她送给同学 12 枚。现在她还有多少枚？",
    options: ["29", "31", "33", "35"],
    answer: "31",
    explanation: "先算 25 + 18 = 43，再算 43 - 12 = 31。",
    hint1: "这道题有两步，先算得到多少，再算剩下多少。",
    hint2: "先加妈妈给的，再减送出去的。",
    mistakeTags: ["审题错误", "计算错误"]
  },
  {
    id: "q_g3_006",
    grade: "三年级",
    knowledgePoint: "长度单位",
    difficulty: 1,
    type: "choice",
    stem: "一根绳子长 3 米，也就是多少厘米？",
    options: ["30 厘米", "300 厘米", "3 厘米", "3000 厘米"],
    answer: "300 厘米",
    explanation: "1 米 = 100 厘米，3 米 = 300 厘米。",
    hint1: "先想一想 1 米等于多少厘米。",
    hint2: "3 米就是 3 个 100 厘米。",
    mistakeTags: ["单位混淆", "计算错误"]
  },
  {
    id: "q_g3_007",
    grade: "三年级",
    knowledgePoint: "时间计算",
    difficulty: 1,
    type: "choice",
    stem: "现在是 8:20，再过 30 分钟是几点？",
    options: ["8:40", "8:50", "9:00", "9:20"],
    answer: "8:50",
    explanation: "20 分再加 30 分是 50 分，所以是 8:50。",
    hint1: "只需要把分钟数加 30。",
    hint2: "20 + 30 = 50，没有超过 60 分。",
    mistakeTags: ["时间计算错误", "计算错误"]
  },
  {
    id: "q_g3_008",
    grade: "三年级",
    knowledgePoint: "长方形周长",
    difficulty: 2,
    type: "choice",
    stem: "一个长方形长 8 厘米，宽 5 厘米，它的周长是多少厘米？",
    options: ["13", "21", "26", "40"],
    answer: "26",
    explanation: "长方形周长 = 长 + 宽 + 长 + 宽，8 + 5 + 8 + 5 = 26。",
    hint1: "周长是围一圈的长度。",
    hint2: "长方形有两条长、两条宽。",
    mistakeTags: ["周长概念不清", "计算错误"]
  },
  {
    id: "q_g3_009",
    grade: "三年级",
    knowledgePoint: "正方形周长",
    difficulty: 1,
    type: "choice",
    stem: "一个正方形的边长是 6 厘米，它的周长是多少厘米？",
    options: ["12", "18", "24", "36"],
    answer: "24",
    explanation: "正方形四条边一样长，6 × 4 = 24。",
    hint1: "正方形有 4 条一样长的边。",
    hint2: "用边长乘 4。",
    mistakeTags: ["周长概念不清", "乘法口诀不熟"]
  },
  {
    id: "q_g3_010",
    grade: "三年级",
    knowledgePoint: "简单统计读表",
    difficulty: 1,
    type: "choice",
    stem: "三年级一班喜欢苹果的有 12 人，喜欢香蕉的有 9 人，喜欢橙子的有 7 人。喜欢哪种水果的人最多？",
    options: ["苹果", "香蕉", "橙子", "一样多"],
    answer: "苹果",
    explanation: "12 最大，所以喜欢苹果的人最多。",
    hint1: "比较 12、9、7 哪个最大。",
    hint2: "人数最多的水果就是答案。",
    mistakeTags: ["图表读错", "审题错误"]
  }
];

export const firstChallengeQuestion = questions[0];
