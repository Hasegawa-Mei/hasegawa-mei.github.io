let preparedDetector;
export function prepareHandDetector(){
 return preparedDetector??=(async()=>{const {FilesetResolver,HandLandmarker}=await import('./vendor/hand/vision_bundle.js');const runtime=await FilesetResolver.forVisionTasks('./vendor/hand/wasm');return HandLandmarker.createFromOptions(runtime,{baseOptions:{modelAssetPath:'./vendor/hand/hand_landmarker.task',delegate:'CPU'},runningMode:'VIDEO',numHands:1});})().catch(error=>{preparedDetector=null;throw error;});
}
// Landmarks are normalized to the palm so near and far hands share thresholds.
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export function gestureInput(send) {
  let palmStart=null, centerX=.5, right=false, pinchY=null, pinchAt=null, consumed=false, lastSeen=0;
  function reset() {palmStart=null;pinchY=null;pinchAt=null;consumed=false;right=false;send('stop');}
  return (landmarks, now, phase) => {
    if (!landmarks) {if(now-lastSeen>180) reset();return;}
    lastSeen=now;
    const p=landmarks, palm=Math.max(.04,dist(p[0],p[9])), x=1-p[9].x;
    const fingers=[8,12,16,20].every(i=>dist(p[i],p[0])>dist(p[i-2],p[0])*1.14);
    const thumb=dist(p[4],p[17])>dist(p[3],p[17])*1.07 && dist(p[4],p[5])>palm*.4;
    if(phase==='guide'){
      if(fingers && thumb){palmStart??=now;if(now-palmStart>360){centerX=x;send('start');palmStart=null;}}
      else palmStart=null;
      return;
    }
    if(phase!=='array') return;
    const gap=dist(p[4],p[8])/palm, tipY=(p[4].y+p[8].y)/2;
    if(gap<.28 || (pinchY!==null && gap<.42)){
      send('stop');right=false;
      pinchAt??=now;
      if(now-pinchAt>=85 && pinchY===null){pinchY=tipY;send('select');}
      if(pinchY!==null && !consumed && pinchY-tipY>Math.max(.068,palm*.48)){consumed=true;send('confirm');}
      return;
    }
    pinchY=null;pinchAt=null;consumed=false;
    if(x>centerX+.14 && !right){right=true;send('rotate');}
    if(x<centerX+.085 && right){right=false;send('stop');}
  };
}
export function cameraSession(onFrame,onStatus,onFailure){
  const video=document.createElement('video');video.muted=true;video.playsInline=true;
  let stream,detector,frame=0,stopped=false,lastVideo=-1,lastCheck=0;
  function stop(){
    stopped=true;cancelAnimationFrame(frame);stream?.getTracks().forEach(t=>t.stop());
    video.pause();video.srcObject=null;detector?.close();detector=null;
  }
  async function run(){
    try{
      if(!navigator.mediaDevices?.getUserMedia) throw Error('unsupported');
      onStatus('请允许使用摄像头');
      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
      if(stopped){stop();return;}
      video.srcObject=stream;await video.play();
      onStatus('正在准备手势识别');
      detector=await prepareHandDetector();preparedDetector=null;
      if(stopped){stop();return;}
      onStatus('请在画面中央张开五指，稍作停留');
      function read(now){
        if(stopped)return;
        try {
          if(video.readyState>=2 && video.currentTime!==lastVideo && now-lastCheck>65){
            lastVideo=video.currentTime;lastCheck=now;
            onFrame(detector.detectForVideo(video,now).landmarks[0],now);
          }
          frame=requestAnimationFrame(read);
        } catch {stop();onFailure('识别已中断，可重试或使用触控');}
      }
      frame=requestAnimationFrame(read);
      stream.getVideoTracks()[0].onended=()=>{if(!stopped){stop();onFailure('摄像头已断开');}};
    }catch(e){if(!stopped){stop();onFailure(e.name==='NotAllowedError'?'摄像头未获授权':e.name==='NotFoundError'?'未找到摄像头':'摄像头或识别模型暂不可用');}}
  }
  run();
  return stop;
}
