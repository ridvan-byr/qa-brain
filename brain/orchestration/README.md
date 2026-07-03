# Orchestration Layer

The Orchestration Layer coordinates how QA Brain loads knowledge, applies review rules, resolves conflicts, and generates deterministic review results.

It acts as the execution planner of QA Brain.

Instead of evaluating every available rule, QA Brain dynamically selects the most relevant knowledge based on the detected framework, feature, component, and risk level.

---

# Responsibilities

- Load only relevant knowledge
- Prioritize review rules
- Resolve conflicting recommendations
- Execute deterministic review sequences
- Optimize token usage
- Produce consistent review results

---

# Components

- Knowledge Loading
- Review Strategy
- Priority Engine
- Rule Selection
- Conflict Resolution
- Review Sequence