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

/**
 * Represents the common/default parser.
 *
 * The CoreParser should not be instantiated directly.
 *
 * @property {string} ecosystem The ecosystem associated with this parser
 * @property {boolean} hasGroup Indicates whether the parser supports grouping
 */
export class CoreParser {
    constructor(ecosystem) {
        if (!ecosystem) throw new TypeError("The CoreParser should not be instantiated directly");
        this.ecosystem = ecosystem
    }

    /**
     * Parses a CycloneDX BOM and maps components to their corresponding CPE entries.
     *
     * @param {object} cpeDbContent The CPE database content
     * @param {object} bomFileContent The BOM file content to process
     * @param {boolean} cpeOverride Whether to override existing CPEs in the BOM
     * @param {boolean} verbose Whether to enable verbose logging
     * @returns {object} The updated BOM file content with mapped CPEs
     */
    parseCycloneDX = (cpeDbContent, bomFileContent, cpeOverride, verbose) => {
        // If there no component, exit
        if (!bomFileContent) {
            console.warn("No components found in BOM")
            process.exit(0)
        }

        // Iterate trought BOM components list
        bomFileContent.components?.forEach(component => {
            const componentFullName = this.getComponentFullName(component.group, component.name)
            const cpeDbEntry = this.searchCpeMapping(componentFullName, cpeDbContent);

            // Apply the CPE
            if (cpeDbEntry) {
                const cpeMapping = this.setCPEMappingCycloneDX(cpeDbEntry, componentFullName, component, cpeOverride, verbose)
                component.cpe = cpeMapping
            } else if (!cpeDbEntry && verbose) {
                console.log(`No mapping found for ${component.name}`);
            }
        })

        return bomFileContent
    }

    /**
     * Parses a SPDX BOM and maps components to their corresponding CPE entries.
     *
     * @param {object} cpeDbContent The CPE database content
     * @param {object} bomFileContent The BOM file content to process
     * @param {boolean} cpeOverride Whether to override existing CPEs in the BOM
     * @param {boolean} verbose Whether to enable verbose logging
     * @returns {object} The updated BOM file content with mapped CPEs
     */
    parseSPDX = (cpeDbContent, bomFileContent, verbose) => {
        // If there no component, exit
        if (!bomFileContent) {
            console.warn("No components found in BOM")
            process.exit(0)
        }

        // Iterate trought BOM components list
        bomFileContent.packages?.forEach(component => {
            // SPDX doesn't have a group field!
            const componentFullName = this.getComponentFullName(null, component.name)
            // TODO: Our CPE database is based on CycloneDX (which uses both `group` and `name` fields).
            // SPDX BOM files do not have a `group` field, so we cannot currently resolve CPEs for dependencies
            // using both `group` and `name` (e.g., Java packages).
            // In the future, we may need to handle SPDX files by ignoring the `group` field when looking up CPEs.
            const cpeDbEntry = this.searchCpeMapping(componentFullName, cpeDbContent);

            // SPDX can have multiple CPE, so we just add the CPE mapping from our CPE database in the list if not present
            if (cpeDbEntry) {
                this.setCPEMappingSPDX(cpeDbEntry, componentFullName, component, verbose)
            } else if (!cpeDbEntry && verbose) {
                console.log(`No mapping found for ${component.name}`);
            }
        })

        return bomFileContent
    }

