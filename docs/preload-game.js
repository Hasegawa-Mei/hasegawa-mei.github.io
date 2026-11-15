// No images, fonts, libraries or network requests. Simulation uses seconds.
export function newRun(){return {y:0,velocity:0,x:420,score:0,over:false};}
export function jump(run){if(run.over)return false;if(run.y===0&&run.velocity===0){run.velocity=370;return true;}return false;}
export function stepRun(run,seconds){
 if(run.over)return run;
 const dt=Math.min(.04,Math.max(0,seconds));
 run.y=Math.max(0,run.y+run.velocity*dt);run.velocity=run.y>0?run.velocity-1100*dt:0;
 run.x-=(185+Math.min(80,run.score*7))*dt;
 if(run.x<80&&run.x+16>58&&run.y<27)run.over=true;
 if(run.x<-20){run.x=420;run.score++;}
 return run;
}
export function mountLoadingGame(doc=document,win=window){
 const button=doc.getElementById('preload-game'),canvas=doc.getElementById('preload-canvas'),label=doc.getElementById('preload-game-hint');
 const ctx=canvas?.getContext?.('2d');if(!button||!ctx)return ()=>{};
 let run=newRun(),started=false,disposed=false,frame=0,last=0;
 canvas.width=840;canvas.height=220;
 function draw(){
  ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,420,110);
  ctx.strokeStyle='#2849ef30';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(10,89);ctx.lineTo(410,89);ctx.stroke();
  ctx.fillStyle='#2849ef';const y=88-run.y;
  ctx.fillRect(58,y-24,22,24);ctx.fillRect(73,y-30,14,12);ctx.fillRect(52,y-16,8,5);
  ctx.fillStyle='#fff';ctx.fillRect(81,y-27,3,3);
  ctx.fillStyle='#2849ef';ctx.fillRect(run.x,61,16,27);ctx.fillRect(run.x-3,58,22,4);
  ctx.font='12px system-ui';ctx.textAlign='right';ctx.fillText(String(run.score).padStart(2,'0'),404,18);
 }
 function tick(t){
  frame=0;if(disposed||!started||doc.hidden)return;
  if(!last)last=t;
  if(t-last>=32){stepRun(run,(t-last)/1000);last=t;draw();}
  if(run.over){label.textContent=`跨过 ${run.score} 道障碍 · 点击重新开始`;started=false;return;}
  frame=win.requestAnimationFrame(tick);
 }
 function play(){
  if(disposed)return;
  if(run.over)run=newRun();
  jump(run);label.textContent='点击 / 轻触 / 空格跳跃 · 加载完成后自动进入';
  if(!started){started=true;last=0;frame=win.requestAnimationFrame(tick);}
 }
 function visibility(){win.cancelAnimationFrame(frame);frame=0;last=0;if(!doc.hidden&&started)frame=win.requestAnimationFrame(tick);}
 button.addEventListener('click',play);doc.addEventListener('visibilitychange',visibility);draw();
 return ()=>{disposed=true;win.cancelAnimationFrame(frame);button.removeEventListener('click',play);doc.removeEventListener('visibilitychange',visibility);};
}
