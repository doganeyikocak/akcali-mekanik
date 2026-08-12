const APP_VERSION="4.0.0";
const DEFAULT_API_URL="https://script.google.com/macros/s/AKfycbzYzHuDIT90xjLz8nx04ivTzd0RLBLRHinKOSXdcafEUQ076wXfnvKknY6ootx-SgaB/exec";
const DEFAULTS={
  blocks:["A Blok","B Blok","C Blok","D Blok"],
  floors:["B2","B1","Zemin","1. Kat","2. Kat","3. Kat","4. Kat","5. Kat","Çatı"],
  issues:["Ters Eğim","Eksik Kelepçe","Yanlış Güzergâh","İzolasyon Eksik","Montaj Hatası","Kaçak","Diğer"],
  priorities:["Kritik","Yüksek","Normal","Düşük"],
  contractors:["Taşeron 1","Taşeron 2","Taşeron 3"],
  foremen:["Formen 1","Formen 2","Formen 3"],
  terms:["1","2","3","5","7"]
};

const DB_NAME="akcali-mekanik-db";
const DB_VERSION=2;
const ISSUE_STORE="issues";
const CORRECTION_STORE="corrections";

let db=null;
let currentConfig=loadCachedConfig();
let selectedPhotoData="";
let selectedCorrectionPhotoData="";
let correctionTarget=null;
let syncRunning=false;
let swRegistration=null;

document.addEventListener("DOMContentLoaded",async()=>{
  document.getElementById("versionLabel").textContent="v4.0";
  await openDb();
  await requestPersistentStorage();
  bindNavigation();
  bindForm();
  bindCorrectionForm();
  bindButtons();
  bindKeyboardDismiss();
  loadSettings();
  renderSelects();
  updateConnectionStatus();
  showInstallHint();
  updateContractorHome();
  await refreshCounts();
  await renderLists();
  registerServiceWorker();

  if(navigator.onLine){
    refreshRemoteConfig().catch(()=>{});
    syncAllPending().catch(()=>{});
  }

  window.addEventListener("online",async()=>{
    updateConnectionStatus();
    showToast("İnternet geldi. Bekleyen kayıtlar gönderiliyor.");
    await refreshRemoteConfig().catch(()=>{});
    await syncAllPending();
    if(loadContractorSession())refreshContractorIssues(false).catch(()=>{});
  });
  window.addEventListener("offline",updateConnectionStatus);
});

function isIos(){return /iphone|ipad|ipod/i.test(navigator.userAgent);}
function isAndroid(){return /android/i.test(navigator.userAgent);}
function isStandalone(){return window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;}

function showInstallHint(){
  const card=document.getElementById("iosInstallCard");
  if((isIos()||isAndroid())&&!isStandalone()&&localStorage.getItem("hideInstall")!=="1")card.hidden=false;
}

async function registerServiceWorker(){
  if(!("serviceWorker" in navigator))return;
  try{
    swRegistration=await navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"});
    let reloading=false;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{
      if(reloading)return;
      reloading=true;
      window.location.reload();
    });

    if(swRegistration.waiting)swRegistration.waiting.postMessage({type:"SKIP_WAITING"});

    swRegistration.addEventListener("updatefound",()=>{
      const worker=swRegistration.installing;
      if(!worker)return;
      worker.addEventListener("statechange",()=>{
        if(worker.state==="installed"&&navigator.serviceWorker.controller){
          worker.postMessage({type:"SKIP_WAITING"});
        }
      });
    });

    if(navigator.onLine){
      try{await swRegistration.update();}catch(_){}
    }

    document.addEventListener("visibilitychange",()=>{
      if(document.visibilityState==="visible"&&navigator.onLine&&swRegistration){
        swRegistration.update().catch(()=>{});
      }
    });
  }catch(err){console.error("Service worker kayıt hatası:",err);}
}

async function checkForUpdate(){
  if(!navigator.onLine)return showToast("İnternet yok. Güncelleme kontrol edilemedi.");
  if(!("serviceWorker" in navigator))return showToast("Bu tarayıcı güncelleme sistemini desteklemiyor.");
  try{
    const reg=swRegistration||await navigator.serviceWorker.getRegistration();
    if(!reg)return showToast("Uygulama servisi henüz hazır değil.");
    await reg.update();
    if(reg.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});
    showToast(`Güncelleme kontrol edildi. Mevcut sürüm: v${APP_VERSION.replace(".0","")}`);
  }catch(_){showToast("Güncelleme kontrolü yapılamadı.");}
}

async function requestPersistentStorage(){
  try{if(navigator.storage&&navigator.storage.persist)await navigator.storage.persist();}catch(_){}
}

