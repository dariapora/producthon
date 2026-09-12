// The cold load asks one question and reveals no dense application content until the user chooses.
import {pathToFileURL} from 'url'; import path from 'path';
const APP=pathToFileURL(path.resolve(import.meta.dirname,'../app/index.html')).href;
import { chromium } from 'playwright';
const b=await chromium.launch();
let bad=0;
const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m); if(!c)bad++;};

// 1. cold load, no stored role
let p=await b.newPage({viewport:{width:1400,height:1000}});
await p.goto(APP,{waitUntil:'load'}); await p.waitForTimeout(2300);
ok(!(await p.isVisible('#appContent')),'cold load hides the application content');
ok(await p.isVisible('.roleswitch'),'role switch is visible');
ok(!(await p.isVisible('#dirPanel')),'director panel starts hidden');
ok((await p.locator('.rsw').first().getAttribute('id'))==='roleDir','school-help choice is first');
ok((await p.locator('.rsw[aria-selected="true"]').count())===0,'nothing is selected by default');
await p.close();

// 2. A previous visit must not skip the explicit choice.
p=await b.newPage({viewport:{width:1400,height:1000}});
await p.addInitScript(()=>{try{localStorage.setItem('puntea.role','dir')}catch(e){}});
await p.goto(APP,{waitUntil:'load'}); await p.waitForTimeout(2300);
ok(!(await p.isVisible('#appContent')),'stored role does not bypass the choice');
await p.click('#roleDir'); await p.waitForTimeout(400);
ok(await p.isVisible('#dirPanel'),'school choice opens the school search');
ok(!(await p.isVisible('#map')),'school path does not show the NGO map');
await p.click('#goHome'); await p.waitForTimeout(400);
ok(!(await p.isVisible('#appContent')),'home returns to the choice and hides content');
await p.click('#roleNgo'); await p.waitForTimeout(400);
ok(await p.isVisible('#map'),'switching back restores the map');
ok(!(await p.isVisible('.stats')),'detailed statistics stay collapsed');
await p.close();

await b.close();
console.log(bad?`${bad} assertion(s) failed`:'role contract holds');
if(bad)process.exitCode=1;
