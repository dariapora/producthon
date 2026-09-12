import {pathToFileURL} from 'url';
import path from 'path';
const APP=pathToFileURL(path.resolve(import.meta.dirname,'../app/index.html')).href;
import { chromium } from 'playwright';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1400,height:900}});
await p.addInitScript(()=>{try{localStorage.setItem('puntea.role','ngo')}catch(e){}});
await p.goto(APP,{waitUntil:'load'});
await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{
  const th=[...document.querySelectorAll('thead th')];
  const t=document.getElementById('rows').closest('table');   // the rankings table, not 'the first table'
    const box=t.closest('div');
  return {box:Math.round(box.clientWidth),table:Math.round(t.scrollWidth),
    cols:th.map(h=>h.textContent.trim().slice(0,18)+'='+Math.round(h.getBoundingClientRect().width)).join('  ')};
}));
await b.close();
