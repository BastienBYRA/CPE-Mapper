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

NEW_RELEASE_VERSION="$1"

if [ -z "$NEW_RELEASE_VERSION" ]; then
    echo "Usage: $0 <new_release_version>"
    exit 1
fi

# Update the version in the CLI
sed -E -i "s/version\('[0-9]+\.[0-9]+\.[0-9]+'\)/version('$NEW_RELEASE_VERSION')/g" src/cli.js

# Update the version in the Dockerfile
sed -E -i "s/[0-9]+\.[0-9]+\.[0-9]+/$NEW_RELEASE_VERSION/g" Dockerfile

# Update the version in action.yml Docker image
sed -E -i "s|(image:\s+ghcr.io/bastienbyra/cpe-mapper:)[0-9]+\.[0-9]+\.[0-9]+|\1$NEW_RELEASE_VERSION|" action.yml

# Update the version in package.json and update the package-lock.json
sed -E -i "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$NEW_RELEASE_VERSION\"/" package.json
npm install