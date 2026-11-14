const $=id=>document.getElementById(id);
const ns='http://www.w3.org/2000/svg';
let maskNumber=0;
function element(name,attrs) {
  const node=document.createElementNS(ns,name);
  for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));
  return node;
}
export function traceSort(sort, host=$('chapter-poster')) {
  const rect=sort.getBoundingClientRect();
  const svg=element('svg',{viewBox:'0 0 356 585',width:rect.width,height:rect.height,'aria-hidden':'true'});
  svg.classList.add('sort-withdrawal');
  Object.assign(svg.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
  const ink=getComputedStyle(sort).getPropertyValue('--track-ink').trim();
  const defs=svg.appendChild(element('defs',{}));
  const paths=[
    ['M65 0h75v400l-39 40h73l56 54v91h-75v-26l-48-51H0v-68l65-65V220H0v-75h65z',
     ['M102 -60V390L37 455V474H125L192 541V640','M-60 182H104']],
    ['M158 47l89-30V0h75v70l-88 33v42h122v75H234v221h-76z',
     ['M285 -60V43L196 77V500','M410 182H196']],
    ['M249 271h75v314h-75z',['M286 215V640']],
    ['M65 528h31l44 43v14H65z',['M40 564H81L130 612']]
  ];
  const strokes=[];
  paths.forEach(([shape,lines],i)=>{
    const id='unfold-path-'+maskNumber++;
    const mask=defs.appendChild(element('mask',{id,maskUnits:'userSpaceOnUse',x:0,y:0,width:356,height:585}));
    lines.forEach((d,j)=>{
      const path=mask.appendChild(element('path',{d,fill:'none',stroke:'white','stroke-width':110,'stroke-linejoin':'round'}));
      strokes.push({path,branch:j>0,index:i});
    });
    svg.appendChild(element('path',{d:shape,fill:ink,mask:'url(#'+id+')'}));
  });
  host.append(svg);
  return {svg,strokes};
}
export async function openUnit(showReading) {
  const animate=!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.hidden;
  const source=$('unit-word'),range=document.createRange();
  range.selectNodeContents(source);
  const from=range.getBoundingClientRect();
  const sorts=animate?[...document.querySelectorAll('.poster-sort')].map(sort=>traceSort(sort)):[];
  $('unit-front').hidden=true;
  document.body.classList.remove('unit-landing');
  document.body.classList.add('unit-open','unit-unfold');
  showReading();
  const title=$('title'),animations=[],motion=matchMedia('(prefers-reduced-motion: reduce)');
  let floating;
  function run(el,frames,options){
    const a=el.animate(frames,{...options,fill:'both'});
    animations.push(a);
    return a;
  }
  const skip=()=>{if(document.hidden||motion.matches)animations.forEach(a=>a.finish());};
  document.addEventListener('visibilitychange',skip);
  motion.addEventListener('change',skip);
  try{
    if(animate){
      // The outline is unchanged. Each white mask erases along its own stroke,
      // so side branches retract into their stem before the stem leaves.
      sorts.forEach(({strokes},side)=>strokes.forEach(({path,branch,index})=>{
        const length=path.getTotalLength();
        path.style.strokeDasharray=length+' '+length;
        run(path,[{strokeDashoffset:0},{strokeDashoffset:-length}],{
          duration:branch?180:340,delay:branch?0:40+index*17+side*24,easing:'cubic-bezier(.52,.02,.15,1)'
        });
      }));
      document.querySelectorAll('.poster-lugs').forEach((el,i)=>{
        run(el,[{transform:'scaleY(1)'},{transform:'scaleY(0)'}],{
          duration:240,delay:i*25,easing:'cubic-bezier(.6,0,.2,1)'
        });
      });
      run(document.querySelector('.poster-medallion'),[
        {opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.96)'}
      ],{delay:405,duration:145,easing:'cubic-bezier(.3,0,.4,1)'});
      range.selectNodeContents(title);
      const to=range.getBoundingClientRect(),box=title.getBoundingClientRect(),style=getComputedStyle(title);
      const sx=from.width/to.width,sy=from.height/to.height;
      floating=document.createElement('span');
      floating.className='unit-title-flight';floating.textContent=title.textContent;
      floating.setAttribute('aria-hidden','true');
      Object.assign(floating.style,{
        left:box.left+'px',top:box.top+'px',font:style.font,letterSpacing:style.letterSpacing,
        lineHeight:style.lineHeight,color:style.color
      });
      document.body.append(floating);title.style.visibility='hidden';
      const dx=from.left-box.left-(to.left-box.left)*sx;
      const dy=from.top-box.top-(to.top-box.top)*sy;
      run(floating,[
        {transform:'translate('+dx+'px,'+dy+'px) scale('+sx+','+sy+')',color:'#123ff2'},
        {transform:'none',color:style.color}
      ],{duration:500,easing:'cubic-bezier(.22,.68,.23,1)'});
      const rows=[
        document.querySelector('.chapter-head .eyebrow'),$('english'),$('design-name'),
        ...$('step-content').children,...$('step-content').querySelectorAll('.responses>button'),
        $('source'),$('layer-nav')
      ].filter(el=>el&&!el.classList.contains('responses'));
      const responses=$('step-content').querySelector('.responses');
      if(responses)run(responses,[{opacity:0},{opacity:1}],{delay:618,duration:180});
      rows.forEach((el,i)=>run(el,[
        {opacity:0,transform:'translateX(34px)',filter:'blur(2px)'},
        {opacity:1,transform:'none',filter:'blur(0px)'}
      ],{delay:490+i*32,duration:250,easing:'cubic-bezier(.16,.78,.24,1)'}));
      await Promise.all(animations.map(a=>a.finished.catch(()=>{})));
    }
  }finally{
    title.style.removeProperty('visibility');floating?.remove();
    animations.forEach(a=>a.cancel());sorts.forEach(({svg})=>svg.remove());
    document.body.classList.remove('unit-unfold');
    document.removeEventListener('visibilitychange',skip);motion.removeEventListener('change',skip);
    title.tabIndex=-1;title.focus({preventScroll:true});
  }
}

