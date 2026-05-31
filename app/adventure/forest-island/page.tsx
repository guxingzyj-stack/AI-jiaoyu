"use client";

import AdventureRunner from "../../../components/AdventureRunner";
import { forestIslandConfig } from "../../../lib/adventures";

// 森林岛跳数探险：7-Beat 母模板的第 2 关，内容由 forestIslandConfig 描述（暂为 asset-light）。
export default function ForestIslandPage() {
  return <AdventureRunner config={forestIslandConfig} />;
}
