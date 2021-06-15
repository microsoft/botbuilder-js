"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggers = exports.makeTriggers = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const t = __importStar(require("runtypes"));
const fs_1 = __importDefault(require("fs"));
const mime_1 = __importDefault(require("mime"));
const path_1 = __importDefault(require("path"));
const botbuilder_dialogs_adaptive_runtime_1 = require("botbuilder-dialogs-adaptive-runtime");
const TypedOptions = t.Record({
    /**
     * Log errors to stderr
     */
    logErrors: t.Boolean,
    /**
     * Path inside applicationRoot that should be served as static files
     */
    staticDirectory: t.String.withConstraint((str) => str.length > 0 || 'must be non-empty string'),
});
const defaultOptions = {
    logErrors: true,
    staticDirectory: 'wwwroot',
};
// helper function to memoize the result of `func`
function memoize(func) {
    let result;
    return () => {
        result !== null && result !== void 0 ? result : (result = func());
        return result;
    };
}
// Content type overrides for specific file extensions
const extensionContentTypes = {
    '.lu': 'vnd.application/lu',
    '.qna': 'vnd.application/qna',
};
/**
 * Create azure function triggers using the azure restify integration.
 *
 * @param runtimeServices result of calling `once(() => getRuntimeServices(...))`
 * @param applicationRoot application root directory
 * @param options options bag for configuring Azure Functions
 * @returns azure function triggers for `module.exports`
 */
function makeTriggers(runtimeServices, applicationRoot, options = {}) {
    const resolvedOptions = TypedOptions.check(Object.assign({}, defaultOptions, options));
    const build = memoize(() => __awaiter(this, void 0, void 0, function* () {
        const [services, configuration] = yield runtimeServices();
        const instances = services.mustMakeInstances('adapter', 'bot', 'channelServiceHandler', 'customAdapters');
        return { configuration, instances };
    }));
    const staticDirectory = path_1.default.join(applicationRoot, resolvedOptions.staticDirectory);
    return {
        messageTrigger: (context, req) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            context.log('Messages endpoint triggered.');
            const res = context.res;
            try {
                const route = context.bindingData.route;
                const { configuration, instances: { adapter, bot, customAdapters }, } = yield build();
                const defaultAdapterKey = '_defaultAdapter';
                customAdapters.set(defaultAdapterKey, adapter);
                const adapterSettings = (_a = configuration.type(['runtimeSettings', 'adapters'], t.Array(t.Record({
                    name: t.String,
                    enabled: t.Union(t.Boolean, t.Undefined),
                    route: t.String,
                })))) !== null && _a !== void 0 ? _a : [];
                const adapterSetting = adapterSettings
                    .concat({ name: defaultAdapterKey, enabled: true, route: 'messages' })
                    .filter((settings) => settings.enabled)
                    .find((settings) => settings.route === route);
                if (!adapterSetting) {
                    res.status(404);
                    res.end();
                    return;
                }
                const resolvedAdapter = customAdapters.get(adapterSetting.name);
                if (!resolvedAdapter) {
                    res.status(404);
                    res.end();
                    return;
                }
                yield resolvedAdapter.processActivity(req, res, (turnContext) => __awaiter(this, void 0, void 0, function* () {
                    yield bot.run(turnContext);
                }));
            }
            catch (err) {
                if (resolvedOptions.logErrors) {
                    context.log.error(err);
                }
                throw err;
            }
        }),
        skillsTrigger: (context, req) => __awaiter(this, void 0, void 0, function* () {
            context.log('Skill replyToActivity endpoint triggered.');
            try {
                const { instances: { channelServiceHandler: skillHandler }, } = yield build();
                const conversationId = context.bindingData.conversationId;
                const activityId = context.bindingData.activityId;
                const authHeader = req.headers.authorization || req.headers.Authorization || '';
                const activity = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
                const result = yield skillHandler.handleReplyToActivity(authHeader, conversationId, activityId, activity);
                const res = context.res;
                res.status(200);
                res.send(result);
                res.end();
            }
            catch (err) {
                if (resolvedOptions.logErrors) {
                    context.log.error(err);
                }
                throw err;
            }
        }),
        staticTrigger: (context) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            context.log('Static endpoint triggered.');
            const res = context.res;
            const filePath = context.bindingData.path;
            if (typeof filePath !== 'string') {
                return res.status(404).end();
            }
            const contentType = (_b = extensionContentTypes[path_1.default.extname(filePath)]) !== null && _b !== void 0 ? _b : mime_1.default.getType(filePath);
            if (!contentType) {
                return res.status(404).end();
            }
            try {
                const contents = yield new Promise((resolve, reject) => 
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                fs_1.default.readFile(path_1.default.join(staticDirectory, filePath), 'utf8', (err, contents) => err ? reject(err) : resolve(contents)));
                res.status(200);
                res.set('Content-Type', contentType);
                res.end(contents);
            }
            catch (err) {
                if (err.message.includes('ENOENT')) {
                    return res.status(404).end();
                }
                if (resolvedOptions.logErrors) {
                    context.log.error(err);
                }
                throw err;
            }
        }),
    };
}
exports.makeTriggers = makeTriggers;
/**
 * Create azure function triggers using the azure restify integration.
 *
 * @param applicationRoot application root directory
 * @param settingsDirectory settings directory
 * @param options options bag for configuring Azure Functions
 * @returns azure function triggers for `module.exports`
 */
function triggers(applicationRoot, settingsDirectory, options = {}) {
    return makeTriggers(memoize(() => botbuilder_dialogs_adaptive_runtime_1.getRuntimeServices(applicationRoot, settingsDirectory)), applicationRoot, options);
}
exports.triggers = triggers;
//# sourceMappingURL=index.js.map