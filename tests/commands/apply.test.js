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

const inputFile = "testdata/cyclonedx/bom.test.json"
const expectedFile = "testdata/cyclonedx/expected-bom.test.json"
const outputFile = "testdata/cyclonedx-tests-gen/result.test.json"

test('applyCPEMappings apply the correct CPE mapping to a BOM file', async (t) => {
    const result = await applyCPEMappings(inputFile, outputFile, true, false, false, setupAppConfig())
    const expectedFileContent = JSON.parse(readFileSync(expectedFile, 'utf-8'))
    const outputFileContent = JSON.parse(readFileSync(outputFile, 'utf-8'))
    
    await t.test('the process should succeed', () => {
        assert.strictEqual(result, true)
    })

    await t.test('the two BOM should be identical', () => {
        assert.deepStrictEqual(outputFileContent, expectedFileContent)
    })
})