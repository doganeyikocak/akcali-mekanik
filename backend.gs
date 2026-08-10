const SHEET_NAME="ANA TAKİP";
const DEFINITIONS_SHEET="TANIMLAR";
const DRIVE_FOLDER_NAME="Akcali_Mekanik_Fotograflar";
const TIMEZONE="Europe/Istanbul";
const LOCAL_ID_COL=25; // Y sütunu

function setup(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(!ss)throw new Error("Bu fonksiyonu Google Sheets dosyasına bağlı Apps Script projesinden çalıştır.");
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID",ss.getId());
  ensureTrackingSheet_(ss);
  ensureDefinitionsSheet_(ss);
  return "Kurulum tamam: "+ss.getName();
}

function spreadsheet_(){
  const id=PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if(!id)throw new Error("Önce Apps Script editöründe setup() fonksiyonunu bir kez çalıştır.");
  return SpreadsheetApp.openById(id);
}

function doGet(e){
  try{
    const action=(e&&e.parameter&&e.parameter.action)||"health";
    if(action==="health")return json_({ok:true,service:"Akçalı Mekanik",time:new Date().toISOString()});
    if(action==="config")return json_({ok:true,config:getConfig_()});
    return json_({ok:false,error:"Bilinmeyen işlem"});
  }catch(err){return json_({ok:false,error:String(err.message||err)});}
}

function doPost(e){
  const lock=LockService.getScriptLock();
  let acquired=false;
  try{
    const payload=JSON.parse((e.postData&&e.postData.contents)||"{}");
    if(payload.action!=="createIssue"||!payload.issue)return json_({ok:false,error:"Geçersiz istek"});
    const issue=payload.issue;validate_(issue);

    const ss=spreadsheet_();
    const sheet=ensureTrackingSheet_(ss);

    lock.waitLock(30000);acquired=true;

    const existing=findByLocalId_(sheet,issue.localId);
    if(existing)return json_({ok:true,recordId:existing,duplicate:true});

    const recordId=createUniqueId_();
    const photoUrl=savePhoto_(recordId,issue.photoData);
    const row=Math.max(sheet.getLastRow()+1,5);

    sheet.getRange(row,1,1,25).setValues([[
      recordId,new Date(issue.createdAt||Date.now()),issue.deviceName||issue.foreman||"",
      issue.block,issue.floor,issue.location,issue.issueType,issue.note||"",photoUrl,
      issue.contractor,issue.foreman,"Normal","","Yeni Kayıt","","","","","","","",
      0,"Hayır","Offline PWA kaydı",issue.localId
    ]]);

    sheet.getRange(row,1).setNumberFormat("@");
    sheet.getRange(row,2).setNumberFormat("dd.MM.yyyy HH:mm");
    sheet.getRange(row,22).setFormula(
      '=IF(B'+row+'="","",IF(OR(N'+row+'="Kapandı",N'+row+'="İptal / Mükerrer"),0,IF(IF(T'+row+'<>"",T'+row+',M'+row+')="",0,MAX(0,TODAY()-IF(T'+row+'<>"",T'+row+',M'+row+')))))'
    );
    return json_({ok:true,recordId});
  }catch(err){
    return json_({ok:false,error:String(err.message||err)});
  }finally{
    if(acquired)lock.releaseLock();
  }
}

function getConfig_(){
  const ss=spreadsheet_();
  const s=ensureDefinitionsSheet_(ss);
  const rows=Math.max(1,s.getLastRow()-3);
  const cols=Math.max(9,s.getMaxColumns());
  const values=s.getRange(4,1,rows,cols).getDisplayValues();
  const col=n=>values.map(r=>String(r[n]||"").trim()).filter(Boolean);
  const issueValues=col(8);
  return {
    blocks:unique_(col(0)).length?unique_(col(0)):defaultConfig_().blocks,
    floors:unique_(col(1)).length?unique_(col(1)):defaultConfig_().floors,
    issues:issueValues.length?unique_(issueValues):defaultConfig_().issues,
    contractors:unique_(col(5)).length?unique_(col(5)):defaultConfig_().contractors,
    foremen:unique_(col(6)).length?unique_(col(6)):defaultConfig_().foremen
  };
}
function defaultConfig_(){return {blocks:["A Blok","B Blok"],floors:["B1","Zemin","1. Kat"],issues:["Ters Eğim","Eksik Kelepçe","Montaj Hatası","Diğer"],contractors:["Taşeron 1"],foremen:["Formen 1"]};}
function unique_(arr){return Array.from(new Set(arr));}

