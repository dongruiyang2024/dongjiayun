import { Link, useParams } from 'react-router-dom';
import { useGarden } from '../lib/garden';
export default function Project() {
  const { id } = useParams();
  const { garden, error } = useGarden();
  if (!garden) return <main className="workshop-page"><p>{error ? '暂时无法读取项目。' : '探索手册加载中...'}</p></main>;
  const p = garden.projects.find((project) => project.id === id);
  if (!p) return <main className="workshop-page"><h1>还没有找到这个项目</h1><Link to="/projects">返回探索工坊 →</Link></main>;
  const done = p.steps.filter((s) => s.done).length;
  const next = p.steps.findIndex((s) => !s.done);
  return <main className="workshop-page project-detail">
    <Link to="/projects" className="back-link">← 探索工坊</Link>
    <header className="workshop-heading"><span className="eyebrow">{garden.stages.find((s) => s.id === p.stageId)?.label} / {p.category} / {p.status}</span><h1>{p.title}</h1><p>{p.summary}</p></header>
    <section className="research-question"><span className="eyebrow">01 / 我想研究的问题</span><h2>{p.question || '还在寻找一个值得动手试试的问题'}</h2>{!p.question && <p>选题待定。先观察生活，收集想法，再确定作品方向。</p>}</section>
    <section className="project-section"><div className="section-header"><h2>02 / 一步一步做出来</h2><span>{done} / {p.steps.length} 个节点完成</span></div>
      <ol className="project-steps">{p.steps.map((s, i) => <li key={i} className={s.done ? 'done' : i === next && p.status !== '已暂停' ? 'current' : ''}><span className="step-number">{s.done ? '✓' : String(i + 1).padStart(2, '0')}</span><h3>{s.title}</h3><p>{s.done ? '已完成' : i === next && p.status === '进行中' ? '正在探索' : '待完成'}</p></li>)}</ol>
    </section>
    <section className="project-section"><div className="section-header"><h2>03 / 我的研究手记</h2><span>{p.notes.length} 条记录</span></div>
      {!p.notes.length ? <div className="research-empty"><h3>第一条发现，还等着我来写</h3><p>可以记录：今天尝试了什么？遇到了什么问题？下次想怎么改？</p></div> : <div className="research-notes">{[...p.notes].sort((a, b) => b.date.localeCompare(a.date)).map((n, i) => <article key={i}><time>{n.date}</time><h3>{n.title}</h3><p className="preserve-lines">{n.body}</p></article>)}</div>}
    </section>
    <section className="project-section research-result"><span className="eyebrow">04 / 作品与复盘</span><h2>{p.result ? '把作品留下，把发现带走' : '为未来的作品留一个位置'}</h2><p className="preserve-lines">{p.result || '完成后，在这里放上作品照片、原理说明，以及我学会的事情。'}</p>{p.image && <img src={p.image} alt={`${p.title}的作品`} loading="lazy" referrerPolicy="no-referrer" />}</section>
  </main>;
}
