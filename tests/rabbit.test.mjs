import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rabbitRoutine, routeTo, walkable } from '../src/lib/rabbit/routine.js';
test('routine follows local dawn, daytime, dusk and night',()=>{
  const at=(hour)=>rabbitRoutine(new Date(2026,8,13,hour));
  assert.equal(at(6).key,'active');assert.equal(at(12).key,'rest');assert.equal(at(18).key,'active');assert.equal(at(23).key,'quiet');assert.equal(at(23).night,true);
});
test('rabbit navigates around shelter and bowls instead of crossing them',()=>{
  for(const end of [{x:1.65,z:1.4},{x:2.65,z:.35},{x:-1.4,z:-.6}]){
    const route=routeTo({x:-.5,z:.1},end);assert.ok(route.length);assert.ok(route.every(p=>walkable(p.x,p.z)));
  }
  assert.equal(walkable(-2.7,-1.65),false);assert.equal(walkable(1.65,.7),false);
  assert.deepEqual(routeTo({x:0,z:0},{x:20,z:20}),[]);
});
