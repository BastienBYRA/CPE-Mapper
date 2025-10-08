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
 * Represents the common / default parser.
 * @property {string} ecosystem
 * @property {boolean} hasGroup
 */
export class CoreParser {
    constructor(ecosystem) {
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
                const cpeMapping = this.getCPEMapping(cpeDbEntry, componentFullName, component, cpeOverride, verbose)
                component.cpe = cpeMapping
            } else if (!cpeDbEntry && verbose) {
                console.log(`No mapping found for ${component.name}`);
            }
        })

        return bomFileContent
    }

    /**
     * Placeholder parser for SPDX files.
     * Currently not implemented.
     *
     * @returns {void}
     */
    parseSPDX = () => {
        console.error("The SPDX parser as not been implemented yet")
        process.exit(1)
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
     * 
     * @param {object} cpeDbEntry The CPE database entry for a package corresponding to `componentFullName`
     * @param {string} componentFullName Component full name as obtained from the function `getComponentFullName()`
     * @param {object} component Component from the BOM file
     * @param {boolean} overrideCpe Whether existing CPE are replaced or not
     * @param {boolean} verbose Whether to enable verbose logging
     * @returns {object} The `component` with the CPE mapping from the CPE database, or unchanged if it already has a mapping and `overrideCpe` is false
     */
    getCPEMapping = (cpeDbEntry, componentFullName, component, overrideCpe, verbose) => {
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
}