/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IBotService, ServiceTypes } from '../schema';
import { AzureService } from './azureService';

export class BotService extends AzureService implements IBotService {
    public appId: string;

    constructor(source: IBotService = {} as IBotService) {
        super(source, ServiceTypes.Bot);
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        return;
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        return;
    }
}
