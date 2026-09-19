import { Link } from 'react-router-dom';
import { useGarden, currentStage } from '../lib/garden';
import rabbitAvatar from '../assets/rabbit-avatar.svg';

export default function About() {
  const { garden } = useGarden();
  const stage = currentStage(garden?.stages || []);
  return (
    <main className="about-page">
      <div className="page-header">
        <h1>🧸 关于我</h1>
        <p>认识一下不不吧！</p>
      </div>

      <div className="about-container">
        <div className="about-profile">
          <img src={rabbitAvatar} alt="不不的头像" className="about-avatar-big" />
          <h2>不不</h2>
          <p className="about-tagline">{stage?.label || '成长中'} · 爱记录 · 爱探索</p>
        </div>

        <div className="about-sections">
          <section className="about-card-section">
            <h3>👋 自我介绍</h3>
            <p>
              大家好呀！我是不不。{garden?.intro}
            </p>
            <p>
              创建这个博客是因为我想记录自己成长的每一天，
              也想和全世界的小朋友分享我的快乐和收获。
              希望你在这里能找到一些开心的事情！
            </p>
          </section>

          <section className="about-card-section">
            <h3>💖 我喜欢的事情</h3>
            <div className="hobby-grid">
              {[
                { emoji: '📚', name: '读书', desc: '最爱看童话故事和科普书' },
                { emoji: '🎨', name: '画画', desc: '水彩画和手账是我的最爱' },
                { emoji: '🎹', name: '弹钢琴', desc: '用音乐记录心情' },
                { emoji: '🚲', name: '骑自行车', desc: '享受迎着风出发' },
                { emoji: '🧁', name: '做手工', desc: '喜欢折纸和做卡片' },
                { emoji: '🌻', name: '种花', desc: '阳台上有我的小花园' },
              ].map(({ emoji, name, desc }) => (
                <div key={name} className="hobby-item">
                  <span className="hobby-emoji">{emoji}</span>
                  <strong>{name}</strong>
                  <span className="hobby-desc">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="about-card-section">
            <h3>🌱 我正在经历的成长阶段</h3><p>{stage?.label} · {stage?.theme}</p><p>我的兴趣会变化，想学会的事情也会越来越多。每个学年都有自己的主题，每个项目都记录真实的进度。</p><Link to="/growth" className="see-all">看成长足迹 →</Link><br /><Link to="/projects" className="see-all">看正在探索的项目 →</Link>
          </section>

          <section className="about-card-section">
            <h3>✉️ 想对你说</h3>
            <div className="letter-box">
              <p>亲爱的朋友：</p>
              <p>
                感谢你来到我的小花园！不管你是大朋友还是小朋友，
                不管你来自哪个国家，我都很高兴认识你。
              </p>
              <p>
                如果你也有自己的梦想，那就勇敢去追吧！
                就像我爸爸说的："只要你愿意，每天都可以比昨天更好一点点。"
              </p>
              <p>
                欢迎去 <strong>留言板</strong> 给我写信哦！我会认真看每一条留言的～
              </p>
              <p className="letter-sign">
                爱你的不不 🌸<br />
                写给每一个来做客的你
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
