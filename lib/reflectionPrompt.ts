import type { ReflectionChoice } from "./adventures";

// Beat 7 反思的 AI 输入：把这次探险的关键事实喂给模型，让它写一句贴合孩子选择的复盘。
export type ReflectionPromptInput = {
  islandName: string; // 本关名称，如「倍数海新岛探险」
  choice: ReflectionChoice; // 孩子点的贴纸
  choiceLabel: string; // 贴纸中文名，如「找规律」
  stoneStep: number; // 第一段数字路的步长（如 +2 / +5）
  towerStep: number; // 第二段数字路的步长（如 +2 / +4）
  truthDetectorSuccess: boolean; // 是否识破了 Nova 的过度概括
  seed: string; // 静态贴纸文案，作为风格锚点与兜底
};

export const REFLECTION_CHOICE_LABELS: Record<ReflectionChoice, string> = {
  pattern: "找规律",
  ask_nova: "问 Nova",
  island_light: "点亮新岛",
  not_blind_trust: "不全信 Nova"
};

export function buildReflectionPrompt(input: ReflectionPromptInput): string {
  return [
    "你是数学冒险游戏里的学习伙伴小机器人 Nova，正在帮一个三年级（约 8 岁）的小朋友写探险笔记。",
    "请根据下面的探险事实和孩子选的贴纸，写一句温暖、口语化的复盘话，贴在他的笔记本上。",
    "要求：",
    "- 直接对孩子说话，用「你」。",
    "- 只写 1～2 句，总长不超过 40 个汉字，简单好懂。",
    "- 围绕孩子选的这张贴纸主题来夸他今天的具体发现。",
    "- 不要出现算式、百分号、专业术语，最多提到“每次多几个”这样的口语。",
    "- 语气像游戏伙伴，温暖、鼓励，不说教、不催促、不提分数。",
    "- 只输出 JSON，不要 Markdown。",
    "",
    `这一关：${input.islandName}`,
    `孩子选的贴纸：${input.choiceLabel}`,
    `第一段数字路：每次多 ${input.stoneStep} 个`,
    `第二段数字路：每次多 ${input.towerStep} 个`,
    `是否识破了 Nova 把规律说得太绝对：${input.truthDetectorSuccess ? "是，孩子自己检查出来了" : "没有触发或没识破"}`,
    `参考风格（可改写，别照抄）：${input.seed}`,
    "",
    "JSON 结构：",
    '{"text":"写给孩子的那一两句复盘"}'
  ].join("\n");
}
