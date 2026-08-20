const APP_VERSION="5.0.0";
const DEFAULT_API_URL="https://script.google.com/macros/s/AKfycbzYzHuDIT90xjLz8nx04ivTzd0RLBLRHinKOSXdcafEUQ076wXfnvKknY6ootx-SgaB/exec";
const DEFAULTS={
  blocks:["A Blok","B Blok","C Blok","D Blok"],
  floors:["B2","B1","Zemin","1. Kat","2. Kat","3. Kat","4. Kat","5. Kat","Çatı"],
  issues:["Ters Eğim","Eksik Kelepçe","Yanlış Güzergâh","İzolasyon Eksik","Montaj Hatası","Kaçak","Diğer"],
  priorities:["Kritik","Yüksek","Normal","Düşük"],
  contractors:["Taşeron 1","Taşeron 2","Taşeron 3"],
  foremen:["Formen 1","Formen 2","Formen 3"],
  terms:["1","2","3","5","7"],
  officeUsers:[]
};

const DB_NAME="akcali-mekanik-db";
const DB_VERSION=3;
const ISSUE_STORE="issues";
const CORRECTION_STORE="corrections";

let db=null;
let currentConfig=loadCachedConfig();
let selectedPhotoData="";
let selectedCorrectionPhotoData="";
let correctionTarget=null;
let syncRunning=false;
let swRegistration=null;
let dbReadyPromise=null;
let issueSaveRunning=false;
let correctionSaveRunning=false;
let contractorLoginRunning=false;
let officeLoginRunning=false;
let officeRefreshRunning=false;
let officeDecisionRunning=false;
let officeCurrentFilter="all";
let officeCurrentIssue=null;
let photoProcessing=false;
let correctionPhotoProcessing=false;
const securePhotoCache=new Map();
const SECURE_PHOTO_CACHE_LIMIT=12;


