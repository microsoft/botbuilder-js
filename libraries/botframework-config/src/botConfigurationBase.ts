/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import {
    AppInsightsService, BlobStorageService, BotService, ConnectedService, CosmosDbService,
    DispatchService, EndpointService, FileService, GenericService, LuisService, QnaMakerService
} from './models';
import {
    IAppInsightsService, IBlobStorageService, IBotConfiguration, IBotService, IConnectedService,
    ICosmosDBService, IDispatchService, IEndpointService, IFileService, IGenericService, ILuisService, IQnAService, ServiceTypes
} from './schema';

// This is class which allows you to manipulate in memory representations of bot configuration with no nodejs depedencies
export class BotConfigurationBase implements Partial<IBotConfiguration> {

    public name: string = '';
    public description: string = '';
    public services: IConnectedService[] = [];
    public secretKey: string = '';
    public version: string = '2.0';

    constructor() {
        // noop
    }

    public static serviceFromJSON(service: IConnectedService): ConnectedService {
        switch (service.type) {
            case ServiceTypes.File:
                return new FileService(<IFileService>service);

            case ServiceTypes.QnA:
                return new QnaMakerService(<IQnAService>service);

            case ServiceTypes.Dispatch:
                return new DispatchService(<IDispatchService>service);

            case ServiceTypes.Bot:
                return new BotService(<IBotService>service);

            case ServiceTypes.Luis:
                return new LuisService(<ILuisService>service);

            case ServiceTypes.Endpoint:
                return new EndpointService(<IEndpointService>service);

            case ServiceTypes.AppInsights:
                return new AppInsightsService(<IAppInsightsService>service);

            case ServiceTypes.BlobStorage:
                return new BlobStorageService(<IBlobStorageService>service);

            case ServiceTypes.CosmosDB:
                return new CosmosDbService(<ICosmosDBService>service);

            case ServiceTypes.Generic:
                return new GenericService(<IGenericService>service);

            default:
                throw new TypeError(`${service.type} is not a known service implementation.`);
        }
    }

    public static fromJSON(source: Partial<IBotConfiguration> = {}): BotConfigurationBase {
        // tslint:disable-next-line:prefer-const
        let { name = '', description = '', version = '2.0', secretKey = '', services = [] } = source;
        services = services.slice().map(BotConfigurationBase.serviceFromJSON);
        const botConfig: BotConfigurationBase = new BotConfigurationBase();
        Object.assign(botConfig, { services, description, name, version, secretKey });

        return botConfig;
    }

    public toJSON(): Partial<IBotConfiguration> {
        const { name, description, version, secretKey, services } = this;

        return { name, description, version, secretKey, services };
    }

    // connect to a service
    // returns assignd id for the service
    public connectService(newService: IConnectedService): string {
        const service: ConnectedService = BotConfigurationBase.serviceFromJSON(newService);

        // assign a unique id
        let found: boolean = false;
        do {
            found = false;
            service.id = Math.floor((Math.random() * 255)).toString();
            for (const existingService of this.services) {
                if (existingService.id === service.id) {
                    found = true;
                    break;
                }
            }
        } while (found);

        this.services.push(service);

        return service.id;
    }

    // find a service by id
    public findService(id: string): IConnectedService {
        for (const service of this.services) {
            if (service.id === id) {
                return service;
            }
        }

        return null;
    }

    // find a service by name or id (checks ids first)
    public findServiceByNameOrId(nameOrId: string): IConnectedService {
        for (const service of this.services) {
            if (service.id === nameOrId) {
                return service;
            }
        }

        for (const service of this.services) {
            if (service.name === nameOrId) {
                return service;
            }
        }

        return null;
    }

    // remove service by name or id
    public disconnectServiceByNameOrId(nameOrId: string): IConnectedService {
        const { services = [] } = this;
        let i: number = services.length;
        while (i--) {
            const service: IConnectedService = services[i];
            if (service.id === nameOrId || service.name === nameOrId) {
                return services.splice(i, 1)[0];
            }
        }
        throw new Error(`a service with id or name of [${nameOrId}] was not found`);
    }

    // remove a service
    public disconnectService(id: string): void {
        const { services = [] } = this;
        let i: number = services.length;
        while (i--) {
            const service: IConnectedService = services[i];
            if (service.id === id) {
                services.splice(i, 1);

                return;
            }
        }
    }

}
