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
import { TEST__MAPPER_JS } from '../src/commands/mapper.js';
const { getComponentFullName, searchCpeMapping } = TEST__MAPPER_JS

/**
 * Test for `getComponentFullName`
 */
test('getComponentFullName', async (t) => {

  await t.test('should return "group:name" when both group and name are provided', () => {
    assert.strictEqual(getComponentFullName('org.apache', 'lib'), 'org.apache:lib');
  });

  await t.test('should return name if only name is provided', () => {
    assert.strictEqual(getComponentFullName(null, 'lib'), 'lib');
  });

  await t.test('should return group if only group is provided', () => {
    assert.strictEqual(getComponentFullName('org.apache', null), 'org.apache');
  });

  await t.test('should return undefined if both group and name are missing', () => {
    assert.strictEqual(getComponentFullName(null, null), undefined);
  });
});


/**
 * Test for `searchCpeMapping`
 */
test('searchCpeMapping', async (t) => {
    const cpeDb = {
        packages: [
            { group: 'org.apache', name: 'lib', cpe: 'cpe:apache:lib' },
            { name: 'express', cpe: 'cpe:express' }
        ]
    };

    await t.test('should find a match with "group:name" format', () => {
        const result = searchCpeMapping('org.apache:lib', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:apache:lib');
    });

    await t.test('should find a match with name only', () => {
        const result = searchCpeMapping('express', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:express');
    });

    await t.test('should return undefined when no match is found', () => {
        const result = searchCpeMapping('notfound', cpeDb);
        assert.strictEqual(result, undefined);
    });
});
