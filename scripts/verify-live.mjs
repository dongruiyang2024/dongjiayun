import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const expectedScript = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8').match(/src="(\/assets\/[^" ]+\.js)"/)?.[1];

const hosts = ['https://dongjiayun.blog', 'https://dongjiayun.pages.dev'];
async function get(url) {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, `${url} returned ${response.status}`);
  return response;
}
let deployedScript;
for (const host of hosts) {
  for (const path of ['/', '/about', '/diary', '/growth', '/guestbook', '/admin', '/projects', '/projects/science-festival', '/pet']) {
    const html = await (await get(host + path)).text();
    assert.match(html, /<div id="root"><\/div>/, `${host}${path} is not the blog`);
    const script = html.match(/src="(\/assets\/[^" ]+\.js)"/)?.[1];
    assert.equal(script, expectedScript, `${host}${path} is not the latest local build`);
    assert.ok(script, `${host}${path} missing script`);
    deployedScript ??= script;
    assert.equal(script, deployedScript, `${host}${path} serves a different deployment`);
    console.log(`PASS ${host}${path}`);
  }
  await get(host + deployedScript);
  const garden = await (await get(host + '/api/garden')).json();
  assert.ok(garden.stages.some(stage => stage.label === '四年级'));
  assert.ok(garden.projects.some(project => project.id === 'science-festival'));
  console.log(`PASS ${host}/api/garden`);
  for (const path of ['/api/posts', '/api/milestones', '/api/comments?pageId=guestbook']) {
    const data = await (await get(host + path)).json();
    assert.ok(Array.isArray(data), `${host}${path} must return an array`);
    if (path === '/api/posts') assert.ok(data.some(post => post.title === '这个暑假，我解锁了三个新本领！🌻'), 'Summer recap is missing');
    if (path === '/api/milestones') for (const title of ['拿到舞蹈七级证书', '学会游泳', '英语口语有了很大进步']) assert.ok(data.some(item => item.title === title), `Missing milestone: ${title}`);
    if (path === '/api/posts' && data.length) {
      const detail = await (await get(`${host}/api/posts/${data[0].id}`)).json();
      assert.equal(detail.id, data[0].id);
      assert.equal(typeof detail.content, 'string');
      await get(`${host}/diary/${detail.id}`);
    }
    console.log(`PASS ${host}${path}`);
  }
}
console.log('正式域名和 Pages 域名的页面、部署版本和数据接口一致。');
