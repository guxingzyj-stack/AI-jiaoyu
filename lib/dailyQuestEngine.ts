import {
  defaultStudent,
  PROGRESS_STORAGE_KEY,
  readJson,
  readProgress,
  readStudent,
  saveStudentAndProgress,
  STUDENT_STORAGE_KEY,
  type LearningProgress,
  type StudentProfile
} from "./learningProgress";

export type DailyQuestType = "challenge" | "ai_help" | "monster_review";

export type DailyQuest = {
  id: string;
  title: string;
  description: string;
  type: DailyQuestType;
  status: "pending" | "completed";
  rewardExp: number;
  rewardCoins: number;
};

export type DailyQuestState = {
  lastQuestDate: string;
  dailyQuests: DailyQuest[];
  dailyCompleted: boolean;
  streak: number;
};

export const DAILY_QUEST_STORAGE_KEY = "zx_adventurer_daily_quests";

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getYesterdayKey(date = new Date()) {
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  return getTodayKey(yesterday);
}

export function createDailyQuests(): DailyQuest[] {
  return [
    {
      id: "daily-challenge",
      title: "完成 1 次数学挑战",
      description: "进入挑战舱，认真完成一道数学题。",
      type: "challenge",
      status: "pending",
      rewardExp: 10,
      rewardCoins: 3
    },
    {
      id: "daily-ai-help",
      title: "使用 1 次 Nova AI 提示",
      description: "让 Nova 给你一点思路，而不是直接抄答案。",
      type: "ai_help",
      status: "pending",
      rewardExp: 5,
      rewardCoins: 1
    },
    {
      id: "daily-monster-review",
      title: "复盘或击败 1 只错题怪兽",
      description: "把一个错题怪兽变成今天的训练成果。",
      type: "monster_review",
      status: "pending",
      rewardExp: 10,
      rewardCoins: 3
    }
  ];
}

function allCompleted(quests: DailyQuest[]) {
  return quests.length > 0 && quests.every((quest) => quest.status === "completed");
}

export function readDailyQuestState(): DailyQuestState {
  const today = getTodayKey();
  const saved = readJson<DailyQuestState | null>(DAILY_QUEST_STORAGE_KEY, null);
  const student = readStudent();
  const progress = readProgress();

  if (!saved) {
    const initialState = {
      lastQuestDate: today,
      dailyQuests: createDailyQuests(),
      dailyCompleted: false,
      streak: student.streak || 1
    };
    writeDailyQuestState(initialState, student, progress);
    return initialState;
  }

  if (saved.lastQuestDate !== today) {
    const keptStreak =
      saved.lastQuestDate === getYesterdayKey() && saved.dailyCompleted ? Math.max(1, saved.streak + 1) : 1;
    const nextState = {
      lastQuestDate: today,
      dailyQuests: createDailyQuests(),
      dailyCompleted: false,
      streak: keptStreak
    };
    writeDailyQuestState(nextState, { ...student, streak: keptStreak }, progress);
    return nextState;
  }

  const normalizedState = {
    ...saved,
    dailyQuests: saved.dailyQuests?.length ? saved.dailyQuests : createDailyQuests(),
    dailyCompleted: allCompleted(saved.dailyQuests ?? []),
    streak: saved.streak || student.streak || 1
  };
  writeDailyQuestState(normalizedState, { ...student, streak: normalizedState.streak }, progress);
  return normalizedState;
}

export function writeDailyQuestState(
  state: DailyQuestState,
  student: StudentProfile = readStudent(),
  progress: LearningProgress = readProgress()
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DAILY_QUEST_STORAGE_KEY, JSON.stringify(state));
  saveStudentAndProgress({ ...defaultStudent, ...student, streak: state.streak }, progress);
}

export function applyDailyQuestCompletion(
  type: DailyQuestType,
  student: StudentProfile,
  progress: LearningProgress
) {
  const state = readDailyQuestState();
  const quest = state.dailyQuests.find((item) => item.type === type);

  if (!quest || quest.status === "completed") {
    return {
      student,
      progress,
      dailyQuestState: state,
      awarded: false
    };
  }

  const nextProgress = {
    ...progress,
    exp: Math.min(student.maxExp, progress.exp + quest.rewardExp),
    coins: progress.coins + quest.rewardCoins
  };
  const nextStudent = {
    ...student,
    exp: nextProgress.exp,
    coins: nextProgress.coins,
    streak: state.streak
  };
  const nextQuests = state.dailyQuests.map((item) =>
    item.id === quest.id
      ? {
          ...item,
          status: "completed" as const
        }
      : item
  );
  const nextState = {
    ...state,
    dailyQuests: nextQuests,
    dailyCompleted: allCompleted(nextQuests)
  };

  writeDailyQuestState(nextState, nextStudent, nextProgress);

  return {
    student: nextStudent,
    progress: nextProgress,
    dailyQuestState: nextState,
    awarded: true
  };
}

export function resetExperienceData() {
  if (typeof window === "undefined") {
    return;
  }

  [
    STUDENT_STORAGE_KEY,
    PROGRESS_STORAGE_KEY,
    DAILY_QUEST_STORAGE_KEY,
    "zx_adventurer_launches",
    "zx_adventurer_current_question",
    "zx_adventurer_question_cursor"
  ].forEach((key) => window.localStorage.removeItem(key));
}
