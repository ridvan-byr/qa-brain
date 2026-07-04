# QA Brain Implementation Plan

Bu dosya, sprint bazli uygulama planini ve unutulmamasi gereken stratejik kararları takip etmek icin kullanilir.

## Calisma Kurali

- Her sprint baslamadan once kisa bir uygulama plani cikarilir.
- Plan onaylanmadan kod veya dokuman degisikligi yapilmaz.
- Her sprint sonunda `ROADMAP.md` guncellenir.
- Sprint sonunda tamamlanan isler, kalan isler, riskler ve sonraki sprint notlari yazilir.
- Buyuk hedefler tek sprint icine sikistirilmaz; ayri track olarak planlanir.

## Stratejik Hedef

QA Brain uzun vadede iki framework icin birinci sinif destek vermelidir:

- Playwright tam destek
- Selenium tam destek

Cypress ve diger frameworkler simdilik ikincil hedef olarak kalmalidir. Playwright ve Selenium stabil hale gelmeden cok genis multi-framework kapsamina gecilmemelidir.

## Sprint 11 - Real Repository Validation

### Amac

QA Brain'i gercek Playwright repository'leri uzerinde dogrulamak ve Playwright stable release icin guvenilir bir kalite/accuracy baseline'i olusturmak.

### Scope

- En az 10 gercek Playwright repository secilecek.
- Repository secimi farkli mimarileri temsil edecek sekilde yapilacak.
- Her repository'de temsil gucu olan test dosyalari incelenecek.
- Deterministic rule fallback ve Gemini destekli review davranisi karsilastirilacak.
- False positive ve false negative bulgular manuel olarak siniflandirilacak.
- Eksik rule kategorileri ve noisy rule kategorileri listelenecek.
- Rule usage / rule coverage raporu cikarilacak.
- Review time metrikleri repository boyutuna gore olculecek.
- Golden repository seti olusturulacak.
- Playwright icin v1.0'a hazirlik durumu netlestirilecek.

### Repository Selection Criteria

Sprint 11'de amac sadece 10 repository incelemek degil, 10 farkli mimariyi temsil eden repository secmektir.

Secim havuzu asagidaki kategorileri kapsamalidir:

- Small project
- Medium project
- Large enterprise-like project
- Page Object based project
- Fixture-heavy project
- API testing repository
- Multi-project Playwright repository
- Authentication-heavy repository
- Parallel execution repository
- Mixed architecture repository

Her repository icin neden secildigi kisa not olarak yazilmalidir.

Minimum repository dagilimi:

- 2 Small repositories
- 2 Medium repositories
- 2 Large repositories
- 1 Enterprise-style repository
- 1 API-heavy repository
- 1 Authentication-heavy repository
- 1 Multi-project repository

Bu minimum dagilim, repository seciminin rastgele olmasini engeller ve Sprint 11'in farkli mimari riskleri kapsamasini saglar.

### Deliverables

- Real repository validation report
- Repository bazli review notlari
- Precision / recall baseline
- Category-based accuracy matrix
- Rule usage / rule coverage raporu
- Rule calibration raporu
- Rule Only vs Gemini karsilastirma raporu
- Review time raporu
- Golden repository listesi
- False positive listesi
- False negative listesi
- Eksik rule backlog'u
- Playwright v1.0 go / no-go onerisi

### Accuracy Matrix

Sprint sonunda kategori bazli accuracy tablosu olusturulmalidir.

Ornek format:

| Category | Precision | Recall |
| :--- | :--- | :--- |
| Locator | TBD | TBD |
| Waiting | TBD | TBD |
| POM | TBD | TBD |
| Repository | TBD | TBD |
| Assertions | TBD | TBD |
| Fixtures | TBD | TBD |
| Isolation | TBD | TBD |

Bu tablo sonraki sprintlerde regression takibi icin baseline olarak kullanilmalidir.

### Rule Coverage

Sprint 11 sonunda mevcut rule setlerinin gercek repository'lerde ne kadar kullanildigi olculmelidir.

Ornek format:

