export async function onRequestPost({ request, env }) {
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
