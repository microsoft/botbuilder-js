// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import sinon from 'sinon';
import { Func } from 'botbuilder-stdlib';

/**
 * Create a sinon sandbox that initializes and resets using mocha lifecycle hooks.
 *
 * @param {sinon.SinonSandboxConfig} config optional sandbox config
 * @returns {Func<[], sinon.SinonSandbox>} a handle to the sandbox
 */
export function mocha(config?: sinon.SinonSandboxConfig): Func<[], sinon.SinonSandbox> {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox(config);
    });

    afterEach(() => {
        sandbox.restore();
    });

    return () => sandbox;
}
