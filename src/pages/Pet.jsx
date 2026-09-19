import { lazy, Suspense, useEffect, useState } from 'react';
const RabbitScene = lazy(() => import('../components/RabbitScene'));
import { PET_KEY, readPet, newPet, petStages, remaining, careFor } from '../lib/pet';

export default function Pet() {
  const [pet, setPet] = useState(() => { try { return readPet(localStorage.getItem(PET_KEY)); } catch { return newPet(); } });
  const [now, setNow] = useState(Date.now);
  const [message, setMessage] = useState('你好呀！我已经准备好和你做朋友啦。');
  const [saveError, setSaveError] = useState(false);
  const [name, setName] = useState(pet.name);
  const [reaction, setReaction] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const sync = (event) => { if (event.key === PET_KEY) { const next = readPet(event.newValue); setPet(next); setName(next.name); } };
    window.addEventListener('storage', sync);
    return () => { clearInterval(timer); window.removeEventListener('storage', sync); };
  }, []);
  const save = (next) => {
    setPet(next);
    try { localStorage.setItem(PET_KEY, JSON.stringify(next)); setSaveError(false); }
    catch { setSaveError(true); }
  };
  const care = (kind, time) => {
    if (reaction) return;
    const next = careFor(pet, kind, time);
    setNow(time);
    if (next === pet) return;
    save(next);
    setReaction(kind);
    setMessage(kind === 'food' ? '你放好了牧草，小兔正跑向食盆！' : '你添好了清水，小兔正跑向水盆！');
  };
  const stageIndex = petStages.findLastIndex((s) => pet.points >= s.points);
  const stage = petStages[stageIndex];
  const nextStage = petStages[stageIndex + 1];
  return <main className="workshop-page pet-page">
    <div className="page-header"><h1>🐰 小兔乐园</h1><p>一口牧草，一碗清水，陪小兔慢慢长大。</p></div>
    <div className="pet-layout">
      <section className="pet-home" aria-label="小兔的家">
        <div className="pet-home-top"><span className="status-pill">{stage.name}</span><span>不不的小花园 🌷</span></div>
        <p className="pet-speech" role="status">{message}</p>
        <Suspense fallback={<p className="rabbit-loading">正在打开小兔的 3D 花园…</p>}><RabbitScene reaction={reaction} stageIndex={stageIndex} name={pet.name} onComplete={() => { setReaction(''); setMessage('小兔吃喝、休息、探索，都有自己的节奏。'); }} onPat={() => { if (!reaction) { setReaction('pat'); setMessage('轻轻摸摸头，小兔放松下来啦。'); } }} /></Suspense>
        <h2>{pet.name}</h2><p>{stage.description}</p>
        <div className="pet-actions">{[{ kind: 'food', label: '喂牧草', icon: '🌿' }, { kind: 'water', label: '喂清水', icon: '💧' }].map(({ kind, label, icon }) => {
          const wait = remaining(pet, kind, now);
          return <button key={kind} className="btn btn-primary" disabled={wait > 0 || Boolean(reaction)} onClick={() => care(kind, Date.now())}><span>{icon} {label}</span><small>{wait > 0 ? `${Math.ceil(wait / 60000)} 分钟后再来` : reaction ? '小兔正在活动中' : '可以照顾啦 · +1 成长'}</small></button>;
        })}</div>
        <button className="pet-pat" disabled={Boolean(reaction)} onClick={() => { setMessage('蹭蹭你的手，好喜欢和你在一起！'); setReaction('pat'); }}>🤍 摸摸小兔</button>
      </section>
      <aside className="pet-sidebar">
        <section className="about-card-section"><h2>🌱 一点点长大</h2><p className="pet-points">{pet.points}<small> / 36 成长点</small></p><progress max={36} value={pet.points} aria-label="小兔成长进度" /><p>{nextStage ? `再积累 ${nextStage.points - pet.points} 点，就能成为「${nextStage.name}」啦。` : '小兔长大啦！可以继续喂它、陪它玩。'}</p>
          <ol className="pet-stages">{petStages.map((s, i) => <li key={s.name} className={i <= stageIndex ? 'reached' : ''}><span>{i <= stageIndex ? '🌸' : '○'}</span><strong>{s.name}</strong><small>{s.points} 点</small></li>)}</ol>
        </section>
        <section className="about-card-section"><h2>🎀 给小兔取名字</h2><form className="pet-name-form" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; save({ ...pet, name: name.trim() }); setMessage(`以后我就叫${name.trim()}啦！`); }}><label htmlFor="rabbit-name">小兔的名字</label><input id="rabbit-name" className="admin-input" value={name} maxLength={12} required onChange={(e) => setName(e.target.value)} /><button className="btn btn-secondary" type="submit">保存名字</button></form></section>
        <p className="pet-help">每次喂食或喂水增加 1 点成长，各自间隔 30 分钟。没来看它也不会扣分，小兔会安心等你。摸摸它随时都可以！</p>
        <p className="pet-help">这是虚拟小兔。进度保存在当前浏览器，换设备不会同步，清除浏览器数据会重新开始。</p>
        {saveError && <p className="comment-error" role="alert">浏览器暂时不能保存进度。这次可以继续玩，但关闭页面后可能无法保留。</p>}
      </aside>
    </div>
  </main>;
}
