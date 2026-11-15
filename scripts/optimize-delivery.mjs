// Repeatable, one-generation compression from the pre-optimization Git revision.
// Originals stay in Git; this never feeds an already-compressed output back in.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
const source='3b261644f409e5f24d37e459a74e5c1329a2bbb8';
const {assets}=JSON.parse(await readFile('docs/preload-manifest.json','utf8'));
const results=[];
for(const asset of assets.filter(a=>/\.webp$/.test(a.url))){
 const file='docs/'+asset.url.replace(/^\.\//,'');
 const original=execFileSync('git',['show',source+':'+file],{maxBuffer:16*1024*1024});
 if(original.length<90000)continue;
 const card=file.includes('/identity/');
 const output=await sharp(original).resize({width:card?1536:1600,height:card?1536:1600,fit:'inside',withoutEnlargement:true}).webp({quality:card?86:80,alphaQuality:90,effort:5}).toBuffer();
 if(output.length<original.length){await writeFile(file,output);results.push({file,before:original.length,after:output.length});}
}
await writeFile('delivery-optimization.json',JSON.stringify({source,images:results},null,2)+'\n');
console.log(JSON.stringify({images:results.length,before:results.reduce((s,x)=>s+x.before,0),after:results.reduce((s,x)=>s+x.after,0)}));
