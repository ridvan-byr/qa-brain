# QA Cortex Implementation Plan

Bu dosya, sprint bazli uygulama planini ve unutulmamasi gereken stratejik kararları takip etmek icin kullanilir.

## Calisma Kurali

- Her sprint baslamadan once kisa bir uygulama plani cikarilir.
- Plan onaylanmadan kod veya dokuman degisikligi yapilmaz.
- Her sprint sonunda `ROADMAP.md` guncellenir.
- Sprint sonunda tamamlanan isler, kalan isler, riskler ve sonraki sprint notlari yazilir.
- Buyuk hedefler tek sprint icine sikistirilmaz; ayri track olarak planlanir.

## Stratejik Hedef

QA Cortex uzun vadede iki framework icin birinci sinif destek vermelidir:

- Playwright tam destek
- Selenium tam destek

Cypress ve diger frameworkler simdilik ikincil hedef olarak kalmalidir. Playwright ve Selenium stabil hale gelmeden cok genis multi-framework kapsamina gecilmemelidir.

## Sprint 11 - Real Repository Validation

### Amac

QA Cortex'i gercek Playwright repository'leri uzerinde dogrulamak ve Playwright stable release icin guvenilir bir kalite/accuracy baseline'i olusturmak.

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
QA Cortex Validation Report

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

Bu rapor, QA Cortex'in yalnizca calisan bir review araci degil, dogrulugu olculmus bir review motoru oldugunu gostermelidir.

## Playwright Tam Destek Track

## Sprint 12 - VS Code Client MVP

### Amac

QA Cortex'i VS Code icinde API key gerektirmeyen, hizli, rule-only calisan bir gelistirici deneyimi olarak sunmak.

Bu sprintte yazilan sey sadece bir extension degil, QA Cortex'in ilk GUI/client deneyimi olarak ele alinmalidir. Bu nedenle isimlendirme `VS Code Client` olarak dusunulmelidir.

### Ana Kararlar

- Ilk surum Rule Only olacak.
- Mevcut QA Cortex core pipeline yeniden kullanilacak; ikinci bir review motoru yazilmayacak.
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

- `QA Cortex: Review Current Test File`
- `QA Cortex: Review Selection`
- `QA Cortex: Review Changed Files`
- `QA Cortex: Open Latest Report`
- `QA Cortex: Clear Diagnostics`

### Config

- `qaCortex.reviewMode`: `rule-only`
- `qaCortex.reviewOnSave`: `false`
- `qaCortex.openReportAfterReview`: `false`
- `qaCortex.includePatterns`
- `qaCortex.excludePatterns`
- `qaCortex.showDiagnostics`
- `qaCortex.showCodeLens`
- `qaCortex.showStatusBar`

### UX Flow

```text
Open Playwright test file
  -> QA Cortex Ready
  -> QA Cortex: Review Current Test File
  -> Progress notification
  -> Problems panel diagnostics
  -> Output Channel report
  -> CodeLens summary
  -> Optional Markdown report
```

### Output Channel Format

```text
QA Cortex Review
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

Sprint sonunda QA Cortex, VS Code icinde aktif Playwright test dosyasini ve secili kod blogunu rule-only mode ile inceleyebilmeli; bulgulari Problems panelinde, ozeti Output Channel'da ve dosya durumunu Status Bar / CodeLens uzerinde gosterebilmelidir.

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

## Framework Adapter ve Signal Mimarisi

Sprint 13 icin final mimari karar: QA Cortex, buyuk bir `NormalizedTestModel` icine tum frameworkleri zorlamamalidir. Bunun yerine kucuk bir adapter API ve esnek `FrameworkSignal` modeli kullanilmalidir.

### Ana Prensipler

- Review Engine framework bilmemelidir.
- Playwright, Selenium, Cypress gibi frameworkler kendi adapter'lari uzerinden sinyal uretmelidir.
- Core engine `page.locator()`, `driver.findElement()` veya `cy.get()` gibi framework API detaylarini dogrudan bilmemelidir.
- Generic QA kurallari framework bagimsiz kalmalidir.
- Framework-specific kurallar adapter sinyalleri ve knowledge profile uzerinden calismalidir.
- Package/plugin split bu sprintte yapilmayacak; mimari plugin-ready olacak ama repo yapisi simdilik basit kalacak.

### FrameworkSignal Modeli

Onerilen signal tipi:

```ts
type FrameworkName =
  | 'playwright'
  | 'selenium'
  | 'cypress'
  | 'webdriverio'
  | 'unknown';

