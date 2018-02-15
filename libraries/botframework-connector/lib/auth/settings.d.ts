/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export interface BotCredentials {
    appId?: string;
    appPassword?: string;
}
export interface BotAuthenticatorSettings extends BotCredentials {
    endpoint: BotConnectorEndpoint;
    openIdMetadata: string;
}
export interface BotConnectorEndpoint {
    refreshEndpoint: string;
    refreshScope: string;
    botConnectorOpenIdMetadata: string;
    botConnectorIssuer: string;
    botConnectorAudience: string;
    emulatorOpenIdMetadata: string;
    emulatorAuthV31IssuerV1: string;
    emulatorAuthV31IssuerV2: string;
    emulatorAuthV32IssuerV1: string;
    emulatorAuthV32IssuerV2: string;
    emulatorAudience: string;
}
export declare const AuthSettings: {
    refreshEndpoint: string;
    refreshScope: string;
    botConnectorOpenIdMetadata: string;
    botConnectorIssuer: string;
    emulatorOpenIdMetadata: string;
    emulatorAuthV31IssuerV1: string;
    emulatorAuthV31IssuerV2: string;
    emulatorAuthV32IssuerV1: string;
    emulatorAuthV32IssuerV2: string;
};
