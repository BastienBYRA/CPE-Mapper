#!/bin/bash

if [ -z "$NEW_RELEASE_VERSION" ] || [ "$NEW_RELEASE_VERSION" = "TO_DEFINE" ]; then
    echo "Please set the NEW_RELEASE_VERSION with the new release value before running this script."
    exit 1
fi

sed -i "s/version('0.1.0')/version('$NEW_RELEASE_VERSION')/g" src/cli.js
sed -i "s/0.1.0/$NEW_RELEASE_VERSION/g" Dockerfile
sed -i "s/\"version\": \".*\"/\"version\": \"$NEW_RELEASE_VERSION\"/" package.json
# To update the application version
npm install