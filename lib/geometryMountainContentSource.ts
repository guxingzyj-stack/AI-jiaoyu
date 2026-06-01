import type { S4ChapterContent } from "./s4ChapterTypes";

export const geometryMountainContent: S4ChapterContent = {
  chapterTitle: "第三章：几何山",
  chapterSubtitle: "形状石阶正在等待被点亮",
  route: "/adventure/geometry-mountain",
  theme: "geometry",
  intro: {
    title: "几何山的形状机关醒了",
    body: "Nova 发现山路被形状石挡住。找到合适的形状，山路就会亮起来。",
    button: "进入几何山"
  },
  hud: {
    rewardLabel: "形状星片",
    coreLabel: "山心核心"
  },
  mapHint: "点亮山门、形状座、三角石路和镜洞，再唤醒山心。",
  nova: {
    intro: "先看看每个机关需要什么形状。",
    idle: "点地图上的发光节点，角色会走过去。",
    hint: "观察边和角，别急着猜。",
    complete: "几何山亮起来了，下一站是时间城。"
  },
  edges: [
    ["gate", "socket"],
    ["socket", "triangle-path"],
    ["triangle-path", "mirror-cave"],
    ["mirror-cave", "core"]
  ],
  nodes: [
    {
      id: "gate",
      title: "山门",
      shortTitle: "山门",
      description: "用合适的形状打开山门。",
      assetKey: "gate",
      position: { x: 22, y: 78 },
      reward: "形状星片 +1",
      mechanic: {
        type: "shape-match",
        prompt: "山门要一个有三条边的形状。",
        success: "三角形嵌进去了，山门亮起。",
        hint: "数一数边，三条边会组成尖尖的形状。",
        options: ["圆形", "三角形", "正方形"],
        answer: "三角形"
      }
    },
    {
      id: "socket",
      title: "形状座",
      shortTitle: "形状座",
      description: "把两个形状放到对应位置。",
      assetKey: "socket",
      position: { x: 48, y: 58 },
      unlockAfter: ["gate"],
      reward: "形状星片 +1",
      mechanic: {
        type: "shape-match",
        prompt: "形状座需要没有角的形状，再需要四条边一样长的形状。",
        success: "形状座发出蓝紫色星光。",
        hint: "先找圆圆的，再找四边一样长的。",
        options: ["圆形", "长方形", "正方形", "三角形"],
        answer: ["圆形", "正方形"],
        targetCount: 2
      }
    },
    {
      id: "triangle-path",
      title: "三角石路",
      shortTitle: "石路",
      description: "点亮三块三角石，接上山路。",
      assetKey: "trianglePath",
      position: { x: 72, y: 42 },
      unlockAfter: ["socket"],
      reward: "形状星片 +1",
      mechanic: {
        type: "path-build",
        prompt: "只点三角形石块，让山路连起来。",
        success: "三角石路连成一条发光山路。",
        hint: "尖尖的、三条边的是三角形。",
        options: ["三角石", "圆石", "三角石", "方石", "三角石"],
        answer: ["三角石", "三角石", "三角石"],
        targetCount: 3
      }
    },
    {
      id: "mirror-cave",
      title: "镜子洞",
      shortTitle: "镜洞",
      description: "找到镜子里相同的形状伙伴。",
      assetKey: "mirror",
      position: { x: 38, y: 28 },
      unlockAfter: ["triangle-path"],
      reward: "形状星片 +1",
      mechanic: {
        type: "mirror-pair",
        prompt: "镜子里哪个形状和左边一样？",
        success: "镜洞里的形状朋友排成一队。",
        hint: "转一转看，大小可以不同，形状要一样。",
        options: ["圆形", "三角形", "长方形"],
        answer: "三角形"
      }
    },
    {
      id: "core",
      title: "山心核心",
      shortTitle: "山心",
      description: "放入形状星片，点亮几何山。",
      assetKey: "core",
      position: { x: 70, y: 18 },
      unlockAfter: ["gate", "socket", "triangle-path", "mirror-cave"],
      mechanic: {
        type: "core",
        prompt: "形状星片集齐了，唤醒山心核心。",
        success: "几何山完全亮起来了！",
        hint: "先完成前面的形状机关。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "几何山点亮成功",
    summary: "你用形状力量修好了山路。",
    stats: ["形状星片 4/4", "山路亮起", "山心核心已唤醒"],
    nextHref: "/adventure/time-city",
    nextLabel: "进入第四章：时间城",
    replayLabel: "再走一次几何山"
  }
};
