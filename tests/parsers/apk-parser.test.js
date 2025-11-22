/**
 * Copyright 2025 Bastien BYRA
 * 
 * Licensed under the Apache License, Version 2.0 (the "License")
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

import { ApkParser } from "../../src/parsers/apk-parser.js"

const apkParser = new ApkParser()

const bomFileCycloneDX = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [{
        name: "openssl",
        purl: "pkg:apk/alpine/openssl@3.2.0-r0",
        version: "3.2.0-r0"
    }]
}

const bomFileSPDX = {
    spdxVersion: "SPDX-2.3",
    packages: [{
        name: "openssl",
        versionInfo: "3.2.0-r0",
        externalRefs: [{
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: "pkg:apk/alpine/openssl@3.2.0-r0"
        }]
    }]
}

const cpeDb = {
    apk: {
        packages: [
            { name: 'musl', cpe: 'cpe:2.3:a:musl:musl:VERSION_COMPONENT' },
            { name: 'openssl', cpe: 'cpe:2.3:a:openssl:openssl:VERSION_COMPONENT' }
        ]
    }
}

test('ApkParser.searchCpeMapping finds correct mappings', async (t) => {
    await t.test('matches package name correctly', () => {
        const result = apkParser.searchCpeMapping('openssl', cpeDb)
        assert.strictEqual(result.cpe, 'cpe:2.3:a:openssl:openssl:VERSION_COMPONENT')
    })

    await t.test('returns undefined when package not found', () => {
        const result = apkParser.searchCpeMapping('nonexistent-package', cpeDb)
        assert.strictEqual(result, undefined)
    })
})

test('ApkParser.setCPEMappingCycloneDX applies correct CPE mapping', async (t) => {
    await t.test('returns correct CPE with version replaced', () => {
        const component = structuredClone(bomFileCycloneDX.components[0])
        apkParser.setCPEMappingCycloneDX(
            cpeDb.apk.packages[1],
            undefined,
            component,
            false,
            false
        )

        assert.strictEqual(component.cpe, "cpe:2.3:a:openssl:openssl:3.2.0-r0")
    })

    await t.test('uses "*" when version is missing', () => {
        const component = { ...bomFileCycloneDX.components[0], version: undefined }
        apkParser.setCPEMappingCycloneDX(
            cpeDb.apk.packages[1],
            undefined,
            component,
            false,
            false
        )

        assert.strictEqual(component.cpe, "cpe:2.3:a:openssl:openssl:*")
    })

    await t.test('overrides existing CPE if overrideCpe is true', () => {
        const component = { ...bomFileCycloneDX.components[0], cpe: "existing:cpe" }
        apkParser.setCPEMappingCycloneDX(
            cpeDb.apk.packages[1],
            undefined,
            component,
            true,
            false
        )

        assert.strictEqual(component.cpe, "cpe:2.3:a:openssl:openssl:3.2.0-r0")
    })
})

test('ApkParser.setCPEMappingSPDX applies correct CPE mapping', async (t) => {
    await t.test('(SPDX) - returns correct CPE with version replaced', () => {
        const component = structuredClone(bomFileSPDX.packages[0])
        apkParser.setCPEMappingSPDX(
            cpeDb.apk.packages[1],
            "openssl",
            component,
            false
        )

        const componentCpeRef = component.externalRefs.pop()
        assert.strictEqual(componentCpeRef.referenceLocator, "cpe:2.3:a:openssl:openssl:3.2.0-r0")
    })

    await t.test('(SPDX) - uses "*" when versionInfo is missing', () => {
        const component = { ...bomFileSPDX.packages[0], versionInfo: undefined }
        apkParser.setCPEMappingSPDX(
            cpeDb.apk.packages[1],
            "openssl",
            component,
            false
        )

        const componentCpeRef = component.externalRefs.pop()
        assert.strictEqual(componentCpeRef.referenceLocator, "cpe:2.3:a:openssl:openssl:*")
    })
})

test('ApkParser.parseCycloneDX maps BOM components correctly', async () => {
    const bomCopy = structuredClone(bomFileCycloneDX)
    const expectedBom = {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        components: [{
            name: "openssl",
            purl: "pkg:apk/alpine/openssl@3.2.0-r0",
            version: "3.2.0-r0",
            cpe: "cpe:2.3:a:openssl:openssl:3.2.0-r0"
        }]
    }

    const mappedBom = apkParser.parseCycloneDX(cpeDb, bomCopy, false, false)
    assert.deepStrictEqual(mappedBom, expectedBom)
})

test('ApkParser.parseSPDX maps SPDX packages correctly', async () => {
    const bomCopy = structuredClone(bomFileSPDX)
    let expectedBom = structuredClone(bomFileSPDX)
    expectedBom.packages[0].externalRefs.push({
        referenceCategory: "SECURITY",
        referenceType: "cpe23Type",
        referenceLocator: "cpe:2.3:a:openssl:openssl:3.2.0-r0"
    })

    const mappedBom = apkParser.parseSPDX(cpeDb, bomCopy, false)
    assert.deepStrictEqual(mappedBom, expectedBom)
})
