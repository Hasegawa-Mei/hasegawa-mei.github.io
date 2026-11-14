import {mountStandby} from './standby-print.js';
import {summarizeRound} from './final-choices.js';
import {round,restartRound} from './reading-round.js';
import {createArt,prepareCardFace} from './printed-ritual.js';
import {cameraSession,gestureInput} from './ritual-hand.js';

const $=id=>document.getElementById(id);
const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let art, active=false, onRestart, duel;
async function launchDuel(){duel??=await import('./duel.js');if(!active)return;art?.suspend();await duel.openDuel({readingIdentity:summarizeRound(round).face,onNewReading:()=>{restartRound();onRestart();},onExit:()=>{history.replaceState(null,'','#finale');if(phase==='result'){art?.resume();$('enter-duel')?.focus({preventScroll:true});}}});}
export function syncAddress(){if(!active)return;if(location.hash==='#duel')launchDuel();else if(document.body.classList.contains('in-duel'))duel?.closeDuel();}
export function enter(restart){
  active=true;
  prepareCardFace(summarizeRound(round).face);
  onRestart=restart;
  mountStandby($('wake'));
  idle();
  if(location.hash==='#duel')launchDuel();
}
export function leave(){
  duel?.closeDuel(false);
  active=false;
  if($('confirm').open)$('confirm').close('cancel');
  disconnect();
  $('ritual').prepend($('art'));
  startPoint=null;
  art?.idle();
  art?.suspend();
  stage('idle');
  delete document.body.dataset.phase;
}
export function canPageBack(){return active && !document.body.classList.contains('in-duel') && phase==='idle' && !$('confirm').open;}
let phase='idle', stopCamera=null, picked=false, handMode=false, tracker=null, lastPresence='';
function stage(next){
  phase=next;document.body.dataset.phase=next;
  $('wake').hidden=next!=='idle';$('guide').hidden=next!=='guide';
  $('array-ui').hidden=next!=='array';$('journal').hidden=next!=='result';
}
function disconnect(){stopCamera?.();stopCamera=null;handMode=false;$('gesture-cursor').hidden=true;}
function idle(){
  disconnect();
  art?.idle();
  art?.suspend();
  stage('idle');
  $('wake').focus({preventScroll:true});
}
const gestureRows=[
 ['张开五指','在中央停住，唤起牌阵。','palm'],
 ['手掌右移','牌背沿横向轨道转动。','right'],
 ['手掌回中','牌阵停在中央的牌。','center'],
 ['拇食指捏合','选中并抬起当前这张牌。','pinch'],
 ['保持捏合上提','确认选择，翻出本轮牌面。','lift']
];
const openHand='<path d="M11 28 6 19q-1-4 2-3l4 5-3-12q0-3 2-2l4 10-2-13q1-3 3-1l2 13V3q2-3 3 0l1 13 2-10q2-3 3 0l-1 17q-1 7-7 7z"/>';
const pinchHand='<path d="M9 28 5 20q-1-5 3-4l5 4-1-6q0-6 4-6 4 0 4 5t-5 6m4-11 2-5q2-2 3 1l-1 11 3-7q3-2 3 1l-2 15q-1 6-8 7z"/>';
$('gesture-list').innerHTML=gestureRows.map(([label,explanation,icon])=>'<div class="gesture-row"><svg viewBox="0 0 40 38" aria-hidden="true">'+(['pinch','lift'].includes(icon)?pinchHand:openHand)+({right:'<path d="M29 19h9l-3-3m3 3-3 3"/>',center:'<path d="M38 19h-9l3-3m-3 3 3 3"/>',lift:'<path d="M34 18V7l-3 3m3-3 3 3"/>'}[icon]||'')+'</svg><b>'+label+'</b><small>'+explanation+'</small></div>').join('');
function start(){
  if(phase!=='guide')return;
  picked=false;lastPresence='';
  stage('array');
  if(art)art.resume();else art=createArt($('art'));
  art.start();
  art.resize();
  $('lift').disabled=true;$('pick').textContent='选中此牌';
  $('array-hint').textContent=handMode?'手向右移，回到中央停牌':'拖动牌阵换牌，轻点中央选中';
  $('turn').focus({preventScroll:true});
}
function select(){
  if(phase!=='array')return;
  picked=true;art.select();$('lift').disabled=false;
  $('pick').textContent='已选中';$('array-hint').textContent=handMode?'保持捏合，向上提起':'向上拖动选中的牌，或点击确认';
}
function deselect(){
  picked=false;$('lift').disabled=true;$('pick').textContent='选中此牌';
  $('array-hint').textContent=handMode?'回到中央停牌，捏合选中':'轻点中央选中这张牌';
}
function gesture(action){
  if(action==='start')start();
  if(phase!=='array')return;
  switch(action){
    case 'rotate':deselect();art.rotate();break;
    case 'stop':art.stop();break;
    case 'select':select();break;
    case 'confirm':if(picked)finish();break;
  }
}
function connect(){
  disconnect();tracker=gestureInput(gesture);handMode=true;$('retry').hidden=true;
  stopCamera=cameraSession((points,now)=>{
    tracker(points,now,phase);
    if(phase!=='array')return;
    const cursor=$('gesture-cursor');
    cursor.hidden=!points;
    if(points){cursor.style.left=100*(1-points[9].x)+'%';cursor.style.top=100*points[9].y+'%';}
    const presence=points?'seen':'lost';
    if(presence!==lastPresence && !picked){$('array-hint').textContent=points?'右移转动 · 回中停牌 · 捏合选中':'请让整只手进入摄像头画面';}
    lastPresence=presence;
  },message=>{$('camera-status').textContent=message;},message=>{
    handMode=false;$('retry').hidden=false;$('camera-status').textContent=message+'，也可使用鼠标或触控。';
    if(phase==='array'){$('array-hint').textContent=message+'，可继续用下方按钮完成';art.stop();$('gesture-cursor').hidden=true;}
  });
}
$('wake').onclick=()=>$('confirm').showModal();
$('confirm').addEventListener('close',()=>{
  if(!active||$('confirm').returnValue!=='yes')return;
  $('confirm').returnValue='';stage('guide');$('manual').focus();connect();
});
$('retry').onclick=connect;$('cancel').onclick=idle;$('exit-array').onclick=idle;
$('manual').onclick=()=>{disconnect();start();};
$('turn').onclick=()=>{art.advance();deselect();};$('pick').onclick=select;$('lift').onclick=()=>{if(picked)finish();};
let startPoint=null;
$('array-ui').addEventListener('pointerdown',e=>{if(phase!=='array'||e.target.closest('button'))return;startPoint={x:e.clientX,y:e.clientY,horizontal:false};art.beginDrag();$('array-ui').setPointerCapture(e.pointerId);});
$('array-ui').addEventListener('pointermove',e=>{
  if(!startPoint||phase!=='array')return;
  const dx=e.clientX-startPoint.x,dy=e.clientY-startPoint.y;
  if(!startPoint.horizontal&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){startPoint.horizontal=true;deselect();}
  if(startPoint.horizontal)art.dragBy(dx);
});
$('array-ui').addEventListener('pointerup',e=>{
  if(!startPoint)return;
  const dx=e.clientX-startPoint.x,dy=e.clientY-startPoint.y,horizontal=startPoint.horizontal;startPoint=null;art.endDrag();
  if(phase!=='array'||horizontal)return;
  if(picked && dy < -35 && -dy>Math.abs(dx)){finish();return;}
  if(Math.abs(dy)<16)select();
});
$('array-ui').onpointercancel=()=>{startPoint=null;art?.endDrag();};
document.addEventListener('keydown',e=>{
  if(!active)return;
  if(e.key==='Escape' && ['guide','array'].includes(phase)){idle();return;}
  if(phase!=='array')return;
  if(e.key==='ArrowRight'){$('turn').click();e.preventDefault();}
  if(e.key==='ArrowLeft'){art.advance(-1);deselect();e.preventDefault();}
  if(e.key==='ArrowUp' && picked){finish();e.preventDefault();}
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&handMode){disconnect();art?.stop();$('retry').hidden=false;$('camera-status').textContent='已暂停摄像头，可以重新启用。';if(phase==='array')$('array-hint').textContent='摄像头已暂停，可用下方操作继续';}
});
window.addEventListener('pagehide',disconnect);
const identityBrief={
 threshold:'你重视自主与边界，愿意为个人保留选择如何被了解的空间。',
 assembly:'你关心谁能参与、谁能发言，相信共同的事情需要彼此回应。',
 repair:'你在意一次使用之后的世界，愿意维护仍有价值的事物。',
 inquiry:'你习惯追问工具背后的目的，以及谁会承担它的后果。',
 discern:'你留意技术与消费制造的期待，试着辨认自己真正看重什么。',
 witness:'你会从他人的处境重新观看，在形成判断前先看见差异。',
 unwritten:'你仍在形成自己的说法。带着尚未确定的判断，继续下一场对话。'
};
async function finish(){
  if(phase!=='array'||!picked)return;
  phase='turning';disconnect();art.stop();
  const {face}=summarizeRound(round);
  await prepareCardFace(face);
  if(!active||phase!=='turning')return;
  art.reveal(face);stage('result');
  $('result-hero').prepend($('art'));art.resize();
  $('result-copy').innerHTML='<span class="kicker">EPILOGUE / 我的身份</span><h1>'+face.name+'</h1><span class="eng">'+face.en+'</span><p class="thought identity-brief">'+escape(identityBrief[face.id])+'</p><button class="duel-result-entry" id="enter-duel">带着身份，进入王座真理的探寻 <span>↗</span></button>';
  $('enter-duel').onclick=launchDuel;
  $('result-copy').animate([{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'none'}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:850,delay:800,fill:'both'});
  $('journal').scrollTop=0;$('journal').focus({preventScroll:true});
}
