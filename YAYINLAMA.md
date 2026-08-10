# Yayınlama Adımları

1. Bu klasördeki web dosyalarını HTTPS veren statik bir hostinge yükle.
2. `index.html` açılınca uygulama çalışmalıdır.
3. Google Sheets dosyanda Uzantılar > Apps Script'e gir.
4. `backend.gs` içeriğini yapıştır.
5. Apps Script üst menüsünden `setup` fonksiyonunu seç ve **bir kez çalıştır**. İzinleri onayla.
6. `TANIMLAR` sayfasında I sütunundaki **HATA TÜRLERİ** listesini doldur.
7. Deploy > New deployment > Web app.
8. Execute as: Me.
9. Erişim ayarını sahadaki telefonların erişebileceği şekilde seç.
10. Oluşan `/exec` URL'sini kopyala.
11. Uygulamada Ayarlar > Bulut bağlantısı alanına yapıştır.
12. BAĞLANTIYI TEST ET.
13. LİSTELERİ GÜNCELLE.
14. iPhone'da Safari > Paylaş > Ana Ekrana Ekle.

## QR kod
Hosting URL'si belli olduktan sonra bu URL'den tek bir QR kod oluştur ve şantiye panosuna as.
QR kodun hedefi `index.html` değil, uygulamanın kök HTTPS adresi olmalıdır.

## Canlıya geçmeden zorunlu test
- Uçak modunda yeni fotoğraflı kayıt aç.
- Uygulamayı tamamen kapatıp tekrar aç; kayıt görünmeli.
- Telefonu yeniden başlatıp tekrar kontrol et.
- İnterneti açıp senkronize et.
- Google Sheets'te kayıt numarası, lokasyon, taşeron ve fotoğraf linkini doğrula.
- Aynı kayıt için senkronizasyonu iki kez tetikle; Sheets'te tek satır kalmalı.
- TANIMLAR'a yeni bir formen ekle, uygulamada Listeleri Güncelle'ye bas; yeni isim görünmeli.
