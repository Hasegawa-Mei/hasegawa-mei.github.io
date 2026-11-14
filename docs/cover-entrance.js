import {settleWithin} from './load-budget.js';
// As on the epilogue plate, each arm has a long taper and a tight turn
// at the core. Repeat the same two curves in each quarter of the aperture.
const star='M0 -1 C.027 -.46 .052 -.208 .13 -.13 S.46 -.027 1 0 C.46 .027 .208 .052 .13 .13 S.027 .46 0 1 C-.027 .46 -.052 .208 -.13 .13 S-.46 .027 -1 0 C-.46 -.027 -.208 -.052 -.13 -.13 S-.027 -.46 0 -1Z';
const sparkShape='M0 -1 C.05 -.22 .22 -.05 1 0 C.22 .05 .05 .22 0 1 C-.05 .22 -.22 .05 -1 0 C-.22 -.05 -.05 -.22 0 -1Z';
const facet='M-.11 -1H.11L.30 -.30 1 -.11V.11L.30 .30 .11 1H-.11L-.30 .30 -1 .11V-.11L-.30 -.30Z';
const root=document.documentElement,motion=matchMedia('(prefers-reduced-motion:reduce)');
const portion=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const pose=(x,y,angle,r)=>'translate('+x+' '+y+') rotate('+angle+') scale('+r+')';
const beat={land:310,escortsLeave:705,rise:860,contact:1240,wide:1730,pull:1780,end:2500};
const standbyInk='./assets/standby/cobalt.webp',standbyBirds='./assets/standby/birds.webp';
let stop=null;
export function finishCoverEntrance(){stop?.();root.classList.remove('cover-overture')}

