import { readJson, writeJson } from "./learningProgress";

// 轻量本地埋点：事件写入 localStorage 的环形缓冲（封顶 MAX_EVENTS 条），
// 重启后仍在，可被报告页/调试读取。项目暂无后端，先把“真事件流”沉淀在本地，
// 将来要上报真服务端时，只需在 trackEvent 里加一个异步 sink 即可。
export const TELEMETRY_STORAGE_KEY = "zx_adventurer_events";

// 缓冲上限：超过后丢最旧的，避免 localStorage 无限增长。
export const MAX_EVENTS = 500;

export type TelemetryEvent = {
  event: string; // 事件名，如 "stone_correct"
  ts: number; // Date.now()
  props?: Record<string, unknown>; // 附带上下文（levelId、stage 等）
};

export function readEvents(): TelemetryEvent[] {
  return readJson<TelemetryEvent[]>(TELEMETRY_STORAGE_KEY, []);
}

// 记录一个事件。SSR / 无 window 时静默跳过（只在浏览器里持久化）。
export function trackEvent(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  const entry: TelemetryEvent = { event, ts: Date.now(), props };

  try {
    const events = readEvents();
    events.push(entry);
    // 环形缓冲：只保留最近 MAX_EVENTS 条。
    const trimmed = events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events;
    writeJson(TELEMETRY_STORAGE_KEY, trimmed);
  } catch {
    // localStorage 写失败（隐私模式/配额）时不影响主流程。
  }

  if (process.env.NODE_ENV !== "production") {
    // 开发期仍打印一条，方便实时观察事件流。
    console.log("[telemetry]", entry);
  }
}

// 清空事件日志（调试 / 测试用）。
export function clearEvents() {
  if (typeof window === "undefined") {
    return;
  }
  writeJson<TelemetryEvent[]>(TELEMETRY_STORAGE_KEY, []);
}
