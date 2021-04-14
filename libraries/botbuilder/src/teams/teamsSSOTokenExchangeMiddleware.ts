// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as signInConstants from '../signInConstants';
import { ExtendedUserTokenProvider } from '../extendedUserTokenProvider';
import { Middleware } from '../middlewareSet';
import { Storage, StoreItem } from '../storage';
import { TurnContext } from '../turnContext';

import {
    ActivityTypes,
    StatusCodes,
    TokenExchangeInvokeRequest,
    TokenExchangeInvokeResponse,
    TokenResponse,
} from 'botframework-schema';

function getStorageKey(context: TurnContext): string {
    const activity = context.activity;

    const channelId = activity.channelId;
    if (!channelId) {
        throw new Error('invalid activity-missing channelId');
    }

    const conversationId = activity.conversation?.id;
    if (!conversationId) {
        throw new Error('invalid activity-missing Conversation.Id');
    }

    const value = activity.value;
    if (!value?.id) {
        throw new Error('Invalid signin/tokenExchange. Missing activity.Value.Id.');
    }

    return `${channelId}/${conversationId}/${value.id}`;
}

/**
 * If the activity name is signin/tokenExchange, this middleware will attempt to
 * exchange the token, and deduplicate the incoming call, ensuring only one
 * exchange request is processed.
 *
 * If a user is signed into multiple Teams clients, the Bot could receive a
 * "signin/tokenExchange" from each client. Each token exchange request for a
 * specific user login will have an identical Activity.Value.Id.
 *
 * Only one of these token exchange requests should be processed by the bot.
 * The others return <see cref="System.Net.HttpStatusCode.PreconditionFailed"/>.
 * For a distributed bot in production, this requires a distributed storage
 * ensuring only one token exchange is processed. This middleware supports
 * CosmosDb storage found in Microsoft.Bot.Builder.Azure, or MemoryStorage for
 * local development. IStorage's ETag implementation for token exchange activity
 * deduplication.
 */
export class TeamsSSOTokenExchangeMiddleware implements Middleware {
    /**
     * Initializes a new instance of the TeamsSSOTokenExchangeMiddleware class.
     *
     * @param storage The [Storage](xref:botbuilder-core.Storage) to use for deduplication
     * @param oAuthConnectionName The connection name to use for the single sign on token exchange
     */
    constructor(private readonly storage: Storage, private readonly oAuthConnectionName: string) {}

    /**
     * Called each time the bot receives a new request.
     *
     * @param context Context for current turn of conversation with the user.
     * @param next Function to call to continue execution to the next step in the middleware chain.
     */
    async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.name === signInConstants.tokenExchangeOperationName) {
            // If the TokenExchange is NOT successful, the response will have already been sent by ExchangedTokenAsync
            if (!(await this.exchangedToken(context))) {
                return;
            }

            // Only one token exchange should proceed from here. Deduplication is performed second because in the case
            // of failure due to consent required, every caller needs to receive the
            if (!(await this.deduplicatedTokenExchangeId(context))) {
                // If the token is not exchangeable, do not process this activity further.
                return;
            }
        }

        await next();
    }

    private async deduplicatedTokenExchangeId(context: TurnContext): Promise<boolean> {
        // Create a StoreItem with Etag of the unique 'signin/tokenExchange' request
        const storeItem: StoreItem = {
            eTag: context.activity.value?.id,
        };

        try {
            // Writing the IStoreItem with ETag of unique id will succeed only once
            await this.storage.write({
                [getStorageKey(context)]: storeItem,
            });
        } catch (err) {
            const message = err.message?.toLowerCase();

            // Do NOT proceed processing this message, some other thread or machine already has processed it.
            // Send 200 invoke response.
            if (message.includes('etag conflict') || message.includes('precondition is not met')) {
                await this.sendInvokeResponse(context);
                return false;
            }

            throw err;
        }

        return true;
    }

    private async sendInvokeResponse(
        context: TurnContext,
        body: unknown = null,
        status = StatusCodes.OK
    ): Promise<void> {
        await context.sendActivity({
            type: ActivityTypes.InvokeResponse,
            value: { body, status },
        });
    }

    private async exchangedToken(context: TurnContext): Promise<boolean> {
        let tokenExchangeResponse: TokenResponse;
        const tokenExchangeRequest: TokenExchangeInvokeRequest = context.activity.value;

        const tokenProvider = (context.adapter as unknown) as ExtendedUserTokenProvider;
        if (!tokenProvider) {
            throw new Error('Token Exchange is not supported by the current adapter.');
        }

        // TODO(jgummersall) convert to new user token client provider when available
        try {
            tokenExchangeResponse = await tokenProvider.exchangeToken(
                context,
                this.oAuthConnectionName,
                context.activity.channelId,
                { token: tokenExchangeRequest.token }
            );
        } catch (_err) {
            // Ignore Exceptions
            // If token exchange failed for any reason, tokenExchangeResponse above stays null,
            // and hence we send back a failure invoke response to the caller.
        }

        if (!tokenExchangeResponse.token) {
            // The token could not be exchanged (which could be due to a consent requirement)
            // Notify the sender that PreconditionFailed so they can respond accordingly.

            const invokeResponse: TokenExchangeInvokeResponse = {
                id: tokenExchangeRequest.id,
                connectionName: this.oAuthConnectionName,
                failureDetail: 'The bot is unable to exchange token. Proceed with regular login.',
            };

            await this.sendInvokeResponse(context, invokeResponse, StatusCodes.PRECONDITION_FAILED);

            return false;
        }

        return true;
    }
}
