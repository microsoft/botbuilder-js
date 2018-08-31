/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { ServiceTypes } from './schema';

export interface IResource {
    // ServiceType of the service (LUIS, QnA, etc.)
    readonly type: ServiceTypes;

    // unique Id for the service in the bot 
    id?: string;

    // Friendly name for the service
    name: string;

    // Service name for the service
    serviceName: string;

    // path to resource file
    resource?: string;
}


// This is class which allows you to manipulate in memory representations of bot configuration with no nodejs depedencies
export class BotRecipe {
    public version = '1.0';
    public services: IResource[] = [];

    constructor() {
    }

    public static fromJSON(source: Partial<BotRecipe> = {}): BotRecipe {
        let { version = '1.0', services = [] } = source;
        const botRecipe = new BotRecipe();
        Object.assign(botRecipe, { services, version });
        return botRecipe;
    }

    public toJSON(): Partial<BotRecipe> {
        const { version, services } = this;
        return { version, services };
    }

    public async clone(folder: string): Promise<void> {

    }
}