document.addEventListener("DOMContentLoaded",async()=>{
  document.getElementById("versionLabel").textContent="v5.0";

  // Arayüz dinleyicilerini önce bağla: kullanıcı dokununca ağ/DB beklemeden ekran tepki versin.
  bindNavigation();
  bindForm();
  bindCorrectionForm();
  bindButtons();
  bindKeyboardDismiss();
  bindMobileScrollSafety();
  loadSettings();
  renderSelects();
  updateConnectionStatus();
  showInstallHint();
  updateContractorHome();
  updateOfficeHome();
  registerServiceWorker();

  dbReadyPromise=openDb();
  try{
    await dbReadyPromise;
    await requestPersistentStorage();
    await refreshCounts();
  }catch(err){
    console.error("Yerel veritabanı açılamadı:",err);
    showToast("Telefon kayıt alanı açılamadı.");
  }

  if(navigator.onLine){
    refreshRemoteConfig().catch(()=>{});
    syncAllPending().catch(()=>{});
  }

  window.addEventListener("online",async()=>{
    updateConnectionStatus();
    showToast("İnternet geldi. Bekleyen kayıtlar gönderiliyor.");
    refreshRemoteConfig().catch(()=>{});
    await syncAllPending();
    if(loadContractorSession())refreshContractorIssues(false).catch(()=>{});
    if(loadOfficeSession())refreshOfficeDashboard(false).catch(()=>{});
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
          if(el.id==="officePin")officeLogin();
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


function bindMobileScrollSafety(){
  const fields=document.querySelectorAll("#newView input,#newView select,#newView textarea,#correctionView input,#correctionView select,#correctionView textarea,#officeLoginView input,#officeLoginView select,#officeDetailView input,#officeDetailView select,#officeDetailView textarea");

  fields.forEach(el=>{
    el.addEventListener("focus",()=>{
      setTimeout(()=>{
        try{
          const r=el.getBoundingClientRect();
          const vh=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;
          if(r.bottom>vh-24 || r.top<70){
            el.scrollIntoView({block:"center",inline:"nearest",behavior:"auto"});
          }
        }catch(_){}
      },180);
    });
  });

  if(window.visualViewport){
    let lastHeight=window.visualViewport.height;
    window.visualViewport.addEventListener("resize",()=>{
      const h=window.visualViewport.height;
      if(h>lastHeight+80){
        requestAnimationFrame(()=>{
          document.documentElement.style.overflowY="auto";
          document.body.style.overflowY="auto";
        });
      }
      lastHeight=h;
    });
  }
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
  window.scrollTo(0,0);
}

function setButtonBusy(btn,busy,busyText){
  if(!btn)return;
  if(busy){
    if(!btn.dataset.originalHtml)btn.dataset.originalHtml=btn.innerHTML;
    btn.disabled=true;
    btn.classList.add("busy-label");
    if(busyText)btn.textContent=busyText;
  }else{
    btn.disabled=false;
    btn.classList.remove("busy-label");
    if(btn.dataset.originalHtml){
      btn.innerHTML=btn.dataset.originalHtml;
      delete btn.dataset.originalHtml;
    }
  }
}

function setProcessStatus(id,text,state=""){
  const el=document.getElementById(id);
  if(!el)return;
  el.textContent=text||"";
  el.className="process-status"+(state?" "+state:"");
}

function bindButtons(){
  document.getElementById("syncBtn").onclick=syncAllPending;
  document.getElementById("pendingSyncBtn").onclick=syncAllPending;
  document.getElementById("contractorHomeBtn").onclick=openContractorArea;
  document.getElementById("officeHomeBtn").onclick=openOfficeArea;
  document.getElementById("officeLoginBtn").onclick=officeLogin;
  document.getElementById("officeLogoutBtn").onclick=officeLogout;
  document.getElementById("refreshOfficeBtn").onclick=()=>refreshOfficeDashboard(true);
  document.getElementById("officeDetailBackBtn").onclick=()=>showView("officePanelView");
  document.getElementById("officeDecisionTerm").addEventListener("change",updateOfficeDuePreview);
  document.getElementById("officeCloseBtn").onclick=()=>officeDecision("close");
  document.getElementById("officeRejectBtn").onclick=()=>officeDecision("reject");
  document.getElementById("officeNewDueBtn").onclick=()=>officeDecision("newDue");

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

  document.getElementById("officeIssueList").addEventListener("click",e=>{
    const btn=e.target.closest("[data-office-record]");
    if(!btn)return;
    const issue=getCachedOfficeIssues().find(x=>x.recordId===btn.dataset.officeRecord);
    if(!issue)return showToast("Kayıt bulunamadı. Dashboard'u yenile.");
    openOfficeDetail(issue);
  });

  document.querySelectorAll("[data-office-filter]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      officeCurrentFilter=btn.dataset.officeFilter||"all";
      document.querySelectorAll("#officeFilterBar [data-office-filter]").forEach(x=>x.classList.toggle("active",x.dataset.officeFilter===officeCurrentFilter));
      renderOfficeIssues(getCachedOfficeIssues());
      const list=document.getElementById("officeIssueList");
      if(list)list.scrollIntoView({block:"start",behavior:"auto"});
    });
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
  fillSelect("officeLoginSelect",currentConfig.officeUsers||[],"Kullanıcı seç");
  fillTermSelect();
  fillOfficeDecisionTerm();
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


function fillOfficeDecisionTerm(){
  const s=document.getElementById("officeDecisionTerm");
  if(!s)return;
  const old=s.value;
  const nums=Array.from(new Set((currentConfig.terms||[]).map(parseTermDays).filter(n=>Number.isFinite(n)&&n>=0)));
  s.innerHTML='<option value="">Termin seç</option>'+
    nums.map(n=>`<option value="${n}">${n===0?"Aynı Gün":n+" Gün"}</option>`).join("");
  if(old&&nums.includes(Number(old)))s.value=old;
}

function updateOfficeDuePreview(){
  const s=document.getElementById("officeDecisionTerm");
  const el=document.getElementById("officeDecisionDuePreview");
  if(!s||!el)return;
  if(s.value===""){el.textContent="Red / yeni termin işleminde kullanılır.";return;}
  const d=new Date();
  d.setDate(d.getDate()+Number(s.value));
  el.textContent=`Yeni termin: ${d.toLocaleDateString("tr-TR")}`;
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
    photoProcessing=true;
    selectedPhotoData="";
    setProcessStatus("photoProcessStatus","Fotoğraf hazırlanıyor…");
    try{
      selectedPhotoData=await compressImage(f,1280,.68);
      const img=document.getElementById("photoPreview");
      img.src=selectedPhotoData;img.hidden=false;
      setProcessStatus("photoProcessStatus","✓ Fotoğraf hazır","ok");
    }catch(_){
      setProcessStatus("photoProcessStatus","Fotoğraf işlenemedi.","error");
      showToast("Fotoğraf işlenemedi. Tekrar seç.");
    }finally{
      photoProcessing=false;
    }
  });

  document.getElementById("issueForm").addEventListener("submit",async e=>{
    e.preventDefault();
    if(issueSaveRunning)return;
    if(photoProcessing)return showToast("Fotoğraf hazırlanıyor. Birkaç saniye bekle.");
    issueSaveRunning=true;
    const submitBtn=e.submitter||document.querySelector("#issueForm .save-btn");
    setButtonBusy(submitBtn,true,"KAYDEDİLİYOR…");
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

    if(!issue.block){setButtonBusy(submitBtn,false);issueSaveRunning=false;return showToast("Blok seç.");}
    if(!issue.floor){setButtonBusy(submitBtn,false);issueSaveRunning=false;return showToast("Kat seç.");}
    if(!issue.location){setButtonBusy(submitBtn,false);issueSaveRunning=false;return showToast("Mahal / daire yaz.");}
    if(!issue.issueType){setButtonBusy(submitBtn,false);issueSaveRunning=false;return showToast("Hata türü seç.");}
    if(!issue.priority){setButtonBusy(submitBtn,false);issueSaveRunning=false;return showToast("Öncelik seç.");}
    if(!issue.contractor){setButtonBusy(submitBtn,false);issueSaveRunning=false;return showToast("Taşeron seç.");}
    if(!issue.foreman){setButtonBusy(submitBtn,false);issueSaveRunning=false;return showToast("Formen seç.");}
    if(!issue.note){setButtonBusy(submitBtn,false);issueSaveRunning=false;return showToast("Kısa açıklama yaz.");}
    if(issue.termDays===null||!Number.isFinite(issue.termDays)){setButtonBusy(submitBtn,false);issueSaveRunning=false;return showToast("Termin süresi seç.");}
    if(!selectedPhotoData){setButtonBusy(submitBtn,false);issueSaveRunning=false;return showToast("Hata fotoğrafı ekle.");}

    try{
      await putRecord(ISSUE_STORE,issue);
      resetIssueForm();
      await refreshCounts();
      showView("homeView");
      showToast("✅ Hata telefona kaydedildi.");
      if(navigator.onLine)syncAllPending();
    }catch(_){
      showToast("Kayıt telefona yazılamadı. Tekrar dene.");
    }finally{
      setButtonBusy(submitBtn,false);
      issueSaveRunning=false;
    }
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
    correctionPhotoProcessing=true;
    selectedCorrectionPhotoData="";
    setProcessStatus("correctionPhotoProcessStatus","Fotoğraf hazırlanıyor…");
    try{
      selectedCorrectionPhotoData=await compressImage(f,1280,.68);
      const img=document.getElementById("correctionPhotoPreview");
      img.src=selectedCorrectionPhotoData;img.hidden=false;
      setProcessStatus("correctionPhotoProcessStatus","✓ Fotoğraf hazır","ok");
    }catch(_){
      setProcessStatus("correctionPhotoProcessStatus","Fotoğraf işlenemedi.","error");
      showToast("Düzeltme fotoğrafı işlenemedi.");
    }finally{
      correctionPhotoProcessing=false;
    }
  });

  document.getElementById("correctionForm").addEventListener("submit",async e=>{
    e.preventDefault();
    if(correctionSaveRunning)return;
    if(correctionPhotoProcessing)return showToast("Fotoğraf hazırlanıyor. Birkaç saniye bekle.");
    if(!correctionTarget)return showToast("Düzeltilecek kayıt seçili değil.");
    const session=loadContractorSession();
    if(!session)return showToast("Taşeron oturumu bulunamadı.");

    const note=document.getElementById("correctionNote").value.trim();
    if(!note)return showToast("Düzeltme açıklaması yaz.");
    if(!selectedCorrectionPhotoData)return showToast("Düzeltme fotoğrafı ekle.");

    correctionSaveRunning=true;
    const submitBtn=e.submitter||document.querySelector("#correctionForm .success-action");
    setButtonBusy(submitBtn,true,"KAYDEDİLİYOR…");

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
      renderContractorIssues(getCachedContractorIssues(),navigator.onLine?"Önceki liste gösteriliyor.":"Offline liste").catch(()=>{});
      showToast("✅ Düzeltme kaydedildi.");
      if(navigator.onLine)syncAllPending();
    }catch(_){
      showToast("Düzeltme telefona kaydedilemedi.");
    }finally{
      setButtonBusy(submitBtn,false);
      correctionSaveRunning=false;
    }
  });
}

function resetIssueForm(){
  document.getElementById("issueForm").reset();
  selectedPhotoData="";
  const img=document.getElementById("photoPreview");
  img.hidden=true;img.removeAttribute("src");
  setProcessStatus("photoProcessStatus","");
  updateDuePreview();
}

function resetCorrectionForm(){
  document.getElementById("correctionForm").reset();
  selectedCorrectionPhotoData="";
  correctionTarget=null;
  const img=document.getElementById("correctionPhotoPreview");
  img.hidden=true;img.removeAttribute("src");
  setProcessStatus("correctionPhotoProcessStatus","");
}

function openCorrection(issue){
  correctionTarget=issue;
  document.getElementById("correctionRecordLabel").textContent=issue.recordId;
  document.getElementById("correctionIssueSummary").innerHTML=contractorIssueSummaryHtml(issue);
  hydrateSecurePhotos(document.getElementById("correctionIssueSummary"));
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
    ${x.hasInitialPhoto?securePhotoHtml(x.recordId,"initial","İlk hata fotoğrafı"):""}`;
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
    const data=await apiJsonp(url,{action:"health"},12000);
    out.textContent=data.ok?`✅ Bulut bağlantısı çalışıyor. Backend ${data.version||""}`:"❌ Sunucu cevap verdi ama hata var.";
  }catch(_){
    out.textContent="❌ Bağlantı kurulamadı. URL ve yayın yetkisini kontrol et.";
  }
}

async function refreshRemoteConfig(showResult=false){
  const url=apiUrl();if(!url)return;
  try{
    const data=await apiJsonp(url,{action:"config"},12000);
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
    terms:clean("terms"),
    officeUsers:clean("officeUsers")
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
  if(db)return Promise.resolve(db);
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const d=req.result;
      const tx=req.transaction;

      const issueStore=d.objectStoreNames.contains(ISSUE_STORE)
        ?tx.objectStore(ISSUE_STORE)
        :d.createObjectStore(ISSUE_STORE,{keyPath:"localId"});
      if(!issueStore.indexNames.contains("syncStatus"))issueStore.createIndex("syncStatus","syncStatus",{unique:false});

      const correctionStore=d.objectStoreNames.contains(CORRECTION_STORE)
        ?tx.objectStore(CORRECTION_STORE)
        :d.createObjectStore(CORRECTION_STORE,{keyPath:"localId"});
      if(!correctionStore.indexNames.contains("syncStatus"))correctionStore.createIndex("syncStatus","syncStatus",{unique:false});
      if(!correctionStore.indexNames.contains("recordId"))correctionStore.createIndex("recordId","recordId",{unique:false});
    };
    req.onsuccess=()=>{db=req.result;resolve(db);};
    req.onerror=()=>reject(req.error);
  });
}

async function ensureDbReady(){
  if(db)return db;
  if(!dbReadyPromise)dbReadyPromise=openDb();
  return await dbReadyPromise;
}

async function putRecord(store,obj){
  await ensureDbReady();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readwrite");
    tx.objectStore(store).put(obj);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}

async function deleteRecord(store,id){
  await ensureDbReady();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}

async function getRecord(store,id){
  await ensureDbReady();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readonly");
    const req=tx.objectStore(store).get(id);
    req.onsuccess=()=>resolve(req.result||null);
    req.onerror=()=>reject(req.error);
  });
}

async function getAll(store){
  await ensureDbReady();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readonly");
    const req=tx.objectStore(store).getAll();
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function countByIndex(store,indexName,key){
  await ensureDbReady();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readonly");
    const index=tx.objectStore(store).index(indexName);
    const req=index.count(IDBKeyRange.only(key));
    req.onsuccess=()=>resolve(req.result||0);
    req.onerror=()=>reject(req.error);
  });
}

async function getAllByIndex(store,indexName,key){
  await ensureDbReady();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,"readonly");
    const index=tx.objectStore(store).index(indexName);
    const req=index.getAll(IDBKeyRange.only(key));
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });
}

function isViewActive(id){
  const el=document.getElementById(id);
  return Boolean(el&&el.classList.contains("active"));
}

async function getPendingCorrectionForRecord(recordId){
  await ensureDbReady();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(CORRECTION_STORE,"readonly");
    const index=tx.objectStore(CORRECTION_STORE).index("recordId");
    const req=index.getAll(IDBKeyRange.only(recordId));
    req.onsuccess=()=>resolve((req.result||[]).find(x=>x.syncStatus!=="synced")||null);
    req.onerror=()=>reject(req.error);
  });
}

async function refreshCounts(){
  try{
    const [issues,corrections]=await Promise.all([
      countByIndex(ISSUE_STORE,"syncStatus","pending"),
      countByIndex(CORRECTION_STORE,"syncStatus","pending")
    ]);
    document.getElementById("pendingBadge").textContent=issues+corrections;
  }catch(_){
    const [issues,corrections]=await Promise.all([getAll(ISSUE_STORE),getAll(CORRECTION_STORE)]);
    const n=issues.filter(x=>x.syncStatus!=="synced").length+corrections.filter(x=>x.syncStatus!=="synced").length;
    document.getElementById("pendingBadge").textContent=n;
  }
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
        ${x.syncStatus!=="synced"?'<div class="sync-note">Gönderimi iptal edersen bu telefondaki bekleyen düzeltme bir daha gönderilmez.</div>':""}
        ${x.syncStatus!=="synced"?`<button type="button" class="cancel-send-btn" data-cancel-send="1" data-kind="correction" data-local-id="${escapeAttr(x.localId)}">GÖNDERİMİ İPTAL ET</button>`:""}
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
      ${x.syncStatus!=="synced"?'<div class="sync-note">Gönderimi iptal edersen bu telefondaki bekleyen hata bildirimi bir daha gönderilmez.</div>':""}
      ${x.syncStatus!=="synced"?`<button type="button" class="cancel-send-btn" data-cancel-send="1" data-kind="issue" data-local-id="${escapeAttr(x.localId)}">GÖNDERİMİ İPTAL ET</button>`:""}
      ${x.photoData?`<img src="${x.photoData}" alt="Hata fotoğrafı">`:""}
    </div>`;
  }).join("");

  el.querySelectorAll("[data-cancel-send]").forEach(btn=>{
    btn.addEventListener("click",()=>cancelPendingSend(btn));
  });
}


