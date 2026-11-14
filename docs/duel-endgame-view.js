import {concepts,conceptById} from './duel-data.js';
import {challengeById,ratingCriteria,scoreTotal,beginEndgame,beginDesigns,openEndgameGate,submitDesign,beginScoring,submitRating,revealEndgame} from './duel-endgame.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titleReason=state=>state.endgame.trigger==='tie'?`常规八轮已结束，双方各剩 ${state.players[0].hp} 颗星，进入决胜终局。`:`${state.players.filter(p=>p.hp<=1).map(p=>esc(p.name)).join('与')}只剩 ${Math.min(...state.players.map(p=>p.hp))} 颗星，进入补救终局。`;
const stepLabel=phase=>phase==='endgame-think'?'00 / 共同思考':phase.includes('write')?'01 / 提出设计':phase==='endgame-exchange'?'02 / 交换与交流':phase.includes('score')?'03 / 独立评分':'04 / 共同揭晓';
const challengeCard=c=>`<section class="endgame-challenge"><p class="duel-kicker">同一道问题 · 同样的机会</p><h2>${c.title}</h2><p class="endgame-question">${c.question}</p><p>${c.detail}</p><p class="endgame-task">${c.task}</p><ul>${c.constraints.map(t=>`<li>${t}</li>`).join('')}</ul></section>`;
const designCard=(s,side)=>{const d=s.endgame.designs[side];return `<article class="endgame-proposal"><p class="duel-kicker">${esc(s.players[side].name)}的提案</p><h3>${conceptById(d.concept).name}</h3><p class="endgame-definition">${conceptById(d.concept).definition}</p><h4>我的设计</h4><p class="endgame-written">${esc(d.plan)}</p><h4>代价与补救</h4><p class="endgame-written">${esc(d.care)}</p></article>`;};

export function endgameResultHTML(state){
 const e=state.endgame;if(!e?.revealed)return '';
 return `<section class="endgame-record"><p class="duel-kicker">THE LAST PROPOSAL / 终局记录</p><h2>${challengeById(e.challenge).title}</h2><p class="duel-fine">双方在评分封存后同时揭晓。终局得分决定本局结果，常规阶段星星不加入终局分数。</p><div class="endgame-proposals">${designCard(state,0)}${designCard(state,1)}</div><div class="endgame-score-table"><table><caption>双方方案收到的评分</caption><thead><tr><th scope="col">维度</th>${state.players.map(p=>`<th scope="col">${esc(p.name)}</th>`).join('')}</tr></thead><tbody>${ratingCriteria.map((c,i)=>`<tr><th scope="row">${c.name}</th><td>${e.ratings[1].values[i]} / 5</td><td>${e.ratings[0].values[i]} / 5</td></tr>`).join('')}<tr class="endgame-total"><th scope="row">总分</th><td>${scoreTotal(e.ratings[1])} / 20</td><td>${scoreTotal(e.ratings[0])} / 20</td></tr></tbody></table></div><div class="endgame-proposals">${state.players.map((p,i)=>`<article class="endgame-rating-note"><h3>${esc(state.players[1-i].name)}给${esc(p.name)}的理由</h3><p class="endgame-written">${esc(e.ratings[1-i].comment)}</p></article>`).join('')}</div><p class="duel-fine">常规阶段星星：${state.players.map(p=>`${esc(p.name)} ${p.hp} 颗`).join(' · ')}。评分是本局中彼此的判断，讨论仍然可以继续。</p></section>`;
}

