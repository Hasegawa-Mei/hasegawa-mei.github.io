import {cardArt,prepareCardFace} from './identity-card.js';
export {cardArt,prepareCardFace,exportCard} from './identity-card.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const damping=(a,b,rate,dt)=>mix(a,b,1-Math.exp(-rate*dt));
export function createArt(host){
  const deck=document.createElement('div');deck.className='printed-ritual';deck.setAttribute('aria-hidden','true');
  deck.innerHTML='<div class="deck-celestial">'+[7,9,6].map((count,ring)=>'<div class="star-orbit star-orbit-'+ring+'">'+Array.from({length:count},(_,i)=>'<i class="orbit-star-position" style="--azimuth:'+(i*360/count+ring*19)+'deg;--star-size:'+([14,9,18,7][(i+ring)%4])+'px"><i class="orbit-star"></i></i>').join('')+'</div>').join('')+'</div>';host.append(deck);
  // Seven draw positions retain the original symmetrical fan; identities are scored separately.
  const count=7,cards=Array.from({length:count},(_,i)=>{
    const el=document.createElement('div');el.className='identity-slot';el.dataset.card=String(i);
    el.innerHTML='<div class="identity-turner"><div class="identity-side identity-back-side">'+cardArt()+'</div><div class="identity-side identity-front-side"></div></div>';
    deck.append(el);return {el,turner:el.firstElementChild,front:el.querySelector('.identity-front-side'),pose:null};
  });
  let mode='idle',offset=0,target=0,rotating=false,chosen=false,revealIndex=0,clock=0,started=0,last=0,raf=0,active=true,dragOrigin=null;
  let width=host.clientWidth,height=host.clientHeight,hostRect=host.getBoundingClientRect();
  const media=matchMedia('(prefers-reduced-motion:reduce)'),pointer={x:0,y:0},lean={x:0,y:0};
  const selection=()=>((Math.round(offset)%count)+count)%count;
  const resize=()=>{hostRect=host.getBoundingClientRect();width=host.clientWidth;height=host.clientHeight};
  new ResizeObserver(resize).observe(host);
  window.addEventListener('pointermove',event=>{if(!active||mode!=='result')return;pointer.x=clamp((event.clientX-width*.72)/width,-.4,.4);pointer.y=clamp(event.clientY/innerHeight-.5,-.4,.4)},{passive:true});
  function frame(now){
    raf=0;if(!active||document.hidden)return;
    const dt=Math.min(.05,(now-last)/1000||0);last=now;clock+=dt;
    const reduced=media.matches,age=clock-started,wide=width>700;
    if(mode==='array'&&rotating&&!chosen)offset+=dt*.92;
    else if(dragOrigin===null)offset=damping(offset,target,9,dt);
    lean.x=damping(lean.x,pointer.x,5,dt);lean.y=damping(lean.y,pointer.y,5,dt);
    const baseWidth=Math.min(wide?width*.18:width*.48,height*.355,244),space=baseWidth*1.16;
    const form=reduced?1:ease(age/.72),selected=selection();
    deck.style.setProperty('--deck-form',form);
    cards.forEach((card,i)=>{
      const main=i===(mode==='result'?revealIndex:selected);
      card.el.hidden=mode==='idle'?i!==0:mode==='result'&&!main&&(reduced||age>.62);
      if(card.el.hidden)return;
      const index=((i-offset+count*1.5)%count+count)%count-count/2;
      const angle=index*.125,radius=space/.125;
      let x=width*.5+Math.sin(angle)*radius,y=height*.49+(1-Math.cos(angle))*radius*.55,z=-Math.abs(index)*18;
      let angleY=-index*2.1,angleZ=index*4.3,scale=1-Math.min(.1,Math.abs(index)*.025),opacity=1,cardWidth=baseWidth,flip=0;
      if(mode==='array'){
        y+=(1-form)*height*.24;scale*=.83+.17*form;opacity=form*(1-clamp((Math.abs(index)-3.05)/.45,0,1));
        if(main&&chosen){y-=22;z=60;scale*=1.07;}
      }else if(mode==='result'){
        const u=reduced?1:ease(age/1.12),from=card.from;
        if(main){
          cardWidth=mix(from.width,Math.min(wide?width*.255:width*.55,height*.49,376),u);
          x=mix(from.x-hostRect.left,wide?width*.73:width*.5,u);
          y=mix(from.y-hostRect.top,height*.48,u);
          z=0;angleY=0;angleZ=mix(from.angleZ,-2,u);scale=mix(from.scale,1,u);
          if(!reduced){angleY=lean.x*6*u;y+=Math.sin(clock*.9)*2*u;}
          flip=180*u;
        }else{
          const away=reduced?1:ease(age/.52);x=from.x-hostRect.left;y=from.y-hostRect.top+away*80;
          cardWidth=from.width;angleY=from.angleY;angleZ=from.angleZ;scale=from.scale*(1-away*.18);opacity=1-away;
        }
      }else{x=width*.5;y=height*.5;angleY=-9;angleZ=-4;scale=1;cardWidth=Math.min(width*.4,height*.48,300)}
      card.el.style.width=cardWidth+'px';card.el.style.opacity=opacity;
      card.el.style.zIndex=main?'10':String(5-Math.round(Math.abs(index)));
      card.el.dataset.selected=String(main&&chosen&&mode==='array');
      card.el.style.transform=`translate3d(${x}px,${y}px,${z}px) translate(-50%,-50%) rotateZ(${angleZ}deg) rotateY(${angleY}deg) scale(${scale})`;
      card.turner.style.transform=`rotateY(${flip}deg)`;
      card.pose={x,y,width:cardWidth,angleY,angleZ,scale};
    });
    raf=requestAnimationFrame(frame);
  }
  function resume(){active=true;deck.dataset.paused='false';last=performance.now();if(!raf&&!document.hidden)raf=requestAnimationFrame(frame)}
  function suspend(){active=false;deck.dataset.paused='true';cancelAnimationFrame(raf);raf=0}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;deck.dataset.paused='true'}else if(active)resume()});
  prepareCardFace();resume();
  return {
    suspend,resume,resize,
    start(){mode='array';deck.dataset.mode=mode;started=clock;offset=target=0;dragOrigin=null;rotating=chosen=false;cards.forEach(c=>{c.front.replaceChildren();c.turner.style.transform='none'});resume()},
    rotate(){dragOrigin=null;chosen=false;rotating=true},
    stop(){if(rotating)target=Math.round(offset);rotating=false},
    advance(direction=1){dragOrigin=null;chosen=false;rotating=false;target=Math.round(target)+Math.sign(direction)},
    beginDrag(){rotating=false;dragOrigin=offset},
    dragBy(pixels){if(dragOrigin===null||mode!=='array')return;chosen=false;const spacing=Math.min(width>700?width*.18:width*.48,height*.355,244)*1.16;offset=dragOrigin-pixels/Math.max(1,spacing);target=offset},
    endDrag(){dragOrigin=null;target=Math.round(offset)},
    select(){dragOrigin=null;rotating=false;chosen=true;target=Math.round(offset)},
    reveal(face){
      hostRect=host.getBoundingClientRect();
      cards.forEach(card=>{const p=card.pose||{x:width*.5,y:height*.5,width:244,angleY:0,angleZ:0,scale:1};card.from={...p,x:p.x+hostRect.left,y:p.y+hostRect.top}});
      revealIndex=selection();target=Math.round(offset);dragOrigin=null;rotating=false;mode='result';deck.dataset.mode=mode;started=clock;
      cards[revealIndex].front.innerHTML=cardArt(face);resize();resume();
    },
    idle(){mode='idle';deck.dataset.mode=mode;dragOrigin=null;rotating=chosen=false;cards.forEach(card=>card.front.replaceChildren())}
  };
}
