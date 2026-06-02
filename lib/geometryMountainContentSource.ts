import type { S4ChapterContent } from "./s4ChapterTypes";

export const geometryMountainContent: S4ChapterContent = {
  chapterTitle: "第三章：几何山",
  chapterSubtitle: "把形状放进机关，修好发光山路",
  route: "/adventure/geometry-mountain",
  theme: "geometry",
  intro: {
    title: "几何山的山路卡住了",
    body: "Nova 找到几座形状机关。看清边、角和镜像，把合适的形状放进去，山路就会一段段亮起来。",
    button: "修好几何山"
  },
  hud: {
    rewardLabel: "形状星片",
    coreLabel: "山心核心"
  },
  mapHint: "按顺序修山门、形状座、三角石路、镜洞，再点亮山心。",
  nova: {
    intro: "先看机关缺什么形状，再点按钮放进去。",
    idle: "点地图上发光的地点，角色会走过去修机关。",
    hint: "慢慢数边和角。三条边、三个角，就是三角形。",
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
      title: "山门形状槽",
      shortTitle: "山门",
      description: "山门只收三条边的形状。",
      assetKey: "gate",
      position: { x: 22, y: 78 },
      reward: "形状星片 +1",
      mechanic: {
        type: "shape-match",
        prompt: "山门缺一个有三条边、三个角的形状。点它放进空位。",
        success: "三角形嵌进山门，第一段山路亮了。",
        hint: "圆形没有角，正方形有四条边。请找三条边的形状。",
        options: ["圆形", "三角形", "正方形"],
        answer: "三角形"
      }
    },
    {
      id: "socket",
      title: "双形状座",
      shortTitle: "形状座",
      description: "先放没有角的形状，再放四条边一样长的形状。",
      assetKey: "socket",
      position: { x: 48, y: 58 },
      unlockAfter: ["gate"],
      reward: "形状星片 +1",
      mechanic: {
        type: "shape-match",
        prompt: "形状座有两个空位：先点圆形，再点正方形。",
        success: "两个空位都放对了，形状座发出蓝紫星光。",
        hint: "第一步找没有角的圆形；第二步找四条边一样长的正方形。",
        options: ["圆形", "长方形", "正方形", "三角形"],
        answer: ["圆形", "正方形"],
        targetCount: 2
      }
    },
    {
      id: "triangle-path",
      title: "三角石路",
      shortTitle: "石路",
      description: "把三块三角石放进山路缺口。",
      assetKey: "trianglePath",
      position: { x: 72, y: 42 },
      unlockAfter: ["socket"],
      reward: "形状星片 +1",
      mechanic: {
        type: "path-build",
        prompt: "山路有 3 个缺口。连续点 3 次“三角石”，不要点圆石和方石。",
        success: "三块三角石接成一条发光山路。",
        hint: "缺口是尖尖的三角形。点错也没关系，再从第一块开始。",
        options: ["三角石", "圆石", "方石"],
        answer: ["三角石", "三角石", "三角石"],
        targetCount: 3
      }
    },
    {
      id: "mirror-cave",
      title: "镜子洞",
      shortTitle: "镜洞",
      description: "看左边镜子里的图形，找右边同类形状。",
      assetKey: "mirror",
      position: { x: 38, y: 28 },
      unlockAfter: ["triangle-path"],
      reward: "形状星片 +1",
      mechanic: {
        type: "mirror-pair",
        prompt: "镜子左边是三角形。右边哪一个和它同类？",
        success: "镜洞里的形状朋友排成一队，山顶亮了。",
        hint: "大小和方向可以不同，形状种类要一样。",
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
        prompt: "形状星片集齐了，点亮山心核心。",
        success: "几何山完全亮起来了！",
        hint: "先完成前面的四个形状机关。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "几何山点亮成功",
    summary: "你用边、角和镜像修好了山路。",
    stats: ["形状星片 4/4", "三角石路已连好", "山心核心已点亮"],
    nextHref: "/adventure/time-city",
    nextLabel: "进入第四章：时间城",
    replayLabel: "再走一次几何山"
  }
};
