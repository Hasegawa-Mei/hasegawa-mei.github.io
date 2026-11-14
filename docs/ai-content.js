// These are speculative situations, not measurements of readers or predictions.
export const legacyAIAnswers={boundary:['保留阻挡','保留边界，增加入口','需要先听使用者的意见'],power:['我更在意谁支持','我更在意谁执行','我想知道谁能参与决定'],'alienation-two':['回到实际需要','看重使用与持久性','重新辨认是谁的期待']};
export const aiCases = {
 process:{name:'被折叠的过程',unit:0,layer:2,field:'processMode',
  question:'结果已经出现，我还知道它为什么成立吗？',
  hint:'切换工作方式，再加入一条新要求。观察哪些过程仍然可以打开。',
  bridge:'工具性 → 思考与判断',
  modes:['直接采纳','生成后复核','先尝试再协作'],
  statuses:['五道过程折起，只留下交付结果。省下时间，也暂时看不到依据。','依据、比较与复核重新展开；AI 仍然参与，判断也有人承担。','先留下自己的草案，再借助 AI 比较与修订；过程可以回看。'],
  challenge:['新要求：需要为读屏用户补充图片说明。原结果还没有满足它。','新要求进入复核，图片说明被补上。修改仍需由使用者确认。','自己的草案与生成结果一起重审，图片说明被补上。'],
  action:'换一种工作方式'},
 door:{name:'原本打不开的门',unit:0,layer:3,field:'doorStage',
  question:'当工具打开门，接下来是谁回应了我？',
  hint:'推进一次社区服务网站的诞生：从不会制作，到生成页面，再到回应真实使用者。',
  bridge:'工具性 → 行动与回应',
  modes:['想法被卡住','借助 AI 实现','邀请使用者'],
  statuses:['想做社区互助网站，却还不会制作。门后的想法尚未落地。','门打开，页面生成。技术门槛降低了，使用是否方便仍待检验。','使用者指出入口与文字的问题，制作者修改并承诺维护。作品开始连接具体的人。'],
  action:'推进下一步'},
 work:{name:'重新分配的工作台',unit:2,layer:2,field:'workMode',
  question:'效率提高以后，谁来决定省下的时间属于谁？',
  hint:'同一间工作室，四种分配方式。留意工作台、任务与人的位置怎样改变。',
  bridge:'权力 → 劳动、制作与共同决定',
  modes:['只缩减岗位','减轻重复工作','共同学习转型','提高产量要求'],
  statuses:['重复任务移交 AI，两个岗位被撤去；受影响的人仍然留在画面里。','保留岗位，减少重复任务，腾出的时间用于复核与协作。','共同安排培训与过渡；学习需要时间、资源和持续支持。','岗位保留，任务队列却继续增长。工具更快，不等于人一定更轻松。'],
  action:'换一种分配'},
 hype:{name:'围着光说话的人',unit:5,layer:4,field:'hypeMode',
  question:'我们在讨论共同的问题，还是展示自己靠近了哪束光？',
  hint:'先看更新与身份如何吸引目光，再隐藏标签，最后提出一个可以一起回应的问题。',
  bridge:'消费者社会 → 共同世界与判断',
  modes:['追逐更新','隐藏身份标签','回应具体需要'],
  statuses:['“更新了”“我先用上了”围着光旋转；中央待修的社区入口暂时无人回应。','工具仍然存在，身份标签暂时撤去。没有标签之后，我想做什么？','人们转向社区入口，讨论无障碍通道并一起修复。新手也能贡献具体的改变。'],
  action:'推进讨论'}
};
export function aiAt(unit,step){return Object.entries(aiCases).find(([,c])=>c.unit===unit&&c.layer===step)?.[0]||'';}
export function withAILayers(unit,base){const list=base.slice();list.splice(-1,0,...Object.values(aiCases).filter(c=>c.unit===unit).map(c=>c.name));return list;}
export function aiStatus(o){const c=aiCases[o.aiCase];if(!c)return '';return c.statuses[o[c.field]||0]+(o.aiCase==='process'&&o.processChallenge?' '+c.challenge[o.processMode||0]:'');}
export const aiFinals={
 0:{question:'从一道围栏到 AI 工具，我想怎样决定是否让它替我完成？',choices:['保留能检查与撤回的入口','先问清目的与依据','让实际使用者参与检验'],
  echoes:['复核台重新展开。工具参与工作，人仍能检查过程。','门已打开，页面仍等待检验：完成不等于目的已经实现。','不同的使用者来到入口，反馈开始改变这个作品。'],
  variants:[{aiCase:'process',processMode:1,processChallenge:true},{aiCase:'door',doorStage:1},{aiCase:'door',doorStage:2}]},
 2:{question:'从一声命令到 AI 转型，怎样的改变值得共同支持？',choices:['让受影响的人参与分配','追问决定由谁负责','把效率收益用于共同学习'],
  echoes:['人留在工作台旁，省下的任务交由大家共同安排。','工作台撤去后，人仍在场：决定与代价不能一起被隐藏。','学习桌打开，转型所需的时间与支持被留出来。'],
  variants:[{aiCase:'work',workMode:1},{aiCase:'work',workMode:0},{aiCase:'work',workMode:2}]},
 5:{question:'从购物橱窗到 AI 热潮，我想把注意力交给什么？',choices:['先回到具体需要','把作品留给真实使用','辨认我在追逐谁的认可'],
  echoes:['讨论围绕一处真实入口展开，问题开始替代身份标签。','无障碍通道留下来，作品的意义继续接受使用的检验。','标签撤去，技术仍在。谁的目光安排了我的欲望？'],
  variants:[{aiCase:'hype',hypeMode:2,hypeRepair:false},{aiCase:'hype',hypeMode:2,hypeRepair:true},{aiCase:'hype',hypeMode:1}]}
};
export const aiReadings={
 boundary:[
  ['threshold','从围栏的入口到 AI 工作台的复核口，你关注一种可以重新打开的边界。你愿意使用工具，也希望在结果出错或需求改变时，仍有能力检查、拒绝和撤回。','保留检查与撤回的入口'],
  ['inquiry','门打开、作品生成，并不能单独说明事情已经做好。你会继续追问它服务谁、依据是什么、怎样验证；把暂缓采纳留作判断的空间。','把完成与目的区分开来'],
  ['witness','从轮椅使用者到社区网站的实际读者，你愿意让别人的处境改变自己的方案。你承认制作者的视角有限，用反馈重新检验工具是否真正有用。','用具体使用者的处境检验作品']
 ],
 power:[
  ['assembly','你把效率分配也看作需要共同商量的事务。工作方式改变时，承受变化的人应当能够表达意见、回应彼此，并参与决定收益如何分配。','让受影响的人参与分配'],
  ['inquiry','AI 承接了任务，却没有替决定者承担责任。你愿意追问是谁撤去了岗位、由谁安排过渡，以及受影响的人还能向谁提出异议。','追问转型决定与责任的归属'],
  ['assembly','你希望省下的时间能够成为大家学习和调整的条件。共同学习并非一句口号：它需要协商资源、留出时间，也需要彼此愿意继续合作。','把收益转化为共同学习的条件']
 ],
 'alienation-two':[
  ['discern','橱窗里的标签和 AI 更新的消息都可能吸引目光。你愿意停下来，辨认眼前有没有具体需要，而不以工具的新旧或昂贵来替代自己的判断。','让具体需要引导注意力'],
  ['repair','你在意生成以后，作品是否仍然有人使用、修正和维护。你希望快速产出的东西也能留在共同生活里，而不是很快被下一次更新替换。','让作品进入使用与维护的时间'],
  ['discern','工具没有变，标签摘下后感受却可能不同。你愿意分辨热情里有多少来自探索，又有多少来自优越感、焦虑或被他人认可的期待。','辨认热潮中自己与他人的期待']
 ]
};
export function finalSceneName(row){const f=aiFinals[row.unit];return f&&f.choices.includes(row.answer)?aiCases[f.variants[row.choice].aiCase].name:row.study.title.join('');}
