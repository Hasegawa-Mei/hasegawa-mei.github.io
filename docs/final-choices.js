import {faces,unwrittenFace} from './reading-round.js';
import {studies} from './dialogue-content.js';
import {aiReadings,legacyAIAnswers} from './ai-content.js';

// Each interpretation is paired with the final answer at that position in the reader.
const readings = {
  boundary: [
    ['threshold','你愿意先保住围栏另一侧的安全。对你来说，边界可以有正当用途，但设下它的人需要说明它保护谁。','让阻挡承担保护的责任'],
    ['threshold','你留下了围栏，也为人留出一道门。你关心的是谁能通过、怎样通过，以及一道界线能否给具体的人留有余地。','为边界留出可以通过的入口'],
    ['witness','换到轮椅使用者的位置，同一道低栏就成了另一种障碍。你把倾听使用者放在定方案之前，先理解自己的视角遗漏了什么，再形成判断。','先从使用者的具体处境观看']
  ],
  public: [
    ['witness','轮椅、婴儿车与座位出现在同一个场所。你先关注那些原本进不来、坐不下的人，让被空间遗漏的身体重新进入视野。','看见原本难以进入的人'],
    ['assembly','围坐的人看见的是同一张桌子的不同侧面。你珍惜这种差异，愿意让不同意见在公共空间里得到表达。','为不同的意见保留位置'],
    ['assembly','一张空椅可以让人坐下，一句回应才让发言有了听者。你关心的是一个人的话能否进入大家正在讨论的事情。','让发言得到他人的回应']
  ],
  power: [
    ['assembly','按钮握在一个人手里，支持却来自许多人。你把目光投向仍愿意一起行动的人，追问他们撤回支持时，命令还剩下什么。','看见维系共同力量的人'],
    ['inquiry','你顺着命令看到了执行者。按下按钮与命令生效之间，还有一个人可以接受或拒绝。你愿意追问这一步由谁负责。','追问命令如何成为实际后果'],
    ['assembly','你把视线从王座移向共同议题面。你想知道谁能提出议题、改变决定，以及原本只能听命的人能否也参与其中。','让承受决定的人参与决定']
  ],
  privacy: [
    ['threshold','一次吩咐足以完成眼前的照料。你愿意限定服务所需的信息，让一个人的口味和作息有机会留在私室之内。','为日常生活保留私人空间'],
    ['discern','知道天气与接受广告被放在了同一个授权里。你愿意把它们拆开辨认：服务真正需要什么，额外的用途又是什么，再分别作出选择。','区分必要服务与附加用途'],
    ['threshold','生活习惯会改变，愿意透露多少也会改变。你看重收回记录的能力，让人可以在接受照料后重新划定自己的界线。','让人随时重新划定隐私边界']
  ],
  alienation: [
    ['repair','你把设计的时间拉长到下一次使用。一个能被反复带出门的袋子，让物件在一次购物结束后继续留在生活里。','延长物件可以被使用的时间'],
    ['repair','一个袋子还完好，也需要找得到归还的地方。你关注使用者与下一位使用者如何接上，让重复使用成为实际可行的日常动作。','接续物件的下一次使用'],
    ['assembly','归还之后还要有人清洗、检查和补充。你让商店也进入画面，把维持循环的责任分配给能够共同承担它的人。','让维护成为可以分担的事务']
  ],
  'alienation-two': [
    ['discern','面包和杯子的清单有购足的时刻。你愿意用具体需要为购买划下句点，给自己留下辨认下一次欲望的时间。','用实际需要判断何时已经足够'],
    ['repair','标签摘掉后，物件还能怎样使用、能陪伴多久？你把判断的依据放回物与人的长期关系。','透过身份标签看见物件的使用寿命'],
    ['discern','橱窗里的物件没有换，周围的目光却可以转开。你愿意分辨一次购买里有多少自己的期待，又有多少来自他人的注视。','辨认欲望里他人的目光']
  ],
  violence: [
    ['inquiry','器械能放大力量，制造得越有效，越需要问它被拿来做什么。你愿意先审视目的，再评价工具的成功。','先问工具将被用于什么目的'],
    ['witness','展柜打开后，承担后果的人进入视野。你的注意力从器物的能力移向具体的人：代价落在谁身上，那个人的处境有没有被看见？','看见承担代价的具体的人'],
    ['assembly','工具退到一边，受影响的人来到共同议题旁。你希望他们能说出自己的经历，并在讨论工具用途时得到回应。','让受影响者有机会发言']
  ]
};

const olderAnswers = {
  privacy: ['默认只选城市','用途分别授权','保留随时撤回的入口'],...legacyAIAnswers
};
const legacyReadings=structuredClone(readings);
Object.assign(readings,aiReadings);

