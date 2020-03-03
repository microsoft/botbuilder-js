/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import {
    AppInsightsService, BlobStorageService, BotService, ConnectedService, CosmosDbService, DispatchService,
    EndpointService, FileService, GenericService, LuisService, QnaMakerService } from './models';
import { IAppInsightsService, IBlobStorageService, IBotConfiguration, IBotService, IConnectedService,
    ICosmosDBService, IDispatchService, IEndpointService, IFileService, IGenericService, ILuisService,
    IQnAService, ServiceTypes } from './schema';

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export class BotConfigurationBase implements Partial<IBotConfiguration> {

    public name: string = '';
    public description: string = '';
    public services: IConnectedService[] = [];
    public padlock: string = '';
    public version: string = '2.0';

    /**
     * Creates a new BotConfigurationBase instance.
     */
    constructor() {
        // noop
    }

    /**
     * Returns a ConnectedService instance given a JSON based service configuration.
     * @param service JSON based service configuration.
     */
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
                return new ConnectedService(service);
        }
    }

    /**
     * Returns a new BotConfigurationBase instance given a JSON based configuration.
     * @param source JSON based configuration.
     */
    public static fromJSON(source: Partial<IBotConfiguration> = {}): BotConfigurationBase {
        // tslint:disable-next-line:prefer-const
        const services: IConnectedService[] = (source.services) ? source.services.slice().map(BotConfigurationBase.serviceFromJSON) : [];
        const botConfig: BotConfigurationBase = new BotConfigurationBase();
        Object.assign(botConfig, source);
        botConfig.services = services;
        botConfig.migrateData();

        return botConfig;
    }

    /**
     * Returns a JSON based version of the current bot.
     */
    public toJSON(): IBotConfiguration {
        const newConfig: IBotConfiguration = <IBotConfiguration>{};
        Object.assign(newConfig, this);
        delete (<any>newConfig).internal;
        newConfig.services = this.services.slice().map((service: IConnectedService) => (<ConnectedService>service).toJSON());

        return newConfig;
    }

    /**
     * Connect a service to the bot file.
     * @param newService Service to add.
     * @returns Assigned ID for the service.
     */
    public connectService(newService: IConnectedService): string {
        const service: ConnectedService = BotConfigurationBase.serviceFromJSON(newService);

        if (!service.id) {
            let maxValue = 0;
            this.services.forEach((s) => {
                if (parseInt(s.id) > maxValue) {
                    maxValue = parseInt(s.id);
                }
            });

            service.id = (++maxValue).toString();
        }
        else if (this.services.filter(s => s.type === service.type && s.id === service.id).length) {
            throw new Error(`Service with ${ service.id } is already connected`);
        }

        this.services.push(service);

        return service.id;
    }

    /**
     * Find service by id.
     * @param id ID of the service to find.
     */
    public findService(id: string): IConnectedService {
        for (const service of this.services) {
            if (service.id === id) {
                return service;
            }
        }

        return null;
    }

    /**
     * Find service by name or id.
     * @param nameOrId Name or ID of the service to find.
     */
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

    /**
     * Remove service by name or id.
     * @param nameOrId Name or ID of the service to remove.
     */
    public disconnectServiceByNameOrId(nameOrId: string): IConnectedService {
        const { services = [] } = this;
        let i: number = services.length;
        while (i--) {
            const service: IConnectedService = services[i];
            if (service.id === nameOrId || service.name === nameOrId) {
                return services.splice(i, 1)[0];
            }
        }
        throw new Error(`a service with id or name of [${ nameOrId }] was not found`);
    }

    /**
     * Remove service by id.
     * @param nameOrId ID of the service to remove.
     */
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

    /**
     * Migrate old formated data into new format.
     */
    protected migrateData(): void {
        for (const service of this.services) {
            switch (service.type) {
                case ServiceTypes.Bot:
                    {
                        const botService: IBotService = <IBotService>service;

                        // old bot service records may not have the appId on the bot, but we probably have it already on an endpoint
                        if (!botService.appId) {
                            for (const s of this.services) {
                                if (s.type === ServiceTypes.Endpoint) {
                                    const endpoint: IEndpointService = <IEndpointService>s;
                                    if (endpoint.appId) {
                                        botService.appId = endpoint.appId;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    break;

                default:
                    break;
            }
        }

        // this is now a 2.0 version of the schema
        this.version = '2.0';
    }
}
