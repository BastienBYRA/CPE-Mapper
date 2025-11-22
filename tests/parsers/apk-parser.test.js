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

import { ApkParser } from "../../src/parsers/apk-parser.js";

const apkParser = new ApkParser();

const bomFile = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [{
        name: "openssl",
        purl: "pkg:apk/alpine/openssl@3.2.0-r0",
        version: "3.2.0-r0"
    }]
};

const cpeDb = {
    apk: {
        packages: [
            { name: 'musl', cpe: 'cpe:2.3:a:musl:musl:VERSION_COMPONENT' },
            { name: 'openssl', cpe: 'cpe:2.3:a:openssl:openssl:VERSION_COMPONENT' }
        ]
    }
};

test('ApkParser.searchCpeMapping finds correct mappings', async (t) => {
    await t.test('matches package name correctly', () => {
        const result = apkParser.searchCpeMapping('openssl', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:2.3:a:openssl:openssl:VERSION_COMPONENT');
    });

    await t.test('returns undefined when package not found', () => {
        const result = apkParser.searchCpeMapping('nonexistent-package', cpeDb);
        assert.strictEqual(result, undefined);
    });
});

test('ApkParser.setCPEMappingCycloneDX applies correct CPE mapping', async (t) => {
    await t.test('returns correct CPE with version replaced', () => {
        const cpe = apkParser.setCPEMappingCycloneDX(
            cpeDb.apk.packages[1],
            undefined,
            JSON.parse(JSON.stringify(bomFile.components[0])),
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:openssl:openssl:3.2.0-r0");
    });

    await t.test('uses "*" when version is missing', () => {
        const comp = { ...bomFile.components[0], version: undefined };
        const cpe = apkParser.setCPEMappingCycloneDX(
            cpeDb.apk.packages[1],
            undefined,
            comp,
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:openssl:openssl:*");
    });

    await t.test('overrides existing CPE if overrideCpe is true', () => {
        const component = { ...bomFile.components[0], cpe: 'existing:cpe' };
        const cpe = apkParser.setCPEMappingCycloneDX(
            cpeDb.apk.packages[1],
            undefined,
            component,
            true,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:openssl:openssl:3.2.0-r0");
    });
});

test('ApkParser.parseCycloneDX maps BOM components correctly', async (t) => {
    const bomCopy = JSON.parse(JSON.stringify(bomFile));
    const expectedBom = {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        components: [{
            name: "openssl",
            purl: "pkg:apk/alpine/openssl@3.2.0-r0",
            version: "3.2.0-r0",
            cpe: "cpe:2.3:a:openssl:openssl:3.2.0-r0"
        }]
    };
    const mappedBom = apkParser.parseCycloneDX(cpeDb, bomCopy, false, false);
    assert.deepStrictEqual(mappedBom, expectedBom);
});