export const identityRules={
  method:'每个单元最后确认的预设答案计入一次；同一单元改选会替换旧答案。相同身份的线索最多者成为本轮牌面。',
  tie:'若最高票并列，以其中最后确认的最终答案所指向的身份呈现；其他并列方向保留在解释中。',
  exclusions:'初印象、探索操作和抽牌位置不计分。自写答案与理由照录，不自动猜测归类；没有可归类答案时保留「未定之页」。',
  origin:'六种身份是本作品为阅读倾向设计的名字，来自这轮选择；它们不是阿伦特提出的人格分类。'
};
export function identityChoiceMap(){
  return studies.flatMap(study=>study.afterChoices.map((answer,i)=>{
    const [role,meaning,thread]=readings[study.id][i];
    return {topic:study.id,unit:study.term.split(' · ')[0],answer,role,identity:faces.find(f=>f.id===role).name,meaning,thread};
  }));
}

export function summarizeRound(round) {
  const latest = new Map();
  for (const [order,event] of (round.events||[]).entries()) {
    if (event.kind === '回应' && event.field === 'after') latest.set(event.topic,{...event,order});
  }
  const rows = studies.map((study, unit) => {
    const event = latest.get(study.id);
    const answer = event?.text.trim() || '';
    let choice = study.afterChoices.indexOf(answer);
    const legacy=choice<0;
    if (legacy && olderAnswers[study.id]) choice = olderAnswers[study.id].indexOf(answer);
    const [role, meaning, thread] = (legacy?legacyReadings:readings)[study.id][choice] || [];
    return {unit, study, answer, choice, role, meaning, thread, at:event?.at || 0,order:event?.order ?? -1,
      reason:round.notes?.[study.id] || '', state:round.finalScenes?.[study.id]};
  });
  const groups = new Map();
  for (const row of rows.filter(row => row.role)) {
    if (!groups.has(row.role)) groups.set(row.role,[]);
    groups.get(row.role).push(row);
  }
  const ranked = [...groups.values()].sort((a,b) => b.length-a.length ||
    Math.max(...b.map(r=>r.at))-Math.max(...a.map(r=>r.at)) || Math.max(...b.map(r=>r.order))-Math.max(...a.map(r=>r.order)));
  const evidence = ranked[0] || [];
  const face = faces.find(face=>face.id===evidence[0]?.role) || unwrittenFace;
  const rankedRoles=ranked.map(group=>({role:group[0].role,count:group.length,name:faces.find(f=>f.id===group[0].role).name}));
  const paragraphs = [];
  if (evidence.length) {
    const valid=rows.filter(row=>row.role).length;
    paragraphs.push('本轮有 '+valid+' 个单元留下了可对应的最终选择，其中 '+evidence.length+' 项共同指向「'+face.name+'」。每个单元只计算最后确认的一项。');
    const examples=evidence.map(row=>'在「'+row.study.term.split(' · ')[0]+'」中，你选择'+row.thread);
    paragraphs.push(examples.join('。')+'。');
    paragraphs.push({
      threshold:'你关心的是一道界线何时应该打开，以及当事人能否参与决定。这份对界线和决定权的关注，构成了你的「守界者」。',
      assembly:'你从人们相处的方式理解设计。一个场所或一件工具，能让谁被看见、参与决定、得到回应？这是「共议者」在这轮阅读中的含义。',
      repair:'你把注意力放在一次使用之后。物件能否继续存在、有人接手照料，是你衡量设计的一把尺子，「续物者」由此得名。',
      inquiry:'你追着一件事从目的走到后果，尤其在意谁让它发生、谁为它付出代价。这条不断追问责任的线索，形成了「追问者」。',
      discern:'你会把看似相同的事拆开：必要服务与附加用途、实际需要与身份标签、自己的期待与他人的目光。这份分辨，让这一轮的牌面成为「辨识者」。',
      witness:'你的判断从具体的人开始：难以跨过围栏的人、进不来的人、承担代价的人。你先把他们带入视野，再看一件设计是否成立，因此得名「观照者」。'
    }[face.id]);
    if (ranked[1]?.length===evidence.length) paragraphs.push('「'+rankedRoles.filter(r=>r.count===evidence.length).map(r=>r.name).join('」与「')+'」的线索数量相同。这次呈现你在这些方向中最后确认的「'+face.name+'」，并保留其他并列关注。');
  } else {
    paragraphs.push(rows.some(row=>row.answer)
      ? '你用自己的话留下了判断。它们没有被自动塞进预设身份；「未定之页」逐一保留你的原话与理由。'
      : '这一轮还没有留下最终选择。「未定之页」为尚在形成的判断留出位置；回到单元的最后一层后，可以继续填写。');
  }
  return {face, rows, paragraphs,rankedRoles,rules:identityRules};
}
