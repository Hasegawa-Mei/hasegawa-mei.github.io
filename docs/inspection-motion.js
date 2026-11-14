const easing='cubic-bezier(.76,0,.20,1)';
const visible=el=>{const style=getComputedStyle(el),r=el.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&r.width>0&&r.height>0;};
const snapshot=el=>({rect:el.getBoundingClientRect(),font:parseFloat(getComputedStyle(el).fontSize),visible:visible(el)});

// Animate the existing text in place; no duplicate labels or alternate interface.
export async function animateInspection(page,entering,applyLayout,reduced){
  if(reduced){applyLayout();return;}
  const retained=[...page.querySelectorAll('.term-cn,h1 em,h2,.state-caption,.state-buttons,.cover-cn,.cover-en'),...document.querySelectorAll('.brand,.top-meta,#contents-button')];
  const prose=[...page.querySelectorAll('.concept,.design-copy,.chapter-links,.chapter-kicker,.design-label,.state-description,.eyebrow,.cover-description,.cover-edition'),...document.querySelectorAll('.scene-hud,.reading-progress,#page-down')];
  const actions=[...document.querySelectorAll('.inspection-action')];
  const running=[];
  const animate=(el,keyframes,options)=>{const a=el.animate(keyframes,{fill:'both',...options});running.push(a);return a;};
  try{
    if(entering){
      const leaving=prose.filter(visible).map(el=>animate(el,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-10px)'}],{duration:220,easing:'ease-in'}));
      await Promise.allSettled(leaving.map(a=>a.finished));
    }else{
      // Keep the returning prose invisible while its normal flow is restored.
      prose.forEach(el=>el.style.opacity='0');
    }
    const before=new Map(retained.map(el=>[el,snapshot(el)]));
    applyLayout();
    const moving=[];
    for(const el of retained){
      const first=before.get(el),last=snapshot(el);if(!last.visible)continue;
      if(!first.visible){moving.push(animate(el,[{opacity:0},{opacity:1}],{duration:250,delay:460}));continue;}
      const dx=first.rect.left-last.rect.left,dy=first.rect.top-last.rect.top,scale=first.font/last.font;
      moving.push(animate(el,[{transformOrigin:'0 0',transform:`translate(${dx}px,${dy}px) scale(${scale})`},{transformOrigin:'0 0',transform:'translate(0,0) scale(1)'}],{duration:760,easing}));
    }
    const revealing=entering?actions:prose;
    for(const el of revealing.filter(visible))moving.push(animate(el,[{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,delay:entering?360:420,easing:'ease-out'}));
    await Promise.allSettled(moving.map(a=>a.finished));
  }finally{
    running.forEach(a=>a.cancel());
    prose.forEach(el=>el.style.removeProperty('opacity'));
  }
}
