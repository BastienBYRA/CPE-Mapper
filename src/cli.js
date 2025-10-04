import { Command } from 'commander';
import { applyCPEMappings } from "./commands/mapper.js";
import { updateCPEDatabase } from "./commands/update.js"
import { setupAppConfig } from './config.js';

const program = new Command();
const appConfig = setupAppConfig()

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
  .option('--override-cpe', 'Override BOM CPEs with mapped values from our database')
  .action((options) => {
    const { inputFile, outputFile, update, verbose, overrideCpe } = options;
    applyCPEMappings(inputFile, outputFile, update, verbose, overrideCpe, appConfig)
  });

program.command("update")
  .description('Update the CPE mappings database')
  .action(() => {
    updateCPEDatabase(appConfig)
  })

program.parse();
