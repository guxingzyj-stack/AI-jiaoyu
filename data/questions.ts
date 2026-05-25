export type Question = {
  id: string;
  grade: "五年级" | "六年级" | "初一";
  knowledgePoint: string;
  difficulty: 1 | 2 | 3;
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
    id: "math-001",
    grade: "六年级",
    knowledgePoint: "百分数应用题",
    difficulty: 1,
    type: "choice",
    stem: "一件外套原价 200 元，打八折出售。现价是多少元？",
    options: ["120", "140", "160", "180"],
    answer: "160",
    explanation: "八折表示现价是原价的 80%，所以 200 x 80% = 160 元。",
    hint1: "八折可以先写成 80%。",
    hint2: "用原价乘 80%，也就是 200 x 0.8。",
    mistakeTags: ["折扣意义", "百分数转小数"]
  },
  {
    id: "math-002",
    grade: "五年级",
    knowledgePoint: "分数计算",
    difficulty: 1,
    type: "blank",
    stem: "计算：1/2 + 1/4 = ? 请填写最简分数。",
    answer: "3/4",
    explanation: "1/2 通分为 2/4，2/4 + 1/4 = 3/4。",
    hint1: "先把两个分数变成同分母。",
    hint2: "1/2 等于 2/4。",
    mistakeTags: ["通分", "分数加法"]
  },
  {
    id: "math-003",
    grade: "六年级",
    knowledgePoint: "简易方程",
    difficulty: 2,
    type: "choice",
    stem: "解方程：3x + 5 = 20，x 等于多少？",
    options: ["3", "5", "8", "15"],
    answer: "5",
    explanation: "等式两边先减 5，得到 3x = 15，再除以 3，x = 5。",
    hint1: "先把 +5 移走。",
    hint2: "3x = 15 后，再除以 3。",
    mistakeTags: ["移项", "方程求解"]
  },
  {
    id: "math-004",
    grade: "初一",
    knowledgePoint: "一元一次方程",
    difficulty: 2,
    type: "blank",
    stem: "解方程：2(x - 3) = 10，x = ?",
    answer: "8",
    explanation: "两边先除以 2，得到 x - 3 = 5，所以 x = 8。",
    hint1: "可以先把括号外面的 2 去掉。",
    hint2: "x - 3 = 5 时，两边都加 3。",
    mistakeTags: ["去括号", "一元一次方程"]
  },
  {
    id: "math-005",
    grade: "五年级",
    knowledgePoint: "几何面积",
    difficulty: 1,
    type: "choice",
    stem: "一个长方形长 12 cm，宽 5 cm，面积是多少平方厘米？",
    options: ["17", "34", "60", "120"],
    answer: "60",
    explanation: "长方形面积 = 长 x 宽，所以 12 x 5 = 60 平方厘米。",
    hint1: "长方形面积公式是长乘宽。",
    hint2: "把 12 和 5 相乘。",
    mistakeTags: ["面积公式", "单位意识"]
  },
  {
    id: "math-006",
    grade: "初一",
    knowledgePoint: "有理数计算",
    difficulty: 2,
    type: "choice",
    stem: "计算：-3 + 8 - 10 = ?",
    options: ["-5", "1", "5", "15"],
    answer: "-5",
    explanation: "-3 + 8 = 5，5 - 10 = -5。",
    hint1: "可以从左到右分两步计算。",
    hint2: "先算 -3 + 8。",
    mistakeTags: ["正负数加减", "有理数运算"]
  },
  {
    id: "math-007",
    grade: "六年级",
    knowledgePoint: "百分数应用题",
    difficulty: 2,
    type: "blank",
    stem: "某班有 40 人，其中 25% 参加篮球社。参加篮球社的有多少人？",
    answer: "10",
    explanation: "40 的 25% 是 40 x 1/4 = 10 人。",
    hint1: "25% 等于 1/4。",
    hint2: "求一个数的百分之几，用乘法。",
    mistakeTags: ["百分数意义", "数量关系"]
  },
  {
    id: "math-008",
    grade: "五年级",
    knowledgePoint: "分数计算",
    difficulty: 2,
    type: "choice",
    stem: "计算：2/3 - 1/6 = ?",
    options: ["1/6", "1/3", "1/2", "5/6"],
    answer: "1/2",
    explanation: "2/3 = 4/6，4/6 - 1/6 = 3/6 = 1/2。",
    hint1: "先通分到分母 6。",
    hint2: "2/3 可以变成 4/6。",
    mistakeTags: ["通分", "约分"]
  },
  {
    id: "math-009",
    grade: "初一",
    knowledgePoint: "一元一次方程",
    difficulty: 3,
    type: "blank",
    stem: "解方程：5x - 7 = 2x + 8，x = ?",
    answer: "5",
    explanation: "两边减 2x，得 3x - 7 = 8；两边加 7，得 3x = 15；所以 x = 5。",
    hint1: "先把含 x 的项放到一边。",
    hint2: "5x - 2x = 3x，接着处理 -7。",
    mistakeTags: ["移项", "合并同类项"]
  },
  {
    id: "math-010",
    grade: "六年级",
    knowledgePoint: "几何面积",
    difficulty: 3,
    type: "choice",
    stem: "一个三角形底为 10 cm，高为 6 cm，面积是多少平方厘米？",
    options: ["16", "30", "60", "120"],
    answer: "30",
    explanation: "三角形面积 = 底 x 高 ÷ 2，所以 10 x 6 ÷ 2 = 30。",
    hint1: "三角形面积不是直接底乘高。",
    hint2: "算出 10 x 6 后，还要除以 2。",
    mistakeTags: ["三角形面积", "公式应用"]
  }
];

export const firstChallengeQuestion = questions[0];
