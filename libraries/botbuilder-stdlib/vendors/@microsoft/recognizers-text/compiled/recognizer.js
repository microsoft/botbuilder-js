"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
class Recognizer {
    constructor(targetCulture, options, lazyInitialization) {
        this.modelFactory = new models_1.ModelFactory();
        if (!this.IsValidOptions(options))
            throw new Error(`${options} is not a valid options value.`);
        this.TargetCulture = targetCulture;
        this.Options = options;
        this.InitializeConfiguration();
        if (!lazyInitialization) {
            this.initializeModels(targetCulture, options);
        }
    }
    getModel(modelTypeName, culture, fallbackToDefaultCulture) {
        return this.modelFactory.getModel(modelTypeName, culture || this.TargetCulture, fallbackToDefaultCulture, this.Options);
    }
    registerModel(modelTypeName, culture, modelCreator) {
        this.modelFactory.registerModel(modelTypeName, culture, modelCreator);
    }
    initializeModels(targetCulture, options) {
        this.modelFactory.initializeModels(targetCulture, options);
    }
}
exports.Recognizer = Recognizer;
//# sourceMappingURL=recognizer.js.map