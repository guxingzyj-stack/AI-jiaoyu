import type { AiTutorRequest, AiTutorResponse } from "./mockAiTutor";
import { getMockAiTutorHint } from "./mockAiTutor";
import { buildAiTutorPrompt } from "./aiPrompt";

type OpenAiJsonResponse = {
  output_text?: string;
};

function canUseServerOpenAi() {
  return typeof window === "undefined" && typeof process !== "undefined" && Boolean(process.env.OPENAI_API_KEY);
}

async function getOpenAiTutorHint(request: AiTutorRequest): Promise<AiTutorResponse> {
  const prompt = buildAiTutorPrompt(request);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      input: prompt,
      text: {
        format: {
          type: "json_object"
        }
      }
    })
  });

  if (!response.ok) {
    return getMockAiTutorHint(request);
  }

  const data = (await response.json()) as OpenAiJsonResponse;

  try {
    return JSON.parse(data.output_text ?? "") as AiTutorResponse;
  } catch {
    return getMockAiTutorHint(request);
  }
}

export async function getAiTutorHint(request: AiTutorRequest): Promise<AiTutorResponse> {
  if (canUseServerOpenAi()) {
    return getOpenAiTutorHint(request);
  }

  return getMockAiTutorHint(request);
}
