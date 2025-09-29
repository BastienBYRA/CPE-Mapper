import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync } from 'node:fs';
import { AppConfig } from '../config.js';

/**
 * Updates the local CPE mapping database by comparing its hash with the distant database.
 * If differences are detected, the local file is replaced with the distant version.
 *
 * @async
 * @param {AppConfig} appConfig - The application configuration.
 * @throws {Error} If the distant database cannot be retrieved.
 */
export const updateCPEDatabase = async (appConfig) => {
    const distantDbData = await getDistantDatabaseData(appConfig.dbURL)

    const localDbHash = getLocalDatabaseHash(appConfig.dbOsPath)
    const distantDbHash = getDistantDatabaseHash(distantDbData)

    if (localDbHash === distantDbHash) {
        console.info("The database is already up-to-date!")
    } else {
        writeFileSync(appConfig.dbOsPath, JSON.stringify(distantDbData, null, 2), "utf-8");
        console.info("CPE database updated successfully");
    }
}

/**
 * Retrieves the distant CPE mapping database from the GitHub repository.
 *
 * @async
 * @param {string} url The URL of the distant CPE mapping database (JSON file).
 * @returns {Promise<object>} The parsed JSON content of the distant database.
 * @throws {Error} If the database cannot be fetched or parsed.
 */
const getDistantDatabaseData = async (url) => {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch {
        console.error("Impossible to retrieve the database. Verify whether it is a network issue or a repository issue");
        process.exit(1);
    }
}

/**
 * Computes the SHA-256 hash of the local CPE database file.
 *
 * @param {string} filepath Path to the local CPE mapping database file.
 * @returns {string|undefined} The computed hash, or undefined if the local file is missing.
 */
const getLocalDatabaseHash = (filepath) => {
    try {
        const dataFile = readFileSync(filepath, "utf-8");

        // Need to Parse then Stringify to transform it in a "one-liner" JSON the same way the API does.
        const jsonString = JSON.stringify(JSON.parse(dataFile));
        const hash = createHash("sha256").update(jsonString).digest("hex");
        return hash
    } catch {
        console.warn("Impossible to find the local database file, a new one will be created");
        return undefined
    }
}


/**
 * Computes the SHA-256 hash of the distant CPE database data.
 *
 * @param {object} distantDbData - The JSON data of the distant CPE database.
 * @returns {string|undefined} The computed hash of the distant database content, or undefined if no data.
 */
const getDistantDatabaseHash = (distantDbData) => {
    if (!distantDbData) return undefined;
    
    const jsonString = JSON.stringify(distantDbData);
    const hash = createHash("sha256").update(jsonString).digest("hex");
    return hash
};


/**
 * !!! To succesfully run, NODE_ENV must be "test"
 * 
 * Ugly way to export function for testing without making them public...
 * If someone have a better way to do that, that is shorter, go with it
 * 
 * I just want the solution to be elegant, simple to understand, and not dependant of an external package
 */
export let TEST__UPDATE_JS
if (process.env.NODE_ENV === 'test') {
  TEST__UPDATE_JS = {
    getLocalDatabaseHash,
    getDistantDatabaseHash
  };
}