/* ---------- Reliable transport / cloud confirmation ---------- */
function sleepMs(ms){return new Promise(resolve=>setTimeout(resolve,ms));}

function isTransportError(err){
  const msg=String((err&&err.message)||err||"").toLowerCase();
  return [
    "load failed",
    "failed to fetch",
    "networkerror",
    "network request failed",
    "cevabı gecikti",
    "zaman aşım",
    "fetch"
  ].some(x=>msg.includes(x));
}

function apiJsonp(url,params={},timeoutMs=12000){
  return new Promise((resolve,reject)=>{
    const callback="__akcaliCb_"+Date.now()+"_"+Math.random().toString(36).slice(2);
    const script=document.createElement("script");
    let done=false;
    let timer=null;

    const cleanup=()=>{
      if(done)return;
      done=true;
      if(timer)clearTimeout(timer);
      try{delete window[callback];}catch(_){window[callback]=undefined;}
      script.remove();
    };

    window[callback]=(data)=>{
      cleanup();
      resolve(data);
    };

    const qs=new URLSearchParams({...params,callback,_ts:String(Date.now())});
    script.src=url+(url.includes("?")?"&":"?")+qs.toString();
    script.async=true;
    script.onerror=()=>{
      cleanup();
      reject(new Error("Sunucu doğrulama bağlantısı kurulamadı."));
    };

    timer=setTimeout(()=>{
      cleanup();
      reject(new Error("Sunucu doğrulaması zaman aşımına uğradı."));
    },timeoutMs);

    document.head.appendChild(script);
  });
}

