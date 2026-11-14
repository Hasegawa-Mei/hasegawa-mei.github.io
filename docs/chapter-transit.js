import {assetBytes} from './resource-cache.js';
import {setMusic,preloadMusic,musicEnabled} from './music.js';
import {traceSort} from './unit-entrance.js';

const $=id=>document.getElementById(id);
const ease='cubic-bezier(.66,0,.19,1)';
const settle='cubic-bezier(.16,.78,.22,1)';
const ns='http://www.w3.org/2000/svg';
const ink=['#123ff2','#247bc2'];
function svgNode(tag,attrs){
  const el=document.createElementNS(ns,tag);
  Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,value));
  return el;
}
function layer(name){
  const el=document.createElement('div');el.className='chapter-transit '+name;
  el.setAttribute('aria-hidden','true');document.body.append(el);return el;
}
function motionScope(host){
  const animations=[],media=matchMedia('(prefers-reduced-motion:reduce)');
  let skipped=false;
  const skip=()=>{if(document.hidden||media.matches){skipped=true;animations.forEach(a=>{try{a.finish()}catch{}})}};
  document.addEventListener('visibilitychange',skip);media.addEventListener('change',skip);
  function run(el,frames,duration,delay=0,easing=settle){
    const a=el.animate(frames,{duration,delay,easing,fill:'both'});animations.push(a);
    if(skipped)a.finish();return a;
  }
  return {run,get skipped(){return skipped},pause:ms=>run(host,[],ms).finished,
    releaseWithin(root){animations.forEach(a=>{if(a.effect?.target&&root.contains(a.effect.target))a.cancel()})},
    dispose(){document.removeEventListener('visibilitychange',skip);media.removeEventListener('change',skip);animations.forEach(a=>a.cancel());host.remove()}};
}
function routes(selector='.poster-sort'){
  return [...document.querySelectorAll('#chapter-poster '+selector)].map(el=>el.getBoundingClientRect());
}
function fadeReading(motion){
  for(const el of [$('stage'),$('unit-front'),$('reading'),$('layer-nav'),$('scene-annotations'),$('scene-hotspot'),$('object-controls'),document.querySelector('#reader-shell footer')]){
    if(el&&!el.hidden)motion.run(el,[{opacity:1},{opacity:0}],110,0,'ease-out');
  }
}
function drawSorts(host,motion,{incoming=false,direction=1,delay=0}={}){
  const sorts=[...document.querySelectorAll('#chapter-poster .poster-sort')].map(sort=>traceSort(sort,host));
  sorts.forEach(({strokes},side)=>strokes.forEach(({path,branch,index})=>{
    const length=path.getTotalLength();path.style.strokeDasharray=length+' '+length;
    motion.run(path,incoming?[{strokeDashoffset:direction*length},{strokeDashoffset:0}]:[{strokeDashoffset:0},{strokeDashoffset:-direction*length}],
      branch?145:245,delay+(incoming?(branch?140:index*15):branch?0:36+index*12)+side*22,ease);
  }));
  return sorts;
}
function lugs(host,motion,incoming,direction,delay=0){
  document.querySelectorAll('#chapter-poster .poster-lugs').forEach((el,i)=>{
    const copy=el.cloneNode(true),r=el.getBoundingClientRect();
    Object.assign(copy.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',translate:'none',transformOrigin:direction>0?'50% 0':'50% 100%'});
    host.append(copy);
    motion.run(copy,incoming?[{transform:'scaleY(0)'},{transform:'scaleY(1)'}]:[{transform:'scaleY(1)'},{transform:'scaleY(0)'}],190,delay+i*25,ease);
  });
}
function passingPaths(host,motion,rects,direction,converge=false){
  const w=innerWidth,h=innerHeight,cx=w*.505,cy=h*.5;
  const svg=svgNode('svg',{viewBox:`0 0 ${w} ${h}`,class:'route-packets'});host.append(svg);
  rects.forEach((r,side)=>{
    [102,196,286].forEach((column,lane)=>{
      const x=r.left+column*r.width/356,width=r.width*75/356;
      const shift=(side?1:-1)*Math.min(w*.045,65),spacing=(lane-1)*width*1.1;
      const points=converge?[[x,-h*.10],[x,h*.21],[x+shift,h*.32],[x+shift,h*.39],[cx+(side?1:-1)*Math.min(w*.16,h*.24),cy-spacing],[cx,cy]]:
        [[x,-h*.5],[x,h*.16],[x+shift,h*.29],[x+shift,h*.43],[x,h*.56],[x,h*1.5]];
      if(direction<0)points.reverse();
      const path=svg.appendChild(svgNode('path',{d:points.map(([px,py],i)=>(i?'L':'M')+px+' '+py).join(' '),fill:'none',stroke:ink[side],'stroke-width':width,'stroke-linejoin':'miter'}));
      const length=path.getTotalLength(),tail=converge?length*.64:h*.42;
      path.style.strokeDasharray=tail+' '+(length+tail);
      motion.run(path,[{strokeDashoffset:tail},{strokeDashoffset:-length}],converge?530:490,converge?110+lane*22:135+lane*21,ease);
    });
  });
  return svg;
}
export async function travelChapters(direction,swap){
  const host=layer('folio-path-turn'),m=motionScope(host),html=document.documentElement;
  const opened=document.body.classList.contains('unit-open'),rects=routes();
  let outgoing=[];
  try{
    if(!opened){outgoing=drawSorts(host,m,{direction});lugs(host,m,false,direction)}
    document.body.classList.add('path-turn');fadeReading(m);
    m.run(document.querySelector('.poster-medallion'),[{opacity:opened?0:1},{opacity:0}],125);
    passingPaths(host,m,rects,direction);
    await m.pause(335);
    html.dataset.folioHidden='';
    await swap();
    // Cancel outgoing fades before revealing the very same model/UI elements.
    // Their visibility remains held until the arriving routes have settled.
    for(const el of [$('stage'),$('unit-front'),$('reading'),$('layer-nav'),$('scene-annotations'),$('scene-hotspot'),$('object-controls'),document.querySelector('#reader-shell footer'),document.querySelector('.poster-medallion')]){
      el?.getAnimations().forEach(a=>a.cancel());
    }
    outgoing.forEach(o=>o.svg.remove());
    drawSorts(host,m,{incoming:true,direction,delay:110});lugs(host,m,true,direction,95);
    m.run(document.querySelector('.poster-medallion'),[{opacity:0},{opacity:1}],240,195);
    await m.pause(450);
    document.body.classList.remove('path-turn');host.style.visibility='hidden';
    delete html.dataset.folioHidden;
    m.run($('stage'),[{opacity:0,transform:`translateY(${direction*10}px) scale(.99)`},{opacity:1,transform:'none'}],330);
    m.run($('begin-unit'),[{opacity:0},{opacity:1}],220,130);
    m.run(document.querySelector('.unit-wordmark'),[
      {opacity:0,clipPath:'polygon(0 0,0 0,0 100%,0 100%)',transform:`translateY(${direction*8}px)`},
      {opacity:1,clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)',transform:'none'}
    ],330,35);
    await m.pause(365);
  }finally{document.body.classList.remove('path-turn');delete html.dataset.folioHidden;m.dispose()}
}

let preparation,context,soundBytes,soundBuffer,decoding;
function decodeBell(){
  if(!context||!soundBytes)return Promise.resolve();
  return decoding??=context.decodeAudioData(soundBytes.slice(0)).then(b=>soundBuffer=b).catch(()=>{});
}
// Unlock on a real reader gesture, while the actual strike is still much later.
// No sound or permission prompt is produced by this preparation.
function unlockBell(){
  try{
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    context??=new Audio();
    if(context.state==='suspended')context.resume().catch(()=>{});
    decodeBell();
  }catch{}
}
document.addEventListener('pointerdown',unlockBell,{capture:true,passive:true});
document.addEventListener('keydown',unlockBell,{capture:true,passive:true});
export function prepareEpilogue(){
  unlockBell();
  preloadMusic('finale');preloadMusic('endgame');
  return preparation??=Promise.allSettled([
    ...['epilogue/bell-body.png','epilogue/bell-clapper.png','standby/cobalt.webp','standby/paper.webp','standby/graphite.webp','standby/silver.webp','standby/birds.webp','standby/yours-to-open.svg'].map(file=>{
      const img=new Image();img.src='./assets/'+file;return img.decode();
    }),
    assetBytes('./assets/epilogue/bell.wav').then(bytes=>{soundBytes=bytes;return decodeBell()})
  ]);
}
function strikeBell(){
  if(!musicEnabled()||!context||context.state!=='running'||!soundBuffer)return()=>{};
  const source=context.createBufferSource(),gain=context.createGain();source.buffer=soundBuffer;
  gain.gain.value=.55;source.connect(gain);gain.connect(context.destination);source.start();
  const hush=()=>{if(document.hidden){gain.gain.setTargetAtTime(0,context.currentTime,.025)}};
  document.addEventListener('visibilitychange',hush);
  source.onended=()=>{source.disconnect();gain.disconnect();document.removeEventListener('visibilitychange',hush)};
  return()=>{try{source.stop()}catch{}};
}
export async function enterEpilogue(swap){
  await prepareEpilogue();
  const rects=routes('.poster-lugs'),opened=document.body.classList.contains('unit-open');
  setMusic('silence',{out:1});
  const host=layer('epilogue-path-turn'),m=motionScope(host);
  host.innerHTML='<div class="epilogue-paper"></div><div class="epilogue-center"><div class="bell-underprint"></div><i class="bell-wave wave-one"></i><i class="bell-wave wave-two"></i><svg class="bell-light-star" viewBox="-100 -100 200 200"><path d="M0-100C2-15 4-4 100 0C15 2 4 4 0 100C-2 15-4 4-100 0C-15-2-4-4 0-100Z"/></svg><div class="bell-reveal"><div class="bell-pendulum"><img class="bell-clapper" src="./assets/epilogue/bell-clapper.png" alt=""><img class="bell-body" src="./assets/epilogue/bell-body.png" alt=""></div></div><i class="bell-pin-light"></i></div><i class="bell-cut-flash"></i>';
  const find=s=>host.querySelector(s);
  let stopSound=()=>{};
  try{
    // Feed the central seal from the two upper registers, travelling downward.
    // The lower motifs leave with the old sheet instead of feeding this route.
    if(!opened)lugs(host,m,false,-1);
    document.body.classList.add('path-turn');fadeReading(m);
    const paperReveal=m.run(find('.epilogue-paper'),[{opacity:0},{opacity:1}],300);
    passingPaths(host,m,rects,1,true);
    m.run(find('.bell-underprint'),[{opacity:0,transform:'scale(.015) rotate(-20deg)'},{opacity:1,transform:'scale(1.035) rotate(2deg)',offset:.82},{opacity:1,transform:'scale(1) rotate(0deg)'}],490,425,ease);
    m.run(find('.bell-pin-light'),[{opacity:0,transform:'scale(0)'},{opacity:1,transform:'scale(1.4)',offset:.25},{opacity:0,transform:'scale(.8)'}],510,470);
    ['.wave-one','.wave-two'].forEach((s,i)=>m.run(find(s),[{opacity:0,transform:'scale(.02)'},{opacity:.8,transform:'scale(.32)',offset:.16},{opacity:0,transform:'scale(2.6)'}],660,485+i*80));
    m.run(find('.bell-light-star'),[{opacity:0,transform:'scale(.01) rotate(-20deg)'},{opacity:1,transform:'scale(.75) rotate(-8deg)',offset:.32},{opacity:1,transform:'scale(1.35)',offset:.72},{opacity:0,transform:'scale(1.45)'}],650,495,ease);
    m.run(find('.bell-reveal'),[{opacity:0,transform:'translateY(-26px) scale(.86)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'translateY(2px) scale(1.025)',clipPath:'inset(-35%)',offset:.78},{opacity:1,transform:'none',clipPath:'inset(-35%)'}],290,820);
    await m.pause(335);
    $('final-chapter').inert=true;
    await swap();
    // Animate the real standby artwork in place. Its elements and rotation
    // clocks survive the handoff, so there is no second image to crossfade to.
    const incoming=$('wake'),dial=incoming.querySelector('.press-dial');
    m.run(dial,[{opacity:0,transform:'scale(.0912) rotate(-12deg)'},{opacity:1,transform:'scale(.787) rotate(1deg)',offset:.85},{opacity:1,transform:'scale(.76)'}],520,255,ease);
    const finishDelay=1465;
    incoming.querySelectorAll('.press-corner,.travelling-lines,.press-register,.ink-belt,.idle-title,.idle-subtitle,.flock-spin,.flock-ink').forEach(el=>{
      const opacity=getComputedStyle(el).opacity;
      const lettering=el.matches('.idle-title,.idle-subtitle,.ink-belt');
      const birds=el.matches('.flock-spin,.flock-ink');
      m.run(el,[{opacity:0},{opacity}],lettering?440:510,finishDelay+(lettering?110:birds?65:0));
      if(lettering)m.run(el,[{clipPath:'inset(0 50% 0 50%)'},{clipPath:'inset(0)'}],440,finishDelay+110,settle);
    });
    paperReveal.cancel();find('.epilogue-paper').hidden=true;
    await m.pause(725);
    if(!m.skipped)stopSound=strikeBell();
    setMusic('finale',{fade:4.5});
    m.run(find('.bell-pendulum'),[{transform:'rotate(0deg)'},{transform:'rotate(-22deg)',offset:.18},{transform:'rotate(18deg)',offset:.48},{transform:'rotate(-11deg)',offset:.78},{transform:'rotate(4deg)'}],740,0,'ease-in-out');
    m.run(find('.bell-clapper'),[{transform:'rotate(0deg)'},{transform:'rotate(29deg)',offset:.22},{transform:'rotate(-26deg)',offset:.49},{transform:'rotate(17deg)',offset:.78},{transform:'rotate(-6deg)'}],740,0,'ease-in-out');
    m.run(find('.wave-one'),[{opacity:0,transform:'scale(.65)'},{opacity:.72,transform:'scale(.9)',offset:.15},{opacity:0,transform:'scale(2.4)'}],720,0);
    await m.pause(740);
    m.run(find('.bell-reveal'),[{opacity:1,transform:'scale(1)',clipPath:'inset(-35%)'},{opacity:1,transform:'scale(1.09)',clipPath:'inset(-35%)',offset:.22},{opacity:0,transform:'scale(.7)',clipPath:'inset(48% -35% 48% -35%)'}],205,0,ease);
    m.run(find('.bell-underprint'),[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.8)'}],270);
    m.run(find('.bell-cut-flash'),[{opacity:0},{opacity:.7,offset:.28},{opacity:0}],300);
    m.run(dial,[{transform:'scale(.76)'},{transform:'scale(1)'}],600,0,'cubic-bezier(.2,.66,.22,1)');
    await m.pause(600);
    // Release the completed opacity/scale effects before the final frame:
    // identity transforms can still change text rasterization and blending.
    m.releaseWithin(incoming);
    host.style.visibility='hidden';
    await m.pause(35);
    // The final animation frame already IS the interactive finale. Keep it
    // for a short beat, then remove only the invisible temporary bell overlay.
    host.dataset.phase='handoff';
    await m.pause(65);
    $('final-chapter').inert=false;
    incoming.focus({preventScroll:true});
  }finally{
    if(m.skipped)stopSound();
    $('final-chapter').inert=false;
    document.body.classList.remove('path-turn');m.dispose();
  }
}
