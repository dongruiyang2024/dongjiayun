import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const AVATARS = ['🐱', '🐶', '🐰', '🐼', '🦊', '🐨', '🐯', '🦁', '🐸', '🐧', '🦄', '🐝', '🦋', '🐬', '🐻'];

function loadLocalComments(pageId) {
  try {
    const data = localStorage.getItem(`guestbook_${pageId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export default function CommentSection({ pageId = 'default', title = '留言区' }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [avatar, setAvatar] = useState(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.comments.list(pageId)
      .then(setComments)
      .catch(() => setComments(loadLocalComments(pageId)));
  }, [pageId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const newComment = await api.comments.create({
        pageId,
        name: name.trim(),
        avatar,
        message: message.trim(),
      });
      setComments((prev) => [newComment, ...prev]);
      setName('');
      setMessage('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err.message || '提交失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="comment-section">
      <h2 className="comment-title">
        💬 {title}
      </h2>

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-form-top">
          <div className="avatar-picker-wrapper">
            <button
              type="button"
              className="avatar-display"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              title="选择你的头像"
            >
              {avatar}
            </button>
            {showAvatarPicker && (
              <div className="avatar-picker">
                <p className="avatar-picker-title">选择你的头像：</p>
                <div className="avatar-grid">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`avatar-option ${a === avatar ? 'selected' : ''}`}
                      onClick={() => { setAvatar(a); setShowAvatarPicker(false); }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="你的名字 ✨"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="comment-name-input"
            maxLength={20}
            required
          />
        </div>

        <textarea
          placeholder="写下你想说的话吧～ 可以给我加油鼓励，也可以分享你的故事哦！💕"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="comment-textarea"
          rows={4}
          maxLength={500}
          required
        />

        <div className="comment-form-bottom">
          <span className="char-count">{message.length}/500</span>
          <button type="submit" className="comment-submit" disabled={submitting}>
            {submitting ? '发送中...' : '发送留言 ✉️'}
          </button>
        </div>

        {submitted && (
          <div className="comment-success">
            🎉 留言成功！谢谢你的留言～
          </div>
        )}
        {error && (
          <div className="comment-error">
            ⚠️ {error}
          </div>
        )}
      </form>

      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="comment-empty">
            <span className="comment-empty-icon">💭</span>
            <p>还没有留言哦～</p>
            <p>快来做第一个留言的人吧！</p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar">{c.avatar}</div>
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-author">{c.name}</span>
                  <time className="comment-date">
                    {new Date(c.createdAt || c.date).toLocaleDateString('zh-CN', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <p className="comment-text">{c.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
