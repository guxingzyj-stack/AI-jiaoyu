"use client";

import AdventureRunner from "../../../components/AdventureRunner";
import { multiplesSeaConfig } from "../../../lib/adventures";

// 倍数海新岛探险：7-Beat 母模板的第 1 关，内容全部由 multiplesSeaConfig 描述。
export default function MultiplesSeaPage() {
  return <AdventureRunner config={multiplesSeaConfig} />;
}
