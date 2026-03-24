import { checkAdmin, mapPost } from '../_shared.js';

export async function onRequestGet({ params, env }) {
  const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(params.id).first();
  if (!post) return Response.json({ error: '日记不存在' }, { status: 404 });
  return Response.json(mapPost(post));
}

export async function onRequestPut({ params, request, env }) {
  if (!checkAdmin(request, env)) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 });
  }

  const { title, emoji, excerpt, content, date, category, mood, moodEmoji } = body;

  if (!title || !content || !date) {
    return Response.json({ error: '标题、内容和日期为必填项' }, { status: 400 });
  }

  await env.DB.prepare(
    'UPDATE posts SET title=?, emoji=?, excerpt=?, content=?, date=?, category=?, mood=?, mood_emoji=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(title, emoji, excerpt, content, date, category, mood, moodEmoji, params.id).run();

  const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(params.id).first();
  if (!post) return Response.json({ error: '日记不存在' }, { status: 404 });
  return Response.json(mapPost(post));
}

export async function onRequestDelete({ params, request, env }) {
  if (!checkAdmin(request, env)) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(params.id).run();
  await env.DB.prepare('DELETE FROM comments WHERE page_id = ?').bind(`post-${params.id}`).run();
  return Response.json({ success: true });
}
