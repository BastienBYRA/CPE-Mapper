import fs from 'fs';
import path from 'path';

/**
 * Maps a BOM file to its corresponding CPE format.
 *
 * @param {string} inputFile - Path to the input BOM file.
 * @param {string} outputFile - Path to the output mapped BOM file.
 * @param {boolean} verbose - Whether to enable verbose logging.
 * @returns {boolean} True if mapping succeeds, false otherwise.
 * @throws {Error} If the input file is invalid or mapping fails unexpectedly.
 */
export const applyCPEMappings = (inputFile, outputFile, verbose) => {
    if (verbose) console.log('Starting CPE mapping process...');
    if (verbose) console.log(`Input file: ${inputFile}`);
    if (verbose) console.log(`Output file: ${outputFile}`);

    // Load BOM
    const bom = loadBomFile(inputFile);

    // Load CPE Mapping database
    const cpeDb = loadCpeMappingDatabase();
    if (verbose) console.log('CPE database loaded successfully');

    // Mapping logic
    if (!bom.components) {
        console.warn('No components found in BOM');
    } else {
        bom.components.forEach(component => {
            if (!component.purl) {
                if (verbose) console.log(`Skipping component without PURL: ${component.name}`);
                return;
            }

            const componentFullName = getComponentFullName(component.group, component.name);
            let cpeDbPkg = searchCpeMapping(componentFullName, cpeDb);

            if (cpeDbPkg) {
                // Replace placeholder with component version if available
                let cpeWithVersion = cpeDbPkg.cpe;
                if (component.version) cpeWithVersion = cpeWithVersion.replace("VERSION_COMPONENT", component.version);
                else cpeWithVersion = cpeWithVersion.replace("VERSION_COMPONENT", "*");

                component.cpe = cpeWithVersion;

                if (verbose) console.log(`Mapped ${component.name} -> ${component.cpe}`);
            } else {
                if (verbose) console.log(`No mapping found for ${component.name}`);
            }
        });
    }

    // Save mapped BOM
    generateMappedFile(outputFile, verbose, bom);
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
 * @returns {object} Parsed CPE mapping database.
 * @throws {Error} If the mapping database does not exist or is not valid JSON.
 */
const loadCpeMappingDatabase = () => {
    const dbPath = path.resolve('data/cpe-mapper.json');
    if (!fs.existsSync(dbPath)) {
        console.error(`CPE database not found at ${dbPath}`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

/**
 * Builds a normalized component full name for comparison with the CPE database.
 *
 * Rules:
 * - If both group and name exist → "group:name"
 * - If only name exists → "name"
 * - If only group exists → treated as "name"
 *
 * @param {string} group - Optional package group (e.g., Maven groupId).
 * @param {string} name - Package name.
 * @returns {string|undefined} The normalized full name, or undefined if invalid.
 */
const getComponentFullName = (group, name) => {
    if (!group && !name) {
        console.warn(`No name nor group found for a component`);
        return;
    }
    if (group && !name) {
        console.warn(`The component only has a group but no name, using group as name`);
        return `${group}`;
    }
    if (!group && name) return `${name}`;
    if (group && name) return `${group}:${name}`;
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

/**
 * Searches the CPE mapping database for a component by full name.
 *
 * @param {string} componentFullName - Normalized component identifier ("group:name" or "name").
 * @param {object} cpeDb - The CPE database.
 * @returns {object|undefined} The matching CPE package mapping, or undefined if none found.
 */
const searchCpeMapping = (componentFullName, cpeDb) => {
    return cpeDb.packages.find(cpeDbPkg => {
        let cpeDbPkgFullName;

        if (componentFullName.search(":") === -1) cpeDbPkgFullName = `${cpeDbPkg.name}`;
        else cpeDbPkgFullName = `${cpeDbPkg.group}:${cpeDbPkg.name}`;
        
        if (cpeDbPkgFullName === componentFullName) return cpeDbPkg;
    });
};
