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
    rewardLabel: "山门机关",
    coreLabel: "山脊光路"
  },
  mapHint: "装好形状槽、石阶槽和镜像槽，打开几何山门。",
  nova: {
    intro: "先看机关轮廓，再选一块能卡进去的形状石。",
    idle: "先看山门机关盘，选择正在亮起的机关槽。",
    hint: "先观察轮廓，不急着猜答案。",
    complete: "几何山亮起来了，下一站是时间城。"
  },
  edges: [
    ["gate", "triangle-path"],
    ["triangle-path", "mirror-cave"],
    ["mirror-cave", "core"]
  ],
  nodes: [
    {
      id: "gate",
      title: "山门形状槽",
      shortTitle: "山门",
      description: "山门上有一个空空的形状槽。",
      assetKey: "gate",
      position: { x: 22, y: 78 },
      reward: "山门机关 +1",
      mechanic: {
        type: "shape-match",
        prompt: "山门上有一个空空的形状槽，选一块能放进去的形状石。",
        success: "三角形嵌进山门，第一段山路亮了。",
        hint: "再看看空位的轮廓。",
        wrongHint: "这块石头和空位的轮廓还对不上。",
        strongHint: "再看空位有几个尖尖的角。",
        successSummary: "你选中了三角形，它刚好放进山门的空位。",
        options: ["圆形", "三角形", "正方形"],
        answer: "三角形"
      }
    },
    {
      id: "triangle-path",
      title: "三角石路",
      shortTitle: "石路",
      description: "山路断开了，有几块石阶空着。",
      assetKey: "trianglePath",
      position: { x: 72, y: 42 },
      unlockAfter: ["gate"],
      reward: "山门机关 +1",
      mechanic: {
        type: "path-build",
        prompt: "山路断开了，选能卡进缺口的石块。",
        success: "三块三角石接成一条发光山路。",
        hint: "看一看空位的形状。",
        wrongHint: "这块石头放上去会晃，形状不太合适。",
        strongHint: "空位的边角比较尖，再找找有尖角的石块。",
        successSummary: "三角石阶连起来了，山路亮起来了！",
        options: ["三角石", "圆石", "方石"],
        answer: ["三角石", "三角石", "三角石"],
        targetCount: 3
      }
    },
    {
      id: "mirror-cave",
      title: "镜子洞",
      shortTitle: "镜洞",
      description: "山洞里的图案只亮了一半。",
      assetKey: "mirror",
      position: { x: 38, y: 28 },
      unlockAfter: ["triangle-path"],
      reward: "山门机关 +1",
      mechanic: {
        type: "mirror-pair",
        prompt: "山洞里的图案只亮了一半，找一块能拼完整的光片。",
        success: "镜洞里的形状朋友排成一队，山顶亮了。",
        hint: "看镜子线旁边的边缘。",
        wrongHint: "拼上去后，两边还不太一样。",
        strongHint: "注意镜子线旁边的边缘，要能接上。",
        successSummary: "镜像图案合起来了，山洞亮起来了！",
        options: ["圆形", "三角形", "长方形"],
        answer: "三角形"
      }
    },
    {
      id: "core",
      title: "山心核心",
      shortTitle: "山心",
      description: "三个机关槽都装好了，山门正在等待打开。",
      assetKey: "core",
      position: { x: 70, y: 18 },
      unlockAfter: ["gate", "triangle-path", "mirror-cave"],
      mechanic: {
        type: "core",
        prompt: "三个机关槽都装好了，打开几何山门。",
        success: "几何山门打开了，山脊光路亮起来！",
        hint: "先完成前面的三个机关槽。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "第三章完成！",
    summary: "几何山门打开了，山脊光路亮起来了！",
    stats: ["山门机关 3/3", "三角石阶已拼装", "镜像槽已接上"],
    nextHref: "/adventure/time-city",
    nextLabel: "进入第四章：时间城",
    replayLabel: "再走一次几何山"
  }
};
