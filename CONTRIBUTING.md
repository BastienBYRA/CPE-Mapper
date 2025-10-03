# Contribution Guidelines
Thank you for considering contributing to this project!

Every contribution is valuable and welcome!

## Ideas, Features & Questions
Use **Discussions** for suggestions, feature requests, ideas, questions, or general conversations about the project.

Please create **one discussion per topic** to keep things organized.

If a proposal is accepted, it can then be turned into an Issue for implementation.

## Issues & Implementation Tracking
Use **Issues** to report bugs or to track features that have already been agreed upon (in **Dicussions**).

Please open **one issue per problem or feature** to keep things clear and easy to track.

## How to Contribute
If you’d like to contribute, feel free to pick **any task** from the TODO section in the [ROADMAP.md](./ROADMAP.md).

To get started:
1. Choose a task from the roadmap.
2. Open an issue (one per problem or feature).
3. Submit a Pull Request when ready.

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

We also try to limit external dependencies, so please add them carefully and only if truly required!

### Enriching the database
Special note for Pull Requests that enrich the CPE database:

The database follows this JSON format (example with `org.apache.tomcat.embed:tomcat-embed-core` package):
```json
{
  "name": "tomcat-embed-core",
  "group": "org.apache.tomcat.embed",
  "cpe": "cpe:2.3:a:apache:tomcat:VERSION_COMPONENT:*:*:*:*:*:*:*",
  "description": "This mapping is provided because NVD attributes CVEs to apache:tomcat, not to the Java package tomcat-embed-core.",
  "evidence": [
    { "proof": "https://nvd.nist.gov/vuln/detail/CVE-2023-1234" },
    { "proof": "https://nvd.nist.gov/vuln/detail/CVE-2022-5678" }
  ]
}
```
| Field | Description | Can be empty |
| --- | --- | --- |
| `name` | The name of the package | No |
| `group` | The group to which the package belongs *(Java packages have a group; Node packages may not)* | Yes |
| `cpe` | The CPE to which the package will be mapped | No |
| `description` | A short explanation of why this mapping is done | No |
| `evidence.proof` | Link or reference that justifies why this package is mapped to the given CPE. It should provide evidence supporting the mapping | No |

As an example :
```jsonc
// Maven repository reference: https://mvnrepository.com/artifact/org.apache.tomcat.embed/tomcat-embed-core
{
  "name": "tomcat-embed-core",
  "group": "org.apache.tomcat.embed",

  // Evidence: links justifying the mapping to the given CPE
  "evidence": [
    { "proof": "https://nvd.nist.gov/vuln/detail/CVE-2023-1234" },
    { "proof": "https://nvd.nist.gov/vuln/detail/CVE-2022-5678" }
  ],

  // Explanation of the mapping
  "description": "This mapping is provided because NVD attributes CVEs to apache:tomcat, not to the Java package org.apache.tomcat.embed:tomcat-embed-core.",

  // Corresponding CPE (VERSION_COMPONENT is a placeholder replaced by the program)
  "cpe": "cpe:2.3:a:apache:tomcat:VERSION_COMPONENT:*:*:*:*:*:*:*"
}
```

Please use the `cpe-database:` prefix at the beginning of your Pull Request title.

Examples:
1. Single entry: `cpe-database: add entry for org.apache.tomcat.embed:tomcat-embed-core package`
2. Multiple entries: `cpe-database: add entries for org.apache.tomcat.embed:tomcat-embed-core, com.google.guava:guava and com.fasterxml.jackson.core:jackson-databind packages`