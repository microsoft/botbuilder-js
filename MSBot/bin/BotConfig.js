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
const process = require("process");
const crypto = require("crypto");
const path = require("path");
const fsx = require("fs-extra");
const linq_collections_1 = require("linq-collections");
var ServiceType;
(function (ServiceType) {
    ServiceType["Localhost"] = "localhost";
    ServiceType["AzureBotService"] = "abs";
    ServiceType["Luis"] = "luis";
    ServiceType["QnA"] = "qna";
})(ServiceType = exports.ServiceType || (exports.ServiceType = {}));
class BotConfig {
    constructor() {
        this.name = '';
        this.description = '';
        this.services = [];
    }
    static LoadBotFromFolder(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            let files = linq_collections_1.Enumerable.fromSource(yield fsx.readdir(folder || process.cwd()))
                .where(file => path.extname(file) == '.bot');
            if (files.any()) {
                return yield BotConfig.Load(files.first());
            }
            throw new Error(`no bot file found in ${folder}`);
        });
    }
    // load the config file
    static Load(botpath) {
        return __awaiter(this, void 0, void 0, function* () {
            let bot = new BotConfig();
            Object.assign(bot, yield fsx.readJson(botpath));
            bot.location = botpath;
            return bot;
        });
    }
    // save the config file
    Save(botpath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fsx.writeJson(botpath || this.location, {
                name: this.name,
                description: this.description,
                services: this.services
            }, { spaces: 4 });
        });
    }
    // connect to a service
    connectService(newService) {
        if (linq_collections_1.Enumerable.fromSource(this.services)
            .where(s => s.type == newService.type)
            .where(s => s.id == newService.id)
            .any()) {
            throw Error(`Azure Bot Service with appid:${newService.id} already connected`);
        }
        else {
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
        if (!value)
            return value;
        if (!this.cryptoPassword || this.cryptoPassword.length == 0) {
            throw new Error("You are attempting to store a value which needs to be encrypted and --secret is not set.  Pass --secret to encrypt/decrypt resource keys.");
        }
        var cipher = crypto.createCipher('aes192', this.cryptoPassword);
        var encryptedValue = cipher.update(value, 'utf8', 'hex');
        encryptedValue += cipher.final('hex');
        return `${BotConfig.boundary}${encryptedValue}${BotConfig.boundary}`;
    }
    decryptValue(encryptedValue) {
        if (!this.cryptoPassword || this.cryptoPassword.length == 0) {
            throw new Error("No password is set");
        }
        if (encryptedValue.startsWith(BotConfig.boundary) && encryptedValue.endsWith(BotConfig.boundary)) {
            const decipher = crypto.createDecipher('aes192', this.cryptoPassword);
            let value = decipher.update(encryptedValue.substring(3, encryptedValue.length - 3), 'hex', 'utf8');
            value += decipher.final('utf8');
            return value;
        }
        return encryptedValue;
    }
}
BotConfig.boundary = '~^~';
exports.BotConfig = BotConfig;
//# sourceMappingURL=BotConfig.js.map