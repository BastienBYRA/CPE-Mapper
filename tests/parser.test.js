/**
 * Copyright 2025 Bastien BYRA
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import test from 'node:test';
import assert from 'node:assert';

import { ParserManager } from "../src/parsers/manager.js";
import { MavenParser } from "../src/parsers/maven-parser.js";
import { BOMFormats, guessBOMFormat } from "../src/utils/utils-bom.js";

const parserManager = new ParserManager();
const mavenParser = new MavenParser("not-important");

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
            { name: 'express', cpe: 'cpe:express' },
            { name: "random", group: "random", cpe: 'cpe:2.3:a:random:random:VERSION_COMPONENT' }
        ]
    }
};

test('guessBOMFormat identifies BOM formats correctly', (t) => {
    assert.strictEqual(guessBOMFormat(bomFile), BOMFormats.CycloneDX);

    const unknownBom = { thesuperformat: "unknown" };
    assert.strictEqual(guessBOMFormat(unknownBom), BOMFormats.NotFound);
});

test('parserManager.getRequiredParsersCycloneDX returns correct parser instances', (t) => {
    const requiredParsers = parserManager.getRequiredParsersCycloneDX(bomFile);
    assert.strictEqual(requiredParsers[0].ecosystem, mavenParser.ecosystem);
});

test('MavenParser.getComponentFullName returns correct full names', async (t) => {
    await t.test('returns "group:name" when both group and name are provided', () => {
        assert.strictEqual(mavenParser.getComponentFullName('org.apache', 'lib'), 'org.apache:lib');
    });

    await t.test('returns name if only name is provided', () => {
        assert.strictEqual(mavenParser.getComponentFullName(null, 'lib'), 'lib');
    });

    await t.test('returns group if only group is provided', () => {
        assert.strictEqual(mavenParser.getComponentFullName('org.apache', null), 'org.apache');
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

    await t.test('matches name only', () => {
        const result = mavenParser.searchCpeMapping('express', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:express');
    });

    await t.test('returns undefined when no match', () => {
        const result = mavenParser.searchCpeMapping('notfound', cpeDb);
        assert.strictEqual(result, undefined);
    });
});

test('MavenParser.getCPEMapping applies correct CPE mapping', async (t) => {
    await t.test('returns correct CPE with version replaced', () => {
        const cpe = mavenParser.getCPEMapping(
            cpeDb.maven.packages[2],
            undefined,
            JSON.parse(JSON.stringify(bomFile.components[0])),
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:random:random:1.0.0");
    });

    await t.test('uses "*" when version is missing', () => {
        const comp = { ...bomFile.components[0], version: undefined };
        const cpe = mavenParser.getCPEMapping(
            cpeDb.maven.packages[2],
            undefined,
            comp,
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:random:random:*");
    });

    await t.test('overrides existing CPE if overrideCpe is true', () => {
        const component = { ...bomFile.components[0], cpe: 'existing:cpe' };
        const cpe = mavenParser.getCPEMapping(
            cpeDb.maven.packages[2],
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
