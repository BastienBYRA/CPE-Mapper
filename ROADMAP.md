# Roadmap

This project roadmap is divided into two sections:

- **DONE**: Completed tasks and features.
- **TODO**: Tasks and features that still need to be implemented.

Each section is organized into the same four categories:

### 1. Mandatory
The most important and critical features required to ensure the core quality and proper functioning of the application, including essential open source and administrative tasks.

### 2. High Priority
Important and valuable features that are not strictly necessary for the application to work, but that add significant value.

### 3. Low Priority
Less important tasks. They provide improvements, but they are not essential and can be done later.

### 4. Bonus
Optional features or ideas that don’t provide much value but could be fun or interesting to implement.

---

# TODO

## Mandatory (for 1.0.0)
- [ ] Write documentation (README.md or GitHub Wiki section)
- [ ] Add license header to each file with author information
- [ ] Add atleast 25+ mapping to have something to work off

## High Priority
- [ ] Improve `apply` command with `--custom-db-path` and `--custom-db-url` options, allowing users to provide a custom CPE mapping database
- [ ] Add support for SPDX 2.x JSON format
- [ ] Add integration tests (likely without extra dependencies, by running the CLI in a dev environment such as a Docker container)

## Low Priority
- [ ] Command `search`: Search if a package already has a mapping in the database using `--groupname`, `--name`, or `--fullname`
- [ ] Add support for XML files (will probably require a dependency)

## Bonus
- [ ] Command `compliance` with the following subcommands:
  - [ ] `sbom`: Get the SBOM for the current version of the CLI