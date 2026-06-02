# Next Codex Start Prompt

## 新对话启动提示

你现在接手“智学探险家 / AI 游戏化学生辅助教学项目”。

先读取：

```text
AI_WORKFLOW_RULES.md
docs/ARCHIVE_S4_PROJECT_STATE.md
docs/ARCHIVE_S4_CHAPTER_CHAIN.md
docs/ARCHIVE_S4_ASSET_RULES.md
docs/S3_NARRATIVE_BIBLE.md
docs/S3_1_PLUS_3_ARCHITECTURE_BLUEPRINT.md
```

当前目标：

在独立 worktree 中继续 S4，完成剩余章节：

```text
/adventure/geometry-mountain
/adventure/time-city
/adventure/fraction-valley
/adventure/star-core
```

要求：

- 不直接改原项目目录
- 新建独立 worktree
- 不破坏 `/adventure/forest-map`
- 不破坏 `/adventure/starlight-sea`
- 不破坏旧森林岛、倍数海
- 每章内容 + 图片 + 接入 + 链路一次完成
- 不做选择题套皮
- 不做线性下一步流程
- 每章必须有地图探索、节点解锁、玩家决策、机关差异
- 360px / 390px 手机优先
- typecheck / check / build 必须通过

## 建议 worktree

```bash
cd C:\Users\Administrator\Documents
git -C "C:\Users\Administrator\Documents\AI游戏辅助教学" fetch origin
git -C "C:\Users\Administrator\Documents\AI游戏辅助教学" worktree add "C:\Users\Administrator\Documents\AI游戏辅助教学-codex-s4-complete-chapters" -b s4-complete-adventure-chapters origin/s4e2-starlight-sea-map
cd "C:\Users\Administrator\Documents\AI游戏辅助教学-codex-s4-complete-chapters"
git branch --show-current
git status --short
```

如果远端分支不同，请先汇报，不要乱改。

## 当前补充说明

如果 `s4-complete-adventure-chapters` 远端分支已经存在，应先检查：

```bash
git fetch origin
git branch -a
git log --oneline origin/s4-complete-adventure-chapters -5
```

不要重复创建同名分支造成混乱。

如果当前目标是继续优化 S4 四章，请优先基于：

```text
origin/s4-complete-adventure-chapters
```

并先确认旧页面仍正常：

```text
/adventure/forest-map
/adventure/starlight-sea
/adventure/forest-rpg
/adventure/forest-island
/adventure/multiples-sea
/adventure
```
