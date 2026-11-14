const NS='http://www.w3.org/2000/svg';
const rect=(x,y,w,h,fill)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>';
const dot=(x,y,r,fill)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'"/>';
const line=(d,ink,weight=1)=>'<path d="'+d+'" fill="none" stroke="'+ink+'" stroke-width="'+weight+'"/>';
const repeat=(n,fn)=>Array.from({length:n},(_,i)=>fn(i)).join('');
const ring=(x,y,r,ink,weight=1)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="'+ink+'" stroke-width="'+weight+'"/>';
const word=(x,y,content,angle=0)=>'<text transform="translate('+x+' '+y+') rotate('+angle+')" font-family="Georgia,serif" font-size="4" font-weight="bold" letter-spacing=".4" fill="#463439">'+content+'</text>';

const defs=`<defs>
 <linearGradient id="paper-gold" gradientUnits="userSpaceOnUse" x1="620" y1="175" x2="740" y2="815"><stop stop-color="#ffe476"/><stop offset=".23" stop-color="#ffec99"/><stop offset=".54" stop-color="#f2e398"/><stop offset=".82" stop-color="#caced0"/><stop offset="1" stop-color="#afc2c5"/></linearGradient>
 <linearGradient id="paper-indigo" gradientUnits="userSpaceOnUse" x1="744" y1="0" x2="825" y2="790"><stop stop-color="#655ddd"/><stop offset=".54" stop-color="#7773d7"/><stop offset=".83" stop-color="#8da6ba"/><stop offset="1" stop-color="#b2e694"/></linearGradient>
 <linearGradient id="overprint" gradientUnits="userSpaceOnUse" x1="692" x2="974"><stop stop-color="#221b46"/><stop offset=".126" stop-color="#382137"/><stop offset=".131" stop-color="#6f4531"/><stop offset=".181" stop-color="#50231f"/><stop offset=".186" stop-color="#b17a26"/><stop offset=".422" stop-color="#e5a530"/><stop offset=".43" stop-color="#46221d"/><stop offset="1" stop-color="#351714"/></linearGradient>
 <linearGradient id="lower-overprint" gradientUnits="userSpaceOnUse" x1="692" y1="680" x2="974" y2="680"><stop stop-color="#784338"/><stop offset=".18" stop-color="#8a4234"/><stop offset=".20" stop-color="#c5892d"/><stop offset=".422" stop-color="#be7841"/><stop offset=".43" stop-color="#43201e"/><stop offset="1" stop-color="#361917"/></linearGradient>
 <pattern id="proof-grid" width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".48" fill="#888481"/></pattern>
 <pattern id="ink-grain" width="174" height="174" patternUnits="userSpaceOnUse"><image href="./assets/reader-print/grain.png" width="174" height="174"/></pattern>
 <clipPath id="curve-window"><rect x="287" y="268" width="345" height="344"/></clipPath>
 <clipPath id="corner-window"><rect x="692" y="449" width="282" height="282"/></clipPath>
</defs>`;

