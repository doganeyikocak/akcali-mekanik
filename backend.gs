const BACKEND_VERSION="5.2.0";
const SHEET_NAME="ANA TAKİP";
const DEFINITIONS_SHEET="TANIMLAR";
const CORRECTION_LOG_SHEET="DÜZELTME GEÇMİŞİ";
const OFFICE_LOG_SHEET="OFİS İŞLEM GEÇMİŞİ";
const PROGRESS_DEFINITIONS_SHEET="İLERLEME TANIMLAR";
const PROGRESS_CURRENT_SHEET="İLERLEME GÜNCEL";
const PROGRESS_WEEKLY_SHEET="İLERLEME HAFTALIK";
const PROGRESS_LOG_SHEET="İLERLEME DEĞİŞİKLİK";
const PROGRESS_DENOMINATOR=48;
const PROGRESS_BASELINE_WEEK="2026-W33";
const PROGRESS_BASELINE_DATE="2026-08-15T12:00:00+03:00";
const PROGRESS_ITEMS=[{"id":"P01","order":1,"name":"Temizsu Şaftı Kolon Boru Tesisatı","hqName":"Temizsu Şaftı \nKolon Boru Tesisatı","category":"Temiz Su","expected":34.0,"hqCol":"J"},{"id":"P02","order":2,"name":"Tesisat Şaftı Temizsu Borulama","hqName":"Tesisat Şaftı \nTemizsu Borulama","category":"Temiz Su","expected":34.0,"hqCol":"K"},{"id":"P03","order":3,"name":"Tesisat Şaftı Temizsu Vanalama","hqName":"Tesisat Şaftı \nTemizsu Vanalama","category":"Temiz Su","expected":34.0,"hqCol":"L"},{"id":"P04","order":4,"name":"Temizsu Şaftı Boru İzolasyonu","hqName":"Temizsu Şaftı \nBoru İzolasyonu","category":"Temiz Su","expected":34.0,"hqCol":"M"},{"id":"P05","order":5,"name":"Isıtma Şaftı Kolon Boru Tesisatı","hqName":"Isıtma Şaftı\nKolon Boru Tesisatı","category":"Diğer","expected":34.0,"hqCol":"N"},{"id":"P06","order":6,"name":"Tesisat Şaftı Isıtma Borulama","hqName":"Tesisat Şaftı \nIsıtma Borulama","category":"Diğer","expected":34.0,"hqCol":"O"},{"id":"P07","order":7,"name":"Tesisat Şaftı Isıtma PPRC Borulama","hqName":"Tesisat Şaftı \nIsıtma PPRC Borulama","category":"Temiz Su","expected":34.0,"hqCol":"P"},{"id":"P08","order":8,"name":"Tesisat Şaftı Isıtma Vanalama","hqName":"Tesisat Şaftı \nIsıtma Vanalama","category":"Diğer","expected":34.0,"hqCol":"Q"},{"id":"P09","order":9,"name":"Isıtma Şaftı Boru İzolasyonu","hqName":"Isıtma Şaftı \nBoru İzolasyonu","category":"Diğer","expected":34.0,"hqCol":"R"},{"id":"P10","order":10,"name":"Pissu Şaftı Kolon Boru Tesisatı","hqName":"Pissu Şaftı\nKolon Boru Tesisatı","category":"Pis Su / Sıhhi Tesisat","expected":34.0,"hqCol":"S"},{"id":"P11","order":11,"name":"Daire içi Süzgeç Montajı","hqName":"Daire içi \nSüzgeç Montajı","category":"Pis Su / Sıhhi Tesisat","expected":34.0,"hqCol":"T"},{"id":"P12","order":12,"name":"Yağmur Suyu Kolonu ve Balkon Süzgeci Montajı","hqName":"Yağmur Suyu Kolonu ve Balkon Süzgeci Montajı","category":"Pis Su / Sıhhi Tesisat","expected":34.0,"hqCol":"U"},{"id":"P13","order":13,"name":"Yangın Şaftı Kolon Boru Tesisatı","hqName":"Yangın Şaftı\nKolon Boru Tesisatı","category":"Yangın","expected":34.0,"hqCol":"V"},{"id":"P14","order":14,"name":"Yangın Dolabı Montajı","hqName":"Yangın Dolabı Montajı","category":"Yangın","expected":34.0,"hqCol":"W"},{"id":"P15","order":15,"name":"Yangın Şaftı Gruplama Montajı","hqName":"Yangın Şaftı \nGruplama Montajı","category":"Yangın","expected":17.0,"hqCol":"X"},{"id":"P16","order":16,"name":"Mutfak Davlumbaz Havalandırma Kanal İmalatı","hqName":"Mutfak Davlumbaz \nHavalandırma Kanal İmalatı","category":"Havalandırma","expected":34.0,"hqCol":"Y"},{"id":"P17","order":17,"name":"Daire İçi PPRC Boru Tesisatı","hqName":"Daire İçi PPRC \nBoru Tesisatı","category":"Temiz Su","expected":34.0,"hqCol":"Z"},{"id":"P18","order":18,"name":"Daire İçi PVC Boru Tesisatı","hqName":"Daire İçi PVC \nBoru Tesisatı","category":"Pis Su / Sıhhi Tesisat","expected":34.0,"hqCol":"AA"},{"id":"P19","order":19,"name":"Gömme Rezervuar Montajı","hqName":"Gömme Rezervuar \nMontajı","category":"Pis Su / Sıhhi Tesisat","expected":34.0,"hqCol":"AB"},{"id":"P20","order":20,"name":"Ankastre Duş Tesisatı Montajı","hqName":"Ankastre Duş Tesisatı \nMontajı","category":"Pis Su / Sıhhi Tesisat","expected":34.0,"hqCol":"AC"},{"id":"P21","order":21,"name":"Stop Vana Montajı","hqName":"Stop Vana Montajı","category":"Temiz Su","expected":34.0,"hqCol":"AD"},{"id":"P22","order":22,"name":"Daire İçi Kılıflı Boru Tesisatı","hqName":"Daire İçi \nKılıflı Boru Tesisatı","category":"Temiz Su","expected":34.0,"hqCol":"AE"},{"id":"P23","order":23,"name":"Daire İçi Pex Kollektör Montajı","hqName":"Daire İçi \nPex Kollektör Montajı","category":"Isıtma","expected":34.0,"hqCol":"AF"},{"id":"P24","order":24,"name":"Bina Şaft Alt Toplama Isıtma Tesisatı","hqName":"Bina Şaft Alt Toplama \nIsıtma Tesisatı","category":"Diğer","expected":34.0,"hqCol":"AG"},{"id":"P25","order":25,"name":"Bina Şaft Alt Toplama Temizsu Tesisatı","hqName":"Bina Şaft Alt Toplama \nTemizsu Tesisatı","category":"Temiz Su","expected":34.0,"hqCol":"AH"},{"id":"P26","order":26,"name":"Bina Şaft Alt Toplama Yangın Tesisatı","hqName":"Bina Şaft Alt Toplama \nYangın Tesisatı","category":"Yangın","expected":34.0,"hqCol":"AI"},{"id":"P27","order":27,"name":"Dolgu İçi Pissu Borulaması","hqName":"Dolgu İçi Pissu \nBorulaması","category":"Pis Su / Sıhhi Tesisat","expected":30.0,"hqCol":"AJ"},{"id":"P28","order":28,"name":"Otopark Yağmur Suyu Borulaması","hqName":"Otopark Yağmur Suyu \nBorulaması","category":"Pis Su / Sıhhi Tesisat","expected":34.0,"hqCol":"AK"},{"id":"P29","order":29,"name":"Otopark Sprinkler Borulaması","hqName":"Otopark Sprinkler\nBorulaması","category":"Yangın","expected":34.0,"hqCol":"AL"},{"id":"P30","order":30,"name":"Otopark Sprinkler Montajı","hqName":"Otopark Sprinkler \nMontajı","category":"Yangın","expected":34.0,"hqCol":"AM"},{"id":"P31","order":31,"name":"Daire İçi Sprikler Borulama","hqName":"Daire İçi Sprikler \nBorulama","category":"Diğer","expected":17.0,"hqCol":"AN"},{"id":"P32","order":32,"name":"Daire İçi Sprinkler Montajı","hqName":"Daire İçi Sprinkler \nMontajı","category":"Yangın","expected":17.0,"hqCol":"AO"},{"id":"P33","order":33,"name":"Duman Emiş Kanalı İmalatı","hqName":"Duman Emiş Kanalı \nİmalatı","category":"Havalandırma","expected":17.0,"hqCol":"AP"},{"id":"P34","order":34,"name":"Ara Kat S. Topl. Isıtma-K.Suyu","hqName":"Ara Kat S. Topl. \nIsıtma-K.Suyu","category":"Diğer","expected":17.0,"hqCol":"AQ"},{"id":"P35","order":35,"name":"Kalorimetre - Su Sayacı Montajı","hqName":"Kalorimetre - Su Sayacı\nMontajı","category":"Isıtma","expected":34.0,"hqCol":"AR"},{"id":"P36","order":36,"name":"Wc-Banyo - Aspiratör (duvar geçişi - fleks ve fanlı menfez)","hqName":"Wc-Banyo - Aspiratör\n(duvar geçişi - fleks ve fanlı menfez)","category":"Havalandırma","expected":34.0,"hqCol":"AS"},{"id":"P37","order":37,"name":"MBF - Egzoz Fan Montajı","hqName":"MBF - Egzoz Fan \nMontajı","category":"Havalandırma","expected":34.0,"hqCol":"AT"},{"id":"P38","order":38,"name":"Kazan Dairesi Montajları (Borulama ve Ekipman)","hqName":"Kazan Dairesi Montajları \n(Borulama ve Ekipman)","category":"Mekanik Oda","expected":34.0,"hqCol":"AU"},{"id":"P39","order":39,"name":"Yangın Kollektörü Montajları (ekipman ile)","hqName":"Yangın Kollektörü Montajları\n(ekipman ile)","category":"Yangın","expected":34.0,"hqCol":"AV"},{"id":"P40","order":40,"name":"Su Deposu MontajI","hqName":"Su Deposu MontajI","category":"Temiz Su","expected":34.0,"hqCol":"AW"},{"id":"P41","order":41,"name":"Kullanma Suyu Montajları (ekipman ve vanaları)","hqName":"Kullanma Suyu Montajları \n(ekipman ve vanaları)","category":"Temiz Su","expected":34.0,"hqCol":"AX"},{"id":"P42","order":42,"name":"Otopark Fan MontajI","hqName":"Otopark Fan \nMontajI","category":"Havalandırma","expected":34.0,"hqCol":"AY"},{"id":"P43","order":43,"name":"Radyatör Montajı","hqName":"Radyatör \nMontajı","category":"Isıtma","expected":34.0,"hqCol":"AZ"},{"id":"P44","order":44,"name":"Islak Hacim Havlupan Montajı","hqName":"Islak Hacim Havlupan \nMontajı","category":"Isıtma","expected":34.0,"hqCol":"BA"},{"id":"P45","order":45,"name":"Vitrifiye - Armatür Montajı","hqName":"Vitrifiye - Armatür \nMontajı","category":"Pis Su / Sıhhi Tesisat","expected":34.0,"hqCol":"BB"},{"id":"P46","order":46,"name":"Yangın Dol. Kapak Hortum Montajı","hqName":"Yangın Dol. Kapak Hortum \nMontajı","category":"Yangın","expected":34.0,"hqCol":"BC"},{"id":"P47","order":47,"name":"İtfaiye Su Alma Vana Montajı","hqName":"İtfaiye Su Alma Vana\nMontajı","category":"Diğer","expected":34.0,"hqCol":"BD"}];
const PROGRESS_BLOCK_SEED=[{"seq":1,"ada":1,"block":"A1","contractor":"Adcem","floorState":"4B+Z+13","floorCount":18,"apartmentCount":68,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,1.0,0.5,null,0.8,0.8,1.0,0.75,null,1.0,null,null,null,null]},{"seq":2,"ada":1,"block":"B1","contractor":"Adcem","floorState":"6B+Z+11","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,1.0,0.5,null,0.8,0.8,1.0,0.75,null,1.0,null,null,null,null]},{"seq":3,"ada":1,"block":"C1","contractor":"Adcem","floorState":"6B+Z+11","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,1.0,0.5,null,0.9,0.9,1.0,0.75,null,1.0,null,null,null,null]},{"seq":4,"ada":1,"block":"D1","contractor":"Adcem","floorState":"5B+Z+12","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,1.0,0.5,null,0.8,0.8,1.0,0.75,null,1.0,null,null,null,null]},{"seq":5,"ada":1,"block":"E1","contractor":"Adcem","floorState":"4B+Z+13","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,1.0,0.5,null,0.8,0.8,1.0,0.75,null,1.0,null,null,null,null]},{"seq":6,"ada":1,"block":"F1","contractor":"Adcem","floorState":"4B+Z+13","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,1.0,0.5,null,0.8,0.8,1.0,0.75,null,1.0,null,null,null,null]},{"seq":7,"ada":1,"block":"G1","contractor":"Adcem","floorState":"B+Z+16","floorCount":18,"apartmentCount":71,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,1.0,0.5,null,1.0,0.8,1.0,0.05,null,1.0,null,null,null,null]},{"seq":8,"ada":1,"block":"H1","contractor":"Adcem","floorState":"3B+Z+14","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,1.0,0.5,null,1.0,0.8,1.0,0.05,null,1.0,null,null,null,null]},{"seq":9,"ada":1,"block":"I1","contractor":"Nevzatoğulları","floorState":"6B+Z+11","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,null,0.25,null,0.8,null,1.0,null,null,null,null,null,null,null]},{"seq":10,"ada":1,"block":"J1","contractor":"Nevzatoğulları","floorState":"8B+Z+9","floorCount":18,"apartmentCount":71,"values":[1.0,1.0,null,null,1.0,1.0,null,null,null,0.9,null,0.35,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,0.5,null,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},{"seq":11,"ada":1,"block":"K1","contractor":"Nevzatoğulları","floorState":"3B+Z+30","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,null,0.9,null,0.8,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,0.9,0.8,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,0.1,0.9,null,null,null,null,null,null,null,null,null,null,null,null,null]},{"seq":12,"ada":1,"block":"L1","contractor":"Nevzatoğulları","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,null,1.0,null,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.9,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.9,0.3,1.0,0.8,null,null,null,null,0.7,null,null,null,null,null,null,null,null]},{"seq":13,"ada":1,"block":"M1","contractor":"Adcem","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,0.5,null,0.35,0.8,1.0,0.75,null,0.0,null,null,null,null]},{"seq":14,"ada":1,"block":"N1","contractor":"Adcem","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,null,1.0,1.0,1.0,1.0,null,0.5,null,0.35,0.8,1.0,0.05,null,0.1,null,null,null,null]},{"seq":15,"ada":1,"block":"O1","contractor":"Adcem","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,0.5,null,0.8,0.8,1.0,0.75,null,1.0,null,null,null,null]},{"seq":16,"ada":1,"block":"P1","contractor":"Adcem","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,0.5,null,0.35,0.8,1.0,0.75,null,1.0,null,null,null,null]},{"seq":17,"ada":1,"block":"R1","contractor":"Adcem","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,0.5,null,0.35,0.8,1.0,0.75,null,0.85,null,null,null,null]},{"seq":18,"ada":2,"block":"A2","contractor":"Nevzatoğulları","floorState":"B+Z+16","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.9,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.9,0.9,null,null,null,null,null,0.25,null,0.8,null,1.0,null,null,null,null,null,null,null]},{"seq":19,"ada":2,"block":"B2","contractor":"Adcem","floorState":"B+Z+16","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,null,0.5,null,0.25,0.8,1.0,0.05,null,0.05,null,null,null,null]},{"seq":20,"ada":2,"block":"C2","contractor":"Adcem","floorState":"B+Z+16","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,null,0.5,null,0.25,0.8,1.0,0.05,null,1.0,null,null,null,null]},{"seq":21,"ada":2,"block":"D2","contractor":"Nevzatoğulları","floorState":"2B+Z+15","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.9,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.8,0.9,0.9,null,null,null,null,null,0.25,null,0.8,null,1.0,null,null,null,null,null,null,null]},{"seq":22,"ada":2,"block":"E2","contractor":"Adcem","floorState":"4B+Z+13","floorCount":18,"apartmentCount":68,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,null,null,null,null,0.5,null,0.25,0.8,null,0.05,null,null,null,null,null,null]},{"seq":23,"ada":2,"block":"F2","contractor":"Adcem","floorState":"10B+Z+7","floorCount":18,"apartmentCount":68,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.8,0.8,null,null,null,null,null,0.5,null,0.25,0.8,null,0.05,null,null,null,null,null,null]},{"seq":24,"ada":2,"block":"G2","contractor":"Adcem","floorState":"7B+Z+10","floorCount":18,"apartmentCount":70,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.5,null,null,null,null,0.5,null,0.25,0.8,null,0.05,null,null,null,null,null,null]},{"seq":25,"ada":2,"block":"H2","contractor":"Nevzatoğulları","floorState":"5B+Z+28","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.9,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.8,0.9,0.9,1.0,1.0,1.0,0.8,null,0.25,null,0.8,null,1.0,null,null,null,null,null,null,null]},{"seq":26,"ada":2,"block":"I2","contractor":"Nevzatoğulları","floorState":"6B+Z+27","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.9,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.8,0.9,0.9,1.0,1.0,1.0,0.8,null,0.25,null,0.8,null,0.5,null,null,null,null,null,null,null]},{"seq":27,"ada":2,"block":"J2","contractor":"Nevzatoğulları","floorState":"5B+Z+28","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.8,0.9,0.9,1.0,1.0,1.0,0.8,null,0.25,null,0.8,0.9,1.0,null,null,null,null,null,null,null]},{"seq":28,"ada":2,"block":"K2","contractor":"Adcem","floorState":"3B+Z+30","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,null,1.0,1.0,1.0,1.0,0.0,"0.75",1.0,0.0,"0.35",1.0,0.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.7,0.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.5,0.1,1.0,0.0,null,0.5,null,0.25,0.8,null,0.05,null,null,null,null,null,null]},{"seq":29,"ada":2,"block":"L2","contractor":"Nevzatoğulları","floorState":"2B+Z+31","floorCount":34,"apartmentCount":132,"values":[1.0,1.0,0.5,null,1.0,1.0,1.0,0.5,1.0,1.0,null,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.8,null,0.9,null,0.8,0.9,0.9,1.0,1.0,0.5,0.8,null,0.25,null,null,null,null,null,null,null,null,null,null,null]},{"seq":30,"ada":2,"block":"M2","contractor":"Nevzatoğulları","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,null,null,1.0,0.9,1.0,null,null,0.9,null,0.4,1.0,null,1.0,1.0,1.0,1.0,0.6,1.0,0.6,0.7,0.7,null,null,null,1.0,null,1.0,1.0,0.5,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},{"seq":31,"ada":2,"block":"N2","contractor":"Adcem","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,0.5,null,0.25,0.8,1.0,0.05,null,null,null,null,null,null]},{"seq":32,"ada":2,"block":"O2","contractor":"Nevzatoğulları","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.9,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,0.8,null,0.25,null,0.4,null,null,null,null,null,null,null,null,null]},{"seq":33,"ada":2,"block":"P2","contractor":"Nevzatoğulları","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,null,0.9,0.9,1.0,1.0,1.0,0.8,null,0.25,null,null,null,null,null,null,null,null,null,null,null]},{"seq":34,"ada":2,"block":"R2","contractor":"Nevzatoğulları","floorState":"B+Z+32","floorCount":34,"apartmentCount":134,"values":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.9,1.0,1.0,null,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.8,0.9,0.9,1.0,1.0,1.0,0.8,null,0.25,null,null,null,null,null,null,null,null,null,null,null]}];
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
  ensureOfficeLogSheet_(ss);
  ensureProgressDefinitionsSheet_(ss);
  ensureProgressCurrentSheet_(ss);
  ensureProgressWeeklySheet_(ss);
  ensureProgressLogSheet_(ss);
  ensureProgressBaselineSnapshot_(ss);
  return "Akçalı Mekanik v5.2 kurulum tamam: "+ss.getName();
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

    if(action==="officeLogin")return json_(officeLogin_(payload));
    if(action==="officeDashboard")return json_(officeDashboard_(payload));
    if(action==="officeImage")return json_(officeImage_(payload));
    if(action==="officeDecision"){
      return json_(withLock_(()=>officeDecision_(payload)));
    }

    if(action==="progressData")return json_(progressData_(payload));
    if(action==="progressUpdateBulk")return json_(withLock_(()=>progressUpdateBulk_(payload)));
    if(action==="progressSnapshot")return json_(withLock_(()=>progressSnapshot_(payload)));
    if(action==="progressExport")return json_(progressExport_(payload));

    if(action==="createIssue"){
      return json_(withLock_(()=>createIssue_(payload.issue)));
    }

    if(action==="submitCorrection"){
      return json_(withLock_(()=>submitCorrection_(payload)));
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
  const values=s.getRange(4,1,rows,12).getDisplayValues();
  const col=n=>values.map(r=>String(r[n]||"").trim()).filter(Boolean);

  return {
    blocks:unique_(col(0)).length?unique_(col(0)):defaultConfig_().blocks,
    floors:unique_(col(1)).length?unique_(col(1)):defaultConfig_().floors,
    priorities:unique_(col(3)).length?unique_(col(3)):defaultConfig_().priorities,
    contractors:unique_(col(5)).length?unique_(col(5)):defaultConfig_().contractors,
    foremen:unique_(col(6)).length?unique_(col(6)):defaultConfig_().foremen,
    officeUsers:unique_(col(7)),
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
    officeUsers:[],
    issues:["Ters Eğim","Eksik Kelepçe","Montaj Hatası","Diğer"],
    terms:["1","2","3","5","7"]
  };
}

