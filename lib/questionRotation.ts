import { questions, type Question } from "../data/questions";
import type { LearningProgress } from "./learningProgress";

export const CURRENT_QUESTION_STORAGE_KEY = "zx_adventurer_current_question";
export const QUESTION_CURSOR_STORAGE_KEY = "zx_adventurer_question_cursor";

export function selectChallengeQuestion(progress: LearningProgress): Question {
  if (typeof window === "undefined") {
    return questions[0];
  }

  const currentQuestionId = window.localStorage.getItem(CURRENT_QUESTION_STORAGE_KEY);
  const currentQuestion = questions.find((question) => question.id === currentQuestionId);

  if (currentQuestion) {
    return currentQuestion;
  }

  const attemptCounts = new Map<string, number>();
  progress.attempts.forEach((attempt) => {
    attemptCounts.set(attempt.questionId, (attemptCounts.get(attempt.questionId) ?? 0) + 1);
  });

  const leastAttempted = [...questions].sort((a, b) => {
    const diff = (attemptCounts.get(a.id) ?? 0) - (attemptCounts.get(b.id) ?? 0);
    return diff === 0 ? questions.indexOf(a) - questions.indexOf(b) : diff;
  });
  const minCount = attemptCounts.get(leastAttempted[0].id) ?? 0;
  const candidates = leastAttempted.filter((question) => (attemptCounts.get(question.id) ?? 0) === minCount);
  const cursor = Number(window.localStorage.getItem(QUESTION_CURSOR_STORAGE_KEY) ?? 0);
  const question = candidates[cursor % candidates.length] ?? questions[0];

  window.localStorage.setItem(QUESTION_CURSOR_STORAGE_KEY, String(cursor + 1));
  window.localStorage.setItem(CURRENT_QUESTION_STORAGE_KEY, question.id);

  return question;
}
