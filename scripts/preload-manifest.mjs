import {readdir,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('docs'),files=new Set();
async function tree(dir,filter=()=>true){for(const entry of await readdir(path.join(root,dir),{withFileTypes:true})){const name=path.posix.join(dir,entry.name);if(entry.isDirectory())await tree(name,filter);else if(filter(name))files.add(name);}}
for(const entry of await readdir(root))if(/\.(js|css|svg)$/.test(entry))files.add(entry);
await tree('vendor');
await tree('fonts',name=>/\.(ttf|woff2?|css)$/.test(name));
for(const name of ['opening','standby','epilogue','game','models','music','chapter-plates','reader-print','tutorial','recap','references'])await tree('assets/'+name);
for(const name of ['back','front-stock'])files.add('assets/identity/'+name+'.png');
for(const name of ['threshold','assembly','repair','inquiry','discern','witness-v2'])files.add('assets/identity-studies/b-'+name+'.png');
files.add('assets/prologue/prologue-montage-wide.mp4');files.add('assets/prologue/00-lighthouse-wide.jpg');
const assets=await Promise.all([...files].sort().map(async url=>({url:'./'+url,size:(await stat(path.join(root,url))).size})));
await writeFile(path.join(root,'preload-manifest.json'),JSON.stringify({assets}));
console.log(JSON.stringify({files:assets.length,megabytes:Math.round(assets.reduce((n,x)=>n+x.size,0)/1048576*10)/10}));
