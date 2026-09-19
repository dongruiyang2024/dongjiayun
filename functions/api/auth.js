import { hasAdminKey } from './_shared.js';

export async function onRequestPost({ request, env }) {
  if (!hasAdminKey(env)) {
    return Response.json({ error: '管理员登录尚未配置' }, { status: 503 });
  }
  try {
    const { key } = await request.json();
    if (key && key === env.ADMIN_KEY) {
      return Response.json({ success: true });
    }
    return Response.json({ error: '密钥错误' }, { status: 401 });
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 });
  }
}
