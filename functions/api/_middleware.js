const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  let response;
  try {
    if (!context.env.DB) {
      return Response.json({ error: '数据服务尚未配置，请稍后再试' }, { status: 503 });
    }
    response = await context.next();
  } catch (error) {
    console.error('API request failed:', error);
    response = Response.json({ error: '数据服务暂时不可用，请稍后再试' }, { status: 503 });
  }
  const newResponse = new Response(response.body, response);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => newResponse.headers.set(k, v));
  newResponse.headers.set('Cache-Control', 'no-store');
  return newResponse;
}
