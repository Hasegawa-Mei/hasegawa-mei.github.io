const resetKey='between.reader-reset.1';
const roundKey='between.reading-round.1';

export function resetGeneration() {
  try {return localStorage.getItem(resetKey) || '';}
  catch {return '';}
}

function reloadCover() {
  history.replaceState(null,'','#cover');
  location.reload();
}

export function resetReading() {
  const notebooks=Object.keys(localStorage).filter(key=>
    key==='between-dialogue-notes-v1' || key.startsWith('between.notes.')
  );
  notebooks.forEach(key=>localStorage.removeItem(key));
  sessionStorage.removeItem(roundKey);
  sessionStorage.removeItem('between.duel.1');
  localStorage.setItem(resetKey,crypto.randomUUID());
  reloadCover();
}

export function addResetMenu(container) {
  const details=document.createElement('details');
  details.className='reading-tools';
  details.innerHTML='<summary aria-label="更多手记操作" title="更多手记操作">⋯</summary><button type="button">清空阅读记录…</button>';
  details.querySelector('button').onclick=()=>{
    details.open=false;
    const confirm=document.createElement('dialog');
    confirm.className='reset-reading-dialog';
    confirm.setAttribute('aria-labelledby','reset-reading-title');
    confirm.innerHTML='<h2 id="reset-reading-title">从头开始阅读？</h2><p>这会清空本浏览器中本书的所有答案、理由、场景操作、终章结果与双人对局，回到封面。清空后无法恢复。</p><p role="status"></p><form method="dialog"><button value="cancel" autofocus>保留记录</button><button class="primary" type="button" data-erase-reading>清空并回到封面</button></form>';
    confirm.querySelector('[data-erase-reading]').onclick=()=>{
      try {resetReading();}
      catch {confirm.querySelector('[role=status]').textContent='浏览器未能完成清空，请检查本站存储权限后重试。';}
    };
    confirm.addEventListener('close',()=>{confirm.remove();details.querySelector('summary').focus();},{once:true});
    document.body.append(confirm);
    confirm.showModal();
  };
  container.append(details);
}

window.addEventListener('storage',event=>{
  if(event.key===resetKey && event.newValue) {
    sessionStorage.removeItem(roundKey);
  sessionStorage.removeItem('between.duel.1');
    reloadCover();
  }
});

