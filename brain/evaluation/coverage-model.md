---
id: coverage-model
title: Coverage Model
category: Brain
priority: Critical
status: Draft
version: 1.0
---

# Coverage Model

Coverage is measured using QA dimensions instead of code coverage.

---

# Coverage Categories

| Category | Weight |
|-----------|--------|
| Happy Path | 20 |
| Boundary Testing | 15 |
| Negative Testing | 15 |
| Edge Cases | 10 |
| Unicode / Encoding | 10 |
| Security Validation | 15 |
| Assertions | 10 |
| Error Handling | 5 |

Maximum Score = 100

---

# Coverage Levels

95–100 → Excellent

85–94 → Good

70–84 → Acceptable

50–69 → Needs Improvement

Below 50 → Poor

---

# Coverage Principles

Coverage should measure quality, not quantity.

Many small tests do not automatically mean high coverage.

A single comprehensive test may provide higher value than multiple repetitive tests.