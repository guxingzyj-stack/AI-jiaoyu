"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImageOff, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { assetCheckGroups, GAME_ASSET_VERSION } from "../../lib/gameAssets";

type AssetStatus = {
  status: "loading" | "loaded" | "error";
  naturalWidth: number;
  naturalHeight: number;
};

export default function AssetCheckPage() {
  const [statuses, setStatuses] = useState<Record<string, AssetStatus>>({});

  const updateStatus = (path: string, status: AssetStatus) => {
    setStatuses((current) => ({
      ...current,
      [path]: status
    }));
  };

  return (
    <main className="min-h-screen bg-[#17206a] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-200/30 bg-white/10 px-3 text-sm font-black text-cyan-100"
            href="/adventure"
          >
            <ArrowLeft size={16} />
            返回冒险大厅
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-200/15 px-3 py-2 text-xs font-black text-amber-100">
            <RefreshCw size={14} />
            v={GAME_ASSET_VERSION}
          </div>
        </header>

        <section className="mb-6 rounded-[32px] border border-white/15 bg-white/10 p-5 shadow-glow backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-100">Asset Diagnostics</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">美术资源加载检查</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-200">
            这里直接读取 `lib/gameAssets.ts` 的资源路径，并显示浏览器实际加载状态、naturalWidth / naturalHeight。
            如果替换图片后仍看到旧图，请重启 dev server 或强制刷新。
          </p>
        </section>

        <div className="space-y-6">
          {assetCheckGroups.map((group) => (
            <section key={group.group}>
              <h2 className="mb-3 text-xl font-black">{group.group}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => {
                  const status = statuses[item.path] ?? {
                    status: "loading",
                    naturalWidth: 0,
                    naturalHeight: 0
                  };
                  const loaded = status.status === "loaded";
                  const failed = status.status === "error";

                  return (
                    <article
                      className="overflow-hidden rounded-[28px] border border-white/15 bg-slate-950/45 backdrop-blur-xl"
                      data-testid={`asset-${item.label}`}
                      key={item.path}
                    >
                      <div className="flex min-h-44 items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(34,211,238,0.08))] p-3">
                        {failed ? (
                          <div className="flex flex-col items-center gap-2 text-red-200">
                            <ImageOff size={42} />
                            <span className="text-sm font-black">加载失败</span>
                          </div>
                        ) : (
                          // Use plain img here to inspect raw public asset loading instead of Next image optimization.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={item.label}
                            className="max-h-64 w-full object-contain"
                            onError={() =>
                              updateStatus(item.path, {
                                status: "error",
                                naturalWidth: 0,
                                naturalHeight: 0
                              })
                            }
                            onLoad={(event) =>
                              updateStatus(item.path, {
                                status: "loaded",
                                naturalWidth: event.currentTarget.naturalWidth,
                                naturalHeight: event.currentTarget.naturalHeight
                              })
                            }
                            src={item.src}
                          />
                        )}
                      </div>

                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-black">{item.label}</h3>
                            <p className="mt-1 break-all text-xs font-bold leading-5 text-slate-300">{item.path}</p>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                              loaded
                                ? "bg-emerald-300 text-slate-950"
                                : failed
                                  ? "bg-red-300 text-slate-950"
                                  : "bg-white/10 text-slate-200"
                            }`}
                          >
                            {loaded ? <CheckCircle2 size={14} /> : failed ? <XCircle size={14} /> : <RefreshCw size={14} />}
                            {loaded ? "加载成功" : failed ? "加载失败" : "加载中"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm font-bold text-slate-100">
                          <div className="rounded-2xl bg-white/10 p-3">
                            <p className="text-xs text-slate-400">naturalWidth</p>
                            <p className="mt-1 text-lg font-black">{status.naturalWidth}</p>
                          </div>
                          <div className="rounded-2xl bg-white/10 p-3">
                            <p className="text-xs text-slate-400">naturalHeight</p>
                            <p className="mt-1 text-lg font-black">{status.naturalHeight}</p>
                          </div>
                        </div>

                        {failed && (
                          <p className="rounded-2xl border border-red-200/30 bg-red-300/10 p-3 text-sm font-bold leading-6 text-red-100">
                            图片加载失败。请检查文件是否存在、文件名大小写是否一致、路径是否从 `/assets/` 开始。
                          </p>
                        )}

                        {item.path === "/assets/game/lobby-hero.png" && loaded && (
                          <p className="rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-3 text-xs font-bold leading-5 text-cyan-50">
                            主视觉检查：适合作为纯游戏大厅主视觉。若后续图片包含 UI 文字或按钮，请重新生成纯插画版本。
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
