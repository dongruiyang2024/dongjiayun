export const MISSION_DURATION = 120;

export const MISSION_PHASES = [
  { id: 'countdown', label: '发射倒计时', start: 0, end: 7, description: '各系统就绪，进入点火倒计时。' },
  { id: 'ignition', label: '发动机点火', start: 7, end: 9, description: '发动机点火，推力建立中，火箭即将离开发射台。' },
  { id: 'ascent', label: '升空爬升', start: 9, end: 45, description: '火箭垂直离开发射台，穿越稠密大气，按程序缓慢转向。' },
  { id: 'separation', label: '一级分离', start: 45, end: 55, description: '一级燃尽关机并分离，坠回地球；二级点火继续推进。' },
  { id: 'fairing', label: '整流罩分离', start: 55, end: 68, description: '离开稠密大气后，整流罩分离坠落，露出卫星。' },
  { id: 'insertion', label: '轨道注入', start: 68, end: 80, description: '二级继续加速，进入预定轨道后关机。' },
  { id: 'deployment', label: '卫星释放', start: 80, end: 90, description: '卫星与二级分离，展开太阳能板。' },
  { id: 'orbit', label: '绕地运行', start: 90, end: 120, description: '卫星依靠惯性与地球引力持续绕地运行。' },
];

export function assertMissionTime(time) {
  if (!Number.isFinite(time) || time < 0) {
    throw new RangeError(`Mission time must be a finite non-negative number, received ${time}`);
  }
}

export function getMissionState(time) {
  assertMissionTime(time);
  const phaseIndex = MISSION_PHASES.findLastIndex((phase) => time >= phase.start);
  const phase = MISSION_PHASES[phaseIndex];
  return {
    time,
    phase,
    phaseIndex,
    phaseProgress: Math.min(1, (time - phase.start) / (phase.end - phase.start)),
    progress: Math.min(1, time / MISSION_DURATION),
    orbitTime: Math.max(0, time - 90),
  };
}

export function advanceMissionClock(clock, elapsedSeconds) {
  assertMissionTime(elapsedSeconds);
  assertMissionTime(clock.time);
  if (!Number.isFinite(clock.speed) || clock.speed <= 0) {
    throw new RangeError('Mission playback speed must be a finite positive number');
  }
  return clock.playing ? clock.time + elapsedSeconds * clock.speed : clock.time;
}
