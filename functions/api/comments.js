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

  const { pageId, name, avatar = '🐱', message } = body;

  if (!pageId || !name?.trim() || !message?.trim()) {
    return Response.json({ error: '参数缺失' }, { status: 400 });
  }
  if (name.trim().length > 20 || message.trim().length > 500) {
    return Response.json({ error: '内容超出限制' }, { status: 400 });
  }

  const result = await env.DB.prepare(
    'INSERT INTO comments (page_id, name, avatar, message) VALUES (?, ?, ?, ?)'
  ).bind(pageId, name.trim(), avatar, message.trim()).run();

  const comment = await env.DB.prepare('SELECT * FROM comments WHERE id = ?')
    .bind(result.meta.last_row_id).first();
  return Response.json(mapComment(comment), { status: 201 });
}
