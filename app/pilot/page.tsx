"use client";

import Link from "next/link";
import { Clock, Rocket, RotateCcw, ShieldCheck, Sparkles, Target } from "lucide-react";
import { resetExperienceData } from "../../lib/dailyQuestEngine";

const screeningVersion = "S1 Screening Build v0.1";

export default function PilotPage() {
  const resetData = () => {
    if (window.confirm("确定要重置体验数据吗？这会清空本机的挑战、怪兽、技能和报告记录。")) {
      resetExperienceData();
      window.location.href = "/adventure";
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070a1a] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-20%] top-[-12%] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-22%] top-[18%] h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[16%] h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-10 pt-8 sm:px-6">
        <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 shadow-glow backdrop-blur-xl sm:p-8">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
            <Rocket size={34} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">Pilot Preview</p>
          <h1 className="mt-2 text-4xl font-black leading-tight sm:text-6xl">
            智学探险家 · 第一季试映版
          </h1>
          <p className="mt-4 text-base font-bold leading-7 text-slate-200">
            适合小学 5-6 年级和初一学生。建议体验 5-10 分钟，目标是完成一次学习冒险并获得成长报告。
          </p>
          <Link
            className="mt-6 inline-flex min-h-14 items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-500 px-6 text-lg font-black text-slate-950 shadow-glow"
            data-testid="pilot-start"
            href="/adventure"
          >
            开始体验
          </Link>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <InfoPanel
            icon={Clock}
            title="试用说明"
            items={[
              "建议使用手机体验",
              "建议体验时间：5-10 分钟",
              "当前是第一季试映版",
              "数据仅保存在当前浏览器",
              "今日目标：完成一次学习冒险",
              "体验目标不是刷题数量，而是完成一次学习冒险",
              "推荐流程：开始体验 → 做题挑战 → 使用 Nova 提示 → 查看怪兽/技能/报告"
            ]}
          />
          <InfoPanel
            icon={Target}
            title="今天要体验什么"
            items={["今日冒险", "做一道数学挑战", "使用 Nova 提示", "生成或复盘错题怪兽", "查看成长报告"]}
          />
          <InfoPanel
            icon={Sparkles}
            title="给学生看的说明"
            items={["你今天的任务是完成一次学习冒险。", "遇到不会的题，可以让 Nova 给提示。", "最后看看能不能获得成长报告。"]}
          />
          <InfoPanel
            icon={ShieldCheck}
            title="给家长看的说明"
            items={[
              "本版本是早期试映版，重点测试孩子是否愿意用游戏方式完成学习任务。",
              "这不是普通刷题软件，而是通过游戏任务和 AI 引导，帮助孩子完成学习闭环。",
              "当前反馈会帮助我们判断第二季应该优先完善什么。"
            ]}
          />
        </section>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs font-bold text-slate-500">Version: {screeningVersion}</p>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-400"
            data-testid="pilot-reset"
            onClick={resetData}
            type="button"
          >
            <RotateCcw size={14} />
            重置体验数据
          </button>
        </div>
      </div>
    </main>
  );
}

function InfoPanel({ icon: Icon, title, items }: { icon: typeof Sparkles; title: string; items: string[] }) {
  return (
    <article className="rounded-[28px] border border-white/15 bg-slate-950/55 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
          <Icon size={24} />
        </div>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <ol className="space-y-3 text-sm font-bold leading-6 text-slate-200">
        {items.map((item, index) => (
          <li className="rounded-2xl bg-white/5 p-3" key={item}>
            {index + 1}. {item}
          </li>
        ))}
      </ol>
    </article>
  );
}