function bindKeyboardDismiss(){
  const doneBtn=document.getElementById("keyboardDoneBtn");
  const editableSelector='input[type="text"],input[type="url"],input[type="password"],textarea';

  const showDone=()=>{if(doneBtn)doneBtn.hidden=false;};
  const maybeHideDone=()=>setTimeout(()=>{
    const a=document.activeElement;
    if(doneBtn&&!(a&&a.matches&&a.matches(editableSelector)))doneBtn.hidden=true;
  },80);

  document.querySelectorAll(editableSelector).forEach(el=>{
    el.addEventListener("focus",showDone);
    el.addEventListener("blur",maybeHideDone);
    if(el.tagName==="INPUT"){
      el.setAttribute("enterkeyhint","done");
      el.addEventListener("keydown",e=>{
        if(e.key==="Enter"){
          e.preventDefault();
          el.blur();
          if(el.id==="contractorPin")contractorLogin();
        }
      });
    }
  });

  if(doneBtn){
    const close=()=>{
      const a=document.activeElement;
      if(a&&a.blur)a.blur();
      doneBtn.hidden=true;
    };
    doneBtn.addEventListener("touchstart",e=>{e.preventDefault();close();},{passive:false});
    doneBtn.addEventListener("click",close);
  }

  document.addEventListener("pointerdown",e=>{
    const a=document.activeElement;
    if(!a||!a.matches||!a.matches(editableSelector))return;
    if(e.target.closest("input,textarea,select,button,label"))return;
    a.blur();
  });
}

function bindNavigation(){
  document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",async()=>{
    showView(btn.dataset.go);
    if(["pendingView","recordsView"].includes(btn.dataset.go))await renderLists();
  }));
}

function showView(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  const target=document.getElementById(id);
  if(target)target.classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}

function bindButtons(){
  document.getElementById("syncBtn").onclick=syncAllPending;
  document.getElementById("pendingSyncBtn").onclick=syncAllPending;
  document.getElementById("contractorHomeBtn").onclick=openContractorArea;
  document.getElementById("contractorLoginBtn").onclick=contractorLogin;
  document.getElementById("contractorLogoutBtn").onclick=contractorLogout;
  document.getElementById("refreshContractorBtn").onclick=()=>refreshContractorIssues(true);
  document.getElementById("correctionBackBtn").onclick=()=>showView("contractorPanelView");
  document.getElementById("checkUpdateBtn").onclick=checkForUpdate;

  document.getElementById("saveSettingsBtn").onclick=()=>{
    localStorage.setItem("deviceName",document.getElementById("deviceName").value.trim());
    localStorage.setItem("apiUrl",normalizeApiUrl(document.getElementById("apiUrl").value));
    showToast("Ayarlar kaydedildi.");
  };

  document.getElementById("testApiBtn").onclick=testApi;
  document.getElementById("refreshConfigBtn").onclick=async()=>refreshRemoteConfig(true);
  document.getElementById("exportBtn").onclick=exportCsv;
  document.getElementById("purgeSyncedBtn").onclick=purgeSynced;
  document.getElementById("hideInstallCard").onclick=()=>{
    localStorage.setItem("hideInstall","1");
    document.getElementById("iosInstallCard").hidden=true;
  };

  document.getElementById("termSelect").addEventListener("change",updateDuePreview);
  document.getElementById("contractorIssueList").addEventListener("click",async e=>{
    const btn=e.target.closest("[data-correct-record]");
    if(!btn)return;
    const recordId=btn.dataset.correctRecord;
    const issues=getCachedContractorIssues();
    const issue=issues.find(x=>x.recordId===recordId);
    if(!issue)return showToast("Kayıt bulunamadı. İşleri yenile.");
    const queued=await getPendingCorrectionForRecord(recordId);
    if(queued)return showToast("Bu kayıt için telefonda gönderilmeyi bekleyen düzeltme var.");
    openCorrection(issue);
  });
}

function renderSelects(){
  fillSelect("blockSelect",currentConfig.blocks,"Blok seç");
  fillSelect("floorSelect",currentConfig.floors,"Kat seç");
  fillSelect("issueSelect",currentConfig.issues,"Hata türü seç");
  fillSelect("prioritySelect",currentConfig.priorities,"Öncelik seç");
  fillSelect("contractorSelect",currentConfig.contractors,"Taşeron seç");
  fillSelect("foremanSelect",currentConfig.foremen,"Formen seç");
  fillSelect("contractorLoginSelect",currentConfig.contractors,"Firma seç");
  fillTermSelect();
}

function fillSelect(id,items,placeholder){
  const s=document.getElementById(id);
  if(!s)return;
  const old=s.value;
  s.innerHTML=`<option value="" selected disabled>${escapeHtml(placeholder)}</option>`+
    (items||[]).map(x=>`<option value="${escapeAttr(x)}">${escapeHtml(x)}</option>`).join("");
  if(old&&(items||[]).includes(old))s.value=old;
}

