@echo off
echo.
echo ===========================================
echo   Almanca Fiil Kart Oyunu - Mobil PWA
echo ===========================================
echo.
echo Sunucu başlatılıyor...
echo.

REM PHP sunucusu dene
where php >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo PHP sunucusu başlatılıyor: http://localhost:8080
    echo.
    echo Tarayıcınızda http://localhost:8080 adresini açın
    echo PWA özellikleri için Chrome kullanmanız önerilir
    echo.
    echo Kapatmak için Ctrl+C tuşlarına basın
    echo.
    php -S localhost:8080
    pause
    exit
)

REM Python sunucusu dene  
where python >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Python sunucusu başlatılıyor: http://localhost:8080
    echo.
    echo Tarayıcınızda http://localhost:8080 adresini açın
    echo PWA özellikleri için Chrome kullanmanız önerilir
    echo.
    echo Kapatmak için Ctrl+C tuşlarına basın
    echo.
    python -m http.server 8080
    pause
    exit
)

REM Node.js sunucusu dene
where node >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Node.js sunucusu başlatılıyor: http://localhost:8080
    echo.
    echo Tarayıcınızda http://localhost:8080 adresini açın
    echo PWA özellikleri için Chrome kullanmanız önerilir
    echo.
    echo Kapatmak için Ctrl+C tuşlarına basın
    echo.
    npx http-server -p 8080
    pause
    exit
)

echo HATA: PHP, Python veya Node.js bulunamadı!
echo.
echo Lütfen aşağıdakilerden birini yükleyin:
echo - PHP: https://www.php.net/downloads
echo - Python: https://www.python.org/downloads
echo - Node.js: https://nodejs.org/downloads
echo.
pause 