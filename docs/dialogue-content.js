export const studies = [
 {id:'boundary',number:'01',term:'工具性 · 公共',en:'INSTRUMENTALITY / PUBLIC',title:['一道边界','三种语气'],object:'边界组件 / 围栏与可开启的入口',lead:'你停下，是因为过不去，还是因为觉得不该过去？',intro:'同一条边界，换一种材料，就换了一种与身体说话的方式。先留下直觉，再看看它对不同的人意味着什么。',question:'如果围栏很容易跨过，你会怎样理解它？',choices:['一种提醒','仍然是禁止','要看它保护什么'],counter:'阻挡得更有效，就意味着设计得更好吗？',concept:'工具性的视角让我们看见手段与目的：围栏可以有效阻止通行，却不能仅凭这一点回答“为什么阻止、由谁决定”。公共的追问则是，哪些人还能进入、出现和参与。',limit:'这是借助概念展开的设计转译。围栏的硬度不代表阿伦特意义上权力的大小；三种材料也不是三种固定的法律等级。',after:'看过不同身体与使用情境之后，你会保留怎样的边界？',afterChoices:['保留阻挡','保留边界，增加入口','需要先听使用者的意见'],source:'《人的境况》§21：工具性与制造者；§7：公共领域。',link:'https://www.frontdeskapparatus.com/files/arendt.pdf',extras:'围栏、开口、通行路径与人物均为本项目的情境示意，不表示真实设施的工程或无障碍认证。'},
 {id:'public',number:'02',term:'公共 · 复数性',en:'PUBLIC / PLURALITY',title:['谁的','长椅'],object:'公共座椅 / 扶手、座面与伴坐位置',lead:'同一个扶手，可能帮一个人站起来，也让另一个人无法躺下。',intro:'公共物件容纳的身体，往往比设计图纸里的标准人物更多。改变一个小部件，看看谁的处境也跟着改变。',question:'看到长椅中间的扶手，你首先想到什么？',choices:['帮助起身','划分距离','限制躺卧'],counter:'我以为“对所有人都好”的设计，遗漏了谁？',concept:'共同面对一件事物，并不意味着所有人从同一个位置看它。公共生活需要不同的人能够出现；这张长椅提供的只是条件，使用者能否发声与参与仍然重要。',limit:'扶手并不天然等于排斥，取消扶手也不自动创造共同体。这里比较具体的帮助和限制，不给一种形态贴上唯一的好坏标签。',after:'如果由你改造这张长椅，你最想先做什么？',afterChoices:['取消中间隔断','保留起身辅助','邀请不同使用者一起试坐'],source:'《人的境况》§7：公共领域——共同世界；§24：行动与言说中的显露。参考案例：Camden Bench。',link:'https://ualresearchonline.arts.ac.uk/id/eprint/3155/1/camden_asb_resistant_bench_apr_2011.pdf',extras:'本场景是重新设计的公共座椅，不是 Camden Bench 的复刻。人物、接触位置与伴坐区域用于方案比较。'},
 {id:'power',number:'03',term:'权力',en:'POWER',title:['按钮背后','的人'],object:'思辨装置 / 命令、支持与执行',lead:'你按下了按钮。让它生效的，究竟是谁？',intro:'从王座正面看，一切似乎取决于一个人的命令。转到背面，支持、执行与拒绝开始分别变得可见。',question:'一个人能发号施令，是否就说明权力属于他？',choices:['按钮在他手里','还要有人支持','还要有人执行'],counter:'服从、支持与共同行动，是同一件事吗？',concept:'阿伦特把权力理解为人们共同行动的能力，它依赖群体的持续支持。命令、强制与执行能力需要分别辨认，不能把它们合成一个“权力值”。',limit:'撤回支持后，命令仍可能被执行。本装置刻意保留这种张力；它不是对一切政治制度运作方式的完整模拟。',after:'看见按钮背后的关系后，你会怎样重新描述它？',afterChoices:['我更在意谁支持','我更在意谁执行','我想知道谁能参与决定'],source:'阿伦特《论暴力》第二部分；《人的境况》§28：权力与显现空间。',link:'https://plato.stanford.edu/entries/arendt/#ActPow',extras:'人物与线路为预设的思辨场景，不代表真实参与者。光线显示支持与执行路径，不衡量个人意见的价值。'}
];
studies[1].caseNote='老师提供的 Camden Bench 案例。制造方强调防盗、清洁与共享座位；本项目同时追问，曲面和棱角让哪些使用方式更困难。案例切片为概括模型，不是原产品的精确复刻。';
studies[1].references=[{label:'Factory Furniture · Camden 原设计说明',url:'https://factoryfurniture.co.uk/project/great-queen-st-camden/'},{label:'UAL · Camden Bench 案例研究',url:'https://ualresearchonline.arts.ac.uk/id/eprint/5085/'}];
studies[1].extras='普通长椅为本项目的改造提案；打开“对照卡姆登长椅”可观察参考案例的概括形态。人物与接触位置用于方案比较。';
const humanCondition='https://www.dbu.edu/Mitchell/modern-resources/_documents/arendt_the_human_condition.pdf';
studies.push(
 {id:'privacy',number:'04',term:'私人领域',en:'THE PRIVATE REALM',title:['天气之外的位置'],object:'服务设计 / 可见的数据去向',question:'为了知道会不会下雨，我需要交出多少生活轨迹？',choices:['允许精确定位','只提供所在城市','先看清数据去向'],counter:'能够被看见，是否就意味着应该被公开？',concept:'阿伦特区分公共显现与私人生活的庇护。人需要进入共同世界，也需要不被持续暴露的空间。这里借这一差别讨论位置数据：获取天气服务，不应被直接等同于同意生活轨迹进入其他用途。',limit:'这是将公私领域的讨论转译到当代数据服务。阿伦特没有讨论这款应用；数据透明也不等于阿伦特意义上的公共生活。',after:'天气仍然显示时，你会怎样重新安排授权？',afterChoices:['默认只选城市','用途分别授权','保留随时撤回的入口'],source:'《人的境况》第二章，尤其 §7—§9：公共、私人领域与社会领域。',link:humanCondition,caseNote:'老师提供的 The Weather Channel App 案例。2019 年相关诉讼质疑位置数据用途的披露，2020 年和解涉及授权提示的修改。本场景提出“服务用途与商业用途分开”的再设计，不是该应用当前界面的复刻。',extras:'屏幕上的天气、轨迹与数据流均为演示；不会读取读者的实际位置。玻璃屏幕把原本隐藏的数据支路变得可见。',references:[{label:'2020 年案件和解文书',url:'https://newmedialaw.proskauer.com/wp-content/uploads/sites/49/2020/08/PeopleVTWC-Stipulation-August-2020.pdf'}]},
 {id:'alienation',number:'05',term:'异化 · 共同世界',en:'WORLD ALIENATION',title:['袋子用完以后'],object:'系统设计 / 购物与共享还袋',question:'购物结束了，袋子的故事也结束了吗？',choices:['已经完成它的任务','还可以继续使用','它留在别人的环境里'],counter:'当一切都只为了迅速消费，什么能被共同留下？',concept:'阿伦特关注世界异化：持久的共同世界，如何被无止境的生产、占有与消费挤压。购物袋是一个阅读入口，用来比较“一次用完”与“共同维护、持续使用”，并不是把塑料污染直接等同于世界异化。',limit:'共享还袋是系统设计提案，不是单凭更换材料就能完成的解决方案。运输、清洗、回收和实际复用次数仍需要进一步验证。',after:'你更愿意把设计的重点放在哪里？',afterChoices:['让袋子更耐用','让归还变得容易','让商店共同承担维护'],source:'《人的境况》§17：消费者社会；§18：世界的持久性；§35：世界异化。',link:humanCondition,caseNote:'老师提供的可焊接塑料手提袋案例：一种便宜、便利的日常物，可能在使用结束后留下长期影响。新提案让购物者、商店与归还点形成循环。',extras:'“再购物一次”增加演示中的使用事件；开启共享还袋后，同一件物继续流转。已有废弃物不会被开关抹去。场景不提供减排量估算。',references:[{label:'UNEP · 从一次性使用走向重复使用',url:'https://www.unep.org/en/news-and-stories/story/how-reduce-impacts-single-use-plastic-products'}]},
 {id:'violence',number:'06',term:'暴力 · 工具性',en:'VIOLENCE',title:['工具与它的后果'],object:'思辨展陈 / 被放大的力量',question:'一种工具更有效，是否就意味着它值得被制造？',choices:['先看它实现了什么','先看谁承担后果','还要追问目的'],counter:'工具能够放大力量，却能替目的作出判断吗？',concept:'阿伦特强调暴力的工具性：器械能够放大身体力量，但权力来自人们共同行动。这里把视线从器物的效率移向人的关系，区分“能够迫使他人”与“有人共同支持”。',limit:'武器、强制能力与权力不能被混为一谈。移开武器也不会自动产生共同行动。展陈仅呈现概括外形与概念关系。',after:'重新观看这个物件，你想把什么放进设计评价里？',afterChoices:['使用目的','由谁承担后果','受影响者能否发言'],source:'阿伦特《论暴力》；1969 年《Reflections on Violence》。',link:'https://www.nybooks.com/articles/1969/02/27/a-special-supplement-reflections-on-violence/',caseNote:'老师以 M16 / AR15 的模块化案例提出：工程上的便利，不会替社会后果作出判断。本场景只采用概括的器物轮廓，转化为一件关于工具与目的的思辨展陈。',extras:'先显现周围的人，再移开中央工具。人物仍然在场，提醒读者：共同世界的问题不会随着一个物件消失而结束。',references:[]}
);
studies.splice(5,0,{
 id:'alienation-two',number:'06',term:'异化二 · 消费者社会',en:'WORLD ALIENATION II',title:['一条街，三种购买'],object:'哲学场景 / 交换、需要与身份消费',
 question:'我买下的，是需要的东西，还是被看见的自己？',choices:['满足实际需要','享受物件本身','也在购买一种身份'],counter:'当物件成为身份的证明，是我选择它，还是它安排了我的欲望？',
 concept:'阿伦特在《人的境况》中讨论消费者社会：使用物也可能被卷入不断消耗、不断替换的循环，持久的共同世界随之受到挤压。这里借购物街追问，当满足需要逐渐让位于持续购买，我们与物、与他人的关系发生了什么。',
 limit:'三幕是“交换—需求—身份”三种逻辑的时空寓言，不是所有社会必经的历史顺序，也不表示现代购买都属于异化。身份炫示与炫耀性消费主要借助凡勃伦的分析，不将其假托为阿伦特的原话；价格也不能简单等同于有无价值。',
 after:'摘掉身份标签后，我会怎样重新决定是否购买？',afterChoices:['回到实际需要','看重使用与持久性','重新辨认是谁的期待'],source:'阿伦特《人的境况》§17：消费者社会；§18：世界的持久性；§35：世界异化。对照：凡勃伦《有闲阶级论》第四章，炫耀性消费。',link:humanCondition,
 caseNote:'三个虚构街景依次呈现交换集市、日用商街与身份橱窗。读者先交换物品，再完成一份有限清单，最后尝试摘掉标签，观察同一物件与周围目光的关系。',
 extras:'向右进入三个时代场景，向左可以回看。标签与视线的改变是概念可视化，不是对真实消费者动机的测量。此页与上一页互为补充：上一页追踪物件用完以后，这一页追问购买之前。',
 references:[{label:'凡勃伦《有闲阶级论》· 第四章原文',url:'https://www.gutenberg.org/files/833/833-h/833-h.htm'},{label:'芝加哥大学出版社 · The Human Condition',url:'https://doi.org/10.7208/chicago/9780226924571.001.0001'}]
});
studies[6].number='07';
studies[4].extras='先选择一次性袋或循环袋，再依次领取、完成购物、丢弃或归还。购物次数与留下的袋子分别计数；归还不会抹去之前的废弃物。展示最多六个废弃袋，文字计数保留实际演示次数；不提供减排量估算。';
studies[6].extras='三种观看状态：封闭展柜、展开后果、撤去工具。玻璃墙打开，原本被器物遮蔽的人出现；工具退场后，分隔的路径仍在，表示共同支持不会自动生成。';
studies[1].title=['长椅与议事幕'];
studies[1].object='公共座椅与议事空间 / 停留、显现与参与';
studies[1].concept='公共领域既是人们能够彼此看见、听见的显现，也是把不同的人联系起来的共同世界。长椅追问谁能停留；展开式议事幕进一步追问，谁能围绕共同事务言说、回应和参与。空间设计能够提供条件，却不能代替公共生活本身。';
studies[1].limit='取消扶手不自动创造共同体，玻璃透明或幕片展开也不自动产生公共性。议事幕与“公共领域／显现空间”相对应；人群聚集与座位安排提供相遇的条件，但不保证意见一致，也不把开合模型直接等同于阿伦特意义上的行动。';
studies[1].after='从可以坐下，到可以发言，公共空间还需要什么？';
studies[1].afterChoices=['让不同的人都能进入','允许提出不同意见','让表达得到真实回应'];
studies[1].source='《人的境况》§7：公共领域——共同世界；§24：行动与言说中的显露；§28：权力与显现空间。参考案例：Camden Bench。';
studies[1].link='https://www.frontdeskapparatus.com/files/arendt.pdf';
studies[1].extras='向右依次比较长椅、展开式议事幕与逐步聚集。议事幕由三片玻璃幕、低位座席和共享议题面组成；第四层分五步加入人物，包含儿童、长者、轮椅使用者与推婴儿车的人。人物聚集是交互演示，不是真实会议。读者自己的回应可留在最后一层。';
studies[1].caseNote+=' 展开式议事幕为本项目的空间设计提案，入口、座位与参与规则仍需在真实使用情境中验证。';
studies[3].after='便利与私人边界之间，你更想保留什么？';
studies[3].afterChoices=['只提供当下所需','把用途逐项说清','随时收回被知道的权利'];
studies[3].extras+=' 第二个探索场景是一间虚构古典私室。临时吩咐、记住口味、熟悉日常，逐步展示服务便利与生活信息被掌握的关系。它是当代隐私议题的历史情境寓言，不是具体时代的史实复原。';
studies[3].limit+=' 阿伦特对古代家户的分析还涉及生存必需、家内支配与奴隶劳动，不能把它简化成平等的服务交换。本场景保留主人与侍从之间的不平等，借此追问谁有资格决定谁被看见。';
studies[3].references.push({label:'《人的境况》第二章 · 古代家户与公共、私人领域',url:'https://www.frontdeskapparatus.com/files/arendt.pdf'});
export const bookSource='https://api.pageplace.de/preview/DT0400.9781350070288_A40413939/preview-9781350070288_A40413939.pdf';

