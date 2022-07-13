/**
 * @module botframework-config
 *
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { ServiceTypes } from './schema';

/**
 * @private
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IResource {
    // ServiceType of the service (LUIS, QnA, etc.)
    readonly type: ServiceTypes;

    // unique Id for the service in the bot
    id?: string;

    // Friendly name for the service
    name: string;
}

/**
 * @private
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IUrlResource extends IResource {
    url: string;
}

/**
 * @private
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IDispatchResource extends IResource {
    serviceIds: string[];
}

/**
 * @private
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IBlobResource extends IResource {
    container: string;
}

/**
 * @private
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface ICosmosDBResource extends IResource {
    database: string;
    collection: string;
}

/**
 * @private
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IFileResource extends IResource {
    path: string;
}

/**
 * @private
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export interface IGenericResource extends IUrlResource {
    configuration: { [key: string]: string };
}

/**
 * @private
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 * This is class which allows you to manipulate in memory representations of bot configuration
 * with no nodejs depedencies.
 */
export class BotRecipe {
    /**
     * Version of the recipe.
     */
    version = '1.0';

    /**
     *
     */
    resources: IResource[] = [];

    /**
     * Creates a new BotRecipe instance.
     */
    constructor() {
        // noop
    }

    /**
     * Creates a new [BotRecipe](xref:botframework-config.BotRecipe) instance from a JSON object.
     *
     * @param source JSON object of [BotRecipe](xref:botframework-config.BotRecipe) type.
     * @returns A new [BotRecipe](xref:botframework-config.BotRecipe) instance.
     */
    static fromJSON(source: Partial<BotRecipe> = {}): BotRecipe {
        const botRecipe: BotRecipe = new BotRecipe();
        const { version, resources } = source;
        botRecipe.resources = resources ? resources : botRecipe.resources;
        botRecipe.version = version ? version : botRecipe.version;

        return botRecipe;
    }

    /**
     * Creates a JSON object from `this` class instance.
     *
     * @returns A JSON object of [BotRecipe](xref:botframework-config.BotRecipe) type;
     */
    toJSON(): Partial<BotRecipe> {
        const { version, resources } = this;

        return { version, resources };
    }
}
