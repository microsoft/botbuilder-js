'use strict';

var recognizersText = require('../recognizers-text');
var recognizersTextNumber = require('../recognizers-number');
var max = require("lodash/max");
var escapeRegExp = require("lodash/escapeRegExp");
var last = require("lodash/last");

var CompositeEntityType = /* @__PURE__ */ ((CompositeEntityType2) => {
  CompositeEntityType2[CompositeEntityType2["Age"] = 0] = "Age";
  CompositeEntityType2[CompositeEntityType2["Currency"] = 1] = "Currency";
  CompositeEntityType2[CompositeEntityType2["Dimension"] = 2] = "Dimension";
  CompositeEntityType2[CompositeEntityType2["Temperature"] = 3] = "Temperature";
  return CompositeEntityType2;
})(CompositeEntityType || {});
var AbstractNumberWithUnitModel = class {
  constructor(extractorParsersMap) {
    this.extractorParsersMap = extractorParsersMap;
  }
  parse(query) {
    query = recognizersText.FormatUtility.preProcess(query, false);
    let extractionResults = new Array();
    for (let kv of this.extractorParsersMap.entries()) {
      let extractor = kv[0];
      let parser = kv[1];
      let extractResults = extractor.extract(query);
      let parseResults = [];
      for (let i = 0; i < extractResults.length; i++) {
        let r = parser.parse(extractResults[i]);
        if (r.value !== null) {
          if (r.value instanceof Array) {
            for (let j = 0; j < r.value.length; j++) {
              parseResults.push(r.value[j]);
            }
          } else {
            parseResults.push(r);
          }
        }
      }
      let modelResults = parseResults.map((o) => ({
        start: o.start,
        end: o.start + o.length - 1,
        resolution: this.getResolution(o.value),
        text: o.text,
        typeName: this.modelTypeName
      }));
      modelResults.forEach((result) => {
        let bAdd = true;
        extractionResults.forEach((extractionResult) => {
          if (extractionResult.start === result.start && extractionResult.end === result.end) {
            bAdd = false;
          }
        });
        if (bAdd) {
          extractionResults.push(result);
        }
      });
    }
    return extractionResults;
  }
  getResolution(data) {
    if (typeof data === "undefined") return null;
    let result = typeof data === "string" ? { value: data.toString() } : { value: data.number, unit: data.unit };
    if (data.isoCurrency) {
      result["isoCurrency"] = data.isoCurrency;
    }
    return result;
  }
};
var AgeModel = class extends AbstractNumberWithUnitModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "age";
  }
};
var CurrencyModel = class extends AbstractNumberWithUnitModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "currency";
  }
};
var DimensionModel = class extends AbstractNumberWithUnitModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "dimension";
  }
};
var TemperatureModel = class extends AbstractNumberWithUnitModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "temperature";
  }
};

// recognizers/recognizers-number-with-unit/src/resources/baseUnits.ts
var BaseUnits;
((BaseUnits2) => {
  BaseUnits2.HourRegex = `(?<hour>00|01|02|03|04|05|06|07|08|09|0|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|1|2|3|4|5|6|7|8|9)(h)?`;
  BaseUnits2.MinuteRegex = `(?<min>00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|0|1|2|3|4|5|6|7|8|9)(?!\\d)`;
  BaseUnits2.SecondRegex = `(?<sec>00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|0|1|2|3|4|5|6|7|8|9)`;
  BaseUnits2.PmNonUnitRegex = `(${BaseUnits2.HourRegex}\\s*:\\s*${BaseUnits2.MinuteRegex}(\\s*:\\s*${BaseUnits2.SecondRegex})?\\s*pm)`;
  BaseUnits2.AmbiguousTimeTerm = "pm";
})(BaseUnits || (BaseUnits = {}));

// recognizers/recognizers-number-with-unit/src/numberWithUnit/constants.ts
var Constants = class {
};
Constants.SYS_UNIT = "builtin.unit";
Constants.SYS_UNIT_DIMENSION = "builtin.unit.dimension";
Constants.SYS_UNIT_AGE = "builtin.unit.age";
Constants.SYS_UNIT_AREA = "builtin.unit.area";
Constants.SYS_UNIT_CURRENCY = "builtin.unit.currency";
Constants.SYS_UNIT_LENGTH = "builtin.unit.length";
Constants.SYS_UNIT_SPEED = "builtin.unit.speed";
Constants.SYS_UNIT_TEMPERATURE = "builtin.unit.temperature";
Constants.SYS_UNIT_VOLUME = "builtin.unit.volume";
Constants.SYS_UNIT_WEIGHT = "builtin.unit.weight";
Constants.SYS_NUM = "builtin.num";
// For cases like '2:00 pm', both 'pm' and '00 pm' are not dimension
Constants.AMBIGUOUS_TIME_TERM = BaseUnits.AmbiguousTimeTerm;
// For currencies without ISO codes, we use internal values prefixed by '_'.
// These values should never be present in parse output.
Constants.FAKE_ISO_CODE_PREFIX = "_";

// recognizers/recognizers-number-with-unit/src/numberWithUnit/extractors.ts
var NumberWithUnitExtractor = class {
  constructor(config) {
    this.config = config;
    if (this.config.suffixList && this.config.suffixList.size > 0) {
      this.suffixRegexes = this.buildRegexFromSet(Array.from(this.config.suffixList.values()));
    } else {
      this.suffixRegexes = /* @__PURE__ */ new Set();
    }
    if (this.config.prefixList && this.config.prefixList.size > 0) {
      let maxLength = 0;
      this.config.prefixList.forEach((preMatch) => {
        let len = max(preMatch.split("|").filter((s) => s && s.length).map((s) => s.length));
        maxLength = maxLength >= len ? maxLength : len;
      });
      this.maxPrefixMatchLen = maxLength + 2;
      this.prefixRegexes = this.buildRegexFromSet(Array.from(this.config.prefixList.values()));
    } else {
      this.prefixRegexes = /* @__PURE__ */ new Set();
    }
    this.separateRegex = this.buildSeparateRegexFromSet();
  }
  extract(source) {
    if (!this.preCheckStr(source)) {
      return new Array();
    }
    let mappingPrefix = /* @__PURE__ */ new Map();
    let matched = new Array(source.length);
    let numbers = this.config.unitNumExtractor.extract(source);
    let result = new Array();
    let sourceLen = source.length;
    if (this.maxPrefixMatchLen !== 0) {
      numbers.forEach((num) => {
        if (num.start === void 0 || num.length === void 0) {
          return;
        }
        let maxFindPref = Math.min(this.maxPrefixMatchLen, num.start);
        if (maxFindPref === 0) {
          return;
        }
        let leftStr = source.substring(num.start - maxFindPref, num.start - maxFindPref + maxFindPref);
        let lastIndex = leftStr.length;
        let bestMatch = null;
        this.prefixRegexes.forEach((regex) => {
          let collection = recognizersText.RegExpUtility.getMatches(regex, leftStr).filter((m) => m.length);
          if (collection.length === 0) {
            return;
          }
          collection.forEach((match) => {
            if (leftStr.substring(match.index, lastIndex).trim() === match.value) {
              if (bestMatch === null || bestMatch.index >= match.index) {
                bestMatch = match;
              }
            }
          });
        });
        if (bestMatch !== null) {
          lastIndex - bestMatch.index;
          let unitStr = leftStr.substring(bestMatch.index, lastIndex);
          mappingPrefix.set(num.start, {
            offset: lastIndex - bestMatch.index,
            unitString: unitStr
          });
        }
      });
    }
    for (let num of numbers) {
      if (num.start === void 0 || num.length === void 0) {
        continue;
      }
      let start = num.start;
      let length = num.length;
      let maxFindLen = sourceLen - start - length;
      let prefixUnit = mappingPrefix.has(start) ? mappingPrefix.get(start) : null;
      if (maxFindLen > 0) {
        let rightSub = source.substring(start + length, start + length + maxFindLen);
        let unitMatch = Array.from(this.suffixRegexes.values()).map((r) => recognizersText.RegExpUtility.getMatches(r, rightSub)).filter((m) => m.length > 0);
        let maxlen = 0;
        for (let i = 0; i < unitMatch.length; i++) {
          for (let m of unitMatch[i]) {
            if (m.length > 0) {
              let endpos = m.index + m.length;
              if (m.index >= 0) {
                let midStr = rightSub.substring(0, Math.min(m.index, rightSub.length));
                if (maxlen < endpos && (recognizersText.StringUtility.isNullOrWhitespace(midStr) || midStr.trim() === this.config.connectorToken)) {
                  maxlen = endpos;
                }
              }
            }
          }
        }
        if (maxlen !== 0) {
          for (let i = 0; i < length + maxlen; i++) {
            matched[i + start] = true;
          }
          let substr = source.substring(start, start + length + maxlen);
          let er = {
            start,
            length: length + maxlen,
            text: substr,
            type: this.config.extractType
          };
          if (prefixUnit !== null) {
            er.start -= prefixUnit.offset;
            er.length += prefixUnit.offset;
            er.text = prefixUnit.unitString + er.text;
          }
          num.start = start - er.start;
          er.data = num;
          let isDimensionFallsInPmTime = false;
          if (er.type === Constants.SYS_UNIT_DIMENSION) {
            let nonUnitMatch = recognizersText.RegExpUtility.getMatches(this.config.pmNonUnitRegex, source);
            nonUnitMatch.forEach((match) => {
              if (er.start >= match.index && er.start + er.length <= match.index + match.length) {
                isDimensionFallsInPmTime = true;
              }
            });
          }
          if (isDimensionFallsInPmTime) {
            continue;
          }
          result.push(er);
          continue;
        }
      }
      if (prefixUnit !== null) {
        let er = {
          start: num.start - prefixUnit.offset,
          length: num.length + prefixUnit.offset,
          text: prefixUnit.unitString + num.text,
          type: this.config.extractType
        };
        num.start = start - er.start;
        er.data = num;
        result.push(er);
      }
    }
    if (this.separateRegex !== null) {
      this.extractSeparateUnits(source, result);
    }
    return result;
  }
  validateUnit(source) {
    return source.substring(0, 1) !== "-";
  }
  preCheckStr(str) {
    return str && str.length;
  }
  extractSeparateUnits(source, numDependResults) {
    let matchResult = new Array(source.length);
    numDependResults.forEach((numDependResult) => {
      let start = numDependResult.start;
      let i = 0;
      do {
        matchResult[start + i++] = true;
      } while (i < numDependResult.length);
    });
    let matchCollection = recognizersText.RegExpUtility.getMatches(this.separateRegex, source);
    if (matchCollection.length > 0) {
      matchCollection.forEach((match) => {
        let i = 0;
        while (i < match.length && !matchResult[match.index + i]) {
          i++;
        }
        if (i === match.length) {
          for (let j = 0; j < i; j++) {
            matchResult[j] = true;
          }
          let isDimensionFallsInPmTime = false;
          if (match.value === Constants.AMBIGUOUS_TIME_TERM) {
            let nonUnitMatch = recognizersText.RegExpUtility.getMatches(this.config.pmNonUnitRegex, source);
            nonUnitMatch.forEach((time) => {
              if (this.isDimensionFallsInTime(match, time)) {
                isDimensionFallsInPmTime = true;
              }
            });
          }
          if (isDimensionFallsInPmTime === false) {
            numDependResults.push({
              start: match.index,
              length: match.length,
              text: match.value,
              type: this.config.extractType,
              data: null
            });
          }
        }
      });
    }
  }
  buildRegexFromSet(collection, ignoreCase = true) {
    return new Set(
      collection.map((regexString) => {
        let regexTokens = regexString.split("|").map(escapeRegExp);
        let pattern = `${this.config.buildPrefix}(${regexTokens.join("|")})${this.config.buildSuffix}`;
        let options = "gs";
        if (ignoreCase) options += "i";
        return recognizersText.RegExpUtility.getSafeRegExp(pattern, options);
      })
    );
  }
  buildSeparateRegexFromSet(ignoreCase = true) {
    let separateWords = /* @__PURE__ */ new Set();
    if (this.config.prefixList && this.config.prefixList.size) {
      for (let addWord of this.config.prefixList.values()) {
        addWord.split("|").filter((s) => s && s.length).filter(this.validateUnit).forEach((word) => separateWords.add(word));
      }
    }
    if (this.config.suffixList && this.config.suffixList.size) {
      for (let addWord of this.config.suffixList.values()) {
        addWord.split("|").filter((s) => s && s.length).filter(this.validateUnit).forEach((word) => separateWords.add(word));
      }
    }
    if (this.config.ambiguousUnitList && this.config.ambiguousUnitList.length) {
      for (let abandonWord of this.config.ambiguousUnitList) {
        if (separateWords.has(abandonWord)) {
          separateWords.delete(abandonWord);
        }
      }
    }
    let regexTokens = Array.from(separateWords.values()).map(escapeRegExp);
    if (regexTokens.length === 0) {
      return null;
    }
    regexTokens = regexTokens.sort(this.dinoComparer);
    let pattern = `${this.config.buildPrefix}(${regexTokens.join("|")})${this.config.buildSuffix}`;
    let options = "gs";
    if (ignoreCase) options += "i";
    return recognizersText.RegExpUtility.getSafeRegExp(pattern, options);
  }
  dinoComparer(x, y) {
    if (x === null) {
      if (y === null) {
        return 0;
      } else {
        return 1;
      }
    } else {
      if (y === null) {
        return -1;
      } else {
        let retval = y.length - x.length;
        if (retval !== 0) {
          return retval;
        } else {
          let xl = x.toLowerCase();
          let yl = y.toLowerCase();
          if (xl < yl) {
            return -1;
          }
          if (xl > yl) {
            return 1;
          }
          return 0;
        }
      }
    }
  }
  isDimensionFallsInTime(dimension, time) {
    let isSubMatch = false;
    if (dimension.index >= time.index && dimension.index + dimension.length <= time.index + time.length) {
      isSubMatch = true;
    }
    return isSubMatch;
  }
};
var BaseMergedUnitExtractor = class {
  constructor(config) {
    this.config = config;
    this.innerExtractor = new NumberWithUnitExtractor(config);
  }
  extract(source) {
    let result = new Array();
    if (this.config.extractType === Constants.SYS_UNIT_CURRENCY) {
      result = this.mergeCompoundUnits(source);
    } else {
      result = this.innerExtractor.extract(source);
    }
    return result;
  }
  mergeCompoundUnits(source) {
    let result = new Array();
    let ers = this.innerExtractor.extract(source);
    this.MergePureNumber(source, ers);
    let groups = [];
    groups[0] = 0;
    for (let i = 0; i < ers.length - 1; i++) {
      if (ers[i].type !== ers[i + 1].type && ers[i].type !== recognizersTextNumber.Constants.SYS_NUM && ers[i + 1].type !== recognizersTextNumber.Constants.SYS_NUM) {
        continue;
      }
      if (ers[i].data != null && ers[i].data.data != null && !ers[i].data.data.startsWith("Integer")) {
        groups[i + 1] = groups[i] + 1;
        continue;
      }
      let middleBegin = ers[i].start + ers[i].length;
      let middleEnd = ers[i + 1].start;
      let middleStr = source.substring(middleBegin, middleEnd).trim().toLowerCase();
      if (recognizersText.StringUtility.isNullOrEmpty(middleStr)) {
        groups[i + 1] = groups[i];
        continue;
      }
      let match = recognizersText.RegExpUtility.getMatches(this.config.compoundUnitConnectorRegex, middleStr).pop();
      if (match && match.index === 0 && match.length === middleStr.length) {
        groups[i + 1] = groups[i];
      } else {
        groups[i + 1] = groups[i] + 1;
      }
    }
    for (let i = 0; i < ers.length; i++) {
      if (i === 0 || groups[i] !== groups[i - 1]) {
        let tmpInner = new recognizersText.ExtractResult();
        tmpInner.data = ers[i].data;
        tmpInner.length = ers[i].length;
        tmpInner.start = ers[i].start;
        tmpInner.text = ers[i].text;
        tmpInner.type = ers[i].type;
        let tmpExtractResult = ers[i];
        tmpExtractResult.data = new Array();
        tmpExtractResult.data.push(tmpInner);
        result.push(tmpExtractResult);
      }
      if (i + 1 < ers.length && groups[i + 1] === groups[i]) {
        let group = groups[i];
        let periodBegin = result[group].start;
        let periodEnd = ers[i + 1].start + ers[i + 1].length;
        result[group].length = periodEnd - periodBegin;
        result[group].text = source.substring(periodBegin, periodEnd);
        result[group].type = Constants.SYS_UNIT_CURRENCY;
        result[group].data.push(ers[i + 1]);
      }
    }
    for (let i = 0; i < result.length; i++) {
      let innerData = result[i].data;
      if (innerData && innerData.length === 1) {
        result[i] = innerData[0];
      }
    }
    result = result.filter((er) => er.type !== recognizersTextNumber.Constants.SYS_NUM);
    return result;
  }
  MergePureNumber(source, result) {
    let numErs = this.config.unitNumExtractor.extract(source);
    let unitNumbers = new Array();
    let i;
    let j;
    for (i = 0, j = 0; i < numErs.length; i++) {
      let hasBehindExtraction = false;
      while (j < result.length && result[j].start + result[j].length < numErs[i].start) {
        hasBehindExtraction = true;
        j++;
      }
      if (!hasBehindExtraction) {
        continue;
      }
      let middleBegin = result[j - 1].start + result[j - 1].length;
      let middleEnd = numErs[i].start;
      let middleStr = source.substring(middleBegin, middleEnd).trim().toLowerCase();
      if (recognizersText.StringUtility.isNullOrEmpty(middleStr)) {
        unitNumbers.push(numErs[i]);
        continue;
      }
      let match = recognizersText.RegExpUtility.getMatches(this.config.compoundUnitConnectorRegex, middleStr).pop();
      if (match && match.index === 0 && match.length === middleStr.length) {
        unitNumbers.push(numErs[i]);
      }
    }
    unitNumbers.forEach((extractResult) => {
      let overlap = false;
      result.forEach((er) => {
        if (er.start <= extractResult.start && er.start + er.length >= extractResult.start) {
          overlap = true;
        }
      });
      if (!overlap) {
        result.push(extractResult);
      }
    });
    result.sort((x, y) => x.start - y.start);
  }
};
var PrefixUnitResult = class {
};
var DictionaryUtils = class {
  static bindDictionary(dictionary, source) {
    if (dictionary === null) {
      return;
    }
    dictionary.forEach((value, key) => {
      if (recognizersText.StringUtility.isNullOrEmpty(key)) {
        return;
      }
      this.bindUnitsString(source, key, value);
    });
  }
  static bindUnitsString(dictionary, key, source) {
    let values = source.trim().split("|");
    values.forEach((token) => {
      if (recognizersText.StringUtility.isNullOrWhitespace(token) || dictionary.has(token)) {
        return;
      }
      dictionary.set(token, key);
    });
  }
};

// recognizers/recognizers-number-with-unit/src/resources/baseCurrency.ts
var BaseCurrency;
((BaseCurrency2) => {
  BaseCurrency2.CurrencyFractionMapping = /* @__PURE__ */ new Map([["CNY", "FEN|JIAO"], ["__D", "CENT"], ["RUB", "KOPEK"], ["AFN", "PUL"], ["EUR", "CENT"], ["ALL", "QINDARKE"], ["_ALP", "PENNY"], ["GBP", "PENNY"], ["_GGP", "PENNY"], ["DZD", "SANTEEM"], ["AOA", "CENTIMO"], ["ARS", "CENTAVO"], ["AMD", "LUMA"], ["AWG", "CENT"], ["_AP", "PENNY"], ["SHP", "PENNY"], ["AUD", "CENT"], ["AZN", "Q\u018FPIK"], ["BSD", "CENT"], ["BHD", "FILS"], ["BDT", "POISHA"], ["BBD", "CENT"], ["BYN", "KAPYEYKA"], ["BZD", "CENT"], ["XOF", "CENTIME"], ["BMD", "CENT"], ["BTN", "CHETRUM"], ["INR", "PAISA"], ["BOB", "CENTAVO"], ["USD", "CENT"], ["BAM", "FENING"], ["BWP", "THEBE"], ["BRL", "CENTAVO"], ["_BD", "CENT"], ["BND", "SEN"], ["SGD", "CENT"], ["BGN", "STOTINKA"], ["BIF", "CENTIME"], ["KHR", "SEN"], ["XAF", "CENTIME"], ["CAD", "CENT"], ["CVE", "CENTAVO"], ["KYD", "CENT"], ["CLP", "CENTAVO"], ["COP", "CENTAVO"], ["KMF", "CENTIME"], ["CDF", "CENTIME"], ["NZD", "CENT"], ["_CKD", "CENT"], ["CRC", "CENTIMO"], ["HRK", "LIPA"], ["CUC", "CENTAVO"], ["CUP", "CENTAVO"], ["CZK", "HALER"], ["DKK", "\xD8RE"], ["DJF", "CENTIME"], ["DOP", "CENTAVO"], ["EGP", "PIASTRE"], ["ERN", "CENT"], ["ETB", "SANTIM"], ["FKP", "PENNY"], ["_FOK", "OYRA"], ["FJD", "CENT"], ["XPF", "CENTIME"], ["GMD", "BUTUT"], ["GEL", "TETRI"], ["GHS", "PESEWA"], ["GIP", "PENNY"], ["GTQ", "CENTAVO"], ["GNF", "CENTIME"], ["GYD", "CENT"], ["HTG", "CENTIME"], ["HNL", "CENTAVO"], ["HKD", "CENT"], ["HUF", "FILLER"], ["ISK", "EYRIR"], ["IDR", "SEN"], ["IRR", "DINAR"], ["IQD", "FILS"], ["IMP", "PENNY"], ["ILS", "AGORA"], ["JMD", "CENT"], ["JPY", "SEN"], ["JEP", "PENNY"], ["JOD", "PIASTRE"], ["KZT", "TIIN"], ["KES", "CENT"], ["_KID", "CENT"], ["KPW", "CHON"], ["KRW", "JEON"], ["KWD", "FILS"], ["KGS", "TYIYN"], ["LAK", "ATT"], ["LBP", "PIASTRE"], ["LSL", "SENTE"], ["ZAR", "CENT"], ["LRD", "CENT"], ["LYD", "DIRHAM"], ["CHF", "RAPPEN"], ["MOP", "AVO"], ["MKD", "DENI"], ["MGA", "IRAIMBILANJA"], ["MWK", "TAMBALA"], ["MYR", "SEN"], ["MVR", "LAARI"], ["MRO", "KHOUMS"], ["MUR", "CENT"], ["MXN", "CENTAVO"], ["_MD", "CENT"], ["MDL", "BAN"], ["MNT", "MONGO"], ["MAD", "CENTIME"], ["MZN", "CENTAVO"], ["MMK", "PYA"], ["NAD", "CENT"], ["_ND", "CENT"], ["NPR", "PAISA"], ["NIO", "CENTAVO"], ["NGN", "KOBO"], ["_NID", "CENT"], ["TRY", "KURUS"], ["NOK", "\xD8RE"], ["OMR", "BAISA"], ["PKR", "PAISA"], ["_PD", "CENT"], ["PAB", "CENTESIMO"], ["PGK", "TOEA"], ["PYG", "CENTIMO"], ["PEN", "CENTIMO"], ["_PND", "CENT"], ["PLN", "GROSZ"], ["QAR", "DIRHAM"], ["RON", "BAN"], ["RWF", "CENTIME"], ["WST", "SENE"], ["STD", "CENTIMO"], ["SAR", "HALALA"], ["RSD", "PARA"], ["SCR", "CENT"], ["SLL", "CENT"], ["SBD", "CENT"], ["SOS", "CENT"], ["_SS", "CENT"], ["_SP", "PENNY"], ["SSP", "PIASTRE"], ["LKR", "CENT"], ["SDG", "PIASTRE"], ["SRD", "CENT"], ["SZL", "CENT"], ["SEK", "ORE"], ["SYP", "PIASTRE"], ["TWD", "CENT"], ["TJS", "DIRAM"], ["TZS", "CENT"], ["THB", "SATANG"], ["PRB", "KOPEK"], ["TTD", "CENT"], ["_TP", "PENNY"], ["TND", "MILLIME"], ["TMT", "TENNESI"], ["TVD", "CENT"], ["UGX", "CENT"], ["UAH", "KOPIYKA"], ["AED", "FILS"], ["UYU", "CENTESIMO"], ["VEF", "CENTIMO"], ["YER", "FILS"], ["ZMW", "NGWEE"]]);
  BaseCurrency2.CurrencyFractionalRatios = /* @__PURE__ */ new Map([["Kopek", 100], ["Pul", 100], ["Cent", 100], ["Qindark\xEB", 100], ["Penny", 100], ["Santeem", 100], ["C\xEAntimo", 100], ["Centavo", 100], ["Luma", 100], ["Q\u0259pik", 100], ["Fils", 1e3], ["Poisha", 100], ["Kapyeyka", 100], ["Centime", 100], ["Chetrum", 100], ["Paisa", 100], ["Fening", 100], ["Thebe", 100], ["Sen", 100], ["Stotinka", 100], ["Jiao", 10], ["Fen", 100], ["C\xE9ntimo", 100], ["Lipa", 100], ["Hal\xE9\u0159", 100], ["\xD8re", 100], ["Piastre", 100], ["Santim", 100], ["Oyra", 100], ["Butut", 100], ["Tetri", 100], ["Pesewa", 100], ["Fill\xE9r", 100], ["Eyrir", 100], ["Dinar", 100], ["Agora", 100], ["T\xEF\u0131n", 100], ["Chon", 100], ["Jeon", 100], ["Tyiyn", 100], ["Att", 100], ["Sente", 100], ["Dirham", 1e3], ["Rappen", 100], ["Avo", 100], ["Deni", 100], ["Iraimbilanja", 5], ["Tambala", 100], ["Laari", 100], ["Khoums", 5], ["Ban", 100], ["M\xF6ng\xF6", 100], ["Pya", 100], ["Kobo", 100], ["Kuru\u015F", 100], ["Baisa", 1e3], ["Cent\xE9simo", 100], ["Toea", 100], ["Sentimo", 100], ["Grosz", 100], ["Sene", 100], ["Halala", 100], ["Para", 100], ["\xD6re", 100], ["Diram", 100], ["Satang", 100], ["Seniti", 100], ["Millime", 1e3], ["Tennesi", 100], ["Kopiyka", 100], ["Tiyin", 100], ["H\xE0o", 10], ["Ngwee", 100]]);
})(BaseCurrency || (BaseCurrency = {}));

// recognizers/recognizers-number-with-unit/src/numberWithUnit/parsers.ts
var UnitValue = class {
  constructor() {
    this.number = "";
    this.unit = "";
  }
};
var UnitValueIso = class extends UnitValue {
  constructor() {
    super(...arguments);
    this.isoCurrency = "";
  }
};
var BaseNumberWithUnitParserConfiguration = class {
  constructor(cultureInfo) {
    this.cultureInfo = cultureInfo;
    this.unitMap = /* @__PURE__ */ new Map();
    this.currencyFractionNumMap = BaseCurrency.CurrencyFractionalRatios;
    this.currencyFractionMapping = BaseCurrency.CurrencyFractionMapping;
  }
  BindDictionary(dictionary) {
    DictionaryUtils.bindDictionary(dictionary, this.unitMap);
  }
};
var NumberWithUnitParser = class {
  constructor(config) {
    this.config = config;
  }
  parse(extResult) {
    let ret = new recognizersText.ParseResult(extResult);
    let numberResult;
    if (extResult.data && typeof extResult.data === "object") {
      numberResult = extResult.data;
    } else if (extResult.type === Constants.SYS_NUM) {
      ret.value = this.config.internalNumberParser.parse(extResult).value;
      return ret;
    } else {
      numberResult = { start: -1, length: 0, text: null, type: null };
    }
    let key = extResult.text;
    let unitKeyBuild = "";
    let unitKeys = new Array();
    for (let i = 0; i <= key.length; i++) {
      if (i === key.length) {
        if (unitKeyBuild.length !== 0) {
          this.addIfNotContained(unitKeys, unitKeyBuild.trim());
        }
      } else if (i === numberResult.start) {
        if (unitKeyBuild.length !== 0) {
          this.addIfNotContained(unitKeys, unitKeyBuild.trim());
          unitKeyBuild = "";
        }
        let o = numberResult.start + numberResult.length - 1;
        if (o !== null && !isNaN(o)) {
          i = o;
        }
      } else {
        unitKeyBuild += key[i];
      }
    }
    let lastUnit = last(unitKeys);
    let normalizedLastUnit = lastUnit.toLowerCase();
    if (this.config.connectorToken && this.config.connectorToken.length && normalizedLastUnit.indexOf(this.config.connectorToken) === 0) {
      normalizedLastUnit = normalizedLastUnit.substring(this.config.connectorToken.length).trim();
      lastUnit = lastUnit.substring(this.config.connectorToken.length).trim();
    }
    if (key && key.length && this.config.unitMap !== null) {
      let unitValue = null;
      if (this.config.unitMap.has(lastUnit)) {
        unitValue = this.config.unitMap.get(lastUnit);
      } else if (this.config.unitMap.has(normalizedLastUnit)) {
        unitValue = this.config.unitMap.get(normalizedLastUnit);
      }
      if (unitValue) {
        let numValue = numberResult.text && numberResult.text.length ? this.config.internalNumberParser.parse(numberResult) : null;
        let resolutionStr = numValue ? numValue.resolutionStr : null;
        ret.value = { number: resolutionStr, unit: unitValue };
        ret.resolutionStr = `${resolutionStr} ${unitValue}`.trim();
      }
    }
    return ret;
  }
  addIfNotContained(keys, newKey) {
    if (!keys.some((key) => key.includes(newKey))) {
      keys.push(newKey);
    }
  }
};
var BaseCurrencyParser = class {
  constructor(config) {
    this.config = config;
    this.numberWithUnitParser = new NumberWithUnitParser(config);
  }
  parse(extResult) {
    let result = null;
    if (extResult.data instanceof Array) {
      result = this.mergeCompoundUnit(extResult);
    } else {
      result = this.numberWithUnitParser.parse(extResult);
      let value = result.value;
      if (!this.config.currencyNameToIsoCodeMap.has(value.unit) || this.config.currencyNameToIsoCodeMap.get(value.unit).startsWith(Constants.FAKE_ISO_CODE_PREFIX)) {
        result.value = {
          unit: value.unit,
          number: value.number
        };
      } else {
        result.value = {
          unit: value.unit,
          number: value.number,
          isoCurrency: this.config.currencyNameToIsoCodeMap.get(value.unit)
        };
      }
    }
    return result;
  }
  mergeCompoundUnit(compoundResult) {
    let results = [];
    let compoundUnit = compoundResult.data;
    let count = 0;
    let result = null;
    let numberValue = 0;
    let mainUnitValue = "";
    let mainUnitIsoCode = "";
    let fractionUnitsString = "";
    for (let i = 0; i < compoundUnit.length; i++) {
      let extractResult = compoundUnit[i];
      let parseResult = this.numberWithUnitParser.parse(extractResult);
      let parseResultValue = parseResult.value;
      let unitValue = parseResultValue != null ? parseResultValue.unit : null;
      if (count === 0) {
        if (extractResult.type !== Constants.SYS_UNIT_CURRENCY) {
          continue;
        }
        result = new recognizersText.ParseResult(extractResult);
        mainUnitValue = unitValue;
        numberValue = parseFloat(parseResultValue.number);
        result.resolutionStr = parseResult.resolutionStr;
        if (this.config.currencyNameToIsoCodeMap.has(unitValue)) {
          mainUnitIsoCode = this.config.currencyNameToIsoCodeMap.get(unitValue);
        }
        if (recognizersText.StringUtility.isNullOrEmpty(mainUnitIsoCode)) {
          result.value = {
            number: numberValue.toString(),
            unit: mainUnitValue
          };
          results.push(result);
          result = null;
          continue;
        }
        if (this.config.currencyFractionMapping.has(mainUnitIsoCode)) {
          fractionUnitsString = this.config.currencyFractionMapping.get(mainUnitIsoCode);
        }
      } else {
        if (extractResult.type === recognizersTextNumber.Constants.SYS_NUM) {
          numberValue += parseResult.value * (1 / 100);
          result.resolutionStr += " " + parseResult.resolutionStr;
          result.length = parseResult.start + parseResult.length - result.start;
          count++;
          continue;
        }
        let fractionUnitCode;
        let fractionNumValue;
        if (this.config.currencyFractionCodeList.has(unitValue)) {
          fractionUnitCode = this.config.currencyFractionCodeList.get(unitValue);
        }
        if (this.config.currencyFractionNumMap.has(unitValue)) {
          fractionNumValue = this.config.currencyFractionNumMap.get(unitValue);
        }
        if (fractionUnitCode && fractionNumValue !== 0 && this.checkUnitsStringContains(fractionUnitCode, fractionUnitsString)) {
          numberValue += parseFloat(parseResultValue.number) * (1 / fractionNumValue);
          result.resolutionStr += " " + parseResult.resolutionStr;
          result.length = parseResult.start + parseResult.length - result.start;
        } else {
          if (result !== null) {
            if (recognizersText.StringUtility.isNullOrEmpty(mainUnitIsoCode) || mainUnitIsoCode.startsWith(Constants.FAKE_ISO_CODE_PREFIX)) {
              result.value = {
                number: numberValue.toString(),
                unit: mainUnitValue
              };
            } else {
              result.value = {
                number: numberValue.toString(),
                unit: mainUnitValue,
                isoCurrency: mainUnitIsoCode
              };
            }
            results.push(result);
            result = null;
          }
          count = 0;
          i -= 1;
          continue;
        }
      }
      count++;
    }
    if (result !== null) {
      if (recognizersText.StringUtility.isNullOrEmpty(mainUnitIsoCode) || mainUnitIsoCode.startsWith(Constants.FAKE_ISO_CODE_PREFIX)) {
        result.value = {
          number: numberValue.toString(),
          unit: mainUnitValue
        };
      } else {
        result.value = {
          number: numberValue.toString(),
          unit: mainUnitValue,
          isoCurrency: mainUnitIsoCode
        };
      }
      results.push(result);
    }
    this.resolveText(results, compoundResult.text, compoundResult.start);
    return { value: results };
  }
  checkUnitsStringContains(fractionUnitCode, fractionUnitsString) {
    let unitsMap = /* @__PURE__ */ new Map();
    DictionaryUtils.bindUnitsString(unitsMap, "", fractionUnitsString);
    return unitsMap.has(fractionUnitCode);
  }
  resolveText(prs, source, bias) {
    prs.forEach((parseResult) => {
      if (parseResult.start !== null && parseResult.length !== null) {
        parseResult.text = source.substr(parseResult.start - bias, parseResult.length);
      }
    });
  }
};
var BaseMergedUnitParser = class {
  constructor(config) {
    this.config = config;
    this.numberWithUnitParser = new NumberWithUnitParser(config);
    this.currencyParser = new BaseCurrencyParser(config);
  }
  parse(extResult) {
    let result;
    if (extResult.type === Constants.SYS_UNIT_CURRENCY) {
      result = this.currencyParser.parse(extResult);
    } else {
      result = this.numberWithUnitParser.parse(extResult);
    }
    return result;
  }
};

// recognizers/recognizers-number-with-unit/src/resources/englishNumericWithUnit.ts
exports.EnglishNumericWithUnit = void 0;
((EnglishNumericWithUnit2) => {
  EnglishNumericWithUnit2.AgeSuffixList = /* @__PURE__ */ new Map([["Year", "years old|year old|year-old|years-old|-year-old|-years-old|years of age|year of age"], ["Month", "months old|month old|month-old|months-old|-month-old|-months-old|month of age|months of age"], ["Week", "weeks old|week old|week-old|weeks-old|-week-old|-weeks-old|week of age|weeks of age"], ["Day", "days old|day old|day-old|days-old|-day-old|-days-old|day of age|days of age"]]);
  EnglishNumericWithUnit2.AreaSuffixList = /* @__PURE__ */ new Map([["Square kilometer", "sq km|sq kilometer|sq kilometre|sq kilometers|sq kilometres|square kilometer|square kilometre|square kilometers|square kilometres|km2|km^2|km\xB2"], ["Square hectometer", "sq hm|sq hectometer|sq hectometre|sq hectometers|sq hectometres|square hectometer|square hectometre|square hectometers|square hectometres|hm2|hm^2|hm\xB2|hectare|hectares"], ["Square decameter", "sq dam|sq decameter|sq decametre|sq decameters|sq decametres|square decameter|square decametre|square decameters|square decametres|sq dekameter|sq dekametre|sq dekameters|sq dekametres|square dekameter|square dekametre|square dekameters|square dekametres|dam2|dam^2|dam\xB2"], ["Square meter", "sq m|sq meter|sq metre|sq meters|sq metres|sq metre|square meter|square meters|square metre|square metres|m2|m^2|m\xB2"], ["Square decimeter", "sq dm|sq decimeter|sq decimetre|sq decimeters|sq decimetres|square decimeter|square decimetre|square decimeters|square decimetres|dm2|dm^2|dm\xB2"], ["Square centimeter", "sq cm|sq centimeter|sq centimetre|sq centimeters|sq centimetres|square centimeter|square centimetre|square centimeters|square centimetres|cm2|cm^2|cm\xB2"], ["Square millimeter", "sq mm|sq millimeter|sq millimetre|sq millimeters|sq millimetres|square millimeter|square millimetre|square millimeters|square millimetres|mm2|mm^2|mm\xB2"], ["Square inch", "sq in|sq inch|square inch|square inches|in2|in^2|in\xB2"], ["Square foot", "sqft|sq ft|sq foot|sq feet|square foot|square feet|feet2|feet^2|feet\xB2|ft2|ft^2|ft\xB2"], ["Square mile", "sq mi|sq mile|sqmiles|square mile|square miles|mi2|mi^2|mi\xB2"], ["Square yard", "sq yd|sq yard|sq yards|square yard|square yards|yd2|yd^2|yd\xB2"], ["Acre", "-acre|acre|acres"]]);
  EnglishNumericWithUnit2.CurrencySuffixList = /* @__PURE__ */ new Map([["Abkhazian apsar", "abkhazian apsar|apsars"], ["Afghan afghani", "afghan afghani|\u060B|afn|afghanis|afghani"], ["Pul", "pul"], ["Euro", "euros|euro|\u20AC|eur"], ["Cent", "cents|cent|-cents|-cent|sen"], ["Albanian lek", "albanian lek|leks|lek"], ["Qindark\xEB", "qindark\xEB|qindark\xEBs|qindarke|qindarkes"], ["Angolan kwanza", "angolan kwanza|kz|aoa|kwanza|kwanzas|angolan kwanzas"], ["Armenian dram", "armenian drams|armenian dram"], ["Aruban florin", "aruban florin|\u0192|awg|aruban florins"], ["Bangladeshi taka", "bangladeshi taka|\u09F3|bdt|taka|takas|bangladeshi takas"], ["Paisa", "poisha|paisa"], ["Bhutanese ngultrum", "Bhutanese ngultrum|nu.|btn"], ["Chetrum", "chetrums|chetrum"], ["Bolivian boliviano", "bolivian boliviano|bob|bs.|bolivia boliviano|bolivia bolivianos|bolivian bolivianos"], ["Bosnia and Herzegovina convertible mark", "bosnia and herzegovina convertible mark|bam"], ["Fening", "fenings|fenings"], ["Botswana pula", "botswana pula|bwp|pula|pulas|botswana pulas"], ["Thebe", "thebe"], ["Brazilian real", "brazilian real|r$|brl|brazil real|brazil reals|brazilian reals"], ["Bulgarian lev", "bulgarian lev|bgn|\u043B\u0432|bulgaria lev|bulgaria levs|bulgarian levs"], ["Stotinka", "stotinki|stotinka"], ["Cambodian riel", "cambodian riel|khr|\u17DB|cambodia riel|cambodia riels|cambodian riels"], ["Cape Verdean escudo", "cape verdean escudo|cve"], ["Costa Rican col\xF3n", "costa rican col\xF3n|costa rican col\xF3ns|crc|\u20A1|costa rica col\xF3n|costa rica col\xF3ns|costa rican colon|costa rican colons|costa rica colon|costa rica colons"], ["Salvadoran col\xF3n", "svc|salvadoran col\xF3n|salvadoran col\xF3ns|salvador col\xF3n|salvador col\xF3ns|salvadoran colon|salvadoran colons|salvador colon|salvador colons"], ["C\xE9ntimo", "c\xE9ntimo"], ["Croatian kuna", "croatian kuna|kn|hrk|croatia kuna|croatian kunas|croatian kuna kunas"], ["Lipa", "lipa"], ["Czech koruna", "czech koruna|czk|K\u010D|czech korunas"], ["Hal\xE9\u0159", "hal\xE9\u0159"], ["Eritrean nakfa", "eritrean nakfa|nfk|ern|eritrean nakfas"], ["Ethiopian birr", "ethiopian birr|etb"], ["Gambian dalasi", "gmd"], ["Butut", "bututs|butut"], ["Georgian lari", "Georgian lari|lari|gel|\u20BE"], ["Tetri", "tetri"], ["Ghanaian cedi", "Ghanaian cedi|ghs|\u20B5|gh\u20B5"], ["Pesewa", "pesewas|pesewa"], ["Guatemalan quetzal", "guatemalan quetzal|gtq|guatemala quetzal"], ["Haitian gourde", "haitian gourde|htg"], ["Honduran lempira", "honduran lempira|hnl"], ["Hungarian forint", "hungarian forint|huf|ft|hungary forint|hungary forints|hungarian forints"], ["Fill\xE9r", "fill\xE9r"], ["Iranian rial", "iranian rial|irr|iran rial|iran rials|iranian rials"], ["Yemeni rial", "yemeni rial|yer|yemeni rials"], ["Israeli new shekel", "\u20AA|ils|agora"], ["Lithuanian litas", "ltl|lithuanian litas|lithuan litas|lithuanian lit|lithuan lit"], ["Japanese yen", "japanese yen|jpy|yen|-yen|\xA5|yens|japanese yens|japan yen|japan yens"], ["Kazakhstani tenge", "Kazakhstani tenge|kzt"], ["Kenyan shilling", "kenyan shilling|sh|kes"], ["North Korean won", "north korean won|kpw|north korean wons"], ["South Korean won", "south korean won|krw|south korean wons"], ["Korean won", "korean won|\u20A9|korean wons"], ["Kyrgyzstani som", "kyrgyzstani som|kgs"], ["Uzbekitan som", "uzbekitan som|uzs"], ["Lao kip", "lao kip|lak|\u20ADn|\u20AD"], ["Att", "att"], ["Lesotho loti", "lesotho loti|lsl|loti"], ["Sente", "sente|lisente"], ["South African rand", "south african rand|zar|south africa rand|south africa rands|south african rands"], ["Macanese pataca", "macanese pataca|mop$|mop"], ["Avo", "avos|avo"], ["Macedonian denar", "macedonian denar|mkd|\u0434\u0435\u043D"], ["Deni", "deni"], ["Malagasy ariary", "malagasy ariary|mga"], ["Iraimbilanja", "iraimbilanja"], ["Malawian kwacha", "malawian kwacha|mk|mwk"], ["Tambala", "tambala"], ["Malaysian ringgit", "malaysian ringgit|rm|myr|malaysia ringgit|malaysia ringgits|malaysian ringgits"], ["Mauritanian ouguiya", "mauritanian ouguiya|um|mro|mauritania ouguiya|mauritania ouguiyas|mauritanian ouguiyas"], ["Khoums", "khoums"], ["Mongolian t\xF6gr\xF6g", "mongolian t\xF6gr\xF6g|mnt|\u20AE|mongolia t\xF6gr\xF6g|mongolia t\xF6gr\xF6gs|mongolian t\xF6gr\xF6gs|mongolian togrog|mongolian togrogs|mongolia togrog|mongolia togrogs"], ["Mozambican metical", "mozambican metical|mt|mzn|mozambica metical|mozambica meticals|mozambican meticals"], ["Burmese kyat", "Burmese kyat|ks|mmk"], ["Pya", "pya"], ["Nicaraguan c\xF3rdoba", "nicaraguan c\xF3rdoba|nio"], ["Nigerian naira", "nigerian naira|naira|ngn|\u20A6|nigeria naira|nigeria nairas|nigerian nairas"], ["Kobo", "kobo"], ["Turkish lira", "turkish lira|try|tl|turkey lira|turkey liras|turkish liras"], ["Kuru\u015F", "kuru\u015F"], ["Omani rial", "omani rial|omr|\u0631.\u0639."], ["Panamanian balboa", "panamanian balboa|b/.|pab"], ["Centesimo", "centesimo|c\xE9ntimo"], ["Papua New Guinean kina", "papua new guinean kina|kina|pgk"], ["Toea", "toea"], ["Paraguayan guaran\xED", "paraguayan guaran\xED|\u20B2|pyg"], ["Peruvian sol", "peruvian sol|soles|sol|peruvian nuevo sol"], ["Polish z\u0142oty", "z\u0142oty|polish z\u0142oty|z\u0142|pln|zloty|polish zloty|poland zloty|poland z\u0142oty"], ["Grosz", "groszy|grosz|grosze"], ["Qatari riyal", "qatari riyal|qar|qatari riyals|qatar riyal|qatar riyals"], ["Saudi riyal", "saudi riyal|sar|saudi riyals"], ["Riyal", "riyal|riyals|rial|\uFDFC"], ["Dirham", "dirham|dirhem|dirhm"], ["Halala", "halalas|halala"], ["Samoan t\u0101l\u0101", "samoan t\u0101l\u0101|t\u0101l\u0101|tala|ws$|samoa|wst|samoan tala"], ["Sene", "sene"], ["S\xE3o Tom\xE9 and Pr\xEDncipe dobra", "s\xE3o tom\xE9 and pr\xEDncipe dobra|dobras|dobra|std"], ["Sierra Leonean leone", "sierra Leonean leone|sll|leone|le"], ["Peseta", "pesetas|peseta"], ["Netherlands guilder", "florin|netherlands antillean guilder|ang|\u0192|nederlandse gulden|guilders|guilder|gulden|-guilders|-guilder|dutch guilders|dutch guilder|fl"], ["Swazi lilangeni", "swazi lilangeni|lilangeni|szl|emalangeni"], ["Tajikistani somoni", "tajikistani somoni|tjs|somoni"], ["Diram", "dirams|diram"], ["Thai baht", "thai baht|\u0E3F|thb|baht"], ["Satang", "satang|satangs"], ["Tongan pa\u02BBanga", "tongan pa\u02BBanga|pa\u02BBanga|tongan pa'anga|pa'anga"], ["Seniti", "seniti"], ["Ukrainian hryvnia", "ukrainian hryvnia|hyrvnia|uah|\u20B4|ukrain hryvnia|ukrain hryvnias|ukrainian hryvnias"], ["Vanuatu vatu", "vanuatu vatu|vatu|vuv"], ["Venezuelan bol\xEDvar", "venezuelan bol\xEDvar|venezuelan bol\xEDvars|bs.f.|vef|bol\xEDvar fuerte|venezuelan bolivar|venezuelan bolivars|venezuela bolivar|venezuela bolivarsvenezuelan bolivar|venezuelan bolivars"], ["Vietnamese dong", "vietnamese dong|vnd|\u0111\u1ED3ng|vietnam dong|vietnamese dongs|vietnam dongs"], ["Zambian kwacha", "zambian kwacha|zk|zmw|zambia kwacha|kwachas|zambian kwachas"], ["Moroccan dirham", "moroccan dirham|mad|\u062F.\u0645."], ["United Arab Emirates dirham", "united arab emirates dirham|\u062F.\u0625|aed"], ["Azerbaijani manat", "azerbaijani manat|azn"], ["Turkmenistan manat", "turkmenistan manat|turkmenistan new manat|tmt"], ["Manat", "manats|manat"], ["Q\u0259pik", "q\u0259pik"], ["Somali shilling", "somali shillings|somali shilling|shilin soomaali|-shilin soomaali|scellino|shilin|sh.so.|sos"], ["Somaliland shilling", "somaliland shillings|somaliland shilling|soomaaliland shilin"], ["Tanzanian shilling", "tanzanian shilling|tanzanian shillings|tsh|tzs|tanzania shilling|tanzania shillings"], ["Ugandan shilling", "ugandan shilling|ugandan shillings|sh|ugx|uganda shilling|uganda shillings"], ["Romanian leu", "romanian leu|lei|ron|romania leu"], ["Moldovan leu", "moldovan leu|mdl|moldova leu"], ["Leu", "leu"], ["Ban", "bani|-ban|ban"], ["Nepalese rupee", "nepalese rupee|npr"], ["Pakistani rupee", "pakistani rupee|pkr"], ["Indian rupee", "indian rupee|inr|\u20B9|india rupee"], ["Seychellois rupee", "seychellois rupee|scr|sr|sre"], ["Mauritian rupee", "mauritian rupee|mur"], ["Maldivian rufiyaa", "maldivian rufiyaa|rf|mvr|.\u0783|maldive rufiyaa"], ["Sri Lankan rupee", "sri Lankan rupee|lkr|\u0DBB\u0DD4|\u0BB0\u0BC2"], ["Indonesian rupiah", "Indonesian rupiah|rupiah|perak|rp|idr"], ["Rupee", "rupee|rs"], ["Danish krone", "danish krone|dkk|denmark krone|denmark krones|danish krones"], ["Norwegian krone", "norwegian krone|nok|norway krone|norway krones|norwegian krones"], ["Faroese kr\xF3na", "faroese kr\xF3na|faroese krona"], ["Icelandic kr\xF3na", "icelandic kr\xF3na|isk|icelandic krona|iceland kr\xF3na|iceland krona"], ["Swedish krona", "swedish krona|sek|swedan krona"], ["Krone", "kronor|krona|kr\xF3na|krone|krones|kr|-kr"], ["\xD8re", "\xD8re|oyra|eyrir"], ["West African CFA franc", "west african cfa franc|xof|west africa cfa franc|west africa franc|west african franc"], ["Central African CFA franc", "central african cfa franc|xaf|central africa cfa franc|central african franc|central africa franc"], ["Comorian franc", "comorian franc|kmf"], ["Congolese franc", "congolese franc|cdf"], ["Burundian franc", "burundian franc|bif"], ["Djiboutian franc", "djiboutian franc|djf"], ["CFP franc", "cfp franc|xpf"], ["Guinean franc", "guinean franc|gnf"], ["Swiss franc", "swiss francs|swiss franc|chf|sfr."], ["Rwandan franc", "Rwandan franc|rwf|rf|r\u20A3|frw"], ["Belgian franc", "belgian franc|bi.|b.fr.|bef|belgium franc"], ["Rappen", "rappen|-rappen"], ["Franc", "francs|franc|fr.|fs"], ["Centime", "centimes|centime|santim"], ["Russian ruble", "russian ruble|\u20BD|rub|russia ruble|russia \u20BD|russian \u20BD|russian rubles|russia rubles"], ["New Belarusian ruble", "new belarusian ruble|byn|new belarus ruble|new belarus rubles|new belarusian rubles"], ["Old Belarusian ruble", "old belarusian ruble|byr|old belarus ruble|old belarus rubles|old belarusian rubles"], ["Transnistrian ruble", "transnistrian ruble|prb|\u0440."], ["Belarusian ruble", "belarusian ruble|belarus ruble|belarus rubles|belarusian rubles"], ["Kopek", "kopek|kopeks"], ["Kapyeyka", "kapyeyka"], ["Ruble", "rubles|ruble|br"], ["Algerian dinar", "algerian dinar|\u062F.\u062C|dzd|algerian dinars|algeria dinar|algeria dinars"], ["Bahraini dinar", "bahraini dinars|bahraini dinar|bhd|.\u062F.\u0628"], ["Santeem", "santeem|santeems"], ["Iraqi dinar", "iraqi dinars|iraqi dinar|iraq dinars|iraq dinar|iqd|\u0639.\u062F"], ["Jordanian dinar", "jordanian dinars|jordanian dinar|\u062F.\u0627|jod|jordan dinar|jordan dinars"], ["Kuwaiti dinar", "kuwaiti dinars|kuwaiti dinar|kwd|\u062F.\u0643"], ["Libyan dinar", "libyan dinars|libyan dinar|libya dinars|libya dinar|lyd"], ["Serbian dinar", "serbian dinars|serbian dinar|din.|rsd|\u0434\u0438\u043D.|serbia dinars|serbia dinar"], ["Tunisian dinar", "tunisian dinars|tunisian dinar|tnd|tunisia dinars|tunisia dinar"], ["Yugoslav dinar", "yugoslav dinars|yugoslav dinar|yun"], ["Dinar", "dinars|dinar|denar|-dinars|-dinar"], ["Fils", "fils|ful\u016Bs|-fils|-fil"], ["Para", "para|napa"], ["Millime", "millimes|millime"], ["Argentine peso", "argentine peso|ars|argetina peso|argetina pesos|argentine pesos"], ["Chilean peso", "chilean pesos|chilean peso|clp|chile peso|chile peso"], ["Colombian peso", "colombian pesos|colombian peso|cop|colombia peso|colombia pesos"], ["Cuban convertible peso", "cuban convertible pesos|cuban convertible peso|cuc|cuba convertible pesos|cuba convertible peso"], ["Cuban peso", "cuban pesos|cuban peso|cup|cuba pesos|cuba peso"], ["Dominican peso", "dominican pesos|dominican peso|dop|dominica pesos|dominica peso"], ["Mexican peso", "mexican pesos|mexican peso|mxn|mexico pesos|mexico peso"], ["Philippine peso", "piso|philippine pesos|philippine peso|\u20B1|php"], ["Uruguayan peso", "uruguayan pesos|uruguayan peso|uyu"], ["Peso", "pesos|peso"], ["Centavo", "centavos|centavo"], ["Alderney pound", "alderney pounds|alderney pound|alderney \xA3"], ["British pound", "british pounds|british pound|british \xA3|gbp|pound sterling|pound sterlings|sterling|pound scot|pound scots"], ["Guernsey pound", "guernsey pounds|guernsey \xA3|ggp"], ["Ascension pound", "ascension pounds|ascension pound|ascension \xA3"], ["Saint Helena pound", "saint helena pounds|saint helena pound|saint helena \xA3|shp"], ["Egyptian pound", "egyptian pounds|egyptian pound|egyptian \xA3|egp|\u062C.\u0645|egypt pounds|egypt pound"], ["Falkland Islands pound", "falkland islands pounds|falkland islands pound|falkland islands \xA3|fkp|falkland island pounds|falkland island pound|falkland island \xA3"], ["Gibraltar pound", "gibraltar pounds|gibraltar pound|gibraltar \xA3|gip"], ["Manx pound", "manx pounds|manx pound|manx \xA3|imp"], ["Jersey pound", "jersey pounds|jersey pound|jersey \xA3|jep"], ["Lebanese pound", "lebanese pounds|lebanese pound|lebanese \xA3|lebanan pounds|lebanan pound|lebanan \xA3|lbp|\u0644.\u0644"], ["South Georgia and the South Sandwich Islands pound", "south georgia and the south sandwich islands pounds|south georgia and the south sandwich islands pound|south georgia and the south sandwich islands \xA3"], ["South Sudanese pound", "south sudanese pounds|south sudanese pound|south sudanese \xA3|ssp|south sudan pounds|south sudan pound|south sudan \xA3"], ["Sudanese pound", "sudanese pounds|sudanese pound|sudanese \xA3|\u062C.\u0633.|sdg|sudan pounds|sudan pound|sudan \xA3"], ["Syrian pound", "syrian pounds|syrian pound|syrian \xA3|\u0644.\u0633|syp|syria pounds|syria pound|syria \xA3"], ["Tristan da Cunha pound", "tristan da cunha pounds|tristan da cunha pound|tristan da cunha \xA3"], ["Pound", "pounds|pound|-pounds|-pound|\xA3"], ["Pence", "pence"], ["Shilling", "shillings|shilling|shilingi"], ["Penny", "pennies|penny"], ["United States dollar", "united states dollars|united states dollar|united states $|u.s. dollars|u.s. dollar|u s dollar|u s dollars|usd|american dollars|american dollar|us$|us dollar|us dollars|u.s dollar|u.s dollars"], ["East Caribbean dollar", "east caribbean dollars|east caribbean dollar|east Caribbean $|xcd"], ["Australian dollar", "australian dollars|australian dollar|australian $|australian$|aud|australia dollars|australia dollar|australia $|australia$"], ["Bahamian dollar", "bahamian dollars|bahamian dollar|bahamian $|bahamian$|bsd|bahamia dollars|bahamia dollar|bahamia $|bahamia$"], ["Barbadian dollar", "barbadian dollars|barbadian dollar|barbadian $|bbd"], ["Belize dollar", "belize dollars|belize dollar|belize $|bzd"], ["Bermudian dollar", "bermudian dollars|bermudian dollar|bermudian $|bmd|bermudia dollars|bermudia dollar|bermudia $"], ["British Virgin Islands dollar", "british virgin islands dollars|british virgin islands dollar|british virgin islands $|bvi$|virgin islands dollars|virgin islands dolalr|virgin islands $|virgin island dollars|virgin island dollar|virgin island $"], ["Brunei dollar", "brunei dollar|brunei $|bnd"], ["Sen", "sen"], ["Singapore dollar", "singapore dollars|singapore dollar|singapore $|s$|sgd"], ["Canadian dollar", "canadian dollars|canadian dollar|canadian $|cad|can$|c$|canada dollars|canada dolllar|canada $"], ["Cayman Islands dollar", "cayman islands dollars|cayman islands dollar|cayman islands $|kyd|ci$|cayman island dollar|cayman island doolars|cayman island $"], ["New Zealand dollar", "new zealand dollars|new zealand dollar|new zealand $|nz$|nzd|kiwi"], ["Cook Islands dollar", "cook islands dollars|cook islands dollar|cook islands $|cook island dollars|cook island dollar|cook island $"], ["Fijian dollar", "fijian dollars|fijian dollar|fijian $|fjd|fiji dollars|fiji dollar|fiji $"], ["Guyanese dollar", "guyanese dollars|guyanese dollar|gyd|gy$"], ["Hong Kong dollar", "hong kong dollars|hong kong dollar|hong kong $|hk$|hkd|hk dollars|hk dollar|hk $|hongkong$"], ["Jamaican dollar", "jamaican dollars|jamaican dollar|jamaican $|j$|jamaica dollars|jamaica dollar|jamaica $|jmd"], ["Kiribati dollar", "kiribati dollars|kiribati dollar|kiribati $"], ["Liberian dollar", "liberian dollars|liberian dollar|liberian $|liberia dollars|liberia dollar|liberia $|lrd"], ["Micronesian dollar", "micronesian dollars|micronesian dollar|micronesian $"], ["Namibian dollar", "namibian dollars|namibian dollar|namibian $|nad|n$|namibia dollars|namibia dollar|namibia $"], ["Nauruan dollar", "nauruan dollars|nauruan dollar|nauruan $"], ["Niue dollar", "niue dollars|niue dollar|niue $"], ["Palauan dollar", "palauan dollars|palauan dollar|palauan $"], ["Pitcairn Islands dollar", "pitcairn islands dollars|pitcairn islands dollar|pitcairn islands $|pitcairn island dollars|pitcairn island dollar|pitcairn island $"], ["Solomon Islands dollar", "solomon islands dollars|solomon islands dollar|solomon islands $|si$|sbd|solomon island dollars|solomon island dollar|solomon island $"], ["Surinamese dollar", "surinamese dollars|surinamese dollar|surinamese $|srd"], ["New Taiwan dollar", "new taiwan dollars|new taiwan dollar|nt$|twd|ntd"], ["Trinidad and Tobago dollar", "trinidad and tobago dollars|trinidad and tobago dollar|trinidad and tobago $|trinidad $|trinidad dollar|trinidad dollars|trinidadian dollar|trinidadian dollars|trinidadian $|ttd"], ["Tuvaluan dollar", "tuvaluan dollars|tuvaluan dollar|tuvaluan $"], ["Dollar", "dollars|dollar|$"], ["Chinese yuan", "yuan|kuai|chinese yuan|renminbi|cny|rmb|\uFFE5|\u5143"], ["Fen", "fen"], ["Jiao", "jiao|mao"], ["Finnish markka", "suomen markka|finnish markka|finsk mark|fim|markkaa|markka"], ["Penni", "penni\xE4|penni"]]);
  EnglishNumericWithUnit2.CurrencyNameToIsoCodeMap = /* @__PURE__ */ new Map([["Afghan afghani", "AFN"], ["Euro", "EUR"], ["Albanian lek", "ALL"], ["Angolan kwanza", "AOA"], ["Armenian dram", "AMD"], ["Aruban florin", "AWG"], ["Bangladeshi taka", "BDT"], ["Bhutanese ngultrum", "BTN"], ["Bolivian boliviano", "BOB"], ["Bosnia and Herzegovina convertible mark", "BAM"], ["Botswana pula", "BWP"], ["Brazilian real", "BRL"], ["Bulgarian lev", "BGN"], ["Cambodian riel", "KHR"], ["Cape Verdean escudo", "CVE"], ["Costa Rican col\xF3n", "CRC"], ["Croatian kuna", "HRK"], ["Czech koruna", "CZK"], ["Eritrean nakfa", "ERN"], ["Ethiopian birr", "ETB"], ["Gambian dalasi", "GMD"], ["Georgian lari", "GEL"], ["Ghanaian cedi", "GHS"], ["Guatemalan quetzal", "GTQ"], ["Haitian gourde", "HTG"], ["Honduran lempira", "HNL"], ["Hungarian forint", "HUF"], ["Iranian rial", "IRR"], ["Yemeni rial", "YER"], ["Israeli new shekel", "ILS"], ["Japanese yen", "JPY"], ["Kazakhstani tenge", "KZT"], ["Kenyan shilling", "KES"], ["North Korean won", "KPW"], ["South Korean won", "KRW"], ["Kyrgyzstani som", "KGS"], ["Lao kip", "LAK"], ["Lesotho loti", "LSL"], ["South African rand", "ZAR"], ["Macanese pataca", "MOP"], ["Macedonian denar", "MKD"], ["Malagasy ariary", "MGA"], ["Malawian kwacha", "MWK"], ["Malaysian ringgit", "MYR"], ["Mauritanian ouguiya", "MRO"], ["Mongolian t\xF6gr\xF6g", "MNT"], ["Mozambican metical", "MZN"], ["Burmese kyat", "MMK"], ["Nicaraguan c\xF3rdoba", "NIO"], ["Nigerian naira", "NGN"], ["Turkish lira", "TRY"], ["Omani rial", "OMR"], ["Panamanian balboa", "PAB"], ["Papua New Guinean kina", "PGK"], ["Paraguayan guaran\xED", "PYG"], ["Peruvian sol", "PEN"], ["Polish z\u0142oty", "PLN"], ["Qatari riyal", "QAR"], ["Saudi riyal", "SAR"], ["Samoan t\u0101l\u0101", "WST"], ["S\xE3o Tom\xE9 and Pr\xEDncipe dobra", "STD"], ["Sierra Leonean leone", "SLL"], ["Swazi lilangeni", "SZL"], ["Tajikistani somoni", "TJS"], ["Thai baht", "THB"], ["Ukrainian hryvnia", "UAH"], ["Vanuatu vatu", "VUV"], ["Venezuelan bol\xEDvar", "VEF"], ["Zambian kwacha", "ZMW"], ["Moroccan dirham", "MAD"], ["United Arab Emirates dirham", "AED"], ["Azerbaijani manat", "AZN"], ["Turkmenistan manat", "TMT"], ["Somali shilling", "SOS"], ["Tanzanian shilling", "TZS"], ["Ugandan shilling", "UGX"], ["Romanian leu", "RON"], ["Moldovan leu", "MDL"], ["Nepalese rupee", "NPR"], ["Pakistani rupee", "PKR"], ["Indian rupee", "INR"], ["Seychellois rupee", "SCR"], ["Mauritian rupee", "MUR"], ["Maldivian rufiyaa", "MVR"], ["Sri Lankan rupee", "LKR"], ["Indonesian rupiah", "IDR"], ["Danish krone", "DKK"], ["Norwegian krone", "NOK"], ["Icelandic kr\xF3na", "ISK"], ["Swedish krona", "SEK"], ["West African CFA franc", "XOF"], ["Central African CFA franc", "XAF"], ["Comorian franc", "KMF"], ["Congolese franc", "CDF"], ["Burundian franc", "BIF"], ["Djiboutian franc", "DJF"], ["CFP franc", "XPF"], ["Guinean franc", "GNF"], ["Swiss franc", "CHF"], ["Rwandan franc", "RWF"], ["Russian ruble", "RUB"], ["Transnistrian ruble", "PRB"], ["Belarusian ruble", "BYN"], ["Algerian dinar", "DZD"], ["Bahraini dinar", "BHD"], ["Iraqi dinar", "IQD"], ["Jordanian dinar", "JOD"], ["Kuwaiti dinar", "KWD"], ["Libyan dinar", "LYD"], ["Serbian dinar", "RSD"], ["Tunisian dinar", "TND"], ["Argentine peso", "ARS"], ["Chilean peso", "CLP"], ["Colombian peso", "COP"], ["Cuban convertible peso", "CUC"], ["Cuban peso", "CUP"], ["Dominican peso", "DOP"], ["Mexican peso", "MXN"], ["Uruguayan peso", "UYU"], ["British pound", "GBP"], ["Saint Helena pound", "SHP"], ["Egyptian pound", "EGP"], ["Falkland Islands pound", "FKP"], ["Gibraltar pound", "GIP"], ["Manx pound", "IMP"], ["Jersey pound", "JEP"], ["Lebanese pound", "LBP"], ["South Sudanese pound", "SSP"], ["Sudanese pound", "SDG"], ["Syrian pound", "SYP"], ["United States dollar", "USD"], ["Australian dollar", "AUD"], ["Bahamian dollar", "BSD"], ["Barbadian dollar", "BBD"], ["Belize dollar", "BZD"], ["Bermudian dollar", "BMD"], ["Brunei dollar", "BND"], ["Singapore dollar", "SGD"], ["Canadian dollar", "CAD"], ["Cayman Islands dollar", "KYD"], ["New Zealand dollar", "NZD"], ["Fijian dollar", "FJD"], ["Guyanese dollar", "GYD"], ["Hong Kong dollar", "HKD"], ["Jamaican dollar", "JMD"], ["Liberian dollar", "LRD"], ["Namibian dollar", "NAD"], ["Solomon Islands dollar", "SBD"], ["Surinamese dollar", "SRD"], ["New Taiwan dollar", "TWD"], ["Trinidad and Tobago dollar", "TTD"], ["Tuvaluan dollar", "TVD"], ["Chinese yuan", "CNY"], ["Rial", "__RI"], ["Shiling", "__S"], ["Som", "__SO"], ["Dirham", "__DR"], ["Dinar", "_DN"], ["Dollar", "__D"], ["Manat", "__MA"], ["Rupee", "__R"], ["Krone", "__K"], ["Krona", "__K"], ["Crown", "__K"], ["Frank", "__F"], ["Mark", "__M"], ["Ruble", "__RB"], ["Peso", "__PE"], ["Pound", "__P"], ["Tristan da Cunha pound", "_TP"], ["South Georgia and the South Sandwich Islands pound", "_SP"], ["Somaliland shilling", "_SS"], ["Pitcairn Islands dollar", "_PND"], ["Palauan dollar", "_PD"], ["Niue dollar", "_NID"], ["Nauruan dollar", "_ND"], ["Micronesian dollar", "_MD"], ["Kiribati dollar", "_KID"], ["Guernsey pound", "_GGP"], ["Faroese kr\xF3na", "_FOK"], ["Cook Islands dollar", "_CKD"], ["British Virgin Islands dollar", "_BD"], ["Ascension pound", "_AP"], ["Alderney pound", "_ALP"], ["Abkhazian apsar", "_AA"]]);
  EnglishNumericWithUnit2.FractionalUnitNameToCodeMap = /* @__PURE__ */ new Map([["Jiao", "JIAO"], ["Kopek", "KOPEK"], ["Pul", "PUL"], ["Cent", "CENT"], ["Qindark\xEB", "QINDARKE"], ["Penny", "PENNY"], ["Santeem", "SANTEEM"], ["C\xEAntimo", "CENTIMO"], ["Centavo", "CENTAVO"], ["Luma", "LUMA"], ["Q\u0259pik", "Q\u018FPIK"], ["Fils", "FILS"], ["Poisha", "POISHA"], ["Kapyeyka", "KAPYEYKA"], ["Centime", "CENTIME"], ["Chetrum", "CHETRUM"], ["Paisa", "PAISA"], ["Fening", "FENING"], ["Thebe", "THEBE"], ["Sen", "SEN"], ["Stotinka", "STOTINKA"], ["Fen", "FEN"], ["C\xE9ntimo", "CENTIMO"], ["Lipa", "LIPA"], ["Hal\xE9\u0159", "HALER"], ["\xD8re", "\xD8RE"], ["Piastre", "PIASTRE"], ["Santim", "SANTIM"], ["Oyra", "OYRA"], ["Butut", "BUTUT"], ["Tetri", "TETRI"], ["Pesewa", "PESEWA"], ["Fill\xE9r", "FILLER"], ["Eyrir", "EYRIR"], ["Dinar", "DINAR"], ["Agora", "AGORA"], ["T\xEF\u0131n", "TIIN"], ["Chon", "CHON"], ["Jeon", "JEON"], ["Tyiyn", "TYIYN"], ["Att", "ATT"], ["Sente", "SENTE"], ["Dirham", "DIRHAM"], ["Rappen", "RAPPEN"], ["Avo", "AVO"], ["Deni", "DENI"], ["Iraimbilanja", "IRAIMBILANJA"], ["Tambala", "TAMBALA"], ["Laari", "LAARI"], ["Khoums", "KHOUMS"], ["Ban", "BAN"], ["M\xF6ng\xF6", "MONGO"], ["Pya", "PYA"], ["Kobo", "KOBO"], ["Kuru\u015F", "KURUS"], ["Baisa", "BAISA"], ["Cent\xE9simo", "CENTESIMO"], ["Toea", "TOEA"], ["Sentimo", "SENTIMO"], ["Grosz", "GROSZ"], ["Sene", "SENE"], ["Halala", "HALALA"], ["Para", "PARA"], ["\xD6re", "ORE"], ["Diram", "DIRAM"], ["Satang", "SATANG"], ["Seniti", "SENITI"], ["Millime", "MILLIME"], ["Tennesi", "TENNESI"], ["Kopiyka", "KOPIYKA"], ["Tiyin", "TIYIN"], ["H\xE0o", "HAO"], ["Ngwee", "NGWEE"]]);
  EnglishNumericWithUnit2.CompoundUnitConnectorRegex = `(?<spacer>and)`;
  EnglishNumericWithUnit2.CurrencyPrefixList = /* @__PURE__ */ new Map([["Dollar", "$"], ["United States dollar", "united states $|us$|us $|u.s. $|u.s $"], ["East Caribbean dollar", "east caribbean $"], ["Australian dollar", "australian $|australia $"], ["Bahamian dollar", "bahamian $|bahamia $"], ["Barbadian dollar", "barbadian $|barbadin $"], ["Belize dollar", "belize $"], ["Bermudian dollar", "bermudian $"], ["British Virgin Islands dollar", "british virgin islands $|bvi$|virgin islands $|virgin island $|british virgin island $"], ["Brunei dollar", "brunei $|b$"], ["Sen", "sen"], ["Singapore dollar", "singapore $|s$"], ["Canadian dollar", "canadian $|can$|c$|c $|canada $"], ["Cayman Islands dollar", "cayman islands $|ci$|cayman island $"], ["New Zealand dollar", "new zealand $|nz$|nz $"], ["Cook Islands dollar", "cook islands $|cook island $"], ["Fijian dollar", "fijian $|fiji $"], ["Guyanese dollar", "gy$|gy $|g$|g $"], ["Hong Kong dollar", "hong kong $|hk$|hkd|hk $"], ["Jamaican dollar", "jamaican $|j$|jamaica $"], ["Kiribati dollar", "kiribati $"], ["Liberian dollar", "liberian $|liberia $"], ["Micronesian dollar", "micronesian $"], ["Namibian dollar", "namibian $|nad|n$|namibia $"], ["Nauruan dollar", "nauruan $"], ["Niue dollar", "niue $"], ["Palauan dollar", "palauan $"], ["Pitcairn Islands dollar", "pitcairn islands $|pitcairn island $"], ["Solomon Islands dollar", "solomon islands $|si$|si $|solomon island $"], ["Surinamese dollar", "surinamese $|surinam $"], ["New Taiwan dollar", "nt$|nt $"], ["Trinidad and Tobago dollar", "trinidad and tobago $|trinidad $|trinidadian $"], ["Tuvaluan dollar", "tuvaluan $"], ["Samoan t\u0101l\u0101", "ws$"], ["Chinese yuan", "\uFFE5"], ["Japanese yen", "\xA5"], ["Euro", "\u20AC"], ["Pound", "\xA3"], ["Costa Rican col\xF3n", "\u20A1"], ["Turkish lira", "\u20BA"]]);
  EnglishNumericWithUnit2.AmbiguousCurrencyUnitList = ["din.", "kiwi", "kina", "kobo", "lari", "lipa", "napa", "para", "sfr.", "taka", "tala", "toea", "vatu", "yuan", "ang", "ban", "bob", "btn", "byr", "cad", "cop", "cup", "dop", "gip", "jod", "kgs", "lak", "lei", "mga", "mop", "nad", "omr", "pul", "sar", "sbd", "scr", "sdg", "sek", "sen", "sol", "sos", "std", "try", "yer", "yen"];
  EnglishNumericWithUnit2.InformationSuffixList = /* @__PURE__ */ new Map([["Bit", "-bit|bit|bits"], ["Kilobit", "kilobit|kilobits|kb|Kb|kbit"], ["Megabit", "megabit|megabits|mb|Mb|mbit"], ["Gigabit", "gigabit|gigabits|gb|Gb|gbit"], ["Terabit", "terabit|terabits|tb|Tb|tbit"], ["Petabit", "petabit|petabits|pb|Pb|pbit"], ["Byte", "-byte|byte|bytes"], ["Kilobyte", "-kilobyte|-kilobytes|kilobyte|kB|KB|kilobytes|kilo byte|kilo bytes|kbyte"], ["Megabyte", "-megabyte|-megabytes|megabyte|mB|MB|megabytes|mega byte|mega bytes|mbyte"], ["Gigabyte", "-gigabyte|-gigabytes|gigabyte|gB|GB|gigabytes|giga byte|giga bytes|gbyte"], ["Terabyte", "-terabyte|-terabytes|terabyte|tB|TB|terabytes|tera byte|tera bytes|tbyte"], ["Petabyte", "-petabyte|-petabytes|petabyte|pB|PB|petabytes|peta byte|peta bytes|pbyte"]]);
  EnglishNumericWithUnit2.AmbiguousDimensionUnitList = ["barrel", "barrels", "grain", "pound", "stone", "yards", "yard", "cord", "dram", "feet", "foot", "gill", "knot", "peck", "cup", "fps", "pts", "in", "dm", '"'];
  EnglishNumericWithUnit2.BuildPrefix = `(?<=(\\s|^))`;
  EnglishNumericWithUnit2.BuildSuffix = `(?=(\\s|\\W|$))`;
  EnglishNumericWithUnit2.LengthSuffixList = /* @__PURE__ */ new Map([["Kilometer", "km|kilometer|kilometre|kilometers|kilometres|kilo meter|kilo meters|kilo metres|kilo metre"], ["Hectometer", "hm|hectometer|hectometre|hectometers|hectometres|hecto meter|hecto meters|hecto metres|hecto metre"], ["Decameter", "dam|decameter|decametre|decameters|decametres|deca meter|deca meters|deca metres|deca metre"], ["Meter", "m|meter|metre|meters|metres"], ["Decimeter", "dm|decimeter|decimeters|decimetre|decimetres|deci meter|deci meters|deci metres|deci metre"], ["Centimeter", "cm|centimeter|centimeters|centimetre|centimetres|centi meter|centi meters|centi metres|centi metre"], ["Millimeter", "mm|millimeter|millimeters|millimetre|millimetres|milli meter|milli meters|milli metres|milli metre"], ["Micrometer", "\u03BCm|micrometer|micrometre|micrometers|micrometres|micro meter|micro meters|micro metres|micro metre"], ["Nanometer", "nm|nanometer|nanometre|nanometers|nanometres|nano meter|nano meters|nano metres|nano metre"], ["Picometer", "pm|picometer|picometre|picometers|picometres|pico meter|pico meters|pico metres|pico metre"], ["Mile", "-mile|mile|miles"], ["Yard", "yard|yards"], ["Inch", '-inch|inch|inches|in|"'], ["Foot", "-foot|foot|feet|ft"], ["Light year", "light year|light-year|light years|light-years"], ["Pt", "pt|pts"]]);
  EnglishNumericWithUnit2.AmbiguousLengthUnitList = ["m", "yard", "yards", "pm", "pt", "pts"];
  EnglishNumericWithUnit2.SpeedSuffixList = /* @__PURE__ */ new Map([["Meter per second", "meters / second|m/s|meters per second|metres per second|meter per second|metre per second"], ["Kilometer per hour", "km/h|kilometres per hour|kilometers per hour|kilometer per hour|kilometre per hour"], ["Kilometer per minute", "km/min|kilometers per minute|kilometres per minute|kilometer per minute|kilometre per minute"], ["Kilometer per second", "km/s|kilometers per second|kilometres per second|kilometer per second|kilometre per second"], ["Mile per hour", "mph|mile per hour|miles per hour|mi/h|mile / hour|miles / hour|miles an hour"], ["Knot", "kt|knot|kn"], ["Foot per second", "ft/s|foot/s|foot per second|feet per second|fps"], ["Foot per minute", "ft/min|foot/min|foot per minute|feet per minute"], ["Yard per minute", "yards per minute|yard per minute|yards / minute|yards/min|yard/min"], ["Yard per second", "yards per second|yard per second|yards / second|yards/s|yard/s"]]);
  EnglishNumericWithUnit2.TemperatureSuffixList = /* @__PURE__ */ new Map([["F", "degrees fahrenheit|degree fahrenheit|deg fahrenheit|degs fahrenheit|fahrenheit|\xB0f|degrees farenheit|degree farenheit|deg farenheit|degs farenheit|degrees f|degree f|deg f|degs f|farenheit|f"], ["K", "k|kelvin"], ["R", "rankine|\xB0r"], ["D", "delisle|\xB0de"], ["C", "degrees celsius|degree celsius|deg celsius|degs celsius|celsius|degrees celcius|degree celcius|celcius|deg celcius|degs celcius|degrees centigrade|degree centigrade|centigrade|degrees centigrate|degree centigrate|degs centigrate|deg centigrate|centigrate|degrees c|degree c|deg c|degs c|\xB0c|c"], ["Degree", "degree|degrees|deg.|deg|\xB0"]]);
  EnglishNumericWithUnit2.AmbiguousTemperatureUnitList = ["c", "f", "k"];
  EnglishNumericWithUnit2.VolumeSuffixList = /* @__PURE__ */ new Map([["Cubic meter", "m3|cubic meter|cubic meters|cubic metre|cubic metres"], ["Cubic centimeter", "cubic centimeter|cubic centimetre|cubic centimeters|cubic centimetres"], ["Cubic millimiter", "cubic millimiter|cubic millimitre|cubic millimiters|cubic millimitres"], ["Hectoliter", "hectoliter|hectolitre|hectoliters|hectolitres"], ["Decaliter", "decaliter|decalitre|dekaliter|dekalitre|decaliters|decalitres|dekaliters|dekalitres"], ["Liter", "l|litre|liter|liters|litres"], ["Deciliter", "dl|deciliter|decilitre|deciliters|decilitres"], ["Centiliter", "cl|centiliter|centilitre|centiliters|centilitres"], ["Milliliter", "ml|mls|millilitre|milliliter|millilitres|milliliters"], ["Cubic yard", "cubic yard|cubic yards"], ["Cubic inch", "cubic inch|cubic inches"], ["Cubic foot", "cubic foot|cubic feet"], ["Cubic mile", "cubic mile|cubic miles"], ["Fluid ounce", "fl oz|fluid ounce|fluid ounces"], ["Teaspoon", "teaspoon|teaspoons"], ["Tablespoon", "tablespoon|tablespoons"], ["Pint", "pint|pints"], ["Volume unit", "fluid dram|gill|quart|minim|barrel|cord|peck|bushel|hogshead"]]);
  EnglishNumericWithUnit2.AmbiguousVolumeUnitList = ["l", "ounce", "oz", "cup", "peck", "cord", "gill"];
  EnglishNumericWithUnit2.WeightSuffixList = /* @__PURE__ */ new Map([["Kilogram", "kg|kilogram|kilograms|kilo|kilos"], ["Gram", "g|gram|grams"], ["Milligram", "mg|milligram|milligrams"], ["Barrel", "barrels|barrel"], ["Gallon", "-gallon|gallons|gallon"], ["Metric ton", "metric tons|metric ton"], ["Ton", "-ton|ton|tons|tonne|tonnes"], ["Pound", "pound|pounds|lb"], ["Ounce", "-ounce|ounce|oz|ounces"], ["Weight unit", "pennyweight|grain|british long ton|US short hundredweight|stone|dram"]]);
  EnglishNumericWithUnit2.AmbiguousWeightUnitList = ["g", "oz", "stone", "dram"];
})(exports.EnglishNumericWithUnit || (exports.EnglishNumericWithUnit = {}));

// recognizers/recognizers-number-with-unit/src/numberWithUnit/english/base.ts
var EnglishNumberWithUnitExtractorConfiguration = class {
  constructor(ci) {
    this.cultureInfo = ci;
    this.unitNumExtractor = new recognizersTextNumber.EnglishNumberExtractor();
    this.buildPrefix = exports.EnglishNumericWithUnit.BuildPrefix;
    this.buildSuffix = exports.EnglishNumericWithUnit.BuildSuffix;
    this.connectorToken = "";
    this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumericWithUnit.CompoundUnitConnectorRegex);
    this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(BaseUnits.PmNonUnitRegex);
  }
};
var EnglishNumberWithUnitParserConfiguration = class extends BaseNumberWithUnitParserConfiguration {
  constructor(ci) {
    super(ci);
    this.internalNumberExtractor = new recognizersTextNumber.EnglishNumberExtractor(recognizersTextNumber.NumberMode.Default);
    this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.EnglishNumberParserConfiguration());
    this.connectorToken = "";
    this.currencyNameToIsoCodeMap = exports.EnglishNumericWithUnit.CurrencyNameToIsoCodeMap;
    this.currencyFractionCodeList = exports.EnglishNumericWithUnit.FractionalUnitNameToCodeMap;
  }
};

// recognizers/recognizers-number-with-unit/src/numberWithUnit/english/currency.ts
var EnglishCurrencyExtractorConfiguration = class extends EnglishNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_CURRENCY;
    this.suffixList = exports.EnglishNumericWithUnit.CurrencySuffixList;
    this.prefixList = exports.EnglishNumericWithUnit.CurrencyPrefixList;
    this.ambiguousUnitList = exports.EnglishNumericWithUnit.AmbiguousCurrencyUnitList;
  }
};
var EnglishCurrencyParserConfiguration = class extends EnglishNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
    }
    super(ci);
    this.BindDictionary(exports.EnglishNumericWithUnit.CurrencySuffixList);
    this.BindDictionary(exports.EnglishNumericWithUnit.CurrencyPrefixList);
  }
};
var EnglishTemperatureExtractorConfiguration = class extends EnglishNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_TEMPERATURE;
    this.suffixList = exports.EnglishNumericWithUnit.TemperatureSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = exports.EnglishNumericWithUnit.AmbiguousTemperatureUnitList;
  }
};
var EnglishTemperatureParserConfiguration = class extends EnglishNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
    }
    super(ci);
    this.BindDictionary(exports.EnglishNumericWithUnit.TemperatureSuffixList);
  }
};
var dimensionSuffixList = new Map([
  ...exports.EnglishNumericWithUnit.InformationSuffixList,
  ...exports.EnglishNumericWithUnit.AreaSuffixList,
  ...exports.EnglishNumericWithUnit.LengthSuffixList,
  ...exports.EnglishNumericWithUnit.SpeedSuffixList,
  ...exports.EnglishNumericWithUnit.VolumeSuffixList,
  ...exports.EnglishNumericWithUnit.WeightSuffixList
]);
var EnglishDimensionExtractorConfiguration = class extends EnglishNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_DIMENSION;
    this.suffixList = dimensionSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = exports.EnglishNumericWithUnit.AmbiguousDimensionUnitList;
  }
};
var EnglishDimensionParserConfiguration = class extends EnglishNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
    }
    super(ci);
    this.BindDictionary(dimensionSuffixList);
  }
};
var EnglishAgeExtractorConfiguration = class extends EnglishNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_AGE;
    this.suffixList = exports.EnglishNumericWithUnit.AgeSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = new Array();
  }
};
var EnglishAgeParserConfiguration = class extends EnglishNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
    }
    super(ci);
    this.BindDictionary(exports.EnglishNumericWithUnit.AgeSuffixList);
  }
};

// recognizers/recognizers-number-with-unit/src/resources/spanishNumericWithUnit.ts
exports.SpanishNumericWithUnit = void 0;
((SpanishNumericWithUnit2) => {
  SpanishNumericWithUnit2.AgeSuffixList = /* @__PURE__ */ new Map([["A\xF1o", "a\xF1os|a\xF1o"], ["Mes", "meses|mes"], ["Semana", "semanas|semana"], ["D\xEDa", "dias|d\xEDas|d\xEDa|dia"]]);
  SpanishNumericWithUnit2.AreaSuffixList = /* @__PURE__ */ new Map([["Kil\xF3metro cuadrado", "kil\xF3metro cuadrado|kil\xF3metros cuadrados|km2|km^2|km\xB2"], ["Hect\xF3metro cuadrado", "hect\xF3metro cuadrado|hect\xF3metros cuadrados|hm2|hm^2|hm\xB2|hect\xE1rea|hect\xE1reas"], ["Dec\xE1metro cuadrado", "dec\xE1metro cuadrado|dec\xE1metros cuadrados|dam2|dam^2|dam\xB2|\xE1rea|\xE1reas"], ["Metro cuadrado", "metro cuadrado|metros cuadrados|m2|m^2|m\xB2"], ["Dec\xEDmetro cuadrado", "dec\xEDmetro cuadrado|dec\xEDmetros cuadrados|dm2|dm^2|dm\xB2"], ["Cent\xEDmetro cuadrado", "cent\xEDmetro cuadrado|cent\xEDmetros cuadrados|cm2|cm^2|cm\xB2"], ["Mil\xEDmetro cuadrado", "mil\xEDmetro cuadrado|mil\xEDmetros cuadrados|mm2|mm^2|mm\xB2"], ["Pulgada cuadrado", "pulgada cuadrada|pulgadas cuadradas"], ["Pie cuadrado", "pie cuadrado|pies cuadrados|pie2|pie^2|pie\xB2|ft2|ft^2|ft\xB2"], ["Yarda cuadrado", "yarda cuadrada|yardas cuadradas|yd2|yd^2|yd\xB2"], ["Acre", "acre|acres"]]);
  SpanishNumericWithUnit2.AreaAmbiguousValues = ["\xE1rea", "\xE1reas"];
  SpanishNumericWithUnit2.CurrencySuffixList = /* @__PURE__ */ new Map([["D\xF3lar", "d\xF3lar|d\xF3lares"], ["Peso", "peso|pesos"], ["Rublo", "rublo|rublos"], ["Libra", "libra|libras"], ["Flor\xEDn", "flor\xEDn|florines"], ["Dinar", "dinar|dinares"], ["Franco", "franco|francos"], ["Rupia", "rupia|rupias"], ["Escudo", "escudo|escudos"], ["Chel\xEDn", "chel\xEDn|chelines"], ["Lira", "lira|liras"], ["Centavo", "centavo|centavos"], ["C\xE9ntimo", "c\xE9ntimo|c\xE9ntimos"], ["Cent\xE9simo", "cent\xE9simo|cent\xE9simos"], ["Penique", "penique|peniques"], ["Euro", "euro|euros|\u20AC|eur"], ["C\xE9ntimo de Euro", "c\xE9ntimo de euro|c\xE9ntimos de euros"], ["D\xF3lar del Caribe Oriental", "d\xF3lar del Caribe Oriental|d\xF3lares del Caribe Oriental|ec$|xcd"], ["Centavo del Caribe Oriental", "centavo del Caribe Oriental|centavos del Caribe Oriental"], ["Franco CFA de \xC1frica Occidental", "franco CFA de \xC1frica Occidental|francos CFA de \xC1frica Occidental|fcfa|xof"], ["C\xE9ntimo de CFA de \xC1frica Occidental", "c\xE9ntimo de CFA de \xC1frica Occidental|c\xE9ntimos de CFA de \xC1frica Occidental"], ["Franco CFA de \xC1frica Central", "franco CFA de \xC1frica Central|francos CFA de \xC1frica Central|xaf"], ["C\xE9ntimo de CFA de \xC1frica Central", "c\xE9ntimo de CFA de \xC1frica Central|c\xE9ntimos de CFA de \xC1frica Central"], ["Apsar", "apsar|apsares"], ["Afgani afgano", "afgani afgano|\u060B|afn|afganis|afgani"], ["Pul", "pul|puls"], ["Lek alban\xE9s", "lek|lek\xEB|lekes|lek alban\xE9s"], ["Qindarka", "qindarka|qindark\xEB|qindarkas"], ["Kwanza angole\xF1o", "kwanza angole\xF1o|kwanzas angole\xF1os|kwanza angole\xF1os|kwanzas angole\xF1o|kwanzas|aoa|kz"], ["C\xEAntimo angole\xF1o", "c\xEAntimo angole\xF1o|c\xEAntimo|c\xEAntimos"], ["Flor\xEDn antillano neerland\xE9s", "flor\xEDn antillano neerland\xE9s|flor\xEDnes antillano neerland\xE9s|\u0192 antillano neerland\xE9s|ang|na\u0192"], ["Cent antillano neerland\xE9s", "cent|centen"], ["Riyal saud\xED", "riyal saud\xED|riyales saud\xED|sar"], ["Halal\xE1 saud\xED", "halal\xE1 saud\xED|hallalah"], ["Dinar argelino", "dinar argelino|dinares argelinos|dzd"], ["C\xE9ntimo argelino", "centimo argelino|centimos argelinos|"], ["Peso argentino", "peso argentino|pesos argentinos|peso|pesos|ar$|ars"], ["Centavo argentino", "centavo argentino|centavos argentinos|centavo|ctvo.|ctvos."], ["Dram armenio", "dram armenio|dram armenios|dram|\u0564\u0580."], ["Luma armenio", "luma armenio|luma armenios"], ["Flor\xEDn arube\xF1o", "flor\xEDn arube\xF1o|florines arube\xF1os|\u0192 arube\xF1os|a\u0192|awg"], ["Yotin arube\xF1o", "yotin arube\xF1o|yotines arube\xF1os"], ["D\xF3lar australiano", "d\xF3lar australiano|d\xF3lares australianos|a$|aud"], ["Centavo australiano", "centavo australiano|centavos australianos"], ["Manat azer\xED", "manat azer\xED|man|azn"], ["Q\u0259pik azer\xED", "q\u0259pik azer\xED|q\u0259pik"], ["D\xF3lar bahame\xF1o", "d\xF3lar bahame\xF1o|d\xF3lares bahame\xF1os|b$|bsd"], ["Centavo bahame\xF1o", "centavo bahame\xF1o|centavos bahame\xF1os"], ["Dinar bahrein\xED", "dinar bahrein\xED|dinares bahreinies|bhd"], ["Fil bahrein\xED", "fil bahrein\xED|fils bahreinies"], ["Taka bangladesh\xED", "taka bangladesh\xED|takas bangladesh\xED|bdt"], ["Poisha bangladesh\xED", "poisha bangladesh\xED|poishas bangladesh\xED"], ["D\xF3lar de Barbados", "d\xF3lar de barbados|d\xF3lares de barbados|bbd"], ["Centavo de Barbados", "centavo de barbados|centavos de barbados"], ["D\xF3lar belice\xF1o", "d\xF3lar belice\xF1o|d\xF3lares belice\xF1os|bz$|bzd"], ["Centavo belice\xF1o", "centavo belice\xF1o|centavos belice\xF1os"], ["D\xF3lar bermude\xF1o", "d\xF3lar bermude\xF1o|d\xF3lares bermude\xF1os|bd$|bmd"], ["Centavo bermude\xF1o", "centavo bermude\xF1o|centavos bermude\xF1os"], ["Rublo bielorruso", "rublo bielorruso|rublos bielorrusos|br|byr"], ["K\xF3pek bielorruso", "k\xF3pek bielorruso|k\xF3peks bielorrusos|kap"], ["Kyat birmano", "kyat birmano|kyats birmanos|mmk"], ["Pya birmano", "pya birmano|pyas birmanos"], ["Boliviano", "boliviano|bolivianos|bob|bs"], ["Cent\xE9simo Boliviano", "cent\xE9simo boliviano|cent\xE9simos bolivianos"], ["Marco bosnioherzegovino", "marco convertible|marco bosnioherzegovino|marcos convertibles|marcos bosnioherzegovinos|bam"], ["Feningas bosnioherzegovino", "feninga convertible|feninga bosnioherzegovina|feningas convertibles"], ["Pula", "pula|bwp"], ["Thebe", "thebe"], ["Real brasile\xF1o", "real brasile\xF1o|reales brasile\xF1os|r$|brl"], ["Centavo brasile\xF1o", "centavo brasile\xF1o|centavos brasile\xF1os"], ["D\xF3lar de Brun\xE9i", "d\xF3lar de brunei|d\xF3lares de brun\xE9i|bnd"], ["Sen de Brun\xE9i", "sen|sen de brun\xE9i"], ["Lev b\xFAlgaro", "lev b\xFAlgaro|leva b\xFAlgaros|lv|bgn"], ["Stotinki b\xFAlgaro", "stotinka b\xFAlgaro|stotinki b\xFAlgaros"], ["Franco de Burundi", "franco de burundi|francos de burundi|fbu|fib"], ["C\xE9ntimo Burundi", "c\xE9ntimo burundi|c\xE9ntimos burundies"], ["Ngultrum butan\xE9s", "ngultrum butan\xE9s|ngultrum butaneses|btn"], ["Chetrum  butan\xE9s", "chetrum butan\xE9s|chetrum butaneses"], ["Escudo caboverdiano", "escudo caboverdiano|escudos caboverdianos|cve"], ["Riel camboyano", "riel camboyano|rieles camboyanos|khr"], ["D\xF3lar canadiense", "d\xF3lar canadiense|d\xF3lares canadienses|c$|cad"], ["Centavo canadiense", "centavo canadiense|centavos canadienses"], ["Peso chileno", "peso chileno|pesos chilenos|cpl"], ["Yuan chino", "yuan chino|yuanes chinos|yuan|yuanes|renminbi|rmb|cny|\xA5"], ["Peso colombiano", "peso colombiano|pesos colombianos|cop|col$"], ["Centavo colombiano", "centavo colombiano|centavos colombianos"], ["Franco comorano", "franco comorano|francos comoranos|kmf|\u20A3"], ["Franco congole\xF1o", "franco congole\xF1o|francos congole\xF1os|cdf"], ["C\xE9ntimo congole\xF1o", "c\xE9ntimo congole\xF1o|c\xE9ntimos congole\xF1os"], ["Won norcoreano", "won norcoreano|w\u014Fn norcoreano|w\u014Fn norcoreanos|kpw"], ["Chon norcoreano", "chon norcoreano|ch\u014Fn norcoreano|ch\u014Fn norcoreanos|chon norcoreanos"], ["Won surcoreano", "w\u014Fn surcoreano|won surcoreano|w\u014Fnes surcoreanos|wones surcoreanos|krw"], ["Chon surcoreano", "chon surcoreano|ch\u014Fn surcoreano|ch\u014Fn surcoreanos|chon surcoreanos"], ["Col\xF3n costarricense", "col\xF3n costarricense|colones costarricenses|crc"], ["Kuna croata", "kuna croata|kuna croatas|hrk"], ["Lipa croata", "lipa croata|lipa croatas"], ["Peso cubano", "peso cubano|pesos cubanos|cup"], ["Peso cubano convertible", "peso cubano convertible|pesos cubanos convertible|cuc"], ["Corona danesa", "corona danesa|coronas danesas|dkk"], ["Libra egipcia", "libra egipcia|libras egipcias|egp|le"], ["Piastra egipcia", "piastra egipcia|piastras egipcias"], ["Col\xF3n salvadore\xF1o", "col\xF3n salvadore\xF1o|colones salvadore\xF1os|svc"], ["Dirham de los Emiratos \xC1rabes Unidos", "dirham|dirhams|dirham de los Emiratos \xC1rabes Unidos|aed|dhs"], ["Nakfa", "nakfa|nfk|ern"], ["C\xE9ntimo de Nakfa", "c\xE9ntimo de nakfa|c\xE9ntimos de nakfa"], ["Peseta", "peseta|pesetas|pts.|ptas.|esp"], ["D\xF3lar estadounidense", "d\xF3lar estadounidense|d\xF3lares estadounidenses|usd|u$d|us$"], ["Corona estonia", "corona estonia|coronas estonias|eek"], ["Senti estonia", "senti estonia|senti estonias"], ["Birr et\xEDope", "birr et\xEDope|birr et\xEDopes|br|etb"], ["Santim et\xEDope", "santim et\xEDope|santim et\xEDopes"], ["Peso filipino", "peso filipino|pesos filipinos|php"], ["Marco finland\xE9s", "marco finland\xE9s|marcos finlandeses"], ["D\xF3lar fiyiano", "d\xF3lar fiyiano|d\xF3lares fiyianos|fj$|fjd"], ["Centavo fiyiano", "centavo fiyiano|centavos fiyianos"], ["Dalasi", "dalasi|gmd"], ["Bututs", "butut|bututs"], ["Lari georgiano", "lari georgiano|lari georgianos|gel"], ["Tetri georgiano", "tetri georgiano|tetri georgianos"], ["Cedi", "cedi|ghs|gh\u20B5"], ["Pesewa", "pesewa"], ["Libra gibraltare\xF1a", "libra gibraltare\xF1a|libras gibraltare\xF1as|gip"], ["Penique gibraltare\xF1a", "penique gibraltare\xF1a|peniques gibraltare\xF1as"], ["Quetzal guatemalteco", "quetzal guatemalteco|quetzales guatemaltecos|quetzal|quetzales|gtq"], ["Centavo guatemalteco", "centavo guatemalteco|centavos guatemaltecos"], ["Libra de Guernsey", "libra de Guernsey|libras de Guernsey|ggp"], ["Penique de Guernsey", "penique de Guernsey|peniques de Guernsey"], ["Franco guineano", "franco guineano|francos guineanos|gnf|fg"], ["C\xE9ntimo guineano", "c\xE9ntimo guineano|c\xE9ntimos guineanos"], ["D\xF3lar guyan\xE9s", "d\xF3lar guyan\xE9s|d\xF3lares guyaneses|gyd|gy"], ["Gourde haitiano", "gourde haitiano|gourde haitianos|htg"], ["C\xE9ntimo haitiano", "c\xE9ntimo haitiano|c\xE9ntimos haitianos"], ["Lempira hondure\xF1o", "lempira hondure\xF1o|lempira hondure\xF1os|hnl"], ["Centavo hondure\xF1o", "centavo hondure\xF1o|centavos hondure\xF1o"], ["D\xF3lar de Hong Kong", "d\xF3lar de hong kong|d\xF3lares de hong kong|hk$|hkd"], ["Forinto h\xFAngaro", "forinto h\xFAngaro|forinto h\xFAngaros|huf"], ["Rupia india", "rupia india|rupias indias|inr"], ["Paisa india", "paisa india|paise indias"], ["Rupia indonesia", "rupia indonesia|rupias indonesias|idr"], ["Sen indonesia", "sen indonesia|sen indonesias"], ["Rial iran\xED", "rial iran\xED|rial iranies|irr"], ["Dinar iraqu\xED", "dinar iraqu\xED|dinares iraquies|iqd"], ["Fil iraqu\xED", "fil iraqu\xED|fils iraquies"], ["Libra manesa", "libra manesa|libras manesas|imp"], ["Penique manes", "penique manes|peniques maneses"], ["Corona islandesa", "corona islandesa|coronas islandesas|isk|\xEDkr"], ["Aurar islandes", "aurar islandes|aurar islandeses"], ["D\xF3lar de las Islas Caim\xE1n", "d\xF3lar de las Islas Caim\xE1n|d\xF3lares de las Islas Caim\xE1n|ci$|kyd"], ["D\xF3lar de las Islas Cook", "d\xF3lar de las Islas Cook|d\xF3lares de las Islas Cook"], ["Corona feroesa", "corona feroesa|coronas feroesas|fkr"], ["Libra malvinense", "libra malvinense|libras malvinenses|fk\xA3|fkp"], ["D\xF3lar de las Islas Salom\xF3n", "d\xF3lar de las Islas Salom\xF3n|d\xF3lares de las Islas Salom\xF3n|sbd"], ["Nuevo sh\xE9quel", "nuevo sh\xE9quel|nuevos sh\xE9quel|ils"], ["Agorot", "agorot"], ["D\xF3lar jamaiquino", "d\xF3lar jamaiquino|d\xF3lares jamaiquinos|j$|ja$|jmd"], ["Yen", "yen|yenes|jpy"], ["Libra de Jersey", "libra de Jersey|libras de Jersey|jep"], ["Dinar jordano", "dinar jordano|dinares jordanos|jd|jod"], ["Piastra jordano", "piastra jordano|piastras jordanos"], ["Tenge kazajo", "tenge|tenge kazajo|kzt"], ["Chel\xEDn keniano", "chel\xEDn keniano|chelines kenianos|ksh|kes"], ["Som kirgu\xEDs", "som kirgu\xEDs|kgs"], ["Tyiyn", "tyiyn"], ["D\xF3lar de Kiribati", "d\xF3lar de Kiribati|d\xF3lares de Kiribati"], ["Dinar kuwait\xED", "dinar kuwait\xED|dinares kuwait\xED"], ["Kip laosiano", "kip|kip laosiano|kip laosianos|lak"], ["Att laosiano", "att|att laosiano|att laosianos"], ["Loti", "loti|maloti|lsl"], ["Sente", "sente|lisente"], ["Libra libanesa", "libra libanesa|libras libanesas|lbp"], ["D\xF3lar liberiano", "d\xF3lar liberiano|d\xF3lares liberianos|l$|lrd"], ["Dinar libio", "dinar libio|dinares libios|ld|lyd"], ["Dirham libio", "dirham libio|dirhams libios"], ["Litas lituana", "litas lituana|litai lituanas|ltl"], ["Pataca macaense", "pataca macaense|patacas macaenses|mop$|mop"], ["Avo macaense", "avo macaense|avos macaenses"], ["Ho macaense", "ho macaense|ho macaenses"], ["Denar macedonio", "denar macedonio|denare macedonios|den|mkd"], ["Deni macedonio", "deni macedonio|deni macedonios"], ["Ariary malgache", "ariary malgache|ariary malgaches|mga"], ["Iraimbilanja malgache", "iraimbilanja malgache|iraimbilanja malgaches"], ["Ringgit malayo", "ringgit malayo|ringgit malayos|rm|myr"], ["Sen malayo", "sen malayo|sen malayos"], ["Kwacha malau\xED", "kwacha malau\xED|mk|mwk"], ["T\xE1mbala malau\xED", "t\xE1mbala malau\xED"], ["Rupia de Maldivas", "rupia de Maldivas|rupias de Maldivas|mvr"], ["Dirham marroqu\xED", "dirham marroqu\xED|dirhams marroquies|mad"], ["Rupia de Mauricio", "rupia de Mauricio|rupias de Mauricio|mur"], ["Uguiya", "uguiya|uguiyas|mro"], ["Jum", "jum|jums"], ["Peso mexicano", "peso mexicano|pesos mexicanos|mxn"], ["Centavo mexicano", "centavo mexicano|centavos mexicanos"], ["Leu moldavo", "leu moldavo|lei moldavos|mdl"], ["Ban moldavo", "ban moldavo|bani moldavos"], ["Tugrik mongol", "tugrik mongol|tugrik|tugrik mongoles|tug|mnt"], ["Metical mozambique\xF1o", "metical|metical mozambique\xF1o|meticales|meticales mozambique\xF1os|mtn|mzn"], ["Dram de Nagorno Karabaj", "dram de Nagorno Karabaj|drams de Nagorno Karabaj|"], ["Luma de Nagorno Karabaj", "luma de Nagorno Karabaj"], ["D\xF3lar namibio", "d\xF3lar namibio|d\xF3lares namibios|n$|nad"], ["Centavo namibio", "centavo namibio|centavos namibios"], ["Rupia nepal\xED", "rupia nepal\xED|rupias nepalies|npr"], ["Paisa nepal\xED", "paisa nepal\xED|paisas nepalies"], ["C\xF3rdoba nicarag\xFCense", "c\xF3rdoba nicarag\xFCense|c\xF3rdobas nicarag\xFCenses|c$|nio"], ["Centavo nicarag\xFCense", "centavo nicarag\xFCense|centavos nicarag\xFCenses"], ["Naira", "naira|ngn"], ["Kobo", "kobo"], ["Corona noruega", "corona noruega|coronas noruegas|nok"], ["Franco CFP", "franco cfp|francos cfp|xpf"], ["D\xF3lar neozeland\xE9s", "d\xF3lar neozeland\xE9s|d\xF3lares neozelandeses|d\xF3lar de Nueva Zelanda|d\xF3lares de Nueva Zelanda|nz$|nzd"], ["Centavo neozeland\xE9s", "centavo neozeland\xE9s|centavo de Nueva Zelanda|centavos de Nueva Zelanda|centavos neozelandeses"], ["Rial oman\xED", "rial oman\xED|riales omanies|omr"], ["Baisa oman\xED", "baisa oman\xED|baisa omanies"], ["Flor\xEDn neerland\xE9s", "flor\xEDn neerland\xE9s|florines neerlandeses|nlg"], ["Rupia pakistan\xED", "rupia pakistan\xED|rupias pakistanies|pkr"], ["Paisa pakistan\xED", "paisa pakistan\xED|paisas pakistanies"], ["Balboa paname\xF1o", "balboa paname\xF1o|balboa paname\xF1os|pab"], ["Cent\xE9simo paname\xF1o", "cent\xE9simo paname\xF1o|cent\xE9simos paname\xF1os"], ["Kina", "kina|pkg|pgk"], ["Toea", "toea"], ["Guaran\xED", "guaran\xED|guaranies|gs|pyg"], ["Sol", "sol|soles|nuevo sol|pen|s#."], ["C\xE9ntimo de sol", "c\xE9ntimo de sol|c\xE9ntimos de sol"], ["Z\u0142oty", "z\u0142oty|esloti|eslotis|z\u0142|pln"], ["Groszy", "groszy"], ["Riyal qatar\xED", "riyal qatar\xED|riyal qataries|qr|qar"], ["Dirham qatar\xED", "dirham qatar\xED|dirhams qataries"], ["Libra esterlina", "libra esterlina|libras esterlinas|gbp"], ["Corona checa", "corona checa|coronas checas|kc|czk"], ["Peso dominicano", "peso dominicano|pesos dominicanos|rd$|dop"], ["Centavo dominicano", "centavo dominicano|centavos dominicanos"], ["Franco ruand\xE9s", "franco ruand\xE9s|francos ruandeses|rf|rwf"], ["C\xE9ntimo ruand\xE9s", "c\xE9ntimo ruand\xE9s|c\xE9ntimos ruandeses"], ["Leu rumano", "leu rumano|lei rumanos|ron"], ["Ban rumano", "ban rumano|bani rumanos"], ["Rublo ruso", "rublo ruso|rublos rusos|rub"], ["Kopek ruso", "kopek ruso|kopeks rusos"], ["Tala", "tala|t\u0101l\u0101|ws$|sat|wst"], ["Sene", "sene"], ["Libra de Santa Helena", "libra de Santa Helena|libras de Santa Helena|shp"], ["Penique de Santa Helena", "penique de Santa Helena|peniques de Santa Helena"], ["Dobra", "dobra|db|std"], ["Dinar serbio", "dinar serbio|dinares serbios|rsd"], ["Para serbio", "para serbio|para serbios"], ["Rupia de Seychelles", "rupia de Seychelles|rupias de Seychelles|scr"], ["Centavo de Seychelles", "centavo de Seychelles|centavos de Seychelles"], ["Leone", "leone|le|sll"], ["D\xF3lar de Singapur", "d\xF3lar de singapur|d\xF3lares de singapur|sgb"], ["Centavo de Singapur", "centavo de Singapur|centavos de Singapur"], ["Libra siria", "libra siria|libras sirias|s\xA3|syp"], ["Piastra siria", "piastra siria|piastras sirias"], ["Chel\xEDn somal\xED", "chel\xEDn somal\xED|chelines somalies|sos"], ["Centavo somal\xED", "centavo somal\xED|centavos somalies"], ["Chel\xEDn somaliland\xE9s", "chel\xEDn somaliland\xE9s|chelines somalilandeses"], ["Centavo somaliland\xE9s", "centavo somaliland\xE9s|centavos somalilandeses"], ["Rupia de Sri Lanka", "rupia de Sri Lanka|rupias de Sri Lanka|lkr"], ["C\xE9ntimo de Sri Lanka", "c\xE9ntimo de Sri Lanka|c\xE9ntimos de Sri Lanka"], ["Lilangeni", "lilangeni|emalangeni|szl"], ["Rand sudafricano", "rand|rand sudafricano|zar"], ["Libra sudanesa", "libra sudanesa|libras sudanesas|sdg"], ["Piastra sudanesa", "piastra sudanesa|piastras sudanesas"], ["Libra sursudanesa", "libra sursudanesa|libras sursudanesa|ssp"], ["Piastra sursudanesa", "piastra sursudanesa|piastras sursudanesas"], ["Corona sueca", "corona sueca|coronas suecas|sek"], ["Franco suizo", "franco suizo|francos suizos|sfr|chf"], ["Rappen suizo", "rappen suizo|rappens suizos"], ["D\xF3lar surinam\xE9s", "\xF3olar surinam\xE9s|d\xF3lares surinameses|srd"], ["Centavo surinam\xE9s", "centavo surinam\xE9s|centavos surinam\xE9s"], ["Baht tailand\xE9s", "baht tailand\xE9s|baht tailandeses|thb"], ["Satang tailand\xE9s", "satang tailand\xE9s|satang tailandeses"], ["Nuevo d\xF3lar taiwan\xE9s", "nuevo d\xF3lar taiwan\xE9s|d\xF3lar taiwan\xE9s|d\xF3lares taiwaneses|twd"], ["Centavo taiwan\xE9s", "centavo taiwan\xE9s|centavos taiwaneses"], ["Chel\xEDn tanzano", "chel\xEDn tanzano|chelines tanzanos|tzs"], ["Centavo tanzano", "centavo tanzano|centavos tanzanos"], ["Somoni tayiko", "somoni tayiko|somoni|tjs"], ["Diram", "diram|dirams"], ["Pa\u02BBanga", "d\xF3lar tongano|d\xF3lares tonganos|pa\u02BBanga|pa'anga|top"], ["Seniti", "seniti"], ["Rublo de Transnistria", "rublo de Transnistria|rublos de Transnistria"], ["Kopek de Transnistria", "kopek de Transnistria|kopeks de Transnistria"], ["D\xF3lar trinitense", "d\xF3lar trinitense|d\xF3lares trinitenses|ttd"], ["Centavo trinitense", "centavo trinitense|centavos trinitenses"], ["Dinar tunecino", "dinar tunecino|dinares tunecinos|tnd"], ["Millime tunecino", "millime tunecino|millimes tunecinos"], ["Lira turca", "lira turca|liras turcas|try"], ["Kuru\u015F turca", "kuru\u015F turca|kuru\u015F turcas"], ["Manat turkmeno", "manat turkmeno|manat turkmenos|tmt"], ["Tennesi turkmeno", "tennesi turkmeno|tenge turkmeno"], ["D\xF3lar tuvaluano", "d\xF3lar tuvaluano|d\xF3lares tuvaluanos"], ["Centavo tuvaluano", "centavo tuvaluano|centavos tuvaluanos"], ["Grivna", "grivna|grivnas|uah"], ["Kopiyka", "kopiyka|k\xF3peks"], ["Chel\xEDn ugand\xE9s", "chel\xEDn ugand\xE9s|chelines ugandeses|ugx"], ["Centavo ugand\xE9s", "centavo ugand\xE9s|centavos ugandeses"], ["Peso uruguayo", "peso uruguayo|pesos uruguayos|uyu"], ["Cent\xE9simo uruguayo", "cent\xE9simo uruguayo|cent\xE9simos uruguayos"], ["Som uzbeko", "som uzbeko|som uzbekos|uzs"], ["Tiyin uzbeko", "tiyin uzbeko|tiyin uzbekos"], ["Vatu", "vatu|vuv"], ["Bol\xEDvar fuerte", "bol\xEDvar fuerte|bol\xEDvar|bol\xEDvares|vef"], ["C\xE9ntimo de bol\xEDvar", "c\xE9ntimo de bol\xEDvar|c\xE9ntimos de bol\xEDvar"], ["\u0110\u1ED3ng vietnamita", "\u0110\u1ED3ng vietnamita|dong vietnamita|dong vietnamitas|vnd"], ["H\xE0o vietnamita", "H\xE0o vietnamita|hao vietnamita|hao vietnamitas"], ["Rial yemen\xED", "rial yemen\xED|riales yemenies|yer"], ["Fils yemen\xED", "fils yemen\xED|fils yemenies"], ["Franco yibutiano", "franco yibutiano|francos yibutianos|djf"], ["Dinar yugoslavo", "dinar yugoslavo|dinares yugoslavos|yud"], ["Kwacha zambiano", "kwacha zambiano|kwacha zambianos|zmw"], ["Ngwee zambiano", "ngwee zambiano|ngwee zambianos"]]);
  SpanishNumericWithUnit2.CompoundUnitConnectorRegex = `(?<spacer>[^.])`;
  SpanishNumericWithUnit2.CurrencyPrefixList = /* @__PURE__ */ new Map([["D\xF3lar", "$"], ["D\xF3lar estadounidense", "us$|u$d|usd"], ["D\xF3lar del Caribe Oriental", "ec$|xcd"], ["D\xF3lar australiano", "a$|aud"], ["D\xF3lar bahame\xF1o", "b$|bsd"], ["D\xF3lar de Barbados", "bds$|bbd"], ["D\xF3lar belice\xF1o", "bz$|bzd"], ["D\xF3lar bermude\xF1o", "bd$|bmd"], ["D\xF3lar de Brun\xE9i", "brun\xE9i $|bnd"], ["D\xF3lar de Singapur", "s$|sgd"], ["D\xF3lar canadiense", "c$|can$|cad"], ["D\xF3lar de las Islas Caim\xE1n", "ci$|kyd"], ["D\xF3lar neozeland\xE9s", "nz$|nzd"], ["D\xF3lar fiyiano", "fj$|fjd"], ["D\xF3lar guyan\xE9s", "gy$|gyd"], ["D\xF3lar de Hong Kong", "hk$|hkd"], ["D\xF3lar jamaiquino", "j$|ja$|jmd"], ["D\xF3lar liberiano", "l$|lrd"], ["D\xF3lar namibio", "n$|nad"], ["D\xF3lar de las Islas Salom\xF3n", "si$|sbd"], ["Nuevo d\xF3lar taiwan\xE9s", "nt$|twd"], ["Real brasile\xF1o", "r$|brl"], ["Guaran\xED", "\u20B2|gs.|pyg"], ["D\xF3lar trinitense", "tt$|ttd"], ["Yuan chino", "\uFFE5|cny|rmb"], ["Yen", "\xA5|jpy"], ["Euro", "\u20AC|eur"], ["Flor\xEDn", "\u0192"], ["Libra", "\xA3|gbp"], ["Col\xF3n costarricense", "\u20A1"], ["Lira turca", "\u20BA"]]);
  SpanishNumericWithUnit2.AmbiguousCurrencyUnitList = ["le"];
  SpanishNumericWithUnit2.DimensionSuffixList = /* @__PURE__ */ new Map([["Kil\xF3metro", "km|kilometro|kil\xF3metro|kilometros|kil\xF3metros"], ["Hect\xF3metro", "hm|hectometro|hect\xF3metro|hectometros|hect\xF3metros"], ["Dec\xE1metro", "decametro|dec\xE1metro|decametros|dec\xE1metros|dam"], ["Metro", "m|m.|metro|metros"], ["Dec\xEDmetro", "dm|decimetro|dec\xEDmetro|decimetros|dec\xEDmetros"], ["Cent\xEDmetro", "cm|centimetro|cent\xEDmetro|centimetros|centimetros"], ["Mil\xEDmetro", "mm|milimetro|mil\xEDmetro|milimetros|mil\xEDmetros"], ["Micr\xF3metro", "\xB5m|um|micrometro|micr\xF3metro|micrometros|micr\xF3metros|micr\xF3n|micr\xF3nes"], ["Nan\xF3metro", "nm|nanometro|nan\xF3metro|nanometros|nan\xF3metros"], ["Pic\xF3metro", "pm|picometro|pic\xF3metro|picometros|picometros"], ["Milla", "mi|milla|millas"], ["Yarda", "yd|yarda|yardas"], ["Pulgada", 'pulgada|pulgadas|"'], ["Pie", "pie|pies|ft"], ["A\xF1o luz", "a\xF1o luz|a\xF1os luz|al"], ["Metro por segundo", "metro/segundo|m/s|metro por segundo|metros por segundo|metros por segundos"], ["Kil\xF3metro por hora", "km/h|kil\xF3metro por hora|kilometro por hora|kil\xF3metros por hora|kilometros por hora|kil\xF3metro/hora|kilometro/hora|kil\xF3metros/hora|kilometros/hora"], ["Kil\xF3metro por minuto", "km/min|kil\xF3metro por minuto|kilometro por minuto|kil\xF3metros por minuto|kilometros por minuto|kil\xF3metro/minuto|kilometro/minuto|kil\xF3metros/minuto|kilometros/minuto"], ["Kil\xF3metro por segundo", "km/seg|kil\xF3metro por segundo|kilometro por segundo|kil\xF3metros por segundo|kilometros por segundo|kil\xF3metro/segundo|kilometro/segundo|kil\xF3metros/segundo|kilometros/segundo"], ["Milla por hora", "mph|milla por hora|mi/h|milla/hora|millas/hora|millas por hora"], ["Nudo", "kt|nudo|nudos|kn"], ["Pie por segundo", "ft/s|pie/s|ft/seg|pie/seg|pie por segundo|pies por segundo"], ["Pie por minuto", "ft/min|pie/min|pie por minuto|pies por minuto"], ["Yarda por minuto", "yardas por minuto|yardas/minuto|yardas/min"], ["Yarda por segundo", "yardas por segundo|yardas/segundo|yardas/seg"], ["Kil\xF3metro cuadrado", "kil\xF3metro cuadrado|kil\xF3metros cuadrados|km2|km^2|km\xB2"], ["Hect\xF3metro cuadrado", "hect\xF3metro cuadrado|hect\xF3metros cuadrados|hm2|hm^2|hm\xB2|hect\xE1rea|hect\xE1reas"], ["Dec\xE1metro cuadrado", "dec\xE1metro cuadrado|dec\xE1metros cuadrados|dam2|dam^2|dam\xB2|\xE1rea|\xE1reas"], ["Metro cuadrado", "metro cuadrado|metros cuadrados|m2|m^2|m\xB2"], ["Dec\xEDmetro cuadrado", "dec\xEDmetro cuadrado|dec\xEDmetros cuadrados|dm2|dm^2|dm\xB2"], ["Cent\xEDmetro cuadrado", "cent\xEDmetro cuadrado|cent\xEDmetros cuadrados|cm2|cm^2|cm\xB2"], ["Mil\xEDmetro cuadrado", "mil\xEDmetro cuadrado|mil\xEDmetros cuadrados|mm2|mm^2|mm\xB2"], ["Pulgada cuadrado", "pulgada cuadrada|pulgadas cuadradas"], ["Pie cuadrado", "pie cuadrado|pies cuadrados|pie2|pie^2|pie\xB2|ft2|ft^2|ft\xB2"], ["Yarda cuadrado", "yarda cuadrada|yardas cuadradas|yd2|yd^2|yd\xB2"], ["Acre", "acre|acres"], ["Kil\xF3metro c\xFAbico", "kil\xF3metro c\xFAbico|kil\xF3metros c\xFAbico|km3|km^3|km\xB3"], ["Hect\xF3metro c\xFAbico", "hect\xF3metro c\xFAbico|hect\xF3metros c\xFAbico|hm3|hm^3|hm\xB3"], ["Dec\xE1metro c\xFAbico", "dec\xE1metro c\xFAbico|dec\xE1metros c\xFAbico|dam3|dam^3|dam\xB3"], ["Metro c\xFAbico", "metro c\xFAbico|metros c\xFAbico|m3|m^3|m\xB3"], ["Dec\xEDmetro c\xFAbico", "dec\xEDmetro c\xFAbico|dec\xEDmetros c\xFAbico|dm3|dm^3|dm\xB3"], ["Cent\xEDmetro c\xFAbico", "cent\xEDmetro c\xFAbico|cent\xEDmetros c\xFAbico|cc|cm3|cm^3|cm\xB3"], ["Mil\xEDmetro c\xFAbico", "mil\xEDmetro c\xFAbico|mil\xEDmetros c\xFAbico|mm3|mm^3|mm\xB3"], ["Pulgada c\xFAbica", "pulgada c\xFAbics|pulgadas c\xFAbicas"], ["Pie c\xFAbico", "pie c\xFAbico|pies c\xFAbicos|pie3|pie^3|pie\xB3|ft3|ft^3|ft\xB3"], ["Yarda c\xFAbica", "yarda c\xFAbica|yardas c\xFAbicas|yd3|yd^3|yd\xB3"], ["Hectolitro", "hectolitro|hectolitros|hl"], ["Litro", "litro|litros|lts|l"], ["Mililitro", "mililitro|mililitros|ml"], ["Gal\xF3n", "gal\xF3n|galones"], ["Pinta", "pinta|pintas"], ["Barril", "barril|barriles"], ["Onza l\xEDquida", "onza l\xEDquida|onzas l\xEDquidas"], ["Tonelada m\xE9trica", "tonelada m\xE9trica|toneladas m\xE9tricas"], ["Tonelada", "ton|tonelada|toneladas"], ["Kilogramo", "kg|kilogramo|kilogramos"], ["Hectogramo", "hg|hectogramo|hectogramos"], ["Decagramo", "dag|decagramo|decagramos"], ["Gramo", "g|gr|gramo|gramos"], ["Decigramo", "dg|decigramo|decigramos"], ["Centigramo", "cg|centigramo|centigramos"], ["Miligramo", "mg|miligramo|miligramos"], ["Microgramo", "\xB5g|ug|microgramo|microgramos"], ["Nanogramo", "ng|nanogramo|nanogramos"], ["Picogramo", "pg|picogramo|picogramos"], ["Libra", "lb|libra|libras"], ["Onza", "oz|onza|onzas"], ["Grano", "grano|granos"], ["Quilate", "ct|kt|quilate|quilates"], ["bit", "bit|bits"], ["kilobit", "kilobit|kilobits|kb|kbit"], ["megabit", "megabit|megabits|Mb|Mbit"], ["gigabit", "gigabit|gigabits|Gb|Gbit"], ["terabit", "terabit|terabits|Tb|Tbit"], ["petabit", "petabit|petabits|Pb|Pbit"], ["kibibit", "kibibit|kibibits|kib|kibit"], ["mebibit", "mebibit|mebibits|Mib|Mibit"], ["gibibit", "gibibit|gibibits|Gib|Gibit"], ["tebibit", "tebibit|tebibits|Tib|Tibit"], ["pebibit", "pebibit|pebibits|Pib|Pibit"], ["byte", "byte|bytes"], ["kilobyte", "kilobyte|kilobytes|kB|kByte"], ["megabyte", "megabyte|megabytes|MB|MByte"], ["gigabyte", "gigabyte|gigabytes|GB|GByte"], ["terabyte", "terabyte|terabytes|TB|TByte"], ["petabyte", "petabyte|petabytes|PB|PByte"], ["kibibyte", "kibibyte|kibibytes|kiB|kiByte"], ["mebibyte", "mebibyte|mebibytes|MiB|MiByte"], ["gibibyte", "gibibyte|gibibytes|GiB|GiByte"], ["tebibyte", "tebibyte|tebibytes|TiB|TiByte"], ["pebibyte", "pebibyte|pebibytes|PiB|PiByte"]]);
  SpanishNumericWithUnit2.AmbiguousDimensionUnitList = ["al", "mi", "\xE1rea", "\xE1reas", "pie", "pies"];
  SpanishNumericWithUnit2.LengthSuffixList = /* @__PURE__ */ new Map([["Kil\xF3metro", "km|kilometro|kil\xF3metro|kilometros|kil\xF3metros"], ["Hect\xF3metro", "hm|hectometro|hect\xF3metro|hectometros|hect\xF3metros"], ["Dec\xE1metro", "decametro|dec\xE1metro|decametros|dec\xE1metros|dam"], ["Metro", "m|m.|metro|metros"], ["Dec\xEDmetro", "dm|decimetro|dec\xEDmetro|decimetros|dec\xEDmetros"], ["Cent\xEDmetro", "cm|centimetro|cent\xEDmetro|centimetros|centimetros"], ["Mil\xEDmetro", "mm|milimetro|mil\xEDmetro|milimetros|mil\xEDmetros"], ["Micr\xF3metro", "\xB5m|um|micrometro|micr\xF3metro|micrometros|micr\xF3metros|micr\xF3n|micr\xF3nes"], ["Nan\xF3metro", "nm|nanometro|nan\xF3metro|nanometros|nan\xF3metros"], ["Pic\xF3metro", "pm|picometro|pic\xF3metro|picometros|pic\xF3metros"], ["Milla", "mi|milla|millas"], ["Yarda", "yd|yarda|yardas"], ["Pulgada", 'pulgada|pulgadas|"'], ["Pie", "pie|pies|ft"], ["A\xF1o luz", "a\xF1o luz|a\xF1os luz|al"]]);
  SpanishNumericWithUnit2.AmbiguousLengthUnitList = ["mi", "\xE1rea", "\xE1reas"];
  SpanishNumericWithUnit2.BuildPrefix = `(?<=(\\s|^|\\P{L}))`;
  SpanishNumericWithUnit2.BuildSuffix = `(?=(\\s|\\P{L}|$))`;
  SpanishNumericWithUnit2.ConnectorToken = "de";
  SpanishNumericWithUnit2.SpeedSuffixList = /* @__PURE__ */ new Map([["Metro por segundo", "metro/segundo|m/s|metro por segundo|metros por segundo|metros por segundos"], ["Kil\xF3metro por hora", "km/h|kil\xF3metro por hora|kilometro por hora|kil\xF3metros por hora|kilometros por hora|kil\xF3metro/hora|kilometro/hora|kil\xF3metros/hora|kilometros/hora"], ["Kil\xF3metro por minuto", "km/min|kil\xF3metro por minuto|kilometro por minuto|kil\xF3metros por minuto|kilometros por minuto|kil\xF3metro/minuto|kilometro/minuto|kil\xF3metros/minuto|kilometros/minuto"], ["Kil\xF3metro por segundo", "km/seg|kil\xF3metro por segundo|kilometro por segundo|kil\xF3metros por segundo|kilometros por segundo|kil\xF3metro/segundo|kilometro/segundo|kil\xF3metros/segundo|kilometros/segundo"], ["Milla por hora", "mph|milla por hora|mi/h|milla/hora|millas/hora|millas por hora"], ["Nudo", "kt|nudo|nudos|kn"], ["Pie por segundo", "ft/s|pie/s|ft/seg|pie/seg|pie por segundo|pies por segundo"], ["Pie por minuto", "ft/min|pie/min|pie por minuto|pies por minuto"], ["Yarda por minuto", "yardas por minuto|yardas/minuto|yardas/min"], ["Yarda por segundo", "yardas por segundo|yardas/segundo|yardas/seg"]]);
  SpanishNumericWithUnit2.AmbiguousSpeedUnitList = ["nudo", "nudos"];
  SpanishNumericWithUnit2.TemperatureSuffixList = /* @__PURE__ */ new Map([["Kelvin", "k|kelvin"], ["Rankine", "r|rankine"], ["Grado Celsius", "\xB0c|grados c|grado celsius|grados celsius|celsius|grado cent\xEDgrado|grados cent\xEDgrados|cent\xEDgrado|cent\xEDgrados"], ["Grado Fahrenheit", "\xB0f|grados f|grado fahrenheit|grados fahrenheit|fahrenheit"], ["Grado R\xE9aumur", "\xB0r|\xB0re|grados r|grado r\xE9aumur|grados r\xE9aumur|r\xE9aumur"], ["Grado Delisle", "\xB0d|grados d|grado delisle|grados delisle|delisle"], ["Grado", "\xB0|grados|grado"]]);
  SpanishNumericWithUnit2.VolumeSuffixList = /* @__PURE__ */ new Map([["Kil\xF3metro c\xFAbico", "kil\xF3metro c\xFAbico|kil\xF3metros c\xFAbico|km3|km^3|km\xB3"], ["Hect\xF3metro c\xFAbico", "hect\xF3metro c\xFAbico|hect\xF3metros c\xFAbico|hm3|hm^3|hm\xB3"], ["Dec\xE1metro c\xFAbico", "dec\xE1metro c\xFAbico|dec\xE1metros c\xFAbico|dam3|dam^3|dam\xB3"], ["Metro c\xFAbico", "metro c\xFAbico|metros c\xFAbico|m3|m^3|m\xB3"], ["Dec\xEDmetro c\xFAbico", "dec\xEDmetro c\xFAbico|dec\xEDmetros c\xFAbico|dm3|dm^3|dm\xB3"], ["Cent\xEDmetro c\xFAbico", "cent\xEDmetro c\xFAbico|cent\xEDmetros c\xFAbico|cc|cm3|cm^3|cm\xB3"], ["Mil\xEDmetro c\xFAbico", "mil\xEDmetro c\xFAbico|mil\xEDmetros c\xFAbico|mm3|mm^3|mm\xB3"], ["Pulgada c\xFAbica", "pulgada c\xFAbica|pulgadas c\xFAbicas"], ["Pie c\xFAbico", "pie c\xFAbico|pies c\xFAbicos|pie3|pie^3|pie\xB3|ft3|ft^3|ft\xB3"], ["Yarda c\xFAbica", "yarda c\xFAbica|yardas c\xFAbicas|yd3|yd^3|yd\xB3"], ["Hectolitro", "hectolitro|hectolitros|hl"], ["Litro", "litro|litros|lts|l"], ["Mililitro", "mililitro|mililitros|ml"], ["Gal\xF3n", "gal\xF3n|galones"], ["Pinta", "pinta|pintas"], ["Barril", "barril|barriles|bbl"], ["Onza l\xEDquida", "onza l\xEDquida|onzas l\xEDquidas"]]);
  SpanishNumericWithUnit2.WeightSuffixList = /* @__PURE__ */ new Map([["Tonelada m\xE9trica", "tonelada m\xE9trica|toneladas m\xE9tricas"], ["Tonelada", "ton|tonelada|toneladas"], ["Kilogramo", "kg|kilogramo|kilogramos"], ["Hectogramo", "hg|hectogramo|hectogramos"], ["Decagramo", "dag|decagramo|decagramos"], ["Gramo", "g|gr|gramo|gramos"], ["Decigramo", "dg|decigramo|decigramos"], ["Centigramo", "cg|centigramo|centigramos"], ["Miligramo", "mg|miligramo|miligramos"], ["Microgramo", "\xB5g|ug|microgramo|microgramos"], ["Nanogramo", "ng|nanogramo|nanogramos"], ["Picogramo", "pg|picogramo|picogramos"], ["Libra", "lb|libra|libras"], ["Onza", "oz|onza|onzas"], ["Grano", "grano|granos|gr"], ["Quilate", "ct|kt|quilate|quilates"]]);
})(exports.SpanishNumericWithUnit || (exports.SpanishNumericWithUnit = {}));

// recognizers/recognizers-number-with-unit/src/numberWithUnit/spanish/base.ts
var SpanishNumberWithUnitExtractorConfiguration = class {
  constructor(ci) {
    this.cultureInfo = ci;
    this.unitNumExtractor = new recognizersTextNumber.SpanishNumberExtractor();
    this.buildPrefix = exports.SpanishNumericWithUnit.BuildPrefix;
    this.buildSuffix = exports.SpanishNumericWithUnit.BuildSuffix;
    this.connectorToken = exports.SpanishNumericWithUnit.ConnectorToken;
    this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumericWithUnit.CompoundUnitConnectorRegex);
    this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(BaseUnits.PmNonUnitRegex);
  }
};
var SpanishNumberWithUnitParserConfiguration = class extends BaseNumberWithUnitParserConfiguration {
  constructor(ci) {
    super(ci);
    this.internalNumberExtractor = new recognizersTextNumber.SpanishNumberExtractor(recognizersTextNumber.NumberMode.Default);
    this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.SpanishNumberParserConfiguration());
    this.connectorToken = exports.SpanishNumericWithUnit.ConnectorToken;
  }
};

// recognizers/recognizers-number-with-unit/src/numberWithUnit/spanish/currency.ts
var SpanishCurrencyExtractorConfiguration = class extends SpanishNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_CURRENCY;
    this.suffixList = exports.SpanishNumericWithUnit.CurrencySuffixList;
    this.prefixList = exports.SpanishNumericWithUnit.CurrencyPrefixList;
    this.ambiguousUnitList = exports.SpanishNumericWithUnit.AmbiguousCurrencyUnitList;
  }
};
var SpanishCurrencyParserConfiguration = class extends SpanishNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
    }
    super(ci);
    this.BindDictionary(exports.SpanishNumericWithUnit.CurrencySuffixList);
    this.BindDictionary(exports.SpanishNumericWithUnit.CurrencyPrefixList);
  }
};
var SpanishTemperatureExtractorConfiguration = class extends SpanishNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_TEMPERATURE;
    this.suffixList = exports.SpanishNumericWithUnit.TemperatureSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = new Array();
  }
};
var SpanishTemperatureParserConfiguration = class extends SpanishNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
    }
    super(ci);
    this.BindDictionary(exports.SpanishNumericWithUnit.TemperatureSuffixList);
  }
};
var SpanishDimensionExtractorConfiguration = class extends SpanishNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_DIMENSION;
    this.suffixList = exports.SpanishNumericWithUnit.DimensionSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = exports.SpanishNumericWithUnit.AmbiguousDimensionUnitList;
  }
};
var SpanishDimensionParserConfiguration = class extends SpanishNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
    }
    super(ci);
    this.BindDictionary(exports.SpanishNumericWithUnit.DimensionSuffixList);
  }
};
var SpanishAgeExtractorConfiguration = class extends SpanishNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_AGE;
    this.suffixList = exports.SpanishNumericWithUnit.AgeSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = new Array();
  }
};
var SpanishAgeParserConfiguration = class extends SpanishNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
    }
    super(ci);
    this.BindDictionary(exports.SpanishNumericWithUnit.AgeSuffixList);
  }
};

// recognizers/recognizers-number-with-unit/src/resources/portugueseNumericWithUnit.ts
exports.PortugueseNumericWithUnit = void 0;
((PortugueseNumericWithUnit2) => {
  PortugueseNumericWithUnit2.AgeSuffixList = /* @__PURE__ */ new Map([["Ano", "anos|ano"], ["M\xEAs", "meses|mes|m\xEAs"], ["Semana", "semanas|semana"], ["Dia", "dias|dia"]]);
  PortugueseNumericWithUnit2.AreaSuffixList = /* @__PURE__ */ new Map([["Quil\xF4metro quadrado", "quil\xF4metro quadrado|quil\xF3metro quadrado|quilometro quadrado|quil\xF4metros quadrados|quil\xF3metros quadrados|quilomeros quadrados|km2|km^2|km\xB2"], ["Hectare", "hect\xF4metro quadrado|hect\xF3metro quadrado|hect\xF4metros quadrados|hect\xF3metros cuadrados|hm2|hm^2|hm\xB2|hectare|hectares"], ["Dec\xE2metro quadrado", "dec\xE2metro quadrado|decametro quadrado|dec\xE2metros quadrados|decametro quadrado|dam2|dam^2|dam\xB2|are|ares"], ["Metro quadrado", "metro quadrado|metros quadrados|m2|m^2|m\xB2"], ["Dec\xEDmetro quadrado", "dec\xEDmetro quadrado|decimentro quadrado|dec\xEDmetros quadrados|decimentros quadrados|dm2|dm^2|dm\xB2"], ["Cent\xEDmetro quadrado", "cent\xEDmetro quadrado|centimetro quadrado|cent\xEDmetros quadrados|centrimetros quadrados|cm2|cm^2|cm\xB2"], ["Mil\xEDmetro quadrado", "mil\xEDmetro quadrado|milimetro quadrado|mil\xEDmetros quadrados|militmetros quadrados|mm2|mm^2|mm\xB2"], ["Polegada quadrada", "polegada quadrada|polegadas quadradas|in2|in^2|in\xB2"], ["P\xE9 quadrado", "p\xE9 quadrado|pe quadrado|p\xE9s quadrados|pes quadrados|p\xE92|p\xE9^2|p\xE9\xB2|sqft|sq ft|ft2|ft^2|ft\xB2"], ["Jarda quadrada", "jarda quadrada|jardas quadradas|yd2|yd^2|yd\xB2"], ["Milha quadrada", "milha quadrada|milhas quadradas|mi2|mi^2|mi\xB2"], ["Acre", "acre|acres"]]);
  PortugueseNumericWithUnit2.CurrencySuffixList = /* @__PURE__ */ new Map([["D\xF3lar", "d\xF3lar|dolar|d\xF3lares|dolares"], ["Peso", "peso|pesos"], ["Coroa", "coroa|coroas"], ["Rublo", "rublo|rublos"], ["Libra", "libra|libras"], ["Florim", "florim|florins|\u0192"], ["Dinar", "dinar|dinares"], ["Franco", "franco|francos"], ["Rupia", "r\xFApia|rupia|r\xFApias|rupias"], ["Escudo", "escudo|escudos"], ["Xelim", "xelim|xelins|xelims"], ["Lira", "lira|liras"], ["Centavo", "centavo|c\xEAntimo|centimo|centavos|c\xEAntimos|centimo"], ["Cent\xE9simo", "cent\xE9simo|cent\xE9simos"], ["P\xEAni", "p\xEAni|p\xE9ni|peni|penies|pennies"], ["Manat", "manat|manate|m\xE1nate|man|manats|manates|m\xE1nates"], ["Euro", "euro|euros|\u20AC|eur"], ["Centavo de Euro", "centavo de euro|c\xEAntimo de euro|centimo de euro|centavos de euro|c\xEAntimos de euro|centimos de euro"], ["D\xF3lar do Caribe Oriental", "d\xF3lar do Caribe Oriental|dolar do Caribe Oriental|d\xF3lares do Caribe Oriental|dolares do Caribe Oriental|d\xF3lar das Cara\xEDbas Orientais|dolar das Caraibas Orientais|d\xF3lares das Cara\xEDbas Orientais|dolares das Caraibas Orientais|ec$|xcd"], ["Centavo do Caribe Oriental", "centavo do Caribe Oriental|centavo das Cara\xEDbas Orientais|c\xEAntimo do Caribe Oriental|c\xEAntimo das Cara\xEDbas Orientais|centavos do Caribe Oriental|centavos das Cara\xEDbas Orientais|c\xEAntimos do Caribe Oriental|c\xEAntimos das Cara\xEDbas Orientais"], ["Franco CFA da \xC1frica Ocidental", "franco CFA da \xC1frica Ocidental|franco CFA da Africa Ocidental|francos CFA da \xC1frica Occidental|francos CFA da Africa Occidental|franco CFA Ocidental|xof"], ["Centavo de CFA da \xC1frica Ocidental", "centavo de CFA da Africa Occidental|centavos de CFA da \xC1frica Ocidental|c\xEAntimo de CFA da Africa Occidental|c\xEAntimos de CFA da \xC1frica Ocidental"], ["Franco CFA da \xC1frica Central", "franco CFA da \xC1frica Central|franco CFA da Africa Central|francos CFA da \xC1frica Central|francos CFA da Africa Central|franco CFA central|xaf"], ["Centavo de CFA da \xC1frica Central", "centavo de CFA de \xC1frica Central|centavos de CFA da \xC1frica Central|c\xEAntimo de CFA de \xC1frica Central|c\xEAntimos de CFA da \xC1frica Central"], ["Apsar abc\xE1sio", "apsar abc\xE1sio|apsar abec\xE1sio|apsar abcasio|apsar|apsares"], ["Afegani afeg\xE3o", "afegani afeg\xE3o|afegane afeg\xE3o|\u060B|afn|afegane|afgane|afeg\xE2ni|afeganis|afeganes|afganes|afeg\xE2nis"], ["Pul", "pul|pules|puls"], ["Lek alban\xEAs", "lek|lek\xEB|lekes|lek alban\xEAs|leque|leques|all"], ["Qindarke", "qindarka|qindark\xEB|qindarke|qindarkas"], ["Kwanza angolano", "kwanza angolano|kwanzas angolanos|kwanza|kwanzas|aoa|kz"], ["C\xEAntimo angolano", "c\xEAntimo angolano|c\xEAntimo|c\xEAntimos"], ["Florim das Antilhas Holandesas", "florim das antilhas holandesas|florim das antilhas neerlandesas|ang"], ["Rial saudita", "rial saudita|riais sauditas|riyal saudita|riyals sauditas|riyal|riyals|sar"], ["Halala saudita", "halala saudita|halala|hallalah"], ["Dinar argelino", "dinar argelino|dinares argelinos|dzd"], ["C\xEAntimo argelino", "centimo argelino|centimos argelinos|c\xEAntimo argelino|c\xEAntimos argelinos|centavo argelino|centavos argelinos"], ["Peso argentino", "peso argentino|pesos argentinos|peso|pesos|ar$|ars"], ["Centavo argentino", "centavo argentino|centavos argentinos|centavo|ctvo.|ctvos."], ["Dram arm\xEAnio", "dram arm\xEAnio|dram arm\xEAnios|dram arm\xE9nio|dram arm\xE9nios|dram armenio|dram armenios|dram|drame|drames|\u0564\u0580."], ["Luma arm\xEAnio", "luma arm\xEAnio|lumas arm\xEAnios|luma arm\xE9nio|lumas arm\xE9nios|luma armenio|lumas armenios|luma|lumas"], ["Florim arubano", "flor\xEDn arube\xF1o|florines arube\xF1os|\u0192 arube\xF1os|a\u0192|awg"], ["D\xF3lar australiano", "d\xF3lar australiano|d\xF3lares australianos|dolar australiano|dolares australianos|a$|aud"], ["Centavo australiano", "centavo australiano|centavos australianos"], ["Manat azeri", "manat azeri|manats azeris|azn|manat azerbaijan\xEAs|manat azerbaijano|manats azerbaijaneses|manats azerbaijanos"], ["Q\u0259pik azeri", "q\u0259pik azeri|q\u0259pik|q\u0259piks"], ["D\xF3lar bahamense", "d\xF3lar bahamense|d\xF3lares bahamense|dolar bahamense|dolares bahamense|d\xF3lar baamiano|d\xF3lares baamiano|dolar baamiano|dolares baamiano|b$|bsd"], ["Centavo bahamense", "centavo bahamense|centavos bahamense"], ["Dinar bareinita", "dinar bareinita|dinar baremita|dinares bareinitas|dinares baremitas|bhd"], ["Fil bareinita", "fil bareinita|fil baremita|fils bareinitas|fils baremitas"], ["Taka bengali", "taka bengali|takas bengalis|taca|tacas|taka|takas|bdt"], ["Poisha bengali", "poisha bengali|poishas bengalis"], ["D\xF3lar de Barbados", "d\xF3lar de barbados|d\xF3lares de barbados|dolar de barbados|dolares de barbados|d\xF3lar dos barbados|d\xF3lares dos barbados|bbd"], ["Centavo de Barbados", "centavo de barbados|centavos de barbados|centavo dos barbados|centavos dos barbados"], ["D\xF3lar de Belize", "d\xF3lar de belize|d\xF3lares de belize|dolar de belize|dolares de belize|d\xF3lar do belize|d\xF3lares do belize|dolar do belize|dolares do belize|bz$|bzd"], ["Centavo de Belize", "centavo de belize|centavos de belize|c\xEAntimo do belize|c\xEAntimos do belize"], ["D\xF3lar bermudense", "d\xF3lar bermudense|d\xF3lares bermudenses|bd$|bmd"], ["Centavo bermudense", "centavo bermudense|centavos bermudenses|c\xEAntimo bermudense| c\xEAntimos bermudenses"], ["Rublo bielorrusso", "rublo bielorrusso|rublos bielorrussos|br|byr"], ["Copeque bielorusso", "copeque bielorrusso|copeques bielorrussos|kopek bielorrusso|kopeks bielorrussos|kap"], ["Quiate mianmarense", "quiate mianmarense|quiates mianmarenses|kyat mianmarense|kyates mianmarenses|quiate myanmarense|quiates myanmarenses|kyat myanmarense|kyates myanmarenses|quiate birman\xEAs|quite birmanes|quiates birmaneses|kyat birman\xEAs|kyat birmanes|kyates birmaneses|mmk"], ["Pya mianmarense", "pya mianmarense|pyas mianmarenses|pya myanmarense|pyas myanmarenses|pya birman\xEAs|pya birmanes|pyas birmaneses"], ["Boliviano", "boliviano|bolivianos|bob|bs"], ["Centavo Boliviano", "centavo boliviano|centavos bolivianos"], ["Marco da B\xF3snia e Herzegovina", "marco convers\xEDvel|marco conversivel|marco convert\xEDvel|marco convertivel|marcos convers\xEDveis|marcos conversiveis|marcos convert\xEDveis|marcos convertivies|bam"], ["Fening da B\xF3snia e Herzegovina", "fening convers\xEDvel|fening conversivel|fening convert\xEDvel|fening convertivel|fenings convers\xEDveis|fenings conversiveis|fenings convert\xEDveis|fenings convertiveis"], ["Pula", "pula|pulas|bwp"], ["Thebe", "thebe|thebes"], ["Real brasileiro", "real brasileiro|real do brasil|real|reais brasileiros|reais do brasil|reais|r$|brl"], ["Centavo brasileiro", "centavo de real|centavo brasileiro|centavos de real|centavos brasileiros"], ["D\xF3lar de Brunei", "d\xF3lar de brunei|dolar de brunei|d\xF3lar do brunei|dolar do brunei|d\xF3lares de brun\xE9i|dolares de brunei|d\xF3lares do brunei|dolares do brunei|bnd"], ["Sen de Brunei", "sen de brunei|sen do brunei|sens de brunei|sens do brunei"], ["Lev b\xFAlgaro", "lev b\xFAlgaro|leve b\xFAlgaro|leves b\xFAlgaros|lev bulgaro|leve bulgaro|leves bulgaros|lv|bgn"], ["Stotinka b\xFAlgaro", "stotinka b\xFAlgaro|stotinki b\xFAlgaros|stotinka bulgaro|stotinki bulgaros"], ["Franco do Burundi", "franco do burundi|francos do burundi|fbu|fib"], ["Centavo Burundi", "centavo burundi|c\xEAntimo burundi|centimo burundi|centavos burundi|c\xEAntimo burundi|centimo burundi"], ["Ngultrum butan\xEAs", "ngultrum butan\xEAs|ngultrum butanes|ng\xFAltrume butan\xEAs|ngultrume butanes|ngultrum butaneses|ng\xFAltrumes butaneses|ngultrumes butaneses|btn"], ["Chetrum  butan\xEAs", "chetrum butan\xEAs|chetrum butanes|chetrum butaneses"], ["Escudo cabo-verdiano", "escudo cabo-verdiano|escudos cabo-verdianos|cve"], ["Riel cambojano", "riel cambojano|ri\xE9is cambojanos|rieis cambojanos|khr"], ["D\xF3lar canadense", "d\xF3lar canadense|dolar canadense|d\xF3lares canadenses|dolares canadenses|c$|cad"], ["Centavo canadense", "centavo canadense|centavos canadenses"], ["Peso chileno", "peso chileno|pesos chilenos|cpl"], ["Yuan chin\xEAs", "yuan chin\xEAs|yuan chines|yuans chineses|yuan|yuans|renminbi|rmb|cny|\xA5"], ["Peso colombiano", "peso colombiano|pesos colombianos|cop|col$"], ["Centavo colombiano", "centavo colombiano|centavos colombianos"], ["Franco comorense", "franco comorense|francos comorenses|kmf|\u20A3"], ["Franco congol\xEAs", "franco congol\xEAs|franco congoles|francos congoleses|cdf"], ["Centavo congol\xEAs", "centavo congol\xEAs|centavo congoles|centavos congoleses|c\xEAntimo congol\xEAs|centimo congoles|c\xEAntimos congoleses|c\xEAntimos congoleses"], ["Won norte-coreano", "won norte-coreano|w\u014Fn norte-coreano|won norte-coreanos|w\u014Fn norte-coreanos|kpw"], ["Chon norte-coreano", "chon norte-coreano|ch\u014Fn norte-coreano|ch\u014Fn norte-coreanos|chon norte-coreanos"], ["Won sul-coreano", "w\u014Fn sul-coreano|won sul-coreano|w\u014Fnes sul-coreanos|wones sul-coreanos|krw"], ["Jeon sul-coreano", "jeons sul-coreano|jeons sul-coreanos"], ["Col\xF3n costarriquenho", "col\xF3n costarriquenho|colon costarriquenho|colons costarriquenho|colones costarriquenhos|crc"], ["Kuna croata", "kuna croata|kunas croatas|hrk"], ["Lipa croata", "lipa croata|lipas croatas"], ["Peso cubano", "peso cubano|pesos cubanos|cup"], ["Peso cubano convert\xEDvel", "peso cubano convers\xEDvel|pesos cubanos convers\xEDveis|peso cubano conversivel|pesos cubanos conversiveis|peso cubano convert\xEDvel|pesos cubanos convert\xEDveis|peso cubano convertivel|pesos cubanos convertiveis|cuc"], ["Coroa dinamarquesa", "coroa dinamarquesa|coroas dinamarquesas|dkk"], ["Libra eg\xEDpcia", "libra eg\xEDpcia|libra egipcia|libras eg\xEDpcias|libras egipcias|egp|le"], ["Piastra eg\xEDpcia", "piastra eg\xEDpcia|piastra egipcia|pisastras eg\xEDpcias|piastras egipcias"], ["Dirham dos Emirados \xC1rabes Unidos", "dirham|dirhams|dirham dos emirados arabes unidos|aed|dhs"], ["Nakfa", "nakfa|nfk|ern"], ["Centavo de Nakfa", "c\xEAntimo de nakfa|c\xEAntimos de nakfa|centavo de nafka|centavos de nafka"], ["Peseta", "peseta|pesetas|pts.|ptas.|esp"], ["D\xF3lar estadunidense", "d\xF3lar dos estados unidos|dolar dos estados unidos|d\xF3lar estadunidense|d\xF3lar americano|d\xF3lares dos estados unidos|dolares dos estados unidos|d\xF3lares estadunidenses|d\xF3lares americanos|dolar estadunidense|dolar americano|dolares estadunidenses|dolares americanos|usd|u$d|us$"], ["Coroa estoniana", "coroa estoniana|coroas estonianas|eek"], ["Senti estoniano", "senti estoniano|senti estonianos"], ["Birr et\xEDope", "birr et\xEDope|birr etiope|birr et\xEDopes|birr etiopes|br|etb"], ["Santim et\xEDope", "santim et\xEDope|santim etiope|santim et\xEDopes|santim etiopes"], ["Peso filipino", "peso filipino|pesos filipinos|php"], ["Marco finland\xEAs", "marco finland\xEAs|marco finlandes|marcos finlandeses"], ["D\xF3lar fijiano", "d\xF3lar fijiano|dolar fijiano|d\xF3lares fijianos|dolares fijianos|fj$|fjd"], ["Centavo fijiano", "centavo fijiano|centavos fijianos"], ["Dalasi gambiano", "dalasi|gmd"], ["Bututs", "butut|bututs"], ["Lari georgiano", "lari georgiano|lari georgianos|gel"], ["Tetri georgiano", "tetri georgiano|tetri georgianos"], ["Cedi", "cedi|ghs|gh\u20B5"], ["Pesewa", "pesewa"], ["Libra de Gibraltar", "libra de gibraltar|libras de gibraltar|gip"], ["Peni de Gibraltar", "peni de gibraltar|penies de gibraltar"], ["Quetzal guatemalteco", "quetzal guatemalteco|quetzales guatemaltecos|quetzal|quetzales|gtq"], ["Centavo guatemalteco", "centavo guatemalteco|centavos guatemaltecos"], ["Libra de Guernsey", "libra de Guernsey|libras de Guernsey|ggp"], ["Peni de Guernsey", "peni de Guernsey|penies de Guernsey"], ["Franco da Guin\xE9", "franco da guin\xE9|franco da guine| franco guineense|francos da guin\xE9|francos da guine|francos guineense|gnf|fg"], ["Centavo da Guin\xE9", "c\xEAntimo guineense|centimo guineense|centavo guineense|c\xEAntimos guineenses|centimos guineenses|centavos guineenses"], ["D\xF3lar guianense", "d\xF3lar guianense|d\xF3lares guianense|dolar guianense|dolares guianense|gyd|gy"], ["Gurde haitiano", "gurde haitiano|gourde|gurdes haitianos|htg"], ["Centavo haitiano", "c\xEAntimo haitiano|c\xEAntimos haitianos|centavo haitiano|centavos haitianos"], ["Lempira hondurenha", "lempira hondurenha|lempiras hondurenhas|lempira|lempiras|hnl"], ["Centavo hondurenho", "centavo hondurenho|centavos hondurehos|c\xEAntimo hondurenho|c\xEAntimos hondurenhos"], ["D\xF3lar de Hong Kong", "d\xF3lar de hong kong|dolar de hong kong|d\xF3lares de hong kong|dolares de hong kong|hk$|hkd"], ["Florim h\xFAngaro", "florim h\xFAngaro|florim hungaro|florins h\xFAngaros|florins hungaros|forinte|forintes|huf"], ["Fil\xE9r h\xFAngaro", "fill\xE9r|fil\xE9r|filler|filer"], ["Rupia indiana", "r\xFApia indiana|rupia indiana|rupias indianas|inr"], ["Paisa indiana", "paisa indiana|paisas indianas"], ["Rupia indon\xE9sia", "rupia indonesia|rupia indon\xE9sia|rupias indonesias|rupias indon\xE9sias|idr"], ["Sen indon\xE9sio", "send indon\xE9sio|sen indonesio|sen indon\xE9sios|sen indonesios"], ["Rial iraniano", "rial iraniano|riais iranianos|irr"], ["Dinar iraquiano", "dinar iraquiano|dinares iraquianos|iqd"], ["Fil iraquiano", "fil iraquiano|fils iraquianos|files iraquianos"], ["Libra manesa", "libra manesa|libras manesas|imp"], ["Peni man\xEAs", "peni manes|peni man\xEAs|penies maneses"], ["Coroa islandesa", "coroa islandesa|coroas islandesas|isk|\xEDkr"], ["Aurar island\xEAs", "aurar island\xEAs|aurar islandes|aurar islandeses|eyrir"], ["D\xF3lar das Ilhas Cayman", "d\xF3lar das ilhas cayman|dolar das ilhas cayman|d\xF3lar das ilhas caim\xE3o|d\xF3lares das ilhas cayman|dolares das ilhas cayman|d\xF3lares das ilhas caim\xE3o|ci$|kyd"], ["D\xF3lar das Ilhas Cook", "d\xF3lar das ilhas cook|dolar das ilhas cook|d\xF3lares das ilhas cook|dolares das ilhas cook"], ["Coroa feroesa", "coroa feroesa|coroas feroesas|fkr"], ["Libra das Malvinas", "libra das malvinas|libras das malvinas|fk\xA3|fkp"], ["D\xF3lar das Ilhas Salom\xE3o", "d\xF3lar das ilhas salom\xE3o|dolar das ilhas salomao|d\xF3lares das ilhas salom\xE3o|dolares das ilhas salomao|sbd"], ["Novo shekel israelense", "novo shekel|novos shekeles|novo shequel|novo siclo|novo x\xE9quel|shekeles novos|novos sheqalim|sheqalim novos|ils"], ["Agora", "agora|agorot"], ["D\xF3lar jamaicano", "d\xF3lar jamaicano|dolar jamaicano|d\xF3lares jamaicanos|dolares jamaicanos|j$|ja$|jmd"], ["Yen", "yen|iene|yenes|ienes|jpy"], ["Libra de Jersey", "libra de Jersey|libras de Jersey|jep"], ["Dinar jordaniano", "dinar jordaniano|dinar jordano|dinares jordanianos|dinares jordanos|jd|jod"], ["Piastra jordaniana", "piastra jordaniana|piastra jordano|piastras jordanianas|piastra jordaniano|piastras jordanianos|piastras jordanos"], ["Tengue cazaque", "tenge|tengue|tengu\xE9|tengue cazaque|kzt"], ["Tiyin", "tiyin|tiyins"], ["Xelim queniano", "xelim queniano|xelins quenianos|ksh|kes"], ["Som quirguiz", "som quirguiz|som quirguizes|soms quirguizes|kgs"], ["Tyiyn", "tyiyn|tyiyns"], ["D\xF3lar de Kiribati", "d\xF3lar de kiribati|dolar de kiribati|d\xF3lares de kiribati|dolares de kiribati"], ["Dinar kuwaitiano", "dinar kuwaitiano|dinar cuaitiano|dinares kuwaitiano|dinares cuaitianos|kwd"], ["Quipe laosiano", "quipe|quipes|kipe|kipes|kip|kip laosiano|kip laociano|kips laosianos|kips laocianos|lak"], ["Att laosiano", "at|att|att laosiano|att laosianos"], ["Loti do Lesoto", "loti|l\xF3ti|maloti|lotis|l\xF3tis|lsl"], ["Sente", "sente|lisente"], ["Libra libanesa", "libra libanesa|libras libanesas|lbp"], ["D\xF3lar liberiano", "d\xF3lar liberiano|dolar liberiano|d\xF3lares liberianos|dolares liberianos|l$|lrd"], ["Dinar libio", "dinar libio|dinar l\xEDbio|dinares libios|dinares l\xEDbios|ld|lyd"], ["Dirham libio", "dirham libio|dirhams libios|dirham l\xEDbio|dirhams l\xEDbios"], ["Litas lituana", "litas lituana|litai lituanas|ltl"], ["Pataca macaense", "pataca macaense|patacas macaenses|mop$|mop"], ["Avo macaense", "avo macaense|avos macaenses"], ["Ho macaense", "ho macaense|ho macaenses"], ["Dinar maced\xF4nio", "denar macedonio|denare macedonios|denar maced\xF4nio|denar maced\xF3nio|denare maced\xF4nio|denare maced\xF3nio|dinar macedonio|dinar maced\xF4nio|dinar maced\xF3nio|dinares macedonios|dinares maced\xF4nios|dinares maced\xF3nios|den|mkd"], ["Deni maced\xF4nio", "deni macedonio|deni maced\xF4nio|deni maced\xF3nio|denis macedonios|denis maced\xF4nios|denis maced\xF3nios"], ["Ariary malgaxe", "ariai malgaxe|ariary malgaxe|ariary malgaxes|ariaris|mga"], ["Iraimbilanja", "iraimbilanja|iraimbilanjas"], ["Ringuite malaio", "ringgit malaio|ringgit malaios|ringgits malaios|ringuite malaio|ringuites malaios|rm|myr"], ["Sen malaio", "sen malaio|sen malaios|centavo malaio|centavos malaios|c\xEAntimo malaio|c\xEAntimos malaios"], ["Kwacha do Malawi", "kwacha|cuacha|quacha|mk|mwk"], ["Tambala", "tambala|tambalas|tambala malawi"], ["Rupia maldiva", "rupia maldiva|rupias maldivas|rupia das maldivas| rupias das maldivas|mvr"], ["Dirame marroquino", "dirame marroquino|dirham marroquinho|dirhams marroquinos|dirames marroquinos|mad"], ["Rupia maur\xEDcia", "rupia maur\xEDcia|rupia de Maur\xEDcio|rupia mauricia|rupia de mauricio|rupias de mauricio|rupias de maur\xEDcio|rupias mauricias|rupias maur\xEDcias|mur"], ["Uguia", "uguia|uguias|oguia|ouguiya|oguias|mro"], ["Kume", "kumes|kume|khoums"], ["Peso mexicano", "peso mexicano|pesos mexicanos|mxn"], ["Centavo mexicano", "centavo mexicano|centavos mexicanos"], ["Leu mold\xE1vio", "leu moldavo|lei moldavos|leu mold\xE1vio|leu moldavio|lei mold\xE1vios|lei moldavios|leus moldavos|leus moldavios|leus mold\xE1vios|mdl"], ["Ban mold\xE1vio", "ban moldavo|bani moldavos"], ["Tugrik mongol", "tugrik mongol|tugrik|tugriks mong\xF3is|tugriks mongois|tug|mnt"], ["Metical mo\xE7ambicao", "metical|metical mo\xE7ambicano|metical mocambicano|meticais|meticais mo\xE7ambicanos|meticais mocambicanos|mtn|mzn"], ["D\xF3lar namibiano", "d\xF3lar namibiano|d\xF3lares namibianos|dolar namibio|dolares namibios|n$|nad"], ["Centavo namibiano", "centavo namibiano|centavos namibianos|centavo namibio|centavos namibianos"], ["Rupia nepalesa", "rupia nepalesa|rupias nepalesas|npr"], ["Paisa nepalesa", "paisa nepalesa|paisas nepalesas"], ["C\xF3rdova nicaraguense", "c\xF3rdova nicaraguense|cordova nicaraguense|cordova nicaraguana|c\xF3rdoba nicarag\xFCense|c\xF3rdobas nicarag\xFCenses|cordobas nicaraguenses|c\xF3rdovas nicaraguenses|cordovas nicaraguenses|c\xF3rdovas nicaraguanasc$|nio"], ["Centavo nicaraguense", "centavo nicarag\xFCense|centavos nicaraguenses|centavo nicaraguano|centavos nicaraguenses|centavo nicaraguano|centavos nicaraguanos"], ["Naira", "naira|ngn"], ["Kobo", "kobo"], ["Coroa norueguesa", "coroa norueguesa|coroas norueguesas|nok"], ["Franco CFP", "franco cfp|francos cfp|xpf"], ["D\xF3lar neozeland\xEAs", "d\xF3lar neozeland\xEAs|dolar neozelandes|d\xF3lares neozelandeses|dolares neozelandeses|d\xF3lar da nova zel\xE2ndia|dolar da nova zelandia|d\xF3lares da nova zel\xE2ndia|dolares da nova zelandia|nz$|nzd"], ["Centavo neozeland\xEAs", "centavo neozeland\xEAs|centavo neozelandes|centavo da nova zelandia|centavo da nova zel\xE2ndia|centavos da nova zelandia|centavos neozelandeses|centavos da nova zel\xE2ndia"], ["Rial omanense", "rial omani|riais omanis|rial omanense|riais omanenses|omr"], ["Baisa omanense", "baisa omani|baisas omanis|baisa omanense|baisas omanenses"], ["Florim holand\xEAs", "florim holand\xEAs|florim holandes|florins holandeses|nlg"], ["Rupia paquistanesa", "rupia paquistanesa|rupias paquistanesas|pkr"], ["Paisa paquistanesa", "paisa paquistanesa|paisas paquistanesasas"], ["Balboa panamenho", "balboa panamenho|balboas panamenhos|balboa|pab|balboa panamense|balboas panamenses"], ["Centavo panamenho", "centavo panamenho|c\xEAntimo panamenho|centavos panamenhos|c\xEAntimos panamenhos|c\xEAntimo panamense|c\xEAntimos panamenses"], ["Kina", "kina|kina papu\xE1sia|kinas|kinas papu\xE1sias|pkg|pgk"], ["Toea", "toea"], ["Guarani", "guarani|guaranis|gs|pyg"], ["Novo Sol", "novo sol peruano|novos s\xF3is peruanos|sol|soles|s\xF3is|nuevo sol|pen|s#."], ["Centavo de sol", "c\xEAntimo de sol|c\xEAntimos de sol|centavo de sol|centavos de sol"], ["Z\u0142oty", "z\u0142oty|z\u0142otys|zloty|zlotys|zloti|zlotis|zl\xF3ti|zl\xF3tis|zlote|z\u0142|pln"], ["Groszy", "groszy|grosz"], ["Rial catariano", "rial qatari|riais qataris|rial catarense|riais catarenses|rial catariano|riais catarianos|qr|qar"], ["Dirame catariano", "dirame catariano|dirames catarianos|dirame qatari|dirames qataris|dirame catarense|dirames catarenses|dirham qatari|dirhams qataris|dirham catarense|dirhams catarenses|dirham catariano|dirhams catariano"], ["Libra esterlina", "libra esterlina|libras esterlinas|gbp"], ["Coroa checa", "coroa checa|coroas checas|kc|czk"], ["Peso dominicano", "peso dominicano|pesos dominicanos|rd$|dop"], ["Centavo dominicano", "centavo dominicano|centavos dominicanos"], ["Franco ruand\xEAs", "franco ruand\xEAs|franco ruandes|francos ruandeses|rf|rwf"], ["C\xE9ntimo ruand\xEAs", "c\xEAntimo ruand\xEAs|centimo ruandes|centavo ruand\xEAs|centavo ruandes|c\xEAntimos ruandeses|centimos ruandeses|centavos ruandeses"], ["Leu romeno", "leu romeno|lei romenos|leus romenos|ron"], ["Ban romeno", "ban romeno|bani romeno|bans romenos"], ["Rublo russo", "rublo russo|rublos russos|rub|\u0440."], ["Copeque ruso", "copeque russo|copeques russos|kopek ruso|kopeks rusos|copeque|copeques|kopek|kopeks"], ["Tala samoano", "tala|t\u0101l\u0101|talas|tala samonano|talas samoanos|ws$|sat|wst"], ["Sene samoano", "sene"], ["Libra de Santa Helena", "libra de santa helena|libras de santa helena|shp"], ["P\xEAni de Santa Helena", "peni de santa helena|penies de santa helena"], ["Dobra", "dobra|dobras|db|std"], ["Dinar s\xE9rvio", "dinar s\xE9rvio|dinar servio|dinar serbio|dinares s\xE9rvios|dinares servios|dinares serbios|rsd"], ["Para s\xE9rvio", "para s\xE9rvio|para servio|para serbio|paras s\xE9rvios|paras servios|paras serbios"], ["Rupia seichelense", "rupia de seicheles|rupias de seicheles|rupia seichelense|rupias seichelenses|scr"], ["Centavo seichelense", "centavo de seicheles|centavos de seicheles|centavo seichelense|centavos seichelenses"], ["Leone serra-leonino", "leone|leones|leone serra-leonino|leones serra-leoninos|le|sll"], ["D\xF3lar de Cingapura", "d\xF3lar de singapura|dolar de singapura|d\xF3rar de cingapura|dolar de cingapura|d\xF3lares de singapura|dolares de singapura|d\xF3lares de cingapura|dolares de cingapura|sgb"], ["Centavo de Cingapura", "centavo de singapura|centavos de singapura|centavo de cingapura|centavos de cingapura"], ["Libra s\xEDria", "libra s\xEDria|libra siria|libras s\xEDrias|libras sirias|s\xA3|syp"], ["Piastra s\xEDria", "piastra siria|piastras sirias|piastra s\xEDria|piastras s\xEDrias"], ["Xelim somali", "xelim somali|xelins somalis|xelim somaliano|xelins somalianos|sos"], ["Centavo somali", "centavo somapli|centavos somalis|centavo somaliano|centavos somalianos"], ["Xelim da Somalil\xE2ndia", "xelim da somalil\xE2ndia|xelins da somalil\xE2ndia|xelim da somalilandia|xelins da somalilandia"], ["Centavo da Somalil\xE2ndia", "centavo da somalil\xE2ndia|centavos da somalil\xE2ndia|centavo da somalilandia|centavos da somalilandia"], ["Rupia do Sri Lanka", "rupia do sri lanka|rupia do sri lanca|rupias do sri lanka|rupias do sri lanca|rupia cingalesa|rupias cingalesas|lkr"], ["Lilangeni", "lilangeni|lilangenis|emalangeni|szl"], ["Rand sul-africano", "rand|rand sul-africano|rands|rands sul-africanos|zar"], ["Libra sudanesa", "libra sudanesa|libras sudanesas|sdg"], ["Piastra sudanesa", "piastra sudanesa|piastras sudanesas"], ["Libra sul-sudanesa", "libra sul-sudanesa|libras sul-sudanesas|ssp"], ["Piastra sul-sudanesa", "piastra sul-sudanesa|piastras sul-sudanesas"], ["Coroa sueca", "coroa sueca|coroas suecas|sek"], ["Franco su\xED\xE7o", "franco su\xED\xE7o|franco suico|francos su\xED\xE7os|francos suicos|sfr|chf"], ["Rappen su\xED\xE7o", "rappen su\xED\xE7o|rappen suico|rappens su\xED\xE7os|rappens suicos"], ["D\xF3lar surinam\xEAs", "d\xF3lar surinam\xEAs|dolar surinames|d\xF3lar do Suriname|dolar do Suriname|d\xF3lares surinameses|dolares surinameses|d\xF3lares do Suriname|dolares do Suriname|srd"], ["Centavo surinam\xEAs", "centavo surinam\xEAs|centavo surinames|centavos surinameses"], ["Baht tailand\xEAs", "baht tailand\xEAs|bath tailandes|baht tailandeses|thb"], ["Satang tailand\xEAs", "satang tailand\xEAs|satang tailandes|satang tailandeses"], ["Novo d\xF3lar taiwan\xEAs", "novo d\xF3lar taiwan\xEAs|novo dolar taiwanes|d\xF3lar taiwan\xEAs|dolar taiwanes|d\xF3lares taiwaneses|dolares taiwaneses|twd"], ["Centavo taiwan\xEAs", "centavo taiwan\xEAs|centavo taiwanes|centavos taiwaneses"], ["Xelim tanzaniano", "xelim tanzaniano|xelins tanzanianos|tzs"], ["Centavo tanzaniano", "centavo tanzaniano|centavos tanzanianos"], ["Somoni tajique", "somoni tajique|somoni|somonis tajiques|somonis|tjs"], ["Diram tajique", "diram tajique|dirams tajiques|dirames tajiques"], ["Pa\u02BBanga", "paanga|paangas|pa\u02BBanga|pa'anga|top"], ["Seniti", "seniti"], ["Rublo transdniestriano", "rublo transdniestriano|rublos transdniestriano"], ["Copeque transdniestriano", "copeque transdniestriano|copeques transdniestriano"], ["D\xF3lar de Trinidade e Tobago", "d\xF3lar de trinidade e tobago|d\xF3lares trinidade e tobago|dolar de trinidade e tobago|dolares trinidade e tobago|d\xF3lar de trinidad e tobago|d\xF3lares trinidad e tobago|ttd"], ["Centavo de Trinidade e Tobago", "centavo de trinidade e tobago|centavos de trinidade e tobago|centavo de trinidad e tobago|centavos de trinidad e tobago"], ["Dinar tunisiano", "dinar tunisiano|dinares tunisianos|dinar tunisino|dinares tunisinos|tnd"], ["Milim tunisiano", "milim tunisiano|milim tunesianos|millime tunisianos|millimes tunisianos|milim tunisino|milim tunisinos|millime tunisinos|millimes tunisinos"], ["Lira turca", "lira turca|liras turcas|try"], ["Kuru\u015F turco", "kuru\u015F turco|kuru\u015F turcos"], ["Manat turcomeno", "manat turcomeno|manats turcomenos|tmt"], ["Tennesi turcomeno", "tennesi turcomeno|tennesis turcomenos|tenge turcomenos|tenges turcomenos"], ["D\xF3lar tuvaluano", "d\xF3lar tuvaluano|dolar tuvaluano|d\xF3lares tuvaluanos|dolares tuvaluanos"], ["Centavo tuvaluano", "centavo tuvaluano|centavos tuvaluanos"], ["Gr\xEDvnia", "gr\xEDvnia|grivnia|gr\xEDvnias|grivnias|grivna|grivnas|uah"], ["Copeque ucraniano", "kopiyka|copeque ucraniano|copeques ucranianos"], ["Xelim ugand\xEAs", "xelim ugand\xEAs|xelim ugandes|xelins ugandeses|ugx"], ["Centavo ugand\xEAs", "centavo ugand\xEAs|centavo ugandes|centavos ugandeses"], ["Peso uruguaio", "peso uruguaio|pesos uruguayis|uyu"], ["Cent\xE9simo uruguayo", "cent\xE9simo uruguaio|centesimo uruguaio|cent\xE9simos uruguaios|centesimos uruguaios"], ["Som uzbeque", "som uzbeque|som uzbeques|soms uzbeques|somes uzbeques|som usbeque|som usbeques|soms usbeques|somes usbeques|uzs"], ["Tiyin uzbeque", "tiyin uzbeque|tiyin uzbeques|tiyins uzbeques|tiyin usbeque|tiyin usbeques|tiyins usbeques"], ["Vatu", "vatu|vatus|vuv"], ["Bol\xEDvar forte venezuelano", "bol\xEDvar forte|bolivar forte|bol\xEDvar|bolivar|bol\xEDvares|bolivares|vef"], ["Centavo de bol\xEDvar", "c\xEAntimo de bol\xEDvar|c\xEAntimos de bol\xEDvar|centavo de bol\xEDvar|centavo de bolivar|centavos de bol\xEDvar|centavos de bolivar"], ["Dongue vietnamita", "dongue vietnamita|\u0110\u1ED3ng vietnamita|dong vietnamita|dongues vietnamitas|dongs vietnamitas|vnd"], ["H\xE0o vietnamita", "h\xE0o vietnamita|hao vietnamita|h\xE0o vietnamitas|h\xE0os vietnamitas|haos vietnamitas"], ["Rial iemenita", "rial iemenita|riais iemenitas|yer"], ["Fils iemenita", "fils iemenita|fils iemenitas"], ["Franco djibutiano", "franco djibutiano|francos djibutianos|franco jibutiano|francos jibutianos|djf"], ["Dinar iugoslavo", "dinar iugoslavo|dinares iugoslavos|dinar jugoslavo|dinares jugoslavos|yud"], ["Kwacha zambiano", "kwacha zambiano|kwacha zambianos|kwachas zambianos|zmw"], ["Ngwee zambiano", "ngwee zambiano|ngwee zambianos|ngwees zambianos"]]);
  PortugueseNumericWithUnit2.CompoundUnitConnectorRegex = `(?<spacer>[^.])`;
  PortugueseNumericWithUnit2.CurrencyPrefixList = /* @__PURE__ */ new Map([["D\xF3lar", "$"], ["D\xF3lar estadunidense", "us$|u$d|usd"], ["D\xF3lar do Caribe Oriental", "ec$|xcd"], ["D\xF3lar australiano", "a$|aud"], ["D\xF3lar bahamense", "b$|bsd"], ["D\xF3lar de Barbados", "bds$|bbd"], ["D\xF3lar de Belizebe", "bz$|bzd"], ["D\xF3lar bermudense", "bd$|bmd"], ["D\xF3lar de Brunebi", "brun\xE9i $|bnd"], ["D\xF3lar de Cingapura", "s$|sgd"], ["D\xF3lar canadense", "c$|can$|cad"], ["D\xF3lar das Ilhas Cayman", "ci$|kyd"], ["D\xF3lar neozeland\xEAs", "nz$|nzd"], ["D\xF3lar fijgiano", "fj$|fjd"], ["D\xF3lar guianense", "gy$|gyd"], ["D\xF3lar de Hong Kong", "hk$|hkd"], ["D\xF3lar jamaicano", "j$|ja$|jmd"], ["D\xF3lar liberiano", "l$|lrd"], ["D\xF3lar namibiano", "n$|nad"], ["D\xF3lar das Ilhas Salom\xE3o", "si$|sbd"], ["Novo d\xF3lar taiwan\xEAs", "nt$|twd"], ["Real brasileiro", "r$|brl"], ["Guarani", "\u20B2|gs.|pyg"], ["D\xF3lar de Trinidade e Tobago", "tt$|ttd"], ["Yuan chin\xEAs", "\uFFE5|cny|rmb"], ["Yen", "\xA5|jpy"], ["Euro", "\u20AC|eur"], ["Florim", "\u0192"], ["Libra", "\xA3|gbp"], ["Col\xF3n costarriquenho", "\u20A1"], ["Lira turca", "\u20BA"]]);
  PortugueseNumericWithUnit2.AmbiguousCurrencyUnitList = ["le"];
  PortugueseNumericWithUnit2.InformationSuffixList = /* @__PURE__ */ new Map([["bit", "bit|bits"], ["kilobit", "kilobit|kilobits|kb|kbit"], ["megabit", "megabit|megabits|Mb|Mbit"], ["gigabit", "gigabit|gigabits|Gb|Gbit"], ["terabit", "terabit|terabits|Tb|Tbit"], ["petabit", "petabit|petabits|Pb|Pbit"], ["kibibit", "kibibit|kibibits|kib|kibit"], ["mebibit", "mebibit|mebibits|Mib|Mibit"], ["gibibit", "gibibit|gibibits|Gib|Gibit"], ["tebibit", "tebibit|tebibits|Tib|Tibit"], ["pebibit", "pebibit|pebibits|Pib|Pibit"], ["byte", "byte|bytes"], ["kilobyte", "kilobyte|kilobytes|kB|kByte"], ["megabyte", "megabyte|megabytes|MB|MByte"], ["gigabyte", "gigabyte|gigabytes|GB|GByte"], ["terabyte", "terabyte|terabytes|TB|TByte"], ["petabyte", "petabyte|petabytes|PB|PByte"], ["kibibyte", "kibibyte|kibibytes|kiB|kiByte"], ["mebibyte", "mebibyte|mebibytes|MiB|MiByte"], ["gibibyte", "gibibyte|gibibytes|GiB|GiByte"], ["tebibyte", "tebibyte|tebibytes|TiB|TiByte"], ["pebibyte", "pebibyte|pebibytes|PiB|PiByte"]]);
  PortugueseNumericWithUnit2.AmbiguousDimensionUnitList = ["ton", "tonelada", "\xE1rea", "area", "\xE1reas", "areas", "milha", "milhas"];
  PortugueseNumericWithUnit2.BuildPrefix = `(?<=(\\s|^|\\P{L}))`;
  PortugueseNumericWithUnit2.BuildSuffix = `(?=(\\s|\\P{L}|$))`;
  PortugueseNumericWithUnit2.ConnectorToken = "de";
  PortugueseNumericWithUnit2.LengthSuffixList = /* @__PURE__ */ new Map([["Quil\xF4metro", "km|quilometro|quil\xF4metro|quil\xF3metro|quilometros|quil\xF4metros|quil\xF3metros"], ["Hect\xF4metro", "hm|hectometro|hect\xF4metro|hect\xF3metro|hectometros|hect\xF4metros|hect\xF3metros"], ["Dec\xE2metro", "decametro|dec\xE2metro|dec\xE1metro|decametros|dec\xE2metro|dec\xE1metros|dam"], ["Metro", "m|m.|metro|metros"], ["Dec\xEDmetro", "dm|decimetro|dec\xEDmetro|decimetros|dec\xEDmetros"], ["Cent\xEDmetro", "cm|centimetro|cent\xEDmetro|centimetros|centimetros"], ["Mil\xEDmetro", "mm|milimetro|mil\xEDmetro|milimetros|mil\xEDmetros"], ["Micr\xF4metro", "\xB5m|um|micrometro|micr\xF4metro|micr\xF3metro|micrometros|micr\xF4metros|micr\xF3metros|micron|m\xEDcron|microns|m\xEDcrons|micra"], ["Nan\xF4metro", "nm|nanometro|nan\xF4metro|nan\xF3metro|nanometros|nan\xF4metros|nan\xF3metros|milimicron|milim\xEDcron|milimicrons|milim\xEDcrons"], ["Pic\xF4metro", "pm|picometro|pic\xF4metro|pic\xF3metro|picometros|pic\xF4metros|pic\xF3metros"], ["Milha", "mi|milha|milhas"], ["Jarda", "yd|jarda|jardas"], ["Polegada", 'polegada|polegadas|"'], ["P\xE9", "p\xE9|pe|p\xE9s|pes|ft"], ["Ano luz", "ano luz|anos luz|al"]]);
  PortugueseNumericWithUnit2.AmbiguousLengthUnitList = ["mi", "milha", "milhas"];
  PortugueseNumericWithUnit2.SpeedSuffixList = /* @__PURE__ */ new Map([["Metro por segundo", "metro/segundo|m/s|metro por segundo|metros por segundo|metros por segundos"], ["Quil\xF4metro por hora", "km/h|quil\xF4metro por hora|quil\xF3metro por hora|quilometro por hora|quil\xF4metros por hora|quil\xF3metros por hora|quilometros por hora|quil\xF4metro/hora|quil\xF3metro/hora|quilometro/hora|quil\xF4metros/hora|quil\xF3metros/hora|quilometros/hora"], ["Quil\xF4metro por minuto", "km/min|quil\xF4metro por minuto|quil\xF3metro por minuto|quilometro por minuto|quil\xF4metros por minuto|quil\xF3metros por minuto|quilometros por minuto|quil\xF4metro/minuto|quil\xF3metro/minuto|quilometro/minuto|quil\xF4metros/minuto|quil\xF3metros/minuto|quilometros/minuto"], ["Quil\xF4metro por segundo", "km/seg|quil\xF4metro por segundo|quil\xF3metro por segundo|quilometro por segundo|quil\xF4metros por segundo|quil\xF3metros por segundo|quilometros por segundo|quil\xF4metro/segundo|quil\xF3metro/segundo|quilometro/segundo|quil\xF4metros/segundo|quil\xF3metros/segundo|quilometros/segundo"], ["Milha por hora", "mph|milha por hora|mi/h|milha/hora|milhas/hora|milhas por hora"], ["N\xF3", "kt|n\xF3|n\xF3s|kn"], ["P\xE9 por segundo", "ft/s|p\xE9/s|pe/s|ft/seg|p\xE9/seg|pe/seg|p\xE9 por segundo|pe por segundo|p\xE9s por segundo|pes por segundo"], ["P\xE9 por minuto", "ft/min|p\xE9/mind|pe/min|p\xE9 por minuto|pe por minuto|p\xE9s por minuto|pes por minuto"], ["Jarda por minuto", "jardas por minuto|jardas/minuto|jardas/min"], ["Jarda por segundo", "jardas por segundo|jardas/segundo|jardas/seg"]]);
  PortugueseNumericWithUnit2.AmbiguousSpeedUnitList = ["n\xF3", "no", "n\xF3s", "nos"];
  PortugueseNumericWithUnit2.TemperatureSuffixList = /* @__PURE__ */ new Map([["Kelvin", "k|kelvin"], ["Grau Rankine", "r|\xB0r|\xB0ra|grau rankine|graus rankine| rankine"], ["Grau Celsius", "\xB0c|grau c|grau celsius|graus c|graus celsius|celsius|grau cent\xEDgrado|grau centrigrado|graus cent\xEDgrados|graus centigrados|cent\xEDgrado|cent\xEDgrados|centigrado|centigrados"], ["Grau Fahrenheit", "\xB0f|grau f|graus f|grau fahrenheit|graus fahrenheit|fahrenheit"], ["Grau", "\xB0|graus|grau"]]);
  PortugueseNumericWithUnit2.VolumeSuffixList = /* @__PURE__ */ new Map([["Quil\xF4metro c\xFAbico", "quil\xF4metro c\xFAbico|quil\xF3metro c\xFAbico|quilometro cubico|quil\xF4metros c\xFAbicos|quil\xF3metros c\xFAbicos|quilometros cubicos|km3|km^3|km\xB3"], ["Hect\xF4metro c\xFAbico", "hect\xF4metro c\xFAbico|hect\xF3metro c\xFAbico|hectometro cubico|hect\xF4metros c\xFAbicos|hect\xF3metros c\xFAbicos|hectometros cubicos|hm3|hm^3|hm\xB3"], ["Dec\xE2metro c\xFAbico", "dec\xE2metro c\xFAbico|dec\xE1metro c\xFAbico|decametro cubico|dec\xE2metros c\xFAbicos|dec\xE1metros c\xFAbicos|decametros cubicosdam3|dam^3|dam\xB3"], ["Metro c\xFAbico", "metro c\xFAbico|metro cubico|metros c\xFAbicos|metros cubicos|m3|m^3|m\xB3"], ["Dec\xEDmetro c\xFAbico", "dec\xEDmetro c\xFAbico|decimetro cubico|dec\xEDmetros c\xFAbicos|decimetros cubicos|dm3|dm^3|dm\xB3"], ["Cent\xEDmetro c\xFAbico", "cent\xEDmetro c\xFAbico|centimetro cubico|cent\xEDmetros c\xFAbicos|centrimetros cubicos|cc|cm3|cm^3|cm\xB3"], ["Mil\xEDmetro c\xFAbico", "mil\xEDmetro c\xFAbico|milimetro cubico|mil\xEDmetros c\xFAbicos|milimetros cubicos|mm3|mm^3|mm\xB3"], ["Polegada c\xFAbica", "polegada c\xFAbica|polegada cubica|polegadas c\xFAbicas|polegadas cubicas"], ["P\xE9 c\xFAbico", "p\xE9 c\xFAbico|pe cubico|p\xE9s c\xFAbicos|pes cubicos|p\xE93|pe3|p\xE9^3|pe^3|p\xE9\xB3|pe\xB3|ft3|ft^3|ft\xB3"], ["Jarda c\xFAbica", "jarda c\xFAbica|jarda cubica|jardas c\xFAbicas|jardas cubicas|yd3|yd^3|yd\xB3"], ["Hectolitro", "hectolitro|hectolitros|hl"], ["Litro", "litro|litros|lts|l"], ["Mililitro", "mililitro|mililitros|ml"], ["Gal\xE3o", "gal\xE3o|gal\xF5es|galao|galoes"], ["Pint", "pinta|pintas|pinto|pintos|quartilho|quartilhos|pint|pints"], ["Barril", "barril|barris|bbl"], ["On\xE7a l\xEDquida", "on\xE7a l\xEDquida|onca liquida|on\xE7as l\xEDquidas|oncas liquidas"]]);
  PortugueseNumericWithUnit2.WeightSuffixList = /* @__PURE__ */ new Map([["Tonelada m\xE9trica", "tonelada m\xE9trica|tonelada metrica|toneladas m\xE9tricas|toneladas metricas"], ["Tonelada", "ton|tonelada|toneladas"], ["Quilograma", "kg|quilograma|quilogramas|quilo|quilos|kilo|kilos"], ["Hectograma", "hg|hectograma|hectogramas"], ["Decagrama", "dag|decagrama|decagramas"], ["Grama", "g|gr|grama|gramas"], ["Decigrama", "dg|decigrama|decigramas"], ["Centigrama", "cg|centigrama|centigramas"], ["Miligrama", "mg|miligrama|miligramas"], ["Micrograma", "\xB5g|ug|micrograma|microgramas"], ["Nanograma", "ng|nanograma|nanogramas"], ["Picograma", "pg|picograma|picogramas"], ["Libra", "lb|libra|libras"], ["On\xE7a", "oz|on\xE7a|onca|on\xE7as|oncas"], ["Gr\xE3o", "gr\xE3o|grao|gr\xE3os|graos|gr"], ["Quilate", "ct|kt|quilate|quilates"]]);
})(exports.PortugueseNumericWithUnit || (exports.PortugueseNumericWithUnit = {}));

// recognizers/recognizers-number-with-unit/src/numberWithUnit/portuguese/base.ts
var PortugueseNumberWithUnitExtractorConfiguration = class {
  constructor(ci) {
    this.cultureInfo = ci;
    this.unitNumExtractor = new recognizersTextNumber.PortugueseNumberExtractor();
    this.buildPrefix = exports.PortugueseNumericWithUnit.BuildPrefix;
    this.buildSuffix = exports.PortugueseNumericWithUnit.BuildSuffix;
    this.connectorToken = exports.PortugueseNumericWithUnit.ConnectorToken;
    this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.PortugueseNumericWithUnit.CompoundUnitConnectorRegex);
    this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(BaseUnits.PmNonUnitRegex);
  }
};
var PortugueseNumberWithUnitParserConfiguration = class extends BaseNumberWithUnitParserConfiguration {
  constructor(ci) {
    super(ci);
    this.internalNumberExtractor = new recognizersTextNumber.PortugueseNumberExtractor(recognizersTextNumber.NumberMode.Default);
    this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.PortugueseNumberParserConfiguration());
    this.connectorToken = exports.PortugueseNumericWithUnit.ConnectorToken;
  }
};

// recognizers/recognizers-number-with-unit/src/numberWithUnit/portuguese/currency.ts
var PortugueseCurrencyExtractorConfiguration = class extends PortugueseNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_CURRENCY;
    this.suffixList = exports.PortugueseNumericWithUnit.CurrencySuffixList;
    this.prefixList = exports.PortugueseNumericWithUnit.CurrencyPrefixList;
    this.ambiguousUnitList = exports.PortugueseNumericWithUnit.AmbiguousCurrencyUnitList;
  }
};
var PortugueseCurrencyParserConfiguration = class extends PortugueseNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
    }
    super(ci);
    this.BindDictionary(exports.PortugueseNumericWithUnit.CurrencySuffixList);
    this.BindDictionary(exports.PortugueseNumericWithUnit.CurrencyPrefixList);
  }
};
var PortugueseTemperatureExtractorConfiguration = class extends PortugueseNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_TEMPERATURE;
    this.suffixList = exports.PortugueseNumericWithUnit.TemperatureSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = new Array();
  }
};
var PortugueseTemperatureParserConfiguration = class extends PortugueseNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
    }
    super(ci);
    this.BindDictionary(exports.PortugueseNumericWithUnit.TemperatureSuffixList);
  }
};
var dimensionSuffixList2 = new Map([
  ...exports.PortugueseNumericWithUnit.InformationSuffixList,
  ...exports.PortugueseNumericWithUnit.AreaSuffixList,
  ...exports.PortugueseNumericWithUnit.LengthSuffixList,
  ...exports.PortugueseNumericWithUnit.SpeedSuffixList,
  ...exports.PortugueseNumericWithUnit.VolumeSuffixList,
  ...exports.PortugueseNumericWithUnit.WeightSuffixList
]);
var PortugueseDimensionExtractorConfiguration = class extends PortugueseNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_DIMENSION;
    this.suffixList = dimensionSuffixList2;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = exports.PortugueseNumericWithUnit.AmbiguousDimensionUnitList;
  }
};
var PortugueseDimensionParserConfiguration = class extends PortugueseNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
    }
    super(ci);
    this.BindDictionary(dimensionSuffixList2);
  }
};
var PortugueseAgeExtractorConfiguration = class extends PortugueseNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_AGE;
    this.suffixList = exports.PortugueseNumericWithUnit.AgeSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = new Array();
  }
};
var PortugueseAgeParserConfiguration = class extends PortugueseNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
    }
    super(ci);
    this.BindDictionary(exports.PortugueseNumericWithUnit.AgeSuffixList);
  }
};

// recognizers/recognizers-number-with-unit/src/resources/chineseNumericWithUnit.ts
exports.ChineseNumericWithUnit = void 0;
((ChineseNumericWithUnit2) => {
  ChineseNumericWithUnit2.AgeAmbiguousValues = ["\u5C81"];
  ChineseNumericWithUnit2.AgeSuffixList = /* @__PURE__ */ new Map([["Year", "\u5C81|\u5468\u5C81"], ["Month", "\u4E2A\u6708\u5927|\u6708\u5927"], ["Week", "\u5468\u5927"], ["Day", "\u5929\u5927"]]);
  ChineseNumericWithUnit2.BuildPrefix = "";
  ChineseNumericWithUnit2.BuildSuffix = "";
  ChineseNumericWithUnit2.ConnectorToken = "";
  ChineseNumericWithUnit2.CurrencySuffixList = /* @__PURE__ */ new Map([["Afghan afghani", "\u963F\u5BCC\u6C57\u5C3C"], ["Pul", "\u666E\u5C14"], ["Euro", "\u6B27\u5143"], ["Cent", "\u7F8E\u5206"], ["Albanian lek", "\u963F\u5C14\u5DF4\u5C3C\u4E9A\u5217\u514B|\u5217\u514B"], ["Angolan kwanza", "\u5B89\u54E5\u62C9\u5BBD\u624E|\u5BBD\u624E"], ["Armenian dram", "\u4E9A\u7F8E\u5C3C\u4E9A\u5FB7\u62C9\u59C6"], ["Aruban florin", "\u963F\u9C81\u5DF4\u5F17\u7F57\u6797|\u963F\u9C81\u5DF4\u5E01"], ["Bangladeshi taka", "\u5854\u5361|\u5B5F\u52A0\u62C9\u5854\u5361"], ["Paisa", "\u6D3E\u8428|\u5E15\u8428"], ["Bhutanese ngultrum", "\u4E0D\u4E39\u52AA\u5C14\u7279\u9C81\u59C6|\u4E0D\u4E39\u52AA\u624E\u59C6|\u52AA\u624E\u59C6"], ["Chetrum", "\u5207\u7279\u9C81\u59C6"], ["Bolivian boliviano", "\u73BB\u5229\u7EF4\u4E9A\u8BFA|\u73BB\u5229\u7EF4\u4E9A\u5E01"], ["Bosnia and Herzegovina convertible mark", "\u6CE2\u65AF\u5C3C\u4E9A\u548C\u9ED1\u585E\u54E5\u7EF4\u90A3\u53EF\u5151\u6362\u9A6C\u514B|\u6CE2\u8D6B\u53EF\u5151\u6362\u9A6C\u514B"], ["Botswana pula", "\u535A\u8328\u74E6\u7EB3\u666E\u62C9|\u666E\u62C9"], ["Thebe", "thebe"], ["Brazilian real", "\u5DF4\u897F\u96F7\u4E9A\u5C14"], ["Bulgarian lev", "\u4FDD\u52A0\u5229\u4E9A\u5217\u5F17|\u4FDD\u52A0\u5229\u4E9A\u5217\u74E6"], ["Stotinka", "\u65AF\u6258\u4E01\u5361"], ["Cambodian riel", "\u745E\u5C14"], ["Cape Verdean escudo", "\u4F5B\u5F97\u89D2\u57C3\u65AF\u5E93\u591A|\u7EF4\u5FB7\u89D2\u57C3\u65AF\u5E93\u591A"], ["Croatian kuna", "\u514B\u7F57\u5730\u4E9A\u5E93\u7EB3|\u514B\u7F57\u5730\u4E9A\u5E93\u90A3|\u514B\u7F57\u57C3\u897F\u4E9A\u5E93\u7EB3"], ["Lipa", "\u5229\u5DF4"], ["Eritrean nakfa", "\u5384\u7ACB\u7279\u91CC\u4E9A\u7EB3\u514B\u6CD5"], ["Ethiopian birr", "\u57C3\u585E\u4FC4\u6BD4\u4E9A\u6BD4\u5C14|\u57C3\u585E\u4FC4\u6BD4\u4E9A\u5143"], ["Gambian dalasi", "\u5188\u6BD4\u4E9A\u8FBE\u62C9\u897F|\u7518\u6BD4\u4E9A\u8FBE\u62C9\u897F"], ["Butut", "\u5E03\u8FBE|\u5E03\u56FE"], ["Georgian lari", "\u683C\u9C81\u5409\u4E9A\u62C9\u91CC"], ["Tetri", "\u7279\u7279\u91CC|\u6CF0\u7279\u91CC"], ["Ghanaian cedi", "\u585E\u5730|\u52A0\u7EB3\u585E\u5730"], ["Pesewa", "\u6BD4\u585E\u74E6"], ["Guatemalan quetzal", "\u74DC\u5730\u9A6C\u62C9\u683C\u67E5\u5C14"], ["Haitian gourde", "\u6D77\u5730\u53E4\u5FB7"], ["Honduran lempira", "\u6D2A\u90FD\u62C9\u65AF\u4F26\u76AE\u62C9"], ["Hungarian forint", "\u5308\u7259\u5229\u798F\u6797|\u5308\u7259\u5229\u8D27\u5E01|\u5308\u7259\u5229\u798F\u6797\u5E01"], ["Iranian rial", "\u4F0A\u6717\u91CC\u4E9A\u5C14|\u4F0A\u6717\u83B1\u5C14"], ["Yemeni rial", "\u53F6\u95E8\u83B1\u5C14|\u53F6\u95E8\u91CC\u4E9A\u5C14"], ["Israeli new shekel", "\u20AA|ils|\u4EE5\u8272\u5217\u5E01|\u4EE5\u8272\u5217\u65B0\u514B\u5C14|\u8C22\u514B\u5C14"], ["Japanese yen", "\u65E5\u5143|\u65E5\u672C\u5143|\u65E5\u5E01|\u65E5\u5706"], ["Sen", "\u65E5\u672C\u92AD"], ["Kazakhstani tenge", "\u54C8\u8428\u514B\u65AF\u5766\u575A\u6208"], ["Kenyan shilling", "\u80AF\u5C3C\u4E9A\u5148\u4EE4"], ["North Korean won", "\u671D\u9C9C\u5706|\u671D\u9C9C\u5143"], ["South Korean won", "\u97E9\u5143|\u97E9\u5706"], ["Korean won", "\u20A9"], ["Kyrgyzstani som", "\u5409\u5C14\u5409\u65AF\u65AF\u5766\u7D22\u59C6"], ["Lao kip", "\u57FA\u666E|\u8001\u631D\u57FA\u666E|\u8001\u631D\u5E01"], ["Att", "att"], ["Lesotho loti", "\u83B1\u7D22\u6258\u6D1B\u63D0|\u83B1\u7D22\u6258\u9A6C\u6D1B\u8482"], ["South African rand", "\u5357\u975E\u5170\u7279"], ["Macedonian denar", "\u9A6C\u5176\u987F\u4EE3\u7EB3\u5C14|\u9A6C\u5176\u987F\u5E01|\u7B2C\u7EB3\u5C14|\u4EE3\u7EB3\u5C14"], ["Deni", "\u7B2C\u5C3C"], ["Malagasy ariary", "\u9A6C\u8FBE\u52A0\u65AF\u52A0\u963F\u91CC\u4E9A\u91CC"], ["Iraimbilanja", "\u4F0A\u83B1\u59C6\u6BD4\u62C9\u8D3E"], ["Malawian kwacha", "\u9A6C\u62C9\u5A01\u514B\u74E6\u67E5"], ["Tambala", "\u5766\u5DF4\u62C9"], ["Malaysian ringgit", "\u9A6C\u6765\u897F\u4E9A\u5E01|\u9A6C\u5E01|\u9A6C\u6765\u897F\u4E9A\u6797\u5409\u7279"], ["Mauritanian ouguiya", "\u6BDB\u91CC\u5854\u5C3C\u4E9A\u4E4C\u5409\u4E9A"], ["Khoums", "\u5E93\u59C6\u65AF"], ["Mozambican metical", "\u83AB\u6851\u6BD4\u514B\u6885\u8482\u5361\u5C14|\u6885\u8482\u5361\u5C14"], ["Burmese kyat", "\u7F05\u7538\u5143|\u7F05\u5143"], ["Pya", "\u7F05\u5206"], ["Nigerian naira", "\u5C3C\u65E5\u5229\u4E9A\u5948\u62C9|\u5C3C\u65E5\u5229\u4E9A\u5E01|\u5948\u62C9"], ["Kobo", "\u8003\u5305"], ["Turkish lira", "\u571F\u8033\u5176\u91CC\u62C9"], ["Kuru\u015F", "\u5E93\u9C81"], ["Omani rial", "\u963F\u66FC\u91CC\u4E9A\u5C14|\u963F\u66FC\u83B1\u5C14"], ["Panamanian balboa", "\u5DF4\u62FF\u9A6C\u5DF4\u6CE2\u4E9A"], ["Centesimo", "\u610F\u5927\u5229\u5206|\u4E4C\u62C9\u572D\u5206|\u5DF4\u62FF\u9A6C\u5206"], ["Papua New Guinean kina", "\u57FA\u90A3"], ["Toea", "\u6258\u4E9A|\u6258\u4F0A"], ["Peruvian sol", "\u79D8\u9C81\u7D22\u5C14"], ["Polish z\u0142oty", "\u6CE2\u5170\u5E01|\u6CE2\u5170\u5179\u7F57\u63D0|\u5179\u7F57\u63D0"], ["Grosz", "\u683C\u7F57\u5E0C"], ["Qatari riyal", "\u5361\u8FBE\u91CC\u4E9A\u5C14"], ["Saudi riyal", "\u6C99\u7279\u91CC\u4E9A\u5C14"], ["Riyal", "\u91CC\u4E9A\u5C14|"], ["Dirham", "\u8FEA\u62C9\u59C6"], ["Halala", "\u54C8\u62C9"], ["Samoan t\u0101l\u0101", "\u8428\u6469\u4E9A\u5854\u62C9"], ["Sierra Leonean leone", "\u585E\u62C9\u5229\u6602\u5229\u6602|\u5229\u6602"], ["Peseta", "\u6BD4\u585E\u5854|\u897F\u73ED\u7259\u6BD4\u585E\u5854|\u897F\u73ED\u7259\u5E01"], ["Swazi lilangeni", "\u65AF\u5A01\u58EB\u5170\u91CC\u5170\u5409\u5C3C|\u5170\u5409\u5C3C"], ["Tajikistani somoni", "\u5854\u5409\u514B\u65AF\u5766\u7D22\u83AB\u5C3C"], ["Thai baht", "\u6CF0\u94E2|\u6CF0\u5143"], ["Satang", "\u8428\u5F53"], ["Tongan pa\u02BBanga", "\u6C64\u52A0\u6F58\u52A0|\u6F58\u52A0"], ["Ukrainian hryvnia", "\u4E4C\u514B\u5170\u683C\u91CC\u592B\u7EB3|\u683C\u91CC\u592B\u7EB3"], ["Vanuatu vatu", "\u74E6\u52AA\u963F\u56FE\u74E6\u56FE"], ["Vietnamese dong", "\u8D8A\u5357\u76FE"], ["Indonesian rupiah", "\u5370\u5EA6\u5C3C\u897F\u4E9A\u76FE"], ["Netherlands guilder", "\u8377\u5170\u76FE|\u8377\u5C5E\u5B89\u7684\u5217\u65AF\u76FE|\u5217\u65AF\u76FE"], ["Surinam florin", "\u82CF\u91CC\u5357\u76FE"], ["Guilder", "\u76FE"], ["Zambian kwacha", "\u8D5E\u6BD4\u4E9A\u514B\u74E6\u67E5"], ["Moroccan dirham", "\u6469\u6D1B\u54E5\u8FEA\u62C9\u59C6"], ["United Arab Emirates dirham", "\u963F\u8054\u914B\u8FEA\u62C9\u59C6"], ["Azerbaijani manat", "\u963F\u585E\u62DC\u7586\u9A6C\u7EB3\u7279"], ["Turkmenistan manat", "\u571F\u5E93\u66FC\u9A6C\u7EB3\u7279"], ["Manat", "\u9A6C\u7EB3\u7279"], ["Somali shilling", "\u7D22\u9A6C\u91CC\u5148\u4EE4|\u7D22\u9A6C\u5229\u5148\u4EE4"], ["Somaliland shilling", "\u7D22\u9A6C\u91CC\u5170\u5148\u4EE4"], ["Tanzanian shilling", "\u5766\u6851\u5C3C\u4E9A\u5148\u4EE4"], ["Ugandan shilling", "\u4E4C\u5E72\u8FBE\u5148\u4EE4"], ["Romanian leu", "\u7F57\u9A6C\u5C3C\u4E9A\u5217\u4F0A"], ["Moldovan leu", "\u6469\u5C14\u591A\u74E6\u5217\u4F0A"], ["Leu", "\u5217\u4F0A"], ["Ban", "\u5DF4\u5C3C"], ["Nepalese rupee", "\u5C3C\u6CCA\u5C14\u5362\u6BD4"], ["Pakistani rupee", "\u5DF4\u57FA\u65AF\u5766\u5362\u6BD4"], ["Indian rupee", "\u5370\u5EA6\u5362\u6BD4"], ["Seychellois rupee", "\u585E\u820C\u5C14\u5362\u6BD4"], ["Mauritian rupee", "\u6BDB\u91CC\u6C42\u65AF\u5362\u6BD4"], ["Maldivian rufiyaa", "\u9A6C\u5C14\u4EE3\u592B\u5362\u6BD4"], ["Sri Lankan rupee", "\u65AF\u91CC\u5170\u5361\u5362\u6BD4"], ["Rupee", "\u5362\u6BD4"], ["Czech koruna", "\u6377\u514B\u514B\u6717"], ["Danish krone", "\u4E39\u9EA6\u514B\u6717|\u4E39\u9EA6\u514B\u90CE"], ["Norwegian krone", "\u632A\u5A01\u514B\u6717"], ["Faroese kr\xF3na", "\u6CD5\u7F57\u514B\u6717"], ["Icelandic kr\xF3na", "\u51B0\u5C9B\u514B\u6717"], ["Swedish krona", "\u745E\u5178\u514B\u6717"], ["Krone", "\u514B\u6717"], ["\xD8re", "\u5965\u4F9D\u62C9|\u5965\u62C9|\u57C3\u5229"], ["West African CFA franc", "\u975E\u5171\u4F53\u6CD5\u90CE"], ["Central African CFA franc", "\u4E2D\u975E\u6CD5\u90CE|\u4E2D\u975E\u91D1\u878D\u5408\u4F5C\u6CD5\u90CE"], ["Comorian franc", "\u79D1\u6469\u7F57\u6CD5\u90CE"], ["Congolese franc", "\u521A\u679C\u6CD5\u90CE"], ["Burundian franc", "\u5E03\u9686\u8FEA\u6CD5\u90CE"], ["Djiboutian franc", "\u5409\u5E03\u63D0\u6CD5\u90CE"], ["CFP franc", "\u592A\u5E73\u6D0B\u6CD5\u90CE"], ["Guinean franc", "\u51E0\u5185\u4E9A\u6CD5\u90CE"], ["Swiss franc", "\u745E\u58EB\u6CD5\u90CE"], ["Rwandan franc", "\u5362\u65FA\u8FBE\u6CD5\u90CE"], ["Belgian franc", "\u6BD4\u5229\u65F6\u6CD5\u90CE"], ["Rappen", "\u745E\u58EB\u5206|\u745E\u58EB\u751F\u4E01"], ["Franc", "\u6CD5\u90CE"], ["Centime", "\u751F\u4E01|\u4ED9\u58EB"], ["Russian ruble", "\u4FC4\u56FD\u5362\u5E03|\u4FC4\u7F57\u65AF\u5362\u5E03"], ["Transnistrian ruble", "\u5FB7\u6D85\u65AF\u7279\u5362\u5E03"], ["Belarusian ruble", "\u767D\u4FC4\u7F57\u65AF\u5362\u5E03"], ["Kopek", "\u6208\u6BD4"], ["Ruble", "\u5362\u5E03"], ["Algerian dinar", "\u963F\u5C14\u53CA\u5229\u4E9A\u7B2C\u7EB3\u5C14"], ["Bahraini dinar", "\u5DF4\u6797\u7B2C\u7EB3\u5C14"], ["Iraqi dinar", "\u4F0A\u62C9\u514B\u7B2C\u7EB3\u5C14|"], ["Jordanian dinar", "\u7EA6\u65E6\u7B2C\u7EB3\u5C14"], ["Kuwaiti dinar", "\u79D1\u5A01\u7279\u7B2C\u7EB3\u5C14|\u79D1\u5A01\u7279\u5E01"], ["Libyan dinar", "\u5229\u6BD4\u4E9A\u7B2C\u7EB3\u5C14"], ["Serbian dinar", "\u585E\u5C14\u7EF4\u4E9A\u7B2C\u7EB3\u5C14|\u585E\u5C14\u7EF4\u4E9A\u5E01"], ["Tunisian dinar", "\u7A81\u5C3C\u65AF\u7B2C\u7EB3\u5C14"], ["Dinar", "\u7B2C\u7EB3\u5C14"], ["Fils", "\u8D39\u5C14"], ["Para", "\u5E15\u62C9"], ["Millime", "\u7C73\u5229\u59C6"], ["Argentine peso", "\u963F\u6839\u5EF7\u6BD4\u7D22"], ["Chilean peso", "\u667A\u5229\u6BD4\u7D22"], ["Colombian peso", "\u54E5\u4F26\u6BD4\u4E9A\u6BD4\u7D22"], ["Cuban peso", "\u53E4\u5DF4\u6BD4\u7D22"], ["Dominican peso", "\u591A\u7C73\u5C3C\u52A0\u6BD4\u7D22"], ["Mexican peso", "\u58A8\u897F\u54E5\u6BD4\u7D22"], ["Philippine peso", "\u83F2\u5F8B\u5BBE\u6BD4\u7D22"], ["Uruguayan peso", "\u4E4C\u62C9\u572D\u6BD4\u7D22"], ["Peso", "\u6BD4\u7D22"], ["Centavo", "\u4ED9|\u83F2\u8F85\u5E01"], ["Alderney pound", "\u5965\u5C14\u5FB7\u5C3C\u9551"], ["British pound", "\u82F1\u9551"], ["Guernsey pound", "\u6839\u897F\u9551"], ["Saint Helena pound", "\u5723\u8D6B\u52D2\u62FF\u9551"], ["Egyptian pound", "\u57C3\u53CA\u9551"], ["Falkland Islands pound", "\u798F\u514B\u5170\u9551"], ["Gibraltar pound", "\u76F4\u5E03\u7F57\u9640\u9551"], ["Manx pound", "\u9A6C\u6069\u5C9B\u9551"], ["Jersey pound", "\u6CFD\u897F\u5C9B\u9551"], ["Lebanese pound", "\u9ECE\u5DF4\u5AE9\u9551"], ["South Sudanese pound", "\u5357\u82CF\u4E39\u9551"], ["Sudanese pound", "\u82CF\u4E39\u9551"], ["Syrian pound", "\u53D9\u5229\u4E9A\u9551"], ["Pound", "\u82F1\u9551"], ["Pence", "\u4FBF\u58EB"], ["Shilling", "\u5148\u4EE4"], ["United States dollar", "\u7F8E\u5143|\u7F8E\u91D1|\u7F8E\u5706"], ["East Caribbean dollar", "\u4E1C\u52A0\u52D2\u6BD4\u5143"], ["Australian dollar", "\u6FB3\u5927\u5229\u4E9A\u5143|\u6FB3\u5143"], ["Bahamian dollar", "\u5DF4\u54C8\u9A6C\u5143"], ["Barbadian dollar", "\u5DF4\u5DF4\u591A\u65AF\u5143"], ["Belize dollar", "\u4F2F\u5229\u5179\u5143"], ["Bermudian dollar", "\u767E\u6155\u5927\u5143"], ["Brunei dollar", "\u6587\u83B1\u5143"], ["Singapore dollar", "\u65B0\u52A0\u5761\u5143|\u65B0\u5143"], ["Canadian dollar", "\u52A0\u5143|\u52A0\u62FF\u5927\u5143"], ["Cayman Islands dollar", "\u5F00\u66FC\u5C9B\u5143|"], ["New Zealand dollar", "\u65B0\u897F\u5170\u5143|\u7EBD\u5143"], ["Cook Islands dollar", "\u5E93\u514B\u7FA4\u5C9B\u5143"], ["Fijian dollar", "\u6590\u6D4E\u5143|\u6590\u5E01"], ["Guyanese dollar", "\u572D\u4E9A\u90A3\u5143"], ["Hong Kong dollar", "\u868A|\u6E2F\u5143|\u6E2F\u5706|\u6E2F\u5E01"], ["Macau Pataca", "\u6FB3\u5143|\u6FB3\u95E8\u5E01|\u6FB3\u95E8\u5143"], ["New Taiwan dollar", "\u7B8D|\u65B0\u53F0\u5E01|\u53F0\u5E01"], ["Jamaican dollar", "\u7259\u4E70\u52A0\u5143"], ["Kiribati dollar", "\u5409\u91CC\u5DF4\u65AF\u5143"], ["Liberian dollar", "\u5229\u6BD4\u91CC\u4E9A\u5143"], ["Namibian dollar", "\u7EB3\u7C73\u6BD4\u4E9A\u5143"], ["Surinamese dollar", "\u82CF\u91CC\u5357\u5143"], ["Trinidad and Tobago dollar", "\u7279\u7ACB\u5C3C\u8FBE\u591A\u5DF4\u54E5\u5143"], ["Tuvaluan dollar", "\u5410\u74E6\u9C81\u5143"], ["Chinese yuan", "\u4EBA\u6C11\u5E01|\u4EBA\u6C11\u5E01\u5143|\u5757\u94B1|\u5757|\u5143|\u5706"], ["Fen", "\u5206\u94B1|\u5206"], ["Jiao", "\u6BDB\u94B1|\u6BDB|\u89D2\u94B1|\u89D2"], ["Finnish markka", "\u82AC\u5170\u9A6C\u514B"], ["Penni", "\u76C6\u5C3C"]]);
  ChineseNumericWithUnit2.CurrencyNameToIsoCodeMap = /* @__PURE__ */ new Map([["Afghan afghani", "AFN"], ["Euro", "EUR"], ["Albanian lek", "ALL"], ["Angolan kwanza", "AOA"], ["Armenian dram", "AMD"], ["Aruban florin", "AWG"], ["Bangladeshi taka", "BDT"], ["Bhutanese ngultrum", "BTN"], ["Bolivian boliviano", "BOB"], ["Bosnia and Herzegovina convertible mark", "BAM"], ["Botswana pula", "BWP"], ["Brazilian real", "BRL"], ["Bulgarian lev", "BGN"], ["Cambodian riel", "KHR"], ["Cape Verdean escudo", "CVE"], ["Costa Rican col\xF3n", "CRC"], ["Croatian kuna", "HRK"], ["Czech koruna", "CZK"], ["Eritrean nakfa", "ERN"], ["Ethiopian birr", "ETB"], ["Gambian dalasi", "GMD"], ["Georgian lari", "GEL"], ["Ghanaian cedi", "GHS"], ["Guatemalan quetzal", "GTQ"], ["Haitian gourde", "HTG"], ["Honduran lempira", "HNL"], ["Hungarian forint", "HUF"], ["Iranian rial", "IRR"], ["Yemeni rial", "YER"], ["Israeli new shekel", "ILS"], ["Japanese yen", "JPY"], ["Kazakhstani tenge", "KZT"], ["Kenyan shilling", "KES"], ["North Korean won", "KPW"], ["South Korean won", "KRW"], ["Kyrgyzstani som", "KGS"], ["Lao kip", "LAK"], ["Lesotho loti", "LSL"], ["South African rand", "ZAR"], ["Macanese pataca", "MOP"], ["Macedonian denar", "MKD"], ["Malagasy ariary", "MGA"], ["Malawian kwacha", "MWK"], ["Malaysian ringgit", "MYR"], ["Mauritanian ouguiya", "MRO"], ["Mongolian t\xF6gr\xF6g", "MNT"], ["Mozambican metical", "MZN"], ["Burmese kyat", "MMK"], ["Nicaraguan c\xF3rdoba", "NIO"], ["Nigerian naira", "NGN"], ["Turkish lira", "TRY"], ["Omani rial", "OMR"], ["Panamanian balboa", "PAB"], ["Papua New Guinean kina", "PGK"], ["Paraguayan guaran\xED", "PYG"], ["Peruvian sol", "PEN"], ["Polish z\u0142oty", "PLN"], ["Qatari riyal", "QAR"], ["Saudi riyal", "SAR"], ["Samoan t\u0101l\u0101", "WST"], ["S\xE3o Tom\xE9 and Pr\xEDncipe dobra", "STD"], ["Sierra Leonean leone", "SLL"], ["Swazi lilangeni", "SZL"], ["Tajikistani somoni", "TJS"], ["Thai baht", "THB"], ["Ukrainian hryvnia", "UAH"], ["Vanuatu vatu", "VUV"], ["Venezuelan bol\xEDvar", "VEF"], ["Zambian kwacha", "ZMW"], ["Moroccan dirham", "MAD"], ["United Arab Emirates dirham", "AED"], ["Azerbaijani manat", "AZN"], ["Turkmenistan manat", "TMT"], ["Somali shilling", "SOS"], ["Tanzanian shilling", "TZS"], ["Ugandan shilling", "UGX"], ["Romanian leu", "RON"], ["Moldovan leu", "MDL"], ["Nepalese rupee", "NPR"], ["Pakistani rupee", "PKR"], ["Indian rupee", "INR"], ["Seychellois rupee", "SCR"], ["Mauritian rupee", "MUR"], ["Maldivian rufiyaa", "MVR"], ["Sri Lankan rupee", "LKR"], ["Indonesian rupiah", "IDR"], ["Danish krone", "DKK"], ["Norwegian krone", "NOK"], ["Icelandic kr\xF3na", "ISK"], ["Swedish krona", "SEK"], ["West African CFA franc", "XOF"], ["Central African CFA franc", "XAF"], ["Comorian franc", "KMF"], ["Congolese franc", "CDF"], ["Burundian franc", "BIF"], ["Djiboutian franc", "DJF"], ["CFP franc", "XPF"], ["Guinean franc", "GNF"], ["Swiss franc", "CHF"], ["Rwandan franc", "RWF"], ["Russian ruble", "RUB"], ["Transnistrian ruble", "PRB"], ["Belarusian ruble", "BYN"], ["Algerian dinar", "DZD"], ["Bahraini dinar", "BHD"], ["Iraqi dinar", "IQD"], ["Jordanian dinar", "JOD"], ["Kuwaiti dinar", "KWD"], ["Libyan dinar", "LYD"], ["Serbian dinar", "RSD"], ["Tunisian dinar", "TND"], ["Argentine peso", "ARS"], ["Chilean peso", "CLP"], ["Colombian peso", "COP"], ["Cuban convertible peso", "CUC"], ["Cuban peso", "CUP"], ["Dominican peso", "DOP"], ["Mexican peso", "MXN"], ["Uruguayan peso", "UYU"], ["British pound", "GBP"], ["Saint Helena pound", "SHP"], ["Egyptian pound", "EGP"], ["Falkland Islands pound", "FKP"], ["Gibraltar pound", "GIP"], ["Manx pound", "IMP"], ["Jersey pound", "JEP"], ["Lebanese pound", "LBP"], ["South Sudanese pound", "SSP"], ["Sudanese pound", "SDG"], ["Syrian pound", "SYP"], ["United States dollar", "USD"], ["Australian dollar", "AUD"], ["Bahamian dollar", "BSD"], ["Barbadian dollar", "BBD"], ["Belize dollar", "BZD"], ["Bermudian dollar", "BMD"], ["Brunei dollar", "BND"], ["Singapore dollar", "SGD"], ["Canadian dollar", "CAD"], ["Cayman Islands dollar", "KYD"], ["New Zealand dollar", "NZD"], ["Fijian dollar", "FJD"], ["Guyanese dollar", "GYD"], ["Hong Kong dollar", "HKD"], ["Jamaican dollar", "JMD"], ["Liberian dollar", "LRD"], ["Namibian dollar", "NAD"], ["Solomon Islands dollar", "SBD"], ["Surinamese dollar", "SRD"], ["New Taiwan dollar", "TWD"], ["Trinidad and Tobago dollar", "TTD"], ["Tuvaluan dollar", "TVD"], ["Chinese yuan", "CNY"], ["Rial", "__RI"], ["Shiling", "__S"], ["Som", "__SO"], ["Dirham", "__DR"], ["Dinar", "_DN"], ["Dollar", "__D"], ["Manat", "__MA"], ["Rupee", "__R"], ["Krone", "__K"], ["Krona", "__K"], ["Crown", "__K"], ["Frank", "__F"], ["Mark", "__M"], ["Ruble", "__RB"], ["Peso", "__PE"], ["Pound", "__P"], ["Tristan da Cunha pound", "_TP"], ["South Georgia and the South Sandwich Islands pound", "_SP"], ["Somaliland shilling", "_SS"], ["Pitcairn Islands dollar", "_PND"], ["Palauan dollar", "_PD"], ["Niue dollar", "_NID"], ["Nauruan dollar", "_ND"], ["Micronesian dollar", "_MD"], ["Kiribati dollar", "_KID"], ["Guernsey pound", "_GGP"], ["Faroese kr\xF3na", "_FOK"], ["Cook Islands dollar", "_CKD"], ["British Virgin Islands dollar", "_BD"], ["Ascension pound", "_AP"], ["Alderney pound", "_ALP"], ["Abkhazian apsar", "_AA"]]);
  ChineseNumericWithUnit2.FractionalUnitNameToCodeMap = /* @__PURE__ */ new Map([["Jiao", "JIAO"], ["Kopek", "KOPEK"], ["Pul", "PUL"], ["Cent", "CENT"], ["Qindark\xEB", "QINDARKE"], ["Penny", "PENNY"], ["Santeem", "SANTEEM"], ["C\xEAntimo", "CENTIMO"], ["Centavo", "CENTAVO"], ["Luma", "LUMA"], ["Q\u0259pik", "Q\u018FPIK"], ["Fils", "FILS"], ["Poisha", "POISHA"], ["Kapyeyka", "KAPYEYKA"], ["Centime", "CENTIME"], ["Chetrum", "CHETRUM"], ["Paisa", "PAISA"], ["Fening", "FENING"], ["Thebe", "THEBE"], ["Sen", "SEN"], ["Stotinka", "STOTINKA"], ["Fen", "FEN"], ["C\xE9ntimo", "CENTIMO"], ["Lipa", "LIPA"], ["Hal\xE9\u0159", "HALER"], ["\xD8re", "\xD8RE"], ["Piastre", "PIASTRE"], ["Santim", "SANTIM"], ["Oyra", "OYRA"], ["Butut", "BUTUT"], ["Tetri", "TETRI"], ["Pesewa", "PESEWA"], ["Fill\xE9r", "FILLER"], ["Eyrir", "EYRIR"], ["Dinar", "DINAR"], ["Agora", "AGORA"], ["T\xEF\u0131n", "TIIN"], ["Chon", "CHON"], ["Jeon", "JEON"], ["Tyiyn", "TYIYN"], ["Att", "ATT"], ["Sente", "SENTE"], ["Dirham", "DIRHAM"], ["Rappen", "RAPPEN"], ["Avo", "AVO"], ["Deni", "DENI"], ["Iraimbilanja", "IRAIMBILANJA"], ["Tambala", "TAMBALA"], ["Laari", "LAARI"], ["Khoums", "KHOUMS"], ["Ban", "BAN"], ["M\xF6ng\xF6", "MONGO"], ["Pya", "PYA"], ["Kobo", "KOBO"], ["Kuru\u015F", "KURUS"], ["Baisa", "BAISA"], ["Cent\xE9simo", "CENTESIMO"], ["Toea", "TOEA"], ["Sentimo", "SENTIMO"], ["Grosz", "GROSZ"], ["Sene", "SENE"], ["Halala", "HALALA"], ["Para", "PARA"], ["\xD6re", "ORE"], ["Diram", "DIRAM"], ["Satang", "SATANG"], ["Seniti", "SENITI"], ["Millime", "MILLIME"], ["Tennesi", "TENNESI"], ["Kopiyka", "KOPIYKA"], ["Tiyin", "TIYIN"], ["H\xE0o", "HAO"], ["Ngwee", "NGWEE"]]);
  ChineseNumericWithUnit2.CompoundUnitConnectorRegex = `(?<spacer>\u53C8|\u518D)`;
  ChineseNumericWithUnit2.CurrencyPrefixList = /* @__PURE__ */ new Map([["Dollar", "$"], ["United States dollar", "us$"], ["British Virgin Islands dollar", "bvi$"], ["Brunei dollar", "b$"], ["Sen", "sen"], ["Singapore dollar", "s$"], ["Canadian dollar", "can$|c$|c $"], ["Cayman Islands dollar", "ci$"], ["New Zealand dollar", "nz$|nz $"], ["Guyanese dollar", "gy$|gy $|g$|g $"], ["Hong Kong dollar", "hk$|hkd|hk $"], ["Jamaican dollar", "j$"], ["Namibian dollar", "nad|n$|n $"], ["Solomon Islands dollar", "si$|si $"], ["New Taiwan dollar", "nt$|nt $"], ["Samoan t\u0101l\u0101", "ws$"], ["Chinese yuan", "\uFFE5"], ["Japanese yen", "\xA5"], ["Turkish lira", "\u20BA"], ["Euro", "\u20AC"], ["Pound", "\xA3"], ["Costa Rican col\xF3n", "\u20A1"]]);
  ChineseNumericWithUnit2.CurrencyAmbiguousValues = ["\u5143", "\u4ED9", "\u5206", "\u5706", "\u5757", "\u6BDB", "\u76FE", "\u7B8D", "\u868A", "\u89D2"];
  ChineseNumericWithUnit2.DimensionSuffixList = /* @__PURE__ */ new Map([["Meter", "\u7C73|\u516C\u5C3A|m"], ["Kilometer", "\u5343\u7C73|\u516C\u91CC|km"], ["Decimeter", "\u5206\u7C73|\u516C\u5BF8|dm"], ["Centimeter", "\u91D0\u7C73|\u5398\u7C73|\u516C\u5206|cm"], ["Micrometer", "\u6BEB\u7C73|\u516C\u91D0|mm"], ["Microns", "\u5FAE\u7C73"], ["Picometer", "\u76AE\u7C73"], ["Nanometer", "\u7EB3\u7C73"], ["Li", "\u91CC|\u5E02\u91CC"], ["Zhang", "\u4E08"], ["Chi", "\u5E02\u5C3A|\u5C3A"], ["Cun", "\u5E02\u5BF8|\u5BF8"], ["Fen", "\u5E02\u5206|\u5206"], ["Hao", "\u6BEB"], ["Mile", "\u82F1\u91CC"], ["Inch", "\u82F1\u5BF8"], ["Foot", "\u544E|\u82F1\u5C3A"], ["Yard", "\u7801"], ["Knot", "\u6D77\u91CC"], ["Light year", "\u5149\u5E74"], ["Meter per second", "\u7C73\u6BCF\u79D2|\u7C73/\u79D2|m/s"], ["Kilometer per hour", "\u516C\u91CC\u6BCF\u5C0F\u65F6|\u5343\u7C73\u6BCF\u5C0F\u65F6|\u516C\u91CC/\u5C0F\u65F6|\u5343\u7C73/\u5C0F\u65F6|km/h"], ["Kilometer per minute", "\u516C\u91CC\u6BCF\u5206\u949F|\u5343\u7C73\u6BCF\u5206\u949F|\u516C\u91CC/\u5206\u949F|\u5343\u7C73/\u5206\u949F|km/min"], ["Kilometer per second", "\u516C\u91CC\u6BCF\u79D2|\u5343\u7C73\u6BCF\u79D2|\u516C\u91CC/\u79D2|\u5343\u7C73/\u79D2|km/s"], ["Mile per hour", "\u82F1\u91CC\u6BCF\u5C0F\u65F6|\u82F1\u91CC/\u5C0F\u65F6"], ["Foot per second", "\u82F1\u5C3A\u6BCF\u5C0F\u65F6|\u82F1\u5C3A/\u5C0F\u65F6"], ["Foot per minute", "\u82F1\u5C3A\u6BCF\u5206\u949F|\u82F1\u5C3A/\u5206\u949F"], ["Yard per minute", "\u7801\u6BCF\u5206|\u7801/\u5206"], ["Yard per second", "\u7801\u6BCF\u79D2|\u7801/\u79D2"], ["Square centimetre", "\u5E73\u65B9\u5398\u7C73"], ["Square decimeter", "\u5E73\u65B9\u5206\u7C73"], ["Square meter", "\u5E73\u65B9\u7C73"], ["Square kilometer", "\u5E73\u65B9\u516C\u91CC"], ["Acre", "\u82F1\u4EA9|\u516C\u4EA9"], ["Hectare", "\u516C\u9877"], ["Mu", "\u4EA9|\u5E02\u4EA9"], ["Liter", "\u516C\u5347|\u5347|l"], ["Milliliter", "\u6BEB\u5347|ml"], ["Cubic meter", "\u7ACB\u65B9\u7C73"], ["Cubic decimeter", "\u7ACB\u65B9\u5206\u7C73"], ["Cubic millimeter", "\u7ACB\u65B9\u6BEB\u7C73"], ["Cubic feet", "\u7ACB\u65B9\u82F1\u5C3A"], ["Gallon", "\u52A0\u4ED1"], ["Pint", "\u54C1\u8131"], ["Dou", "\u5E02\u6597|\u6597"], ["Dan", "\u5E02\u77F3|\u77F3"], ["Kilogram", "\u5343\u514B|\u516C\u65A4|kg"], ["Jin", "\u5E02\u65A4|\u65A4"], ["Milligram", "\u6BEB\u514B|mg"], ["Barrel", "\u6876"], ["Pot", "\u7F50"], ["Gram", "\u514B|g"], ["Ton", "\u516C\u5428|\u5428|t"], ["Pound", "\u78C5"], ["Ounce", "\u76CE\u53F8"], ["Bit", "\u6BD4\u7279|\u4F4D|b"], ["Byte", "\u5B57\u8282|byte"], ["Kilobyte", "\u5343\u5B57\u8282|kb"], ["Megabyte", "\u5146\u5B57\u8282|mb"], ["Gigabyte", "\u5341\u4EBF\u5B57\u8282|\u5343\u5146\u5B57\u8282|gb"], ["Terabyte", "\u4E07\u4EBF\u5B57\u8282|\u5146\u5146\u5B57\u8282|tb"], ["Petabyte", "\u5343\u5146\u5146|\u5343\u4E07\u4EBF\u5B57\u8282|pb"]]);
  ChineseNumericWithUnit2.DimensionAmbiguousValues = ["\u4E08", "\u4F4D", "\u514B", "\u5206", "\u5347", "\u5BF8", "\u5C3A", "\u6597", "\u65A4", "\u6876", "\u6BEB", "\u77F3", "\u7801", "\u78C5", "\u7C73", "\u7F50", "\u91CC", "m", "km", "dm", "cm", "mm", "l", "ml", "kg", "mg", "g", "t", "b", "byte", "kb", "mb", "gb", "tb", "pb"];
  ChineseNumericWithUnit2.TemperatureSuffixList = /* @__PURE__ */ new Map([["F", "\u534E\u6C0F\u6E29\u5EA6|\u534E\u6C0F\u5EA6|\xB0f"], ["K", "k|\u5F00\u5C14\u6587\u6E29\u5EA6|\u5F00\u6C0F\u5EA6|\u51EF\u6C0F\u5EA6"], ["R", "\u5170\u6C0F\u6E29\u5EA6|\xB0r"], ["C", "\u6444\u6C0F\u6E29\u5EA6|\u6444\u6C0F\u5EA6|\xB0c"], ["Degree", "\u5EA6"]]);
  ChineseNumericWithUnit2.TemperaturePrefixList = /* @__PURE__ */ new Map([["F", "\u534E\u6C0F\u6E29\u5EA6|\u534E\u6C0F"], ["K", "\u5F00\u6C0F\u6E29\u5EA6|\u5F00\u6C0F"], ["R", "\u5170\u6C0F\u6E29\u5EA6|\u5170\u6C0F"], ["C", "\u6444\u6C0F\u6E29\u5EA6|\u6444\u6C0F"]]);
  ChineseNumericWithUnit2.TemperatureAmbiguousValues = ["\u5EA6", "k"];
})(exports.ChineseNumericWithUnit || (exports.ChineseNumericWithUnit = {}));

// recognizers/recognizers-number-with-unit/src/numberWithUnit/chinese/base.ts
var ChineseNumberWithUnitExtractorConfiguration = class {
  constructor(ci) {
    this.cultureInfo = ci;
    this.unitNumExtractor = new recognizersTextNumber.ChineseNumberExtractor(recognizersTextNumber.ChineseNumberExtractorMode.ExtractAll);
    this.buildPrefix = exports.ChineseNumericWithUnit.BuildPrefix;
    this.buildSuffix = exports.ChineseNumericWithUnit.BuildSuffix;
    this.connectorToken = exports.ChineseNumericWithUnit.ConnectorToken;
    this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumericWithUnit.CompoundUnitConnectorRegex);
    this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(BaseUnits.PmNonUnitRegex);
  }
};
var ChineseNumberWithUnitParserConfiguration = class extends BaseNumberWithUnitParserConfiguration {
  constructor(ci) {
    super(ci);
    this.internalNumberExtractor = new recognizersTextNumber.ChineseNumberExtractor(recognizersTextNumber.ChineseNumberExtractorMode.Default);
    this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.ChineseNumberParserConfiguration());
    this.connectorToken = "";
    this.currencyNameToIsoCodeMap = exports.ChineseNumericWithUnit.CurrencyNameToIsoCodeMap;
    this.currencyFractionCodeList = exports.ChineseNumericWithUnit.FractionalUnitNameToCodeMap;
  }
};

// recognizers/recognizers-number-with-unit/src/numberWithUnit/chinese/currency.ts
var ChineseCurrencyExtractorConfiguration = class extends ChineseNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_CURRENCY;
    this.suffixList = exports.ChineseNumericWithUnit.CurrencySuffixList;
    this.prefixList = exports.ChineseNumericWithUnit.CurrencyPrefixList;
    this.ambiguousUnitList = exports.ChineseNumericWithUnit.CurrencyAmbiguousValues;
  }
};
var ChineseCurrencyParserConfiguration = class extends ChineseNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
    }
    super(ci);
    this.BindDictionary(exports.ChineseNumericWithUnit.CurrencySuffixList);
    this.BindDictionary(exports.ChineseNumericWithUnit.CurrencyPrefixList);
  }
};
var ChineseTemperatureExtractorConfiguration = class extends ChineseNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_TEMPERATURE;
    this.suffixList = exports.ChineseNumericWithUnit.TemperatureSuffixList;
    this.prefixList = exports.ChineseNumericWithUnit.TemperaturePrefixList;
    this.ambiguousUnitList = exports.ChineseNumericWithUnit.TemperatureAmbiguousValues;
  }
};
var ChineseTemperatureParserConfiguration = class extends ChineseNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
    }
    super(ci);
    this.BindDictionary(exports.ChineseNumericWithUnit.TemperaturePrefixList);
    this.BindDictionary(exports.ChineseNumericWithUnit.TemperatureSuffixList);
  }
};
var ChineseDimensionExtractorConfiguration = class extends ChineseNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_DIMENSION;
    this.suffixList = exports.ChineseNumericWithUnit.DimensionSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = exports.ChineseNumericWithUnit.DimensionAmbiguousValues;
  }
};
var ChineseDimensionParserConfiguration = class extends ChineseNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
    }
    super(ci);
    this.BindDictionary(exports.ChineseNumericWithUnit.DimensionSuffixList);
  }
};
var ChineseAgeExtractorConfiguration = class extends ChineseNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_AGE;
    this.suffixList = exports.ChineseNumericWithUnit.AgeSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = exports.ChineseNumericWithUnit.AgeAmbiguousValues;
  }
};
var ChineseAgeParserConfiguration = class extends ChineseNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
    }
    super(ci);
    this.BindDictionary(exports.ChineseNumericWithUnit.AgeSuffixList);
  }
};

// recognizers/recognizers-number-with-unit/src/resources/japaneseNumericWithUnit.ts
exports.JapaneseNumericWithUnit = void 0;
((JapaneseNumericWithUnit2) => {
  JapaneseNumericWithUnit2.AgeAmbiguousValues = ["\u6B73"];
  JapaneseNumericWithUnit2.AgeSuffixList = /* @__PURE__ */ new Map([["Year", "\u6B73"], ["Month", "\u30F6\u6708"], ["Week", "\u9031\u9593|\u9031"], ["Day", "\u65E5\u9593|\u65E5\u9F62|\u65E5\u5927"]]);
  JapaneseNumericWithUnit2.BuildPrefix = "";
  JapaneseNumericWithUnit2.BuildSuffix = "";
  JapaneseNumericWithUnit2.ConnectorToken = "";
  JapaneseNumericWithUnit2.CurrencySuffixList = /* @__PURE__ */ new Map([["Afghan afghani", "\u30A2\u30D5\u30AC\u30CB"], ["Pul", "\u30D7\u30EB"], ["Euro", "\u30E6\u30FC\u30ED"], ["Cent", "\u30BB\u30F3\u30C8"], ["Albanian lek", "\u30A2\u30EB\u30D0\u30CB\u30A2\u30EC\u30AF|\u30A2\u30EB\u30D0\u30CB\u30A2\u30FB\u30EC\u30AF|\u30EC\u30AF"], ["Angolan kwanza", "\u30A2\u30F3\u30B4\u30E9\u30AF\u30EF\u30F3\u30B6|\u30A2\u30F3\u30B4\u30E9\u30FB\u30AF\u30EF\u30F3\u30B6|\u30AF\u30EF\u30F3\u30B6"], ["Armenian dram", "\u30A2\u30EB\u30E1\u30CB\u30A2\u30C9\u30E9\u30E0|\u30A2\u30EB\u30E1\u30CB\u30A2\u30FB\u30C9\u30E9\u30E0|\u30C9\u30E9\u30E0"], ["Aruban florin", "\u30A2\u30EB\u30D0\u30FB\u30D5\u30ED\u30EA\u30F3|\u30D5\u30ED\u30EA\u30F3"], ["Bangladeshi taka", "\u30BF\u30AB|\u30D0\u30F3\u30B0\u30E9\u30C7\u30B7\u30E5\u30FB\u30BF\u30AB"], ["Paisa", "\u30D1\u30A4\u30B5"], ["Bhutanese ngultrum", "\u30CB\u30E5\u30EB\u30BF\u30E0|\u30D6\u30FC\u30BF\u30F3\u30FB\u30CB\u30E5\u30EB\u30BF\u30E0|\u30D6\u30FC\u30BF\u30F3\u30CB\u30E5\u30EB\u30BF\u30E0"], ["Chetrum", "\u30C1\u30A7\u30EB\u30BF\u30E0"], ["Bolivian boliviano", "\u30DC\u30EA\u30D3\u30A2\u30FC\u30CE"], ["Bosnia and Herzegovina convertible mark", "\u514C\u63DB\u30DE\u30EB\u30AF"], ["Botswana pula", "\u30DC\u30C4\u30EF\u30CA\u30FB\u30D7\u30E9|\u30DC\u30C4\u30EF\u30CA\u30D7\u30E9|\u30D7\u30E9"], ["Thebe", "\u30C6\u30D9"], ["Brazilian real", "\u30D6\u30E9\u30B8\u30EB\u30FB\u30EC\u30A2\u30EB|\u30D6\u30E9\u30B8\u30EB\u30EC\u30A2\u30EB|\u30EC\u30A2\u30EB"], ["Bulgarian lev", "\u30D6\u30EB\u30AC\u30EA\u30A2\u30FB\u30EC\u30D5|\u30D6\u30EB\u30AC\u30EA\u30A2\u30EC\u30D5|\u30EC\u30D5"], ["Stotinka", "\u30B9\u30C8\u30C6\u30A3\u30F3\u30AB"], ["Cambodian riel", "\u30AB\u30F3\u30DC\u30B8\u30A2\u30FB\u30EA\u30A8\u30EB|\u30AB\u30F3\u30DC\u30B8\u30A2\u30EA\u30A8\u30EB|\u30EA\u30A8\u30EB"], ["Cape Verdean escudo", "\u30AB\u30FC\u30DC\u30D9\u30EB\u30C7\u30FB\u30A8\u30B9\u30AF\u30FC\u30C9"], ["Croatian kuna", "\u30AF\u30ED\u30A2\u30C1\u30A2\u30AF\u30FC\u30CA|\u30AF\u30ED\u30A2\u30C1\u30A2\u30FB\u30AF\u30FC\u30CA|\u30AF\u30FC\u30CA"], ["Lipa", "\u30EA\u30D1"], ["Eritrean nakfa", "\u30A8\u30EA\u30C8\u30EA\u30A2\u30FB\u30CA\u30AF\u30D5\u30A1|\u30A8\u30EA\u30C8\u30EA\u30A2\u30CA\u30AF\u30D5\u30A1|\u30CA\u30AF\u30D5\u30A1"], ["Ethiopian birr", "\u30A8\u30C1\u30AA\u30D4\u30A2\u30FB\u30D6\u30EB|\u30A8\u30C1\u30AA\u30D4\u30A2\u30D6\u30EB|\u30D6\u30EB"], ["Gambian dalasi", "\u30AC\u30F3\u30D3\u30A2\u30FB\u30C0\u30E9\u30B7|\u30AC\u30F3\u30D3\u30A2\u30C0\u30E9\u30B7|\u30C0\u30E9\u30B7"], ["Butut", "\u30D6\u30C8\u30A5\u30C4"], ["Georgian lari", "\u30B8\u30E7\u30FC\u30B8\u30A2\u30FB\u30E9\u30EA|\u30B8\u30E7\u30FC\u30B8\u30A2\u30E9\u30EA|\u30E9\u30EA"], ["Tetri", "\u30C6\u30C8\u30EA"], ["Ghanaian cedi", "\u30AC\u30FC\u30CA\u30FB\u30BB\u30C7\u30A3|\u30AC\u30FC\u30CA\u30BB\u30C7\u30A3|\u30BB\u30C7\u30A3"], ["Pesewa", "\u30DA\u30BB\u30EF"], ["Guatemalan quetzal", "\u30B0\u30A2\u30C6\u30DE\u30E9\u30FB\u30B1\u30C4\u30A1\u30EB|\u30B0\u30A2\u30C6\u30DE\u30E9\u30B1\u30C4\u30A1\u30EB|\u30B1\u30C4\u30A1\u30EB"], ["Haitian gourde", "\u30CF\u30A4\u30C1\u30FB\u30B0\u30FC\u30EB\u30C9|\u30CF\u30A4\u30C1\u30B0\u30FC\u30EB\u30C9|\u30B0\u30FC\u30EB\u30C9"], ["Honduran lempira", "\u30DB\u30F3\u30B8\u30E5\u30E9\u30B9\u30FB\u30EC\u30F3\u30D4\u30E9|\u30DB\u30F3\u30B8\u30E5\u30E9\u30B9\u30EC\u30F3\u30D4\u30E9|\u30EC\u30F3\u30D4\u30E9"], ["Hungarian forint", "\u30CF\u30F3\u30AC\u30EA\u30FC\u30FB\u30D5\u30A9\u30EA\u30F3\u30C8|\u30CF\u30F3\u30AC\u30EA\u30FC\u30D5\u30A9\u30EA\u30F3\u30C8|\u30D5\u30A9\u30EA\u30F3\u30C8"], ["Iranian rial", "\u30A4\u30E9\u30F3\u30FB\u30EA\u30A2\u30EB"], ["Yemeni rial", "\u30A4\u30A8\u30E1\u30F3\u30FB\u30EA\u30A2\u30EB"], ["Israeli new shekel", "\u20AA|ils|\u30A4\u30B9\u30E9\u30A8\u30EB\u30FB\u65B0\u30B7\u30A7\u30B1\u30EB|\u30A4\u30B9\u30E9\u30A8\u30EB\u65B0\u30B7\u30A7\u30B1\u30EB"], ["Japanese yen", "\u5186"], ["Sen", "\u92AD"], ["Kazakhstani tenge", "\u30C6\u30F3\u30B2|\u30AB\u30B6\u30D5\u30B9\u30BF\u30F3\u30FB\u30C6\u30F3\u30B2|\u30AB\u30B6\u30D5\u30B9\u30BF\u30F3\u30C6\u30F3\u30B2"], ["Kenyan shilling", "\u30B1\u30CB\u30A2\u30FB\u30B7\u30EA\u30F3\u30B0"], ["North Korean won", "\u5317\u671D\u9BAE\u30A6\u30A9\u30F3"], ["South Korean won", "\u97D3\u56FD\u30A6\u30A9\u30F3"], ["Korean won", "\u20A9"], ["Kyrgyzstani som", "\u30AD\u30EB\u30AE\u30B9\u30FB\u30BD\u30E0|\u30BD\u30E0"], ["Lao kip", "\u30AD\u30C3\u30D7|\u30E9\u30AA\u30B9\u30FB\u30AD\u30C3\u30D7|\u30E9\u30AA\u30B9\u30AD\u30C3\u30D7"], ["Att", "att"], ["Lesotho loti", "\u30ED\u30C1|\u30EC\u30BD\u30C8\u30FB\u30ED\u30C1|\u30EC\u30BD\u30C8\u30ED\u30C1"], ["South African rand", "\u30E9\u30F3\u30C9|\u5357\u30A2\u30D5\u30EA\u30AB\u30FB\u30E9\u30F3\u30C9|\u5357\u30A2\u30D5\u30EA\u30AB\u30E9\u30F3\u30C9"], ["Macedonian denar", "\u30DE\u30B1\u30C9\u30CB\u30A2\u30FB\u30C7\u30CA\u30FC\u30EB"], ["Deni", "\u30C7\u30CB"], ["Malagasy ariary", "\u30A2\u30EA\u30A2\u30EA|\u30DE\u30C0\u30AC\u30B9\u30AB\u30EB\u30FB\u30A2\u30EA\u30A2\u30EA|\u30DE\u30C0\u30AC\u30B9\u30AB\u30EB\u30A2\u30EA\u30A2\u30EA"], ["Iraimbilanja", "\u30A4\u30E9\u30A4\u30E0\u30D3\u30E9\u30F3\u30B8\u30E3"], ["Malawian kwacha", "\u30DE\u30E9\u30A6\u30A4\u30FB\u30AF\u30EF\u30C1\u30E3"], ["Tambala", "\u30BF\u30F3\u30D0\u30E9"], ["Malaysian ringgit", "\u30EA\u30F3\u30AE\u30C3\u30C8|\u30DE\u30EC\u30FC\u30B7\u30A2\u30FB\u30EA\u30F3\u30AE\u30C3\u30C8"], ["Mauritanian ouguiya", "\u30A6\u30AE\u30A2|\u30E2\u30FC\u30EA\u30BF\u30CB\u30A2\u30FB\u30A6\u30AE\u30A2|\u30E2\u30FC\u30EA\u30BF\u30CB\u30A2\u30A6\u30AE\u30A2"], ["Khoums", "\u30B3\u30A6\u30E0"], ["Mozambican metical", "\u30E1\u30C6\u30A3\u30AB\u30EB|\u30E2\u30B6\u30F3\u30D3\u30FC\u30AF\u30FB\u30E1\u30C6\u30A3\u30AB\u30EB|\u30E2\u30B6\u30F3\u30D3\u30FC\u30AF\u30E1\u30C6\u30A3\u30AB\u30EB"], ["Burmese kyat", "\u30C1\u30E3\u30C3\u30C8|\u30DF\u30E3\u30F3\u30DE\u30FC\u30FB\u30C1\u30E3\u30C3\u30C8|\u30DF\u30E3\u30F3\u30DE\u30FC\u30C1\u30E3\u30C3\u30C8"], ["Pya", "\u30D4\u30E3\u30FC"], ["Nigerian naira", "\u30CA\u30A4\u30E9|\u30CA\u30A4\u30B8\u30A7\u30EA\u30A2\u30FB\u30CA\u30A4\u30E9|\u30CA\u30A4\u30B8\u30A7\u30EA\u30A2\u30CA\u30A4\u30E9"], ["Kobo", "\u30B3\u30DC"], ["Turkish lira", "\u30C8\u30EB\u30B3\u30EA\u30E9"], ["Kuru\u015F", "\u30AF\u30EB\u30B7\u30E5"], ["Omani rial", "\u30AA\u30DE\u30FC\u30F3\u30FB\u30EA\u30A2\u30EB"], ["Panamanian balboa", "\u30D0\u30EB\u30DC\u30A2|\u30D1\u30CA\u30DE\u30FB\u30D0\u30EB\u30DC\u30A2|\u30D1\u30CA\u30DE\u30D0\u30EB\u30DC\u30A2"], ["Centesimo", "\u30BB\u30F3\u30C6\u30B7\u30E2"], ["Papua New Guinean kina", "\u30AD\u30CA|\u30D1\u30D7\u30A2\u30FB\u30CB\u30E5\u30FC\u30AE\u30CB\u30A2\u30FB\u30AD\u30CA"], ["Toea", "\u30C8\u30A8\u30A2"], ["Peruvian sol", "\u30CC\u30A8\u30DC\u30FB\u30BD\u30EB"], ["Polish z\u0142oty", "\u30BA\u30A6\u30A9\u30C6\u30A3|\u30DD\u30FC\u30E9\u30F3\u30C9\u30FB\u30BA\u30A6\u30A9\u30C6\u30A3|\u30DD\u30FC\u30E9\u30F3\u30C9\u30BA\u30A6\u30A9\u30C6\u30A3"], ["Grosz", "\u30B0\u30ED\u30B7\u30E5"], ["Qatari riyal", "\u30AB\u30BF\u30FC\u30EB\u30FB\u30EA\u30E4\u30EB"], ["Saudi riyal", "\u30B5\u30A6\u30B8\u30A2\u30E9\u30D3\u30A2\u30FB\u30EA\u30E4\u30EB"], ["Riyal", "\u30EA\u30E4\u30EB"], ["Dirham", "\u30C7\u30A3\u30EB\u30CF\u30E0"], ["Halala", "\u30CF\u30E9\u30E9"], ["Samoan t\u0101l\u0101", "\u30BF\u30E9|\u30B5\u30E2\u30A2\u30FB\u30BF\u30E9|\u30B5\u30E2\u30A2\u30BF\u30E9"], ["Sierra Leonean leone", "\u30EC\u30AA\u30F3|\u30B7\u30A8\u30E9\u30EC\u30AA\u30CD\u30FB\u30EC\u30AA\u30F3|\u30B7\u30A8\u30E9\u30EC\u30AA\u30CD\u30EC\u30AA\u30F3"], ["Peseta", "\u30E6\u30FC\u30ED"], ["Swazi lilangeni", "\u30EA\u30E9\u30F3\u30B2\u30CB|\u30B9\u30EF\u30B8\u30E9\u30F3\u30C9\u30FB\u30EA\u30E9\u30F3\u30B2\u30CB|\u30B9\u30EF\u30B8\u30E9\u30F3\u30C9\u30EA\u30E9\u30F3\u30B2\u30CB"], ["Tajikistani somoni", "\u30BD\u30E2\u30CB|\u30BF\u30B8\u30AD\u30B9\u30BF\u30F3\u30FB\u30BD\u30E2\u30CB|\u30BF\u30B8\u30AD\u30B9\u30BF\u30F3\u30BD\u30E2\u30CB"], ["Thai baht", "\u30D0\u30FC\u30C4|\u30BF\u30A4\u30FB\u30D0\u30FC\u30C4|\u30BF\u30A4\u30D0\u30FC\u30C4"], ["Satang", "\u30B5\u30BF\u30F3"], ["Tongan pa\u02BBanga", "\u30D1\u30A2\u30F3\u30AC|\u30C8\u30F3\u30AC\u30FB\u30D1\u30A2\u30F3\u30AC|\u30C8\u30F3\u30AC\u30D1\u30A2\u30F3\u30AC"], ["Ukrainian hryvnia", "\u30D5\u30EA\u30F4\u30CB\u30E3|\u30A6\u30AF\u30E9\u30A4\u30CA\u30FB\u30D5\u30EA\u30F4\u30CB\u30E3|\u30A6\u30AF\u30E9\u30A4\u30CA\u30D5\u30EA\u30F4\u30CB\u30E3"], ["Vanuatu vatu", "\u30D0\u30C4|\u30D0\u30CC\u30A2\u30C4\u30FB\u30D0\u30C4|\u30D0\u30CC\u30A2\u30C4\u30D0\u30C4"], ["Vietnamese dong", "\u30C9\u30F3|\u30D9\u30C8\u30CA\u30E0\u30FB\u30C9\u30F3|\u30D9\u30C8\u30CA\u30E0\u30C9\u30F3"], ["Indonesian rupiah", "\u30EB\u30D4\u30A2|\u30A4\u30F3\u30C9\u30CD\u30B7\u30A2\u30FB\u30EB\u30D4\u30A2|\u30A4\u30F3\u30C9\u30CD\u30B7\u30A2\u30EB\u30D4\u30A2"], ["Netherlands guilder", "\u30E6\u30FC\u30ED|\u30AA\u30E9\u30F3\u30C0\u30FB\u30E6\u30FC\u30ED"], ["Surinam florin", "\u30B9\u30EA\u30CA\u30E0\u30FB\u30C9\u30EB"], ["Zambian kwacha", "\u30B6\u30F3\u30D3\u30A2\u30FB\u30AF\u30EF\u30C1\u30E3"], ["Moroccan dirham", "\u30E2\u30ED\u30C3\u30B3\u30FB\u30C7\u30A3\u30EB\u30CF\u30E0"], ["United Arab Emirates dirham", "UAE\u30C7\u30A3\u30EB\u30CF\u30E0"], ["Azerbaijani manat", "\u30A2\u30BC\u30EB\u30D0\u30A4\u30B8\u30E3\u30F3\u30FB\u30DE\u30CA\u30C8"], ["Turkmenistan manat", "\u30C8\u30EB\u30AF\u30E1\u30CB\u30B9\u30BF\u30F3\u30FB\u30DE\u30CA\u30C8"], ["Manat", "\u30DE\u30CA\u30C8"], ["Somali shilling", "\u30BD\u30DE\u30EA\u30A2\u30FB\u30B7\u30EA\u30F3\u30B0"], ["Somaliland shilling", "\u30BD\u30DE\u30EA\u30E9\u30F3\u30C9\u30FB\u30B7\u30EA\u30F3\u30B0"], ["Tanzanian shilling", "\u30BF\u30F3\u30B6\u30CB\u30A2\u30FB\u30B7\u30EA\u30F3\u30B0"], ["Ugandan shilling", "\u30A6\u30AC\u30F3\u30C0\u30FB\u30B7\u30EA\u30F3\u30B0"], ["Romanian leu", "\u30EB\u30FC\u30DE\u30CB\u30A2\u30FB\u30EC\u30A6"], ["Moldovan leu", "\u30E2\u30EB\u30C9\u30D0\u30FB\u30EC\u30A6"], ["Leu", "\u30EC\u30A6"], ["Ban", "\u30D0\u30F3"], ["Nepalese rupee", "\u30CD\u30D1\u30FC\u30EB\u30FB\u30EB\u30D4\u30FC"], ["Pakistani rupee", "\u30D1\u30AD\u30B9\u30BF\u30F3\u30FB\u30EB\u30D4\u30FC"], ["Indian rupee", "\u30A4\u30F3\u30C9\u30FB\u30EB\u30D4\u30FC"], ["Seychellois rupee", "\u30BB\u30FC\u30B7\u30A7\u30EB\u30FB\u30EB\u30D4\u30FC"], ["Mauritian rupee", "\u30E2\u30FC\u30EA\u30B7\u30E3\u30B9\u30FB\u30EB\u30D4\u30FC"], ["Maldivian rufiyaa", "\u30EB\u30D5\u30A3\u30E4|\u30E2\u30EB\u30C7\u30A3\u30D6\u30FB\u30EB\u30D5\u30A3\u30E4|\u30E2\u30EB\u30C7\u30A3\u30D6\u30EB\u30D5\u30A3\u30E4"], ["Sri Lankan rupee", "\u30B9\u30EA\u30E9\u30F3\u30AB\u30FB\u30EB\u30D4\u30FC"], ["Rupee", "\u30EB\u30D4\u30FC"], ["Czech koruna", "\u30C1\u30A7\u30B3\u30FB\u30B3\u30EB\u30CA"], ["Danish krone", "\u30C7\u30F3\u30DE\u30FC\u30AF\u30FB\u30AF\u30ED\u30FC\u30CD"], ["Norwegian krone", "\u30CE\u30EB\u30A6\u30A7\u30FC\u30FB\u30AF\u30ED\u30FC\u30CD"], ["Faroese kr\xF3na", "\u30D5\u30A7\u30ED\u30FC\u30FB\u30AF\u30ED\u30FC\u30CD"], ["Icelandic kr\xF3na", "\u30A2\u30A4\u30B9\u30E9\u30F3\u30C9\u30FB\u30AF\u30ED\u30FC\u30CA"], ["Swedish krona", "\u30B9\u30A6\u30A7\u30FC\u30C7\u30F3\u30FB\u30AF\u30ED\u30FC\u30CA"], ["Krone", "\u30AF\u30ED\u30FC\u30CA"], ["\xD8re", "\u30AA\u30FC\u30EC"], ["West African CFA franc", "CFA\u30D5\u30E9\u30F3"], ["Central African CFA franc", "CFA\u30D5\u30E9\u30F3"], ["Comorian franc", "\u30B3\u30E2\u30ED\u30FB\u30D5\u30E9\u30F3"], ["Congolese franc", "\u30B3\u30F3\u30B4\u30FB\u30D5\u30E9\u30F3"], ["Burundian franc", "\u30D6\u30EB\u30F3\u30B8\u30FB\u30D5\u30E9\u30F3"], ["Djiboutian franc", "\u30B8\u30D6\u30C1\u30FB\u30D5\u30E9\u30F3"], ["CFP franc", "CFP\u30D5\u30E9\u30F3"], ["Guinean franc", "\u30AE\u30CB\u30A2\u30FB\u30D5\u30E9\u30F3"], ["Swiss franc", "\u30B9\u30A4\u30B9\u30FB\u30D5\u30E9\u30F3"], ["Rwandan franc", "\u30EB\u30EF\u30F3\u30C0\u30FB\u30D5\u30E9\u30F3"], ["Belgian franc", "\u30D9\u30EB\u30AE\u30FC\u30FB\u30D5\u30E9\u30F3"], ["Rappen", "Rappen"], ["Franc", "\u30D5\u30E9\u30F3"], ["Centime", "\u30B5\u30F3\u30C1\u30FC\u30E0"], ["Russian ruble", "\u30ED\u30B7\u30A2\u30FB\u30EB\u30FC\u30D6\u30EB"], ["Transnistrian ruble", "\u6CBF\u30C9\u30CB\u30A8\u30B9\u30C8\u30EB\u30FB\u30EB\u30FC\u30D6\u30EB"], ["Belarusian ruble", "\u30D9\u30E9\u30EB\u30FC\u30B7\u30FB\u30EB\u30FC\u30D6\u30EB"], ["Kopek", "\u30AB\u30DA\u30A4\u30AB"], ["Ruble", "\u30EB\u30FC\u30D6\u30EB"], ["Algerian dinar", "\u30A2\u30EB\u30B8\u30A7\u30EA\u30A2\u30FB\u30C7\u30A3\u30CA\u30FC\u30EB"], ["Bahraini dinar", "\u30D0\u30FC\u30EC\u30FC\u30F3\u30FB\u30C7\u30A3\u30CA\u30FC\u30EB"], ["Iraqi dinar", "\u30A4\u30E9\u30AF\u30FB\u30C7\u30A3\u30CA\u30FC\u30EB"], ["Jordanian dinar", "\u30E8\u30EB\u30C0\u30F3\u30FB\u30C7\u30A3\u30CA\u30FC\u30EB"], ["Kuwaiti dinar", "\u30AF\u30A6\u30A7\u30FC\u30C8\u30FB\u30C7\u30A3\u30CA\u30FC\u30EB"], ["Libyan dinar", "\u30EA\u30D3\u30A2\u30FB\u30C7\u30A3\u30CA\u30FC\u30EB"], ["Serbian dinar", "\u30BB\u30EB\u30D3\u30A2\u30FB\u30C7\u30A3\u30CA\u30FC\u30EB"], ["Tunisian dinar", "\u30C1\u30E5\u30CB\u30B8\u30A2\u30FB\u30C7\u30A3\u30CA\u30FC\u30EB"], ["Dinar", "\u30C7\u30A3\u30CA\u30FC\u30EB"], ["Fils", "\u30D5\u30A3\u30EB\u30B9"], ["Para", "\u30D1\u30E9"], ["Millime", "\u30DF\u30EA\u30E0"], ["Argentine peso", "\u30DA\u30BD|\u30A2\u30EB\u30BC\u30F3\u30C1\u30F3\u30FB\u30DA\u30BD"], ["Chilean peso", "\u30C1\u30EA\u30FB\u30DA\u30BD"], ["Colombian peso", "\u30B3\u30ED\u30F3\u30D3\u30A2\u30FB\u30DA\u30BD"], ["Cuban peso", "\u514C\u63DB\u30DA\u30BD"], ["Dominican peso", "\u30C9\u30DF\u30CB\u30AB\u30FB\u30DA\u30BD"], ["Mexican peso", "\u30E1\u30AD\u30B7\u30B3\u30FB\u30DA\u30BD"], ["Philippine peso", "\u30D5\u30A3\u30EA\u30D4\u30F3\u30FB\u30DA\u30BD"], ["Uruguayan peso", "\u30A6\u30EB\u30B0\u30A2\u30A4\u30FB\u30DA\u30BD"], ["Peso", "\u30DA\u30BD"], ["Centavo", "\u30BB\u30F3\u30BF\u30FC\u30DC"], ["Alderney pound", "\u30AC\u30FC\u30F3\u30B8\u30FC\u30FB\u30DD\u30F3\u30C9"], ["British pound", "UK\u30DD\u30F3\u30C9"], ["Guernsey pound", "\u30AC\u30FC\u30F3\u30B8\u30FC\u30FB\u30DD\u30F3\u30C9"], ["Saint Helena pound", "\u30BB\u30F3\u30C8\u30D8\u30EC\u30CA\u30FB\u30DD\u30F3\u30C9"], ["Egyptian pound", "\u30A8\u30B8\u30D7\u30C8\u30FB\u30DD\u30F3\u30C9"], ["Falkland Islands pound", "\u30D5\u30A9\u30FC\u30AF\u30E9\u30F3\u30C9\u8AF8\u5CF6\u30DD\u30F3\u30C9"], ["Gibraltar pound", "\u30B8\u30D6\u30E9\u30EB\u30BF\u30EB\u30FB\u30DD\u30F3\u30C9"], ["Manx pound", "\u30DE\u30F3\u5CF6\u30DD\u30F3\u30C9"], ["Jersey pound", "\u30B8\u30E3\u30FC\u30B8\u30FC\u30FB\u30DD\u30F3\u30C9"], ["Lebanese pound", "\u30EC\u30D0\u30CE\u30F3\u30FB\u30DD\u30F3\u30C9"], ["South Sudanese pound", "\u5357\u30B9\u30FC\u30C0\u30F3\u30FB\u30DD\u30F3\u30C9"], ["Sudanese pound", "\u30B9\u30FC\u30C0\u30F3\u30FB\u30DD\u30F3\u30C9"], ["Syrian pound", "\u30B7\u30EA\u30A2\u30FB\u30DD\u30F3\u30C9"], ["Pound", "\u30DD\u30F3\u30C9"], ["Pence", "\u30DA\u30CB\u30FC"], ["Shilling", "\u30B7\u30EA\u30F3\u30B0"], ["United States dollar", "\u30C9\u30EB|US\u30C9\u30EB"], ["East Caribbean dollar", "\u6771\u30AB\u30EA\u30D6\u30FB\u30C9\u30EB"], ["Australian dollar", "\u30AA\u30FC\u30B9\u30C8\u30E9\u30EA\u30A2\u30FB\u30C9\u30EB"], ["Bahamian dollar", "\u30D0\u30CF\u30DE\u30FB\u30C9\u30EB"], ["Barbadian dollar", "\u30D0\u30EB\u30D0\u30C9\u30B9\u30FB\u30C9\u30EB"], ["Belize dollar", "\u30D9\u30EA\u30FC\u30BA\u30FB\u30C9\u30EB"], ["Bermudian dollar", "\u30D0\u30DF\u30E5\u30FC\u30C0\u30FB\u30C9\u30EB"], ["Brunei dollar", "\u30D6\u30EB\u30CD\u30A4\u30FB\u30C9\u30EB"], ["Singapore dollar", "\u30B7\u30F3\u30AC\u30DD\u30FC\u30EB\u30FB\u30C9\u30EB"], ["Canadian dollar", "\u30AB\u30CA\u30C0\u30FB\u30C9\u30EB"], ["Cayman Islands dollar", "\u30B1\u30A4\u30DE\u30F3\u8AF8\u5CF6\u30FB\u30C9\u30EB"], ["New Zealand dollar", "\u30CB\u30E5\u30FC\u30B8\u30FC\u30E9\u30F3\u30C9\u30FB\u30C9\u30EB"], ["Cook Islands dollar", "\u30CB\u30E5\u30FC\u30B8\u30FC\u30E9\u30F3\u30C9\u30FB\u30C9\u30EB|\u30CB\u30E5\u30FC\u30B8\u30FC\u30E9\u30F3\u30C9\u30FB\u30C9\u30EB"], ["Fijian dollar", "\u30D5\u30A3\u30B8\u30FC\u30FB\u30C9\u30EB|\u30D5\u30A3\u30B8\u30FC\u30FB\u30C9\u30EB"], ["Guyanese dollar", "\u30AC\u30A4\u30A2\u30CA\u30FB\u30C9\u30EB|\u30AC\u30A4\u30A2\u30CA\u30FB\u30C9\u30EB"], ["Hong Kong dollar", "\u9999\u6E2F\u30C9\u30EB"], ["Macau Pataca", "\u30DE\u30AB\u30AA\u30FB\u30D1\u30BF\u30AB|\u30DE\u30AB\u30AA\u30FB\u30D1\u30BF\u30AB"], ["New Taiwan dollar", "\u30CB\u30E5\u30FC\u53F0\u6E7E\u30C9\u30EB|\u30CB\u30E5\u30FC\u53F0\u6E7E\u30C9\u30EB"], ["Jamaican dollar", "\u30B8\u30E3\u30DE\u30A4\u30AB\u30FB\u30C9\u30EB|\u30B8\u30E3\u30DE\u30A4\u30AB\u30C9\u30EB"], ["Kiribati dollar", "\u30AA\u30FC\u30B9\u30C8\u30E9\u30EA\u30A2\u30FB\u30C9\u30EB|\u30AA\u30FC\u30B9\u30C8\u30E9\u30EA\u30A2\u30C9\u30EB"], ["Liberian dollar", "\u30EA\u30D9\u30EA\u30A2\u30FB\u30C9\u30EB|\u30EA\u30D9\u30EA\u30A2\u30C9\u30EB"], ["Namibian dollar", "\u30CA\u30DF\u30D3\u30A2\u30FB\u30C9\u30EB|\u30CA\u30DF\u30D3\u30A2\u30C9\u30EB"], ["Surinamese dollar", "\u30B9\u30EA\u30CA\u30E0\u30FB\u30C9\u30EB|\u30B9\u30EA\u30CA\u30E0\u30C9\u30EB"], ["Trinidad and Tobago dollar", "\u30C8\u30EA\u30CB\u30C0\u30FC\u30C9\u30FB\u30C8\u30D0\u30B4\u30FB\u30C9\u30EB|\u30C8\u30EA\u30CB\u30C0\u30FC\u30C9\u30C8\u30D0\u30B4\u30FB\u30C9\u30EB"], ["Tuvaluan dollar", "\u30C4\u30D0\u30EB\u30FB\u30C9\u30EB|\u30C4\u30D0\u30EB\u30C9\u30EB"], ["Chinese yuan", "\u4EBA\u6C11\u5143"], ["Fen", "\u5206"], ["Jiao", "\u89D2"], ["Finnish markka", "\u30D5\u30A3\u30F3\u30E9\u30F3\u30C9\u30FB\u30DE\u30EB\u30AB"], ["Penni", "\u30DA\u30CB\u30FC"]]);
  JapaneseNumericWithUnit2.CurrencyNameToIsoCodeMap = /* @__PURE__ */ new Map([["Afghan afghani", "AFN"], ["Euro", "EUR"], ["Albanian lek", "ALL"], ["Angolan kwanza", "AOA"], ["Armenian dram", "AMD"], ["Aruban florin", "AWG"], ["Bangladeshi taka", "BDT"], ["Bhutanese ngultrum", "BTN"], ["Bolivian boliviano", "BOB"], ["Bosnia and Herzegovina convertible mark", "BAM"], ["Botswana pula", "BWP"], ["Brazilian real", "BRL"], ["Bulgarian lev", "BGN"], ["Cambodian riel", "KHR"], ["Cape Verdean escudo", "CVE"], ["Costa Rican col\xF3n", "CRC"], ["Croatian kuna", "HRK"], ["Czech koruna", "CZK"], ["Eritrean nakfa", "ERN"], ["Ethiopian birr", "ETB"], ["Gambian dalasi", "GMD"], ["Georgian lari", "GEL"], ["Ghanaian cedi", "GHS"], ["Guatemalan quetzal", "GTQ"], ["Haitian gourde", "HTG"], ["Honduran lempira", "HNL"], ["Hungarian forint", "HUF"], ["Iranian rial", "IRR"], ["Yemeni rial", "YER"], ["Israeli new shekel", "ILS"], ["Japanese yen", "JPY"], ["Kazakhstani tenge", "KZT"], ["Kenyan shilling", "KES"], ["North Korean won", "KPW"], ["South Korean won", "KRW"], ["Kyrgyzstani som", "KGS"], ["Lao kip", "LAK"], ["Lesotho loti", "LSL"], ["South African rand", "ZAR"], ["Macanese pataca", "MOP"], ["Macedonian denar", "MKD"], ["Malagasy ariary", "MGA"], ["Malawian kwacha", "MWK"], ["Malaysian ringgit", "MYR"], ["Mauritanian ouguiya", "MRO"], ["Mongolian t\xF6gr\xF6g", "MNT"], ["Mozambican metical", "MZN"], ["Burmese kyat", "MMK"], ["Nicaraguan c\xF3rdoba", "NIO"], ["Nigerian naira", "NGN"], ["Turkish lira", "TRY"], ["Omani rial", "OMR"], ["Panamanian balboa", "PAB"], ["Papua New Guinean kina", "PGK"], ["Paraguayan guaran\xED", "PYG"], ["Peruvian sol", "PEN"], ["Polish z\u0142oty", "PLN"], ["Qatari riyal", "QAR"], ["Saudi riyal", "SAR"], ["Samoan t\u0101l\u0101", "WST"], ["S\xE3o Tom\xE9 and Pr\xEDncipe dobra", "STD"], ["Sierra Leonean leone", "SLL"], ["Swazi lilangeni", "SZL"], ["Tajikistani somoni", "TJS"], ["Thai baht", "THB"], ["Ukrainian hryvnia", "UAH"], ["Vanuatu vatu", "VUV"], ["Venezuelan bol\xEDvar", "VEF"], ["Zambian kwacha", "ZMW"], ["Moroccan dirham", "MAD"], ["United Arab Emirates dirham", "AED"], ["Azerbaijani manat", "AZN"], ["Turkmenistan manat", "TMT"], ["Somali shilling", "SOS"], ["Tanzanian shilling", "TZS"], ["Ugandan shilling", "UGX"], ["Romanian leu", "RON"], ["Moldovan leu", "MDL"], ["Nepalese rupee", "NPR"], ["Pakistani rupee", "PKR"], ["Indian rupee", "INR"], ["Seychellois rupee", "SCR"], ["Mauritian rupee", "MUR"], ["Maldivian rufiyaa", "MVR"], ["Sri Lankan rupee", "LKR"], ["Indonesian rupiah", "IDR"], ["Danish krone", "DKK"], ["Norwegian krone", "NOK"], ["Icelandic kr\xF3na", "ISK"], ["Swedish krona", "SEK"], ["West African CFA franc", "XOF"], ["Central African CFA franc", "XAF"], ["Comorian franc", "KMF"], ["Congolese franc", "CDF"], ["Burundian franc", "BIF"], ["Djiboutian franc", "DJF"], ["CFP franc", "XPF"], ["Guinean franc", "GNF"], ["Swiss franc", "CHF"], ["Rwandan franc", "RWF"], ["Russian ruble", "RUB"], ["Transnistrian ruble", "PRB"], ["Belarusian ruble", "BYN"], ["Algerian dinar", "DZD"], ["Bahraini dinar", "BHD"], ["Iraqi dinar", "IQD"], ["Jordanian dinar", "JOD"], ["Kuwaiti dinar", "KWD"], ["Libyan dinar", "LYD"], ["Serbian dinar", "RSD"], ["Tunisian dinar", "TND"], ["Argentine peso", "ARS"], ["Chilean peso", "CLP"], ["Colombian peso", "COP"], ["Cuban convertible peso", "CUC"], ["Cuban peso", "CUP"], ["Dominican peso", "DOP"], ["Mexican peso", "MXN"], ["Uruguayan peso", "UYU"], ["British pound", "GBP"], ["Saint Helena pound", "SHP"], ["Egyptian pound", "EGP"], ["Falkland Islands pound", "FKP"], ["Gibraltar pound", "GIP"], ["Manx pound", "IMP"], ["Jersey pound", "JEP"], ["Lebanese pound", "LBP"], ["South Sudanese pound", "SSP"], ["Sudanese pound", "SDG"], ["Syrian pound", "SYP"], ["United States dollar", "USD"], ["Australian dollar", "AUD"], ["Bahamian dollar", "BSD"], ["Barbadian dollar", "BBD"], ["Belize dollar", "BZD"], ["Bermudian dollar", "BMD"], ["Brunei dollar", "BND"], ["Singapore dollar", "SGD"], ["Canadian dollar", "CAD"], ["Cayman Islands dollar", "KYD"], ["New Zealand dollar", "NZD"], ["Fijian dollar", "FJD"], ["Guyanese dollar", "GYD"], ["Hong Kong dollar", "HKD"], ["Jamaican dollar", "JMD"], ["Liberian dollar", "LRD"], ["Namibian dollar", "NAD"], ["Solomon Islands dollar", "SBD"], ["Surinamese dollar", "SRD"], ["New Taiwan dollar", "TWD"], ["Trinidad and Tobago dollar", "TTD"], ["Tuvaluan dollar", "TVD"], ["Chinese yuan", "CNY"], ["Rial", "__RI"], ["Shiling", "__S"], ["Som", "__SO"], ["Dirham", "__DR"], ["Dinar", "_DN"], ["Dollar", "__D"], ["Manat", "__MA"], ["Rupee", "__R"], ["Krone", "__K"], ["Krona", "__K"], ["Crown", "__K"], ["Frank", "__F"], ["Mark", "__M"], ["Ruble", "__RB"], ["Peso", "__PE"], ["Pound", "__P"], ["Tristan da Cunha pound", "_TP"], ["South Georgia and the South Sandwich Islands pound", "_SP"], ["Somaliland shilling", "_SS"], ["Pitcairn Islands dollar", "_PND"], ["Palauan dollar", "_PD"], ["Niue dollar", "_NID"], ["Nauruan dollar", "_ND"], ["Micronesian dollar", "_MD"], ["Kiribati dollar", "_KID"], ["Guernsey pound", "_GGP"], ["Faroese kr\xF3na", "_FOK"], ["Cook Islands dollar", "_CKD"], ["British Virgin Islands dollar", "_BD"], ["Ascension pound", "_AP"], ["Alderney pound", "_ALP"], ["Abkhazian apsar", "_AA"]]);
  JapaneseNumericWithUnit2.FractionalUnitNameToCodeMap = /* @__PURE__ */ new Map([["Jiao", "JIAO"], ["Kopek", "KOPEK"], ["Pul", "PUL"], ["Cent", "CENT"], ["Qindark\xEB", "QINDARKE"], ["Penny", "PENNY"], ["Santeem", "SANTEEM"], ["C\xEAntimo", "CENTIMO"], ["Centavo", "CENTAVO"], ["Luma", "LUMA"], ["Q\u0259pik", "Q\u018FPIK"], ["Fils", "FILS"], ["Poisha", "POISHA"], ["Kapyeyka", "KAPYEYKA"], ["Centime", "CENTIME"], ["Chetrum", "CHETRUM"], ["Paisa", "PAISA"], ["Fening", "FENING"], ["Thebe", "THEBE"], ["Sen", "SEN"], ["Stotinka", "STOTINKA"], ["Fen", "FEN"], ["C\xE9ntimo", "CENTIMO"], ["Lipa", "LIPA"], ["Hal\xE9\u0159", "HALER"], ["\xD8re", "\xD8RE"], ["Piastre", "PIASTRE"], ["Santim", "SANTIM"], ["Oyra", "OYRA"], ["Butut", "BUTUT"], ["Tetri", "TETRI"], ["Pesewa", "PESEWA"], ["Fill\xE9r", "FILLER"], ["Eyrir", "EYRIR"], ["Dinar", "DINAR"], ["Agora", "AGORA"], ["T\xEF\u0131n", "TIIN"], ["Chon", "CHON"], ["Jeon", "JEON"], ["Tyiyn", "TYIYN"], ["Att", "ATT"], ["Sente", "SENTE"], ["Dirham", "DIRHAM"], ["Rappen", "RAPPEN"], ["Avo", "AVO"], ["Deni", "DENI"], ["Iraimbilanja", "IRAIMBILANJA"], ["Tambala", "TAMBALA"], ["Laari", "LAARI"], ["Khoums", "KHOUMS"], ["Ban", "BAN"], ["M\xF6ng\xF6", "MONGO"], ["Pya", "PYA"], ["Kobo", "KOBO"], ["Kuru\u015F", "KURUS"], ["Baisa", "BAISA"], ["Cent\xE9simo", "CENTESIMO"], ["Toea", "TOEA"], ["Sentimo", "SENTIMO"], ["Grosz", "GROSZ"], ["Sene", "SENE"], ["Halala", "HALALA"], ["Para", "PARA"], ["\xD6re", "ORE"], ["Diram", "DIRAM"], ["Satang", "SATANG"], ["Seniti", "SENITI"], ["Millime", "MILLIME"], ["Tennesi", "TENNESI"], ["Kopiyka", "KOPIYKA"], ["Tiyin", "TIYIN"], ["H\xE0o", "HAO"], ["Ngwee", "NGWEE"]]);
  JapaneseNumericWithUnit2.CompoundUnitConnectorRegex = `(?<spacer>\u3068)`;
  JapaneseNumericWithUnit2.CurrencyPrefixList = /* @__PURE__ */ new Map([["Dollar", "$"], ["United States dollar", "us$"], ["British Virgin Islands dollar", "bvi$"], ["Brunei dollar", "b$"], ["Sen", "sen"], ["Singapore dollar", "s$"], ["Canadian dollar", "can$|c$|c $"], ["Cayman Islands dollar", "ci$"], ["New Zealand dollar", "nz$|nz $"], ["Guyanese dollar", "gy$|gy $|g$|g $"], ["Hong Kong dollar", "hk$|hkd|hk $"], ["Jamaican dollar", "j$"], ["Namibian dollar", "nad|n$|n $"], ["Solomon Islands dollar", "si$|si $"], ["New Taiwan dollar", "nt$|nt $"], ["Samoan t\u0101l\u0101", "ws$"], ["Chinese yuan", "\uFFE5"], ["Japanese yen", "\xA5|\\"], ["Turkish lira", "\u20BA"], ["Euro", "\u20AC"], ["Pound", "\xA3"], ["Costa Rican col\xF3n", "\u20A1"]]);
  JapaneseNumericWithUnit2.CurrencyAmbiguousValues = ["\u5186", "\u92AD", "\\"];
})(exports.JapaneseNumericWithUnit || (exports.JapaneseNumericWithUnit = {}));

// recognizers/recognizers-number-with-unit/src/numberWithUnit/japanese/base.ts
var JapaneseNumberWithUnitExtractorConfiguration = class {
  constructor(ci) {
    this.cultureInfo = ci;
    this.unitNumExtractor = new recognizersTextNumber.JapaneseNumberExtractor(recognizersTextNumber.JapaneseNumberExtractorMode.ExtractAll);
    this.buildPrefix = exports.JapaneseNumericWithUnit.BuildPrefix;
    this.buildSuffix = exports.JapaneseNumericWithUnit.BuildSuffix;
    this.connectorToken = exports.JapaneseNumericWithUnit.ConnectorToken;
    this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumericWithUnit.CompoundUnitConnectorRegex);
    this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(BaseUnits.PmNonUnitRegex);
  }
};
var JapaneseNumberWithUnitParserConfiguration = class extends BaseNumberWithUnitParserConfiguration {
  constructor(ci) {
    super(ci);
    this.internalNumberExtractor = new recognizersTextNumber.JapaneseNumberExtractor(recognizersTextNumber.JapaneseNumberExtractorMode.Default);
    this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.JapaneseNumberParserConfiguration());
    this.connectorToken = "";
    this.currencyNameToIsoCodeMap = exports.JapaneseNumericWithUnit.CurrencyNameToIsoCodeMap;
    this.currencyFractionCodeList = exports.JapaneseNumericWithUnit.FractionalUnitNameToCodeMap;
  }
};

// recognizers/recognizers-number-with-unit/src/numberWithUnit/japanese/currency.ts
var JapaneseCurrencyExtractorConfiguration = class extends JapaneseNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Japanese);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_CURRENCY;
    this.suffixList = exports.JapaneseNumericWithUnit.CurrencySuffixList;
    this.prefixList = exports.JapaneseNumericWithUnit.CurrencyPrefixList;
    this.ambiguousUnitList = exports.JapaneseNumericWithUnit.CurrencyAmbiguousValues;
  }
};
var JapaneseCurrencyParserConfiguration = class extends JapaneseNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Japanese);
    }
    super(ci);
    this.BindDictionary(exports.JapaneseNumericWithUnit.CurrencySuffixList);
    this.BindDictionary(exports.JapaneseNumericWithUnit.CurrencyPrefixList);
  }
};
var JapaneseAgeExtractorConfiguration = class extends JapaneseNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Japanese);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_AGE;
    this.suffixList = exports.JapaneseNumericWithUnit.AgeSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = exports.JapaneseNumericWithUnit.AgeAmbiguousValues;
  }
};
var JapaneseAgeParserConfiguration = class extends JapaneseNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Japanese);
    }
    super(ci);
    this.BindDictionary(exports.JapaneseNumericWithUnit.AgeSuffixList);
  }
};

// recognizers/recognizers-number-with-unit/src/resources/frenchNumericWithUnit.ts
var FrenchNumericWithUnit;
((FrenchNumericWithUnit2) => {
  FrenchNumericWithUnit2.AgeSuffixList = /* @__PURE__ */ new Map([["Ans", "ans"], ["Mois", "mois d'\xE2ge|mois d'age|mois"], ["Semaines", "semaine|semaines|semaines d'\xE2ge|semaines d'age"], ["Jour", "jours|jour"]]);
  FrenchNumericWithUnit2.AreaSuffixList = /* @__PURE__ */ new Map([["Kilom\xE8tre carr\xE9", "km2|km^2|km\xB2|kilom\xE8tres carr\xE9s|kilom\xE8tre carr\xE9"], ["Hectom\xE8tre carr\xE9", "hm2|hm^2|hm\xB2|hectom\xE8tre carr\xE9|hectom\xE8tres carr\xE9s"], ["D\xE9cam\xE8tre carr\xE9", "dam2|dam^2|dam\xB2|d\xE9cam\xE8tre carr\xE9|d\xE9cam\xE8tres carr\xE9s"], ["M\xE8tre carr\xE9", "m2|m^2|m\xB2|m\xE8tre carr\xE9|m\xE8tres carr\xE9s"], ["D\xE9cim\xE8tre carr\xE9", "dm2|dm^2|dm\xB2|d\xE9cim\xE8tre carr\xE9|d\xE9cim\xE8tres carr\xE9s"], ["Centim\xE8tre carr\xE9", "cm2|cm^2|cm\xB2|centim\xE8tre carr\xE9|centim\xE8tres carr\xE9s"], ["Millim\xE8tre carr\xE9", "mm2|mm^2|mm\xB2|millim\xE8tre carr\xE9|millim\xE8tres carr\xE9s"], ["Pouce carr\xE9", "pouces2|po2|pouce carr\xE9|pouces carr\xE9s|in^2|in\xB2|in2"], ["Pied carr\xE9", "pied carr\xE9|pieds carr\xE9s|pi2|pi^2|pi\xB2"], ["Mile carr\xE9", "mile carr\xE9|miles carr\xE9s|mi2|mi^2|mi\xB2"], ["Acre", "acre|acres"]]);
  FrenchNumericWithUnit2.CurrencySuffixList = /* @__PURE__ */ new Map([["Abkhazie apsar", "abkhazie apsar|apsars"], ["Afghan afghani", "afghan afghani|\u060B|afn|afghanis|afghani"], ["Pul", "pul"], ["Euro", "euros|euro|\u20AC|eur|d'euros"], ["Cent", "cents|cent|-cents|-cent|sen"], ["lek Albanais", "lek albanais|leks|lek"], ["Qindark\xEB", "qindark\xEB|qindark\xEBs|qindarke|qindarkes"], ["Kwanza angolais", "kwanza angolais|kz|aoa|kwanza|kwanzas"], ["Dram arm\xE9nien", "dram arm\xE9nien|drams arm\xE9niens"], ["Florins d'Aruba", "florins aruba|\u0192|awg"], ["Bangladeshi taka", "bangladeshi taka|\u09F3|bdt|taka|takas|bangladeshi takas"], ["Paisa", "poisha|paisa"], ["Ngultrum bhoutanais", "ngultrum bhoutanais|nu.|btn"], ["Chetrum", "chetrums|chetrum"], ["Boliviano bolivien", "boliviano bolivien|bolivianos bolivien|bolivianos bolivie|boliviano bolivie|bob|bs."], ["Bosnie-Herz\xE9govine mark convertible", "bosnie-herz\xE9govine mark convertible|bosnie-et-herz\xE9govine mark convertible|bam"], ["Fening", "fening|fenings"], ["Pula", "pula|bwp"], ["Thebe", "thebe"], ["R\xE9al br\xE9silien", "r\xE9al br\xE9silien|r\xE9als br\xE9silien|r$|brl|real bresil|reals bresilien"], ["Lev bulgare", "lev bulgare|levs bulgare|lv|bgn"], ["Stotinki b\xFAlgaro", "stotinki bulgare"], ["Riel cambodgien", "riel cambodgien|khr|\u17DB"], ["Escudo du cap-vert", "escudo cap-verdien|cve"], ["Colon du costa rica", "colon du costa rica|colons du costa rica|crc|\u20A1"], ["Colon du salvador", "colon du salvador|colons du salvador|svc"], ["Kuna croate", "kuna croate|kunas croate|kn|hrk"], ["Lipa", "lipa"], ["Couronne tch\xE8que", "couronne tch\xE8que|couronnes tch\xE8que|czk|K\u010D"], ["Hal\xE9\u0159", "hal\xE9\u0159"], ["Nakfas \xE9rythr\xE9ens", "nakfas \xE9rythr\xE9ens|nfk|ern|nakfa \xE9rythr\xE9ens"], ["Birr \xE9thiopien", "birr \xE9thiopien|birrs \xE9thiopien|etb"], ["Dalasi gambienne", "gmd"], ["Butut", "bututs|butut"], ["Lari g\xE9orgien", "lari g\xE9orgie|lari g\xE9orgiens|gel|\u20BE"], ["Tetri g\xE9orgien", "tetri g\xE9orgie|tetris g\xE9orgiens"], ["Cedi", "cedi|ghs|cedi ghan\xE9en|gh\u20B5"], ["Pesewa", "pesewa|pesewas"], ["Quetzal guat\xE9malt\xE8que", "quetzal guat\xE9malt\xE8que|gtq|quetzal|quetzales"], ["Gourdes ha\xEFtiennes", "gourdes ha\xEFtiennes|gourdes|htg|gourde ha\xEFtienne"], ["Lempira hondurien", "lempira hondurien|hnl"], ["Forint hongrois", "forint hongrois|huf|fg|forints hongrois"], ["Fill\xE9r", "fill\xE9r"], ["Rial iranien", "rial iranien|irr|rials iranien|rials iraniens"], ["Litas lituanien", "litas lituanien|ltl|lit lithuanien|litas lithuanie"], ["Yen Japonais", "yen japonais|yen japon|yens|jpy|yen|\xA5|-yen"], ["Tenge kazakh", "tenge kazakh|kzt"], ["Shilling k\xE9nyan", "shilling k\xE9nyan|sh|kes|shillings k\xE9nyans"], ["Won cor\xE9en", "won cor\xE9en|won cor\xE9ens|\u20A9"], ["Won sud-cor\xE9en", "won sud-cor\xE9en|won sud cor\xE9en|won sud-cor\xE9ens|krw"], ["Cor\xE9e du nord won", "cor\xE9e du nord won|cor\xE9e nord won|kpw"], ["Som Kirghizie", "som kirghizie|kgs"], ["Sum Ouzb\xE9kistan", "sum ouzb\xE9kistan|sum ouzbeks|sum ouzb\xE9ks|uzs"], ["Kip laotien", "kip laotien|lak|\u20ADn|\u20AD"], ["Att", "att"], ["Loti", "loti|maloti|lsl"], ["Sente", "sente|lisente"], ["Rand sud-africain", "rand sud-africain|zar"], ["Pataca macanais", "pataca macanais|mop$|mop"], ["Avo", "avos|avo"], ["Dinar mac\xE9donien", "dinar mac\xE9donien|mkd|\u0434\u0435\u043D"], ["Deni", "deni"], ["Ariary malagache", "ariary malagache|mga"], ["Iraimbilanja", "Iraimbilanja"], ["Kwacha malawien", "kwacha malawien|mk|mwk"], ["Tambala", "Tambala"], ["Ringitt malaisien", "ringitt malaisien|rm|myr|ringitts malaisien"], ["Ouguiya mauritanienne", "ouguiya|um|mro|ouguiya mauritanien|ouguiya mauritanienne"], ["Khoums", "khoums"], ["Togrogs mongoles", "togrogs mongoles|togrogs|tugriks|t\xF6gr\xF6g|mnt|\u20AE|t\xF6gr\xF6g mongoles|t\xF6gr\xF6g mongolie|togrogs mongolie"], ["Metical mozambique", "metical du mozambique|metical mozambique|mt|mzn|meticals mozambique"], ["Kyat birmanie", "kyat birmanie|ks|mmk"], ["Pya", "pya"], ["Cordoba nicaraguayen", "cordoba nicaraguayen|c\xF3rdoba nicaraguayen|nio|c\xF3rdoba oro|cordoba oro nicaraguayen"], ["Naira nig\xE9rians", "naira nig\xE9rians|naira|ngm|\u20A6|nairas nig\xE9rians"], ["Livre turque", "livre turque|try|tl|livre turques"], ["Kuru\u015F", "kuru\u015F"], ["Rials omanais", "rials omanais|omr|\u0631.\u0639.|rial omanais"], ["Balboa panam\xE9ennes", "balboa panam\xE9ennes|balboa|pab"], ["Kina", "kina|pkg|pgk"], ["Toea", "toea"], ["Guaran\xED paraguayen", "guaran\xED paraguayen|\u20B2|pyg"], ["Sol p\xE9ruvien", "nuevo sol p\xE9ruvien|soles|sol|sol p\xE9ruvien"], ["Z\u0142oty polonais", "z\u0142oty polonais|z\u0142oty|z\u0142|pln|zloty|zloty polonais"], ["Groxz", "groszy|grosz|grosze"], ["Riyal qatari", "riyal qatari|qar|riyals qatari"], ["Riyal saudi", "riyal saudi|sar|riyals saudi"], ["Riyal", "riyal|riyals|rial|\uFDFC"], ["Dirham", "dirham|dirhem|dirhm"], ["Halala", "halalas|halala"], ["Tala", "tala|t\u0101l\u0101|ws$|sat|wst"], ["Sene", "sene"], ["Dobra", "dobra|db|std"], ["Leone", "leone|sll"], ["Florins N\xE9erlandais", "florins hollandais|florins n\xE9erlandais|florins|ang|\u0192|florin|fl |"], ["Lilangeni", "lilangeni|szl"], ["Somoni tadjikistan", "somoni tadjikistan|tjs|somoni"], ["Diram", "dirams|diram"], ["Baht tha\xEFlandais", "baht tha\xEFlandais|baht thailandais|baht tha\xEF|baht thai|baht|\u0E3F|thb"], ["Satang", "satang|satangs"], ["Pa\u02BBanga", "pa\u02BBanga|pa'anga|top"], ["Hryvnia ukrainien", "hryvnia ukrainien|hyrvnia|uah|\u20B4|hryvnias ukrainien|hryvnia ukrainienne"], ["Vanuatu vatu", "vanuatu vatu|vatu|vuv"], ["Bol\xEDvar v\xE9n\xE9zu\xE9lien", "bol\xEDvar v\xE9n\xE9zu\xE9lien|bolivar venezuelien|bs.f.|vef|bol\xEDvars v\xE9n\xE9zu\xE9lien|bolivars venezuelien"], ["Dong vietnamien", "dong vietnamien|dongs vietnamiens|dong|\u0111\u1ED3ng|vnd|d\xF4ng|d\xF4ng vietnamiens"], ["Kwacha de Zambie", "kwacha de zambie|zk|zmw|kwachas"], ["Dirham marocain", "dirham marocain|mad|\u062F.\u0645."], ["Dirham des \xC9mirats arabes unis", "dirham des \xC9mirats arabes unis|\u062F.\u0625|aed"], ["Manat azerba\xEFdjanais", "manat azerba\xEFdjanais|manat azerbaidjanais|azn"], ["Manat turkm\xE8ne", "manat turkm\xE8ne|tmt|manat turkmene"], ["Manat", "manats|manat"], ["Q\u0259pik", "q\u0259pik"], ["Shilling somalien", "shilling somalien|shillings somalien|sos"], ["Shilling tanzanien", "shilling tanzanien|shillings tanzanien|tzs|tsh|shilling tanzanienne|shillings tanzanienne"], ["Shilling ougandais", "shilling ougandais|shillings ougandais|sh|ugx"], ["Leu roumain", "leu roumain|lei|leu roumaine|ron"], ["Leu moldave", "leu meoldave|mdl"], ["Leu", "leu"], ["Ban", "bani|-ban|ban"], ["Roupie n\xE9palaise", "roupie n\xE9palaise|roupie nepalaise|npr"], ["Roupie pakistanaise", "roupie pakistanaise|pkr"], ["Roupie indienne", "roupie indienne|inr|roupie indien|inr|\u20B9"], ["Roupie seychelloise", "roupie seychelloise|scr|sr|sre"], ["Roupie mauricienne", "roupie mauricienne|mur"], ["Rufiyaa maldives", "rufiyaa maldives|mvr|.\u0783|rf"], ["Roupie srilankaise", "roupie srilankaise|lrk|\u0DBB\u0DD4|\u0BB0\u0BC2"], ["Rupiah Indon\xE9sie", "rupia indon\xE9sie|rupia indonesie|rupiah|rp|idr"], ["Roupie", "roupie"], ["Couronne danoise", "couronne danoise|dkk|couronnes danoise|couronne danemark|couronnes danemark"], ["Couronne norv\xE9gienne", "couronne norv\xE9gienne|couronne norvegienne|couronnes norv\xE9gienne|couronnes norvegienne|nok"], ["Couronne f\xE9ro\xEFenne", "couronne f\xE9ro\xEFenne|couronne feroienne"], ["Couronne su\xE9doise", "couronne su\xE9doise|couronne su\xE9de|sek|couronnes su\xE9doise|couronne suedoise"], ["Couronne", "couronne|couronnes"], ["\xD8re", "\xD8re|oyra|eyrir"], ["Franc CFA de l'Afrique de l'Ouest", "franc cfa de l''afrique de l''ouest|franc cfa ouest africain|franc cfa|francs cfa|fcfa|frs cfa|cfa francs|xof"], ["Franc CFA d'Afrique centrale", "franc cfa d''afrique centrale|franc cfa centrale|frs cfa centrale|xaf"], ["Franc comorien", "franc comorien|kmf"], ["Franc congolais", "franc congolais|cdf"], ["Franc burundais", "franc burundais|bif"], ["Franc djiboutienne", "franc djiboutienne|djf"], ["Franc CFP", "franc cfp|xpf"], ["Franc guin\xE9en", "franc guin\xE9en|gnf"], ["Franc Suisse", "franc suisse|chf|sfr.|francs suisses"], ["Franc rwandais", "franc rwandais|rwf|rw|r\u20A3|frw"], ["Franc belge", "franc belge|bi.|b.fr.|bef"], ["Rappen", "rappen|-rappen"], ["Franc", "francs|franc|fr.|fs"], ["Centimes", "centimes|centime|santim"], ["Rouble russe", "rouble russe|rub|\u20BD|\u20BD russe|roubles russe|roubles russes|\u20BD russes"], ["Nouveau rouble bi\xE9lorusse", "nouveau rouble bi\xE9lorusse|byn|nouveau roubles bi\xE9lorusse|nouveau rouble bielorusse|nouveau roubles bi\xE9lorusse"], ["Rouble transnistriens", "rouble transnistriens|prb"], ["Rouble bi\xE9lorusses", "rouble bi\xE9lorusses|roubles bi\xE9lorusses|rouble bielorusses|roubles bielorusses"], ["Kopek", "kopek|kopeks"], ["Kapyeyka", "kapyeyka"], ["Rouble", "roubles|rouble|br"], ["Dinar alg\xE9rien", "dinar alg\xE9rien|\u062F.\u062C|dzd|dinars alg\xE9rien|dinar algerien|dinars algerien"], ["Dinar de bahre\xEFn", "dinar de bahre\xEFn|bhd|.\u062F.\u0628|dinar de bahrein"], ["Santeem", "santeem|santeems"], ["Dinar iraquien", "dinar iraquien|dinars iraquien|iqd|\u0639.\u062F|dinar iraquienne|dinars iraquienne"], ["Dinar jordanien", "dinar jordanien|dinars jordanien|\u062F.\u0627|jod"], ["Dinar kowe\xEFtien", "dinar kowe\xEFtien|dinar koweitien|dinars kowe\xEFtien|kwd|\u062F.\u0643"], ["Dinar libyen", "dinar libyen|dinars libyen|lyd"], ["Dinar serbe", "dinar serbe|dinars serbe|rsd|\u0434\u0438\u043D."], ["Dinar tunisien", "dinar tunisien|dinars tunisien|tnd"], ["Dinar yougoslave", "dinar yougoslave|dinars yougoslave|yun"], ["Dinar", "dinars|dinar|denar|-dinars|-dinar"], ["Fils", "fils|ful\u016Bs|-fils|-fil"], ["Para", "para|napa"], ["Millime", "millimes|millime"], ["Peso argentin", "peso argentin|ars|pesos argentin|peso argentine|pesos argentine"], ["Peso chilien", "peso chilien|pesos chilien|clp"], ["Peso colombien", "peso colombien|pesos colombien|cop|peso colombie|pesos colombien"], ["Peso cubains convertibles", "peso cubains convertibles|pesos cubains convertibles|cuc"], ["Peso cubains", "peso cubaines|pesos cubaines|peso cubaine|pesos cubaines|cup"], ["Peso dominicain", "peso dominicain|pesos dominicain|dop|peso dominicaine|pesos dominicaine"], ["Peso philippin", "peso philippin|pesos philippin|piso|\u20B1|php"], ["Peso uruguayen", "peso uruguayen|pesos uruguayen|uyu"], ["Peso", "pesos|Peso"], ["Centavo", "centavos|Centavo"], ["Livre britannique", "livre britannique|livres britannique|gbp|\xA3 britannique"], ["Livre guernesey", "livre guernesey|\xA3 guernesey|ggp"], ["Livre ascension", "livre ascension|livres ascension|\xA3 ascension"], ["Livre sainte-h\xE9l\xE8ne", "livre de sainte-h\xE9l\xE8ne|livre sainte-h\xE9l\xE8ne|livre sainte-helene|livre de sainte h\xE9l\xE8ne|shp"], ["Livre \xE9gyptienne", "livre \xE9gyptienne|livre egyptienne|egp|\u062C.\u0645"], ["Livre des \xEEles falkland", "livre des \xEEles falkland|livre des iles falkland|fkp|\xA3 iles falkland"], ["Livre gibraltar", "livre gibraltar|livre de gibraltar|\xA3 gibraltar|gip"], ["Livre manx", "imp|livre manx|\xA3 manx"], ["Livre jersey", "livre de jersey|livre jersey|jep|\xA3 jersey"], ["Livre libanaise", "livre libanaise|\xA3 libanaise|livres libanaise|lbp|\u0644.\u0644"], ["Livre des \xEEles malouines", "livre des \xEEles malouines|livre des iles malouines|\xA3 iles malouines"], ["Livre sud-soudanaise", "livre sud-soudanaise|livre sud soudanaise|livre du soudan du sud|livres sud-soudanaises|livre sud soudan|livre soudan sud"], ["Livre soudanaise", "livre soudanaise|livres soudanaise|sdg|\xA3 soudan|\u062C.\u0633.|livre soudan|livres soudan"], ["Livre syrienne", "livre syrienne|\u0644.\u0633|syp|livre syrie|livres syrie|\xA3 syrie"], ["Livre", "livre|livres|-livre|-livres|\xA3"], ["Pence", "pence"], ["Shilling", "shilling|shillings"], ["Penny", "penny|sou|centime"], ["Dollar Am\xE9ricain", "dollar am\xE9ricain|$ am\xE9ricain|$ americain|usd|$usd|$ usd|dollar americain|dollar \xC9tats-Unis|dollar des \xC9tats-Unis|dollar \xC9tats Unis|dollar etats unis|dollar etats-unis|$ etats-unis|$ \xC9tats-Unis"], ["Dollar des Cara\xEFbes orientales", "dollar des cara\xEFbes orientales|dollar des caraibes orientales|xcd|$ caraibes orientales|$ cara\xEFbes orientales"], ["Dollar Australien", "dollar australien|dollars australiens|$ australien|aud|$australien|australien $|$ australie|dollar australie"], ["Dollar des bahamas", "dollar des bahamas|dollar bahamas|$ bahamas|bsd|bahama $|dollar bahama|$ bahamas"], ["Dollar bermudes", "dollar des bermudes|dollar bermude|dollar bermudes|$ bermudes|bmd"], ["Dollar belize", "dollar de Belize|dollar belizien|bzd|$ belize"], ["Dollar \xEEles Vierges britanniques", "dollar \xEEles vierges britanniques|dollar iles vierges britanniques|$ iles vierges britanniques"], ["Dollar brunei", "dollar de brunei|$ brunei|bnd|dollar brunei"], ["Sen", "sen"], ["Dollar singapour", "dollar de singapour|dollar singapour|$ sinapour|sgd|$s"], ["Dollar Canadien", "dollar canadien|dollars canadien|$ canadien|cad|$can|$c|$ c|dollar canada|dollar canadienne|$ canada|$cad|cad$"], ["Dollar iles caimanes", "dollars des \xEEles ca\xEFmanes|dollar des \xEEles ca\xEFmanes|dollars des iles caimanes|dollar iles caimanes|kyd|$ci"], ["Dollar n\xE9o-z\xE9landais", "dollar n\xE9o-z\xE9landais|dollar n\xE9o z\xE9landais|dollar neo-zelandais|dollar neo zelandais|$nz|$ n\xE9o-z\xE9landais|$ neo zelandais"], ["Dollar \xEEles cook", "dollar \xEEles cook|dollar iles cook|$ iles cook"], ["Dollar des fidji", "dollar des fidji|$ fidji|dollar fidji|dollar de fidji|dollars des fidji|dollars de fidji"], ["Dollar guyanien", "dollar guyanien|dollar du guyana|dollar dre guyana|$ guayana|gyd|$gy"], ["Dollar de Hong Kong", "dollar hong kong|dollar hongkong|dollar de hong kong|dollar de hongkong|$hk|$ hk|hkd|hk $|hk$|dollar hk|$hongkong|dollars hongkong|dollars hong kong"], ["Dollar jama\xEFcain", "dollar jama\xEFcain|dollars jama\xEFcain|dollar jamaicain|dollars jamaicain|$j|$ jama\xEFque|dollar jama\xEFque|jmd"], ["Dollar lib\xE9rien", "dollar lib\xE9rien|dollars lib\xE9rien|dollar liberien|dollars liberien|lrd|$ lib\xE9rien|$ liberia|$ liberien"], ["Dollar namibien", "dollar namibien|dollars namibien|$ namibien|nad|$n|dollar namibie|dollars namibie|$ namibie"], ["Dollar des \xEEles salomon", "dollar des \xEEles Salomon|dollar des iles salomon|$si|sbd|$ iles salomon|$ \xEEles salomon"], ["Dollar du suriname", "dollar du suriname|srd|$ du suriname|$ suriname|dollar suriname|dollars suriname|dollars du suriname"], ["Nouveau dollar de Ta\xEFwan", "nouveau dollar de ta\xEFwan|nouveau dollar de taiwan|twd|ntd|$nt"], ["Dollar trinidadien", "dollar trinidadien|dollars trinidadien|ttd|$ trinidadien"], ["Dollar", "dollar|$|dollars"], ["Yuan Chinois", "yuan|yuans|yuan chinois|renminbi|cny|rmb|\uFFE5"], ["Fen", "fen"], ["Jiao", "jiao"], ["Mark Finlandais", "marks finlandais|mark finlandais|fim|mark"]]);
  FrenchNumericWithUnit2.CompoundUnitConnectorRegex = `(?<spacer>[^.])`;
  FrenchNumericWithUnit2.CurrencyPrefixList = /* @__PURE__ */ new Map([["Dollar", "$"], ["Dollar \xC9tats-Unis", "$us|usd|us$"], ["Dollar Cara\xEFbes orientales", "xcd|$ec"], ["Dollar australien", "a$|$a|aud"], ["Dollar bahamas", "bsd|b$"], ["Dollar barbadien", "bbd|bds$"], ["Dollar de belize", "bz$|bzd"], ["Dollar des bermudes", "bd$|bmd"], ["Dollar de brunei", "brunei $|bnd"], ["Dollar de Singapour", "s$|sgd"], ["Dollar Canadien", "cad|$ ca|$ca|$ c"], ["Dollar des \xEEles Ca\xEFmans", "ci$|kyd"], ["Dollar n\xE9o-z\xE9landais", "nz$|nzd"], ["Dollar de Fidji", "$fj|fjd"], ["Dolar guyanien", "g$|gyd"], ["Dollar de Hong Kong", "hkd|hk$"], ["Dollar jama\xEFcain", "j$|jmd"], ["Dollar lib\xE9rien", "lrd|l$"], ["Dollar namibien", "nad|n$"], ["Dollar des \xEEles Salomon", "$ si|$si|sbd"], ["Nouveau dollar de Ta\xEFwan", "nt$|twd"], ["R\xE9al br\xE9silien", "r$|brl|reais"], ["Guaran\xED paraguayen", "\u20B2|gs.|pyg"], ["Dollar trinidadien", "ttd|titis"], ["Yuan renminbi", "cny|rmb|\xA5|\u5143"], ["Yen", "\xA5|jpy"], ["Euro", "\u20AC|eur"], ["Pound", "\xA3"], ["Flor\xEDn", "\u0192"], ["Livre", "\xA3|gbp"]]);
  FrenchNumericWithUnit2.AmbiguousCurrencyUnitList = ["din.", "kina", "lari", "taka", "tala", "vatu", "yuan", "bob", "btn", "cop", "cup", "dop", "gip", "jod", "kgs", "lak", "mga", "mop", "nad", "omr", "sar", "sbd", "scr", "sdg", "sek", "sos", "std", "try", "yer"];
  FrenchNumericWithUnit2.InformationSuffixList = /* @__PURE__ */ new Map([["Bit", "-bit|bit|bits"], ["Kilobit", "kilobit|kilobits|kb|kbit|kbits"], ["Megabit", "megabit|megabits|Mb|Mbit|m\xE9gabit|m\xE9gabits"], ["Gigabit", "gigabit|gigabits|Gb|Gbit"], ["Terabit", "terabit|terabits|Tb|Tbit|t\xE9rabit|t\xE9rabits"], ["Petabit", "petabit|petabits|Pb|Pbit|p\xE9tabit|p\xE9tabits"], ["octet", "octet|octets|-octet"], ["Kilooctet", "kilo-octet|kilo-octets|kilooctet|kilooctets|ko|kio|kB|KiB|kilobyte|kilobytes"], ["M\xE9gaoctet", "m\xE9gaoctet|m\xE9gaoctets|m\xE9ga-octet|m\xE9ga-octets|Mo|Mio|MB|m\xE9gabyte|m\xE9gabytes"], ["Gigaoctet", "gigaoctet|gigaoctets|Go|Gio|GB|GiB|gigabyte|gigabytes"], ["T\xE9raoctet", "t\xE9raoctet|t\xE9raoctets|To|Tio|TB|TiB|t\xE9rabyte|t\xE9rabytes"], ["P\xE9taoctet", "p\xE9taoctet|p\xE9taoctets|Po|Pio|PB|PiB|p\xE9tabyte|p\xE9tabytes"]]);
  FrenchNumericWithUnit2.AmbiguousDimensionUnitList = ["mi", "barils", "grain", "l", "pierre", "fps", "pts"];
  FrenchNumericWithUnit2.BuildPrefix = `(?<=(\\s|^|\\P{L}))`;
  FrenchNumericWithUnit2.BuildSuffix = `(?=(\\s|\\P{L}|$))`;
  FrenchNumericWithUnit2.ConnectorToken = "de";
  FrenchNumericWithUnit2.LengthSuffixList = /* @__PURE__ */ new Map([["Kilom\xE8tres", "km|kilom\xE8tres|kilom\xE8tre|kilometres|kilometre|-km"], ["Hectom\xE8tre", "hm|hectom\xE8tre|hectom\xE8tres|hectometre|hectometres|-hm"], ["D\xE9cam\xE8tre", "dam|d\xE9cam\xE8tre|d\xE9cam\xE8tres|decametre|decametres|-dm"], ["M\xE8tres", "m|m\xE8tres|m\xE8tre|metres|metre|m.|-m"], ["D\xE9cim\xE8tres", "dm|d\xE9cim\xE8tres|d\xE9cim\xE8tre|decimetres|decimetre"], ["Centim\xE8tres", "cm|centim\xE8tres|centim\xE8tre|centimetres|centimetre"], ["Millim\xE8tres", "mm|millim\xE8tres|millim\xE8tre|millimetre|millimetres"], ["Microm\xE8tres", "\xB5m|um|microm\xE8tres|microm\xE8tre|micrometres|micrometre"], ["Nanom\xE8tres", "nm|nanometre|nanometres|nanom\xE8tres|nanom\xE8tre"], ["Picom\xE8tres", "pm|picom\xE8tre|picom\xE8tres|picometres|picometre"], ["Mile", "mi|mile|miles"], ["Pied", "pied|pieds"], ["Yard", "yards|yard|yd"], ["Pouce", "pouce|pouces"]]);
  FrenchNumericWithUnit2.AmbiguousLengthUnitList = ["m", "yard", "yards", "pm", "pt", "pts"];
  FrenchNumericWithUnit2.AmbuguousLengthUnitList = ["m", "pouce", "pm"];
  FrenchNumericWithUnit2.SpeedSuffixList = /* @__PURE__ */ new Map([["M\xE8tre par seconde", "m/s|metres/seconde|metres par seconde|metre par seconde|metres par secondes|m\xE8tre par seconde|m\xE8tres par seconde|m\xE8tres par secondes"], ["Kilom\xE8tre par heure", "km/h|kilom\xE8tre par heure|kilom\xE8tres par heure|kilom\xE8tres par heures|kilometres par heure|kilometre par heure"], ["Kilom\xE8tre par minute", "km/m|kilom\xE8tre par minute|kilom\xE8tres par minute|kilom\xE8tres par minutes|kilometre par minute|kilometre par minutes"], ["Kilom\xE8tre par seconde", "km/s|km \xE0 la seconde|km a la seconde|kilom\xE8tre par seconde|kilom\xE8tres par seconde|kilometre par seconde|kilometres par seconde"], ["Miles par heure", "mph|miles par heure|miles \xE0 l'heure|miles a l'heure|miles un heure"], ["Noeuds", "noeud|noeuds|nuds"], ["Pied par seconde", "ft/s|pied par seconde|pieds par seconde|pied/s|pieds/s"], ["Pied par minute", "pieds/minute|pied/minute|ft/minute|ft/min|pied/min"]]);
  FrenchNumericWithUnit2.TemperatureSuffixList = /* @__PURE__ */ new Map([["Kelvin", "k|K|kelvin"], ["F", "\xB0f|degres f|degr\xE9s f|deg f|\xB0 f|degr\xE9s fahrenheit|degres fahrenheit|fahrenheit"], ["R", "rankine|\xB0r|\xB0 r"], ["C", "\xB0c|deg c|degr\xE9s celsius|degr\xE9s c|degres celsius|celsius|deg celsius|degs celsius|centigrade|deg centigrade|degs centigrade|degr\xE9s centigrade|degres centigrade|degr\xE9 centigrade|degre centigrade"], ["Degr\xE9", "degr\xE9s|degres|deg.|\xB0| \xB0|degr\xE9|degre|deg"]]);
  FrenchNumericWithUnit2.VolumeSuffixList = /* @__PURE__ */ new Map([["M\xE8tre cube", "m3|m^3|m\xB3|m\xE8tre cube|m\xE8tres cube|metre cube|metres cube"], ["Centim\xE8tre cube", "cm3|cm^3|cm\xB3|centim\xE8tre cube|centim\xE8tres cube|centimetre cube|centimetres cube"], ["Millim\xE8tre cube", "mm3|mm^3|mm\xB3|millim\xE8tre cube|millim\xE8tres cube|millimetre cube|millimetres cube"], ["Kilom\xE8tre cube", "km3|km^3|km\xB3|kilom\xE8tre cube|kilom\xE8tres cube|kilometre cube|kilometres cube"], ["Pieds cube", "pieds cubes|pieds cube|pied cube|pied cubes"], ["Litre", "litre|litres|lts|l"], ["Millilitre", "ml|millilitre|millilitres"], ["Gallon", "gallon|gallons"], ["Pintes", "pintes"], ["Onces", "onces|once|oz"], ["D\xE9cilitre", "dl|d\xE9cilitre|decilitre|d\xE9cilitres|decilitres"], ["Centilitre", "cl|centilitres|centilitre"], ["Onces liquides", "onces liquides|once liquide|once liquides"], ["Baril", "baril|barils|bbl"]]);
  FrenchNumericWithUnit2.AmbiguousVolumeUnitList = ["ounce", "oz", "l", "cup", "peck", "cord", "gill"];
  FrenchNumericWithUnit2.WeightSuffixList = /* @__PURE__ */ new Map([["Kilogramme", "kg|kilogramme|kilogrammes|kilo|kilos"], ["Gram", "g|gramme|grammes"], ["Milligramme", "mg|milligramme|milligrammes"], ["Tonne m\xE9trique", "tonne m\xE9trique|tonnes m\xE9trique|tonnes m\xE9triques|tonne metrique|tonnes metrique"], ["Tonne", "tonne|tonnes|-tonnes|-tonne"], ["Livre", "livre|livres"]]);
  FrenchNumericWithUnit2.AmbiguousWeightUnitList = ["g", "oz", "stone", "dram"];
})(FrenchNumericWithUnit || (FrenchNumericWithUnit = {}));

// recognizers/recognizers-number-with-unit/src/numberWithUnit/french/base.ts
var FrenchNumberWithUnitExtractorConfiguration = class {
  constructor(ci) {
    this.cultureInfo = ci;
    this.unitNumExtractor = new recognizersTextNumber.FrenchNumberExtractor();
    this.buildPrefix = FrenchNumericWithUnit.BuildPrefix;
    this.buildSuffix = FrenchNumericWithUnit.BuildSuffix;
    this.connectorToken = FrenchNumericWithUnit.ConnectorToken;
    this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(FrenchNumericWithUnit.CompoundUnitConnectorRegex);
    this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(BaseUnits.PmNonUnitRegex);
  }
};
var FrenchNumberWithUnitParserConfiguration = class extends BaseNumberWithUnitParserConfiguration {
  constructor(ci) {
    super(ci);
    this.internalNumberExtractor = new recognizersTextNumber.FrenchNumberExtractor(recognizersTextNumber.NumberMode.Default);
    this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.FrenchNumberParserConfiguration());
    this.connectorToken = FrenchNumericWithUnit.ConnectorToken;
  }
};

// recognizers/recognizers-number-with-unit/src/numberWithUnit/french/currency.ts
var FrenchCurrencyExtractorConfiguration = class extends FrenchNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_CURRENCY;
    this.suffixList = FrenchNumericWithUnit.CurrencySuffixList;
    this.prefixList = FrenchNumericWithUnit.CurrencyPrefixList;
    this.ambiguousUnitList = FrenchNumericWithUnit.AmbiguousCurrencyUnitList;
  }
};
var FrenchCurrencyParserConfiguration = class extends FrenchNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
    }
    super(ci);
    this.BindDictionary(FrenchNumericWithUnit.CurrencySuffixList);
    this.BindDictionary(FrenchNumericWithUnit.CurrencyPrefixList);
  }
};
var FrenchTemperatureExtractorConfiguration = class extends FrenchNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_TEMPERATURE;
    this.suffixList = FrenchNumericWithUnit.TemperatureSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = new Array();
  }
};
var FrenchTemperatureParserConfiguration = class extends FrenchNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
    }
    super(ci);
    this.connectorToken = null;
    this.BindDictionary(FrenchNumericWithUnit.TemperatureSuffixList);
  }
};
var dimensionSuffixList3 = new Map([
  ...FrenchNumericWithUnit.InformationSuffixList,
  ...FrenchNumericWithUnit.AreaSuffixList,
  ...FrenchNumericWithUnit.LengthSuffixList,
  ...FrenchNumericWithUnit.SpeedSuffixList,
  ...FrenchNumericWithUnit.VolumeSuffixList,
  ...FrenchNumericWithUnit.WeightSuffixList
]);
var FrenchDimensionExtractorConfiguration = class extends FrenchNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_DIMENSION;
    this.suffixList = dimensionSuffixList3;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = FrenchNumericWithUnit.AmbiguousDimensionUnitList;
  }
};
var FrenchDimensionParserConfiguration = class extends FrenchNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
    }
    super(ci);
    this.BindDictionary(dimensionSuffixList3);
  }
};
var FrenchAgeExtractorConfiguration = class extends FrenchNumberWithUnitExtractorConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
    }
    super(ci);
    this.extractType = Constants.SYS_UNIT_AGE;
    this.suffixList = FrenchNumericWithUnit.AgeSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = new Array();
  }
};
var FrenchAgeParserConfiguration = class extends FrenchNumberWithUnitParserConfiguration {
  constructor(ci) {
    if (!ci) {
      ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
    }
    super(ci);
    this.BindDictionary(FrenchNumericWithUnit.AgeSuffixList);
  }
};

// recognizers/recognizers-number-with-unit/src/numberWithUnit/numberWithUnitRecognizer.ts
var NumberWithUnitOptions = /* @__PURE__ */ ((NumberWithUnitOptions2) => {
  NumberWithUnitOptions2[NumberWithUnitOptions2["None"] = 0] = "None";
  return NumberWithUnitOptions2;
})(NumberWithUnitOptions || {});
function recognizeCurrency(query, culture, options = 0 /* None */, fallbackToDefaultCulture = true) {
  return recognizeByModel((recognizer) => recognizer.getCurrencyModel(culture, fallbackToDefaultCulture), query, culture, options);
}
function recognizeTemperature(query, culture, options = 0 /* None */, fallbackToDefaultCulture = true) {
  return recognizeByModel((recognizer) => recognizer.getTemperatureModel(culture, fallbackToDefaultCulture), query, culture, options);
}
function recognizeDimension(query, culture, options = 0 /* None */, fallbackToDefaultCulture = true) {
  return recognizeByModel((recognizer) => recognizer.getDimensionModel(culture, fallbackToDefaultCulture), query, culture, options);
}
function recognizeAge(query, culture, options = 0 /* None */, fallbackToDefaultCulture = true) {
  return recognizeByModel((recognizer) => recognizer.getAgeModel(culture, fallbackToDefaultCulture), query, culture, options);
}
function recognizeByModel(getModelFunc, query, culture, options) {
  let recognizer = new NumberWithUnitRecognizer(culture, options);
  let model = getModelFunc(recognizer);
  return model.parse(query);
}
var NumberWithUnitRecognizer = class extends recognizersText.Recognizer {
  constructor(culture, options = 0 /* None */, lazyInitialization = false) {
    super(culture, options, lazyInitialization);
  }
  InitializeConfiguration() {
    this.registerModel("CurrencyModel", recognizersTextNumber.Culture.English, (options) => new CurrencyModel(/* @__PURE__ */ new Map([
      [new BaseMergedUnitExtractor(new EnglishCurrencyExtractorConfiguration()), new BaseMergedUnitParser(new EnglishCurrencyParserConfiguration())]
    ])));
    this.registerModel("TemperatureModel", recognizersTextNumber.Culture.English, (options) => new TemperatureModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new EnglishTemperatureExtractorConfiguration()), new NumberWithUnitParser(new EnglishTemperatureParserConfiguration())]
    ])));
    this.registerModel("DimensionModel", recognizersTextNumber.Culture.English, (options) => new DimensionModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new EnglishDimensionExtractorConfiguration()), new NumberWithUnitParser(new EnglishDimensionParserConfiguration())]
    ])));
    this.registerModel("AgeModel", recognizersTextNumber.Culture.English, (options) => new AgeModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new EnglishAgeExtractorConfiguration()), new NumberWithUnitParser(new EnglishAgeParserConfiguration())]
    ])));
    this.registerModel("CurrencyModel", recognizersTextNumber.Culture.Spanish, (options) => new CurrencyModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new SpanishCurrencyExtractorConfiguration()), new NumberWithUnitParser(new SpanishCurrencyParserConfiguration())]
    ])));
    this.registerModel("TemperatureModel", recognizersTextNumber.Culture.Spanish, (options) => new TemperatureModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new SpanishTemperatureExtractorConfiguration()), new NumberWithUnitParser(new SpanishTemperatureParserConfiguration())]
    ])));
    this.registerModel("DimensionModel", recognizersTextNumber.Culture.Spanish, (options) => new DimensionModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new SpanishDimensionExtractorConfiguration()), new NumberWithUnitParser(new SpanishDimensionParserConfiguration())]
    ])));
    this.registerModel("AgeModel", recognizersTextNumber.Culture.Spanish, (options) => new AgeModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new SpanishAgeExtractorConfiguration()), new NumberWithUnitParser(new SpanishAgeParserConfiguration())]
    ])));
    this.registerModel("CurrencyModel", recognizersTextNumber.Culture.Portuguese, (options) => new CurrencyModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new PortugueseCurrencyExtractorConfiguration()), new NumberWithUnitParser(new PortugueseCurrencyParserConfiguration())]
    ])));
    this.registerModel("TemperatureModel", recognizersTextNumber.Culture.Portuguese, (options) => new TemperatureModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new PortugueseTemperatureExtractorConfiguration()), new NumberWithUnitParser(new PortugueseTemperatureParserConfiguration())]
    ])));
    this.registerModel("DimensionModel", recognizersTextNumber.Culture.Portuguese, (options) => new DimensionModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new PortugueseDimensionExtractorConfiguration()), new NumberWithUnitParser(new PortugueseDimensionParserConfiguration())]
    ])));
    this.registerModel("AgeModel", recognizersTextNumber.Culture.Portuguese, (options) => new AgeModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new PortugueseAgeExtractorConfiguration()), new NumberWithUnitParser(new PortugueseAgeParserConfiguration())]
    ])));
    this.registerModel("CurrencyModel", recognizersTextNumber.Culture.Chinese, (options) => new CurrencyModel(/* @__PURE__ */ new Map([
      [new BaseMergedUnitExtractor(new ChineseCurrencyExtractorConfiguration()), new BaseMergedUnitParser(new ChineseCurrencyParserConfiguration())],
      [new NumberWithUnitExtractor(new EnglishCurrencyExtractorConfiguration()), new NumberWithUnitParser(new EnglishCurrencyParserConfiguration())]
    ])));
    this.registerModel("TemperatureModel", recognizersTextNumber.Culture.Chinese, (options) => new TemperatureModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new ChineseTemperatureExtractorConfiguration()), new NumberWithUnitParser(new ChineseTemperatureParserConfiguration())],
      [new NumberWithUnitExtractor(new EnglishTemperatureExtractorConfiguration()), new NumberWithUnitParser(new EnglishTemperatureParserConfiguration())]
    ])));
    this.registerModel("DimensionModel", recognizersTextNumber.Culture.Chinese, (options) => new DimensionModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new ChineseDimensionExtractorConfiguration()), new NumberWithUnitParser(new ChineseDimensionParserConfiguration())],
      [new NumberWithUnitExtractor(new EnglishDimensionExtractorConfiguration()), new NumberWithUnitParser(new EnglishDimensionParserConfiguration())]
    ])));
    this.registerModel("AgeModel", recognizersTextNumber.Culture.Chinese, (options) => new AgeModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new ChineseAgeExtractorConfiguration()), new NumberWithUnitParser(new ChineseAgeParserConfiguration())],
      [new NumberWithUnitExtractor(new EnglishAgeExtractorConfiguration()), new NumberWithUnitParser(new EnglishAgeParserConfiguration())]
    ])));
    this.registerModel("CurrencyModel", recognizersTextNumber.Culture.Japanese, (options) => new CurrencyModel(/* @__PURE__ */ new Map([
      [new BaseMergedUnitExtractor(new JapaneseCurrencyExtractorConfiguration()), new BaseMergedUnitParser(new JapaneseCurrencyParserConfiguration())],
      [new NumberWithUnitExtractor(new EnglishCurrencyExtractorConfiguration()), new NumberWithUnitParser(new EnglishCurrencyParserConfiguration())]
    ])));
    this.registerModel("AgeModel", recognizersTextNumber.Culture.Japanese, (options) => new AgeModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new JapaneseAgeExtractorConfiguration()), new NumberWithUnitParser(new JapaneseAgeParserConfiguration())],
      [new NumberWithUnitExtractor(new EnglishAgeExtractorConfiguration()), new NumberWithUnitParser(new EnglishAgeParserConfiguration())]
    ])));
    this.registerModel("CurrencyModel", recognizersTextNumber.Culture.French, (options) => new CurrencyModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new FrenchCurrencyExtractorConfiguration()), new NumberWithUnitParser(new FrenchCurrencyParserConfiguration())]
    ])));
    this.registerModel("TemperatureModel", recognizersTextNumber.Culture.French, (options) => new TemperatureModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new FrenchTemperatureExtractorConfiguration()), new NumberWithUnitParser(new FrenchTemperatureParserConfiguration())]
    ])));
    this.registerModel("DimensionModel", recognizersTextNumber.Culture.French, (options) => new DimensionModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new FrenchDimensionExtractorConfiguration()), new NumberWithUnitParser(new FrenchDimensionParserConfiguration())]
    ])));
    this.registerModel("AgeModel", recognizersTextNumber.Culture.French, (options) => new AgeModel(/* @__PURE__ */ new Map([
      [new NumberWithUnitExtractor(new FrenchAgeExtractorConfiguration()), new NumberWithUnitParser(new FrenchAgeParserConfiguration())]
    ])));
  }
  IsValidOptions(options) {
    return options >= 0 && options <= 0 /* None */;
  }
  getCurrencyModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("CurrencyModel", culture, fallbackToDefaultCulture);
  }
  getTemperatureModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("TemperatureModel", culture, fallbackToDefaultCulture);
  }
  getDimensionModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("DimensionModel", culture, fallbackToDefaultCulture);
  }
  getAgeModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("AgeModel", culture, fallbackToDefaultCulture);
  }
};

Object.defineProperty(exports, "Culture", {
  enumerable: true,
  get: function () { return recognizersTextNumber.Culture; }
});
Object.defineProperty(exports, "CultureInfo", {
  enumerable: true,
  get: function () { return recognizersTextNumber.CultureInfo; }
});
exports.AbstractNumberWithUnitModel = AbstractNumberWithUnitModel;
exports.AgeModel = AgeModel;
exports.BaseCurrencyParser = BaseCurrencyParser;
exports.BaseMergedUnitExtractor = BaseMergedUnitExtractor;
exports.BaseMergedUnitParser = BaseMergedUnitParser;
exports.BaseNumberWithUnitParserConfiguration = BaseNumberWithUnitParserConfiguration;
exports.ChineseAgeExtractorConfiguration = ChineseAgeExtractorConfiguration;
exports.ChineseAgeParserConfiguration = ChineseAgeParserConfiguration;
exports.ChineseCurrencyExtractorConfiguration = ChineseCurrencyExtractorConfiguration;
exports.ChineseCurrencyParserConfiguration = ChineseCurrencyParserConfiguration;
exports.ChineseDimensionExtractorConfiguration = ChineseDimensionExtractorConfiguration;
exports.ChineseDimensionParserConfiguration = ChineseDimensionParserConfiguration;
exports.ChineseNumberWithUnitExtractorConfiguration = ChineseNumberWithUnitExtractorConfiguration;
exports.ChineseNumberWithUnitParserConfiguration = ChineseNumberWithUnitParserConfiguration;
exports.ChineseTemperatureExtractorConfiguration = ChineseTemperatureExtractorConfiguration;
exports.ChineseTemperatureParserConfiguration = ChineseTemperatureParserConfiguration;
exports.CompositeEntityType = CompositeEntityType;
exports.Constants = Constants;
exports.CurrencyModel = CurrencyModel;
exports.DimensionModel = DimensionModel;
exports.EnglishAgeExtractorConfiguration = EnglishAgeExtractorConfiguration;
exports.EnglishAgeParserConfiguration = EnglishAgeParserConfiguration;
exports.EnglishCurrencyExtractorConfiguration = EnglishCurrencyExtractorConfiguration;
exports.EnglishCurrencyParserConfiguration = EnglishCurrencyParserConfiguration;
exports.EnglishDimensionExtractorConfiguration = EnglishDimensionExtractorConfiguration;
exports.EnglishDimensionParserConfiguration = EnglishDimensionParserConfiguration;
exports.EnglishNumberWithUnitExtractorConfiguration = EnglishNumberWithUnitExtractorConfiguration;
exports.EnglishNumberWithUnitParserConfiguration = EnglishNumberWithUnitParserConfiguration;
exports.EnglishTemperatureExtractorConfiguration = EnglishTemperatureExtractorConfiguration;
exports.EnglishTemperatureParserConfiguration = EnglishTemperatureParserConfiguration;
exports.JapaneseAgeExtractorConfiguration = JapaneseAgeExtractorConfiguration;
exports.JapaneseAgeParserConfiguration = JapaneseAgeParserConfiguration;
exports.JapaneseCurrencyExtractorConfiguration = JapaneseCurrencyExtractorConfiguration;
exports.JapaneseCurrencyParserConfiguration = JapaneseCurrencyParserConfiguration;
exports.JapaneseNumberWithUnitExtractorConfiguration = JapaneseNumberWithUnitExtractorConfiguration;
exports.JapaneseNumberWithUnitParserConfiguration = JapaneseNumberWithUnitParserConfiguration;
exports.NumberWithUnitExtractor = NumberWithUnitExtractor;
exports.NumberWithUnitOptions = NumberWithUnitOptions;
exports.NumberWithUnitParser = NumberWithUnitParser;
exports.NumberWithUnitRecognizer = NumberWithUnitRecognizer;
exports.PortugueseAgeExtractorConfiguration = PortugueseAgeExtractorConfiguration;
exports.PortugueseAgeParserConfiguration = PortugueseAgeParserConfiguration;
exports.PortugueseCurrencyExtractorConfiguration = PortugueseCurrencyExtractorConfiguration;
exports.PortugueseCurrencyParserConfiguration = PortugueseCurrencyParserConfiguration;
exports.PortugueseDimensionExtractorConfiguration = PortugueseDimensionExtractorConfiguration;
exports.PortugueseDimensionParserConfiguration = PortugueseDimensionParserConfiguration;
exports.PortugueseNumberWithUnitExtractorConfiguration = PortugueseNumberWithUnitExtractorConfiguration;
exports.PortugueseNumberWithUnitParserConfiguration = PortugueseNumberWithUnitParserConfiguration;
exports.PortugueseTemperatureExtractorConfiguration = PortugueseTemperatureExtractorConfiguration;
exports.PortugueseTemperatureParserConfiguration = PortugueseTemperatureParserConfiguration;
exports.PrefixUnitResult = PrefixUnitResult;
exports.SpanishAgeExtractorConfiguration = SpanishAgeExtractorConfiguration;
exports.SpanishAgeParserConfiguration = SpanishAgeParserConfiguration;
exports.SpanishCurrencyExtractorConfiguration = SpanishCurrencyExtractorConfiguration;
exports.SpanishCurrencyParserConfiguration = SpanishCurrencyParserConfiguration;
exports.SpanishDimensionExtractorConfiguration = SpanishDimensionExtractorConfiguration;
exports.SpanishDimensionParserConfiguration = SpanishDimensionParserConfiguration;
exports.SpanishNumberWithUnitExtractorConfiguration = SpanishNumberWithUnitExtractorConfiguration;
exports.SpanishNumberWithUnitParserConfiguration = SpanishNumberWithUnitParserConfiguration;
exports.SpanishTemperatureExtractorConfiguration = SpanishTemperatureExtractorConfiguration;
exports.SpanishTemperatureParserConfiguration = SpanishTemperatureParserConfiguration;
exports.TemperatureModel = TemperatureModel;
exports.UnitValue = UnitValue;
exports.UnitValueIso = UnitValueIso;
exports.recognizeAge = recognizeAge;
exports.recognizeCurrency = recognizeCurrency;
exports.recognizeDimension = recognizeDimension;
exports.recognizeTemperature = recognizeTemperature;