async function verifyCloudRecord(url,kind,localId){
  try{
    const data=await apiJsonp(url,{action:"syncStatus",kind,localId},12000);
    if(!data||!data.ok)return {known:false,exists:false};
    return {
      known:true,
      exists:Boolean(data.exists),
      recordId:String(data.recordId||""),
      status:String(data.status||"")
    };
  }catch(_){
    return {known:false,exists:false};
  }
}

async function postNoCors(url,payload,timeoutMs=120000){
  const controller=("AbortController" in window)?new AbortController():null;
  const timer=controller?setTimeout(()=>controller.abort(),timeoutMs):null;
  try{
    await fetch(url,{
      method:"POST",
      mode:"no-cors",
      headers:{"Content-Type":"text/plain"},
      body:JSON.stringify(payload),
      signal:controller?controller.signal:undefined
    });
    return true;
  }finally{
    if(timer)clearTimeout(timer);
  }
}

async function verifyWithPolling(url,kind,localId){
  const waits=[0,700,1400,2500,4000,6500,9000];
  for(const wait of waits){
    if(wait)await sleepMs(wait);
    const status=await verifyCloudRecord(url,kind,localId);
    if(status.known&&status.exists)return status;
  }
  return {known:true,exists:false};
}

async function reliableCreateIssue(url,issue){
  let status=await verifyCloudRecord(url,"issue",issue.localId);
  if(status.known&&status.exists){
    return {ok:true,recordId:status.recordId,verified:true};
  }

  try{
    const data=await apiPost(url,{action:"createIssue",issue},120000);
    if(data&&data.ok)return data;
    throw new Error((data&&data.error)||"Sunucu hatası");
  }catch(err){
    if(!isTransportError(err))throw err;

    status=await verifyWithPolling(url,"issue",issue.localId);
    if(status.exists)return {ok:true,recordId:status.recordId,verified:true};

    await postNoCors(url,{action:"createIssue",issue},120000);
    status=await verifyWithPolling(url,"issue",issue.localId);
    if(status.exists)return {ok:true,recordId:status.recordId,verified:true};

    throw new Error("Sunucuda kayıt doğrulanamadı. Kayıt telefonda güvende; tekrar deneyebilirsin.");
  }
}

async function reliableSubmitCorrection(url,correction){
  let status=await verifyCloudRecord(url,"correction",correction.localId);
  if(status.known&&status.exists){
    return {ok:true,recordId:status.recordId||correction.recordId,status:status.status||"Kontrol Bekliyor",verified:true};
  }

  const payload={
    action:"submitCorrection",
    contractor:correction.contractor,
    token:correction.token,
    correction
  };

  try{
    const data=await apiPost(url,payload,120000);
    if(data&&data.ok)return data;
    throw new Error((data&&data.error)||"Sunucu hatası");
  }catch(err){
    if(!isTransportError(err))throw err;

    status=await verifyWithPolling(url,"correction",correction.localId);
    if(status.exists){
      return {ok:true,recordId:status.recordId||correction.recordId,status:status.status||"Kontrol Bekliyor",verified:true};
    }

    await postNoCors(url,payload,120000);
    status=await verifyWithPolling(url,"correction",correction.localId);
    if(status.exists){
      return {ok:true,recordId:status.recordId||correction.recordId,status:status.status||"Kontrol Bekliyor",verified:true};
    }

    throw new Error("Düzeltme sunucuda doğrulanamadı. Kayıt telefonda güvende.");
  }
}

async function cancelPendingSend(btn){
  if(!btn||btn.disabled)return;

  const kind=String(btn.dataset.kind||"");
  const localId=String(btn.dataset.localId||"");
  const store=kind==="correction"?CORRECTION_STORE:ISSUE_STORE;
  if(!localId)return;

  btn.disabled=true;
  const original=btn.textContent;
  btn.textContent="KONTROL EDİLİYOR…";

  try{
    const record=await getRecord(store,localId);
    if(!record){
      await renderLists();
      await refreshCounts();
      return;
    }

    if(navigator.onLine){
      const url=apiUrl();
      if(url){
        const cloud=await verifyCloudRecord(url,kind,localId);
        if(cloud.known&&cloud.exists){
          if(kind==="issue"){
            record.syncStatus="synced";
            record.cloudId=cloud.recordId||record.cloudId||"";
            record.lastError="";
            await putRecord(ISSUE_STORE,record);
          }else{
            record.syncStatus="synced";
            record.lastError="";
            await putRecord(CORRECTION_STORE,record);
            updateCachedIssueStatus(record.recordId,cloud.status||"Kontrol Bekliyor");
          }

          await refreshCounts();
          await renderLists();
          showToast("Kayıt buluta zaten ulaşmış. Telefon kuyruğu temizlendi.");
          return;
        }
      }
    }

    const what=kind==="correction"?"düzeltme bildirimi":"hata bildirimi";
    const confirmed=window.confirm(
      `${what} henüz bulutta doğrulanmadı.\n\nGönderimi iptal edersen bu telefondaki bekleyen kayıt silinecek ve daha sonra gönderilmeyecek.\n\nDevam edilsin mi?`
    );
    if(!confirmed)return;

    await deleteRecord(store,localId);
    if(kind==="correction"&&record.recordId)clearCachedIssuePending(record.recordId);

    await refreshCounts();
    await renderLists();
    showToast("Gönderim iptal edildi. Bekleyen kayıt telefondan silindi.");
  }catch(err){
    showToast("İptal işlemi yapılamadı: "+String(err.message||err));
  }finally{
    btn.disabled=false;
    btn.textContent=original;
  }
}

