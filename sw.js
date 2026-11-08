/* Photos are streamed to the requesting tab only. No private responses are cached. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{if(event.data?.type==='claim')event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),apiPath=new URL('api/studio/',self.registration.scope).pathname;
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(apiPath))return;
 event.respondWith((async()=>{
  const client=await self.clients.get(event.clientId);if(!client)return new Response('Откройте студию',{status:503});
  return new Promise(resolve=>{
   const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(new Response('Окно студии не отвечает',{status:503}));},180_000);
   channel.port1.onmessage=event=>{clearTimeout(timer);const data=event.data;channel.port1.close();resolve(new Response(data.body,{status:data.status,headers:{...data.headers,'cache-control':'private, no-store'}}));};
   client.postMessage({type:'studio-media-request',url:event.request.url},[channel.port2]);
  });
 })());
});
