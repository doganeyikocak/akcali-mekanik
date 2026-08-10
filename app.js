const APP_VERSION="3.1.0";
const DEFAULTS={
  blocks:["A Blok","B Blok","C Blok","D Blok"],
  floors:["B2","B1","Zemin","1. Kat","2. Kat","3. Kat","4. Kat","5. Kat","Çatı"],
  issues:["Ters Eğim","Eksik Kelepçe","Yanlış Güzergâh","İzolasyon Eksik","Montaj Hatası","Kaçak","Diğer"],
  contractors:["Taşeron 1","Taşeron 2","Taşeron 3"],
  foremen:["Formen 1","Formen 2","Formen 3"]
};
const DB_NAME="akcali-mekanik-db",DB_VERSION=1,STORE="issues";
let db=null,currentConfig=loadCachedConfig(),selectedPhotoData="",syncRunning=false;

document.addEventListener("DOMContentLoaded",async()=>{
  document.getElementById("versionLabel").textContent="v3.1";

  // v3.1: kısa açıklama zorunlu ve görünür.
  const note=document.getElementById("noteInput");
  if(note) note.required=true;
  const details=document.querySelector(".optional-box");
  if(details){
    details.open=true;
    const summary=details.querySelector("summary");
    if(summary) summary.textContent="Kısa açıklama *";
  }

  await openDb();
  await requestPersistentStorage();
  bindNavigation();bindForm();bindButtons();loadSettings();renderSelects();
  updateConnectionStatus();showIosInstallHint();await refreshCounts();await renderLists();registerServiceWorker();
  if(navigator.onLine){refreshRemoteConfig().catch(()=>{});syncPending().catch(()=>{});}
  window.addEventListener("online",async()=>{updateConnectionStatus();showToast("İnternet geldi. Gönderimler kontrol ediliyor.");await refreshRemoteConfig().catch(()=>{});await syncPending();});
  window.addEventListener("offline",updateConnectionStatus);
});

function isIos(){return /iphone|ipad|ipod/i.test(navigator.userAgent);}
function isStandalone(){return window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;}
function showIosInstallHint(){const card=document.getElementById("iosInstallCard");if(isIos()&&!isStandalone()&&localStorage.getItem("hideIosInstall")!=="1")card.hidden=false;}
function registerServiceWorker(){if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(console.error);}
async function requestPersistentStorage(){try{if(navigator.storage&&navigator.storage.persist)await navigator.storage.persist();}catch(_){}}

function bindNavigation(){document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",async()=>{showView(btn.dataset.go);if(["pendingView","recordsView"].includes(btn.dataset.go))await renderLists();}));}
function showView(id){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));document.getElementById(id).classList.add("active");window.scrollTo({top:0,behavior:"smooth"});}

function renderSelects(){
  fillSelect("blockSelect",currentConfig.blocks,"Blok seç");
  fillSelect("floorSelect",currentConfig.floors,"Kat seç");
  fillSelect("issueSelect",currentConfig.issues,"Hata türü seç");
  fillSelect("contractorSelect",currentConfig.contractors,"Taşeron seç");
  fillSelect("foremanSelect",currentConfig.foremen,"Formen seç");
}
function fillSelect(id,items,placeholder){
  const s=document.getElementById(id);
  const old=s.value;
  s.innerHTML=`<option value="" selected disabled>${escapeHtml(placeholder)}</option>`+(items||[]).map(x=>`<option value="${escapeAttr(x)}">${escapeHtml(x)}</option>`).join("");
  if(old&&(items||[]).includes(old))s.value=old;
}