| Rule ID | Status | Trigger Count | Confidence | Notes |
| :--- | :--- | :--- | :--- | :--- |
| LOCATOR_001 | Triggered | TBD | High | TBD |
| WAITING_002 | Triggered | TBD | Medium | TBD |
| FIXTURE_004 | Never Triggered | 0 | Low | Review or remove candidate |

Amac, yazilan kurallarin gercek hayatta calisip calismadigini gormektir.

Confidence degeri, rule'un gercek repository'lerde ne kadar guvenilir sinyal urettigini gostermelidir. Bir kez tetiklenen rule ile cok sayida repository'de tutarli calisan rule ayni seviyede degerlendirilmemelidir.

### Rule Calibration

Sprint sonunda rule setleri su basliklarla siniflandirilmalidir:

- Rules To Keep
- Rules To Modify
- Rules To Merge
- Rules To Remove

Ozellikle fazla agresif, duplicate veya hic tetiklenmeyen kurallar isaretlenmelidir.

### Review Time Metrics

CLI ve CI kullanimi icin review suresi olculmelidir.

Ornek format:

| Repository Size | Rule Only Avg Time | Gemini Avg Time | Notes |
| :--- | :--- | :--- | :--- |
| Small | TBD | TBD | TBD |
| Medium | TBD | TBD | TBD |
| Large | TBD | TBD | TBD |

### Rule Only vs Gemini Comparison

Ayni repository seti iki modda calistirilmalidir:

- Rule Only
- Gemini assisted

Karsilastirma metrikleri:

- Precision
- Recall
- False positives
- False negatives
- Review time
- Recommendation quality

Bu veri, gelecekte provider secimi ve fallback stratejisi icin kullanilmalidir.

### Golden Repositories

Sprint 11 sonunda regression testleri icin golden repository seti olusturulmalidir.

Onerilen yapi:

```text
validation/
  golden/
    repo-01/
    repo-02/
    repo-03/
```

Bu repository'ler sonraki sprintlerde tekrar calistirilacak ve yeni degisikliklerin accuracy regression yaratip yaratmadigi kontrol edilecektir.

### Success Criteria

- En az 10 repository analiz edilmis olmali.
- Her repository icin bulgular manuel triage edilmis olmali.
- Precision ve recall metrikleri dokumante edilmeli.
- En sik tekrarlanan false positive nedenleri listelenmeli.
- En kritik false negative nedenleri listelenmeli.
- Playwright stable release icin net karar uretilmeli.

### Acceptance Criteria

Sprint 11 basarili sayilmak icin asagidaki kriterleri hedeflemelidir:

- Precision >= 95%
- Recall >= 93%
- False Positive <= 5%
- No Critical Regression
- All Golden Repositories Pass
- Accuracy Matrix tamamlanmis olmali
- Rule Coverage raporu tamamlanmis olmali
- Rule Calibration raporu tamamlanmis olmali
- Rule Only vs Gemini karsilastirmasi tamamlanmis olmali
- Her false positive ve false negative icin yeni benchmark, rule improvement veya documented justification uretilmis olmali
- `ROADMAP.md` sprint sonunda guncellenmis olmali

### Oneriler

- Selenium tam destek implementasyonuna Sprint 11 tamamlanmadan baslanmamalidir.
- Sprint 11 sonuclari, framework abstraction tasarimina girdi olarak kullanilmalidir.
- Benchmark suite sadece yapay orneklerle sinirli kalmamali; real-world validation bulgularindan yeni benchmark case'leri uretilmelidir.
- Review sonucu "Excellent" donen dosyalar ozellikle manuel kontrol edilmelidir; sessiz false negative riski burada yuksektir.
- Sprint 11 sonunda README'ye "Validation Dataset" veya "Validation Report" bolumu eklenmelidir. Bu bolumde 10+ open-source Playwright repository, dosya sayisi, precision, recall, false positive, review time, rule coverage ve golden repository bilgileri ozetlenmelidir.
- Missing Assertion kuralinda demo/example/tutorial repository baglami Observation olarak ele alinmalidir; production validation olarak isaretlenmeyen demo dosyalari normal finding gibi cezalandirilmamalidir.
- Missing Assertion analizi file-level yerine test-block-level yapilmalidir. Ayni dosyada assertion olan bir test, assertion olmayan baska bir testin sinyalini gizlememelidir.

