import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useGarden, currentStage } from '../lib/garden';
export default function Growth() {
  const { garden } = useGarden();
  const [milestones, setMilestones] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('all');
  useEffect(() => { api.milestones.list().then(setMilestones).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);
  const stages = [...(garden?.stages || [])].sort((a, b) => b.start.localeCompare(a.start));
  const current = currentStage(stages);
  const previous = milestones.filter((m) => !currentStage(stages, m.date.length === 7 ? `${m.date}-01` : m.date));
  return <main className="workshop-page growth-journal">
    <div className="workshop-heading"><span className="eyebrow">GROWTH JOURNAL / 成长足迹</span><h1>每个阶段，<br />都有自己的花期。</h1><p>用学年串起生活，用节点记下进步。<br />收藏过去的回忆，也期待新的探索。</p></div>
    <div className="category-tabs growth-tabs"><button className={`category-tab ${selected === 'all' ? 'active' : ''}`} onClick={() => setSelected('all')}>全部阶段</button>{stages.map((s) => <button className={`category-tab ${selected === s.id ? 'active' : ''}`} key={s.id} onClick={() => setSelected(s.id)}>{s.label}</button>)}</div>
    {loading && <p>成长记录加载中...</p>}{error && <p role="alert" className="comment-error">成长记录加载失败：{error}</p>}
    {stages.filter((s) => selected === 'all' || selected === s.id).map((s) => {
      const records = milestones.filter((m) => currentStage(stages, m.date.length === 7 ? `${m.date}-01` : m.date)?.id === s.id).sort((a, b) => b.date.localeCompare(a.date));
      const projects = garden.projects.filter((p) => p.stageId === s.id);
      return <section className="growth-chapter" key={s.id}><div className="growth-chapter-heading"><time>{s.start.slice(0, 7)}</time><h2>{s.label}</h2><span className="status-pill">{s.id === current?.id ? '当前阶段' : s.start > (current?.start || '') ? '未来计划' : '成长回忆'}</span><p>{s.theme}</p></div><div className="chapter-records">
        <article><span className="eyebrow">学年节点</span><h3>{s.start > (current?.start || '') ? '计划开启' : '开启'}{s.label}</h3><p>{s.theme}</p></article>
        {projects.map((p) => <Link className="growth-project-link" to={`/projects/${p.id}`} key={p.id}><span className="eyebrow">探索项目 · {p.status}</span><h3>{p.title} ↗</h3><p>{p.steps.filter((step) => step.done).length} / {p.steps.length} 个节点完成 · {p.notes.length} 条研究手记</p></Link>)}
        {records.map((m) => <article key={m.id}><time>{m.date}</time><h3>{m.icon} {m.title}</h3><p>{m.desc}</p></article>)}
      </div></section>;
    })}
    {selected === 'all' && previous.length > 0 && <section className="growth-chapter"><div className="growth-chapter-heading"><h2>更早的足迹</h2><p>那些让今天的我成为我的小事。</p></div><div className="chapter-records">{[...previous].sort((a, b) => b.date.localeCompare(a.date)).map((m) => <article key={m.id}><time>{m.date}</time><h3>{m.icon} {m.title}</h3><p>{m.desc}</p></article>)}</div></section>}
  </main>;
}