function bindForm(){
  document.getElementById("photoInput").addEventListener("change",async e=>{
    const f=e.target.files[0];if(!f)return;
    try{
      selectedPhotoData=await compressImage(f,1280,.68);
      const img=document.getElementById("photoPreview");img.src=selectedPhotoData;img.hidden=false;
    }catch(_){showToast("Fotoğraf işlenemedi. Tekrar çek.");}
  });

  document.getElementById("issueForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const issue={
      localId:makeUuid(),createdAt:new Date().toISOString(),
      block:document.getElementById("blockSelect").value,
      floor:document.getElementById("floorSelect").value,
      location:document.getElementById("locationInput").value.trim(),
      issueType:document.getElementById("issueSelect").value,
      contractor:document.getElementById("contractorSelect").value,
      foreman:document.getElementById("foremanSelect").value,
      note:document.getElementById("noteInput").value.trim(),
      photoData:selectedPhotoData,
      deviceName:(localStorage.getItem("deviceName")||"").trim(),
      syncStatus:"pending",cloudId:"",lastError:""
    };

    if(!issue.block)return showToast("Blok seç.");
    if(!issue.floor)return showToast("Kat seç.");
    if(!issue.location)return showToast("Mahal / daire yaz.");
    if(!issue.issueType)return showToast("Hata türü seç.");
    if(!issue.contractor)return showToast("Taşeron seç.");
    if(!issue.foreman)return showToast("Formen seç.");
    if(!issue.note)return showToast("Kısa açıklama yaz.");
    if(!selectedPhotoData)return showToast("Fotoğraf çek.");

    try{
      await putIssue(issue);
      resetIssueForm();
      await refreshCounts();
      showView("homeView");
      showToast("✅ Hata kaydedildi.");
      if(navigator.onLine)syncPending();
    }catch(_){showToast("Kayıt telefona yazılamadı. Tekrar dene.");}
  });

  const voiceBtn=document.getElementById("voiceBtn"),SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)voiceBtn.hidden=true;
  else voiceBtn.onclick=()=>{
    const r=new SR();r.lang="tr-TR";r.interimResults=false;
    r.onresult=e=>document.getElementById("noteInput").value=e.results[0][0].transcript;
    r.onerror=()=>showToast("Sesle yazma bu telefonda kullanılamadı.");
    r.start();
  };
}

function bindButtons(){
  document.getElementById("syncBtn").onclick=syncPending;
  document.getElementById("pendingSyncBtn").onclick=syncPending;
  document.getElementById("saveSettingsBtn").onclick=()=>{
    localStorage.setItem("deviceName",document.getElementById("deviceName").value.trim());
    localStorage.setItem("apiUrl",normalizeApiUrl(document.getElementById("apiUrl").value));
    showToast("Ayarlar kaydedildi.");
  };
  document.getElementById("testApiBtn").onclick=testApi;
  document.getElementById("refreshConfigBtn").onclick=async()=>{await refreshRemoteConfig(true);};
  document.getElementById("exportBtn").onclick=exportCsv;
  document.getElementById("purgeSyncedBtn").onclick=purgeSynced;
  document.getElementById("hideInstallCard").onclick=()=>{localStorage.setItem("hideIosInstall","1");document.getElementById("iosInstallCard").hidden=true;};
}

function loadSettings(){document.getElementById("deviceName").value=localStorage.getItem("deviceName")||"";document.getElementById("apiUrl").value=localStorage.getItem("apiUrl")||"";}
function normalizeApiUrl(v){return String(v||"").trim().replace(/[?#].*$/,"");}
function apiUrl(){return normalizeApiUrl(localStorage.getItem("apiUrl")||"");}

async function testApi(){
  const out=document.getElementById("apiTestResult"),url=normalizeApiUrl(document.getElementById("apiUrl").value);
  if(!url){out.textContent="Bulut bağlantısı boş.";return;}
  out.textContent="Bağlantı test ediliyor…";
  try{
    const res=await fetch(url+"?action=health&ts="+Date.now(),{cache:"no-store"});
    const data=await res.json();
    out.textContent=data.ok?"✅ Bulut bağlantısı çalışıyor.":"❌ Sunucu cevap verdi ama hata var.";
  }catch(_){out.textContent="❌ Bağlantı kurulamadı. URL ve yayın yetkisini kontrol et.";}
}

async function refreshRemoteConfig(showResult=false){
  const url=apiUrl();if(!url)return;
  try{
    const res=await fetch(url+"?action=config&ts="+Date.now(),{cache:"no-store"});
    const data=await res.json();
    if(!data.ok||!data.config)throw new Error("config");
    currentConfig=sanitizeConfig(data.config);
    localStorage.setItem("cachedConfig",JSON.stringify(currentConfig));
    renderSelects();
    if(showResult)showToast("Listeler güncellendi.");
  }catch(_){if(showResult)showToast("Listeler güncellenemedi; telefondaki son liste kullanılıyor.");}
}

function loadCachedConfig(){try{return sanitizeConfig(JSON.parse(localStorage.getItem("cachedConfig")||"null")||DEFAULTS);}catch(_){return DEFAULTS;}}
function sanitizeConfig(c){
  const clean=k=>Array.from(new Set((Array.isArray(c[k])?c[k]:DEFAULTS[k]).map(x=>String(x||"").trim()).filter(Boolean)));
  return {blocks:clean("blocks"),floors:clean("floors"),issues:clean("issues"),contractors:clean("contractors"),foremen:clean("foremen")};
}

function resetIssueForm(){
  document.getElementById("issueForm").reset();
  selectedPhotoData="";
  const img=document.getElementById("photoPreview");img.hidden=true;img.removeAttribute("src");
}
function updateConnectionStatus(){
  const el=document.getElementById("connectionStatus");
  if(navigator.onLine){el.textContent="● İnternet var";el.className="status online";}
  else{el.textContent="● İnternet yok — kayıtlar telefonda";el.className="status offline";}
}
function showToast(text){const t=document.getElementById("toast");t.textContent=text;t.hidden=false;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.hidden=true,3400);}

function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:"localId"});};req.onsuccess=()=>{db=req.result;resolve();};req.onerror=()=>reject(req.error);});}
function putIssue(issue){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(issue);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
function deleteIssue(id){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
function getAllIssues(){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));req.onerror=()=>reject(req.error);});}
async function refreshCounts(){const a=await getAllIssues();document.getElementById("pendingBadge").textContent=a.filter(x=>x.syncStatus!=="synced").length;}
async function renderLists(){const a=await getAllIssues();renderIssueCards("pendingList",a.filter(x=>x.syncStatus!=="synced"));renderIssueCards("recordsList",a);}
function renderIssueCards(id,items){
  const el=document.getElementById(id);
  if(!items.length){el.innerHTML='<div class="card"><p>Kayıt yok.</p></div>';return;}
  el.innerHTML=items.map(x=>`<div class="card"><h3>${escapeHtml(x.block)} / ${escapeHtml(x.floor)} / ${escapeHtml(x.location)}</h3><p><b>Hata:</b> ${escapeHtml(x.issueType)}</p><p><b>Taşeron:</b> ${escapeHtml(x.contractor)}</p><p><b>Formen:</b> ${escapeHtml(x.foreman)}</p><p><b>Tarih:</b> ${new Date(x.createdAt).toLocaleString("tr-TR")}</p>${x.cloudId?`<p><b>Kayıt No:</b> ${escapeHtml(x.cloudId)}</p>`:""}${x.note?`<p><b>Açıklama:</b> ${escapeHtml(x.note)}</p>`:""}${x.lastError?`<p><b>Son hata:</b> ${escapeHtml(x.lastError)}</p>`:""}<span class="tag ${x.syncStatus==="synced"?"synced":"pending"}">${x.syncStatus==="synced"?"Gönderildi":"Gönderilmeyi bekliyor"}</span>${x.photoData?`<img src="${x.photoData}" alt="Hata fotoğrafı">`:""}</div>`).join("");
}

