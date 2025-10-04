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
import { TEST__UPDATE_JS } from '../src/commands/update.js';
import { rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
const { getLocalDatabaseHash, getDistantDatabaseHash } = TEST__UPDATE_JS

const textToHash = '"abc"'
const hashedText = "6cc43f858fbb763301637b5af970e2a46b46f461f27e5a0f41e009c59b827b25"

/**
 * Test for `getLocalDatabaseHash`
 */
test('getLocalDatabaseHash', async (t) => {

  await t.test('should return undefined if the filepath is undefined or does not exist', () => {
    assert.strictEqual(getLocalDatabaseHash(undefined), undefined);
  });

  await t.test('should return the expected sha256 hash of the file content', () => {
    const filepath = tmpdir() + "/testfile.txt";
    writeFileSync(filepath, textToHash, "utf-8");

    assert.strictEqual(getLocalDatabaseHash(filepath), hashedText);

    // Delete the file
    rmSync(filepath);
  });
})

/**
 * Test for `getDistantDatabaseHash`
 */
test('getDistantDatabaseHash', async (t) => {

  await t.test('should return undefined if the data is undefined', () => {
    assert.strictEqual(getDistantDatabaseHash(undefined), undefined);
  });

  await t.test('should return the expected sha256 hash when valid JSON data is provided', () => {
    assert.strictEqual(getDistantDatabaseHash(JSON.parse(textToHash)), hashedText);
  });
})
