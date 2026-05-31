"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Gem, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "../../components/BottomNav";
import { gameAssets } from "../../lib/gameAssets";
import { defaultProgress, readProgress } from "../../lib/learningProgress";
import { calculateSkillCards, type SkillCardRecord } from "../../lib/skillEngine";

export default function SkillsPage() {
  const [progress, setProgress] = useState(defaultProgress);
  const skills = useMemo(() => calculateSkillCards(progress), [progress]);
  const grownCount = skills.filter((skill) => getSkillTotalExp(skill) > 0).length;
  const totalExp = skills.reduce((sum, skill) => sum + getSkillTotalExp(skill), 0);
  const abilityLevel = Math.min(5, Math.max(1, Math.floor(totalExp / 20) + 1));
  const abilityTitle = abilityLevel >= 4 ? "熟练" : abilityLevel >= 2 ? "成长中" : "新手";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProgress(readProgress());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#18247a] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-20%] top-[-12%] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-22%] top-[18%] h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute bottom-[-16%] left-[18%] h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-24 pt-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between gap-3">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-300/30 bg-white/5 px-3 text-sm font-bold text-cyan-100"
            href="/adventure"
          >
            <ArrowLeft size={16} />
            今日冒险
          </Link>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-200/15 shadow-glow">
            <Gem className="text-cyan-100" size={25} />
          </div>
        </header>

        <section className="mb-5 rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-glow backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">AI Gear Pack</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">AI 技能背包</h1>
          <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
            每一次正确使用 AI，都是一次未来能力升级。
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 min-[360px]:grid-cols-3">
            <OverviewCard label="AI 能力阶段" value={`Lv.${abilityLevel} ${abilityTitle}`} />
            <OverviewCard label="累计 AI 技能经验" value={String(totalExp)} />
            <OverviewCard label="已成长技能" value={`${grownCount}/4`} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {skills.map((skill) => (
            <SkillCard skill={skill} key={skill.id} />
          ))}
        </section>

        <Link
          className="mt-6 inline-flex min-h-14 items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-500 px-5 text-base font-black text-slate-950 shadow-glow"
          data-testid="skills-go-report"
          href="/report"
        >
          查看今日成长报告
        </Link>
      </div>
      <BottomNav />
    </main>
  );
}

function getSkillTotalExp(skill: SkillCardRecord) {
  return (skill.level - 1) * skill.maxExp + skill.exp;
}

function getSkillStatus(skill: SkillCardRecord) {
  const totalExp = getSkillTotalExp(skill);

  if (skill.level >= 2) {
    return "已升级";
  }

  return totalExp > 0 ? "成长中" : "起步中";
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
      <p className="text-xs font-bold text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-black text-cyan-100">{value}</p>
    </div>
  );
}

function SkillCard({ skill }: { skill: SkillCardRecord }) {
  const progressPercent = Math.min(100, Math.round((skill.exp / skill.maxExp) * 100));
  const status = getSkillStatus(skill);
  const gear = getSkillGear(skill.id);

  return (
    <article
      className="min-w-0 overflow-hidden rounded-[30px] border border-white/15 bg-slate-950/60 shadow-glow backdrop-blur-xl"
      data-testid={`skill-card-${skill.id}`}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br ${skill.color} p-4 text-white`}>
        <div className="absolute inset-0 bg-slate-950/25" />
        <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/25 blur-2xl" />
        <div className="absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-cyan-200/20 blur-2xl" />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-3 flex h-32 w-32 items-center justify-center overflow-hidden rounded-[34px] border-2 border-white/55 bg-white/28 shadow-[0_20px_40px_rgba(0,0,0,0.3)] sm:h-36 sm:w-36">
            <Image
              alt={gear.name}
              className="h-full w-full object-contain p-2 drop-shadow-[0_14px_26px_rgba(0,0,0,0.28)]"
              height={1254}
              sizes="144px"
              src={gear.image}
              width={1254}
            />
          </div>
          <h2 className="text-2xl font-black leading-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
            {gear.name}
          </h2>
          <p className="mt-1 rounded-full border border-white/25 bg-white/20 px-3 py-1 text-xs font-black text-white/90">
            {gear.type}
          </p>
        </div>
      </div>

      <div className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 py-1 text-xs font-black text-cyan-100">
          能力效果
        </span>
        <span className="text-base font-black text-white">{skill.name}</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            status === "已升级"
              ? "bg-emerald-300 text-slate-950"
              : status === "成长中"
                ? "bg-cyan-300 text-slate-950"
                : "bg-white/10 text-slate-200"
          }`}
        >
          {status}
        </span>
      </div>
      <p className="mt-3 text-sm font-bold text-cyan-100">{skill.title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{skill.description}</p>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="inline-flex items-center gap-1">
            <TrendingUp size={14} />
            Lv.{skill.level}
          </span>
          <span>
            {skill.exp}/{skill.maxExp}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <InfoLine label="最近触发" value={skill.lastAction} />
        <InfoLine label="下一步升级" value={skill.nextTip} />
      </div>

      {skill.level >= 2 && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-emerald-200/10 px-3 py-1 text-xs font-black text-emerald-100">
          <Sparkles size={14} />
          能力已升级
        </div>
      )}
      </div>
    </article>
  );
}

function getSkillGear(skillId: string) {
  const gear: Record<string, { name: string; type: string; image: string }> = {
    "clear-question": {
      name: "Nova 对话芯片",
      type: "AI 沟通装备",
      image: gameAssets.skills["clear-question"]
    },
    "step-ask": {
      name: "思路罗盘",
      type: "解题导航装备",
      image: gameAssets.skills["step-ask"]
    },
    "truth-check": {
      name: "侦测镜片",
      type: "答案检查装备",
      image: gameAssets.skills["truth-check"]
    },
    "review-power": {
      name: "反击护盾",
      type: "错题复盘装备",
      image: gameAssets.skills["review-power"]
    }
  };

  return gear[skillId] ?? {
    name: "AI 训练装备",
    type: "学习成长装备",
    image: gameAssets.skills["clear-question"]
  };
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="mb-1 text-xs font-bold text-slate-400">{label}</p>
      <p className="text-sm font-bold leading-6 text-slate-100">{value}</p>
    </div>
  );
}
