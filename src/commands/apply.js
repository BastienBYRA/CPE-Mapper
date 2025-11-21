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

import fs from 'node:fs';
import path from 'node:path';
import { updateCPEDatabase } from './update.js';
import { AppConfig } from '../config.js';
import { BOMFormats, guessBOMFormat } from '../utils/utils-bom.js';
import { ParserManager } from '../parsers/manager.js';

/**
 * Maps a BOM file to its corresponding CPE format.
 *
 * @param {string} inputFile - Path to the input BOM file.
 * @param {string} outputFile - Path to the output mapped BOM file.
 * @param {boolean} update - Whether to check for updates to the CPE mapping database.
 * @param {boolean} verbose - Whether to enable verbose logging.
 * @param {boolean} overrideCpe - Whether we replace existing CPE mapping or not.
 * @param {AppConfig} appConfig - The application configuration.
 * @returns {boolean} True if mapping succeeds, false otherwise.
 * @throws {Error} If the input file is invalid or mapping fails unexpectedly.
 */
export const applyCPEMappings = async (inputFile, outputFile, update, verbose, overrideCpe, appConfig) => {
    if (verbose) console.log('Starting CPE mapping process...');
    if (verbose) console.log(`Input file: ${inputFile}`);
    if (verbose) console.log(`Output file: ${outputFile}`);

    if (update) await updateCPEDatabase(appConfig);

    // Load BOM
    const bomContent = loadBomFile(inputFile);

    // Load CPE Mapping database
    const cpeDbContent = await loadCpeMappingDatabase(appConfig);
    if (verbose) console.log('CPE database loaded successfully');

    // Guess the BOM format (TODO: Add a `--bom-format` flag once SPDX format is good to go)
    const bomFormat = guessBOMFormat(bomContent)
    if (bomFormat == BOMFormats.NotFound) {
        console.error("Unable to identify the BOM file format")
        process.exit(1)
    }
    
    // Identifies the parsers needed to map the BOM
    const listRequiredParsers = new ParserManager().getRequiredParsers(bomFormat, bomContent)
    if (listRequiredParsers.length === 0) {
        console.error("No known ecosystems found in BOM");
        process.exit(1);
    }

    // Read the BOM file and applies the CPE database mapping
    listRequiredParsers.forEach(parser => {
        // TODO: Optimize the code so only the required parser runs for a given component
        // Could probably be done by reading the component PURL before iterating on the parsers list
        // or if we iterate on it, then quit immediately if it is not the right one.
        if (bomFormat == BOMFormats.CycloneDX)
            parser.parseCycloneDX(cpeDbContent, bomContent, overrideCpe, verbose)
        else
            // TODO: Not yet implemented
            parser.parseSPDX()
    });

    // Save mapped BOM
    generateMappedFile(outputFile, verbose, bomContent);
    console.info("BOM mapping has successfully finished");
    return true;
}

/**
 * Loads and parses a CycloneDX BOM file.
 *
 * @param {string} inputFile - Path to the BOM JSON file.
 * @returns {object} Parsed BOM object.
 * @throws {Error} If the file does not exist or is not valid JSON.
 */
const loadBomFile = (inputFile) => {
    if (!fs.existsSync(inputFile)) {
        console.error(`Input file not found: ${inputFile}`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
}

/**
 * Loads and parses the local CPE mapping database.
 *
 * @param {AppConfig} appConfig - The application configuration. (Required if the CPE database does not exist)
 * @returns {Promise<object>} Parsed CPE mapping database.
 * @throws {Error} If the mapping database does not exist or is not valid JSON.
 */
const loadCpeMappingDatabase = async (appConfig) => {
    const dbPath = path.resolve(appConfig.dbOsPath);

    if (!fs.existsSync(dbPath)) {
        console.warn(`CPE database not found at ${dbPath}, it will be automatically created`);
        await updateCPEDatabase(appConfig);
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

/**
 * Writes the mapped BOM to a file.
 *
 * @param {string} outputFile - Path to the output file.
 * @param {boolean} verbose - Whether to log the save operation.
 */
const generateMappedFile = (outputFile, verbose, bom) => {
    fs.writeFileSync(outputFile, JSON.stringify(bom, null, 2), 'utf-8');
    if (verbose) console.log(`Mapped BOM saved to ${outputFile}`);
}