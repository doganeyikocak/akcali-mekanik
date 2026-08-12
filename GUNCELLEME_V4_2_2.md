# Akçalı Mekanik v4.2.2 — `Load failed` ve Gönderim İptali

## Düzeltme
iPhone ana-ekran PWA'sında Apps Script POST isteği sunucuya ulaşsa bile Google yönlendirme cevabı
bazen `Load failed` ile okunamayabiliyor.

v4.2.2:
- kaydı localId ile ayrıca sunucudan doğrular,
- sunucuda varsa ikinci kayıt üretmeden telefon kuyruğunu temizler,
- normal POST cevabı okunamazsa `no-cors` gönderim + JSONP doğrulama uygular,
- mevcut backend localId mükerrer kontrolünü korur.

## GÖNDERİMİ İPTAL ET
Gönderilmemiş hata ve düzeltme kartlarında yeni buton vardır.

- Önce kayıt bulutta mı kontrol edilir.
- Bulutta zaten varsa Google Sheet kaydı silinmez; yalnız yanlış kalmış telefon kuyruğu temizlenir.
- Bulutta yoksa onay sorulur.
- Onay verilirse yerel kayıt telefondan silinir ve bir daha gönderilmez.

## Güncelleme
GitHub:
- index.html
- styles.css
- app.js
- sw.js

Apps Script:
- backend.gs

Backend değiştiği için mevcut Web App:
Deploy → Manage deployments → Edit → New version → Deploy

Mevcut /exec URL aynı kalmalıdır.
