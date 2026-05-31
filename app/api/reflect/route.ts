import { NextResponse } from "next/server";
import { getMockReflection } from "../../../lib/mockReflection";
import { buildReflectionPrompt, type ReflectionPromptInput } from "../../../lib/reflectionPrompt";

export const runtime = "nodejs";

// 默认指向硅基流动 SiliconFlow（OpenAI 兼容的 chat/completions 接口，托管 DeepSeek 等模型）。
// 可用环境变量覆盖换其他厂商：
//   SILICONFLOW_API_KEY（或 AI_API_KEY / OPENAI_API_KEY）— 鉴权用的 Key
//   AI_BASE_URL — 接口前缀，默认 https://api.siliconflow.cn/v1
//   AI_MODEL    — 模型名，默认 deepseek-ai/DeepSeek-V4-Flash（硅基流动的模型名带命名空间前缀）
const DEFAULT_BASE_URL = "https://api.siliconflow.cn/v1";
const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V4-Flash";

type ChatCompletionResponse = {
  choices?: { message?: { content?: string } }[];
};

function resolveApiKey(): string {
  return process.env.SILICONFLOW_API_KEY ?? process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? "";
}

function isValidInput(value: unknown): value is ReflectionPromptInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.islandName === "string" &&
    typeof v.choice === "string" &&
    typeof v.choiceLabel === "string" &&
    typeof v.seed === "string"
  );
}

async function getAiReflection(input: ReflectionPromptInput, apiKey: string): Promise<string | null> {
  const baseUrl = (process.env.AI_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const model = process.env.AI_MODEL ?? DEFAULT_MODEL;
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: buildReflectionPrompt(input) }],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });
    if (!response.ok) return null;
    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string") return null;
    const parsed = JSON.parse(content) as { text?: unknown };
    return typeof parsed.text === "string" && parsed.text.trim().length > 0 ? parsed.text.trim() : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!isValidInput(input)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const apiKey = resolveApiKey();
  // 无 key：直接返回兜底文案（静态贴纸），保证离线/无后端也能用。
  if (!apiKey) {
    return NextResponse.json({ text: getMockReflection(input), source: "mock" });
  }

  const aiText = await getAiReflection(input, apiKey);
  if (aiText) {
    return NextResponse.json({ text: aiText, source: "ai" });
  }
  // 调用失败/解析失败：回落到兜底，绝不把错误暴露给孩子。
  return NextResponse.json({ text: getMockReflection(input), source: "fallback" });
}