function fillTermSelect(){
  const s=document.getElementById("termSelect");
  const old=s.value;
  const nums=Array.from(new Set((currentConfig.terms||[]).map(parseTermDays).filter(n=>Number.isFinite(n)&&n>=0)));
  s.innerHTML='<option value="" selected disabled>Termin seç</option>'+
    nums.map(n=>`<option value="${n}">${n===0?"Aynı Gün":n+" Gün"}</option>`).join("");
  if(old&&nums.includes(Number(old)))s.value=old;
}

function parseTermDays(v){
  const m=String(v??"").match(/\d+/);
  return m?Number(m[0]):NaN;
}

function updateDuePreview(){
  const raw=document.getElementById("termSelect").value;
  const el=document.getElementById("duePreview");
  if(raw===""){el.textContent="Termin tarihi seçime göre hesaplanacak.";return;}
  const d=new Date();
  d.setDate(d.getDate()+Number(raw));
  el.textContent=`Tahmini termin: ${d.toLocaleDateString("tr-TR")}`;
}

function bindForm(){
  document.getElementById("photoInput").addEventListener("change",async e=>{
    const f=e.target.files[0];if(!f)return;
    try{
      selectedPhotoData=await compressImage(f,1280,.68);
      const img=document.getElementById("photoPreview");
      img.src=selectedPhotoData;img.hidden=false;
    }catch(_){showToast("Fotoğraf işlenemedi. Tekrar seç.");}
  });

  document.getElementById("issueForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const termRaw=document.getElementById("termSelect").value;
    const issue={
      localId:makeUuid(),
      createdAt:new Date().toISOString(),
      block:document.getElementById("blockSelect").value,
      floor:document.getElementById("floorSelect").value,
      location:document.getElementById("locationInput").value.trim(),
      issueType:document.getElementById("issueSelect").value,
      priority:document.getElementById("prioritySelect").value,
      contractor:document.getElementById("contractorSelect").value,
      foreman:document.getElementById("foremanSelect").value,
      note:document.getElementById("noteInput").value.trim(),
      termDays:termRaw===""?null:Number(termRaw),
      photoData:selectedPhotoData,
      deviceName:(localStorage.getItem("deviceName")||"").trim(),
      appVersion:APP_VERSION,
      syncStatus:"pending",
      cloudId:"",
      lastError:""
    };

    if(!issue.block)return showToast("Blok seç.");
    if(!issue.floor)return showToast("Kat seç.");
    if(!issue.location)return showToast("Mahal / daire yaz.");
    if(!issue.issueType)return showToast("Hata türü seç.");
    if(!issue.priority)return showToast("Öncelik seç.");
    if(!issue.contractor)return showToast("Taşeron seç.");
    if(!issue.foreman)return showToast("Formen seç.");
    if(!issue.note)return showToast("Kısa açıklama yaz.");
    if(issue.termDays===null||!Number.isFinite(issue.termDays))return showToast("Termin süresi seç.");
    if(!selectedPhotoData)return showToast("Hata fotoğrafı ekle.");

    try{
      await putRecord(ISSUE_STORE,issue);
      resetIssueForm();
      await refreshCounts();
      showView("homeView");
      showToast("✅ Hata telefona kaydedildi.");
      if(navigator.onLine)syncAllPending();
    }catch(_){showToast("Kayıt telefona yazılamadı. Tekrar dene.");}
  });

  const voiceBtn=document.getElementById("voiceBtn");
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)voiceBtn.hidden=true;
  else voiceBtn.onclick=()=>{
    const r=new SR();
    r.lang="tr-TR";r.interimResults=false;
    r.onresult=e=>document.getElementById("noteInput").value=e.results[0][0].transcript;
    r.onerror=()=>showToast("Sesle yazma bu telefonda kullanılamadı.");
    r.start();
  };
}

function bindCorrectionForm(){
  document.getElementById("correctionPhotoInput").addEventListener("change",async e=>{
    const f=e.target.files[0];if(!f)return;
    try{
      selectedCorrectionPhotoData=await compressImage(f,1280,.68);
      const img=document.getElementById("correctionPhotoPreview");
      img.src=selectedCorrectionPhotoData;img.hidden=false;
    }catch(_){showToast("Düzeltme fotoğrafı işlenemedi.");}
  });

  document.getElementById("correctionForm").addEventListener("submit",async e=>{
    e.preventDefault();
    if(!correctionTarget)return showToast("Düzeltilecek kayıt seçili değil.");
    const session=loadContractorSession();
    if(!session)return showToast("Taşeron oturumu bulunamadı.");

    const note=document.getElementById("correctionNote").value.trim();
    if(!note)return showToast("Düzeltme açıklaması yaz.");
    if(!selectedCorrectionPhotoData)return showToast("Düzeltme fotoğrafı ekle.");

    const correction={
      localId:makeUuid(),
      createdAt:new Date().toISOString(),
      recordId:correctionTarget.recordId,
      contractor:session.contractor,
      token:session.token,
      note,
      photoData:selectedCorrectionPhotoData,
      appVersion:APP_VERSION,
      syncStatus:"pending",
      lastError:""
    };

    try{
      await putRecord(CORRECTION_STORE,correction);
      resetCorrectionForm();
      markCachedIssuePending(correction.recordId);
      await refreshCounts();
      showView("contractorPanelView");
      renderContractorIssues(getCachedContractorIssues(),navigator.onLine?"Önceki liste gösteriliyor.":"Offline liste");
      showToast("✅ Düzeltme kaydedildi.");
      if(navigator.onLine)syncAllPending();
    }catch(_){showToast("Düzeltme telefona kaydedilemedi.");}
  });
}

