"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process = require("process");
const uuid = require("uuid");
const crypto = require("crypto");
const path = require("path");
const fsx = require("fs-extra");
const linq_collections_1 = require("linq-collections");
var ServiceType;
(function (ServiceType) {
    ServiceType["Endpoint"] = "endpoint";
    ServiceType["AzureBotService"] = "abs";
    ServiceType["Luis"] = "luis";
    ServiceType["QnA"] = "qna";
    ServiceType["Dispatch"] = "dispatch";
})(ServiceType = exports.ServiceType || (exports.ServiceType = {}));
class BotConfig {
    constructor(secret) {
        // internal is not serialized
        this.internal = {
            secretValidated: false
        };
        this.name = '';
        this.secretKey = '';
        this.description = '';
        this.services = [];
        this.internal.secret = secret;
    }
    static async LoadBotFromFolder(folder, secret) {
        let files = linq_collections_1.Enumerable.fromSource(await fsx.readdir(folder || process.cwd()))
            .where(file => path.extname(file) == '.bot');
        if (files.any()) {
            return await BotConfig.Load(files.first(), secret);
        }
        throw new Error(`no bot file found in ${folder}`);
    }
    // load the config file
    static async Load(botpath, secret) {
        let bot = new BotConfig(secret);
        Object.assign(bot, await fsx.readJson(botpath));
        bot.internal.location = botpath;
        return bot;
    }
    // save the config file
    async Save(botpath) {
        await fsx.writeJson(botpath || this.internal.location, {
            name: this.name,
            description: this.description,
            secretKey: this.secretKey,
            services: this.services
        }, { spaces: 4 });
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
            this.services.push(newService);
        }
    }
    // remove service by name or id
    disconnectServiceByNameOrId(nameOrId) {
        let svs = new linq_collections_1.List(this.services);
        for (let i = 0; i < svs.count(); i++) {
            let service = svs.elementAt(i);
            if (service.id == nameOrId || service.name == nameOrId) {
                svs.removeAt(i);
                this.services = svs.toArray();
                return;
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
        this.validateSecretKey();
        return this.internalEncrypt(value);
    }
    decryptValue(encryptedValue) {
        if (!encryptedValue || encryptedValue.length == 0)
            return encryptedValue;
        this.validateSecretKey();
        return this.internalDecrypt(encryptedValue);
    }
    // make sure secret is correct by decrypting the secretKey with it
    validateSecretKey() {
        try {
            if (this.internal.secretValidated)
                return;
            if (!this.internal.secret || this.internal.secret.length == 0) {
                throw new Error("bad or missing secret");
            }
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
            throw new Error("You are attempting to perform an operation which needs access to the secret and --secret is not set or is incorrect.");
        }
    }
    internalEncrypt(value) {
        var cipher = crypto.createCipher('aes192', this.internal.secret);
        var encryptedValue = cipher.update(value, 'utf8', 'hex');
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
        switch (type) {
            case ServiceType.AzureBotService:
                return ["appPassword"];
            case ServiceType.Endpoint:
                return ["appPassword"];
            case ServiceType.Luis:
                return ["subscriptionKey", "authoringKey"];
            case ServiceType.QnA:
                return ["subscriptionKey"];
        }
        return [];
    }
}
exports.BotConfig = BotConfig;
//# sourceMappingURL=BotConfig.js.map