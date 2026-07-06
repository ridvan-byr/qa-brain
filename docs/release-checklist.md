# QA Brain Release Checklist

Use this checklist before publishing a release candidate or marketplace build.

## Automated Checks

- [ ] Root TypeScript build passes: `npm run build`
- [ ] Integration tests and benchmarks pass: `npm test`
- [ ] VS Code extension compile passes: `npm run compile` from `extensions/vscode`
- [ ] VSIX package command completes: `npm run package` from `extensions/vscode`

## Packaging

- [ ] `LICENSE` exists and is included.
- [ ] `CHANGELOG.md` is updated.
- [ ] `.vscodeignore` excludes tests, benchmarks, validation data, screenshots, and source maps.
- [ ] Compiled extension files are included under `out/`.
- [ ] Compiled QA Brain core is included under `qa-brain-core/dist/`.
- [ ] Rule assets and `knowledge/rule-pack.json` are included under `qa-brain-core/knowledge/`.
- [ ] SHA256 checksum is generated for the VSIX.

## Privacy

- [ ] `qaBrain.telemetryEnabled` defaults to `false`.
- [ ] No telemetry is written when telemetry is disabled.
- [ ] Telemetry payloads include `schemaVersion` and `extensionVersion`.
- [ ] Telemetry never includes file paths, repository URIs, source code, API keys, or secrets.
- [ ] Privacy behavior is documented in `README.md`.

## Marketplace

- [ ] Display name, description, categories, keywords, repository, homepage, and issue links are complete.
- [ ] Marketplace icon and screenshots are prepared.
- [ ] Extension installs in a clean VS Code profile.
- [ ] Sidebar dashboard opens without activation errors.
- [ ] Review and Test Design commands function in Extension Development Host.
