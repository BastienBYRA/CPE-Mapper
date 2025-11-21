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

import { BOMFormats, guessBOMFormat } from "../../src/utils/utils-bom.js";

const bomFile = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [{
        name: "random",
        group: "random",
        purl: "pkg:maven/random-things@1.0.0",
        version: "1.0.0"
    }]
};

test('guessBOMFormat identifies BOM formats correctly', async (t) => {
    await t.test('returns CycloneDX when bomFormat is "CycloneDX"', () => {
        assert.strictEqual(guessBOMFormat(bomFile), BOMFormats.CycloneDX);
    });

    await t.test('returns SPDX when spdxVersion is present', () => {
        const SPDXBom = { spdxVersion: "2.2" };
        assert.strictEqual(guessBOMFormat(SPDXBom), BOMFormats.SPDX);
    });

    await t.test('returns NotFound for unknown format', () => {
        const unknownBom = { thesuperformat: "unknown" };
        assert.strictEqual(guessBOMFormat(unknownBom), BOMFormats.NotFound);
    });
});