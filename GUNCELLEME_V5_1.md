# Akçalı Mekanik v5.1 — Mekanik Ofis Arama / Filtreleme

## Eklenenler
Mekanik Ofis → Saha İşleri alanına arama ve filtreleme eklendi.

### Hızlı arama
Şu alanlarda beraber arar:
- Kayıt No
- Bildiren
- Blok / Kat / Mahal
- Hata Türü
- Kısa Açıklama
- Taşeron
- Formen
- Öncelik
- Durum
- Düzeltme Açıklaması

Türkçe karakter toleransı vardır. Örneğin `nevzatogullari`, `NEVZATOĞULLARI` kaydını bulur.

### Açılır filtreler
- Taşeron
- Blok
- Durum
- Öncelik
- Hata Türü

### Hızlı filtreler korunur
- Açıkların Tümü
- Kontrol Bekliyor
- Gecikmiş
- Kritik / Yüksek

Hızlı ve detay filtreler birlikte çalışabilir.

### Kontrollü kullanım
- Sonuç sayısı görünür.
- Aktif filtre sayısı görünür.
- Tek tuşla tüm filtreler temizlenir.
- Sonuç bulunamazsa temizleme butonu çıkar.
- Filtreleme telefonun indirdiği ofis verisi üzerinde çalışır; her aramada Apps Script'e istek atmaz.
- Offline durumda son indirilen ofis verisi aranabilir.

## Güncelleme
Yalnız GitHub:
- index.html
- styles.css
- app.js
- sw.js

Backend değişmedi. Apps Script `setup()` veya yeniden `Deploy` gerekmez.
