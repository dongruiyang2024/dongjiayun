import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const wrangler = join(root, 'node_modules/wrangler/bin/wrangler.js');

test('D1 persistence and administrator editing', { timeout: 120000 }, async (t) => {
  // Isolate both configuration and storage: this test never touches a real D1 database.
  const directory = mkdtempSync(join(tmpdir(), 'dongjiayun-test-'));
  for (const folder of ['dist', 'functions', 'migrations']) {
    cpSync(join(root, folder), join(directory, folder), { recursive: true });
  }
  const key = randomBytes(24).toString('hex');
  const config = JSON.parse(readFileSync(join(root, 'wrangler.json'), 'utf8'));
  config.d1_databases[0].database_id = '00000000-0000-4000-8000-000000000001';
  config.vars = { ADMIN_KEY: key };
  writeFileSync(join(directory, 'wrangler.json'), JSON.stringify(config));
  const env = { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: join(directory, 'wrangler.log') };
  const port = 18788;
  const base = `http://127.0.0.1:${port}`;
  let server;
  let browser;
  let output = '';
  const call = async (path, method = 'GET', body, admin = false) => {
    const response = await fetch(`${base}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(admin ? { Authorization: `Bearer ${key}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(10000),
    });
    return { status: response.status, data: await response.json() };
  };
  async function start() {
    output = '';
    server = spawn(process.execPath, [wrangler, 'pages', 'dev', 'dist', '--ip=127.0.0.1', `--port=${port}`, '--inspector-port=0'], {
      cwd: directory, env, stdio: ['ignore', 'pipe', 'pipe'],
    });
    server.stdout.on('data', (chunk) => { output += chunk; });
    server.stderr.on('data', (chunk) => { output += chunk; });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error(`Wrangler exited: ${output}`);
      if (output.includes(`127.0.0.1:${port}`)) {
        try { if ((await call('/posts')).status === 200) return; } catch { /* wait for readiness */ }
      }
      await delay(200);
    }
    throw new Error(`Wrangler did not start: ${output}`);
  }
  async function stop() {
    if (server && server.exitCode === null) {
      const exited = once(server, 'exit');
      server.kill('SIGTERM');
      await exited;
    }
    server = undefined;
  }
  try {
    const migration = spawnSync(process.execPath, [wrangler, 'd1', 'migrations', 'apply', 'dongjiayun-db', '--local'], {
      cwd: directory, env, encoding: 'utf8', timeout: 30000,
    });
    assert.equal(migration.status, 0, migration.stdout + migration.stderr);
    await start();
    assert.deepEqual((await call('/posts')).data, []);
    await t.test('unauthorized writes rejected, seed is optional and repeat-safe', async () => {
      assert.equal((await call('/posts', 'POST', { title: 'unauthorized' })).status, 401);
      assert.equal((await call('/setup', 'POST', undefined, true)).status, 200);
      assert.equal((await call('/setup', 'POST', undefined, true)).status, 409);
      assert.equal((await call('/posts')).data.length, 6);
    });
    const title = '持久化回归日记';
    const content = '保留这段原始正文。\n\n**加粗** <img src=x onerror="window.__unsafe=true">';
    const created = await call('/posts', 'POST', { title, content, date: '2026-09-13' }, true);
    assert.equal(created.status, 201);
    const id = created.data.id;
    await t.test('browser edits only the title without losing the existing body', async () => {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' });
      await page.getByPlaceholder('管理员密钥').fill(key);
      await page.getByRole('button', { name: '进入后台' }).click();
      await page.getByRole('row').filter({ hasText: title }).getByRole('button', { name: '编辑', exact: true }).click();
      const editor = page.getByPlaceholder('写下你的日记内容...');
      await editor.waitFor();
      assert.equal(await editor.inputValue(), content);
      await page.getByPlaceholder('日记标题').fill(`${title}已修改`);
      const saved = page.waitForResponse((response) => response.url().endsWith(`/api/posts/${id}`) && response.request().method() === 'PUT');
      await page.getByRole('button', { name: '保存修改' }).click();
      assert.equal((await saved).status(), 200);
      assert.equal((await call(`/posts/${id}`)).data.content, content);
      await page.goto(`${base}/diary/${id}`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: `${title}已修改`, exact: true }).waitFor();
      assert.equal(await page.locator('.post-body img').count(), 0);
      assert.equal(await page.locator('.post-body strong').textContent(), '加粗');
      await page.getByPlaceholder('你的名字 ✨').fill('本地访客');
      await page.locator('.comment-textarea').fill('这是一条持久化留言');
      await page.getByRole('button', { name: '发送留言 ✉️' }).click();
      await page.getByText('🎉 留言成功！谢谢你的留言～').waitFor();
      await page.close();
    });
    await t.test('growth archives and research projects are editable and persistent', async () => {
      const garden = (await call('/garden')).data;
      assert.equal(garden.stages.at(-1).label, '四年级');
      assert.equal((await call('/garden', 'PUT', garden)).status, 401);
      assert.equal((await call('/garden', 'PUT', { ...garden, stages: [] }, true)).status, 400);
      assert.equal((await call('/garden', 'PUT', { ...garden, projects: [null] }, true)).status, 400);
      const page = await browser.newPage();
      await page.goto(`${base}/admin`);
      await page.getByPlaceholder('管理员密钥').fill(key);
      await page.getByRole('button', { name: '进入后台' }).click();
      await page.getByRole('button', { name: '学年与探索项目' }).click();
      await page.getByLabel('我想研究的问题', { exact: true }).fill('哪种结构更稳固？');
      await page.getByRole('checkbox', { name: '完成节点 1', exact: true }).check();
      await page.getByRole('button', { name: '+ 写研究手记', exact: true }).click();
      await page.getByLabel('这次发现', { exact: true }).fill('第一次结构实验');
      await page.getByLabel('过程、问题与下一步', { exact: true }).fill('先比较两种结构，下一次调整底座。');
      await page.getByRole('button', { name: '保存成长档案', exact: true }).first().click();
      await page.getByRole('status').filter({ hasText: '已保存' }).waitFor();
      await page.goto(`${base}/projects/science-festival`);
      await page.getByRole('heading', { name: '哪种结构更稳固？' }).waitFor();
      assert.equal(await page.locator('.project-steps .done').count(), 1);
      await page.getByRole('heading', { name: '第一次结构实验' }).waitFor();
      assert.equal((await call('/garden')).data.projects[0].notes.length, 1);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 900 });
        for (const path of ['/', '/growth', '/projects', '/projects/science-festival', '/about', '/diary']) {
          await page.goto(`${base}${path}`);
          await page.locator('.nav').waitFor({ state: 'attached' });
          if (path === '/') await page.locator('.home-post-card').first().waitFor();
          if (path === '/projects/science-festival') await page.getByRole('heading', { name: '第一次结构实验' }).waitFor();
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} overflows at ${width}`);
          if (path === '/' || path === '/projects/science-festival') await page.screenshot({ path: join(root, `test-results/garden-${path === '/' ? 'home' : 'project'}-${width}.png`), fullPage: true });
        }
      }
      await page.close();
    });
    await t.test('data survives a server restart', async () => {
      await stop();
      await start();
      assert.equal((await call('/garden')).data.projects[0].question, '哪种结构更稳固？');
      assert.equal((await call(`/posts/${id}`)).data.title, `${title}已修改`);
      const messages = (await call(`/comments?pageId=post-${id}`)).data;
      assert.equal(messages.length, 1);
      assert.equal(messages[0].message, '这是一条持久化留言');
    });
    await t.test('invalid comments fail cleanly and deleted articles do not reappear as demo data', async () => {
      assert.equal((await call('/comments', 'POST', { pageId: 'guestbook', name: 123, message: 'test' })).status, 400);
      assert.equal((await call('/comments', 'POST', { pageId: 'post-999999', name: 'test', message: 'test' })).status, 404);
      assert.equal((await call(`/posts/${id}`, 'DELETE', undefined, true)).status, 200);
      assert.deepEqual((await call(`/comments?pageId=post-${id}`)).data, []);
      assert.equal((await call(`/posts/${id}`)).status, 404);
      await call('/posts/1', 'DELETE', undefined, true);
      const page = await browser.newPage();
      await page.goto(`${base}/diary/1`, { waitUntil: 'domcontentloaded' });
      await page.waitForURL(`${base}/diary`);
      await page.close();
    });
    await t.test('API outages show errors instead of static sample posts', async () => {
      const page = await browser.newPage();
      await page.route('**/api/posts', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: '测试服务不可用' }) }));
      await page.goto(`${base}/diary`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('alert').waitFor();
      assert.match(await page.getByRole('alert').textContent(), /测试服务不可用/);
      assert.equal(await page.locator('.diary-grid').count(), 0);
      await page.close();
    });
  } finally {
    if (browser) await browser.close();
    await stop();
    rmSync(directory, { recursive: true, force: true });
  }
});