/* ---------- Sync ---------- */
async function syncAllPending(){
  if(syncRunning)return;
  if(!navigator.onLine)return showToast("İnternet yok. Kayıtlar telefonda güvende.");
  const url=apiUrl();
  if(!url)return showToast("Bulut bağlantısı tanımlı değil.");

  syncRunning=true;
  const syncButtons=[document.getElementById("syncBtn"),document.getElementById("pendingSyncBtn")];
  syncButtons.forEach(b=>setButtonBusy(b,true,"SENKRONİZE EDİLİYOR…"));
  showToast("Senkronizasyon başladı.");
  try{
    const issueResult=await syncPendingIssues(url);
    const correctionResult=await syncPendingCorrections(url);
    await refreshCounts();
    if(isViewActive("pendingView")||isViewActive("recordsView"))await renderLists();
    const total=issueResult.total+correctionResult.total;
    const ok=issueResult.ok+correctionResult.ok;
    if(total===0)showToast("Gönderilecek kayıt yok.");
    else showToast(`${ok}/${total} kayıt gönderildi.`);
    if(correctionResult.ok>0&&loadContractorSession())await refreshContractorIssues(false).catch(()=>{});
  }finally{
    syncRunning=false;
    syncButtons.forEach(b=>setButtonBusy(b,false));
  }
}

