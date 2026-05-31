import type { ReflectionPromptInput } from "./reflectionPrompt";

// 无 OPENAI_API_KEY 或 AI 调用失败时的兜底：直接回到精心写好的静态贴纸文案（seed），
// 保证「没有后端也能正常玩」，且文案质量不退化。设置好 key 后路由会自动切到真 AI。
export function getMockReflection(input: ReflectionPromptInput): string {
  return input.seed;
}
