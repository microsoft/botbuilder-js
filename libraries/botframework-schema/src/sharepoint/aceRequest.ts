// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * ACE invoke request payload.
 */
export interface AceRequest {
    /**
     * User ACE request data. Free payload with key-value pairs.
     */
    data?: any;
    /**
     * ACE properties data.
     */
    properties?: any;
}
