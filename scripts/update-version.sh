#!/bin/bash
# Copyright 2025 Bastien BYRA

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#    http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

if [ -z "$NEW_RELEASE_VERSION" ] || [ "$NEW_RELEASE_VERSION" = "TO_DEFINE" ]; then
    echo "Please set the NEW_RELEASE_VERSION with the new release value before running this script."
    exit 1
fi

sed -i "s/version('0.1.0')/version('$NEW_RELEASE_VERSION')/g" src/cli.js
sed -i "s/0.1.0/$NEW_RELEASE_VERSION/g" Dockerfile
sed -i "s/\"version\": \".*\"/\"version\": \"$NEW_RELEASE_VERSION\"/" package.json
# To update the application version
npm install