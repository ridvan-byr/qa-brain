# Brain Layer

The Brain Layer is the reasoning core of QA Brain.

Unlike the `knowledge/` directory, which stores structured QA knowledge, the Brain Layer defines **how QA Brain thinks**, **how it selects knowledge**, and **how it generates consistent review decisions**.

It is responsible for transforming static QA knowledge into intelligent analysis.

---

# Responsibilities

The Brain Layer is responsible for:

- Understanding the feature under test
- Identifying business and technical risk
- Selecting the appropriate knowledge modules
- Applying QA reasoning
- Measuring test coverage
- Detecting missing scenarios
- Producing structured review reports

---

# Brain Workflow

```
User Input
      │
      ▼
Feature Detection
      │
      ▼
Risk Assessment
      │
      ▼
Knowledge Routing
      │
      ▼
QA Reasoning
      │
      ▼
Coverage Evaluation
      │
      ▼
Recommendation Generation
      │
      ▼
Structured Review
```

---

# Directory Structure

```
brain/

README.md

architecture.md

reasoning-strategy.md

knowledge-map.md

decision-engine.md

review-flow.md

coverage-model.md

risk-model.md

output-model.md
```

---

# Design Principles

The Brain Layer must always:

- Follow deterministic reasoning
- Use structured QA knowledge
- Avoid assumptions
- Explain every recommendation
- Prioritize reproducibility
- Remain framework-agnostic whenever possible

---

# Relationship with Other Layers

```
Knowledge Layer

↓

Brain Layer

↓

Prompt Layer

↓

Review Layer
```

The Brain Layer acts as the decision-making engine between QA knowledge and AI prompts.

---

# Future Goal

The long-term objective of the Brain Layer is to provide a reusable reasoning engine capable of supporting multiple testing frameworks such as:

- Playwright
- Cypress
- Selenium
- Appium
- Robot Framework
- REST Assured

without changing its core reasoning process.