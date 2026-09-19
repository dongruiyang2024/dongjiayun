import { Link } from 'react-router-dom';
export default function ProjectCard({ project, stage }) {
  const done = project.steps.filter((step) => step.done).length;
  return <Link className="project-card" to={`/projects/${project.id}`}>
    <div className="project-card-top"><span className="eyebrow">{project.category}</span><span className="status-pill">{project.status}</span></div>
    <div className="project-symbol" aria-hidden="true">✳</div>
    <h3>{project.title}</h3><p>{project.summary}</p>
    <div className="project-meta"><span>{stage?.label || '成长项目'}</span><span>{done} / {project.steps.length} 个节点完成</span></div>
    <progress aria-label={`${project.title}节点进度`} value={done} max={project.steps.length || 1} />
    <span className="project-link">翻开探索手册 ↗</span>
  </Link>;
}
