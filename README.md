# 🎮 Almanca Fiil Kart Oyunu

Modern ve interaktif bir Almanca fiil öğrenme oyunu. Oyuncular sırayla Türkçe fiillerin Almanca karşılıklarını tahmin eder.

## ✨ Özellikler

### 🎯 Temel Özellikler
- **1-4 Oyuncu Desteği**: Dinamik oyuncu sayısı seçimi
- **Özelleştirilebilir Oyuncu İsimleri**: Her oyuncu kendi adını girebilir
- **Esnek Soru Sayısı**: 10, 20, 50, 100 soru veya sınırsız
- **Ayarlanabilir Zaman Sınırı**: 10, 15, 20, 30 saniye seçenekleri
- **Karışık Soru Sırası**: Sorular rastgele sırayla gelir
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu

### 🚀 Gelişmiş Özellikler
- **Sıra Tabanlı Oynanış**: Her oyuncu sırayla cevap verir
- **Doğru/Yanlış Gösterimi**: Görsel geri bildirim
- **Zaman Takibi**: Her oyuncunun toplam süresi kaydedilir
- **Oyun Sonu Ekranı**: Kazanan ve final skorları
- **Yeniden Başlatma**: Oyun sırasında yeniden başlatma
- **Duraklat/Devam Et**: Oyunu duraklatma özelliği
- **Toast Bildirimleri**: Kullanıcı dostu mesajlar

### 💾 Veritabanı Özellikleri
- **MySQL Entegrasyonu**: Skorlar veritabanında saklanır
- **Skor Kaydetme**: Oyun sonunda skorları kaydetme
- **Skor Tablosu**: Geçmiş oyunları görüntüleme
- **Detaylı İstatistikler**: Oyuncu performans analizi

## 🛠️ Kurulum

### Gereksinimler
- PHP 7.4+
- MySQL 5.7+
- Web sunucusu (Apache/Nginx)

### Adım 1: Dosyaları Yükleyin
Proje dosyalarını web sunucunuzun kök dizinine yükleyin.

### Adım 2: Veritabanını Kurun
1. phpMyAdmin'e giriş yapın
2. `database_setup.sql` dosyasını içe aktarın
3. Veya MySQL komut satırında çalıştırın:
```bash
mysql -u root -p < database_setup.sql
```

### Adım 3: Veritabanı Bağlantısını Ayarlayın
`save_score.php` ve `view_scores.php` dosyalarında veritabanı bilgilerini güncelleyin:
```php
$host = 'localhost';
$dbname = 'almanca_oyun';
$username = 'root';
$password = '';
```

### Adım 4: Test Edin
Tarayıcınızda `http://localhost/proje-klasoru/` adresine gidin.

## 🎮 Oyun Akışı

### 1. Ayar Ekranı
- Oyuncu sayısını seçin (1-4)
- Oyuncu isimlerini girin
- Soru sayısını belirleyin
- Zaman sınırını ayarlayın
- "Oyunu Başlat" butonuna tıklayın

### 2. Oyun Ekranı
- Oyuncular sırayla Türkçe fiillerin Almanca karşılıklarını seçer
- Her oyuncunun belirlenen süresi vardır
- Süre dolduğunda otomatik olarak sıradaki oyuncuya geçilir
- Tüm oyuncular cevap verdikten sonra doğru cevap gösterilir

### 3. Oyun Sonu
- Kazanan oyuncu belirlenir
- Final skorları gösterilir
- Skorları kaydetme seçeneği
- Geçmiş skorları görüntüleme
- Yeniden oynama veya ana menüye dönme

## 📁 Dosya Yapısı

```
almanca-oyun/
├── index.php              # Ana oyun sayfası
├── script.js              # Oyun mantığı
├── style.css              # Stil dosyası
├── sorular.json           # Soru havuzu
├── save_score.php         # Skor kaydetme API
├── view_scores.php        # Skor tablosu sayfası
├── database_setup.sql     # Veritabanı kurulumu
└── README.md              # Bu dosya
```

## 🎨 Özelleştirme

### Yeni Soru Ekleme
`sorular.json` dosyasına yeni sorular ekleyebilirsiniz:
```json
{
  "id": 101,
  "turkce": "Yeni Fiil",
  "dogru": "neues_verb",
  "secenekler": ["neues_verb", "falsch1", "falsch2", "falsch3"]
}
```

### Tema Değiştirme
`style.css` dosyasında renkleri ve stilleri özelleştirebilirsiniz.

### Veritabanı Şeması
```sql
-- Oyunlar tablosu
oyunlar (id, oyuncu_sayisi, soru_sayisi, zaman_limiti, oyun_tarihi)

-- Oyuncu skorları tablosu
oyuncu_skorlari (id, oyun_id, oyuncu_adi, skor, toplam_sure)
```

## 🔧 Teknik Detaylar

### Teknolojiler
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Veritabanı**: MySQL 5.7+
- **Responsive**: CSS Grid, Flexbox

### Performans
- Lazy loading soru sistemi
- Optimize edilmiş veritabanı sorguları
- Responsive tasarım
- Modern JavaScript özellikleri

### Güvenlik
- SQL injection koruması (PDO prepared statements)
- XSS koruması (htmlspecialchars)
- Input validation
- CSRF koruması (gelecek sürümde)

## 🚀 Gelecek Özellikler

- [ ] Çoklu dil desteği
- [ ] Ses efektleri
- [ ] Animasyonlar
- [ ] Liderlik tablosu
- [ ] Oyuncu profilleri
- [ ] Başarım sistemi
- [ ] Mobil uygulama
- [ ] API entegrasyonu

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. GitHub Issues bölümünde sorun bildirin
2. Veritabanı bağlantısını kontrol edin
3. PHP hata loglarını inceleyin
4. Tarayıcı konsolunu kontrol edin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**🎮 İyi eğlenceler! Almanca öğrenmek hiç bu kadar eğlenceli olmamıştı! 🇩🇷🇹🇷** 