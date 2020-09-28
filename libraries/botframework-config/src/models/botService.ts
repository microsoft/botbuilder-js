/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IBotService, ServiceTypes } from '../schema';
import { AzureService } from './azureService';

/**
 * Defines an Azure Bot Service connection.
 */
export class BotService extends AzureService implements IBotService {
    /**
     * MSA App ID for the bot.
     */
    public appId: string;

    /**
     * Creates a new BotService instance.
     * @param source (Optional) JSON based service definition.
     */
    constructor(source: IBotService = {} as IBotService) {
        super(source, ServiceTypes.Bot);
    }

    /**
     * Encrypt properties on this service.
     * @param secret Secret to use to encrypt.
     * @param encryptString Function called to encrypt an individual value.
     */
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        return;
    }

    /**
     * Decrypt properties on this service.
     * @param secret Secret to use to decrypt.
     * @param decryptString Function called to decrypt an individual value.
     */
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        return;
    }
}
