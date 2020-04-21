/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { ILuisService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

/**
 * Defines a LUIS service connection.
 */
export class LuisService extends ConnectedService implements ILuisService {
    /**
     * Luis app ID.
     */
    public appId: string;

    /**
     * Authoring key for using authoring api.
     */
    public authoringKey: string;

    /**
     * Subscription key for using calling model api for predictions.
     */
    public subscriptionKey: string;

    /**
     * Version of the application.
     */
    public version: string ;

    /**
     * Region for luis.
     */
    public region: string ;

    /**
     * URL for a custom endpoint. This should only be used when the LUIS deployed via a container.
     * If a value is set, then the GetEndpoint() method will return the value for Custom Endpoint.
     */
    public customEndpoint: string ;

    /**
     * Creates a new LuisService instance.
     * @param source (Optional) JSON based service definition.
     * @param type (Optional) type of service being defined.
     */
    constructor(source: ILuisService = {} as ILuisService, serviceType?: ServiceTypes) {
        super(source, serviceType || ServiceTypes.Luis);
    }

    /** 
     * Get endpoint for the luis service. If a customEndpoint is set then this is returned
     * otherwise the endpoint is automatically generated based on the region set.
     */
    public getEndpoint(): string {
        // If a custom endpoint has been supplied, then we should return this instead of
        // generating an endpoint based on the region.
        if(this.customEndpoint)
        {
            return this.customEndpoint;
        }

        let reg  = this.region.toLowerCase(); 

        // usgovvirginia is that actual azure region name, but the cognitive service team called their endpoint 'virginia' instead of 'usgovvirginia'
        // We handle both region names as an alias for virginia.api.cognitive.microsoft.us
        if (reg === 'virginia' || reg === 'usgovvirginia') 
        { 
            return `https://virginia.api.cognitive.microsoft.us`; 
        } 
        // regardless, if it starts with usgov or usdod then it is us TLD (ex: api.cognitive.microsoft.us )
        else if (reg.startsWith('usgov') || reg.startsWith('usdod')) 
        { 
            return `https://${ this.region }.api.cognitive.microsoft.us`; 
        } 
 
        return `https://${ this.region }.api.cognitive.microsoft.com`;     
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        if (this.authoringKey && this.authoringKey.length > 0) {
            this.authoringKey = encryptString(this.authoringKey, secret);
        }
        if (this.subscriptionKey && this.subscriptionKey.length > 0) {
            this.subscriptionKey = encryptString(this.subscriptionKey, secret);
        }
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        if (this.authoringKey && this.authoringKey.length > 0) {
            this.authoringKey = decryptString(this.authoringKey, secret);
        }
        if (this.subscriptionKey && this.subscriptionKey.length > 0) {
            this.subscriptionKey = decryptString(this.subscriptionKey, secret);
        }
    }

}
