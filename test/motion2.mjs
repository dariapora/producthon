import {pathToFileURL} from 'url';
import path from 'path';
const APP=pathToFileURL(path.resolve(import.meta.dirname,'../app/index.html')).href;
import { chromium } from 'playwright';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1400,height:1000}});
await p.addInitScript(()=>{try{localStorage.setItem('puntea.role','ngo')}catch(e){}});
await p.goto(APP,{waitUntil:'load'});
await p.waitForTimeout(2200);
await p.evaluate(()=>{
  window.__t=[];
  document.getElementById('matches').addEventListener('transitionstart',e=>{
    if(e.target.classList.contains('match'))window.__t.push(['start',e.propertyName,getComputedStyle(e.target).transform]);
  },true);
  document.getElementById('matches').addEventListener('transitionend',e=>{
    if(e.target.classList.contains('match'))window.__t.push(['end',e.propertyName]);
  },true);
});
await p.evaluate(()=>{const s=document.getElementById('mW');s.value=0;s.dispatchEvent(new Event('input',{bubbles:true}))});
await p.waitForTimeout(900);
const t=await p.evaluate(()=>window.__t);
console.log('transition events on cards:',t.length);
t.slice(0,4).forEach(x=>console.log('  ',x.join(' | ')));
console.log('starts:',t.filter(x=>x[0]==='start').length,'ends:',t.filter(x=>x[0]==='end').length);
console.log('all transform-only:',t.every(x=>x[1]==='transform'));
await b.close();