function resetIssueForm(){
  document.getElementById("issueForm").reset();
  selectedPhotoData="";
  const img=document.getElementById("photoPreview");
  img.hidden=true;img.removeAttribute("src");
  updateDuePreview();
}

function resetCorrectionForm(){
  document.getElementById("correctionForm").reset();
  selectedCorrectionPhotoData="";
  correctionTarget=null;
  const img=document.getElementById("correctionPhotoPreview");
  img.hidden=true;img.removeAttribute("src");
}

function openCorrection(issue){
  correctionTarget=issue;
  document.getElementById("correctionRecordLabel").textContent=issue.recordId;
  document.getElementById("correctionIssueSummary").innerHTML=contractorIssueSummaryHtml(issue);
  document.getElementById("correctionForm").reset();
  selectedCorrectionPhotoData="";
  const img=document.getElementById("correctionPhotoPreview");
  img.hidden=true;img.removeAttribute("src");
  showView("correctionView");
}

function contractorIssueSummaryHtml(x){
  return `<h3>${escapeHtml(x.block)} / ${escapeHtml(x.floor)} / ${escapeHtml(x.location)}</h3>
    <p><b>Hata:</b> ${escapeHtml(x.issueType)}</p>
    <p><b>Açıklama:</b> ${escapeHtml(x.note)}</p>
    <p><b>Öncelik:</b> ${escapeHtml(x.priority)}</p>
    <p><b>Termin:</b> ${formatDate(x.dueDate)}</p>
    ${x.initialPhotoUrl?`<img src="${escapeAttr(x.initialPhotoUrl)}" alt="İlk hata fotoğrafı"><a class="photo-link" href="${escapeAttr(x.initialPhotoUrl)}" target="_blank" rel="noopener">Fotoğrafı aç</a>`:""}`;
}

function loadSettings(){
  document.getElementById("deviceName").value=localStorage.getItem("deviceName")||"";
  document.getElementById("apiUrl").value=localStorage.getItem("apiUrl")||DEFAULT_API_URL;
}

function normalizeApiUrl(v){return String(v||"").trim().replace(/[?#].*$/,"");}
function apiUrl(){return normalizeApiUrl(localStorage.getItem("apiUrl")||DEFAULT_API_URL);}

async function testApi(){
  const out=document.getElementById("apiTestResult");
  const url=normalizeApiUrl(document.getElementById("apiUrl").value);
  if(!url){out.textContent="Bulut bağlantısı boş.";return;}
  out.textContent="Bağlantı test ediliyor…";
  try{
    const res=await fetch(url+"?action=health&ts="+Date.now(),{cache:"no-store"});
    const data=await res.json();
    out.textContent=data.ok?`✅ Bulut bağlantısı çalışıyor. Backend ${data.version||""}`:"❌ Sunucu cevap verdi ama hata var.";
  }catch(_){out.textContent="❌ Bağlantı kurulamadı. URL ve yayın yetkisini kontrol et.";}
}

async function refreshRemoteConfig(showResult=false){
  const url=apiUrl();if(!url)return;
  try{
    const res=await fetch(url+"?action=config&ts="+Date.now(),{cache:"no-store"});
    const data=await res.json();
    if(!data.ok||!data.config)throw new Error(data.error||"config");
    currentConfig=sanitizeConfig(data.config);
    localStorage.setItem("cachedConfig",JSON.stringify(currentConfig));
    renderSelects();
    if(showResult)showToast("Listeler güncellendi.");
  }catch(_){
    if(showResult)showToast("Listeler güncellenemedi; telefondaki son liste kullanılıyor.");
  }
}

function loadCachedConfig(){
  try{return sanitizeConfig(JSON.parse(localStorage.getItem("cachedConfig")||"null")||DEFAULTS);}
  catch(_){return DEFAULTS;}
}

function sanitizeConfig(c){
  const clean=k=>Array.from(new Set((Array.isArray(c[k])?c[k]:DEFAULTS[k]).map(x=>String(x??"").trim()).filter(Boolean)));
  return {
    blocks:clean("blocks"),
    floors:clean("floors"),
    issues:clean("issues"),
    priorities:clean("priorities"),
    contractors:clean("contractors"),
    foremen:clean("foremen"),
    terms:clean("terms")
  };
}

function updateConnectionStatus(){
  const el=document.getElementById("connectionStatus");
  if(navigator.onLine){el.textContent="● İnternet var";el.className="status online";}
  else{el.textContent="● İnternet yok — kayıtlar telefonda";el.className="status offline";}
}

function showToast(text){
  const t=document.getElementById("toast");
  t.textContent=text;t.hidden=false;
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>t.hidden=true,3600);
}

/* ---------- IndexedDB ---------- */
function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const d=req.result;
      if(!d.objectStoreNames.contains(ISSUE_STORE))d.createObjectStore(ISSUE_STORE,{keyPath:"localId"});
      if(!d.objectStoreNames.contains(CORRECTION_STORE))d.createObjectStore(CORRECTION_STORE,{keyPath:"localId"});
    };
    req.onsuccess=()=>{db=req.result;resolve();};
    req.onerror=()=>reject(req.error);
  });
}

