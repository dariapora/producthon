// County labels sit on top of a coloured choropleth. Their legibility comes from the halo
// (paint-order:stroke + a surface-coloured stroke), NOT from label-vs-fill contrast: ink on the
// dark semaphore yellow is only 2.44:1. If a tidy-up removes the halo, dark labels fail silently
// — nothing throws, they just stop being readable. This suite makes that failure loud.
import {pathToFileURL} from 'url'; import path from 'path';
const APP=pathToFileURL(path.resolve(import.meta.dirname,'../app/index.html')).href;
import { chromium } from 'playwright';
const b=await chromium.launch();
let bad=0; const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m); if(!c)bad++;};
for(const scheme of ['light','dark']){
  const p=await b.newPage({viewport:{width:1400,height:1000},colorScheme:scheme});
  await p.addInitScript(()=>{try{localStorage.setItem('puntea.role','ngo')}catch(e){}});
  await p.goto(APP,{waitUntil:'load'}); await p.waitForTimeout(2200);
  const st=await p.evaluate(()=>{
    const el=document.querySelector('.seatlbl'); if(!el) return null;
    const c=getComputedStyle(el);
    return {order:c.paintOrder, width:parseFloat(c.strokeWidth)||0, stroke:c.stroke, fill:c.fill, op:parseFloat(c.opacity)};
  });
  ok(!!st, `${scheme}: county labels exist`);
  if(st){
    ok(/stroke/.test(st.order), `${scheme}: paint-order puts the halo behind the glyph (${st.order})`);
    ok(st.width>=2, `${scheme}: halo is at least 2px (${st.width})`);
    ok(st.stroke!=='none', `${scheme}: halo has a colour`);
    ok(st.op>=0.95, `${scheme}: label is not dimmed (opacity ${st.op})`);
  }
  await p.close();
}
await b.close();
console.log(bad?`${bad} assertion(s) failed`:'label halo contract holds');
if(bad)process.exitCode=1;
