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
const botbuilder_schema_1 = require("botbuilder-schema");
class TemplateManager {
    constructor() {
        this.templateRenderers = [];
        this.languageFallback = [];
    }
    contextCreated(context, next) {
        context.templateManager = this;
        return next();
    }
    postActivity(context, activities, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure activities are well formed.
            for (let i = 0; i < activities.length; i++) {
                let activity = activities[i];
                if (activity.type == "template") {
                    yield this.bindActivityTemplate(context, activity);
                }
            }
            return next();
        });
    }
    /**
     * register template renderer
     * @param renderer
     */
    register(renderer) {
        this.templateRenderers.push(renderer);
        return this;
    }
    /**
     * list of registered template renderers
     */
    list() {
        return this.templateRenderers;
    }
    /**
     * SetLanguagePolicy allows you to set the fallback strategy
     * @param fallback array of languages to try when binding templates
     */
    setLanguagePolicy(fallback) {
        this.languageFallback = fallback;
    }
    /**
     * Get the current language fallback policy
     */
    getLanguagePolicy() {
        return this.languageFallback;
    }
    findAndApplyTemplate(context, language, templateId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var renderer of this.templateRenderers) {
                let templateOutput = yield renderer.renderTemplate(context, language, templateId, data);
                if (templateOutput) {
                    if (typeof templateOutput === 'object') {
                        if (!templateOutput.type) {
                            templateOutput.type = botbuilder_schema_1.ActivityTypes.Message;
                        }
                        return templateOutput;
                    }
                    else {
                        const activity = {
                            type: botbuilder_schema_1.ActivityTypes.Message,
                            text: templateOutput || '',
                        };
                        return activity;
                    }
                }
            }
            return undefined;
        });
    }
    bindActivityTemplate(context, activity) {
        return __awaiter(this, void 0, void 0, function* () {
            const fallbackLocales = this.languageFallback.slice(0); // clone fallback
            if (!!context.request.locale)
                fallbackLocales.push(context.request.locale);
            fallbackLocales.push('default');
            // Ensure activities are well formed.
            // bind any template activity
            if (activity.type == "template") {
                // try each locale until successful
                for (let locale of fallbackLocales) {
                    // apply template
                    let boundActivity = yield this.findAndApplyTemplate(context, locale, activity.text, activity.value);
                    if (boundActivity) {
                        Object.assign(activity, boundActivity);
                        return;
                    }
                }
                throw new Error(`Could not resolve template id:${activity.text}`);
            }
        });
    }
}
exports.TemplateManager = TemplateManager;
//# sourceMappingURL=templateManager.js.map