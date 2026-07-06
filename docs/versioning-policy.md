# QA Brain Versioning Policy

QA Brain uses semantic versioning for user-facing releases, extension packages, and rule packs.

## Product Versions

- `MAJOR`: Breaking changes to public CLI commands, MCP tools, VS Code settings, report contracts, or framework support guarantees.
- `MINOR`: New features, new framework preview support, new rule categories, or new client capabilities that remain backward compatible.
- `PATCH`: Bug fixes, calibration tweaks, documentation updates, and non-breaking packaging changes.

## Rule Pack Versions

Rule packs are versioned independently from the VS Code extension.

- `MAJOR`: Rule output semantics or compatibility bounds change.
- `MINOR`: New rules, new framework evidence mappings, or new recommendation templates are added.
- `PATCH`: Rule text, examples, confidence wording, and false-positive calibration improvements.

## Compatibility

Each rule pack declares the compatible QA Brain version range in `knowledge/rule-pack.json`.
Clients must treat incompatible rule packs as unsupported instead of silently loading them.

## Release Candidate Policy

Release candidates are used when a new client, framework adapter, or marketplace package changes the user-facing experience.

Recommended flow:

```text
RC package
  -> smoke test
  -> real project usage
  -> bug fixes
  -> final package
```

## Telemetry Versioning

Telemetry payloads include:

- `schemaVersion`
- `extensionVersion`
- anonymized event metadata

Telemetry schema changes require a schema version increment. Telemetry must never include file paths, repository URLs, source code, API keys, or secrets.
