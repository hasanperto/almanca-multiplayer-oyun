# 🚀 Railway.app Deploy Rehberi - Almanca Oyun

## 📋 Proje Bilgileri
- **Uygulama**: Almanca-Türkçe Multiplayer Oyun
- **Teknoloji**: Node.js + Express + Socket.IO
- **Port**: Otomatik (Railway tarafından sağlanır)
- **Database**: Gerekmiyor (JSON tabanlı)

## 🎯 Özellikler
- ✅ Tek oyuncu mod (offline)
- ✅ Multiplayer mod (4 kişiye kadar)
- ✅ WebSocket ile gerçek zamanlı oyun
- ✅ PWA desteği
- ✅ Responsive tasarım

## 🚀 Railway Deploy Adımları

### 1. GitHub Repository Oluştur
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/[USERNAME]/almanca-oyun.git
git push -u origin main
```

### 2. Railway.app'e Git
- railway.app adresine git
- "Start a New Project" tıkla
- GitHub ile giriş yap

### 3. Repository Seç
- "Deploy from GitHub repo" seç
- "almanca-oyun" repository'ni seç
- "Deploy Now" tıkla

### 4. Otomatik Deployment
Railway otomatik olarak:
- package.json'ı algılar
- npm install çalıştırır
- server.js'i başlatır
- HTTPS URL sağlar

## 🌐 Deployment URL
Railway deploy sonrası URL: `https://[APP-NAME].railway.app`

## 🎮 Test
1. URL'yi aç
2. "Çok Oyuncu" seçeneğini dene
3. Oda oluştur ve oyunu test et

## 📞 Destek
Sorun yaşarsanız: hasanperto@gmail.com

---
*Deploy tarihi: 31 Temmuz 2025*
*Geliştirici: HP Demos Team* 