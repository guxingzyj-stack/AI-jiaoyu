"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardCopy, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const studentQuestions = [
  "你觉得这个像不像游戏？",
  "你最喜欢哪个部分？",
  "AI 提示有没有帮到你？",
  "错题怪兽有没有让你想复盘？",
  "你愿不愿意明天再玩一次？"
];

const parentQuestions = [
  "你能否看懂成长报告？",
  "你觉得这个产品是在学习还是在玩？",
  "你最担心什么？",
  "你愿不愿意让孩子连续使用一周？",
  "如果后续完善，你是否愿意付费？"
];

export default function FeedbackPage() {
  const [copyState, setCopyState] = useState("复制反馈模板");
  const template = useMemo(
    () =>
      [
        "《智学探险家》S1 试映反馈",
        "",
        "学生反馈：",
        ...studentQuestions.map((question, index) => `${index + 1}. ${question}`),
        "",
        "家长反馈：",
        ...parentQuestions.map((question, index) => `${index + 1}. ${question}`)
      ].join("\n"),
    []
  );

  const copyTemplate = async () => {
    setCopyState("已复制，可以粘贴到微信/文档");
    window.setTimeout(() => setCopyState("复制反馈模板"), 2200);

    try {
      await navigator.clipboard.writeText(template);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = template;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070a1a] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-20%] top-[-12%] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-22%] top-[18%] h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-10 pt-5 sm:px-6">
        <header className="mb-5 flex items-center justify-between gap-3">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-300/30 bg-white/5 px-3 text-sm font-bold text-cyan-100"
            href="/report"
          >
            <ArrowLeft size={16} />
            成长报告
          </Link>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-200/15 shadow-glow">
            <MessageSquare className="text-cyan-100" size={25} />
          </div>
        </header>

        <section className="mb-5 rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-glow backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">Screening Feedback</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">试映反馈</h1>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            这里不会提交后台。点击复制模板后，可以把问题粘贴到微信、飞书或文档里填写。
          </p>
          <button
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-black text-slate-950"
            data-testid="copy-feedback"
            onClick={copyTemplate}
            type="button"
          >
            <ClipboardCopy size={18} />
            {copyState}
          </button>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <QuestionPanel icon={Sparkles} title="学生反馈" questions={studentQuestions} />
          <QuestionPanel icon={ShieldCheck} title="家长反馈" questions={parentQuestions} />
        </section>

        <pre
          className="mt-5 whitespace-pre-wrap rounded-[28px] border border-white/10 bg-slate-950/55 p-4 text-xs leading-6 text-slate-300"
          data-testid="feedback-template"
        >
          {template}
        </pre>
      </div>
    </main>
  );
}

function QuestionPanel({
  icon: Icon,
  title,
  questions
}: {
  icon: typeof Sparkles;
  title: string;
  questions: string[];
}) {
  return (
    <article className="rounded-[28px] border border-white/15 bg-slate-950/55 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
          <Icon size={24} />
        </div>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <ol className="space-y-3 text-sm font-bold leading-6 text-slate-200">
        {questions.map((question, index) => (
          <li className="rounded-2xl bg-white/5 p-3" key={question}>
            {index + 1}. {question}
          </li>
        ))}
      </ol>
    </article>
  );
}
