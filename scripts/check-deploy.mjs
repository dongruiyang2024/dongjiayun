import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
const db = config.d1_databases?.find((item) => item.binding === 'DB');
if (!db || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(db.database_id)) {
  throw new Error('请先创建或选择 D1 数据库，并在 wrangler.json 中填写真实 database_id。');
}
