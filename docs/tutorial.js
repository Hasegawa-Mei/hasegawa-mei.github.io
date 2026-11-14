import {cardArt} from './identity-card.js';
import {faces} from './reading-round.js';
const $ = id => document.getElementById(id);
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let section, onBegin, onBack, phase = 'off', moving = false, generation = 0;
let arriving = false;
const animations = new Set();
const steps = [
  {image:'impression',name:'初印象',english:'FIRST IMPRESSION',text:'在左侧，先选一个此刻的想法。',marks:[[3.8,46.1,34,19.1]]},
  {image:'exploration',name:'自由探索',english:'EXPLORE FREELY',text:'点模型热点、试操作；中间可有多个场景。',marks:[[76.4,50.8,10.8,6.2],[3.8,52,34,19.2]]},
  {image:'reflection',name:'最终选择',english:'YOUR REFLECTION',text:'再选一次。理由选填，也可以写自己的答案。',marks:[[3.8,47.9,34,18]]}
];
function play(el, frames, options) {
  const animation = el.animate(frames, {...options, fill:'both'});
  animations.add(animation);
  if (reduce() || document.hidden) animation.finish();
  return animation.finished.catch(() => {}).finally(() => {
    animation.cancel();
    animations.delete(animation);
  });
}
function fastForward() {
  if (document.hidden || reduce()) animations.forEach(a => a.finish());
}
export function initTutorial(begin, back) {
  onBegin = begin; onBack = back;
  section = document.createElement('section');
  section.id = 'tutorial'; section.hidden = true;
  section.setAttribute('aria-label', '阅读教程');
  section.innerHTML = `
    <div class="tutorial-stock" aria-hidden="true"><div class="tutorial-print"></div><div class="tutorial-dim"></div><div class="tutorial-spectrum"></div></div>
    <div class="tutorial-signal" aria-hidden="true">
      <div class="signal-left"><i></i><i></i><i></i><b></b><b></b><b></b></div>
      <div class="signal-title"><strong>教程</strong><small>TUTORIAL</small></div>
      <div class="signal-right"><b></b><b></b><i></i></div>
    </div>
    <div class="tutorial-pages">
      <div class="tutorial-overview" hidden>
        <div class="tutorial-intro"><span class="tutorial-kicker">01 / 03　READING GUIDE</span><h1 tabindex="-1">每个词语，三段阅读。</h1></div>
        <div class="tutorial-triptych">${steps.map((s,i)=>`
          <figure class="tutorial-step" style="--order:${i};--angle:${[-16,-9,16][i]}deg">
            <div class="tutorial-shot" tabindex="0" ${i===1?'id="exploration-preview" aria-describedby="tutorial-examples"':''} role="img" aria-label="${s.name}的真实界面截图。蓝色框标出${i===1?'模型热点与操作栏':'左侧选择区'}。">
              <img src="assets/tutorial/${s.image}.jpg" width="1440" height="900" alt="">
              ${s.marks.map((m,j)=>`<i class="tutorial-mark" style="left:${m[0]}%;top:${m[1]}%;width:${m[2]}%;height:${m[3]}%"><span>${i===1?(j===0?'点这里':'试一试'):'在这里选择'}</span></i>`).join('')}
              <span class="tutorial-glint" aria-hidden="true"></span>
            </div>
            <figcaption><span class="tutorial-step-en">${s.english}</span><h2>${s.name}</h2><p>${s.text}</p></figcaption>
          </figure>`).join('')}
        </div>
        <div class="tutorial-bottom"><p>↑↓ 换词语<span>←→ 探索同一个词语</span></p><button id="tutorial-continue">点击空白处即可继续 <span>→</span></button></div>
      </div>
      <div class="tutorial-meaning" hidden>
        <span class="tutorial-kicker">02 / 03　FROM IMPRESSION TO UNDERSTANDING</span>
        <h1 tabindex="-1">从第一眼，<br>到自己的理解。</h1>
        <p class="tutorial-theme"><strong>星星是新技术，灯塔是被它照亮的时代，飞鸟是我们。</strong><br>借阿伦特的概念，观察 AI 如何改变思考与共同生活。王座代表仍待共同追问的答案。</p><div class="tutorial-thoughts">
          <p><b>先选择。</b><span>留住你对这个词语的初印象。</span></p>
          <p><b>再探索。</b><span>从日常案例走向 AI 情境，试着改变场景，辨认便利与代价。</span></p>
          <p><b>最后回应。</b><span>选择你理解的答案，也可以说出自己的想法。</span></p>
        </div>
        <p class="tutorial-outcome">你的最终选择会被记录，<br>在终章，汇成属于你的<span>身份卡牌。</span></p>
        <div class="tutorial-meaning-actions"><button id="tutorial-back">← 回看三步</button><button id="tutorial-to-finale">接下来，终章 <span>→</span></button></div>
      </div>
      <div class="tutorial-epilogue" hidden>
        <div class="tutorial-quest-copy"><span class="tutorial-kicker">03 / 03　IDENTITY → THE THRONE</span><h1 tabindex="-1">终章，<br>让身份走入对话。</h1><p class="tutorial-quest-lead">抽出身份卡牌，<br>带着它进入王座真理的探寻。</p><div class="tutorial-quest-steps"><p><b>两位旅人，同屏对话。</b><span>保留阅读身份，或补抽一张。掷骰决定先手。</span></p><p><b>用概念，回应 AI 情境。</b><span>轮流出牌、写下理由；八轮之后，可以胜出，也可以平局。</span></p><p><b>对局结束，再回顾。</b><span>回看最终选择、身份解释与模型场景，导出自己的手记。</span></p></div></div>
        <div class="tutorial-quest-art" aria-hidden="true"><div class="tutorial-quest-ring"></div><div class="tutorial-quest-card">${cardArt(faces.find(f=>f.id==='witness'))}</div><span class="tutorial-quest-arrow">↗</span><img class="tutorial-quest-throne" src="assets/game/throne.webp" alt=""><span class="tutorial-quest-caption">YOUR IDENTITY / A NEW DIALOGUE</span></div>
        <div class="tutorial-meaning-actions"><button id="tutorial-finale-back">← 上一步</button><button id="tutorial-begin">正式开启 <span>↗</span></button></div>
      </div>
    </div>
    <aside id="tutorial-examples" class="tutorial-examples" role="tooltip" hidden>
      <p class="examples-title">自由探索，可以不止一步。</p>
      <div class="examples-strip">
        <figure><div><img src="assets/tutorial/two-scenes.jpg" width="1440" height="900" alt="私人领域单元，标出左右翻页区。"><i class="example-mark page-mark"></i></div><figcaption><b>2 个探索场景</b><span>私人领域 · 左右翻看</span></figcaption></figure>
        <figure><div><img src="assets/tutorial/three-scenes.jpg" width="1440" height="900" alt="公共单元，标出左右翻页区。"><i class="example-mark page-mark"></i></div><figcaption><b>3 个探索场景</b><span>公共 · 每一层都能探索</span></figcaption></figure>
        <figure><div><img src="assets/tutorial/scene-actions.jpg" width="1440" height="900" alt="公共场景右下方的加号操作入口。"><i class="example-mark object-mark"></i></div><figcaption><b>留意模型旁的操作区</b><span>加号或操作框，也可以点</span></figcaption></figure>
      </div>
    </aside>`;
  document.querySelector('main').append(section);
  $('tutorial-continue').onclick = () => tutorialStep(1);
  $('tutorial-back').onclick = () => tutorialStep(-1);
  $('tutorial-to-finale').onclick = () => tutorialStep(1);
  $('tutorial-finale-back').onclick = () => tutorialStep(-1);
  $('tutorial-begin').onclick = () => { if (!moving && phase==='epilogue') onBegin(); };
  section.addEventListener('click', e => {
    if(phase!=='overview'||moving||e.target.closest('.tutorial-step,.tutorial-intro,.tutorial-examples,.tutorial-bottom p,button,a,input'))return;
    tutorialStep(1);
  });
  const preview=$('exploration-preview'), examples=$('tutorial-examples');
  function showExamples() {
    if(phase!=='overview'||moving)return;
    examples.hidden=false;
    const rect=preview.getBoundingClientRect(), width=examples.offsetWidth, height=examples.offsetHeight;
    examples.style.left=Math.max(16,Math.min(innerWidth-width-16,rect.left+rect.width/2-width/2))+'px';
    examples.style.top=Math.max(16,Math.min(innerHeight-height-16,rect.bottom+20))+'px';
  }
  preview.addEventListener('focus',showExamples);
  preview.addEventListener('blur',()=>{examples.hidden=true;});
  preview.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')showExamples();});
  section.addEventListener('pointerup',e=>{if(e.pointerType==='touch')examples.hidden=true;});
  section.addEventListener('pointercancel',()=>{examples.hidden=true;});
  section.addEventListener('keydown',e=>{if(e.key==='Escape')examples.hidden=true;});
  document.addEventListener('visibilitychange', fastForward);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', fastForward);
  let pointerFrame = 0;
  section.addEventListener('pointermove', e => {
    if (phase !== 'overview' || e.pointerType === 'touch' || pointerFrame) return;
    const x=e.clientX, y=e.clientY;
    const overExamples=!!e.target.closest('.tutorial-examples');
    pointerFrame=requestAnimationFrame(() => {
      pointerFrame=0;
      section.querySelectorAll('.tutorial-shot').forEach(shot => {
        const r=shot.getBoundingClientRect();
        const dx=(x-r.left-r.width/2)/r.width, dy=(y-r.top-r.height/2)/r.height;
        const distance=Math.hypot(Math.max(0,Math.abs(dx)-.5)*r.width,Math.max(0,Math.abs(dy)-.5)*r.height);
        const near=Math.max(0,1-distance/110);
        if(shot===preview){
          if(distance<35||overExamples)showExamples();
          else examples.hidden=true;
        }
        if(reduce())return;
        shot.style.setProperty('--near',near);
        shot.style.setProperty('--rx',(-Math.max(-1,Math.min(1,dy))*3*near)+'deg');
        shot.style.setProperty('--ry',(Math.max(-1,Math.min(1,dx))*4*near)+'deg');
      });
    });
  });
  section.addEventListener('pointerleave', () => section.querySelectorAll('.tutorial-shot').forEach(el => {
    for(const name of ['--near','--rx','--ry'])el.style.removeProperty(name);
    examples.hidden=true;
  }));
}
export async function openTutorial(swap) {
  const veil=document.createElement('div');
  veil.className='tutorial-arrival';
  veil.setAttribute('aria-hidden','true');
  veil.append(section.querySelector('.tutorial-stock').cloneNode(true));
  document.body.append(veil);arriving=true;
  try{
    await play(veil,[{opacity:0},{opacity:1}],{duration:700,easing:'cubic-bezier(.22,.65,.26,1)'});
    await swap();
  }finally{arriving=false;veil.remove();}
}
export async function enterTutorial() {
  const run=++generation;
  phase='intro';moving=true;
  section.hidden=false;section.dataset.phase='intro';section.scrollTop=0;
  section.querySelector('.tutorial-overview').hidden=true;
  section.querySelector('.tutorial-meaning').hidden=true;
  section.querySelector('.tutorial-epilogue').hidden=true;
  const signal=section.querySelector('.tutorial-signal');
  signal.hidden=true;
  if(!arriving)await play(section.querySelector('.tutorial-stock'),[{opacity:0},{opacity:1}],{duration:700,easing:'cubic-bezier(.22,.65,.26,1)'});
  if(run!==generation)return;
  signal.hidden=false;
  const arrivals=[
    ['.signal-title', 'translateX(45vw)', 'translateX(-3vw)'],
    ['.signal-left', 'translateX(-65vw)', 'translateX(-4vw)'],
    ['.signal-right', 'translateX(55vw)', 'translateX(-2vw)']
  ];
  await Promise.all(arrivals.map(([selector,from,drift]) => play(section.querySelector(selector),[
    {opacity:0,transform:from,easing:'cubic-bezier(.15,.8,.2,1)'},
    {opacity:1,transform:'translateX(0)',offset:.25},
    {opacity:1,transform:'translateX(0)',offset:.36,easing:'linear'},
    {opacity:1,transform:drift,offset:.76,easing:'cubic-bezier(.65,0,.72,.32)'},
    {opacity:0,transform:'translateX(-90vw)'}
  ],{duration:1710,delay:150})));
  if(run!==generation)return;
  signal.hidden=true; moving=false;
  await showPage('overview',run);
}
async function showPage(next, run=generation) {
  $('tutorial-examples').hidden=true;
  moving=true;phase=next;section.dataset.phase=next;section.scrollTop=0;
  const overview=section.querySelector('.tutorial-overview');
  const meaning=section.querySelector('.tutorial-meaning');
  const epilogue=section.querySelector('.tutorial-epilogue');
  overview.hidden=next!=='overview';meaning.hidden=next!=='meaning';epilogue.hidden=next!=='epilogue';
  const target=next==='overview'?overview:next==='meaning'?meaning:epilogue;
  const items=next==='overview' ? [overview.querySelector('.tutorial-intro'),...overview.querySelectorAll('.tutorial-step'),overview.querySelector('.tutorial-bottom')]
    : [...target.children];
  await Promise.all(items.map((el,i) => play(el,[
    {opacity:0,transform:'translateY(26px)',filter:'blur(3px)'},
    {opacity:1,transform:'none',filter:'blur(0px)'}
  ],{duration:550,delay:i*165,easing:'cubic-bezier(.16,.8,.25,1)'})));
  if(run!==generation)return;
  moving=false;
  target.querySelector('h1').focus({preventScroll:true});
}
export async function tutorialStep(delta) {
  if(moving||phase==='off')return;
  if(delta<0&&phase==='overview'){onBack();return;}
  if(delta>0&&phase==='epilogue')return;
  const run=generation;
  $('tutorial-examples').hidden=true;
  moving=true;
  const pages=['overview','meaning','epilogue'];
  const next=pages[pages.indexOf(phase)+(delta>0?1:-1)];
  const page=section.querySelector('.tutorial-'+phase);
  await play(page,[{opacity:1,transform:'none'},{opacity:0,transform:'translateX(-25px)'}],{duration:210,easing:'ease-in'});
  if(run!==generation)return;
  await showPage(next,run);
}
export function leaveTutorial() {
  ++generation; phase='off';moving=false;
  animations.forEach(a=>a.cancel());animations.clear();
  if(section){section.hidden=true;delete section.dataset.phase;}
  if($('tutorial-examples'))$('tutorial-examples').hidden=true;
}
export async function closeTutorial(swap) {
  const overlay=document.createElement('div');
  overlay.className='tutorial-exit'; overlay.ariaHidden='true';
  overlay.innerHTML='<div class="tutorial-wipe"><i></i><b></b></div>';
  document.body.append(overlay);
  const panel=overlay.firstElementChild;
  const playWipe=(frames,options)=>{
    const a=panel.animate(frames,{...options,fill:'forwards'});
    return a;
  };
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const active=[];
  const finish=()=>{if(document.hidden||motion.matches)active.forEach(a=>a.finish());};
  document.addEventListener('visibilitychange',finish);
  motion.addEventListener('change',finish);
  try{
    const shut=playWipe([{transform:'translateX(115%) skewX(-12deg)'},{transform:'translateX(0) skewX(0)'}],{duration:345,easing:'cubic-bezier(.65,.01,.18,1)'});
    active.push(shut);finish();await shut.finished;
    await swap();
    const clear=playWipe([{transform:'translateX(0) skewX(0)'},{transform:'translateX(-115%) skewX(-8deg)'}],{duration:450,easing:'cubic-bezier(.65,.01,.18,1)'});
    active.push(clear);finish();await clear.finished;
  }finally{
    active.forEach(a=>a.cancel());overlay.remove();
    document.removeEventListener('visibilitychange',finish);motion.removeEventListener('change',finish);
  }
}
