import type { S4ChapterContent } from "./s4ChapterTypes";

export const timeCityContent: S4ChapterContent = {
  chapterTitle: "第四章：时间城",
  chapterSubtitle: "把停住的星光列车重新排好",
  route: "/adventure/time-city",
  theme: "time",
  intro: {
    title: "时间城的列车停住了",
    body: "时钟平台睡着了。看清时间顺序，星光列车就能继续前进。",
    button: "进入时间城"
  },
  hud: {
    rewardLabel: "时间齿轮",
    coreLabel: "钟塔核心"
  },
  mapHint: "修好站台、时钟平台、列车顺序和到达桥，再点亮钟塔。",
  nova: {
    intro: "时间会按顺序慢慢往前走。",
    idle: "点一个发光地点，去修复那里的时间机关。",
    hint: "先看钟面，再想前后顺序。",
    complete: "时间城重新转动了，下一站是分数谷。"
  },
  edges: [
    ["station", "clock"],
    ["clock", "train-order"],
    ["train-order", "arrival-bridge"],
    ["arrival-bridge", "core"]
  ],
  nodes: [
    {
      id: "station",
      title: "时间站台",
      shortTitle: "站台",
      description: "叫醒第一座时间站台。",
      assetKey: "station",
      position: { x: 18, y: 76 },
      reward: "时间齿轮 +1",
      mechanic: {
        type: "set-clock",
        prompt: "把站台时钟拨到 3 点整。",
        success: "站台灯亮了，列车准备出发。",
        hint: "短针指 3，长针指最上面。",
        options: ["2:00", "3:00", "4:30"],
        answer: "3:00"
      }
    },
    {
      id: "clock",
      title: "时钟平台",
      shortTitle: "时钟",
      description: "让平台显示正确时刻。",
      assetKey: "clock",
      position: { x: 47, y: 58 },
      unlockAfter: ["station"],
      reward: "时间齿轮 +1",
      mechanic: {
        type: "duration-bridge",
        prompt: "列车 2:00 出发，走 1 小时 30 分钟到达。",
        success: "时钟平台把桥升起来了。",
        hint: "先加 1 小时，再加半小时。",
        options: ["3:00", "3:30", "4:00"],
        answer: "3:30"
      }
    },
    {
      id: "train-order",
      title: "列车顺序",
      shortTitle: "列车",
      description: "按时间先后排好列车。",
      assetKey: "trainOrder",
      position: { x: 76, y: 42 },
      unlockAfter: ["clock"],
      reward: "时间齿轮 +1",
      mechanic: {
        type: "order-train",
        prompt: "按从早到晚的顺序点亮列车。",
        success: "三节列车按顺序接好了。",
        hint: "小时间在前，大时间在后。",
        options: ["4:00", "2:00", "3:00"],
        answer: ["2:00", "3:00", "4:00"],
        targetCount: 3
      }
    },
    {
      id: "arrival-bridge",
      title: "到达桥",
      shortTitle: "到达桥",
      description: "算出列车什么时候到达。",
      assetKey: "bridge",
      position: { x: 42, y: 27 },
      unlockAfter: ["train-order"],
      reward: "时间齿轮 +1",
      mechanic: {
        type: "duration-bridge",
        prompt: "列车 1:30 出发，走 2 小时。",
        success: "到达桥伸出金色轨道。",
        hint: "分钟不变，小时往后数两个。",
        options: ["2:30", "3:30", "4:00"],
        answer: "3:30"
      }
    },
    {
      id: "core",
      title: "钟塔核心",
      shortTitle: "钟塔",
      description: "放入时间齿轮，唤醒时间城。",
      assetKey: "core",
      position: { x: 70, y: 17 },
      unlockAfter: ["station", "clock", "train-order", "arrival-bridge"],
      mechanic: {
        type: "core",
        prompt: "时间齿轮集齐了，点亮钟塔核心。",
        success: "时间城重新转动起来！",
        hint: "先修好所有时间机关。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "时间城重新转动",
    summary: "你让列车、站台和钟塔都回到了正确节奏。",
    stats: ["时间齿轮 4/4", "列车已出发", "钟塔核心已点亮"],
    nextHref: "/adventure/fraction-valley",
    nextLabel: "进入第五章：分数谷",
    replayLabel: "再修一次时间城"
  }
};
