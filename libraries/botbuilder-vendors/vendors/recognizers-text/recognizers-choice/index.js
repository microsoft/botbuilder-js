'use strict';

var recognizersText = require('../recognizers-text');
var GraphemeSplitter = require("grapheme-splitter");

// recognizers/recognizers-choice/src/choice/models.ts
var ChoiceModel = class {
  constructor(parser, extractor) {
    this.extractor = extractor;
    this.parser = parser;
  }
  parse(source) {
    let extractResults = this.extractor.extract(source);
    let parseResults = extractResults.map((r) => this.parser.parse(r));
    return parseResults.map((o) => o).map((o) => ({
      start: o.start,
      end: o.start + o.length - 1,
      resolution: this.getResolution(o),
      text: o.text,
      typeName: this.modelTypeName
    }));
  }
};
var BooleanModel = class extends ChoiceModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "boolean";
  }
  getResolution(sources) {
    let results = {
      value: sources.value,
      score: sources.data.score
    };
    if (sources.data.otherMatches) {
      results.otherResults = sources.data.otherMatches.map((o) => ({
        text: o.text,
        value: o.value,
        score: o.data.score
      }));
    }
    return results;
  }
};

// recognizers/recognizers-choice/src/choice/constants.ts
var Constants = class {
};
Constants.SYS_BOOLEAN = "boolean";
Constants.SYS_BOOLEAN_TRUE = "boolean-true";
Constants.SYS_BOOLEAN_FALSE = "boolean-false";

// recognizers/recognizers-choice/src/choice/extractors.ts
var splitter = new GraphemeSplitter();
var ChoiceExtractor = class {
  constructor(config) {
    this.config = config;
  }
  extract(source) {
    let results = new Array();
    let trimmedSource = source.toLowerCase();
    if (recognizersText.StringUtility.isNullOrWhitespace(source)) {
      return results;
    }
    new Array();
    let partialResults = new Array();
    let sourceTokens = this.tokenize(trimmedSource);
    this.config.regexesMap.forEach((typeExtracted, regex) => {
      recognizersText.RegExpUtility.getMatches(regex, trimmedSource).forEach((match) => {
        let matchTokens = this.tokenize(match.value);
        let topScore = sourceTokens.map((sToken, index) => this.matchValue(sourceTokens, matchTokens, index)).reduce((top, value) => top = Math.max(top, value), 0);
        if (topScore > 0) {
          let start = match.index;
          let length = match.length;
          let text = source.substr(start, length).trim();
          partialResults.push({
            start,
            length,
            text,
            type: typeExtracted,
            data: {
              source,
              score: topScore
            }
          });
        }
      });
    });
    if (partialResults.length === 0) {
      return results;
    }
    partialResults = partialResults.sort((a, b) => a.start - b.start);
    if (this.config.onlyTopMatch) {
      let topResult = partialResults.reduce((top, value) => top = top.data.score < value.data.score ? value : top, partialResults[0]);
      topResult.data.otherMatches = partialResults.filter((r) => r !== topResult);
      results.push(topResult);
    } else {
      results = partialResults;
    }
    return results;
  }
  matchValue(source, match, startPos) {
    let matched = 0;
    let totalDeviation = 0;
    match.forEach((matchToken) => {
      let pos = source.indexOf(matchToken, startPos);
      if (pos >= 0) {
        let distance = matched > 0 ? pos - startPos : 0;
        if (distance <= this.config.maxDistance) {
          matched++;
          totalDeviation += distance;
          startPos = pos + 1;
        }
      }
    });
    let score = 0;
    if (matched > 0 && (matched === match.length || this.config.allowPartialMatch)) {
      let completeness = matched / match.length;
      let accuracy = completeness * (matched / (matched + totalDeviation));
      let initialScore = accuracy * (matched / source.length);
      score = 0.4 + 0.6 * initialScore;
    }
    return score;
  }
  tokenize(source) {
    let tokens = [];
    let chars = splitter.splitGraphemes(source);
    let token = "";
    chars.forEach((c) => {
      let codePoint = c.codePointAt(0) || c.charAt(0);
      if (codePoint > 65535) {
        tokens.push(c);
        if (!recognizersText.StringUtility.isNullOrWhitespace(token)) {
          tokens.push(token);
          token = "";
        }
      } else if (!(this.config.tokenRegex.test(c) || recognizersText.StringUtility.isWhitespace(c))) {
        token = token.concat(c);
      } else if (!recognizersText.StringUtility.isNullOrWhitespace(token)) {
        tokens.push(token);
        token = "";
      }
    });
    if (!recognizersText.StringUtility.isNullOrWhitespace(token)) {
      tokens.push(token);
      token = "";
    }
    return tokens;
  }
};
var BooleanExtractor = class extends ChoiceExtractor {
  constructor(config) {
    let regexesMap = (/* @__PURE__ */ new Map()).set(config.regexTrue, Constants.SYS_BOOLEAN_TRUE).set(config.regexFalse, Constants.SYS_BOOLEAN_FALSE);
    let optionsConfig = {
      regexesMap,
      tokenRegex: config.tokenRegex,
      allowPartialMatch: false,
      maxDistance: 2,
      onlyTopMatch: config.onlyTopMatch
    };
    super(optionsConfig);
    this.extractType = Constants.SYS_BOOLEAN;
  }
};
BooleanExtractor.booleanTrue = Constants.SYS_BOOLEAN_TRUE;
BooleanExtractor.booleanFalse = Constants.SYS_BOOLEAN_FALSE;
var ChoiceParser = class {
  constructor(config) {
    this.config = config;
  }
  parse(extResult) {
    let result = new recognizersText.ParseResult(extResult);
    result.value = this.config.resolutions.get(result.type);
    if (result.data.otherMatches) {
      result.data.otherMatches = result.data.otherMatches.map((m) => {
        let r = new recognizersText.ParseResult(m);
        r.value = this.config.resolutions.get(r.type);
        return r;
      });
    }
    return result;
  }
};
var BooleanParser = class extends ChoiceParser {
  constructor() {
    let resolutions = /* @__PURE__ */ new Map([
      [Constants.SYS_BOOLEAN_TRUE, true],
      [Constants.SYS_BOOLEAN_FALSE, false]
    ]);
    let config = {
      resolutions
    };
    super(config);
  }
};

