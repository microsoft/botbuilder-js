/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { OperationURLParameter, OperationQueryParameter } from '@azure/core-http';

export const appId: OperationURLParameter = {
    parameterPath: 'appId',
    mapper: {
        required: true,
        serializedName: 'appId',
        type: {
            name: 'String',
        },
    },
};
export const bingSpellCheckSubscriptionKey: OperationQueryParameter = {
    parameterPath: ['options', 'bingSpellCheckSubscriptionKey'],
    mapper: {
        serializedName: 'bing-spell-check-subscription-key',
        type: {
            name: 'String',
        },
    },
};
export const endpoint: OperationURLParameter = {
    parameterPath: 'endpoint',
    mapper: {
        required: true,
        serializedName: 'Endpoint',
        defaultValue: '',
        type: {
            name: 'String',
        },
    },
    skipEncoding: true,
};
export const log: OperationQueryParameter = {
    parameterPath: ['options', 'log'],
    mapper: {
        serializedName: 'log',
        type: {
            name: 'Boolean',
        },
    },
};
export const spellCheck: OperationQueryParameter = {
    parameterPath: ['options', 'spellCheck'],
    mapper: {
        serializedName: 'spellCheck',
        type: {
            name: 'Boolean',
        },
    },
};
export const staging: OperationQueryParameter = {
    parameterPath: ['options', 'staging'],
    mapper: {
        serializedName: 'staging',
        type: {
            name: 'Boolean',
        },
    },
};
export const timezoneOffset: OperationQueryParameter = {
    parameterPath: ['options', 'timezoneOffset'],
    mapper: {
        serializedName: 'timezoneOffset',
        type: {
            name: 'Number',
        },
    },
};
export const verbose: OperationQueryParameter = {
    parameterPath: ['options', 'verbose'],
    mapper: {
        serializedName: 'verbose',
        type: {
            name: 'Boolean',
        },
    },
};
