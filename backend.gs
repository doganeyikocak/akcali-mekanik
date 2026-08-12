const BACKEND_VERSION="4.2.2";
const SHEET_NAME="ANA TAKİP";
const DEFINITIONS_SHEET="TANIMLAR";
const CORRECTION_LOG_SHEET="DÜZELTME GEÇMİŞİ";
const DRIVE_FOLDER_NAME="Akcali_Mekanik_Fotograflar";
const TIMEZONE="Europe/Istanbul";

const COL={
  RECORD_ID:1, CREATED_AT:2, REPORTER:3, BLOCK:4, FLOOR:5, LOCATION:6, ISSUE_TYPE:7, NOTE:8,
  INITIAL_PHOTO:9, CONTRACTOR:10, FOREMAN:11, PRIORITY:12, DUE_DATE:13, STATUS:14,
  CORRECTION_NOTE:15, CORRECTION_PHOTO:16, CHECK_DATE:17, CHECKER:18, CHECK_RESULT:19,
  NEW_DUE_DATE:20, CLOSED_AT:21, DELAY_DAYS:22, RECURRING:23, EXTRA_NOTE:24, LOCAL_ID:25,
  CORRECTION_AT:26, CORRECTION_LOCAL_ID:27, CORRECTION_BY:28, TERM_DAYS:29
};

function setup(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(!ss)throw new Error("Bu fonksiyonu Google Sheets dosyasına bağlı Apps Script projesinden çalıştır.");
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID",ss.getId());
  ensureSecret_();
  ensureTrackingSheet_(ss);
  ensureDefinitionsSheet_(ss);
  ensureCorrectionLogSheet_(ss);
  return "Akçalı Mekanik v4.0 kurulum tamam: "+ss.getName();
}

function spreadsheet_(){
  const id=PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if(!id)throw new Error("Önce Apps Script editöründe setup() fonksiyonunu bir kez çalıştır.");
  return SpreadsheetApp.openById(id);
}

function doGet(e){
  try{
    const action=(e&&e.parameter&&e.parameter.action)||"health";

    if(action==="health"){
      return response_(e,{ok:true,service:"Akçalı Mekanik",version:BACKEND_VERSION,time:new Date().toISOString()});
    }

    if(action==="config"){
      return response_(e,{ok:true,config:getConfig_()});
    }

    if(action==="syncStatus"){
      return response_(e,syncStatus_(e));
    }

    return response_(e,{ok:false,error:"Bilinmeyen işlem"});
  }catch(err){
    return response_(e,{ok:false,error:String(err.message||err)});
  }
}

function doPost(e){
  try{
    const payload=JSON.parse((e.postData&&e.postData.contents)||"{}");
    const action=String(payload.action||"");

    if(action==="contractorLogin")return json_(contractorLogin_(payload));
    if(action==="contractorIssues")return json_(contractorIssues_(payload));
    if(action==="contractorImage")return json_(contractorImage_(payload));

    if(action==="createIssue"){
      return withLock_(()=>createIssue_(payload.issue));
    }

    if(action==="submitCorrection"){
      return withLock_(()=>submitCorrection_(payload));
    }

    return json_({ok:false,error:"Bilinmeyen işlem"});
  }catch(err){
    return json_({ok:false,error:String(err.message||err)});
  }
}

function withLock_(fn){
  const lock=LockService.getScriptLock();
  lock.waitLock(30000);
  try{return fn();}
  finally{lock.releaseLock();}
}


