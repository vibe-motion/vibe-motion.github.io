# vibe-motion.github.io

这是一个可直接部署到 GitHub Pages 的静态站点。

## 目录结构

- `index.html`：页面入口
- `styles.css`：页面样式
- `app.js`：前端交互（复制按钮）
- `server.js`：本地静态预览服务器
- `favicon.png`：站点图标

## 本地预览

```bash
node server.js
```

默认地址：`http://localhost:3000`

## GitHub Pages

1. 推送到 GitHub 仓库。
2. 在仓库 `Settings` -> `Pages` 中选择部署分支（通常是 `main`）。
3. 因为项目是纯静态文件，部署后会直接生效。
