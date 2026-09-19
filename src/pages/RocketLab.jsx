import { Component, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import RocketScene from "../features/rocket/RocketScene";
import MissionControls from "../features/rocket/MissionControls";
import { useMissionTimeline } from "../features/rocket/runtime/useMissionTimeline";
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
  const { time, playing, awaitingCommand, phase, phaseIndex } = snapshot;
  const started = time > 0 || playing;
  const countdownLabel = !awaitingCommand && (
    started && time >= 4 && time < 7
      ? String(Math.ceil(7 - time))
      : started && time >= 7 && time < 9
        ? "点火"
        : started && time >= 9 && time < 10.5
          ? "升空"
          : null);
  const altitude =
    time < 9 ? 0 : Math.round(400 * Math.min(1, ((time - 9) / 86) ** 1.5));
  return (
    <main className="rocket-lab">
      <div className="rocket-topline">
        <Link to="/">← 返回首页</Link>
      </div>
      <header className="rocket-heading">
        <h1>下一站，太空</h1>
        <div className="rocket-mission-badge">
          <span className="rocket-status-dot" />
          启明星一号
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
        {countdownLabel && (
          <div className="rocket-countdown" key={countdownLabel}>
            {countdownLabel}
          </div>
        )}
        {time >= 112 && (
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
          <h2>{!started ? "一段旅程，从点火开始" : awaitingCommand ? `下一步：${phase.label}` : phase.label}</h2>
          <p>
            {!started
              ? "按下方的倒计时按钮，准备发射。"
              : awaitingCommand ? "准备就绪，等你发出下一道指令。" : phase.description}
          </p>
        </div>
      </section>
      <MissionControls mission={mission} ready={ready && !sceneError} />
    </main>
  );
}