async function syncPendingIssues(url){
  const pending=await getAllByIndex(ISSUE_STORE,"syncStatus","pending");
  let ok=0;
  for(const issue of pending){
    try{
      const data=await reliableCreateIssue(url,issue);
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
  const pending=await getAllByIndex(CORRECTION_STORE,"syncStatus","pending");
  let ok=0;
  for(const correction of pending){
    try{
      const data=await reliableSubmitCorrection(url,correction);
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

async function apiPost(url,payload,timeoutMs=20000){
  const controller=("AbortController" in window)?new AbortController():null;
  const timer=controller?setTimeout(()=>controller.abort(),timeoutMs):null;
  try{
    const res=await fetch(url,{
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(payload),
      signal:controller?controller.signal:undefined
    });
    return await res.json();
  }catch(err){
    if(err&&err.name==="AbortError")throw new Error("Sunucu cevabı gecikti. Kayıt güvenli biçimde tekrar denenecek.");
    throw err;
  }finally{
    if(timer)clearTimeout(timer);
  }
}

/* ---------- Contractor auth/panel ---------- */

/* ---------- MECHANICAL OFFICE ---------- */
function saveOfficeSession(session,remember){
  clearOfficeSession();
  (remember?localStorage:sessionStorage).setItem("officeSession",JSON.stringify(session));
}

function loadOfficeSession(){
  try{
    const raw=localStorage.getItem("officeSession")||sessionStorage.getItem("officeSession");
    return raw?JSON.parse(raw):null;
  }catch(_){return null;}
}

function clearOfficeSession(){
  localStorage.removeItem("officeSession");
  sessionStorage.removeItem("officeSession");
}

function updateOfficeHome(){
  const s=loadOfficeSession();
  const el=document.getElementById("officeHomeText");
  if(el)el.textContent=s?`${s.officeUser} • OFİS / DASHBOARD`:"MEKANİK OFİS GİRİŞİ";
}

async function openOfficeArea(){
  const s=loadOfficeSession();
  if(!s){
    showView("officeLoginView");
    if(navigator.onLine)refreshRemoteConfig(false).catch(()=>{});
    return;
  }

  document.getElementById("officePanelTitle").textContent=s.officeUser;
  showView("officePanelView");
  renderOfficeData(getCachedOfficeData(),"Telefondaki son dashboard");
  if(navigator.onLine)refreshOfficeDashboard(false).catch(()=>{});
}

async function officeLogin(){
  if(officeLoginRunning)return;
  const officeUser=document.getElementById("officeLoginSelect").value;
  const pin=document.getElementById("officePin").value.trim();
  const out=document.getElementById("officeLoginResult");
  const url=apiUrl();

  if(!officeUser)return showToast("Mekanik ofis kullanıcısını seç.");
  if(!/^\d{4}$/.test(pin))return showToast("PIN 4 haneli olmalı.");
  if(!url)return showToast("Bulut bağlantısı tanımlı değil.");
  if(!navigator.onLine)return showToast("İlk giriş için internet gerekli.");

  officeLoginRunning=true;
  const btn=document.getElementById("officeLoginBtn");
  setButtonBusy(btn,true,"GİRİŞ KONTROL EDİLİYOR…");
  out.textContent="Giriş kontrol ediliyor…";

  try{
    const data=await apiPost(url,{action:"officeLogin",officeUser,pin},20000);
    if(!data.ok)throw new Error(data.error||"Giriş başarısız");
    const session={officeUser:data.officeUser,token:data.token,loginAt:new Date().toISOString()};
    saveOfficeSession(session,document.getElementById("rememberOffice").checked);
    document.getElementById("officePin").value="";
    out.textContent="✅ Giriş başarılı.";
    updateOfficeHome();
    document.getElementById("officePanelTitle").textContent=session.officeUser;
    showView("officePanelView");
    await refreshOfficeDashboard(true);
  }catch(err){
    out.textContent="❌ "+String(err.message||err);
  }finally{
    setButtonBusy(btn,false);
    officeLoginRunning=false;
  }
}

function officeLogout(){
  clearOfficeSession();
  updateOfficeHome();
  document.getElementById("officePin").value="";
  showView("homeView");
  showToast("Mekanik ofis oturumu kapatıldı.");
}

function officeCacheKey(){
  const s=loadOfficeSession();
  return s?`officeData:${s.officeUser}`:"officeData:none";
}

function saveCachedOfficeData(data){
  try{localStorage.setItem(officeCacheKey(),JSON.stringify(data||{dashboard:{},issues:[]}));}catch(_){}
}

function getCachedOfficeData(){
  try{return JSON.parse(localStorage.getItem(officeCacheKey())||'{"dashboard":{},"issues":[]}');}
  catch(_){return {dashboard:{},issues:[]};}
}

function getCachedOfficeIssues(){
  const data=getCachedOfficeData();
  return Array.isArray(data.issues)?data.issues:[];
}

async function refreshOfficeDashboard(showMessage=true){
  const session=loadOfficeSession();
  if(!session)return;
  if(officeRefreshRunning)return;

  const url=apiUrl();
  if(!url)return;

  if(!navigator.onLine){
    renderOfficeData(getCachedOfficeData(),"İnternet yok — son dashboard");
    if(showMessage)showToast("İnternet yok. Son dashboard gösteriliyor.");
    return;
  }

  officeRefreshRunning=true;
  document.getElementById("officePanelStatus").textContent="Dashboard yenileniyor…";
  const btn=document.getElementById("refreshOfficeBtn");
  setButtonBusy(btn,true,"Yenileniyor…");

  try{
    const data=await apiPost(url,{
      action:"officeDashboard",
      officeUser:session.officeUser,
      token:session.token
    },30000);

    if(!data.ok)throw new Error(data.error||"Dashboard alınamadı");
    const cached={dashboard:data.dashboard||{},issues:data.issues||[],generatedAt:data.generatedAt||new Date().toISOString()};
    saveCachedOfficeData(cached);
    renderOfficeData(cached,`Son güncelleme: ${new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}`);
    if(showMessage)showToast("Mekanik ofis dashboard güncellendi.");
  }catch(err){
    const msg=String(err.message||err);
    if(msg.toLowerCase().includes("oturum")||msg.toLowerCase().includes("pin")){
      clearOfficeSession();
      updateOfficeHome();
      showView("officeLoginView");
      document.getElementById("officeLoginResult").textContent="Oturum geçersiz. PIN ile tekrar giriş yap.";
    }else{
      renderOfficeData(getCachedOfficeData(),"Bağlantı kurulamadı — son dashboard");
      if(showMessage)showToast("Dashboard yenilenemedi.");
    }
  }finally{
    setButtonBusy(btn,false);
    officeRefreshRunning=false;
  }
}

function renderOfficeData(data,statusText){
  const d=(data&&data.dashboard)||{};
  document.getElementById("officePanelStatus").textContent=statusText||"";
  document.getElementById("officeOpenCount").textContent=Number(d.open||0);
  document.getElementById("officeOverdueCount").textContent=Number(d.overdue||0);
  document.getElementById("officeWaitingCount").textContent=Number(d.waiting||0);
  document.getElementById("officeCriticalCount").textContent=Number(d.critical||0);
  document.getElementById("officeClosedWeekCount").textContent=Number(d.closedThisWeek||0);
  document.getElementById("officeAvgClose").textContent=Number.isFinite(Number(d.averageCloseDays))?`${Number(d.averageCloseDays)} gün`:"—";

  renderDashboardRows("officeContractorBreakdown",d.contractorBreakdown||[],"contractor");
  renderDashboardRows("officeBlockBreakdown",d.byBlock||[],"simple");
  renderDashboardRows("officeIssueBreakdown",d.byIssue||[],"simple");
  renderOfficeIssues((data&&data.issues)||[]);
}

function renderDashboardRows(id,rows,type){
  const el=document.getElementById(id);
  if(!el)return;

  if(!rows.length){
    el.innerHTML='<div class="office-empty">Kayıt yok.</div>';
    return;
  }

  el.innerHTML=rows.map(x=>{
    if(type==="contractor"){
      return `<div class="dashboard-row">
        <div class="name">${escapeHtml(x.name)}<span class="sub">${Number(x.waiting||0)} kontrol bekliyor</span></div>
        <div class="value">${Number(x.open||0)} / <span class="${Number(x.overdue||0)>0?"text-danger":""}">${Number(x.overdue||0)}</span></div>
      </div>`;
    }
    return `<div class="dashboard-row"><div class="name">${escapeHtml(x.name)}</div><div class="value">${Number(x.count||0)}</div></div>`;
  }).join("");
}

function officeFilteredIssues(issues){
  const list=Array.isArray(issues)?issues:[];
  if(officeCurrentFilter==="waiting")return list.filter(x=>x.status==="Kontrol Bekliyor");
  if(officeCurrentFilter==="overdue")return list.filter(x=>Number(x.overdueDays)>0);
  if(officeCurrentFilter==="critical")return list.filter(x=>["Kritik","Yüksek"].includes(x.priority));
  return list;
}

function renderOfficeIssues(issues){
  const list=document.getElementById("officeIssueList");
  if(!list)return;
  const filtered=officeFilteredIssues(issues);

  if(!filtered.length){
    list.innerHTML='<div class="card office-empty">Bu filtrede açık iş yok.</div>';
    return;
  }

  list.innerHTML=filtered.map(x=>{
    const waiting=x.status==="Kontrol Bekliyor";
    const overdue=Number(x.overdueDays)>0;
    const critical=["Kritik","Yüksek"].includes(x.priority);

    return `<div class="card ${waiting?"office-card-control":""} ${overdue?"office-card-overdue":""} ${critical?"office-card-critical":""}">
      <div>
        ${priorityTag(x.priority)}
        ${overdue?`<span class="tag overdue">${Number(x.overdueDays)} GÜN GECİKMİŞ</span>`:""}
        ${waiting?'<span class="tag waiting">KONTROL BEKLİYOR</span>':""}
      </div>
      <h3>${escapeHtml(x.block)} / ${escapeHtml(x.floor)} / ${escapeHtml(x.location)}</h3>
      <p><b>${escapeHtml(x.recordId)}</b> · ${escapeHtml(x.issueType)}</p>
      <p>${escapeHtml(x.note)}</p>
      <div class="office-card-meta">
        <p><b>Taşeron:</b> ${escapeHtml(x.contractor)}</p>
        <p><b>Formen:</b> ${escapeHtml(x.foreman)}</p>
        <p><b>Termin:</b> ${formatDate(x.dueDate)}</p>
        <p><b>Durum:</b> ${escapeHtml(x.status)}</p>
      </div>
      ${x.correctionNote?`<p><b>Düzeltme:</b> ${escapeHtml(x.correctionNote)}</p>`:""}
      <button type="button" class="card-action office-open-btn" data-office-record="${escapeAttr(x.recordId)}">
        ${waiting?"🔍 KONTROL ET":"📄 KAYDI AÇ"}
      </button>
    </div>`;
  }).join("");
}

function openOfficeDetail(issue){
  officeCurrentIssue=issue;
  document.getElementById("officeDetailRecordLabel").textContent=`${issue.recordId} · ${issue.block} / ${issue.floor}`;
  document.getElementById("officeDecisionNote").value="";
  document.getElementById("officeDecisionTerm").value="";
  document.getElementById("officeDecisionResult").textContent="";
  updateOfficeDuePreview();

  const waiting=issue.status==="Kontrol Bekliyor";
  const closeBtn=document.getElementById("officeCloseBtn");
  const rejectBtn=document.getElementById("officeRejectBtn");
  closeBtn.disabled=!waiting;
  rejectBtn.disabled=!waiting;

  const summary=document.getElementById("officeDetailSummary");
  summary.innerHTML=`
    <div>
      ${priorityTag(issue.priority)}
      ${Number(issue.overdueDays)>0?`<span class="tag overdue">${Number(issue.overdueDays)} GÜN GECİKMİŞ</span>`:""}
      ${waiting?'<span class="tag waiting">KONTROL BEKLİYOR</span>':""}
    </div>
    <h3>${escapeHtml(issue.block)} / ${escapeHtml(issue.floor)} / ${escapeHtml(issue.location)}</h3>
    <p><b>Kayıt:</b> ${escapeHtml(issue.recordId)}</p>
    <p><b>Hata:</b> ${escapeHtml(issue.issueType)}</p>
    <p><b>İlk açıklama:</b> ${escapeHtml(issue.note)}</p>
    <p><b>Taşeron:</b> ${escapeHtml(issue.contractor)} · <b>Formen:</b> ${escapeHtml(issue.foreman)}</p>
    <p><b>İlk termin:</b> ${formatDate(issue.initialDueDate)}${issue.newDueDate?` · <b>Yeni termin:</b> ${formatDate(issue.newDueDate)}`:""}</p>
    <div class="office-detail-status">Durum: ${escapeHtml(issue.status)}</div>
    ${issue.correctionNote?`<div class="office-detail-note"><b>Taşeron düzeltmesi:</b><br>${escapeHtml(issue.correctionNote)}</div>`:""}
    ${issue.checkResult?`<p><b>Son kontrol:</b> ${escapeHtml(issue.checkResult)}${issue.checker?` — ${escapeHtml(issue.checker)}`:""}</p>`:""}
    <div class="office-photo-grid">
      <div class="office-photo-panel">
        <h4>İlk Hata Fotoğrafı</h4>
        ${issue.hasInitialPhoto?officeSecurePhotoHtml(issue.recordId,"initial","İlk hata fotoğrafı"):'<p class="help">Fotoğraf yok.</p>'}
      </div>
      <div class="office-photo-panel">
        <h4>Düzeltme Fotoğrafı</h4>
        ${issue.hasCorrectionPhoto?officeSecurePhotoHtml(issue.recordId,"correction","Düzeltme fotoğrafı"):'<p class="help">Henüz düzeltme fotoğrafı yok.</p>'}
      </div>
    </div>
  `;
  hydrateOfficeSecurePhotos(summary);
  showView("officeDetailView");
}

function officeSecurePhotoHtml(recordId,kind,label){
  return `<div class="secure-photo" data-office-photo="1" data-record-id="${escapeAttr(recordId)}" data-kind="${escapeAttr(kind)}">
    <button type="button" class="photo-load-btn">📷 ${escapeHtml(label)} — GÖSTER</button>
  </div>`;
}

function hydrateOfficeSecurePhotos(root=document){
  root.querySelectorAll('[data-office-photo="1"]').forEach(box=>{
    const btn=box.querySelector(".photo-load-btn");
    if(btn)btn.addEventListener("click",()=>loadOfficePhoto(box));
    if("IntersectionObserver" in window){
      const obs=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){obs.unobserve(entry.target);loadOfficePhoto(entry.target);}
        });
      },{rootMargin:"40px"});
      obs.observe(box);
    }
  });
}

