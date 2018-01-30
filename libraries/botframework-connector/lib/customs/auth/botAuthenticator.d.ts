import { BotCredentials } from './settings';
export interface Headers {
    [name: string]: string;
}
export declare class BotAuthenticator {
    protected credentials: BotCredentials;
    private botConnectorOpenIdMetadata;
    private msaOpenIdMetadata;
    private emulatorOpenIdMetadata;
    private settings;
    constructor(credentials?: BotCredentials);
    authenticate(headers: Headers, channelId?: string, serviceUrl?: string): Promise<void>;
    private addStatusToError(err, status);
}
