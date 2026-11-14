import {settleWithin} from './load-budget.js';
import {faces} from './reading-round.js';
let identityLettering={},letteringTask;
function prepareLettering(){
 return letteringTask??=import('./identity-lettering.js').then(module=>{
  identityLettering=module.identityLettering;
  document.querySelectorAll('[data-identity-title]').forEach(node=>{
   const title=identityLettering[node.dataset.identityTitle];if(title)node.innerHTML=title;
  });
 }).catch(()=>{letteringTask=null;});
}
const root='./assets/identity/';
// Approved B direction: bright white sculptural half portraits.
export const identityPortraits=Object.fromEntries(faces.map(face=>[face.id,'./assets/identity-studies/b-'+face.id+(face.id==='witness'?'-v2':'')+'.webp']));
const asset=id=>identityPortraits[id]||root+id+'.webp';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cache=new Map(),embedded=new Map();
export function prepareCardFace(face){
  if(face)prepareLettering();
  const files=['back','front-stock'];
  if(face&&faces.some(f=>f.id===face.id))files.push(face.id);
  return Promise.all(files.map(file=>{
    if(!cache.has(file)){const img=new Image();img.src=asset(file);cache.set(file,settleWithin(img.decode().then(()=>img),4000))}
    return cache.get(file);
  }));
}
const jewelPositions=[[50,9],[31,15],[69,15],[17,24],[83,24],[10,77],[90,77]];
export function cardArt(face=null,urls={}){
  const url=id=>safe(urls[id]||asset(id));
  const known=face&&faces.some(f=>f.id===face.id);
  if(face)prepareLettering();
  const fallback=face?'<svg viewBox="0 0 600 100" aria-hidden="true"><text x="300" y="76" text-anchor="middle" font-family="serif" font-size="80" fill="currentColor">'+safe(face.name)+'</text></svg>':'';
  const title=face?'<div class="identity-caption" data-identity-title="'+safe(face.id)+'" role="img" aria-label="'+safe(face.name+' / '+face.en)+'">'+(identityLettering[face.id]||fallback)+'</div>':'';
  const lightPoints=(face?jewelPositions:[[50,22],[25,50],[75,50],[50,78],[50,50]]).map(([x,y],i)=>'<i class="identity-jewel" style="left:'+x+'%;top:'+y+'%;--jewel-delay:'+(-i*.71)+'s"></i>').join('');
  return '<div class="identity-print '+(face?'identity-front':'identity-back')+'" data-identity="'+safe(face?.id||'back')+'">'+
    '<img class="identity-stock" src="'+url(face?'front-stock':'back')+'" alt="">'+
    '<i class="identity-edge" aria-hidden="true"></i><i class="identity-inlay" aria-hidden="true"></i>'+lightPoints+
    (known?'<div class="identity-portrait-window"><div class="identity-character" style="--statue:url(&quot;'+url(face.id)+'&quot;)"><img class="identity-statue" src="'+url(face.id)+'" alt="'+safe(face.name)+'的亮白半身雕塑插画"><i class="identity-prism" aria-hidden="true"></i><i class="identity-ornament-light" aria-hidden="true"></i></div></div><img class="identity-foreground" src="'+url('front-stock')+'" alt="" aria-hidden="true">':'')+title+'</div>';
}
export async function exportCard(face){
  await settleWithin(prepareLettering(),10000);
  const files=['front-stock',...(faces.some(f=>f.id===face.id)?[face.id]:[])],urls={};
  for(const file of files){
    if(!embedded.has(file))embedded.set(file,fetch(asset(file)).then(r=>{if(!r.ok)throw Error('无法读取卡牌图片');return r.blob()}).then(blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)})));
    urls[file]=await embedded.get(file);
  }
  const css=await fetch('./identity-cards.css').then(r=>{if(!r.ok)throw Error('无法读取卡牌样式');return r.text()});
  return '<style>'+css+' .export-identity{position:relative;width:min(56vw,300px);height:auto;aspect-ratio:2/3;margin:75px auto 35px;overflow:visible}.export-identity .identity-print{position:absolute;inset:0}.export-identity *{animation:none!important}</style><figure class="export-identity">'+cardArt(face,urls)+'</figure>';
}
