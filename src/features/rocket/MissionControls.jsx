import { useEffect, useRef } from 'react';
import { MISSION_PHASES } from './runtime/mission';

const commands = [
  { action: '启动倒计时', prompt: '准备好了吗？按下第一步，开始倒计时。' },
  { action: '点火！', prompt: '倒计时完成，等你按下点火按钮！' },
  { action: '发射升空', prompt: '发动机准备好了，指挥火箭升空吧。' },
  { action: '分离一级', prompt: '一级燃料用完了，按下按钮，让它分离。' },
  { action: '打开整流罩', prompt: '飞出稠密大气了，可以打开卫星的保护罩啦。' },
  { action: '进入轨道', prompt: '继续加速，把卫星送到预定轨道。' },
  { action: '释放卫星', prompt: '到达预定位置，亲手释放卫星吧。' },
  { action: '绕地飞行', prompt: '太阳能板已展开，让卫星绕着地球飞行吧。' },
];

const clockLabel = (time) => `${Math.floor(time / 60).toString().padStart(2, '0')}:${Math.floor(time % 60).toString().padStart(2, '0')}`;

export default function MissionControls({ mission, ready }) {
  const { snapshot, pause, resume, replayPhase, reset, setSpeed } = mission;
  const { time, playing, awaitingCommand, phaseIndex, phaseProgress, speed, phase } = snapshot;
  const stepsRef = useRef(null);
  useEffect(() => {
    if (stepsRef.current?.contains(document.activeElement)) {
      stepsRef.current.querySelector('[aria-current="step"]')?.focus({ preventScroll: true });
    }
  }, [phaseIndex]);
  const status = !ready ? '正在准备发射场…'
    : awaitingCommand ? commands[phaseIndex].prompt
    : playing ? `${phase.label}中 · 按当前按钮可以暂停。`
    : `${phase.label}已暂停 · 再按一次继续。`;

  return (
    <section className="rocket-console" aria-label="发射控制台">
      <div className="rocket-console-heading">
        <h2>你来指挥发射</h2>
        <p role="status" aria-live="polite">{status}</p>
      </div>
      <ol ref={stepsRef} className="rocket-phases" aria-label="发射流程">
        {MISSION_PHASES.map((item, index) => {
          const current = index === phaseIndex;
          const complete = index < phaseIndex;
          const locked = index > phaseIndex;
          const action = current
            ? awaitingCommand ? commands[index].action : playing ? '暂停' : '继续'
            : complete ? '重放' : '等待解锁';
          const label = current && awaitingCommand ? commands[index].action : `${action}：${item.label}`;
          return (
            <li key={item.id} className={`${current ? 'current' : ''} ${complete ? 'complete' : ''} ${locked ? 'locked' : ''} ${current && awaitingCommand ? 'awaiting' : ''}`}>
              <button
                className="rocket-step-button"
                disabled={!ready || locked}
                onClick={() => current ? (playing ? pause() : resume()) : replayPhase(index)}
                aria-label={label}
                aria-current={current ? 'step' : undefined}
                style={{ '--step-progress': `${complete ? 100 : current ? phaseProgress * 100 : 0}%` }}
              >
                <span className="rocket-phase-node" aria-hidden="true">
                  {complete ? '✓' : current && !awaitingCommand ? playing ? 'Ⅱ' : '▶' : String(index + 1).padStart(2, '0')}
                </span>
                <span className="rocket-step-title">{current && awaitingCommand ? commands[index].action : item.label}</span>
                <span className="rocket-step-action" aria-hidden="true">{current ? awaitingCommand ? '按下执行' : playing ? '点此暂停' : '点此继续' : complete ? '点击重放' : '等待解锁'}</span>
                <span className="rocket-step-progress" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
      <div className="rocket-console-tools">
        <button className="rocket-reset" onClick={reset} aria-label="重新开始">
          <span aria-hidden="true">↺</span> 重新开始
        </button>
        <div className="rocket-playback" role="group" aria-label="播放速度">
          <span>速度</span>
          {[0.5, 1, 2, 4].map((value) => (
            <button key={value} aria-label={`${value}倍速`} aria-pressed={speed === value} className={speed === value ? 'is-active' : ''} onClick={() => setSpeed(value)}>
              {value}×
            </button>
          ))}
        </div>
        <div className="rocket-timer" aria-label="任务用时">
          {clockLabel(time)} <span>{phaseIndex === 7 && !awaitingCommand ? '绕地飞行' : `${String(phaseIndex + 1).padStart(2, '0')} / 08`}</span>
        </div>
      </div>
    </section>
  );
}
