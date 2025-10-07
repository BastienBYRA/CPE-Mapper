/*
 * Copyright 2025 Bastien BYRA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { isBoolean, isFilePath, isURL } from "./utils/utils.js"
import envPaths from 'env-paths';
import path from "node:path";

/**
 * @typedef {Object} AppConfig
 * @property {string} dbURL
 * @property {string} dbOsPath
 * @property {boolean} customDbEnabled
 * @property {string|undefined} customDbOsPath
 * @property {string|undefined} customDbURL
 * @property {string|undefined} customDbSaveFilePath
 */
// Allows us to export JSDoc from AppConfig to other files
export const AppConfig = {}

/**
 * @returns {AppConfig}
 */
export const setupAppConfig = () => {
    let customDbEnabled = process.env.CUSTOM_DB_ENABLED
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
    const osSpecificPaths = envPaths('cpe-mapper');

    const APP_CONFIG = {
        "dbURL": "https://raw.githubusercontent.com/BastienBYRA/CPE-Mapper/refs/heads/main/data/cpe-mapper.json",
        
        // Should be customizable in the future
        "dbOsPath": path.resolve(osSpecificPaths.data + "data/cpe-mapper.json"),
        
        // NOT IMPLEMENTED YET
        // For later use
        "customDbEnabled": customDbEnabled,
        "customDbOsPath": customDbOsPath,
        "customDbURL": customDbURL,
        "customDbSaveFilePath": customDbSaveFilePath
    }

    return APP_CONFIG
}