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
import assert from 'node:assert/strict';
import { isBoolean, isURL, isFilePath } from '../../src/utils/utils.js';
import { writeFileSync, unlinkSync } from 'node:fs';

test('isBoolean identifies boolean strings correctly', async (t) => {
    await t.test('returns true for "true" and "false" variants', () => {
        assert.strictEqual(isBoolean('true'), true);
        assert.strictEqual(isBoolean('false'), true);
        assert.strictEqual(isBoolean('True'), true);
        assert.strictEqual(isBoolean('False'), true);
    });

    await t.test('returns false for non-boolean strings', () => {
        assert.strictEqual(isBoolean('yes'), false);
        assert.strictEqual(isBoolean('no'), false);
        assert.strictEqual(isBoolean('1'), false);
        assert.strictEqual(isBoolean(''), false);
        assert.strictEqual(isBoolean(undefined), false);
    });
});

test('isURL detects URLs correctly', async (t) => {
    await t.test('returns true for http and https URLs', () => {
        assert.strictEqual(isURL('http://example.com'), true);
        assert.strictEqual(isURL('https://github.com'), true);
    });

    await t.test('returns false for non-URL strings', () => {
        assert.strictEqual(isURL('ftp://example.com'), false);
        assert.strictEqual(isURL('example.com'), false);
        assert.strictEqual(isURL('www.example.com'), false);
        assert.strictEqual(isURL(''), false);
    });
});

test('isFilePath verifies file existence correctly', async (t) => {
    const tempFile = './temp-test-file.txt';

    await t.test('returns true if file exists', () => {
        writeFileSync(tempFile, 'test content');
        assert.strictEqual(isFilePath(tempFile), true);
    });

    await t.test('returns false if file does not exist', () => {
        unlinkSync(tempFile);
        assert.strictEqual(isFilePath(tempFile), false);
    });
});