async function loadOfficePhoto(box){
  if(!box||box.dataset.loading==="1"||box.dataset.loaded==="1")return;
  const session=loadOfficeSession();
  if(!session||!navigator.onLine)return;

  const cacheKey=`office|${box.dataset.recordId}|${box.dataset.kind}`;
  if(securePhotoCache.has(cacheKey)){
    const img=document.createElement("img");
    img.alt="Mekanik kontrol fotoğrafı";
    img.src=securePhotoCache.get(cacheKey);
    box.replaceChildren(img);
    box.dataset.loaded="1";
    return;
  }

  box.dataset.loading="1";
  const btn=box.querySelector(".photo-load-btn");
  if(btn){btn.disabled=true;btn.textContent="Fotoğraf yükleniyor…";}

  try{
    const data=await apiPost(apiUrl(),{
      action:"officeImage",
      officeUser:session.officeUser,
      token:session.token,
      recordId:box.dataset.recordId,
      kind:box.dataset.kind
    },60000);
    if(!data.ok)throw new Error(data.error||"Fotoğraf alınamadı");

    securePhotoCache.set(cacheKey,data.dataUrl);
    while(securePhotoCache.size>SECURE_PHOTO_CACHE_LIMIT)securePhotoCache.delete(securePhotoCache.keys().next().value);

    const img=document.createElement("img");
    img.alt="Mekanik kontrol fotoğrafı";
    img.src=data.dataUrl;
    box.replaceChildren(img);
    box.dataset.loaded="1";
  }catch(err){
    box.innerHTML=`<div class="photo-error">Fotoğraf yüklenemedi.<br>${escapeHtml(String(err.message||err))}<br><button type="button" class="photo-load-btn">TEKRAR DENE</button></div>`;
    const retry=box.querySelector(".photo-load-btn");
    if(retry)retry.addEventListener("click",()=>{box.dataset.loading="0";loadOfficePhoto(box);});
  }finally{
    box.dataset.loading="0";
  }
}

async function officeDecision(decision){
  if(officeDecisionRunning)return;
  const session=loadOfficeSession();
  const issue=officeCurrentIssue;
  if(!session||!issue)return showToast("Mekanik ofis kaydı seçili değil.");
  if(!navigator.onLine)return showToast("Mekanik kontrol kararı için internet gerekli.");

  const note=document.getElementById("officeDecisionNote").value.trim();
  const termRaw=document.getElementById("officeDecisionTerm").value;
  const termDays=termRaw===""?null:Number(termRaw);

  if(["reject","newDue"].includes(decision)){
    if(note.length<3)return showToast(decision==="reject"?"Red sebebi yaz.":"Yeni termin sebebi yaz.");
    if(termDays===null||!Number.isFinite(termDays))return showToast("Yeni termin seç.");
  }

  if(decision==="close" && issue.status!=="Kontrol Bekliyor")return showToast("Bu iş henüz kontrol beklemiyor.");
  if(decision==="reject" && issue.status!=="Kontrol Bekliyor")return showToast("Bu iş henüz kontrol beklemiyor.");

  const labels={
    close:"Bu düzeltmeyi uygun bulup kaydı kapatmak istiyor musun?",
    reject:"Düzeltmeyi reddedip yeni termin vermek istiyor musun?",
    newDue:"Bu işe yeni termin vermek istiyor musun?"
  };
  if(!window.confirm(labels[decision]))return;

  officeDecisionRunning=true;
  const clicked=decision==="close"?document.getElementById("officeCloseBtn"):decision==="reject"?document.getElementById("officeRejectBtn"):document.getElementById("officeNewDueBtn");
  setButtonBusy(clicked,true,"İŞLENİYOR…");
  document.getElementById("officeDecisionResult").textContent="Mekanik ofis kararı kaydediliyor…";

  try{
    const data=await apiPost(apiUrl(),{
      action:"officeDecision",
      officeUser:session.officeUser,
      token:session.token,
      recordId:issue.recordId,
      decision,
      note,
      termDays
    },30000);

    if(!data.ok)throw new Error(data.error||"İşlem kaydedilemedi");
    document.getElementById("officeDecisionResult").textContent="✅ İşlem kaydedildi.";
    showToast(decision==="close"?"Kayıt kapatıldı.":decision==="reject"?"Düzeltme reddedildi ve yeni termin verildi.":"Yeni termin kaydedildi.");
    officeCurrentIssue=null;
    showView("officePanelView");
    await refreshOfficeDashboard(false);
  }catch(err){
    document.getElementById("officeDecisionResult").textContent="❌ "+String(err.message||err);
  }finally{
    setButtonBusy(clicked,false);
    officeDecisionRunning=false;
  }
}

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
  const s=loadContractorSession();

  if(!s){
    // Önce ekranı aç; gerçek listeleri ağdan arka planda yenile.
    showView("contractorLoginView");
    if(navigator.onLine)refreshRemoteConfig(false).catch(()=>{});
    return;
  }

  document.getElementById("contractorPanelTitle").textContent=s.contractor;
  showView("contractorPanelView");

  // Cache'deki işleri hemen göster; ağ isteği arka planda.
  renderContractorIssues(getCachedContractorIssues(),"Telefondaki son liste").catch(()=>{});
  if(navigator.onLine){
    refreshRemoteConfig(false).catch(()=>{});
    refreshContractorIssues(false).catch(()=>{});
  }
}

