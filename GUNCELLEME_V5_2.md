# Akçalı Mekanik v5.2 — Haftalık İlerleme

Genel merkez dosyası uygulamaya başlangıç verisi olarak işlendi:
- 34 blok
- 47 görünür mekanik imalat kalemi
- Başlangıç snapshot: 2026-W33 / 15.08.2026
- Genel merkez başlangıç değeri: %67.395833
- Blok Mekanik formülündeki `48` paydası aynen korunur.
- K2'deki iki metin-değer de Excel'in mevcut SUM davranışını koruyacak şekilde aynen taşınır.

## Kullanım
Mekanik Ofis Dashboard → HAFTALIK İLERLEME

### Ana ekran
- Genel Mekanik %
- Önceki haftaya göre fark
- Bu hafta değişen blok / kalem sayısı
- Sistem özeti
- Yüklenici özeti
- Blok kartları
- Hafta geçmişi

### Blok ekranı
Kullanıcı tüm matrisi görmez.
- Önce blok seçilir.
- O blokta Excel'de boş olan/uygulanmayan kalemler gösterilmez.
- Varsayılan filtre: yalnız eksik kalemler.
- Kalemler kategori başlıklarında katlanır.
- Eksikler / Bu Hafta Değişen / Tamamlanan / Tümü.
- Arama.

### Seviye girişi
- %0 / %25 / %50 / %75 / %100
- ±%5
- Slider %5 adım
- Önceki hafta değeri ekranda
- Bir bloktaki değişiklikler önce taslak, sonra tek gönderim
- Taslaklar internet yokken telefonda kalır
- Geri düşüşte açıklama zorunlu
- Backend %0–100 ve %5 adım kuralını doğrular

### Haftalık snapshot
HAFTAYI KAYDET 34 bloğun o haftaki durumunu İLERLEME HAFTALIK sayfasına yazar.
Mevcut haftayı yeniden kaydetmek açık kullanıcı onayı ister.

### Excel raporu
Kaydedilmiş haftalar genel merkezin satır/kolon yapısına yakın `.xlsx` olarak üretilir.
Raporda:
- Yüzde / Olması Gereken Seviye / Seviye satırları
- Genel merkez formülleri
- 34 blok
- 47 imalat kalemi
- Mekanik % formülü `SUM(J:BD)/48*100`
bulunur.

## Yeni Google Sheet sayfaları
- İLERLEME TANIMLAR
- İLERLEME GÜNCEL
- İLERLEME HAFTALIK
- İLERLEME DEĞİŞİKLİK

setup() yalnız sayfa boşsa başlangıç verisini yazar; ileride tekrar setup çalıştırmak mevcut ilerleme değerlerini sıfırlamaz.

## Yayın
GitHub: index.html, styles.css, app.js, sw.js
Apps Script: backend.gs
Sonra New version → Deploy ve bir kez setup().