### Expected Validation Report Summary

Sprint 11 sonunda README ve validation raporunda kullanilabilecek ozet format:

```text
QA Brain Validation Report

Repositories: TBD
Files Reviewed: TBD
Precision: TBD
Recall: TBD
False Positive: TBD
Average Review Time: TBD
Rule Coverage: TBD
Golden Repositories: TBD
Recommendation Accuracy: TBD
```

Bu rapor, QA Brain'in yalnizca calisan bir review araci degil, dogrulugu olculmus bir review motoru oldugunu gostermelidir.

## Playwright Tam Destek Track

## Sprint 12 - VS Code Client MVP

### Amac

QA Brain'i VS Code icinde API key gerektirmeyen, hizli, rule-only calisan bir gelistirici deneyimi olarak sunmak.

Bu sprintte yazilan sey sadece bir extension degil, QA Brain'in ilk GUI/client deneyimi olarak ele alinmalidir. Bu nedenle isimlendirme `VS Code Client` olarak dusunulmelidir.

### Ana Kararlar

- Ilk surum Rule Only olacak.
- Mevcut QA Brain core pipeline yeniden kullanilacak; ikinci bir review motoru yazilmayacak.
- Extension ayri klasorde tutulacak: `extensions/vscode`.
- Repository review bu sprintte eklenmeyecek.
- LLM provider secimi bu sprintte eklenmeyecek.
- API key olmadan calismak zorunlu olacak.

### Scope

- Aktif Playwright test dosyasi review edilecek.
- Secili kod blogu review edilecek.
- Changed files review edilecek.
- Problems panel diagnostics uretilecek.
- Output Channel okunabilir review raporu gosterecek.
- Status Bar durum gosterecek.
- CodeLens temel ozet ve `Review Again` aksiyonu gosterecek.
- Markdown report acilabilecek.
- `reviewOnSave` default kapali olacak.
- `openReportAfterReview` default kapali olacak.
- Review hatalari extension'i cokertmeyecek; kullaniciya anlamli notification gosterilecek.

### Komutlar

- `QA Brain: Review Current Test File`
- `QA Brain: Review Selection`
- `QA Brain: Review Changed Files`
- `QA Brain: Open Latest Report`
- `QA Brain: Clear Diagnostics`

### Config

- `qaBrain.reviewMode`: `rule-only`
- `qaBrain.reviewOnSave`: `false`
- `qaBrain.openReportAfterReview`: `false`
- `qaBrain.includePatterns`
- `qaBrain.excludePatterns`
- `qaBrain.showDiagnostics`
- `qaBrain.showCodeLens`
- `qaBrain.showStatusBar`

### UX Flow

```text
Open Playwright test file
  -> QA Brain Ready
  -> QA Brain: Review Current Test File
  -> Progress notification
  -> Problems panel diagnostics
  -> Output Channel report
  -> CodeLens summary
  -> Optional Markdown report
```

### Output Channel Format

```text
QA Brain Review
login.spec.ts

Quality: 84
Risk: Medium
Findings: 2

----------------
WARNING
XPath Locator
Recommendation:
Use getByRole().
```

### Acceptance Criteria

- Extension build edilebilmeli.
- `Review Current Test File` calismali.
- `Review Selection` calismali.
- `Review Changed Files` calismali.
- Problems panel diagnostics uretmeli.
- Output Channel okunabilir rapor gostermeli.
- Status Bar durum gostermeli.
- CodeLens temel ozet gostermeli.
- `reviewOnSave=false` default olmali.
- `openReportAfterReview=false` default olmali.
- API key olmadan calismali.
- Review sirasinda VS Code UI donmus gibi gorunmemeli.
- Review hatasi extension'i cokertmemeli; kullaniciya anlamli bildirim gostermeli.
- Extension, VS Code Extension Development Host uzerinden Windows, macOS ve Linux hedefleriyle uyumlu olacak sekilde path/platform varsayimlarindan kacinmali.
- Mevcut CLI/build/test/benchmark bozulmamali.
- README'e VS Code usage bolumu eklenmeli.
- ROADMAP Sprint 12 sonunda guncellenmeli.

