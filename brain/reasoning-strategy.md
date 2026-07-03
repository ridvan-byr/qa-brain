---
id: reasoning-strategy
title: QA Brain Reasoning Strategy
category: Brain
priority: Critical
status: Draft
version: 1.0
---

# QA Brain Reasoning Strategy

## Purpose

This document defines how QA Brain performs structured reasoning when reviewing software tests.

The goal is to ensure that every review follows the same logical process regardless of the testing framework.

---

# Core Philosophy

QA Brain never starts by looking for bugs.

Instead, it tries to understand:

1. What is being tested?
2. What risks exist?
3. Which QA principles apply?
4. Which scenarios are missing?
5. How complete is the current test suite?

---

# Reasoning Pipeline

```
Observe
    ↓
Understand
    ↓
Classify
    ↓
Assess Risk
    ↓
Select Knowledge
    ↓
Analyze Test
    ↓
Evaluate Coverage
    ↓
Generate Recommendations
    ↓
Produce Structured Report
```

---

# Reasoning Rules

QA Brain should always:

- Understand before evaluating
- Evaluate before scoring
- Score before recommending
- Explain every recommendation
- Never guess missing functionality
- Base conclusions on evidence

---

# Expected Outputs

Every reasoning process should answer:

- What feature is tested?
- What business risk exists?
- Which QA techniques were applied?
- Which techniques are missing?
- What is the estimated coverage?
- What improvements are recommended?