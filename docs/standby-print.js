const path = './assets/standby/';
const tau = Math.PI * 2;
const series = (n, draw) => Array.from({length:n}, (_, i) => draw(i)).join('');
const svg = (cls, box, body, fit='xMidYMid meet') =>
  '<svg class="'+cls+'" viewBox="'+box+'" preserveAspectRatio="'+fit+'" aria-hidden="true" focusable="false">'+body+'</svg>';
function texture(id, file, size) {
  return '<pattern id="'+id+'" patternUnits="userSpaceOnUse" width="'+size+'" height="'+size+'"><image href="'+path+file+'.webp" width="'+size+'" height="'+size+'"/></pattern>';
}
function corner(isUpper) {
  const id=isUpper?'upper':'lower';
  const ink=id+'-ring';
  const stocks='<defs>'+texture(ink,isUpper?'graphite':'silver',930)+'</defs>';
  const radius=isUpper?439:458, width=isUpper?169:176;
  const band='<circle r="'+radius+'" fill="none" stroke="url(#'+ink+')" stroke-width="'+width+'"/><circle r="'+(radius+width*.5+25)+'" fill="none" stroke="#5e5e65" stroke-width="1.8" stroke-dasharray="7 5"/>';
  return svg('press-corner '+id+'-wheel','-565 -565 1130 1130',stocks+band);
}
function broadOrbit() {
  const inks='<defs>'+texture('orbit-carbon','graphite',220)+texture('orbit-silver','silver',230)+'</defs>';
  const discs=series(12,i=>{
    const angle=(i*30+5)*Math.PI/180;
    const x=(281*Math.cos(angle)).toFixed(2),y=(281*Math.sin(angle)).toFixed(2);
    const pale=i>=5 && i<=7;
    const incision=(i===5||i===11)?'<path d="M-17 -30q10 8 6 12t9 5l5 -2 4 11 -4 3 11 10 9 4" fill="none" stroke="#eee" stroke-width=".55"/>':'';
    return '<g transform="translate('+x+' '+y+')"><circle r="36" fill="url(#orbit-'+(pale?'silver':'carbon')+')"/><circle r="36" fill="'+(pale?'white':'#101013')+'" opacity="'+(pale?'.23':'.54')+'"/>'+incision+'</g>';
  });
  return svg('broad-orbit','-310 -310 620 620',inks+discs);
}
function dottedRim(cls,count,radius,bead) {
  const dots=series(count,i=>{
    const angle=tau*i/count;
    const ink=i%13===5?'#9290e1':'#2017cb';
    return '<circle cx="'+(Math.cos(angle)*radius).toFixed(2)+'" cy="'+(Math.sin(angle)*radius).toFixed(2)+'" r="'+bead+'" fill="'+ink+'"/>';
  });
  return svg(cls,'-300 -300 600 600',dots);
}
function star() {
  const contour='M-498 0 C-220 -18 -133 -26 -88 -61 S-30 -201 0 -426 C21 -195 37 -112 77 -72 S224 -17 498 0 C202 20 122 34 77 73 S25 234 0 426 C-22 215 -45 110 -87 72 S-245 19 -498 0Z';
  const rays=series(84,i=>{const a=i*tau/84;return '<path d="M0 0l'+(520*Math.cos(a)).toFixed(2)+' '+(520*Math.sin(a)).toFixed(2)+'"/>';});
  return svg('star-spin','-500 -500 1000 1000','<defs>'+texture('star-ink','cobalt',490)+'<clipPath id="star-cut"><path d="'+contour+'"/></clipPath></defs><g transform="rotate(-24)"><path d="'+contour+'" fill="url(#star-ink)"/><g clip-path="url(#star-cut)" fill="none" stroke="white" stroke-width=".37" opacity=".64">'+rays+'</g></g>');
}
function travellingLines() {
  const ellipses=series(27,i=>{
    const x=-235+i*81,rx=46+168*(.5+.5*Math.cos(x*tau/1530));
    return '<ellipse cx="'+x+'" cy="452" rx="'+rx.toFixed(2)+'" ry="449"/>';
  });
  return svg('travelling-lines','0 0 1600 900','<g fill="none" stroke="#485aaa" stroke-width=".65" opacity=".82">'+ellipses+'</g>','none');
}
function registration() {
  const ticks=series(17,i=>'<path d="M'+(27+i*96)+' 59h8v8h-8z M'+(27+i*96)+' 822h8v8h-8z"/>');
  return svg('press-register','0 0 1600 900','<g fill="#29292b">'+ticks+'</g><path d="M0 265h1600 M0 635h1600 M369 0v900 M1230 0v900" stroke="#5158a6" stroke-width=".65" fill="none"/><path d="M0 205 1600 627 M0 670 1600 216 M120 0 1300 900 M200 900 1570 0" fill="none" stroke="#fff" stroke-width=".85" opacity=".78"/>','none');
}
const middleBand=svg('ink-belt','0 0 1600 100','<defs>'+texture('belt-ink','graphite',395)+'<pattern id="belt-screen" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.65" fill="#eeeded" opacity=".68"/></pattern></defs><path fill="url(#belt-ink)" opacity=".81" d="M0 0h1600v100H0Z"/><path fill="url(#belt-screen)" d="M102 100 341 0h240l-188 100ZM930 0h183l-155 100H790Z"/><path d="M288 52h25V26h23V0h33v100h-81ZM1229 0h35v25h31v26h30v24h29v25h-125Z" fill="#1a14c4"/>','none');
export function dialArtwork(prefix='') {
  const art=broadOrbit()+star()+svg('dial-outline','-300 -300 600 600','<g fill="none" stroke="#2621ac"><circle r="297" stroke-width="2.1" stroke-dasharray="1 4"/><circle r="274" stroke-width="1.5"/></g>')+
    dottedRim('outer-beads',38,239,10)+'<img alt="" class="flock-spin" src="'+path+'birds.webp"><img alt="" class="flock-ink" src="'+path+'birds.webp">'+dottedRim('inner-beads',29,88,2.5);
  // The temporary entrance and the permanent standby can coexist for one beat.
  return prefix?art.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^)]+)\)/g,(_,id)=>'url(#'+prefix+id+')'):art;
}
export function mountStandby(host) {
  if(host.firstElementChild)return;
  host.innerHTML='<span class="press-sheet" aria-hidden="true">'+corner(true)+corner(false)+
    '<span class="press-dial">'+dialArtwork()+'</span>'+
    travellingLines()+registration()+middleBand+'<img alt="" class="idle-title" src="'+path+'yours-to-open.svg"><span class="idle-subtitle">终章 · 待您开启</span></span>';
}
