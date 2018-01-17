"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is a simple template renderer which has a resource map of template functions
 * let myTemplates  = {
 *      "en" : {
 *          "templateId": (context, data) => `your name  is ${data.name}`
 *      }
 * }
 *
 * To use, simply add to your pipeline
 * bot.use(new DictionaryRenderer(myTemplates))
 */
class DictionaryRenderer {
    constructor(templates) {
        this.templates = templates;
    }
    contextCreated(context, next) {
        context.templateManager.register(this);
        return next();
    }
    renderTemplate(context, language, templateId, data) {
        if (!(language in this.templates)) {
            //console.warn(`didn't find language ${language}`);
            return Promise.resolve(undefined);
        }
        let languageResource = this.templates[language];
        if (!(templateId in languageResource)) {
            //console.warn(`didn't find templateId ${templateId}`);
            return Promise.resolve(undefined);
        }
        let template = languageResource[templateId];
        return Promise.resolve(template(context, data));
    }
}
exports.DictionaryRenderer = DictionaryRenderer;
//# sourceMappingURL=dictionaryRenderer.js.map