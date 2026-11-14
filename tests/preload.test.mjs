import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {downloadAsset,downloadWithRetry,runQueue,progressRatio} from '../docs/preload-core.js';

test('a transient connection failure retries and completes the same asset',async()=>{
 let calls=0;const waits=[];
 const data=await downloadWithRetry({url:'./film.mp4',size:3},{delay:async ms=>waits.push(ms),fetcher:async()=>{calls++;if(calls===1)throw new TypeError('Failed to fetch');return new Response(new Uint8Array([1,2,3]));}});
 assert.equal(calls,2);assert.deepEqual(waits,[800]);assert.deepEqual([...new Uint8Array(data)],[1,2,3]);
});

test('missing assets fail without retries while network retries remain bounded',async()=>{
 let calls=0;
 await assert.rejects(downloadWithRetry({url:'./missing.png',size:1},{delay:async()=>{},fetcher:async()=>{calls++;return new Response('',{status:404});}}),/HTTP 404/);
 assert.equal(calls,1);calls=0;
 await assert.rejects(downloadWithRetry({url:'./film.mp4',size:1},{delay:async()=>{},fetcher:async()=>{calls++;throw new DOMException('Offline','AbortError');}}),/Offline/);
 assert.equal(calls,3);
});
test('download progress follows bytes and keeps video data for playback',async()=>{
 const received=[];const data=await downloadAsset({url:'./film.mp4',size:5},{onProgress:n=>received.push(n),fetcher:async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array([1,2]));c.enqueue(new Uint8Array([3,4,5]));c.close();}}))});
 assert.deepEqual([...new Uint8Array(data)],[1,2,3,4,5]);assert.deepEqual(received,[2,5,5]);
});
test('a failed file does not stop other downloads and can be retried',async()=>{
 const completed=[];const jobs=[1,2,3],failures=await runQueue(jobs,async x=>{if(x===2)throw Error('offline');completed.push(x);},2);
 assert.deepEqual(completed.sort(),[1,3]);assert.equal(failures[0].item,2);
 const retried=await runQueue(failures.map(x=>x.item),async x=>completed.push(x));assert.equal(retried.length,0);assert.deepEqual(completed.sort(),jobs);
});
test('progress stays below complete until media preparation and app startup finish',()=>{
 const assets=[{url:'film',size:100}],loaded=new Map([['film',100]]);
 assert.equal(progressRatio(assets,loaded,0,10),.84);assert.equal(progressRatio(assets,loaded,10,10),.99);assert.equal(progressRatio(assets,loaded,10,10,true),1);
});
test('connection failures can stop the queue promptly instead of timing out every file',async()=>{
 const attempted=[];const failed=await runQueue([1,2,3,4],async n=>{attempted.push(n);throw Error('connection timed out');},1,{stopOnError:true});assert.deepEqual(attempted,[1]);assert.equal(failed.length,1);
});
test('manifest covers the four scores, film, all study models and hand runtime',async()=>{
 const {assets}=JSON.parse(await readFile(new URL('../docs/preload-manifest.json',import.meta.url)));
 const expected=['ordinary','prologue','finale','endgame'].map(x=>'./assets/music/'+x+'.mp3');expected.push('./assets/prologue/prologue-montage-wide.mp4','./vendor/hand/hand_landmarker.task','./vendor/hand/wasm/vision_wasm_internal.wasm','./vendor/hand/wasm/vision_wasm_nosimd_internal.wasm');
 for(const url of expected)assert.ok(assets.some(x=>x.url===url),url);
 assert.equal(new Set(assets.map(x=>x.url)).size,assets.length);
 for(const asset of assets)assert.equal((await stat(new URL('../docs/'+asset.url.slice(2),import.meta.url))).size,asset.size,asset.url);
 const index=await readFile(new URL('../docs/index.html',import.meta.url),'utf8');
 const embedded=index.match(/<script id="preload-assets" type="application\/json">([\s\S]*?)<\/script>/);
 assert.ok(embedded,'the first load must not depend on a separate manifest request');
 assert.deepEqual(JSON.parse(embedded[1]).assets,assets);
});