function leftRegister(){
  // A family of quarter circles, cut by two straight paper edges.
  const fan='<g clip-path="url(#curve-window)">'+repeat(14,i=>ring(632,612,347+i*2.4,'#c6c4bc',.72))+'</g>';
  const foot='<g transform="translate(287 612)">'+repeat(16,i=>line('M-'+(5+i*3.05)+' 0a'+(5+i*3.05)+' '+(5+i*3.05)+' 0 0 0 '+(5+i*3.05)+' '+(5+i*3.05),'#b9b3a7',.65))+'</g>'+
    repeat(3,i=>'<rect x="275" y="'+(677+i*12)+'" width="5" height="5" fill="none" stroke="#d0cec9" stroke-width=".5"/>');
  return fan+foot+rect(133,729,45,34,'url(#proof-grid)')+word(140,724,'BETWEEN')+word(199,689,'·');
}
function rails(top,bottom){
  const h=bottom-top;
  return rect(631,top,98,h,'#271dff')+rect(745,top,68,h,'url(#paper-indigo)')+
    '<path d="M631 173 729 271V'+bottom+'H631Z" fill="url(#paper-gold)"/>'+
    rect(631,top,98,h,'url(#ink-grain)')+rect(745,top,68,h,'url(#ink-grain)')+
    repeat(5,i=>{const x=i%2?792:678,y=129+i*58;return line('M'+(x-2)+' '+y+'h4m-2 -2v4','#eee8c8',.48);});
}
function punchedScreen(){
  return repeat(13,row=>repeat(13,col=>{
    const x=525+col*29.15,y=219+row*29.15;
    let r=6.8;
    if((row===1&&col===4)||(row===8&&col===5)||(row===10&&col===9))r=11.3;
    if((row===5&&col===8)||(row===9&&col===12))r=3.6;
    // A hairline only follows the lower edge of each blind-printed dot.
    // This keeps the white matrix visible on pure white stock.
    return dot(x,y,r,'white')+line('M'+(x-r*.78)+' '+(y+r*.62)+' Q'+x+' '+(y+r*1.26)+' '+(x+r*.78)+' '+(y+r*.62),'#dddde0',.46);
  }));
}
function tape(y){
  const tongue=rect(652,y,161,52,'#f1c74e')+rect(652,y,76,52,'#231d77')+rect(729,y,16,52,'#693528');
  const channels=repeat(13,i=>{
    const dy=y+i*4.1;
    return rect(652,dy,76,i%3===0?1.6:.95,'#ffe184')+rect(729,dy,16,1.15,'#f5d78c')+
      rect(745,dy,68,i%3===0?2.0:1.15,'#413373');
  });
  const inserts=repeat(4,i=>{const x=669+i*39;return dot(x,y+18,i%2?11:7.3,i<2?'#131429':'#34232a')+
    '<g clip-path="url(#tape-hole-'+y+'-'+i+')">'+repeat(9,k=>rect(x-12,y+7+k*3.2,24,1.1,i<2?'#b1a176':'#eed160'))+'</g>';});
  const cuts='<defs>'+repeat(4,i=>'<clipPath id="tape-hole-'+y+'-'+i+'">'+dot(669+i*39,y+18,i%2?11:7.3,'white')+'</clipPath>')+'</defs>';
  return cuts+tongue+rect(652,y,161,52,'url(#ink-grain)')+inserts+channels;
}
function fourCorners(){
  const points=[[692,449],[974,449],[692,731],[974,731]];
  const curves=points.map(([x,y],i)=>{
    const ink=i<2?'url(#overprint)':'url(#lower-overprint)';
    return dot(x,y,i===0?39:40,ink)+[61,81,101,121,140].map(r=>ring(x,y,r,ink,1.65)).join('');
  }).join('');
  // The central white round is a knockout: it reveals the colored rails below it.
  const star='M692 590Q824 585 833 449Q838 578 974 590Q842 595 833 731Q825 599 692 590Z M888 590A55 55 0 1 0 778 590A55 55 0 1 0 888 590Z';
  return '<g clip-path="url(#corner-window)">'+curves+'<path fill-rule="evenodd" fill="url(#overprint)" d="'+star+'"/><path fill-rule="evenodd" fill="url(#ink-grain)" d="'+star+'"/>'+
    word(887,548,'BETWEEN',180)+word(831,578,'READING',90)+repeat(4,i=>rect(816+(i%2)*6,596+Math.floor(i/2)*6,4,4,'#774538'))+'</g>';
}
function fineRegister(){
  const cross=(x,y)=>line('M'+(x-3)+' '+y+'h6m-3 -3v6','white',.6);
  return ring(733,368,54,'#45273b',1)+ring(733,368,28,'#e5c766',.85)+ring(761,336,14,'#b9a698',.75)+
    '<path d="M718 369a14.5 14.5 0 0 1 29 0Z" fill="#3d211a"/>'+cross(732,386)+cross(793,361)+
    repeat(6,i=>ring(770,544,14+i*4.05,i%2?'#d3a03c':'#d6ad4c',1))+
    word(789,442,'BETWEEN',180)+word(699,462,'BETWEEN',90)+
    dot(584,556,10.5,'#271c20')+dot(582,565,7,'white')+word(591,528,'BETWEEN',180);
}
// Anchor the axial plates independently of the left register, so neither the
// page edges nor the circular geometry are lost when changing aspect ratio.
function paint(width,height,axis){
  const compact=width<=700;
  const u=Math.min(width/(compact?1050:1400),height/(compact?900:788));
  const cy=height*(compact?.465:365/788),left=axis-732*u,top=cy-365*u;
  const align=(dx,dy,art)=>'<g transform="translate('+n(dx)+' '+n(dy)+') scale('+n(u)+')">'+art+'</g>';
  const minY=-top/u-1,maxY=(height-top)/u+1;
  const field=rect(380,267,673,376,'url(#proof-grid)')+word(426,436,'·')+word(480,451,'BETWEEN')+word(426,562,'·');
  const leftX=width*.095-133*u;
  return defs+align(leftX,top,leftRegister())+
    align(left,top,field+rails(minY,maxY)+fourCorners()+punchedScreen()+tape(288)+tape(399)+fineRegister());
}
function n(x){return Number(x.toFixed(2));}
export function mountReaderPrint(host){
  const sheet=document.createElementNS(NS,'svg');
  const register=document.createElement('i');register.className='print-register';
  host.append(sheet,register);
  let previous='';
  new ResizeObserver(()=>{
    const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
    const axis=register.offsetLeft,key=[width,height,axis].join('/');
    if(key===previous)return;
    previous=key;sheet.setAttribute('viewBox','0 0 '+width+' '+height);
    sheet.innerHTML=paint(width,height,axis);
  }).observe(host);
}

