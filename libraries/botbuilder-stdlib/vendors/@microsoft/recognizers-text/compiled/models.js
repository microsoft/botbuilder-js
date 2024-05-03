"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const culture_1 = require("./culture");
const utilities_1 = require("./utilities");
class ModelResult {
}
exports.ModelResult = ModelResult;
class ExtendedModelResult extends ModelResult {
    constructor(source = null) {
        super();
        if (source) {
            this.text = source.text;
            this.start = source.start;
            this.end = source.end;
            this.typeName = source.typeName;
            this.resolution = source.resolution;
        }
    }
}
exports.ExtendedModelResult = ExtendedModelResult;
class ModelFactoryKey {
    constructor(culture, modelType, options = null) {
        this.culture = culture ? culture.toLowerCase() : null;
        this.modelType = modelType;
        this.options = options;
    }
    toString() {
        return JSON.stringify(this);
    }
    static fromString(key) {
        return JSON.parse(key);
    }
}
class ModelFactory {
    constructor() {
        this.modelFactories = new Map();
    }
    getModel(modelTypeName, culture, fallbackToDefaultCulture, options) {
        let result = this.tryGetModel(modelTypeName, culture, options);
        if (!result.containsModel && fallbackToDefaultCulture) {
            result = this.tryGetModel(modelTypeName, ModelFactory.fallbackCulture, options);
        }
        if (result.containsModel) {
            return result.model;
        }
        throw new Error(`Could not find Model with the specified configuration: ${culture},${modelTypeName}`);
    }
    tryGetModel(modelTypeName, culture, options) {
        culture = culture_1.Culture.mapToNearestLanguage(culture);
        let cacheResult = this.getModelFromCache(modelTypeName, culture, options);
        if (cacheResult)
            return { containsModel: true, model: cacheResult };
        let key = this.generateKey(modelTypeName, culture);
        if (this.modelFactories.has(key)) {
            let model = this.modelFactories.get(key)(options);
            this.registerModelInCache(modelTypeName, culture, options, model);
            return { containsModel: true, model: model };
        }
        return { containsModel: false };
    }
    registerModel(modelTypeName, culture, modelCreator) {
        let key = this.generateKey(modelTypeName, culture);
        if (this.modelFactories.has(key)) {
            throw new Error(`${culture}-${modelTypeName} has already been registered.`);
        }
        this.modelFactories.set(key, modelCreator);
    }
    initializeModels(targetCulture, options) {
        this.modelFactories.forEach((value, key) => {
            let modelFactoryKey = ModelFactoryKey.fromString(key);
            if (utilities_1.StringUtility.isNullOrEmpty(targetCulture) || modelFactoryKey.culture === targetCulture) {
                this.tryGetModel(modelFactoryKey.modelType, modelFactoryKey.culture, modelFactoryKey.options);
            }
        });
    }
    generateKey(modelTypeName, culture) {
        return new ModelFactoryKey(culture, modelTypeName).toString();
    }
    getModelFromCache(modelTypeName, culture, options) {
        let key = this.generateCacheKey(modelTypeName, culture, options);
        return ModelFactory.cache.get(key);
    }
    registerModelInCache(modelTypeName, culture, options, model) {
        let key = this.generateCacheKey(modelTypeName, culture, options);
        ModelFactory.cache.set(key, model);
    }
    generateCacheKey(modelTypeName, culture, options) {
        return new ModelFactoryKey(culture, modelTypeName, options).toString();
    }
}
ModelFactory.fallbackCulture = culture_1.Culture.English;
ModelFactory.cache = new Map();
exports.ModelFactory = ModelFactory;
//# sourceMappingURL=models.js.map