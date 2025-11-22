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

import test from 'node:test'
import assert from 'node:assert'

import { PypiParser } from "../../src/parsers/pypi-parser.js"

const pypiParser = new PypiParser()

const bomFileCycloneDX = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [{
        name: "requests",
        purl: "pkg:pypi/requests@2.31.0",
        version: "2.31.0"
    }]
}

const bomFileSPDX = {
    spdxVersion: "SPDX-2.3",
    packages: [{
        name: "requests",
        versionInfo: "2.31.0",
        externalRefs: [{
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: "pkg:pypi/requests@2.31.0"
        }]
    }]
}

const cpeDb = {
    pypi: {
        packages: [
            { name: 'flask', cpe: 'cpe:2.3:a:palletsprojects:flask:VERSION_COMPONENT' },
            { name: "requests", cpe: 'cpe:2.3:a:python-requests:requests:VERSION_COMPONENT' }
        ]
    }
}

test('PypiParser.searchCpeMapping finds correct mappings', async (t) => {
    await t.test('matches name only', () => {
        const result = pypiParser.searchCpeMapping('requests', cpeDb)
        assert.strictEqual(result.cpe, 'cpe:2.3:a:python-requests:requests:VERSION_COMPONENT')
    })

    await t.test('returns undefined when no match', () => {
        const result = pypiParser.searchCpeMapping('nonexistent-package', cpeDb)
        assert.strictEqual(result, undefined)
    })
})

test('PypiParser.setCPEMappingCycloneDX and SPDX apply correct CPE mapping', async (t) => {
    await t.test('(CycloneDX) - returns correct CPE with version replaced', () => {
        const component = structuredClone(bomFileCycloneDX.components[0])
        pypiParser.setCPEMappingCycloneDX(
            cpeDb.pypi.packages[1],
            undefined,
            component,
            false,
            false
        )
        assert.strictEqual(component.cpe, "cpe:2.3:a:python-requests:requests:2.31.0")
    })

    await t.test('(CycloneDX) - uses "*" when version is missing', () => {
        const component = { ...bomFileCycloneDX.components[0], version: undefined }
        pypiParser.setCPEMappingCycloneDX(
            cpeDb.pypi.packages[1],
            undefined,
            component,
            false,
            false
        )
        assert.strictEqual(component.cpe, "cpe:2.3:a:python-requests:requests:*")
    })

    await t.test('(CycloneDX) - overrides existing CPE if overrideCpe is true', () => {
        const component = { ...bomFileCycloneDX.components[0], cpe: 'existing:cpe' }
        pypiParser.setCPEMappingCycloneDX(
            cpeDb.pypi.packages[1],
            undefined,
            component,
            true,
            false
        )
        assert.strictEqual(component.cpe, "cpe:2.3:a:python-requests:requests:2.31.0")
    })

    await t.test('(SPDX) - returns correct CPE with version replaced', () => {
        const component = structuredClone(bomFileSPDX.packages[0])
        pypiParser.setCPEMappingSPDX(
            cpeDb.pypi.packages[1],
            "requests",
            component,
            false
        )
        const componentCpeRef = component.externalRefs.pop()
        assert.strictEqual(componentCpeRef.referenceLocator, "cpe:2.3:a:python-requests:requests:2.31.0")
    })

    await t.test('(SPDX) - uses "*" when versionInfo is missing', () => {
        const component = { ...bomFileSPDX.packages[0], versionInfo: undefined }
        pypiParser.setCPEMappingSPDX(
            cpeDb.pypi.packages[1],
            "requests",
            component,
            false
        )
        const componentCpeRef = component.externalRefs.pop()
        assert.strictEqual(componentCpeRef.referenceLocator, "cpe:2.3:a:python-requests:requests:*")
    })
})

test('PypiParser.parseCycloneDX maps BOM components correctly', async () => {
    const bomCopy = structuredClone(bomFileCycloneDX)
    const expectedBom = {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        components: [{
            name: "requests",
            purl: "pkg:pypi/requests@2.31.0",
            version: "2.31.0",
            cpe: "cpe:2.3:a:python-requests:requests:2.31.0"
        }]
    }
    const mappedBom = pypiParser.parseCycloneDX(cpeDb, bomCopy, false, false)
    assert.deepStrictEqual(mappedBom, expectedBom)
})

test('PypiParser.parseSPDX maps SPDX packages correctly', async () => {
    const bomCopy = structuredClone(bomFileSPDX)

    let expectedBom = structuredClone(bomFileSPDX)
    expectedBom.packages[0].externalRefs.push({
        referenceCategory: "SECURITY",
        referenceType: "cpe23Type",
        referenceLocator: "cpe:2.3:a:python-requests:requests:2.31.0"
    })

    const mappedBom = pypiParser.parseSPDX(cpeDb, bomCopy, false)
    assert.deepStrictEqual(mappedBom, expectedBom)
})
