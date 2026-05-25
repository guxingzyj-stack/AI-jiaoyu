import type { Question } from "../data/questions";
import type { AiHelpLevel } from "./learningProgress";

export type AiTutorResponse = {
  level: AiHelpLevel;
  title: string;
  message: string;
  encouragement: string;
  nextAction: string;
};

export type AiTutorRequest = {
  question: Question;
  selectedAnswer: string;
  level: AiHelpLevel;
};

export function getMockAiTutorHint({ question, selectedAnswer, level }: AiTutorRequest): AiTutorResponse {
  const answerContext = selectedAnswer
    ? `我看到你现在选的是 ${selectedAnswer}，先别急着判定对错。`
    : "你还没有作答，我们先把题目里的条件找出来。";

  if (level === 1) {
    return {
      level,
      title: "思路雷达",
      message: `${answerContext} 这题的关键不是先算，而是先看“打八折”表示现价和原价之间的关系。想一想：折扣是不是表示“原价的一部分”？`,
      encouragement: "你已经进入正确的观察方向了，先把题目条件圈出来。",
      nextAction: "请先写出“八折”对应的百分数，再选择答案。"
    };
  }

  if (level === 2) {
    return {
      level,
      title: "关键步骤导航",
      message: `${question.knowledgePoint}里，求折后价通常用“原价 x 折扣对应的比例”。八折可以看成 80%，也就是 0.8。先用 200 和 0.8 建立算式。`,
      encouragement: "很好，现在你已经拿到解题路线了，最后一步自己来完成。",
      nextAction: "请计算 200 x 0.8，再回到选项里找匹配的数。"
    };
  }

  return {
    level,
    title: "完整复盘讲解",
    message: `这题问现价。八折表示现价是原价的 80%，所以用 200 x 80% = 200 x 0.8 = ${question.answer}。因此正确答案是 ${question.answer}。`,
    encouragement: "看懂不等于真正掌握，最棒的做法是合上讲解再独立算一遍。",
    nextAction: "请重新在草稿纸上写一遍“原价 x 80%”，再提交你的答案。"
  };
}
