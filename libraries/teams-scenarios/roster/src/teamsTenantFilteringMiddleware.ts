// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    TurnContext,
} from 'botbuilder';

import {
    Middleware,
    TeamsChannelData,
} from 'botbuilder-core';

/**
 * Teams specific middleware for filtering messages by Tenant Id.
 */
export class TeamsTenantFilteringMiddleware implements Middleware {
    // tslint:disable:variable-name
    private readonly _tenantSet = new Set();
    // tslint:enable:variable-name

    /**
     * Initializes a new instance of the TeamsTenantFilteringMiddleware class.
     * * @param allowedTenants Either a single Tenant Id or array of Tenant Ids.
     */
    constructor(allowedTenants: string | string[]) {
        if(Array.isArray(allowedTenants)){
            for (let elem of allowedTenants) {
                this._tenantSet.add(elem);
              }
        }
        else {
            this._tenantSet.add(allowedTenants);
        }
    }

    /**
     * Store the incoming activity on the App Insights Correlation Context and optionally calls the TelemetryLoggerMiddleware
     * @param context The context object for this turn.
     * @param next The delegate to call to continue the bot middleware pipeline
     */
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context === null) {
            throw new Error('context is null');
        }

        if (context.activity.channelId !== 'msteams') {
            // If the goal is to NOT process messages from other channels, comment out the following line
            // and message processing will be 'short circuited'.
            if (next !== null) {
                await next();
            }
            return;
        }

        const channelData = context.activity.channelData as TeamsChannelData;
        const tenant = channelData && channelData.tenant ? channelData.tenant : undefined;
        const tenantId = tenant && typeof(tenant.id) === 'string' ? tenant.id : undefined;

        if (!tenantId) {
            throw new Error("Tenant Id is missing.");
        }

        if (!this._tenantSet.has(tenantId)) {
            throw new Error(`Tenant Id '${tenantId}' is not allowed access.`);
        }

        if (next !== null) {
            await next();
        }
    }
}
