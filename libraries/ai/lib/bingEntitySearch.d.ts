export interface BingEntitySearchOptions {
    subscriptionKey: string;
    responseFilter?: string;
}
export interface QueryOptions {
    q: string;
    cc?: string;
    mkt?: string;
    responseFilter?: string;
    responseFormat?: string;
    safeSearch?: string;
    setLang?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
}
export declare class BingEntitySearch {
    private options;
    constructor(options: BingEntitySearchOptions);
    search(queryOptions: QueryOptions): Promise<SearchResponse>;
}
export interface BingEntitySearchResult {
    searchResponse: SearchResponse;
    searchError: SearchError;
}
export interface Entity {
    bingId: string;
    contractualRules: any[];
    description: string;
    entityPresentationInfo: EntityPresentationInfo;
    image: Image;
    name: String;
    webSearchUrl: string;
    telephone: string;
    url: string;
}
export interface EntityAnswer {
    queryScenario: string;
    value: Entity[];
}
export interface EntityPresentationInfo {
    entityScenario: string;
    entityTypeDisplayHint: string;
    entityTypeHint: string[];
}
export interface SearchError {
    code: string;
    message: String;
    moreDetails: string;
    parameter: string;
    subCode: string;
    value: string;
}
export interface ErrorReponse {
    _type: string;
    errors: SearchError[];
}
export interface Image {
    height: number;
    hostPageUrl: string;
    name?: String;
    provider: Organization[];
    thumbnailUrl: string;
    width: number;
}
export interface License {
    name: string;
    url: string;
}
export interface LicenseAttribution {
    _type: String;
    license: License;
    licenseNotice: string;
    mustBeCloseToContent: boolean;
    targetPropertyName: string;
    text: string;
    url: string;
}
export interface LocalEntityAnswer {
    _type: string;
    value: Place[];
}
export interface MediaAttribution {
    _type: string;
    mustBecloseToContent: boolean;
    targetPropertyName: string;
    url: String;
}
export interface Organization {
    name: string;
    url: string;
}
export interface Place {
    _type: string;
    address: PostalAddress;
    entityPresentationInfo: EntityPresentationInfo;
    name: string;
    telephone: string;
    url: string;
    webSearchUrl: string;
}
export interface PostalAddress {
    addressCountry: string;
    addressLocality: string;
    addressRegion: string;
    neighborhood: string;
    postalCode: String;
    text: string;
}
export interface QueryContext {
    adultIntent: boolean;
    alterationOverrideQuery: string;
    alteredQuery: String;
    askUserForLocation: boolean;
    originalQuery: String;
}
export interface SearchResponse {
    _type: string;
    entities: EntityAnswer;
    places: LocalEntityAnswer;
    queryContext: QueryContext;
}
export interface TextAttribution {
    _type: string;
    text: string;
}
