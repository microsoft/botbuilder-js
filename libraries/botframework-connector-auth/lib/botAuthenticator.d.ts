import { BotAuthenticatorSettings } from './settings';
export interface Headers {
    [name: string]: string;
}
export declare class BotAuthenticator {
    protected settings: BotAuthenticatorSettings;
    private botConnectorOpenIdMetadata;
    private msaOpenIdMetadata;
    private emulatorOpenIdMetadata;
    constructor(settings?: BotAuthenticatorSettings);
    authenticate(headers: Headers, channelId?: string, serviceUrl?: string): Promise<void>;
    private addStatusToError(err, status);
}
