# QA Brain Framework Support Policy

This document defines how QA Brain classifies framework support.

The goal is to avoid claiming stable support before a framework has passed benchmark, calibration, validation, and documentation gates.

## Support Labels

### Stable

Stable means QA Brain can be recommended for regular use with this framework.

Required checklist:

- Detection
- Adapter
- Signals
- Rule mapping
- Benchmarks
- Real repository validation
- False positive / false negative calibration
- Documentation
- No critical regression in existing stable frameworks

### Preview

Preview means the framework has working adapter support and seed benchmarks, but real repository calibration is incomplete.

Preview support is useful for early adopters and contributors, but should not be marketed as stable.

Required checklist:

- Detection
- Adapter
- Core signals
- Initial rule mapping
- Seed benchmarks
- Documentation of limitations

### Planned

Planned means the framework is on the roadmap, but QA Brain does not yet provide meaningful support.

Planned frameworks should not be listed as supported in README usage examples.

## Current Framework Status

| Framework | Status | Notes |
| :--- | :--- | :--- |
| Playwright | Stable | Validated with benchmarks and real repositories. |
| Selenium WebDriver for Node.js | Preview | Adapter foundation and seed benchmarks exist; calibration is next. |
| Selenium Python | Planned | Requires Python-specific parsing/signals. |
| Selenium Java | Planned | Requires Java-specific parsing/signals. |
| Selenium C# | Planned | Requires C#-specific parsing/signals. |
| Cypress | Planned | Deferred until Playwright and Selenium are stable. |
| WebdriverIO | Planned | Candidate future adapter. |
| Appium | Planned | Candidate future adapter after mobile strategy is defined. |

## Stable Framework Checklist

A framework cannot move to Stable until all items are complete:

```text
Detection
Adapter
Signals
Rule mapping
Benchmarks
Real repository validation
FP/FN calibration
Documentation
Regression check against existing stable frameworks
```

## Calibration Decision Model

Framework calibration must end with one of three decisions:

- GO: Foundation validated, ready for broader preview or release candidate use.
- CONDITIONAL GO: Limited support, more calibration needed.
- NO-GO: Adapter signal quality insufficient.

## Metrics Policy

Precision should be treated as a calibration signal, not a rigid gate for small repository samples.

Recommended interpretation:

- Primary goal: improve precision through calibration.
- Target: approximately 80%+ precision when sample size is meaningful.
- Final decision: based on manual triage, repository quality, and false positive/false negative analysis.

Recall should be treated qualitatively until the benchmark corpus is large enough for meaningful measurement.

## Recommendation Consistency

The same QA problem should produce the same recommendation intent regardless of framework.

Only evidence should vary.

Example:

```text
Rule: Page Object Encapsulation
Playwright evidence: page.locator(...)
Selenium evidence: driver.findElement(...)
Recommendation intent: move selector into the Page Object.
```

## README Policy

README should use user-friendly labels:

- Stable frameworks: Supported
- Preview frameworks: Preview
- Future targets: Planned

Internal docs may use more precise terms such as `Foundation Validated`.
