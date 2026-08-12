# Akçalı Mekanik v4.2.1 — Gönderilmiş kaydın bekleyenlerde kalması düzeltmesi

## Düzeltilen hata
v4.2'de tüm API isteklerine 15 saniyelik zaman aşımı uygulanıyordu.
Fotoğraflı kayıt Google Apps Script / Drive tarafında 15 saniyeden uzun sürerse:
- kayıt Google Sheet'e ulaşabiliyor,
- fakat telefon sunucu cevabını almadan isteği kesiyordu,
- bu yüzden yerel kayıt `Gönderilmemiş` olarak kalabiliyordu.

## v4.2.1
- Hata fotoğrafı yüklemeli `createIssue`: 120 saniye
- Düzeltme fotoğrafı yüklemeli `submitCorrection`: 120 saniye
- Güvenli taşeron fotoğrafı alma: 60 saniye
- Hafif API çağrıları: 20 saniye
- Backend'deki `localId` mükerrer kontrolü sayesinde daha önce Sheet'e düşmüş bekleyen kayıt tekrar senkronize edildiğinde ikinci kayıt oluşturulmaz; yerel kayıt `synced` durumuna geçirilir.
- Ana kayıt butonu yine telefonu bekletmez: kayıt önce IndexedDB'ye yazılır, ekran hemen döner, bulut gönderimi arka planda devam eder.

## Güncellenecek GitHub dosyaları
- index.html
- app.js
- sw.js

Apps Script backend değişmedi; yeniden deploy gerekmez.
