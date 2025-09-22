import { Command } from 'commander';
import { applyCPEMappings } from "./mapper.js";
import { updateCPEDatabase } from "./update.js"

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
  .option('-u, --update', "Update the CPE Mapping database")
  .option('-v, --verbose', 'Enable verbose logging')
  .action((options) => {
    const { inputFile, outputFile, update, verbose } = options;
    applyCPEMappings(inputFile, outputFile, update, verbose)
  });

program.command("update")
  .description('Update the CPE mappings database')
  .action(() => {
    updateCPEDatabase()
  })

program.parse();
