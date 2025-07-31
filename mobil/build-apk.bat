@echo off
echo.
echo ==========================================
echo   Almanca Oyun APK Builder v1.2
echo ==========================================
echo.

echo [1/3] Icon'lar PNG'ye çevriliyor...
if exist "C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe" (
    echo ✓ ImageMagick bulundu, icon'lar çevriliyor...
    "C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe" icon-192.svg icon-192.png
    "C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe" icon-512.svg icon-512.png
    "C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe" icon-192-maskable.svg icon-192-maskable.png
    "C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe" icon-512-maskable.svg icon-512-maskable.png
    echo ✓ Tüm icon'lar PNG'ye çevrildi (any + maskable)
) else (
    echo ⚠️ ImageMagick bulunamadı. Icon'ları manuel çevirin:
    echo.
    echo 📱 Any Purpose Icon'lar (normal görünüm):
    echo   → https://cloudconvert.com/svg-to-png
    echo   → icon-192.svg → icon-192.png (192x192 piksel)
    echo   → icon-512.svg → icon-512.png (512x512 piksel)
    echo.
    echo 🎯 Maskable Icon'lar (Android adaptive):
    echo   → https://cloudconvert.com/svg-to-png  
    echo   → icon-192-maskable.svg → icon-192-maskable.png (192x192 piksel)
    echo   → icon-512-maskable.svg → icon-512-maskable.png (512x512 piksel)
    echo.
    echo 💡 Maskable icon'lar Android'de çeşitli şekillerde kesilir (daire, kare, vs)
    echo    Any icon'lar ise normal görünümde kullanılır
    echo.
    pause
)

echo.
echo [2/3] APK oluşturma araçları açılıyor...
echo.
echo ┌─────────────────────────────────────────────────┐
echo │  APK Oluşturma Adımları:                        │
echo │                                                 │
echo │  1. PWA'yı online'a yükleyin:                   │
echo │     → https://app.netlify.com/drop              │
echo │     → Bu klasörü tarayıcıya sürükleyin          │
echo │     → Verilen URL'yi kopyalayın                 │
echo │                                                 │
echo │  2. APK Builder'ı kullanın:                     │
echo │     → https://www.pwabuilder.com               │
echo │     → PWA URL'nizi yapıştırın                   │
echo │     → "Package For Stores" → "Android"         │
echo │     → Ayarlar:                                  │
echo │       - App Name: Almanca Fiil Kart Oyunu      │
echo │       - Package: com.almancaoyun.fiilkart      │
echo │       - Version: 1.0.0                         │
echo │     → "Download Package" ile APK indirin        │
echo │                                                 │
echo │  ✨ Artık Android Adaptive Icon desteği var!    │
echo │     Icon'lar farklı şekillerde görünebilir     │
echo └─────────────────────────────────────────────────┘
echo.

REM Ana araçları aç
start https://www.pwabuilder.com
start https://app.netlify.com/drop

echo [3/3] Alternatif APK araçları da açılıyor...
echo.
echo ┌─────────────────────────────────────────────────┐
echo │  Alternatif Yöntemler:                          │
echo │                                                 │
echo │  • AppsGeyser (Basit):                         │
echo │    → https://appsgeyser.com                     │
echo │    → "Create App" → "Website" seçin             │
echo │                                                 │
echo │  • Gonative (Profesyonel):                     │
echo │    → https://gonative.io                        │
echo │    → "Get Started" ile başlayın                 │
echo └─────────────────────────────────────────────────┘

start https://appsgeyser.com
start https://gonative.io

echo.
echo ✅ APK Builder araçları açıldı!
echo.
echo 📱 APK'yı test etmek için:
echo    1. APK'yı Android cihazınıza gönderin
echo    2. "Bilinmeyen kaynaklar"ı aktif edin (Güvenlik ayarları)
echo    3. APK'yı kurun ve oyunu test edin
echo    4. Android'de icon farklı şekillerde görünecek (adaptive)
echo.
echo 🎮 PWA versiyonunu test etmek için:
echo    → start-server.bat çalıştırın
echo    → Tarayıcıda: http://localhost:8080
echo.
echo 📖 Detaylı rehber için README.md dosyasını okuyun
echo.
pause 