function putRecord(store,obj){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readwrite");
    tx.objectStore(store).put(obj);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}

function deleteRecord(store,id){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}

function getAll(store){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readonly");
    const req=tx.objectStore(store).getAll();
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function getPendingCorrectionForRecord(recordId){
  const all=await getAll(CORRECTION_STORE);
  return all.find(x=>x.recordId===recordId&&x.syncStatus!=="synced")||null;
}

async function refreshCounts(){
  const [issues,corrections]=await Promise.all([getAll(ISSUE_STORE),getAll(CORRECTION_STORE)]);
  const n=issues.filter(x=>x.syncStatus!=="synced").length+corrections.filter(x=>x.syncStatus!=="synced").length;
  document.getElementById("pendingBadge").textContent=n;
}

async function renderLists(){
  const [issues,corrections]=await Promise.all([getAll(ISSUE_STORE),getAll(CORRECTION_STORE)]);
  const all=[
    ...issues.map(x=>({...x,_type:"issue"})),
    ...corrections.map(x=>({...x,_type:"correction"}))
  ].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));

  const pending=all.filter(x=>x.syncStatus!=="synced");
  renderLocalCards("pendingList",pending);
  renderLocalCards("recordsList",all);
}

function renderLocalCards(id,items){
  const el=document.getElementById(id);
  if(!items.length){el.innerHTML='<div class="card empty-card"><p>Kayıt yok.</p></div>';return;}
  el.innerHTML=items.map(x=>{
    if(x._type==="correction"){
      return `<div class="card">
        <span class="tag waiting">DÜZELTME</span>
        <h3>${escapeHtml(x.recordId)}</h3>
        <p><b>Firma:</b> ${escapeHtml(x.contractor)}</p>
        <p><b>Açıklama:</b> ${escapeHtml(x.note)}</p>
        <p><b>Tarih:</b> ${formatDateTime(x.createdAt)}</p>
        ${x.lastError?`<p><b>Son hata:</b> ${escapeHtml(x.lastError)}</p>`:""}
        <span class="tag ${x.syncStatus==="synced"?"synced":"pending"}">${x.syncStatus==="synced"?"Gönderildi":"Gönderilmeyi bekliyor"}</span>
        ${x.photoData?`<img src="${x.photoData}" alt="Düzeltme fotoğrafı">`:""}
      </div>`;
    }
    return `<div class="card">
      <span class="tag normal">HATA BİLDİRİMİ</span>
      <h3>${escapeHtml(x.block)} / ${escapeHtml(x.floor)} / ${escapeHtml(x.location)}</h3>
      <p><b>Hata:</b> ${escapeHtml(x.issueType)}</p>
      <p><b>Öncelik:</b> ${escapeHtml(x.priority||"Normal")}</p>
      <p><b>Taşeron:</b> ${escapeHtml(x.contractor)}</p>
      <p><b>Formen:</b> ${escapeHtml(x.foreman)}</p>
      <p><b>Termin:</b> ${Number(x.termDays||0)} gün</p>
      <p><b>Açıklama:</b> ${escapeHtml(x.note||"")}</p>
      <p><b>Tarih:</b> ${formatDateTime(x.createdAt)}</p>
      ${x.cloudId?`<p><b>Kayıt No:</b> ${escapeHtml(x.cloudId)}</p>`:""}
      ${x.lastError?`<p><b>Son hata:</b> ${escapeHtml(x.lastError)}</p>`:""}
      <span class="tag ${x.syncStatus==="synced"?"synced":"pending"}">${x.syncStatus==="synced"?"Gönderildi":"Gönderilmeyi bekliyor"}</span>
      ${x.photoData?`<img src="${x.photoData}" alt="Hata fotoğrafı">`:""}
    </div>`;
  }).join("");
}

