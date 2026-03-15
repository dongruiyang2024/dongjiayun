import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import posts from '../data/posts';
import CommentSection from '../components/CommentSection';

export default function Post() {
  const { id } = useParams();
  const post = posts.find((p) => p.id === Number(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return <Navigate to="/diary" replace />;
  }

  const currentIndex = posts.findIndex((p) => p.id === post.id);
  const prevPost = posts[currentIndex + 1];
  const nextPost = posts[currentIndex - 1];

  const paragraphs = post.content.trim().split('\n\n');

  return (
    <main className="post-page">
      <article className="post-article">
        <Link to="/diary" className="back-link">
          ← 回到日记列表
        </Link>

        <header className="post-header">
          <span className="post-big-emoji">{post.emoji}</span>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="post-meta-item">
              📅 {new Date(post.date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="post-meta-item">
              {post.moodEmoji} 心情：{post.mood}
            </span>
            <span className="post-meta-item">
              📂 {post.category}
            </span>
          </div>
        </header>

        <div className="post-body">
          {paragraphs.map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**')) {
              return <p key={i} className="post-highlight">{para.replace(/\*\*/g, '')}</p>;
            }

            if (para.includes('\n- ') || para.startsWith('- ')) {
              const items = para.split('\n').filter((l) => l.startsWith('- '));
              return (
                <ul key={i}>
                  {items.map((item, j) => (
                    <li key={j}>{item.slice(2)}</li>
                  ))}
                </ul>
              );
            }

            if (para.includes('\n1. ') || para.startsWith('1. ')) {
              const items = para.split('\n').filter((l) => /^\d+\.\s/.test(l));
              return (
                <ol key={i}>
                  {items.map((item, j) => (
                    <li key={j}>{item.replace(/^\d+\.\s/, '')}</li>
                  ))}
                </ol>
              );
            }

            return para.split('\n').map((line, j) => {
              if (!line.trim()) return null;
              const formatted = line
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
              return <p key={`${i}-${j}`} dangerouslySetInnerHTML={{ __html: formatted }} />;
            });
          })}
        </div>

        <nav className="post-nav">
          {prevPost ? (
            <Link to={`/diary/${prevPost.id}`} className="post-nav-link prev">
              <span className="post-nav-arrow">←</span>
              <span className="post-nav-label">上一篇</span>
              <span className="post-nav-title">{prevPost.emoji} {prevPost.title}</span>
            </Link>
          ) : <div />}
          {nextPost ? (
            <Link to={`/diary/${nextPost.id}`} className="post-nav-link next">
              <span className="post-nav-arrow">→</span>
              <span className="post-nav-label">下一篇</span>
              <span className="post-nav-title">{nextPost.emoji} {nextPost.title}</span>
            </Link>
          ) : <div />}
        </nav>

        <CommentSection pageId={`post-${post.id}`} title="读后留言" />
      </article>
    </main>
  );
}
