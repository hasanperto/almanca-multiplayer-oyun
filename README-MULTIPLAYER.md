# 🌐 Almanca Multiplayer Oyunu

Arkadaşlarınızla gerçek zamanlı Almanca-Türkçe kelime oyunu oynayın!

## 🚀 Özellikler

### 🎮 Oyun Modları
- **👤 Tek Oyuncu**: Offline klasik mod
- **👥 Multiplayer**: 4 kişiye kadar gerçek zamanlı oyun

### 🌟 Multiplayer Özellikleri
- 🏛️ **Lobby Sistemi**: Oda oluştur ve arkadaşlarını davet et
- ⚡ **Gerçek Zamanlı**: WebSocket ile anında senkronizasyon
- 🎯 **Sıra Tabanlı**: Oyuncular sırayla cevap verir
- ✅ **Hazır Sistemi**: Herkes hazır olunca oyun başlar
- 🏆 **Canlı Skorlar**: Anlık skor güncellemeleri
- 📱 **Mobil Uyumlu**: Tüm cihazlarda mükemmel performans

### 🎨 Teknik Özellikler
- Node.js + Express backend
- Socket.IO ile WebSocket iletişimi
- PWA desteği
- Responsive tasarım
- Offline çalışma (tek oyuncu)

## 📦 Kurulum

### 1. Gereksinimler
- Node.js 16+ 
- NPM veya Yarn

### 2. Bağımlılıkları Yükle
```bash
npm install
```

### 3. Sunucuyu Başlat
```bash
# Geliştirme modu (auto-restart)
npm run dev

# Üretim modu
npm start
```

### 4. Oyunu Aç
Tarayıcınızda `http://localhost:3000` adresine gidin

## 🎮 Nasıl Oynanır

### Tek Oyuncu Modu
1. Ana menüden "Tek Oyuncu" seçin
2. Oyun ayarlarını yapılandırın
3. Oyunu başlatın ve eğlenin!

### Multiplayer Modu
1. Ana menüden "Çok Oyuncu" seçin
2. Oyuncu adınızı girin
3. **Oda oluştur** veya mevcut odaya **katıl**
4. Hazır olduğunuzda ✅ **Hazırım** butonuna tıklayın
5. Herkes hazır olunca 3 saniye countdown başlar
6. Sırayla soruları cevaplayın!

## 🛠️ Geliştirme

### Dosya Yapısı
```
de/
├── server.js              # Ana sunucu dosyası
├── package.json           # Node.js bağımlılıkları
├── mobil/
│   ├── index.html         # Ana menü (tek/çok oyuncu seçimi)
│   ├── multiplayer.html   # Multiplayer oyun arayüzü
│   ├── multiplayer.js     # Multiplayer oyun mantığı
│   ├── style-multiplayer.css # Multiplayer stilleri
│   ├── script.js          # Tek oyuncu mantığı
│   ├── style.css          # Tek oyuncu stilleri
│   └── sorular.json       # Soru veritabanı
```

### Sunucu API'leri

#### Socket.IO Olayları

**İstemci → Sunucu:**
- `register(playerName)` - Oyuncu kaydı
- `create_lobby(options)` - Yeni oda oluştur
- `join_lobby(lobbyId)` - Odaya katıl
- `leave_lobby()` - Odadan ayrıl
- `toggle_ready()` - Hazır durumunu değiştir
- `submit_answer(answer)` - Cevap gönder

**Sunucu → İstemci:**
- `lobbies_updated(lobbies)` - Oda listesi güncellendi
- `lobby_joined(lobby)` - Odaya katıldın
- `lobby_updated(lobby)` - Oda bilgileri güncellendi
- `game_countdown(count)` - Oyun başlama sayacı
- `game_started()` - Oyun başladı
- `new_question(data)` - Yeni soru
- `turn_changed(data)` - Sıra değişti
- `question_results(data)` - Soru sonuçları
- `game_finished(data)` - Oyun bitti

## 🔧 Yapılandırma

### Sunucu Ayarları
```javascript
// server.js içinde
const PORT = process.env.PORT || 3000;
```

### Oyun Ayarları
- **Maksimum Oyuncu**: 2-4 kişi
- **Soru Sayısı**: 5-20 soru
- **Zaman Sınırı**: 10-30 saniye

## 🌍 Deploy

### Heroku
```bash
# Heroku CLI yükle
npm install -g heroku

# Giriş yap
heroku login

# Uygulama oluştur
heroku create almanca-multiplayer

# Deploy et
git push heroku main
```

### Railway / Vercel
1. GitHub repository'sine push et
2. Railway/Vercel'e bağla  
3. Otomatik deploy edilir

## 🐛 Sorun Giderme

### Sunucu Başlamıyor
```bash
# Port kullanımda mı kontrol et
netstat -an | grep :3000

# Farklı port dene
PORT=3001 npm start
```

### Socket Bağlantı Sorunu
- Firewall ayarlarını kontrol edin
- Antivirus CORS bloklama olabilir
- HTTPS gerekebilir (production)

### Soru Yüklenmiyor
```bash
# sorular.json dosyasının varlığını kontrol et
ls mobil/sorular.json

# JSON formatını kontrol et
node -e "console.log(JSON.parse(require('fs').readFileSync('mobil/sorular.json')))"
```

## 📱 PWA Yükleme

1. Chrome/Safari'de oyunu açın
2. URL çubuğundaki "Yükle" ikonuna tıklayın
3. "Ana ekrana ekle" seçin
4. Artık app gibi kullanabilirsiniz!

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altındadır.

## 📞 Destek

Sorunlarınız için:
- GitHub Issues
- Discord: [Invite Link]
- Email: support@almancaoyun.com

---

**🎮 İyi oyunlar! Almanca öğrenmeyi eğlenceli hale getiriyoruz! 🇩🇪🇹🇷** 