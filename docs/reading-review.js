import {finalSceneName} from './ai-content.js';
import {addResetMenu} from './reset-reading.js';
import {summarizeRound,identityRules} from './final-choices.js';
import {MiniatureGallery,fallbackURL} from './scene-miniatures.js';
import {round,faces} from './reading-round.js';
import {exportCard} from './printed-ritual.js';
const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function choiceCopy(row) {
  const title=escape(row.study.term.split(' · ')[0]);
  const note=row.reason ? '<blockquote><small>我写下的理由</small><p>'+escape(row.reason)+'</p></blockquote>' : '';
  const heading='<p class="unit-name">'+title+'　<span>'+escape(finalSceneName(row))+'</span></p>';
  if(!row.answer) return heading+'<h3>留白</h3><p>这一单元还没有留下最终选择。</p>'+note;
  const meaning=row.meaning || '你为这个问题写下了自己的说法。这一页保留你的原话，读到这里时，也可以重新想想它。';
  const identity=faces.find(face=>face.id===row.role);
  const evidence=identity?'<p class="identity-evidence">这项选择指向「'+identity.name+'」</p>':'<p class="identity-evidence">自写答案 · 保留原话，不自动归类</p>';
  return heading+'<h3>“'+escape(row.answer)+'”</h3><p>'+escape(meaning)+'</p>'+evidence+note;
}

export function mountReadingReview(container,{scrollRoot,onRestart}){
 const result=summarizeRound(round),{face,rows,paragraphs}=result;
 let disposed=false;
 const gallery=new MiniatureGallery(rows);
 const rules='<details class="identity-rule-disclosure"><summary>身份如何形成</summary>'+Object.values(identityRules).map(p=>'<p>'+escape(p)+'</p>').join('')+'<p><a href="./identity-atlas.html" target="_blank" rel="noopener">查看六张牌与选择的对应关系 ↗</a></p></details>';
 const intro='<section class="role-reading reveal-row"><p class="review-kicker">READING / AFTER THE GAME</p><h2>我的阅读身份 · '+face.name+'</h2><p class="review-context">这是你在前面各单元留下的最终选择，与对局中的补抽身份分别保留。</p>'+paragraphs.map(p=>'<p>'+escape(p)+'</p>').join('')+rules+'</section>';
 const choices=rows.map(row=>'<section class="choice-row reveal-row"><div>'+choiceCopy(row)+'</div><figure data-mini="'+row.unit+'"><img src="'+fallbackURL(row)+'" alt="'+escape(finalSceneName(row))+'的模型"><canvas hidden aria-hidden="true"></canvas></figure></section>').join('');
 container.innerHTML='<div id="trail">'+intro+'<div class="choices-heading reveal-row"><h2>我的最终选择</h2><small>拖动模型可转动观察</small></div>'+choices+'</div><div class="end-actions"><button class="duel-primary" id="export">导出手记与牌面 ↓</button><button id="again">从封面开始新一轮 ↗</button></div>';
 gallery.mount(container,scrollRoot);
 const observer=new IntersectionObserver(items=>{for(const item of items)if(item.isIntersecting){item.target.classList.add('visible');observer.unobserve(item.target);}}, {root:scrollRoot,threshold:0});
 container.querySelectorAll('.reveal-row').forEach(el=>observer.observe(el));
 const button=container.querySelector('#export');button.onclick=()=>exportReview(button,result,gallery,()=>!disposed);
 container.querySelector('#again').onclick=onRestart;
 addResetMenu(container.querySelector('.end-actions'));
 return {dispose(){disposed=true;observer.disconnect();gallery.dispose();container.replaceChildren();}};
}
async function exportReview(button,result,currentGallery,isCurrent){
  if(!result||!currentGallery||button.disabled)return;
  const {face,rows,paragraphs}=result;
  button.disabled=true;
  button.textContent='正在收录模型画面…';
  try {
    const pages=[];
    for(const row of rows) {
      if(!isCurrent())return;
      const image=await currentGallery.picture(row);
      pages.push('<section class="choice-row"><div>'+choiceCopy(row)+'</div><img src="'+image+'" alt="'+escape(finalSceneName(row))+'模型"></section>');
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    if(!isCurrent())return;
    const css='*{box-sizing:border-box}body{max-width:980px;margin:6vh auto;padding:0 5%;background:#fff;color:#20232c;font:16px/1.85 system-ui}h1,h2,h3{font-family:serif}h1{font-size:3.3em}article{clear:both}.choice-row{display:grid;grid-template-columns:1.3fr 1fr;align-items:center;gap:5%;padding:22px 0;border-top:1px solid #ccd2da;break-inside:avoid}.choice-row img{width:100%}.unit-name,small{color:#3043a2}.unit-name span{color:#687485}p,h3{overflow-wrap:anywhere}blockquote{margin:12px 0;padding-left:12px;border-left:2px solid #8697bd;white-space:pre-wrap}@media(max-width:600px){.choice-row{grid-template-columns:1fr}.choice-row>img{max-width:330px}}@media print{body{background:white}.choice-row{page-break-inside:avoid}}';
    const printedCard=await exportCard(face);
    if(!isCurrent())return;
    const html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>灯塔、飞鸟与王座的游戏 · '+face.name+'的手记</title><style>'+css+'</style>'+printedCard+'<small>灯塔、飞鸟与王座的游戏　/　本轮手记</small><h1>'+face.name+'</h1><p>'+escape(face.concept)+'</p><article><h2>为什么是「'+face.name+'」</h2>'+paragraphs.map(p=>'<p>'+escape(p)+'</p>').join('')+'<p>'+escape(identityRules.origin)+'</p><h2>我的最终选择</h2>'+pages.join('')+'</article></html>';
    const url=URL.createObjectURL(new Blob(['\uFEFF',html],{type:'text/html;charset=utf-8'}));
    const link=document.createElement('a');
    link.href=url;
    link.download='之间-'+face.name+'-本轮手记.html';
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    button.textContent='导出手记与牌面 ↓';
  } catch {
    button.textContent='重新导出手记 ↓';
  } finally {button.disabled=false;}
};
