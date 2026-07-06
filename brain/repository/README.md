# Repository Analysis Layer

Bu klasör, QA Cortex'in test dosyalarını analiz etmeden önce hedef yazılım projesinin yapısını, bağımlılıklarını, test konfigürasyonlarını ve mimarisini bütünsel olarak incelemesi için gerekli kuralları barındırır.

---

## Klasör İçeriği ve Dosya Görevleri

- **[README.md](file:///c:/Users/ridva/Desktop/qa-cortex/brain/repository/README.md)**: Bu doküman; katman vizyonu ve kullanım kılavuzu.
- **[framework-detection.md](file:///c:/Users/ridva/Desktop/qa-cortex/brain/repository/framework-detection.md)**: Kullanılan test otomasyon kütüphanesini ve sürümünü (Playwright, Cypress vb.) belirler.
- **[project-structure.md](file:///c:/Users/ridva/Desktop/qa-cortex/brain/repository/project-structure.md)**: Projenin dizin yapısını (`src`, `tests`, `pages` vb.) tarayarak test bileşenlerinin yerleşimi haritalandırır.
- **[configuration-analysis.md](file:///c:/Users/ridva/Desktop/qa-cortex/brain/repository/configuration-analysis.md)**: Playwright veya diğer framework konfigürasyon dosyalarındaki (`playwright.config.ts` vb.) çalışma parametrelerini (timeouts, browser projeleri vb.) denetler.
- **[dependency-analysis.md](file:///c:/Users/ridva/Desktop/qa-cortex/brain/repository/dependency-analysis.md)**: `package.json` üzerinden bağımlılıkları, test kalitesini artıran ESLint, Prettier ve git kancalarını (Husky) gözlemler.

---

## Analiz Sırası ve Orkestrasyon

Repository tarama işlemi rastgele yapılmaz. [repository-loading.md](file:///c:/Users/ridva/Desktop/qa-cortex/brain/orchestration/repository-loading.md) kurallarına uygun olarak şu sıralama takip edilir:

1. **Bağımlılık Tespiti (Dependency & Framework)**
2. **Global Konfigürasyon Analizi (Config & TSConfig)**
3. **Dizin ve Mimari Analizi (POM & Fixtures)**
4. **Test Dosyaları İncelemesi (Specs)**

---

## Kullanım Yönergeleri

Bu modüller, QA Cortex çalıştırılırken ilk aşamada yüklenmeli ve elde edilen çıktılar test inceleme raporlarına girdi olarak sağlanmalıdır.
