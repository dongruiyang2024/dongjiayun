import { checkAdmin } from './_shared.js';

const INITIAL_POSTS = [
  {
    title: '我学会了骑自行车！🚲',
    emoji: '🚲',
    excerpt: '今天爸爸终于放开了手，我自己一个人骑了好远好远！虽然摔了两次，但是我没有哭，因为我知道学会新东西就是要勇敢尝试。',
    content: `今天是一个超级开心的日子！

爸爸带我去公园学骑自行车。一开始我很害怕，总是觉得会摔倒。爸爸一直在后面扶着我，跟我说："不要怕，爸爸在呢。"

后来爸爸慢慢地放开了手，我竟然自己骑了好远好远！风吹在脸上好舒服呀～🌬️

虽然后来摔了两次，膝盖有点疼，但是我没有哭哦！因为妈妈说过："勇敢的女孩子，摔倒了就自己爬起来。"

现在我已经可以自己骑自行车绕公园一圈啦！下次我要骑给好朋友小美看，她一定会很羡慕的 😄

**今天的收获：** 学会骑自行车，知道了只要勇敢尝试，就能学会新东西！

⭐ 给自己打分：满分！`,
    date: '2026-02-25',
    category: '生活趣事',
    mood: '超级开心',
    mood_emoji: '😄',
  },
  {
    title: '数学考了100分！📝',
    emoji: '📝',
    excerpt: '这次数学测验我考了满分！老师在全班面前表扬了我，还给了我一朵小红花。回家后妈妈做了我最爱吃的红烧排骨来庆祝。',
    content: `今天数学测验发卷子了，我好紧张啊！

当老师念到我的名字说"100分"的时候，我简直不敢相信自己的耳朵！全班同学都在鼓掌 👏

老师说我这次进步很大，特别是应用题做得很好。还给了我一朵小红花贴在成长墙上。

其实这次能考好，是因为我每天都有认真复习。妈妈教我的方法很管用：
1. 📖 先看课本上的例题
2. ✏️ 再做练习题
3. ❌ 把做错的题重新做一遍
4. 🤔 不懂的地方问老师

回到家，妈妈特别高兴，给我做了我最爱吃的红烧排骨！爸爸也夸我棒，说周末带我去游乐园玩 🎢

**今天的收获：** 努力学习真的有回报！以后我要继续加油！

⭐ 给自己打分：满分加一颗星！`,
    date: '2026-02-20',
    category: '学习天地',
    mood: '骄傲',
    mood_emoji: '🥳',
  },
  {
    title: '我的第一幅水彩画 🎨',
    emoji: '🎨',
    excerpt: '美术课上老师教我们画水彩画，我画了一幅春天的花园。虽然颜色涂出了线外，但老师说这叫做"自由创作"，我觉得特别美！',
    content: `今天的美术课太好玩了！

老师教我们用水彩画画。水彩和蜡笔不一样，颜色会化开，像魔法一样 ✨

我画了一幅春天的花园：
- 🌸 粉色的樱花树
- 🌻 黄色的向日葵
- 🦋 蓝色的蝴蝶
- 🌈 天上还有一道彩虹

画的时候颜色不小心涂出了线外，我本来有点难过。但是老师走过来看了看，笑着说："这叫做自由创作，很有艺术感呢！"

老师还把我的画贴在了教室的展示墙上！同学们都说好看，小美说像是真的花园一样。

回家后我又画了一幅送给妈妈，妈妈说要把它装在相框里挂在客厅 🖼️

**今天的收获：** 画画不一定要完美，自由创作也是一种美！

⭐ 给自己打分：五颗星！`,
    date: '2026-02-15',
    category: '兴趣爱好',
    mood: '开心',
    mood_emoji: '😊',
  },
  {
    title: '和奶奶学做饺子 🥟',
    emoji: '🥟',
    excerpt: '放假回老家，奶奶教我包饺子。我包的饺子歪歪扭扭的，但是自己做的饺子吃起来特别特别香！',
    content: `寒假回老家看奶奶，奶奶说要教我包饺子！

奶奶先和面，我帮忙揉面团。面团软软的，像橡皮泥一样好玩～

然后奶奶教我包饺子的步骤：
1. 擀一个圆圆的饺子皮（我擀的有点像地图😂）
2. 放上一勺馅儿（不能太多也不能太少）
3. 对折，把边边捏紧
4. 还可以捏出花边！

我包的前几个饺子都"躺"下来了，站不住。奶奶笑着说："没关系，多练练就好了。"

后来我越包越好，最后几个都能站起来了！👍

煮好以后，我尝了一口自己包的饺子——哇，真的特别特别香！比外面买的好吃一百倍！

奶奶说："自己动手做的东西，吃起来就是香。"

**今天的收获：** 学会了包饺子！自己动手做的东西最好吃！

⭐ 给自己打分：满分！（虽然饺子有点丑😋）`,
    date: '2026-02-08',
    category: '生活趣事',
    mood: '温暖',
    mood_emoji: '🥰',
  },
  {
    title: '我开始写日记啦 📓',
    emoji: '📓',
    excerpt: '语文老师说写日记可以提高写作能力，于是我决定每天都写一篇。这是我在博客上的第一篇日记，好激动呀！',
    content: `今天是我开始写日记的第一天！

语文老师说："想要写好作文，最好的办法就是每天写日记。把看到的、听到的、想到的都写下来。"

所以我决定不光在本子上写，还要在这个博客上写！这样全世界的小朋友都能看到我的成长故事啦 🌍

我给自己定了一个小目标：
- 📝 每周至少写2篇日记
- 📚 记录学习中有趣的事情
- 🌟 分享让我开心或者有收获的瞬间
- 💪 记录自己的进步和成长

妈妈说写博客就像种花一样，要坚持浇水（写文章），花儿才会越开越美。

希望以后回头看这些日记的时候，我会为自己的成长感到骄傲！

也欢迎所有看到这篇文章的大朋友、小朋友们给我留言哦！我们一起加油！💕

**今天的收获：** 开始了自己的博客之旅！

⭐ 给自己打分：勇气满分！`,
    date: '2026-02-01',
    category: '学习天地',
    mood: '期待',
    mood_emoji: '✨',
  },
  {
    title: '下雪啦！堆了一个雪人 ⛄',
    emoji: '⛄',
    excerpt: '今年冬天的第一场大雪！我和小伙伴们在小区里堆了一个超大的雪人，还给它戴了爸爸的围巾，哈哈！',
    content: `早上起来往窗外一看——哇！下雪啦！！！❄️❄️❄️

整个世界都变成了白色的，好像童话里一样！

我飞快地穿好衣服跑下楼，小区里已经有好多小朋友了。我们决定一起堆一个超级大的雪人！

大家分工合作：
- 我和小美负责滚雪人的身体（滚了好大一个球！）
- 小明负责滚雪人的头
- 乐乐找来了树枝当手臂

我还偷偷拿了爸爸的旧围巾给雪人戴上，用胡萝卜做鼻子，用石子做眼睛和嘴巴。

我们的雪人特别可爱！大家都跟它合影 📸

下午雪停了，太阳出来了，我有点担心雪人会化掉。妈妈说："美好的东西不一定要永远存在，能够享受当下就很好了。"

我觉得妈妈说得好有道理啊！

**今天的收获：** 和朋友一起玩真开心！要珍惜每一个快乐的瞬间。

⭐ 给自己打分：快乐满分！`,
    date: '2026-01-20',
    category: '生活趣事',
    mood: '快乐',
    mood_emoji: '😆',
  },
];

