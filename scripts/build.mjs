import {build} from 'esbuild';
import {readFile,writeFile,readdir,unlink} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('docs');
// Generated bundles stay in the document root, preserving import.meta.url assets.
for(const file of await readdir(root))if(/^built-[\w-]+\.(js|css)(\.LEGAL\.txt)?$/.test(file))await unlink(path.join(root,file));
const result=await build({entryPoints:[path.join(root,'site-entry.js')],bundle:true,splitting:true,format:'esm',minify:true,target:'es2022',outdir:root,entryNames:'built-app-[hash]',chunkNames:'built-chunk-[hash]',metafile:true,legalComments:'linked',alias:{three:path.join(root,'vendor/three.module.js')},external:['./vendor/hand/vision_bundle.js']});
let html=await readFile(path.join(root,'index.html'),'utf8');
html=html.replace('<p>部分内容暂时未能载入。</p>','<p id="preload-message">正在准备开场…</p>');
html=html.replace('aria-label="正在准备影像、音乐和场景"','aria-label="正在准备开场"');
html=html.replace('<img class="gate-art" src=','<img class="gate-art" loading="lazy" src=');
const cssSources=['reader-ui','finale','finale-recap','identity-cards','reader-update','print-edition','opening','standby-print','reader-print','chapter-poster','chapter-transit','tutorial','ai-reader','proposals','prologue','duel','duel-arena','music','readability','orientation'];
const css=await build({stdin:{contents:cssSources.map(name=>'@import "./'+name+'.css";').join('\n'),resolveDir:root,loader:'css'},bundle:true,minify:true,outdir:root,entryNames:'built-style-[hash]',plugins:[{name:'preserve-media-urls',setup(b){b.onResolve({filter:/\.(png|webp|svg|jpe?g|ttf|woff2?)(\?.*)?$/},args=>({path:'./'+path.relative(root,path.resolve(args.resolveDir,args.path)).replaceAll('\\','/'),external:true}));}}],metafile:true,legalComments:'linked'});
html=html.replace(/<link rel="stylesheet"[^>]+>/g,'');
const style=Object.keys(css.metafile.outputs).find(f=>f.endsWith('.css'));
html=html.replace('</head>','<link rel="stylesheet" href="'+path.basename(style)+'"></head>');
const entry=Object.entries(result.metafile.outputs).find(([,v])=>v.entryPoint?.endsWith('site-entry.js'))[0];
const reader=Object.entries(result.metafile.outputs).find(([,v])=>v.entryPoint?.endsWith('dialogue.js'))[0];
const initialModules=new Set();
function visit(file){if(initialModules.has(file))return;initialModules.add(file);for(const dependency of result.metafile.outputs[file]?.imports||[])if(dependency.kind==='import-statement'&&!dependency.external)visit(dependency.path);}
visit(entry);visit(reader);
html=html.replace(/<link rel="modulepreload"[^>]*>/g,'');
html=html.replace('</head>',[...initialModules].map(file=>'<link rel="modulepreload" href="'+path.basename(file)+'">').join('')+'</head>');
html=html.replace(/<script type="module" src="orientation\.js"><\/script>/,'');
// Inline onerror handlers can contain an arrow (=>). A [^>]* tag matcher
// stopped at that arrow and silently left the legacy boot script in place.
html=html.replace(/<script type="module" src="(?:boot\.js[^\"]*|built-app-[^\"]+)"[\s\S]*?<\/script>/,'<script type="module" src="'+path.basename(entry)+'"></script>');
const moduleTags=[...html.matchAll(/<script\b[^]*?<\/script>/g)].map(m=>m[0]).filter(tag=>/^<script type="module"/.test(tag));
if(moduleTags.length!==1||!moduleTags[0].includes('src="'+path.basename(entry)+'"'))throw Error('The HTML must load exactly the newly generated app entry');
html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'');
html=html.replace(/<script id="boot-watchdog">[\s\S]*?<\/script>/,'');
const watchdog=`<script id="boot-watchdog">window.__bootWatchdog=setTimeout(()=>{const box=document.getElementById('preload-error');if(!box)return;box.hidden=false;document.getElementById('preload-message').textContent='页面连接较慢，请稍候或重试。';},10000);document.getElementById('preload-retry').onclick=()=>location.reload();</script>`;
html=html.replace('</body>',watchdog+'</body>');
await writeFile(path.join(root,'index.html'),html);
await writeFile(path.join(root,'runtime-manifest.json'),JSON.stringify({entry:path.basename(entry),style:path.basename(style),initialModules:[...initialModules].map(file=>({file:path.basename(file),bytes:result.metafile.outputs[file].bytes})),deferred:Object.entries(result.metafile.outputs).filter(([file])=>!initialModules.has(file)).map(([file])=>path.basename(file))}));
await import('./preload-manifest.mjs');
console.log(JSON.stringify({entry:path.basename(entry),style:path.basename(style),bundles:Object.keys(result.metafile.outputs).length}));
