// A transient presentation of an already-saved result. Never changes match state.
export function showStarNotice(host,{name,retained,round},onComplete){
 const doc=host.ownerDocument,win=doc.defaultView;
 const reduced=win.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const notice=doc.createElement('dialog');notice.className='duel-star-notice';notice.tabIndex=-1;
 notice.setAttribute('aria-label',`${name}${retained?'保住了这一颗星':'已失去一颗星'}`);
 notice.innerHTML='<div class="duel-star-band"><p class="duel-star-kicker"></p><p class="duel-star-line"><span class="duel-star-name"></span><strong></strong></p></div>';
 notice.querySelector('.duel-star-kicker').textContent=`回合 ${String(round).padStart(2,'0')} / 星光判定`;
 notice.querySelector('.duel-star-name').textContent=name;
 notice.querySelector('strong').textContent=retained?'保住了这一颗星':'已失去一颗星';
 notice.dataset.result=retained?'retained':'lost';
 host.append(notice);notice.showModal();
 // Move the scene and HUD by only a few pixels, leaving the central text readable.
 const shake=!retained&&!reduced?host.animate?.([
  {transform:'translate(0,0)'},{transform:'translate(-4px,1px)'},
  {transform:'translate(3px,-1px)'},{transform:'translate(-2px,1px)'},
  {transform:'translate(1px,0)'},{transform:'translate(0,0)'}
 ],{duration:320,easing:'ease-out'}):null;
 let timer,closed=false;
 function dismiss(complete=true){
  if(closed)return;closed=true;win.clearTimeout(timer);shake?.cancel();
  if(notice.open)notice.close();notice.remove();
  if(complete)onComplete?.();
 }
 notice.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
 notice.addEventListener('close',()=>dismiss(),{once:true});
 notice.addEventListener('click',()=>dismiss());
 timer=win.setTimeout(()=>dismiss(),2100);
 // Cancellation (navigation or leaving the page) must not invoke a stale render.
 return ()=>dismiss(false);
}
