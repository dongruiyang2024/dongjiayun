import { Link } from 'react-router-dom';
import posts from '../data/posts';

export default function Home() {
  const latestPosts = posts.slice(0, 3);

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-floating">
          <span className="float-item" style={{ '--delay': '0s', '--x': '10%', '--y': '20%' }}>🌸</span>
          <span className="float-item" style={{ '--delay': '1s', '--x': '85%', '--y': '15%' }}>🦋</span>
          <span className="float-item" style={{ '--delay': '2s', '--x': '75%', '--y': '70%' }}>⭐</span>
          <span className="float-item" style={{ '--delay': '0.5s', '--x': '15%', '--y': '75%' }}>🌈</span>
          <span className="float-item" style={{ '--delay': '1.5s', '--x': '50%', '--y': '10%' }}>☁️</span>
          <span className="float-item" style={{ '--delay': '3s', '--x': '90%', '--y': '50%' }}>💖</span>
        </div>
        <div className="hero-content">
          <div className="hero-wave">👋</div>
          <h1 className="hero-title">
            欢迎来到<br />
            <span className="hero-highlight">不不的成长花园</span>
          </h1>
          <p className="hero-subtitle">
            嗨～我是不不，一个三年级的小女生 🎀<br />
            这里记录着我每一天的快乐、学习和成长<br />
            欢迎你来做客，和我一起分享美好时光！
          </p>
          <div className="hero-buttons">
            <Link to="/diary" className="btn btn-primary">
              📖 看我的日记
            </Link>
            <Link to="/guestbook" className="btn btn-secondary">
              💌 给我留言
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-header">
          <h2>📝 最新日记</h2>
          <Link to="/diary" className="see-all">查看全部 →</Link>
        </div>
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

      <section className="home-section">
        <div className="section-header">
          <h2>🌟 关于这个花园</h2>
        </div>
        <div className="home-about-grid">
          <div className="about-card">
            <span className="about-card-icon">📝</span>
            <h3>记录生活</h3>
            <p>把每天发生的有趣事情都写下来，长大后再看一定很有意思！</p>
          </div>
          <div className="about-card">
            <span className="about-card-icon">📚</span>
            <h3>分享学习</h3>
            <p>分享我的学习方法和收获，也想知道你们是怎么学习的～</p>
          </div>
          <div className="about-card">
            <span className="about-card-icon">🌍</span>
            <h3>交朋友</h3>
            <p>希望能认识来自世界各地的朋友，欢迎来留言板和我聊天！</p>
          </div>
          <div className="about-card">
            <span className="about-card-icon">🌱</span>
            <h3>一起成长</h3>
            <p>每天进步一点点，我们一起变成更好的自己！</p>
          </div>
        </div>
      </section>
    </main>
  );
}
