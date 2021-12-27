// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotFrameworkAuthentication, ClaimsIdentity } from 'botframework-connector';
import { ChannelServiceHandlerBase } from './channelServiceHandlerBase';

/**
 *
 */
export class CloudChannelServiceHandler extends ChannelServiceHandlerBase {
    /**
     * @param auth
     */
    constructor(private readonly auth: BotFrameworkAuthentication) {
        super();
    }

    /**
     * @param authHeader
     */
    protected async authenticate(authHeader: string): Promise<ClaimsIdentity> {
        return this.auth.authenticateChannelRequest(authHeader);
    }
}
