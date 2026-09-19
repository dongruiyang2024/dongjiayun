# 不不的成长花园 🌸

个人成长博客，使用 React + Vite、Cloudflare Pages Functions 和 D1。
一个数据库，三张业务表：`posts`（日记）、`comments`（留言）、`milestones`（成长记录）。

## 线上地址

- 博客：https://dongjiayun.blog
- 管理后台：https://dongjiayun.blog/admin
- Pages 默认地址：https://dongjiayun.pages.dev
- 当前使用 Wrangler 直接发布，生产分支为 `main`；没有连接 GitHub 自动部署。
- 本机管理员密钥保存在 `.env.production-admin`，该文件不进入 Git。请安全保管，换电脑时不会随仓库同步。

自定义域名通过 Pages 的“自定义域”绑定，根域 DNS 使用指向 `dongjiayun.pages.dev` 的 CNAME。
原来的 `dongjiayun.blog/*` Worker 路由已移除，不要重新启用，否则会拦截 Pages 的页面和 API。
部署后运行 `npm run verify:live`，同时检查正式域名与默认域名的所有主要页面、资源版本和数据接口。
该检查只读取线上数据，不会添加或修改内容。

## 环境

- Node.js 22.12+（22 系列）或 24+
- npm；仓库统一使用 `package-lock.json`

```sh
npm ci
```

## 本地完整运行（不需要 Cloudflare 登录）

1. 将 `.dev.vars.example` 复制为 `.dev.vars`，把 `ADMIN_KEY` 改成你自己的本地开发密钥。占位值不能登录。
2. 初始化本地数据库并启动：

```sh
npm run db:migrate:local
npm run dev:full
```

打开 http://localhost:8788 ，管理后台是 http://localhost:8788/admin 。
本地数据库保存在 `.wrangler/state`，重启仍保留数据，删除此目录会丢失本地数据。
此步骤不会访问线上数据库；`wrangler.json` 中的占位数据库 ID 可用于本地开发。

如果需要前端热更新，在两个终端分别运行 `npm run dev` 和 `npm run dev:api`，访问 http://localhost:5173 。
只运行 Vite 或 `npm run preview` 不会启动 API。

新数据库默认没有文章。可以直接在后台写日记，也可以在“数据初始化”中主动导入示例数据。
示例初始化只有在文章和成长记录都为空时才执行，不会覆盖已有内容。
前台读取失败会显示错误，不会用示例数据冒充真实数据。

## Cloudflare 首次接入

1. 登录并检查已有资源：

```sh
npx wrangler login
npx wrangler pages project list
npx wrangler d1 list
```

2. 如果没有 `dongjiayun-db`，创建数据库：

```sh
npx wrangler d1 create dongjiayun-db
```

把创建结果中的 `database_id` 填入 `wrangler.json`；如果已有数据库，使用已有 ID。
绑定名保持 `DB`。请核对数据库属于要部署的 Cloudflare 账号。

3. 对线上数据库执行迁移：

```sh
npm run db:migrate
```

迁移会记录已执行的文件，可以重复运行，不会清空现有内容。
以后修改表结构时添加新的迁移文件，不要改写已在线上执行的迁移。

4. 在已有 Pages 项目 `dongjiayun` 的 Settings → Variables and Secrets 中，将 `ADMIN_KEY` 设置为 **Secret**。
使用随机长密钥；不要把密钥写入仓库或 `wrangler.json`。
也可以在终端交互输入：

```sh
npx wrangler pages secret put ADMIN_KEY --project-name dongjiayun
```

如果 Pages 项目不存在，需要先在 Cloudflare 创建项目，并确认生产分支。
生产与预览环境的密钥应分别设置；不要让测试预览随意写入生产数据库。

5. 部署：

```sh
npm run deploy
```

