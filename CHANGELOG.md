# Changelog
All notable changes to this project will be documented in this file.

## Unreleased

### Added
- Base implementation to read the CPE mapping database, run it against a JSON CycloneDX SBOM file, and add custom CPEs for components
- Support to install the CPE mapping database and compare it against a local version to ensure it is up-to-date
- Unit tests for `apply` and `update` commands
- CI/CD pipelines to run tests and publish the application (NPM and GitHub Package)