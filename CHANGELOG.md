# Changelog

Only changes verifiable from this preparation are listed. No retrospective releases or maintenance history are fabricated.

## Unreleased

### Added
- Chinese and English project documentation; contribution, conduct, security, roadmap, and MIT license files.
- Issue and pull request templates; deployment, architecture, and release preparation notes.
- Isolated authentication regression tests.

### Changed
- Archived historical reports and manual scripts; removed browser debugging fixtures from public static serving.
- Authentication now requires explicit development mock mode and a configured secret.
- Database failures no longer authorize a user based only on JWT claims; administrator listing uses current role checks.
- Real password-reset links are delivered by email only, including when SMTP fails.

### Security
- Replaced tracked token/user artifacts and embedded JWT strings with local-test placeholders; historical copies still require review.
- Expanded ignore patterns for local credentials and build caches.

### Release status
- v1.0.0 has not been published. See [release checklist](docs/releases/v1.0.0-checklist.md) for remaining work.
