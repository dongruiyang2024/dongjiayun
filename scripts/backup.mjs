import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const timestamp = new Date().toISOString().replaceAll(':', '-');
const output = `backups/dongjiayun-${timestamp}.sql`;
mkdirSync(new URL('../backups/', import.meta.url), { recursive: true });
const result = spawnSync(process.execPath, [
  fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url)),
  'd1', 'export', 'dongjiayun-db', '--remote', `--output=${output}`,
], { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
if (result.status === 0) console.log(`备份已保存：${output}`);
