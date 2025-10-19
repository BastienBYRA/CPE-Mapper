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

import { CargoParser } from "../../src/parsers/cargo-parser.js";

const cargoParser = new CargoParser();

const bomFile = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [{
        name: "serde",
        purl: "pkg:cargo/serde@1.0.130",
        version: "1.0.130"
    }]
};

const cpeDb = {
    cargo: {
        packages: [
            { name: 'tokio', cpe: 'cpe:2.3:a:tokio:tokio:VERSION_COMPONENT' },
            { name: 'serde', cpe: 'cpe:2.3:a:serde:serde:VERSION_COMPONENT' }
        ]
    }
};

test('CargoParser.searchCpeMapping finds correct mappings', async (t) => {
    await t.test('matches name only', () => {
        const result = cargoParser.searchCpeMapping('serde', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:2.3:a:serde:serde:VERSION_COMPONENT');
    });

    await t.test('returns undefined when no match is found', () => {
        const result = cargoParser.searchCpeMapping('nonexistent-crate', cpeDb);
        assert.strictEqual(result, undefined);
    });
});

test('CargoParser.getCPEMapping applies correct CPE mapping', async (t) => {
    await t.test('returns correct CPE with version replaced', () => {
        const cpe = cargoParser.getCPEMapping(
            cpeDb.cargo.packages[1],
            undefined,
            JSON.parse(JSON.stringify(bomFile.components[0])),
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:serde:serde:1.0.130");
    });

    await t.test('uses "*" when version is missing', () => {
        const comp = { ...bomFile.components[0], version: undefined };
        const cpe = cargoParser.getCPEMapping(
            cpeDb.cargo.packages[1],
            undefined,
            comp,
            false,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:serde:serde:*");
    });

    await t.test('overrides existing CPE if overrideCpe is true', () => {
        const component = { ...bomFile.components[0], cpe: 'existing:cpe' };
        const cpe = cargoParser.getCPEMapping(
            cpeDb.cargo.packages[1],
            undefined,
            component,
            true,
            false
        );
        assert.strictEqual(cpe, "cpe:2.3:a:serde:serde:1.0.130");
    });
});

test('CargoParser.parseCycloneDX maps BOM components correctly', async (t) => {
    const bomCopy = JSON.parse(JSON.stringify(bomFile));
    const expectedBom = {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        components: [{
            name: "serde",
            purl: "pkg:cargo/serde@1.0.130",
            version: "1.0.130",
            cpe: "cpe:2.3:a:serde:serde:1.0.130"
        }]
    };
    const mappedBom = cargoParser.parseCycloneDX(cpeDb, bomCopy, false, false);
    assert.deepStrictEqual(mappedBom, expectedBom);
});