function unique_(arr){return Array.from(new Set(arr));}

function ensureDefinitionsSheet_(ss){
  let s=ss.getSheetByName(DEFINITIONS_SHEET);
  if(!s)s=ss.insertSheet(DEFINITIONS_SHEET);
  if(s.getMaxColumns()<12)s.insertColumnsAfter(s.getMaxColumns(),12-s.getMaxColumns());

  const headers=["BLOKLAR","KATLAR","SİSTEMLER","ÖNCELİKLER","DURUMLAR","TAŞERONLAR","FORMENLER","MEKANİK OFİS","HATA TÜRLERİ","TAŞERON PIN","TERMİN SÜRELERİ (GÜN)","MEKANİK OFİS PIN"];
  headers.forEach((h,i)=>{
    const cell=s.getRange(3,i+1);
    if(!cell.getValue())cell.setValue(h);
  });

  if(isRangeEmpty_(s,4,4,4,1))s.getRange(4,4,4,1).setValues([["Kritik"],["Yüksek"],["Normal"],["Düşük"]]);
  if(isRangeEmpty_(s,4,5,7,1))s.getRange(4,5,7,1).setValues([["Yeni Kayıt"],["Taşerona Atandı"],["Düzeltme Devam Ediyor"],["Kontrol Bekliyor"],["Uygun Değil – Tekrar Düzeltilecek"],["Kapandı"],["İptal / Mükerrer"]]);
  if(isRangeEmpty_(s,4,11,5,1))s.getRange(4,11,5,1).setValues([["1"],["2"],["3"],["5"],["7"]]);

  s.getRange(4,10,Math.max(1,s.getMaxRows()-3),1).setNumberFormat("@");
  s.getRange(4,12,Math.max(1,s.getMaxRows()-3),1).setNumberFormat("@");
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


/* ---------- MECHANICAL OFFICE AUTH ---------- */
function officeLogin_(payload){
  const officeUser=String(payload.officeUser||"").trim();
  const pin=String(payload.pin||"").trim();

  if(!officeUser)throw new Error("Mekanik ofis kullanıcısı seçilmedi.");
  if(!/^\d{4}$/.test(pin))throw new Error("PIN 4 haneli olmalı.");

  const savedPin=getOfficePin_(officeUser);
  if(!savedPin)throw new Error("Bu kullanıcı için Mekanik Ofis PIN'i tanımlı değil.");
  if(savedPin!==pin)throw new Error("PIN hatalı.");

  return {ok:true,officeUser,token:officeToken_(officeUser,savedPin)};
}

function getOfficePin_(officeUser){
  const ss=spreadsheet_();
  const s=ensureDefinitionsSheet_(ss);
  const last=Math.max(4,s.getLastRow());
  const values=s.getRange(4,8,last-3,5).getDisplayValues(); // H:L
  for(const r of values){
    if(String(r[0]||"").trim()===officeUser){
      const pin=String(r[4]||"").trim(); // L
      return /^\d{4}$/.test(pin)?pin:"";
    }
  }
  return "";
}

function officeToken_(officeUser,pin){
  const secret=ensureSecret_();
  const bytes=Utilities.computeHmacSha256Signature("office|"+officeUser+"|"+pin,secret);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/,"");
}

