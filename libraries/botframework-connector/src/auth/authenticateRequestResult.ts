// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ClaimsIdentity } from './claimsIdentity';
import { ConnectorFactory } from '../connectorFactory';

// TODO: Make these descriptions more informative in the JS and .NET SDKs.
/**
 * The result from a call to authenticate a Bot Framework Protocol request.
 */
export type AuthenticateRequestResult = {
    /**
     * A value for the Audience.
     */
    audience: string;
    /**
     * A value for the ClaimsIdentity.
     */
    claimsIdentity: ClaimsIdentity;
    /**
     * A value for the CallerId.
     */
    callerId: string;
    /**
     * A value for the ConnectorFactory.
     */
    connectorFactory: ConnectorFactory;
};
