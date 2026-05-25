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
  nickname: "星河小队长",
  level: 7,
  exp: 680,
  maxExp: 1000,
  coins: 1280,
  streak: 5
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

  return {
    ...defaultStudent,
    ...savedStudent,
    exp: savedProgress.exp ?? savedStudent.exp,
    coins: savedProgress.coins ?? savedStudent.coins
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
  writeJson(STUDENT_STORAGE_KEY, student);
  writeJson(PROGRESS_STORAGE_KEY, progress);
}
