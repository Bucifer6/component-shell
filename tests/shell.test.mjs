import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function port(){return new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});}
async function start(path,p,extra={}){
 const child=spawn(process.execPath,[path],{env:{...process.env,PORT:String(p),...extra},stdio:'ignore'});
 for(let i=0;i<70;i++){try{if((await fetch('http://127.0.0.1:'+p+'/healthz',{signal:AbortSignal.timeout(150)})).ok)return child;}catch{}await pause(25);}
 child.kill();throw Error(path+' did not start');
}
test('manifest must use expected extension version and path',()=>{
 const schema=JSON.parse(readFileSync(new URL('../contracts/widget-manifest-v1.schema.json',import.meta.url)));
 assert.equal(schema.properties.path.const,'/');assert.equal(schema.properties.version.const,1);
});
test('shell stays available when widget stops',async()=>{
 const [wp,sp]=await Promise.all([port(),port()]);
 let widget, shell;
 try{
  widget=await start('fixture-widget/server.mjs',wp);
  shell=await start('src/server.mjs',sp,{WIDGET_URL:'http://127.0.0.1:'+wp});
  const page=await(await fetch('http://127.0.0.1:'+sp+'/')).text();
  assert.match(page,/Synthetic Widget/);
  assert.match(page,/sandbox=""/);
  widget.kill('SIGTERM');
  await pause(120);
  const fallback=await(await fetch('http://127.0.0.1:'+sp+'/')).text();
  assert.match(fallback,/Shell works independently/);
  assert.equal((await fetch('http://127.0.0.1:'+sp+'/healthz')).status,200);
 }finally{shell?.kill('SIGTERM');widget?.kill('SIGTERM');}
});
