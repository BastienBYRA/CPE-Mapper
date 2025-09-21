import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync } from 'node:fs';

/**
 * Updates the local CPE mapping database by comparing its hash with the distant database.
 * If differences are detected, the local file is replaced with the distant version.
 *
 * @async
 * @returns {Promise<void>} Resolves when the update process is complete.
 * @throws {Error} If the distant database cannot be retrieved.
 */
export const updateCPEDatabase = async () => {
    const distantDbData = await getDistantDatabaseData()

    const localDbHash = getLocalDatabaseHash()
    const distantDbHash = await getDistantDatabaseHash(distantDbData)

    if (localDbHash === distantDbHash) {
        console.info("The database is already up-to-date!")
        return;
    }

    writeFileSync("data/cpe-mapper.json", JSON.stringify(distantDbData, null, 2), "utf-8");
}

/**
 * Retrieves the distant CPE mapping database from the GitHub repository.
 *
 * @async
 * @returns {Promise<object>} The parsed JSON content of the distant database.
 * @throws {Error} If the database cannot be fetched or parsed.
 */
const getDistantDatabaseData = async () => {
    const url = "https://raw.githubusercontent.com/BastienBYRA/CPE-Mapper/refs/heads/main/data/cpe-mapper.json";

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
 * @returns {string|undefined} The computed hash, or undefined if the local file is missing.
 */
const getLocalDatabaseHash = () => {
    try {
        const dataFile = readFileSync("data/cpe-mapper.json", "utf-8");
        const hash = createHash("sha256").update(dataFile).digest("hex");
        return hash
    } catch {
        console.warn("Impossible to find the local database file, a new one will be created");
        return undefined
    }
}

/**
 * Computes the SHA-256 hash of the distant CPE database data.
 *
 * @async
 * @param {object} distantDbData - The JSON data of the distant CPE database.
 * @returns {Promise<string>} The computed hash of the distant database content.
 */
const getDistantDatabaseHash = async (distantDbData) => {
    const jsonString = JSON.stringify(distantDbData);
    const hash = createHash("sha256").update(jsonString).digest("hex");
    return hash;
};
