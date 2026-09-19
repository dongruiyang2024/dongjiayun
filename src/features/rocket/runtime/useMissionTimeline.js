import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceMissionStep, getMissionState, MISSION_PHASES } from './mission';

const initialClock = () => ({ time: 0, playing: false, speed: 1, awaitingCommand: true });
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
        const next = advanceMissionStep(clockRef.current, (now - previous) / 1000);
        const stopped = clockRef.current.playing && !next.playing;
        clockRef.current = next;
        if (stopped) publish();
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

  const pause = useCallback(() => {
    clockRef.current.playing = false;
    logAction('pause');
    publish();
  }, [logAction, publish]);
  const resume = useCallback(() => {
    clockRef.current.playing = true;
    clockRef.current.awaitingCommand = false;
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
  const replayPhase = useCallback((phaseIndex) => {
    if (!Number.isInteger(phaseIndex) || phaseIndex < 0 || phaseIndex >= getMissionState(clockRef.current.time).phaseIndex) return;
    clockRef.current.time = MISSION_PHASES[phaseIndex].start;
    clockRef.current.playing = true;
    clockRef.current.awaitingCommand = false;
    previousFrameRef.current = null;
    logAction('replay');
    publish();
  }, [logAction, publish]);

  return { clockRef, snapshot, pause, resume, reset, setSpeed, replayPhase };
}
