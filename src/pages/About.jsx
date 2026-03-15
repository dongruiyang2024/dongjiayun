import rabbitAvatar from '../assets/rabbit-avatar.svg';

export default function About() {
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
          <p className="about-tagline">三年级 · 爱笑的女生 · 小小梦想家</p>
        </div>

        <div className="about-sections">
          <section className="about-card-section">
            <h3>👋 自我介绍</h3>
            <p>
              大家好呀！我是不不，今年9岁，是一个三年级的小学生。
              我是一个爱笑、爱学习、爱交朋友的女孩子！
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
                { emoji: '🎹', name: '弹钢琴', desc: '已经过了四级啦！' },
                { emoji: '🚲', name: '骑自行车', desc: '刚刚学会，超级兴奋' },
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
            <h3>🎯 我的小目标</h3>
            <div className="goal-list">
              {[
                { text: '每周写2篇日记', progress: 80 },
                { text: '今年读完20本课外书', progress: 50 },
                { text: '钢琴过五级', progress: 30 },
                { text: '学会游泳', progress: 10 },
              ].map(({ text, progress }) => (
                <div key={text} className="goal-item">
                  <div className="goal-text">
                    <span>{text}</span>
                    <span className="goal-percent">{progress}%</span>
                  </div>
                  <div className="goal-bar">
                    <div className="goal-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
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
                2026年2月
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
