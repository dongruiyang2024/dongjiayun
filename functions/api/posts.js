import { checkAdmin, mapPost } from './_shared.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, title, emoji, excerpt, date, category, mood, mood_emoji, created_at, updated_at FROM posts ORDER BY date DESC'
  ).all();
  return Response.json(results.map(mapPost));
}

export async function onRequestPost({ request, env }) {
  if (!checkAdmin(request, env)) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 });
  }

  const { title, emoji = '📝', excerpt = '', content, date, category = '生活趣事', mood = '开心', moodEmoji = '😊' } = body;

  if (!title || !content || !date) {
    return Response.json({ error: '标题、内容和日期为必填项' }, { status: 400 });
  }

  const result = await env.DB.prepare(
    'INSERT INTO posts (title, emoji, excerpt, content, date, category, mood, mood_emoji) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(title, emoji, excerpt, content, date, category, mood, moodEmoji).run();

  const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?')
    .bind(result.meta.last_row_id).first();
  return Response.json(mapPost(post), { status: 201 });
}