function validateOfficeToken_(officeUser,token){
  officeUser=String(officeUser||"").trim();
  token=String(token||"").trim();
  const pin=getOfficePin_(officeUser);
  if(!pin)throw new Error("Mekanik Ofis PIN'i tanımlı değil.");
  if(token!==officeToken_(officeUser,pin))throw new Error("Mekanik ofis oturumu geçersiz. Tekrar giriş yap.");
  return true;
}

/* ---------- MECHANICAL OFFICE DASHBOARD ---------- */
function officeDashboard_(payload){
  const officeUser=String(payload.officeUser||"").trim();
  validateOfficeToken_(officeUser,payload.token);

  const ss=spreadsheet_();
  const sheet=ensureTrackingSheet_(ss);
  const last=sheet.getLastRow();
  if(last<5){
    return {ok:true,dashboard:emptyDashboard_(),issues:[],generatedAt:new Date().toISOString()};
  }

  const values=sheet.getRange(5,1,last-4,29).getValues();
  const closedStatuses=["Kapandı","İptal / Mükerrer","İptal/Mükerrer"];
  const issues=[];
  const contractorStats={};
  const blockStats={};
  const issueStats={};

  let closedThisWeek=0;
  let closedDurationSum=0;
  let closedDurationCount=0;

  const now=new Date();
  const startWeek=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const day=(startWeek.getDay()+6)%7; // Pazartesi = 0
  startWeek.setDate(startWeek.getDate()-day);
  startWeek.setHours(0,0,0,0);

  values.forEach(r=>{
    const status=String(r[COL.STATUS-1]||"").trim();
    const created=r[COL.CREATED_AT-1];
    const closedAt=r[COL.CLOSED_AT-1];

    if(status==="Kapandı" && closedAt instanceof Date && !isNaN(closedAt.getTime())){
      if(closedAt>=startWeek)closedThisWeek++;
      if(created instanceof Date && !isNaN(created.getTime())){
        closedDurationSum += Math.max(0,(closedAt-created)/86400000);
        closedDurationCount++;
      }
    }

    if(closedStatuses.includes(status))return;

    const effectiveDue=effectiveDueFromRow_(r);
    const overdue=overdueDays_(effectiveDue,status);
    const contractor=String(r[COL.CONTRACTOR-1]||"").trim()||"Atanmamış";
    const block=String(r[COL.BLOCK-1]||"").trim()||"Belirsiz";
    const issueType=String(r[COL.ISSUE_TYPE-1]||"").trim()||"Diğer";

    if(!contractorStats[contractor])contractorStats[contractor]={name:contractor,open:0,overdue:0,waiting:0};
    contractorStats[contractor].open++;
    if(overdue>0)contractorStats[contractor].overdue++;
    if(status==="Kontrol Bekliyor")contractorStats[contractor].waiting++;

    blockStats[block]=(blockStats[block]||0)+1;
    issueStats[issueType]=(issueStats[issueType]||0)+1;

    issues.push({
      recordId:String(r[COL.RECORD_ID-1]||""),
      createdAt:iso_(r[COL.CREATED_AT-1]),
      reporter:String(r[COL.REPORTER-1]||""),
      block:String(r[COL.BLOCK-1]||""),
      floor:String(r[COL.FLOOR-1]||""),
      location:String(r[COL.LOCATION-1]||""),
      issueType:String(r[COL.ISSUE_TYPE-1]||""),
      note:String(r[COL.NOTE-1]||""),
      contractor:String(r[COL.CONTRACTOR-1]||""),
      foreman:String(r[COL.FOREMAN-1]||""),
      priority:String(r[COL.PRIORITY-1]||"Normal"),
      initialDueDate:iso_(r[COL.DUE_DATE-1]),
      newDueDate:iso_(r[COL.NEW_DUE_DATE-1]),
      dueDate:iso_(effectiveDue),
      status:status||"Taşerona Atandı",
      correctionNote:String(r[COL.CORRECTION_NOTE-1]||""),
      correctionAt:iso_(r[COL.CORRECTION_AT-1]),
      checkDate:iso_(r[COL.CHECK_DATE-1]),
      checker:String(r[COL.CHECKER-1]||""),
      checkResult:String(r[COL.CHECK_RESULT-1]||""),
      hasInitialPhoto:Boolean(String(r[COL.INITIAL_PHOTO-1]||"").trim()),
      hasCorrectionPhoto:Boolean(String(r[COL.CORRECTION_PHOTO-1]||"").trim()),
      overdueDays:overdue
    });
  });

  const weight={"Kritik":4,"Yüksek":3,"Normal":2,"Düşük":1};
  issues.sort((a,b)=>
    ((b.status==="Kontrol Bekliyor")-(a.status==="Kontrol Bekliyor"))||
    (Number(b.overdueDays)-Number(a.overdueDays))||
    ((weight[b.priority]||0)-(weight[a.priority]||0))||
    String(a.dueDate||"").localeCompare(String(b.dueDate||""))
  );

  const contractorBreakdown=Object.values(contractorStats)
    .sort((a,b)=>(b.overdue-a.overdue)||(b.open-a.open)||a.name.localeCompare(b.name))
    .slice(0,20);

  const byBlock=Object.entries(blockStats)
    .map(([name,count])=>({name,count}))
    .sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name))
    .slice(0,12);

  const byIssue=Object.entries(issueStats)
    .map(([name,count])=>({name,count}))
    .sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name))
    .slice(0,12);

  const dashboard={
    open:issues.length,
    overdue:issues.filter(x=>Number(x.overdueDays)>0).length,
    waiting:issues.filter(x=>x.status==="Kontrol Bekliyor").length,
    critical:issues.filter(x=>x.priority==="Kritik").length,
    closedThisWeek,
    averageCloseDays:closedDurationCount?Math.round((closedDurationSum/closedDurationCount)*10)/10:null,
    contractorBreakdown,
    byBlock,
    byIssue
  };

  return {ok:true,dashboard,issues,generatedAt:new Date().toISOString()};
}

