import test from 'node:test';import assert from 'node:assert/strict';
import {visitRange,countryLabel} from '../lib/landing-visit-filters';
const now=new Date('2026-09-14T02:00:00.000Z');
test('24h is a rolling window',()=>assert.deepEqual(visitRange('24h',now),{since:'2026-09-13T02:00:00.000Z',until:now.toISOString()}));
test('yesterday uses Sao Paulo calendar',()=>assert.deepEqual(visitRange('yesterday',now),{since:'2026-09-12T03:00:00.000Z',until:'2026-09-13T03:00:00.000Z'}));
test('7 and 30 days are rolling; total has no lower bound',()=>{assert.equal(visitRange('7d',now).since,'2026-09-07T02:00:00.000Z');assert.equal(visitRange('30d',now).since,'2026-08-15T02:00:00.000Z');assert.equal(visitRange('all',now).since,null)});
test('country names and flags',()=>{assert.deepEqual(countryLabel('BR'),{name:'Brasil',flag:'🇧🇷'});assert.equal(countryLabel('PT').name,'Portugal');assert.equal(countryLabel(null).name,'País não identificado')});

