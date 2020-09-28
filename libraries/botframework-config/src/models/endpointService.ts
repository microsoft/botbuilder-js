/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IEndpointService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

/**
 * Defines an endpoint service connection.
 */
export class EndpointService extends ConnectedService implements IEndpointService {
    /**
     * MSA App ID.
     */
    public appId: string;

    /**
     * MSA app password for the bot.
     */
    public appPassword: string;

    /**
     * Endpoint of localhost service.
     */
    public endpoint: string;

    /**
     * The channel service (Azure or US Government Azure) for the bot.
     * A value of 'https://botframework.azure.us' means the bot will be talking to a US Government Azure data center.
     * An undefined or null value means the bot will be talking to public Azure
     */
    public channelService: string;

    /**
     * Creates a new EndpointService instance.
     * @param source JSON based service definition.
     */
    constructor(source: IEndpointService) {
        super(source, ServiceTypes.Endpoint);
    }

    /**
     * Encrypt properties on this service.
     * @param secret Secret to use to encrypt.
     * @param encryptString Function called to encrypt an individual value.
     */
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        if (this.appPassword && this.appPassword.length > 0) {
            this.appPassword = encryptString(this.appPassword, secret);
        }
    }

    /**
     * Decrypt properties on this service.
     * @param secret Secret to use to decrypt.
     * @param decryptString Function called to decrypt an individual value.
     */
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        if (this.appPassword && this.appPassword.length > 0) {
            this.appPassword = decryptString(this.appPassword, secret);
        }
    }

}
