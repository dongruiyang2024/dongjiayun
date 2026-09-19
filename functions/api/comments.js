import { mapComment } from './_shared.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const pageId = url.searchParams.get('pageId');
  if (!pageId) return Response.json({ error: 'pageId 参数缺失' }, { status: 400 });

  const { results } = await env.DB.prepare(
    'SELECT * FROM comments WHERE page_id = ? ORDER BY created_at DESC'
  ).bind(pageId).all();
  return Response.json(results.map(mapComment));
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 });
  }

  const { pageId, name, avatar = '🐱', message } = body ?? {};

  if (typeof pageId !== 'string' || typeof name !== 'string' || typeof message !== 'string' || typeof avatar !== 'string' || !name.trim() || !message.trim()) {
    return Response.json({ error: '参数缺失' }, { status: 400 });
  }
  if (name.trim().length > 20 || message.trim().length > 500 || avatar.length > 32) {
    return Response.json({ error: '内容超出限制' }, { status: 400 });
  }

  if (pageId !== 'guestbook') {
    const match = /^post-([1-9]\d*)$/.exec(pageId);
    if (!match) return Response.json({ error: '留言页面无效' }, { status: 400 });
    const post = await env.DB.prepare('SELECT id FROM posts WHERE id = ?').bind(match[1]).first();
    if (!post) return Response.json({ error: '日记不存在' }, { status: 404 });
  }

  const result = await env.DB.prepare(
    'INSERT INTO comments (page_id, name, avatar, message) VALUES (?, ?, ?, ?)'
  ).bind(pageId, name.trim(), avatar, message.trim()).run();

  const comment = await env.DB.prepare('SELECT * FROM comments WHERE id = ?')
    .bind(result.meta.last_row_id).first();
  return Response.json(mapComment(comment), { status: 201 });
}
