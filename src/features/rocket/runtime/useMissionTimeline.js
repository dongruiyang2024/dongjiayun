import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceMissionClock, assertMissionTime, getMissionState } from './mission';

const initialClock = () => ({ time: 0, playing: false, speed: 1 });
const describeClock = (clock) => ({ ...clock, ...getMissionState(clock.time) });

/** A single RAF clock drives the scene; React receives only a 10 Hz UI snapshot. */
export function useMissionTimeline() {
  const clockRef = useRef(initialClock());
  const previousFrameRef = useRef(null);
  const [snapshot, setSnapshot] = useState(() => describeClock(initialClock()));

  const publish = useCallback(() => setSnapshot(describeClock(clockRef.current)), []);
  const logAction = useCallback((action) => {
    const { time, speed } = clockRef.current;
    console.info('[rocket:timeline]', { action, time, speed, phase: getMissionState(time).phase.id });
  }, []);

  useEffect(() => {
    let frameId;
    let lastPublished = 0;
    let previousPhase = getMissionState(clockRef.current.time).phase.id;
    const frame = (now) => {
      const previous = previousFrameRef.current;
      previousFrameRef.current = now;
      // Hidden tabs are suspended, so returning cannot skip the launch sequence.
      if (previous !== null && !document.hidden) {
        clockRef.current.time = advanceMissionClock(clockRef.current, (now - previous) / 1000);
      }
      const phase = getMissionState(clockRef.current.time).phase.id;
      if (phase !== previousPhase) {
        console.info('[rocket:phase]', { from: previousPhase, to: phase, time: clockRef.current.time });
        previousPhase = phase;
      }
      if (now - lastPublished >= 100) {
        publish();
        lastPublished = now;
      }
      frameId = requestAnimationFrame(frame);
    };
    const handleVisibility = () => { previousFrameRef.current = null; };
    document.addEventListener('visibilitychange', handleVisibility);
    frameId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', handleVisibility);
      previousFrameRef.current = null;
    };
  }, [publish]);

  const start = useCallback(() => {
    clockRef.current.time = 0;
    clockRef.current.playing = true;
    previousFrameRef.current = null;
    logAction('start');
    publish();
  }, [logAction, publish]);
  const pause = useCallback(() => {
    clockRef.current.playing = false;
    logAction('pause');
    publish();
  }, [logAction, publish]);
  const resume = useCallback(() => {
    clockRef.current.playing = true;
    previousFrameRef.current = null;
    logAction('resume');
    publish();
  }, [logAction, publish]);
  const reset = useCallback(() => {
    clockRef.current = initialClock();
    previousFrameRef.current = null;
    logAction('reset');
    publish();
  }, [logAction, publish]);
  const setSpeed = useCallback((speed) => {
    if (![0.5, 1, 2, 4].includes(speed)) throw new RangeError(`Unsupported playback speed: ${speed}`);
    clockRef.current.speed = speed;
    previousFrameRef.current = null;
    logAction('speed');
    publish();
  }, [logAction, publish]);
  const seek = useCallback((time) => {
    assertMissionTime(time);
    clockRef.current.time = time;
    previousFrameRef.current = null;
    logAction('seek');
    publish();
  }, [logAction, publish]);

  return { clockRef, snapshot, start, pause, resume, reset, setSpeed, seek };
}