/* ---------- SYNC STATUS / ACK ---------- */
function syncStatus_(e){
  const p=(e&&e.parameter)||{};
  const kind=String(p.kind||"issue").trim();
  const localId=String(p.localId||"").trim();

  if(!localId || localId.length>120){
    return {ok:false,error:"Geçersiz yerel kayıt kimliği."};
  }

  const ss=spreadsheet_();

  if(kind==="issue"){
    const sheet=ensureTrackingSheet_(ss);
    const row=findByColumn_(sheet,COL.LOCAL_ID,localId,5);
    if(!row)return {ok:true,exists:false,kind:"issue"};

    return {
      ok:true,
      exists:true,
      kind:"issue",
      recordId:String(sheet.getRange(row,COL.RECORD_ID).getDisplayValue()||""),
      status:String(sheet.getRange(row,COL.STATUS).getDisplayValue()||"")
    };
  }

  if(kind==="correction"){
    const log=ensureCorrectionLogSheet_(ss);
    const row=findByColumn_(log,6,localId,2);
    if(!row)return {ok:true,exists:false,kind:"correction"};

    return {
      ok:true,
      exists:true,
      kind:"correction",
      recordId:String(log.getRange(row,1).getDisplayValue()||""),
      status:String(log.getRange(row,8).getDisplayValue()||"Kontrol Bekliyor")
    };
  }

  return {ok:false,error:"Geçersiz kayıt türü."};
}

/* ---------- CONFIG ---------- */
function getConfig_(){
  const ss=spreadsheet_();
  const s=ensureDefinitionsSheet_(ss);
  const rows=Math.max(1,s.getLastRow()-3);
  const values=s.getRange(4,1,rows,11).getDisplayValues();
  const col=n=>values.map(r=>String(r[n]||"").trim()).filter(Boolean);

  return {
    blocks:unique_(col(0)).length?unique_(col(0)):defaultConfig_().blocks,
    floors:unique_(col(1)).length?unique_(col(1)):defaultConfig_().floors,
    priorities:unique_(col(3)).length?unique_(col(3)):defaultConfig_().priorities,
    contractors:unique_(col(5)).length?unique_(col(5)):defaultConfig_().contractors,
    foremen:unique_(col(6)).length?unique_(col(6)):defaultConfig_().foremen,
    issues:unique_(col(8)).length?unique_(col(8)):defaultConfig_().issues,
    terms:unique_(col(10)).length?unique_(col(10)):defaultConfig_().terms
  };
}

function defaultConfig_(){
  return {
    blocks:["A Blok","B Blok"],
    floors:["B1","Zemin","1. Kat"],
    priorities:["Kritik","Yüksek","Normal","Düşük"],
    contractors:["Taşeron 1"],
    foremen:["Formen 1"],
    issues:["Ters Eğim","Eksik Kelepçe","Montaj Hatası","Diğer"],
    terms:["1","2","3","5","7"]
  };
}

function unique_(arr){return Array.from(new Set(arr));}

function ensureDefinitionsSheet_(ss){
  let s=ss.getSheetByName(DEFINITIONS_SHEET);
  if(!s)s=ss.insertSheet(DEFINITIONS_SHEET);
  if(s.getMaxColumns()<11)s.insertColumnsAfter(s.getMaxColumns(),11-s.getMaxColumns());

  const headers=["BLOKLAR","KATLAR","SİSTEMLER","ÖNCELİKLER","DURUMLAR","TAŞERONLAR","FORMENLER","MEKANİK OFİS","HATA TÜRLERİ","TAŞERON PIN","TERMİN SÜRELERİ (GÜN)"];
  headers.forEach((h,i)=>{
    const cell=s.getRange(3,i+1);
    if(!cell.getValue())cell.setValue(h);
  });

  if(isRangeEmpty_(s,4,4,4,1))s.getRange(4,4,4,1).setValues([["Kritik"],["Yüksek"],["Normal"],["Düşük"]]);
  if(isRangeEmpty_(s,4,5,7,1))s.getRange(4,5,7,1).setValues([["Yeni Kayıt"],["Taşerona Atandı"],["Düzeltme Devam Ediyor"],["Kontrol Bekliyor"],["Uygun Değil – Tekrar Düzeltilecek"],["Kapandı"],["İptal / Mükerrer"]]);
  if(isRangeEmpty_(s,4,11,5,1))s.getRange(4,11,5,1).setValues([["1"],["2"],["3"],["5"],["7"]]);

  s.getRange(4,10,Math.max(1,s.getMaxRows()-3),1).setNumberFormat("@");
  return s;
}

function isRangeEmpty_(s,row,col,numRows,numCols){
  return s.getRange(row,col,numRows,numCols).getDisplayValues().flat().filter(v=>String(v).trim()).length===0;
}

