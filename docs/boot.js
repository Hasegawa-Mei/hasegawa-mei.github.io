import {runQueue,downloadAsset,progressRatio} from './preload-core.js';
import {rememberBytes,prepareImage} from './resource-cache.js';

const root=document.documentElement,screen=document.getElementById('site-preloader');
const bar=screen.querySelector('[role="progressbar"]'),fill=bar.firstElementChild,errorBox=document.getElementById('preload-error');
const loaded=new Map(),complete=new Set(),prepared=new Set();let assets=[],tasks=[],app,busy=false,frame=0,started=false;
const waitFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
function paint(){
 frame=0;const value=progressRatio(assets,loaded,prepared.size,tasks.length,started),percent=Math.round(value*100);
 fill.style.transform='scaleX('+value+')';bar.setAttribute('aria-valuenow',percent);screen.dataset.progress=percent;
}
function changed(){if(!frame)frame=requestAnimationFrame(paint);}
async function plan(){
 if(!assets.length){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);try{const response=await fetch('./preload-manifest.json',{cache:'no-cache',signal:controller.signal});if(!response.ok)throw Error('Manifest unavailable');({assets}=await response.json());}finally{clearTimeout(timer);}}
}
async function prepare(){
 if(!tasks.length){
  const [models,music,cards,prologue,hand,chapters]=await Promise.all([
   import('./model-library.js'),import('./music.js'),import('./identity-card.js'),import('./prologue.js'),import('./ritual-hand.js'),import('./chapter-transit.js')
  ]);
  const imageTasks=assets.filter(a=>/\.(png|webp|jpe?g|svg)$/.test(a.url)).map(a=>[a.url,()=>prepareImage(a.url,a.url.includes('/identity-studies/'))]);
  tasks=[['fonts',async()=>{if(document.fonts){await Promise.all([...document.fonts].map(font=>font.load()));await document.fonts.ready;}}],...imageTasks,...['tutorial','boundary','public','power','privacy','alienation','alienation-two','violence'].map(id=>['model:'+id,()=>models.prepareStudy(id)]),
   ...Object.keys(music.tracks).map(id=>['music:'+id,async()=>{if(!await music.preloadMusic(id))throw Error('Music could not decode');}]),
   ['cards',()=>cards.prepareCardFace()],['bell',()=>chapters.prepareEpilogue()],
   ['hand',()=>hand.prepareHandDetector().catch(()=>null)],
   ['prologue',()=>prologue.preparePrologue()],
   ['graphics',async()=>{app=await import('./dialogue.js');await app.prepareReaderGraphics();}],
   ['finale',()=>import('./finale.js')],['duel',async()=>{const duel=await import('./duel.js');await duel.prepareDuelGraphics();}]
  ];
 }
 // Image decoding, models and audio are kept sequential here to avoid a CPU spike.
 for(const [name,job] of tasks){if(prepared.has(name))continue;await job();prepared.add(name);changed();await waitFrame();}
}
async function reveal(){
 app??=await import('./dialogue.js');await app.startReader();started=true;paint();await waitFrame();await waitFrame();
 root.classList.replace('site-booting','site-revealing');screen.classList.add('preload-leaving');
 await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion:reduce)').matches?0:260));
 screen.remove();root.classList.remove('site-revealing');document.getElementById('reader-shell').inert=false;document.getElementById('final-chapter').inert=false;
 window.dispatchEvent(new Event('site-ready'));
}
async function run(){
 if(busy)return;busy=true;errorBox.hidden=true;screen.setAttribute('aria-busy','true');
 try{
  await plan();screen.dataset.phase='download';
  const failures=await runQueue(assets.filter(a=>!complete.has(a.url)),async item=>{
   const data=await downloadAsset(item,{onProgress:n=>{loaded.set(item.url,n);changed();}});
   if(data)rememberBytes(item.url,data);complete.add(item.url);
  },5,{stopOnError:true});
  if(failures.length)throw Error(failures.length+' resources unavailable');
  screen.dataset.phase='prepare';await prepare();await reveal();
 }catch(error){console.warn('Preparation paused:',error.message);errorBox.hidden=false;screen.dataset.phase='retry';screen.setAttribute('aria-busy','false');document.getElementById('preload-retry').focus();}
 finally{busy=false;}
}
document.getElementById('reader-shell').inert=true;document.getElementById('final-chapter').inert=true;
document.getElementById('preload-retry').onclick=run;
document.getElementById('preload-continue').onclick=async()=>{if(busy)return;busy=true;try{await reveal();}catch{errorBox.hidden=false;busy=false;}};
run();
