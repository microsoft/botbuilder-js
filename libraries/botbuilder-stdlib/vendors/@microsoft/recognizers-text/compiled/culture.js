"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Culture {
    constructor(cultureName, cultureCode) {
        this.cultureName = cultureName;
        this.cultureCode = cultureCode;
    }
    static getSupportedCultureCodes() {
        return Culture.supportedCultures.map(c => c.cultureCode);
    }
    static mapToNearestLanguage(cultureCode) {
        if (cultureCode !== undefined) {
            cultureCode = cultureCode.toLowerCase();
            var supportedCultureCodes = Culture.getSupportedCultureCodes();
            if (supportedCultureCodes.indexOf(cultureCode) < 0) {
                var culturePrefix = cultureCode.split('-')[0].trim();
                supportedCultureCodes.forEach(function (supportedCultureCode) {
                    if (supportedCultureCode.startsWith(culturePrefix)) {
                        cultureCode = supportedCultureCode;
                    }
                });
            }
        }
        return cultureCode;
    }
}
Culture.English = "en-us";
Culture.Chinese = "zh-cn";
Culture.Spanish = "es-es";
Culture.Portuguese = "pt-br";
Culture.French = "fr-fr";
Culture.German = "de-de";
Culture.Japanese = "ja-jp";
Culture.Dutch = "nl-nl";
Culture.Italian = "it-it";
Culture.supportedCultures = [
    new Culture("English", Culture.English),
    new Culture("Chinese", Culture.Chinese),
    new Culture("Spanish", Culture.Spanish),
    new Culture("Portuguese", Culture.Portuguese),
    new Culture("French", Culture.French),
    new Culture("German", Culture.German),
    new Culture("Japanese", Culture.Japanese),
    new Culture("Dutch", Culture.Dutch),
    new Culture("Italian", Culture.Italian)
];
exports.Culture = Culture;
class CultureInfo {
    static getCultureInfo(cultureCode) {
        return new CultureInfo(cultureCode);
    }
    constructor(cultureName) {
        this.code = cultureName;
    }
}
exports.CultureInfo = CultureInfo;
//# sourceMappingURL=culture.js.map