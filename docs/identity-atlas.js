import {faces} from './reading-round.js';
import {identityChoiceMap,identityRules} from './final-choices.js';
import {cardArt} from './identity-card.js';
const motifs={threshold:'钥匙与敞开的门拱',assembly:'伸出的手与不同侧面的肖像',repair:'被接续的器皿与橄榄枝',inquiry:'透镜、书卷与悬置的问题',discern:'取下的面具与折光棱镜',witness:'侧身观看的人与空椅'};
document.getElementById('identity-gallery').innerHTML=faces.map((face,index)=>'<article><figure aria-label="'+face.name+'">'+cardArt(face)+'</figure><div class="atlas-caption"><span>0'+(index+1)+' / '+face.en+'</span><h2>'+face.name+'</h2><p>'+face.thought+'</p><small>'+motifs[face.id]+'</small></div></article>').join('');
document.getElementById('identity-back').innerHTML=cardArt();
document.getElementById('identity-rules').innerHTML=Object.values(identityRules).map(rule=>'<li>'+rule+'</li>').join('');
document.getElementById('identity-map').innerHTML=identityChoiceMap().map((row,index)=>'<tr'+(index%3===0?' class="unit-start"':'')+'><th scope="row">'+(index%3===0?row.unit:'')+'</th><td>'+row.answer+'</td><td>'+row.identity+'</td><td>'+row.thread+'</td></tr>').join('');
const media=matchMedia('(prefers-reduced-motion:reduce)');
for(const figure of document.querySelectorAll('.atlas-gallery figure,.atlas-back figure')){
  figure.addEventListener('pointermove',event=>{if(media.matches||event.pointerType==='touch')return;const rect=figure.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;figure.style.transform='perspective(1200px) rotateX('+(-y*5)+'deg) rotateY('+(x*7)+'deg)'});
  figure.addEventListener('pointerleave',()=>{figure.style.transform=''});
}
