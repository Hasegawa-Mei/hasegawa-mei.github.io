import {settleWithin} from './load-budget.js';
// The flash covers the route swap. Only the two foreground plates lock inward.
export async function assembleStartGate(swap) {
  const shell = document.getElementById('reader-shell');
  const sheet = document.getElementById('start-sheet');
  const fields = sheet.querySelector('.gate-fields');
  const plates = [...sheet.querySelectorAll('.gate-plates img')];
  plates.forEach(plate=>{plate.loading='eager';});
  const ready = settleWithin(Promise.all(plates.map(plate => plate.decode())).then(() => true),900,false);
  const flash = document.createElement('div');
  flash.className = 'gate-flash';
  flash.ariaHidden = 'true';
  const lamp = flash.appendChild(document.createElement('i'));
  const source = document.querySelector('.light-source').getBoundingClientRect();
  const x = source.left + source.width / 2;
  const y = source.top + source.height / 2;
  lamp.style.left = x + 'px';
  lamp.style.top = y + 'px';
  const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const animations = [];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const skip = () => document.hidden || motion.matches;
  function animate(element, frames, options) {
    const animation = element.animate(frames, {fill:'both', ...options});
    animations.push(animation);
    if (skip()) animation.finish();
    return animation;
  }
  function fastForward() {
    if (skip()) animations.forEach(animation => animation.finish());
  }
  const wasInert = shell.inert;
  shell.inert = true;
  document.body.append(flash);
  document.addEventListener('visibilitychange', fastForward);
  motion.addEventListener('change', fastForward);
  try {
    const fullWhite = 'scale(' + Math.ceil(reach / 17) + ')';
    await settleWithin(animate(lamp, [
      {transform:'scale(.24)', easing:'cubic-bezier(.42,.01,.88,.54)'},
      {transform:fullWhite, offset:.82},
      {transform:fullWhite}
    ], {duration:215}).finished,600);
    await swap();
    if (skip()) return;

    sheet.classList.add('gate-assembling', 'gate-loading-plates');
    const lockAt = 864;
    const end = lockAt + 112;
    const lift = Math.max(sheet.clientHeight, innerHeight) + 28;
    const liftEase = 'cubic-bezier(.24,.54,.16,1)';

    function riseToRest(element, start, dock) {
      animate(element, [
        {transform:'translateY(' + lift + 'px)'},
        {transform:'none'}
      ], {delay:start, duration:dock - start, easing:liftEase});
    }
    function riseAndLock(element, start, dock, scale) {
      const duration = end - start;
      const pose = 'scale(' + scale + ')';
      animate(element, [
        {transform:'translateY(' + lift + 'px) ' + pose, easing:liftEase},
        {transform:pose, offset:(dock - start) / duration},
        {transform:pose, offset:(lockAt - start) / duration, easing:'cubic-bezier(.54,.02,.16,1)'},
        {transform:'scale(1)'}
      ], {delay:start, duration});
    }
    // Four mirrored pairs rise from the two edges to the spine.
    [...fields.children].forEach((field, index) => {
      const start = Math.min(index, 7 - index) * 66;
      animate(field, [
        {transform:'translateY(106%)'},
        {transform:'translateY(0)'}
      ], {delay:start, duration:400, easing:'cubic-bezier(.29,.48,.16,1)'});
    });
    // The shutters can already travel while a first-time visitor decodes ink.
    flash.remove();
    const decoded = await ready;
    if (skip()) return;
    sheet.classList.remove('gate-loading-plates');
    sheet.classList.toggle('gate-flat-arrival', !decoded);
    if (decoded) {
      riseToRest(plates[0], 94, 585);
      riseAndLock(plates[1], 218, 686, 1.12);
      riseAndLock(plates[2], 355, 753, 1.22);
    } else {
      riseToRest(sheet.querySelector('.gate-art'), 140, 686);
    }
    animate(document.getElementById('start-caption'), [{opacity:0},{opacity:1}], {
      delay:lockAt + 20, duration:92, easing:'ease-out'
    });
    await settleWithin(Promise.all(animations.map(animation => animation.finished)),1600);
  } finally {
    document.removeEventListener('visibilitychange', fastForward);
    motion.removeEventListener('change', fastForward);
    sheet.classList.remove('gate-assembling', 'gate-loading-plates', 'gate-flat-arrival');
    animations.forEach(animation => animation.cancel());
    flash.remove();
    shell.inert = wasInert;
    if (!sheet.hidden && !wasInert) document.getElementById('start-core').focus({preventScroll:true});
  }
}