// recognizers/recognizers-choice/src/resources/englishChoice.ts
exports.EnglishChoice = void 0;
((EnglishChoice2) => {
  EnglishChoice2.LangMarker = "Eng";
  EnglishChoice2.TokenizerRegex = `[^\\w\\d]`;
  EnglishChoice2.TrueRegex = `\\b(true|yes|yep|y|sure|ok|agree)\\b|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)`;
  EnglishChoice2.FalseRegex = `\\b(false|nope|nop|no|not\\s+ok|disagree)\\b|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)`;
})(exports.EnglishChoice || (exports.EnglishChoice = {}));

// recognizers/recognizers-choice/src/choice/english/boolean.ts
var EnglishBooleanExtractorConfiguration = class {
  constructor(onlyTopMatch = true) {
    this.regexTrue = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishChoice.TrueRegex);
    this.regexFalse = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishChoice.FalseRegex);
    this.tokenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishChoice.TokenizerRegex, "is");
    this.onlyTopMatch = onlyTopMatch;
  }
};

// recognizers/recognizers-choice/src/resources/frenchChoice.ts
exports.FrenchChoice = void 0;
((FrenchChoice2) => {
  FrenchChoice2.LangMarker = "Fr";
  FrenchChoice2.TokenizerRegex = `[^\\w\\d\\u00E0-\\u00FC]`;
  FrenchChoice2.TrueRegex = `\\b(s[u\xFB]r|ouais|oui|yep|y|sure|approuver|accepter|consentir|d'accord|\xE7a march[e\xE9])\\b|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)`;
  FrenchChoice2.FalseRegex = `\\b(faux|nan|non|pas\\s+d'accord|pas\\s+concorder|n'est\\s+pas\\s+(correct|ok)|pas)\\b|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)`;
})(exports.FrenchChoice || (exports.FrenchChoice = {}));

// recognizers/recognizers-choice/src/choice/french/boolean.ts
var FrenchBooleanExtractorConfiguration = class {
  constructor(onlyTopMatch = true) {
    this.regexTrue = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchChoice.TrueRegex);
    this.regexFalse = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchChoice.FalseRegex);
    this.tokenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchChoice.TokenizerRegex, "is");
    this.onlyTopMatch = onlyTopMatch;
  }
};

// recognizers/recognizers-choice/src/resources/germanChoice.ts
exports.GermanChoice = void 0;
((GermanChoice2) => {
  GermanChoice2.LangMarker = "Ger";
  GermanChoice2.TokenizerRegex = `[^\\w\\d\\u00E0-\\u00FC]`;
  GermanChoice2.TrueRegex = `\\b(wahr|ja|jep|j|sicher|ok|einverstanden|mit\\s+Sicherheit|sicherlich|jap|mache ich)\\b|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)`;
  GermanChoice2.FalseRegex = `\\b(falsch|nein|ne|n\xF6|nicht\\s+ok|nicht\\s+einverstanden|n)\\b|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)`;
})(exports.GermanChoice || (exports.GermanChoice = {}));

