import {Window} from 'happy-dom';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const window=new Window({url:'https://hasegawa-mei.github.io/',settings:{disableCSSFileLoading:true,disableComputedStyleRendering:true,enableJavaScriptEvaluation:false}});
window.document.write(await readFile('docs/index.html','utf8'));
for(const name of ['window','document','location','history','localStorage','sessionStorage','Image','ResizeObserver','HTMLElement','Element','Event','CustomEvent','getComputedStyle','matchMedia','innerWidth','innerHeight','devicePixelRatio','navigator','requestAnimationFrame','cancelAnimationFrame']){
 const value=name==='window'?window:window[name];Object.defineProperty(globalThis,name,{value:typeof value==='function'&&!/^[A-Z]/.test(name)?value.bind(window):value,configurable:true});
}
const intervals=[],nativeInterval=globalThis.setInterval;
globalThis.setInterval=(...args)=>{const timer=nativeInterval(...args);intervals.push(timer);return timer;};
const entry=window.document.querySelector('script[type="module"]').getAttribute('src');
const nativeTimeout=globalThis.setTimeout,timers=[];
globalThis.setTimeout=(...args)=>{const timer=nativeTimeout(...args);timers.push(timer);return timer;};
globalThis.fetch=async url=>{const asset=new URL(url,pathToFileURL(path.resolve('docs')+path.sep));try{return new Response(await readFile(asset));}catch{return new Response('',{status:404});}};
try{
 const ready=new Promise(resolve=>window.addEventListener('site-ready',resolve,{once:true}));
 await import(pathToFileURL(path.resolve('docs',entry)).href);
 await Promise.race([ready,new Promise((resolve,reject)=>setTimeout(()=>reject(Error('Published HTML never became ready')),7000))]);
 if(document.documentElement.classList.contains('site-booting')||document.getElementById('reader-shell').inert||document.body.dataset.topic!=='cover')throw Error('Cover is not usable');
 console.log('Actual published entry reached the cover and restored its controls:',entry);
}catch(error){console.error(error.stack);process.exitCode=1;}
finally{intervals.forEach(clearInterval);timers.forEach(clearTimeout);await window.happyDOM.abort();window.close();}
