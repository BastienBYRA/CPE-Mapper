import test from 'node:test';
import assert from 'node:assert';
import { TEST__MAPPER_JS } from '../mapper.js';
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