type FrameworkSignalType =
  | 'locator'
  | 'assertion'
  | 'wait'
  | 'lifecycle'
  | 'structure'
  | 'execution'
  | 'fixture'
  | 'page-object'
  | 'keyword'
  | 'command-chain';

interface FrameworkSignal {
  type: FrameworkSignalType;
  framework: FrameworkName;
  ruleHints: string[];
  evidence: string;
  location?: {
    file: string;
    line?: number;
  };
  metadata?: Record<string, unknown>;
}
```

Bu model frameworkleri ayni test modeline zorlamaz. Playwright fixture sinyali uretebilir, Selenium lifecycle sinyali uretebilir, Robot Framework ileride keyword sinyali uretebilir.

### Adapter API

Adapter API kucuk tutulmalidir:

```ts
interface FrameworkAdapter {
  name: FrameworkName;
  detect(context: RepositoryContext): boolean;
  buildContext(file: TargetFile): FrameworkContext;
  buildSignals(context: FrameworkContext): FrameworkSignal[];
  knowledgeProfile(signals: FrameworkSignal[]): KnowledgeProfile;
}
```

`normalize()` ayri bir public API olarak eklenmemelidir. Normalization adapter ic detayi olarak kalmali, core engine sadece context ve signal gormelidir.

### Rule Ayrimi

Generic Rules:

- Missing Assertion
- Weak Assertion
- Naming
- AAA Pattern
- Test Isolation
- Duplicate Setup
- Hardcoded Credentials
- Negative Path Coverage
- Maintainability
- Readability

Framework Rules:

- Playwright Locator
- Playwright Auto Waiting
- Playwright Fixtures
- Selenium Driver Lifecycle
- Selenium Explicit / Implicit Waits
- Selenium WebDriver API
- Cypress Command Chains

### Sprint 13 Bolumu

Sprint 13 tek bir "multi-framework support" sprinti olarak ele alinmamalidir. Asagidaki alt sprintlere bolunmelidir:

```text
Sprint 13A - Core Adapter & Signal Architecture
Sprint 13B - Playwright Adapter Migration + Generic Rules
Sprint 13C - Selenium WebDriver Adapter
Sprint 13D - Selenium Real Repository Validation
```

### Sprint 13A Scope

- `FrameworkAdapter` interface eklenecek.
- `FrameworkSignal` tipi eklenecek.
- `FrameworkContext` tipi eklenecek.
- Adapter registry eklenecek.
- Playwright icin bridge/initial adapter eklenecek.
- Mevcut Playwright davranisi bozulmayacak.

### Sprint 13A Implementation Notes

- `src/framework/` altinda adapter API, signal tipleri ve adapter registry olusturuldu.
- Ilk `PlaywrightAdapter`, mevcut review davranisini degistirmeden framework sinyalleri uretmek icin bridge olarak eklendi.
- `ReviewContext` icine adapter sonucu opsiyonel olarak baglandi.
- Sprint 13A'nin bu asamasinda `KnowledgeRouter` davranisi bilerek degistirilmedi; Playwright routing ve rapor semantigi ayni kalmali.
- Adapter registry icin otomatik smoke test eklendi.
- VS Code Extension Development Host smoke test gecti: Problems, Output Channel, CodeLens ve Status Bar review sonucunu gosterdi.
- Framework sinyalleri Sprint 13B'de generic rule ayrimi ve Playwright adapter migration icin kullanilacak.

### Sprint 13A Out of Scope

- Selenium full support
- Package/plugin split
- Cypress/WebdriverIO/Appium support
- Test Design Engine
- Marketplace publish

### Sprint 13B Final Plan - Playwright Adapter Migration + Generic Rules

Sprint goal:

```text
Migrate Playwright review flow to the adapter architecture without changing observable behavior.
```

#### Scope

- `KnowledgeRouter`, `ReviewContext.framework.signals` okumaya baslayacak.
- Signal varsa signal-based routing kullanilacak.
- Signal yoksa mevcut heuristic routing fallback olarak korunacak.
- Playwright locator, wait, assertion, isolation ve POM sinyalleri adapter uzerinden route edilecek.
- Generic rule ile adapter evidence ayrimi dokumante edilecek.
- Playwright benchmark ciktilarinda observable behavior degismeyecek.
- CLI, GitHub Action, MCP ve VS Code Client davranisi korunacak.

#### Out of Scope

- Selenium implementation
- Cypress/WebdriverIO/Appium support
- Package/plugin split
- Report UX polish
- Test Design Engine
- Buyuk klasor reorganizasyonu

#### FrameworkSignal Contract

Framework signal sozlesmesi asagidaki prensiplerle korunmalidir:

- Stable: Rule engine tarafinda kullanilan signal alanlari sik degismemelidir.
- Minimal: Signal sadece routing ve evidence icin gereken bilgiyi tasimalidir.
- Framework-owned: Signal uretimi framework adapter sorumlulugunda olmalidir.
- Rule-engine agnostic: Core rule engine framework API detaylarini bilmemelidir.

#### Rule Mapping Matrix

| Rule | Generic | Adapter Evidence |
| :--- | :---: | :--- |
| Missing Assertion | Yes | AssertionSignal |
| Weak Assertion | Yes | AssertionSignal |
| Test Isolation | Yes | LifecycleSignal |
| Duplicate Setup | Yes | StructureSignal |
| POM Encapsulation | Yes | LocatorSignal + StructureSignal |
| Naming / Readability | Yes | StructureSignal |
| Brittle Locator | No | Playwright LocatorSignal |
| Auto Waiting | No | Playwright WaitSignal |
| Fixture Usage | No | Playwright FixtureSignal |
| Parallel Execution | No | Playwright LifecycleSignal |

Rule generic olabilir; framework-specific olan kisim adapter tarafindan saglanan evidence/signal'dir.

#### Migration Checklist

- [x] Locator routing migrated
- [x] Wait routing migrated
- [x] Assertion routing migrated
- [x] Isolation routing migrated
- [x] POM evidence signal preserved without adding new routing behavior
- [x] Heuristic fallback preserved
- [x] Adapter registry tests expanded
- [x] Rule mapping contract tests added
- [x] Review output unchanged for existing Playwright benchmark cases
- [x] Benchmark and validation smoke passed

#### Architecture Validation

- `KnowledgeRouter` Playwright-specific module import etmemelidir.
- PlaywrightAdapter coverage mevcut heuristic coverage'dan dusuk olmamalidir.
- No measurable increase in false positives on existing benchmark suite.
- Existing Playwright benchmark cases icin review output semantic olarak degismemelidir.

#### Architecture Diagram

```text
Repository
  -> Framework Adapter
  -> Framework Signals
  -> Knowledge Router
  -> Rule Engine
  -> Scoring
  -> Report