function emptyDashboard_(){
  return {open:0,overdue:0,waiting:0,critical:0,closedThisWeek:0,averageCloseDays:null,contractorBreakdown:[],byBlock:[],byIssue:[]};
}

function effectiveDueFromRow_(r){
  const newer=r[COL.NEW_DUE_DATE-1];
  if(newer instanceof Date && !isNaN(newer.getTime()))return newer;
  return r[COL.DUE_DATE-1];
}

/* ---------- MECHANICAL OFFICE IMAGE ---------- */
function officeImage_(payload){
  const officeUser=String(payload.officeUser||"").trim();
  validateOfficeToken_(officeUser,payload.token);

  const recordId=String(payload.recordId||"").trim();
  const kind=String(payload.kind||"initial").trim();
  if(!recordId)throw new Error("Kayıt numarası eksik.");
  if(!["initial","correction"].includes(kind))throw new Error("Geçersiz fotoğraf türü.");

  const ss=spreadsheet_();
  const sheet=ensureTrackingSheet_(ss);
  const row=findByColumn_(sheet,COL.RECORD_ID,recordId,5);
  if(!row)throw new Error("Kayıt bulunamadı.");

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

/* ---------- MECHANICAL OFFICE DECISION ---------- */
function officeDecision_(payload){
  const officeUser=String(payload.officeUser||"").trim();
  validateOfficeToken_(officeUser,payload.token);

  const recordId=String(payload.recordId||"").trim();
  const decision=String(payload.decision||"").trim();
  const note=String(payload.note||"").trim();
  const termDays=payload.termDays===""||payload.termDays===null||payload.termDays===undefined?null:Number(payload.termDays);

  if(!recordId)throw new Error("Kayıt numarası eksik.");
  if(!["close","reject","newDue"].includes(decision))throw new Error("Geçersiz mekanik ofis işlemi.");
  if(note.length>250)throw new Error("Kontrol notu 250 karakteri geçemez.");

  const ss=spreadsheet_();
  const sheet=ensureTrackingSheet_(ss);
  const log=ensureOfficeLogSheet_(ss);
  const row=findByColumn_(sheet,COL.RECORD_ID,recordId,5);
  if(!row)throw new Error("Kayıt bulunamadı.");

  const oldStatus=String(sheet.getRange(row,COL.STATUS).getDisplayValue()||"").trim();
  if(["Kapandı","İptal / Mükerrer","İptal/Mükerrer"].includes(oldStatus))throw new Error("Bu kayıt zaten kapalı.");

  const now=new Date();
  let newStatus=oldStatus;
  let result="";
  let newDue=null;

  if(decision==="close"){
    if(oldStatus!=="Kontrol Bekliyor")throw new Error("Yalnız 'Kontrol Bekliyor' durumundaki iş onaylanıp kapatılabilir.");
    newStatus="Kapandı";
    result=note?("Uygun — "+note):"Uygun";
    sheet.getRange(row,COL.CLOSED_AT).setValue(now).setNumberFormat("dd.MM.yyyy HH:mm");
  }

  if(decision==="reject"){
    if(oldStatus!=="Kontrol Bekliyor")throw new Error("Yalnız 'Kontrol Bekliyor' durumundaki düzeltme reddedilebilir.");
    if(note.length<3)throw new Error("Red sebebi zorunlu.");
    if(!Number.isFinite(termDays)||termDays<0||termDays>365)throw new Error("Yeni termin seç.");
    newDue=new Date(now);
    newDue.setDate(newDue.getDate()+termDays);
    newStatus="Uygun Değil – Tekrar Düzeltilecek";
    result="Uygun Değil — "+note;
    sheet.getRange(row,COL.NEW_DUE_DATE).setValue(newDue).setNumberFormat("dd.MM.yyyy");
  }

  if(decision==="newDue"){
    if(note.length<3)throw new Error("Yeni termin sebebi zorunlu.");
    if(!Number.isFinite(termDays)||termDays<0||termDays>365)throw new Error("Yeni termin seç.");
    newDue=new Date(now);
    newDue.setDate(newDue.getDate()+termDays);
    sheet.getRange(row,COL.NEW_DUE_DATE).setValue(newDue).setNumberFormat("dd.MM.yyyy");
    if(oldStatus==="Kontrol Bekliyor")newStatus="Uygun Değil – Tekrar Düzeltilecek";
    result="Yeni Termin — "+note;
  }

  sheet.getRange(row,COL.STATUS).setValue(newStatus);
  sheet.getRange(row,COL.CHECK_DATE).setValue(now).setNumberFormat("dd.MM.yyyy HH:mm");
  sheet.getRange(row,COL.CHECKER).setValue(officeUser);
  sheet.getRange(row,COL.CHECK_RESULT).setValue(result);

  const existingExtra=String(sheet.getRange(row,COL.EXTRA_NOTE).getDisplayValue()||"").trim();
  const auditLine=Utilities.formatDate(now,TIMEZONE,"dd.MM.yyyy HH:mm")+" | "+officeUser+" | "+result;
  sheet.getRange(row,COL.EXTRA_NOTE).setValue(existingExtra?(existingExtra+"\n"+auditLine):auditLine);

  log.appendRow([
    now,recordId,officeUser,decision,oldStatus,newStatus,note,newDue||"",String(sheet.getRange(row,COL.CONTRACTOR).getDisplayValue()||"")
  ]);
  const lr=log.getLastRow();
  log.getRange(lr,1).setNumberFormat("dd.MM.yyyy HH:mm");
  if(newDue)log.getRange(lr,8).setNumberFormat("dd.MM.yyyy");

  return {
    ok:true,
    recordId,
    status:newStatus,
    decision,
    checkDate:now.toISOString(),
    newDueDate:newDue?newDue.toISOString():""
  };
}


/* ---------- WEEKLY PROGRESS ---------- */
function ensureProgressDefinitionsSheet_(ss){
  let s=ss.getSheetByName(PROGRESS_DEFINITIONS_SHEET);
  if(!s)s=ss.insertSheet(PROGRESS_DEFINITIONS_SHEET);
  if(s.getMaxColumns()<6)s.insertColumnsAfter(s.getMaxColumns(),6-s.getMaxColumns());
  s.getRange(1,1,1,6).setValues([["Kalem ID","Sıra","Kategori","İmalat Kalemi","Genel Merkez Kolonu","Olması Gereken Seviye"]]);

  if(s.getLastRow()<2 || !String(s.getRange(2,1).getDisplayValue()||"").trim()){
    s.getRange(2,1,PROGRESS_ITEMS.length,6).setValues(PROGRESS_ITEMS.map(x=>[x.id,x.order,x.category,x.name,x.hqCol,x.expected]));
  }
  return s;
}

function progressCurrentHeaders_(){
  return ["Sıra No","Ada No","İmalat Blok No","Mekanik Yüklenici","Blok Kat Durumu","Blok Kat Sayısı","Blok Daire Adet","GM Mekanik %","Son Güncelleme","Son Güncelleyen"]
    .concat(PROGRESS_ITEMS.map(x=>x.name));
}

function progressNumericForUi_(v){
  if(v===""||v===null||v===undefined)return null;
  const n=Number(v);
  return Number.isFinite(n)?n:null;
}

function progressBlockPercent_(rawValues){
  const sum=(rawValues||[]).reduce((a,v)=>a+(typeof v==="number"&&isFinite(v)?v:0),0);
  if(Math.abs(sum-PROGRESS_DENOMINATOR)<0.000001)return 100;
  return sum/PROGRESS_DENOMINATOR*100;
}

function ensureProgressCurrentSheet_(ss){
  let s=ss.getSheetByName(PROGRESS_CURRENT_SHEET);
  if(!s)s=ss.insertSheet(PROGRESS_CURRENT_SHEET);
  const cols=10+PROGRESS_ITEMS.length;
  if(s.getMaxColumns()<cols)s.insertColumnsAfter(s.getMaxColumns(),cols-s.getMaxColumns());
  s.getRange(1,1,1,cols).setValues([progressCurrentHeaders_()]);

  if(s.getLastRow()<2 || !String(s.getRange(2,3).getDisplayValue()||"").trim()){
    const seedDate=new Date(PROGRESS_BASELINE_DATE);
    const rows=PROGRESS_BLOCK_SEED.map(b=>[
      b.seq,b.ada,b.block,b.contractor,b.floorState,b.floorCount,b.apartmentCount,
      progressBlockPercent_(b.values),seedDate,"Genel Merkez Başlangıç"
    ].concat(b.values.map(v=>v===null?"":v)));
    s.getRange(2,1,rows.length,cols).setValues(rows);
    s.getRange(2,8,rows.length,1).setNumberFormat("0.00");
    s.getRange(2,9,rows.length,1).setNumberFormat("dd.MM.yyyy HH:mm");
  }
  return s;
}

function ensureProgressWeeklySheet_(ss){
  let s=ss.getSheetByName(PROGRESS_WEEKLY_SHEET);
  if(!s)s=ss.insertSheet(PROGRESS_WEEKLY_SHEET);
  const cols=7+PROGRESS_ITEMS.length;
  if(s.getMaxColumns()<cols)s.insertColumnsAfter(s.getMaxColumns(),cols-s.getMaxColumns());
  s.getRange(1,1,1,cols).setValues([["Hafta","Snapshot Zamanı","Kaydeden","Genel Mekanik %","Blok","Mekanik Yüklenici","Blok Mekanik %"].concat(PROGRESS_ITEMS.map(x=>x.name))]);
  return s;
}

function ensureProgressLogSheet_(ss){
  let s=ss.getSheetByName(PROGRESS_LOG_SHEET);
  if(!s)s=ss.insertSheet(PROGRESS_LOG_SHEET);
  if(s.getMaxColumns()<10)s.insertColumnsAfter(s.getMaxColumns(),10-s.getMaxColumns());
  s.getRange(1,1,1,10).setValues([["İşlem Zamanı","Hafta","Mekanik Ofis","Blok","Kalem ID","İmalat Kalemi","Önceki %","Yeni %","Fark %","Not"]]);
  return s;
}

function currentProgressBlocks_(ss){
  const s=ensureProgressCurrentSheet_(ss);
  const rows=Math.max(0,s.getLastRow()-1);
  if(!rows)return [];
  const data=s.getRange(2,1,rows,10+PROGRESS_ITEMS.length).getValues();
  return data.filter(r=>String(r[2]||"").trim()).map(r=>{
    const raw=r.slice(10,10+PROGRESS_ITEMS.length);
    return {
      seq:Number(r[0]||0),ada:Number(r[1]||0),block:String(r[2]||"").trim(),contractor:String(r[3]||"").trim(),
      floorState:String(r[4]||"").trim(),floorCount:Number(r[5]||0),apartmentCount:Number(r[6]||0),
      updatedAt:iso_(r[8]),updatedBy:String(r[9]||"").trim(),
      rawValues:raw,
      values:raw.map(progressNumericForUi_),
      mechanical:progressBlockPercent_(raw)
    };
  });
}

function progressOverallPercent_(blocks){
  if(!blocks||!blocks.length)return 0;
  return blocks.reduce((a,b)=>a+progressBlockPercent_(b.rawValues||b.values||[]),0)/blocks.length;
}

function isoWeekInfo_(date){
  const ymd=Utilities.formatDate(date,TIMEZONE,"yyyy-MM-dd").split("-").map(Number);
  const d=new Date(Date.UTC(ymd[0],ymd[1]-1,ymd[2]));
  const day=d.getUTCDay()||7;
  d.setUTCDate(d.getUTCDate()+4-day);
  const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const week=Math.ceil((((d-yearStart)/86400000)+1)/7);
  const year=d.getUTCFullYear();
  return {year,week,key:year+"-W"+String(week).padStart(2,"0")};
}

function findProgressSnapshotRows_(sheet,weekKey){
  const last=sheet.getLastRow();
  if(last<2)return [];
  const vals=sheet.getRange(2,1,last-1,1).getDisplayValues().flat();
  const rows=[];vals.forEach((v,i)=>{if(String(v||"").trim()===weekKey)rows.push(i+2);});
  return rows;
}

function snapshotBlocksForWeek_(ss,weekKey){
  const sheet=ensureProgressWeeklySheet_(ss);
  const rowNums=findProgressSnapshotRows_(sheet,weekKey);
  if(!rowNums.length)return [];
  const rows=sheet.getRange(rowNums[0],1,rowNums.length,7+PROGRESS_ITEMS.length).getValues();
  return rows.map(r=>{
    const raw=r.slice(7,7+PROGRESS_ITEMS.length);
    return {
      block:String(r[4]||"").trim(),contractor:String(r[5]||"").trim(),
      rawValues:raw,values:raw.map(progressNumericForUi_),mechanical:progressBlockPercent_(raw)
    };
  });
}

function progressHistorySummary_(ss){
  const sheet=ensureProgressWeeklySheet_(ss);
  const last=sheet.getLastRow();if(last<2)return [];
  const rows=sheet.getRange(2,1,last-1,4).getValues();
  const map={};
  rows.forEach(r=>{
    const key=String(r[0]||"").trim();
    if(key&&!map[key])map[key]={weekKey:key,snapshotAt:iso_(r[1]),createdBy:String(r[2]||""),overall:Number(r[3]||0)};
  });
  return Object.values(map).sort((a,b)=>b.weekKey.localeCompare(a.weekKey)).slice(0,16);
}

function previousProgressSnapshot_(ss,currentWeekKey){
  const history=progressHistorySummary_(ss).sort((a,b)=>a.weekKey.localeCompare(b.weekKey));
  const summary=history.filter(x=>x.weekKey<currentWeekKey).pop()||history.filter(x=>x.weekKey!==currentWeekKey).pop()||null;
  return summary?{summary,blocks:snapshotBlocksForWeek_(ss,summary.weekKey)}:{summary:null,blocks:[]};
}

function writeProgressSnapshot_(sheet,weekKey,snapshotAt,officeUser,blocks,overwrite){
  const existing=findProgressSnapshotRows_(sheet,weekKey);
  const overall=progressOverallPercent_(blocks);
  const rows=blocks.map(b=>[
    weekKey,snapshotAt,officeUser,overall,b.block,b.contractor,progressBlockPercent_(b.rawValues||b.values)
  ].concat((b.rawValues||b.values).map(v=>v===null?"":v)));

  if(existing.length){
    if(!overwrite)throw new Error("Bu hafta daha önce kaydedilmiş.");
    if(existing.length!==rows.length)throw new Error("Mevcut hafta snapshot satır sayısı beklenenden farklı.");
    sheet.getRange(existing[0],1,rows.length,7+PROGRESS_ITEMS.length).setValues(rows);
    sheet.getRange(existing[0],2,rows.length,1).setNumberFormat("dd.MM.yyyy HH:mm");
    return;
  }
  const start=Math.max(sheet.getLastRow()+1,2);
  sheet.getRange(start,1,rows.length,7+PROGRESS_ITEMS.length).setValues(rows);
  sheet.getRange(start,2,rows.length,1).setNumberFormat("dd.MM.yyyy HH:mm");
}

function ensureProgressBaselineSnapshot_(ss){
  const weekly=ensureProgressWeeklySheet_(ss);
  if(findProgressSnapshotRows_(weekly,PROGRESS_BASELINE_WEEK).length)return;
  const blocks=PROGRESS_BLOCK_SEED.map(b=>({block:b.block,contractor:b.contractor,rawValues:b.values,values:b.values.map(progressNumericForUi_)}));
  writeProgressSnapshot_(weekly,PROGRESS_BASELINE_WEEK,new Date(PROGRESS_BASELINE_DATE),"Genel Merkez Başlangıç",blocks,false);
}

function progressCategorySummary_(blocks,previousBlocks){
  const categories={};
  PROGRESS_ITEMS.forEach((item,idx)=>{
    if(!categories[item.category])categories[item.category]={name:item.category,current:0,previous:0,expected:0};
    const c=categories[item.category];c.expected+=Number(item.expected||0);
    blocks.forEach(b=>{const v=b.rawValues[idx];if(typeof v==="number"&&isFinite(v))c.current+=v;});
    previousBlocks.forEach(b=>{const v=b.rawValues[idx];if(typeof v==="number"&&isFinite(v))c.previous+=v;});
  });
  return Object.values(categories).map(c=>({
    name:c.name,
    percent:c.expected?c.current/c.expected*100:0,
    previousPercent:c.expected?c.previous/c.expected*100:0
  })).sort((a,b)=>a.name.localeCompare(b.name,"tr"));
}

function progressContractorSummary_(blocks,previousBlocks){
  const prev={};previousBlocks.forEach(b=>prev[b.block]=b);
  const map={};
  blocks.forEach(b=>{
    const name=b.contractor||"Belirsiz";
    if(!map[name])map[name]={name,count:0,current:0,previous:0};
    map[name].count++;
    map[name].current+=progressBlockPercent_(b.rawValues);
    const pb=prev[b.block];
    map[name].previous+=pb?progressBlockPercent_(pb.rawValues):progressBlockPercent_(b.rawValues);
  });
  return Object.values(map).map(x=>({
    name:x.name,count:x.count,percent:x.current/x.count,previousPercent:x.previous/x.count
  })).sort((a,b)=>b.percent-a.percent||a.name.localeCompare(b.name,"tr"));
}

function progressData_(payload){
  const officeUser=String(payload.officeUser||"").trim();
  validateOfficeToken_(officeUser,payload.token);
  const ss=spreadsheet_();
  ensureProgressDefinitionsSheet_(ss);ensureProgressCurrentSheet_(ss);ensureProgressWeeklySheet_(ss);ensureProgressLogSheet_(ss);ensureProgressBaselineSnapshot_(ss);

  const week=isoWeekInfo_(new Date());
  const blocks=currentProgressBlocks_(ss);
  const previous=previousProgressSnapshot_(ss,week.key);
  const prevMap={};previous.blocks.forEach(b=>prevMap[b.block]=b);

  let changedBlocks=0,changedItems=0;
  const publicBlocks=blocks.map(b=>{
    const pb=prevMap[b.block];
    const prevValues=pb?pb.values:b.values.slice();
    let changedCount=0;
    b.values.forEach((v,i)=>{
      const pv=prevValues[i];
      if(v===null&&pv===null)return;
      if(Math.abs(Number(v||0)-Number(pv||0))>0.00001)changedCount++;
    });
    if(changedCount)changedBlocks++;changedItems+=changedCount;
    const previousMechanical=pb?progressBlockPercent_(pb.rawValues):b.mechanical;
    return {
      seq:b.seq,ada:b.ada,block:b.block,contractor:b.contractor,floorState:b.floorState,floorCount:b.floorCount,apartmentCount:b.apartmentCount,
      updatedAt:b.updatedAt,updatedBy:b.updatedBy,values:b.values,previousValues:prevValues,
      mechanical:b.mechanical,previousMechanical,delta:b.mechanical-previousMechanical,changedCount
    };
  });

  const overall=progressOverallPercent_(blocks);
  const previousOverall=previous.blocks.length?progressOverallPercent_(previous.blocks):overall;
  const history=progressHistorySummary_(ss);
  return {
    ok:true,week,baseline:previous.summary,currentSnapshot:history.find(x=>x.weekKey===week.key)||null,
    overall,previousOverall,delta:overall-previousOverall,changedBlocks,changedItems,
    items:PROGRESS_ITEMS.map(x=>({id:x.id,order:x.order,name:x.name,category:x.category,expected:x.expected,hqCol:x.hqCol})),
    blocks:publicBlocks,categories:progressCategorySummary_(blocks,previous.blocks),contractors:progressContractorSummary_(blocks,previous.blocks),
    history,generatedAt:new Date().toISOString()
  };
}

function progressUpdateBulk_(payload){
  const officeUser=String(payload.officeUser||"").trim();
  validateOfficeToken_(officeUser,payload.token);
  const block=String(payload.block||"").trim(),changes=Array.isArray(payload.changes)?payload.changes:[];
  if(!block)throw new Error("Blok seçilmedi.");if(!changes.length)throw new Error("Kaydedilecek değişiklik yok.");
  if(changes.length>PROGRESS_ITEMS.length)throw new Error("Çok fazla değişiklik.");

  const ss=spreadsheet_(),sheet=ensureProgressCurrentSheet_(ss),log=ensureProgressLogSheet_(ss);
  const last=sheet.getLastRow(),blocks=sheet.getRange(2,3,Math.max(0,last-1),1).getDisplayValues().flat();
  const ix=blocks.findIndex(v=>String(v||"").trim()===block);if(ix<0)throw new Error("Blok bulunamadı.");
  const row=ix+2,current=sheet.getRange(row,11,1,PROGRESS_ITEMS.length).getValues()[0];
  const week=isoWeekInfo_(new Date()).key,now=new Date(),logs=[];

  changes.forEach(ch=>{
    const itemId=String(ch.itemId||"").trim(),idx=PROGRESS_ITEMS.findIndex(x=>x.id===itemId);
    if(idx<0)throw new Error("Geçersiz imalat kalemi.");
    const raw=current[idx];
    if(raw===""||raw===null||raw===undefined)throw new Error(PROGRESS_ITEMS[idx].name+" bu blok için uygulanmıyor.");

    const oldValue=Number(raw),value=Number(ch.value),note=String(ch.note||"").trim();
    if(!Number.isFinite(oldValue))throw new Error("Mevcut ilerleme değeri okunamadı.");
    if(!Number.isFinite(value)||value<0||value>1)throw new Error("İlerleme %0 ile %100 arasında olmalı.");
    if(Math.abs(value*20-Math.round(value*20))>0.0001)throw new Error("İlerleme %5 adımlarla girilmeli.");
    if(value<oldValue-0.00001&&note.length<3)throw new Error("Geri düşüşte açıklama zorunlu: "+PROGRESS_ITEMS[idx].name);
    if(note.length>160)throw new Error("İlerleme notu 160 karakteri geçemez.");
    if(Math.abs(value-oldValue)<0.00001)return;

    current[idx]=value; // any edited imported text value becomes a normal number from now on.
    sheet.getRange(row,11+idx).setValue(value).setNumberFormat("0.00");
    logs.push([now,week,officeUser,block,itemId,PROGRESS_ITEMS[idx].name,oldValue*100,value*100,(value-oldValue)*100,note]);
  });

  if(!logs.length)return {ok:true,changed:0,block};
  const mechanical=progressBlockPercent_(current);
  sheet.getRange(row,8).setValue(mechanical).setNumberFormat("0.00");
  sheet.getRange(row,9).setValue(now).setNumberFormat("dd.MM.yyyy HH:mm");
  sheet.getRange(row,10).setValue(officeUser);

  const start=log.getLastRow()+1;log.getRange(start,1,logs.length,10).setValues(logs);
  log.getRange(start,1,logs.length,1).setNumberFormat("dd.MM.yyyy HH:mm");
  log.getRange(start,7,logs.length,3).setNumberFormat('0.00"%"');
  return {ok:true,changed:logs.length,block,mechanical};
}

function progressSnapshot_(payload){
  const officeUser=String(payload.officeUser||"").trim();validateOfficeToken_(officeUser,payload.token);
  const ss=spreadsheet_(),week=isoWeekInfo_(new Date()).key,blocks=currentProgressBlocks_(ss);
  writeProgressSnapshot_(ensureProgressWeeklySheet_(ss),week,new Date(),officeUser,blocks,Boolean(payload.overwrite));
  return {ok:true,weekKey:week,overall:progressOverallPercent_(blocks),overwrite:Boolean(payload.overwrite)};
}

function progressExport_(payload){
  const officeUser=String(payload.officeUser||"").trim();validateOfficeToken_(officeUser,payload.token);
  const ss=spreadsheet_(),weekKey=String(payload.weekKey||"").trim()||isoWeekInfo_(new Date()).key;
  const blocks=snapshotBlocksForWeek_(ss,weekKey);if(!blocks.length)throw new Error("Önce "+weekKey+" haftasını kaydet.");

  const meta={};currentProgressBlocks_(ss).forEach(b=>meta[b.block]=b);
  const temp=SpreadsheetApp.create("AKÇALI Mekanik İlerleme "+weekKey),sheet=temp.getSheets()[0];
  sheet.setName("GENEL");
  if(sheet.getMaxColumns()<56)sheet.insertColumnsAfter(sheet.getMaxColumns(),56-sheet.getMaxColumns());
  if(sheet.getMaxRows()<40)sheet.insertRowsAfter(sheet.getMaxRows(),40-sheet.getMaxRows());

  sheet.getRange("B2:G4").merge();
  sheet.getRange("B2").setValue("AKÇALI KONUT PROJESİ\nMEKANİK TESİSAT İŞLERİ\nİLERLEME DURUMU\n"+weekKey)
    .setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);

  sheet.getRange("H2:H4").setValues([["Yüzde"],["Olması Gereken Seviye"],["Seviye"]]);
  sheet.getRange("I3").setValue(3400);
  sheet.getRange("I2").setFormula("=I4/I3").setNumberFormat("0.00%");
  sheet.getRange("I4").setFormula("=SUM(I7:I40)");

  const pctFormulas=[],sumFormulas=[];
  PROGRESS_ITEMS.forEach(item=>{
    pctFormulas.push("="+item.hqCol+"4/"+item.hqCol+"3");
    sumFormulas.push("=SUM("+item.hqCol+"7:"+item.hqCol+"40)");
  });
  sheet.getRange(2,10,1,PROGRESS_ITEMS.length).setFormulas([pctFormulas]).setNumberFormat("0.00%");
  sheet.getRange(3,10,1,PROGRESS_ITEMS.length).setValues([PROGRESS_ITEMS.map(x=>x.expected)]);
  sheet.getRange(4,10,1,PROGRESS_ITEMS.length).setFormulas([sumFormulas]);

  sheet.getRange(5,2,1,8).setValues([["Sıra No","Ada No","İmalat Blok No","Mekanik Yüklenici","Blok Kat Durumu","Blok Kat Sayısı","Blok Daire Adet","Mekanik "]]);
  sheet.getRange(5,10,1,PROGRESS_ITEMS.length).setValues([PROGRESS_ITEMS.map(x=>x.hqName)]);

  const dataRows=blocks.map((b,i)=>{
    const m=meta[b.block]||{};
    return [m.seq||i+1,m.ada||"",b.block,b.contractor||m.contractor||"",m.floorState||"",m.floorCount||"",m.apartmentCount||""]
      .concat((b.rawValues||[]).map(v=>v===null?"":v));
  });
  // B:H metadata + J:BD progress; I is formula.
  sheet.getRange(7,2,dataRows.length,7).setValues(dataRows.map(r=>r.slice(0,7)));
  sheet.getRange(7,10,dataRows.length,PROGRESS_ITEMS.length).setValues(dataRows.map(r=>r.slice(7)));

  const mechFormulas=blocks.map((_,i)=>{
    const row=7+i;
    return ['=IF(SUM(J'+row+':BD'+row+')=48,100,SUM(J'+row+':BD'+row+')/48*100)'];
  });
  sheet.getRange(7,9,blocks.length,1).setFormulas(mechFormulas).setNumberFormat("0.00");

  sheet.getRange(5,2,1,8+PROGRESS_ITEMS.length).setFontWeight("bold").setBackground("#D9E2F3").setWrap(true);
  sheet.getRange(2,8,3,1+PROGRESS_ITEMS.length).setBackground("#F2F2F2");
  sheet.setFrozenRows(5);sheet.setFrozenColumns(9);
  sheet.setColumnWidths(2,8,95);sheet.setColumnWidths(10,PROGRESS_ITEMS.length,120);sheet.setRowHeight(5,70);
  SpreadsheetApp.flush();

  const exportUrl="https://docs.google.com/spreadsheets/d/"+temp.getId()+"/export?format=xlsx";
  const response=UrlFetchApp.fetch(exportUrl,{headers:{Authorization:"Bearer "+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
  if(response.getResponseCode()!==200){DriveApp.getFileById(temp.getId()).setTrashed(true);throw new Error("Excel raporu oluşturulamadı.");}
  const fileName="AKCALI_Mekanik_Ilerleme_"+weekKey+".xlsx",blob=response.getBlob().setName(fileName);
  const base64=Utilities.base64Encode(blob.getBytes());DriveApp.getFileById(temp.getId()).setTrashed(true);
  return {ok:true,weekKey,fileName,mime:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",base64};
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


function ensureOfficeLogSheet_(ss){
  let s=ss.getSheetByName(OFFICE_LOG_SHEET);
  if(!s)s=ss.insertSheet(OFFICE_LOG_SHEET);
  if(s.getMaxColumns()<9)s.insertColumnsAfter(s.getMaxColumns(),9-s.getMaxColumns());
  if(!s.getRange(1,1).getValue()){
    s.getRange(1,1,1,9).setValues([[
      "İşlem Zamanı","Kayıt No","Mekanik Ofis","İşlem","Önceki Durum","Yeni Durum","Açıklama","Yeni Termin","Taşeron"
    ]]);
  }
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