import type { LearningProgress } from "./learningProgress";

export type SkillCardRecord = {
  id: string;
  name: string;
  title: string;
  description: string;
  level: number;
  exp: number;
  maxExp: number;
  icon: string;
  color: string;
  status: "locked" | "learning" | "upgraded";
  lastAction: string;
  nextTip: string;
};

const LEVEL_EXP = 10;
const MAX_LEVEL = 5;

function buildSkillLevel(totalExp: number) {
  const level = Math.min(MAX_LEVEL, Math.max(1, Math.floor(totalExp / LEVEL_EXP) + 1));
  const exp = level >= MAX_LEVEL ? totalExp : totalExp % LEVEL_EXP;

  return {
    level,
    exp,
    maxExp: LEVEL_EXP,
    status: totalExp <= 0 ? "locked" : level >= 2 ? "upgraded" : "learning"
  } as const;
}

function lastAiAction(progress: LearningProgress) {
  const last = progress.aiHelpRecords.at(-1);

  if (!last) {
    return "还没有使用 AI 提示";
  }

  return `最近使用 Level ${last.level} AI 引导`;
}

function lastMonsterAction(progress: LearningProgress) {
  const defeated = progress.monsters.findLast((monster) => monster.status === "defeated");
  const reviewed = progress.monsters.findLast((monster) => monster.status === "reviewed");

  if (defeated) {
    return `最近击败 ${defeated.name}`;
  }

  if (reviewed) {
    return `最近复盘 ${reviewed.name}`;
  }

  return "还没有完成错题怪兽复盘";
}

export function calculateSkillCards(progress: LearningProgress): SkillCardRecord[] {
  const aiHelpCount = progress.aiHelpRecords.length;
  const levelOneCount = progress.aiHelpRecords.filter((record) => record.level === 1).length;
  const levelTwoCount = progress.aiHelpRecords.filter((record) => record.level === 2).length;
  const levelThreeCount = progress.aiHelpRecords.filter((record) => record.level === 3).length;
  const attemptsAfterThinking = progress.attempts.filter(
    (attempt) => attempt.aiHelpUsed > 0 && attempt.selectedAnswer.trim().length > 0
  ).length;
  const reviewedMonsters = progress.monsters.filter((monster) => monster.status === "reviewed").length;
  const defeatedMonsters = progress.monsters.filter((monster) => monster.status === "defeated").length;
  const reviewedMistakes = progress.mistakes.filter((mistake) => mistake.status === "reviewed").length;
  const defeatedMistakes = progress.mistakes.filter((mistake) => mistake.status === "defeated").length;

  const clearQuestionExp =
    progress.skillTelemetry.clearQuestionSkillExp + aiHelpCount + attemptsAfterThinking + levelOneCount;
  const stepAskExp =
    progress.skillTelemetry.stepAskSkillExp + levelOneCount + levelTwoCount * 2 - levelThreeCount;
  const truthCheckExp =
    (progress.skillTelemetry.fullSolutionViewed ? 2 : 0) +
    levelThreeCount +
    reviewedMonsters * 2 +
    defeatedMonsters * 3 +
    defeatedMistakes;
  const reviewExp = reviewedMonsters * 4 + defeatedMonsters * 8 + reviewedMistakes * 2 + defeatedMistakes * 4;

  const skillSources = [
    {
      id: "clear-question",
      name: "清晰提问术",
      title: "把问题说清楚",
      description: "能说清楚题目、知识点和卡住的位置，AI 才能给出真正有用的引导。",
      totalExp: Math.max(0, clearQuestionExp),
      icon: "💬",
      color: "from-blue-300 to-cyan-500",
      lastAction: lastAiAction(progress),
      nextTip: "先尝试作答，再请求 Level 1 提示，并说出自己卡在哪里。"
    },
    {
      id: "step-ask",
      name: "分步追问术",
      title: "一步步问，而不是要答案",
      description: "学会让 AI 先给思路和关键步骤，把最终计算留给自己完成。",
      totalExp: Math.max(0, stepAskExp),
      icon: "🧭",
      color: "from-violet-300 to-fuchsia-500",
      lastAction: lastAiAction(progress),
      nextTip: "优先使用 Level 1 和 Level 2，尽量不要一开始打开完整讲解。"
    },
    {
      id: "truth-check",
      name: "真相探测器",
      title: "检查 AI 和自己的答案",
      description: "知道讲解也需要验证，会对比答案、步骤和错因，而不是照单全收。",
      totalExp: Math.max(0, truthCheckExp),
      icon: "🔍",
      color: "from-cyan-200 to-teal-500",
      lastAction: lastMonsterAction(progress),
      nextTip: "看完整讲解后，回到错题怪兽里对比自己的答案和正确答案。"
    },
    {
      id: "review-power",
      name: "复盘力",
      title: "从错误里升级",
      description: "能找到错因、复述正确方法，并通过复盘把薄弱点变成下一次的优势。",
      totalExp: Math.max(0, reviewExp),
      icon: "🛡️",
      color: "from-amber-300 to-orange-500",
      lastAction: lastMonsterAction(progress),
      nextTip: "完成一次怪兽复盘，再击败它，复盘力会明显成长。"
    }
  ];

  return skillSources.map((skill) => ({
    ...skill,
    ...buildSkillLevel(skill.totalExp),
    exp: buildSkillLevel(skill.totalExp).exp,
    maxExp: LEVEL_EXP
  }));
}
