# Zeabur 部署说明

本文档用于把《智学探险家》S1 Screening Build v0.1 从 GitHub 部署到 Zeabur。

## 1. 创建 GitHub 仓库

1. 登录 GitHub。
2. 创建一个新仓库，例如 `zhixue-adventurer`。
3. 不需要在 GitHub 页面初始化 README，避免和本地项目冲突。

## 2. 本地提交代码

在项目根目录执行：

```bash
git init
git add .
git commit -m "Release S1 screening build"
git branch -M main
git remote add origin <你的 GitHub 仓库地址>
git push -u origin main
```

## 3. 在 Zeabur 部署

1. 登录 Zeabur。
2. 点击 Create Project。
3. 点击 Add Service。
4. 选择 GitHub / Deploy from GitHub。
5. 选择刚创建的 GitHub 仓库。
6. 等待 Zeabur 自动安装依赖并执行构建。
7. 部署完成后打开：

```text
https://你的域名/pilot
```

## 4. 构建命令

Zeabur 通常可自动识别 Next.js 项目。项目脚本为：

```bash
npm install
npm run build
npm run start
```

## 5. 注意事项

- 入口页面是 `/pilot`。
- 当前版本不需要配置数据库。
- 当前版本不需要配置 OpenAI API Key。
- 体验数据保存在访问者当前浏览器的 localStorage 中。
- 若替换美术资源，请确保文件仍位于 `public/assets`，并与 `lib/gameAssets.ts` 中路径一致。