/* ---------- CREATE ISSUE ---------- */
function createIssue_(issue){
  validateIssue_(issue);
  const ss=spreadsheet_();
  const sheet=ensureTrackingSheet_(ss);

  const existing=findByColumn_(sheet,COL.LOCAL_ID,issue.localId,5);
  if(existing){
    return {ok:true,recordId:String(sheet.getRange(existing,COL.RECORD_ID).getDisplayValue()),duplicate:true};
  }

  const createdAt=new Date(issue.createdAt||Date.now());
  const termDays=Number(issue.termDays);
  const dueDate=new Date(createdAt);
  dueDate.setDate(dueDate.getDate()+termDays);

  const recordId=createUniqueId_();
  const photoUrl=savePhoto_(recordId+"-ILK",issue.photoData);
  const row=Math.max(sheet.getLastRow()+1,5);

  sheet.getRange(row,1,1,29).setValues([[
    recordId,createdAt,issue.deviceName||issue.foreman||"",
    issue.block,issue.floor,issue.location,issue.issueType,issue.note,photoUrl,
    issue.contractor,issue.foreman,issue.priority,dueDate,"Taşerona Atandı",
    "","","","","","","",0,"Hayır","Offline PWA kaydı",issue.localId,
    "","","",termDays
  ]]);

  sheet.getRange(row,COL.RECORD_ID).setNumberFormat("@");
  sheet.getRange(row,COL.CREATED_AT).setNumberFormat("dd.MM.yyyy HH:mm");
  sheet.getRange(row,COL.DUE_DATE).setNumberFormat("dd.MM.yyyy");
  sheet.getRange(row,COL.DELAY_DAYS).setFormula(delayFormula_(row));

  return {ok:true,recordId,dueDate:dueDate.toISOString()};
}

function validateIssue_(i){
  ["localId","block","floor","location","issueType","priority","contractor","foreman","note","photoData"].forEach(k=>{
    if(!String(((i&&i[k])??"")).trim())throw new Error("Eksik alan: "+k);
  });
  const termDays=Number(i.termDays);
  if(!Number.isFinite(termDays)||termDays<0||termDays>365)throw new Error("Geçersiz termin süresi.");
  if(String(i.note).trim().length>250)throw new Error("Kısa açıklama 250 karakteri geçemez.");
  if(!String(i.photoData).startsWith("data:image/"))throw new Error("Geçersiz fotoğraf verisi.");
}

/* ---------- CONTRACTOR AUTH ---------- */
function contractorLogin_(payload){
  const contractor=String(payload.contractor||"").trim();
  const pin=String(payload.pin||"").trim();

  if(!contractor)throw new Error("Firma seçilmedi.");
  if(!/^\d{4}$/.test(pin))throw new Error("PIN 4 haneli olmalı.");

  const savedPin=getContractorPin_(contractor);
  if(!savedPin)throw new Error("Bu firma için PIN tanımlı değil.");
  if(savedPin!==pin)throw new Error("PIN hatalı.");

  return {ok:true,contractor,token:contractorToken_(contractor,savedPin)};
}

function validateContractorToken_(contractor,token){
  contractor=String(contractor||"").trim();
  token=String(token||"").trim();
  const pin=getContractorPin_(contractor);
  if(!pin)throw new Error("Firma PIN'i tanımlı değil.");
  const expected=contractorToken_(contractor,pin);
  if(token!==expected)throw new Error("Taşeron oturumu geçersiz. Tekrar giriş yap.");
  return true;
}

function getContractorPin_(contractor){
  const ss=spreadsheet_();
  const s=ensureDefinitionsSheet_(ss);
  const last=Math.max(4,s.getLastRow());
  const values=s.getRange(4,6,last-3,5).getDisplayValues(); // F:J
  for(const r of values){
    if(String(r[0]||"").trim()===contractor){
      const pin=String(r[4]||"").trim();
      return /^\d{4}$/.test(pin)?pin:"";
    }
  }
  return "";
}

function contractorToken_(contractor,pin){
  const secret=ensureSecret_();
  const bytes=Utilities.computeHmacSha256Signature(contractor+"|"+pin,secret);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/,"");
}

