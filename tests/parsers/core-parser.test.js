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

import { CoreParser } from "../../src/parsers/core-parser.js";

test('CoreParser should throw an error when instancied', () => {
    test('returns "group:name" when both group and name are provided', () => {
        assert.throws(() => new CoreParser(), {
            message: 'The CoreParser should not be instantiated directly'
        });
    });
});