/* ---------- Sync ---------- */
async function syncAllPending(){
  if(syncRunning)return;
  if(!navigator.onLine)return showToast("İnternet yok. Kayıtlar telefonda güvende.");
  const url=apiUrl();
  if(!url)return showToast("Bulut bağlantısı tanımlı değil.");

  syncRunning=true;
  try{
    const issueResult=await syncPendingIssues(url);
    const correctionResult=await syncPendingCorrections(url);
    await refreshCounts();
    await renderLists();
    const total=issueResult.total+correctionResult.total;
    const ok=issueResult.ok+correctionResult.ok;
    if(total===0)showToast("Gönderilecek kayıt yok.");
    else showToast(`${ok}/${total} kayıt gönderildi.`);
    if(correctionResult.ok>0&&loadContractorSession())await refreshContractorIssues(false).catch(()=>{});
  }finally{syncRunning=false;}
}

async function syncPendingIssues(url){
  const all=await getAll(ISSUE_STORE);
  const pending=all.filter(x=>x.syncStatus!=="synced");
  let ok=0;
  for(const issue of pending){
    try{
      const data=await apiPost(url,{action:"createIssue",issue});
      if(!data.ok)throw new Error(data.error||"Sunucu hatası");
      issue.syncStatus="synced";
      issue.cloudId=data.recordId||issue.cloudId||"";
      issue.lastError="";
      await putRecord(ISSUE_STORE,issue);
      ok++;
    }catch(err){
      issue.lastError=String(err.message||err);
      await putRecord(ISSUE_STORE,issue);
    }
  }
  return {ok,total:pending.length};
}

async function syncPendingCorrections(url){
  const all=await getAll(CORRECTION_STORE);
  const pending=all.filter(x=>x.syncStatus!=="synced");
  let ok=0;
  for(const correction of pending){
    try{
      const data=await apiPost(url,{
        action:"submitCorrection",
        contractor:correction.contractor,
        token:correction.token,
        correction
      });
      if(!data.ok)throw new Error(data.error||"Sunucu hatası");
      correction.syncStatus="synced";
      correction.lastError="";
      await putRecord(CORRECTION_STORE,correction);
      updateCachedIssueStatus(correction.recordId,"Kontrol Bekliyor");
      ok++;
    }catch(err){
      correction.lastError=String(err.message||err);
      await putRecord(CORRECTION_STORE,correction);
    }
  }
  return {ok,total:pending.length};
}

async function apiPost(url,payload){
  const res=await fetch(url,{
    method:"POST",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(payload)
  });
  return await res.json();
}

/* ---------- Contractor auth/panel ---------- */
function saveContractorSession(session,remember){
  localStorage.removeItem("contractorSession");
  sessionStorage.removeItem("contractorSession");
  (remember?localStorage:sessionStorage).setItem("contractorSession",JSON.stringify(session));
}

function loadContractorSession(){
  try{
    const raw=localStorage.getItem("contractorSession")||sessionStorage.getItem("contractorSession");
    return raw?JSON.parse(raw):null;
  }catch(_){return null;}
}

function clearContractorSession(){
  localStorage.removeItem("contractorSession");
  sessionStorage.removeItem("contractorSession");
}

function updateContractorHome(){
  const s=loadContractorSession();
  document.getElementById("contractorHomeText").textContent=s?`${s.contractor} • İŞLERİM`:"TAŞERON GİRİŞİ";
}

async function openContractorArea(){
  if(navigator.onLine)await refreshRemoteConfig(false).catch(()=>{});
  const s=loadContractorSession();
  if(!s){
    showView("contractorLoginView");
    return;
  }
  document.getElementById("contractorPanelTitle").textContent=s.contractor;
  showView("contractorPanelView");
  await renderContractorIssues(getCachedContractorIssues(),"Telefondaki son liste");
  if(navigator.onLine)refreshContractorIssues(false);
}

async function contractorLogin(){
  const contractor=document.getElementById("contractorLoginSelect").value;
  const pin=document.getElementById("contractorPin").value.trim();
  const out=document.getElementById("contractorLoginResult");
  const url=apiUrl();

  if(!contractor)return showToast("Firma seç.");
  if(!/^\d{4}$/.test(pin))return showToast("PIN 4 haneli olmalı.");
  if(!url)return showToast("Bulut bağlantısı tanımlı değil.");
  if(!navigator.onLine)return showToast("İlk giriş için internet gerekli.");

  out.textContent="Giriş kontrol ediliyor…";
  try{
    const data=await apiPost(url,{action:"contractorLogin",contractor,pin});
    if(!data.ok)throw new Error(data.error||"Giriş başarısız");
    const session={contractor:data.contractor,token:data.token,loginAt:new Date().toISOString()};
    saveContractorSession(session,document.getElementById("rememberContractor").checked);
    await updatePendingCorrectionTokens(session.contractor,session.token);
    document.getElementById("contractorPin").value="";
    out.textContent="✅ Giriş başarılı.";
    updateContractorHome();
    document.getElementById("contractorPanelTitle").textContent=session.contractor;
    showView("contractorPanelView");
    await refreshContractorIssues(true);
  }catch(err){
    out.textContent="❌ "+String(err.message||err);
  }
}

