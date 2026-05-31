import type { ReflectionPromptInput } from "./reflectionPrompt";

export type ReflectionResult = {
  text: string;
  source: "ai" | "mock" | "fallback" | "network_error";
};

// 客户端调用：POST 到 /api/reflect 取 Beat 7 复盘文案。任何网络/服务端异常都回落到
// 传入的 seed（静态贴纸文案），保证孩子永远看到一句完整的话、看不到报错。
export async function getReflection(input: ReflectionPromptInput): Promise<ReflectionResult> {
  try {
    const response = await fetch("/api/reflect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!response.ok) {
      return { text: input.seed, source: "network_error" };
    }
    const data = (await response.json()) as { text?: unknown; source?: unknown };
    const text = typeof data.text === "string" && data.text.trim().length > 0 ? data.text.trim() : input.seed;
    const source =
      data.source === "ai" || data.source === "mock" || data.source === "fallback" ? data.source : "fallback";
    return { text, source };
  } catch {
    return { text: input.seed, source: "network_error" };
  }
}
