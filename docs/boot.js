import {runQueue,downloadWithRetry} from './preload-core.js';
import {configurePreload,assetStage} from './loading-policy.js';
import {settleWithin} from './load-budget.js';
const root=document.documentElement,screen=document.getElementById('site-preloader');
const bar=screen.querySelector('[role="progressbar"]'),fill=bar.firstElementChild;
const errorBox=document.getElementById('preload-error'),message=document.getElementById('preload-message');
const skip=document.getElementById('preload-continue');
let entering=null,finished=false,moduleReady=false;
const optional=new AbortController(),loaded=new Map();
const assets=JSON.parse(document.getElementById('preload-assets').textContent).assets;
const critical=assets.filter(a=>assetStage(a.url)==='cover');
configurePreload(assets);
const total=critical.reduce((n,a)=>n+a.size,0)||1;
function paint(done=false){
 if(finished&&!done)return;
 const received=critical.reduce((n,a)=>n+Math.min(a.size,loaded.get(a.url)||0),0);
 const progress=done?100:Math.min(95,Math.round(5+(moduleReady?30:0)+received/total*60));
 fill.style.transform='scaleX('+progress/100+')';bar.setAttribute('aria-valuenow',progress);screen.dataset.progress=progress;
}
function help(text){if(finished)return;errorBox.hidden=false;message.textContent=text;screen.setAttribute('aria-busy','false');}
document.getElementById('reader-shell').inert=true;
document.getElementById('final-chapter').inert=true;
document.getElementById('preload-retry').onclick=()=>location.reload();
skip.hidden=false;
const app=import('./dialogue.js');
app.then(()=>{moduleReady=true;paint();},()=>help('页面连接暂时中断，请重试。'));
const hint=setTimeout(()=>help('正在准备开场，可以先进入。'),5000);
async function enter(){
 if(entering)return entering;
 optional.abort();
 entering=(async()=>{
  try{
   const reader=await settleWithin(app,25000);
   if(!reader)throw Error('The page code did not arrive');
   await reader.startReader();
   finished=true;clearTimeout(hint);clearTimeout(window.__bootWatchdog);
   paint(true);root.classList.replace('site-booting','site-revealing');screen.classList.add('preload-leaving');
   await new Promise(resolve=>setTimeout(resolve,260));
   screen.remove();root.classList.remove('site-revealing');
   document.getElementById('reader-shell').inert=false;document.getElementById('final-chapter').inert=false;
   window.dispatchEvent(new Event('site-ready'));
  }catch(error){entering=null;help('页面暂时未能连接，请点重试。');console.warn('Opening unavailable:',error.message);}
 })();
 return entering;
}
skip.onclick=()=>{help('正在打开页面…');enter();};
paint();
const downloads=runQueue(critical,async item=>{
 if(optional.signal.aborted)return;
 await downloadWithRetry(item,{attempts:1,timeout:4500,signal:optional.signal,onProgress:n=>{loaded.set(item.url,n);paint();}});
},3);
settleWithin(downloads,4500).then(enter);
