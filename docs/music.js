import {assetBytes} from './resource-cache.js';
// Every repeat and scene change leaves a quiet beat between musical phrases.
export const tracks={
 ambient:{file:'ordinary.mp3',level:.42,end:57.5,start:0},
 prologue:{file:'prologue.mp3',level:.58},
 finale:{file:'finale.mp3',level:.48,end:61,start:0},
 endgame:{file:'endgame.mp3',level:.58,end:76.8,start:5}
};
const GAP=1,LOOP_FADE=1.6;
let context,master,button,mode='ambient',serial=0,unlocked=false,enabled=true,sequence=null;
let readyAt=0,readyWall=0,prologueTime=0,prologueRunning=false,lastSync=0;
const buffers=new Map(),voices=new Set();
// Each visit starts with music enabled. A manual mute lasts for this visit.
export function musicEnabled(){return enabled;}
export function musicReadyIn(){return Math.max(0,(readyWall-performance.now())/1000);}
function activeVoice(){const now=context?.currentTime??0;return [...voices].find(v=>!v.stopping&&v.name===mode&&v.started<=now&&v.ends>now);}
function updateControl(){
 if(!button)return;
 const running=enabled&&unlocked&&context?.state==='running';
 button.textContent=!enabled?'♫ 音乐已关':running?'♫ 音乐已开':'♫ 音乐待播放';
 button.setAttribute('aria-pressed',String(enabled));
 button.setAttribute('aria-label',!enabled?'开启背景音乐':running?'关闭背景音乐':'音乐已开启，等待页面互动；点击关闭');
 button.dataset.track=mode;button.dataset.playing=String(!!activeVoice()&&running);
}
function audioContext(){
 if(context)return context;
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;
 context=new Audio();master=context.createGain();master.gain.value=enabled?1:0;master.connect(context.destination);
 context.onstatechange=updateControl;return context;
}
export async function preloadMusic(name){
 const ctx=audioContext(),spec=tracks[name];if(!ctx||!spec)return null;
 if(!buffers.has(name))buffers.set(name,assetBytes('./assets/music/'+spec.file).then(bytes=>ctx.decodeAudioData(bytes)).catch(()=>{buffers.delete(name);return null;}));
 return buffers.get(name);
}
function levelAt(v,now){
 if(v.ramp){const p=v.ramp,u=Math.max(0,Math.min(1,(now-p.time)/Math.max(.001,p.duration)));return p.from*(1-u);}
 return v.level*Math.max(0,Math.min(1,(now-v.started)/Math.max(.001,v.fadeIn),(v.ends-now)/Math.max(.001,v.fadeOut)));
}
function stopVoice(v,seconds=.08){
 const now=context.currentTime;
 if(v.started>now){try{v.source.stop();}catch{}voices.delete(v);return;}
 if(v.stopping)return;
 v.stopping=true;const duration=Math.max(.01,Math.min(seconds,v.ends-now)),from=levelAt(v,now);
 v.gain.gain.cancelScheduledValues(now);v.gain.gain.setValueAtTime(from,now);v.gain.gain.linearRampToValueAtTime(0,now+duration);v.ramp={time:now,from,duration};
 try{v.source.stop(now+duration);}catch{}
}
function startVoice(name,buffer,when,offset,fadeIn,fadeOut=LOOP_FADE){
 const end=Math.min(tracks[name].end??buffer.duration,buffer.duration),duration=end-offset;if(duration<=0)return null;
 const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.connect(gain);gain.connect(master);
 const v={name,source,gain,started:when,ends:when+duration,offset,fadeIn:Math.min(fadeIn,duration/2),fadeOut:Math.min(fadeOut,duration/2),level:tracks[name].level,stopping:false};voices.add(v);
 gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(v.level,when+v.fadeIn);
 gain.gain.setValueAtTime(v.level,v.ends-v.fadeOut);gain.gain.linearRampToValueAtTime(0,v.ends);
 source.onended=()=>{source.disconnect();gain.disconnect();voices.delete(v);updateControl();};
 source.start(when,offset,duration);updateControl();return v;
}
function schedule(){
 if(!context||!unlocked||document.hidden)return;
 const s=sequence;if(!s||s.ticket!==serial||s.name!==mode)return;
 if(s.next<context.currentTime+1.5){
  const when=Math.max(s.next,context.currentTime),offset=s.introUsed?tracks[s.name].start:0;
  const v=startVoice(s.name,s.buffer,when,offset,s.introUsed?LOOP_FADE:s.fade);
  if(v){s.next=v.ends+GAP;s.introUsed=true;}
 }
 updateControl();
}
async function ensureTrack(fade=2){
 const ticket=serial,name=mode;if(!unlocked||!tracks[name]||document.hidden||document.documentElement?.classList.contains('site-booting')||document.documentElement?.classList.contains('site-revealing'))return;
 if(name==='prologue'&&!prologueRunning)return;
 if(sequence?.ticket===ticket||activeVoice())return;
 const buffer=await preloadMusic(name);
 if(!buffer||ticket!==serial||name!==mode||document.hidden||sequence?.ticket===ticket||activeVoice())return;
 if(name==='prologue'){
  if(!prologueRunning||prologueTime>=buffer.duration-.02||context.currentTime<readyAt)return;
  startVoice(name,buffer,context.currentTime,prologueTime,fade,.6);
 }else{
  sequence={ticket,name,buffer,next:Math.max(readyAt,context.currentTime),introUsed:false,fade};schedule();
 }
}
export function setMusic(name,{fade=2.4,out=1.8,gap=GAP}={}){
 if(mode===name){ensureTrack(fade);updateControl();return;}
 const now=context?.currentTime??0;
 const sounding=[...voices].filter(v=>v.started<=now&&v.ends>now);
 const remaining=sounding.length?Math.max(...sounding.map(v=>v.stopping?Math.max(0,v.ramp.time+v.ramp.duration-now):Math.min(out,v.ends-now))):0;
 mode=name;serial++;sequence=null;for(const v of voices)stopVoice(v,out);
 // The next piece starts only after the old one reaches zero and the quiet beat ends.
 const delay=remaining+(tracks[name]?gap:0);readyAt=now+delay;readyWall=performance.now()+delay*1000;
 if(name==='prologue'){prologueTime=0;prologueRunning=false;lastSync=0;}
 ensureTrack(fade);updateControl();
}
export function syncPrologue(time,running){
 if(mode!=='prologue')return;prologueTime=time;prologueRunning=running;
 const current=activeVoice();
 if(!running){if(current)stopVoice(current,.07);return;}
 if(!current){ensureTrack(.09);return;}
 if(!context||context.currentTime-lastSync<.35)return;lastSync=context.currentTime;
 const heard=current.offset+context.currentTime-current.started;
 if(Math.abs(heard-time)>.24){stopVoice(current,.07);ensureTrack(.09);}
}
async function unlock(){
 if(!enabled||document.hidden)return;
 try{const ctx=audioContext();if(!ctx)return;await ctx.resume();unlocked=ctx.state==='running';ensureTrack(2.5);updateControl();}catch{}
}
function init(){
 button=document.createElement('button');button.id='music-control';button.className='music-control';button.type='button';document.body.append(button);updateControl();
 button.onclick=async()=>{
  enabled=!enabled;
  if(context){master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(enabled?1:0,context.currentTime,.16);}
  if(enabled)await unlock();updateControl();
 };
 const gesture=e=>{if(e.target.closest?.('#music-control'))return;unlock();};
 document.addEventListener('pointerdown',gesture,{passive:true});document.addEventListener('keydown',gesture);document.addEventListener('click',gesture);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){context?.suspend().catch(()=>{});}else if(enabled){unlock();}});
 window.addEventListener('pagehide',()=>context?.suspend());
 window.addEventListener('pageshow',unlock);
 window.addEventListener('site-ready',()=>{readyAt=context?.currentTime??0;readyWall=performance.now();unlock();});
 setInterval(schedule,250);
 unlock();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
