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
    <main className="min-h-screen overflow-hidden bg-[#17206a] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-20%] top-[-12%] h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute right-[-24%] top-[18%] h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[16%] h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.16)_1px,transparent_2px)] bg-[size:38px_38px] opacity-45" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-10 pt-8 sm:px-6">
        <section className="rounded-[34px] border border-white/15 bg-white/12 p-6 shadow-glow backdrop-blur-xl sm:p-8">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-cyan-300 text-slate-950">
            <Rocket size={34} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">5 Minute Pilot</p>
          <h1 className="mt-2 text-4xl font-black leading-tight sm:text-6xl">
            智学探险家 · 第一季试映版
          </h1>
          <p className="mt-4 text-base font-bold leading-7 text-slate-100">
            今天只需要完成一次学习冒险：做一道题，看看 Nova 怎样帮助你，最后查看星星报告。
          </p>
          <Link
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-3xl bg-gradient-to-r from-amber-300 via-cyan-300 to-violet-400 px-6 text-lg font-black text-slate-950 shadow-glow sm:w-auto"
            data-testid="pilot-start"
            href="/adventure"
          >
            开始 5 分钟体验
          </Link>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <InfoPanel
            icon={Clock}
            title="试用说明"
            items={[
              "建议使用手机体验。",
              "建议体验时间：5 分钟左右。",
              "数据只保存在当前浏览器。",
              "体验目标不是刷题数量，而是完成一次轻冒险。"
            ]}
          />
          <InfoPanel
            icon={Target}
            title="今天只走一条路线"
            items={["进入今日冒险", "做一道星星能量题", "查看今日星星报告", "填写试映反馈"]}
          />
          <InfoPanel
            icon={Sparkles}
            title="给学生看的说明"
            items={["遇到不会的题，可以请 Nova 讲一讲。", "答错也没关系，小怪兽会帮你找到下次要练的地方。"]}
          />
          <InfoPanel
            icon={ShieldCheck}
            title="给家长看的说明"
            items={[
              "这是早期试映版，重点测试孩子是否愿意完成一次游戏化学习闭环。",
              "本轮不追求做很多题，只观察孩子能不能顺畅走完主流程。"
            ]}
          />
        </section>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs font-bold text-slate-400">Version: {screeningVersion}</p>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300"
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
    <article className="rounded-[28px] border border-white/15 bg-slate-950/45 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
          <Icon size={24} />
        </div>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <ol className="space-y-3 text-sm font-bold leading-6 text-slate-100">
        {items.map((item, index) => (
          <li className="rounded-2xl bg-white/7 p-3" key={item}>
            {index + 1}. {item}
          </li>
        ))}
      </ol>
    </article>
  );
}