```

#### Risk

- Signal generation drift: Adapter signal'lari gelecekte rule beklentileriyle uyumsuz hale gelebilir.
- Mitigation: Signal contract kucuk tutulacak, adapter tests ile sabitlenecek ve gerekirse version'lanacak.

#### Architecture Freeze Milestone

Sprint 13B tamamlandiktan sonra Sprint 13C Selenium implementasyonuna gecmeden once kisa bir Architecture Freeze milestone'i planlanmalidir.

Bu milestone bir sprint olarak roadmap'e eklenmeyebilir. Amac yeni ozellik eklemek degil; benchmark, validation, dokumantasyon ve bagimlilik analizini temizlemektir.

Architecture Freeze sonucu:

- `docs/architecture-freeze-sprint-13.md` raporu eklendi.
- Framework knowledge ownership `src/framework/KnowledgeProfiles.ts` altina toplandi.
- `KnowledgeRouter` Playwright knowledge path listelerini dogrudan tasimamali prensibi uygulandi.
- Benchmark suite `7/7` gecti.
- Sprint 11 validation smoke 10 repository, 229 dosya, 2 finding ile gecti.
- Sprint 13C Selenium WebDriver Adapter icin baslamaya uygun durum olustu.

#### Sprint 13B Implementation Notes

- `KnowledgeRouter`, adapter signal varsa signal-based routing kullanacak sekilde guncellendi.
- Adapter signal yoksa mevcut heuristic routing fallback olarak korunur.
- `RuleMapping` modulu eklendi ve generic rule ile adapter evidence ayrimi kod tarafinda sabitlendi.
- POM icin yeni route eklenmedi; mevcut Playwright POM benchmark davranisi locator evidence uzerinden korunur.
- `KnowledgeRouter` signal routing ve heuristic fallback davranisi otomatik test ile sabitlendi.
- Rule mapping contract testleri eklendi.
- Benchmark sonucu: `7/7`, regression yok.
- Sprint 11 validation smoke sonucu: 10 repository, 229 dosya, 2 finding.
- VS Code Client compile smoke gecti.

### Sprint 13C Final Plan - Selenium WebDriver Adapter

Sprint goal:

```text
Integrate Selenium WebDriver for Node.js as the second framework adapter while preserving QA Cortex's generic rule model and Playwright output stability.
```

#### Architecture Terminology

Sprint 13C asagidaki modeli izlemelidir:

```text
QA Principles
  -> Review Rules
  -> Framework Evidence
  -> Recommendations
