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
docker run --name cpe-mapper -v ./:/data --rm ghcr.io/bastienbyra/cpe-mapper:latest apply -i bom.json -o mapped_bom.json
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

# Roadmap
While the project is approaching its ready state, there are still some features to implement that could provide value to users.

The ROAMDAP is available [in the ROADMAP.md file](./ROADMAP.md)