import Image from "next/image";
import { Sparkles } from "lucide-react";
import { gameAssets } from "../lib/gameAssets";

export function NovaSpeechBubble({ line, mood = "happy" }: { line: string; mood?: "happy" | "thinking" | "cheer" }) {
  const image =
    mood === "thinking" ? gameAssets.novaThinking : mood === "cheer" ? gameAssets.novaCheer : gameAssets.novaHappy;

  return (
    <div className="relative flex gap-3 rounded-[28px] border border-cyan-200/30 bg-cyan-100/12 p-3 shadow-[0_16px_38px_rgba(34,211,238,0.16)] backdrop-blur-xl">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-white/35 bg-white/20">
        <Image
          alt="Nova"
          className="h-full w-full object-contain p-1"
          height={1254}
          sizes="64px"
          src={image}
          width={1254}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-cyan-300 px-2.5 py-1 text-[11px] font-black text-slate-950">
          <Sparkles size={12} />
          Nova 正在带路
        </div>
        <p className="break-words text-lg font-black leading-7 text-white">{line}</p>
      </div>
      <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-amber-200 shadow-[0_0_20px_rgba(253,230,138,0.8)]" />
    </div>
  );
}
