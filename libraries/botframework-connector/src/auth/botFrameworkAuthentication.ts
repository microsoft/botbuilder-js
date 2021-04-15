// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity, CallerIdConstants } from 'botframework-schema';
import { AuthenticateRequestResult } from './authenticateRequestResult';
import { BotFrameworkClient } from '../skills';
import { ClaimsIdentity } from './claimsIdentity';
import { ConnectorClient } from '../connectorApi/connectorClient';
import { JwtTokenValidation } from './jwtTokenValidation';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { SkillValidation } from './skillValidation';
import { UserTokenClient } from './userTokenClient';

/**
 * Represents a Cloud Environment used to authenticate Bot Framework Protocol network calls within this environment.
 */
export abstract class BotFrameworkAuthentication {
    /**
     * Validate Bot Framework Protocol requests.
     *
     * @param activity The inbound Activity.
     * @param authHeader The HTTP auth header.
     */
    abstract authenticateRequest(activity: Activity, authHeader: string): Promise<AuthenticateRequestResult>;

    /**
     * Validate Bot Framework Protocol requests.
     *
     * @param authHeader The HTTP auth header.
     * @param channelIdHeader The channel ID HTTP header.
     */
    abstract authenticateStreamingRequest(
        authHeader: string,
        channelIdHeader: string
    ): Promise<AuthenticateRequestResult>;

    /**
     * Creates a ConnectorFactory that can be used to create ConnectorClients that can use credentials from this particular Cloud Environment.
     *
     * @param claimsIdentity The inbound Activity's ClaimsIdentity.
     */
    abstract createConnectorFactory(claimsIdentity: ClaimsIdentity): ConnectorClient;

    /**
     * Creates the appropriate UserTokenClient instance.
     *
     * @param claimsIdentity The inbound Activity's ClaimsIdentity.
     */
    abstract createUserTokenClient(claimsIdentity: ClaimsIdentity): Promise<UserTokenClient>;

    /**
     * Creates a BotFrameworkClient for calling Skills.
     */
    createBotFrameworkClient(): BotFrameworkClient {
        throw new Error('NotImplemented');
    }

    /**
     * Gets the originating audience from Bot OAuth scope.
     */
    getOriginatingAudience(): string {
        throw new Error('NotImplemented');
    }

    // TODO: Update docstring - this is a direct port from .NET
    /**
     * Authenticate Bot Framework Protocol request to Skills.
     *
     * @param authHeader The HTTP auth header in the skill request.
     */
    authenticateChannelRequest(authHeader: string): Promise<ClaimsIdentity> {
        throw new Error('NotImplemented');
    }

    /**
     * Generates the appropriate callerId to write onto the Activity, this might be null.
     *
     * @param credentialFactory A ServiceClientCredentialsFactory to use.
     * @param claimsIdentity The inbound claims.
     * @param callerId The default callerId to use if this is not a skill.
     */
    protected async generateCallerId(
        credentialFactory: ServiceClientCredentialsFactory,
        claimsIdentity: ClaimsIdentity,
        callerId: string
    ): Promise<string> {
        // Is the bot accepting all incoming messages?
        if (await credentialFactory.isAuthenticationDisabled()) {
            // Return null so that the callerId is cleared.
            return null;
        }

        // Is the activity from another bot?
        return SkillValidation.isSkillClaim(claimsIdentity.claims)
            ? `${CallerIdConstants.BotToBotPrefix}${JwtTokenValidation.getAppIdFromClaims(claimsIdentity.claims)}`
            : callerId;
    }
}
