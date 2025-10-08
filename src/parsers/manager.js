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

import { BOMFormats } from "../utils/utils-bom.js"
import { MavenParser } from "./maven-parser.js"
import { ApkParser } from "./apk-parser.js"
import { DebParser } from "./deb-parser.js"
import { NpmParser } from "./npm-parser.js"
import { NugetParser } from "./nuget-parser.js"
import { CargoParser } from "./cargo-parser.js"
import { PypiParser } from "./pypi-parser.js"

/**
 * Manages the selection of appropriate parsers based on the BOM format and its ecosystems.
 * 
 * It analyzes the SBOM (CycloneDX or SPDX) and determines which parser instances
 * should be used to process it.
 */
export class ParserManager {

    /**
     * Determines which parsers are required depending on the BOM format and content.
     *
     * @param {string} bomFormat The detected BOM format (e.g., "CycloneDX" or "SPDX")
     * @param {object} bomContent The BOM file content
     * @returns {Array<object>} A list of parser instances required for processing the BOM
     * @throws {Error} Exits the process if no known ecosystems are found
     */
    getRequiredParsers = (bomFormat, bomContent) => {
        let listParsers = [];
        if (bomFormat === BOMFormats.CycloneDX)
            listParsers = this.getRequiredParsersCycloneDX(bomContent);
        else if (bomFormat === BOMFormats.SPDX)
            listParsers = this.getRequiredParserSPDX(bomContent);

        return listParsers;
    };

    /**
     * Detects which ecosystems are present in a CycloneDX BOM file and
     * returns the appropriate parser instances for each one.
     *
     * @param {object} bomContent The parsed CycloneDX BOM file
     * @returns {Array<object>} The list of parser instances matching the ecosystems found
     */
    getRequiredParsersCycloneDX = (bomContent) => {
        let listParsers = [];

        if (bomContent.components.some((component) => component.purl?.startsWith("pkg:maven/")))
            listParsers.push(new MavenParser());
        if (bomContent.components.some((component) => component.purl?.startsWith("pkg:npm/")))
            listParsers.push(new NpmParser());
        if (bomContent.components.some((component) => component.purl?.startsWith("pkg:pypi/")))
            listParsers.push(new PypiParser());
        if (bomContent.components.some((component) => component.purl?.startsWith("pkg:nuget/")))
            listParsers.push(new NugetParser());
        if (bomContent.components.some((component) => component.purl?.startsWith("pkg:cargo/")))
            listParsers.push(new CargoParser());
        if (bomContent.components.some((component) => component.purl?.startsWith("pkg:apk/")))
            listParsers.push(new ApkParser());
        if (bomContent.components.some((component) => component.purl?.startsWith("pkg:apt/")))
            listParsers.push(new DebParser());

        return listParsers;
    };

    /**
     * Detects which ecosystems are present in an SPDX BOM file.
     * This method is currently not implemented.
     *
     * @param {object} bomContent The parsed SPDX BOM file
     * @returns {void}
     */
    getRequiredParserSPDX = (bomContent) => {
        console.error("The SPDX parser has not been implemented yet");
        process.exit(1);
    };
}
