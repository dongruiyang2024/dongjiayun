# 不不的成长花园 🌸

一个温馨的个人成长日记网站，记录生活中的快乐、学习和成长点滴。

## ✨ 功能特性

- **📝 我的日记** - 记录每日生活趣事、学习收获与心情
- **🌱 成长足迹** - 展示成长里程碑与进步历程
- **💌 留言板** - 与访客互动交流
- **🧸 关于我** - 个人介绍与网站说明
- **📱 响应式设计** - 支持手机、平板和电脑端浏览

## 🛠 技术栈

- **React 19** - 前端框架
- **Vite 7** - 构建工具
- **React Router 7** - 路由管理

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:5173](http://localhost:5173) 即可预览。

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/     # 公共组件
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── PostCard.jsx
│   └── CommentSection.jsx
├── pages/          # 页面组件
│   ├── Home.jsx    # 首页
│   ├── Diary.jsx   # 日记列表
│   ├── Post.jsx    # 日记详情
│   ├── Growth.jsx  # 成长足迹
│   ├── Guestbook.jsx # 留言板
│   └── About.jsx   # 关于我
├── data/           # 数据文件
│   └── posts.js    # 日记数据
├── assets/         # 静态资源
├── App.jsx
├── main.jsx
└── index.css
```

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | 运行 ESLint 检查 |

## 📄 License

Private - 仅供个人使用
