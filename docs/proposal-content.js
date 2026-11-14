// Author-designed, fictional proposals. Exploring them never selects an identity answer.
export const proposals={
 2:{id:'power',name:'共同分配台',question:'AI 省下的时间，谁有机会重新分配？',description:'把六块时间交给休息、学习与共同项目。受到影响的人可以修改提案，约定执行责任，也能提出复议。',bridge:'权力 / 让参与真正改变资源的分配',reflection:'被分到时间的人，是否也有改变分配规则的机会？',instruction:'先分配六块时间，再模拟共同确认；也可以提出异议。'},
 3:{id:'privacy',name:'有门的助手',question:'接受照料时，我还能关上被了解的门吗？',description:'一盏有感知开关的助手灯。当次请求在本地临时使用，关门后停止感知并清除；长期偏好需要另行授权。',bridge:'私人领域 / 由自己决定何时被看见',reflection:'便利留下了，退出被观察的权利是否也留下了？',instruction:'请求一次建议，再关上外罩。留意灯光、感知与记忆的不同变化。'},
 4:{id:'alienation',name:'街角续用站',question:'归还之后，谁让一件东西继续被使用？',description:'归还柜、检修台与领用架接起物件的下一次使用。商店轮值清洗与检修，共同承担耗材，修补记录随物留下。',bridge:'共同世界 / 让持久的物拥有持续的照料',reflection:'如果没有人承担维护，这个循环还能持续吗？',instruction:'把同一个袋子送回小站；落实维护者后，修补并交给下一位。'},
 5:{id:'alienation-two',name:'七日借用柜',question:'先用一段时间，我还需要把它买下来吗？',description:'带着一件具体任务借走物件，体验七天再决定。借用条件事先说明，没有自动购买，也没有新旧与身份排名。',bridge:'消费者社会 / 从实际使用形成自己的判断',reflection:'我想留下它，是因为用得上，还是因为想拥有它？',instruction:'选一件任务，借出物件。每天可记录一次实际使用，再推进一天。'},
 6:{id:'violence',name:'暂停台',question:'技术准备执行强制时，当事人能让它暂停吗？',description:'在这个非紧急广场情境中，围挡准备驱离停留者。双方都能暂停，并要求说明理由、联系负责人、讨论替代做法。',bridge:'暴力 / 让被放大的力量接受具体处境的检验',reflection:'如果暂停之后始终无人回应，这个设计还有效吗？',instruction:'先模拟处置建议，再从任意一方暂停；继续检查人工回应是否真的发生。'}
};
export const proposalUnits=Object.keys(proposals).map(Number);
export function withProposalLayer(unit,layers){if(!proposals[unit])return layers.slice();return [...layers.slice(0,-1),'我们的提案',layers.at(-1)];}
export function proposalAt(unit,step,last){return !!proposals[unit]&&step===last-1;}
export function initialProposal(unit){return unit===2?{allocation:[0,0,0],stage:'draft'}:unit===3?{open:true,request:false,remembered:false}:unit===4?{stage:0,maintainer:false}:unit===5?{task:0,day:0,used:[],decision:''}:unit===6?{stage:0,by:''}:null;}
export function proposalAction(unit,state,action){
 if(!state)return false;
 if(action==='reset'){Object.assign(state,initialProposal(unit));return true;}
 if(unit===2){
  const allocated=state.allocation.reduce((a,b)=>a+b,0);
  if(/^allocate:[012]$/.test(action)&&allocated<6&&state.stage!=='confirmed'){state.allocation[+action.at(-1)]++;state.stage='draft';return true;}
  if(action==='confirm'&&allocated===6&&state.stage!=='confirmed'){state.stage='confirmed';return true;}
  if(action==='review'&&state.stage==='confirmed'){state.stage='review';return true;}
  if(action==='reallocate'&&state.stage!=='confirmed'){state.allocation=[0,0,0];state.stage='draft';return true;}
 }else if(unit===3){
  if(action==='request'&&state.open){state.request=true;return true;}
  if(action==='door'){state.open=!state.open;if(!state.open)state.request=false;return true;}
  if(action==='remember'&&state.open&&state.request){state.remembered=true;return true;}
  if(action==='forget'&&state.remembered){state.remembered=false;return true;}
 }else if(unit===4){
  if(action==='appoint'&&state.stage<3){state.maintainer=!state.maintainer;return true;}
  if(action==='next'&&state.stage<4&&(state.stage!==2||state.maintainer)){state.stage++;return true;}
 }else if(unit===5){
  if(/^task:[01]$/.test(action)&&state.day===0){state.task=+action.at(-1);return true;}
  if(action==='borrow'&&state.day===0){state.day=1;return true;}
  if(action==='use'&&state.day>0&&!state.decision&&!state.used.includes(state.day)){state.used.push(state.day);return true;}
  if(action==='day'&&state.day>0&&state.day<7&&!state.decision){state.day++;return true;}
  if(['return','renew','keep'].includes(action)&&state.day===7&&!state.decision){state.decision=action;return true;}
 }else if(unit===6){
  if(action==='propose'&&state.stage===0){state.stage=1;return true;}
  if(['pause-person','pause-operator'].includes(action)&&state.stage===1){state.stage=2;state.by=action==='pause-person'?'当事人':'管理者';return true;}
  if(action==='unanswered'&&state.stage===2){state.stage=3;return true;}
  if(action==='respond'&&[2,3].includes(state.stage)){state.stage=4;return true;}
  if(action==='alternative'&&state.stage===4){state.stage=5;return true;}
 }
 return false;
}
export function proposalStatus(unit,s){
 if(unit===2){const left=6-s.allocation.reduce((a,b)=>a+b,0);return s.stage==='confirmed'?'提案经共同确认：时间开始用于实际安排。责任人负责执行，下一次工作例会重新检查。':s.stage==='review'?'异议进入复议：现有分配仍可见，尚未执行的安排等待重新协商。可收回模块，修改提案。':left?`尚有 ${left} 块时间待分配。现在只是提案，不能由一人直接执行。`:'六块时间已分配。请模拟共同确认，让方案进入执行；各人的理由仍需被听见。';}
 if(unit===3)return `${s.open?(s.request?'已收到一次请求，临时信息只留在本地。':'门已打开，等待一次请求。'):'门已关上：感知停止，本次临时请求已清除。'}照明始终继续。${s.remembered?'你单独授权的偏好仍在，可随时撤回。':'没有长期保存的偏好。'}`;
 if(unit===4)return ['袋子还在使用者手里。归还是下一段照料的开始。','同一个袋子已进入归还柜，等待检查。','检查发现一处破损。'+(s.maintainer?'商店已安排轮值维护者，可以修补。':'还没有维护者；循环停在这里，不能自动变成完好的袋子。'),'破损已经修补，补丁与记录保留。它可以交给下一位。','下一位使用者领走了同一个袋子。一次归还，接上下一次使用。'][s.stage];
 if(unit===5){if(!s.day)return '示例条件：免费借用 7 天，到期自主归还；续借需再次确认，购买需另行确认价格。';if(s.decision)return {return:`七天中使用了 ${s.used.length} 天。你选择归还，借用可以结束，购买不是必经的一步。`,renew:`七天中使用了 ${s.used.length} 天。你选择申请续借，是否还有库存和维护条件需要重新确认。`,keep:`七天中使用了 ${s.used.length} 天。你选择进一步了解购买；真实价格与维护成本仍需单独确认。本次仅演示判断，不产生订单。`}[s.decision];return `第 ${s.day} / 7 天 · 已实际使用 ${s.used.length} 天。${s.day===7?'体验到期：可以归还、申请续借或进一步考虑购买。':'你可以使用一次，也可以直接度过这一天。闲置同样值得被看见。'}`;}
 if(unit===6)return ['广场里有人停留。这是非紧急情境，系统尚未提出处置。','系统以“停留影响通行”为由建议收拢围挡。机械动作停在执行前，等待人的回应。',`${s.by}提出暂停，围挡停止推进。现在需要一位能够承担责任的人回应。`,'暂停后无人回应：围挡保持停止，问题没有解决。一个按钮还需要接得住它的人。','现场负责人来到沟通席。当事人说明正在等人，双方讨论保留停留区与通行带。','替代安排形成：围挡退回，通行带与停留区同时保留。沟通改变了原来的处置。'][s.stage];
 return '';
}
