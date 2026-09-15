# 火箭演示运行基础

- `/explore` 与 `/explore/rocket` 按需加载同一个实验室页面，三维依赖不进入首页入口模块。
- `useMissionTimeline()` 持有唯一任务时钟。三维场景在 `useFrame` 中读取 `clockRef.current.time`；页面标签使用每秒最多 10 次更新的 `snapshot`。
- `start` 从零播放，`pause` 暂停，`resume` 继续，`reset` 恢复待发射状态，`seek` 切换任务秒数，`setSpeed` 支持 0.5、1、2、4 倍速。
- 页面隐藏期间冻结任务时钟，回到页面后继续。90 秒后保留轨道阶段且时钟继续增长，供卫星持续绕行。
- 场景应从绝对任务时间计算每个部件的状态，避免逐帧累积位移；这样暂停、重置和跳转可复现。
- `rocket:timeline` 记录控制操作，`rocket:phase` 记录阶段转换，`rocket:route` 记录页面加载/渲染故障。无效时间或速度直接抛错。

## 依赖与验证

本次依赖维护使用 npm，以 `package-lock.json` 为本次三维模块依赖的锁文件；安装使用 `npm ci`。历史 `pnpm-lock.yaml` 未同步本次依赖，不应混用。

React Three Fiber 9.7 的 peer 范围为 React / React DOM `>=19 <19.3`，因此应用保持 `~19.2.4`，不绕过 peer 依赖检查。

```sh
node --test src/features/rocket/runtime/mission.test.mjs
npx eslint src/features/rocket/runtime src/App.jsx
npm run build
```

阶段时间是科普演示的压缩时间，不代表真实任务飞行秒数。几何、镜头与模型由场景层负责，运行基础不假定实际火箭参数。
