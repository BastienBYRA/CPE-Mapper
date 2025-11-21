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

import { ParserManager } from "../../src/parsers/manager.js";
import { MavenParser } from "../../src/parsers/maven-parser.js";
import { BOMFormats } from "../../src/utils/utils-bom.js";

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

const parserManager = new ParserManager();

test('ParserManager.getRequiredParsers correctly identify SBOM format and returns correct parser instances', async (t) => {
    await t.test('getRequiredParsers calls the correct method for CycloneDX', () => {
        const bomFormat = BOMFormats.CycloneDX;
        const result = parserManager.getRequiredParsers(bomFormat, bomFile);
        assert.strictEqual(result[0].ecosystem, "maven");
    });

    /**
     * WARNING: SPDX parsing is not yet implemented
     */
    await t.test('getRequiredParsers calls the correct method for SPDX', () => {
        const bomFormat = BOMFormats.SPDX;
        const result = parserManager.getRequiredParsers(bomFormat, {});
        assert.deepStrictEqual(result, []);
    });

    await t.test('getRequiredParsers returns an empty list for unknown BOM format', () => {
        const bomFormat = BOMFormats.NotFound;
        const result = parserManager.getRequiredParsers(bomFormat, {});
        assert.deepStrictEqual(result, []);
    });
});

test('parserManager.getRequiredParsersCycloneDX returns correct parser instances', () => {
    const requiredParsers = parserManager.getRequiredParsersCycloneDX(bomFile);
    const mavenParser = new MavenParser();

    assert.strictEqual(requiredParsers[0].ecosystem, mavenParser.ecosystem);
});

/**
 * WARNING: SPDX parsing is not yet implemented
 */
test('parserManager.getRequiredParserSPDX returns correct parser instances', () => {
    const requiredParsers = parserManager.getRequiredParserSPDX({});
    assert.deepStrictEqual(requiredParsers, []);
});