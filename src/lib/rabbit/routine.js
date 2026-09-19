// A simplified virtual routine inspired by rabbits' dawn/dusk activity.
export function rabbitRoutine(date = new Date()) {
  const hour = date.getHours();
  if ((hour >= 5 && hour < 9) || (hour >= 17 && hour < 21)) return { key: 'active', title: '晨昏探索时间', hint: '这会儿更有精神，喜欢探索和觅食。', restChance: .1, minPause: 7, night: false };
  if (hour >= 9 && hour < 17) return { key: 'rest', title: '日间慢时光', hint: '白天多休息，偶尔起来理毛、吃草。', restChance: .6, minPause: 24, night: false };
  return { key: 'quiet', title: '夜间安静时光', hint: '灯光柔和下来，安静探索一会儿再歇歇。', restChance: .35, minPause: 16, night: true };
}
export const HOME = { x: -2.7, z: -1.65 };
export const FOOD = { x: 1.65, z: .7 };
export const WATER = { x: 2.65, z: -.35 };
export function walkable(x, z) {
  return x >= -3.65 && x <= 3.65 && z >= -2.6 && z <= 2.6 &&
    !(x < -1.75 && z < -1.0) &&
    Math.hypot(x - FOOD.x, z - FOOD.z) > .48 && Math.hypot(x - WATER.x, z - WATER.z) > .48;
}
// Small navigation grid keeps paths around the house and bowls.
export function routeTo(start, end) {
  const step = .35;
  const cell = (p) => [Math.round(p.x / step), Math.round(p.z / step)];
  const key = (c) => c.join(',');
  const first = cell(start), last = cell(end);
  const queue = [first], visited = new Map([[key(first), null]]);
  for (let i = 0; i < queue.length; i++) {
    const c = queue[i];
    if (key(c) === key(last)) {
      const path = []; let at = c;
      while (visited.get(key(at))) { path.unshift({ x: at[0] * step, z: at[1] * step }); at = visited.get(key(at)); }
      return path;
    }
    for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
      const n = [c[0] + dx, c[1] + dz];
      if (visited.has(key(n)) || !walkable(n[0]*step,n[1]*step) || !walkable((c[0]+dx)*step,c[1]*step) || !walkable(c[0]*step,(c[1]+dz)*step)) continue;
      visited.set(key(n), c); queue.push(n);
    }
  }
  return [];
}
