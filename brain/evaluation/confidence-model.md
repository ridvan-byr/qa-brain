---
id: confidence-model
title: Confidence Model
category: Evaluation
priority: High
status: Draft
version: 1.0
---

# Confidence Model

## Purpose

Confidence represents how certain QA Brain is about its findings.

Unlike deterministic rule violations, some recommendations are based on inference and should include a confidence level.

---

# Confidence Levels

| Score | Meaning |
|--------|---------|
| 90–100 | Very High Confidence |
| 75–89 | High Confidence |
| 50–74 | Medium Confidence |
| 25–49 | Low Confidence |
| 0–24 | Insufficient Evidence |

---

# Confidence Factors

QA Brain should consider:

- Explicit assertions
- Test data visibility
- Naming clarity
- Feature identification
- Available context
- Evidence quality

---

# Principles

- Never report uncertain findings as facts.
- Lower confidence when evidence is incomplete.
- Explain why confidence is reduced.