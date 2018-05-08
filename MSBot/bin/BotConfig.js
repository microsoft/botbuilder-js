"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const crypto = require("crypto");
const fsx = require("fs-extra");
const linq_collections_1 = require("linq-collections");
const path = require("path");
const process = require("process");
const uuid = require("uuid");
const txtfile = require("read-text-file");
const models_1 = require("./models");
const schema_1 = require("./schema");
class BotConfig extends models_1.BotConfigModel {
    constructor(secret) {
        super();
        // internal is not serialized
        this.internal = {
            secretValidated: false
        };
        this.encryptedProperties = {
            endpoint: ['appPassword'],
            abs: ['appPassword'],
            luis: ['authoringKey', 'subscriptionKey'],
            qna: ['subscriptionKey'],
            dispatch: ['authoringKey', 'subscriptionKey']
        };
        this.internal.secret = secret;
    }
    static async LoadBotFromFolder(folder, secret) {
        let files = linq_collections_1.Enumerable.fromSource(await fsx.readdir(folder || process.cwd()))
            .where(file => path.extname(file) == '.bot');
        if (files.any()) {
            return await BotConfig.Load(files.first(), secret);
        }
        throw new Error(`Error: no bot file found in ${folder}. Choose a different location or use msbot init to create a .bot file."`);
    }
    // load the config file
    static async Load(botpath, secret) {
        let bot = new BotConfig(secret);
        Object.assign(bot, JSON.parse(await txtfile.read(botpath)));
        bot.internal.location = botpath;
        let hasSecret = (secret && bot.secretKey && bot.secretKey.length > 0);
        if (hasSecret)
            bot.decryptAll();
        return bot;
    }
    // save the config file
    async save(botpath) {
        let hasSecret = (this.secretKey && this.secretKey.length > 0);
        // make sure that all dispatch serviceIds still match services that are in the bot
        for (let service of this.services) {
            if (service.type == schema_1.ServiceType.Dispatch) {
                let dispatchService = service;
                dispatchService.serviceIds = linq_collections_1.Enumerable.fromSource(dispatchService.serviceIds)
                    .where(serviceId => linq_collections_1.Enumerable.fromSource(this.services).any(s => s.id == serviceId))
                    .toArray();
            }
        }
        if (hasSecret)
            this.encryptAll();
        await fsx.writeJson(botpath || this.internal.location, {
            name: this.name,
            description: this.description,
            secretKey: this.secretKey,
            services: this.services
        }, { spaces: 4 });
        if (hasSecret)
            this.decryptAll();
    }
    clearSecret() {
        this.validateSecretKey();
        this.secretKey = '';
    }
    // connect to a service
    connectService(newService) {
        if (linq_collections_1.Enumerable.fromSource(this.services)
            .where(s => s.type == newService.type)
            .where(s => s.id == newService.id)
            .any()) {
            throw Error(`service with ${newService.id} already connected`);
        }
        else {
            // give unique name
            let nameCount = 1;
            let name = newService.name;
            while (true) {
                if (nameCount > 1) {
                    name = `${newService.name} (${nameCount})`;
                }
                if (!linq_collections_1.Enumerable.fromSource(this.services).where(s => s.name == name).any())
                    break;
                nameCount++;
            }
            newService.name = name;
            this.services.push(models_1.BotConfigModel.serviceFromJSON(newService));
        }
    }
    // encrypt all values in the config
    encryptAll() {
        for (let service of this.services) {
            this.encryptService(service);
        }
    }
    // decrypt all values in the config
    decryptAll() {
        for (let service of this.services) {
            this.decryptService(service);
        }
    }
    // encrypt just a service
    encryptService(service) {
        let encryptedProperties = this.getEncryptedProperties(service.type);
        for (let i = 0; i < encryptedProperties.length; i++) {
            let prop = encryptedProperties[i];
            let val = service[prop];
            service[prop] = this.encryptValue(val);
        }
        return service;
    }
    // decrypt just a service
    decryptService(service) {
        let encryptedProperties = this.getEncryptedProperties(service.type);
        for (let i = 0; i < encryptedProperties.length; i++) {
            let prop = encryptedProperties[i];
            let val = service[prop];
            service[prop] = this.decryptValue(val);
        }
        return service;
    }
    // remove service by name or id
    disconnectServiceByNameOrId(nameOrId) {
        let svs = new linq_collections_1.List(this.services);
        for (let i = 0; i < svs.count(); i++) {
            let service = svs.elementAt(i);
            if (service.id == nameOrId || service.name == nameOrId) {
                svs.removeAt(i);
                this.services = svs.toArray();
                return service;
            }
        }
        throw new Error(`a service with id or name of [${nameOrId}] was not found`);
    }
    // remove a service
    disconnectService(type, id) {
        let svs = new linq_collections_1.List(this.services);
        for (let i = 0; i < svs.count(); i++) {
            let service = svs.elementAt(i);
            if (service.type == type && service.id == id) {
                svs.removeAt(i);
                this.services = svs.toArray();
                return;
            }
        }
    }
    encryptValue(value) {
        if (!value || value.length == 0)
            return value;
        if (this.secretKey.length > 0) {
            this.validateSecretKey();
            return this.internalEncrypt(value);
        }
        return value;
    }
    decryptValue(encryptedValue) {
        if (!encryptedValue || encryptedValue.length == 0)
            return encryptedValue;
        if (this.secretKey.length > 0) {
            this.validateSecretKey();
            return this.internalDecrypt(encryptedValue);
        }
        return encryptedValue;
    }
    // make sure secret is correct by decrypting the secretKey with it
    validateSecretKey() {
        if (this.internal.secretValidated) {
            return;
        }
        if (!this.internal.secret || this.internal.secret.length == 0) {
            throw new Error('You are attempting to perform an operation which needs access to the secret and --secret is missing');
        }
        try {
            if (!this.secretKey || this.secretKey.length == 0) {
                // if no key, create a guid and enrypt that to use as secret validator
                this.secretKey = this.internalEncrypt(uuid());
            }
            else {
                const decipher = crypto.createDecipher('aes192', this.internal.secret);
                let value = decipher.update(this.secretKey, 'hex', 'utf8');
                value += decipher.final('utf8');
            }
            this.internal.secretValidated = true;
        }
        catch (_a) {
            throw new Error('You are attempting to perform an operation which needs access to the secret and --secret is incorrect.');
        }
    }
    internalEncrypt(value) {
        const cipher = crypto.createCipher('aes192', this.internal.secret);
        let encryptedValue = cipher.update(value, 'utf8', 'hex');
        encryptedValue += cipher.final('hex');
        return encryptedValue;
    }
    internalDecrypt(encryptedValue) {
        const decipher = crypto.createDecipher('aes192', this.internal.secret);
        let value = decipher.update(encryptedValue, 'hex', 'utf8');
        value += decipher.final('utf8');
        return value;
    }
    getEncryptedProperties(type) {
        return this.encryptedProperties[type];
    }
}
exports.BotConfig = BotConfig;
//# sourceMappingURL=BotConfig.js.map