import { checkAdmin } from './_shared.js';
import { defaultGarden, validGarden } from './_garden.js';

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare('SELECT content FROM garden WHERE id = 1').first();
  return Response.json(row ? JSON.parse(row.content) : defaultGarden);
}

export async function onRequestPut({ request, env }) {
  if (!checkAdmin(request, env)) return Response.json({ error: '未授权' }, { status: 401 });
  let data;
  try { data = await request.json(); } catch { return Response.json({ error: '请求格式错误' }, { status: 400 }); }
  if (!validGarden(data)) return Response.json({ error: '请检查学年、项目、日期和图片地址；图片需使用 HTTPS 链接' }, { status: 400 });
  await env.DB.prepare('INSERT INTO garden (id, content) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET content = excluded.content').bind(JSON.stringify(data)).run();
  return Response.json(data);
}
