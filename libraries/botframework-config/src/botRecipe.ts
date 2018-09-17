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
}

export interface IUrlResource extends IResource {
    url: string;
}

export interface IDispatchResource extends IResource {
    serviceIds: string[];
}

export interface IBlobResource extends IResource {
    container: string;
}

export interface ICosmosDBResource extends IResource {
    database: string;
    collection: string;
}

export interface IFileResource extends IResource {
    path: string;
}

export interface IGenericResource extends IUrlResource {
    configuration: { [key: string]: string };
}

// This is class which allows you to manipulate in memory representations of bot configuration with no nodejs depedencies
export class BotRecipe {
    public version = '1.0';
    public resources: IResource[] = [];

    constructor() {
    }

    public static fromJSON(source: Partial<BotRecipe> = {}): BotRecipe {
        const botRecipe = new BotRecipe();
        let { version, resources  } = source;
        Object.assign(botRecipe, { resources, version });
        return botRecipe;
    }

    public toJSON(): Partial<BotRecipe> {
        const { version, resources } = this;
        return { version, resources };
    }
}

