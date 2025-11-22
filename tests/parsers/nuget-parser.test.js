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

import { NugetParser } from "../../src/parsers/nuget-parser.js";

const nugetParser = new NugetParser();

const bomFile = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [{
        name: "newtonsoft.json",
        purl: "pkg:nuget/newtonsoft.json@13.0.3",
        version: "13.0.3"
    }]
};

const cpeDb = {
    nuget: {
        packages: [
            { name: 'entityframework', cpe: 'cpe:2.3:a:microsoft:entityframework:VERSION_COMPONENT' },
            { name: 'newtonsoft.json', cpe: 'cpe:2.3:a:newtonsoft:json.net:VERSION_COMPONENT' }
        ]
    }
};

test('NugetParser.searchCpeMapping finds correct mappings', async (t) => {
    await t.test('matches name only', () => {
        const result = nugetParser.searchCpeMapping('newtonsoft.json', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:2.3:a:newtonsoft:json.net:VERSION_COMPONENT');
    });

    await t.test('returns undefined when no match is found', () => {
        const result = nugetParser.searchCpeMapping('nonexistent-package', cpeDb);
        assert.strictEqual(result, undefined);
    });
});

test('NugetParser.setCPEMappingCycloneDX applies correct CPE mapping', async (t) => {
    await t.test('returns correct CPE with version replaced', () => {
        const cpe = nugetParser.setCPEMappingCycloneDX(
            cpeDb.nuget.packages[1],
            undefined,
            JSON.parse(JSON.stringify(bomFile.components[0])),
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:newtonsoft:json.net:13.0.3");
    });

    await t.test('uses "*" when version is missing', () => {
        const comp = { ...bomFile.components[0], version: undefined };
        const cpe = nugetParser.setCPEMappingCycloneDX(
            cpeDb.nuget.packages[1],
            undefined,
            comp,
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:newtonsoft:json.net:*");
    });

    await t.test('overrides existing CPE if overrideCpe is true', () => {
        const component = { ...bomFile.components[0], cpe: 'existing:cpe' };
        const cpe = nugetParser.setCPEMappingCycloneDX(
            cpeDb.nuget.packages[1],
            undefined,
            component,
            true,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:newtonsoft:json.net:13.0.3");
    });
});

test('NugetParser.parseCycloneDX maps BOM components correctly', async (t) => {
    const bomCopy = JSON.parse(JSON.stringify(bomFile));
    const expectedBom = {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        components: [{
            name: "newtonsoft.json",
            purl: "pkg:nuget/newtonsoft.json@13.0.3",
            version: "13.0.3",
            cpe: "cpe:2.3:a:newtonsoft:json.net:13.0.3"
        }]
    };
    const mappedBom = nugetParser.parseCycloneDX(cpeDb, bomCopy, false, false);
    assert.deepStrictEqual(mappedBom, expectedBom);
});
