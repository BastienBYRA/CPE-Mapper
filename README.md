# CPE-Mapper
CPE-mapper is a CLI tool and JSON-based database designed to accurately map software package names to their corresponding CPEs (Common Platform Enumerations). Its main goal is to improve vulnerability identification in cases where standard package names fail to match known CPEs

# Installing (TODO)
You can install it through `npm`.
```bash
# Not ready yet
npm install -g @bastienbyra/cpe-mapper
```

It is also possible to use the `Docker image`.
```bash
# Not ready yet
docker run --name cpe-mapper --rm @bastienbyra/cpe-mapper apply -i bom.json -o mapped_bom.json
```

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
  help [command]   display help for command
```