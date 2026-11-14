import {assembleStartGate} from './gate-entrance.js';
import {closeTutorial,openTutorial} from './tutorial.js';
import {travelChapters,enterEpilogue} from './chapter-transit.js';
const $=id=>document.getElementById(id);
const reduce=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
export function presentUnit(study,index,term,english) {
  document.body.classList.toggle('unit-page',!!study);
  document.body.classList.toggle('unit-landing',!!study);
  document.body.classList.remove('unit-open','unit-unfold');
  $('chapter-poster').hidden=!study;
  $('unit-front').hidden=!study;
  if(!study)return;
  $('unit-word').textContent=term;
  $('unit-english').textContent=english;
  $('plate-index').textContent='BETWEEN　/　'+String(index+1).padStart(2,'0');
  document.querySelector('.poster-contour').style.backgroundImage='url("./assets/chapter-plates/'+study.id+'.png")';
}
export {openUnit as unfoldUnit} from './unit-entrance.js';
async function revealFolio(direction){
  delete document.documentElement.dataset.folioHidden;
  const model=$('stage').animate([{opacity:0,transform:'translateY('+(direction*10)+'px) scale(.99)'},{opacity:1,transform:'none'}],{duration:405,easing:'cubic-bezier(.2,.72,.27,1)'});
  const title=document.querySelector('.unit-wordmark').animate([
    {opacity:0,clipPath:'polygon(0 0,0 0,0 100%,0 100%)',transform:'translateY('+(direction*8)+'px)'},
    {opacity:1,clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)',transform:'none'}
  ],{duration:360,delay:45,fill:'backwards',easing:'cubic-bezier(.15,.8,.25,1)'});
  await Promise.all([model.finished,title.finished]);
}
export async function turnSheet(direction,animated,swap,openingMotion=null,nextIsUnit=false){
  if(!animated||reduce()||document.hidden){await swap();return}
  if(openingMotion==='assemble'){await assembleStartGate(swap);return}
  if(openingMotion==='tutorial-exit'){await closeTutorial(swap);return}
  if(openingMotion==='tutorial-enter'){await openTutorial(swap);return}
  if(openingMotion==='epilogue'){await enterEpilogue(swap);return}
  if(openingMotion==='fade'){
    const classes=document.body.classList;
    try{
      classes.add('turning');
      await new Promise(resolve=>setTimeout(resolve,340));
      await swap();
      classes.add('arriving');
      classes.remove('turning');
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      classes.remove('arriving');
      await new Promise(resolve=>setTimeout(resolve,650));
    }finally{classes.remove('turning','arriving')}
    return;
  }
  const joined=nextIsUnit&&document.body.classList.contains('unit-page')&&!document.body.classList.contains('in-finale');
  if(joined){await travelChapters(direction,swap);return}
  const html=document.documentElement;
  html.dataset.pageTravel=direction>0?'down':'up';
  try{
    if(document.startViewTransition){
      const t=document.startViewTransition(swap);
      await t.finished;
    }else{
      const surface=()=>document.body.classList.contains('in-finale')?$('final-chapter'):$('reader-shell');
      const bridge=document.createElement('div');
      bridge.className='paper-turn-bridge';bridge.setAttribute('aria-hidden','true');
      html.classList.add('fallback-travel');document.body.append(bridge);
      const slide=(el,from,to,duration,easing)=>el.animate(
        [{transform:'translateY('+from+'vh)'},{transform:'translateY('+to+'vh)'}],
        {duration,easing,fill:'forwards'});
      const animations=[];
      try{
        const out=slide(surface(),0,-direction*100,235,'cubic-bezier(.65,0,.95,.3)');
        const cover=slide(bridge,direction*100,0,235,'cubic-bezier(.65,0,.95,.3)');
        animations.push(out,cover);await cover.finished;
        if(nextIsUnit)html.dataset.folioHidden='';
        await swap();out.cancel();
        const incoming=slide(surface(),direction*100,0,320,'cubic-bezier(.12,.83,.18,1)');
        const clear=slide(bridge,0,-direction*100,320,'cubic-bezier(.12,.83,.18,1)');
        animations.push(incoming,clear);await incoming.finished;
        if(nextIsUnit)await revealFolio(direction);
      }finally{
        for(const animation of animations)animation.cancel();
        bridge.remove();html.classList.remove('fallback-travel');delete html.dataset.folioHidden;
      }
    }
  }finally{delete html.dataset.pageTravel;delete html.dataset.joined}
}
