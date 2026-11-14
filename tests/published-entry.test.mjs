import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {Window} from 'happy-dom';

test('published HTML executes the generated entry, not a name merely embedded in preload JSON',async()=>{
 const root=new URL('../docs/',import.meta.url);
 const manifest=JSON.parse(await readFile(new URL('runtime-manifest.json',root)));
 const window=new Window({settings:{enableJavaScriptEvaluation:false,disableCSSFileLoading:true}});
 try{
  window.document.write(await readFile(new URL('index.html',root),'utf8'));
  const scripts=[...window.document.querySelectorAll('script[type="module"]')];
  assert.equal(scripts.length,1);
  assert.equal(scripts[0].getAttribute('src'),manifest.entry);
  assert.ok(!scripts[0].hasAttribute('onerror'));
  assert.ok(!scripts.some(script=>/boot\.js/.test(script.src)));
  for(const {file,bytes} of manifest.initialModules){assert.equal((await stat(new URL(file,root))).size,bytes);assert.ok(window.document.querySelector('link[rel="modulepreload"][href="'+file+'"]'));}
  assert.ok(manifest.initialModules.reduce((n,m)=>n+m.bytes,0)<1000000,'ornamental identity lettering must not block opening');
 }finally{await window.happyDOM.abort();window.close();}
});
