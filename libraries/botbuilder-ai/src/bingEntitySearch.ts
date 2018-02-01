/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { SearchCatalog, SearchEngine, SearchHit } from 'botbuilder';
import * as request from 'request-promise-native';

let serviceEndpoint = 'https://api.cognitive.microsoft.com/bing/v7.0/entities';

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

export class BingEntitySearch {

    public constructor(private options: BingEntitySearchOptions) {
    }

    public search(queryOptions: QueryOptions): Promise<SearchResponse> {
        let headers: any = {
            'Ocp-Apim-Subscription-Key': this.options.subscriptionKey
        };
        headers['X-Search-Location'] = `lat:${queryOptions.latitude || 47.61002};long:${queryOptions.longitude || -122.1879};re:${queryOptions.radius || 22}`;
        return request({
            url: `${serviceEndpoint}?mkt=${queryOptions.mkt || 'en-US'}&q=${queryOptions.q}&responseFilter=${queryOptions.responseFilter || this.options.responseFilter}`,
            method: 'GET',
            headers: headers
        }).then((response) => {
            return JSON.parse(response) as SearchResponse;
        });
    }
}

export interface BingEntitySearchResult {
    searchResponse: SearchResponse;
    searchError: SearchError;
}


/**
 * default search response renderer
 */
function defaultRenderSearchResponse(context: BotContext, matchResults: BingEntitySearchResult) {
    const searchResponse = matchResults.searchResponse;
    if (searchResponse) {
        if (searchResponse.entities && searchResponse.entities.value.length > 0) {
            // send reply as response
            for (let answer of searchResponse.entities.value) {
                let text = '';
                if (answer.name)
                    text += `**${answer.name}**\n\n`;
                if (answer.description)
                    text += `${answer.description}\n\n`;
                if (answer.url)
                    text += `${answer.url}\n\n`;
                if (answer.telephone)
                    text += `${answer.telephone}\n\n`;
                if (text.length > 0)
                    context.reply(text.trim());
            }
        }
        else if (searchResponse.places && searchResponse.places.value.length > 0) {
            // send reply as response
            for (let answer of searchResponse.places.value) {
                let text = '';
                if (answer.name)
                    text += `**${answer.name}**\n\n`;
                if (answer.address.addressLocality) {
                    let neighborhood = ''
                    if (answer.address.neighborhood.length > 0)
                        neighborhood = `(${answer.address.neighborhood})`;
                    text += `${answer.address.addressLocality}${neighborhood}, ${answer.address.addressRegion} ${answer.address.postalCode}\n\n`;
                }
                if (answer.telephone)
                    text += `${answer.telephone}\n\n`;
                if (text.length > 0)
                    context.reply(text.trim());
            }
        } else {
            context.reply("I'm sorry, I didn't find any results.");
        }

    }
    else if (matchResults.searchError) {
        context.reply("I'm sorry, I can't help you because I don't have internet connectivity at the moment.");
    }
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


