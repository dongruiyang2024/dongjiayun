import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceMissionClock, advanceMissionStep, getMissionState, MISSION_PHASES } from './mission.js';

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

test('every command stops at the next boundary even when a frame crosses several phases', () => {
  for (const phase of MISSION_PHASES.slice(0, -1)) {
    const result = advanceMissionStep({ time: phase.start, playing: true, speed: 4, awaitingCommand: false }, 100);
    assert.equal(result.time, phase.end);
    assert.equal(result.playing, false);
    assert.equal(result.awaitingCommand, true);
    assert.deepEqual(advanceMissionStep(result, 100), result, 'a new phase must wait for a command');
  }
});

test('manual pause and resume preserve phase progress without skipping the next command', () => {
  const paused = { time: 23, playing: false, speed: 2, awaitingCommand: false };
  assert.deepEqual(advanceMissionStep(paused, 4), paused);
  const resumed = advanceMissionStep({ ...paused, playing: true }, 2);
  assert.equal(resumed.time, 27);
  assert.equal(resumed.playing, true);
  assert.equal(resumed.awaitingCommand, false);
  const boundary = advanceMissionStep(resumed, 20);
  assert.equal(boundary.time, 60);
  assert.equal(boundary.awaitingCommand, true);
});

test('orbit waits for its own command, then continues beyond the presentation duration', () => {
  const waiting = { time: 105, playing: false, speed: 1, awaitingCommand: true };
  assert.deepEqual(advanceMissionStep(waiting, 100), waiting);
  const running = advanceMissionStep({ ...waiting, playing: true, awaitingCommand: false }, 75);
  assert.equal(running.time, 180);
  assert.equal(running.playing, true);
  assert.equal(running.awaitingCommand, false);
});
