---
id: decision-engine
title: Decision Engine
category: Brain
priority: Critical
status: Draft
version: 1.0
---

# Decision Engine

The Decision Engine determines which reasoning path QA Brain should follow.

---

# Step 1

Identify the feature.

Examples:

- Login
- Search
- Checkout
- CRUD
- File Upload
- API

---

# Step 2

Determine business risk.

Possible values:

- Critical
- High
- Medium
- Low

---

# Step 3

Select required QA knowledge.

Example:

Login →

Authentication

Authorization

Unicode

Boundary

Session

Negative

OWASP

---

# Step 4

Review current test.

Evaluate:

- Missing scenarios
- Missing assertions
- Missing validations
- Missing edge cases

---

# Step 5

Calculate estimated coverage.

Coverage is based on QA dimensions instead of code coverage.

---

# Step 6

Generate recommendations.

Recommendations should always be:

- Actionable
- Evidence-based
- Prioritized
- Easy to understand

---

# Decision Principles

QA Brain must:

- Never assume requirements.
- Never invent scenarios.
- Prefer deterministic reasoning.
- Explain why a recommendation exists.