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
    intro: "先看机关轮廓，再选一块能卡进去的形状石。",
    idle: "点地图上发光的地点，角色会走过去修机关。",
    hint: "先观察轮廓，不急着猜答案。",
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
      description: "山门上有一个空空的形状槽。",
      assetKey: "gate",
      position: { x: 22, y: 78 },
      reward: "形状星片 +1",
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
      id: "socket",
      title: "双形状座",
      shortTitle: "形状座",
      description: "形状座上有两个不同的空位。",
      assetKey: "socket",
      position: { x: 48, y: 58 },
      unlockAfter: ["gate"],
      reward: "形状星片 +1",
      mechanic: {
        type: "shape-match",
        prompt: "形状座有两个空位，先看左边空位的轮廓。",
        success: "两个空位都放对了，形状座发出蓝紫星光。",
        hint: "先看轮廓，再看边角。",
        wrongHint: "这块形状石放上去有点晃。",
        strongHint: "第一个空位很圆，第二个空位四边一样整齐。",
        successSummary: "圆形和正方形都放进了正确的空位。",
        options: ["圆形", "长方形", "正方形", "三角形"],
        answer: ["圆形", "正方形"],
        targetCount: 2
      }
    },
    {
      id: "triangle-path",
      title: "三角石路",
      shortTitle: "石路",
      description: "山路断开了，有几块石阶空着。",
      assetKey: "trianglePath",
      position: { x: 72, y: 42 },
      unlockAfter: ["socket"],
      reward: "形状星片 +1",
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
      reward: "形状星片 +1",
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
