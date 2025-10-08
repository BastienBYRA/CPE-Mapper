# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.1.0] - 2025-10-08

### Breaking Change
- Break the CPE database files per ecosystem. The CPE-Mapper CLI prior to 1.1.0 is no longer able to consume the database and must be upgraded to version 1.1.0 or later. (Since there are no users as of today, no compatibility plan has been implemented for version 1.0.0)

### Added
- GitHub Action for the `apply` command with accompanying documentation in README.md

## [1.0.0] - 2025-10-05

### Added
- Base implementation to read the CPE mapping database, run it against a JSON CycloneDX SBOM file, and add custom CPEs for components
- Support to install the CPE mapping database and compare it against a local version to ensure it is up-to-date
- Unit tests for `apply` and `update` commands
- CI/CD pipelines to run tests, check licenses, publish the application (NPM and GitHub Package) and create a release