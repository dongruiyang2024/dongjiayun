import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useGarden, currentStage } from '../lib/garden';
import ProjectCard from '../components/ProjectCard';
import rabbitAvatar from '../assets/rabbit-avatar.svg';

export default function Home() {
  const { garden } = useGarden();
  const stage = currentStage(garden?.stages || []);
  const featured = garden?.projects.find((p) => ['筹备中', '进行中'].includes(p.status)) || garden?.projects[0];
  const [latestPosts, setLatestPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.posts.list()
      .then((posts) => setLatestPosts(posts.slice(0, 3)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="home">
      <section className="garden-hero">
        <div className="garden-hero-copy"><span className="eyebrow">不不的成长花园 / GROWING, DAY BY DAY</span>
          <h1>慢慢长大，<br />认真<span>发现世界。</span></h1>
          <p>嗨，我是不不。{garden?.intro || '这里收藏我的生活、学习和每一次新尝试。'}</p>
          <div className="hero-buttons"><Link to="/projects" className="btn btn-primary">走进探索工坊 ↗</Link><Link to="/diary" className="btn btn-secondary">翻翻我的日记</Link></div>
        </div>
        <aside className="chapter-card"><div className="chapter-top"><span>我的成长手册</span><span>✦</span></div><img src={rabbitAvatar} alt="不不的兔子头像" /><span className="eyebrow">CURRENT CHAPTER</span><h2>{stage?.label || '成长进行时'}</h2><p>{stage?.theme || '每个阶段，都有新的发现'}</p><Link to="/growth">看看我走过的路 →</Link></aside>
      </section>
      <div className="garden-paths"><Link to="/diary"><span>01 / 记录</span><strong>日常与学习</strong><p>把小日子写成故事 ↗</p></Link><Link to="/growth"><span>02 / 成长</span><strong>学年与里程碑</strong><p>每一步，都有迹可循 ↗</p></Link><Link to="/projects"><span>03 / 探索</span><strong>研究与作品</strong><p>让想法在手中发生 ↗</p></Link></div>
      {featured && <section className="home-section featured-project"><div><span className="eyebrow">ON MY DESK / 最近的探索</span><h2>一个新想法，<br />正在发芽。</h2><p>不只展示最后的成果，也记下从“为什么”到“试试看”的过程。</p><Link to="/projects" className="see-all">所有探索项目 →</Link></div><ProjectCard project={featured} stage={garden.stages.find((s) => s.id === featured.stageId)} /></section>}

      <section className="home-section">
        <div className="section-header">
          <h2>📝 最新日记</h2>
          <Link to="/diary" className="see-all">查看全部 →</Link>
        </div>
        {error && <p role="alert" className="comment-error">日记加载失败：{error}</p>}
        {loading && <p>日记加载中...</p>}
        {!loading && !error && latestPosts.length === 0 && <p>还没有日记，敬请期待 🌱</p>}
        <div className="home-posts-grid">
          {latestPosts.map((post) => (
            <Link to={`/diary/${post.id}`} key={post.id} className="home-post-card">
              <span className="home-post-emoji">{post.emoji}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="home-post-bottom">
                <span className="home-post-mood">{post.moodEmoji} {post.mood}</span>
                <time>
                  {new Date(post.date).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section garden-invitation"><span>🌱</span><h2>成长没有标准答案</h2><p>读一本书，学会一件小事，或者勇敢再试一次。<br />今天的我，又比昨天多认识了世界一点点。</p><Link to="/about" className="see-all">认识不不 →</Link></section>
    </main>
  );
}
