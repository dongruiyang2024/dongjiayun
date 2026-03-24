import { useState, useEffect, useMemo } from 'react';
import PostCard from '../components/PostCard';
import { api } from '../lib/api';
import staticPosts, { categories } from '../data/posts';

export default function Diary() {
  const [posts, setPosts] = useState(staticPosts);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.posts.list()
      .then(setPosts)
      .catch(() => setPosts(staticPosts))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = activeCategory === '全部' || post.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        post.title.includes(searchQuery) ||
        post.excerpt.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  return (
    <main className="diary-page">
      <div className="page-header">
        <h1>📖 我的日记</h1>
        <p>记录每一天的小确幸 ✨</p>
      </div>

      <div className="diary-controls">
        <div className="search-box">
          <span className="search-emoji">🔍</span>
          <input
            type="text"
            placeholder="搜索日记..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="loading-icon">🌸</span>
          <p>加载中...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p>没有找到相关日记哦～</p>
          <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setActiveCategory('全部'); }}>
            查看全部日记
          </button>
        </div>
      ) : (
        <div className="diary-grid">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
