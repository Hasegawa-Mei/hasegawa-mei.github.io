// Optional media must never hold navigation or an entrance animation forever.
export function settleWithin(promise, milliseconds, fallback=null){
 return new Promise(resolve=>{
  let done=false;
  const finish=value=>{if(done)return;done=true;clearTimeout(timer);resolve(value);};
  const timer=setTimeout(()=>finish(fallback),milliseconds);
  Promise.resolve(promise).then(finish,()=>finish(fallback));
 });
}
