import http from 'node:http';
const manifest={id:'demo-widget',title:'Synthetic Widget',path:'/',version:1};
const server=http.createServer((req,res)=>{
 if(req.url==='/healthz'){res.writeHead(200,{'content-type':'application/json'});return res.end('{"ok":true}');}
 if(req.url==='/manifest.json'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify(manifest));}
 if(req.url==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'"});return res.end('<!doctype html><html><body><h2>Synthetic Widget</h2><p>Independent extension.</p></body></html>');}
 res.writeHead(404);res.end();
});
server.listen(Number(process.env.PORT||4303),'127.0.0.1');
process.on('SIGTERM',()=>server.close());
