"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const crypto = require("crypto");
const fsx = require("fs-extra");
const path = require("path");
const process = require("process");
const txtfile = require("read-text-file");
const uuid = require("uuid");
const encrypt = require("./encrypt");
const models_1 = require("./models");
const appInsightsService_1 = require("./models/appInsightsService");
const azureStorageService_1 = require("./models/azureStorageService");
const schema_1 = require("./schema");
class BotConfiguration {
    constructor() {
        // internal is not serialized
        this.internal = {};
        this.name = '';
        this.description = '';
        this.services = [];
        this.secretKey = '';
    }
    static fromJSON(source = {}) {
        let { name = '', description = '', secretKey = '', services = [] } = source;
        services = services.slice().map(BotConfiguration.serviceFromJSON);
        const botConfig = new BotConfiguration();
        Object.assign(botConfig, { services, description, name, secretKey });
        return botConfig;
    }
    toJSON() {
        const { name, description, services, secretKey } = this;
        return { name, description, services, secretKey };
    }
    static loadBotFromFolder(folder, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            let files = yield fsx.readdir(folder || process.cwd());
            for (var file in files) {
                if (path.extname(file) == '.bot') {
                    return yield BotConfiguration.load(file, secret);
                }
            }
            throw new Error(`Error: no bot file found in ${folder}. Choose a different location or use msbot init to create a .bot file."`);
        });
    }
    // load the config file
    static load(botpath, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            let bot = BotConfiguration.fromJSON(JSON.parse(yield txtfile.read(botpath)));
            bot.internal.location = botpath;
            let hasSecret = !!bot.secretKey;
            if (hasSecret)
                bot.decrypt(secret);
            return bot;
        });
    }
    // save the config file
    save(botpath, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!secret) {
                this.validateSecretKey(secret);
            }
            let hasSecret = !!this.secretKey;
            // make sure that all dispatch serviceIds still match services that are in the bot
            for (let service of this.services) {
                if (service.type == schema_1.ServiceTypes.Dispatch) {
                    let dispatchService = service;
                    let validServices = [];
                    for (let dispatchServiceId of dispatchService.serviceIds) {
                        for (let service of this.services) {
                            if (service.id == dispatchServiceId) {
                                validServices.push(dispatchServiceId);
                            }
                        }
                    }
                    dispatchService.serviceIds = validServices;
                }
            }
            if (hasSecret)
                this.encrypt(secret);
            yield fsx.writeJson(botpath || this.internal.location, this.toJSON(), { spaces: 4 });
            if (hasSecret)
                this.decrypt(secret);
        });
    }
    clearSecret() {
        this.secretKey = '';
    }
    // connect to a service
    connectService(newService) {
        for (let service of this.services) {
            if (service.type == newService.type && service.id == newService.id)
                throw Error(`service with ${newService.id} already connected`);
        }
        // give unique name
        let nameCount = 1;
        let name = newService.name;
        while (true) {
            if (nameCount > 1) {
                name = `${newService.name} (${nameCount})`;
            }
            let conflict = false;
            for (let service of this.services) {
                if (service.name == name) {
                    conflict = true;
                    break;
                }
            }
            if (!conflict)
                break;
            nameCount++;
        }
        newService.name = name;
        this.services.push(BotConfiguration.serviceFromJSON(newService));
    }
    // Generate a key for encryption
    static generateKey() {
        return encrypt.generateKey();
    }
    // encrypt all values in the config
    encrypt(secret) {
        this.validateSecretKey(secret);
        for (let service of this.services) {
            service.encrypt(secret);
        }
    }
    // decrypt all values in the config
    decrypt(secret) {
        try {
            this.validateSecretKey(secret);
            for (let service of this.services) {
                service.decrypt(secret);
            }
        }
        catch (err) {
            try {
                // legacy decryption
                this.secretKey = this.legacyDecrypt(this.secretKey, secret);
                this.secretKey = "";
                let encryptedProperties = {
                    abs: [],
                    endpoint: ['appPassword'],
                    luis: ['authoringKey', 'subscriptionKey'],
                    dispatch: ['authoringKey', 'subscriptionKey'],
                    file: [],
                    qna: ['subscriptionKey']
                };
                for (var service of this.services) {
                    for (let i = 0; i < encryptedProperties[service.type].length; i++) {
                        let prop = encryptedProperties[service.type][i];
                        let val = service[prop];
                        service[prop] = this.legacyDecrypt(val, secret);
                    }
                }
            }
            catch (err2) {
                throw err;
            }
            return service;
        }
    }
    // remove service by name or id
    disconnectServiceByNameOrId(nameOrId) {
        const { services = [] } = this;
        let i = services.length;
        while (i--) {
            const service = services[i];
            if (service.id == nameOrId || service.name == nameOrId) {
                return services.splice(i, 1)[0];
            }
        }
        throw new Error(`a service with id or name of [${nameOrId}] was not found`);
    }
    // remove a service
    disconnectService(type, id) {
        const { services = [] } = this;
        let i = services.length;
        while (i--) {
            const service = services[i];
            if (service.id == id) {
                services.splice(i, 1)[0];
                return;
            }
        }
    }
    // make sure secret is correct by decrypting the secretKey with it
    validateSecretKey(secret) {
        if (!secret) {
            throw new Error('You are attempting to perform an operation which needs access to the secret and --secret is missing');
        }
        try {
            if (!this.secretKey || this.secretKey.length == 0) {
                // if no key, create a guid and enrypt that to use as secret validator
                this.secretKey = encrypt.encryptString(uuid(), secret);
            }
            else {
                // validate we can decrypt the secretKey, this tells us we have the correct secret for the rest of the file.
                encrypt.decryptString(this.secretKey, secret);
            }
        }
        catch (_a) {
            throw new Error('You are attempting to perform an operation which needs access to the secret and --secret is incorrect.');
        }
    }
    legacyDecrypt(encryptedValue, secret) {
        // LEGACY for pre standardized SHA256 encryption, this uses some undocumented nodejs MD5 hash internally and is deprecated
        const decipher = crypto.createDecipher('aes192', secret);
        let value = decipher.update(encryptedValue, 'hex', 'utf8');
        value += decipher.final('utf8');
        return value;
    }
    static serviceFromJSON(service) {
        switch (service.type) {
            case schema_1.ServiceTypes.File:
                return new models_1.FileService(service);
            case schema_1.ServiceTypes.QnA:
                return new models_1.QnaMakerService(service);
            case schema_1.ServiceTypes.Dispatch:
                return new models_1.DispatchService(service);
            case schema_1.ServiceTypes.AzureBot:
                return new models_1.AzureBotService(service);
            case schema_1.ServiceTypes.Luis:
                return new models_1.LuisService(service);
            case schema_1.ServiceTypes.Endpoint:
                return new models_1.EndpointService(service);
            case schema_1.ServiceTypes.AppInsights:
                return new appInsightsService_1.AppInsightsService(service);
            case schema_1.ServiceTypes.AzureStorage:
                return new azureStorageService_1.AzureStorageService(service);
            default:
                throw new TypeError(`${service.type} is not a known service implementation.`);
        }
    }
}
exports.BotConfiguration = BotConfiguration;
//# sourceMappingURL=botConfiguration.js.map