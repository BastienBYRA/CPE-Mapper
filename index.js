import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('cpe-mapper')
  .description(`CPE-mapper is a CLI tool and JSON-based database designed to accurately map software package names to their corresponding CPEs (Common Platform Enumerations). 
Its main goal is to improve vulnerability identification in cases where standard package names fail to match known CPEs.`)
  .version('0.1.0');

program.command('apply')
  .description('Apply CPE mappings to a CycloneDX BOM file')
  .requiredOption('-i, --input-file <file>', 'Input BOM file (JSON)')
  .requiredOption('-o, --output-file <file>', 'Output mapped BOM file')
  .option('-v, --verbose', 'Enable verbose logging')
  .action((options) => {
    const { inputFile, outputFile, verbose } = options;

    if (verbose) console.log('Starting CPE mapping process...');
    if (verbose) console.log(`Input file: ${inputFile}`);
    if (verbose) console.log(`Output file: ${outputFile}`);

    // Load BOM
    if (!fs.existsSync(inputFile)) {
      console.error(`Input file not found: ${inputFile}`);
      process.exit(1);
    }
    const bom = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    // Load CPE database
    const dbPath = path.resolve('cpe-mapper.json');
    if (!fs.existsSync(dbPath)) {
      console.error(`CPE database not found at ${dbPath}`);
      process.exit(1);
    }
    const cpeDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    if (verbose) console.log('CPE database loaded successfully');

    // ---- Mapping logic ----
    if (!bom.components) {
      console.warn('No components found in BOM');
    } else {
      bom.components.forEach(component => {
        if (!component.purl) {
          if (verbose) console.log(`Skipping component without PURL: ${component.name}`);
          return;
        }

        // Exemple: pkg:maven/org.apache.tomcat.embed/tomcat-embed-core@10.1.39
        const componentType = component.purl
          .split("/")[0] // "pkg:maven"
          .split(":")[1]; // "maven"

        const match = cpeDb.packages.find(pkg => {
          if (pkg.type !== componentType) return false;

          if (pkg.type === 'maven') {
            const componentFullName = `${component.group}:${component.name}`;
            const pkgFullName = `${pkg.group}:${pkg.name}`;
            return componentFullName === pkgFullName;
          }

          return pkg.name === component.name;
        });

        if (match) {
          // Add the version of the component to the CPE
          let cpeWithVersion = match.cpe;
          if (component.version) {
            cpeWithVersion = cpeWithVersion.replace("VERSION_COMPONENT", component.version);
          } else {
            cpeWithVersion = cpeWithVersion.replace("VERSION_COMPONENT", "*");
          }

          component.cpe = cpeWithVersion;

          if (verbose) {
            console.log(`Mapped ${component.name} (${componentType}) -> ${component.cpe}`);
          }
        } else {
          if (verbose) {
            console.log(`No mapping found for ${component.name} (${componentType})`);
          }
        }
      });
    }

    // Save mapped BOM
    fs.writeFileSync(outputFile, JSON.stringify(bom, null, 2), 'utf-8');
    if (verbose) console.log(`Mapped BOM saved to ${outputFile}`);
  });

program.parse();
