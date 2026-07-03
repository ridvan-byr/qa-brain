# Purpose

## Why Locators Matter

## Locator Priority

1. getByRole()
2. getByLabel()
3. getByPlaceholder()
4. getByText()
5. getByTestId()
6. CSS Locator
7. XPath

## Official Best Practices

## Accessibility Benefits

## Common Locator Mistakes

## QA Review Rules

QA Brain should flag:

- XPath overuse
- Deep CSS selectors
- nth-child selectors
- Dynamic class selectors
- Brittle selectors

QA Brain should prefer:

- getByRole
- getByLabel
- getByTestId

## AI Decision Rules

IF XPath exists
AND equivalent Role locator possible
THEN Recommend Role Locator

## Good Example

## Bad Example

## Review Checklist

## References