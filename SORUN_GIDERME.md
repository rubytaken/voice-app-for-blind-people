# Sorun Giderme Rehberi

## Ses Tanıma Çalışmıyor

### 1. Tarayıcı Kontrolü

**Desteklenen Tarayıcılar:**

- ✅ Google Chrome (33 ve üzeri)
- ✅ Microsoft Edge (79 ve üzeri)
- ✅ Safari (14.1 ve üzeri)
- ❌ Firefox (Web Speech API desteklemiyor)

**Çözüm:** Chrome, Edge veya Safari kullanın.

### 2. Mikrofon İzni

**Sorunu Kontrol Edin:**

1. Tarayıcı üst kısmında mikrofon simgesine bakın
2. Adres çubuğundaki kilit simgesine tıklayın
3. İzinler bölümünde mikrofon iznini kontrol edin

**Çözüm:**

- İzin "Engellenmiş" ise, "İzin Ver" olarak değiştirin
- Sayfayı yenileyin (F5)
- Mikrofon izni istediğinde "İzin Ver" seçin

### 3. Mikrofon Testi

**Mikrofonunuzun çalıştığını kontrol edin:**

1. Windows Ayarlar → Ses → Mikrofon
2. Konuşun ve mikrofon seviyesinin hareket ettiğini görün
3. Başka bir uygulamada (örn. Discord) mikrofonu test edin

**Çözüm:**

- Mikrofon bağlantısını kontrol edin
- Başka bir mikrofon deneyin
- Mikrofon sürücülerini güncelleyin

### 4. HTTPS Gereksinimi

**Web Speech API sadece güvenli bağlantılarda çalışır:**

- ✅ `https://` ile başlayan siteler
- ✅ `localhost` (geliştirme için)
- ❌ `http://` ile başlayan siteler

**Çözüm:**

- Geliştirme için: `localhost:3000` kullanın
- Canlı site için: HTTPS sertifikası ekleyin

### 5. Sayfa Yenileme

Bazen basit bir yenileme sorunu çözer:

```
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)
```

### 6. Tarayıcı Konsolunu Kontrol Edin

**Hataları görmek için:**

1. F12 tuşuna basın
2. "Console" sekmesine gidin
3. Kırmızı hata mesajlarını okuyun

**Yaygın Hatalar:**

- `"not-allowed"`: Mikrofon izni verilmemiş
- `"no-speech"`: Ses algılanamıyor
- `"network"`: İnternet bağlantısı sorunu

## Komutlar Tanınmıyor

### Doğru Komutları Kullanın

**Türkçe Komutlar:**

- 🎤 "kayda başla" - Kaydı başlat
- ⏹️ "dur" - Kaydı durdur
- ▶️ "oynat" - Kaydı oynat
- 🌐 "dil değiştir" - Dili değiştir

**İngilizce Komutlar:**

- 🎤 "start recording" - Start recording
- ⏹️ "stop" - Stop recording
- ▶️ "play" - Play recording
- 🌐 "switch language" - Switch language

### Konuşma İpuçları

1. **Net konuşun**: Kelimeleri açık seçik söyleyin
2. **Normal hızda**: Çok hızlı veya yavaş konuşmayın
3. **Sessiz ortam**: Arka plan gürültüsünü azaltın
4. **Mikrofona yakın**: 15-30 cm mesafede olun
5. **Komple kelimeler**: "kayda baş" değil, "kayda başla" deyin

### Komut Alternatifleri

Bazı komutların kısa versiyonları:

- "başla" → Kaydı başlatır
- "dur" veya "durdur" → Kaydı durdurur
- "oynat" veya "çal" → Kaydı oynatır

## Kayıt Sorunları

### Kayıt Başlamıyor

**Kontrol Edin:**

1. "Ses dinleniyor..." mesajı görünüyor mu?
2. Yeşil nokta yanıp sönüyor mu?
3. Konsol hatası var mı?

**Çözüm:**

