/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IBotConfig, IConnectedService } from '../schema';
import { ConnectedService } from './connectedService';
export declare class BotConfigModel implements Partial<IBotConfig> {
    name: string;
    description: string;
    services: IConnectedService[];
    secretKey: string;
    static serviceFromJSON(service: IConnectedService): ConnectedService;
    static fromJSON(source?: Partial<IBotConfig>): BotConfigModel;
    toJSON(): Partial<IBotConfig>;
}
