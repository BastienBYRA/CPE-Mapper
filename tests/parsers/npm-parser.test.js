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

import { NpmParser } from "../../src/parsers/npm-parser.js";

const npmParser = new NpmParser();

const bomFile = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [{
        name: "random",
        purl: "pkg:maven/random-things@1.0.0",
        version: "1.0.0"
    }]
};

const cpeDb = {
    npm: {
        packages: [
            { name: 'express', cpe: 'cpe:express' },
            { name: "random", cpe: 'cpe:2.3:a:random:random:VERSION_COMPONENT' }
        ]
    }
};

test('NpmParser.searchCpeMapping finds correct mappings', async (t) => {
    await t.test('matches name only', () => {
        const result = npmParser.searchCpeMapping('random', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:2.3:a:random:random:VERSION_COMPONENT');
    });

    await t.test('returns undefined when no match', () => {
        const result = npmParser.searchCpeMapping('non-existant-pkg-in-cpeDb', cpeDb);
        assert.strictEqual(result, undefined);
    });
});

test('NpmParser.getCPEMapping applies correct CPE mapping', async (t) => {
    await t.test('returns correct CPE with version replaced', () => {
        const cpe = npmParser.getCPEMapping(
            cpeDb.npm.packages[1],
            undefined,
            JSON.parse(JSON.stringify(bomFile.components[0])),
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:random:random:1.0.0");
    });

    await t.test('uses "*" when version is missing', () => {
        const comp = { ...bomFile.components[0], version: undefined };
        const cpe = npmParser.getCPEMapping(
            cpeDb.npm.packages[1],
            undefined,
            comp,
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:random:random:*");
    });

    await t.test('overrides existing CPE if overrideCpe is true', () => {
        const component = { ...bomFile.components[0], cpe: 'existing:cpe' };
        const cpe = npmParser.getCPEMapping(
            cpeDb.npm.packages[1],
            undefined,
            component,
            true,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:random:random:1.0.0");
    });
});

test('NpmParser.parseCycloneDX maps BOM components correctly', async (t) => {
    const bomCopy = JSON.parse(JSON.stringify(bomFile));
    const expectedBom = {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        components: [{
            name: "random",
            purl: "pkg:maven/random-things@1.0.0",
            version: "1.0.0",
            cpe: "cpe:2.3:a:random:random:1.0.0"
        }]
    };
    const mappedBom = npmParser.parseCycloneDX(cpeDb, bomCopy, false, false);
    assert.deepStrictEqual(mappedBom, expectedBom);
});
