import {writeFileSync} from 'node:fs';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
try{
const p=await b.newPage();let release;const gate=new Promise(r=>release=r);await p.route('**/bruh-v2.glb',async r=>{await gate;await r.continue();});await p.goto('http://127.0.0.1:5186/drift-line');await p.locator('.model-loading').waitFor();release();await p.locator('.model-loading').waitFor({state:'detached'});await p.close();
const c=await b.newContext({reducedMotion:'reduce'});await c.addInitScript(()=>{const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,options){return orig.call(this,type,type.includes('webgl')?{...options,preserveDrawingBuffer:true}:options);};});const r=await c.newPage();await r.goto('http://127.0.0.1:5186/drift-line');await r.locator('canvas').waitFor();await r.locator('.model-loading').waitFor({state:'detached'});await r.waitForTimeout(2000);const before=await r.locator('canvas').evaluate(c=>c.toDataURL());await r.evaluate(()=>scrollTo(0,innerHeight));await r.waitForTimeout(2000);const after=await r.locator('canvas').evaluate(c=>c.toDataURL());writeFileSync('.preview/reduced-before.png',Buffer.from(before.split(',')[1],'base64'));writeFileSync('.preview/reduced-after.png',Buffer.from(after.split(',')[1],'base64'));assert.ok(before === after,'Reduced-motion car/camera must remain static when scrolling');await c.close();
const f=await b.newPage();await f.route('**/bruh-v2.glb',r=>r.abort());await f.goto('http://127.0.0.1:5186/drift-line');await f.locator('.scene-fallback').waitFor();await f.getByRole('button',{name:'VIEW BRUH'}).click();await f.locator('dialog .scene-fallback').waitFor();await f.getByRole('button',{name:'Close car viewer'}).click();assert.equal(await f.locator('dialog').count(),0);await f.close();console.log('Loading, model failure, close on error, actual reduced-motion frame stability passed.');
}finally{await b.close();}



