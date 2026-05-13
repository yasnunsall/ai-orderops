# AI OrderOps 🚀

**KOBİ'ler için Yapay Zeka Destekli Sipariş, Stok ve Kargo Operasyon Asistanı**

> YZTA 5.0 Hackathon — AI Hackathon Kategorisi

---

## 1. Proje Adı

**AI OrderOps** — SME Operations AI Assistant

---

## 2. Problem Tanımı

Küçük ve orta ölçekli işletmeler (KOBİ'ler), günlük operasyonlarını büyük ölçüde manuel yöntemlerle yürütmektedir:

- Müşteri sipariş takibi dağınık tablolar ve telefon görüşmeleriyle yapılıyor
- "Siparişim nerede?" soruları işletme sahibinin gününün 2–3 saatini tüketiyor
- Stok tükenmesi geç fark ediliyor, müşteri kayıplarına yol açıyor
- Kargo gecikmeleri ancak müşteri şikayeti gelince öğreniliyor
- İş süreçleri kişiden kişiye farklılık gösteriyor

---

## 3. Çözüm Önerisi

AI OrderOps, KOBİ operasyonlarını yapay zeka destekli tek bir platformda birleştirir:

- Müşteri sorularını doğal dille anlayan ve veritabanıyla etkileşime giren bir **AI agent**
- Sipariş, stok ve kargo verilerini gerçek zamanlı gösteren **yönetici paneli**
- Kritik eşiklere düşen stoklar ve gecikme riskli kargolar için **otomatik uyarı sistemi**
- Tek soruyla günlük öncelikleri özetleyen **operasyon asistanı**

---

## 4. Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🤖 AI Asistan | Doğal dil sorularını anlayan, intent-based agent mimarisi |
| 📦 Sipariş Takibi | Sipariş numarasıyla anlık durum sorgulama |
| 📊 Stok Yönetimi | Kritik stok tespiti ve tedarikçi önerileri |
| 🚚 Kargo Takibi | Gecikme riski olan kargoların otomatik tespiti |
| 📋 Günlük Özet | "Bugün ne yapmalıyım?" sorusuna operasyonel yanıt |
| 🔄 Gemini AI | Google Gemini API entegrasyonu (mock fallback dahil) |

---

## 5. Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  Dashboard │ Siparişler │ Ürünler │ Kargo │ AI Asistan  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────┐
│                   BACKEND (FastAPI)                      │
│                                                         │
│  Routers:  /orders  /products  /shipments  /summary     │
│            /chat                                        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │               AI Agent Pipeline                   │  │
│  │                                                  │  │
│  │  User Message                                    │  │
│  │       ↓                                          │  │
│  │  Intent Detector  (Regex + keyword matching)     │  │
│  │       ↓                                          │  │
│  │  Data Fetcher     (SQLAlchemy → SQLite)          │  │
│  │       ↓                                          │  │
│  │  Gemini API  ──→  (Mock Fallback if no key)      │  │
│  │       ↓                                          │  │
│  │  Natural Language Response                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  DATABASE (SQLite)                       │
│            orders  │  products                          │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Kullanılan Teknolojiler

### Backend
| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| Python | 3.10+ | Ana dil |
| FastAPI | 0.111 | REST API framework |
| SQLAlchemy | 2.0 | ORM / veritabanı katmanı |
| SQLite | — | Hafif, dosya tabanlı veritabanı |
| Pydantic | 2.7 | Veri doğrulama ve şema |
| google-generativeai | 0.7 | Gemini AI entegrasyonu |
| python-dotenv | 1.0 | Ortam değişkeni yönetimi |
| Uvicorn | 0.29 | ASGI sunucu |

### Frontend
| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| React | 18.3 | UI kütüphanesi |
| Vite | 5.2 | Build tool / dev server |
| React Router | 6.23 | SPA routing |
| Tailwind CSS | 3.4 | Utility-first CSS |
| Axios | 1.7 | HTTP client |
| Lucide React | 0.390 | İkon seti |
| react-markdown | 9.0 | Markdown render (AI cevapları) |

---

## 7. AI Agent Yaklaşımı

### Intent Detection

Kullanıcı mesajı iki aşamada analiz edilir:

**Aşama 1 — Regex:** Mesajdaki sipariş numarası çıkarılır (2–6 haneli sayı).

**Aşama 2 — Keyword Matching:** Mesaj anahtar kelime gruplarıyla eşleştirilir:

```
order_status     → sipariş, nerede, teslim, kargom, takip ...
stock_query      → stok, stokta, var mı, tükendi, envanter ...
delayed_shipping → gecik, gelmedi, kargo sorunu, ulaşmadı ...
daily_summary    → bugün, yapmalıyım, özet, günlük, öncelik ...
general_help     → (hiçbiri eşleşmezse)
```

### Response Generation

```
Intent tespit edilir
       ↓
İlgili veri SQLite'dan çekilir
       ↓
Veri + kullanıcı mesajı Gemini API'ye gönderilir
       ↓
Gemini'ye şu direktifler verilir:
  - Sadece verilen veriyi kullan (halüsinasyon yok)
  - Türkçe yanıt ver
  - Kısa ve net ol
       ↓
Gemini API yoksa → deterministik template fallback
```

### Halüsinasyon Önleme

Sistem prompt'unda açıkça belirtilir: *"Sadece sana verilen veritabanı verilerini kullan. Asla tahmin etme veya uydurma."* LLM yalnızca gerçek DB verisini doğal dile çevirir.

---

## 8. Kurulum

### Gereksinimler

- Python 3.10+
- Node.js 18+
- (Opsiyonel) Google Gemini API key

### Backend Kurulumu

```bash
cd ai-orderops/backend

# Sanal ortam oluştur
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle, GEMINI_API_KEY ekle (opsiyonel)
```

### Frontend Kurulumu

```bash
cd ai-orderops/frontend

# Bağımlılıkları yükle
npm install
```

---

## 9. Çalıştırma

### Backend'i Başlat (Terminal 1)

```bash
cd ai-orderops/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Backend şu adreste çalışır: http://localhost:8000  
Swagger UI: http://localhost:8000/docs

### Frontend'i Başlat (Terminal 2)

```bash
cd ai-orderops/frontend
npm run dev
```

Frontend şu adreste çalışır: http://localhost:5173

> **Not:** Backend ilk çalıştığında demo verileri otomatik olarak SQLite veritabanına yüklenir.

---

## 10. API Endpointleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/` | API sağlık kontrolü |
| GET | `/orders/` | Tüm siparişleri listele |
| GET | `/orders/{order_id}` | Belirli bir siparişin detayı |
| GET | `/products/` | Tüm ürünleri stok bilgisiyle listele |
| GET | `/products/critical` | Kritik stok seviyesindeki ürünler |
| GET | `/shipments/delayed` | Gecikme riski olan kargolar |
| GET | `/summary/daily` | Günlük operasyon özeti |
| POST | `/chat/` | AI asistana mesaj gönder |

### POST /chat/ — Örnek İstek

```json
{
  "message": "128 numaralı siparişim nerede?"
}
```

### POST /chat/ — Örnek Yanıt

```json
{
  "message": "**128 Numaralı Sipariş Bilgisi**\n\n👤 **Müşteri:** Ali Çelik\n🚚 **Durum:** Kargoda\n...",
  "intent": "order_status",
  "data": {
    "order_id": "128",
    "customer_name": "Ali Çelik",
    "delay_risk": true,
    ...
  }
}
```

---

## 11. Demo Senaryoları

### Senaryo 1 — Müşteri Sipariş Sorgulama

**Kullanıcı:** "128 numaralı siparişim nerede?"

**AI Yanıtı:**
```
128 Numaralı Sipariş Bilgisi

👤 Müşteri: Ali Çelik
🛍️ Ürün: Kahve Çekirdeği (x2)
📌 Durum: 🚚 Kargoda
🏢 Kargo Firması: Aras Kargo
🔢 Takip No: AR456789012
📍 Takip Durumu: Transfer Merkezinde
📅 Tahmini Teslimat: 2026-05-12

⚠️ Gecikme Riski Tespit Edildi!
Kargo firmasıyla iletişime geçmeniz ve müşteriyi
önceden bilgilendirmeniz önerilir.
```

---

### Senaryo 2 — Stok Durumu Sorgulama

**Kullanıcı:** "Stok durumu nedir?"

**AI Yanıtı:**
```
⚠️ 2 üründe kritik stok seviyesi tespit edildi:

🔴 Organik Domates Kurusu
   • Mevcut Stok: 5 adet  |  Kritik Eşik: 10 adet
   • Tahmini Tükenme: ~1.4 gün
   • Tedarikçi: Ege Tarım A.Ş.

🔴 Doğal Sabun
   • Mevcut Stok: 3 adet  |  Kritik Eşik: 8 adet
   • Tahmini Tükenme: ~1.5 gün
   • Tedarikçi: Doğal Yaşam Koop.

💡 Öneri: Yukarıdaki ürünler için tedarikçilerinize sipariş verin.
```

---

### Senaryo 3 — Günlük Operasyon Özeti

**Kullanıcı:** "Bugün ne yapmam gerekiyor?"

**AI Yanıtı:**
```
📊 Günlük Operasyon Özeti

📦 Toplam Sipariş: 7
✅ Teslim Edildi: 1
🚚 Kargoda: 3
🔧 Hazırlanıyor: 2
⏳ Beklemede: 1

🎯 Bugünün Öncelikli Görevleri:

1. 📦 2 sipariş kargoya hazırlanıyor
   • Sipariş #103: Fatma Yıldız — El Yapımı Reçel
   • Sipariş #140: Hasan Öztürk — Doğal Sabun

2. 🔴 2 üründe kritik stok seviyesi
   • Organik Domates Kurusu: 5 adet (eşik: 10)
   • Doğal Sabun: 3 adet (eşik: 8)

3. ⚠️ 2 gecikme riski var — müşteri bilgilendirmesi gerekli
   • Sipariş #128: Ali Çelik
   • Sipariş #141: Nur Şahin
```

---

### Senaryo 4 — Gecikme Takibi

**Kullanıcı:** "Geciken kargolar var mı?"

Sistem gecikme riski taşıyan tüm kargoları listeler, kargo firması, takip numarası ve önerilen aksiyonları gösterir.

---

## 12. Proje Klasör Yapısı

```
ai-orderops/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI uygulama giriş noktası
│   │   ├── database.py          # SQLAlchemy + SQLite bağlantısı
│   │   ├── models.py            # Veritabanı modelleri (Order, Product)
│   │   ├── schemas.py           # Pydantic şemaları
│   │   ├── seed_data.py         # Demo veri yükleme
│   │   ├── routers/
│   │   │   ├── orders.py        # GET /orders, GET /orders/{id}
│   │   │   ├── products.py      # GET /products, GET /products/critical
│   │   │   ├── shipments.py     # GET /shipments/delayed
│   │   │   ├── summary.py       # GET /summary/daily
│   │   │   └── chat.py          # POST /chat
│   │   └── services/
│   │       ├── intent_detector.py  # Regex + keyword intent classification
│   │       ├── gemini_service.py   # Google Gemini API entegrasyonu
│   │       └── ai_agent.py         # Ana agent pipeline + mock responses
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Sayfa düzeni
│   │   │   ├── Sidebar.jsx      # Sol navigasyon menüsü
│   │   │   └── StatCard.jsx     # Dashboard istatistik kartları
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Ana dashboard
│   │   │   ├── Orders.jsx       # Sipariş listesi
│   │   │   ├── Products.jsx     # Ürün / stok yönetimi
│   │   │   ├── Shipments.jsx    # Kargo takibi
│   │   │   └── AIAssistant.jsx  # AI sohbet ekranı
│   │   ├── services/
│   │   │   └── api.js           # Axios API servisi
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

---

## 13. Gelecek Geliştirmeler

- [ ] **WhatsApp / Telegram entegrasyonu** — Müşteriler mesajlaşma uygulamasından sipariş sorgulayabilsin
- [ ] **E-posta otomasyonu** — Gecikme riski tespit edilince müşteriye otomatik bildirim
- [ ] **Tedarikçi entegrasyonu** — Kritik stokta otomatik sipariş taslağı oluşturma
- [ ] **Satış analitikleri** — Geçmiş verilere göre stok tahmini (forecasting)
- [ ] **Çoklu işletme desteği** — Auth sistemi ve tenant izolasyonu
- [ ] **Gerçek kargo API'leri** — Yurtiçi, MNG, Aras Kargo tracking API entegrasyonu
- [ ] **Sesli asistan** — Web Speech API ile sesli komut desteği
- [ ] **Mobil uygulama** — React Native ile iOS/Android desteği

---

## Lisans

MIT License — YZTA 5.0 Hackathon Demo Projesi
