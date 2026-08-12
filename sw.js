const CACHE="akcali-mekanik-v4-0";
const ASSETS=[
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const url of ASSETS){
      try{
        const response=await fetch(new Request(url,{cache:"reload"}));
        if(response&&response.ok)await cache.put(url,response.clone());
      }catch(_){}
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message",event=>{
  if(event.data&&event.data.type==="SKIP_WAITING")self.skipWaiting();
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  if(req.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(new Request(req,{cache:"no-store"}));
        if(fresh&&fresh.ok){
          const cache=await caches.open(CACHE);
          await cache.put("./index.html",fresh.clone());
          return fresh;
        }
      }catch(_){}
      return (await caches.match(req))||(await caches.match("./index.html"));
    })());
    return;
  }

  event.respondWith((async()=>{
    try{
      const fresh=await fetch(new Request(req,{cache:"no-cache"}));
      if(fresh&&fresh.ok){
        const cache=await caches.open(CACHE);
        await cache.put(req,fresh.clone());
        return fresh;
      }
    }catch(_){}
    return (await caches.match(req))||Response.error();
  })());
});