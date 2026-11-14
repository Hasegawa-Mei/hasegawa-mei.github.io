// Keep the mobile experience in landscape, with a manual turn fallback.
const portrait = matchMedia('(orientation: portrait)');
const touch = matchMedia('(any-pointer: coarse)');
const gate = document.createElement('dialog');
gate.id = 'orientation-gate';
gate.setAttribute('aria-labelledby', 'orientation-title');
gate.innerHTML = `<span class="orientation-device" aria-hidden="true"></span><h2 id="orientation-title">请横屏体验</h2><p id="orientation-message" role="status">将手机横过来，继续进入这场旅程。</p><button type="button">全屏横屏</button>`;
document.body.append(gate);
const button = gate.querySelector('button');
const message = gate.querySelector('p');
let ready = !document.documentElement.classList.contains('site-booting');
const mobile = () => touch.matches || navigator.maxTouchPoints > 0;
function sync() {
  if (ready && mobile() && portrait.matches) {
    if (!gate.open) gate.showModal();
  } else if (gate.open) gate.close();
}
gate.addEventListener('cancel', event => event.preventDefault());
button.addEventListener('click', async () => {
  button.disabled = true;
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
    if (!screen.orientation?.lock) throw new Error('Manual rotation needed');
    await screen.orientation.lock('landscape');
  } catch {
    message.textContent = '请关闭手机的竖屏锁定，再将手机横过来。';
    button.textContent = '再次尝试';
  } finally {
    button.disabled = false;
    sync();
  }
});
window.addEventListener('site-ready', () => { ready = true; sync(); });
portrait.addEventListener('change', sync);
touch.addEventListener('change', sync);
window.addEventListener('pageshow', sync);
document.addEventListener('fullscreenchange', sync);
sync();
