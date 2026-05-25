# 智学探险家

当前版本：S1.5 Tutorial Island RC

《智学探险家》是一个面向低年级孩子的 AI 游戏化数学学习试映版。本版本重点验证 5 分钟小冒险主线：孩子先跟 Nova 进入教程岛，点云朵获得第一次成功感，再完成一个简单数学小挑战，最后查看星星报告。

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

## 推荐试映路径

```text
/pilot → /adventure → /challenge → /report
```

主线体验：

1. 打开 `/pilot`
2. 点击开始体验
3. 在 `/adventure` 进入教程岛
4. 在 `/challenge` 点击云朵，点亮第一颗星
5. 继续云朵迷雾小冒险
6. 查看 `/report` 今日星星报告

## 页面入口

- `/pilot`：教程岛试映入口
- `/adventure`：今日冒险大厅
- `/challenge`：教程岛首胜与云朵迷雾小冒险
- `/report`：今日星星报告
- `/feedback`：试映反馈
- `/monsters`：小怪兽图鉴，保留为答错后的支线
- `/skills`：AI 技能背包，保留为非主线页面
- `/asset-check`：美术资源检查页

## 当前限制

- 数据仅保存在当前浏览器的 localStorage
- AI 回复仍为 mock 模式
- 无登录
- 无数据库
- 无 OCR
- 无真实 OpenAI API 接入
- 无教师端、家长后台和支付
