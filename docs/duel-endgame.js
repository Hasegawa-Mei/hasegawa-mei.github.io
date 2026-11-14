import {concepts} from './duel-data.js';

export const endgameChallenges=[
 {id:'room-for-difference',title:'给不同的答案留一个位置',question:'学校用 AI 评价毕业作品。越接近高分模板，越容易得到展示机会。',detail:'几轮之后，展厅里的作品越来越相似。一位学生做了服务小众人群的作品，系统却因数据不足给出低分。',task:'设计一套作品评价与展示机制：让 AI 继续提供帮助，同时让不同的经验、方法与价值有机会被认真看见。',constraints:['保留 AI 作为辅助，不把最终决定完全交给它。','说清楚学生、教师与受影响的人各自可以做什么。','给被误判的人一条能够实际使用的补救路径。']},
 {id:'reversible-delegate',title:'让代理把话语权交回来',question:'社区的 AI 代理替居民投完了票，一项公共空间改造即将动工。',detail:'有人改变了想法，有人从未理解授权意味着什么，还有一群不常上网的使用者没有进入数据。项目又确实需要及时推进。',task:'设计一个从 AI 代理建议到居民共同决定的流程，让效率、本人参与和修改意见的机会能够共存。',constraints:['明确什么时候必须让真实的人到场或回应。','照顾无法使用数字平台的人。','说明授权如何撤回、争议如何暂停或复议。']},
 {id:'learning-with-a-way-back',title:'答案之后，学习如何发生',question:'一门课程的作业几乎都能被 AI 完成，学生交出的答案越来越完整。',detail:'老师看不清谁真正理解了问题，学生又担心完全禁用工具会失去有用的帮助。有人表达缓慢，但思考并不浅。',task:'设计一次允许使用 AI 的学习活动与评价方式，让学生能展示自己的判断，而不是只提交完整答案。',constraints:['具体说明学生在活动中要做的动作。','让表达方式不同的人拥有公平的展示机会。','给暂时依赖答案的人安排可执行的补救环节。']},
 {id:'a-door-without-a-scan',title:'给便利保留另一扇门',question:'公共图书馆将借阅、进门与个性化推荐都接入 AI 身份识别。',detail:'系统减少了排队，但拒绝提交面部数据的人、识别失败的人和没有智能手机的人开始被挡在门外。工作人员数量有限。',task:'设计一套可进入、可拒绝、可纠错的图书馆服务方案，在有限人力下保留便利与私人边界。',constraints:['明确谁收集什么数据，何时删除。','让不接受识别的人仍能使用基本服务。','给失败或被误判的情况安排清楚的人工补救。']}
];
export const ratingCriteria=[
 {id:'concept',name:'概念关联',hint:'所选哲学概念是否真正影响了设计，而不只是被提到？'},
 {id:'workability',name:'方案可执行',hint:'是否说清楚由谁、在什么时候、通过什么行动解决问题？'},
 {id:'plurality',name:'照顾不同处境',hint:'是否看见被忽略的人，并为不同需求留下位置？'},
 {id:'repair',name:'代价与补救',hint:'是否承认方案的限制，并安排纠错、申诉或改变的可能？'}
];
export const challengeById=id=>endgameChallenges.find(c=>c.id===id);
export const scoreTotal=rating=>rating?.values?.reduce((sum,n)=>sum+n,0)??0;
export const endgamePhases=['endgame-intro','endgame-think','endgame-write-gate','endgame-write','endgame-exchange','endgame-score-gate','endgame-score','endgame-reveal'];
export function pendingEndgame(state){
 if(state.phase!=='feedback'||state.endgame)return null;
 if(state.players.some(p=>p.hp<=1))return 'rescue';
 if(state.turn===7&&state.players[0].hp===state.players[1].hp)return 'tie';
 return null;
}
export function startEndgame(state,trigger,index){
 state.endgame={trigger,challenge:endgameChallenges[index].id,active:state.first,startedAfter:state.turn,drafts:[{concept:null,plan:'',care:''},{concept:null,plan:'',care:''}],designs:[null,null],ratingDrafts:[{values:[null,null,null,null],comment:''},{values:[null,null,null,null],comment:''}],ratings:[null,null],revealed:false};
 state.phase='endgame-intro';
}
export function beginEndgame(state){if(state.phase==='endgame-intro')state.phase='endgame-think';}
export function beginDesigns(state){if(state.phase==='endgame-think')state.phase='endgame-write-gate';}
export function openEndgameGate(state){if(state.phase==='endgame-write-gate')state.phase='endgame-write';else if(state.phase==='endgame-score-gate')state.phase='endgame-score';}
export function concealEndgame(state){if(state.phase==='endgame-write')state.phase='endgame-write-gate';else if(state.phase==='endgame-score')state.phase='endgame-score-gate';}
export function submitDesign(state){
 if(state.phase!=='endgame-write')throw Error('请先进入自己的方案页面。');
 const e=state.endgame,side=e.active,d=e.drafts[side];
 if(e.designs[side])throw Error('这份方案已经封存。');
 if(!concepts.some(c=>c.id===d.concept))throw Error('请选择一个哲学概念。');
 if(d.plan.trim().length<20||d.plan.length>800)throw Error('请用 20–800 字写清楚你的设计如何运作。');
 if(d.care.trim().length<8||d.care.length>400)throw Error('请用 8–400 字说明方案的代价与补救。');
 e.designs[side]={concept:d.concept,plan:d.plan.trim(),care:d.care.trim()};
 if(e.designs.every(Boolean))state.phase='endgame-exchange';else{e.active=1-side;state.phase='endgame-write-gate';}
}
export function beginScoring(state){if(state.phase==='endgame-exchange'){state.endgame.active=state.first;state.phase='endgame-score-gate';}}
export function submitRating(state){
 if(state.phase!=='endgame-score')throw Error('请先进入自己的评分页面。');
 const e=state.endgame,side=e.active,r=e.ratingDrafts[side];
 if(e.ratings[side])throw Error('这份评分已经封存。');
 if(r.values.length!==4||!r.values.every(n=>Number.isInteger(n)&&n>=1&&n<=5))throw Error('请为四个维度分别选择 1–5 分。');
 if(r.comment.trim().length<8||r.comment.length>400)throw Error('请用 8–400 字写下评分的理由。');
 e.ratings[side]={values:[...r.values],comment:r.comment.trim()};
 if(e.ratings.every(Boolean))state.phase='endgame-reveal';else{e.active=1-side;state.phase='endgame-score-gate';}
}
export function revealEndgame(state){if(state.phase==='endgame-reveal'&&state.endgame.ratings.every(Boolean)){state.endgame.revealed=true;state.phase='outcome';}}
export function endgameWinner(e){if(!e?.revealed)return undefined;const a=scoreTotal(e.ratings[1]),b=scoreTotal(e.ratings[0]);return a===b?null:a>b?0:1;}
export function validEndgame(state){
 const e=state.endgame,side=n=>n===0||n===1,pair=a=>Array.isArray(a)&&a.length===2;
 const draft=d=>d&&[null,...concepts.map(c=>c.id)].includes(d.concept)&&typeof d.plan==='string'&&d.plan.length<=800&&typeof d.care==='string'&&d.care.length<=400;
 const design=d=>draft(d)&&d.concept!==null&&d.plan.trim().length>=20&&d.care.trim().length>=8;
 const rating=(r,complete)=>r&&Array.isArray(r.values)&&r.values.length===4&&r.values.every(n=>(!complete&&n===null)||(Number.isInteger(n)&&n>=1&&n<=5))&&typeof r.comment==='string'&&r.comment.length<=400&&(!complete||r.comment.trim().length>=8);
 if(!e||!['rescue','tie'].includes(e.trigger)||!challengeById(e.challenge)||!side(e.active)||e.startedAfter!==state.turn||!Number.isInteger(e.startedAfter)||e.startedAfter<1||e.startedAfter>8||typeof e.revealed!=='boolean')return false;
 if(e.trigger==='tie'&&(state.turn!==8||state.players[0].hp!==state.players[1].hp))return false;
 if(e.trigger==='rescue'&&!state.players.some(p=>p.hp<=1))return false;
 if(!pair(e.drafts)||!e.drafts.every(draft)||!pair(e.designs)||!e.designs.every(d=>d===null||design(d))||!pair(e.ratingDrafts)||!e.ratingDrafts.every(r=>rating(r,false))||!pair(e.ratings)||!e.ratings.every(r=>r===null||rating(r,true)))return false;
 const d=e.designs.filter(Boolean).length,r=e.ratings.filter(Boolean).length;
 if(state.phase==='outcome')return d===2&&r===2&&e.revealed;
 if(e.revealed)return false;
 if(['endgame-intro','endgame-think'].includes(state.phase))return d===0&&r===0&&e.active===state.first;
 if(['endgame-write-gate','endgame-write'].includes(state.phase))return d<2&&r===0&&!e.designs[e.active]&&e.active===(d===0?state.first:1-state.first);
 if(state.phase==='endgame-exchange')return d===2&&r===0;
 if(['endgame-score-gate','endgame-score'].includes(state.phase))return d===2&&r<2&&!e.ratings[e.active]&&e.active===(r===0?state.first:1-state.first);
 return state.phase==='endgame-reveal'&&d===2&&r===2;
}
