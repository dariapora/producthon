// The one path a first-time viewer takes is the one path the other suites seed around:
// they all set puntea.role='ngo' before navigating. This asserts the cold-load contract.
import {pathToFileURL} from 'url'; import path from 'path';
const APP=pathToFileURL(path.resolve(import.meta.dirname,'../app/index.html')).href;
import { chromium } from 'playwright';
const b=await chromium.launch();
let bad=0;
const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m); if(!c)bad++;};

// 1. cold load, no stored role
let p=await b.newPage({viewport:{width:1400,height:1000}});
await p.goto(APP,{waitUntil:'load'}); await p.waitForTimeout(2300);
ok(await p.isVisible('#map'),'cold load shows the map');
ok((await p.evaluate(()=>document.querySelectorAll('#dots .dot').length))>6000,'cold load draws the school dots');
ok(await p.isVisible('.roleswitch'),'role switch is visible');
ok(!(await p.isVisible('#dirPanel')),'director panel starts hidden');
await p.close();

// 2. sticky role must never strand the viewer
p=await b.newPage({viewport:{width:1400,height:1000}});
await p.addInitScript(()=>{try{localStorage.setItem('puntea.role','dir')}catch(e){}});
await p.goto(APP,{waitUntil:'load'}); await p.waitForTimeout(2300);
ok(await p.isVisible('#dirPanel'),'remembered director role opens the director view');
ok(await p.isVisible('#roleNgo'),'the way back is on screen even with the role remembered');
await p.click('#roleNgo'); await p.waitForTimeout(400);
ok(await p.isVisible('#map'),'switching back restores the map');
ok(await p.isVisible('.stats'),'stat tiles are never hidden');
await p.close();

await b.close();
console.log(bad?`${bad} assertion(s) failed`:'role contract holds');
if(bad)process.exitCode=1;
