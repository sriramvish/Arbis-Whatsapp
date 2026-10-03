import test from 'node:test'; import assert from 'node:assert/strict'; import { handler } from '../src/server.mjs';
test('API state is readable',async()=>{const req={method:'GET',url:'/api/state',headers:{}};const text=await new Promise(resolve=>handler(req,{writeHead(){},end:x=>resolve(x)}));assert.match(String(text),/bindings/)});
