import {settleWithin} from './load-budget.js';
import {warmStage} from './loading-policy.js';
import {setMusic} from './music.js';
import {proposals,withProposalLayer,proposalAt,proposalAction,proposalStatus} from './proposal-content.js';
import {proposalReading,renderProposalControls,proposalPrimaryAction} from './proposal-view.js';
import {enterPrologue,leavePrologue} from './prologue.js';
import {finishCoverEntrance} from './cover-entrance.js';
import {aiCases,aiAt,aiStatus,withAILayers,legacyAIAnswers} from './ai-content.js';
import {presentUnit,unfoldUnit,turnSheet} from './chapter-poster.js';
import {prepareEpilogue} from './chapter-transit.js';
import {mountReaderPrint} from './reader-print.js';
import {prepareStudy} from './model-library.js';
import {addResetMenu} from './reset-reading.js';
import {initialStudyOptions} from './study-state.js';
import {initTutorial,enterTutorial,leaveTutorial,tutorialStep} from './tutorial.js';
import {originals,originalMarkup,gathering,boundaryResult,powerResult,echoes,reflectionOptions} from './reader-extras.js';
import {round, record, rememberFinalScene, note as recordNote} from './reading-round.js';
import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {FocusLens} from './focus.js';
import {makeStudy} from './dialogue-scenes.js';
import {createRefractionLight} from './refraction-light.js';
import {studies,bookSource} from './dialogue-content.js';
const $=id=>document.getElementById(id),reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
mountReaderPrint(document.querySelector('.reader-print'));
let key=round.notebookKey||'between-dialogue-notes-v1';
let current=-1,step=0,inspect=false,busy=false,model,renderer,scene,camera,controls,lens,elapsed=0,last=performance.now(),pause=0,held=false,wheelTime=-Infinity,storageAvailable=true,refractionLight;
const options=structuredClone(initialStudyOptions);
const initialOptions=structuredClone(options);
const finaleIndex=studies.length;
const startIndex=-.75,prologueIndex=-.625;
const isOpening=index=>index===-1 || index===startIndex || index===prologueIndex;
let initialized3D=false, unitOpen=false;
let inFinale=false, finale, readerReady=false, pendingRoute=null;
const topics=['工具性','公共','权力','私人领域','异化','异化二','暴力'],english=['INSTRUMENTALITY','THE PUBLIC','POWER','THE PRIVATE REALM','WORLD ALIENATION','WORLD ALIENATION II','VIOLENCE'];
const hints=['换一种材料，再打开入口。看看同一条边界，怎样改变不同人的路线。','对照卡姆登长椅，再回到你的改造：移动扶手，或留出伴坐空位。','撤回支持和拒绝执行，是两件不同的事。改变关系，再试一次按钮。','分别关闭精确定位与商业用途。天气仍然显示，数据的去向发生变化。','先选用袋方式，再按顺序领取、购物、处理。一次性袋留下废弃物，循环袋回到归还柜。','向右穿过三条街：交换、需要、身份。每一幕都能动手改变一次。','展开玻璃墙，让被遮住的人出现。撤去工具之后，人与人的关系仍待建立。'];
const layerNames=['初印象','自由探索','最终想法'];
const privacyLayers=['初印象','天气之外','被了解的日常','最终想法'];
const publicLayers=['初印象','谁的长椅','展开式议事幕','从一人到众人','最终想法'];
const meetingCopy=[['一层幕打开之后，就成为公共空间了吗？','展开三片玻璃议事幕，让座位彼此可见、入口向外打开。'],['人们陆续来到这里，会发生什么？','从一个人坐下，到不同的人共同在场。逐步邀请更多人进入。']];
const streetLayers=['初印象','交换集市','日用商街','身份橱窗','最终想法'];
const streetCopy=[['我拿出自己有的，换来自己缺少的。','点击交换，两人的物品穿过同一张桌子。'],['如果已经够用，购买可以在这里停下吗？','把面包和杯子装入袋中，清单完成，按钮也会停下。'],['当标签被摘掉，我还想要同一个物件吗？','摘掉身份标签，物件仍然留下，追随它的视线发生改变。']];
const layers=()=>withProposalLayer(current,withAILayers(current,current===5?streetLayers:current===1?publicLayers:current===3?privacyLayers:layerNames)),lastStep=()=>layers().length-1,interactive=()=>step>0&&step<lastStep();
const bagAction=()=>['① 领取购物袋','② 完成购物',options[4].reuse?'③ 归还袋子':'③ 丢弃袋子','再次领取'][options[4].phase];
const streetAction=()=>{const o=options[5];return o.era===0?(o.exchanged?'换回物品':'交换物品'):o.era===1?(o.bought?'清单已完成 ✓':'买够所需'):(o.status?'摘掉身份标签':'放回身份标签');};
const erased=new Set();let bagTimer=0,bagLockedUntil=0;
let layerBusy=false,layerTimer=0;
const zooms=new Map();let entries={};try{const data=JSON.parse(localStorage.getItem(key)||'{}');if(data&&typeof data==='object'&&!Array.isArray(data))entries=data;}catch{storageAvailable=false;}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function entry(){return entries[studies[current].id]??={};}
function save(){try{localStorage.setItem(key,JSON.stringify(entries));storageAvailable=true;}catch{storageAvailable=false;}countNotes();}
function countNotes(){$('note-count').textContent=Object.values(entries).filter(e=>e.before||e.after||e.note).length;}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2500);}
function chosen(items,field,e){return `<div class="responses" role="group" aria-label="${field==='before'?'最初的判断':'现在的判断'}">${items.map(v=>`<button data-answer="${esc(v)}" data-field="${field}" aria-pressed="${e[field]===v}">${esc(v)}</button>`).join('')}</div>`;}
function setStep(n,animate=false){
 n=Math.max(0,Math.min(lastStep(),n));if(!unitOpen||current<0||layerBusy||busy&&animate)return;
 const direction=n>step?1:-1;if(current===0&&n===1&&step!==1)options[0].replay++;step=n;document.body.dataset.layer=n;document.body.classList.toggle('scene-controls-open',interactive());if(current===5)options[5].era=Math.max(0,Math.min(2,n-1));
 const nextProposal=proposalAt(current,n,lastStep()),nextAI=nextProposal?'':aiAt(current,n);const switchesScene=!!options[current].proposalActive!==nextProposal||(options[current].aiCase||'')!==nextAI||(current===1&&options[1].meeting!==(n>=2))||(current===3&&options[3].chamber!==(n===2));if(switchesScene&&animate&&!reduce)$('stage').classList.add('scene-switching');
 const render=()=>{$('reading').scrollTop=0;const s=studies[current],e=entry();record(s.id,'阅读',layers()[n]);document.body.dataset.readingPhase=n===0?'impression':n===lastStep()?'reflection':'explore';if(current===3){options[3].chamber=n===2;resize();if(switchesScene)setTimeout(()=>$('stage').classList.remove('scene-switching'),60);}if(current===1){options[1].meeting=n>=2;if(n===3){options[1].open=true;if(!options[1].gather)options[1].gather=1;}if(n===2)options[1].gather=0;if(switchesScene){resize();setTimeout(()=>$('stage').classList.remove('scene-switching'),60);}}
  options[current].aiCase=nextAI;document.body.dataset.aiCase=nextAI;options[current].proposalActive=nextProposal;document.body.dataset.proposal=nextProposal?proposals[current].id:'';
  if(switchesScene)setTimeout(()=>{$('stage').classList.remove('scene-switching');resize();},60);
  if(n===0)$('step-content').innerHTML=`<p class="quote">“${s.question}”</p>${chosen(s.choices,'before',e)}`;
  if(n>0&&n<lastStep())$('step-content').innerHTML=`<p class="quote">“${current===3&&n===2?'越少亲自吩咐，就意味着越多生活被了解吗？':current===5?streetCopy[options[5].era][0]:current===1&&n>=2?meetingCopy[n-2][0]:s.counter}”</p><p class="body-copy">${current===3&&n===2?'从临时吩咐，到熟悉口味与日常。看看更贴心的服务，背后多了哪些被记住的事。':current===5?streetCopy[options[5].era][1]:current===1&&n>=2?meetingCopy[n-2][1]:hints[current]}</p>`;
  if(nextAI){const c=aiCases[nextAI];$('step-content').innerHTML=`<p class="ai-reading-kicker">AI 时代 / 思辨情境</p><p class="quote">“${c.question}”</p><p class="body-copy">${c.hint}</p><p class="ai-concept-bridge">${c.bridge}</p>`;}
  if(nextProposal)$('step-content').innerHTML=proposalReading(current);
  if(n===lastStep())$('step-content').innerHTML=`${e.before?'<p class="reflect-before">最初的我：'+esc(e.before)+'</p>':''}<p class="quote">“${s.after}”</p>${chosen(s.afterChoices,'after',e)}<button id="custom-answer-toggle" class="custom-answer-toggle" aria-expanded="${!!e.customActive}">＋ 写自己的答案 / 问题</button><div id="custom-answer-area" ${e.customActive?'':'hidden'}><label for="custom-answer">我的答案或新问题</label><input id="custom-answer" maxlength="140" value="${esc(e.customDraft||'')}" placeholder="没有合适的选项，也可以自己写…"></div><label class="sr-only" for="reflection">写下你的理由或问题</label><textarea id="reflection" maxlength="1200" placeholder="补充理由（选填，也可以留白）…">${esc(e.note||'')}</textarea><p class="save-note" id="save-status">${storageAvailable?'仅保存在这个浏览器 · 自动保存':'无法在此保存，可导出批注'}</p>`;
  $('step-content').querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{entry()[b.dataset.field]=b.dataset.answer;if(b.dataset.field==='after'){rememberFinalScene(s.id,options[current],elapsed);entry().customActive=false;$('custom-answer-area').hidden=true;$('custom-answer-toggle').setAttribute('aria-expanded','false');}record(s.id,'回应',b.dataset.answer,b.dataset.field);save();$('step-content').querySelectorAll('[data-field]').forEach(a=>a.setAttribute('aria-pressed',String(a.dataset.answer===b.dataset.answer)));renderEcho();renderControls();resize();});
  if($('custom-answer-toggle')){
   $('custom-answer-toggle').onclick=()=>{const e=entry();e.customActive=!e.customActive;$('custom-answer-area').hidden=!e.customActive;$('custom-answer-toggle').setAttribute('aria-expanded',String(e.customActive));save();if(e.customActive)$('custom-answer').focus();};
   $('custom-answer').oninput=event=>{const e=entry();e.customDraft=event.target.value;e.after=e.customDraft.trim();rememberFinalScene(s.id,options[current],elapsed);record(s.id,'回应',e.after,'after');save();document.querySelectorAll('[data-field="after"]').forEach(b=>b.setAttribute('aria-pressed','false'));renderEcho();};
  }
  if($('reflection'))$('reflection').oninput=e=>{entry().note=e.target.value;recordNote(s.id,e.target.value);save();$('save-status').textContent=storageAvailable?'已保存 · 仅自己可见':'无法在此保存，可导出批注';};
  $('layer-name').textContent=layers()[n];$('layer-count').textContent='0'+(n+1)+' / 0'+layers().length;$('layer-prev').disabled=n===0;$('layer-next').disabled=n===lastStep();
  $('layer-next').setAttribute('aria-label',n<lastStep()?'下一层：'+layers()[n+1]:'已到最后一层');$('layer-prev').setAttribute('aria-label',n>0?'上一层：'+layers()[n-1]:'已到第一层');
  document.querySelector('.layer-marks').innerHTML=layers().map((_,i)=>'<i class="layer-mark '+(i===n?'active':'')+'"></i>').join('');
  $('object-controls').inert=!(interactive()||inspect);renderControls();renderAnnotations();renderEcho();$('reading-body').scrollTop=0;if(innerWidth<701)window.scrollTo(0,0);
 };
 clearTimeout(layerTimer);
 if(!animate||reduce){render();return;}
 layerBusy=true;const pane=$('step-content');pane.style.setProperty('--slide',direction*32+'px');pane.classList.add('layer-out');
 layerTimer=setTimeout(()=>{render();pane.classList.remove('layer-out');pane.classList.add('layer-in');requestAnimationFrame(()=>requestAnimationFrame(()=>pane.classList.remove('layer-in')));layerTimer=setTimeout(()=>{layerBusy=false;},420);},180);
}
function changeLayer(n){if(current===-.5){tutorialStep(n>step?1:-1);return;}if(current>=0&&!inspect&&!busy&&!layerBusy&&n>=0&&n<=lastStep()&&n!==step)setStep(n,true);}
const icons=[
 ['<path d="M5 29V9m38 20V9M5 14q19 16 38 0"/>','<path d="M5 29V9m38 20V9M5 15h38M5 23h38"/>','<path d="M5 31V5m38 26V5M5 9h38M5 27h38M13 9v18m8-18v18m7-18v18m7-18v18"/>'],
 ['<path d="M5 21h38M8 11h32v10M9 21v10m30-10v10M19 15v9m10-9v9"/>','<path d="M5 21h38M8 11h32v10M9 21v10m30-10v10M5 15v9m38-9v9"/>','<path d="M4 21h24M6 11h20v10M7 21v10m18-10v10M4 15v9m24-9v9m8-16v12h8m-7-5a7 7 0 1 0 7 7"/>']
];
function pictogram(i){return '<svg viewBox="0 0 48 36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[current][i]+'</svg>';}
function toggle(name,label,on){return `<button class="switch" data-toggle="${name}" role="switch" aria-checked="${on}"><span class="switch-track" aria-hidden="true"></span><span>${label}</span></button>`;}

function renderAIControls(o,final=false){
 const c=aiCases[o.aiCase],mode=o[c.field]||0,root=$('object-controls');
 $('design-name').textContent=c.name;
 root.innerHTML=`<div class="ai-state-controls" role="group" aria-label="${c.name}的演示方式">${c.modes.map((name,i)=>`<button data-ai-mode="${i}" aria-pressed="${mode===i}" ${final?'disabled':''}><span class="ai-mode-number">0${i+1}</span><span>${name}</span></button>`).join('')}</div><div class="ai-actions">${final?'<span>最终场景随你的答案改变</span>':`<button class="ai-advance" id="ai-advance">${o.aiCase==='door'?(mode===2?'从头演示 ↻':c.action+' →'):c.action+' →'}</button>${o.aiCase==='process'?`<button class="ai-challenge" id="ai-challenge" aria-pressed="${!!o.processChallenge}">${o.processChallenge?'移除新增要求 −':'加入一条新要求 ＋'}</button>`:''}`}</div><p class="control-status" aria-live="polite">${aiStatus(o)}</p>`;
 root.querySelectorAll('[data-ai-mode]').forEach(b=>b.onclick=()=>{options[current][c.field]=+b.dataset.aiMode;changed();root.querySelector(`[data-ai-mode="${b.dataset.aiMode}"]`)?.focus({preventScroll:true});});
 if($('ai-advance'))$('ai-advance').onclick=advanceAI;
 if($('ai-challenge'))$('ai-challenge').onclick=()=>{options[current].processChallenge=!options[current].processChallenge;changed();$('ai-challenge')?.focus({preventScroll:true});};
 $('hotspot-label').textContent=c.action;
}
function advanceAI(){const o=options[current],c=aiCases[o.aiCase];if(!c||!interactive())return;o[c.field]=((o[c.field]||0)+1)%c.modes.length;changed();}

function renderControls(){if(current<0)return;const o=options[current];let html='';
 $('design-name').textContent=studies[current].title.join('');
 const final=step===lastStep(),preview=final?reflectionOptions(current,step,lastStep(),entry(),o,elapsed):o;
 if(o.proposalActive){$('design-name').textContent=proposals[current].name;renderProposalControls($('object-controls'),current,o.proposalState,action=>{if(proposalAction(current,o.proposalState,action))changed();});return;}
 if(aiCases[preview.aiCase]){renderAIControls(preview,final);return;}
 if(current<2){const names=current===0?['绳索','硬质低栏','高密金属']:['中间分隔','两端扶手','伴坐空位'];html=`<div class="material-selector" role="group" aria-label="${current===0?'围栏材料':'长椅结构'}">${names.map((n,i)=>`<button data-material="${i}" aria-pressed="${o.material===i&&!o.reference}">${pictogram(i)}<span>${n}</span></button>`).join('')}</div>`;
  if(current===0)html+=`<div class="switch-row">${toggle('gate','打开入口',o.gate)}${toggle('wheelchair','轮椅通行',o.wheelchair)}${toggle('hazard','施工区域',o.hazard)}<button class="view-button" id="replay-route">再走一次 ↻</button></div>`;
  else html+=`<div class="switch-row"><button class="reference-feature" id="camden-reference" aria-pressed="${o.reference}"><span>↗</span><span>对照卡姆登长椅<small>原图与模型</small></span></button><button class="view-button" id="look-side"><span aria-hidden="true">↻</span> 转到侧面</button></div>`;
 }else if(current===2)html=`<div class="power-row"><button class="command-button" id="command"><span class="command-disc" aria-hidden="true">↓</span><span>发出命令</span></button><div class="power-switches">${toggle('support','有人支持',o.support)}${toggle('execute','有人执行',o.execute)}</div><button class="view-button" id="look-back"><span aria-hidden="true">↻</span> 转到背面</button></div>`;
 if(current===1&&o.meeting)html=step===2?`<div class="case-controls"><button class="command-button" id="open-meeting"><span class="command-disc" aria-hidden="true">${o.open?'↙':'↗'}</span><span>${o.open?'收拢议事幕':'展开议事幕'}</span></button><span class="control-caption">三片玻璃幕 · 四个平等座位</span><button class="view-button" id="look-meeting">转动观察 ↻</button></div>`:`<div class="case-controls gathering-controls"><button class="command-button" id="next-arrival"><span class="command-disc" aria-hidden="true">${o.gather===5?'↻':'＋'}</span><span>${o.gather===5?'从一人重新开始':'邀请下一批人'}</span></button><div class="arrival-steps" role="group" aria-label="人们逐步来到公共空间">${gathering.map((name,i)=>`<button data-gather="${i+1}" aria-label="${i+1} ${name}" aria-pressed="${o.gather===i+1}">${i+1}</button>`).join('')}</div></div>`;
 if(current===3&&!o.chamber)html=`<div class="case-controls"><div class="case-switches">${toggle('precise','精确定位',o.precise)}${toggle('commercial','广告用途',o.commercial)}</div><button class="view-button" id="show-explanation">显示说明 ↗</button></div>`;
 if(current===3&&o.chamber)html=`<div class="service-states" role="group" aria-label="服务熟悉程度">${['临时吩咐','记住口味','熟悉日常'].map((text,i)=>`<button data-service="${i}" aria-pressed="${o.service===i}"><span>0${i+1}</span>${text}</button>`).join('')}</div>`;
 if(current===4)html=`<div class="bag-progress" aria-label="用袋流程"><span class="${o.phase===0?'active':''}">领取</span><i>→</i><span class="${o.phase===1?'active':''}">购物</span><i>→</i><span class="${o.phase>=2?'active':''}">${o.reuse?'归还':'丢弃'}</span><small>已购物 ${o.trips} 次 · 留下 ${o.waste} 个袋子${o.reuse?' · 已归还 '+o.returned+' 次':''}</small></div><div class="case-controls bag-controls"><button class="command-button" id="shop"><span class="command-disc" aria-hidden="true">${o.phase===3?'↻':'→'}</span><span>${bagAction()}</span></button>${toggle('reuse','使用循环袋',o.reuse)}<button class="view-button" id="clear-trips">重来 ↺</button></div>`;
 if(current===5)html=`<div class="street-progress"><span>${['早期','中期','当代'][o.era]} / 0${o.era+1}</span><strong>${['交换集市','日用商街','身份橱窗'][o.era]}</strong><small>← 向左右穿越 →</small></div><div class="case-controls street-controls"><button class="command-button" id="street-action" ${o.era===1&&o.bought?'disabled':''}><span class="command-disc" aria-hidden="true">${['⇄','＋',o.status?'−':'＋'][o.era]}</span><span>${streetAction()}</span></button><span class="control-caption">${['交换彼此的物品','需要被满足之后','物件不变，标签改变'][o.era]}</span></div>`;
 if(current===6)html=`<div class="violence-states" role="group" aria-label="展陈状态">${['封闭展柜','展开后果','撤去工具'].map((text,i)=>`<button data-exhibit="${i}" aria-pressed="${o.stage===i}"><span aria-hidden="true">${['▯','↔','↓'][i]}</span>${text}</button>`).join('')}</div>`;
 $('object-controls').innerHTML=html+(originals[current]&&current!==1&&!(current===3&&o.chamber)?`<button class="original-link" id="view-original">查看课堂案例原图 ↗</button>`:'')+`<p class="control-status" aria-live="polite">${shortStatus()}</p>`;
 $('object-controls').querySelectorAll('[data-material]').forEach(b=>b.onclick=()=>{o.material=+b.dataset.material;if(current===1)o.reference=false;changed();});
 $('object-controls').querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{o[b.dataset.toggle]=!o[b.dataset.toggle];if(current===4&&b.dataset.toggle==='reuse'){o.phase=0;o.actionAt=-100;bagLockedUntil=0;}changed();});
 if($('replay-route'))$('replay-route').onclick=()=>{o.replay++;changed();};
 if($('camden-reference'))$('camden-reference').onclick=()=>{o.reference=true;changed();showOriginal();};
 if($('view-original'))$('view-original').onclick=showOriginal;
 if($('next-arrival'))$('next-arrival').onclick=meetingTurn;
 $('object-controls').querySelectorAll('[data-gather]').forEach(b=>b.onclick=()=>{o.gather=+b.dataset.gather;changed();});
 $('object-controls').querySelectorAll('[data-service]').forEach(b=>b.onclick=()=>{o.service=+b.dataset.service;changed();});
 if($('command'))$('command').onclick=command;if($('look-back'))$('look-back').onclick=()=>rotateTo(Math.PI);if($('look-side'))$('look-side').onclick=()=>rotateTo(1.6);
 if($('open-meeting'))$('open-meeting').onclick=()=>{o.open=!o.open;changed();};
 if($('look-meeting'))$('look-meeting').onclick=()=>rotateTo(1.6);


 if($('shop')){$('shop').onclick=shop;const locked=performance.now()<bagLockedUntil;$('shop').disabled=locked;const mode=$('object-controls').querySelector('[data-toggle="reuse"]');mode.disabled=o.phase===1||o.phase===2||locked;mode.title=mode.disabled?'完成这一轮后可以换一种用袋方式':'';}
 if($('clear-trips'))$('clear-trips').onclick=()=>{clearTimeout(bagTimer);bagLockedUntil=0;Object.assign(o,{waste:0,trips:0,returned:0,phase:0,actionAt:-100});changed();};
 if($('street-action'))$('street-action').onclick=streetInteract;
 if($('show-explanation'))$('show-explanation').onclick=()=>{erased.clear();renderAnnotations();};
 $('object-controls').querySelectorAll('[data-exhibit]').forEach(b=>b.onclick=()=>{o.stage=+b.dataset.exhibit;changed();});
 $('hotspot-label').textContent=current===0?(o.gate?'关闭入口':'打开入口'):current===1?(o.meeting?(step===2?(o.open?'收拢议事幕':'展开议事幕'):(o.gather===5?'重新聚集':'邀请更多人')):(o.reference?'回到改造':'移动扶手')):current===2?'按下按钮':current===3?(o.commercial?'关闭广告用途':'打开广告用途'):current===4?bagAction():current===5?streetAction():['展开玻璃墙','撤去工具','重新观看'][o.stage];
 if(current===3)$('design-name').textContent=o.chamber?'被了解的日常 / 私室与侍从':'天气之外的位置';
 if(current===1)$('design-name').textContent=o.meeting?'展开式议事幕':o.reference?'卡姆登长椅 / 案例切片':'谁的长椅';
}
function shortStatus(){const o=options[current];if(o.proposalActive)return proposalStatus(current,o.proposalState);if(aiCases[o.aiCase])return aiStatus(o);if(current===0)return boundaryResult(o);
 if(current===1&&o.meeting)return step===2?(o.open?'幕已展开。开放的场地，还需要人们参与。':'先展开幕片，看看入口与座位怎样改变。'):`0${o.gather} / 05 · ${gathering[o.gather-1]||'等待有人来到'}。${o.gather===5?'不同的人共在，公共生活仍需彼此言说与回应。':'继续邀请，让空间逐渐成为相遇的地方。'}`;
 if(current===1)return o.reference?'曲面安排身体，也在选择哪些停留方式受到欢迎。':['分隔了座位，也限制了躺卧。','留下连续座面，保留起身支撑。','轮椅使用者也能与同伴并排。'][o.material];
 if(current===2)return powerResult(o);
 if(current===3)return o.chamber?['只在吩咐时服务，尚不记住你的偏好。','记住饮食口味，减少每一次的重复说明。','熟悉作息与习惯，更少吩咐，也更多被了解。'][o.service]:!o.precise?'改为手动选城，天气仍然可以显示。':!o.commercial?'位置只用于天气，商业支路已经关闭。':'服务天气的位置，也流向了商业支路。';
 if(current===4)return ['先选择袋子，再点击领取。','袋子已到手，下一步完成这次购物。',o.reuse?'购物完成，把袋子送回归还柜。':'购物完成，丢弃后它仍留在环境里。',o.reuse?'袋子已归还，可以再次使用；已有废弃物仍然留下。':'这次使用结束，留下的袋子增加了。'][o.phase];
 if(current===5)return o.era===0?(o.exchanged?'交换完成：双方拿到了对方的物品。':'物件的意义，首先来自彼此需要。'):o.era===1?(o.bought?'面包和杯子已经够用，购买在这里停下。':'一份有限的清单：面包与杯子。'):(o.status?'当购买变成身份证明，欲望还会有终点吗？':'标签被摘掉了，同一个袋子还在橱窗里。');
 return ['玻璃墙把器物与人的处境隔开。点击展开。','墙已打开，工具周围的人进入视野。','工具退场了，分隔与人的处境并不会自动消失。'][o.stage];}