function ensureSecret_(){
  const props=PropertiesService.getScriptProperties();
  let secret=props.getProperty("APP_SECRET");
  if(!secret){
    secret=Utilities.getUuid()+Utilities.getUuid();
    props.setProperty("APP_SECRET",secret);
  }
  return secret;
}

/* ---------- CONTRACTOR ISSUES ---------- */
function contractorIssues_(payload){
  const contractor=String(payload.contractor||"").trim();
  validateContractorToken_(contractor,payload.token);

  const ss=spreadsheet_();
  const sheet=ensureTrackingSheet_(ss);
  const last=sheet.getLastRow();
  if(last<5)return {ok:true,issues:[]};

  const values=sheet.getRange(5,1,last-4,29).getValues();
  const closed=["Kapandı","İptal / Mükerrer","İptal/Mükerrer"];
  const issues=[];

  values.forEach(r=>{
    const rowContractor=String(r[COL.CONTRACTOR-1]||"").trim();
    const status=String(r[COL.STATUS-1]||"").trim();
    if(rowContractor!==contractor||closed.includes(status))return;

    const due=r[COL.DUE_DATE-1];
    issues.push({
      recordId:String(r[COL.RECORD_ID-1]||""),
      createdAt:iso_(r[COL.CREATED_AT-1]),
      block:String(r[COL.BLOCK-1]||""),
      floor:String(r[COL.FLOOR-1]||""),
      location:String(r[COL.LOCATION-1]||""),
      issueType:String(r[COL.ISSUE_TYPE-1]||""),
      note:String(r[COL.NOTE-1]||""),
      hasInitialPhoto:Boolean(String(r[COL.INITIAL_PHOTO-1]||"").trim()),
      priority:String(r[COL.PRIORITY-1]||"Normal"),
      dueDate:iso_(due),
      status:status||"Taşerona Atandı",
      correctionNote:String(r[COL.CORRECTION_NOTE-1]||""),
      hasCorrectionPhoto:Boolean(String(r[COL.CORRECTION_PHOTO-1]||"").trim()),
      correctionAt:iso_(r[COL.CORRECTION_AT-1]),
      overdueDays:overdueDays_(due,status)
    });
  });

  const weight={"Kritik":4,"Yüksek":3,"Normal":2,"Düşük":1};
  issues.sort((a,b)=>
    (Number(b.overdueDays)-Number(a.overdueDays))||
    ((weight[b.priority]||0)-(weight[a.priority]||0))||
    String(a.dueDate||"").localeCompare(String(b.dueDate||""))
  );

  return {ok:true,issues};
}

function overdueDays_(due,status){
  if(!(due instanceof Date)||isNaN(due.getTime()))return 0;
  if(["Kapandı","İptal / Mükerrer","İptal/Mükerrer"].includes(String(status)))return 0;
  const now=new Date();
  const a=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const b=new Date(due.getFullYear(),due.getMonth(),due.getDate());
  return Math.max(0,Math.floor((a-b)/86400000));
}


/* ---------- SECURE CONTRACTOR IMAGE ---------- */
function contractorImage_(payload){
  const contractor=String(payload.contractor||"").trim();
  validateContractorToken_(contractor,payload.token);

  const recordId=String(payload.recordId||"").trim();
  const kind=String(payload.kind||"initial").trim();
  if(!recordId)throw new Error("Kayıt numarası eksik.");
  if(!["initial","correction"].includes(kind))throw new Error("Geçersiz fotoğraf türü.");

  const ss=spreadsheet_();
  const sheet=ensureTrackingSheet_(ss);
  const row=findByColumn_(sheet,COL.RECORD_ID,recordId,5);
  if(!row)throw new Error("Kayıt bulunamadı.");

  const assigned=String(sheet.getRange(row,COL.CONTRACTOR).getDisplayValue()||"").trim();
  if(assigned!==contractor)throw new Error("Bu fotoğraf bu firmaya ait değil.");

  const col=kind==="correction"?COL.CORRECTION_PHOTO:COL.INITIAL_PHOTO;
  const stored=String(sheet.getRange(row,col).getDisplayValue()||"").trim();
  if(!stored)throw new Error("Fotoğraf bulunamadı.");

  const fileId=extractDriveFileId_(stored);
  if(!fileId)throw new Error("Fotoğraf dosya kimliği bulunamadı.");

  const file=DriveApp.getFileById(fileId);
  const blob=file.getBlob();
  const mime=blob.getContentType()||"image/jpeg";
  const base64=Utilities.base64Encode(blob.getBytes());

  return {ok:true,dataUrl:"data:"+mime+";base64,"+base64};
}

