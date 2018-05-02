/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAzureBotService, IBotConfig, IConnectedService, IDispatchService, IEndpointService, IFileService, ILuisService, IQnAService, ServiceType } from '../schema';
import { AzureBotService } from './azureBotService';
import { ConnectedService } from './connectedService';
import { DispatchService } from './dispatchService';
import { EndpointService } from './endpointService';
import { FileService } from './fileService';
import { LuisService } from './luisService';
import { QnaMakerService } from './qnaMakerService';

export class BotConfigModel implements Partial<IBotConfig> {
    public name: string = '';
    public description: string = '';
    public services: IConnectedService[] = [];
    public secretKey = '';

    public static serviceFromJSON(service: IConnectedService): ConnectedService {
        switch (service.type) {
            case ServiceType.File:
                return new FileService(<IFileService>service);

            case ServiceType.QnA:
                return new QnaMakerService(<IQnAService>service);

            case ServiceType.Dispatch:
                return new DispatchService(<IDispatchService>service);

            case ServiceType.AzureBotService:
                return new AzureBotService(<IAzureBotService>service);

            case ServiceType.Luis:
                return new LuisService(<ILuisService>service);

            case ServiceType.Endpoint:
                return new EndpointService(<IEndpointService>service);

            default:
                throw new TypeError(`${service.type} is not a known service implementation.`);
        }
    }

    public static fromJSON(source: Partial<IBotConfig> = {}): BotConfigModel {
        let { name = '', description = '', secretKey = '', services = [] } = source;
        services = services.slice().map(BotConfigModel.serviceFromJSON);
        const botConfig = new BotConfigModel();
        Object.assign(botConfig, { services, description, name, secretKey });
        return botConfig;
    }

    public toJSON(): Partial<IBotConfig> {
        const { name, description, services, secretKey } = this;
        return { name, description, services, secretKey };
    }
}

