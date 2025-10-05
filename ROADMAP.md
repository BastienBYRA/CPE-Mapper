# Roadmap
This project roadmap lists tasks and features that still need to be implemented.  

It is organized into five categories:

### EX. Database Entries
This section does not focus on features, but rather on a continuous task: enriching the CPE-Mapper database.

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

## Database Entries
- Add new entries to the [CPE database](data/cpe-mapper.json)

## Mandatory (for 1.1.0)
- [] Add a `config` command. Through environment variables or a configuration file, users should be able to define:
  - `custom-db-path`
  - `custom-db-url`
  - `custom-db-save-file-path`
  - [] Add a `check` subcommand to verify that the provided values are valid.
- [ ] Improve the `apply` command with the `--custom-db-path` and `--custom-db-url` options, allowing users to provide a custom CPE mapping database.
  - [] Add a `--disable-default-db` option to disable the default CPE mapping database.
- [ ] Add support for SPDX 2.x JSON format.

## High Priority
- [ ] Add integration tests (preferably without extra dependencies, by running the CLI in a development environment such as a Docker container).

## Low Priority
- [ ] `search` command: Search if a package already has a mapping in the database using `--groupname`, `--name`, or `--fullname`.
- [ ] Add support for XML files (may require an additional dependency).
- [] Add a `server` command and mode, allowing users to deploy CPE-Mapper as a server capable of consuming BOM files through a web API.
- [] Add a mechanism for users to specify which mappings from the CPE database should be ignored.

## Bonus
- [ ] `compliance` command with the following subcommands:
  - [ ] `sbom`: Generate the SBOM for the current version of the CLI.
