# v3.5 → v4.0 GÜNCELLEME

## 1. Önce mevcut Google Sheet'in bir kopyasını al
Bu işlem önerilir; canlı veriyi korumak için yedek iyi pratiktir.

## 2. GitHub
v4 paketinden şu dosyaları repository'deki dosyaların üzerine yükle:
- index.html
- styles.css
- app.js
- sw.js
- manifest.webmanifest
- apple-touch-icon.png
- icon-192.png
- icon-512.png

Commit changes yap.

## 3. Apps Script
Google Sheet → Uzantılar → Apps Script:
- Eski backend kodunu sil
- v4 paketindeki `backend.gs` içeriğini yapıştır
- Kaydet
- Fonksiyon listesinden `setup` seç
- Bir kez Çalıştır

`setup()` şunları hazırlar:
- TANIMLAR J: TAŞERON PIN
- TANIMLAR K: TERMİN SÜRELERİ (GÜN)
- ANA TAKİP yeni v4 sütunları
- DÜZELTME GEÇMİŞİ sayfası
- Taşeron oturum tokenı için gizli sunucu anahtarı

## 4. Web App deployment'ını güncelle
Apps Script:
Deploy → Manage deployments → mevcut Web App → Edit → New version → Deploy

Mevcut `/exec` URL'sini koru.

## 5. PIN'leri gir
Google Sheet → TANIMLAR:
- F sütununda firma adı
- aynı satır J sütununda 4 haneli PIN

Örnek:
F4 = ABC Mekanik
J4 = 1357

F5 = XYZ Tesisat
J5 = 2468

Her firmaya farklı PIN önerilir.

## 6. Termin seçenekleri
TANIMLAR K sütununa gün olarak yaz:
1
2
3
5
7

İstersen 0 da kullanabilirsin; bu `Aynı Gün` olarak görünür.

## 7. Telefonda
- Uygulamayı internet açıkken aç
- v4.0 göründüğünü kontrol et
- Ayarlar → Listeleri Güncelle
- Yeni Hata test kaydı oluştur
- Taşeron Girişi → firma + PIN ile test et
- Düzeltme bildir → fotoğraf + açıklama gönder
- ANA TAKİP'te durumun `Kontrol Bekliyor` olduğunu doğrula
- DÜZELTME GEÇMİŞİ sayfasına satır düştüğünü doğrula
