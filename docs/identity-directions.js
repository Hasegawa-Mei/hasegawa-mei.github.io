import {faces} from './reading-round.js';
import {cardArt,identityPortraits} from './identity-card.js';
const folder='./assets/identity-studies/';
const params=new URLSearchParams(location.search),only=params.get('only');
const selected=only?faces.filter(face=>face.id===only):faces;
document.getElementById('study-nav').innerHTML=selected.map(face=>'<a href="#'+face.id+'">'+face.name+'</a>').join('');
document.getElementById('study-pairs').innerHTML=selected.map((face,index)=>{
 const a=folder+'a-'+face.id+'.png',b=identityPortraits[face.id];
 return '<section class="study-pair" id="'+face.id+'"><div class="study-heading"><h2>'+face.name+'</h2><p>'+face.concept+'</p><span>0'+(index+1)+'</span></div><div class="study-columns"><article class="study-a"><h3><b>A</b> 装饰化 · 分色构成</h3><figure class="study-stage"><div class="study-reference"><img src="'+a+'" alt="'+face.name+'：参考卡牌风格的装饰化方案"><i class="study-foil" style="--study-src:url('+a+')" aria-hidden="true"></i><figcaption class="study-a-label"><strong>'+face.name+'</strong><small>'+face.en+'</small></figcaption></div></figure></article><article class="study-b"><h3><b>B</b> 原雕像 · 亮白半身</h3><figure class="study-stage"><div class="study-framed">'+cardArt(face,{[face.id]:b})+'</div></figure></article></div></section>';
}).join('');
