# CPE-Mapper
CPE-mapper is a CLI tool and JSON-based database designed to accurately map software package names to their corresponding CPEs (Common Platform Enumerations). 

Its main goal is to improve vulnerability identification in cases where standard package names fail to match known CPEs.

## Highlights
- 📦 Easy to install and easy to use
- ⚡ Lightweight and fast
- 🔒 Security-focused with evidence-backed mappings
- 🔍 Improved vulnerability detection through custom CPE mappings
- ✨ Compatible CycloneDX JSON from 1.2 to 1.6
- 🧩 Roadmap includes SPDX 2.x, XML support and custom user mappings database

---

## How does it work
CPE-mapper is a rather simple tool.

It does not analyze your source code or repository to guess which dependencies correspond to which CPEs. Instead, it relies on a [JSON mapping file (our CPE database)](./data/cpe-mapper.json) that explicitly defines, for each package name, the corresponding CPE.

We use the [NVD (National Vulnerability Database)](https://nvd.nist.gov/) as a reference to determine which CPE is used for a specific piece of software, and we manually link them together.

For example, NVD reports vulnerabilities for Apache Tomcat using the CPE:
```bash
cpe:2.3:a:apache:tomcat:*:*:*:*:*:*:*:*
```

However, this CPE cannot be directly derived from the Java package name `org.apache.tomcat.embed:tomcat-embed-core`.

To solve this, CPE-mapper maintains a mapping in its database so that when it processes a BOM file, if it finds the package `org.apache.tomcat.embed:tomcat-embed-core`, it automatically adds the corresponding CPE `cpe:2.3:a:apache:tomcat:<your_package_version>:*:*:*:*:*:*:*` to the output.

### False positives
CPE-mapper **may report false positives**, due to how the NVD assigns CPEs to CVEs.

Let’s take Log4j as an example: all CVEs related to Log4j are associated with the following CPE:
```bash
cpe:2.3:a:apache:log4j:<log4j_version>:*:*:*:*:*:*:*
```

This way of tagging vulnerabilities does not take into account the different modules that make up Log4j, such as `log4j-core`, `log4j-api`, `log4j-web`, or `log4j-slf4j-impl`.

In other words, the NVD does not distinguish between the different packages that compose a piece of software; it treats the entire project as a single entity.

As a result, we decided to associate CPEs with the **core** package of each software (e.g., `log4j-core`, `tomcat-embed-core`, `logback-core`...), since these core modules are used or implemented by all their derived packages (for example in Log4j: `log4j-api`, `log4j-web`...).

This ensures that you are notified whenever a new CVE is published for the software as a whole.

While this approach may generate false positives (for instance, some CVEs might affect a derived package you don’t actually use), it provides the safest coverage to ensure you don’t miss any relevant vulnerabilities.

## Getting Started

### Installing
You can install CPE-mapper in several ways:

1. From `npm`.
```bash
npm install -g @bastienbyra/cpe-mapper

# You can then run it using `cpe-mapper`
```

2. Through `Docker image`.
```bash
docker run -v path/to/your/bom/folder:/data --rm ghcr.io/bastienbyra/cpe-mapper:latest apply -i /data/bom.json -o /data/mapped_bom.json
```

### Commands

#### Apply
```bash
Usage: cpe-mapper apply [options]

Apply CPE mappings to a CycloneDX BOM file

Options:
  -i, --input-file <file>   Input BOM file (JSON)
  -o, --output-file <file>  Output mapped BOM file
  -u, --update              Update the CPE Mapping database
  --override-cpe            Override BOM CPEs with mapped values from our database
  -v, --verbose             Enable verbose logging
  -h, --help                display help for command
```
##### Example
Apply CPE-mapper database mappings to a BOM file
```bash
cpe-mapper apply -i input-bom.json -o output-bom.json
```

Apply CPE-mapper database mappings to a BOM file, overwriting the existing CPEs in the input file.
```bash
cpe-mapper apply -i input-bom.json -o output-bom.json --override-cpe
```

#### Update
```bash
Usage: cpe-mapper update [options]

Update the CPE mappings database

Options:
  -h, --help  display help for command
```

##### Example
Check if the database has updates and apply them.
```bash
cpe-mapper update
```
---

## Contributing
If you would like to contribute to this project, whether by **reporting issues**, **proposing new ideas**, **developing features**, or **adding entries to the CPE database**, please see the [CONTRIBUTING](./CONTRIBUTING.md) guide for details.

## Roadmap
The [ROADMAP](./ROADMAP.md) lists all the tasks planned for the future.