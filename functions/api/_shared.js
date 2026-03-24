export function checkAdmin(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const key = env.ADMIN_KEY || '';
  return Boolean(key && auth === `Bearer ${key}`);
}

export function mapPost(p) {
  return {
    id: p.id,
    title: p.title,
    emoji: p.emoji,
    excerpt: p.excerpt,
    content: p.content,
    date: p.date,
    category: p.category,
    mood: p.mood,
    moodEmoji: p.mood_emoji,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export function mapComment(c) {
  return {
    id: c.id,
    pageId: c.page_id,
    name: c.name,
    avatar: c.avatar,
    message: c.message,
    createdAt: c.created_at,
  };
}