function shop(){const o=options[4];if(performance.now()<bagLockedUntil)return;o.phase=(o.phase+1)%4;if(o.phase===0)o.phase=1;if(o.phase===2)o.trips++;if(o.phase===3){if(o.reuse)o.returned++;else o.waste++;}o.actionAt=elapsed;bagLockedUntil=performance.now()+900;changed();clearTimeout(bagTimer);bagTimer=setTimeout(()=>{if(current===4)renderControls();},1100);}
function streetInteract(){const o=options[5];if(o.era===0)o.exchanged=!o.exchanged;else if(o.era===1)o.bought=true;else o.status=!o.status;changed();}
function meetingTurn(){const o=options[1];o.open=true;o.gather=o.gather>=5?1:o.gather+1;changed();}
function command(){options[2].commandAt=elapsed;record('power','实验','发出命令｜'+powerResult(options[2]));pause=performance.now()+3500;renderAnnotations();renderControls();toast(powerResult(options[2]));}
function hotspotAction(proposalKey){if(!unitOpen||current<0||busy||layerBusy)return;if(!interactive()&&!inspect){setStep(1,true);return;}if(options[current].proposalActive){if(proposalAction(current,options[current].proposalState,typeof proposalKey==='string'?proposalKey:proposalPrimaryAction(current,options[current].proposalState)))changed();return;}if(aiCases[options[current].aiCase]){advanceAI();return;}if(current===0){options[0].gate=!options[0].gate;changed();}else if(current===1){if(options[1].meeting){if(step===2){options[1].open=!options[1].open;changed();}else meetingTurn();return;}if(options[1].reference)options[1].reference=false;else options[1].material=(options[1].material+1)%3;changed();}else if(current===2)command();else if(current===3){if(options[3].chamber)options[3].service=(options[3].service+1)%3;else options[3].commercial=!options[3].commercial;changed();}else if(current===4)shop();else if(current===5)streetInteract();else{options[6].stage=(options[6].stage+1)%3;changed();}}
function positionHotspot(){const el=$('scene-hotspot');if(!camera||!unitOpen||current<0||busy||held||inspect||step===lastStep()||current===3||options[current]?.proposalActive){el.hidden=true;return;}const anchors=[[.62,.92,0],[0,1.08,-.18],[0,.45,1.36],[1.5,1.1,.2],[-.25,1.1,.62],[0,1.3,-.3],[0,1.2,0]],p=new T.Vector3(...(aiCases[options[current].aiCase]?[0,1.5,.1]:current===1&&options[1].meeting?[0,.65,0]:anchors[current])).project(camera),r=$('stage').getBoundingClientRect(),x=r.left+(p.x+1)*r.width/2,y=r.top+(1-p.y)*r.height/2;el.hidden=p.z>1||x<r.left+12||x>r.right-8||y<r.top+15||y>r.bottom-15;el.style.transform='translate('+Math.round(Math.min(x,r.right-el.offsetWidth+12))+'px,'+Math.round(y)+'px)';}

