const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

function adminHeaders(key) {
  return key ? { Authorization: `Bearer ${key}` } : {};
}

function jsonBody(data, key) {
  return {
    headers: { 'Content-Type': 'application/json', ...adminHeaders(key) },
    body: JSON.stringify(data),
  };
}

export const api = {
  posts: {
    list: () => req('/posts'),
    get: (id) => req(`/posts/${id}`),
    create: (data, key) => req('/posts', { method: 'POST', ...jsonBody(data, key) }),
    update: (id, data, key) => req(`/posts/${id}`, { method: 'PUT', ...jsonBody(data, key) }),
    delete: (id, key) => req(`/posts/${id}`, { method: 'DELETE', headers: adminHeaders(key) }),
  },
  comments: {
    list: (pageId) => req(`/comments?pageId=${encodeURIComponent(pageId)}`),
    create: (data) => req('/comments', { method: 'POST', ...jsonBody(data) }),
    delete: (id, key) => req(`/comments/${id}`, { method: 'DELETE', headers: adminHeaders(key) }),
  },
  milestones: {
    list: () => req('/milestones'),
    create: (data, key) => req('/milestones', { method: 'POST', ...jsonBody(data, key) }),
    delete: (id, key) => req(`/milestones/${id}`, { method: 'DELETE', headers: adminHeaders(key) }),
  },
  auth: (key) => req('/auth', { method: 'POST', ...jsonBody({ key }) }),
  setup: (key) => req('/setup', { method: 'POST', headers: adminHeaders(key) }),
};
