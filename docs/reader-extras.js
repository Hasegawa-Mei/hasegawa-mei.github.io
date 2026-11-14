import {studies} from './dialogue-content.js';
import {aiFinals,legacyAIAnswers} from './ai-content.js';
const $=id=>document.getElementById(id);
export const originals={
 1:{file:'camden.jpg',title:'Camden Bench · 卡姆登长椅',alt:'老师提供的卡姆登长椅案例图，含四张使用照片及排斥性设计分析'},
 3:{file:'weather.jpg',title:'The Weather Channel · 天气应用',alt:'老师提供的天气应用原案例图，比较服务便利与位置数据用途'},
 4:{file:'bag.jpg',title:'可焊接塑料手提袋',alt:'老师提供的塑料手提袋案例图，展示产品、专利图和使用后的环境影响'},
 6:{file:'tool.jpg',title:'工具与社会后果',alt:'老师提供的工具案例图，比较工程效率与社会后果'}
};
export function originalMarkup(index){const o=originals[index];return `<h2>${o.title}</h2><p class="original-caption">老师提供的课堂案例原图</p><div class="original-scroll"><img class="original-image" src="assets/references/${o.file}" alt="${o.alt}"></div><p class="fine">原图中的分析保留其课堂讨论语境。本书的概念理解与对应设计见“阅读手记”。</p>`;}
export const gathering=['一人坐下','对面有人','四人围坐','更多人来到','不同的人共在'];
export function boundaryResult(o){return o.hazard?'施工区域没有可抵达的目的地，人物停下。':o.gate?'入口已开，人物自动沿通路走到对面。':o.wheelchair?'入口关闭，轮椅无法跨越这道边界。':o.material===2?'高密金属阻挡通行，人物停在边界前。':o.material===0?'绳索容易跨越，人物抬脚跨过。':'硬质低栏需要更费力地跨越，人物抬腿越过。';}
export const powerResult=o=>o.support?(o.execute?'有人支持，也有人执行。命令经由他人变为结果。':'支持仍在，执行者拒绝。命令没有实现。'):(o.execute?'支持已撤回，执行仍继续。服从与共同支持发生分离。':'支持与执行都撤回。王座与按钮无法独自实现命令。');
export const echoes=[
 ['金属边界保留，人物停在外侧。','入口打开，让保留的边界留出通路。','换一位轮椅使用者，重新检验入口。'],
 ['不同年龄与身体条件的人进入同一场所。','对话在不同位置出现，意见可以并存。','共同议题居于中央，回应在人与人之间传递。'],
 ['共同支持的线路被强调。','执行者与命令的结果变得突出。','共同议题面出现，决定也可以由人们一起讨论。'],
 ['只回应一次吩咐，生活习惯仍留在屏风之后。','用途分开，天气服务保留，商业支路关闭。','收回习惯记录，屏风合拢，服务退回临时吩咐。'],
 ['循环袋被留在手中，继续使用成为重点。','袋子回到归还柜，通路重新连起。','商店的维护者来到归还点，共同承担后续工作。'],
 ['回到日用商街，有限的清单已经满足。','保留同一物件，移开身份标签。','标签暂时保留，周围的目光转向别处。'],
 ['工具留在展柜里，目的仍待追问。','展柜打开，让承担后果的人进入视野。','工具退场，受影响的人向共同议题靠近。']
];
export function reflectionOptions(index,step,last,entry,base,time){
 const o={...base,reflection:-1,reading:step>0};if(step!==last||!entry.after)return o;let i=studies[index].afterChoices.indexOf(entry.after);const legacy=i<0;
 if(legacy)i=(legacyAIAnswers[studies[index].id]||[]).indexOf(entry.after);if(i<0)return o;o.reflection=i;
 if(aiFinals[index]&&!legacy)return Object.assign(o,aiFinals[index].variants[i]);
 if(legacy)o.aiCase='';
 const variants=[
 [{material:2,gate:false,hazard:false,wheelchair:false},{gate:true,hazard:false,wheelchair:false},{gate:true,hazard:false,wheelchair:true}],
 [{meeting:true,open:true,gather:5},{meeting:true,open:true,gather:4},{meeting:true,open:true,gather:5}],
 [{support:true,execute:false},{support:false,execute:true,commandAt:time-2},{support:true,execute:true,commandAt:time-2}],
 [{chamber:true,service:0},{chamber:false,precise:true,commercial:false},{chamber:true,service:0,revoked:true}],
 [{reuse:true,phase:1},{reuse:true,phase:3},{reuse:true,phase:3,maintenance:true}],
 [{era:1,bought:true},{era:2,status:false},{era:2,status:true,lookAway:true}],
 [{stage:0},{stage:1},{stage:2,convene:true}]
 ];return Object.assign(o,variants[index][i]);
}
for(const [i,final] of Object.entries(aiFinals))echoes[+i]=final.echoes;
