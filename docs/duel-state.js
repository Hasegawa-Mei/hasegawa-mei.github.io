import {concepts,scenarios,scenarioById} from './duel-data.js';
import {pendingEndgame,startEndgame,endgameChallenges,endgamePhases,validEndgame,endgameWinner} from './duel-endgame.js';
const identityIds=['threshold','assembly','repair','inquiry','discern','witness'];
export const MATCH_VERSION=3;
export const HAND_SIZE=5;
export function randomIndex(length){const n=new Uint32Array(1),limit=Math.floor(4294967296/length)*length;do{crypto.getRandomValues(n);}while(n[0]>=limit);return n[0]%length;}
const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=randomIndex(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
export function newMatch(readingFace,readingRound){const inherited=identityIds.includes(readingFace)?readingFace:null;return {version:MATCH_VERSION,handSize:HAND_SIZE,id:crypto.randomUUID(),readingRound,phase:'setup',players:[{name:'旅人一',inherited,extra:null,face:inherited,hp:3,hand:[]},{name:'旅人二',inherited:null,extra:null,face:null,hp:3,hand:[]}],turn:0,first:0,active:0,scenario:null,selected:null,reason:'',history:[],rolls:[],swapNote:'',endgame:null,created:Date.now()};}
export function drawIdentity(state,side){if(state.phase!=='setup')return;const p=state.players[side],pool=identityIds.filter(id=>id!==p.inherited);p.extra=pool[randomIndex(pool.length)];p.face=p.extra;}
export function chooseIdentity(state,side,id){if(state.phase!=='setup')return;const p=state.players[side];if([p.inherited,p.extra].includes(id)&&id)p.face=id;}
export function rollInitiative(state){if(state.phase!=='setup'||state.players.some(p=>!p.face))throw Error('请先为两位旅人选择身份。');const hand=shuffle(concepts.map(c=>c.id)).slice(0,HAND_SIZE);state.handSize=HAND_SIZE;state.players.forEach(p=>{p.hand=shuffle(hand);p.hp=3;});state.rolls=[];let a,b;do{a=randomIndex(6)+1;b=randomIndex(6)+1;state.rolls.push([a,b]);}while(a===b);state.first=a>b?0:1;state.phase='initiative';state.history=[];state.turn=0;return state.rolls;}
export function beginTurn(state){if(!['initiative','feedback'].includes(state.phase))return;if(state.turn>=8){state.phase='outcome';return;}state.active=(state.first+state.turn)%2;const p=state.players[state.active],used=new Set(state.history.map(h=>h.scenario));const remaining=scenarios.filter(s=>!used.has(s.id));let pool=remaining.filter(s=>s.accepted.some(id=>p.hand.includes(id)));state.swapNote='';
 if(!pool.length){pool=remaining;const s=pool[randomIndex(pool.length)],id=s.accepted[randomIndex(s.accepted.length)];state.swapNote='为保证仍有可用视角，已等量补换一张概念牌。';p.hand[0]=id;pool=[s];}
 state.scenario=pool[randomIndex(pool.length)].id;state.selected=null;state.reason='';state.phase='play';}
export function selectConcept(state,id){if(state.phase==='play'&&state.players[state.active].hand.includes(id))state.selected=id;}
export function submitTurn(state){if(state.phase!=='play')throw Error('这一轮已经回应。');const p=state.players[state.active];if(!p.hand.includes(state.selected))throw Error('先选一张概念牌。');const reason=state.reason.trim();if(reason.length<8)throw Error('请再说明一点：这个概念与情境有什么关系？');if(reason.length>400)throw Error('请将回应控制在 400 字以内。');const scenario=scenarioById(state.scenario),matched=scenario.accepted.includes(state.selected),before=p.hp;if(!matched)p.hp=Math.max(0,p.hp-1);p.hand.splice(p.hand.indexOf(state.selected),1);
 const result={player:state.active,scenario:state.scenario,concept:state.selected,reason,matched,overridden:false,before,after:p.hp,at:Date.now()};state.history.push(result);state.phase='feedback';return result;}
export function agreeAlternative(state,consents){if(state.phase!=='feedback'||!consents?.every(Boolean)||consents.length!==2)return false;const e=state.history.at(-1);if(!e||e.matched||e.overridden)return false;e.overridden=true;state.players[e.player].hp=e.before;e.after=e.before;return true;}
export function nextTurn(state){if(state.phase!=='feedback')return;const trigger=pendingEndgame(state);state.turn++;if(trigger){startEndgame(state,trigger,randomIndex(endgameChallenges.length));return;}beginTurn(state);}
export function winner(state){const final=endgameWinner(state.endgame);return final!==undefined?final:state.players[0].hp===state.players[1].hp?null:state.players[0].hp>state.players[1].hp?0:1;}
export function upgradeMatch(state){
 if(![1,2].includes(state?.version))return state;
 const upgraded=structuredClone(state);upgraded.version=MATCH_VERSION;upgraded.endgame??=null;upgraded.handSize??=4;
 if(upgraded.phase==='setup')upgraded.handSize=HAND_SIZE;
 else if(upgraded.handSize===4&&['initiative','play','feedback'].includes(upgraded.phase)&&upgraded.history?.length<8&&upgraded.players?.every(p=>Array.isArray(p.hand))){
  const used=new Set([...upgraded.players.flatMap(p=>p.hand),...upgraded.history.map(h=>h.concept)]);
  const common=shuffle(concepts.filter(c=>!used.has(c.id)))[0]?.id;
  upgraded.players.forEach((p,i)=>{const unavailable=new Set([...p.hand,...upgraded.history.filter(h=>h.player===i).map(h=>h.concept)]);p.hand.push(common||shuffle(concepts.filter(c=>!unavailable.has(c.id)))[0].id);});
  upgraded.handSize=HAND_SIZE;
 }
 return upgraded;
}
export function validSaved(state,readingRound){
 const concept=id=>concepts.some(c=>c.id===id),face=id=>id===null||identityIds.includes(id),side=i=>i===0||i===1,hp=n=>Number.isInteger(n)&&n>=0&&n<=3;
 if(!state||![4,HAND_SIZE].includes(state.handSize)||state.version!==MATCH_VERSION||state.readingRound!==readingRound||!['setup','initiative','play','feedback','outcome',...endgamePhases].includes(state.phase))return false;
 if(!Array.isArray(state.players)||state.players.length!==2||!state.players.every(p=>p&&typeof p.name==='string'&&p.name.length<=20&&face(p.face)&&face(p.extra)&&face(p.inherited)&&hp(p.hp)&&Array.isArray(p.hand)&&p.hand.length<=state.handSize&&p.hand.every(concept)))return false;
 if(!side(state.first)||!side(state.active)||!Number.isInteger(state.turn)||state.turn<0||state.turn>8||typeof state.reason!=='string'||state.reason.length>400)return false;
 if(!Array.isArray(state.history)||state.history.length>8||!state.history.every(h=>h&&side(h.player)&&scenarioById(h.scenario)&&concept(h.concept)&&typeof h.reason==='string'&&hp(h.before)&&hp(h.after)&&typeof h.matched==='boolean'&&typeof h.overridden==='boolean'))return false;
 if(new Set(state.history.map(h=>h.scenario)).size!==state.history.length)return false;
 if(state.phase==='setup')return state.turn===0&&state.history.length===0;
 if(state.players.some(p=>!p.face)||!Array.isArray(state.rolls)||!state.rolls.length||!state.rolls.every(r=>Array.isArray(r)&&r.length===2&&r.every(n=>Number.isInteger(n)&&n>=1&&n<=6)))return false;
 const lastRoll=state.rolls.at(-1);if(lastRoll[0]===lastRoll[1]||state.first!==(lastRoll[0]>lastRoll[1]?0:1))return false;
 if(state.phase==='initiative')return state.turn===0&&state.history.length===0;
 if(endgamePhases.includes(state.phase)||(state.phase==='outcome'&&state.endgame))return state.history.length===state.turn&&validEndgame(state);
 if(state.endgame)return false;
 if(state.phase==='outcome')return state.turn===8&&state.history.length===8&&state.players.every(p=>p.hand.length===state.handSize-4);
 if(!scenarioById(state.scenario)||state.turn>=8||state.active!==(state.first+state.turn)%2)return false;
 if(state.phase==='feedback')return state.history.length===state.turn+1&&state.history.at(-1).scenario===state.scenario&&state.history.at(-1).player===state.active;
 return state.history.length===state.turn&&state.players[state.active].hand.length>0&&(state.selected===null||state.players[state.active].hand.includes(state.selected));
}