- Mikrofon iznini tekrar verin
- Başka bir tarayıcı deneyin
- Bilgisayarı yeniden başlatın

### Kayıt Oynatılamıyor

**Nedenler:**

- Henüz kayıt yapılmamış
- Kayıt düzgün kaydedilmemiş
- Ses kartı sorunu

**Çözüm:**

1. Önce bir kayıt yapın ("kayda başla" → "dur")
2. Ses seviyesini kontrol edin
3. Başka bir kayıt deneyin

## Dil Değiştirme Sorunları

### Klavye Kısayolu Çalışmıyor

**Alt+L tuşuna basın:**

- Windows: `Alt + L`
- Mac: `Option + L`

**Çalışmazsa:**

- Sayfanın odakta olduğundan emin olun
- Ses komutuyla deneyin: "dil değiştir"
- Tarayıcıyı yeniden başlatın

### Dil Değişmiyor

**Kontrol:**

- Sayfa üstünde dil adını görüyor musunuz?
- "English" veya "Türkçe" yazıyor mu?

**Çözüm:**

- localStorage'ı temizleyin (F12 → Application → Local Storage)
- Sayfayı yenileyin

## Performans Sorunları

### Uygulama Yavaş

**İyileştirme:**

1. Diğer sekmeleri kapatın
2. Gereksiz uygulamaları kapatın
3. RAM kullanımını kontrol edin
4. Tarayıcı önbelleğini temizleyin

### Ses Gecikmesi

**Çözüm:**

- Mikrofon kalitesini kontrol edin
- USB mikrofon yerine analog deneyin
- Ses sürücülerini güncelleyin

## Mobil Cihazlarda

### iOS (iPhone/iPad)

**Safari Kullanın:**

- Safari dışındaki tarayıcılar ses tanımayı desteklemeyebilir
- iOS 14.1 veya üzeri gerekli
- Mikrofon iznini Settings → Safari'den verin

### Android

**Chrome Kullanın:**

- Chrome tarayıcı önerilir
- Mikrofon iznini Android ayarlarından verin
- Android 5.0 veya üzeri gerekli

## Hala Çözülmedi mi?

### Detaylı Kontrol Listesi

1. ✅ Chrome/Edge/Safari kullanıyor musunuz?
2. ✅ Mikrofon izni verildi mi?
3. ✅ Mikrofon çalışıyor mu?
4. ✅ HTTPS kullanılıyor mu (veya localhost)?
5. ✅ İnternet bağlantısı var mı?
6. ✅ "Ses dinleniyor..." mesajı görünüyor mu?
7. ✅ Doğru komutları kullanıyor musunuz?
8. ✅ Net ve normal hızda konuşuyor musunuz?

### Sistem Bilgileri

**Tarayıcı bilgilerini görmek için:**

1. F12 tuşuna basın
2. Console sekmesinde şunu yazın:

```javascript
console.log(navigator.userAgent);
console.log(
  "Speech Recognition:",
  "SpeechRecognition" in window || "webkitSpeechRecognition" in window
);
console.log("MediaRecorder:", typeof MediaRecorder !== "undefined");
```

### Destek

**Hata raporu için şunları ekleyin:**

- Tarayıcı adı ve versiyonu
- İşletim sistemi
- Konsol hata mesajları
- Sorunu yeniden oluşturma adımları

---

## Yararlı Klavye Kısayolları

- `F5` - Sayfayı yenile
- `Ctrl + F5` - Cache'i temizleyerek yenile
- `F12` - Geliştirici araçlarını aç
- `Alt + L` - Dili değiştir

## Test Adımları

### Basit Test

1. Sayfayı açın (http://localhost:3000)
2. Mikrofon iznini verin
3. "Ses dinleniyor..." mesajını bekleyin
4. "kayda başla" deyin
5. Bir şeyler konuşun
6. "dur" deyin
7. "oynat" deyin

✅ Her adım çalışıyorsa, uygulama tamamen fonksiyonel!

---

**İyi kullanımlar!** 🎤
