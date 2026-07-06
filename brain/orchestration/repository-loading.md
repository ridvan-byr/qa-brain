---
id: repository-loading
title: Repository Loading & Routing Rules
category: Orchestration
priority: Critical
status: Draft
version: 1.0
---

# Repository Loading & Routing Rules

## Purpose

Bu modül, token kullanımını ve yapay zeka ajanının analiz odağını en üst düzeye çıkarmak için dosya okuma sırasını ve koşullu yönlendirme kurallarını tanımlar.

---

## 1. Yükleme Sırası (Sequential Loading Order)

QA Cortex, analiz sürecinde bağlam (context) bütünlüğünü korumak için dosyaları şu sıra ile yüklemelidir:

```
Step 1: package.json (Bağımlılıklar)
        │
        ▼
Step 2: playwright.config.ts / tsconfig.json (Konfigürasyon)
        │
        ▼
Step 3: custom fixtures / page objects (POMs) (Mimari Yapılar)
        │
        ▼
Step 4: *.spec.ts (Test Dosyaları)
        │
        ▼
Step 5: utilities / helpers (Yardımcı Kodlar)
```

---

## 2. Stop Loading Rule (Yüklemeyi Durdurma Kuralı)

Eğer ilk aşamada (`package.json` ve dosya yapısı incelenirken):
- Projenin **Playwright** framework'ünü kullanmadığı tespit edilirse (Örn: Cypress veya Selenium kullanılıyor),
- Veya test otomasyon kütüphanesi bulunamazsa;

**Playwright'a özel kural dosyalarının (`knowledge/playwright/*`) ve inceleme kurallarının yüklenmesi derhal durdurulur.** Sistem sadece `Framework Detection` raporunu üretir ve desteklenmeyen framework uyarısı vererek analizi sonlandırır.

---

## 3. Knowledge Yönlendirme Matrisi (Knowledge Routing Table)

Ajan, test kodlarında belirli kural ihlali veya anti-pattern örüntüleri algıladığında, sadece o konuya ait bilgi dosyalarını yükler.

| Kod Örüntüsü (Pattern) | Yüklenecek Kural Dosyaları |
| :--- | :--- |
| **XPath / Brittle CSS** (`xpath=`, `//`, `nth-child`) | [locator-review.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/playwright/review-rules/locator-review.md)<br>[maintainability.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/google/maintainability.md) |
| **Hardcoded Wait** (`waitForTimeout`) | [waiting-review.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/playwright/review-rules/waiting-review.md)<br>[auto-waiting.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/playwright/fundamentals/auto-waiting.md)<br>[flaky-tests.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/google/flaky-tests.md) |
| **Shared State / Globals** (`let id`, global storage) | [isolation-review.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/playwright/review-rules/isolation-review.md)<br>[parallel-review.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/playwright/review-rules/parallel-review.md)<br>[test-isolation.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/google/test-isolation.md) |
| **No Assertions** (etkileşim var, expect yok) | [assertion-review.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/playwright/review-rules/assertion-review.md) |
