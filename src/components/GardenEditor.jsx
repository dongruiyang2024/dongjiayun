import { useState } from 'react';
import { api } from '../lib/api';
import { useGarden, projectStatuses } from '../lib/garden';

function Field({ label, value, onChange, multiline = false, ...props }) {
  return <label className="editor-field">{label}{multiline ? <textarea className="admin-input" rows={4} value={value} onChange={(e) => onChange(e.target.value)} {...props} /> : <input className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} {...props} />}</label>;
}
function Editor({ initial, adminKey, onSaved }) {
  const [draft, setDraft] = useState(() => structuredClone(initial));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const changeStage = (i, patch) => setDraft({ ...draft, stages: draft.stages.map((s, j) => j === i ? { ...s, ...patch } : s) });
  const changeProject = (i, patch) => setDraft({ ...draft, projects: draft.projects.map((p, j) => j === i ? { ...p, ...patch } : p) });
  const save = async (e) => {
    e.preventDefault(); setBusy(true); setMessage('');
    try { const saved = await api.garden.save(draft, adminKey); onSaved(saved); setMessage('已保存，首页、成长足迹和探索工坊已同步更新。'); }
    catch (err) { setMessage(`保存失败：${err.message}`); }
    finally { setBusy(false); }
  };
  return <form className="garden-editor" onSubmit={save}>
    <div className="admin-section-header"><div><h2>持续更新的成长档案</h2><p>按日期切换当前学年；历史学年和项目会保留。修改后请保存。</p></div><button className="admin-btn admin-btn-primary" disabled={busy}>{busy ? '保存中…' : '保存成长档案'}</button></div>
    {message && <p role="status">{message}</p>}
    <fieldset disabled={busy}>
    <Field label="个人简介" value={draft.intro} onChange={(intro) => setDraft({ ...draft, intro })} multiline maxLength={1000} />
    <h3>学年与成长主题</h3>
    {draft.stages.map((s, i) => <div className="editor-block" key={s.id}><div className="editor-grid"><Field label="阶段名称" value={s.label} onChange={(label) => changeStage(i, { label })} required maxLength={80} /><Field label="开始日期" type="date" value={s.start} onChange={(start) => changeStage(i, { start })} required /><Field label="这一阶段的主题" value={s.theme} onChange={(theme) => changeStage(i, { theme })} maxLength={500} /></div></div>)}
    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setDraft({ ...draft, stages: [...draft.stages, { id: crypto.randomUUID(), start: '', label: '', theme: '' }] })}>+ 添加新学年</button>
    <h3>探索项目</h3>
    {draft.projects.map((p, i) => <details className="editor-block" key={p.id} open><summary>{p.title || '新项目'}</summary><div className="editor-grid">
      <Field label="项目名称" value={p.title} onChange={(title) => changeProject(i, { title })} required maxLength={200} />
      <Field label="项目分类" value={p.category} onChange={(category) => changeProject(i, { category })} placeholder="科技制作 / 自然观察 / 活动研究" maxLength={80} />
      <label className="editor-field">所属学年<select className="admin-input" value={p.stageId} onChange={(e) => changeProject(i, { stageId: e.target.value })}>{draft.stages.map((s) => <option value={s.id} key={s.id}>{s.label}</option>)}</select></label>
      <label className="editor-field">状态<select className="admin-input" value={p.status} onChange={(e) => changeProject(i, { status: e.target.value })}>{projectStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
    </div>
      <Field label="项目介绍" value={p.summary} onChange={(summary) => changeProject(i, { summary })} multiline maxLength={2000} />
      <Field label="我想研究的问题" value={p.question} onChange={(question) => changeProject(i, { question })} multiline />
      <h4>进度节点（勾选已完成的步骤）</h4>
      {p.steps.map((s, j) => <div className="editor-step" key={j}><input type="checkbox" aria-label={`完成节点 ${j + 1}`} checked={s.done} onChange={(e) => changeProject(i, { steps: p.steps.map((step, k) => k === j ? { ...step, done: e.target.checked } : step) })} /><input className="admin-input" aria-label={`节点 ${j + 1} 名称`} value={s.title} required maxLength={200} onChange={(e) => changeProject(i, { steps: p.steps.map((step, k) => k === j ? { ...step, title: e.target.value } : step) })} /><button type="button" className="admin-btn" onClick={() => changeProject(i, { steps: p.steps.filter((_, k) => k !== j) })}>移除</button></div>)}
      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => changeProject(i, { steps: [...p.steps, { title: '', done: false }] })}>+ 添加节点</button>
      <h4>研究手记</h4>
      {p.notes.map((n, j) => <div className="editor-block" key={j}>
        <Field label="记录日期" type="date" value={n.date} required onChange={(date) => changeProject(i, { notes: p.notes.map((note, k) => k === j ? { ...note, date } : note) })} />
        <Field label="这次发现" value={n.title} required maxLength={200} onChange={(title) => changeProject(i, { notes: p.notes.map((note, k) => k === j ? { ...note, title } : note) })} />
        <Field label="过程、问题与下一步" value={n.body} multiline onChange={(body) => changeProject(i, { notes: p.notes.map((note, k) => k === j ? { ...note, body } : note) })} />
        <button type="button" className="admin-btn" onClick={() => { if (confirm('移除这条研究手记？保存后生效。')) changeProject(i, { notes: p.notes.filter((_, k) => k !== j) }); }}>移除手记</button>
      </div>)}
      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => changeProject(i, { notes: [...p.notes, { date: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }), title: '', body: '' }] })}>+ 写研究手记</button>
      <Field label="作品说明与复盘" value={p.result} onChange={(result) => changeProject(i, { result })} multiline />
      <Field label="作品图片链接（HTTPS）" type="url" value={p.image} onChange={(image) => changeProject(i, { image })} placeholder="https://…" />
      <button type="button" className="admin-btn admin-btn-danger" onClick={() => { if (confirm('删除这个项目及其研究手记？保存后生效。')) setDraft({ ...draft, projects: draft.projects.filter((_, j) => j !== i) }); }}>删除项目</button>
    </details>)}
    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setDraft({ ...draft, projects: [...draft.projects, { id: crypto.randomUUID(), title: '', category: '活动研究', summary: '', stageId: draft.stages.at(-1).id, status: '筹备中', question: '', steps: ['寻找问题', '设计方案', '动手制作', '测试改进', '展示复盘'].map((title) => ({ title, done: false })), notes: [], result: '', image: '' }] })}>+ 创建探索项目</button>
    </fieldset><button className="admin-btn admin-btn-primary" disabled={busy}>{busy ? '保存中…' : '保存成长档案'}</button>
  </form>;
}
export default function GardenEditor({ adminKey }) {
  const { garden, setGarden, error } = useGarden();
  if (!garden) return <p>{error ? '成长档案未能加载，请刷新后再编辑。' : '成长档案加载中…'}</p>;
  return <Editor initial={garden} adminKey={adminKey} onSaved={setGarden} />;
}
