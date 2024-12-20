/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execp = promisify(exec);

module.exports = function testVersion(version, targets) {
    describe(`typescript:${version}`, function () {
        this.timeout(300000); // 5 minutes
        this.retries(1);
        for (const target of targets) {
            it(`target:${target}`, async function () {
                await execp(`npx -p typescript@${version} tsc -p tsconfig-test.json --target ${target}`);
            });
        }
    });
};
