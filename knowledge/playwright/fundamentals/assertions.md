# Purpose

## Assertion Philosophy

Assertions verify business outcomes,
not implementation details.

---

## Official Best Practices

Prefer:

expect(locator).toBeVisible()

instead of

manual boolean checks

---

## Strong Assertions

- toBeVisible()
- toHaveText()
- toHaveValue()
- toBeEnabled()
- toHaveURL()
- toHaveTitle()

---

## Weak Assertions

- expect(true)
- expect(status===200)
- console.log()

---

## Common Mistakes

Missing assertions

Multiple unrelated assertions

Assertions after timeout

---

## QA Review Rules

Missing assertion

Weak assertion

Implementation assertion

---

## AI Decision Rules

If interaction exists
but assertion missing

↓

Report Missing Validation

---

Checklist