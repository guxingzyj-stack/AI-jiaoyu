import type { S4ChapterContent } from "./s4ChapterTypes";

export const starCoreContent: S4ChapterContent = {
  chapterTitle: "终章：星光核心",
  chapterSubtitle: "把一路学到的星光汇到核心",
  route: "/adventure/star-core",
  theme: "core",
  intro: {
    title: "星光核心正在等你",
    body: "森林、星光海、几何山、时间城和分数谷的记忆都亮了。把它们连起来，核心就会醒来。",
    button: "进入星光核心"
  },
  hud: {
    rewardLabel: "守护星光",
    coreLabel: "星球核心"
  },
  mapHint: "依次唤醒四段记忆，再点亮最终核心。",
  nova: {
    intro: "这是我们的总回忆。你已经走了很远。",
    idle: "点一个记忆节点，把那段星光重新连起来。",
    hint: "想一想之前怎么让世界变亮。",
    complete: "星光核心醒来了，你已经是数学星球的小守护者。"
  },
  edges: [
    ["gate", "forest-memory"],
    ["forest-memory", "sea-memory"],
    ["sea-memory", "shape-time-memory"],
    ["shape-time-memory", "share-memory"],
    ["share-memory", "core"]
  ],
  nodes: [
    {
      id: "gate",
      title: "核心入口",
      shortTitle: "入口",
      description: "进入星光核心的记忆路。",
      assetKey: "gate",
      position: { x: 18, y: 80 },
      reward: "守护星光 +1",
      mechanic: {
        type: "memory-choice",
        prompt: "哪种力量能让睡着的小精灵醒来？",
        success: "森林记忆被温柔点亮。",
        hint: "我们不是破坏，而是唤醒和修复。",
        options: ["唤醒", "攻击", "跳过"],
        answer: "唤醒"
      }
    },
    {
      id: "forest-memory",
      title: "森林记忆",
      shortTitle: "森林",
      description: "回忆怎样点亮森林小路。",
      assetKey: "forest",
      position: { x: 43, y: 64 },
      unlockAfter: ["gate"],
      reward: "守护星光 +1",
      mechanic: {
        type: "memory-choice",
        prompt: "哪两颗能量果能刚好点亮星光灯？",
        success: "森林朋友的星光跟上来了。",
        hint: "刚刚好，不多也不少。",
        options: ["6 + 4", "6 + 3", "8 + 4"],
        answer: "6 + 4"
      }
    },
    {
      id: "sea-memory",
      title: "星光海记忆",
      shortTitle: "星光海",
      description: "回忆跳岛的节奏。",
      assetKey: "sea",
      position: { x: 72, y: 49 },
      unlockAfter: ["forest-memory"],
      reward: "守护星光 +1",
      mechanic: {
        type: "memory-sequence",
        prompt: "按 3 的节奏点亮海上浮岛。",
        success: "星光海航线再次亮起。",
        hint: "从 3 开始，每次多 3。",
        options: ["3", "6", "9", "4"],
        answer: ["3", "6", "9"],
        targetCount: 3
      }
    },
    {
      id: "shape-time-memory",
      title: "形时记忆",
      shortTitle: "形时",
      description: "把形状和时间记忆接起来。",
      assetKey: "shapeTime",
      position: { x: 40, y: 34 },
      unlockAfter: ["sea-memory"],
      reward: "守护星光 +1",
      mechanic: {
        type: "memory-sequence",
        prompt: "先选三角形，再选 3:30。",
        success: "几何山和时间城的光连在一起。",
        hint: "先找三条边，再算 2:00 加一小时半。",
        options: ["圆形", "三角形", "3:30", "4:00"],
        answer: ["三角形", "3:30"],
        targetCount: 2
      }
    },
    {
      id: "share-memory",
      title: "分享记忆",
      shortTitle: "分享",
      description: "让公平分享的星光回到核心。",
      assetKey: "share",
      position: { x: 68, y: 22 },
      unlockAfter: ["shape-time-memory"],
      reward: "守护星光 +1",
      mechanic: {
        type: "equal-river",
        prompt: "哪一份和一半一样多？",
        success: "分数谷的分享星光也回来了。",
        hint: "两个四分之一，就是一半。",
        options: ["1/4", "2/4", "3/4"],
        answer: "2/4"
      }
    },
    {
      id: "core",
      title: "最终核心",
      shortTitle: "核心",
      description: "把守护星光放入星球核心。",
      assetKey: "core",
      position: { x: 50, y: 10 },
      unlockAfter: ["gate", "forest-memory", "sea-memory", "shape-time-memory", "share-memory"],
      mechanic: {
        type: "core",
        prompt: "守护星光集齐了，点亮星球核心。",
        success: "数学星球的星光回来了！",
        hint: "先唤醒所有记忆节点。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "星光核心完全点亮",
    summary: "Nova 和你一起把数学星球重新点亮。",
    stats: ["守护星光 5/5", "五段记忆已连起", "小守护者任务完成"],
    nextHref: "/adventure",
    nextLabel: "回到冒险入口",
    replayLabel: "再玩一次终章"
  }
};
