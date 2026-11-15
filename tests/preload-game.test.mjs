import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,jump,stepRun,mountLoadingGame} from '../docs/preload-game.js';
import {renderQuality} from '../docs/render-quality.js';
test('runner can jump an obstacle, cannot jump in midair, and stops after collision',()=>{
 const run=newRun();run.x=130;jump(run);assert.equal(jump(run),false);
 for(let i=0;i<50;i++)stepRun(run,.02);
 assert.equal(run.over,false);assert.equal(run.score,1);
 run.x=85;run.y=0;run.velocity=0;stepRun(run,.04);assert.equal(run.over,true);const stopped={...run};stepRun(run,.04);assert.deepEqual(run,stopped);
});
test('loading game draws once while idle, pauses hidden and releases animation and handlers',()=>{
 const handlers={},listeners={},queued=new Map();let id=0;
 const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
 const canvas={getContext:()=>ctx},button={addEventListener:(n,f)=>handlers[n]=f,removeEventListener:n=>delete handlers[n]},label={};
 const doc={hidden:false,getElementById:id=>({'preload-game':button,'preload-canvas':canvas,'preload-game-hint':label}[id]),addEventListener:(n,f)=>listeners[n]=f,removeEventListener:n=>delete listeners[n]};
 const win={requestAnimationFrame:f=>{queued.set(++id,f);return id;},cancelAnimationFrame:id=>queued.delete(id)};
 const dispose=mountLoadingGame(doc,win);assert.equal(queued.size,0);handlers.click();assert.equal(queued.size,1);
 doc.hidden=true;listeners.visibilitychange();assert.equal(queued.size,0);doc.hidden=false;listeners.visibilitychange();assert.equal(queued.size,1);
 dispose();assert.equal(queued.size,0);assert.deepEqual(handlers,{});assert.deepEqual(listeners,{});
});
test('small and low-memory devices get bounded pixels and lighter shadows',()=>{
 const small=renderQuality({devicePixelRatio:3,matchMedia:()=>({matches:true})});assert.equal(small.pixelRatio,1);assert.equal(small.shadow,1024);assert.equal(small.samples,0);assert.equal(small.interval,1000/30);
 const desk=renderQuality({devicePixelRatio:2,matchMedia:()=>({matches:false}),navigator:{deviceMemory:16}});assert.equal(desk.pixelRatio,1.35);assert.equal(desk.shadow,2048);
});