function contractorLogout(){
  clearContractorSession();
  updateContractorHome();
  document.getElementById("contractorPin").value="";
  showView("homeView");
  showToast("Taşeron oturumu kapatıldı.");
}

async function refreshContractorIssues(showMessage=true){
  const session=loadContractorSession();
  if(!session)return;
  const url=apiUrl();
  if(!url)return;
  if(!navigator.onLine){
    renderContractorIssues(getCachedContractorIssues(),"İnternet yok — son kayıtlar");
    if(showMessage)showToast("İnternet yok. Son liste gösteriliyor.");
    return;
  }

  document.getElementById("contractorPanelStatus").textContent="İşler yenileniyor…";
  try{
    const data=await apiPost(url,{action:"contractorIssues",contractor:session.contractor,token:session.token});
    if(!data.ok)throw new Error(data.error||"İşler alınamadı");
    saveCachedContractorIssues(data.issues||[]);
    await renderContractorIssues(data.issues||[],`Son güncelleme: ${new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}`);
    if(showMessage)showToast("Taşeron işleri güncellendi.");
  }catch(err){
    const msg=String(err.message||err);
    if(msg.toLowerCase().includes("oturum")||msg.toLowerCase().includes("yetki")){
      clearContractorSession();updateContractorHome();showView("contractorLoginView");
      document.getElementById("contractorLoginResult").textContent="Oturum geçersiz. PIN ile tekrar giriş yap.";
    }else{
      renderContractorIssues(getCachedContractorIssues(),"Bağlantı kurulamadı — son liste");
      if(showMessage)showToast("İşler yenilenemedi.");
    }
  }
}

function contractorCacheKey(){
  const s=loadContractorSession();
  return s?`contractorIssues:${s.contractor}`:"contractorIssues:none";
}

function saveCachedContractorIssues(issues){
  localStorage.setItem(contractorCacheKey(),JSON.stringify(issues||[]));
}

function getCachedContractorIssues(){
  try{return JSON.parse(localStorage.getItem(contractorCacheKey())||"[]");}
  catch(_){return [];}
}

function updateCachedIssueStatus(recordId,status){
  const issues=getCachedContractorIssues();
  const x=issues.find(i=>i.recordId===recordId);
  if(x){
    x.status=status;
    x.localCorrectionPending=false;
    saveCachedContractorIssues(issues);
  }
}

function markCachedIssuePending(recordId){
  const issues=getCachedContractorIssues();
  const x=issues.find(i=>i.recordId===recordId);
  if(x){x.localCorrectionPending=true;saveCachedContractorIssues(issues);}
}

async function renderContractorIssues(issues,statusText){
  const list=document.getElementById("contractorIssueList");
  document.getElementById("contractorPanelStatus").textContent=statusText||"";
  const pendingCorrections=await getAll(CORRECTION_STORE);
  const pendingSet=new Set(pendingCorrections.filter(x=>x.syncStatus!=="synced").map(x=>x.recordId));

  const open=(issues||[]).length;
  const overdue=(issues||[]).filter(x=>Number(x.overdueDays)>0&&x.status!=="Kontrol Bekliyor").length;
  const waiting=(issues||[]).filter(x=>x.status==="Kontrol Bekliyor").length;
  document.getElementById("contractorOpenCount").textContent=open;
  document.getElementById("contractorOverdueCount").textContent=overdue;
  document.getElementById("contractorWaitingCount").textContent=waiting;

  if(!open){
    list.innerHTML='<div class="card empty-card"><p>Bu firmaya atanmış açık iş yok.</p></div>';
    return;
  }

  list.innerHTML=(issues||[]).map(x=>{
    const waitingStatus=x.status==="Kontrol Bekliyor";
    const rejected=String(x.status||"").includes("Tekrar");
    const queued=pendingSet.has(x.recordId)||x.localCorrectionPending;
    const canCorrect=!waitingStatus&&!queued;
    return `<div class="card">
      <div>
        ${priorityTag(x.priority)}
        ${Number(x.overdueDays)>0&&!waitingStatus?`<span class="tag overdue">${x.overdueDays} GÜN GECİKMİŞ</span>`:""}
        ${waitingStatus?'<span class="tag waiting">KONTROL BEKLİYOR</span>':""}
        ${rejected?'<span class="tag rejected">TEKRAR DÜZELTİLECEK</span>':""}
        ${queued?'<span class="tag pending">TELEFONDA GÖNDERİM BEKLİYOR</span>':""}
      </div>
      <h3>${escapeHtml(x.block)} / ${escapeHtml(x.floor)} / ${escapeHtml(x.location)}</h3>
      <p><b>Kayıt:</b> ${escapeHtml(x.recordId)}</p>
      <p><b>Hata:</b> ${escapeHtml(x.issueType)}</p>
      <p><b>Açıklama:</b> ${escapeHtml(x.note)}</p>
      <p><b>Termin:</b> ${formatDate(x.dueDate)}</p>
      <p><b>Durum:</b> ${escapeHtml(x.status)}</p>
      ${x.correctionNote?`<p><b>Son düzeltme:</b> ${escapeHtml(x.correctionNote)}</p>`:""}
      ${x.initialPhotoUrl?`<img loading="lazy" src="${escapeAttr(x.initialPhotoUrl)}" alt="İlk hata fotoğrafı"><a class="photo-link" href="${escapeAttr(x.initialPhotoUrl)}" target="_blank" rel="noopener">İlk fotoğrafı aç</a>`:""}
      ${x.correctionPhotoUrl?`<a class="photo-link" href="${escapeAttr(x.correctionPhotoUrl)}" target="_blank" rel="noopener">Son düzeltme fotoğrafını aç</a>`:""}
      <div class="card-actions">
        <button class="card-action" data-correct-record="${escapeAttr(x.recordId)}" ${canCorrect?"":"disabled"}>
          ${waitingStatus?"MEKANİK KONTROLÜ BEKLENİYOR":queued?"GÖNDERİM BEKLİYOR":"🔧 DÜZELTME BİLDİR"}
        </button>
      </div>
    </div>`;
  }).join("");
}

