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

import { applyCPEMappings } from "./commands/mapper.js";
import { setupAppConfig } from './config.js';
import { isBoolean } from "./utils.js"

/**
 * GitHub Action entrypoint to process the inputs given by the user before running the `apply` command.
 * 
 * This should not be implemented anywhere else, as it is only an entrypoint.
 */
const ghaEntrypoint = () => {
    // Get values from GitHub Action
    const inputFile = process.env["INPUT_INPUT-FILE"]
    const outputFile = process.env["INPUT_OUTPUT-FILE"]
    let overrideCpe = process.env["INPUT_OVERRIDE-CPE"]
    let verbose = process.env.INPUT_VERBOSE

    if (!isBoolean(overrideCpe) && overrideCpe) {
        console.error("The input `override-cpe` is not correctly defined, expected values: true, false, True, False or an empty value")
        process.exit(1)
    }
    if (overrideCpe === "true" || overrideCpe === "True")
        overrideCpe = true
    else
        overrideCpe = false


    if (!isBoolean(verbose) && verbose) {
        console.error("The input `verbose` is not correctly defined, expected values: true, false, True, False or an empty value")
        process.exit(1)
    }
    if (verbose === "true" || verbose === "True")
        verbose = true
    else
        verbose = false

    const appConfig = setupAppConfig()

    applyCPEMappings(inputFile, outputFile, true, verbose, overrideCpe, appConfig)
}

ghaEntrypoint()