// The AI situations extend the philosophical questions; they are not Arendt's own examples.
import {aiFinals} from './ai-content.js';
for(const [index,final] of Object.entries(aiFinals)){
 const s=studies[+index];s.after=final.question;s.afterChoices=final.choices;
 s.extras+=' 新增 AI 情境为思辨演示，不是真实数据、能力测量或行业预测。初印象与探索操作不参与身份计分，最终选择才形成阅读线索。';
}
studies[0].extras+=' 向右继续进入“被折叠的过程”与“原本打不开的门”：比较直接采纳、复核与协作；再观察 AI 如何让新手实现一个社区网站。';
studies[0].limit+=' 将思考与判断用于 AI 议题是本作品的当代延伸。使用 AI 不等于失去思考，手工也不自动保证判断；生成作品属于工具协助的制作，人们发起事务并彼此回应时，才进一步触及行动。';
studies[0].references??=[];
studies[0].references.push({label:'CHI 2025 · 生成式 AI 与批判性思考（知识工作者自报调查，非因果证明）',url:'https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/'},{label:'NBER · Generative AI at Work（特定客服场景中的辅助效果）',url:'https://www.nber.org/papers/w31161'});
studies[2].extras+=' “重新分配的工作台”把支持与执行的问题延伸到 AI 转型：削减岗位、减少重复任务、支持培训、提高产量要求，是不同的组织选择。';
studies[2].limit+=' 权力不等同于管理者单方面控制资源或 AI 的技术能力。工作室中谁能协商、参与并共同支持决定，才与阿伦特的共同行动相关。任务暴露于 AI 不等于整个职业必然消失。';
studies[2].references??=[];
studies[2].references.push({label:'ILO / NASK 2025 · 生成式 AI 对任务与职业的影响：暴露、转型与替代的区别',url:'https://www.ilo.org/resource/news/one-four-jobs-risk-being-transformed-genai-new-ilo%E2%80%93nask-global-index-shows'});
studies[5].extras+=' “围着光说话的人”把身份消费延伸到工具版本、使用权限与更新热潮；讨论的对象是以标签替代判断的倾向，不是对初学者或技术兴趣的嘲讽。';
studies[5].limit+=' “AI 狂欢”是虚构场景名称，不是阿伦特的原有术语，也不把热情、社群交流或新手制作本身视为异化。这里追问不断更新与身份展示是否挤压了具体的共同事务。';
