// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * ACE invoke request payload.
 */
export interface AceRequest {
    /**
     * @member {any} [data] User ACE request data. Free payload with key-value pairs.
     */
    data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    /**
     * @member {any} [properties] ACE properties data.
     */
    properties?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}