# Mimari Karar Günlüğü (Architecture Decisions Log)

Bu günlük, QA Brain projesinde tasarım kararlarının, mimari kalıpların ve teknik gerekçelerin kurumsal düzeyde takip edilebilmesi amacıyla tutulmaktadır.

---

## [ADR-001] Modüler Framework Adaptör Mimarisi (Adapter Architecture)
* **Tarih:** 2026-07-03
* **Durum:** Kabul Edildi
* **Gerekçe:** QA Brain başlangıçta sadece Playwright test kütüphanesini destekliyordu. Selenium WebDriver gibi farklı kütüphanelerin entegrasyonunu çekirdek motora zarar vermeden sağlayabilmek için arayüz tabanlı bir adaptör deseni (`FrameworkAdapter`) kuruldu.
* **Sonuç:** Playwright ve Selenium davranışları ayrı adaptör sınıfları altına taşındı, kural motoru genel ve kütüphaneye özel olmak üzere ikiye ayrıldı.

---

## [ADR-002] Dashboard MVVM Yapısı
* **Tarih:** 2026-07-04
* **Durum:** Kabul Edildi
* **Gerekçe:** VS Code Sidebar Webview bileşeni ile uzantı ana süreci (Extension Host) arasındaki durum yönetiminin karmaşıklaşmasını önlemek.
* **Sonuç:** Model-View-ViewModel (MVVM) desenine geçildi. `DashboardViewModel` tek kaynak (Single Source of Truth) olarak belirlendi. Webview sadece bu view model'den gelen `DashboardState` nesnesini çizmekle yükümlü kılındı.

---

## [ADR-003] Bağımsız Yapay Zeka Yanıt Normalleştiricisi (LLM Normalizer)
* **Tarih:** 2026-07-06
* **Durum:** Kabul Edildi (Sprint 19.5)
* **Gerekçe:** Yapay zekadan (Gemini, OpenAI, Claude vb.) dönen JSON çıktılarının şema bütünlüğü garanti edilemiyordu. Eksik veya hatalı tipteki veriler skorlama motorunda çökmelere yol açabiliyordu.
* **Sonuç:** `src/reviewer/LLMNormalizer.ts` sınıfı oluşturularak tüm LLM sağlayıcılarından gelen ham JSON yanıtlarının şema doğrulaması, varsayılan değer atamaları ve önem derecesi eşleştirmeleri (örn. "warning" -> "Medium") bu bağımsız sınıfa devredildi.

---

## [ADR-004] Doğrudan Arayüzden Yapay Zeka Yapılandırması (Direct LLM Config)
* **Tarih:** 2026-07-06
* **Durum:** Kabul Edildi
* **Gerekçe:** Kullanıcıların Gemini API Key veya OpenAI ayarlarını el ile gizli dosyalara yazma zorunluluğunun getirdiği kullanım zorluğunu çözmek.
* **Sonuç:** Sidebar Dashboard üstüne **⚙️** (Çark) simgesi eklenerek açılır-kapanır bir konfigürasyon paneli oluşturuldu. Buradan girilen veriler VS Code Global Settings düzeyine yazılmaktadır.

---

## [ADR-005] Konsolide Doğrulama Yardımcısı (Consolidated Assertion Helper)
* **Tarih:** 2026-07-06
* **Durum:** Kabul Edildi (Sprint 19.5)
* **Gerekçe:** Playwright adaptörü, Selenium adaptörü, Gemini sağlayıcısı ve kural yönlendiricisi (KnowledgeRouter) olmak üzere 4 farklı dosyada assertion tespiti yapan mükerrer kod blokları mevcuttu. Bu durum kuralların zamanla birbirinden sapmasına (divergence) yol açıyordu.
* **Sonuç:** Tüm assertion desenleri **`src/utils/assertionHelper.ts`** içerisine taşındı. Mükerrer metotlar silinerek bu ortak fonksiyon kullanılmaya başlandı.

---

## [ADR-006] Deterministik Sıralama Sözleşmesi (Deterministic Ordering Contract)
* **Tarih:** 2026-07-06
* **Durum:** Kabul Edildi (Sprint 19.5)
* **Gerekçe:** Yapay zeka çıktılarının veya birleştirilen bulguların sırası her çalıştırmada değişebiliyordu. Bu durum benchmark raporlarında tutarsızlıklara sebep oluyordu.
* **Sonuç:** Bulguların birleştirme (`deduplicateFindings`) aşamasında en yüksek önem derecesi ve güven skoru seçildikten sonra; nihai listenin her zaman şu öncelik sırasıyla sıralanması kararlaştırıldı:
  `Dosya Yolu (File Path) -> Satır Numarası (Line) -> Kural Kimliği (Rule ID) -> Bulgu Başlığı (Finding Title)`

---

## [ADR-007] Uluslararasılaştırma (i18n) Test Kontrolü Genelleştirmesi
* **Tarih:** 2026-07-06
* **Durum:** Kabul Edildi (Sprint 19.5)
* **Gerekçe:** Arama testlerinde i18n veri varyasyonunun yapılıp yapılmadığını denetleyen kural, sadece "türkçe" ve "🧴" (şampuan) kelimelerini arayan aşırı uydurulmuş (overfit) bir mantığa sahipti.
* **Sonuç:** Eşleşme kuralı genel bir ASCII dışı karakter regex eşleşmesiyle (`/[^\x00-\x7F]/`) değiştirilerek tüm dünya dillerini kapsayacak şekilde genelleştirildi.