```

- QA principles framework bagimsizdir.
- Review rules QA problemini temsil eder.
- Framework adapter sadece evidence/signal uretir.
- Recommendation template adapter icinde yasamamalidir.

Mimari prensipler `docs/architecture-principles.md` dosyasinda kalici hale getirilmistir.

#### Scope

- `SeleniumAdapter` eklenecek.
- Adapter registry'ye Selenium adapter baglanacak.
- Selenium WebDriver for Node.js detection eklenecek.
- Selenium icin temel signal uretimi yapilacak:
  - `LocatorSignal`
  - `WaitSignal`
  - `AssertionSignal`
  - `LifecycleSignal`
  - `StructureSignal`
- Selenium framework evidence mapping seed eklenecek.
- `KnowledgeProfiles` icine Selenium base/rule mapping seed eklenecek.
- `KnowledgeRouter` Selenium icin framework profile uzerinden knowledge route edebilecek.
- Selenium benchmark seed case'leri eklenecek.
- Playwright benchmark `7/7` korunacak.
- Sprint 11 validation smoke korunacak.
- VS Code Client compile smoke korunacak.

#### Out of Scope

- Selenium full support
- Selenium Python support
- Selenium Java/C#/Ruby support
- Selenium real repository validation
- Selenium Grid / remote driver full analysis
- Cypress/WebdriverIO/Appium support
- Report UX polish
- Marketplace/plugin split

#### Initial Selenium Signals

| Signal | Selenium WebDriver for Node.js Evidence |
| :--- | :--- |
| LocatorSignal | `driver.findElement(By.xpath(...))`, `By.css(...)`, `By.id(...)` |
| WaitSignal | `driver.sleep(...)`, `until.elementLocated(...)`, explicit wait usage |
| AssertionSignal | `expect(...)`, `assert(...)`, `should(...)`, `chai.expect(...)` |
| LifecycleSignal | `new Builder().build()`, missing `driver.quit()` |
| StructureSignal | Page Object class, duplicated setup, inline selectors |

#### Initial Selenium Rule Mapping

| Rule | Generic | Adapter Evidence |
| :--- | :---: | :--- |
| Missing Assertion | Yes | AssertionSignal |
| Weak Assertion | Yes | AssertionSignal |
| Resource Cleanup | Yes | LifecycleSignal |
| Page Object Encapsulation | Yes | LocatorSignal + StructureSignal |
| Brittle Locator | No | Selenium LocatorSignal |
| Hardcoded Sleep | No | Selenium WaitSignal |

Resource Cleanup generic QA prensibidir. Selenium evidence `driver.quit()` eksikligi olabilir; Playwright evidence `context.close()` veya `browser.close()` eksikligi olabilir.

#### Benchmark Seed Cases

- Selenium XPath locator usage
- Selenium hardcoded sleep usage
- Selenium missing assertion
- Selenium missing `driver.quit()`
- Selenium inline selector outside Page Object

#### Acceptance Criteria

- `npm run build` gecmeli.
- `npm test` gecmeli.
- Playwright benchmark `7/7` kalmali.
- Selenium benchmark seed case'leri gecmeli.
- Sprint 11 validation smoke calismali.
- VS Code Client compile smoke gecmeli.
- No measurable increase in Playwright false positives.
- Existing Playwright benchmark outputs semantic olarak degismemeli:
  - Same finding
  - Same severity
  - Same score class
  - Same recommendation intent
- `KnowledgeRouter` Selenium knowledge path'lerini dogrudan tasimamali.
- Selenium logic adapter/profile katmaninda kalmali.
- Generic QA recommendations frameworkler arasinda tutarli kalmali.
- Selenium support seviyesi "foundation + seed benchmarks" olarak dokumante edilmeli.

#### Risks

- Selenium API desenleri Playwright'a gore daha daginik olabilir.
- Assertion detection Jest/Mocha/Chai farklarindan etkilenebilir.
- Resource Cleanup rule fazla agresif olursa false positive uretebilir.
- Knowledge divergence: ayni QA problemi Playwright ve Selenium'da farkli veya celiskili recommendation uretmeye baslayabilir.

Mitigation:

- Adapter recommendations uretmemeli; adapter sadece evidence/signal saglamali.
- Recommendation intent generic rule tarafinda korunmali.
- Selenium coverage "foundation" olarak etiketlenmeli; stable denmemeli.

#### Stable Framework Checklist

Bir framework README'de Stable / Supported olarak isaretlenmeden once su checklist tamamlanmalidir:

- Detection
- Adapter
- Signals
- Rule mapping
- Benchmarks
- Real repository validation
- False positive / false negative calibration
- Documentation

Framework support seviyeleri ve README terminolojisi `docs/framework-support-policy.md` dosyasinda tanimlanmistir.

#### Sprint 13C Implementation Notes

- `SeleniumAdapter` eklendi.
- Adapter registry Selenium adapter'i Playwright adapter'dan once dener; boylece Playwright dependency bulunan repoda acik Selenium dosyalari yanlislikla Playwright olarak siniflandirilmaz.
- `ContextBuilder` explicit Selenium file signals'i Playwright dependency fallback'inden once degerlendirir.
- `KnowledgeProfiles` icine Selenium base knowledge ve rule mapping seed eklendi.
- Selenium seed knowledge dosyalari eklendi:
  - `knowledge/selenium/README.md`
  - `knowledge/selenium/review-rules/locator-review.md`
  - `knowledge/selenium/review-rules/waiting-review.md`
  - `knowledge/selenium/review-rules/assertion-review.md`
  - `knowledge/selenium/review-rules/resource-cleanup-review.md`
- Benchmark suite Selenium seed case'leriyle 7'den 12'ye genisletildi.
- Benchmark runner deterministic rule-only mode'a sabitlendi; env'deki LLM key benchmark sonucunu etkilememeli.
- Selenium seed benchmarks:
  - Selenium XPath locator usage
  - Selenium hardcoded sleep usage
  - Selenium missing assertion
  - Selenium missing `driver.quit()`
  - Selenium inline selector outside Page Object
- Benchmark sonucu: `12/12`, regression yok.
- Playwright benchmark sonucu: mevcut `7/7` semantic olarak korundu.
- Sprint 11 validation smoke sonucu: 10 repository, 229 dosya, 2 finding.
- VS Code Client compile smoke gecti.
- Selenium WebDriver for Node.js support seviyesi: Foundation + seed benchmarks.

## Report UX Improvement Backlog

Bu backlog Sprint 13A mimari isinden ayridir. Amac QA Cortex raporlarini sadece finding listesi olmaktan cikarip kanita dayali, ogretici ve enterprise ekipler icin okunabilir kalite raporlarina donusturmektir.

Onerilen iyilestirmeler:

- Summary daha yorumlayici olmali:
  - Finding sayisi ve severity ozetlenmeli.
  - Birincil risk kisa insan diliyle aciklanmali.
  - Genel kalite durumu tek paragrafta anlatilmali.
- Confidence bolumu signal bazli aciklanmali:
  - Absolute XPath
  - Inline Locator
  - Outside Page Object
  - Missing Assertion
  - Hardcoded Wait
- Finding basliklari daha kisa ve taranabilir olmali:
  - `Brittle XPath Locator`
  - `Inline Absolute XPath`
  - `Missing Assertion`
- Her finding icin `Why this matters` bolumu eklenmeli.
- Recommendation bolumu `Recommendation` ve `Benefits` olarak ayrilmali.
- Metrics bolumu daha acik driver formatina gecmeli:
  - `Quality 60/100`
  - Drivers:
    - `-20 POM encapsulation bypass`
    - `-20 Brittle locator usage`
    - `+ Strong assertions`
- Observations bolumunde framework ve version bilgisi daha gorunur olmali.
- References rule ID ve knowledge path ile birlikte verilmeli.
- Final Verdict sebep ile birlikte yazilmali.
- Enterprise okunabilirligi icin opsiyonel alanlar degerlendirilmeli:
  - Fix Priority
  - Estimated Fix Time
  - Technical Debt
  - Potential Quality After Suggested Fixes

Bu backlog Sprint 13B oncesinde mini polish olarak veya Sprint 13B icinde ayri bir alt is olarak planlanabilir.

## Sprint 19.5 - Core Hardening Before Python Expansion

### Amac

Claude tarafindan yapilan proje incelemesinde isaretlenen cekirdek dogruluk ve bakim risklerini, Python/SARIF/Enterprise gibi yeni genisleme islerine gecmeden once kapatmak.

Bu sprintin amaci yeni ozellik eklemek degil, mevcut QA Cortex cekirdeginin daha guvenilir, daha az kirilgan ve genislemeye daha hazir hale gelmesini saglamaktir.

### Neden Simdi?

Sprint 19 ile VS Code Marketplace RC paketleme hazirligi yapildi. Sprint 20 ise Python Core & Scanner olarak planli. Python destegine gecmeden once asagidaki riskler kapatilmazsa, yeni framework ve yeni dil destegi mevcut kirilgan noktalari buyutebilir:

- MCP server repository root varsayimi.
- LLM JSON output sekil dogrulamasi eksikligi.
- Adapter ve fallback tarafinda tekrar eden assertion detection regexleri.
- Finding deduplication severity merge davranisinin belirsizligi.
- Scoring/signal tarafinda benchmark'a fazla ozel string kontrolleri.
- CLI/MCP tarafinda dil/encoding tutarsizliklari.

### Scope

- MCP root detection duzeltilecek:
  - Absolute file path geldiginde en yakin `package.json` veya workspace root bulunmali.
  - `ReviewPipeline(".", provider)` varsayimi MCP file review icin kaldirilmali.
- LLM response schema validation eklenecek:
  - Zorunlu alanlar normalize edilmeli.
  - Eksik/bozuk `findings`, `confidence`, `score`, `severity` alanlari runtime crash'e sebep olmamali.
  - Invalid LLM output deterministic fallback veya safe empty result ile ele alinmali.
- Shared assertion detection helper cikarilacak:
  - PlaywrightAdapter
  - SeleniumAdapter
  - deterministic fallback
  ayni assertion detection sozlesmesini kullanmali.
- Deduplication davranisi netlestirilecek:
  - Ayni title ile birlesen finding'lerde en yuksek severity korunmali.
  - Confidence justification birlestirme deterministik olmali.
- Benchmark-overfit heuristic'ler izole edilecek:
  - ScoringEngine icindeki cok spesifik string kontrolleri generic signal/helper seviyesine tasinmali veya dokumante edilmeli.
- CLI/MCP mesajlari temizlenecek:
  - User-facing mesajlarda tutarli Ingilizce kullanilmali.
  - Bozuk encoding kalintilari temizlenmeli.

### Out of Scope

- Python scanner implementation.
- Python adapter.
- SARIF export.
- Marketplace publish.
- New framework support.
- Report UX redesign.
- Full AST migration.

AST / ts-morph tabanli analiz bu sprintte baslatilmayacak; ayri bir mimari sprint olarak planlanacak.

### Acceptance Criteria

- `npm run build` gecmeli.
- `npm test` gecmeli.
- VS Code extension compile gecmeli.
- VSIX package command gecmeli.
- MCP file review, farkli cwd'den absolute file path ile dogru repository context bulmali.
- Invalid LLM JSON shape runtime crash uretmemeli.
- Assertion detection helper parity testleri gecmeli.
- Deduplication en yuksek severity'yi korudugunu test ile kanitlamali.
- Playwright ve Selenium benchmark davranisi semantic olarak korunmali.
- Sprint 19 release packaging dosyalari bozulmamali.

### Deliverables

- MCP root detection fix.
- `ReviewResult` / LLM output validator veya normalizer.
- Shared assertion detection helper.
- Deduplication severity merge tests.
- Hardening regression tests.
- ROADMAP ve implementation plan guncellemesi.

### Riskler

- LLM normalization eski rapor formatlariyla uyumsuz olabilir.
- Dedup severity merge davranisi finding sayisini degistirmeden severity dagilimini degistirebilir.
- MCP root fix monorepo icinde yanlis package root secebilir.

Mitigation:

- Degisiklikler testlerle sabitlenecek.
- Monorepo root selection icin nearest package root + workspace fallback mantigi uygulanacak.
- Observable behavior degisiklikleri acceptance kriterlerinde acikca raporlanacak.

### Sprint 13 Acceptance Gate

Her Sprint 13 alt sprinti sonunda su kontroller gecmeden sonraki adima gecilmemelidir:

- `npm run build`
- `npm test`
- Benchmark suite `7/7`
- Sprint 11 validation smoke
- VS Code Client smoke

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