    /**
     * Builds a normalized component full name for comparison with the CPE database.
     *
     * Rules:
     * - If both group and name exist → "group:name"
     * - If only name exists → "name"
     * - If only group exists → treated as "name"
     *
     * @param {string} group Optional package group (e.g., Maven groupId).
     * @param {string} name Package name.
     * @returns {string|undefined} The normalized full name, or undefined if invalid.
     */
    getComponentFullName = (group, name) => {
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
     * Searches the CPE mapping database for a component by full name.
     *
     * @param {string} componentFullName - Normalized component identifier ("group:name" or "name").
     * @param {object} cpeDb - The CPE database.
     * @returns {object|undefined} The matching CPE package mapping, or undefined if none found.
     */
    searchCpeMapping = (componentFullName, cpeDb) => {
        return cpeDb[this.ecosystem]?.packages?.find(cpeDbPkg => {
            let cpeDbPkgFullName;

            if (componentFullName.search(":") === -1) cpeDbPkgFullName = `${cpeDbPkg.name}`;
            else cpeDbPkgFullName = `${cpeDbPkg.group}:${cpeDbPkg.name}`;
            
            if (cpeDbPkgFullName === componentFullName) return cpeDbPkg;
        });
    };

    /**
     * Formats and applies the CPE entry for a CycloneDX BOM component.
     *
     * Rules:
     * - If the component already has a CPE and `overrideCpe` is false → keep the existing CPE.
     * - Otherwise → apply the CPE mapping from the database, replacing `VERSION_COMPONENT` with the actual version or "*" if missing.
     * 
     * @param {object} cpeDbEntry The CPE database entry for the package corresponding to `componentFullName`.
     * @param {string} componentFullName Component full name as obtained from `getComponentFullName()`.
     * @param {object} component Component object from the BOM file.
     * @param {boolean} overrideCpe Whether to overwrite an existing CPE mapping.
     * @param {boolean} verbose Whether to enable verbose logging.
     * @returns {string} The applied CPE string for the component, or the existing CPE if unchanged.
     */
    setCPEMappingCycloneDX = (cpeDbEntry, componentFullName, component, overrideCpe, verbose) => {
        // If the component already have a CPE prior to our mapping, and the user didn't specify we can override it, we ignore it and jump to the next component.
        if (component.cpe && overrideCpe === false)
            return component.cpe

        // Replace placeholder with component version if available
        let cpeWithVersion = cpeDbEntry.cpe;
        if (component.version) 
            component.cpe = cpeWithVersion.replace("VERSION_COMPONENT", component.version)
        else {
            console.warn(`The package ${componentFullName} doesn't have any version, it will be mapped to all versions of the package`)
            component.cpe = cpeWithVersion.replace("VERSION_COMPONENT", "*")
        }
            
        if (verbose) console.log(`Mapped ${component.name} -> ${component.cpe}`)

        return component.cpe
    }

    /**
     * Formats and applies the CPE entry for a SPDX BOM component.
     *
     * Rules:
     * - If the component already has a CPE and `overrideCpe` is false → keep the existing CPE.
     * - Otherwise → apply the CPE mapping from the database, replacing `VERSION_COMPONENT` with the actual version or "*" if missing.
     * 
     * @param {object} cpeDbEntry The CPE database entry for the package corresponding to `componentFullName`.
     * @param {string} componentFullName Component full name as obtained from `getComponentFullName()`.
     * @param {object} component Component object from the BOM file.
     * @param {boolean} verbose Whether to enable verbose logging.
     * @returns {string} The applied CPE string for the component, or the existing CPE if unchanged.
     */
    setCPEMappingSPDX = (cpeDbEntry, componentFullName, component, verbose) => {
        // Set a CPE entry with the version of the component
        const cpeWithoutVersion = cpeDbEntry.cpe
        let cpeWithVersion
    
        if (component.versionInfo) 
            cpeWithVersion = cpeWithoutVersion.replace("VERSION_COMPONENT", component.versionInfo)
        else {
            console.warn(`The package ${componentFullName} doesn't have any version, it will be mapped to all versions of the package`)
            cpeWithVersion = cpeWithoutVersion.replace("VERSION_COMPONENT", "*")
        }

        // Create a externalRef object to add in the `externalRefs` field of the SPDX BOM file
        const externalRef = {
            referenceCategory: "SECURITY",
            referenceType: `cpe23Type`,
            referenceLocator: cpeWithVersion
        }

        // Check the CPE isn't already set in the file
        let cpeAlreadyExisting = false
        component.externalRefs?.forEach(ref => {
            // JavaScript compares object references rather than their fields, so we use this trick
            if (JSON.stringify(ref) === JSON.stringify(externalRef)) {
                cpeAlreadyExisting = true
            }
        });

        // If the CPE doesn't exist, then add it to the list
        if (cpeAlreadyExisting === false) {
            component.externalRefs.push(externalRef)
        }
            
        if (verbose) console.log(`Mapped ${component.name} -> ${externalRef.referenceLocator}`)
    }
}