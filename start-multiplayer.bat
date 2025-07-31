@echo off
echo 🌐 Almanca Multiplayer Oyunu Baslatiliyor...
echo.

echo 📦 Node.js kontrol ediliyor...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js yüklü değil! Lütfen https://nodejs.org adresinden yükleyin.
    pause
    exit /b
)

echo ✅ Node.js bulundu!
echo.

echo 📥 Bağımlılıklar yükleniyor...
call npm install

if errorlevel 1 (
    echo ❌ Bağımlılık yükleme hatası!
    pause
    exit /b
)

echo ✅ Bağımlılıklar yüklendi!
echo.

echo 🚀 Sunucu başlatılıyor...
echo 🌍 Oyuna erişmek için: http://localhost:3000
echo 🛑 Sunucuyu durdurmak için: Ctrl+C
echo.

call npm start

pause 