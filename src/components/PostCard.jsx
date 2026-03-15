import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  return (
    <article className="diary-card">
      <Link to={`/diary/${post.id}`} className="diary-card-link">
        <div className="diary-card-header">
          <span className="diary-card-emoji">{post.emoji}</span>
          <div className="diary-card-mood">
            <span>{post.moodEmoji}</span>
            <span className="mood-text">{post.mood}</span>
          </div>
        </div>
        <h3 className="diary-card-title">{post.title}</h3>
        <p className="diary-card-excerpt">{post.excerpt}</p>
        <div className="diary-card-footer">
          <span className="diary-card-category">{post.category}</span>
          <time className="diary-card-date">
            {new Date(post.date).toLocaleDateString('zh-CN', {
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </Link>
    </article>
  );
}
