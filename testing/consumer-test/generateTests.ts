/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * This script generates test files for each version of TypeScript, so the test can run in parallel.
 */

import fs from 'fs';
import path from 'path';

const versions = ['4.8', '4.9', '5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9'];
const targets = ['es6', 'esnext'];

const testsDir = path.resolve(__dirname, 'tests/generated');

if (fs.existsSync(testsDir)) {
    fs.rmSync(testsDir, { recursive: true });
}

fs.mkdirSync(testsDir);

for (const version of versions) {
    fs.writeFileSync(
        path.resolve(testsDir, `typescript.${version}.test.js`),
        `
const testVersion = require('../typescript');
testVersion('${version}', ['${targets.join("','")}']);
        `,
    );
}
