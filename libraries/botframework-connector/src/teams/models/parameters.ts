/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { OperationURLParameter, OperationQueryParameter } from '@azure/core-http';

export const teamId: OperationURLParameter = {
    parameterPath: 'teamId',
    mapper: {
        required: true,
        serializedName: 'teamId',
        type: {
            name: 'String',
        },
    },
};

export const meetingId: OperationURLParameter = {
    parameterPath: 'meetingId',
    mapper: {
        required: true,
        serializedName: 'meetingId',
        type: {
            name: 'String',
        },
    },
};

export const participantId: OperationURLParameter = {
    parameterPath: 'participantId',
    mapper: {
        required: true,
        serializedName: 'participantId',
        type: {
            name: 'String',
        },
    },
};

export const tenantId: OperationQueryParameter = {
    parameterPath: ['options', 'tenantId'],
    mapper: {
        serializedName: 'tenantId',
        type: {
            name: 'String',
        },
    },
};

export const operationId: OperationURLParameter = {
    parameterPath: 'operationId',
    mapper: {
        serializedName: 'operationId',
        type: {
            name: 'String',
        },
    },
};
