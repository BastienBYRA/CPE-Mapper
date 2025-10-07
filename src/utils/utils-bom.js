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

/**
 * @typedef {Object} BOMFormats
 * @property {string} CycloneDX CycloneDX BOM format identifier.
 * @property {string} SPDX SPDX BOM format identifier.
 * @property {undefined} NotFound Used when no known format is detected.
 */
export const BOMFormats = {
    CycloneDX: "CycloneDX",
    SPDX: "SPDX",
    NotFound: undefined
}

/**
 * Attempts to automatically detect the BOM format (CycloneDX, SPDX, or unknown).
 *
 * @param {object} bomContent The parsed JSON content of a BOM file.
 * @returns {string|undefined} The detected format identifier from `BOMFormats`.
 */
export const guessBOMFormat = (bomContent) => {
    // CycloneDX format
    const cdxFormat = bomContent.bomFormat
    if (cdxFormat === "CycloneDX") {
        return BOMFormats.CycloneDX
    }

    // SPDX format
    const spdxFormat = bomContent.spdxVersion
    if (spdxFormat) {
        return BOMFormats.SPDX
    }

    return BOMFormats.NotFound
}