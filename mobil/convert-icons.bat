@echo off
echo.
echo ==========================================
echo   PNG Icon Converter v1.0
echo ==========================================
echo.

echo Mevcut SVG dosyalar kontrol ediliyor...
if not exist "icon-192.svg" (
    echo ❌ icon-192.svg bulunamadı!
    pause
    exit
)

echo ✓ SVG dosyalar bulundu
echo.

echo Online PNG çevirici açılıyor...
echo.
echo ┌─────────────────────────────────────────────────┐
echo │  Adımlar:                                       │
echo │                                                 │
echo │  1. Açılan sitede SVG dosyalarını yükleyin      │
echo │  2. PNG olarak indirin                          │
echo │  3. Bu klasöre koyun                            │
echo │                                                 │
echo │  Çevrilecek dosyalar:                           │
echo │  • icon-192.svg → icon-192.png                  │
echo │  • icon-512.svg → icon-512.png                  │
echo │  • icon-192-maskable.svg → icon-192-maskable.png│
echo │  • icon-512-maskable.svg → icon-512-maskable.png│
echo └─────────────────────────────────────────────────┘

REM Online çeviricileri aç
start https://cloudconvert.com/svg-to-png
start https://svgtopng.com/
start https://convertio.co/svg-png/

echo.
echo Alternatif yöntemler:
echo • Photoshop ile SVG açıp PNG olarak kaydedin
echo • GIMP ile SVG import edip PNG export edin
echo • Online araçları kullanın (yukarıda açıldı)
echo.

echo PNG dosyaları hazır olduktan sonra:
echo 1. build-apk.bat çalıştırın
echo 2. Netlify'e tekrar yükleyin  
echo 3. PWABuilder'da tekrar deneyin
echo.

pause 