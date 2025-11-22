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

import test from 'node:test';
import assert from 'node:assert';

import { applyCPEMappings } from '../../src/commands/apply.js'
import { setupAppConfig } from '../../src/config.js'
import { readFileSync } from 'node:fs';

const inputFileCycloneDX = "testdata/cyclonedx/bom.test.json"
const expectedFileCycloneDX = "testdata/cyclonedx/expected-bom.test.json"
const outputFileCycloneDX = "testdata/cyclonedx-tests-gen/result.test.json"

test('applyCPEMappings apply the correct CPE mapping to a CycloneDX BOM file', async (t) => {
    const result = await applyCPEMappings(inputFileCycloneDX, outputFileCycloneDX, true, false, false, setupAppConfig())
    const expectedFileContent = JSON.parse(readFileSync(expectedFileCycloneDX, 'utf-8'))
    const outputFileContent = JSON.parse(readFileSync(outputFileCycloneDX, 'utf-8'))
    
    await t.test('(CycloneDX) - the process should succeed', () => {
        assert.strictEqual(result, true)
    })

    await t.test('(CycloneDX) - the two BOM should be identical', () => {
        assert.deepStrictEqual(outputFileContent, expectedFileContent)
    })
})

const inputFileSPDX = "testdata/spdx/bom.test.json"
const expectedFileSPDX = "testdata/spdx/expected-bom.test.json"
const outputFileSPDX = "testdata/spdx-tests-gen/result.test.json"

test('applyCPEMappings apply the correct CPE mapping to a SPDX BOM file', async (t) => {
    const result = await applyCPEMappings(inputFileSPDX, outputFileSPDX, true, false, false, setupAppConfig())
    const expectedFileContent = JSON.parse(readFileSync(expectedFileSPDX, 'utf-8'))
    const outputFileContent = JSON.parse(readFileSync(outputFileSPDX, 'utf-8'))
    
    await t.test('(SPDX) - the process should succeed', () => {
        assert.strictEqual(result, true)
    })

    await t.test('(SPDX) - the two BOM should be identical', () => {
        assert.deepStrictEqual(outputFileContent, expectedFileContent)
    })
})