async function syncPending(){
  if(syncRunning)return;
  if(!navigator.onLine)return showToast("İnternet yok. Kayıtlar telefonda güvende.");
  const url=apiUrl();if(!url)return showToast("Bulut bağlantısı tanımlı değil.");
  const all=await getAllIssues(),pending=all.filter(x=>x.syncStatus!=="synced");
  if(!pending.length)return showToast("Gönderilecek kayıt yok.");
  syncRunning=true;let ok=0;
  try{
    for(const issue of pending){
      try{
        const res=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"createIssue",issue})});
        const data=await res.json();
        if(!data.ok)throw new Error(data.error||"Sunucu hatası");
        issue.syncStatus="synced";issue.cloudId=data.recordId||issue.cloudId||"";issue.lastError="";
        await putIssue(issue);ok++;
      }catch(err){issue.lastError=String(err.message||err);await putIssue(issue);}
    }
  }finally{syncRunning=false;await refreshCounts();await renderLists();}
  showToast(`${ok}/${pending.length} kayıt gönderildi.`);
}

async function purgeSynced(){
  const all=await getAllIssues(),synced=all.filter(x=>x.syncStatus==="synced");
  for(const x of synced)await deleteIssue(x.localId);
  await refreshCounts();await renderLists();showToast(`${synced.length} gönderilmiş kayıt telefondan temizlendi.`);
}
async function exportCsv(){
  const all=await getAllIssues();
  const rows=[["localId","createdAt","block","floor","location","issueType","contractor","foreman","note","deviceName","syncStatus","cloudId","lastError"],...all.map(x=>[x.localId,x.createdAt,x.block,x.floor,x.location,x.issueType,x.contractor,x.foreman,x.note,x.deviceName,x.syncStatus,x.cloudId,x.lastError])];
  const csv=rows.map(r=>r.map(csvEscape).join(",")).join("\n"),blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=`akcali-mekanik-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);
}

function makeUuid(){return (crypto.randomUUID?crypto.randomUUID():String(Date.now())+"-"+Math.random().toString(16).slice(2));}
function csvEscape(v){return `"${String(v??"").replaceAll('"','""')}"`;}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escapeAttr(s){return String(s??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function compressImage(file,maxWidth,quality){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,maxWidth/img.width),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",quality));};img.onerror=reject;img.src=reader.result;};reader.onerror=reject;reader.readAsDataURL(file);});}
