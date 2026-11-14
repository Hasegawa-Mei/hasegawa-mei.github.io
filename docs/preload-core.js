export async function runQueue(items,job,concurrency=4,{stopOnError=false}={}){
 let next=0;const failures=[];
 await Promise.all(Array.from({length:Math.min(concurrency,items.length)},async()=>{
  while(next<items.length&&(!stopOnError||!failures.length)){const item=items[next++];try{await job(item);}catch(error){failures.push({item,error});}}
 }));return failures;
}
export async function downloadAsset(item,{fetcher=fetch,onProgress=()=>{},timeout=20000,signal,priority='auto'}={}){
 const controller=new AbortController();let timer;
 const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
 const reset=()=>{clearTimeout(timer);timer=setTimeout(()=>controller.abort(),timeout);};reset();
 try{
  const response=await fetcher(item.url,{signal:controller.signal,priority});if(!response.ok)throw Error('HTTP '+response.status+' '+item.url);
  const retain=/\.(mp3|mp4|wav|glb)$/.test(item.url),chunks=[];let loaded=0;
  if(!response.body){const buffer=await response.arrayBuffer();onProgress(item.size);return retain?buffer:null;}
  const reader=response.body.getReader();
  for(;;){const {done,value}=await reader.read();if(done)break;reset();loaded+=value.byteLength;if(retain)chunks.push(value);onProgress(Math.min(loaded,item.size));}
  onProgress(item.size);
  if(!retain)return null;
  const result=new Uint8Array(loaded);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.byteLength;}return result.buffer;
 }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export async function downloadWithRetry(item,{attempts=3,delay=ms=>new Promise(resolve=>setTimeout(resolve,ms)),...options}={}){
 for(let attempt=0;attempt<attempts;attempt++){
  try{return await downloadAsset(item,{timeout:60000,...options});}
  catch(error){
   const transient=error.name==='AbortError'||error.name==='TimeoutError'||error instanceof TypeError||/^HTTP (408|429|5\d\d)\b/.test(error.message);
   if(!transient||attempt===attempts-1)throw error;
   await delay(800*(attempt+1));
  }
 }
}
export function progressRatio(items,loaded,prepared,totalTasks,started=false){
 const total=items.reduce((n,item)=>n+item.size,0)||1;
 const received=items.reduce((n,item)=>n+Math.min(item.size,loaded.get(item.url)||0),0);
 return Math.min(1,received/total*.84+(totalTasks?prepared/totalTasks:0)*.15+(started?.01:0));
}
