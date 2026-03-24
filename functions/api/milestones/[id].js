import { checkAdmin } from '../_shared.js';

export async function onRequestDelete({ params, request, env }) {
  if (!checkAdmin(request, env)) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  await env.DB.prepare('DELETE FROM milestones WHERE id = ?').bind(params.id).run();
  return Response.json({ success: true });
}