function renderAnnotations(){
 const el=$('scene-annotations');let copy=[];const o=options[current];
 if(o?.aiCase||o?.proposalActive){el.replaceChildren();return;}
 if(current===2)copy=[o.support?'“我们仍然支持这件事。”':'“我们撤回支持。”',o.execute?'“我会执行，结果由我完成。”':'“我拒绝执行这条命令。”'];
 if(current===3)copy=o.chamber?[['“请来时再问我的需要。”','“你已经知道我喜欢喝什么。”','“你知道我的口味、作息和习惯。”'][o.service],['“请告诉我这次要准备什么。”','“我记住了你的口味。”','“我提前安排好了你的一天。”'][o.service]]:[o.precise?'你的位置用于天气。也可以关闭精确定位，只选城市。':'改为手动选城，天气仍然显示。',o.precise&&o.commercial?'这条支路把位置送往广告用途。试着关闭下方开关。':'广告支路已断开，天气服务仍在。'];
 el.innerHTML=copy.map((text,i)=>current===3&&!o.chamber&&erased.has(i)?'':`<div class="scene-note ${current===2||o.chamber?'spoken-note':''}" data-note="${i}"><p>${text}</p><button aria-label="收起这条说明" data-erase="${i}">×</button></div>`).join('');
 el.querySelectorAll('[data-erase]').forEach(b=>b.onclick=()=>{if(current===3&&!o.chamber)erased.add(+b.dataset.erase);b.closest('.scene-note').remove();});
}
function positionAnnotations(){
 const el=$('scene-annotations');el.hidden=!!options[current]?.aiCase||!!options[current]?.proposalActive||![2,3].includes(current)||busy||held||inspect||step===lastStep()||step===0;if(el.hidden||!camera)return;
 const mobile=innerWidth<701,r=$('stage').getBoundingClientRect();el.querySelectorAll('.scene-note').forEach(note=>{const i=+note.dataset.note,anchors=current===2?[[-1.65,1.8,1.1],[2.35,1.8,.95]]:options[3].chamber?[[-1.25,1.7,0],[1.4,1.9,.3]]:[[-.45,2.8,0],[1.45,1.95,.3]],p=new T.Vector3(...anchors[i]).project(camera);let x=r.left+(p.x+1)*r.width/2,y=r.top+(1-p.y)*r.height/2;
 const noteWidth=note.offsetWidth; x=T.MathUtils.clamp(x+(i===0?-noteWidth:10),r.left+4,r.right-noteWidth-4);y=mobile?r.top+12+i*(note.offsetHeight+10):T.MathUtils.clamp(y-50,r.top+12,r.bottom-110);
 note.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px)';});
}
function showOriginal(){record(studies[current].id,'阅读','查看课堂案例原图');showDialog('CASE ARCHIVE / 课堂原图',originalMarkup(current));$('dialog').classList.add('original-dialog');}
function renderEcho(){const el=$('reflection-echo');if(current<0||step!==lastStep()||!entry().after){el.hidden=true;return;}const i=studies[current].afterChoices.indexOf(entry().after);el.hidden=false;if(current===3)$('design-name').textContent='私室与天气 / 便利的边界';el.textContent=i<0?((legacyAIAnswers[studies[current].id]||[]).includes(entry().after)?'已保留你上一版的最终回答。也可以在新情境之后重新选择。':'你提出的新答案或问题，已留在这一场景的手记中。'):echoes[current][i];}

let operationLabel='';
document.addEventListener('click',event=>{
 const button=event.target.closest('#object-controls button,#scene-hotspot');
 operationLabel=button?(button.getAttribute('aria-label')||button.innerText).replace(/^[＋+↓↑→↗↙↻⇄\s]+/u,'').trim():'';
},{capture:true});
function changed(){
 const o=options[current];
 const trigger=document.activeElement;
 let label=operationLabel||shortStatus();
 if(trigger?.dataset.toggle){label+=(o[trigger.dataset.toggle]?' · 已开启':' · 已关闭');}
 record(studies[current].id,'实验',label+'｜'+shortStatus());
 operationLabel='';
 renderControls();renderAnnotations();pause=performance.now()+3000;entry().lastScene={...options[current],commandAt:undefined};save();}
// Scene taps share the same command as the accessible text control.
let tapStart=null;
$('stage').addEventListener('pointerdown',e=>{tapStart={x:e.clientX,y:e.clientY};});
$('stage').addEventListener('pointerup',e=>{if(!unitOpen||current<0||!tapStart||Math.hypot(e.clientX-tapStart.x,e.clientY-tapStart.y)>6||!camera)return;const r=$('stage').getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const hit=ray.intersectObjects(model.interactTargets??[],false)[0];if(hit)hotspotAction(hit.object.userData.proposalAction);tapStart=null;});
let rotation=null;function rotateTo(angle){if(!camera)return;record(studies[current].id,'观察',operationLabel||'转动观察');pause=performance.now()+6500;rotation={from:controls.getAzimuthalAngle(),to:angle,start:performance.now()};}
function setInspect(on){if(current<0||!unitOpen)return;
 if(camera?.view?.enabled&&!reduce&&inspect!==on){
   inspectPan={start:performance.now(),from:.5-camera.view.offsetX/camera.view.fullWidth};
 }
 record(studies[current].id,'观察',on?'放大观察':'返回阅读');inspect=on;document.body.classList.toggle('inspection',on);$('inspect').textContent=on?'返回阅读 ↙':'放大观察 ↗';$('reset').hidden=!on;if(controls)controls.enableZoom=on;$('reading-body').inert=on;$('layer-nav').inert=on;$('object-controls').inert=!(interactive()||on);pause=performance.now()+1800;resize();}
function activate(i){leavePrologue();if(i!==prologueIndex)setMusic('ambient',{fade:3});const sameStudy=unitOpen&&i===current;unitOpen=false;presentUnit(studies[i],i,topics[i],english[i]);document.body.classList.toggle('reading-sheet',i===-.5||!!studies[i]);leaveTutorial();$('reflection-echo').hidden=true;document.body.classList.toggle('tutorial-page',i===-.5);document.body.classList.toggle('start-page',i===startIndex);$('start-sheet').hidden=i!==startIndex;clearTimeout(layerTimer);layerBusy=false;$('stage').classList.remove('scene-switching');$('step-content').classList.remove('layer-in','layer-out');current=i;step=0;document.body.dataset.topic=studies[i]?.id||(i===startIndex?'start':i===prologueIndex?'prologue':i===-.5?'tutorial':'cover');document.body.classList.toggle('cover',i===-1);$('cover-copy').hidden=i!==-1;$('reading').hidden=true;$('object-controls').hidden=true;$('layer-nav').hidden=true;$('scene-annotations').hidden=true;$('scene-hotspot').hidden=true;const s=studies[i];document.body.classList.remove('scene-controls-open');delete document.body.dataset.readingPhase;
 delete document.body.dataset.aiCase;delete document.body.dataset.proposal;if(options[i]){options[i].aiCase='';options[i].proposalActive=false;}
 if(s){$('chapter-number').textContent=s.number+' / '+String(studies.length).padStart(2,'0');$('term').textContent='';$('title').textContent=topics[i];$('english').textContent=english[i];$('design-name').textContent=s.title.join('');if(i===1)options[i].meeting=false;if(i===3)options[i].chamber=false;if(i===5)options[i].era=0;}
 if(i===prologueIndex)enterPrologue(()=>go(-.5),()=>go(startIndex));
 if(i===-.5)enterTutorial().then(()=>prepareStudy('boundary')).catch(()=>{});
 if(i===finaleIndex-1)prepareEpilogue();
 $('next-title').textContent=i===studies.length-1?'进入终章':i===-1?'进入开场':i===startIndex?'正式开始':i===-.5?'进入工具性':topics[i+1];
 $('next').querySelector('span').textContent='↓';$('previous').disabled=i===-1;
 history.replaceState(null,'','#'+document.body.dataset.topic);window.scrollTo(0,0);
 if(isOpening(i)||i===-.5){
   if(i===startIndex)prepareStudy('boundary').catch(()=>{});
   if(i===-1)$('start-sheet').querySelectorAll('.gate-plates img[loading="lazy"]').forEach(plate=>{plate.loading='eager';});
   renderer?.setAnimationLoop(null);$('loading').hidden=true;$('fallback').hidden=true;
   $('scene-hotspot').hidden=true;$('scene-annotations').hidden=true;
   if(i===startIndex)$('start-core').focus({preventScroll:true});
   return;
 }
 if(!initialized3D){initialized3D=true;init();}
 else if(renderer&&lens){$('fallback').hidden=true;if(sameStudy)resetView(false);else loadScene();resize();last=performance.now();renderer.setAnimationLoop(frame);}
 else $('fallback').hidden=false;
 renderAnnotations();
}

function chapterFromHash(){
  const id=location.hash.slice(1).split('/')[0];
  return id==='start'?startIndex:id==='prologue'?prologueIndex:id==='tutorial'?-.5:(id==='finale'||id==='duel')?finaleIndex:studies.findIndex(s=>s.id===id);
}
function startNextRound(){
  key=round.notebookKey;
  entries={};
  countNotes();
  options.splice(0,options.length,...structuredClone(initialOptions));
  zooms.clear();
  erased.clear();
  clearTimeout(bagTimer);
  bagLockedUntil=0;
  go(-1);
}
function returnToReader(){
  if(busy||!finale?.canPageBack())return;
  if(history.state?.readerFinale)history.back();
  else go(readerReady?current:finaleIndex-1);
}
async function go(index,instant=false,fromAddress=false){
  const next=Math.max(-1,Math.min(finaleIndex,index));
  if(busy){if(fromAddress)pendingRoute=next;return;}
  if(next===finaleIndex&&inFinale){finale?.syncAddress();return;}
  if(!inFinale&&readerReady&&next===current)return;
  busy=true;
  if(next!==-1)finishCoverEntrance();
  const direction=next>(inFinale?finaleIndex:current)?1:-1;
  const openingPair=!inFinale&&(next===startIndex||current===startIndex)&&Math.max(current,next)<=-.5;
  const openingMotion=!inFinale&&current===finaleIndex-1&&next===finaleIndex ? 'epilogue' :
    (current===startIndex||current===prologueIndex)&&next===-.5&&!inFinale ? 'tutorial-enter' :
    current===-.5&&next===0&&!inFinale ? 'tutorial-exit' :
    openingPair ? (current===-1 && next===startIndex ? 'assemble' : 'fade') : null;
  if(inspect)setInspect(false);
  try{
    const finaleModule=next===finaleIndex?await import('./finale.js'):null;
    const assets=settleWithin(prepareStudy(studies[next]?.id),6000);
    if(openingMotion!=='fade'&&openingMotion!=='assemble')await settleWithin(assets,6000);
    await turnSheet(direction,!instant&&!reduce,async()=>{
      if(openingMotion)await settleWithin(assets,6000);
      if(next===finaleIndex){
        leavePrologue();finale=finaleModule;
        clearTimeout(layerTimer);layerBusy=false;renderer?.setAnimationLoop(null);
        if(openingMotion!=='epilogue'||instant||reduce||document.hidden)setMusic('finale',{fade:4});inFinale=true;$('reader-shell').hidden=true;$('final-chapter').hidden=false;
        document.body.classList.add('in-finale');
        window.scrollTo(0,0);finale.enter(startNextRound);
        if(!fromAddress)history.pushState({readerFinale:true},'','#finale');
      }else{
        if(inFinale){
          finale.leave();inFinale=false;
          $('final-chapter').hidden=true;$('reader-shell').hidden=false;
          document.body.classList.remove('in-finale');
        }
        readerReady=true;activate(next);
        warmStage(next<0?'prologue':next>=studies.length-2?'finale':'chapters');
        // Draw the arriving model before the browser captures the new sheet.
        if(!isOpening(next)&&next!==-.5&&renderer&&lens)frame(performance.now());
      }
    },openingMotion,!!studies[next]);
  }finally{
    busy=false;
    if(pendingRoute!==null){const route=pendingRoute;pendingRoute=null;go(route,false,true);}
  }
}
function loadScene(){if(!scene)return;renderer.toneMappingExposure=current===-1?.95:.86;if(model){model.dispose?.();scene.remove(model.root);model.root.traverse(o=>{o.skeleton?.dispose();if(!o.geometry?.userData.libraryAsset)o.geometry?.dispose();if(o.material?.userData.local){o.material.map?.dispose();o.material.dispose();}});}model=makeStudy(current===-.5?'tutorial':current<0?'cover':studies[current].id);scene.add(model.root);if(current>=0)lens.outlineSubject(model.root);resetView(false);}
let unitPush=null,inspectPan=null;
function resetView(resetZoom=true){
  if(!camera)return;
  rotation=null;unitPush=null;inspectPan=null;
  const cover=current===-1,poster=current>=0&&!unitOpen;
  const r=cover?Math.hypot(7,10):12,yaw=cover?Math.atan2(7,10)+Math.PI/9:.60;
  const targetY=cover?2.05:current===3?1.08:current===5?1.15:.7;
  controls.target.set(0,targetY,0);
  const y=cover?targetY+r:poster?targetY+r*Math.tan(Math.PI/12):8;
  camera.position.set(Math.sin(yaw)*r,y,Math.cos(yaw)*r);
  camera.zoom=poster||resetZoom?1:(zooms.get(current)||1);
  controls.update();camera.updateProjectionMatrix();pause=performance.now()+1300;
}
function frameWidth(width,aspect){
  camera.left=-width/2;camera.right=width/2;
  camera.top=width/(2*aspect);camera.bottom=-camera.top;
  camera.updateProjectionMatrix();
}
function readingWidth(w){
  // Match the former full-screen camera's pixels per world unit inside the new stage.
  const mobile=innerWidth<701,h=mobile?310:innerHeight;
  const half=mobile?Math.max(2.2,3.5*h/innerWidth):
    Math.max(current===5?3:current===1&&options[1].meeting?3.05:
      current===2||current===3?2.65:2.4,3.55*h/innerWidth);
  return w*2*half/h*(mobile?1.05:1);
}
function startUnitPush(){
  if(!camera)return;
  const pixelScale=(camera.right-camera.left)/(camera.zoom*$('stage').clientWidth);
  camera.zoom=zooms.get(current)||1;
  unitPush={start:performance.now(),pixelScale,
    elevation:Math.PI/2-controls.getPolarAngle(),followPitch:true};
}
function advanceUnitPush(now){
  if(!unitPush)return current<0||unitOpen?1:0;
  const t=reduce?1:T.MathUtils.clamp((now-unitPush.start)/600,0,1);
  const u=t*t*(3-2*t);
  frameWidth(T.MathUtils.lerp(unitPush.from,unitPush.to,u),unitPush.aspect);
  if(held||inspect||rotation)unitPush.followPitch=false;
  if(unitPush.followPitch){
    const end=Math.atan2(8-controls.target.y,12);
    const pitch=T.MathUtils.lerp(unitPush.elevation,end,u);
    const yaw=controls.getAzimuthalAngle(),r=camera.position.distanceTo(controls.target);
    camera.position.set(Math.sin(yaw)*r*Math.cos(pitch),r*Math.sin(pitch),
      Math.cos(yaw)*r*Math.cos(pitch)).add(controls.target);
  }
  if(t===1)unitPush=null;
  return u;
}
function placeReadingView(w,h,now){
  const mobile=innerWidth<701;
  let center=inspect?(mobile?.575:.595):(mobile?.5:.7185);
  if(inspectPan){
    const t=T.MathUtils.clamp((now-inspectPan.start)/340,0,1);
    center=T.MathUtils.lerp(inspectPan.from,center,t*t*(3-2*t));
    if(t===1)inspectPan=null;
  }
  camera.setViewOffset(w,h,w*(.5-center),-h*(mobile?.015:.035),w,h);
}
function resize(){
  if(inFinale||isOpening(current)||!renderer)return;
  const stage=$('stage'),w=stage.clientWidth,h=stage.clientHeight;
  if(!w||!h)return;
  camera.layers[innerWidth<701?'disable':'enable'](30);
  if(current===1){
    const targetY=options[1].meeting?1.25:.7;
    camera.position.y+=targetY-controls.target.y;
    controls.target.y=targetY;
    controls.update();
  }
  renderer.setSize(w,h);
  lens.resize(w,h,renderer.getPixelRatio());
  const minHeight=current===5||current===1&&options[1].meeting?5.9:5.25;
  const width=unitOpen?readingWidth(w):Math.max(8.95,minHeight*w/h);
  if(unitOpen){
    placeReadingView(w,h,performance.now());
  }else camera.clearViewOffset();
  if(unitPush){
    unitPush.from=unitPush.pixelScale*w*camera.zoom;
    unitPush.to=width;unitPush.aspect=w/h;
    advanceUnitPush(performance.now());
  }else frameWidth(width,w/h);
}
function init(){try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;$('stage').append(renderer.domElement);renderer.setClearColor(0x000000,0);scene=new T.Scene();camera=new T.OrthographicCamera(-8,8,5,-5,.1,100);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.enableZoom=false;controls.rotateSpeed=.65;controls.minZoom=.55;controls.maxZoom=2.1;controls.minPolarAngle=.25;controls.maxPolarAngle=1.42;controls.addEventListener('start',()=>{held=true;rotation=null;});controls.addEventListener('end',()=>{held=false;pause=performance.now()+2200;});controls.addEventListener('change',()=>{if(unitOpen)zooms.set(current,camera.zoom);});const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pm.fromScene(room,.04).texture;room.dispose();pm.dispose();scene.environmentIntensity=.45;scene.add(new T.HemisphereLight('#ffffff','#b8c1d2',1.25));const sun=new T.DirectionalLight('#ffffff',3);sun.position.set(-3,9,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:25});sun.shadow.normalBias=.025;sun.shadow.bias=-.0001;sun.shadow.radius=4;scene.add(sun);const fill=new T.DirectionalLight('#d9e0ff',.5);fill.position.set(6,4,-4);scene.add(fill);const floor=new T.Mesh(new T.PlaneGeometry(150,150),new T.ShadowMaterial({color:0x27253b,opacity:.19}));floor.rotation.x=-Math.PI/2;floor.position.y=-.10;floor.receiveShadow=true;scene.add(floor);lens=new FocusLens(renderer);refractionLight=createRefractionLight(scene);loadScene();resize();renderer.setAnimationLoop(frame);bindCoverDrag();}catch(e){console.error(e);$('fallback').hidden=false;}finally{$('loading').hidden=true;}}
function frame(now){const dt=T.MathUtils.clamp((now-last)/1000,0,.05);last=Math.max(last,now);if(document.hidden)return;if(!reduce)elapsed+=dt;if(current<0)model?.update(0,elapsed);else model?.update(reflectionOptions(current,step,lastStep(),entry(),options[current],elapsed),elapsed,reduce?1:dt);if(inspectPan&&unitOpen)placeReadingView(camera.view.fullWidth,camera.view.fullHeight,now);const blurAmount=advanceUnitPush(now);controls.autoRotate=!options[current]?.proposalActive&&!unitPush&&!reduce&&!held&&!busy&&!inspect&&!rotation&&!$('dialog').open&&now>pause;controls.autoRotateSpeed=.25;if(rotation){const t=reduce?1:Math.min(1,(now-rotation.start)/1100),e=t*t*(3-2*t),offset=camera.position.clone().sub(controls.target),r=Math.hypot(offset.x,offset.z),a=mix(rotation.from,rotation.to,e);camera.position.x=controls.target.x+Math.sin(a)*r;camera.position.z=controls.target.z+Math.cos(a)*r;if(t===1)rotation=null;}controls.update(dt);model?.updateReflection?.(renderer,scene,elapsed);const focus=model?.focusPoint?.clone()??new T.Vector3(0,2,0);refractionLight.update(current,elapsed,(model?.lightPhase??elapsed*.07)+controls.getAzimuthalAngle()*.65);lens.render(scene,camera,focus,inspect,blurAmount,current>=0?1-blurAmount:0);positionHotspot();positionAnnotations();}
const mix=(a,b,t)=>a+(b-a)*t;
function bindCoverDrag(){const el=renderer.domElement,ray=new T.Raycaster(),p=new T.Vector2();let drag=null;el.addEventListener('pointerdown',e=>{if(current!==-1||e.button!==0)return;const r=el.getBoundingClientRect();p.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(p,camera);const hit=ray.intersectObjects(model.dragTargets??[],false)[0];if(!hit)return;e.stopImmediatePropagation();drag={id:e.pointerId,key:hit.object.userData.interactionKey,x:e.clientX,y:e.clientY};model.beginInteraction(drag.key);controls.enabled=false;el.setPointerCapture(e.pointerId);},true);el.addEventListener('pointermove',e=>{if(!drag)return;e.stopImmediatePropagation();model.dragInteraction(drag.key,e.clientX-drag.x,e.clientY-drag.y);},true);function release(e){if(!drag)return;e.stopImmediatePropagation();model.releaseInteraction();if(el.hasPointerCapture(drag.id))el.releasePointerCapture(drag.id);drag=null;controls.enabled=true;}el.addEventListener('pointerup',release,true);el.addEventListener('pointercancel',release,true);}
function showDialog(label,html){$('dialog').classList.remove('original-dialog','index-dialog');$('dialog-label').textContent=label;$('dialog-body').innerHTML=html;$('dialog').showModal();}
function source(){const s=studies[current];record(s.id,'阅读','阅读手记与案例来源');showDialog('READING NOTES / 阅读与设计',`<h2>${esc($('design-name').textContent)}</h2><p>${s.concept}</p><h3>概念与设计之间</h3><p>${s.limit}</p><p>${s.extras}</p><h3>案例与资料</h3><p>${s.caseNote||'这是从日常物件出发的设计提案。'}</p>${(s.references||[]).map(r=>`<p><a href="${r.url}" target="_blank" rel="noopener">${r.label} ↗</a></p>`).join('')}<h3>回到文本</h3><p>${s.source}</p><a href="${s.link}" target="_blank" rel="noopener">阅读原文或研究资料 ↗</a><p><a href="${bookSource}" target="_blank" rel="noopener">《黑暗时代的设计：阿伦特词典》官方预览 ↗</a></p><p class="fine">页面引号里的提问由本项目拟写；“概念带来的反问”为阅读转述，不是假托阿伦特本人的原话。这些场景为设计提案，词语与对应关系仍可修订。</p>`);}
function notebook(){showDialog('MARGINALIA / 我的批注',`<h2>我的批注</h2><p class="fine">批注自动保存在当前浏览器。</p>${studies.map(s=>{const e=entries[s.id]||{};return `<div class="notebook-entry"><h3>${s.number} / ${s.title.join('')}</h3><p>最初：${esc(e.before||'尚未回应')}<br>现在：${esc(e.after||'尚未回应')}</p>${e.note?`<p class="note-text">${esc(e.note)}</p>`:''}</div>`;}).join('')}<div class="dialog-actions"><button class="download" id="export-notes">导出阅读批注 ↓</button></div>`);$('export-notes').onclick=()=>{const text='灯塔、飞鸟与王座的游戏 / 之间 BETWEEN / 我的阅读批注\n\n'+studies.map(s=>{const e=entries[s.id]||{};return s.title.join('')+'\n最初：'+(e.before||'未填写')+'\n现在：'+(e.after||'未填写')+'\n理由：'+(e.note||'未填写')}).join('\n\n');const a=document.createElement('a'),url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));a.href=url;a.download='之间-我的阅读批注.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};addResetMenu(document.querySelector('#dialog .dialog-actions'));}