// recognizers/recognizers-choice/src/choice/german/boolean.ts
var GermanBooleanExtractorConfiguration = class {
  constructor(onlyTopMatch = true) {
    this.regexTrue = recognizersText.RegExpUtility.getSafeRegExp(exports.GermanChoice.TrueRegex);
    this.regexFalse = recognizersText.RegExpUtility.getSafeRegExp(exports.GermanChoice.FalseRegex);
    this.tokenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.GermanChoice.TokenizerRegex, "is");
    this.onlyTopMatch = onlyTopMatch;
  }
};

// recognizers/recognizers-choice/src/resources/japaneseChoice.ts
exports.JapaneseChoice = void 0;
((JapaneseChoice2) => {
  JapaneseChoice2.LangMarker = "Jpn";
  JapaneseChoice2.TokenizerRegex = `[^\\w\\d\\u3040-\\u309f\\u30a0-\\u30ff\\uff00-\\uff9f\\u4e00-\\u9faf\\u3400-\\u4dbf]`;
  JapaneseChoice2.TrueRegex = `(\u306F\u3044(\uFF01)*|\u305D\u3046\u3067\u3059|\u3088\u3044(\u3067\u3059)*)|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)`;
  JapaneseChoice2.FalseRegex = `(\u3044\u3044\u3048|\u3067\u306F\u3042\u308A\u307E\u305B\u3093|\u3067\u306F\u306A\u3044|\u3058\u3083\u306A\u3044|\u3058\u3083\u3042\u308A\u307E\u305B\u3093)|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)`;
})(exports.JapaneseChoice || (exports.JapaneseChoice = {}));

// recognizers/recognizers-choice/src/choice/japanese/boolean.ts
var JapaneseBooleanExtractorConfiguration = class {
  constructor(onlyTopMatch = true) {
    this.regexTrue = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseChoice.TrueRegex);
    this.regexFalse = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseChoice.FalseRegex);
    this.tokenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseChoice.TokenizerRegex, "is");
    this.onlyTopMatch = onlyTopMatch;
  }
};

// recognizers/recognizers-choice/src/resources/portugueseChoice.ts
exports.PortugueseChoice = void 0;
((PortugueseChoice2) => {
  PortugueseChoice2.LangMarker = "Por";
  PortugueseChoice2.TokenizerRegex = `[^\\w\\d\\u00E0-\\u00FC]`;
  PortugueseChoice2.TrueRegex = `\\b(verdade|verdadeir[oa]|sim|isso|claro|ok)\\b|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)`;
  PortugueseChoice2.FalseRegex = `\\b(falso|n[a\xE3]o|incorreto|nada disso)\\b|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)`;
})(exports.PortugueseChoice || (exports.PortugueseChoice = {}));

// recognizers/recognizers-choice/src/choice/portuguese/boolean.ts
var PortugueseBooleanExtractorConfiguration = class {
  constructor(onlyTopMatch = true) {
    this.regexTrue = recognizersText.RegExpUtility.getSafeRegExp(exports.PortugueseChoice.TrueRegex);
    this.regexFalse = recognizersText.RegExpUtility.getSafeRegExp(exports.PortugueseChoice.FalseRegex);
    this.tokenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.PortugueseChoice.TokenizerRegex, "is");
    this.onlyTopMatch = onlyTopMatch;
  }
};

// recognizers/recognizers-choice/src/resources/spanishChoice.ts
exports.SpanishChoice = void 0;
((SpanishChoice2) => {
  SpanishChoice2.LangMarker = "Spa";
  SpanishChoice2.TokenizerRegex = `[^\\w\\d\\u00E0-\\u00FC]`;
  SpanishChoice2.TrueRegex = `\\b(verdad|verdadero|s\xED|sip|s|si|cierto|por supuesto|ok)\\b|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)`;
  SpanishChoice2.FalseRegex = `\\b(falso|no|nop|n|no)\\b|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)`;
})(exports.SpanishChoice || (exports.SpanishChoice = {}));

// recognizers/recognizers-choice/src/choice/spanish/boolean.ts
var SpanishBooleanExtractorConfiguration = class {
  constructor(onlyTopMatch = true) {
    this.regexTrue = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishChoice.TrueRegex);
    this.regexFalse = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishChoice.FalseRegex);
    this.tokenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishChoice.TokenizerRegex, "is");
    this.onlyTopMatch = onlyTopMatch;
  }
};

// recognizers/recognizers-choice/src/resources/chineseChoice.ts
exports.ChineseChoice = void 0;
((ChineseChoice2) => {
  ChineseChoice2.LangMarker = "Chs";
  ChineseChoice2.TokenizerRegex = `[^\\u3040-\\u30ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\uff66-\\uff9f]`;
  ChineseChoice2.TrueRegex = `(\u597D[\u7684\u554A\u5440\u561E\u54C7]|\u6CA1\u95EE\u9898|\u53EF\u4EE5|\u4E2D|\u597D|\u540C\u610F|\u884C|\u662F\u7684|\u662F|\u5BF9)|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)`;
  ChineseChoice2.FalseRegex = `(\u4E0D\u884C|\u4E0D\u597D|\u62D2\u7EDD|\u5426\u5B9A|\u4E0D\u4E2D|\u4E0D\u53EF\u4EE5|\u4E0D\u662F\u7684|\u4E0D\u662F|\u4E0D\u5BF9|\u4E0D)|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)`;
})(exports.ChineseChoice || (exports.ChineseChoice = {}));

