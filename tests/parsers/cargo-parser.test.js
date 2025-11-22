/**
 * Copyright 2025 Bastien BYRA
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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

import test from 'node:test'
import assert from 'node:assert'

import { CargoParser } from "../../src/parsers/cargo-parser.js"

const cargoParser = new CargoParser()

const bomFileCycloneDX = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [{
        name: "serde",
        purl: "pkg:cargo/serde@1.0.130",
        version: "1.0.130"
    }]
}

const bomFileSPDX = {
    spdxVersion: "SPDX-2.3",
    packages: [{
        name: "serde",
        versionInfo: "1.0.130",
        externalRefs: [{
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: "pkg:cargo/serde@1.0.130"
        }]
    }]
}

const cpeDb = {
    cargo: {
        packages: [
            { name: 'tokio', cpe: 'cpe:2.3:a:tokio:tokio:VERSION_COMPONENT' },
            { name: 'serde', cpe: 'cpe:2.3:a:serde:serde:VERSION_COMPONENT' }
        ]
    }
}

test('CargoParser.searchCpeMapping finds correct mappings', async (t) => {
    await t.test('matches name correctly', () => {
        const result = cargoParser.searchCpeMapping('serde', cpeDb)
        assert.strictEqual(result.cpe, 'cpe:2.3:a:serde:serde:VERSION_COMPONENT')
    })

    await t.test('returns undefined when no match is found', () => {
        const result = cargoParser.searchCpeMapping('nonexistent-crate', cpeDb)
        assert.strictEqual(result, undefined)
    })
})

test('CargoParser.setCPEMappingCycloneDX and SPDX apply correct CPE mapping', async (t) => {
    await t.test('(CycloneDX) - returns correct CPE with version replaced', () => {
        const component = structuredClone(bomFileCycloneDX.components[0])
        cargoParser.setCPEMappingCycloneDX(
            cpeDb.cargo.packages[1],
            undefined,
            component,
            false,
            false
        )
        assert.strictEqual(component.cpe, "cpe:2.3:a:serde:serde:1.0.130")
    })

    await t.test('(CycloneDX) - uses "*" when version is missing', () => {
        const component = { ...bomFileCycloneDX.components[0], version: undefined }
        cargoParser.setCPEMappingCycloneDX(
            cpeDb.cargo.packages[1],
            undefined,
            component,
            false,
            false
        )
        assert.strictEqual(component.cpe, "cpe:2.3:a:serde:serde:*")
    })

    await t.test('(CycloneDX) - overrides existing CPE if overrideCpe is true', () => {
        const component = { ...bomFileCycloneDX.components[0], cpe: 'existing:cpe' }
        cargoParser.setCPEMappingCycloneDX(
            cpeDb.cargo.packages[1],
            undefined,
            component,
            true,
            false
        )
        assert.strictEqual(component.cpe, "cpe:2.3:a:serde:serde:1.0.130")
    })

    await t.test('(SPDX) - returns correct CPE with version replaced', () => {
        const component = structuredClone(bomFileSPDX.packages[0])
        cargoParser.setCPEMappingSPDX(
            cpeDb.cargo.packages[1],
            "serde",
            component,
            false
        )
        const componentCpeRef = component.externalRefs.pop()
        assert.strictEqual(componentCpeRef.referenceLocator, "cpe:2.3:a:serde:serde:1.0.130")
    })

    await t.test('(SPDX) - uses "*" when versionInfo is missing', () => {
        const component = { ...bomFileSPDX.packages[0], versionInfo: undefined }
        cargoParser.setCPEMappingSPDX(
            cpeDb.cargo.packages[1],
            "serde",
            component,
            false
        )
        const componentCpeRef = component.externalRefs.pop()
        assert.strictEqual(componentCpeRef.referenceLocator, "cpe:2.3:a:serde:serde:*")
    })
})

test('CargoParser.parseCycloneDX maps BOM components correctly', async () => {
    const bomCopy = structuredClone(bomFileCycloneDX)
    const expectedBom = {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        components: [{
            name: "serde",
            purl: "pkg:cargo/serde@1.0.130",
            version: "1.0.130",
            cpe: "cpe:2.3:a:serde:serde:1.0.130"
        }]
    }
    const mappedBom = cargoParser.parseCycloneDX(cpeDb, bomCopy, false, false)
    assert.deepStrictEqual(mappedBom, expectedBom)
})

test('CargoParser.parseSPDX maps SPDX packages correctly', async () => {
    const bomCopy = structuredClone(bomFileSPDX)

    let expectedBom = structuredClone(bomFileSPDX)
    expectedBom.packages[0].externalRefs.push({
        referenceCategory: "SECURITY",
        referenceType: "cpe23Type",
        referenceLocator: "cpe:2.3:a:serde:serde:1.0.130"
    })

    const mappedBom = cargoParser.parseSPDX(cpeDb, bomCopy, false)
    assert.deepStrictEqual(mappedBom, expectedBom)
})