$('layer-prev').onclick=()=>changeLayer(step-1);$('layer-next').onclick=()=>changeLayer(step+1);$('scene-hotspot').onclick=hotspotAction;
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(+b.dataset.go));$('next').onclick=()=>navigateTopic(1);$('previous').onclick=()=>navigateTopic(-1);$('inspect').onclick=()=>setInspect(!inspect);$('reset').onclick=()=>resetView();$('source').onclick=source;$('notes').onclick=notebook;$('close-dialog').onclick=()=>$('dialog').close();
$('menu').onclick=()=>{
 const chapterLinks=studies.map((study,index)=>{
   const active=index===current?' aria-current="page"':'';
   return `<button class="toc-item" data-target="${index}"${active}><span class="toc-no">${study.number}</span><img src="assets/folio-${study.id}.svg" alt=""><strong>${topics[index]}</strong><small>${study.title.join('')}</small><span aria-hidden="true">↗</span></button>`;
 }).join('');
 showDialog('之间　/　阅读目录',`<h2>目录<span class="toc-mark" aria-hidden="true"></span></h2><button class="toc-bookend" data-target="-0.625">影像序章 <span>↗</span></button><button class="toc-bookend" data-target="-0.5">阅读教程 <span>↗</span></button>${chapterLinks}<button class="toc-bookend" data-target="${finaleIndex}">终章 · 待您开启 <span>↗</span></button>`);
 $('dialog').classList.add('index-dialog');
 $('dialog-body').querySelectorAll('[data-target]').forEach(button=>button.onclick=()=>{
   $('dialog').close();go(Number(button.dataset.target));
 });
};
$('dialog').addEventListener('click',e=>{if(e.target===$('dialog')){const r=$('dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('dialog').close();}});
window.addEventListener('wheel',e=>{
 if(inFinale){
   if(finale?.canPageBack()&&e.deltaY<0&&!e.ctrlKey){e.preventDefault();returnToReader();}
   return;
 }
 if($('dialog').open||e.ctrlKey||inspect||e.target.closest('textarea,input'))return;
 const horizontal=e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY),delta=horizontal?(e.shiftKey?e.deltaY||e.deltaX:e.deltaX):e.deltaY;if(!delta)return;
 if(!horizontal&&innerWidth<701&&!isOpening(current)&&!document.body.classList.contains('unit-landing'))return;
 const pane=e.target.closest('#reading,#tutorial');if(!horizontal&&pane&&pane.scrollHeight>pane.clientHeight+2&&((delta>0&&pane.scrollTop+pane.clientHeight<pane.scrollHeight-3)||(delta<0&&pane.scrollTop>1)))return;
 e.preventDefault();const now=performance.now(),gap=now-wheelTime;wheelTime=now;if(busy||layerBusy||gap<180)return;
 if(horizontal)changeLayer(step+(delta>0?1:-1));else navigateTopic(delta>0?1:-1);
},{passive:false});
window.addEventListener('keydown',e=>{
 if(inFinale){
   if(!e.defaultPrevented&&finale?.canPageBack()&&['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();returnToReader();}
   return;
 }
 if(current===prologueIndex)return;
 if(e.key==='Escape'&&inspect)setInspect(false);if($('dialog').open||inspect||/TEXTAREA|INPUT|SELECT/.test(e.target.tagName)||e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();changeLayer(step+(e.key==='ArrowRight'?1:-1));}
 if(['ArrowDown','PageDown'].includes(e.key)){e.preventDefault();navigateTopic(1);}if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();navigateTopic(-1);}
});
// Touch reading gestures stay outside the 3D canvas, where a drag rotates the model.
let swipe=null;
let finaleTouch=null;
document.addEventListener('touchstart',e=>{
 if(inFinale){finaleTouch=finale?.canPageBack()&&e.touches.length===1?e.touches[0].clientY:null;swipe=null;return;}
 if(inspect||$('dialog').open||e.touches.length!==1||e.target.closest('#stage,textarea,input,button,a'))return;const scroller=e.target.closest('#reading,#tutorial')??document.scrollingElement;swipe={x:e.touches[0].clientX,y:e.touches[0].clientY,top:scroller.scrollTop<3,bottom:scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-3};},{passive:true});
document.addEventListener('touchmove',e=>{if(swipe&&Math.abs(e.touches[0].clientX-swipe.x)>Math.abs(e.touches[0].clientY-swipe.y)*1.25)e.preventDefault();},{passive:false});
document.addEventListener('touchend',e=>{
 if(inFinale){if(finaleTouch!==null&&e.changedTouches[0].clientY-finaleTouch>65){if(e.cancelable)e.preventDefault();returnToReader();}finaleTouch=null;return;}
 if(!swipe)return;const start=swipe,dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;swipe=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.25)changeLayer(step+(dx<0?1:-1));else if(Math.abs(dy)>65&&Math.abs(dy)>Math.abs(dx)*1.25&&((dy>0&&start.top)||(dy<0&&start.bottom)))navigateTopic(dy<0?1:-1);},{passive:false});
window.addEventListener('resize',resize);
window.addEventListener('hashchange',()=>go(chapterFromHash(),false,true));
document.querySelector('.brand').onclick=e=>{e.preventDefault();go(-1);};
function navigateTopic(delta){
  if(current===-1){if(delta>0)go(startIndex);return;}
  if(current===startIndex){if(delta<0)go(-1);return;}
  if(current===prologueIndex)return;
  if(current===-.5){tutorialStep(delta);return;}
  go(current===0&&delta<0?-.5:current+delta);
}
$('unit-home').onclick=()=>{
  if(!unitOpen||busy||inFinale)return;
  if(inspect)setInspect(false);
  activate(current);
  $('begin-unit').focus({preventScroll:true});
};
$('begin-unit').onclick=async()=>{
  if(!studies[current]||unitOpen||inFinale||busy)return;
  busy=true;startUnitPush();unitOpen=true;
  try{
    await unfoldUnit(()=>{
      $('reading').hidden=false;$('object-controls').hidden=false;$('layer-nav').hidden=false;
      setStep(0,false);resize();
    });
  }finally{
    busy=false;
    if(pendingRoute!==null){const route=pendingRoute;pendingRoute=null;go(route,false,true);}
  }
};
$('cover-title-action').onclick=()=>go(startIndex);
$('start-core').onclick=$('start-caption').onclick=()=>{
  if(current!==startIndex)return;
  if(busy){pendingRoute=prologueIndex;return;}
  go(prologueIndex);
};
$('gate-back').onclick=()=>go(-1);
initTutorial(()=>go(0),()=>go(startIndex));
countNotes();
export function startReader(){return go(chapterFromHash(),true,true);}
export async function prepareReaderGraphics(){
 const previous=current;current=0;initialized3D=true;init();renderer?.setAnimationLoop(null);
 try{if(!renderer||!lens)return;for(let i=0;i<studies.length;i++){current=i;if(i)loadScene();renderer.setSize(32,32);await renderer.compileAsync(scene,camera);renderer.render(scene,camera);await model.prepare?.(renderer,scene,camera);await new Promise(resolve=>requestAnimationFrame(resolve));}}
 finally{current=previous;renderer?.setAnimationLoop(null);}
}
