/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, ConverterFactory, Dialog, DialogContext } from 'botbuilder-dialogs';

import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    IntExpression,
    IntExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import {
    Activity,
    ActivityTypes,
    CacheInfo,
    MessagingExtensionResponse,
    MessagingExtensionResult,
    StatusCodes,
    TabResponse,
} from 'botbuilder';

export interface BaseTeamsCacheInfoResponseDialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    cacheType?: string | Expression | StringExpression;
    cacheDuration?: number | Expression | IntExpression;
}

export abstract class BaseTeamsCacheInfoResponseDialog
    extends Dialog
    implements BaseTeamsCacheInfoResponseDialogConfiguration {
    /**
     * Gets or sets an optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Gets or sets config CacheType.
     *
     * @example
     * "cache" or "no_cache".
     */
    public cacheType?: StringExpression;

    /**
     * Gets or sets cache duration in seconds for which the cached object should remain in the cache.
     */
    public cacheDuration?: IntExpression;

    public getConverter(
        property: keyof BaseTeamsCacheInfoResponseDialogConfiguration | string
    ): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'cacheType':
                return new StringExpressionConverter();
            case 'cacheDuration':
                return new IntExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    protected static createInvokeResponseActivity(
        body: MessagingExtensionResponse | TabResponse,
        statusCode = StatusCodes.OK
    ): Partial<Activity> {
        return {
            value: {
                status: statusCode,
                body: body,
            },
            type: ActivityTypes.InvokeResponse,
        };
    }

    protected createMessagingExtensionInvokeResponseActivity(
        dc: DialogContext,
        result: MessagingExtensionResult
    ): Partial<Activity> {
        switch (dc.context.activity.name) {
            case 'composeExtension/queryLink':
            case 'composeExtension/query':
            case 'composeExtension/selectItem':
            case 'composeExtension/querySettingsUrl':
                return BaseTeamsCacheInfoResponseDialog.createInvokeResponseActivity({
                    composeExtension: result,
                    cacheInfo: this.getCacheInfo(dc),
                });
            case 'composeExtension/submitAction':
            case 'composeExtension/fetchTask':
                return BaseTeamsCacheInfoResponseDialog.createInvokeResponseActivity({
                    composeExtension: result,
                    cacheInfo: this.getCacheInfo(dc),
                });
            default:
                throw new Error(`GetMessagingExtensionResponse Invalid activity.name: ${dc.context.activity.name}`);
        }
    }

    protected getCacheInfo(dc: DialogContext): CacheInfo | undefined {
        if (this.cacheType != null && this.cacheDuration != null) {
            const cacheType = this.cacheType?.getValue(dc.state);
            let cacheDuration = this.cacheDuration?.getValue(dc.state);

            if (cacheDuration > 0 && cacheType != null) {
                // Valid ranges for cacheDuration are 60 < > 2592000
                cacheDuration = Math.min(Math.max(60, cacheDuration), 2592000);
                return {
                    cacheType,
                    cacheDuration,
                };
            }
        }

        return undefined;
    }
}
