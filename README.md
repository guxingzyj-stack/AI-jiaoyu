# 智学探险家

当前版本：S1 Screening Build v0.1

智学探险家是一个 AI 游戏化数学学习试映版。第一季试映版把“今日冒险、题目挑战、Nova 分层提示、错题怪兽、AI 技能背包、成长报告、试映反馈”串成一个可体验的学习闭环。

## 本地启动

```bash
npm install
npm run dev
```

本地访问：

```text
http://127.0.0.1:3000/pilot
```

## 生产构建

```bash
npm run check
npm run build
npm run start
```

## Zeabur 部署

Zeabur 入口路径：

```text
/pilot
```

部署后访问：

```text
https://你的域名/pilot
```

## 页面入口

- `/pilot`：第一季试映入口
- `/adventure`：今日冒险大厅
- `/challenge`：数学挑战关卡
- `/monsters`：错题怪兽图鉴
- `/skills`：AI 技能背包
- `/report`：今日冒险结算
- `/feedback`：试映反馈模板
- `/asset-check`：美术资源加载检查

## 推荐体验流程

1. 打开 `/pilot`
2. 点击开始体验
3. 查看今日冒险任务
4. 完成一道数学挑战
5. 使用一次 Nova 提示
6. 查看或复盘错题怪兽
7. 查看 AI 技能背包
8. 查看今日冒险结算
9. 填写试映反馈

## 当前限制

- 数据仅保存在当前浏览器的 localStorage
- AI 提示为 mock AI，不接真实 OpenAI API
- 无登录
- 无数据库
- 无 OCR
- 小题库试映版
- 无教师端、家长端后台和支付
