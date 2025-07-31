#!/bin/bash

echo "🌐 Almanca Multiplayer Oyunu Başlatılıyor..."
echo

echo "📦 Node.js kontrol ediliyor..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js yüklü değil! Lütfen https://nodejs.org adresinden yükleyin."
    exit 1
fi

echo "✅ Node.js bulundu!"
echo

echo "📥 Bağımlılıklar yükleniyor..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Bağımlılık yükleme hatası!"
    exit 1
fi

echo "✅ Bağımlılıklar yüklendi!"
echo

echo "🚀 Sunucu başlatılıyor..."
echo "🌍 Oyuna erişmek için: http://localhost:3000"
echo "🛑 Sunucuyu durdurmak için: Ctrl+C"
echo

npm start 