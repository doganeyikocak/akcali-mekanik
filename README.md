# Akçalı Mekanik – iPhone / Android Offline PWA v2

Bu paket iPhone ana ekranına kurulabilen, sahada internet yokken fotoğraflı hata kaydı açabilen PWA sürümüdür.

## Bu sürümde eklenenler
- iPhone `apple-touch-icon`
- iOS ana ekran / standalone meta ayarları
- safe-area uyumu
- internet yokken IndexedDB kayıt
- fotoğraf sıkıştırma
- bekleyen kayıt sayacı
- tekrar gönderimde mükerrer kayıt önleme (`localId`)
- bulut bağlantı testi
- TANIMLAR sayfasından blok/kat/hata/taşeron/formen listesini çekme ve telefonda cache'leme
- CSV yerel yedek
- gönderilmiş kayıtları telefondan temizleme
- iPhone kurulum yardım kartı
- servis worker cache sürümleme

## Formen kullanım akışı
YENİ HATA → Blok → Kat → Mahal → Hata Türü → Taşeron → Formen → Fotoğraf → KAYDET

## Kritik gerçek
iPhone'da ilk kurulum ve ilk açılış internet varken yapılmalıdır.
Ardından uygulama ana ekrandan açıldığında offline kayıt tutar.
Buluta gönderim için internet gerekir.

## Google tarafı
`backend.gs` dosyasını Google Sheets'e bağlı Apps Script projesine yapıştır.
Web App olarak yayınla.
URL'yi uygulamada Ayarlar > Bulut bağlantısı alanına gir.
