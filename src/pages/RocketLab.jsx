import { Component, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import RocketScene from "../features/rocket/RocketScene";
import { useMissionTimeline } from "../features/rocket/runtime/useMissionTimeline";
import { MISSION_PHASES } from "../features/rocket/runtime/mission";
import "../features/rocket/rocket-lab.css";

class SceneBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[rocket-lab] scene rendering failed", {
      error,
      componentStack: info.componentStack,
    });
    this.props.onError(error);
  }
  render() {
    // The page owns one error panel for both React errors and context loss.
    return this.state.error ? null : this.props.children;
  }
}
const clockLabel = (t) =>
  `${Math.floor(t / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(t % 60)
    .toString()
    .padStart(2, "0")}`;
export default function RocketLab() {
  const mission = useMissionTimeline();
  const { snapshot, clockRef } = mission;
  const [ready, setReady] = useState(false);
  const [sceneError, setSceneError] = useState(null);
  const contextCleanup = useRef(null);
  const { pause } = mission;
  const handleSceneError = useCallback((error) => {
    pause();
    setReady(false);
    setSceneError(error.message);
  }, [pause]);
  const handleCreated = useCallback(({ gl }) => {
    const handleContextLost = (event) => {
      event.preventDefault();
      const error = new Error("图形渲染已中断，请重新加载三维场景。");
      console.error("[rocket-lab] WebGL context lost", { time: clockRef.current.time });
      handleSceneError(error);
    };
    contextCleanup.current?.();
    gl.domElement.addEventListener("webglcontextlost", handleContextLost);
    contextCleanup.current = () => gl.domElement.removeEventListener("webglcontextlost", handleContextLost);
    setReady(true);
  }, [clockRef, handleSceneError]);
  useEffect(() => () => contextCleanup.current?.(), []);
  const { time, playing, phase, phaseIndex, speed } = snapshot;
  const started = time > 0 || playing;
  const countdownLabel =
    started && time >= 4 && time < 7
      ? String(Math.ceil(7 - time))
      : started && time >= 7 && time < 9
        ? "点火"
        : started && time >= 9 && time < 10.5
          ? "升空"
          : null;
  const altitude =
    time < 9 ? 0 : Math.round(400 * Math.min(1, ((time - 9) / 71) ** 1.5));
  return (
    <main className="rocket-lab">
      <div className="rocket-topline">
        <Link to="/explore">← 探索工坊</Link>
        <span>
          ORBITAL / 01 <i /> 实时三维演示
        </span>
      </div>
      <header className="rocket-heading">
        <div>
          <p className="rocket-eyebrow">从地面出发，向宇宙前进</p>
          <h1>
            下一站，太空<span>ROCKET LAB</span>
          </h1>
        </div>
        <div className="rocket-mission-badge">
          <span className="rocket-status-dot" />
          启明星一号 <b>近地轨道任务</b>
        </div>
      </header>
      <section className="rocket-view" aria-label="火箭发射三维演示">
        <SceneBoundary onError={handleSceneError}>
          <Suspense
            fallback={<div className="rocket-loading">正在准备发射场…</div>}
          >
            <RocketScene
              clockRef={clockRef}
              onCreated={handleCreated}
            />
          </Suspense>
        </SceneBoundary>
        {sceneError && (
          <div className="rocket-error" role="alert">
            <strong>三维演示已停止</strong>
            <p>{sceneError}</p>
            <button onClick={() => window.location.reload()}>重新加载</button>
          </div>
        )}
        {!ready && !sceneError && (
          <div className="rocket-loading">
            正在初始化三维引擎；若持续未显示，请重新加载页面。
          </div>
        )}
        <div className="rocket-view-label">
          <span className="rocket-live-dot" /> MISSION VIEW{" "}
          <span>三维任务视角</span>
        </div>
        {countdownLabel && (
          <div className="rocket-countdown" key={countdownLabel}>
            {countdownLabel}
          </div>
        )}
        {time >= 100 && (
          <div className="rocket-orbit-hint">拖动旋转视角 · 滚动缩放 · 近距离观察卫星</div>
        )}
        <div className="rocket-telemetry">
          <div>
            <span>任务时间</span>
            <strong>
              T{time < 7 ? " −" : " +"}{" "}
              {clockLabel(time < 7 ? 7 - time : time - 7)}
            </strong>
          </div>
          <div>
            <span>目标轨道</span>
            <strong>
              400 <small>km</small>
            </strong>
          </div>
          <div>
            <span>演示高度</span>
            <strong>
              {altitude.toString().padStart(3, "0")} <small>km</small>
            </strong>
          </div>
        </div>
        <div className="rocket-scene-caption">
          <span>{String(phaseIndex + 1).padStart(2, "0")} / 08</span>
          <h2>{!started ? "一段旅程，从点火开始" : phase.label}</h2>
          <p>
            {!started
              ? "准备好了吗？一起见证卫星从发射台走向地球轨道。"
              : phase.description}
          </p>
        </div>
        <div className="rocket-scale-note">
          科普演示 · 时间与距离经缩放 · 在轨卫星放大展示
        </div>
      </section>
      <section className="rocket-controls" aria-label="任务播放控制">
        <div className="rocket-play-controls">
          <button
            className="rocket-primary"
            disabled={!ready}
            onClick={() =>
              !started
                ? mission.start()
                : playing
                  ? mission.pause()
                  : mission.resume()
            }
            aria-label={
              !started ? "开始发射" : playing ? "暂停演示" : "继续演示"
            }
          >
            <span>{playing ? "Ⅱ" : "▶"}</span>
            {!started ? "开始发射" : playing ? "暂停演示" : "继续演示"}
          </button>
          <button
            className="rocket-reset"
            onClick={mission.reset}
            aria-label="重新开始"
          >
            ↺ <span>重新开始</span>
          </button>
        </div>
        <div className="rocket-playback">
          <span>播放速度</span>
          {[0.5, 1, 2, 4].map((value) => (
            <button
              key={value}
              aria-label={`${value}倍速`}
              aria-pressed={speed === value}
              className={speed === value ? "is-active" : ""}
              onClick={() => mission.setSpeed(value)}
            >
              {value}×
            </button>
          ))}
        </div>
        <div className="rocket-timer" aria-label="演示时间">
          {clockLabel(time)} <span>{time >= 120 ? "在轨持续运行" : "/ 02:00"}</span>
        </div>
      </section>
      <nav className="rocket-phases" aria-label="发射阶段">
        {MISSION_PHASES.map((item, i) => (
          <button
            key={item.id}
            className={`${i === phaseIndex ? "current" : ""} ${i < phaseIndex ? "complete" : ""}`}
            onClick={() => {
              mission.pause();
              mission.seek(item.start);
            }}
            aria-label={`查看阶段：${item.label}`}
            aria-current={i === phaseIndex ? "step" : undefined}
          >
            <span className="rocket-phase-node">
              {i < phaseIndex ? "✓" : String(i + 1).padStart(2, "0")}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <footer className="rocket-footnote">
        <span>点击任一阶段，暂停观察关键瞬间。</span>
        <span>两级运载火箭 · 卫星入轨任务 · DEMO 01</span>
      </footer>
    </main>
  );
}