function ensureDefinitionsSheet_(ss){
  let s=ss.getSheetByName(DEFINITIONS_SHEET);
  if(!s){
    s=ss.insertSheet(DEFINITIONS_SHEET);
    s.getRange(3,1,1,9).setValues([["BLOKLAR","KATLAR","SİSTEMLER","ÖNCELİKLER","DURUMLAR","TAŞERONLAR","FORMENLER","MEKANİK OFİS","HATA TÜRLERİ"]]);
  }else{
    if(s.getMaxColumns()<9)s.insertColumnsAfter(s.getMaxColumns(),9-s.getMaxColumns());
    if(!s.getRange(3,9).getValue())s.getRange(3,9).setValue("HATA TÜRLERİ");
  }
  return s;
}

function ensureTrackingSheet_(ss){
  let s=ss.getSheetByName(SHEET_NAME);
  if(!s){
    s=ss.insertSheet(SHEET_NAME);
    s.getRange(4,1,1,25).setValues([[
      "Kayıt No","Bildirim Zamanı","Bildiren","Blok","Kat","Mahal / Daire / Şaft","Sistem","Problem Açıklaması",
      "İlk Fotoğraf Linki","Sorumlu Taşeron","Sorumlu Formen","Öncelik","İlk Termin","Durum","Düzeltme Açıklaması",
      "Düzeltme Fotoğrafı","Kontrol Tarihi","Kontrol Eden","Kontrol Sonucu","Yeni Termin","Kapanış Tarihi","Gecikme Günü",
      "Tekrar Eden?","Not / Kontrol Fotoğrafı","PWA Yerel ID"
    ]]);
  }else if(s.getMaxColumns()<25){
    s.insertColumnsAfter(s.getMaxColumns(),25-s.getMaxColumns());
    s.getRange(4,25).setValue("PWA Yerel ID");
  }else if(!s.getRange(4,25).getValue()){
    s.getRange(4,25).setValue("PWA Yerel ID");
  }
  return s;
}

function findByLocalId_(sheet,localId){
  const last=sheet.getLastRow();if(last<5)return "";
  const vals=sheet.getRange(5,LOCAL_ID_COL,last-4,1).getDisplayValues().flat();
  const idx=vals.findIndex(v=>String(v).trim()===String(localId).trim());
  return idx===-1?"":String(sheet.getRange(5+idx,1).getDisplayValue()||"");
}

function validate_(i){
  ["localId","block","floor","location","issueType","contractor","foreman","photoData"].forEach(k=>{if(!i[k])throw new Error("Eksik alan: "+k);});
  if(!String(i.photoData).startsWith("data:image/"))throw new Error("Geçersiz fotoğraf verisi.");
}
function createUniqueId_(){const stamp=Utilities.formatDate(new Date(),TIMEZONE,"yyMMdd-HHmmss"),suffix=Utilities.getUuid().replace(/-/g,"").slice(0,6).toUpperCase();return "MEK-"+stamp+"-"+suffix;}
function savePhoto_(recordId,dataUrl){
  const parts=String(dataUrl).split(",");if(parts.length<2)throw new Error("Fotoğraf verisi bozuk.");
  const meta=parts[0],bytes=Utilities.base64Decode(parts[1]),mime=(meta.match(/data:(.*?);base64/)||[])[1]||"image/jpeg";
  const blob=Utilities.newBlob(bytes,mime,recordId+".jpg");
  const folders=DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  const folder=folders.hasNext()?folders.next():DriveApp.createFolder(DRIVE_FOLDER_NAME);
  return folder.createFile(blob).getUrl();
}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