export function renderEndgame(root,state,{commit,save}){
 const e=state.endgame,c=challengeById(e.challenge),p=state.players[e.active],other=state.players[1-e.active];let timer;
 const q=id=>root.querySelector('#'+id);
 const frame=(heading,body)=>`<section class="endgame-page"><header class="endgame-heading"><p class="duel-kicker">${stepLabel(state.phase)} <span>终局 · 最后的提案</span></p><h1>${heading}</h1></header>${body}</section>`;
 const action=fn=>{try{commit(fn);}catch(error){const target=q('endgame-error');if(target)target.textContent=error.message;}};
 if(state.phase==='endgame-intro'){
  root.innerHTML=`<div class="endgame-arrival"><div class="endgame-glass-light" aria-hidden="true"></div><div class="endgame-arrival-copy"><p>THE LAST PROPOSAL</p><h1>终局</h1><span>${e.trigger==='rescue'?'在最后一颗星熄灭之前。':'让相同的星光，走向各自的判断。'}</span><button id="endgame-show-rules">查看终局规则 ↗</button></div></div><dialog id="endgame-rules-panel" aria-labelledby="endgame-rules-title"><p class="duel-kicker">${e.trigger==='rescue'?'补救终局':'决胜终局'} / WHY WE ARE HERE</p><h2 id="endgame-rules-title">最后一次，把判断变成设计。</h2><p class="endgame-trigger">${titleReason(state)}</p><ol><li><b>共同思考，再提出方案。</b>先一起阅读题目，双方准备好后，再轮流作答。面对同一道新问题，各自选择一个哲学概念，写出具体设计，以及代价与补救。此时不受剩余手牌限制。</li><li><b>交换与交流。</b>双方都提交后，一起阅读两份方案，轮流说明自己的做法。</li><li><b>独立评分。</b>每人给对方评分：概念关联、可执行性、不同处境、代价与补救，各 1–5 分，并写明理由。轮流操作，另一位暂时移开视线。</li><li><b>同时揭晓。</b>两份评分都封存后共同揭晓。方案得分较高者获胜；同分仍为平局，共享王座。</li></ol><p class="duel-fine">常规阶段在这里停止。原有星星保留在记录中，不叠加到终局分数；双方以同样的机会完成最后一次设计。系统不自动评判方案文字。</p><button id="endgame-understood" class="duel-primary">明白，查看共同题目 →</button></dialog>`;
  const d=q('endgame-rules-panel');const show=()=>{if(d.isConnected&&!d.open)d.showModal();};
  q('endgame-show-rules').onclick=show;q('endgame-understood').onclick=()=>{d.close();action(beginEndgame);};
  timer=setTimeout(show,matchMedia('(prefers-reduced-motion:reduce)').matches?100:1900);
  return ()=>{clearTimeout(timer);if(d.open)d.close();};
 }
 if(state.phase==='endgame-think'){
  root.innerHTML=frame('同一道问题，两个出发点',`${challengeCard(c)}<section class="endgame-think"><p>先一起阅读，给彼此一些思考的时间。这里没有倒计时；双方准备好后，再由${esc(state.players[state.first].name)}开始独立作答。</p><div class="endgame-ready">${state.players.map((player,i)=>`<label><input type="checkbox" data-ready="${i}"><span>${esc(player.name)}已准备好</span></label>`).join('')}</div><button id="endgame-begin-designs" class="duel-primary" disabled>双方已准备好，轮流作答 →</button></section>`);
  root.querySelectorAll('[data-ready]').forEach(input=>input.onchange=()=>{q('endgame-begin-designs').disabled=![...root.querySelectorAll('[data-ready]')].every(x=>x.checked);});
  q('endgame-begin-designs').onclick=()=>action(beginDesigns);
 }else if(['endgame-write-gate','endgame-score-gate'].includes(state.phase)){
  const scoring=state.phase==='endgame-score-gate';
  root.innerHTML=frame(`把屏幕交给${esc(p.name)}`,`<section class="endgame-gate"><div class="endgame-seal" aria-hidden="true">✦</div><p class="endgame-gate-message">${scoring?`接下来由你独立评价${esc(other.name)}的方案。`:'接下来由你独立写下设计方案。'}</p><p>请另一位旅人暂时移开视线。<br>${scoring?'对方已提交的评分不会在这里出现，双方封存后再同时揭晓。':'已提交的方案暂不展示，双方完成后一起交流。'}</p><div class="endgame-seals">${state.players.map((player,i)=>`<span>${esc(player.name)} · ${(scoring?e.ratings[i]:e.designs[i])?'已封存':'待完成'}</span>`).join('')}</div><button id="endgame-open" class="duel-primary">我是${esc(p.name)}，开始${scoring?'评分':'设计'} →</button></section>`);
  q('endgame-open').onclick=()=>action(openEndgameGate);
 }else if(state.phase==='endgame-write'){
  const d=e.drafts[e.active];
  root.innerHTML=frame(`${esc(p.name)}的设计`,`${'<details class="endgame-reference"><summary>共同题目 · '+c.title+'</summary>'+challengeCard(c)+'</details>'}<form id="endgame-design-form" class="endgame-form"><label for="endgame-concept">用哪个概念改变这个设计？</label><select id="endgame-concept" required><option value="">选择一个哲学概念</option>${concepts.map(x=>`<option value="${x.id}" ${d.concept===x.id?'selected':''}>${x.name}</option>`).join('')}</select><p id="endgame-concept-definition" class="duel-fine">${d.concept?conceptById(d.concept).definition:'所有概念均可选择，关键在于它怎样影响你的做法。'}</p><label for="endgame-plan">具体设计：你改变什么，由谁来做，如何运作？</label><textarea id="endgame-plan" minlength="20" maxlength="800" required placeholder="我选择这个概念，因为……我设计的机制是……参与者可以……">${esc(d.plan)}</textarea><label for="endgame-care">代价与补救：谁可能仍被忽略？失败或误判时怎么办？</label><textarea id="endgame-care" minlength="8" maxlength="400" required placeholder="这个方案的限制是……我会给受影响的人保留……">${esc(d.care)}</textarea><p class="duel-fine">提交后封存，另一位完成前不会展示。先把自己的设计想清楚。</p><p id="endgame-error" role="alert"></p><button class="duel-primary" type="submit">${e.designs[1-e.active]?'封存方案，进入交流':'封存方案，交给下一位'} →</button></form>`);
  q('endgame-concept').onchange=x=>{d.concept=x.target.value||null;q('endgame-concept-definition').textContent=conceptById(d.concept)?.definition||'所有概念均可选择。';save();};
  q('endgame-plan').oninput=x=>{d.plan=x.target.value;save();};q('endgame-care').oninput=x=>{d.care=x.target.value;save();};
  q('endgame-design-form').onsubmit=x=>{x.preventDefault();action(submitDesign);};
 }else if(state.phase==='endgame-exchange'){
  root.innerHTML=frame('交换你们的方案',`${challengeCard(c)}<p class="endgame-instruction">先请${esc(state.players[state.first].name)}说明，再请另一位回应。交流后进入独立评分；此时两份方案都已封存。</p><div class="endgame-proposals">${designCard(state,0)}${designCard(state,1)}</div><button id="endgame-score-start" class="duel-primary">交流完成，开始独立评分 →</button>`);
  q('endgame-score-start').onclick=()=>action(beginScoring);
 }else if(state.phase==='endgame-score'){
  const r=e.ratingDrafts[e.active];
  root.innerHTML=frame(`${esc(p.name)}，请评价对方`, `<p class="endgame-instruction">你正在给${esc(other.name)}评分。请另一位暂时移开视线；已封存的评分不会提前展示。</p><details class="endgame-reference"><summary>阅读${esc(other.name)}的方案 · ${conceptById(e.designs[1-e.active].concept).name}</summary>${designCard(state,1-e.active)}</details><form id="endgame-score-form" class="endgame-form"><p class="duel-fine">1 分：需要重新思考 · 3 分：基本成立 · 5 分：清楚而有说服力。请依据方案中的具体内容选择。</p>${ratingCriteria.map((criterion,i)=>`<fieldset class="endgame-criterion"><legend>${criterion.name}</legend><p>${criterion.hint}</p><div>${[1,2,3,4,5].map(value=>`<label><input type="radio" name="${criterion.id}" value="${value}" data-rating="${i}" ${r.values[i]===value?'checked':''} required><span>${value}</span></label>`).join('')}</div></fieldset>`).join('')}<label for="endgame-rating-reason">评分理由：请指出你认可的地方，以及最需要改进的一点。</label><textarea id="endgame-rating-reason" minlength="8" maxlength="400" required>${esc(r.comment)}</textarea><p class="duel-fine">封存后不能修改。你提交的分数现在不会向对方显示。</p><p id="endgame-error" role="alert"></p><button class="duel-primary" type="submit">${e.ratings[1-e.active]?'封存评分，等待揭晓':'封存评分并交接'} →</button></form>`);
  root.querySelectorAll('[data-rating]').forEach(input=>input.onchange=()=>{r.values[+input.dataset.rating]=+input.value;save();});
  q('endgame-rating-reason').oninput=x=>{r.comment=x.target.value;save();};q('endgame-score-form').onsubmit=x=>{x.preventDefault();action(submitRating);};
 }else if(state.phase==='endgame-reveal'){
  root.innerHTML=frame('两份判断，已经封存',`<section class="endgame-gate"><div class="endgame-seal" aria-hidden="true">✦</div><p class="endgame-gate-message">请两位旅人一起回到屏幕前。</p><div class="endgame-seals">${state.players.map(player=>`<span>${esc(player.name)} · 评分已封存</span>`).join('')}</div><p>下一步将同时公开双方评分与理由。<br>高分者获胜；同分则共享王座。</p><button id="endgame-reveal" class="duel-primary">共同揭晓，抵达王座 →</button></section>`);
  q('endgame-reveal').onclick=()=>action(revealEndgame);
 }
 return ()=>{};
}
