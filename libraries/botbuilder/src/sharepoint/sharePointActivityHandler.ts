/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    ActivityHandler,
    InvokeResponse,
    AceRequest,
    TurnContext,
    CardViewResponse,
    QuickViewResponse,
    GetPropertyPaneConfigurationResponse,
    SetPropertyPaneConfigurationResponse,
    HandleActionResponse,
} from 'botbuilder-core';

/**
 * The SharePointActivityHandler is derived from ActivityHandler. It adds support for
 * the SharePoint specific events and interactions
 */
export class SharePointActivityHandler extends ActivityHandler {
    /**
     * Invoked when an invoke activity is received from the connector.
     * Invoke activities can be used to communicate many different things.
     * * Invoke activities communicate programmatic commands from a client or channel to a bot.
     *
     * @param context A strongly-typed context object for this turn
     * @returns A task that represents the work queued to execute
     */
    protected async onInvokeActivity(context: TurnContext): Promise<InvokeResponse> {
        try {
            if (!context.activity.name && context.activity.channelId === 'sharepoint') {
                throw new Error('NotImplemented');
            } else {
                switch (context.activity.name) {
                    case 'cardExtension/getCardView':
                        return ActivityHandler.createInvokeResponse(
                            await this.onSharePointTaskGetCardViewAsync(context, context.activity.value as AceRequest)
                        );

                    case 'cardExtension/getQuickView':
                        return ActivityHandler.createInvokeResponse(
                            await this.onSharePointTaskGetQuickViewAsync(context, context.activity.value as AceRequest)
                        );

                    case 'cardExtension/getPropertyPaneConfiguration':
                        return ActivityHandler.createInvokeResponse(
                            await this.onSharePointTaskGetPropertyPaneConfigurationAsync(
                                context,
                                context.activity.value as AceRequest
                            )
                        );

                    case 'cardExtension/setPropertyPaneConfiguration':
                        return ActivityHandler.createInvokeResponse(
                            await this.onSharePointTaskSetPropertyPaneConfigurationAsync(
                                context,
                                context.activity.value as AceRequest
                            )
                        );
                    case 'cardExtension/handleAction':
                        return ActivityHandler.createInvokeResponse(
                            await this.onSharePointTaskHandleActionAsync(context, context.activity.value as AceRequest)
                        );
                    default:
                        return super.onInvokeActivity(context);
                }
            }
        } catch (err) {
            if (err.message === 'NotImplemented') {
                return { status: 501 };
            } else if (err.message === 'BadRequest') {
                return { status: 400 };
            }
            throw err;
        }
    }

    /**
     * Override this in a derived class to provide logic for when a card view is fetched
     *
     * @param _context - A strongly-typed context object for this turn
     * @param _aceRequest - The Ace invoke request value payload
     * @returns A Card View Response for the request
     */
    protected async onSharePointTaskGetCardViewAsync(
        _context: TurnContext,
        _aceRequest: AceRequest
    ): Promise<CardViewResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Override this in a derived class to provide logic for when a quick view is fetched
     *
     * @param _context - A strongly-typed context object for this turn
     * @param _aceRequest - The Ace invoke request value payload
     * @returns A Quick View Response for the request
     */
    protected async onSharePointTaskGetQuickViewAsync(
        _context: TurnContext,
        _aceRequest: AceRequest
    ): Promise<QuickViewResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Override this in a derived class to provide logic for getting configuration pane properties.
     *
     * @param _context - A strongly-typed context object for this turn
     * @param _aceRequest - The Ace invoke request value payload
     * @returns A Property Pane Configuration Response for the request
     */
    protected async onSharePointTaskGetPropertyPaneConfigurationAsync(
        _context: TurnContext,
        _aceRequest: AceRequest
    ): Promise<GetPropertyPaneConfigurationResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Override this in a derived class to provide logic for setting configuration pane properties.
     *
     * @param _context - A strongly-typed context object for this turn
     * @param _aceRequest - The Ace invoke request value payload
     * @returns A Card view or no-op action response
     */
    protected async onSharePointTaskSetPropertyPaneConfigurationAsync(
        _context: TurnContext,
        _aceRequest: AceRequest
    ): Promise<SetPropertyPaneConfigurationResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Override this in a derived class to provide logic for setting configuration pane properties.
     *
     * @param _context - A strongly-typed context object for this turn
     * @param _aceRequest - The Ace invoke request value payload
     * @returns A handle action response
     */
    protected async onSharePointTaskHandleActionAsync(
        _context: TurnContext,
        _aceRequest: AceRequest
    ): Promise<HandleActionResponse> {
        throw new Error('NotImplemented');
    }
}
