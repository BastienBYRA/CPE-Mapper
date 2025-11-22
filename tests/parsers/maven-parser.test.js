/*
 * Copyright 2025 Bastien BYRA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either pkg-without-group or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import test from 'node:test';
import assert from 'node:assert';

import { MavenParser } from "../../src/parsers/maven-parser.js";

const mavenParser = new MavenParser();

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

const cpeDb = {
    maven: {
        packages: [
            { group: 'org.apache', name: 'lib', cpe: 'cpe:apache:lib' },
            { name: "random", group: "random", cpe: 'cpe:2.3:a:random:random:VERSION_COMPONENT' }
        ]
    }
};

test('MavenParser.getComponentFullName returns correct full names', async (t) => {
    await t.test('returns "group:name" when both group and name are provided', () => {
        assert.strictEqual(mavenParser.getComponentFullName('org.apache', 'lib'), 'org.apache:lib');
    });

    await t.test('returns undefined if both group and name are missing', () => {
        assert.strictEqual(mavenParser.getComponentFullName(null, null), undefined);
    });
});

test('MavenParser.searchCpeMapping finds correct mappings', async (t) => {
    await t.test('matches "group:name"', () => {
        const result = mavenParser.searchCpeMapping('org.apache:lib', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:apache:lib');
    });

    await t.test('returns undefined when no match', () => {
        const result = mavenParser.searchCpeMapping('notfound', cpeDb);
        assert.strictEqual(result, undefined);
    });
});

test('MavenParser.setCPEMappingCycloneDX applies correct CPE mapping', async (t) => {
    await t.test('returns correct CPE with version replaced', () => {
        const cpe = mavenParser.setCPEMappingCycloneDX(
            cpeDb.maven.packages[1],
            undefined,
            JSON.parse(JSON.stringify(bomFile.components[0])),
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:random:random:1.0.0");
    });

    await t.test('uses "*" when version is missing', () => {
        const comp = { ...bomFile.components[0], version: undefined };
        const cpe = mavenParser.setCPEMappingCycloneDX(
            cpeDb.maven.packages[1],
            undefined,
            comp,
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:random:random:*");
    });

    await t.test('overrides existing CPE if overrideCpe is true', () => {
        const component = { ...bomFile.components[0], cpe: 'existing:cpe' };
        const cpe = mavenParser.setCPEMappingCycloneDX(
            cpeDb.maven.packages[1],
            undefined,
            component,
            true,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:random:random:1.0.0");
    });
});

test('MavenParser.parseCycloneDX maps BOM components correctly', async (t) => {
    const bomCopy = JSON.parse(JSON.stringify(bomFile));
    const expectedBom = {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        components: [{
            name: "random",
            group: "random",
            purl: "pkg:maven/random-things@1.0.0",
            version: "1.0.0",
            cpe: "cpe:2.3:a:random:random:1.0.0"
        }]
    };
    const mappedBom = mavenParser.parseCycloneDX(cpeDb, bomCopy, false, false);
    assert.deepStrictEqual(mappedBom, expectedBom);
});
