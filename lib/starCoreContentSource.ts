import type { S4ChapterContent } from "./s4ChapterTypes";

export const starCoreContent: S4ChapterContent = {
  chapterTitle: "终章：星光核心",
  chapterSubtitle: "把五段冒险记忆连回星球核心",
  route: "/adventure/star-core",
  theme: "core",
  intro: {
    title: "星光核心正在等你",
    body: "森林、星光海、几何山、时间城和分数谷的光都到了。把这些办法再做一遍，核心就会醒来。",
    button: "点亮星光核心"
  },
  hud: {
    rewardLabel: "守护星光",
    coreLabel: "星球核心"
  },
  mapHint: "按顺序连起五段记忆，再点亮最终核心。",
  nova: {
    intro: "这是回忆试炼。先看画面想一想，再点亮记忆。",
    idle: "点一个记忆节点，把那段星光重新连起来。",
    hint: "想想那一站发生了什么，不急着看数字。",
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
      description: "星光核心门口闪着一段温柔的记忆。",
      assetKey: "gate",
      position: { x: 18, y: 80 },
      reward: "守护星光 +1",
      mechanic: {
        type: "memory-choice",
        prompt: "核心入口出现了熟悉的沉睡朋友，想想我们当时怎么做。",
        success: "温柔唤醒的记忆亮了。",
        hint: "回忆里不是乱点，而是温柔地帮助。",
        wrongHint: "这个动作不像我们之前做过的帮助。",
        strongHint: "我们一直在唤醒、修复和点亮。",
        successSummary: "你想起来了：我们用温柔的办法唤醒朋友。",
        options: ["唤醒", "乱点", "跳过"],
        answer: "唤醒"
      }
    },
    {
      id: "forest-memory",
      title: "森林记忆",
      shortTitle: "森林",
      description: "森林里的星光灯又亮了一下。",
      assetKey: "forest",
      position: { x: 43, y: 64 },
      unlockAfter: ["gate"],
      reward: "守护星光 +1",
      mechanic: {
        type: "memory-choice",
        prompt: "森林里的星光灯又亮了一下，找找能量刚刚好的那一组。",
        success: "森林朋友的星光跟上来了。",
        hint: "想想当时怎么让能量刚刚好。",
        wrongHint: "这组能量不是刚刚好。",
        strongHint: "试着找能凑到 10 的一组。",
        successSummary: "你想起来了：森林里用过凑十的力量。",
        options: ["6 + 4", "6 + 3", "8 + 4"],
        answer: "6 + 4"
      }
    },
    {
      id: "sea-memory",
      title: "星光海记忆",
      shortTitle: "星光海",
      description: "星光海上的小船又回来了。",
      assetKey: "sea",
      position: { x: 72, y: 49 },
      unlockAfter: ["forest-memory"],
      reward: "守护星光 +1",
      mechanic: {
        type: "memory-sequence",
        prompt: "小船每次跳同样远，看看会点亮哪些岛。",
        success: "星光海航线再次亮起。",
        hint: "小船每次跳 3 格。",
        wrongHint: "这座岛不是小船这次会落下的地方。",
        strongHint: "从 3 开始，每次再跳 3 格。",
        successSummary: "3、6、9 亮起来了，星海记忆回来了！",
        options: ["3", "6", "9", "4"],
        answer: ["3", "6", "9"],
        targetCount: 3
      }
    },
    {
      id: "shape-time-memory",
      title: "形状时间记忆",
      shortTitle: "形时",
      description: "几何山和时间城的光靠近了。",
      assetKey: "shapeTime",
      position: { x: 40, y: 34 },
      unlockAfter: ["sea-memory"],
      reward: "守护星光 +1",
      mechanic: {
        type: "memory-sequence",
        prompt: "几何山和时间城的光靠近了，先找能修路的形状，再找列车到站的时间。",
        success: "几何山和时间城的光连在一起。",
        hint: "先看形状，再想列车走了多久。",
        wrongHint: "这一步像是别的地方用过的办法。",
        strongHint: "先找有尖角的形状，再从 2:00 往后走一小时半。",
        successSummary: "几何山和时间城的记忆连在一起了。",
        options: ["圆形", "三角形", "3:30", "4:00"],
        answer: ["三角形", "3:30"],
        targetCount: 2
      }
    },
    {
      id: "share-memory",
      title: "分享记忆",
      shortTitle: "分享",
      description: "分数谷的小河需要一样多的星光。",
      assetKey: "share",
      position: { x: 68, y: 22 },
      unlockAfter: ["shape-time-memory"],
      reward: "守护星光 +1",
      mechanic: {
        type: "equal-river",
        prompt: "小河两边要亮得一样多，看图找右边那一份。",
        success: "分数谷的分享星光也回来了。",
        hint: "看图，不要急着看数字。",
        wrongHint: "这一份和左边亮起的不一样多。",
        strongHint: "右边四小格里，找亮起来和左边同样多的那一份。",
        successSummary: "你找到了和一半一样多的那一份。",
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
