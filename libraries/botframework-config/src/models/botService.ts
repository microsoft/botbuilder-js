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

    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        return;
    }

    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        return;
    }
}
