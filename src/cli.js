#!/usr/bin/env node
/**
 * Copyright 2025 Bastien BYRA
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Command } from 'commander';
import { applyCPEMappings } from "./commands/apply.js";
import { updateCPEDatabase } from "./commands/update.js"
import { setupAppConfig } from './config.js';

const program = new Command();
const appConfig = setupAppConfig()

program
  .name('cpe-mapper')
  .description(`CPE-mapper is a CLI tool and JSON-based database designed to accurately map software package names to their corresponding CPEs (Common Platform Enumerations). 
Its main goal is to improve vulnerability identification in cases where standard package names fail to match known CPEs.`)
  .version('1.2.0');

program.command('apply')
  .description('Apply CPE mappings to a CycloneDX BOM file')
  .requiredOption('-i, --input-file <file>', 'Input BOM file (JSON)')
  .requiredOption('-o, --output-file <file>', 'Output mapped BOM file')
  .option('--no-update', 'Disable updating the CPE Mapping database')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--override-cpe', 'Override BOM CPEs with mapped values from our database (CycloneDX only)')
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