async function contractorLogin(){
  if(contractorLoginRunning)return;
  const contractor=document.getElementById("contractorLoginSelect").value;
  const pin=document.getElementById("contractorPin").value.trim();
  const out=document.getElementById("contractorLoginResult");
  const url=apiUrl();

  if(!contractor)return showToast("Firma seç.");
  if(!/^\d{4}$/.test(pin))return showToast("PIN 4 haneli olmalı.");
  if(!url)return showToast("Bulut bağlantısı tanımlı değil.");
  if(!navigator.onLine)return showToast("İlk giriş için internet gerekli.");

  contractorLoginRunning=true;
  const loginBtn=document.getElementById("contractorLoginBtn");
  setButtonBusy(loginBtn,true,"GİRİŞ KONTROL EDİLİYOR…");
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
  }finally{
    setButtonBusy(loginBtn,false);
    contractorLoginRunning=false;
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

function clearCachedIssuePending(recordId){
  const issues=getCachedContractorIssues();
  const x=issues.find(i=>i.recordId===recordId);
  if(x){
    x.localCorrectionPending=false;
    saveCachedContractorIssues(issues);
  }
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
      ${x.hasInitialPhoto?securePhotoHtml(x.recordId,"initial","İlk hata fotoğrafı"):""}
      ${x.hasCorrectionPhoto?securePhotoHtml(x.recordId,"correction","Son düzeltme fotoğrafı"):""}
      <div class="card-actions">
        <button class="card-action" data-correct-record="${escapeAttr(x.recordId)}" ${canCorrect?"":"disabled"}>
          ${waitingStatus?"MEKANİK KONTROLÜ BEKLENİYOR":queued?"GÖNDERİM BEKLİYOR":"🔧 DÜZELTME BİLDİR"}
        </button>
      </div>
    </div>`;
  }).join("");
  hydrateSecurePhotos(list);
}


function securePhotoHtml(recordId,kind,label){
  return `<div class="secure-photo" data-secure-photo="1" data-record-id="${escapeAttr(recordId)}" data-kind="${escapeAttr(kind)}">
    <button type="button" class="photo-load-btn">📷 ${escapeHtml(label)} — GÖSTER</button>
  </div>`;
}

function hydrateSecurePhotos(root=document){
  const boxes=[...root.querySelectorAll('[data-secure-photo="1"]')];
  if(!boxes.length)return;

  boxes.forEach(box=>{
    const btn=box.querySelector(".photo-load-btn");
    if(btn)btn.addEventListener("click",()=>loadSecurePhoto(box));
  });

  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          observer.unobserve(entry.target);
          loadSecurePhoto(entry.target);
        }
      });
    },{rootMargin:"40px"});
    boxes.forEach((box,i)=>{
      // İlk iki görünür fotoğraf otomatik; kalanlar görünür oldukça veya kullanıcı dokununca.
      if(i<2)observer.observe(box);
      else observer.observe(box);
    });
  }
}

async function loadSecurePhoto(box){
  if(!box || box.dataset.loading==="1" || box.dataset.loaded==="1")return;
  const cacheKey=`${box.dataset.recordId}|${box.dataset.kind}`;
  if(securePhotoCache.has(cacheKey)){
    const img=document.createElement("img");
    img.alt=box.dataset.kind==="correction"?"Düzeltme fotoğrafı":"İlk hata fotoğrafı";
    img.src=securePhotoCache.get(cacheKey);
    box.replaceChildren(img);
    box.dataset.loaded="1";
    return;
  }
  const session=loadContractorSession();
  if(!session)return;
  const url=apiUrl();
  if(!url || !navigator.onLine)return;

  box.dataset.loading="1";
  const btn=box.querySelector(".photo-load-btn");
  if(btn){btn.disabled=true;btn.textContent="Fotoğraf yükleniyor…";}

  try{
    const data=await apiPost(url,{
      action:"contractorImage",
      contractor:session.contractor,
      token:session.token,
      recordId:box.dataset.recordId,
      kind:box.dataset.kind
    },60000);
    if(!data.ok)throw new Error(data.error||"Fotoğraf alınamadı");
    securePhotoCache.set(cacheKey,data.dataUrl);
    while(securePhotoCache.size>SECURE_PHOTO_CACHE_LIMIT){
      securePhotoCache.delete(securePhotoCache.keys().next().value);
    }
    const img=document.createElement("img");
    img.alt=box.dataset.kind==="correction"?"Düzeltme fotoğrafı":"İlk hata fotoğrafı";
    img.src=data.dataUrl;
    box.replaceChildren(img);
    box.dataset.loaded="1";
  }catch(err){
    box.innerHTML=`<div class="photo-error">Fotoğraf yüklenemedi.<br>${escapeHtml(String(err.message||err))}<br><button type="button" class="photo-load-btn">TEKRAR DENE</button></div>`;
    const retry=box.querySelector(".photo-load-btn");
    if(retry)retry.addEventListener("click",()=>{box.dataset.loading="0";loadSecurePhoto(box);});
  }finally{
    box.dataset.loading="0";
  }
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
async function compressImage(file,maxWidth,quality){
  let source=null;
  let width=0,height=0;

  try{
    if("createImageBitmap" in window){
      source=await createImageBitmap(file);
      width=source.width;height=source.height;
    }else{
      source=await loadImageFromFile(file);
      width=source.naturalWidth||source.width;
      height=source.naturalHeight||source.height;
    }

    const scale=Math.min(1,maxWidth/width);
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(width*scale));
    canvas.height=Math.max(1,Math.round(height*scale));
    const ctx=canvas.getContext("2d",{alpha:false});
    ctx.drawImage(source,0,0,canvas.width,canvas.height);

    const blob=await new Promise((resolve,reject)=>{
      canvas.toBlob(b=>b?resolve(b):reject(new Error("Fotoğraf sıkıştırılamadı")),"image/jpeg",quality);
    });

    if(source&&typeof source.close==="function")source.close();
    return await blobToDataUrl(blob);
  }catch(err){
    if(source&&typeof source.close==="function")source.close();
    throw err;
  }
}

function loadImageFromFile(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=reject;
      img.src=reader.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(blob);
  });
}