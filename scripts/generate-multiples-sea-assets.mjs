import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

const force = process.argv.includes("--force");
const model = process.env.IMAGE_MODEL || "gpt-image-2";
const outputDir = path.join(process.cwd(), "public", "assets", "multiples-sea");
const preferredSize = "2048x1152";
const fallbackSize = "1536x1024";
const characterSize = "1024x1024";

const landscapeStyle =
  "Deep blue universe background, children's 3D sci-fi learning game style, blue-purple neon, golden star accents, premium polished game feel, single wide 16:9 scene background only. No text, no Chinese, no numbers, no UI buttons, no logo, no watermark, no multi-panel image.";
const characterStyle =
  "Children's 3D sci-fi educational game mascot asset, premium polished toy-like rendering, clean silhouette, isolated character for UI overlay. No text, no Chinese, no UI buttons, no logo, no watermark, no multi-panel image.";

const assets = [
  {
    kind: "landscape",
    filename: "map-background.png",
    prompt:
      "Create a high-quality 3D cartoon game background for a children's educational adventure app. A deep blue cosmic scene with a glowing math planet in the center, decorated with plus, minus, multiplication and division symbols as raised glossy shapes. Around the planet are several floating islands connected by soft glowing orbital paths: a small cozy robot home island at lower left, a green forest island on the left, a blue ocean island on the right, a distant geometric mountain island at the top, and a newly discovered island at the upper right glowing with golden stars. The scene should feel magical, playful, premium, and suitable for a desktop browser game. Neon blue and purple lighting, golden star accents, cute sci-fi educational game atmosphere, highly polished 3D toy-like rendering, soft bloom, depth, cinematic composition. Leave clean space for UI overlays. No text, no numbers, no UI, no buttons, no logos, no watermark. Single wide 16:9 desktop game background."
  },
  {
    kind: "landscape",
    filename: "beach-background.png",
    prompt:
      "Create a 3D cartoon game background for a children's math adventure level called Multiples Sea. A deep blue magical ocean at night under a starry sky, with gentle glowing waves and a small mysterious island shining in the distance. Across the foreground water, leave a clear horizontal path of five rounded glowing stepping stones without numbers, suitable for overlaying game numbers later. The fifth stone area should look slightly misty and mysterious. On the left foreground, leave space for a cute robot companion character. The atmosphere should be playful, premium, magical, and sci-fi educational. Neon blue and purple lighting, soft golden star highlights, glossy 3D toy-like rendering, cinematic wide desktop composition. No text, no numbers, no UI, no buttons, no watermark. Single wide 16:9 desktop game background."
  },
  {
    kind: "landscape",
    filename: "island-victory-background.png",
    prompt:
      "Create a dramatic 3D cartoon victory background for a children's educational adventure game. A deep blue magical ocean scene where a newly discovered floating island is being activated and glowing brightly on the right side. A path of five glowing stepping-stone positions stretches from the left shore across the water toward the island, but without any numbers. The island has a shining crystal beacon, golden stars, blue-purple energy beams, sparkling particles, and a joyful sense of achievement. The scene should feel like a child has solved a puzzle and unlocked a new island. Premium toy-like 3D render, neon blue, purple and golden lighting, soft bloom, cinematic wide desktop composition. Leave clean space for UI overlays. No text, no numbers, no buttons, no logos, no watermark. Single wide 16:9 desktop game background."
  },
  {
    kind: "landscape",
    filename: "tower-background.png",
    prompt:
      "Create a polished 3D cartoon game background for a children's math adventure level. A magical floating island at night with a glowing energy tower in the center. The tower is cute sci-fi fantasy style, made of blue-purple crystal, golden trim, and soft neon light. The tower body should have five empty circular stone slots or glowing panels arranged clearly for overlaying numbers later. At the bottom foreground, leave clean space for three large answer stones to be overlaid by the UI. The scene should feel like an island puzzle challenge, premium educational game art, deep blue starry sky, floating particles, soft bloom, toy-like 3D rendering. No text, no numbers, no UI, no buttons, no watermark. Single wide 16:9 desktop background."
  },
  {
    kind: "landscape",
    filename: "truth-background.png",
    prompt:
      "Create a polished 3D cartoon game background for a children's educational sci-fi adventure. A mysterious deep blue and purple night scene on a floating island with a glowing crystal tower platform in the background. The scene should feel like a suspenseful moment where a friendly robot companion may have said something questionable. Add subtle floating question mark shaped light particles, soft golden sparkles, blue-purple energy glow, and a calm magical atmosphere. Leave a clear central area for placing a character and a dialogue box overlay. Premium toy-like 3D rendering, cinematic wide desktop composition, soft bloom, deep space background. No text, no numbers, no UI, no buttons, no logos, no watermark. Single wide desktop game background."
  },
  {
    kind: "landscape",
    filename: "notebook-background.png",
    prompt:
      "Create a high-quality 3D cartoon game background for a children's adventure notebook reflection screen. A deep blue magical desk or floating platform in space with an open explorer notebook in the center. The notebook should have blank pages suitable for overlaying stickers and text later. Around it are small golden stars, glowing stickers, a magnifying glass, tiny crystals, and soft blue-purple cosmic lighting. The mood should be warm, rewarding, and reflective, like collecting a memory after finishing a learning adventure. Premium toy-like 3D rendering, clean space for UI overlays, wide desktop composition. No readable text, no numbers, no UI buttons, no logos, no watermark. Single wide desktop game background."
  },
  {
    kind: "landscape",
    filename: "complete-background.png",
    prompt:
      "Create a polished 3D cartoon game background for a children's educational adventure completion screen. A glowing newly discovered island at night, with a crystal beacon shining upward, golden stars, blue-purple light beams, and a friendly celebration atmosphere. Include a clean card-like space on one side for overlaying completion results, and a beautiful scenic area with the island and sparkling ocean on the other side. The mood should feel like a successful quest completion and collectible memory card. Premium toy-like 3D rendering, deep blue cosmic ocean, golden accents, soft bloom, cinematic wide desktop composition. No text, no numbers, no UI, no buttons, no logos, no watermark. Single wide desktop game background."
  },
  {
    kind: "character",
    filename: "nova-guide.png",
    prompt:
      "Create a cute friendly 3D robot mascot character named Nova for a children's educational sci-fi game. Nova is a small white and blue robot with a rounded body, glowing blue eyes on a black screen face, soft blue ear-like side modules, a small yellow light on top, and a cheerful helpful personality. Pose: standing and gently waving, friendly guide expression. Premium toy-like 3D render, clean silhouette, suitable for UI character overlay. No text, no logo, no watermark. Isolated character, transparent background if possible."
  },
  {
    kind: "character",
    filename: "nova-happy.png",
    prompt:
      "Create a cute friendly 3D robot mascot character named Nova for a children's educational sci-fi game. Nova is a small white and blue robot with glowing blue eyes on a black screen face, soft blue side modules, and a small yellow light on top. Pose: happy celebration, jumping slightly or raising both arms with a joyful face, energetic but child-friendly. Premium toy-like 3D render, clean silhouette, suitable for UI overlay. No text, no logo, no watermark. Isolated character, transparent background if possible."
  },
  {
    kind: "character",
    filename: "nova-thinking.png",
    prompt:
      "Create a cute friendly 3D robot mascot character named Nova for a children's educational sci-fi game. Nova is a small white and blue robot with glowing blue eyes on a black screen face, soft blue side modules, and a small yellow light on top. Pose: thinking and curious, one hand near the face, slight head tilt, with a gentle question mark feeling but no actual text. Premium toy-like 3D render, clean silhouette, suitable for UI overlay. No text, no logo, no watermark. Isolated character, transparent background if possible."
  }
];

function ensureApiKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Set it first, for example in PowerShell: $env:OPENAI_API_KEY=\"your_key\""
    );
  }
}

function buildPrompt(asset) {
  const style = asset.kind === "character" ? characterStyle : landscapeStyle;
  return `${asset.prompt}\n\nGlobal constraints: ${style}`;
}

async function generateWithRetry(openai, asset) {
  const attempts =
    asset.kind === "character"
      ? [
          { size: characterSize, quality: "high" },
          { size: characterSize }
        ]
      : [
          { size: preferredSize, quality: "high" },
          { size: preferredSize },
          { size: fallbackSize, quality: "high" },
          { size: fallbackSize }
        ];

  let lastError;
  for (const attempt of attempts) {
    try {
      const result = await openai.images.generate({
        model,
        prompt: buildPrompt(asset),
        size: attempt.size,
        ...(attempt.quality ? { quality: attempt.quality } : {})
      });

      const imageBase64 = result.data?.[0]?.b64_json;
      if (!imageBase64) {
        throw new Error("Image API response did not include data[0].b64_json.");
      }

      return {
        buffer: Buffer.from(imageBase64, "base64"),
        size: attempt.size,
        quality: attempt.quality || "default"
      };
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[retry] size=${attempt.size} quality=${attempt.quality || "default"} failed: ${message}`);
    }
  }

  throw lastError;
}

async function main() {
  ensureApiKey();
  fs.mkdirSync(outputDir, { recursive: true });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log(`[multiples-sea-assets] model=${model}`);
  console.log(`[multiples-sea-assets] outputDir=${outputDir}`);
  console.log(`[multiples-sea-assets] force=${force}`);

  for (const asset of assets) {
    const outputPath = path.join(outputDir, asset.filename);
    if (fs.existsSync(outputPath) && !force) {
      console.log(`[skip] ${asset.filename} already exists. Use --force to overwrite.`);
      continue;
    }

    try {
      console.log(`[generate] ${asset.filename}`);
      const generated = await generateWithRetry(openai, asset);
      fs.writeFileSync(outputPath, generated.buffer);
      console.log(
        `[saved] ${outputPath} (${generated.buffer.length} bytes, size=${generated.size}, quality=${generated.quality})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.stack || error.message : String(error);
      console.error(`[failed] ${asset.filename}`);
      console.error(message);
      process.exitCode = 1;
      break;
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
