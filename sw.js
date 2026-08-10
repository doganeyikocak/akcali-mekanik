const CACHE="akcali-mekanik-v3-3";
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
        if(response && response.ok)await cache.put(url,response.clone());
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

    // Eski PWA ekranı açık olsa bile yeni sürümü bir kez yüklet.
    const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of windows){
      try{await client.navigate(client.url);}catch(_){}
    }
  })());
});

self.addEventListener("message",event=>{
  if(event.data && event.data.type==="SKIP_WAITING")self.skipWaiting();
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;

  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  // Sayfa açılışında internet varsa her zaman en güncel HTML'i dene.
  if(req.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(new Request(req,{cache:"no-store"}));
        if(fresh && fresh.ok){
          const cache=await caches.open(CACHE);
          await cache.put("./index.html",fresh.clone());
          return fresh;
        }
      }catch(_){}
      return (await caches.match(req)) || (await caches.match("./index.html"));
    })());
    return;
  }

  // JS/CSS/ikonlar: internet varsa günceli al, yoksa cache'den çalış.
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(new Request(req,{cache:"no-cache"}));
      if(fresh && fresh.ok){
        const cache=await caches.open(CACHE);
        await cache.put(req,fresh.clone());
        return fresh;
      }
    }catch(_){}
    return (await caches.match(req)) || Response.error();
  })());
});