function priorityTag(priority){
  const p=String(priority||"Normal");
  const c=p==="Kritik"?"critical":p==="Yüksek"?"high":p==="Düşük"?"low":"normal";
  return `<span class="tag ${c}">${escapeHtml(p.toUpperCase())}</span>`;
}

async function updatePendingCorrectionTokens(contractor,token){
  const all=await getAll(CORRECTION_STORE);
  for(const x of all){
    if(x.syncStatus!=="synced"&&x.contractor===contractor){
      x.token=token;
      await putRecord(CORRECTION_STORE,x);
    }
  }
}

/* ---------- Cleanup/export ---------- */
async function purgeSynced(){
  const [issues,corrections]=await Promise.all([getAll(ISSUE_STORE),getAll(CORRECTION_STORE)]);
  let n=0;
  for(const x of issues.filter(i=>i.syncStatus==="synced")){await deleteRecord(ISSUE_STORE,x.localId);n++;}
  for(const x of corrections.filter(i=>i.syncStatus==="synced")){await deleteRecord(CORRECTION_STORE,x.localId);n++;}
  await refreshCounts();await renderLists();
  showToast(`${n} gönderilmiş kayıt telefondan temizlendi.`);
}

async function exportCsv(){
  const [issues,corrections]=await Promise.all([getAll(ISSUE_STORE),getAll(CORRECTION_STORE)]);
  const rows=[["type","localId","createdAt","recordId","block","floor","location","issueType","priority","contractor","foreman","termDays","note","syncStatus","lastError"]];
  issues.forEach(x=>rows.push(["issue",x.localId,x.createdAt,x.cloudId||"",x.block,x.floor,x.location,x.issueType,x.priority,x.contractor,x.foreman,x.termDays,x.note,x.syncStatus,x.lastError]));
  corrections.forEach(x=>rows.push(["correction",x.localId,x.createdAt,x.recordId,"","","","","",x.contractor,"","",x.note,x.syncStatus,x.lastError]));
  const csv=rows.map(r=>r.map(csvEscape).join(",")).join("\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`akcali-mekanik-v4-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ---------- Helpers ---------- */
function makeUuid(){
  return crypto.randomUUID?crypto.randomUUID():String(Date.now())+"-"+Math.random().toString(16).slice(2);
}
function csvEscape(v){return `"${String(v??"").replaceAll('"','""')}"`;}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escapeAttr(s){return String(s??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function formatDate(v){
  if(!v)return "-";
  const d=new Date(v);
  return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString("tr-TR");
}
function formatDateTime(v){
  if(!v)return "-";
  const d=new Date(v);
  return Number.isNaN(d.getTime())?String(v):d.toLocaleString("tr-TR");
}
function compressImage(file,maxWidth,quality){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const scale=Math.min(1,maxWidth/img.width);
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.round(img.width*scale));
        canvas.height=Math.max(1,Math.round(img.height*scale));
        const ctx=canvas.getContext("2d");
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",quality));
      };
      img.onerror=reject;img.src=reader.result;
    };
    reader.onerror=reject;reader.readAsDataURL(file);
  });
}