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
const url = require("url");
const validurl = require("valid-url");
const path = require("path");
const fsx = require("fs-extra");
const linq_collections_1 = require("linq-collections");
var ServiceType;
(function (ServiceType) {
    ServiceType["Luis"] = "luis";
    ServiceType["QnA"] = "qna";
})(ServiceType = exports.ServiceType || (exports.ServiceType = {}));
class BotConfig {
    constructor() {
        this.id = '';
        this.appid = '';
        this.name = '';
        this.description = '';
        this.endpoints = [];
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
                id: this.id,
                name: this.name,
                description: this.description,
                appid: this.appid,
                endpoints: this.endpoints,
                services: this.services
            }, { spaces: 4 });
        });
    }
    addService(newService) {
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
    removeServiceByNameOrId(nameOrId) {
        let svs = new linq_collections_1.List(this.services);
        for (let i = 0; i < svs.count(); i++) {
            let service = svs.elementAt(i);
            if (service.id == nameOrId || service.name == nameOrId) {
                svs.removeAt(i);
                this.services = svs.toArray();
                return;
            }
        }
        throw new Error(`a service with id or name of ${nameOrId} was not found`);
    }
    removeService(type, id) {
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
    addEndpoint(endpointUrl, name) {
        let endpoints = new linq_collections_1.List(this.endpoints);
        if (endpoints.where(ep => ep.url == endpointUrl).any()) {
            // already in there
            return;
        }
        if (!validurl.isWebUri(endpointUrl)) {
            throw new Error(`${endpointUrl} is not a valid url`);
        }
        let endpoint = {
            name: name || url.parse(endpointUrl).hostname || endpointUrl,
            url: endpointUrl
        };
        this.endpoints.push(endpoint);
    }
    removeEndpoint(nameOrUrl) {
        let eps = new linq_collections_1.List(this.endpoints);
        for (let i = 0; i < this.endpoints.length; i++) {
            let endpoint = eps.elementAt(i);
            if (endpoint.name == nameOrUrl || endpoint.url == nameOrUrl) {
                eps.removeAt(i);
                this.endpoints = eps.toArray();
                return;
            }
        }
    }
}
exports.BotConfig = BotConfig;
//# sourceMappingURL=BotConfig.js.map