// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getDefaultUserAgentValue } from '@azure/ms-rest-js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pjson: Record<'name' | 'version', string> = require('../package.json');

/**
 * Augment default msRest user-agent HTTP header
 *
 * @param {string} userAgent existing user agent to augment
 * @param {string} packageName package name to report, defaults to package.json name
 * @param {string} packageVersion package version to report, defaults to package.json version
 * @returns {string} augmented user agent
 */
export function resolveUserAgent(
    userAgent: ((defaultUserAgent: string) => string) | string = '',
    packageName = pjson.name,
    packageVersion = pjson.version
): string {
    const defaultValue = getDefaultUserAgentValue();
    return `${packageName}/${packageVersion} ${defaultValue} ${
        typeof userAgent === 'function' ? userAgent(defaultValue) : userAgent
    }`;
}