// Fast entry followed by a finite braking distance. Position and velocity
// match at the brake point; velocity reaches zero exactly at the landing.
function arrival(t){
  const brake=.58,rate=2/(1+brake);
  return t<brake?t*rate:1-rate*(1-t)**2/(2*(1-brake));
}
function sparkSprite(){
  const tile=document.createElement('canvas');tile.width=tile.height=96;
  const ctx=tile.getContext('2d'),shape=new Path2D(sparkShape);
  ctx.setTransform(39,0,0,39,48,48);
  ctx.lineJoin='round';ctx.lineWidth=.19;ctx.strokeStyle='#271bcc';
  ctx.shadowColor='#5743ff';ctx.shadowBlur=7;ctx.stroke(shape);
  ctx.shadowColor='#5953ff';ctx.shadowBlur=3;
  ctx.lineWidth=.11;ctx.strokeStyle='#493dff';ctx.stroke(shape);
  ctx.globalCompositeOperation='destination-out';ctx.scale(.74,.74);ctx.fill(shape);
  return tile;
}
function particlePlume(canvas){
  const ctx=canvas.getContext('2d');
  if(!ctx)return {resize(){},draw(){},clear(){}};
  const sprite=sparkSprite();
  let seed=13279;
  const random=()=>((seed=16807*seed%2147483647)-1)/2147483646;
  // Three extra glints sit between existing emissions in the same cycle.
  const period=24*27;
  const grains=Array.from({length:27},(_,i)=>({
    born:14+(i<24?i:3.5+8*(i-24))*27+random()*8,lane:random()*2-1,speed:1.55+random()*.55,
    size:i%8===0?3.3:.85+random()*1.7,phase:random()*Math.PI*2
  }));
  let width,h,dpr,scale;
  function resize(w,viewHeight,r){
    width=Math.ceil(2*r+32);h=viewHeight;
    dpr=Math.min(devicePixelRatio||1,2);scale=Math.max(.78,r/64);
    canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(h*dpr);
    canvas.style.width=width+'px';canvas.style.height=h+'px';
    canvas.style.transform='translateX('+((w-width)/2)+'px)';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function draw(t,headY,r){
    if(t>=beat.contact+360){canvas.style.visibility='hidden';return}
    canvas.style.visibility='visible';ctx.clearRect(0,0,width,h);
    for(const g of grains){
      if(t<g.born)continue;
      const born=t-(t-g.born)%period;
      if(born>=beat.contact)continue;
      const age=(t-born)/1000,size=g.size*scale*2.65;
      const bornY=headY(born)-r*.90;
      const untilClear=(928-g.born)/1000;
      const speed=Math.max(h*g.speed,(headY(g.born)-r*.90+g.size*scale*2*1.15+1)/untilClear);
      const y=bornY-age*speed;
      if(y+size*1.15<0)continue;
      const x=width/2+r*g.lane*(.09+age*.96)+r*.065*Math.sin(g.phase+age*10);
      ctx.globalAlpha=smooth(portion(age,0,.023));
      ctx.drawImage(sprite,x-size,y-size*1.15,2*size,size*2.30);
    }
  }
  return {resize,draw,clear(){canvas.width=canvas.height=0;canvas.removeAttribute('style')}};
}

function printedOrbits(host){
  const group=()=>document.createElementNS('http://www.w3.org/2000/svg','g');
  function beadRing(count,radius,size){
    const ring=group();
    for(let i=0;i<count;i++){
      const a=2*Math.PI*i/count,dot=document.createElementNS(ring.namespaceURI,'circle');
      dot.setAttribute('cx',radius*Math.cos(a));dot.setAttribute('cy',radius*Math.sin(a));
      dot.setAttribute('r',size*.76);dot.setAttribute('fill',i%11===4?'#8586d8':'#2520bf');ring.append(dot);
    }
    return ring;
  }
  const rims=group();
  // Use the epilogue's dial as the coordinate system: star width 276%,
  // flock width 64%, ink rims at 274 and 297 in a 300-unit radius.
  rims.innerHTML='<circle r=".91333" fill="none" stroke="#2923aa" stroke-width=".007"/><circle r=".99" fill="none" stroke="#2923aa" stroke-width=".011" stroke-linecap="round" stroke-dasharray=".003 .015"/>';
  const roundels=beadRing(12,1.84*281/310,1.84*36/310);
  const beads=beadRing(38,239/300,10/300),inner=beadRing(29,88/300,2.5/300),flock=group();
  const birds=document.createElementNS(flock.namespaceURI,'image');
  birds.setAttribute('href',standbyBirds);birds.setAttribute('x','-.64');birds.setAttribute('y','-.64');
  birds.setAttribute('width','1.28');birds.setAttribute('height','1.28');flock.append(birds);
  host.append(roundels,rims,beads,flock,inner);
  const layers=[[rims,31000],[roundels,-22000],[beads,-14500],[inner,-17500],[flock,-8700]];
  return (t,x,y,span,turn,alpha)=>{
    host.setAttribute('opacity',alpha);
    if(!alpha){host.style.visibility='hidden';return}
    host.setAttribute('transform',pose(x,y,turn,span/2.76));
    for(const [layer,period] of layers)layer.setAttribute('transform','rotate('+(360*t/period)+')');
  };
}

function play(){
  if(!root.classList.contains('cover-overture'))return;
  if(motion.matches||(location.hash&&location.hash!=='#cover')){
    root.classList.remove('cover-overture');return;
  }
  const sheet=document.getElementById('cover-copy'),art=sheet.querySelector('.cover-art');
  const light=sheet.querySelector('.light-source'),mast=sheet.querySelector('.cover-mast');
  const edge=sheet.querySelector('.comet-star'),glow=edge.parentElement;
  const cut=sheet.querySelector('#cover-star-cut'),escorts=sheet.querySelector('.escort-stars');
  const orbitHost=sheet.querySelector('.comet-orbits'),drawOrbits=printedOrbits(orbitHost);
  sheet.querySelector('#comet-ink-scan').setAttribute('href',standbyInk);
  sheet.querySelector('#comet-etch').setAttribute('d',Array.from({length:36},(_,i)=>{
    const angle=i*Math.PI/18;return 'M1 1l'+(1.42*Math.cos(angle))+' '+(1.42*Math.sin(angle));
  }).join(''));
  const dust=particlePlume(sheet.querySelector('.meteor-plume'));
  cut.setAttribute('d',star);edge.setAttribute('d',star);

  // Use the actual tower on an unclipped plane so its tip can be seen before
  // contact. It returns to its original place in the print as the aperture clears.
  const marker=document.createComment('lighthouse'),lantern=document.createElement('div');
  lantern.className='entrance-lantern';lantern.setAttribute('aria-hidden','true');
  mast.before(marker);sheet.insertBefore(lantern,sheet.querySelector('.cover-window'));lantern.append(mast);
  function restoreMast(){
    if(!marker.parentNode)return;
    marker.replaceWith(mast);lantern.remove();
    mast.style.removeProperty('mask-image');mast.style.removeProperty('visibility');
  }
  const companions=[-2,-1,1,2].map(lane=>{
    const node=document.createElementNS('http://www.w3.org/2000/svg','path');
    node.setAttribute('d',facet);escorts.append(node);return {lane,node};
  });

  let w,h,ox,oy,r,mastHeight,frame,origin,ready=false;
  function measure(){
    w=sheet.clientWidth;h=sheet.clientHeight;ox=light.offsetLeft;oy=light.offsetTop;
    mastHeight=mast.offsetHeight;r=Math.min(76,Math.max(32,Math.min(w,h)*.084));
    dust.resize(w,h,r);
  }
  function headY(ms){return mix(-r*1.35,h/2,arrival(portion(ms,8,beat.land)))}
  function drawCompanions(ms){
    const alpha=1-smooth(portion(ms,beat.escortsLeave,beat.rise-40));
    escorts.setAttribute('opacity',alpha);if(!alpha)return;
    const spacing=Math.min(w*.159,h*.26),rise=Math.min(h*.115,w*.14);
    for(const {lane,node} of companions){
      const tier=Math.abs(lane),size=r*(tier===1?.50:.42);
      const t=arrival(portion(ms,tier===1?70:132,tier===1?380:460));
      node.setAttribute('transform',pose(w/2+lane*spacing,mix(-size*1.5,h/2-tier*rise,t),0,size));
    }
  }
  function tick(now){
    origin??=now;const ms=now-origin;
    if(ms>=beat.end){finishCoverEntrance();return}
    const open=portion(ms,beat.contact,beat.wide);
    const pull=1-(1-smooth(portion(ms,beat.pull,beat.end)))**2;
    const ink=smooth(portion(ms,beat.pull+50,beat.end-65));
    const mx=w/2,my=h/2;
    const x=mix(mx,ox,pull),y=mix(headY(ms),oy,pull);
    // The star waits at the center. Rotation and dilation share the instant
    // when the rising finial reaches that stationary point.
    const angle=360*open**1.55,span=mix(r,Math.hypot(w,h)*5.4,open**2.35);
    const matrix=pose(x,y,angle,span);
    edge.setAttribute('transform',matrix);cut.setAttribute('transform',matrix);
    const edgeAlpha=1-smooth(portion(ms,beat.contact+36,beat.contact+134));
    glow.setAttribute('opacity',edgeAlpha);glow.style.visibility=edgeAlpha?'visible':'hidden';
    drawOrbits(ms,x,y,span,angle,edgeAlpha);
    drawCompanions(ms);
    dust.draw(ms,headY,r);

    // The first opaque pixel of the finial is on row 2 of the 1692px print.
    // Register it to the center of the star, then pan into the illuminated tip.
    const zoom=7.25**(1-pull),finial=mastHeight*2/1692;
    const risingTip=mix(h+r*.7,my,arrival(portion(ms,beat.rise,beat.contact)));
    const tipY=mix(risingTip,my-mastHeight*.042*zoom,smooth(portion(ms,beat.contact+60,beat.wide)));
    const transform='translate('+((mx-ox)*(1-pull))+'px,'+((tipY-oy-zoom*finial)*(1-pull))+'px) scale('+zoom+')';
    art.style.transform=transform;
    if(ms<beat.wide){
      lantern.style.transform=transform;
      mast.style.visibility='visible';
      mast.style.maskImage='linear-gradient(to bottom,black '+mix(8,90,open)+'%,transparent '+mix(14,100,open)+'%)';
    }else restoreMast();
    const strike=smooth(portion(ms,beat.contact,beat.contact+155));
    root.style.setProperty('--entrance-strike',strike);
    root.style.setProperty('--entrance-ink',ink);
    root.style.setProperty('--entrance-core',mix(.49,1,ink));
    const ui=smooth(portion(ms,beat.end-240,beat.end-15));
    root.style.setProperty('--entrance-ui',ui);if(ui>0)root.style.setProperty('--entrance-hud','visible');
    frame=requestAnimationFrame(tick);
  }
  function schedule(){
    if(ready&&!document.hidden&&frame===undefined&&stop)frame=requestAnimationFrame(tick);
  }
  function onRoute(){if(location.hash&&location.hash!=='#cover')finishCoverEntrance()}
  function onVisibility(){if(document.hidden&&origin!==undefined)finishCoverEntrance();else schedule()}
  function onMotion(){if(motion.matches)finishCoverEntrance()}
  const observer=new ResizeObserver(measure);
  const watchdog=setTimeout(finishCoverEntrance,4500);
  stop=()=>{
    clearTimeout(watchdog);
    stop=null;cancelAnimationFrame(frame);observer.disconnect();
    document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('hashchange',onRoute);
    window.removeEventListener('pagehide',finishCoverEntrance);motion.removeEventListener('change',onMotion);
    root.classList.remove('cover-overture');restoreMast();
    for(const key of ['strike','ink','core','ui','hud'])root.style.removeProperty('--entrance-'+key);
    art.style.removeProperty('transform');escorts.replaceChildren();orbitHost.replaceChildren();dust.clear();
  };
  mast.style.visibility='hidden';measure();observer.observe(sheet);
  document.addEventListener('visibilitychange',onVisibility);window.addEventListener('hashchange',onRoute);
  window.addEventListener('pagehide',finishCoverEntrance);motion.addEventListener('change',onMotion);
  const plates=[standbyInk,standbyBirds].map(src=>{const img=new Image();img.src=src;return img.decode()});
  settleWithin(Promise.allSettled([mast.decode(),...plates]),900).then(()=>{if(!stop)return;ready=true;measure();schedule()});
}
if(root.classList.contains('site-booting'))window.addEventListener('site-ready',play,{once:true});else play();

