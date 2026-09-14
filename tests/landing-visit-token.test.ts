import test from 'node:test';
import assert from 'node:assert/strict';
import {createVisitToken,validVisitToken} from '../lib/landing-visit-token';
process.env.SUPABASE_SERVICE_ROLE_KEY='test-only-secret';
test('accepts a valid page token and rejects expiration',()=>{const now=Date.now(),token=createVisitToken(now);assert.equal(validVisitToken(token,now),true);assert.equal(validVisitToken(token,now+3600001),false)});
test('rejects forged or malformed visit tokens',()=>{const now=Date.now(),token=createVisitToken(now);for(const invalid of [null,{},'',token+'x',token.slice(0,-1)+(token.endsWith('a')?'b':'a')])assert.equal(validVisitToken(invalid,now),false)});
test('tokens are tied to the server signing key',()=>{const now=Date.now(),token=createVisitToken(now);process.env.SUPABASE_SERVICE_ROLE_KEY='another-test-key';assert.equal(validVisitToken(token,now),false)});