### Out of Scope

- Review Repository
- Auto-fix
- Inline quick fix
- Marketplace publish
- LLM provider selection
- OpenAI/Gemini/Claude comparison
- Webview dashboard
- Full repository dashboard
- Selenium support

### Sprint Sonu Beklenen Cikti

Sprint sonunda QA Brain, VS Code icinde aktif Playwright test dosyasini ve secili kod blogunu rule-only mode ile inceleyebilmeli; bulgulari Problems panelinde, ozeti Output Channel'da ve dosya durumunu Status Bar / CodeLens uzerinde gosterebilmelidir.

Playwright icin tam destek su alanlari kapsamalidir:

- Playwright config analizi
- Fixture analizi
- Page Object Model analizi
- Locator kalitesi
- Auto-waiting ve hardcoded wait tespiti
- Assertion kalitesi
- Test isolation
- Parallel execution uygunlugu
- Trace, video, screenshot ayarlari
- API testleri
- Auth/session state kullanimi
- Repository-level coverage ve risk raporu
- Benchmark ve real-world validation

## Selenium Tam Destek Track

Selenium tam destek ayri bir ana track olarak ele alinmalidir.

### Ilk Hedef

Once Selenium WebDriver for Node.js projeleri desteklenmelidir.

### Sonraki Hedefler

- Java Selenium
- Python Selenium
- C# Selenium

### Kapsam

- Selenium dependency detection
- WebDriver lifecycle analizi
- Explicit wait / implicit wait analizi
- Brittle locator tespiti
- Page Object / Page Factory pattern analizi
- Driver cleanup ve session leak tespiti
- Test runner farklari:
  - Jest
  - Mocha
  - JUnit
  - TestNG
  - PyTest
  - NUnit
- Selenium Grid / remote driver kullanimi
- Framework-specific benchmark setleri

## Framework Abstraction Yaklasimi

Playwright ve Selenium'u ayni pipeline icinde desteklemek icin framework-aware mimari gerekir.

Onerilen model:

- `FrameworkDetector`
- `FrameworkProfile`
- `KnowledgeProfile`
- `RuleRouter`
- `RepositoryAnalyzer`
- `ScoringProfile`
- `BenchmarkProfile`

Her framework kendi knowledge profiline, rule setlerine, repository analiz kurallarina ve benchmark datasetlerine sahip olmalidir. Ortak rapor formati korunmalidir.

Onerilen akis:

```text
FrameworkDetector
  -> FrameworkProfile
  -> KnowledgeProfile
  -> RuleRouter
  -> RepositoryAnalyzer
  -> ScoringProfile
  -> BenchmarkProfile
```

## Sprint Sonu Checklist

Her sprint sonunda su kontrol listesi tamamlanmalidir:

- `ROADMAP.md` guncellendi mi?
- Tamamlanan isler isaretlendi mi?
- Kalan isler not edildi mi?
- Yeni riskler yazildi mi?
- Test / benchmark sonucu kaydedildi mi?
- Yeni regression varsa belgelendi mi?
- Sonraki sprint icin net baslangic noktasi yazildi mi?

## Release Candidate Onerisi

Sprint 11 tamamlandiktan sonra dogrudan v1.0'a gecilmemelidir. Once kisa bir release candidate sureci planlanmalidir.

Onerilen akis:

```text
v0.9.0 RC
  -> 2-3 hafta gercek kullanim
  -> Bug fixes
  -> Final validation run
  -> v1.0
```

Bu surec, v1.0 etiketinin sadece "ozellikler tamamlandi" anlamina degil, "sahada dogrulandi" anlamina da gelmesini saglar.

## Unutulmamasi Gereken Kararlar

- Playwright primary framework olarak kalacak.
- Selenium full support stratejik hedef olacak.
- Cypress simdilik ertelenecek veya sinirli destek seviyesinde kalacak.
- "Multi-framework support" ifadesi belirsiz bir hedef olarak kullanilmamali.
- Her yeni framework icin detection, rules, scoring, benchmarks ve docs birlikte planlanmali.
- Tam destek iddiasi ancak real-world validation ve benchmark coverage ile desteklenmeli.
