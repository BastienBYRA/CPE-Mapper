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

import { DebParser } from "../../src/parsers/deb-parser.js";

const debParser = new DebParser();

const bomFile = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [{
        name: "libssl3",
        purl: "pkg:deb/debian/libssl3@3.0.2-0ubuntu1.10",
        version: "3.0.2-0ubuntu1.10"
    }]
};

const cpeDb = {
    deb: {
        packages: [
            { name: 'libc6', cpe: 'cpe:2.3:a:gnu:glibc:VERSION_COMPONENT' },
            { name: 'libssl3', cpe: 'cpe:2.3:a:openssl:libssl:VERSION_COMPONENT' }
        ]
    }
};

test('DebParser.searchCpeMapping finds correct mappings', async (t) => {
    await t.test('matches package name correctly', () => {
        const result = debParser.searchCpeMapping('libssl3', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:2.3:a:openssl:libssl:VERSION_COMPONENT');
    });

    await t.test('returns undefined when package not found', () => {
        const result = debParser.searchCpeMapping('nonexistent-package', cpeDb);
        assert.strictEqual(result, undefined);
    });
});

test('DebParser.setCPEMappingCycloneDX applies correct CPE mapping', async (t) => {
    await t.test('returns correct CPE with version replaced', () => {
        const cpe = debParser.setCPEMappingCycloneDX(
            cpeDb.deb.packages[1],
            undefined,
            JSON.parse(JSON.stringify(bomFile.components[0])),
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:openssl:libssl:3.0.2-0ubuntu1.10");
    });

    await t.test('uses "*" when version is missing', () => {
        const comp = { ...bomFile.components[0], version: undefined };
        const cpe = debParser.setCPEMappingCycloneDX(
            cpeDb.deb.packages[1],
            undefined,
            comp,
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:openssl:libssl:*");
    });

    await t.test('overrides existing CPE if overrideCpe is true', () => {
        const component = { ...bomFile.components[0], cpe: 'existing:cpe' };
        const cpe = debParser.setCPEMappingCycloneDX(
            cpeDb.deb.packages[1],
            undefined,
            component,
            true,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:openssl:libssl:3.0.2-0ubuntu1.10");
    });
});

test('DebParser.parseCycloneDX maps BOM components correctly', async (t) => {
    const bomCopy = JSON.parse(JSON.stringify(bomFile));
    const expectedBom = {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        components: [{
            name: "libssl3",
            purl: "pkg:deb/debian/libssl3@3.0.2-0ubuntu1.10",
            version: "3.0.2-0ubuntu1.10",
            cpe: "cpe:2.3:a:openssl:libssl:3.0.2-0ubuntu1.10"
        }]
    };
    const mappedBom = debParser.parseCycloneDX(cpeDb, bomCopy, false, false);
    assert.deepStrictEqual(mappedBom, expectedBom);
});
