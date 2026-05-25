import type { DailyQuestState } from "./dailyQuestEngine";
import type { LearningProgress } from "./learningProgress";

export type LastAnswerResult = "correct" | "wrong" | "idle";

export type NextStepAction = {
  label: string;
  href: string;
};

export type NextStepRecommendation = {
  primaryLabel: string;
  primaryHref: string;
  secondaryActions: NextStepAction[];
  reason: string;
};

function isQuestPending(dailyQuestState: DailyQuestState, type: "challenge" | "ai_help" | "monster_review") {
  return dailyQuestState.dailyQuests.some((quest) => quest.type === type && quest.status !== "completed");
}

export function getNextStepRecommendation({
  progress,
  dailyQuestState,
  lastAnswerResult
}: {
  progress: LearningProgress;
  dailyQuestState: DailyQuestState;
  lastAnswerResult: LastAnswerResult;
}): NextStepRecommendation {
  const activeMonsters = progress.monsters.filter((monster) => monster.status === "active").length;
  const novaQuestPending = isQuestPending(dailyQuestState, "ai_help");
  const monsterQuestPending = isQuestPending(dailyQuestState, "monster_review");

  if (lastAnswerResult === "wrong") {
    return {
      primaryLabel: "去收服小怪兽",
      primaryHref: "/monsters",
      secondaryActions: [
        { label: "让 Nova 再讲一次", href: "/challenge?mode=nova-review" },
        { label: "返回冒险大厅", href: "/adventure" }
      ],
      reason: "刚才答错的题已经变成小怪兽，先去复盘会更像完成一关。"
    };
  }

  if (lastAnswerResult === "correct" && novaQuestPending) {
    return {
      primaryLabel: "让 Nova 帮我检查",
      primaryHref: "/challenge?mode=nova-check",
      secondaryActions: [
        { label: "继续下一关", href: "/challenge" },
        { label: "返回冒险大厅", href: "/adventure" }
      ],
      reason: "你已经点亮能量题了，再让 Nova 检查一下思路，就能完成 Nova 小帮手任务。"
    };
  }

  if (activeMonsters > 0 && monsterQuestPending) {
    return {
      primaryLabel: "去收服小怪兽",
      primaryHref: "/monsters",
      secondaryActions: [
        { label: "继续下一关", href: "/challenge" },
        { label: "返回冒险大厅", href: "/adventure" }
      ],
      reason: "图鉴里还有小怪兽，收服它可以完成今天的第三关。"
    };
  }

  if (activeMonsters === 0 && monsterQuestPending) {
    return {
      primaryLabel: "去领取星星宝箱",
      primaryHref: "/adventure",
      secondaryActions: [
        { label: "继续下一关", href: "/challenge" },
        { label: "查看今日星星报告", href: "/report" }
      ],
      reason: "今天还没有小怪兽，回到大厅领取星星宝箱也能完成第三关。"
    };
  }

  if (dailyQuestState.dailyCompleted) {
    return {
      primaryLabel: "领取今日星星报告",
      primaryHref: "/report",
      secondaryActions: [
        { label: "继续练一题", href: "/challenge" },
        { label: "返回冒险大厅", href: "/adventure" }
      ],
      reason: "今天三关都完成了，可以查看今日星星报告。"
    };
  }

  return {
    primaryLabel: "继续下一关",
    primaryHref: "/challenge",
    secondaryActions: [
      { label: "返回冒险大厅", href: "/adventure" },
      { label: "查看今日星星报告", href: "/report" }
    ],
    reason: "继续完成下一道星星能量题，让数学星球更亮一点。"
  };
}
