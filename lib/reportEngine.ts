import type { LearningProgress, MonsterRecord } from "./learningProgress";
import { calculateSkillCards } from "./skillEngine";

export type ReportOverview = {
  completedChallenges: number;
  exp: number;
  coins: number;
  accuracy: number;
  aiHelpCount: number;
  monsterCount: number;
  defeatedMonsterCount: number;
};

export type WeakPointRecord = {
  knowledgePoint: string;
  mistakeCount: number;
  reviewTip: string;
};

export type AiSkillReport = {
  id: string;
  name: string;
  level: number;
  comment: string;
  nextTip: string;
};

export type MonsterReport = {
  active: number;
  reviewed: number;
  defeated: number;
  latestMonster?: MonsterRecord;
};

export type GrowthReport = {
  overview: ReportOverview;
  summaryText: string;
  weakPoints: WeakPointRecord[];
  aiSkillSummary: AiSkillReport[];
  monsterSummary: MonsterReport;
  tomorrowTips: string[];
};

function getAccuracy(progress: LearningProgress) {
  if (progress.attempts.length === 0) {
    return 0;
  }

  const correct = progress.attempts.filter((attempt) => attempt.isCorrect).length;
  return Math.round((correct / progress.attempts.length) * 100);
}

function getWeakPoints(progress: LearningProgress): WeakPointRecord[] {
  const counts = new Map<string, number>();

  progress.mistakes.forEach((mistake) => {
    counts.set(mistake.knowledgePoint, (counts.get(mistake.knowledgePoint) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([knowledgePoint, mistakeCount]) => ({
      knowledgePoint,
      mistakeCount,
      reviewTip: `先复盘 ${knowledgePoint} 的错因，再做 1 道同类题巩固。`
    }));
}

function buildSummary(progress: LearningProgress, overview: ReportOverview) {
  if (progress.attempts.length === 0) {
    return "今天还没有点亮星星能量题。可以先从第一关开始，遇到卡点时让 Nova 给一点思路提示。";
  }

  const monsterText =
    overview.monsterCount > 0
      ? `遇到了 ${overview.monsterCount} 只错题怪兽`
      : "暂时没有遇到错题怪兽";
  const aiText =
    overview.aiHelpCount > 0
      ? `并使用 Nova 的分步提示 ${overview.aiHelpCount} 次`
      : "并尝试独立点亮题目";
  const reviewText =
    overview.defeatedMonsterCount > 0
      ? `你还收服了 ${overview.defeatedMonsterCount} 只小怪兽，把错误变成了复盘成果。`
      : "下一步可以把错题小怪兽作为训练目标，完成复盘后再收服它。";

  return `今天你完成了 ${overview.completedChallenges} 次挑战，${monsterText}，${aiText}。你正在学会先思考、再求助，而不是直接看答案。${reviewText}`;
}

function buildSkillComments(progress: LearningProgress): AiSkillReport[] {
  return calculateSkillCards(progress).map((skill) => ({
    id: skill.id,
    name: skill.name,
    level: skill.level,
    comment:
      skill.level >= 3
        ? "已经形成稳定习惯，可以挑战更难任务。"
        : skill.level >= 2
          ? "能力正在升级，继续保持正确使用方式。"
          : "还在起步阶段，下一次学习可以主动练习它。",
    nextTip: skill.nextTip
  }));
}

function getMonsterSummary(progress: LearningProgress): MonsterReport {
  const sorted = [...progress.monsters].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    active: progress.monsters.filter((monster) => monster.status === "active").length,
    reviewed: progress.monsters.filter((monster) => monster.status === "reviewed").length,
    defeated: progress.monsters.filter((monster) => monster.status === "defeated").length,
    latestMonster: sorted[0]
  };
}

function buildTomorrowTips(weakPoints: WeakPointRecord[], monsterSummary: MonsterReport, progress: LearningProgress) {
  const targetPoint = weakPoints[0]?.knowledgePoint ?? "百分数应用题";
  const firstTask =
    monsterSummary.active > 0 ? "先去小怪兽图鉴复盘 1 只活跃小怪兽。" : "先完成 1 次星星能量题。";
  const aiSkill =
    progress.aiHelpRecords.some((record) => record.level === 3)
      ? "明天优先使用 Level 1 和 Level 2，让 Nova 引导你自己算完。"
      : "明天继续练习分步追问术：先要思路，再要关键步骤。";

  return [`建议练习：${targetPoint}。`, firstTask, aiSkill];
}

export function buildGrowthReport(progress: LearningProgress): GrowthReport {
  const overview: ReportOverview = {
    completedChallenges: progress.completedChallenges,
    exp: progress.exp,
    coins: progress.coins,
    accuracy: getAccuracy(progress),
    aiHelpCount: progress.aiHelpRecords.length,
    monsterCount: progress.monsters.length,
    defeatedMonsterCount: progress.monsters.filter((monster) => monster.status === "defeated").length
  };
  const weakPoints = getWeakPoints(progress);
  const monsterSummary = getMonsterSummary(progress);

  return {
    overview,
    summaryText: buildSummary(progress, overview),
    weakPoints,
    aiSkillSummary: buildSkillComments(progress),
    monsterSummary,
    tomorrowTips: buildTomorrowTips(weakPoints, monsterSummary, progress)
  };
}