此命令先检查数据库 ID，再构建和上传，默认分支行为由 Wrangler 和 Pages 项目配置决定。
需要明确部署生产分支时使用 `npm run deploy -- --branch=<项目的生产分支>`。
也可沿用已连接 GitHub 的自动部署：构建命令 `npm run build`、输出目录 `dist`、Node 22。
`wrangler.json` 提供 D1 绑定；修改绑定或密钥后需要重新部署才能生效。

上线后打开实际域名的 `/admin`，验证新增日记、仅修改标题后正文保留、提交留言并刷新后仍可见。
不要在生产环境运行自动化测试或批量导入测试内容。

## 备份与恢复

```sh
npm run db:backup
```

导出线上数据库到 `backups/dongjiayun-时间戳.sql`，目录已加入 Git 忽略。
定期将备份复制到电脑之外的安全位置；修改表结构前也导出一次。
D1 免费计划提供最近 7 天的 Time Travel 恢复，长期备份使用 SQL 导出。
恢复时建议先导入一个新建的 D1 数据库，检查数据后再切换绑定，避免误覆盖当前数据库。

## 验证

```sh
npm run lint
npx playwright install chromium
npm test
```

测试自动构建，在临时目录启动本地 Pages + D1（端口 18788），使用临时密钥，
验证鉴权、初始化、浏览器编辑、留言提交、重启后持久化、删除关联留言，以及故障时不显示示例数据。
测试结束后清理临时目录，不使用线上数据库或你的本地开发数据。

## 当前范围

支持单管理员发布文章、管理成长记录和删除留言。匿名留言有基础输入校验；
尚未实现限流、审核队列、图片上传、草稿和多用户登录。
管理员使用固定密钥，退出会清除本标签页保存的密钥；线上访问应使用 HTTPS。

## 官方文档

- [Pages D1 绑定](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases)
- [D1 备份与恢复](https://developers.cloudflare.com/d1/reference/time-travel/)
- [D1 导入导出](https://developers.cloudflare.com/d1/best-practices/import-export-data/)

## 成长档案与探索工坊

首页、关于我、成长足迹和探索工坊共同读取 `/api/garden`。管理员在「学年与探索项目」中维护简介、学年主题和项目；新增学年到开始日期后自动成为当前阶段，历史学年不会被覆盖。日记按发布日期归入相应阶段，也可以继续按内容分类筛选。

探索项目支持分类、所属学年、状态、自定义完成节点、带日期的研究手记、作品说明和 HTTPS 图片链接。进度直接统计已勾选节点，不使用预设百分比。科技节初始档案仅表示筹备意向，选题、手记与作品均留空。图片目前通过链接展示，不包含文件上传。

上线这一版本前，需要执行 `npm run db:migrate` 应用新增的 `0002_garden.sql`，再执行 `npm run deploy`。新增表不改动原有文章、留言或里程碑。首次读取没有保存记录时提供初始成长档案；在后台保存后写入 D1，之后以保存内容为准。学年起始日期用于历史记录归档，可在后台根据实际情况修正。

### 小兔的 3D 乐园

`/pet` 按需加载 Three.js，使用本地生成的立体兔子模型、关节动画、阴影和场景物体；不依赖远程模型资源。点击小兔摸头，点击草地移动，视角按钮旋转或缩放。寻路网格避开兔窝和食盆；到达盆边后才播放吃喝动作，完成后恢复观察、理毛或自主活动。喂养积分和名字继续使用原来的浏览器存档。

作息读取设备当地时间：5–9 点和 17–21 点更活跃，9–17 点偏向休息，其余时间使用夜间灯光与较安静的活动。这些时段是参考兔子晨昏活跃习性的简化游戏规则，不是真实个体的固定时间表。参考：https://www.rspca.org.uk/adviceandwelfare/pets/rabbits 。不显示页面时暂停渲染，离开页面释放图形资源；系统减少动态效果设置会关闭身体弹跳等细节。无法使用 WebGL 时显示可重试提示。
