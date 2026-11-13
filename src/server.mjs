import http from 'node:http';
const widget=process.env.WIDGET_URL||'http://127.0.0.1:4303';
const server=http.createServer(async(req,res)=>{
 if(req.url==='/healthz'){res.writeHead(200,{'content-type':'application/json'});return res.end('{"ok":true,"module":"shell"}');}
 if(req.url!=='/'){res.writeHead(404);return res.end();}
 let content='<p>Shell works independently</p>';
 try{
  const response=await fetch(widget+'/manifest.json',{signal:AbortSignal.timeout(250)});
  if(response.ok){const m=await response.json();
   if(m.id==='demo-widget'&&m.version===1&&m.path==='/'&&typeof m.title==='string')
    content='<h2>Synthetic Widget</h2><iframe sandbox="" title="Synthetic Widget" src="'+widget+'/"> </iframe>';
  }
 }catch{}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 res.end('<!doctype html><html><body><h1>Generic Shell</h1>'+content+'</body></html>');
});
server.listen(Number(process.env.PORT||4300),'127.0.0.1');
process.on('SIGTERM',()=>server.close());
