import { isBoolean, isFilePath, isURL } from "./utils.js"

export const setupAppConfig = () => {
    var customDbEnabled = process.env.CUSTOM_DB_ENABLED
    const customDbOsPath = process.env.CUSTOM_DB_OS_PATH
    const customDbURL = process.env.CUSTOM_DB_URL
    const customDbSaveFilePath = process.env.CUSTOM_DB_SAVE_FILE_PATH

    if (!isBoolean(customDbEnabled) && customDbEnabled) {
        console.error("The variable CUSTOM_DB_ENABLED is not correctly defined, expected values: true, false, True, False")
        process.exit(1)
    }

    if (customDbEnabled === "true" || customDbEnabled === "True")
        customDbEnabled = true
    else
        customDbEnabled = false

    if (!isURL(customDbURL) && customDbURL) {
        console.error("The variable CUSTOM_DB_URL is not correctly defined. The expected value should start with http:// or https://")
        process.exit(1)
    }

    if (!isFilePath(customDbOsPath) && customDbOsPath) {
        console.error("The variable CUSTOM_DB_OS_PATH is not correctly defined. The expected value should start with http:// or https://")
        process.exit(1)
    }

    if (customDbOsPath && customDbURL) {
        console.error("A URL (CUSTOM_DB_URL) and path (CUSTOM_DB_OS_PATH) have been provided. Please specify a single location where CPE-Mapper should search for the database.")
        process.exit(1)
    }

    if (!isFilePath(customDbSaveFilePath) && customDbSaveFilePath) {
        console.error("The variable CUSTOM_DB_SAVE_FILE_PATH is not correctly defined. The expected value should start with http:// or https://")
        process.exit(1)
    }

    return configureAppConfig(customDbEnabled, customDbOsPath, customDbURL, customDbSaveFilePath)
    
}

const configureAppConfig = (customDbEnabled, customDbOsPath, customDbURL, customDbSaveFilePath) => {
    const APP_CONFIG = {
        "dbURL": "https://raw.githubusercontent.com/BastienBYRA/CPE-Mapper/refs/heads/main/data/cpe-mapper.json",
        
        // Should be customizable
        "dbOsPath": "data/cpe-mapper.json",
        
        // NOT IMPLEMENTED YET
        // For later use
        "customDbEnabled": customDbEnabled,
        "customDbOsPath": customDbOsPath,
        "customDbURL": customDbURL,
        "customDbSaveFilePath": customDbSaveFilePath
    }

    return APP_CONFIG
}