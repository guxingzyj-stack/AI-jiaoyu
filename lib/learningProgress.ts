export type StudentProfile = {
  nickname: string;
  level: number;
  exp: number;
  maxExp: number;
  coins: number;
  streak: number;
};

export type ChallengeAttempt = {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  knowledgePoint: string;
  aiHelpUsed: number;
  createdAt: string;
};

export type AiHelpLevel = 1 | 2 | 3;

export type AiHelpRecord = {
  questionId: string;
  level: AiHelpLevel;
  message: string;
  fullSolutionViewed?: boolean;
  createdAt: string;
};

export type SkillTelemetry = {
  clearQuestionSkillExp: number;
  stepAskSkillExp: number;
  fullSolutionViewed: boolean;
};

export type MistakeRecord = {
  id?: string;
  questionId: string;
  stem: string;
  selectedAnswer: string;
  correctAnswer: string;
  knowledgePoint: string;
  mistakeTags: string[];
  status: "pending" | "reviewed" | "defeated";
  createdAt: string;
};

export type MonsterType = "careless" | "illusion" | "fog" | "armor" | "vine" | "normal";

export type MonsterStatus = "active" | "reviewed" | "defeated";

export type MonsterRecord = {
  id: string;
  mistakeId: string;
  questionId: string;
  name: string;
  type: MonsterType;
  title: string;
  description: string;
  weakness: string;
  knowledgePoint: string;
  status: MonsterStatus;
  hp: number;
  maxHp: number;
  rewardExp: number;
  rewardCoins: number;
  createdAt: string;
  defeatedAt?: string;
};

export type LearningProgress = {
  exp: number;
  coins: number;
  completedChallenges: number;
  tutorialFirstWinDone: boolean;
  attempts: ChallengeAttempt[];
  mistakes: MistakeRecord[];
  monsters: MonsterRecord[];
  aiHelpRecords: AiHelpRecord[];
  skillTelemetry: SkillTelemetry;
};

export const STUDENT_STORAGE_KEY = "zx_adventurer_student";
export const LAUNCHES_STORAGE_KEY = "zx_adventurer_launches";
export const PROGRESS_STORAGE_KEY = "zx_adventurer_progress";

export const defaultStudent: StudentProfile = {
  nickname: "星星新手",
  level: 1,
  exp: 0,
  maxExp: 1000,
  coins: 0,
  streak: 0
};

export const defaultProgress: LearningProgress = {
  exp: defaultStudent.exp,
  coins: defaultStudent.coins,
  completedChallenges: 0,
  tutorialFirstWinDone: false,
  attempts: [],
  mistakes: [],
  monsters: [],
  aiHelpRecords: [],
  skillTelemetry: {
    clearQuestionSkillExp: 0,
    stepAskSkillExp: 0,
    fullSolutionViewed: false
  }
};

// 统一的等级体系：经验值是“累计总经验”，永不清零、永不封顶。
// 每 EXP_PER_LEVEL 点经验升 1 级；展示进度条用“当前等级内的经验 / EXP_PER_LEVEL”。
export const EXP_PER_LEVEL = 100;

export function computeLevel(totalExp: number) {
  const safeExp = Math.max(0, Math.floor(totalExp));
  const level = Math.floor(safeExp / EXP_PER_LEVEL) + 1;
  const expIntoLevel = safeExp % EXP_PER_LEVEL;

  return {
    level,
    expIntoLevel,
    expForNextLevel: EXP_PER_LEVEL,
    percent: Math.round((expIntoLevel / EXP_PER_LEVEL) * 100)
  };
}

export function normalizeAnswer(answer: string) {
  return answer.trim().replace(/\s+/g, "").replace("＝", "=").replace("，", ",");
}

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readStudent(): StudentProfile {
  const savedStudent = readJson<StudentProfile>(STUDENT_STORAGE_KEY, defaultStudent);
  const savedProgress = readJson<LearningProgress>(PROGRESS_STORAGE_KEY, {
    ...defaultProgress,
    exp: savedStudent.exp,
    coins: savedStudent.coins
  });

  const exp = savedProgress.exp ?? savedStudent.exp;

  return {
    ...defaultStudent,
    ...savedStudent,
    exp,
    coins: savedProgress.coins ?? savedStudent.coins,
    level: computeLevel(exp).level
  };
}

export function readProgress(): LearningProgress {
  const student = readJson<StudentProfile>(STUDENT_STORAGE_KEY, defaultStudent);
  const progress = readJson<LearningProgress>(PROGRESS_STORAGE_KEY, {
    ...defaultProgress,
    exp: student.exp,
    coins: student.coins
  });

  return {
    ...defaultProgress,
    ...progress,
    exp: progress.exp ?? student.exp,
    coins: progress.coins ?? student.coins,
    completedChallenges: progress.completedChallenges ?? 0,
    tutorialFirstWinDone: progress.tutorialFirstWinDone ?? false,
    attempts: progress.attempts ?? [],
    mistakes: progress.mistakes ?? [],
    monsters: progress.monsters ?? [],
    aiHelpRecords: progress.aiHelpRecords ?? [],
    skillTelemetry: {
      ...defaultProgress.skillTelemetry,
      ...(progress.skillTelemetry ?? {})
    }
  };
}

export function saveStudentAndProgress(student: StudentProfile, progress: LearningProgress) {
  // progress 是 exp/coins 的唯一真相源；student 上的这几个字段始终从 progress 派生，
  // 这样任何调用方传入的过期 student.exp/coins 都不会造成两份数据漂移。
  const syncedStudent: StudentProfile = {
    ...student,
    exp: progress.exp,
    coins: progress.coins,
    level: computeLevel(progress.exp).level
  };
  writeJson(STUDENT_STORAGE_KEY, syncedStudent);
  writeJson(PROGRESS_STORAGE_KEY, progress);
}
