---
id: pw-auto-waiting
title: Playwright Auto Waiting
category: Playwright Fundamentals
priority: Critical
status: Stable
version: 1.0
source:
  - https://playwright.dev/docs/actionability
  - https://playwright.dev/docs/best-practices
---

# Purpose

Auto Waiting is one of Playwright's core features. Before performing actions such as clicking, filling, or typing, Playwright automatically waits until the target element becomes actionable.

QA Brain must recognize when Playwright's built-in waiting is sufficient and when explicit waiting is justified.

---

# Why It Matters

Incorrect waiting strategies are one of the leading causes of flaky tests.

Using unnecessary waits slows down execution, while missing waits can produce intermittent failures.

Proper use of Auto Waiting improves:

- Stability
- Reliability
- Maintainability
- Execution speed

---

# Official Best Practices

Playwright recommends relying on its built-in Auto Waiting whenever possible.

Avoid replacing built-in waiting with manual delays.

Prefer waiting for meaningful application states instead of arbitrary timeouts.

---

# Actionability Checks

Before interacting with an element, Playwright verifies that it is:

- Visible
- Stable
- Receives events
- Enabled
- Editable (when required)

If these checks fail, Playwright continues waiting until the timeout expires.

---

# Common Mistakes

❌ Using `waitForTimeout()` to make tests pass.

❌ Adding unnecessary explicit waits before every action.

❌ Waiting for arbitrary durations instead of application state.

❌ Mixing multiple waiting strategies without understanding why.

---

# Acceptable Explicit Waiting

Explicit waits are appropriate when waiting for:

- API responses
- Network idle conditions (when justified)
- Dynamic page state changes
- Custom business events
- URL changes
- File downloads/uploads

---

# QA Review Rules

QA Brain should flag:

- Frequent use of `waitForTimeout()`
- Multiple consecutive manual waits
- Explicit waits that duplicate Auto Waiting
- Waiting without a business reason

QA Brain should NOT flag:

- Legitimate waits for network responses
- Waiting for downloads
- Waiting for navigation completion
- Waiting for asynchronous business events

---

# AI Decision Rules

IF

Playwright action already provides Auto Waiting

AND

An additional explicit wait exists immediately before it

THEN

Recommend removing the redundant wait.

---

IF

`waitForTimeout()` is used outside of debugging

THEN

Recommend replacing it with a condition-based wait.

---

# Good Example

```ts
await page.getByRole("button", { name: "Login" }).click();

await expect(page.getByText("Welcome")).toBeVisible();
```

---

# Bad Example

```ts
await page.waitForTimeout(5000);

await page.click("#login");
```

---

# Review Checklist

- Does the test rely on Auto Waiting?
- Are manual waits justified?
- Is `waitForTimeout()` used?
- Are waits condition-based?
- Could any waits be removed without affecting stability?

---

# References

- Playwright Documentation – Actionability
- Playwright Documentation – Best Practices