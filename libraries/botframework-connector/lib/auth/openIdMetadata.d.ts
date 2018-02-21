export declare class OpenIdMetadata {
    private url;
    private lastUpdated;
    private keys;
    constructor(url: string);
    getKey(keyId: string): Promise<IOpenIdMetadataKey | null>;
    private refreshCache(cb);
    private findKey(keyId);
}
export interface IOpenIdMetadataKey {
    key: string;
    endorsements?: string[];
}