function extractDriveFileId_(value){
  value=String(value||"").trim();
  if(/^[A-Za-z0-9_-]{20,}$/.test(value))return value;

  let m=value.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if(m)return m[1];

  m=value.match(/\/d\/([A-Za-z0-9_-]+)/);
  if(m)return m[1];

  m=value.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  if(m)return m[1];

  return "";
}

/* ---------- CORRECTION ---------- */
function submitCorrection_(payload){
  const contractor=String(payload.contractor||"").trim();
  validateContractorToken_(contractor,payload.token);

  const c=payload.correction||{};
  validateCorrection_(c);

  if(String(c.contractor||"").trim()!==contractor)throw new Error("Firma bilgisi uyuşmuyor.");

  const ss=spreadsheet_();
  const sheet=ensureTrackingSheet_(ss);
  const log=ensureCorrectionLogSheet_(ss);

  const duplicate=findByColumn_(log,6,c.localId,2);
  if(duplicate)return {ok:true,recordId:c.recordId,duplicate:true,status:"Kontrol Bekliyor"};

  const row=findByColumn_(sheet,COL.RECORD_ID,c.recordId,5);
  if(!row)throw new Error("Hata kaydı bulunamadı.");

  const assigned=String(sheet.getRange(row,COL.CONTRACTOR).getDisplayValue()||"").trim();
  if(assigned!==contractor)throw new Error("Bu kayıt bu firmaya ait değil.");

  const status=String(sheet.getRange(row,COL.STATUS).getDisplayValue()||"").trim();
  if(["Kapandı","İptal / Mükerrer","İptal/Mükerrer"].includes(status))throw new Error("Bu kayıt kapalı; düzeltme gönderilemez.");

  const correctionAt=new Date(c.createdAt||Date.now());
  const photoUrl=savePhoto_(c.recordId+"-DUZELTME-"+Utilities.formatDate(correctionAt,TIMEZONE,"yyyyMMdd-HHmmss"),c.photoData);

  sheet.getRange(row,COL.CORRECTION_NOTE).setValue(String(c.note).trim());
  sheet.getRange(row,COL.CORRECTION_PHOTO).setValue(photoUrl);
  sheet.getRange(row,COL.STATUS).setValue("Kontrol Bekliyor");
  sheet.getRange(row,COL.CORRECTION_AT).setValue(correctionAt).setNumberFormat("dd.MM.yyyy HH:mm");
  sheet.getRange(row,COL.CORRECTION_LOCAL_ID).setValue(c.localId);
  sheet.getRange(row,COL.CORRECTION_BY).setValue(contractor);

  log.appendRow([
    c.recordId,correctionAt,contractor,String(c.note).trim(),photoUrl,c.localId,status,"Kontrol Bekliyor"
  ]);
  const lr=log.getLastRow();
  log.getRange(lr,2).setNumberFormat("dd.MM.yyyy HH:mm");

  return {ok:true,recordId:c.recordId,status:"Kontrol Bekliyor"};
}

function validateCorrection_(c){
  ["localId","recordId","contractor","note","photoData"].forEach(k=>{
    if(!String(((c&&c[k])??"")).trim())throw new Error("Eksik düzeltme alanı: "+k);
  });
  if(String(c.note).trim().length>250)throw new Error("Düzeltme açıklaması 250 karakteri geçemez.");
  if(!String(c.photoData).startsWith("data:image/"))throw new Error("Geçersiz düzeltme fotoğrafı.");
}

