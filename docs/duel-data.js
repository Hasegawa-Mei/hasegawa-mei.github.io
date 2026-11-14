// These fictional situations extend Arendt's concepts; accepted lenses are
// authored game rules, not an AI assessment or an exhaustive philosophical truth.
export const concepts=[
 {id:'instrument',name:'工具性',en:'MEANS / ENDS',definition:'工具能够完成任务，仍需追问目的是否值得，以及后果由谁承担。'},
 {id:'public',name:'公共领域',en:'A COMMON WORLD',definition:'共同世界让不同的人彼此显现，共同事务需要可以发言与回应的空间。'},
 {id:'power',name:'权力',en:'ACTING TOGETHER',definition:'权力依托人们共同支持与行动，不能简单等同于命令、技术能力或强制。'},
 {id:'privacy',name:'私人领域',en:'A PLACE OF ONE’S OWN',definition:'为不必始终公开的生活保留庇护；这里将这一问题延伸到数据与自主边界。'},
 {id:'alienation',name:'世界异化',en:'WORLD ALIENATION',definition:'追问人是否失去对持久、共同世界的联系；不把所有不适都称为异化。'},
 {id:'violence',name:'暴力',en:'FORCE / CONSEQUENCE',definition:'暴力以工具放大强制力量，与共同支持所形成的权力有别。'},
 {id:'action',name:'行动',en:'A NEW BEGINNING',definition:'人在复数的人群中以言说和行动发起新事，后果需要他人参与与回应。'},
 {id:'plurality',name:'复数性',en:'MANY PERSPECTIVES',definition:'人们共同生活，却并不相同。差异不是可以被平均结果直接替换的噪声。'},
 {id:'judgment',name:'判断',en:'THINK / JUDGE',definition:'暂停现成答案，面对具体情境形成判断；正确执行规则不等于已经判断。'},
 {id:'imagination',name:'想象力',en:'OTHER STANDPOINTS',definition:'在判断中尝试呈现缺席者的立场，同时承认自己不能替他人穷尽经验。'}
];
export const scenarios=[
 {id:'borrowed-voice',title:'借来的声音',eyebrow:'01 / SYNTHETIC VOICE',kind:'signal',variant:0,question:'洪水警报里传来熟悉的声音，但发声的人并不在现场。',detail:'社区收到一段 AI 合成的疏散音频。转发者相信声音；住户却找不到可以核实的出处。你会先改变哪一步？',accepted:['judgment','public','instrument','imagination'],reading:'声音的逼真不能替代事实核实。可从判断、共同信息渠道、工具用途或缺席者处境建立论证。',prompt:'用你的概念解释问题，并提出一个具体做法。'},
 {id:'silent-council',title:'无人到场的会议',eyebrow:'02 / REPRESENTATION',kind:'council',variant:0,question:'每位居民的 AI 代理都投了票，居民本人却不能发言。',detail:'自治平台说它已经知道所有人的偏好。一个改变了想法的居民请求参加，却被告知“你的代理已代表你”。',accepted:['public','power','action','plurality','imagination'],reading:'偏好汇总不自动成为共同言说与行动。关键在于居民能否亲自显现、改变意见并回应彼此。',prompt:'你会为谁保留什么参与方式？'},
 {id:'restored-archive',title:'补全的空白',eyebrow:'03 / SYNTHETIC MEMORY',kind:'archive',variant:0,question:'一份修复后的城市档案很完整，但没人知道哪些段落是 AI 补写的。',detail:'破损影像被修复、缺失口述被补全。原件被丢弃之后，推测与证词开始以同样的面貌流传。',accepted:['alienation','judgment','public','instrument','imagination'],reading:'保存共同记忆需要可追溯的材料与边界。可以讨论世界的持久性、核查、公共事实及对缺席者的呈现。',prompt:'怎样让修复帮助记忆，而不替换记忆？'},
 {id:'clean-street',title:'无人的清洁指令',eyebrow:'04 / AUTOMATED FORCE',kind:'robot',variant:0,question:'清洁机器高效清走街角的物品，其中也包括一个人的全部家当。',detail:'指令只有“移除障碍”。执行端识别出可搬走的物品，却没有询问使用这些物品的人。',accepted:['violence','instrument','judgment','public','imagination'],reading:'强制移除的工具后果与执行目的需要被追问。效率不足以说明强制正当，受影响者的处境也应进入判断。',prompt:'指出被省略的判断，并提出可执行的限制。'},
 {id:'afterlife',title:'未经同意的重逢',eyebrow:'05 / INTIMATE DATA',kind:'threshold',variant:0,question:'一个人逝去后，家人用他留下的讯息生成了会继续回答的分身。',detail:'分身能安慰一位家人，却暴露了另一位家人的秘密。当本人无法同意时，谁可以决定它说什么？',accepted:['privacy','judgment','imagination','plurality','instrument'],reading:'这里同时存在亲密生活的边界、无法发言的本人，以及彼此不同的亲属处境；便利不能代替这些判断。',prompt:'你会如何划定分身可以使用与回应的范围？'},
 {id:'assigned-future',title:'已经写好的未来',eyebrow:'06 / PREDICTED LIFE',kind:'paths',variant:0,question:'学校的 AI 推荐了最适合你的路，其他入口却因此不再开放。',detail:'过去的表现被用来预测将来。一个学生想尝试从未做过的事，系统认为这会降低整体成功率。',accepted:['action','judgment','plurality','imagination','power'],reading:'人的新开端不能被既有轨迹穷尽。可以追问谁决定道路、差异如何被对待，以及尝试新事的空间。',prompt:'怎样保留尝试和改变方向的可能？'},
 {id:'same-window',title:'相同的窗口',eyebrow:'07 / FILTERED WORLD',kind:'windows',variant:0,question:'每个人都说看见了世界，屏幕里的世界却越来越一样。',detail:'内容系统不断优先展示高点击版本。陌生经验逐渐消失，平台把差异过少解释为“大家自然达成了一致”。',accepted:['plurality','alienation','public','judgment','imagination'],reading:'相同的内容不等于人们已共同判断。共同世界需要多个位置与经验的显现，而不是把差异过滤掉。',prompt:'你会给哪些不常出现的经验留下入口？'},
 {id:'translation-gap',title:'翻译之间的空白',eyebrow:'08 / LISTENING',kind:'signal',variant:1,question:'屏幕把每一句话都翻译得流畅，但求助者仍摇着头。',detail:'救助站依靠 AI 翻译交流。一位说少数语言的人反复说明特殊处境，系统却将其归为最常见的标准请求。',accepted:['plurality','imagination','judgment','instrument','public'],reading:'流畅表达不保证具体处境已经被理解。需要承认不同经验，听取修正，并为工具留下转接和复核的通路。',prompt:'你会如何确认对方真正被听懂了？'},
 {id:'perfect-monument',title:'没有争议的纪念碑',eyebrow:'09 / PUBLIC MEMORY',kind:'archive',variant:1,question:'AI 为城市写出统一的历史，矛盾证词被删成了“冗余”。',detail:'纪念馆用生成文本替换多人证词。展览更顺畅，一位见证者却再也找不到自己记得的那一段。',accepted:['public','plurality','alienation','judgment','imagination'],reading:'共同记忆不必通过抹平差异来形成。可以保留来源与矛盾，让具体的人作为见证者继续显现。',prompt:'如何让展览容纳彼此不一致的记忆？'},
 {id:'entry-consent',title:'必须接受的便利',eyebrow:'10 / ACCESS',kind:'threshold',variant:1,question:'公共图书馆换上 AI 人脸入口，拒绝识别的人被挡在门外。',detail:'管理方承诺进出更快，却取消了原来的借阅证通道。对于不愿交出面部数据的人，便利成为必须接受的条件。',accepted:['privacy','public','power','instrument','judgment'],reading:'可拒绝的选择与共同资源的可进入性需要一起考虑。技术效率本身不能决定哪些人失去入口。',prompt:'怎样让便利不以被迫授权为代价？'},
 {id:'distance-command',title:'遥远的执行者',eyebrow:'11 / RESPONSIBILITY',kind:'robot',variant:1,question:'巡逻系统准备驱离人群，控制室里的人只看到了一个风险分数。',detail:'AI 标出“异常聚集”，远程设备随即推进。现场的人解释正在等避雨，但这句话没有进入控制界面。',accepted:['violence','power','judgment','instrument','imagination'],reading:'工具强制、共同支持与具体判断应加以区分。把责任推给风险分数，并没有消除执行者的责任。',prompt:'在执行发生之前，谁应当能暂停与提出异议？'},
 {id:'community-signal',title:'重建一条线路',eyebrow:'12 / BEGINNING TOGETHER',kind:'council',variant:1,question:'平台将关闭一项社区服务，人们开始尝试共同维持它。',detail:'AI 服务的提供者退出后，居民有人主张放弃，有人提出开放资料、轮流维护。能否延续，取决于是否有人愿意回应并共同承担。',accepted:['action','power','public','alienation','plurality'],reading:'新开端需要言说、回应与持续支持。可从共同力量、维护共同世界和容纳不同参与者来理解这一行动。',prompt:'提出一个能让别人回应并加入的第一步。'}
];
export const conceptById=id=>concepts.find(c=>c.id===id);
export const scenarioById=id=>scenarios.find(s=>s.id===id);
