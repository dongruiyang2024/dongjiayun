import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { growthTimeline as staticTimeline } from '../data/posts';

export default function Growth() {
  const [milestones, setMilestones] = useState(staticTimeline);
  const [postCount, setPostCount] = useState(6);

  useEffect(() => {
    api.milestones.list()
      .then(setMilestones)
      .catch(() => {});
    api.posts.list()
      .then((posts) => setPostCount(posts.length))
      .catch(() => {});
  }, []);

  return (
    <main className="growth-page">
      <div className="page-header">
        <h1>🌱 成长足迹</h1>
        <p>每一步都算数，每一天都在进步！</p>
      </div>

      <div className="timeline">
        {milestones.map((item, index) => (
          <div key={item.id ?? index} className="timeline-item" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="timeline-dot">
              <span>{item.icon}</span>
            </div>
            <div className="timeline-content">
              <time className="timeline-date">{item.date}</time>
              <h3 className="timeline-title">{item.title}</h3>
              <p className="timeline-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="growth-stats">
        <h2>📊 我的小数据</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{postCount}</span>
            <span className="stat-label">篇日记</span>
            <span className="stat-icon">📝</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">10+</span>
            <span className="stat-label">本课外书</span>
            <span className="stat-icon">📚</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">4</span>
            <span className="stat-label">级钢琴</span>
            <span className="stat-icon">🎹</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">100</span>
            <span className="stat-label">分数学</span>
            <span className="stat-icon">💯</span>
          </div>
        </div>
      </div>
    </main>
  );
}
