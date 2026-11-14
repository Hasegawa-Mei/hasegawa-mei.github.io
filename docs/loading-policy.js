import {runQueue,downloadWithRetry} from './preload-core.js';
import {rememberBytes} from './resource-cache.js';
export const coverFiles=[
 'assets/opening/lighthouse-print.webp','assets/opening/disc.png',
 'assets/opening/blue-plates.webp','assets/opening/paper.webp',
 'assets/opening/helix.webp','assets/opening/type-underprint.webp',
 'assets/opening/wordmark.svg','assets/opening/orbital-type.svg','assets/opening/rays.svg'
];
export function assetStage(url){
 const file=url.replace(/^\.\//,'');
 if(coverFiles.includes(file))return 'cover';
 if(/^(assets\/(opening|standby|prologue|identity-studies)\/|assets\/music\/(ordinary|prologue)\.mp3$)/.test(file))return 'prologue';
 if(/^assets\/(models|chapter-plates|reader-print|tutorial|references)\//.test(file)||/^fonts\//.test(file))return 'chapters';
 if(/^assets\/(epilogue|game|identity|music|recap)\//.test(file))return 'finale';
 return 'on-demand';
}
let manifest=[],wanted=null,running=false,ready=false;
const completed=new Set();
export function configurePreload(assets){manifest=assets;}
async function warm(){
 if(running||!ready||!wanted||document.hidden)return;
 running=true;
 try{
  while(wanted&&!document.hidden){
   const stage=wanted;wanted=null;
   const items=manifest.filter(a=>assetStage(a.url)===stage&&!completed.has(a.url));
   // One background request at a time leaves bandwidth for navigation.
   for(const item of items){
    if(wanted||document.hidden)break;
    // Stream video in its own element; do not download the whole film twice.
    if(/\.mp4$/.test(item.url))continue;
    const failures=await runQueue([item],async asset=>{
     const data=await downloadWithRetry(asset,{attempts:1,timeout:12000,priority:'low'});
     if(data)rememberBytes(asset.url,data);completed.add(asset.url);
    },1);
    if(failures.length)break;
   }
  }
 }finally{running=false;}
}
export function warmStage(stage){wanted=stage;if(ready)setTimeout(warm,350);}
if(typeof window!=='undefined'){
 window.addEventListener('site-ready',()=>{ready=true;setTimeout(warm,350);},{once:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)warm();});
}
