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
    rewardLabel: "星环亮起",
    coreLabel: "星核"
  },
  mapHint: "把五个区域的星光送回中央星核。",
  nova: {
    intro: "这是回忆试炼。先看画面想一想，再点亮记忆。",
    idle: "选择一个发光星环，把那段区域记忆送回星核。",
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
      title: "森林星环",
      shortTitle: "森林",
      description: "森林里的星光灯又亮了一下。",
      assetKey: "gate",
      position: { x: 18, y: 80 },
      reward: "星环亮起 +1",
      mechanic: {
        type: "memory-choice",
        prompt: "森林星环闪了一下，选择森林里用过的力量。",
        success: "森林星环回到星核旁边。",
        hint: "想想当时怎么让能量刚刚好。",
        wrongHint: "这个力量是在别的地方用过的。",
        strongHint: "森林里常常要把能量凑到刚刚好。",
        successSummary: "你想起来了：森林里用过凑十的力量。",
        options: ["凑十", "乱点", "跳过"],
        answer: "凑十"
      }
    },
    {
      id: "forest-memory",
      title: "星海星环",
      shortTitle: "星海",
      description: "星光海上的小船又回来了。",
      assetKey: "forest",
      position: { x: 43, y: 64 },
      unlockAfter: ["gate"],
      reward: "星环亮起 +1",
      mechanic: {
        type: "memory-sequence",
        prompt: "小船每次跳同样远，看看会点亮哪些岛。",
        success: "星海星环回到星核旁边。",
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
      id: "sea-memory",
      title: "几何星环",
      shortTitle: "几何",
      description: "几何山门上的形状槽又发光了。",
      assetKey: "sea",
      position: { x: 72, y: 49 },
      unlockAfter: ["forest-memory"],
      reward: "星环亮起 +1",
      mechanic: {
        type: "memory-choice",
        prompt: "几何山门又出现空槽，选择能放进去的形状。",
        success: "几何星环回到星核旁边。",
        hint: "先看空位轮廓，不急着猜答案。",
        wrongHint: "这块形状石和空槽还对不上。",
        strongHint: "再看看空位尖尖的角。",
        successSummary: "几何山门的记忆回来了！",
        options: ["圆形", "三角形", "正方形"],
        answer: "三角形"
      }
    },
    {
      id: "shape-time-memory",
      title: "时间星环",
      shortTitle: "时间",
      description: "时间城的小火车又响起了铃声。",
      assetKey: "shapeTime",
      position: { x: 40, y: 34 },
      unlockAfter: ["sea-memory"],
      reward: "星环亮起 +1",
      mechanic: {
        type: "memory-sequence",
        prompt: "小火车要回到准点站台，选择它到站的时间。",
        success: "时间星环回到星核旁边。",
        hint: "从 3:00 往后走半小时。",
        wrongHint: "这一站有点早或有点晚。",
        strongHint: "半小时后，分针会走到 30。",
        successSummary: "时间城的记忆回来了！",
        options: ["3:00", "3:30", "4:00"],
        answer: "3:30"
      }
    },
    {
      id: "share-memory",
      title: "分数星环",
      shortTitle: "分数",
      description: "分数谷的小河需要一样多的星光。",
      assetKey: "share",
      position: { x: 68, y: 22 },
      unlockAfter: ["shape-time-memory"],
      reward: "星环亮起 +1",
      mechanic: {
        type: "equal-river",
        prompt: "小河两边要亮得一样多，看图找右边那一份。",
        success: "分数星环回到星核旁边。",
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
      title: "中央星核",
      shortTitle: "星核",
      description: "五个星环都回来了，中央星核正在等待最后点亮。",
      assetKey: "core",
      position: { x: 50, y: 10 },
      unlockAfter: ["gate", "forest-memory", "sea-memory", "shape-time-memory", "share-memory"],
      mechanic: {
        type: "core",
        prompt: "五个星环都亮了，点亮数学星核。",
        success: "数学星球的星光回来了！",
        hint: "先唤醒所有记忆节点。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "终章完成！",
    summary: "五个区域的星光回到了星核，你成为数学星球小守护者！",
    stats: ["星环亮起 5/5", "守护者能量已汇集", "星核重新发光"],
    nextHref: "/adventure",
    nextLabel: "回到冒险入口",
    replayLabel: "再玩一次终章"
  }
};