const INITIAL_MILESTONES = [
  { date: '2026-02', icon: '🚲', title: '学会骑自行车', desc: '不再需要辅助轮啦！', sort_order: 0 },
  { date: '2026-02', icon: '💯', title: '数学考了100分', desc: '第一次数学满分！', sort_order: 1 },
  { date: '2026-01', icon: '🎨', title: '开始学水彩画', desc: '发现了画画的乐趣', sort_order: 2 },
  { date: '2026-01', icon: '📓', title: '开始写博客', desc: '记录成长的每一天', sort_order: 3 },
  { date: '2025-12', icon: '📚', title: '读完了第10本课外书', desc: '今年的阅读目标达成！', sort_order: 4 },
  { date: '2025-11', icon: '🏃', title: '运动会跑步第三名', desc: '明年要争取第一名！', sort_order: 5 },
  { date: '2025-09', icon: '🎒', title: '升入三年级', desc: '新学期，新开始！', sort_order: 6 },
  { date: '2025-06', icon: '🎹', title: '钢琴过了四级', desc: '每天练琴30分钟的回报', sort_order: 7 },
];

export async function onRequestPost({ request, env }) {
  if (!checkAdmin(request, env)) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  const postsCount = await env.DB.prepare('SELECT COUNT(*) as n FROM posts').first();
  const milestonesCount = await env.DB.prepare('SELECT COUNT(*) as n FROM milestones').first();

  if (postsCount.n > 0 || milestonesCount.n > 0) {
    return Response.json({ error: '数据库已有数据，跳过初始化' }, { status: 409 });
  }

  const postStmt = env.DB.prepare(
    'INSERT INTO posts (title, emoji, excerpt, content, date, category, mood, mood_emoji) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const milestoneStmt = env.DB.prepare(
    'INSERT INTO milestones (date, icon, title, desc, sort_order) VALUES (?, ?, ?, ?, ?)'
  );

  await env.DB.batch([
    ...INITIAL_POSTS.map((p) =>
      postStmt.bind(p.title, p.emoji, p.excerpt, p.content, p.date, p.category, p.mood, p.mood_emoji)
    ),
    ...INITIAL_MILESTONES.map((m) =>
      milestoneStmt.bind(m.date, m.icon, m.title, m.desc, m.sort_order)
    ),
  ]);

  return Response.json({ success: true, posts: INITIAL_POSTS.length, milestones: INITIAL_MILESTONES.length });
}
