import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('docs');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json','.mp4':'video/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.ttf':'font/ttf','.glb':'model/gltf-binary'};
http.createServer(async(req,res)=>{
 let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const slow=url.startsWith('/__slow/');if(slow)url=url.slice(7);
 if(slow&&url.startsWith('/assets/')){const t=setTimeout(()=>{res.writeHead(503);res.end();},30000);req.on('close',()=>clearTimeout(t));return;}
 const file=path.resolve(root,'.'+(url.endsWith('/')?url+'index.html':url));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 try{const data=await readFile(file);res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
  const range=req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  if(range){const start=+range[1],end=range[2]?Math.min(+range[2],data.length-1):data.length-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${data.length}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});res.end(data.subarray(start,end+1));}
  else{res.setHeader('Content-Length',data.length);res.end(data);}
 }catch{console.log('404',url);res.writeHead(404);res.end();}
}).listen(8787,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:8787/ (slow media fixture: /__slow/)'));
