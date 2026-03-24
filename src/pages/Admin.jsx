import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const CATEGORIES = ['生活趣事', '学习天地', '兴趣爱好'];
const MOODS = [
  { mood: '超级开心', emoji: '😄' },
  { mood: '开心', emoji: '😊' },
  { mood: '骄傲', emoji: '🥳' },
  { mood: '温暖', emoji: '🥰' },
  { mood: '期待', emoji: '✨' },
  { mood: '快乐', emoji: '😆' },
  { mood: '平静', emoji: '😌' },
  { mood: '感动', emoji: '🥹' },
];

const emptyPost = {
  title: '',
  emoji: '📝',
  excerpt: '',
  content: '',
  date: new Date().toISOString().slice(0, 10),
  category: '生活趣事',
  mood: '开心',
  moodEmoji: '😊',
};

export default function Admin() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('adminKey') || '');
  const [keyInput, setKeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('posts');

  const [posts, setPosts] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentPageId, setCommentPageId] = useState('guestbook');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const [postForm, setPostForm] = useState(emptyPost);
  const [editingPostId, setEditingPostId] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);

  const [milestoneForm, setMilestoneForm] = useState({ date: '', icon: '⭐', title: '', desc: '', sort_order: 0 });

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      await api.auth(keyInput);
      sessionStorage.setItem('adminKey', keyInput);
      setAdminKey(keyInput);
      setAuthError('');
    } catch {
      setAuthError('密钥错误，请重试');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminKey');
    setAdminKey('');
    setKeyInput('');
  };

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try { setPosts(await api.posts.list()); } catch { }
    setLoading(false);
  }, []);

  const loadMilestones = useCallback(async () => {
    try { setMilestones(await api.milestones.list()); } catch { }
  }, []);

  const loadComments = useCallback(async (pageId) => {
    try { setComments(await api.comments.list(pageId)); } catch { setComments([]); }
  }, []);

  useEffect(() => {
    if (!adminKey) return;
    if (tab === 'posts') loadPosts();
    if (tab === 'milestones') loadMilestones();
    if (tab === 'comments') loadComments(commentPageId);
    if (tab === 'setup') {}
  }, [tab, adminKey, loadPosts, loadMilestones, loadComments, commentPageId]);

  // ── POST CRUD ──
  const openNewPost = () => {
    setPostForm(emptyPost);
    setEditingPostId(null);
    setShowPostForm(true);
  };
  const openEditPost = (post) => {
    setPostForm({ ...post });
    setEditingPostId(post.id);
    setShowPostForm(true);
  };
  const savePost = async (e) => {
    e.preventDefault();
    try {
      if (editingPostId) {
        await api.posts.update(editingPostId, postForm, adminKey);
        flash('✅ 日记已更新！');
      } else {
        await api.posts.create(postForm, adminKey);
        flash('✅ 新日记已发布！');
      }
      setShowPostForm(false);
      loadPosts();
    } catch (err) {
      flash(`❌ ${err.message}`);
    }
  };
  const deletePost = async (id) => {
    if (!confirm('确定要删除这篇日记吗？相关留言也会一并删除。')) return;
    try {
      await api.posts.delete(id, adminKey);
      flash('✅ 已删除');
      loadPosts();
    } catch (err) {
      flash(`❌ ${err.message}`);
    }
  };

  // ── MILESTONE CRUD ──
  const addMilestone = async (e) => {
    e.preventDefault();
    try {
      await api.milestones.create(milestoneForm, adminKey);
      setMilestoneForm({ date: '', icon: '⭐', title: '', desc: '', sort_order: 0 });
      flash('✅ 里程碑已添加！');
      loadMilestones();
    } catch (err) {
      flash(`❌ ${err.message}`);
    }
  };
  const deleteMilestone = async (id) => {
    if (!confirm('确定要删除这条里程碑吗？')) return;
    try {
      await api.milestones.delete(id, adminKey);
      flash('✅ 已删除');
      loadMilestones();
    } catch (err) {
      flash(`❌ ${err.message}`);
    }
  };

  // ── COMMENT ──
  const deleteComment = async (id) => {
    if (!confirm('确定要删除这条留言吗？')) return;
    try {
      await api.comments.delete(id, adminKey);
      flash('✅ 留言已删除');
      loadComments(commentPageId);
    } catch (err) {
      flash(`❌ ${err.message}`);
    }
  };

  // ── SETUP ──
  const runSetup = async () => {
    if (!confirm('将向数据库写入初始示例数据（文章+里程碑）。如已有数据会提示冲突。继续吗？')) return;
    try {
      const res = await api.setup(adminKey);
      flash(`✅ 初始化成功！写入 ${res.posts} 篇文章，${res.milestones} 条里程碑`);
    } catch (err) {
      flash(`❌ ${err.message}`);
    }
  };

  if (!adminKey) {
    return (
      <main className="admin-login">
        <div className="admin-login-box">
          <h1>🔐 管理员登录</h1>
          <p>输入管理员密钥以进入后台</p>
          <form onSubmit={login}>
            <input
              type="password"
              placeholder="管理员密钥"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="admin-input"
              required
            />
            {authError && <p className="admin-error">{authError}</p>}
            <button type="submit" className="admin-btn admin-btn-primary">进入后台</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1>🛠️ 管理后台</h1>
        <button className="admin-btn admin-btn-ghost" onClick={logout}>退出登录</button>
      </div>

      {msg && <div className={`admin-flash ${msg.startsWith('❌') ? 'admin-flash-error' : ''}`}>{msg}</div>}

      <div className="admin-tabs">
        {[
          { id: 'posts', label: '📝 文章管理' },
          { id: 'milestones', label: '🌱 成长足迹' },
          { id: 'comments', label: '💬 留言管理' },
          { id: 'setup', label: '⚙️ 数据初始化' },
        ].map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── POSTS TAB ── */}
      {tab === 'posts' && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>文章列表 ({posts.length})</h2>
            <button className="admin-btn admin-btn-primary" onClick={openNewPost}>+ 写新日记</button>
          </div>

          {showPostForm && (
            <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowPostForm(false)}>
              <div className="admin-modal">
                <div className="admin-modal-header">
                  <h3>{editingPostId ? '✏️ 编辑日记' : '📝 写新日记'}</h3>
                  <button className="admin-btn admin-btn-ghost" onClick={() => setShowPostForm(false)}>✕</button>
                </div>
                <form onSubmit={savePost} className="admin-form">
                  <div className="admin-form-row">
                    <label>标题 *</label>
                    <input
                      className="admin-input"
                      value={postForm.title}
                      onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                      placeholder="日记标题"
                      required
                    />
                  </div>
                  <div className="admin-form-row admin-form-row-3">
                    <div>
                      <label>Emoji</label>
                      <input
                        className="admin-input"
                        value={postForm.emoji}
                        onChange={(e) => setPostForm({ ...postForm, emoji: e.target.value })}
                        placeholder="📝"
                      />
                    </div>
                    <div>
                      <label>日期 *</label>
                      <input
                        type="date"
                        className="admin-input"
                        value={postForm.date}
                        onChange={(e) => setPostForm({ ...postForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label>分类</label>
                      <select
                        className="admin-input"
                        value={postForm.category}
                        onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      >
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <label>心情</label>
                    <select
                      className="admin-input"
                      value={postForm.mood}
                      onChange={(e) => {
                        const found = MOODS.find((m) => m.mood === e.target.value);
                        setPostForm({ ...postForm, mood: e.target.value, moodEmoji: found?.emoji || '😊' });
                      }}
                    >
                      {MOODS.map((m) => <option key={m.mood} value={m.mood}>{m.emoji} {m.mood}</option>)}
                    </select>
                  </div>
                  <div className="admin-form-row">
                    <label>摘要</label>
                    <textarea
                      className="admin-input"
                      rows={2}
                      value={postForm.excerpt}
                      onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                      placeholder="简短介绍（显示在列表页）"
                    />
                  </div>
                  <div className="admin-form-row">
                    <label>正文 * <span className="admin-hint">支持 **加粗**、- 列表、1. 有序列表</span></label>
                    <textarea
                      className="admin-input admin-textarea-large"
                      rows={14}
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      placeholder="写下你的日记内容..."
                      required
                    />
                  </div>
                  <div className="admin-form-actions">
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowPostForm(false)}>取消</button>
                    <button type="submit" className="admin-btn admin-btn-primary">
                      {editingPostId ? '保存修改' : '发布日记'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <p className="admin-loading">加载中...</p>
          ) : posts.length === 0 ? (
            <p className="admin-empty">暂无文章，点击"写新日记"开始吧！</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>分类</th>
                  <th>日期</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="admin-table-title">{post.emoji} {post.title}</td>
                    <td><span className="admin-badge">{post.category}</span></td>
                    <td>{post.date}</td>
                    <td className="admin-table-actions">
                      <button className="admin-btn admin-btn-sm" onClick={() => openEditPost(post)}>编辑</button>
                      <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => deletePost(post.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── MILESTONES TAB ── */}
      {tab === 'milestones' && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>成长里程碑 ({milestones.length})</h2>
          </div>

          <form onSubmit={addMilestone} className="admin-form admin-inline-form">
            <input
              className="admin-input"
              value={milestoneForm.date}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, date: e.target.value })}
              placeholder="年月 (如 2026-03)"
              required
            />
            <input
              className="admin-input admin-input-sm"
              value={milestoneForm.icon}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, icon: e.target.value })}
              placeholder="图标 ⭐"
            />
            <input
              className="admin-input"
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              placeholder="里程碑标题 *"
              required
            />
            <input
              className="admin-input"
              value={milestoneForm.desc}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, desc: e.target.value })}
              placeholder="简短描述"
            />
            <input
              type="number"
              className="admin-input admin-input-sm"
              value={milestoneForm.sort_order}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, sort_order: Number(e.target.value) })}
              placeholder="排序"
            />
            <button type="submit" className="admin-btn admin-btn-primary">添加</button>
          </form>

          <table className="admin-table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>图标</th>
                <th>标题</th>
                <th>日期</th>
                <th>描述</th>
                <th>排序</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontSize: '1.5rem' }}>{m.icon}</td>
                  <td>{m.title}</td>
                  <td>{m.date}</td>
                  <td>{m.desc}</td>
                  <td>{m.sort_order}</td>
                  <td>
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => deleteMilestone(m.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── COMMENTS TAB ── */}
      {tab === 'comments' && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>留言管理</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                className="admin-input"
                value={commentPageId}
                onChange={(e) => setCommentPageId(e.target.value)}
                placeholder="页面ID (如 guestbook / post-1)"
              />
              <button className="admin-btn admin-btn-primary" onClick={() => loadComments(commentPageId)}>查询</button>
            </div>
          </div>

          {comments.length === 0 ? (
            <p className="admin-empty">该页面暂无留言</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>头像</th>
                  <th>昵称</th>
                  <th>内容</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontSize: '1.5rem' }}>{c.avatar}</td>
                    <td>{c.name}</td>
                    <td className="admin-comment-text">{c.message}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(c.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => deleteComment(c.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── SETUP TAB ── */}
      {tab === 'setup' && (
        <div className="admin-section">
          <h2>数据初始化</h2>
          <div className="admin-setup-card">
            <h3>🌱 写入初始示例数据</h3>
            <p>将 6 篇示例日记和 8 条成长里程碑写入数据库。<br />如果数据库已有数据，此操作会被跳过（不会覆盖）。</p>
            <button className="admin-btn admin-btn-primary" onClick={runSetup}>
              执行初始化
            </button>
          </div>
          <div className="admin-setup-card" style={{ marginTop: '1rem' }}>
            <h3>📋 数据库配置提示</h3>
            <ol className="admin-setup-steps">
              <li>创建 D1 数据库：<code>wrangler d1 create dongjiayun-db</code></li>
              <li>将返回的 <code>database_id</code> 填入 <code>wrangler.json</code></li>
              <li>运行迁移：<code>wrangler d1 execute dongjiayun-db --file=migrations/0001_initial.sql</code></li>
              <li>在 Cloudflare 控制台设置环境变量 <code>ADMIN_KEY</code></li>
              <li>部署后点击上方"执行初始化"写入示例数据</li>
            </ol>
          </div>
        </div>
      )}
    </main>
  );
}
