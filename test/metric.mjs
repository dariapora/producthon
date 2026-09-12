import {pathToFileURL} from 'url';
import path from 'path';
const APP=pathToFileURL(path.resolve(import.meta.dirname,'../app/index.html')).href;
import { chromium } from 'playwright';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1400,height:1000}});
await p.addInitScript(()=>{try{localStorage.setItem('puntea.role','ngo')}catch(e){}});
await p.goto(APP,{waitUntil:'load'});
await p.waitForTimeout(2200);
const snap=async()=>p.evaluate(()=>({
  viewBox:document.getElementById('map').getAttribute('viewBox'),
  zoom:document.getElementById('zLvl').textContent,
  base:[document.getElementById('base').getAttribute('cx'),document.getElementById('base').getAttribute('cy')],
  ringR:document.getElementById('ring').style.r,
  picks:[...document.querySelectorAll('.match .school')].map(e=>e.textContent.slice(0,20)),
  pickDots:document.querySelectorAll('#dots .dot.pick').length,
  pickNums:document.querySelectorAll('#picks text').length,
  // does the DOT ENCODING follow the metric?
  dot0:{r:document.querySelector('#dots .dot').getAttribute('r'),fill:document.querySelector('#dots .dot').style.fill},
  legend:document.getElementById('mapLg')?.textContent.trim(),
  msg:document.getElementById('mMsg').textContent
}));
const a=await snap();
await p.selectOption('#mMetric','rate'); await p.waitForTimeout(700);
const c=await snap();
const keys=['viewBox','zoom','ringR','legend'];
console.log('--- unchanged? ---');
for(const k of keys) console.log(' ',k.padEnd(9), JSON.stringify(a[k])===JSON.stringify(c[k])?'SAME':'CHANGED  '+JSON.stringify(a[k])+' -> '+JSON.stringify(c[k]));
console.log(' base     ', JSON.stringify(a.base)===JSON.stringify(c.base)?'SAME':'CHANGED');
console.log(' dot0     ', JSON.stringify(a.dot0)===JSON.stringify(c.dot0)?'SAME (encoding does NOT follow metric)':'CHANGED');
console.log('--- changed ---');
console.log(' picks    ', JSON.stringify(a.picks.slice(0,2)), '->', JSON.stringify(c.picks.slice(0,2)));
console.log(' pickDots ', a.pickDots, '->', c.pickDots, '| pickNums', a.pickNums,'->',c.pickNums);
console.log(' msg      ', a.msg, '->', c.msg);
console.log(' legend   ', JSON.stringify(a.legend));
await b.close();
