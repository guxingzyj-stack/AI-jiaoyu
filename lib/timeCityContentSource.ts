import type { S4ChapterContent } from "./s4ChapterTypes";

export const timeCityContent: S4ChapterContent = {
  chapterTitle: "第四章：时间城",
  chapterSubtitle: "拨准时钟，排好列车，让城市重新转动",
  route: "/adventure/time-city",
  theme: "time",
  intro: {
    title: "时间城的列车停住了",
    body: "站台、时钟和列车顺序都乱了。看清几点出发、走了多久、谁先谁后，列车就能继续前进。",
    button: "修好时间城"
  },
  hud: {
    rewardLabel: "轨道亮起",
    coreLabel: "钟楼转动"
  },
  mapHint: "在调度台拨钟、排列车、点亮到站桥。",
  nova: {
    intro: "先看列车和钟面发生了什么，再动手修时间机关。",
    idle: "先看调度台，选择正在等待的小火车任务。",
    hint: "先看哪里停住了，再试着让它动起来。",
    complete: "时间城重新转动了，下一站是分数谷。"
  },
  edges: [
    ["station", "train-order"],
    ["train-order", "arrival-bridge"],
    ["arrival-bridge", "core"]
  ],
  nodes: [
    {
      id: "station",
      title: "站台时钟",
      shortTitle: "站台",
      description: "钟楼停住了，列车还不能出发。",
      assetKey: "station",
      position: { x: 18, y: 76 },
      reward: "轨道亮起 +1",
      mechanic: {
        type: "set-clock",
        prompt: "钟楼停住了，让钟面走到站台要开的时间。",
        success: "站台灯亮了，列车准备出发。",
        hint: "先让时针慢慢走到 3。",
        wrongHint: "还没到 3 点，再拨一拨时钟。",
        strongHint: "分针要回到最上面，目标是整点。",
        successSummary: "钟面到 3:00 了，列车可以出发！",
        options: ["2:00", "3:00", "4:30"],
        answer: "3:00"
      }
    },
    {
      id: "train-order",
      title: "列车顺序",
      shortTitle: "列车",
      description: "三班列车排乱了，站台在等它们进站。",
      assetKey: "trainOrder",
      position: { x: 76, y: 42 },
      unlockAfter: ["station"],
      reward: "轨道亮起 +1",
      mechanic: {
        type: "order-train",
        prompt: "三班列车排乱了，先找最早到的那一班。",
        success: "三班列车按顺序接好了。",
        hint: "从最早的车开始排。",
        wrongHint: "这班车来得晚了一点，可能要放后面。",
        strongHint: "小一点的小时数通常会更早到。",
        successSummary: "列车排好队了，轨道亮起来了！",
        options: ["4:00", "2:00", "3:00"],
        answer: ["2:00", "3:00", "4:00"],
        targetCount: 3
      }
    },
    {
      id: "arrival-bridge",
      title: "到达桥",
      shortTitle: "到达桥",
      description: "小火车要过桥了，终点站还没有亮。",
      assetKey: "bridge",
      position: { x: 42, y: 27 },
      unlockAfter: ["train-order"],
      reward: "轨道亮起 +1",
      mechanic: {
        type: "duration-bridge",
        prompt: "列车 1:30 出发，走 2 小时，点亮它会到达的桥。",
        success: "到达桥伸出金色轨道。",
        hint: "从 1:30 往后数两段小时。",
        wrongHint: "这一站有点早或有点晚，再试一次。",
        strongHint: "分钟还是 30，小时往后走两个。",
        successSummary: "小火车到达 3:30 站台！",
        options: ["2:30", "3:30", "4:00"],
        answer: "3:30"
      }
    },
    {
      id: "core",
      title: "钟塔核心",
      shortTitle: "钟塔",
      description: "三段轨道都准点了，钟楼正在等待重新转动。",
      assetKey: "core",
      position: { x: 70, y: 17 },
      unlockAfter: ["station", "train-order", "arrival-bridge"],
      mechanic: {
        type: "core",
        prompt: "三段轨道都准点了，让钟楼重新转动。",
        success: "小火车重新准点运行，时间城亮起来！",
        hint: "先修好所有时间机关。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "第四章完成！",
    summary: "小火车重新准点运行，时间城亮起来了！",
    stats: ["轨道亮起 3/3", "列车顺序已排好", "钟楼重新转动"],
    nextHref: "/adventure/fraction-valley",
    nextLabel: "进入第五章：分数谷",
    replayLabel: "再修一次时间城"
  }
};
