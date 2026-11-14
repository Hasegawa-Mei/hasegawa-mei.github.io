import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {settleWithin} from '../docs/load-budget.js';
import {assetStage,coverFiles} from '../docs/loading-policy.js';
import {downloadAsset} from '../docs/preload-core.js';

test('opening is small and excludes music, film, camera and later scenes',async()=>{
 const {assets}=JSON.parse(await readFile(new URL('../docs/preload-manifest.json',import.meta.url)));
 const cover=assets.filter(a=>assetStage(a.url)==='cover');
 assert.equal(cover.length,coverFiles.length);
 assert.ok(cover.reduce((n,a)=>n+a.size,0)<1.5*1024*1024);
 for(const name of ['assets/music/finale.mp3','assets/prologue/prologue-montage-wide.mp4','vendor/hand/hand_landmarker.task','assets/models/THRONE.glb'])assert.notEqual(assetStage(name),'cover');
});
test('a stalled or rejected optional decode always releases its caller',async()=>{
 assert.equal(await settleWithin(new Promise(()=>{}),5,'continue'),'continue');
 assert.equal(await settleWithin(Promise.reject(Error('decode failed')),5,false),false);
 assert.equal(await settleWithin(Promise.resolve('ready'),500),'ready');
});
test('skip aborts a download that has not received any bytes',async()=>{
 const cancel=new AbortController();let aborted=false;
 const request=downloadAsset({url:'image.webp',size:20},{signal:cancel.signal,fetcher:(_,o)=>new Promise((resolve,reject)=>o.signal.addEventListener('abort',()=>{aborted=true;reject(new DOMException('Aborted','AbortError'));}))});
 cancel.abort();await assert.rejects(request,/Aborted/);assert.equal(aborted,true);
});
async function bootFixture(clickSkip){
 const elements=new Map();
 const classes=new Set(['site-booting']);
 const root={classList:{replace(a,b){classes.delete(a);classes.add(b);},remove(a){classes.delete(a);}}};
 function element(id){if(!elements.has(id))elements.set(id,{hidden:true,inert:false,textContent:'',style:{},dataset:{},classList:{add(){}},attributes:{},setAttribute(k,v){this.attributes[k]=v;},remove(){this.removed=true;}});return elements.get(id);}
 element('preload-assets').textContent=JSON.stringify({assets:[{url:'./assets/opening/paper.webp',size:10}]});
 const bar=element('bar');bar.firstElementChild=element('fill');element('site-preloader').querySelector=()=>bar;
 let starts=0,events=0;const timers=new Set();
 const context={document:{documentElement:root,getElementById:element},window:{dispatchEvent(){events++;}},location:{reload(){}},console,AbortController,Event,
  setTimeout(fn,ms){const t=setTimeout(()=>{timers.delete(t);fn();},Math.min(ms,25));timers.add(t);return t;},clearTimeout(t){clearTimeout(t);timers.delete(t);},
  settleWithin:(p,ms,f)=>settleWithin(p,Math.min(ms,25),f),configurePreload(){},assetStage,
  runQueue:()=>new Promise(()=>{}),downloadWithRetry:()=>new Promise(()=>{}),
  loadReader:async()=>({startReader:async()=>{starts++;}})};
 let source=await readFile(new URL('../docs/boot.js',import.meta.url),'utf8');
 source=source.replace(/^import .*;\r?\n/gm,'').replace("import('./dialogue.js')",'loadReader()');
 vm.runInNewContext(source,context);
 if(clickSkip){element('preload-continue').onclick();element('preload-continue').onclick();}
 await new Promise(resolve=>setTimeout(resolve,100));
 timers.forEach(clearTimeout);
 assert.equal(starts,1);assert.equal(events,1);assert.equal(element('reader-shell').inert,false);
 assert.equal(element('site-preloader').removed,true);assert.equal(classes.has('site-booting'),false);
 assert.equal(bar.attributes['aria-valuenow'],100);
}
test('automatic startup continues when all optional downloads hang',()=>bootFixture(false));
test('clicking skip during a busy download enters once and restores controls',()=>bootFixture(true));

test('gate restores controls when both image decoding and animation completion hang',async()=>{
 let swaps=0,canceled=0;
 const classes=new Set();
 const node=()=>({style:{},hidden:false,children:[],classList:{add(...xs){xs.forEach(x=>classes.add(x));},remove(...xs){xs.forEach(x=>classes.delete(x));},toggle(x,on){on?classes.add(x):classes.delete(x);}},
  animate(){return{finished:new Promise(()=>{}),cancel(){canceled++;},finish(){}};},appendChild(x){return x;},remove(){this.removed=true;},focus(){},getBoundingClientRect(){return{left:50,top:50,width:10,height:10};}});
 const shell={inert:false},sheet=node(),fields=node(),plates=[node(),node(),node()],caption=node(),core=node();
 fields.children=[node(),node()];plates.forEach(p=>p.decode=()=>new Promise(()=>{}));
 sheet.querySelector=s=>s==='.gate-fields'?fields:node();sheet.querySelectorAll=()=>plates;sheet.clientHeight=600;
 const document={hidden:false,body:{append(){}},getElementById:id=>({'reader-shell':shell,'start-sheet':sheet,'start-caption':caption,'start-core':core}[id]),querySelector:()=>node(),createElement:node,addEventListener(){},removeEventListener(){}};
 const context={document,innerWidth:1000,innerHeight:600,matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}}),settleWithin:(p,ms,f)=>settleWithin(p,5,f)};
 const source=(await readFile(new URL('../docs/gate-entrance.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'').replace('export async function','async function');
 const assemble=vm.runInNewContext(source+'\nassembleStartGate',context);
 await assemble(async()=>{swaps++;});
 assert.equal(swaps,1);assert.equal(shell.inert,false);assert.equal(classes.size,0);assert.ok(canceled>=3);
});
