import { checkAdmin } from './_shared.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM milestones ORDER BY sort_order ASC, created_at DESC'
  ).all();
  return Response.json(results);
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

  const { date, icon = '⭐', title, desc = '', sort_order = 0 } = body;

  if (!date || !title) {
    return Response.json({ error: '日期和标题为必填项' }, { status: 400 });
  }

  const result = await env.DB.prepare(
    'INSERT INTO milestones (date, icon, title, desc, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).bind(date, icon, title, desc, sort_order).run();

  const milestone = await env.DB.prepare('SELECT * FROM milestones WHERE id = ?')
    .bind(result.meta.last_row_id).first();
  return Response.json(milestone, { status: 201 });
}
