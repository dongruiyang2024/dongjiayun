import assert from 'node:assert/strict';
import { test } from 'node:test';
import { currentStage, defaultGarden, validGarden } from '../functions/api/_garden.js';

test('school-year transitions preserve history and do not activate future stages early', () => {
  const stages = [...defaultGarden.stages, { id: 'next', start: '2027-09-01', label: '五年级', theme: '' }];
  assert.equal(currentStage(stages, '2026-08-31').label, '三年级');
  assert.equal(currentStage(stages, '2026-09-01').label, '四年级');
  assert.equal(currentStage(stages, '2027-09-01').label, '五年级');
  assert.equal(currentStage(stages, '2024-01-01'), undefined);
});

test('garden validation rejects invalid references, dates and unsafe image schemes', () => {
  assert.equal(validGarden(defaultGarden), true);
  for (const patch of [{ stageId: 'missing' }, { image: 'javascript:alert(1)' }, { notes: [{ date: '2026-02-30', title: 'test', body: '' }] }]) {
    assert.equal(validGarden({ ...defaultGarden, projects: [{ ...defaultGarden.projects[0], ...patch }] }), false);
  }
  assert.equal(validGarden({ ...defaultGarden, projects: [null] }), false);
  assert.equal(validGarden({ ...defaultGarden, projects: [] }), true);
});
