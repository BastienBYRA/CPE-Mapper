import test from 'node:test';
import assert from 'node:assert';
import { TEST__MAPPER_JS } from '../mapper.js';
const { getComponentFullName, searchCpeMapping } = TEST__MAPPER_JS

/**
 * Test for `getComponentFullName`
 */
test('getComponentFullName', async (t) => {

  await t.test('returns group:name when both exist', () => {
    assert.strictEqual(getComponentFullName('org.apache', 'lib'), 'org.apache:lib');
  });

  await t.test('returns name if only name is provided', () => {
    assert.strictEqual(getComponentFullName(null, 'lib'), 'lib');
  });

  await t.test('returns group if only group is provided', () => {
    assert.strictEqual(getComponentFullName('org.apache', null), 'org.apache');
  });

  await t.test('returns undefined if both are missing', () => {
    assert.strictEqual(getComponentFullName(null, null), undefined);
  });
});



/**
 * Test for `searchCpeMapping`
 */
test('searchCpeMapping', async (t) => {
    const cpeDb = {
        packages: [
            { group: 'org.apache', name: 'lib', cpe: 'cpe:...' },
            { name: 'express', cpe: 'cpe:...' }
        ]
    };

    await t.test('searchCpeMapping finds a match with group:name', () => {
        const result = searchCpeMapping('org.apache:lib', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:...');
    });

    await t.test('searchCpeMapping finds a match with name only', () => {
        const result = searchCpeMapping('express', cpeDb);
        assert.strictEqual(result.cpe, 'cpe:...');
    });

    await t.test('searchCpeMapping returns undefined when no match', () => {
        const result = searchCpeMapping('notfound', cpeDb);
        assert.strictEqual(result, undefined);
    });
})