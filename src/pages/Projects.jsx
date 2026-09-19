import { useState } from 'react';
import { useGarden, projectStatuses } from '../lib/garden';
import ProjectCard from '../components/ProjectCard';
export default function Projects() {
  const { garden, error } = useGarden();
  const [status, setStatus] = useState('全部');
  const [stage, setStage] = useState('全部');
  const projects = garden?.projects.filter((p) => (status === '全部' || p.status === status) && (stage === '全部' || p.stageId === stage)) || [];
  return <main className="workshop-page">
    <div className="workshop-heading"><span className="eyebrow">MY LITTLE LAB / 探索工坊</span><h1>让好奇心，<br />长出一个作品。</h1><p>从一个小问题出发，记录想法、尝试与改进。<br />做出来的作品，还有一路上的发现，都值得收藏。</p></div>
    <div className="workshop-filters"><div className="category-tabs">{['全部', ...projectStatuses].map((s) => <button key={s} aria-pressed={status === s} className={`category-tab ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{s}</button>)}</div>
      <label>成长阶段 <select value={stage} onChange={(e) => setStage(e.target.value)}><option value="全部">全部学年</option>{garden?.stages.map((s) => <option value={s.id} key={s.id}>{s.label}</option>)}</select></label></div>
    {!garden && !error && <p>探索档案加载中...</p>}
    {garden && <div className="projects-grid">{projects.map((p) => <ProjectCard key={p.id} project={p} stage={garden.stages.find((s) => s.id === p.stageId)} />)}</div>}
    {garden && !projects.length && <p className="empty-state">这个分类还没有项目。新的好奇心正在路上。</p>}
    <aside className="workshop-note"><span>✎</span><div><h3>这里也收藏没有成功的尝试</h3><p>一个失败的实验、一次临时改变的方案、一个还没想明白的问题，都是研究的一部分。</p></div></aside>
  </main>;
}
