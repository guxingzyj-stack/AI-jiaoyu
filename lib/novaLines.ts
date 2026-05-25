export type NovaLineScene =
  | "tutorial_start"
  | "cloud_intro"
  | "step_1"
  | "step_2"
  | "step_3"
  | "success"
  | "wrong"
  | "before_report";

export const novaLines: Record<NovaLineScene, string[]> = {
  tutorial_start: ["我在这里等你！", "我们先点亮第一颗星。"],
  cloud_intro: ["云朵挡住能量塔啦！", "我们把它们数清楚。"],
  step_1: ["看，每座塔要 24 个能量块。", "这里一共有 3 座塔。"],
  step_2: ["24 可以拆成 20 和 4。", "这样算会更轻松。"],
  step_3: ["现在来选答案吧！", "别急，慢慢看。"],
  success: ["太棒啦，点亮成功！", "你真的帮上忙了！"],
  wrong: ["没关系，小云雾又来了。", "我们再拆开看一次。"],
  before_report: ["今天的小冒险完成啦！", "去看看星星报告吧。"]
};

export function getNovaLine(scene: NovaLineScene, index = 0) {
  const lines = novaLines[scene];
  return lines[index % lines.length];
}
