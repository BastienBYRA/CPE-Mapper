# CPE-Mapper
CPE-mapper is a CLI tool and JSON-based database designed to accurately map software package names to their corresponding CPEs (Common Platform Enumerations). 

Its main goal is to improve vulnerability identification in cases where standard package names fail to match known CPEs.

# Highlights
- 📦 Easy to install and easy to use
- ⚡ Lightweight and fast
- 🔒 Security-focused with evidence-backed mappings
- 🔍 Accurate vulnerability mapping through custom CPE associations
- ✨ Compatible CycloneDX JSON from 1.2 to 1.6
- 🧩 Roadmap includes SPDX 2.x, XML support and custom user mappings database

---

# Installing (TODO)
You can install it through `npm`.
```bash
# Not ready yet
npm install -g @bastienbyra/cpe-mapper
```

It is also possible to use the `Docker image`.
```bash
# Not ready yet
docker run --name cpe-mapper -v ./:/data --rm bastienbyra/cpe-mapper:latest apply -i bom.json -o mapped_bom.json
```

---

# Usage
```bash
    ________  ____    __  ___                      
   / ___/ _ \/ __/___/  |/  /__ ____  ___  ___ ____
  / /__/ ___/ _//___/ /|_/ / _ `/ _ \/ _ \/ -_) __/
  \___/_/  /___/   /_/  /_/\_,_/ .__/ .__/\__/_/   
                              /_/  /_/             

Usage: cpe-mapper [options] [command]

CPE-mapper is a CLI tool and JSON-based database designed to accurately map software package names to their corresponding CPEs (Common Platform Enumerations).
Its main goal is to improve vulnerability identification in cases where standard package names fail to match known CPEs.

Options:
  -V, --version    output the version number
  -h, --help       display help for command

Commands:
  apply [options]  Apply CPE mappings to a CycloneDX BOM file
  update           Update the CPE mappings database
  help [command]   display help for command
```

---

# Roadmap / TODO
While the project is almost ready as of today, there are still some features to implement that could provide value to users.

## Mandatory for 1.0.0
- [ ] Create CI/CD pipelines for both the NPM package and Docker build
- [ ] Write documentation (README.md or GitHub Wiki section)
- [ ] Add important project files:
  - [ ] CONTRIBUTING.md
  - [ ] SECURITY.md
  - [ ] CHANGELOG.md
  - [ ] Possibly ARCHITECTURE.md
- [ ] Add license header to each file with author information
- [ ] Add atleast 25+ mapping to have something to work off

## High Priority
- [ ] Improve `apply` command with `--custom-db-path` option, allowing users to provide a custom CPE mapping database
- [ ] Add support for SPDX 2.x JSON format
- [ ] Command `search`: Search if a package already has a mapping in the database using `--groupname`, `--name`, or `--fullname`
- [ ] Add support for XML files (will probably require a dependency)
- [ ] Add unit tests (will probably require a dependency)
- [ ] Add integration tests (likely without extra dependencies, by running the CLI in a dev environment such as a Docker container)

## Bonus
- [ ] Command `compliance` with the following subcommands:
  - [ ] `sbom`: Generate the SBOM for the current version of the CLI