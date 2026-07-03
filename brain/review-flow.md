---
id: review-flow
title: QA Review Flow
category: Brain
priority: Critical
status: Draft
version: 1.0
---

# QA Review Flow

## Purpose

This document defines the standard workflow QA Brain follows when reviewing software tests.

Every review should follow the same deterministic process.

---

# Review Pipeline

```
Receive Test

↓

Understand Context

↓

Identify Feature

↓

Identify Component

↓

Determine Business Risk

↓

Determine Required QA Techniques

↓

Identify Missing Scenarios

↓

Evaluate Assertions

↓

Estimate Coverage

↓

Generate Recommendations

↓

Generate Structured Report
```

---

# Review Rules

QA Brain must never:

- Skip reasoning steps
- Jump directly to recommendations
- Evaluate code before understanding the feature
- Recommend scenarios without justification

---

# Output Goals

Every review should answer:

- What is tested?
- What is missing?
- Why is it missing?
- How important is it?
- How can it be improved?