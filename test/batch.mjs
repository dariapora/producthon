import {pathToFileURL} from 'url';
import path from 'path';
const APP=pathToFileURL(path.resolve(import.meta.dirname,'../app/index.html')).href;
import { chromium } from 'playwright';
const URL=APP;
const b=await chromium.launch();
const errs=[];
// desktop light, desktop dark, phone — one batched round
for(const [name,w,h,scheme] of [['d_light',1400,1000,'light'],['d_dark',1400,1000,'dark'],['phone',400,900,'light']]){
  const p=await b.newPage({viewport:{width:w,height:h},colorScheme:scheme,deviceScaleFactor:2});
await p.addInitScript(()=>{try{localStorage.setItem('puntea.role','ngo')}catch(e){}});
  p.on('pageerror',e=>errs.push(name+': '+e.message));
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(2200);
  await p.evaluate(()=>document.getElementById('map').scrollIntoView({block:'center'}));
  await p.waitForTimeout(600);
  await p.screenshot({path:`b_${name}_map.png`});
  const over=await p.evaluate(()=>document.body.scrollWidth-document.documentElement.clientWidth);
  console.log(name,'h-overflow:',over);
  await p.close();
}
console.log('errors:',errs.length?errs:'none');
await b.close();
