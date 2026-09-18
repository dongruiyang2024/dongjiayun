import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceMissionClock, getMissionState, MISSION_PHASES } from './mission.js';

test('each boundary belongs to the new mission phase', () => {
  for (const [index, phase] of MISSION_PHASES.entries()) {
    assert.equal(getMissionState(phase.start).phase.id, phase.id);
    assert.equal(getMissionState(phase.start).phaseProgress, 0);
    if (index > 0) assert.equal(getMissionState(phase.start - 0.001).phase.id, MISSION_PHASES[index - 1].id);
  }
});

test('orbital motion continues after the presentation reaches its duration', () => {
  const state = getMissionState(180);
  assert.equal(state.phase.id, 'orbit');
  assert.equal(state.progress, 1);
  assert.equal(state.phaseProgress, 1);
  assert.equal(state.orbitTime, 75);
});

test('paused clocks freeze; elapsed seconds and speed determine running time', () => {
  assert.equal(advanceMissionClock({ time: 20, playing: false, speed: 2 }, 8), 20);
  assert.equal(advanceMissionClock({ time: 20, playing: true, speed: 2 }, 0.5), 21);
  const oneFrame = advanceMissionClock({ time: 20, playing: true, speed: 1 }, 1);
  let manyFrames = 20;
  for (let i = 0; i < 60; i++) manyFrames = advanceMissionClock({ time: manyFrames, playing: true, speed: 1 }, 1 / 60);
  assert.ok(Math.abs(manyFrames - oneFrame) < 1e-10);
});

test('invalid timeline inputs throw instead of silently normalizing', () => {
  for (const time of [-1, NaN, Infinity]) assert.throws(() => getMissionState(time), RangeError);
  assert.throws(() => advanceMissionClock({ time: 0, playing: true, speed: 0 }, 1), RangeError);
  assert.throws(() => advanceMissionClock({ time: 0, playing: true, speed: 1 }, -1), RangeError);
});
