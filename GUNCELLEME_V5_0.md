# Akçalı Mekanik v5.0 — Mekanik Ofis + Dashboard

## Eklenen Modül 1: Mekanik Ofis
- Ana ekranda `MEKANİK OFİS` girişi.
- H sütunundaki mekanik ofis kullanıcıları için firma benzeri 4 haneli PIN girişi.
- Yeni PIN sütunu: `TANIMLAR!L3 = MEKANİK OFİS PIN`.
- H ve L aynı satırda eşleşir. Örnek: H4 `Doğan` → L4 `4821`.
- PIN config API ile telefona gönderilmez; doğrulama sunucuda yapılır.
- Telefon oturumu hatırlayabilir; PIN değişirse eski token geçersiz olur.
- Tüm açık işleri görür.
- İlk hata ve düzeltme fotoğrafını uygulama içinde güvenli olarak görür.
- `Kontrol Bekliyor` iş için:
  - ONAYLA VE KAPAT
  - REDDET + YENİ TERMİN
- Açık işe `YENİ TERMİN VER`.
- Red / yeni termin sebebi zorunlu.
- Kapanış, kontrol eden, kontrol tarihi, kontrol sonucu ve yeni termin ANA TAKİP'e yazılır.
- Tüm ofis kararları `OFİS İŞLEM GEÇMİŞİ` sayfasına ayrıca loglanır.
- Taşeron kendi işini kapatamaz; bu kural korunur.

## Eklenen Modül 2: Dashboard
- Açık iş sayısı
- Gecikmiş iş
- Kontrol bekleyen iş
- Kritik iş
- Bu hafta kapanan iş
- Ortalama kapanma süresi
- Taşeron bazında açık / gecikmiş / kontrol bekleyen
- Blok bazında açık iş
- Hata türü bazında açık iş
- Dashboard kartlarına dokunarak Tümü / Kontrol Bekliyor / Gecikmiş / Kritik-Yüksek filtreleme
- Offline durumda telefondaki son dashboard gösterilir.

## Ek güvenilirlik düzeltmesi
v4.2.2 backend'inde `createIssue` ve `submitCorrection` işlemleri Apps Script'ten ham JavaScript nesnesi döndürebiliyordu.
Bu, Sheet'e kayıt yazıldığı halde telefonda `Load failed` görülmesine yol açabilecek bir hataydı.

v5.0'da her iki işlem de kesin olarak `ContentService` JSON cevabı döndürür:
- createIssue → json_(...)
- submitCorrection → json_(...)

v4.2.2'deki localId doğrulama / no-cors fallback sistemi de korunmuştur.

## TANIMLAR
Mevcut kolonlar korunur. Yeni kolon:
- L3: `MEKANİK OFİS PIN`

Mekanik ofis kullanıcısı H sütununda hangi satırdaysa PIN'i L sütununda aynı satıra yaz.

## Güncelleme
GitHub:
- index.html
- styles.css
- app.js
- sw.js

Apps Script:
- backend.gs

Backend değiştiği için mevcut Web App deployment:
Deploy → Manage deployments → Edit → New version → Deploy

Mevcut /exec URL değişmemelidir.
