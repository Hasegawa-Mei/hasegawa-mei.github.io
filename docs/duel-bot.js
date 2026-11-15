import {concepts,conceptById,scenarioById} from './duel-data.js';
import {selectConcept,submitTurn} from './duel-state.js';
import {openEndgameGate,submitDesign,submitRating} from './duel-endgame.js';

export const botNotice='机器人普通回合有 80% 概率选择预设关联概念；终局使用固定参考方案，给你的四项评分均为随机 1–5 分，不评阅文字。';
// Authored reference responses, one per challenge. These are examples, not unique truths.
export const botDesigns={
 'room-for-difference':{concept:'plurality',plan:'复数性要求不同经验真正进入评价。我会由教师、学生代表和作品服务对象组成评审小组。AI 只整理材料并标注不确定处，不决定名次；学生可用展示、口述或实物演示说明价值。展览同时设轮换席位，给样本少、方法不同的作品公开陈述和被讨论的机会。',care:'评审耗时且仍可能偏向熟悉的形式。学校公布评价理由，学生可补充证据，向未参加初评的小组申请复核；复核前保留展示名额，并邀请原先缺席的使用者回应。'},
 'reversible-delegate':{concept:'power',plan:'权力来自居民的共同支持。我会让 AI 代理先公布建议、依据和受影响范围，授权只用于形成草案。动工前由居民在现场会议、电话或纸质回执中亲自确认，并允许修改意见；社区工作人员走访不上网的使用者，将分歧公开后再形成有期限的共同决定。',care:'本人参与会减慢进度，少数意见仍可能被淹没。居民可随时撤回代理授权；涉及基本使用权的异议先暂停相关施工，由居民与受影响者复议，公布答复日期和可撤销的试行方案。'},
 'learning-with-a-way-back':{concept:'judgment',plan:'判断要求学生面对具体情境说明自己的理由。我会允许 AI 提供草稿，但要求学生标注使用位置，挑出一个假设、核查一项证据，再改变条件修订方案。课堂以口述、图解、文字或演示任选方式展示推理，由同伴追问、教师根据过程记录评价，而不按答案的完整程度排名。',care:'表达速度和工具条件可能不平等。教师提供离线材料与延时展示；暂时依赖 AI 答案的学生参加小组拆解练习，独立解释一个新例子后再次提交。反馈指出具体推理缺口，保留重做机会。'},
 'a-door-without-a-scan':{concept:'privacy',plan:'私人领域意味着基本服务不能以交出面部数据为条件。我会保留借阅证和临时纸票入口，与自愿刷脸通道并行；图书馆只收集借阅所需的信息，推荐另行选择。面部模板加密留在本馆，退出识别时立即删除，通行记录七天后删除，借阅联系信息在结清并注销后删除；不向推荐方传输人脸数据。',care:'人工窗口人手有限，识别也会失败。入口提供无需手机的求助按钮，由当班馆员核验证件或登记临时票，先允许使用基本服务。申诉在两个工作日内答复，错误记录可更正，并定期检查两条通道的等待差异。'}
};
export function botPending(s){return s?.mode==='bot'&&((s.phase==='play'&&s.active===1)||(s.endgame?.active===1&&['endgame-write-gate','endgame-write','endgame-score-gate','endgame-score'].includes(s.phase)));}
const pick=(items,rng)=>items[Math.floor(rng()*items.length)];
export function advanceBot(s,rng=Math.random){
 if(!botPending(s))return false;
 if(s.phase==='play'){
  const scenario=scenarioById(s.scenario),p=s.players[1],correct=rng()<.8;
  let pool=p.hand.filter(id=>scenario.accepted.includes(id)===correct);
  // Even an all-correct remaining hand must honor the requested 20% error rate.
  // Replace one card in place; never add a card or alter the human's hand.
  if(!pool.length){const id=pick(concepts.filter(c=>scenario.accepted.includes(c.id)===correct).map(c=>c.id),rng);p.hand[p.hand.length-1]=id;pool=[id];s.swapNote='机器人为执行本轮概率规则，等量补换了一张概念牌。';}
  const id=pick(pool,rng);selectConcept(s,id);
  s.reason=correct?`我选择「${conceptById(id).name}」。${scenario.reading}`:`我选择「${conceptById(id).name}」，从“${conceptById(id).definition}”出发理解这个情境。这次尝试只沿用这个角度，可能遗漏了情境中更直接的问题。`;
  submitTurn(s);return true;
 }
 const e=s.endgame;
 if(s.phase.includes('write')){
  const design=botDesigns[e.challenge];if(!design)throw Error('缺少这一题的机器人参考方案。');
  openEndgameGate(s);e.drafts[1]={...design};submitDesign(s);
 }else{
  openEndgameGate(s);e.ratingDrafts[1]={values:Array.from({length:4},()=>1+Math.floor(rng()*5)),comment:'这四项分数由机器人随机生成，仅用于本局游戏，不代表对你的概念、方案或文字质量的评价。'};submitRating(s);
 }
 return true;
}