/* ---------- SHEETS ---------- */
function ensureTrackingSheet_(ss){
  let s=ss.getSheetByName(SHEET_NAME);
  if(!s)s=ss.insertSheet(SHEET_NAME);
  if(s.getMaxColumns()<29)s.insertColumnsAfter(s.getMaxColumns(),29-s.getMaxColumns());

  const headers=[
    "Kayıt No","Bildirim Zamanı","Bildiren","Blok","Kat","Mahal / Daire / Şaft","Sistem / Hata Türü","Problem Açıklaması",
    "İlk Fotoğraf Linki","Sorumlu Taşeron","Sorumlu Formen","Öncelik","İlk Termin","Durum","Düzeltme Açıklaması",
    "Düzeltme Fotoğrafı","Kontrol Tarihi","Kontrol Eden","Kontrol Sonucu","Yeni Termin","Kapanış Tarihi","Gecikme Günü",
    "Tekrar Eden?","Not / Kontrol Fotoğrafı","PWA Yerel ID","Düzeltme Bildirim Zamanı","Düzeltme PWA Yerel ID",
    "Düzeltme Bildiren","Termin Süresi (Gün)"
  ];
  s.getRange(4,1,1,29).setValues([headers]);
  return s;
}

function ensureCorrectionLogSheet_(ss){
  let s=ss.getSheetByName(CORRECTION_LOG_SHEET);
  if(!s)s=ss.insertSheet(CORRECTION_LOG_SHEET);
  if(s.getMaxColumns()<8)s.insertColumnsAfter(s.getMaxColumns(),8-s.getMaxColumns());
  if(!s.getRange(1,1).getValue()){
    s.getRange(1,1,1,8).setValues([[
      "Kayıt No","Düzeltme Zamanı","Taşeron","Düzeltme Açıklaması","Düzeltme Fotoğrafı",
      "Düzeltme PWA Yerel ID","Önceki Durum","Yeni Durum"
    ]]);
  }
  return s;
}

function findByColumn_(sheet,col,value,startRow){
  const last=sheet.getLastRow();
  if(last<startRow)return 0;
  const vals=sheet.getRange(startRow,col,last-startRow+1,1).getDisplayValues().flat();
  const target=String(value||"").trim();
  const idx=vals.findIndex(v=>String(v||"").trim()===target);
  return idx===-1?0:startRow+idx;
}

function delayFormula_(row){
  return '=IF(B'+row+'="","",IF(OR(N'+row+'="Kapandı",N'+row+'="İptal / Mükerrer"),0,IF(IF(T'+row+'<>"",T'+row+',M'+row+')="",0,MAX(0,TODAY()-IF(T'+row+'<>"",T'+row+',M'+row+')))))';
}

/* ---------- PHOTO ---------- */
function savePhoto_(name,dataUrl){
  const parts=String(dataUrl).split(",");
  if(parts.length<2)throw new Error("Fotoğraf verisi bozuk.");
  const meta=parts[0];
  const bytes=Utilities.base64Decode(parts[1]);
  const mime=(meta.match(/data:(.*?);base64/)||[])[1]||"image/jpeg";
  const blob=Utilities.newBlob(bytes,mime,name+".jpg");

  const folders=DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  const folder=folders.hasNext()?folders.next():DriveApp.createFolder(DRIVE_FOLDER_NAME);
  const file=folder.createFile(blob);

  return "https://drive.google.com/file/d/"+file.getId()+"/view";
}

/* ---------- HELPERS ---------- */
function createUniqueId_(){
  const stamp=Utilities.formatDate(new Date(),TIMEZONE,"yyMMdd-HHmmss");
  const suffix=Utilities.getUuid().replace(/-/g,"").slice(0,6).toUpperCase();
  return "MEK-"+stamp+"-"+suffix;
}

function iso_(v){
  if(v instanceof Date&&!isNaN(v.getTime()))return v.toISOString();
  if(!v)return "";
  const d=new Date(v);
  return isNaN(d.getTime())?String(v):d.toISOString();
}

function response_(e,obj){
  const callback=String((e&&e.parameter&&e.parameter.callback)||"").trim();

  if(callback && /^[A-Za-z_$][0-9A-Za-z_$\.]{0,120}$/.test(callback)){
    return ContentService
      .createTextOutput(callback+"("+JSON.stringify(obj)+");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function json_(obj){
  return response_(null,obj);
}