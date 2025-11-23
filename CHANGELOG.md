# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.2.0] - 2025-11-23

### Added
- Add support for SPDX BOM files

### Changed
- The `-u --update` flag became `--no-update` because by default we assume users always want to get the latest version of our database

### Fixed
- Fix a bug that prevented DebParser from identifying packages in the deb ecosystem (it was incorrectly looking for `apt` instead of `deb`)

### Security
- node_modules/js-yaml 4.1.0 to 4.1.1 (https://nvd.nist.gov/vuln/detail/CVE-2025-64718)

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