// recognizers/recognizers-choice/src/choice/chinese/boolean.ts
var ChineseBooleanExtractorConfiguration = class {
  constructor(onlyTopMatch = true) {
    this.regexTrue = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseChoice.TrueRegex);
    this.regexFalse = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseChoice.FalseRegex);
    this.tokenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseChoice.TokenizerRegex, "is");
    this.onlyTopMatch = onlyTopMatch;
  }
};

// recognizers/recognizers-choice/src/choice/choiceRecognizer.ts
var ChoiceOptions = /* @__PURE__ */ ((ChoiceOptions2) => {
  ChoiceOptions2[ChoiceOptions2["None"] = 0] = "None";
  return ChoiceOptions2;
})(ChoiceOptions || {});
function recognizeBoolean(query, culture, options = 0 /* None */, fallbackToDefaultCulture = true) {
  let recognizer = new ChoiceRecognizer(culture, options);
  let model = recognizer.getBooleanModel(culture, fallbackToDefaultCulture);
  return model.parse(query);
}
var ChoiceRecognizer = class extends recognizersText.Recognizer {
  constructor(culture, options = 0 /* None */, lazyInitialization = false) {
    super(culture, options, lazyInitialization);
  }
  InitializeConfiguration() {
    this.registerModel("BooleanModel", recognizersText.Culture.English, (options) => new BooleanModel(
      new BooleanParser(),
      new BooleanExtractor(new EnglishBooleanExtractorConfiguration())
    ));
    this.registerModel("BooleanModel", recognizersText.Culture.Japanese, (options) => new BooleanModel(
      new BooleanParser(),
      new BooleanExtractor(new JapaneseBooleanExtractorConfiguration())
    ));
    this.registerModel("BooleanModel", recognizersText.Culture.Portuguese, (options) => new BooleanModel(
      new BooleanParser(),
      new BooleanExtractor(new PortugueseBooleanExtractorConfiguration())
    ));
    this.registerModel("BooleanModel", recognizersText.Culture.Spanish, (options) => new BooleanModel(
      new BooleanParser(),
      new BooleanExtractor(new SpanishBooleanExtractorConfiguration())
    ));
    this.registerModel("BooleanModel", recognizersText.Culture.Chinese, (options) => new BooleanModel(
      new BooleanParser(),
      new BooleanExtractor(new ChineseBooleanExtractorConfiguration())
    ));
    this.registerModel("BooleanModel", recognizersText.Culture.French, (options) => new BooleanModel(
      new BooleanParser(),
      new BooleanExtractor(new FrenchBooleanExtractorConfiguration())
    ));
    this.registerModel("BooleanModel", recognizersText.Culture.German, (options) => new BooleanModel(
      new BooleanParser(),
      new BooleanExtractor(new GermanBooleanExtractorConfiguration())
    ));
  }
  IsValidOptions(options) {
    return options >= 0 && options <= 0 /* None */;
  }
  getBooleanModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("BooleanModel", culture, fallbackToDefaultCulture);
  }
};

Object.defineProperty(exports, "Culture", {
  enumerable: true,
  get: function () { return recognizersText.Culture; }
});
exports.BooleanExtractor = BooleanExtractor;
exports.BooleanModel = BooleanModel;
exports.BooleanParser = BooleanParser;
exports.ChineseBooleanExtractorConfiguration = ChineseBooleanExtractorConfiguration;
exports.ChoiceExtractor = ChoiceExtractor;
exports.ChoiceModel = ChoiceModel;
exports.ChoiceOptions = ChoiceOptions;
exports.ChoiceParser = ChoiceParser;
exports.ChoiceRecognizer = ChoiceRecognizer;
exports.Constants = Constants;
exports.EnglishBooleanExtractorConfiguration = EnglishBooleanExtractorConfiguration;
exports.FrenchBooleanExtractorConfiguration = FrenchBooleanExtractorConfiguration;
exports.GermanBooleanExtractorConfiguration = GermanBooleanExtractorConfiguration;
exports.JapaneseBooleanExtractorConfiguration = JapaneseBooleanExtractorConfiguration;
exports.PortugueseBooleanExtractorConfiguration = PortugueseBooleanExtractorConfiguration;
exports.SpanishBooleanExtractorConfiguration = SpanishBooleanExtractorConfiguration;
exports.recognizeBoolean = recognizeBoolean;
