"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const azureBotService_1 = require("./azureBotService");
const connectedService_1 = require("./connectedService");
const dispatchService_1 = require("./dispatchService");
const endpointService_1 = require("./endpointService");
const fileService_1 = require("./fileService");
const luisService_1 = require("./luisService");
const qnaMakerService_1 = require("./qnaMakerService");
class BotConfigModel {
    constructor() {
        this.name = '';
        this.description = '';
        this.services = new ServicesCollection();
        this.secretKey = '';
    }
    static serviceFromJSON(service) {
        switch (service.type) {
            case schema_1.ServiceType.File:
                return new fileService_1.FileService(service);
            case schema_1.ServiceType.QnA:
                return new qnaMakerService_1.QnaMakerService(service);
            case schema_1.ServiceType.Dispatch:
                return new dispatchService_1.DispatchService(service);
            case schema_1.ServiceType.AzureBotService:
                return new azureBotService_1.AzureBotService(service);
            case schema_1.ServiceType.Luis:
                return new luisService_1.LuisService(service);
            case schema_1.ServiceType.Endpoint:
                return new endpointService_1.EndpointService(service);
            default:
                throw new TypeError(`${service.type} is not a known service implementation.`);
        }
    }
    static fromJSON(source = {}) {
        let { name = '', description = '', secretKey = '', services = [] } = source;
        services = services.slice().map(BotConfigModel.serviceFromJSON);
        const botConfig = new BotConfigModel();
        Object.assign(botConfig, { services: new ServicesCollection(services), description, name, secretKey });
        return botConfig;
    }
    toJSON() {
        const { name, description, services, secretKey } = this;
        return { name, description, services, secretKey };
    }
}
exports.BotConfigModel = BotConfigModel;
/**
 * Typed collection implementation in JS woot!
 */
class ServicesCollection extends Array {
    constructor(source) {
        super();
        if (source) {
            this.push(...source);
        }
        return new Proxy(this, this);
    }
    static get [Symbol.species]() {
        return Array;
    }
    set(target, prop, value, receiver) {
        if (prop !== 'length' && !(value instanceof connectedService_1.ConnectedService)) {
            throw new TypeError(`${Object.prototype.toString.call(value)} does not extend ConnectedService`);
        }
        return target[prop] = value;
    }
}
exports.ServicesCollection = ServicesCollection;
//# sourceMappingURL=botConfigModel.js.map