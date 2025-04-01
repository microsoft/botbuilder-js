'use strict';

var recognizersText = require('../recognizers-text');
var bignumber = require('bignumber.js/bignumber');
var trimEnd = require("lodash/trimEnd");
var sortBy = require("lodash/sortBy");
var escapeRegExp = require("lodash/escapeRegExp");

// recognizers/recognizers-number/src/number/constants.ts
var Constants = class {
};
Constants.SYS_NUM_CARDINAL = "builtin.num.cardinal";
Constants.SYS_NUM_DOUBLE = "builtin.num.double";
Constants.SYS_NUM_FRACTION = "builtin.num.fraction";
Constants.SYS_NUM_INTEGER = "builtin.num.integer";
Constants.SYS_NUM = "builtin.num";
Constants.SYS_NUM_ORDINAL = "builtin.num.ordinal";
Constants.SYS_NUM_PERCENTAGE = "builtin.num.percentage";
// NARROW NO-BREAK SPACE
Constants.NO_BREAK_SPACE = "\u202F";

// recognizers/recognizers-number/src/number/models.ts
var NumberMode = /* @__PURE__ */ ((NumberMode2) => {
  NumberMode2[NumberMode2["Default"] = 0] = "Default";
  NumberMode2[NumberMode2["Currency"] = 1] = "Currency";
  NumberMode2[NumberMode2["PureNumber"] = 2] = "PureNumber";
  return NumberMode2;
})(NumberMode || {});
var _LongFormatType = class _LongFormatType {
  constructor(thousandsMark, decimalsMark) {
    this.thousandsMark = thousandsMark;
    this.decimalsMark = decimalsMark;
  }
};
// Reference : https://www.wikiwand.com/en/Decimal_mark
// Value : 1234567.89
// 1,234,567
_LongFormatType.integerNumComma = new _LongFormatType(",", "\0");
// 1.234.567
_LongFormatType.integerNumDot = new _LongFormatType(".", "\0");
// 1 234 567
_LongFormatType.integerNumBlank = new _LongFormatType(" ", "\0");
// 1 234 567
_LongFormatType.integerNumNoBreakSpace = new _LongFormatType(Constants.NO_BREAK_SPACE, "\0");
// 1'234'567
_LongFormatType.integerNumQuote = new _LongFormatType("'", "\0");
// 1,234,567.89
_LongFormatType.doubleNumCommaDot = new _LongFormatType(",", ".");
// 1,234,567·89
_LongFormatType.doubleNumCommaCdot = new _LongFormatType(",", "\xB7");
// 1 234 567,89
_LongFormatType.doubleNumBlankComma = new _LongFormatType(" ", ",");
// 1 234 567,89
_LongFormatType.doubleNumNoBreakSpaceComma = new _LongFormatType(Constants.NO_BREAK_SPACE, ",");
// 1 234 567.89
_LongFormatType.doubleNumBlankDot = new _LongFormatType(" ", ".");
// 1 234 567.89
_LongFormatType.doubleNumNoBreakSpaceDot = new _LongFormatType(Constants.NO_BREAK_SPACE, ".");
// 1.234.567,89
_LongFormatType.doubleNumDotComma = new _LongFormatType(".", ",");
// 1'234'567,89
_LongFormatType.doubleNumQuoteComma = new _LongFormatType("'", ",");
var LongFormatType = _LongFormatType;
var AbstractNumberModel = class {
  constructor(parser, extractor) {
    this.extractor = extractor;
    this.parser = parser;
  }
  parse(query) {
    let extractResults = this.extractor.extract(query);
    let parseNums = extractResults.map((r) => this.parser.parse(r));
    return parseNums.map((o) => o).map((o) => ({
      start: o.start,
      end: o.start + o.length - 1,
      resolution: { value: o.resolutionStr },
      text: o.text,
      typeName: this.modelTypeName
    }));
  }
};
var NumberModel = class extends AbstractNumberModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "number";
  }
};
var OrdinalModel = class extends AbstractNumberModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "ordinal";
  }
};
var PercentModel = class extends AbstractNumberModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "percentage";
  }
};

// recognizers/recognizers-number/src/culture.ts
var _Culture = class _Culture extends recognizersText.Culture {
  constructor(cultureName, cultureCode, longFormat) {
    super(cultureName, cultureCode);
    this.longFormat = longFormat;
  }
};
_Culture.supportedCultures = [
  new _Culture("English", _Culture.English, new LongFormatType(",", ".")),
  new _Culture("Chinese", _Culture.Chinese, null),
  new _Culture("Spanish", _Culture.Spanish, new LongFormatType(".", ",")),
  new _Culture("Portuguese", _Culture.Portuguese, new LongFormatType(".", ",")),
  new _Culture("French", _Culture.French, new LongFormatType(".", ",")),
  new _Culture("Japanese", _Culture.Japanese, new LongFormatType(",", "."))
];
var Culture = _Culture;
var CultureInfo = class extends recognizersText.CultureInfo {
  format(value) {
    let bigNumber = new bignumber.BigNumber(value);
    let s;
    if (bigNumber.decimalPlaces()) {
      s = bigNumber.precision(15, bignumber.BigNumber.ROUND_HALF_UP).toString();
    } else {
      s = bigNumber.toString().toUpperCase();
    }
    if (s.indexOf(".") > -1) {
      s = trimEnd(s, "0");
    }
    if (s.indexOf("e-") > -1) {
      let p = s.split("e-");
      p[1] = p[1].length === 1 ? "0" + p[1] : p[1];
      s = p.join("E-");
    }
    let culture = Culture.supportedCultures.find((c) => c.cultureCode === this.code);
    if (culture && culture.longFormat) {
      return s.split(",").map((t) => t.split(".").join(culture.longFormat.decimalsMark)).join(culture.longFormat.thousandsMark);
    }
    return s;
  }
};
bignumber.BigNumber.config({ EXPONENTIAL_AT: [-5, 15] });
var BaseNumberParser = class {
  constructor(config) {
    this.config = config;
    let singleIntFrac = `${this.config.wordSeparatorToken}| -|${this.getKeyRegex(this.config.cardinalNumberMap)}|${this.getKeyRegex(this.config.ordinalNumberMap)}`;
    this.textNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(String.raw`(?=\b)(${singleIntFrac})(?=\b)`, "gis");
    this.arabicNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(String.raw`\d+`, "is");
    this.roundNumberSet = /* @__PURE__ */ new Set();
    this.config.roundNumberMap.forEach(
      (value, key) => this.roundNumberSet.add(key)
    );
  }
  parse(extResult) {
    if (this.supportedTypes && !this.supportedTypes.find((t) => t === extResult.type)) {
      return null;
    }
    let ret = null;
    let extra = extResult.data;
    if (!extra) {
      if (this.arabicNumberRegex.test(extResult.text)) {
        extra = "Num";
      } else {
        extra = this.config.langMarker;
      }
    }
    let isNegative = false;
    let matchNegative = extResult.text.match(this.config.negativeNumberSignRegex);
    if (matchNegative) {
      isNegative = true;
      extResult.text = extResult.text.substr(matchNegative[1].length);
    }
    if (extra.includes("Num")) {
      ret = this.digitNumberParse(extResult);
    } else if (extra.includes(`Frac${this.config.langMarker}`)) {
      ret = this.fracLikeNumberParse(extResult);
    } else if (extra.includes(this.config.langMarker)) {
      ret = this.textNumberParse(extResult);
    } else if (extra.includes("Pow")) {
      ret = this.powerNumberParse(extResult);
    }
    if (ret && ret.value !== null) {
      if (isNegative) {
        ret.text = matchNegative[1] + extResult.text;
        if (typeof ret.value === "number") {
          ret.value = -ret.value;
        } else {
          ret.value.s = -1;
        }
      }
      ret.resolutionStr = this.config.cultureInfo ? this.config.cultureInfo.format(ret.value) : ret.value.toString();
    }
    return ret;
  }
  getKeyRegex(regexMap) {
    let keys = new Array();
    regexMap.forEach((value, key) => keys.push(key));
    let sortKeys = sortBy(keys, (key) => key.length).reverse();
    return sortKeys.join("|");
  }
  digitNumberParse(extResult) {
    let result = {
      start: extResult.start,
      length: extResult.length,
      text: extResult.text,
      type: extResult.type
    };
    let power = 1;
    let tmpIndex = -1;
    let startIndex = 0;
    let handle = extResult.text.toLowerCase();
    let matches = recognizersText.RegExpUtility.getMatches(this.config.digitalNumberRegex, handle);
    if (matches) {
      matches.forEach((match) => {
        match.value = match.value.replace(/\d/g, "");
        match.length = match.value.length;
        let rep = this.config.roundNumberMap.get(match.value);
        power *= rep;
        while ((tmpIndex = handle.indexOf(match.value, startIndex)) >= 0) {
          let front = trimEnd(handle.substring(0, tmpIndex));
          startIndex = front.length;
          handle = front + handle.substring(tmpIndex + match.length);
        }
      });
    }
    result.value = this.getDigitalValue(handle, power);
    return result;
  }
  isDigit(c) {
    return c >= "0" && c <= "9";
  }
  fracLikeNumberParse(extResult) {
    let result = {
      start: extResult.start,
      length: extResult.length,
      text: extResult.text,
      type: extResult.type
    };
    let resultText = extResult.text.toLowerCase();
    if (resultText.includes(this.config.fractionMarkerToken)) {
      let overIndex = resultText.indexOf(this.config.fractionMarkerToken);
      let smallPart = resultText.substring(0, overIndex).trim();
      let bigPart = resultText.substring(overIndex + this.config.fractionMarkerToken.length, resultText.length).trim();
      let smallValue = this.isDigit(smallPart[0]) ? this.getDigitalValue(smallPart, 1) : this.getIntValue(this.getMatches(smallPart));
      let bigValue = this.isDigit(bigPart[0]) ? this.getDigitalValue(bigPart, 1) : this.getIntValue(this.getMatches(bigPart));
      result.value = smallValue / bigValue;
    } else {
      let words = resultText.split(" ").filter((s) => s && s.length);
      let fracWords = Array.from(this.config.normalizeTokenSet(words, result));
      let splitIndex = fracWords.length - 1;
      let currentValue = this.config.resolveCompositeNumber(fracWords[splitIndex]);
      let roundValue = 1;
      for (splitIndex = fracWords.length - 2; splitIndex >= 0; splitIndex--) {
        if (this.config.writtenFractionSeparatorTexts.indexOf(fracWords[splitIndex]) > -1 || this.config.writtenIntegerSeparatorTexts.indexOf(fracWords[splitIndex]) > -1) {
          continue;
        }
        let previousValue = currentValue;
        currentValue = this.config.resolveCompositeNumber(fracWords[splitIndex]);
        let smHundreds = 100;
        if (previousValue >= smHundreds && previousValue > currentValue || previousValue < smHundreds && this.isComposable(currentValue, previousValue)) {
          if (previousValue < smHundreds && currentValue >= roundValue) {
            roundValue = currentValue;
          } else if (previousValue < smHundreds && currentValue < roundValue) {
            splitIndex++;
            break;
          }
          if (splitIndex === 0) {
            splitIndex = 1;
            while (splitIndex <= fracWords.length - 2) {
              if (this.config.resolveCompositeNumber(fracWords[splitIndex]) >= smHundreds && !(this.config.writtenFractionSeparatorTexts.indexOf(fracWords[splitIndex + 1]) > -1) && this.config.resolveCompositeNumber(fracWords[splitIndex + 1]) < smHundreds) {
                splitIndex++;
                break;
              }
              splitIndex++;
            }
            break;
          }
          continue;
        }
        splitIndex++;
        break;
      }
      let fracPart = new Array();
      for (let i = splitIndex; i < fracWords.length; i++) {
        if (fracWords[i].indexOf("-") > -1) {
          let split = fracWords[i].split("-");
          fracPart.push(split[0]);
          fracPart.push("-");
          fracPart.push(split[1]);
        } else {
          fracPart.push(fracWords[i]);
        }
      }
      fracWords.splice(splitIndex, fracWords.length - splitIndex);
      let denomiValue = this.getIntValue(fracPart);
      let numerValue = 0;
      let intValue = 0;
      let mixedIndex = fracWords.length;
      for (let i = fracWords.length - 1; i >= 0; i--) {
        if (i < fracWords.length - 1 && this.config.writtenFractionSeparatorTexts.indexOf(fracWords[i]) > -1) {
          let numerStr = fracWords.slice(i + 1, fracWords.length).join(" ");
          numerValue = this.getIntValue(this.getMatches(numerStr));
          mixedIndex = i + 1;
          break;
        }
      }
      let intStr = fracWords.slice(0, mixedIndex).join(" ");
      intValue = this.getIntValue(this.getMatches(intStr));
      if (mixedIndex !== fracWords.length && numerValue < denomiValue) {
        result.value = new bignumber.BigNumber(intValue).plus(new bignumber.BigNumber(numerValue).dividedBy(denomiValue));
      } else {
        result.value = new bignumber.BigNumber(intValue + numerValue).dividedBy(denomiValue);
      }
    }
    return result;
  }
  textNumberParse(extResult) {
    let result = {
      start: extResult.start,
      length: extResult.length,
      text: extResult.text,
      type: extResult.type
    };
    let handle = extResult.text.toLowerCase();
    handle = handle.replace(this.config.halfADozenRegex, this.config.halfADozenText);
    let numGroup = this.splitMulti(handle, Array.from(this.config.writtenDecimalSeparatorTexts)).filter((s) => s && s.length > 0);
    let intPart = numGroup[0];
    let matchStrs = intPart ? intPart.match(this.textNumberRegex).map((s) => s.toLowerCase()) : new Array();
    let intPartRet = this.getIntValue(matchStrs);
    let pointPartRet = 0;
    if (numGroup.length === 2) {
      let pointPart = numGroup[1];
      let matchStrs2 = pointPart.match(this.textNumberRegex).map((s) => s.toLowerCase());
      pointPartRet += this.getPointValue(matchStrs2);
    }
    result.value = intPartRet + pointPartRet;
    return result;
  }
  powerNumberParse(extResult) {
    let result = {
      start: extResult.start,
      length: extResult.length,
      text: extResult.text,
      type: extResult.type
    };
    let handle = extResult.text.toUpperCase();
    let isE = !extResult.text.includes("^");
    let calStack = new Array();
    let scale = new bignumber.BigNumber(10);
    let dot = false;
    let isNegative = false;
    let tmp = new bignumber.BigNumber(0);
    for (let i = 0; i < handle.length; i++) {
      let ch = handle[i];
      if (ch === "^" || ch === "E") {
        if (isNegative) {
          calStack.push(tmp.negated());
        } else {
          calStack.push(tmp);
        }
        tmp = new bignumber.BigNumber(0);
        scale = new bignumber.BigNumber(10);
        dot = false;
        isNegative = false;
      } else if (ch.charCodeAt(0) - 48 >= 0 && ch.charCodeAt(0) - 48 <= 9) {
        if (dot) {
          tmp = tmp.plus(scale.times(ch.charCodeAt(0) - 48));
          scale = scale.times(0.1);
        } else {
          tmp = tmp.times(scale).plus(ch.charCodeAt(0) - 48);
        }
      } else if (ch === this.config.decimalSeparatorChar) {
        dot = true;
        scale = new bignumber.BigNumber(0.1);
      } else if (ch === "-") {
        isNegative = !isNegative;
      } else if (ch === "+") {
        continue;
      }
      if (i === handle.length - 1) {
        if (isNegative) {
          calStack.push(tmp.negated());
        } else {
          calStack.push(tmp);
        }
      }
    }
    let ret = 0;
    if (isE) {
      ret = calStack.shift().times(Math.pow(10, calStack.shift().toNumber())).toNumber();
    } else {
      ret = Math.pow(calStack.shift().toNumber(), calStack.shift().toNumber());
    }
    result.value = ret;
    result.resolutionStr = ret.toString();
    return result;
  }
  splitMulti(str, tokens) {
    let tempChar = tokens[0];
    for (let i = 0; i < tokens.length; i++) {
      str = str.split(tokens[i]).join(tempChar);
    }
    return str.split(tempChar);
  }
  getMatches(input) {
    let matches = input.match(this.textNumberRegex);
    return (matches || []).map((match) => {
      return match.toLowerCase();
    });
  }
  // Test if big and combine with small.
  // e.g. "hundred" can combine with "thirty" but "twenty" can't combine with "thirty".
  isComposable(big, small) {
    let baseNumber = small > 10 ? 100 : 10;
    if (big % baseNumber === 0 && big / baseNumber >= 1) {
      return true;
    }
    return false;
  }
  getIntValue(matchStrs) {
    let isEnd = new Array(matchStrs.length);
    for (let i = 0; i < isEnd.length; i++) {
      isEnd[i] = false;
    }
    let tempValue = 0;
    let endFlag = 1;
    for (let i = matchStrs.length - 1; i >= 0; i--) {
      if (this.roundNumberSet.has(matchStrs[i])) {
        if (endFlag > this.config.roundNumberMap.get(matchStrs[i])) {
          continue;
        }
        isEnd[i] = true;
        endFlag = this.config.roundNumberMap.get(matchStrs[i]);
      }
    }
    if (endFlag === 1) {
      let tempStack = new Array();
      let oldSym = "";
      matchStrs.forEach((matchStr) => {
        let isCardinal = this.config.cardinalNumberMap.has(matchStr);
        let isOrdinal = this.config.ordinalNumberMap.has(matchStr);
        if (isCardinal || isOrdinal) {
          let matchValue = isCardinal ? this.config.cardinalNumberMap.get(matchStr) : this.config.ordinalNumberMap.get(matchStr);
          if (isOrdinal) {
            let fracPart = this.config.ordinalNumberMap.get(matchStr);
            if (tempStack.length > 0) {
              let intPart = tempStack.pop();
              if (intPart >= fracPart) {
                tempStack.push(intPart + fracPart);
              } else {
                while (tempStack.length > 0) {
                  intPart = intPart + tempStack.pop();
                }
                tempStack.push(intPart * fracPart);
              }
            } else {
              tempStack.push(fracPart);
            }
          } else if (this.config.cardinalNumberMap.has(matchStr)) {
            if (oldSym === "-") {
              let sum = tempStack.pop() + matchValue;
              tempStack.push(sum);
            } else if (oldSym === this.config.writtenIntegerSeparatorTexts[0] || tempStack.length < 2) {
              tempStack.push(matchValue);
            } else if (tempStack.length >= 2) {
              let sum = tempStack.pop() + matchValue;
              sum = tempStack.pop() + sum;
              tempStack.push(sum);
            }
          }
        } else {
          let complexValue = this.config.resolveCompositeNumber(matchStr);
          if (complexValue !== 0) {
            tempStack.push(complexValue);
          }
        }
        oldSym = matchStr;
      });
      tempStack.forEach((stackValue) => {
        tempValue += stackValue;
      });
    } else {
      let lastIndex = 0;
      let mulValue = 1;
      let partValue = 1;
      for (let i = 0; i < isEnd.length; i++) {
        if (isEnd[i]) {
          mulValue = this.config.roundNumberMap.get(matchStrs[i]);
          partValue = 1;
          if (i !== 0) {
            partValue = this.getIntValue(matchStrs.slice(lastIndex, i));
          }
          tempValue += mulValue * partValue;
          lastIndex = i + 1;
        }
      }
      mulValue = 1;
      if (lastIndex !== isEnd.length) {
        partValue = this.getIntValue(matchStrs.slice(lastIndex, isEnd.length));
        tempValue += mulValue * partValue;
      }
    }
    return tempValue;
  }
  getPointValue(matchStrs) {
    let ret = 0;
    let firstMatch = matchStrs[0];
    if (this.config.cardinalNumberMap.has(firstMatch) && this.config.cardinalNumberMap.get(firstMatch) >= 10) {
      let prefix = "0.";
      let tempInt = this.getIntValue(matchStrs);
      let all = prefix + tempInt;
      ret = parseFloat(all);
    } else {
      let scale = new bignumber.BigNumber(0.1);
      for (let i = 0; i < matchStrs.length; i++) {
        ret += scale.times(this.config.cardinalNumberMap.get(matchStrs[i])).toNumber();
        scale = scale.times(0.1);
      }
    }
    return ret;
  }
  skipNonDecimalSeparator(ch, distance, culture) {
    var decimalLength = 3;
    var cultureRegex = recognizersText.RegExpUtility.getSafeRegExp(String.raw`^(en|es|fr)(-)?\b`, "is");
    return ch == this.config.nonDecimalSeparatorChar && !(distance <= decimalLength && cultureRegex.exec(culture.code) !== null);
  }
  getDigitalValue(digitsStr, power) {
    let tmp = new bignumber.BigNumber(0);
    let scale = new bignumber.BigNumber(10);
    let decimalSeparator = false;
    var strLength = digitsStr.length;
    let isNegative = false;
    let isFrac = digitsStr.includes("/");
    let calStack = new Array();
    for (let i = 0; i < digitsStr.length; i++) {
      let ch = digitsStr[i];
      var skippableNonDecimal = this.skipNonDecimalSeparator(ch, strLength - i, this.config.cultureInfo);
      if (!isFrac && (ch === " " || skippableNonDecimal)) {
        continue;
      }
      if (ch === " " || ch === "/") {
        calStack.push(tmp);
        tmp = new bignumber.BigNumber(0);
      } else if (ch >= "0" && ch <= "9") {
        if (decimalSeparator) {
          tmp = tmp.plus(scale.times(ch.charCodeAt(0) - 48));
          scale = scale.times(0.1);
        } else {
          tmp = tmp.times(scale).plus(ch.charCodeAt(0) - 48);
        }
      } else if (ch === this.config.decimalSeparatorChar || !skippableNonDecimal && ch == this.config.nonDecimalSeparatorChar) {
        decimalSeparator = true;
        scale = new bignumber.BigNumber(0.1);
      } else if (ch === "-") {
        isNegative = true;
      }
    }
    calStack.push(tmp);
    let calResult = new bignumber.BigNumber(0);
    if (isFrac) {
      let deno = calStack.pop();
      let mole = calStack.pop();
      calResult = calResult.plus(mole.dividedBy(deno));
    }
    while (calStack.length > 0) {
      calResult = calResult.plus(calStack.pop());
    }
    calResult = calResult.times(power);
    if (isNegative) {
      return calResult.negated().toNumber();
    }
    return calResult.toNumber();
  }
};
var BasePercentageParser = class extends BaseNumberParser {
  parse(extResult) {
    let originText = extResult.text;
    if (extResult.data && extResult.data instanceof Array) {
      extResult.text = extResult.data[0];
      extResult.data = extResult.data[1].data;
    }
    let ret = super.parse(extResult);
    if (ret.resolutionStr && ret.resolutionStr.length > 0) {
      if (!ret.resolutionStr.trim().endsWith("%")) {
        ret.resolutionStr = ret.resolutionStr.trim() + "%";
      }
    }
    ret.data = extResult.text;
    ret.text = originText;
    return ret;
  }
};
var BaseCJKNumberParser = class extends BaseNumberParser {
  constructor(config) {
    super(config);
    this.config = config;
  }
  toString(value) {
    return this.config.cultureInfo ? this.config.cultureInfo.format(value) : value.toString();
  }
  parse(extResult) {
    let extra = "";
    let result;
    extra = extResult.data;
    let getExtResult = {
      start: extResult.start,
      length: extResult.length,
      data: extResult.data,
      text: this.replaceTraditionalWithSimplified(extResult.text),
      type: extResult.type
    };
    if (!extra) {
      return result;
    }
    if (extra.includes("Per")) {
      result = this.perParseCJK(getExtResult);
    } else if (extra.includes("Num")) {
      getExtResult.text = this.replaceFullWithHalf(getExtResult.text);
      result = this.digitNumberParse(getExtResult);
      if (this.config.negativeNumberSignRegex.test(getExtResult.text) && result.value > 0) {
        result.value = -result.value;
      }
      result.resolutionStr = this.toString(result.value);
    } else if (extra.includes("Pow")) {
      getExtResult.text = this.replaceFullWithHalf(getExtResult.text);
      result = this.powerNumberParse(getExtResult);
      result.resolutionStr = this.toString(result.value);
    } else if (extra.includes("Frac")) {
      result = this.fracParseCJK(getExtResult);
    } else if (extra.includes("Dou")) {
      result = this.douParseCJK(getExtResult);
    } else if (extra.includes("Integer")) {
      result = this.intParseCJK(getExtResult);
    } else if (extra.includes("Ordinal")) {
      result = this.ordParseCJK(getExtResult);
    }
    if (result) {
      result.text = extResult.text;
    }
    return result;
  }
  replaceTraditionalWithSimplified(value) {
    if (recognizersText.StringUtility.isNullOrWhitespace(value)) {
      return value;
    }
    if (this.config.tratoSimMap == null) {
      return value;
    }
    let result = "";
    for (let index = 0; index < value.length; index++) {
      result = result.concat(this.config.tratoSimMap.get(value.charAt(index)) || value.charAt(index));
    }
    return result;
  }
  replaceFullWithHalf(value) {
    if (recognizersText.StringUtility.isNullOrWhitespace(value)) {
      return value;
    }
    let result = "";
    for (let index = 0; index < value.length; index++) {
      result = result.concat(this.config.fullToHalfMap.get(value.charAt(index)) || value.charAt(index));
    }
    return result;
  }
  replaceUnit(value) {
    if (recognizersText.StringUtility.isNullOrEmpty(value)) return value;
    let result = value;
    this.config.unitMap.forEach((value2, key) => {
      result = result.replace(new RegExp(key, "g"), value2);
    });
    return result;
  }
  perParseCJK(extResult) {
    let result = new recognizersText.ParseResult(extResult);
    let resultText = extResult.text;
    let power = 1;
    if (extResult.data.includes("Spe")) {
      resultText = this.replaceFullWithHalf(resultText);
      resultText = this.replaceUnit(resultText);
      if (resultText === "\u534A\u984D" || resultText === "\u534A\u6298" || resultText === "\u534A\u6298") {
        result.value = 50;
      } else if (resultText === "10\u6210" || resultText === "10\u5272" || resultText === "\u5341\u5272") {
        result.value = 100;
      } else {
        let matches = recognizersText.RegExpUtility.getMatches(this.config.speGetNumberRegex, resultText);
        let intNumber;
        if (matches.length === 2) {
          let intNumberChar = matches[0].value.charAt(0);
          if (intNumberChar === "\u5BFE" || intNumberChar === "\u5BF9") {
            intNumber = 5;
          } else if (intNumberChar === "\u5341" || intNumberChar === "\u62FE") {
            intNumber = 10;
          } else {
            intNumber = this.config.zeroToNineMap.get(intNumberChar);
          }
          let pointNumberChar = matches[1].value.charAt(0);
          let pointNumber;
          if (pointNumberChar === "\u534A") {
            pointNumber = 0.5;
          } else {
            pointNumber = this.config.zeroToNineMap.get(pointNumberChar) * 0.1;
          }
          result.value = (intNumber + pointNumber) * 10;
        } else if (matches.length === 5) {
          let intNumberChar = matches[0].value.charAt(0);
          let pointNumberChar = matches[1].value.charAt(0);
          let dotNumberChar = matches[3].value.charAt(0);
          let pointNumber = this.config.zeroToNineMap.get(pointNumberChar) * 0.1;
          let dotNumber = this.config.zeroToNineMap.get(dotNumberChar) * 0.01;
          intNumber = this.config.zeroToNineMap.get(intNumberChar);
          result.value = (intNumber + pointNumber + dotNumber) * 10;
        } else {
          let intNumberChar = matches[0].value.charAt(0);
          if (intNumberChar === "\u5BFE" || intNumberChar === "\u5BF9") {
            intNumber = 5;
          } else if (intNumberChar === "\u5341" || intNumberChar === "\u62FE") {
            intNumber = 10;
          } else {
            intNumber = this.config.zeroToNineMap.get(intNumberChar);
          }
          result.value = intNumber * 10;
        }
      }
    } else if (extResult.data.includes("Num")) {
      let doubleMatch = recognizersText.RegExpUtility.getMatches(this.config.percentageRegex, resultText).pop();
      let doubleText = doubleMatch.value;
      if (doubleText.includes("k") || doubleText.includes("K") || doubleText.includes("\uFF4B") || doubleText.includes("\uFF2B")) {
        power = 1e3;
      }
      if (doubleText.includes("M") || doubleText.includes("\uFF2D")) {
        power = 1e6;
      }
      if (doubleText.includes("G") || doubleText.includes("\uFF27")) {
        power = 1e9;
      }
      if (doubleText.includes("T") || doubleText.includes("\uFF34")) {
        power = 1e12;
      }
      result.value = this.getDigitValueCJK(resultText, power);
    } else {
      let doubleMatch = recognizersText.RegExpUtility.getMatches(this.config.percentageRegex, resultText).pop();
      let doubleText = this.replaceUnit(doubleMatch.value);
      let splitResult = recognizersText.RegExpUtility.split(this.config.pointRegex, doubleText);
      if (splitResult[0] === "") {
        splitResult[0] = "\u96F6";
      }
      let doubleValue = this.getIntValueCJK(splitResult[0]);
      if (splitResult.length === 2) {
        if (recognizersText.RegExpUtility.isMatch(this.config.negativeNumberSignRegex, splitResult[0])) {
          doubleValue -= this.getPointValueCJK(splitResult[1]);
        } else {
          doubleValue += this.getPointValueCJK(splitResult[1]);
        }
      }
      result.value = doubleValue;
    }
    result.resolutionStr = this.toString(result.value) + "%";
    return result;
  }
  fracParseCJK(extResult) {
    let result = new recognizersText.ParseResult(extResult);
    let resultText = extResult.text;
    let splitResult = recognizersText.RegExpUtility.split(this.config.fracSplitRegex, resultText);
    let intPart = "";
    let demoPart = "";
    let numPart = "";
    if (splitResult.length === 3) {
      intPart = splitResult[0] || "";
      demoPart = splitResult[1] || "";
      numPart = splitResult[2] || "";
    } else {
      intPart = "\u96F6";
      demoPart = splitResult[0] || "";
      numPart = splitResult[1] || "";
    }
    let intValue = this.isDigitCJK(intPart) ? this.getDigitValueCJK(intPart, 1) : this.getIntValueCJK(intPart);
    let numValue = this.isDigitCJK(numPart) ? this.getDigitValueCJK(numPart, 1) : this.getIntValueCJK(numPart);
    let demoValue = this.isDigitCJK(demoPart) ? this.getDigitValueCJK(demoPart, 1) : this.getIntValueCJK(demoPart);
    if (recognizersText.RegExpUtility.isMatch(this.config.negativeNumberSignRegex, intPart)) {
      result.value = intValue - numValue / demoValue;
    } else {
      result.value = intValue + numValue / demoValue;
    }
    result.resolutionStr = this.toString(result.value);
    return result;
  }
  douParseCJK(extResult) {
    let result = new recognizersText.ParseResult(extResult);
    let resultText = extResult.text;
    if (recognizersText.RegExpUtility.isMatch(this.config.doubleAndRoundRegex, resultText)) {
      resultText = this.replaceUnit(resultText);
      let power = this.config.roundNumberMapChar.get(resultText.charAt(resultText.length - 1));
      result.value = this.getDigitValueCJK(resultText.substr(0, resultText.length - 1), power);
    } else {
      resultText = this.replaceUnit(resultText);
      let splitResult = recognizersText.RegExpUtility.split(this.config.pointRegex, resultText);
      if (splitResult[0] === "") {
        splitResult[0] = "\u96F6";
      }
      if (recognizersText.RegExpUtility.isMatch(this.config.negativeNumberSignRegex, splitResult[0])) {
        result.value = this.getIntValueCJK(splitResult[0]) - this.getPointValueCJK(splitResult[1]);
      } else {
        result.value = this.getIntValueCJK(splitResult[0]) + this.getPointValueCJK(splitResult[1]);
      }
    }
    result.resolutionStr = this.toString(result.value);
    return result;
  }
  intParseCJK(extResult) {
    let result = new recognizersText.ParseResult(extResult);
    result.value = this.getIntValueCJK(extResult.text);
    result.resolutionStr = this.toString(result.value);
    return result;
  }
  ordParseCJK(extResult) {
    let result = new recognizersText.ParseResult(extResult);
    let resultText = extResult.text.substr(1);
    if (recognizersText.RegExpUtility.isMatch(this.config.digitNumRegex, resultText) && !recognizersText.RegExpUtility.isMatch(this.config.roundNumberIntegerRegex, resultText)) {
      result.value = this.getDigitValueCJK(resultText, 1);
    } else {
      result.value = this.getIntValueCJK(resultText);
    }
    result.resolutionStr = this.toString(result.value);
    return result;
  }
  getDigitValueCJK(value, power) {
    let isNegative = false;
    let resultStr = value;
    if (recognizersText.RegExpUtility.isMatch(this.config.negativeNumberSignRegex, resultStr)) {
      isNegative = true;
      resultStr = resultStr.substr(1);
    }
    resultStr = this.replaceFullWithHalf(resultStr);
    let result = this.getDigitalValue(resultStr, power);
    if (isNegative) {
      result = -result;
    }
    return result;
  }
  getIntValueCJK(value) {
    let resultStr = value;
    let isDozen = false;
    let isPair = false;
    if (recognizersText.RegExpUtility.isMatch(this.config.dozenRegex, resultStr)) {
      isDozen = true;
      if (this.config.cultureInfo.code.toLowerCase() === Culture.Chinese) {
        resultStr = resultStr.substr(0, resultStr.length - 1);
      } else if (this.config.cultureInfo.code.toLowerCase() === Culture.Japanese) {
        resultStr = resultStr.substr(0, resultStr.length - 3);
      }
    } else if (recognizersText.RegExpUtility.isMatch(this.config.pairRegex, resultStr)) {
      isPair = true;
      resultStr = resultStr.substr(0, resultStr.length - 1);
    }
    resultStr = this.replaceUnit(resultStr);
    let intValue = 0;
    let partValue = 0;
    let beforeValue = 0;
    let isRoundBefore = false;
    let roundBefore = -1;
    let roundDefault = 1;
    let isNegative = false;
    let hasNumber = false;
    if (recognizersText.RegExpUtility.isMatch(this.config.negativeNumberSignRegex, resultStr)) {
      isNegative = true;
      resultStr = resultStr.substr(1);
    }
    for (let index = 0; index < resultStr.length; index++) {
      let currentChar = resultStr.charAt(index);
      if (this.config.roundNumberMapChar.has(currentChar)) {
        let roundRecent = this.config.roundNumberMapChar.get(currentChar);
        if (!hasNumber) {
          beforeValue = 1;
        }
        if (roundBefore !== -1 && roundRecent > roundBefore) {
          if (isRoundBefore) {
            intValue += partValue * roundRecent;
            isRoundBefore = false;
          } else {
            partValue += beforeValue * roundDefault;
            intValue += partValue * roundRecent;
          }
          roundBefore = -1;
          partValue = 0;
        } else {
          isRoundBefore = true;
          partValue += beforeValue * roundRecent;
          roundBefore = roundRecent;
          if (index === resultStr.length - 1 || this.config.roundDirectList.some((o) => o === currentChar)) {
            intValue += partValue;
            partValue = 0;
          }
        }
        hasNumber = false;
        beforeValue = 0;
        roundDefault = roundRecent / 10;
      } else if (this.config.zeroToNineMap.has(currentChar)) {
        hasNumber = true;
        if (index !== resultStr.length - 1) {
          if (currentChar === "\u96F6" && !this.config.roundNumberMapChar.has(resultStr.charAt(index + 1))) {
            roundDefault = 1;
          } else {
            beforeValue = beforeValue * 10 + this.config.zeroToNineMap.get(currentChar);
            isRoundBefore = false;
          }
        } else {
          if (index === resultStr.length - 1 && this.config.cultureInfo.code.toLowerCase() === Culture.Japanese) {
            roundDefault = 1;
          }
          partValue += beforeValue * 10;
          partValue += this.config.zeroToNineMap.get(currentChar) * roundDefault;
          intValue += partValue;
          partValue = 0;
        }
      }
    }
    if (isNegative) {
      intValue = -intValue;
    }
    if (isDozen) {
      intValue = intValue * 12;
    }
    if (isPair) {
      intValue = intValue * 2;
    }
    return intValue;
  }
  getPointValueCJK(value) {
    let result = 0;
    let scale = 0.1;
    for (let index = 0; index < value.length; index++) {
      result += scale * this.config.zeroToNineMap.get(value.charAt(index));
      scale *= 0.1;
    }
    return result;
  }
  isDigitCJK(value) {
    return !recognizersText.StringUtility.isNullOrEmpty(value) && recognizersText.RegExpUtility.isMatch(this.config.digitNumRegex, value);
  }
};

// recognizers/recognizers-number/src/number/agnosticNumberParser.ts
var AgnosticNumberParserType = /* @__PURE__ */ ((AgnosticNumberParserType2) => {
  AgnosticNumberParserType2[AgnosticNumberParserType2["Cardinal"] = 0] = "Cardinal";
  AgnosticNumberParserType2[AgnosticNumberParserType2["Double"] = 1] = "Double";
  AgnosticNumberParserType2[AgnosticNumberParserType2["Fraction"] = 2] = "Fraction";
  AgnosticNumberParserType2[AgnosticNumberParserType2["Integer"] = 3] = "Integer";
  AgnosticNumberParserType2[AgnosticNumberParserType2["Number"] = 4] = "Number";
  AgnosticNumberParserType2[AgnosticNumberParserType2["Ordinal"] = 5] = "Ordinal";
  AgnosticNumberParserType2[AgnosticNumberParserType2["Percentage"] = 6] = "Percentage";
  return AgnosticNumberParserType2;
})(AgnosticNumberParserType || {});
var AgnosticNumberParserFactory = class {
  static getParser(type, languageConfiguration) {
    let isChinese = languageConfiguration.cultureInfo.code.toLowerCase() === Culture.Chinese;
    let isJapanese = languageConfiguration.cultureInfo.code.toLowerCase() === Culture.Japanese;
    let parser;
    if (isChinese) {
      parser = new BaseCJKNumberParser(languageConfiguration);
    } else if (isJapanese) {
      parser = new BaseCJKNumberParser(languageConfiguration);
    } else {
      parser = new BaseNumberParser(languageConfiguration);
    }
    switch (type) {
      case 0 /* Cardinal */:
        parser.supportedTypes = [Constants.SYS_NUM_CARDINAL, Constants.SYS_NUM_INTEGER, Constants.SYS_NUM_DOUBLE];
        break;
      case 1 /* Double */:
        parser.supportedTypes = [Constants.SYS_NUM_DOUBLE];
        break;
      case 2 /* Fraction */:
        parser.supportedTypes = [Constants.SYS_NUM_FRACTION];
        break;
      case 3 /* Integer */:
        parser.supportedTypes = [Constants.SYS_NUM_INTEGER];
        break;
      case 5 /* Ordinal */:
        parser.supportedTypes = [Constants.SYS_NUM_ORDINAL];
        break;
      case 6 /* Percentage */:
        if (!isChinese && !isJapanese) {
          parser = new BasePercentageParser(languageConfiguration);
        }
        break;
    }
    return parser;
  }
};

// recognizers/recognizers-number/src/resources/baseNumbers.ts
exports.BaseNumbers = void 0;
((BaseNumbers2) => {
  BaseNumbers2.NumberReplaceToken = "@builtin.num";
  BaseNumbers2.FractionNumberReplaceToken = "@builtin.num.fraction";
  BaseNumbers2.IntegerRegexDefinition = (placeholder, thousandsmark) => {
    return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!(\\d+\\.|\\d+,))))\\d{1,3}(${thousandsmark}\\d{3})+(?=${placeholder})`;
  };
  BaseNumbers2.DoubleRegexDefinition = (placeholder, thousandsmark, decimalmark) => {
    return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\.|\\d+,)))\\d{1,3}(${thousandsmark}\\d{3})+${decimalmark}\\d+(?=${placeholder})`;
  };
  BaseNumbers2.PlaceHolderDefault = "\\D|\\b";
})(exports.BaseNumbers || (exports.BaseNumbers = {}));

// recognizers/recognizers-number/src/resources/englishNumeric.ts
exports.EnglishNumeric = void 0;
((EnglishNumeric2) => {
  EnglishNumeric2.LangMarker = "Eng";
  EnglishNumeric2.RoundNumberIntegerRegex = `(hundred|thousand|million|billion|trillion)`;
  EnglishNumeric2.ZeroToNineIntegerRegex = `(three|seven|eight|four|five|zero|nine|one|two|six)`;
  EnglishNumeric2.NegativeNumberTermsRegex = `((minus|negative)\\s+)`;
  EnglishNumeric2.NegativeNumberSignRegex = `^${EnglishNumeric2.NegativeNumberTermsRegex}.*`;
  EnglishNumeric2.AnIntRegex = `(an|a)(?=\\s)`;
  EnglishNumeric2.TenToNineteenIntegerRegex = `(seventeen|thirteen|fourteen|eighteen|nineteen|fifteen|sixteen|eleven|twelve|ten)`;
  EnglishNumeric2.TensNumberIntegerRegex = `(seventy|twenty|thirty|eighty|ninety|forty|fifty|sixty)`;
  EnglishNumeric2.SeparaIntRegex = `(((${EnglishNumeric2.TenToNineteenIntegerRegex}|(${EnglishNumeric2.TensNumberIntegerRegex}(\\s+(and\\s+)?|\\s*-\\s*)${EnglishNumeric2.ZeroToNineIntegerRegex})|${EnglishNumeric2.TensNumberIntegerRegex}|${EnglishNumeric2.ZeroToNineIntegerRegex})(\\s+${EnglishNumeric2.RoundNumberIntegerRegex})*))|((${EnglishNumeric2.AnIntRegex}(\\s+${EnglishNumeric2.RoundNumberIntegerRegex})+))`;
  EnglishNumeric2.AllIntRegex = `((((${EnglishNumeric2.TenToNineteenIntegerRegex}|(${EnglishNumeric2.TensNumberIntegerRegex}(\\s+(and\\s+)?|\\s*-\\s*)${EnglishNumeric2.ZeroToNineIntegerRegex})|${EnglishNumeric2.TensNumberIntegerRegex}|${EnglishNumeric2.ZeroToNineIntegerRegex}|${EnglishNumeric2.AnIntRegex})(\\s+${EnglishNumeric2.RoundNumberIntegerRegex})+)\\s+(and\\s+)?)*${EnglishNumeric2.SeparaIntRegex})`;
  EnglishNumeric2.PlaceHolderPureNumber = `\\b`;
  EnglishNumeric2.PlaceHolderDefault = `\\D|\\b`;
  EnglishNumeric2.NumbersWithPlaceHolder = (placeholder) => {
    return `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+(?!([\\.,]\\d+[a-zA-Z]))(?=${placeholder})`;
  };
  EnglishNumeric2.NumbersWithSuffix = `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+\\s*(K|k|M|T|G)(?=\\b)`;
  EnglishNumeric2.RoundNumberIntegerRegexWithLocks = `(?<=\\b)\\d+\\s+${EnglishNumeric2.RoundNumberIntegerRegex}(?=\\b)`;
  EnglishNumeric2.NumbersWithDozenSuffix = `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+\\s+dozen(s)?(?=\\b)`;
  EnglishNumeric2.AllIntRegexWithLocks = `((?<=\\b)${EnglishNumeric2.AllIntRegex}(?=\\b))`;
  EnglishNumeric2.AllIntRegexWithDozenSuffixLocks = `(?<=\\b)(((half\\s+)?a\\s+dozen)|(${EnglishNumeric2.AllIntRegex}\\s+dozen(s)?))(?=\\b)`;
  EnglishNumeric2.RoundNumberOrdinalRegex = `(hundredth|thousandth|millionth|billionth|trillionth)`;
  EnglishNumeric2.BasicOrdinalRegex = `(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|thirtieth|fortieth|fiftieth|sixtieth|seventieth|eightieth|ninetieth)`;
  EnglishNumeric2.SuffixBasicOrdinalRegex = `(((((${EnglishNumeric2.TensNumberIntegerRegex}(\\s+(and\\s+)?|\\s*-\\s*)${EnglishNumeric2.ZeroToNineIntegerRegex})|${EnglishNumeric2.TensNumberIntegerRegex}|${EnglishNumeric2.ZeroToNineIntegerRegex}|${EnglishNumeric2.AnIntRegex})(\\s+${EnglishNumeric2.RoundNumberIntegerRegex})+)\\s+(and\\s+)?)*(${EnglishNumeric2.TensNumberIntegerRegex}(\\s+|\\s*-\\s*))?${EnglishNumeric2.BasicOrdinalRegex})`;
  EnglishNumeric2.SuffixRoundNumberOrdinalRegex = `((${EnglishNumeric2.AllIntRegex}\\s+)${EnglishNumeric2.RoundNumberOrdinalRegex})`;
  EnglishNumeric2.AllOrdinalRegex = `(${EnglishNumeric2.SuffixBasicOrdinalRegex}|${EnglishNumeric2.SuffixRoundNumberOrdinalRegex})`;
  EnglishNumeric2.OrdinalSuffixRegex = `(?<=\\b)((\\d*(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|0th))|(11th|12th))(?=\\b)`;
  EnglishNumeric2.OrdinalNumericRegex = `(?<=\\b)(\\d{1,3}(\\s*,\\s*\\d{3})*\\s*th)(?=\\b)`;
  EnglishNumeric2.OrdinalRoundNumberRegex = `(?<!(a|an)\\s+)${EnglishNumeric2.RoundNumberOrdinalRegex}`;
  EnglishNumeric2.OrdinalEnglishRegex = `(?<=\\b)${EnglishNumeric2.AllOrdinalRegex}(?=\\b)`;
  EnglishNumeric2.FractionNotationWithSpacesRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+\\d+[/]\\d+(?=(\\b[^/]|$))`;
  EnglishNumeric2.FractionNotationRegex = `(((?<=\\W|^)-\\s*)|(?<![/-])(?<=\\b))\\d+[/]\\d+(?=(\\b[^/]|$))`;
  EnglishNumeric2.FractionNounRegex = `(?<=\\b)(${EnglishNumeric2.AllIntRegex}\\s+(and\\s+)?)?(${EnglishNumeric2.AllIntRegex})(\\s+|\\s*-\\s*)(((${EnglishNumeric2.AllOrdinalRegex})|(${EnglishNumeric2.RoundNumberOrdinalRegex}))s|halves|quarters)(?=\\b)`;
  EnglishNumeric2.FractionNounWithArticleRegex = `(?<=\\b)(${EnglishNumeric2.AllIntRegex}\\s+(and\\s+)?)?(a|an|one)(\\s+|\\s*-\\s*)(?!\\bfirst\\b|\\bsecond\\b)((${EnglishNumeric2.AllOrdinalRegex})|(${EnglishNumeric2.RoundNumberOrdinalRegex})|half|quarter)(?=\\b)`;
  EnglishNumeric2.FractionPrepositionRegex = `(?<=\\b)(?<numerator>(${EnglishNumeric2.AllIntRegex})|((?<![\\.,])\\d+))\\s+(over|in|out\\s+of)\\s+(?<denominator>(${EnglishNumeric2.AllIntRegex})|(\\d+)(?![\\.,]))(?=\\b)`;
  EnglishNumeric2.FractionPrepositionWithinPercentModeRegex = `(?<=\\b)(?<numerator>(${EnglishNumeric2.AllIntRegex})|((?<![\\.,])\\d+))\\s+over\\s+(?<denominator>(${EnglishNumeric2.AllIntRegex})|(\\d+)(?![\\.,]))(?=\\b)`;
  EnglishNumeric2.AllPointRegex = `((\\s+${EnglishNumeric2.ZeroToNineIntegerRegex})+|(\\s+${EnglishNumeric2.SeparaIntRegex}))`;
  EnglishNumeric2.AllFloatRegex = `${EnglishNumeric2.AllIntRegex}(\\s+point)${EnglishNumeric2.AllPointRegex}`;
  EnglishNumeric2.DoubleWithMultiplierRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))\\d+[\\.,]\\d+\\s*(K|k|M|G|T|B|b)(?=\\b)`;
  EnglishNumeric2.DoubleExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))(\\d+([\\.,]\\d+)?)e([+-]*[1-9]\\d*)(?=\\b)`;
  EnglishNumeric2.DoubleCaretExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))(\\d+([\\.,]\\d+)?)\\^([+-]*[1-9]\\d*)(?=\\b)`;
  EnglishNumeric2.DoubleDecimalPointRegex = (placeholder) => {
    return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))\\d+[\\.,]\\d+(?!([\\.,]\\d+))(?=${placeholder})`;
  };
  EnglishNumeric2.DoubleWithoutIntegralRegex = (placeholder) => {
    return `(?<=\\s|^)(?<!(\\d+))[\\.,]\\d+(?!([\\.,]\\d+))(?=${placeholder})`;
  };
  EnglishNumeric2.DoubleWithRoundNumber = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))\\d+[\\.,]\\d+\\s+${EnglishNumeric2.RoundNumberIntegerRegex}(?=\\b)`;
  EnglishNumeric2.DoubleAllFloatRegex = `((?<=\\b)${EnglishNumeric2.AllFloatRegex}(?=\\b))`;
  EnglishNumeric2.CurrencyRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(B|b|m|t|g)(?=\\b)`;
  EnglishNumeric2.ConnectorRegex = `(?<spacer>and)`;
  EnglishNumeric2.NumberWithSuffixPercentage = `(?<!%)(${exports.BaseNumbers.NumberReplaceToken})(\\s*)(%(?!${exports.BaseNumbers.NumberReplaceToken})|(per cents|per cent|cents|cent|percentage|percents|percent)\\b)`;
  EnglishNumeric2.FractionNumberWithSuffixPercentage = `((${exports.BaseNumbers.FractionNumberReplaceToken})\\s+of)`;
  EnglishNumeric2.NumberWithPrefixPercentage = `(per cent of|percent of|percents of)(\\s*)(${exports.BaseNumbers.NumberReplaceToken})`;
  EnglishNumeric2.NumberWithPrepositionPercentage = `(${exports.BaseNumbers.NumberReplaceToken})\\s*(in|out\\s+of)\\s*(${exports.BaseNumbers.NumberReplaceToken})`;
  EnglishNumeric2.TillRegex = `(to|through|--|-|\u2014|\u2014\u2014|~|\u2013)`;
  EnglishNumeric2.MoreRegex = `((bigger|greater|more|higher|larger)(\\s+than)?|above|over|(?<!<|=)>)`;
  EnglishNumeric2.LessRegex = `((less|lower|smaller|fewer)(\\s+than)?|below|under|(?<!>|=)<)`;
  EnglishNumeric2.EqualRegex = `(equal(s|ing)?(\\s+(to|than))?|(?<!<|>)=)`;
  EnglishNumeric2.MoreOrEqualPrefix = `((no\\s+${EnglishNumeric2.LessRegex})|(at\\s+least))`;
  EnglishNumeric2.MoreOrEqual = `((${EnglishNumeric2.MoreRegex}\\s+(or)?\\s+${EnglishNumeric2.EqualRegex})|(${EnglishNumeric2.EqualRegex}\\s+(or)?\\s+${EnglishNumeric2.MoreRegex})|${EnglishNumeric2.MoreOrEqualPrefix}(\\s+(or)?\\s+${EnglishNumeric2.EqualRegex})?|(${EnglishNumeric2.EqualRegex}\\s+(or)?\\s+)?${EnglishNumeric2.MoreOrEqualPrefix}|>\\s*=)`;
  EnglishNumeric2.MoreOrEqualSuffix = `((and|or)\\s+(more|greater|higher|larger|bigger)((?!\\s+than)|(\\s+than(?!(\\s*\\d+)))))`;
  EnglishNumeric2.LessOrEqualPrefix = `((no\\s+${EnglishNumeric2.MoreRegex})|(at\\s+most))`;
  EnglishNumeric2.LessOrEqual = `((${EnglishNumeric2.LessRegex}\\s+(or)?\\s+${EnglishNumeric2.EqualRegex})|(${EnglishNumeric2.EqualRegex}\\s+(or)?\\s+${EnglishNumeric2.LessRegex})|${EnglishNumeric2.LessOrEqualPrefix}(\\s+(or)?\\s+${EnglishNumeric2.EqualRegex})?|(${EnglishNumeric2.EqualRegex}\\s+(or)?\\s+)?${EnglishNumeric2.LessOrEqualPrefix}|<\\s*=)`;
  EnglishNumeric2.LessOrEqualSuffix = `((and|or)\\s+(less|lower|smaller|fewer)((?!\\s+than)|(\\s+than(?!(\\s*\\d+)))))`;
  EnglishNumeric2.NumberSplitMark = `(?![,.](?!\\d+))`;
  EnglishNumeric2.MoreRegexNoNumberSucceed = `((bigger|greater|more|higher|larger)((?!\\s+than)|\\s+(than(?!(\\s*\\d+))))|(above|over)(?!(\\s*\\d+)))`;
  EnglishNumeric2.LessRegexNoNumberSucceed = `((less|lower|smaller|fewer)((?!\\s+than)|\\s+(than(?!(\\s*\\d+))))|(below|under)(?!(\\s*\\d+)))`;
  EnglishNumeric2.EqualRegexNoNumberSucceed = `(equal(s|ing)?((?!\\s+(to|than))|(\\s+(to|than)(?!(\\s*\\d+)))))`;
  EnglishNumeric2.OneNumberRangeMoreRegex1 = `(${EnglishNumeric2.MoreOrEqual}|${EnglishNumeric2.MoreRegex})\\s*(the\\s+)?(?<number1>(${EnglishNumeric2.NumberSplitMark}.)+)`;
  EnglishNumeric2.OneNumberRangeMoreRegex2 = `(?<number1>(${EnglishNumeric2.NumberSplitMark}.)+)\\s*${EnglishNumeric2.MoreOrEqualSuffix}`;
  EnglishNumeric2.OneNumberRangeMoreSeparateRegex = `(${EnglishNumeric2.EqualRegex}\\s+(?<number1>(${EnglishNumeric2.NumberSplitMark}.)+)(\\s+or\\s+)${EnglishNumeric2.MoreRegexNoNumberSucceed})|(${EnglishNumeric2.MoreRegex}\\s+(?<number1>(${EnglishNumeric2.NumberSplitMark}.)+)(\\s+or\\s+)${EnglishNumeric2.EqualRegexNoNumberSucceed})`;
  EnglishNumeric2.OneNumberRangeLessRegex1 = `(${EnglishNumeric2.LessOrEqual}|${EnglishNumeric2.LessRegex})\\s*(the\\s+)?(?<number2>(${EnglishNumeric2.NumberSplitMark}.)+)`;
  EnglishNumeric2.OneNumberRangeLessRegex2 = `(?<number2>(${EnglishNumeric2.NumberSplitMark}.)+)\\s*${EnglishNumeric2.LessOrEqualSuffix}`;
  EnglishNumeric2.OneNumberRangeLessSeparateRegex = `(${EnglishNumeric2.EqualRegex}\\s+(?<number1>(${EnglishNumeric2.NumberSplitMark}.)+)(\\s+or\\s+)${EnglishNumeric2.LessRegexNoNumberSucceed})|(${EnglishNumeric2.LessRegex}\\s+(?<number1>(${EnglishNumeric2.NumberSplitMark}.)+)(\\s+or\\s+)${EnglishNumeric2.EqualRegexNoNumberSucceed})`;
  EnglishNumeric2.OneNumberRangeEqualRegex = `${EnglishNumeric2.EqualRegex}\\s*(the\\s+)?(?<number1>(${EnglishNumeric2.NumberSplitMark}.)+)`;
  EnglishNumeric2.TwoNumberRangeRegex1 = `between\\s*(the\\s+)?(?<number1>(${EnglishNumeric2.NumberSplitMark}.)+)\\s*and\\s*(the\\s+)?(?<number2>(${EnglishNumeric2.NumberSplitMark}.)+)`;
  EnglishNumeric2.TwoNumberRangeRegex2 = `(${EnglishNumeric2.OneNumberRangeMoreRegex1}|${EnglishNumeric2.OneNumberRangeMoreRegex2})\\s*(and|but|,)\\s*(${EnglishNumeric2.OneNumberRangeLessRegex1}|${EnglishNumeric2.OneNumberRangeLessRegex2})`;
  EnglishNumeric2.TwoNumberRangeRegex3 = `(${EnglishNumeric2.OneNumberRangeLessRegex1}|${EnglishNumeric2.OneNumberRangeLessRegex2})\\s*(and|but|,)\\s*(${EnglishNumeric2.OneNumberRangeMoreRegex1}|${EnglishNumeric2.OneNumberRangeMoreRegex2})`;
  EnglishNumeric2.TwoNumberRangeRegex4 = `(from\\s+)?(?<number1>(${EnglishNumeric2.NumberSplitMark}(?!\\bfrom\\b).)+)\\s*${EnglishNumeric2.TillRegex}\\s*(the\\s+)?(?<number2>(${EnglishNumeric2.NumberSplitMark}.)+)`;
  EnglishNumeric2.AmbiguousFractionConnectorsRegex = `(\\bin\\b)`;
  EnglishNumeric2.DecimalSeparatorChar = ".";
  EnglishNumeric2.FractionMarkerToken = "over";
  EnglishNumeric2.NonDecimalSeparatorChar = ",";
  EnglishNumeric2.HalfADozenText = "six";
  EnglishNumeric2.WordSeparatorToken = "and";
  EnglishNumeric2.WrittenDecimalSeparatorTexts = ["point"];
  EnglishNumeric2.WrittenGroupSeparatorTexts = ["punto"];
  EnglishNumeric2.WrittenIntegerSeparatorTexts = ["and"];
  EnglishNumeric2.WrittenFractionSeparatorTexts = ["and"];
  EnglishNumeric2.HalfADozenRegex = `half\\s+a\\s+dozen`;
  EnglishNumeric2.DigitalNumberRegex = `((?<=\\b)(hundred|thousand|million|billion|trillion|dozen(s)?)(?=\\b))|((?<=(\\d|\\b))(k|t|m|g|b)(?=\\b))`;
  EnglishNumeric2.CardinalNumberMap = /* @__PURE__ */ new Map([["a", 1], ["zero", 0], ["an", 1], ["one", 1], ["two", 2], ["three", 3], ["four", 4], ["five", 5], ["six", 6], ["seven", 7], ["eight", 8], ["nine", 9], ["ten", 10], ["eleven", 11], ["twelve", 12], ["dozen", 12], ["dozens", 12], ["thirteen", 13], ["fourteen", 14], ["fifteen", 15], ["sixteen", 16], ["seventeen", 17], ["eighteen", 18], ["nineteen", 19], ["twenty", 20], ["thirty", 30], ["forty", 40], ["fifty", 50], ["sixty", 60], ["seventy", 70], ["eighty", 80], ["ninety", 90], ["hundred", 100], ["thousand", 1e3], ["million", 1e6], ["billion", 1e9], ["trillion", 1e12]]);
  EnglishNumeric2.OrdinalNumberMap = /* @__PURE__ */ new Map([["first", 1], ["second", 2], ["secondary", 2], ["half", 2], ["third", 3], ["fourth", 4], ["quarter", 4], ["fifth", 5], ["sixth", 6], ["seventh", 7], ["eighth", 8], ["ninth", 9], ["tenth", 10], ["eleventh", 11], ["twelfth", 12], ["thirteenth", 13], ["fourteenth", 14], ["fifteenth", 15], ["sixteenth", 16], ["seventeenth", 17], ["eighteenth", 18], ["nineteenth", 19], ["twentieth", 20], ["thirtieth", 30], ["fortieth", 40], ["fiftieth", 50], ["sixtieth", 60], ["seventieth", 70], ["eightieth", 80], ["ninetieth", 90], ["hundredth", 100], ["thousandth", 1e3], ["millionth", 1e6], ["billionth", 1e9], ["trillionth", 1e12], ["firsts", 1], ["halves", 2], ["thirds", 3], ["fourths", 4], ["quarters", 4], ["fifths", 5], ["sixths", 6], ["sevenths", 7], ["eighths", 8], ["ninths", 9], ["tenths", 10], ["elevenths", 11], ["twelfths", 12], ["thirteenths", 13], ["fourteenths", 14], ["fifteenths", 15], ["sixteenths", 16], ["seventeenths", 17], ["eighteenths", 18], ["nineteenths", 19], ["twentieths", 20], ["thirtieths", 30], ["fortieths", 40], ["fiftieths", 50], ["sixtieths", 60], ["seventieths", 70], ["eightieths", 80], ["ninetieths", 90], ["hundredths", 100], ["thousandths", 1e3], ["millionths", 1e6], ["billionths", 1e9], ["trillionths", 1e12]]);
  EnglishNumeric2.RoundNumberMap = /* @__PURE__ */ new Map([["hundred", 100], ["thousand", 1e3], ["million", 1e6], ["billion", 1e9], ["trillion", 1e12], ["hundredth", 100], ["thousandth", 1e3], ["millionth", 1e6], ["billionth", 1e9], ["trillionth", 1e12], ["hundredths", 100], ["thousandths", 1e3], ["millionths", 1e6], ["billionths", 1e9], ["trillionths", 1e12], ["dozen", 12], ["dozens", 12], ["k", 1e3], ["m", 1e6], ["g", 1e9], ["b", 1e9], ["t", 1e12]]);
  EnglishNumeric2.AmbiguityFiltersDict = /* @__PURE__ */ new Map([["\\bone\\b", "\\b(the|this|that|which)\\s+(one)\\b"]]);
})(exports.EnglishNumeric || (exports.EnglishNumeric = {}));
var EnglishNumberParserConfiguration = class {
  constructor(ci) {
    if (!ci) {
      ci = new CultureInfo(Culture.English);
    }
    this.cultureInfo = ci;
    this.langMarker = exports.EnglishNumeric.LangMarker;
    this.decimalSeparatorChar = exports.EnglishNumeric.DecimalSeparatorChar;
    this.fractionMarkerToken = exports.EnglishNumeric.FractionMarkerToken;
    this.nonDecimalSeparatorChar = exports.EnglishNumeric.NonDecimalSeparatorChar;
    this.halfADozenText = exports.EnglishNumeric.HalfADozenText;
    this.wordSeparatorToken = exports.EnglishNumeric.WordSeparatorToken;
    this.writtenDecimalSeparatorTexts = exports.EnglishNumeric.WrittenDecimalSeparatorTexts;
    this.writtenGroupSeparatorTexts = exports.EnglishNumeric.WrittenGroupSeparatorTexts;
    this.writtenIntegerSeparatorTexts = exports.EnglishNumeric.WrittenIntegerSeparatorTexts;
    this.writtenFractionSeparatorTexts = exports.EnglishNumeric.WrittenFractionSeparatorTexts;
    this.cardinalNumberMap = exports.EnglishNumeric.CardinalNumberMap;
    this.ordinalNumberMap = exports.EnglishNumeric.OrdinalNumberMap;
    this.roundNumberMap = exports.EnglishNumeric.RoundNumberMap;
    this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.NegativeNumberSignRegex, "is");
    this.halfADozenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.HalfADozenRegex, "gis");
    this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.DigitalNumberRegex, "gis");
  }
  normalizeTokenSet(tokens, context) {
    let fracWords = new Array();
    let tokenList = Array.from(tokens);
    let tokenLen = tokenList.length;
    for (let i = 0; i < tokenLen; i++) {
      if (tokenList[i].includes("-")) {
        let spiltedTokens = tokenList[i].split("-");
        if (spiltedTokens.length === 2 && this.ordinalNumberMap.has(spiltedTokens[1])) {
          fracWords.push(spiltedTokens[0]);
          fracWords.push(spiltedTokens[1]);
        } else {
          fracWords.push(tokenList[i]);
        }
      } else if (i < tokenLen - 2 && tokenList[i + 1] === "-") {
        if (this.ordinalNumberMap.has(tokenList[i + 2])) {
          fracWords.push(tokenList[i]);
          fracWords.push(tokenList[i + 2]);
        } else {
          fracWords.push(tokenList[i] + tokenList[i + 1] + tokenList[i + 2]);
        }
        i += 2;
      } else {
        fracWords.push(tokenList[i]);
      }
    }
    return fracWords;
  }
  resolveCompositeNumber(numberStr) {
    if (numberStr.includes("-")) {
      let numbers = numberStr.split("-");
      let ret = 0;
      numbers.forEach((num) => {
        if (this.ordinalNumberMap.has(num)) {
          ret += this.ordinalNumberMap.get(num);
        } else if (this.cardinalNumberMap.has(num)) {
          ret += this.cardinalNumberMap.get(num);
        }
      });
      return ret;
    }
    if (this.ordinalNumberMap.has(numberStr)) {
      return this.ordinalNumberMap.get(numberStr);
    }
    if (this.cardinalNumberMap.has(numberStr)) {
      return this.cardinalNumberMap.get(numberStr);
    }
    return 0;
  }
};

// recognizers/recognizers-number/src/resources/spanishNumeric.ts
exports.SpanishNumeric = void 0;
((SpanishNumeric2) => {
  SpanishNumeric2.LangMarker = "Spa";
  SpanishNumeric2.HundredsNumberIntegerRegex = `(cuatrocient[ao]s|trescient[ao]s|seiscient[ao]s|setecient[ao]s|ochocient[ao]s|novecient[ao]s|doscient[ao]s|quinient[ao]s|(?<!por\\s+)(cien(to)?))`;
  SpanishNumeric2.RoundNumberIntegerRegex = `(mil millones|mil|millones|mill[o\xF3]n|billones|bill[o\xF3]n|trillones|trill[o\xF3]n|cuatrillones|cuatrill[o\xF3]n|quintillones|quintill[o\xF3]n|sextillones|sextill[o\xF3]n|septillones|septill[o\xF3]n)`;
  SpanishNumeric2.ZeroToNineIntegerRegex = `(cuatro|cinco|siete|nueve|cero|tres|seis|ocho|dos|un[ao]?)`;
  SpanishNumeric2.TenToNineteenIntegerRegex = `(diecisiete|diecinueve|diecis[e\xE9]is|dieciocho|catorce|quince|trece|diez|once|doce)`;
  SpanishNumeric2.TwentiesIntegerRegex = `(veinticuatro|veinticinco|veintisiete|veintinueve|veintitr[e\xE9]s|veintis[e\xE9]is|veintiocho|veintid[o\xF3]s|ventiun[ao]|veinti[u\xFA]n[oa]?|veinte)`;
  SpanishNumeric2.TensNumberIntegerRegex = `(cincuenta|cuarenta|treinta|sesenta|setenta|ochenta|noventa)`;
  SpanishNumeric2.NegativeNumberTermsRegex = `^[.]`;
  SpanishNumeric2.NegativeNumberSignRegex = `^(${SpanishNumeric2.NegativeNumberTermsRegex}\\s+).*`;
  SpanishNumeric2.DigitsNumberRegex = `\\d|\\d{1,3}(\\.\\d{3})`;
  SpanishNumeric2.BelowHundredsRegex = `((${SpanishNumeric2.TenToNineteenIntegerRegex}|${SpanishNumeric2.TwentiesIntegerRegex}|(${SpanishNumeric2.TensNumberIntegerRegex}(\\s+y\\s+${SpanishNumeric2.ZeroToNineIntegerRegex})?))|${SpanishNumeric2.ZeroToNineIntegerRegex})`;
  SpanishNumeric2.BelowThousandsRegex = `(${SpanishNumeric2.HundredsNumberIntegerRegex}(\\s+${SpanishNumeric2.BelowHundredsRegex})?|${SpanishNumeric2.BelowHundredsRegex})`;
  SpanishNumeric2.SupportThousandsRegex = `((${SpanishNumeric2.BelowThousandsRegex}|${SpanishNumeric2.BelowHundredsRegex})\\s+${SpanishNumeric2.RoundNumberIntegerRegex}(\\s+${SpanishNumeric2.RoundNumberIntegerRegex})?)`;
  SpanishNumeric2.SeparaIntRegex = `(${SpanishNumeric2.SupportThousandsRegex}(\\s+${SpanishNumeric2.SupportThousandsRegex})*(\\s+${SpanishNumeric2.BelowThousandsRegex})?|${SpanishNumeric2.BelowThousandsRegex})`;
  SpanishNumeric2.AllIntRegex = `(${SpanishNumeric2.SeparaIntRegex}|mil(\\s+${SpanishNumeric2.BelowThousandsRegex})?)`;
  SpanishNumeric2.PlaceHolderPureNumber = `\\b`;
  SpanishNumeric2.PlaceHolderDefault = `\\D|\\b`;
  SpanishNumeric2.NumbersWithPlaceHolder = (placeholder) => {
    return `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+(?!([\\.,]\\d+[a-zA-Z]))(?=${placeholder})`;
  };
  SpanishNumeric2.NumbersWithSuffix = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(k|M|T|G)(?=\\b)`;
  SpanishNumeric2.RoundNumberIntegerRegexWithLocks = `(?<=\\b)(${SpanishNumeric2.DigitsNumberRegex})+\\s+${SpanishNumeric2.RoundNumberIntegerRegex}(?=\\b)`;
  SpanishNumeric2.NumbersWithDozenSuffix = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+docenas?(?=\\b)`;
  SpanishNumeric2.AllIntRegexWithLocks = `((?<=\\b)${SpanishNumeric2.AllIntRegex}(?=\\b))`;
  SpanishNumeric2.AllIntRegexWithDozenSuffixLocks = `(?<=\\b)(((media\\s+)?\\s+docena)|(${SpanishNumeric2.AllIntRegex}\\s+(y|con)\\s+)?(${SpanishNumeric2.AllIntRegex}\\s+docenas?))(?=\\b)`;
  SpanishNumeric2.SimpleRoundOrdinalRegex = `(mil[e\xE9]simo|millon[e\xE9]sim[oa]|billon[e\xE9]sim[oa]|trillon[e\xE9]sim[oa]|cuatrillon[e\xE9]sim[oa]|quintillon[e\xE9]sim[oa]|sextillon[e\xE9]sim[oa]|septillon[e\xE9]sim[oa])`;
  SpanishNumeric2.OneToNineOrdinalRegex = `(primer[oa]|segund[oa]|tercer[oa]|cuart[oa]|quint[oa]|sext[oa]|s[e\xE9]ptim[oa]|octav[oa]|noven[oa])`;
  SpanishNumeric2.TensOrdinalRegex = `(nonag[e\xE9]sim[oa]|octog[e\xE9]sim[oa]|septuag[e\xE9]sim[oa]|sexag[e\xE9]sim[oa]|quincuag[e\xE9]sim[oa]|cuadrag[e\xE9]sim[oa]|trig[e\xE9]sim[oa]|vig[e\xE9]sim[oa]|d[e\xE9]cim[oa])`;
  SpanishNumeric2.HundredOrdinalRegex = `(cent[e\xE9]sim[oa]|ducent[e\xE9]sim[oa]|tricent[e\xE9]sim[oa]|cuadringent[e\xE9]sim[oa]|quingent[e\xE9]sim[oa]|sexcent[e\xE9]sim[oa]|septingent[e\xE9]sim[oa]|octingent[e\xE9]sim[oa]|noningent[e\xE9]sim[oa])`;
  SpanishNumeric2.SpecialUnderHundredOrdinalRegex = `(und[e\xE9]cim[oa]|duod[e\xE9]cimo|decimoctav[oa])`;
  SpanishNumeric2.UnderHundredOrdinalRegex = `(((${SpanishNumeric2.TensOrdinalRegex}(\\s)?)?${SpanishNumeric2.OneToNineOrdinalRegex})|${SpanishNumeric2.TensOrdinalRegex}|${SpanishNumeric2.SpecialUnderHundredOrdinalRegex})`;
  SpanishNumeric2.UnderThousandOrdinalRegex = `(((${SpanishNumeric2.HundredOrdinalRegex}(\\s)?)?${SpanishNumeric2.UnderHundredOrdinalRegex})|${SpanishNumeric2.HundredOrdinalRegex})`;
  SpanishNumeric2.OverThousandOrdinalRegex = `((${SpanishNumeric2.AllIntRegex})([e\xE9]sim[oa]))`;
  SpanishNumeric2.ComplexOrdinalRegex = `((${SpanishNumeric2.OverThousandOrdinalRegex}(\\s)?)?${SpanishNumeric2.UnderThousandOrdinalRegex}|${SpanishNumeric2.OverThousandOrdinalRegex})`;
  SpanishNumeric2.SufixRoundOrdinalRegex = `((${SpanishNumeric2.AllIntRegex})(${SpanishNumeric2.SimpleRoundOrdinalRegex}))`;
  SpanishNumeric2.ComplexRoundOrdinalRegex = `(((${SpanishNumeric2.SufixRoundOrdinalRegex}(\\s)?)?${SpanishNumeric2.ComplexOrdinalRegex})|${SpanishNumeric2.SufixRoundOrdinalRegex})`;
  SpanishNumeric2.AllOrdinalRegex = `${SpanishNumeric2.ComplexOrdinalRegex}|${SpanishNumeric2.SimpleRoundOrdinalRegex}|${SpanishNumeric2.ComplexRoundOrdinalRegex}`;
  SpanishNumeric2.OrdinalSuffixRegex = `(?<=\\b)(\\d*(1r[oa]|2d[oa]|3r[oa]|4t[oa]|5t[oa]|6t[oa]|7m[oa]|8v[oa]|9n[oa]|0m[oa]|11[vm][oa]|12[vm][oa]))(?=\\b)`;
  SpanishNumeric2.OrdinalNounRegex = `(?<=\\b)${SpanishNumeric2.AllOrdinalRegex}(?=\\b)`;
  SpanishNumeric2.SpecialFractionInteger = `(((${SpanishNumeric2.AllIntRegex})i?(${SpanishNumeric2.ZeroToNineIntegerRegex})|(${SpanishNumeric2.AllIntRegex}))a?v[oa]s?)`;
  SpanishNumeric2.FractionNotationRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+[/]\\d+(?=(\\b[^/]|$))`;
  SpanishNumeric2.FractionNotationWithSpacesRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+\\d+[/]\\d+(?=(\\b[^/]|$))`;
  SpanishNumeric2.FractionNounRegex = `(?<=\\b)(${SpanishNumeric2.AllIntRegex}\\s+((y|con)\\s+)?)?(${SpanishNumeric2.AllIntRegex})(\\s+((y|con)\\s)?)(((${SpanishNumeric2.AllOrdinalRegex})s?|(${SpanishNumeric2.SpecialFractionInteger})|(${SpanishNumeric2.SufixRoundOrdinalRegex})s?)|medi[oa]s?|tercios?)(?=\\b)`;
  SpanishNumeric2.FractionNounWithArticleRegex = `(?<=\\b)(${SpanishNumeric2.AllIntRegex}\\s+(y\\s+)?)?(un|un[oa])(\\s+)((${SpanishNumeric2.AllOrdinalRegex})|(${SpanishNumeric2.SufixRoundOrdinalRegex})|(y\\s+)?medi[oa]s?)(?=\\b)`;
  SpanishNumeric2.FractionPrepositionRegex = `(?<=\\b)(?<numerator>(${SpanishNumeric2.AllIntRegex})|((?<!\\.)\\d+))\\s+sobre\\s+(?<denominator>(${SpanishNumeric2.AllIntRegex})|((\\d+)(?!\\.)))(?=\\b)`;
  SpanishNumeric2.AllPointRegex = `((\\s+${SpanishNumeric2.ZeroToNineIntegerRegex})+|(\\s+${SpanishNumeric2.AllIntRegex}))`;
  SpanishNumeric2.AllFloatRegex = `${SpanishNumeric2.AllIntRegex}(\\s+(coma|con))${SpanishNumeric2.AllPointRegex}`;
  SpanishNumeric2.DoubleDecimalPointRegex = (placeholder) => {
    return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))\\d+[\\.,]\\d+(?!([\\.,]\\d+))(?=${placeholder})`;
  };
  SpanishNumeric2.DoubleWithoutIntegralRegex = (placeholder) => {
    return `(?<=\\s|^)(?<!(\\d+))[\\.,]\\d+(?!([\\.,]\\d+))(?=${placeholder})`;
  };
  SpanishNumeric2.DoubleWithMultiplierRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\[\\.,])))\\d+[\\.,]\\d+\\s*(K|k|M|G|T)(?=\\b)`;
  SpanishNumeric2.DoubleWithRoundNumber = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\[\\.,])))\\d+[\\.,]\\d+\\s+${SpanishNumeric2.RoundNumberIntegerRegex}(?=\\b)`;
  SpanishNumeric2.DoubleAllFloatRegex = `((?<=\\b)${SpanishNumeric2.AllFloatRegex}(?=\\b))`;
  SpanishNumeric2.DoubleExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))(\\d+([\\.,]\\d+)?)e([+-]*[1-9]\\d*)(?=\\b)`;
  SpanishNumeric2.DoubleCaretExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))(\\d+([\\.,]\\d+)?)\\^([+-]*[1-9]\\d*)(?=\\b)`;
  SpanishNumeric2.NumberWithPrefixPercentage = `(?<!%)(${exports.BaseNumbers.NumberReplaceToken})(\\s*)(%(?!${exports.BaseNumbers.NumberReplaceToken})|(por ciento|por cien)\\b)`;
  SpanishNumeric2.CurrencyRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(B|b|m|t|g)(?=\\b)`;
  SpanishNumeric2.DecimalSeparatorChar = ",";
  SpanishNumeric2.FractionMarkerToken = "sobre";
  SpanishNumeric2.NonDecimalSeparatorChar = ".";
  SpanishNumeric2.HalfADozenText = "seis";
  SpanishNumeric2.WordSeparatorToken = "y";
  SpanishNumeric2.WrittenDecimalSeparatorTexts = ["coma", "con"];
  SpanishNumeric2.WrittenGroupSeparatorTexts = ["punto"];
  SpanishNumeric2.WrittenIntegerSeparatorTexts = ["y"];
  SpanishNumeric2.WrittenFractionSeparatorTexts = ["con"];
  SpanishNumeric2.HalfADozenRegex = `media\\s+docena`;
  SpanishNumeric2.DigitalNumberRegex = `((?<=\\b)(mil|millones|mill[o\xF3]n|billones|bill[o\xF3]n|trillones|trill[o\xF3]n|docenas?)(?=\\b))|((?<=(\\d|\\b))(k|t|m|g)(?=\\b))`;
  SpanishNumeric2.CardinalNumberMap = /* @__PURE__ */ new Map([["cero", 0], ["un", 1], ["una", 1], ["uno", 1], ["dos", 2], ["tres", 3], ["cuatro", 4], ["cinco", 5], ["seis", 6], ["siete", 7], ["ocho", 8], ["nueve", 9], ["diez", 10], ["once", 11], ["doce", 12], ["docena", 12], ["docenas", 12], ["trece", 13], ["catorce", 14], ["quince", 15], ["dieciseis", 16], ["diecis\xE9is", 16], ["diecisiete", 17], ["dieciocho", 18], ["diecinueve", 19], ["veinte", 20], ["ventiuna", 21], ["ventiuno", 21], ["veintiun", 21], ["veinti\xFAn", 21], ["veintiuno", 21], ["veintiuna", 21], ["veintidos", 22], ["veintid\xF3s", 22], ["veintitres", 23], ["veintitr\xE9s", 23], ["veinticuatro", 24], ["veinticinco", 25], ["veintiseis", 26], ["veintis\xE9is", 26], ["veintisiete", 27], ["veintiocho", 28], ["veintinueve", 29], ["treinta", 30], ["cuarenta", 40], ["cincuenta", 50], ["sesenta", 60], ["setenta", 70], ["ochenta", 80], ["noventa", 90], ["cien", 100], ["ciento", 100], ["doscientas", 200], ["doscientos", 200], ["trescientas", 300], ["trescientos", 300], ["cuatrocientas", 400], ["cuatrocientos", 400], ["quinientas", 500], ["quinientos", 500], ["seiscientas", 600], ["seiscientos", 600], ["setecientas", 700], ["setecientos", 700], ["ochocientas", 800], ["ochocientos", 800], ["novecientas", 900], ["novecientos", 900], ["mil", 1e3], ["millon", 1e6], ["mill\xF3n", 1e6], ["millones", 1e6], ["billon", 1e12], ["bill\xF3n", 1e12], ["billones", 1e12], ["trillon", 1e18], ["trill\xF3n", 1e18], ["trillones", 1e18]]);
  SpanishNumeric2.OrdinalNumberMap = /* @__PURE__ */ new Map([["primero", 1], ["primera", 1], ["primer", 1], ["segundo", 2], ["segunda", 2], ["medio", 2], ["media", 2], ["tercero", 3], ["tercera", 3], ["tercer", 3], ["tercio", 3], ["cuarto", 4], ["cuarta", 4], ["quinto", 5], ["quinta", 5], ["sexto", 6], ["sexta", 6], ["septimo", 7], ["septima", 7], ["octavo", 8], ["octava", 8], ["noveno", 9], ["novena", 9], ["decimo", 10], ["decima", 10], ["undecimo", 11], ["undecima", 11], ["duodecimo", 12], ["duodecima", 12], ["decimotercero", 13], ["decimotercera", 13], ["decimocuarto", 14], ["decimocuarta", 14], ["decimoquinto", 15], ["decimoquinta", 15], ["decimosexto", 16], ["decimosexta", 16], ["decimoseptimo", 17], ["decimoseptima", 17], ["decimoctavo", 18], ["decimoctava", 18], ["decimonoveno", 19], ["decimonovena", 19], ["vigesimo", 20], ["vigesima", 20], ["trigesimo", 30], ["trigesima", 30], ["cuadragesimo", 40], ["cuadragesima", 40], ["quincuagesimo", 50], ["quincuagesima", 50], ["sexagesimo", 60], ["sexagesima", 60], ["septuagesimo", 70], ["septuagesima", 70], ["octogesimo", 80], ["octogesima", 80], ["nonagesimo", 90], ["nonagesima", 90], ["centesimo", 100], ["centesima", 100], ["ducentesimo", 200], ["ducentesima", 200], ["tricentesimo", 300], ["tricentesima", 300], ["cuadringentesimo", 400], ["cuadringentesima", 400], ["quingentesimo", 500], ["quingentesima", 500], ["sexcentesimo", 600], ["sexcentesima", 600], ["septingentesimo", 700], ["septingentesima", 700], ["octingentesimo", 800], ["octingentesima", 800], ["noningentesimo", 900], ["noningentesima", 900], ["milesimo", 1e3], ["milesima", 1e3], ["millonesimo", 1e6], ["millonesima", 1e6], ["billonesimo", 1e12], ["billonesima", 1e12]]);
  SpanishNumeric2.PrefixCardinalMap = /* @__PURE__ */ new Map([["dos", 2], ["tres", 3], ["cuatro", 4], ["cinco", 5], ["seis", 6], ["siete", 7], ["ocho", 8], ["nueve", 9], ["diez", 10], ["once", 11], ["doce", 12], ["trece", 13], ["catorce", 14], ["quince", 15], ["dieciseis", 16], ["diecis\xE9is", 16], ["diecisiete", 17], ["dieciocho", 18], ["diecinueve", 19], ["veinte", 20], ["ventiuna", 21], ["veintiun", 21], ["veinti\xFAn", 21], ["veintidos", 22], ["veintitres", 23], ["veinticuatro", 24], ["veinticinco", 25], ["veintiseis", 26], ["veintisiete", 27], ["veintiocho", 28], ["veintinueve", 29], ["treinta", 30], ["cuarenta", 40], ["cincuenta", 50], ["sesenta", 60], ["setenta", 70], ["ochenta", 80], ["noventa", 90], ["cien", 100], ["doscientos", 200], ["trescientos", 300], ["cuatrocientos", 400], ["quinientos", 500], ["seiscientos", 600], ["setecientos", 700], ["ochocientos", 800], ["novecientos", 900]]);
  SpanishNumeric2.SuffixOrdinalMap = /* @__PURE__ */ new Map([["milesimo", 1e3], ["millonesimo", 1e6], ["billonesimo", 1e12]]);
  SpanishNumeric2.RoundNumberMap = /* @__PURE__ */ new Map([["mil", 1e3], ["milesimo", 1e3], ["millon", 1e6], ["mill\xF3n", 1e6], ["millones", 1e6], ["millonesimo", 1e6], ["billon", 1e12], ["bill\xF3n", 1e12], ["billones", 1e12], ["billonesimo", 1e12], ["trillon", 1e18], ["trill\xF3n", 1e18], ["trillones", 1e18], ["trillonesimo", 1e18], ["docena", 12], ["docenas", 12], ["k", 1e3], ["m", 1e6], ["g", 1e9], ["t", 1e12]]);
  SpanishNumeric2.AmbiguousFractionConnectorsRegex = `^[.]`;
})(exports.SpanishNumeric || (exports.SpanishNumeric = {}));
var SpanishNumberParserConfiguration = class {
  constructor(ci) {
    if (!ci) {
      ci = new CultureInfo(Culture.Spanish);
    }
    this.cultureInfo = ci;
    this.langMarker = exports.SpanishNumeric.LangMarker;
    this.decimalSeparatorChar = exports.SpanishNumeric.DecimalSeparatorChar;
    this.fractionMarkerToken = exports.SpanishNumeric.FractionMarkerToken;
    this.nonDecimalSeparatorChar = exports.SpanishNumeric.NonDecimalSeparatorChar;
    this.halfADozenText = exports.SpanishNumeric.HalfADozenText;
    this.wordSeparatorToken = exports.SpanishNumeric.WordSeparatorToken;
    this.writtenDecimalSeparatorTexts = exports.SpanishNumeric.WrittenDecimalSeparatorTexts;
    this.writtenGroupSeparatorTexts = exports.SpanishNumeric.WrittenGroupSeparatorTexts;
    this.writtenIntegerSeparatorTexts = exports.SpanishNumeric.WrittenIntegerSeparatorTexts;
    this.writtenFractionSeparatorTexts = exports.SpanishNumeric.WrittenFractionSeparatorTexts;
    let ordinalNumberMap = new Map(exports.SpanishNumeric.OrdinalNumberMap);
    exports.SpanishNumeric.PrefixCardinalMap.forEach((prefixValue, prefixKey) => {
      exports.SpanishNumeric.SuffixOrdinalMap.forEach((suffixValue, suffixKey) => {
        if (!ordinalNumberMap.has(prefixKey + suffixKey)) {
          ordinalNumberMap.set(prefixKey + suffixKey, prefixValue * suffixValue);
        }
      });
    });
    this.cardinalNumberMap = exports.SpanishNumeric.CardinalNumberMap;
    this.ordinalNumberMap = ordinalNumberMap;
    this.roundNumberMap = exports.SpanishNumeric.RoundNumberMap;
    this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.NegativeNumberSignRegex, "is");
    this.halfADozenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.HalfADozenRegex);
    this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.DigitalNumberRegex);
  }
  normalizeTokenSet(tokens, context) {
    let result = new Array();
    tokens.forEach((token) => {
      let tempWord = token.replace(/^s+/, "").replace(/s+$/, "");
      if (this.ordinalNumberMap.has(tempWord)) {
        result.push(tempWord);
        return;
      }
      if (tempWord.endsWith("avo") || tempWord.endsWith("ava")) {
        let origTempWord = tempWord;
        let newLength = origTempWord.length;
        tempWord = origTempWord.substring(0, newLength - 3);
        if (this.cardinalNumberMap.has(tempWord)) {
          result.push(tempWord);
          return;
        } else {
          tempWord = origTempWord.substring(0, newLength - 2);
          if (this.cardinalNumberMap.has(tempWord)) {
            result.push(tempWord);
            return;
          }
        }
      }
      result.push(token);
    });
    return result;
  }
  resolveCompositeNumber(numberStr) {
    if (this.ordinalNumberMap.has(numberStr)) {
      return this.ordinalNumberMap.get(numberStr);
    }
    if (this.cardinalNumberMap.has(numberStr)) {
      return this.cardinalNumberMap.get(numberStr);
    }
    let value = 0;
    let finalValue = 0;
    let strBuilder = "";
    let lastGoodChar = 0;
    for (let i = 0; i < numberStr.length; i++) {
      strBuilder = strBuilder.concat(numberStr[i]);
      if (this.cardinalNumberMap.has(strBuilder) && this.cardinalNumberMap.get(strBuilder) > value) {
        lastGoodChar = i;
        value = this.cardinalNumberMap.get(strBuilder);
      }
      if (i + 1 === numberStr.length) {
        finalValue += value;
        strBuilder = "";
        i = lastGoodChar++;
        value = 0;
      }
    }
    return finalValue;
  }
};

// recognizers/recognizers-number/src/resources/portugueseNumeric.ts
var PortugueseNumeric;
((PortugueseNumeric2) => {
  PortugueseNumeric2.LangMarker = "Por";
  PortugueseNumeric2.HundredsNumberIntegerRegex = `(quatrocent[ao]s|trezent[ao]s|seiscent[ao]s|setecent[ao]s|oitocent[ao]s|novecent[ao]s|duzent[ao]s|quinhent[ao]s|cem|(?<!por\\s+)(cento))`;
  PortugueseNumeric2.RoundNumberIntegerRegex = `(mil|milh[\xE3a]o|milh[\xF5o]es|bilh[\xE3a]o|bilh[\xF5o]es|trilh[\xE3a]o|trilh[\xF5o]es|qua[td]rilh[\xE3a]o|qua[td]rilh[\xF5o]es|quintilh[\xE3a]o|quintilh[\xF5o]es)`;
  PortugueseNumeric2.ZeroToNineIntegerRegex = `(quatro|cinco|sete|nove|zero|tr[\xEAe]s|seis|oito|dois|duas|um|uma)`;
  PortugueseNumeric2.TenToNineteenIntegerRegex = `(dez[ea]sseis|dez[ea]ssete|dez[ea]nove|dezoito|quatorze|catorze|quinze|treze|d[\xE9e]z|onze|doze)`;
  PortugueseNumeric2.TensNumberIntegerRegex = `(cinquenta|quarenta|trinta|sessenta|setenta|oitenta|noventa|vinte)`;
  PortugueseNumeric2.DigitsNumberRegex = `\\d|\\d{1,3}(\\.\\d{3})`;
  PortugueseNumeric2.BelowHundredsRegex = `((${PortugueseNumeric2.TenToNineteenIntegerRegex}|(${PortugueseNumeric2.TensNumberIntegerRegex}(\\s+e\\s+${PortugueseNumeric2.ZeroToNineIntegerRegex})?))|${PortugueseNumeric2.ZeroToNineIntegerRegex})`;
  PortugueseNumeric2.BelowThousandsRegex = `(${PortugueseNumeric2.HundredsNumberIntegerRegex}(\\s+e\\s+${PortugueseNumeric2.BelowHundredsRegex})?|${PortugueseNumeric2.BelowHundredsRegex})`;
  PortugueseNumeric2.SupportThousandsRegex = `((${PortugueseNumeric2.BelowThousandsRegex}|${PortugueseNumeric2.BelowHundredsRegex})\\s+${PortugueseNumeric2.RoundNumberIntegerRegex}(\\s+${PortugueseNumeric2.RoundNumberIntegerRegex})?)`;
  PortugueseNumeric2.NegativeNumberTermsRegex = `^[.]`;
  PortugueseNumeric2.NegativeNumberSignRegex = `^(${PortugueseNumeric2.NegativeNumberTermsRegex}\\s+).*`;
  PortugueseNumeric2.SeparaIntRegex = `(${PortugueseNumeric2.SupportThousandsRegex}(\\s+${PortugueseNumeric2.SupportThousandsRegex})*(\\s+${PortugueseNumeric2.BelowThousandsRegex})?|${PortugueseNumeric2.BelowThousandsRegex})`;
  PortugueseNumeric2.AllIntRegex = `(${PortugueseNumeric2.SeparaIntRegex}|mil(\\s+${PortugueseNumeric2.BelowThousandsRegex})?)`;
  PortugueseNumeric2.AllPointRegex = `((\\s+${PortugueseNumeric2.ZeroToNineIntegerRegex})+|(\\s+${PortugueseNumeric2.AllIntRegex}))`;
  PortugueseNumeric2.SpecialFractionInteger = `(((${PortugueseNumeric2.AllIntRegex})i?(${PortugueseNumeric2.ZeroToNineIntegerRegex})|(${PortugueseNumeric2.AllIntRegex}))\\s+a?v[oa]s?)`;
  PortugueseNumeric2.PlaceHolderDefault = `\\D|\\b`;
  PortugueseNumeric2.PlaceHolderPureNumber = `\\b`;
  PortugueseNumeric2.AllIntRegexWithLocks = `((?<=\\b)${PortugueseNumeric2.AllIntRegex}(?=\\b))`;
  PortugueseNumeric2.AllIntRegexWithDozenSuffixLocks = `(?<=\\b)(((meia)?\\s+(d[\xFAu]zia))|(${PortugueseNumeric2.AllIntRegex}\\s+(e|com)\\s+)?(${PortugueseNumeric2.AllIntRegex}\\s+(d[\xFAu]zia(s)?|dezena(s)?)))(?=\\b)`;
  PortugueseNumeric2.NumbersWithPlaceHolder = (placeholder) => {
    return `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+(?!(,\\d+[a-zA-Z]))(?=${placeholder})`;
  };
  PortugueseNumeric2.NumbersWithSuffix = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(k|M|T|G)(?=\\b)`;
  PortugueseNumeric2.RoundNumberIntegerRegexWithLocks = `(?<=\\b)(${PortugueseNumeric2.DigitsNumberRegex})+\\s+${PortugueseNumeric2.RoundNumberIntegerRegex}(?=\\b)`;
  PortugueseNumeric2.NumbersWithDozenSuffix = `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+\\s+dezena(s)?(?=\\b)`;
  PortugueseNumeric2.NumbersWithDozen2Suffix = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+d[\xFAu]zia(s)(?=\\b)`;
  PortugueseNumeric2.SimpleRoundOrdinalRegex = `(mil[e\xE9]sim[oa]|milion[e\xE9]sim[oa]|bilion[e\xE9]sim[oa]|trilion[e\xE9]sim[oa]|quatrilion[e\xE9]sim[oa]|quintilion[e\xE9]sim[oa])`;
  PortugueseNumeric2.OneToNineOrdinalRegex = `(primeir[oa]|segund[oa]|terceir[oa]|quart[oa]|quint[oa]|sext[oa]|s[e\xE9]tim[oa]|oitav[oa]|non[oa])`;
  PortugueseNumeric2.TensOrdinalRegex = `(nonag[e\xE9]sim[oa]|octog[e\xE9]sim[oa]|setuag[e\xE9]sim[oa]|septuag[e\xE9]sim[oa]|sexag[e\xE9]sim[oa]|quinquag[e\xE9]sim[oa]|quadrag[e\xE9]sim[oa]|trig[e\xE9]sim[oa]|vig[e\xE9]sim[oa]|d[e\xE9]cim[oa])`;
  PortugueseNumeric2.HundredOrdinalRegex = `(cent[e\xE9]sim[oa]|ducent[e\xE9]sim[oa]|tricent[e\xE9]sim[oa]|cuadringent[e\xE9]sim[oa]|quingent[e\xE9]sim[oa]|sexcent[e\xE9]sim[oa]|septingent[e\xE9]sim[oa]|octingent[e\xE9]sim[oa]|noningent[e\xE9]sim[oa])`;
  PortugueseNumeric2.SpecialUnderHundredOrdinalRegex = `(und[e\xE9]cim[oa]|duod[e\xE9]cimo)`;
  PortugueseNumeric2.UnderHundredOrdinalRegex = `(((${PortugueseNumeric2.TensOrdinalRegex}(\\s)?)?${PortugueseNumeric2.OneToNineOrdinalRegex})|${PortugueseNumeric2.TensOrdinalRegex}|${PortugueseNumeric2.SpecialUnderHundredOrdinalRegex})`;
  PortugueseNumeric2.UnderThousandOrdinalRegex = `(((${PortugueseNumeric2.HundredOrdinalRegex}(\\s)?)?${PortugueseNumeric2.UnderHundredOrdinalRegex})|${PortugueseNumeric2.HundredOrdinalRegex})`;
  PortugueseNumeric2.OverThousandOrdinalRegex = `((${PortugueseNumeric2.AllIntRegex})([e\xE9]sim[oa]))`;
  PortugueseNumeric2.ComplexOrdinalRegex = `((${PortugueseNumeric2.OverThousandOrdinalRegex}(\\s)?)?${PortugueseNumeric2.UnderThousandOrdinalRegex}|${PortugueseNumeric2.OverThousandOrdinalRegex})`;
  PortugueseNumeric2.SuffixRoundOrdinalRegex = `((${PortugueseNumeric2.AllIntRegex})(${PortugueseNumeric2.SimpleRoundOrdinalRegex}))`;
  PortugueseNumeric2.ComplexRoundOrdinalRegex = `(((${PortugueseNumeric2.SuffixRoundOrdinalRegex}(\\s)?)?${PortugueseNumeric2.ComplexOrdinalRegex})|${PortugueseNumeric2.SuffixRoundOrdinalRegex})`;
  PortugueseNumeric2.AllOrdinalRegex = `${PortugueseNumeric2.ComplexOrdinalRegex}|${PortugueseNumeric2.SimpleRoundOrdinalRegex}|${PortugueseNumeric2.ComplexRoundOrdinalRegex}`;
  PortugueseNumeric2.OrdinalSuffixRegex = `(?<=\\b)(\\d*(1[oa\xBA]|2[oa\xBA]|3[oa\xBA]|4[oa\xBA]|5[oa\xBA]|6[oa\xBA]|7[oa\xBA]|8[oa\xBA]|9[oa\xBA]|0[oa\xBA]|1.\xBA|2.\xBA|3.\xBA|4.\xBA|5.\xBA|6.\xBA|7.\xBA|8.\xBA|9.\xBA))(?=\\b)`;
  PortugueseNumeric2.OrdinalEnglishRegex = `(?<=\\b)${PortugueseNumeric2.AllOrdinalRegex}(?=\\b)`;
  PortugueseNumeric2.FractionNotationRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+[/]\\d+(?=(\\b[^/]|$))`;
  PortugueseNumeric2.FractionNotationWithSpacesRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+\\d+[/]\\d+(?=(\\b[^/]|$))`;
  PortugueseNumeric2.FractionNounRegex = `(?<=\\b)(${PortugueseNumeric2.AllIntRegex}\\s+((e|com)\\s+)?)?(${PortugueseNumeric2.AllIntRegex})(\\s+((e|com)\\s)?)(((${PortugueseNumeric2.AllOrdinalRegex})s?|(${PortugueseNumeric2.SpecialFractionInteger})|(${PortugueseNumeric2.SuffixRoundOrdinalRegex})s?)|mei[oa]?|ter[\xE7c]o?)(?=\\b)`;
  PortugueseNumeric2.FractionNounWithArticleRegex = `(?<=\\b)(${PortugueseNumeric2.AllIntRegex}\\s+(e\\s+)?)?(um|um[as])(\\s+)((${PortugueseNumeric2.AllOrdinalRegex})|(${PortugueseNumeric2.SuffixRoundOrdinalRegex})|(e\\s+)?mei[oa]?)(?=\\b)`;
  PortugueseNumeric2.FractionPrepositionRegex = `(?<=\\b)(?<numerator>(${PortugueseNumeric2.AllIntRegex})|((?<!\\.)\\d+))\\s+sobre\\s+(?<denominator>(${PortugueseNumeric2.AllIntRegex})|((\\d+)(?!\\.)))(?=\\b)`;
  PortugueseNumeric2.AllFloatRegex = `${PortugueseNumeric2.AllIntRegex}(\\s+(v\xEDrgula|virgula|e|ponto))${PortugueseNumeric2.AllPointRegex}`;
  PortugueseNumeric2.DoubleWithMultiplierRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\,)))\\d+,\\d+\\s*(K|k|M|G|T)(?=\\b)`;
  PortugueseNumeric2.DoubleExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+,)))(\\d+(,\\d+)?)e([+-]*[1-9]\\d*)(?=\\b)`;
  PortugueseNumeric2.DoubleCaretExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+,)))(\\d+(,\\d+)?)\\^([+-]*[1-9]\\d*)(?=\\b)`;
  PortugueseNumeric2.DoubleDecimalPointRegex = (placeholder) => {
    return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+,)))\\d+,\\d+(?!(,\\d+))(?=${placeholder})`;
  };
  PortugueseNumeric2.DoubleWithoutIntegralRegex = (placeholder) => {
    return `(?<=\\s|^)(?<!(\\d+)),\\d+(?!(,\\d+))(?=${placeholder})`;
  };
  PortugueseNumeric2.DoubleWithRoundNumber = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\,)))\\d+,\\d+\\s+${PortugueseNumeric2.RoundNumberIntegerRegex}(?=\\b)`;
  PortugueseNumeric2.DoubleAllFloatRegex = `((?<=\\b)${PortugueseNumeric2.AllFloatRegex}(?=\\b))`;
  PortugueseNumeric2.CurrencyRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(B|b|m|t|g)(?=\\b)`;
  PortugueseNumeric2.NumberWithSuffixPercentage = `(?<!%)(${exports.BaseNumbers.NumberReplaceToken})(\\s*)(%(?!${exports.BaseNumbers.NumberReplaceToken})|(por cento|pontos percentuais)\\b)`;
  PortugueseNumeric2.AmbiguousFractionConnectorsRegex = `^[.]`;
  PortugueseNumeric2.DecimalSeparatorChar = ",";
  PortugueseNumeric2.FractionMarkerToken = "sobre";
  PortugueseNumeric2.NonDecimalSeparatorChar = ".";
  PortugueseNumeric2.HalfADozenText = "seis";
  PortugueseNumeric2.WordSeparatorToken = "e";
  PortugueseNumeric2.WrittenDecimalSeparatorTexts = ["virgula", "v\xEDrgula"];
  PortugueseNumeric2.WrittenGroupSeparatorTexts = ["ponto"];
  PortugueseNumeric2.WrittenIntegerSeparatorTexts = ["e"];
  PortugueseNumeric2.WrittenFractionSeparatorTexts = ["com"];
  PortugueseNumeric2.WrittenFractionSuffix = ["avo", "ava"];
  PortugueseNumeric2.PluralSuffix = "s";
  PortugueseNumeric2.HalfADozenRegex = `meia\\s+d[u\xFA]zia`;
  PortugueseNumeric2.DigitalNumberRegex = `((?<=\\b)(mil|cem|milh[o\xF5]es|milh[a\xE3]o|bilh[o\xF5]es|bilh[a\xE3]o|trilh[o\xF5]es|trilh[a\xE3]o|milhares|centena|centenas|dezena|dezenas?)(?=\\b))|((?<=(\\d|\\b))(k|t|m|g)(?=\\b))`;
  PortugueseNumeric2.CardinalNumberMap = /* @__PURE__ */ new Map([["zero", 0], ["hum", 1], ["um", 1], ["uma", 1], ["dois", 2], ["duas", 2], ["meia", 2], ["meio", 2], ["tres", 3], ["tr\xEAs", 3], ["quatro", 4], ["cinco", 5], ["seis", 6], ["sete", 7], ["oito", 8], ["nove", 9], ["dez", 10], ["dezena", 10], ["d\xE9z", 10], ["onze", 11], ["doze", 12], ["d\xFAzia", 12], ["duzia", 12], ["d\xFAzias", 12], ["duzias", 12], ["treze", 13], ["catorze", 14], ["quatorze", 14], ["quinze", 15], ["dezesseis", 16], ["dezasseis", 16], ["dezessete", 17], ["dezassete", 17], ["dezoito", 18], ["dezenove", 19], ["dezanove", 19], ["vinte", 20], ["trinta", 30], ["quarenta", 40], ["cinquenta", 50], ["cincoenta", 50], ["sessenta", 60], ["setenta", 70], ["oitenta", 80], ["noventa", 90], ["cem", 100], ["cento", 100], ["duzentos", 200], ["duzentas", 200], ["trezentos", 300], ["trezentas", 300], ["quatrocentos", 400], ["quatrocentas", 400], ["quinhentos", 500], ["quinhentas", 500], ["seiscentos", 600], ["seiscentas", 600], ["setecentos", 700], ["setecentas", 700], ["oitocentos", 800], ["oitocentas", 800], ["novecentos", 900], ["novecentas", 900], ["mil", 1e3], ["milh\xE3o", 1e6], ["milhao", 1e6], ["milh\xF5es", 1e6], ["milhoes", 1e6], ["bilh\xE3o", 1e9], ["bilhao", 1e9], ["bilh\xF5es", 1e9], ["bilhoes", 1e9], ["trilh\xE3o", 1e12], ["trilhao", 1e12], ["trilh\xF5es", 1e12], ["trilhoes", 1e12]]);
  PortugueseNumeric2.OrdinalNumberMap = /* @__PURE__ */ new Map([["primeiro", 1], ["primeira", 1], ["segundo", 2], ["segunda", 2], ["terceiro", 3], ["terceira", 3], ["quarto", 4], ["quarta", 4], ["quinto", 5], ["quinta", 5], ["sexto", 6], ["sexta", 6], ["s\xE9timo", 7], ["setimo", 7], ["s\xE9tima", 7], ["setima", 7], ["oitavo", 8], ["oitava", 8], ["nono", 9], ["nona", 9], ["d\xE9cimo", 10], ["decimo", 10], ["d\xE9cima", 10], ["decima", 10], ["und\xE9cimo", 11], ["undecimo", 11], ["und\xE9cima", 11], ["undecima", 11], ["duod\xE9cimo", 11], ["duodecimo", 11], ["duod\xE9cima", 11], ["duodecima", 11], ["vig\xE9simo", 20], ["vigesimo", 20], ["vig\xE9sima", 20], ["vigesima", 20], ["trig\xE9simo", 30], ["trigesimo", 30], ["trig\xE9sima", 30], ["trigesima", 30], ["quadrag\xE9simo", 40], ["quadragesimo", 40], ["quadrag\xE9sima", 40], ["quadragesima", 40], ["quinquag\xE9simo", 50], ["quinquagesimo", 50], ["quinquag\xE9sima", 50], ["quinquagesima", 50], ["sexag\xE9simo", 60], ["sexagesimo", 60], ["sexag\xE9sima", 60], ["sexagesima", 60], ["septuag\xE9simo", 70], ["septuagesimo", 70], ["septuag\xE9sima", 70], ["septuagesima", 70], ["setuag\xE9simo", 70], ["setuagesimo", 70], ["setuag\xE9sima", 70], ["setuagesima", 70], ["octog\xE9simo", 80], ["octogesimo", 80], ["octog\xE9sima", 80], ["octogesima", 80], ["nonag\xE9simo", 90], ["nonagesimo", 90], ["nonag\xE9sima", 90], ["nonagesima", 90], ["centesimo", 100], ["cent\xE9simo", 100], ["centesima", 100], ["cent\xE9sima", 100], ["ducent\xE9simo", 200], ["ducentesimo", 200], ["ducent\xE9sima", 200], ["ducentesima", 200], ["tricent\xE9simo", 300], ["tricentesimo", 300], ["tricent\xE9sima", 300], ["tricentesima", 300], ["trecent\xE9simo", 300], ["trecentesimo", 300], ["trecent\xE9sima", 300], ["trecentesima", 300], ["quadringent\xE9simo", 400], ["quadringentesimo", 400], ["quadringent\xE9sima", 400], ["quadringentesima", 400], ["quingent\xE9simo", 500], ["quingentesimo", 500], ["quingent\xE9sima", 500], ["quingentesima", 500], ["sexcent\xE9simo", 600], ["sexcentesimo", 600], ["sexcent\xE9sima", 600], ["sexcentesima", 600], ["seiscent\xE9simo", 600], ["seiscentesimo", 600], ["seiscent\xE9sima", 600], ["seiscentesima", 600], ["septingent\xE9simo", 700], ["septingentesimo", 700], ["septingent\xE9sima", 700], ["septingentesima", 700], ["setingent\xE9simo", 700], ["setingentesimo", 700], ["setingent\xE9sima", 700], ["setingentesima", 700], ["octingent\xE9simo", 800], ["octingentesimo", 800], ["octingent\xE9sima", 800], ["octingentesima", 800], ["noningent\xE9simo", 900], ["noningentesimo", 900], ["noningent\xE9sima", 900], ["noningentesima", 900], ["nongent\xE9simo", 900], ["nongentesimo", 900], ["nongent\xE9sima", 900], ["nongentesima", 900], ["mil\xE9simo", 1e3], ["milesimo", 1e3], ["mil\xE9sima", 1e3], ["milesima", 1e3], ["milion\xE9simo", 1e6], ["milionesimo", 1e6], ["milion\xE9sima", 1e6], ["milionesima", 1e6], ["bilion\xE9simo", 1e9], ["bilionesimo", 1e9], ["bilion\xE9sima", 1e9], ["bilionesima", 1e9]]);
  PortugueseNumeric2.PrefixCardinalMap = /* @__PURE__ */ new Map([["hum", 1], ["dois", 2], ["tres", 3], ["tr\xEAs", 3], ["quatro", 4], ["cinco", 5], ["seis", 6], ["sete", 7], ["oito", 8], ["nove", 9], ["dez", 10], ["onze", 11], ["doze", 12], ["treze", 13], ["catorze", 14], ["quatorze", 14], ["quinze", 15], ["dezesseis", 16], ["dezasseis", 16], ["dezessete", 17], ["dezassete", 17], ["dezoito", 18], ["dezenove", 19], ["dezanove", 19], ["vinte", 20], ["trinta", 30], ["quarenta", 40], ["cinquenta", 50], ["cincoenta", 50], ["sessenta", 60], ["setenta", 70], ["oitenta", 80], ["noventa", 90], ["cem", 100], ["duzentos", 200], ["trezentos", 300], ["quatrocentos", 400], ["quinhentos", 500], ["seiscentos", 600], ["setecentos", 700], ["oitocentos", 800], ["novecentos", 900]]);
  PortugueseNumeric2.SuffixOrdinalMap = /* @__PURE__ */ new Map([["milesimo", 1e3], ["milionesimo", 1e6], ["bilionesimo", 1e9], ["trilionesimo", 1e12]]);
  PortugueseNumeric2.RoundNumberMap = /* @__PURE__ */ new Map([["mil", 1e3], ["milesimo", 1e3], ["milh\xE3o", 1e6], ["milhao", 1e6], ["milh\xF5es", 1e6], ["milhoes", 1e6], ["milion\xE9simo", 1e6], ["milionesimo", 1e6], ["bilh\xE3o", 1e9], ["bilhao", 1e9], ["bilh\xF5es", 1e9], ["bilhoes", 1e9], ["bilion\xE9simo", 1e9], ["bilionesimo", 1e9], ["trilh\xE3o", 1e12], ["trilhao", 1e12], ["trilh\xF5es", 1e12], ["trilhoes", 1e12], ["trilion\xE9simo", 1e12], ["trilionesimo", 1e12], ["dezena", 10], ["dezenas", 10], ["d\xFAzia", 12], ["duzia", 12], ["d\xFAzias", 12], ["duzias", 12], ["k", 1e3], ["m", 1e6], ["g", 1e9], ["t", 1e12]]);
})(PortugueseNumeric || (PortugueseNumeric = {}));
var PortugueseNumberParserConfiguration = class {
  constructor(ci) {
    if (!ci) {
      ci = new CultureInfo(Culture.Portuguese);
    }
    this.cultureInfo = ci;
    this.langMarker = PortugueseNumeric.LangMarker;
    this.decimalSeparatorChar = PortugueseNumeric.DecimalSeparatorChar;
    this.fractionMarkerToken = PortugueseNumeric.FractionMarkerToken;
    this.nonDecimalSeparatorChar = PortugueseNumeric.NonDecimalSeparatorChar;
    this.halfADozenText = PortugueseNumeric.HalfADozenText;
    this.wordSeparatorToken = PortugueseNumeric.WordSeparatorToken;
    this.writtenDecimalSeparatorTexts = PortugueseNumeric.WrittenDecimalSeparatorTexts;
    this.writtenGroupSeparatorTexts = PortugueseNumeric.WrittenGroupSeparatorTexts;
    this.writtenIntegerSeparatorTexts = PortugueseNumeric.WrittenIntegerSeparatorTexts;
    this.writtenFractionSeparatorTexts = PortugueseNumeric.WrittenFractionSeparatorTexts;
    let ordinalNumberMap = new Map(PortugueseNumeric.OrdinalNumberMap);
    PortugueseNumeric.PrefixCardinalMap.forEach((prefixValue, prefixKey) => {
      PortugueseNumeric.SuffixOrdinalMap.forEach((suffixValue, suffixKey) => {
        if (!ordinalNumberMap.has(prefixKey + suffixKey)) {
          ordinalNumberMap.set(prefixKey + suffixKey, prefixValue * suffixValue);
        }
      });
    });
    this.cardinalNumberMap = PortugueseNumeric.CardinalNumberMap;
    this.ordinalNumberMap = ordinalNumberMap;
    this.roundNumberMap = PortugueseNumeric.RoundNumberMap;
    this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.NegativeNumberSignRegex, "is");
    this.halfADozenRegex = recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.HalfADozenRegex);
    this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.DigitalNumberRegex);
  }
  normalizeTokenSet(tokens, context) {
    let result = new Array();
    tokens.forEach((token) => {
      let tempWord = token.replace(/^s+/, "").replace(/s+$/, "");
      if (this.ordinalNumberMap.has(tempWord)) {
        result.push(tempWord);
        return;
      }
      if (PortugueseNumeric.WrittenFractionSuffix.some((suffix) => tempWord.endsWith(suffix))) {
        let origTempWord = tempWord;
        let newLength = origTempWord.length;
        tempWord = origTempWord.substring(0, newLength - 3);
        if (!tempWord) {
          return;
        } else if (this.cardinalNumberMap.has(tempWord)) {
          result.push(tempWord);
          return;
        } else {
          tempWord = origTempWord.substring(0, newLength - 2);
          if (this.cardinalNumberMap.has(tempWord)) {
            result.push(tempWord);
            return;
          }
        }
      }
      result.push(token);
    });
    return result;
  }
  resolveCompositeNumber(numberStr) {
    if (this.ordinalNumberMap.has(numberStr)) {
      return this.ordinalNumberMap.get(numberStr);
    }
    if (this.cardinalNumberMap.has(numberStr)) {
      return this.cardinalNumberMap.get(numberStr);
    }
    let value = 0;
    let finalValue = 0;
    let strBuilder = "";
    let lastGoodChar = 0;
    for (let i = 0; i < numberStr.length; i++) {
      strBuilder = strBuilder.concat(numberStr[i]);
      if (this.cardinalNumberMap.has(strBuilder) && this.cardinalNumberMap.get(strBuilder) > value) {
        lastGoodChar = i;
        value = this.cardinalNumberMap.get(strBuilder);
      }
      if (i + 1 === numberStr.length) {
        finalValue += value;
        strBuilder = "";
        i = lastGoodChar++;
        value = 0;
      }
    }
    return finalValue;
  }
};

// recognizers/recognizers-number/src/resources/frenchNumeric.ts
exports.FrenchNumeric = void 0;
((FrenchNumeric2) => {
  FrenchNumeric2.LangMarker = "Fr";
  FrenchNumeric2.RoundNumberIntegerRegex = `(cent|mille|millions|million|milliard|milliards|billion|billions)`;
  FrenchNumeric2.ZeroToNineIntegerRegex = `(et un|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf)`;
  FrenchNumeric2.TenToNineteenIntegerRegex = `((seize|quinze|quatorze|treize|douze|onze)|dix(\\Wneuf|\\Whuit|\\Wsept)?)`;
  FrenchNumeric2.TensNumberIntegerRegex = `(quatre\\Wvingt(s|\\Wdix)?|soixante\\Wdix|vingt|trente|quarante|cinquante|soixante|septante|octante|huitante|nonante)`;
  FrenchNumeric2.DigitsNumberRegex = `\\d|\\d{1,3}(\\.\\d{3})`;
  FrenchNumeric2.NegativeNumberTermsRegex = `^[.]`;
  FrenchNumeric2.NegativeNumberSignRegex = `^(${FrenchNumeric2.NegativeNumberTermsRegex}\\s+).*`;
  FrenchNumeric2.HundredsNumberIntegerRegex = `((${FrenchNumeric2.ZeroToNineIntegerRegex}(\\s+cent))|cent|((\\s+cent\\s)+${FrenchNumeric2.TensNumberIntegerRegex}))`;
  FrenchNumeric2.BelowHundredsRegex = `((${FrenchNumeric2.TenToNineteenIntegerRegex}|(${FrenchNumeric2.TensNumberIntegerRegex}([-\\s]+(${FrenchNumeric2.TenToNineteenIntegerRegex}|${FrenchNumeric2.ZeroToNineIntegerRegex}))?))|${FrenchNumeric2.ZeroToNineIntegerRegex})`;
  FrenchNumeric2.BelowThousandsRegex = `((${FrenchNumeric2.HundredsNumberIntegerRegex}(\\s+${FrenchNumeric2.BelowHundredsRegex})?|${FrenchNumeric2.BelowHundredsRegex}|${FrenchNumeric2.TenToNineteenIntegerRegex})|cent\\s+${FrenchNumeric2.TenToNineteenIntegerRegex})`;
  FrenchNumeric2.SupportThousandsRegex = `((${FrenchNumeric2.BelowThousandsRegex}|${FrenchNumeric2.BelowHundredsRegex})\\s+${FrenchNumeric2.RoundNumberIntegerRegex}(\\s+${FrenchNumeric2.RoundNumberIntegerRegex})?)`;
  FrenchNumeric2.SeparaIntRegex = `(${FrenchNumeric2.SupportThousandsRegex}(\\s+${FrenchNumeric2.SupportThousandsRegex})*(\\s+${FrenchNumeric2.BelowThousandsRegex})?|${FrenchNumeric2.BelowThousandsRegex})`;
  FrenchNumeric2.AllIntRegex = `(${FrenchNumeric2.SeparaIntRegex}|mille(\\s+${FrenchNumeric2.BelowThousandsRegex})?)`;
  FrenchNumeric2.NumbersWithPlaceHolder = (placeholder) => {
    return `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+(?!([,\\.]\\d+[a-zA-Z]))(?=${placeholder})`;
  };
  FrenchNumeric2.NumbersWithSuffix = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(k|M|T|G)(?=\\b)`;
  FrenchNumeric2.RoundNumberIntegerRegexWithLocks = `(?<=\\b)(${FrenchNumeric2.DigitsNumberRegex})+\\s+${FrenchNumeric2.RoundNumberIntegerRegex}(?=\\b)`;
  FrenchNumeric2.NumbersWithDozenSuffix = `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+\\s+douzaine(s)?(?=\\b)`;
  FrenchNumeric2.AllIntRegexWithLocks = `((?<=\\b)${FrenchNumeric2.AllIntRegex}(?=\\b))`;
  FrenchNumeric2.AllIntRegexWithDozenSuffixLocks = `(?<=\\b)(((demi\\s+)?\\s+douzaine)|(${FrenchNumeric2.AllIntRegex}\\s+douzaines?))(?=\\b)`;
  FrenchNumeric2.SimpleRoundOrdinalRegex = `(centi[e\xE8]me|milli[e\xE8]me|millioni[e\xE8]me|milliardi[e\xE8]me|billioni[e\xE8]me)`;
  FrenchNumeric2.OneToNineOrdinalRegex = `(premier|premi[e\xE8]re|deuxi[e\xE8]me|second[e]|troisi[e\xE8]me|tiers|tierce|quatri[e\xE8]me|cinqui[e\xE8]me|sixi[e\xE8]me|septi[e\xE8]me|huiti[e\xE8]me|neuvi[e\xE8]me)`;
  FrenchNumeric2.SpecialUnderHundredOrdinalRegex = `(onzi[e\xE8]me|douzi[e\xE8]me)`;
  FrenchNumeric2.TensOrdinalRegex = `(quatre-vingt-dixi[e\xE8]me|quatre-vingti[e\xE8]me|huitanti[e\xE8]me|octanti[e\xE8]me|soixante-dixi[e\xE8]me|septanti[e\xE8]me|soixanti[e\xE8]me|cinquanti[e\xE8]me|quaranti[e\xE8]me|trenti[e\xE8]me|vingti[e\xE8]me)`;
  FrenchNumeric2.HundredOrdinalRegex = `(${FrenchNumeric2.AllIntRegex}(\\s+(centi[e\xE8]me\\s)))`;
  FrenchNumeric2.UnderHundredOrdinalRegex = `(((${FrenchNumeric2.AllIntRegex}(\\W)?)?${FrenchNumeric2.OneToNineOrdinalRegex})|(${FrenchNumeric2.TensNumberIntegerRegex}(\\W)?)?${FrenchNumeric2.OneToNineOrdinalRegex}|${FrenchNumeric2.TensOrdinalRegex}|${FrenchNumeric2.SpecialUnderHundredOrdinalRegex})`;
  FrenchNumeric2.UnderThousandOrdinalRegex = `(((${FrenchNumeric2.HundredOrdinalRegex}(\\s)?)?${FrenchNumeric2.UnderHundredOrdinalRegex})|((${FrenchNumeric2.AllIntRegex}(\\W)?)?${FrenchNumeric2.SimpleRoundOrdinalRegex})|${FrenchNumeric2.HundredOrdinalRegex})`;
  FrenchNumeric2.OverThousandOrdinalRegex = `((${FrenchNumeric2.AllIntRegex})(i[e\xE8]me))`;
  FrenchNumeric2.ComplexOrdinalRegex = `((${FrenchNumeric2.OverThousandOrdinalRegex}(\\s)?)?${FrenchNumeric2.UnderThousandOrdinalRegex}|${FrenchNumeric2.OverThousandOrdinalRegex}|${FrenchNumeric2.UnderHundredOrdinalRegex})`;
  FrenchNumeric2.SuffixOrdinalRegex = `((${FrenchNumeric2.AllIntRegex})(${FrenchNumeric2.SimpleRoundOrdinalRegex}))`;
  FrenchNumeric2.ComplexRoundOrdinalRegex = `(((${FrenchNumeric2.SuffixOrdinalRegex}(\\s)?)?${FrenchNumeric2.ComplexOrdinalRegex})|${FrenchNumeric2.SuffixOrdinalRegex})`;
  FrenchNumeric2.AllOrdinalRegex = `(${FrenchNumeric2.ComplexOrdinalRegex}|${FrenchNumeric2.SimpleRoundOrdinalRegex}|${FrenchNumeric2.ComplexRoundOrdinalRegex})`;
  FrenchNumeric2.PlaceHolderPureNumber = `\\b`;
  FrenchNumeric2.PlaceHolderDefault = `\\D|\\b`;
  FrenchNumeric2.OrdinalSuffixRegex = `(?<=\\b)((\\d*(1er|2e|2eme|3e|3eme|4e|4eme|5e|5eme|6e|6eme|7e|7eme|8e|8eme|9e|9eme|0e|0eme))|(11e|11eme|12e|12eme))(?=\\b)`;
  FrenchNumeric2.OrdinalFrenchRegex = `(?<=\\b)${FrenchNumeric2.AllOrdinalRegex}(?=\\b)`;
  FrenchNumeric2.FractionNotationWithSpacesRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+\\d+[/]\\d+(?=(\\b[^/]|$))`;
  FrenchNumeric2.FractionNotationRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+[/]\\d+(?=(\\b[^/]|$))`;
  FrenchNumeric2.FractionNounRegex = `(?<=\\b)(${FrenchNumeric2.AllIntRegex}\\s+((et)\\s+)?)?(${FrenchNumeric2.AllIntRegex})(\\s+((et)\\s)?)(((${FrenchNumeric2.AllOrdinalRegex})s?|(${FrenchNumeric2.SuffixOrdinalRegex})s?)|demis?|tiers?|quarts?)(?=\\b)`;
  FrenchNumeric2.FractionNounWithArticleRegex = `(?<=\\b)(${FrenchNumeric2.AllIntRegex}\\s+(et\\s+)?)?(un|une)(\\s+)((${FrenchNumeric2.AllOrdinalRegex})|(${FrenchNumeric2.SuffixOrdinalRegex})|(et\\s+)?demis?)(?=\\b)`;
  FrenchNumeric2.FractionPrepositionRegex = `(?<=\\b)(?<numerator>(${FrenchNumeric2.AllIntRegex})|((?<!\\.)\\d+))\\s+sur\\s+(?<denominator>(${FrenchNumeric2.AllIntRegex})|((\\d+)(?!\\.)))(?=\\b)`;
  FrenchNumeric2.AllPointRegex = `((\\s+${FrenchNumeric2.ZeroToNineIntegerRegex})+|(\\s+${FrenchNumeric2.SeparaIntRegex}))`;
  FrenchNumeric2.AllFloatRegex = `(${FrenchNumeric2.AllIntRegex}(\\s+(virgule|point))${FrenchNumeric2.AllPointRegex})`;
  FrenchNumeric2.DoubleDecimalPointRegex = (placeholder) => {
    return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[,\\.])))\\d+[,\\.]\\d+(?!([,\\.]\\d+))(?=${placeholder})`;
  };
  FrenchNumeric2.DoubleWithoutIntegralRegex = (placeholder) => {
    return `(?<=\\s|^)(?<!(\\d+))[,\\.]\\d+(?!([,\\.]\\d+))(?=${placeholder})`;
  };
  FrenchNumeric2.DoubleWithMultiplierRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\[,\\.])))\\d+[,\\.]\\d+\\s*(K|k|M|G|T)(?=\\b)`;
  FrenchNumeric2.DoubleWithRoundNumber = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\[,\\.])))\\d+[,\\.]\\d+\\s+${FrenchNumeric2.RoundNumberIntegerRegex}(?=\\b)`;
  FrenchNumeric2.DoubleAllFloatRegex = `((?<=\\b)${FrenchNumeric2.AllFloatRegex}(?=\\b))`;
  FrenchNumeric2.DoubleExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[,\\.])))(\\d+([,\\.]\\d+)?)e([+-]*[1-9]\\d*)(?=\\b)`;
  FrenchNumeric2.DoubleCaretExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[,\\.])))(\\d+([,\\.]\\d+)?)\\^([+-]*[1-9]\\d*)(?=\\b)`;
  FrenchNumeric2.CurrencyRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(B|b|m|t|g)(?=\\b)`;
  FrenchNumeric2.NumberWithSuffixPercentage = `(?<!%)(${exports.BaseNumbers.NumberReplaceToken})(\\s*)(%(?!${exports.BaseNumbers.NumberReplaceToken})|(pourcentages|pourcents|pourcentage|pourcent)\\b)`;
  FrenchNumeric2.NumberWithPrefixPercentage = `((?<!${exports.BaseNumbers.NumberReplaceToken})%|pourcent|pourcent des|pourcentage de)(\\s*)(${exports.BaseNumbers.NumberReplaceToken})(?=\\s|$)`;
  FrenchNumeric2.DecimalSeparatorChar = ",";
  FrenchNumeric2.FractionMarkerToken = "sur";
  FrenchNumeric2.NonDecimalSeparatorChar = ".";
  FrenchNumeric2.HalfADozenText = "six";
  FrenchNumeric2.WordSeparatorToken = "et";
  FrenchNumeric2.WrittenDecimalSeparatorTexts = ["virgule"];
  FrenchNumeric2.WrittenGroupSeparatorTexts = ["point", "points"];
  FrenchNumeric2.WrittenIntegerSeparatorTexts = ["et", "-"];
  FrenchNumeric2.WrittenFractionSeparatorTexts = ["et", "sur"];
  FrenchNumeric2.HalfADozenRegex = `(?<=\\b)+demi\\s+douzaine`;
  FrenchNumeric2.DigitalNumberRegex = `((?<=\\b)(cent|mille|million|millions|milliard|milliards|billions|billion|douzaine(s)?)(?=\\b))|((?<=(\\d|\\b))(k|t|m|g|b)(?=\\b))`;
  FrenchNumeric2.AmbiguousFractionConnectorsRegex = `^[.]`;
  FrenchNumeric2.CardinalNumberMap = /* @__PURE__ */ new Map([["z\xE9ro", 0], ["zero", 0], ["un", 1], ["une", 1], ["deux", 2], ["trois", 3], ["quatre", 4], ["cinq", 5], ["six", 6], ["sept", 7], ["huit", 8], ["neuf", 9], ["dix", 10], ["onze", 11], ["douze", 12], ["treize", 13], ["quatorze", 14], ["quinze", 15], ["seize", 16], ["dix-sept", 17], ["dix-huit", 18], ["dix-neuf", 19], ["vingt", 20], ["trente", 30], ["quarante", 40], ["cinquante", 50], ["soixante", 60], ["soixante-dix", 70], ["septante", 70], ["quatre-vingts", 80], ["quatre-vingt", 80], ["quatre vingts", 80], ["quatre vingt", 80], ["quatre-vingt-dix", 90], ["quatre-vingt dix", 90], ["quatre vingt dix", 90], ["quatre-vingts-dix", 90], ["quatre-vingts-onze", 91], ["quatre-vingt-onze", 91], ["quatre-vingts-douze", 92], ["quatre-vingt-douze", 92], ["quatre-vingts-treize", 93], ["quatre-vingt-treize", 93], ["quatre-vingts-quatorze", 94], ["quatre-vingt-quatorze", 94], ["quatre-vingts-quinze", 95], ["quatre-vingt-quinze", 95], ["quatre-vingts-seize", 96], ["quatre-vingt-seize", 96], ["huitante", 80], ["octante", 80], ["nonante", 90], ["cent", 100], ["mille", 1e3], ["un million", 1e6], ["million", 1e6], ["millions", 1e6], ["un milliard", 1e9], ["milliard", 1e9], ["milliards", 1e9], ["un mille milliards", 1e12], ["un billion", 1e12]]);
  FrenchNumeric2.OrdinalNumberMap = /* @__PURE__ */ new Map([["premier", 1], ["premi\xE8re", 1], ["premiere", 1], ["deuxi\xE8me", 2], ["deuxieme", 2], ["second", 2], ["seconde", 2], ["troisi\xE8me", 3], ["demi", 2], ["tiers", 3], ["tierce", 3], ["quart", 4], ["quarts", 4], ["troisieme", 3], ["quatri\xE8me", 4], ["quatrieme", 4], ["cinqui\xE8me", 5], ["cinquieme", 5], ["sixi\xE8me", 6], ["sixieme", 6], ["septi\xE8me", 7], ["septieme", 7], ["huiti\xE8me", 8], ["huitieme", 8], ["neuvi\xE8me", 9], ["neuvieme", 9], ["dixi\xE8me", 10], ["dixieme", 10], ["onzi\xE8me", 11], ["onzieme", 11], ["douzi\xE8me", 12], ["douzieme", 12], ["treizi\xE8me", 13], ["treizieme", 13], ["quatorzi\xE8me", 14], ["quatorizieme", 14], ["quinzi\xE8me", 15], ["quinzieme", 15], ["seizi\xE8me", 16], ["seizieme", 16], ["dix-septi\xE8me", 17], ["dix-septieme", 17], ["dix-huiti\xE8me", 18], ["dix-huitieme", 18], ["dix-neuvi\xE8me", 19], ["dix-neuvieme", 19], ["vingti\xE8me", 20], ["vingtieme", 20], ["trenti\xE8me", 30], ["trentieme", 30], ["quaranti\xE8me", 40], ["quarantieme", 40], ["cinquanti\xE8me", 50], ["cinquantieme", 50], ["soixanti\xE8me", 60], ["soixantieme", 60], ["soixante-dixi\xE8me", 70], ["soixante-dixieme", 70], ["septanti\xE8me", 70], ["septantieme", 70], ["quatre-vingti\xE8me", 80], ["quatre-vingtieme", 80], ["huitanti\xE8me", 80], ["huitantieme", 80], ["octanti\xE8me", 80], ["octantieme", 80], ["quatre-vingt-dixi\xE8me", 90], ["quatre-vingt-dixieme", 90], ["nonanti\xE8me", 90], ["nonantieme", 90], ["centi\xE8me", 100], ["centieme", 100], ["milli\xE8me", 1e3], ["millieme", 1e3], ["millioni\xE8me", 1e6], ["millionieme", 1e6], ["milliardi\xE8me", 1e9], ["milliardieme", 1e9], ["billionieme", 1e12], ["billioni\xE8me", 1e12], ["trillioni\xE8me", 1e18], ["trillionieme", 1e18]]);
  FrenchNumeric2.PrefixCardinalMap = /* @__PURE__ */ new Map([["deux", 2], ["trois", 3], ["quatre", 4], ["cinq", 5], ["six", 6], ["sept", 7], ["huit", 8], ["neuf", 9], ["dix", 10], ["onze", 11], ["douze", 12], ["treize", 13], ["quatorze", 14], ["quinze", 15], ["seize", 16], ["dix sept", 17], ["dix-sept", 17], ["dix-huit", 18], ["dix huit", 18], ["dix-neuf", 19], ["dix neuf", 19], ["vingt", 20], ["vingt-et-un", 21], ["vingt et un", 21], ["vingt-deux", 21], ["vingt deux", 22], ["vingt-trois", 23], ["vingt trois", 23], ["vingt-quatre", 24], ["vingt quatre", 24], ["vingt-cinq", 25], ["vingt cinq", 25], ["vingt-six", 26], ["vingt six", 26], ["vingt-sept", 27], ["vingt sept", 27], ["vingt-huit", 28], ["vingt huit", 28], ["vingt-neuf", 29], ["vingt neuf", 29], ["trente", 30], ["quarante", 40], ["cinquante", 50], ["soixante", 60], ["soixante-dix", 70], ["soixante dix", 70], ["septante", 70], ["quatre-vingt", 80], ["quatre vingt", 80], ["huitante", 80], ["octante", 80], ["nonante", 90], ["quatre vingt dix", 90], ["quatre-vingt-dix", 90], ["cent", 100], ["deux cent", 200], ["trois cents", 300], ["quatre cents", 400], ["cinq cent", 500], ["six cent", 600], ["sept cent", 700], ["huit cent", 800], ["neuf cent", 900]]);
  FrenchNumeric2.SuffixOrdinalMap = /* @__PURE__ */ new Map([["milli\xE8me", 1e3], ["million", 1e6], ["milliardi\xE8me", 1e12]]);
  FrenchNumeric2.RoundNumberMap = /* @__PURE__ */ new Map([["cent", 100], ["mille", 1e3], ["million", 1e6], ["millions", 1e6], ["milliard", 1e9], ["milliards", 1e9], ["billion", 1e12], ["billions", 1e12], ["centieme", 100], ["centi\xE8me", 100], ["millieme", 1e3], ["milli\xE8me", 1e3], ["millioni\xE8me", 1e6], ["millionieme", 1e6], ["milliardi\xE8me", 1e9], ["milliardieme", 1e9], ["billioni\xE8me", 1e12], ["billionieme", 1e12], ["centiemes", 100], ["centi\xE8mes", 100], ["milli\xE8mes", 1e3], ["milliemes", 1e3], ["millioni\xE8mes", 1e6], ["millioniemes", 1e6], ["milliardi\xE8mes", 1e9], ["milliardiemes", 1e9], ["billioni\xE8mes", 1e12], ["billioniemes", 1e12], ["douzaine", 12], ["douzaines", 12], ["k", 1e3], ["m", 1e6], ["g", 1e9], ["b", 1e9], ["t", 1e12]]);
})(exports.FrenchNumeric || (exports.FrenchNumeric = {}));
var FrenchNumberParserConfiguration = class {
  constructor(ci) {
    if (!ci) {
      ci = new CultureInfo(Culture.French);
    }
    this.cultureInfo = ci;
    this.langMarker = exports.FrenchNumeric.LangMarker;
    this.decimalSeparatorChar = exports.FrenchNumeric.DecimalSeparatorChar;
    this.fractionMarkerToken = exports.FrenchNumeric.FractionMarkerToken;
    this.nonDecimalSeparatorChar = exports.FrenchNumeric.NonDecimalSeparatorChar;
    this.halfADozenText = exports.FrenchNumeric.HalfADozenText;
    this.wordSeparatorToken = exports.FrenchNumeric.WordSeparatorToken;
    this.writtenDecimalSeparatorTexts = exports.FrenchNumeric.WrittenDecimalSeparatorTexts;
    this.writtenGroupSeparatorTexts = exports.FrenchNumeric.WrittenGroupSeparatorTexts;
    this.writtenIntegerSeparatorTexts = exports.FrenchNumeric.WrittenIntegerSeparatorTexts;
    this.writtenFractionSeparatorTexts = exports.FrenchNumeric.WrittenFractionSeparatorTexts;
    this.cardinalNumberMap = exports.FrenchNumeric.CardinalNumberMap;
    this.ordinalNumberMap = exports.FrenchNumeric.OrdinalNumberMap;
    this.roundNumberMap = exports.FrenchNumeric.RoundNumberMap;
    this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.NegativeNumberSignRegex, "is");
    this.halfADozenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.HalfADozenRegex);
    this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.DigitalNumberRegex);
  }
  normalizeTokenSet(tokens, context) {
    return tokens;
  }
  resolveCompositeNumber(numberStr) {
    if (this.ordinalNumberMap.has(numberStr)) {
      return this.ordinalNumberMap.get(numberStr);
    }
    if (this.cardinalNumberMap.has(numberStr)) {
      return this.cardinalNumberMap.get(numberStr);
    }
    let value = 0;
    let finalValue = 0;
    let strBuilder = "";
    let lastGoodChar = 0;
    for (let i = 0; i < numberStr.length; i++) {
      strBuilder = strBuilder.concat(numberStr[i]);
      if (this.cardinalNumberMap.has(strBuilder) && this.cardinalNumberMap.get(strBuilder) > value) {
        lastGoodChar = i;
        value = this.cardinalNumberMap.get(strBuilder);
      }
      if (i + 1 === numberStr.length) {
        finalValue += value;
        strBuilder = "";
        i = lastGoodChar++;
        value = 0;
      }
    }
    return finalValue;
  }
};

// recognizers/recognizers-number/src/resources/chineseNumeric.ts
exports.ChineseNumeric = void 0;
((ChineseNumeric2) => {
  ChineseNumeric2.LangMarker = "";
  ChineseNumeric2.DecimalSeparatorChar = ".";
  ChineseNumeric2.FractionMarkerToken = "";
  ChineseNumeric2.NonDecimalSeparatorChar = " ";
  ChineseNumeric2.HalfADozenText = "";
  ChineseNumeric2.WordSeparatorToken = "";
  ChineseNumeric2.RoundNumberMap = /* @__PURE__ */ new Map([["k", 1e3], ["m", 1e6], ["g", 1e9], ["t", 1e12]]);
  ChineseNumeric2.RoundNumberMapChar = /* @__PURE__ */ new Map([["\u5341", 10], ["\u767E", 100], ["\u5343", 1e3], ["\u4E07", 1e4], ["\u4EBF", 1e8], ["\u5146", 1e12], ["\u62FE", 10], ["\u4F70", 100], ["\u4EDF", 1e3], ["\u842C", 1e4], ["\u5104", 1e8]]);
  ChineseNumeric2.ZeroToNineMap = /* @__PURE__ */ new Map([["0", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["\u96F6", 0], ["\u4E00", 1], ["\u4E8C", 2], ["\u4E09", 3], ["\u56DB", 4], ["\u4E94", 5], ["\u516D", 6], ["\u4E03", 7], ["\u516B", 8], ["\u4E5D", 9], ["\u3007", 0], ["\u58F9", 1], ["\u8D30", 2], ["\u8CB3", 2], ["\u53C1", 3], ["\u8086", 4], ["\u4F0D", 5], ["\u9646", 6], ["\u9678", 6], ["\u67D2", 7], ["\u634C", 8], ["\u7396", 9], ["\uFF10", 0], ["\uFF11", 1], ["\uFF12", 2], ["\uFF13", 3], ["\uFF14", 4], ["\uFF15", 5], ["\uFF16", 6], ["\uFF17", 7], ["\uFF18", 8], ["\uFF19", 9], ["\u534A", 0.5], ["\u4E24", 2], ["\u5169", 2], ["\u4FE9", 2], ["\u5006", 2], ["\u4EE8", 3]]);
  ChineseNumeric2.FullToHalfMap = /* @__PURE__ */ new Map([["\uFF10", "0"], ["\uFF11", "1"], ["\uFF12", "2"], ["\uFF13", "3"], ["\uFF14", "4"], ["\uFF15", "5"], ["\uFF16", "6"], ["\uFF17", "7"], ["\uFF18", "8"], ["\uFF19", "9"], ["\uFF0F", "/"], ["\uFF0D", "-"], ["\uFF0C", "'"], ["\uFF27", "G"], ["\uFF2D", "M"], ["\uFF34", "T"], ["\uFF2B", "K"], ["\uFF4B", "k"], ["\uFF0E", "."]]);
  ChineseNumeric2.TratoSimMap = /* @__PURE__ */ new Map([["\u4F70", "\u767E"], ["\u9EDE", "\u70B9"], ["\u500B", "\u4E2A"], ["\u5E7E", "\u51E0"], ["\u5C0D", "\u5BF9"], ["\u96D9", "\u53CC"]]);
  ChineseNumeric2.UnitMap = /* @__PURE__ */ new Map([["\u842C\u842C", "\u5104"], ["\u5104\u842C", "\u5146"], ["\u842C\u5104", "\u5146"], ["\u4E07\u4E07", "\u4EBF"], ["\u4E07\u4EBF", "\u5146"], ["\u4EBF\u4E07", "\u5146"], [" ", ""], ["\u591A", ""], ["\u4F59", ""], ["\u51E0", ""]]);
  ChineseNumeric2.RoundDirectList = ["\u4E07", "\u842C", "\u4EBF", "\u5146", "\u5104"];
  ChineseNumeric2.DigitalNumberRegex = `((?<=(\\d|\\b))(k|t|m|g)(?=\\b))`;
  ChineseNumeric2.ZeroToNineFullHalfRegex = `[\\d\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19\uFF10]`;
  ChineseNumeric2.DigitNumRegex = `${ChineseNumeric2.ZeroToNineFullHalfRegex}+`;
  ChineseNumeric2.DozenRegex = `.*\u6253$`;
  ChineseNumeric2.PercentageRegex = `(?<=\u767E\\s*\u5206\\s*\u4E4B).+|.+(?=\u4E2A\\s*\u767E\\s*\u5206\\s*\u70B9)|.*(?=[\uFF05%])`;
  ChineseNumeric2.DoubleAndRoundRegex = `${ChineseNumeric2.ZeroToNineFullHalfRegex}+(\\.${ChineseNumeric2.ZeroToNineFullHalfRegex}+)?\\s*[\u591A\u51E0\u4F59]?[\u4E07\u4EBF\u842C\u5104]{1,2}`;
  ChineseNumeric2.FracSplitRegex = `\u53C8|\u5206\\s*\u4E4B`;
  ChineseNumeric2.ZeroToNineIntegerRegex = `[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u96F6\u58F9\u8D30\u8CB3\u53C1\u8086\u4F0D\u9646\u9678\u67D2\u634C\u7396\u3007\u4E24\u5169\u4FE9\u5006\u4EE8]`;
  ChineseNumeric2.NegativeNumberTermsRegex = `[\u8D1F\u8CA0]`;
  ChineseNumeric2.NegativeNumberTermsRegexNum = `((?<!(\\d+\\s*)|[-\uFF0D])[-\uFF0D])`;
  ChineseNumeric2.NegativeNumberSignRegex = `^${ChineseNumeric2.NegativeNumberTermsRegex}.*|^${ChineseNumeric2.NegativeNumberTermsRegexNum}.*`;
  ChineseNumeric2.SpeGetNumberRegex = `${ChineseNumeric2.ZeroToNineFullHalfRegex}|${ChineseNumeric2.ZeroToNineIntegerRegex}|[\u5341\u62FE\u534A\u5BF9\u5C0D]`;
  ChineseNumeric2.PairRegex = ".*[\u53CC\u5BF9\u96D9\u5C0D]$";
  ChineseNumeric2.RoundNumberIntegerRegex = `(((?<![\u5341\u767E\u5343\u62FE\u4F70\u4EDF])[\u5341\u767E\u5343\u62FE\u4F70\u4EDF])|([\u4E07\u4EBF\u5146\u842C\u5104]))`;
  ChineseNumeric2.WhiteListRegex = `(\u3002|\uFF0C|\u3001|\uFF08|\uFF09|\u201C|\u201D|[\u5230\u4EE5\u81F3]|[\u56FD\u570B]|\u5468|\u591C|[\u70B9\u9EDE]|[\u4E2A\u500B]|\u500D|\u7968|[\u9879\u9805]|[\u4EA9\u755D]|\u5206|\u5143|\u89D2|\u5929|\u52A0|[\u51CF\u6E1B]|\u4E58|\u9664|\u662F|[\u5C0D\u5BF9]|\u6253|\u516C[\u91CC\u88CF]|\u516C[\u9877\u9803]|\u516C\u5206|\u5E73\u65B9|\u65B9|\u7C73|\u5398|\u6BEB|[\u6761\u689D]|\u8239|[\u8F66\u8ECA]|[\u8F86\u8F1B]|\u7FA4|[\u9875\u9801]|\u676F|\u4EBA|[\u5F20\u5F35]|\u6B21|\u4F4D|\u4EFD|\u6279|[\u5C4A\u5C46]|[\u7EA7\u7D1A]|[\u79CD\u7A2E]|\u5957|[\u7B14\u7B46]|\u6839|[\u5757\u584A]|\u4EF6|\u5EA7|\u6B65|[\u9897\u9846]|\u68F5|[\u8282\u7BC0]|\u652F|\u53EA|\u540D|\u5E74|\u6708|\u65E5|[\u53F7\u865F]|\u6735|\u514B|[\u5428\u5678]|\u78C5|[\u7801\u78BC]|\u82F1\u5C3A|\u82F1\u5BF8|\u5347|\u52A0[\u4ED1\u4F96]|\u7ACB\u65B9|[\u53F0\u81FA]|\u5957|[\u7F57\u7F85]|\u4EE4|\u5377|[\u5934\u982D]|\u7BB1|\u5305|\u6876|\u888B|[\u5757\u584A]|\u5BB6|\u884C|\u671F|[\u5C42\u5C64]|\u5EA6|\u9762|\u6240|\u67B6|\u628A|\u7247|[\u9635\u9663]|[\u95F4\u9593]|\u7B49|[\u53E0\u758A]|\u789F|\u4E0B|\u8D77|\u624B|\u5B63|\u90E8|\u4EBA|\u5C0F[\u65F6\u6642]|[\u65F6\u6642]|\u79D2|[\u6837\u6A23]|\u7AE0|\u6BB5|\u661F|\u5DDE|\u6B3E|\u4EE3|\u7EF4|\u91CD|[\u6237\u6238]|\u697C|\u8DEF|\u7BC7|\u53E5|\u952E|\u672C|\u751F|\u8005|\u5B57|\u90CE|\u9053|\u8FB9|\u573A|\u53E3|\u7EBF|\u4E16|\u5CB8|\u91D1|\u7C7B|\u756A|\u7EC4|\u5366|\u773C|\u7CFB|\u58F0|\u66F4|\u5E26|\u8272|\u6218|\u6210|\u8F6E|\u98DF|\u9996|\u5E61|\u7AD9|\u80A1|\u4E95|\u6D41|\u5F00|\u523B|\u6D32|\u56DE|\u5BAE|\u96C6|\u7EC3|\u9031|\u548C|\u73AF|\u7532|\u5904|\u7701|\u91CC|\u6D77|\u904D|\u54C1|\u4F53|\u738B|\u5C3E|\u65B0|\u96BB|\u7248|\u9636|\u677F|\u4FA7|\u6CE2|\u8EAB|\u5219|\u626B|\u623F|\u5F69|\u6728|\u519B|\u5C45|\u665A|\u5C9B|\u8BFE|\u5F0F|\u901A|\u76F8|\u533A|\u6587|\u7AEF|\u5473|\u7530|\u5FC3|\u80CE|\u73ED|\u51FA|\u8FDE|\u5355|\u4E8B|\u4E1D|\u526F|\u5C81|\u65C1|\u5E55|\u4E9B|\u679A|\u62DB|\u5361|\u5E45|\u8A00|\u8857|\u6307|\u8F88|\u5BA4|\u5806|\u4F5C|\u5C01|\u53A2|\u58F0|\u57CE|\u65CF|\u5708|\u8138|\u76EE|\u6392|\u6A21|\u5915|\u7F51|\u5E02|\u5411|\u6781|\u9A71|\u79D1|\u63D0|\u6838|\u6751|\u5BA1|\u5200|\u518C|\u4F8B|\u5173|\u7C92|\u5C40|\u5C71|\u5BF8|\u7897|\u77AC|\u8054|\u6E38|\u811A|\u5B85|\u7EBF|\u683C|\u5165|\u8D9F|\u8CAB|\u754C|\u793E|\u80A2|\u6280|\u6EF4|\u95EE|\u7B11|\u9662|\u5802|\u5C3A|\u5BE8|\u6863|\u4E3E|\u76D8|\u95E8|\u5BA2|\u9910|\u8258|\u6BDB|\u4E08|\u5251|\u66F2|\u4EFB|\u53F6|\u56E2|\u6D3E|\u5634|\u6865|\u62B9|\u679D|\u8D2F|\u4F0F|\u62F3|\u5217|\u673A|\u76D2|\u961F|\u8FDB\u5236|\u680B|\u5E2D|\u65A4|\u8BCD|\u51FB|\u9898|\u578B|\u5B97|\u67F1|\u94B1|\u62CD|\u5267|\u65EC|\u547D|\u6247|\u5339|\u6E56|\u58F6|\u89C9|\u53C9|\u6821|\u6CC9|\u5177|\u4E32|\u5C04|\u8BC1|\u5927\u6279|\u7403|\u6A2A|\u7AD6|\u5C0A|\u8F74|\u89C2|\u5BA1|\u77F3|\u675F|\u5F39|\u682A|\u9886|\u59D4|\u680F|\u70AE|\u9F0E|\u753A|\u5E06|\u6597|\u7F15|\u684C|\u9488|\u5E27|\u8F6C|\u843D|\u8DB3|\u68AF|\u53BF|\u6295|\u8BD5|\u5E2E|\u638C|\u7BAD|\u76CF|\u9505|\u8BA1|\u5927\u7247|\u5B66\u671F|\u622A|\u9876|\u5C4B|\u4ECB|\u5251|\u6842|\u65D7|\u5DF7|\u6325|\u6643|\u5458|\u7FFC|\u6C60|\u56F4|\u52FA|\u5BBF|\u5E93|\u68D2|\u51A0|\u6811|\u7F38|\u4F19|\u7B7E|\u63FD|\u5768|\u5319|\u6869|\u987F|\u7EB8|\u9685|\u8BFA|\u6848|\u520A|\u5382|\u6746|\u88AD|\u4ED3|\u5E8A|\u62C5|\u5E16|\u5C4F|\u76CF|\u8154|\u8D34|\u7A8D|\u6D1E|\u5186|\u576A|\u6CE1|\u56ED|\u9986|\u6E7E|\u62E8|\u67AA|\u804C|\u4EAD|\u80CC|\u7DAD|[\u8B77\u62A4\u6238]|\u6A13|\u9375|\u908A|\u5834|\u7DDA|\u985E|\u7D44|\u8072|\u5E36|\u6230|\u8F2A|\u958B|\u7DF4|\u74B0|\u8655|\u88CF|\u9AD4|\u96BB|\u968E|\u5074|\u5247|\u6383|\u8ECD|\u5C45|\u5CF6|\u8AB2|\u5F0F|\u5340|\u9023|\u55AE|\u7D72|\u6B72|\u5EC2|\u8072|\u81C9|\u7DB2|\u6975|\u9A45|\u5BE9|\u518A|\u95DC|\u806F|\u904A|\u8173|\u7DDA|\u8CAB|\u554F|\u6A94|\u8209|\u76E4|\u9580|\u528D|\u66F2|\u4EFB|\u8449|\u5718|\u6D3E|\u5634|\u6A4B|\u62B9|\u679D|\u8CAB|\u4F0F|\u62F3|\u5217|\u6A5F|\u76D2|\u968A|\u9032\u5236|\u68DF|\u8A5E|\u64CA|\u984C|\u9322|\u58FA|\u89BA|\u8B49|\u5927\u6279|\u7403|\u6A6B|\u8C4E|\u5C0A|\u8EF8|\u89C0|\u5BE9|\u5F48|\u9818|\u59D4|\u6B04|\u91D8|\u9B25|\u7E37|\u91DD|\u5E40|\u8F49|\u7E23|\u8A66|\u5E6B|\u76DE|\u934B|\u8A08|\u5B78\u671F|\u622A|\u9802|\u4ECB|\u528D|\u6842|\u65D7|\u5DF7|\u63EE|\u6643|\u54E1|\u570D|\u52FA|\u5BBF|\u5EAB|\u68D2|\u51A0|\u6A39|\u7F38|\u5925|\u7C3D|\u652C|\u6A01|\u9813|\u7D19|\u9685|\u8AFE|\u5EE0|\u687F|\u8972|\u5009|\u64D4|\u76DE|\u8CBC|\u7AC5|\u6D1E|\u576A|\u6CE1|\u54E1|\u9928|\u7063|\u64A5|\u69CD|\u8077|\\s|$)`;
  ChineseNumeric2.NotSingleRegex = `((${ChineseNumeric2.ZeroToNineIntegerRegex}|${ChineseNumeric2.ZeroToNineFullHalfRegex}|[\u5341\u62FE])\\s*(\\s*[\u591A\u51E0\u5E7E\u4F59]?\\s*${ChineseNumeric2.RoundNumberIntegerRegex}){1,2}|[\u5341\u62FE]|${ChineseNumeric2.RoundNumberIntegerRegex}\\s*(${ChineseNumeric2.ZeroToNineIntegerRegex}|${ChineseNumeric2.ZeroToNineFullHalfRegex}|\u96F6))\\s*(((${ChineseNumeric2.ZeroToNineIntegerRegex}|${ChineseNumeric2.ZeroToNineFullHalfRegex})\\s*(\\s*[\u591A\u51E0\u5E7E\u4F59]?\\s*${ChineseNumeric2.RoundNumberIntegerRegex}){1,2}|\u96F6)\\s*)*${ChineseNumeric2.ZeroToNineIntegerRegex}?`;
  ChineseNumeric2.SingleRegex = `(?<!${ChineseNumeric2.ZeroToNineIntegerRegex})${ChineseNumeric2.ZeroToNineIntegerRegex}(?=${ChineseNumeric2.WhiteListRegex})`;
  ChineseNumeric2.AllIntRegex = `(((${ChineseNumeric2.ZeroToNineIntegerRegex}|${ChineseNumeric2.ZeroToNineFullHalfRegex}|[\u5341\u62FE])\\s*(\\s*[\u591A\u51E0\u5E7E\u4F59]?\\s*${ChineseNumeric2.RoundNumberIntegerRegex}){1,2}|[\u5341\u62FE]|${ChineseNumeric2.RoundNumberIntegerRegex}\\s*(${ChineseNumeric2.ZeroToNineIntegerRegex}|${ChineseNumeric2.ZeroToNineFullHalfRegex}|\u96F6))\\s*(((${ChineseNumeric2.ZeroToNineIntegerRegex}|${ChineseNumeric2.ZeroToNineFullHalfRegex})\\s*(\\s*[\u591A\u51E0\u5E7E\u4F59]?\\s*${ChineseNumeric2.RoundNumberIntegerRegex}){1,2}|\u96F6)\\s*)*${ChineseNumeric2.ZeroToNineIntegerRegex}?|${ChineseNumeric2.ZeroToNineIntegerRegex})`;
  ChineseNumeric2.NumbersSpecialsChars = `((${ChineseNumeric2.NegativeNumberTermsRegexNum}|${ChineseNumeric2.NegativeNumberTermsRegex})\\s*)?${ChineseNumeric2.ZeroToNineFullHalfRegex}+`;
  ChineseNumeric2.NumbersSpecialsCharsWithSuffix = `${ChineseNumeric2.NegativeNumberTermsRegexNum}?${ChineseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)`;
  ChineseNumeric2.DottedNumbersSpecialsChar = `${ChineseNumeric2.NegativeNumberTermsRegexNum}?${ChineseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C]${ChineseNumeric2.ZeroToNineFullHalfRegex}{3})+`;
  ChineseNumeric2.NumbersWithHalfDozen = `\u534A(${ChineseNumeric2.RoundNumberIntegerRegex}|\u6253)`;
  ChineseNumeric2.NumbersWithDozen = `${ChineseNumeric2.AllIntRegex}[\u53CC\u96D9\u5BF9\u5C0D\u6253](?!${ChineseNumeric2.AllIntRegex})`;
  ChineseNumeric2.PointRegexStr = `[\u70B9\u9EDE\\.\uFF0E]`;
  ChineseNumeric2.AllFloatRegex = `${ChineseNumeric2.NegativeNumberTermsRegex}?${ChineseNumeric2.AllIntRegex}\\s*${ChineseNumeric2.PointRegexStr}\\s*[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u96F6\u58F9\u8D30\u8CB3\u53C1\u8086\u4F0D\u9646\u9678\u67D2\u634C\u7396\u3007](\\s*${ChineseNumeric2.ZeroToNineIntegerRegex})*`;
  ChineseNumeric2.NumbersWithAllowListRegex = `(?<![\u767E\u4F70]\\s*\u5206\\s*\u4E4B\\s*(${ChineseNumeric2.AllIntRegex}[\u70B9\u9EDE]*|${ChineseNumeric2.AllFloatRegex})*)${ChineseNumeric2.NegativeNumberTermsRegex}?(${ChineseNumeric2.NotSingleRegex}|${ChineseNumeric2.SingleRegex})(?!(${ChineseNumeric2.AllIntRegex}*([\u70B9\u9EDE]${ChineseNumeric2.ZeroToNineIntegerRegex}+)*|${ChineseNumeric2.AllFloatRegex})*\\s*[\u4E2A\u500B]\\s*[\u767E\u4F70]\\s*\u5206\\s*[\u70B9\u9EDE])`;
  ChineseNumeric2.NumbersAggressiveRegex = `(?<![\u767E\u4F70]\\s*\u5206\\s*\u4E4B\\s*(${ChineseNumeric2.AllIntRegex}[\u70B9\u9EDE]*|${ChineseNumeric2.AllFloatRegex})*)${ChineseNumeric2.NegativeNumberTermsRegex}?${ChineseNumeric2.AllIntRegex}(?!(${ChineseNumeric2.AllIntRegex}*([\u70B9\u9EDE]${ChineseNumeric2.ZeroToNineIntegerRegex}+)*|${ChineseNumeric2.AllFloatRegex})*\\s*[\u4E2A\u500B]\\s*[\u767E\u4F70]\\s*\u5206\\s*[\u70B9\u9EDE])`;
  ChineseNumeric2.PointRegex = `${ChineseNumeric2.PointRegexStr}`;
  ChineseNumeric2.DoubleSpecialsChars = `(?<!(${ChineseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}*))(${ChineseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+(?!${ChineseNumeric2.ZeroToNineFullHalfRegex}*[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+)`;
  ChineseNumeric2.DoubleSpecialsCharsWithNegatives = `(?<!(${ChineseNumeric2.ZeroToNineFullHalfRegex}+|\\.\\.|\uFF0E\uFF0E))(${ChineseNumeric2.NegativeNumberTermsRegexNum}\\s*)?[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+(?!${ChineseNumeric2.ZeroToNineFullHalfRegex}*([\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+))`;
  ChineseNumeric2.SimpleDoubleSpecialsChars = `(${ChineseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C]${ChineseNumeric2.ZeroToNineFullHalfRegex}{3})+[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+`;
  ChineseNumeric2.DoubleWithMultiplierRegex = `(${ChineseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)`;
  ChineseNumeric2.DoubleWithThousandsRegex = `${ChineseNumeric2.NegativeNumberTermsRegex}?${ChineseNumeric2.ZeroToNineFullHalfRegex}+([\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+)?\\s*[\u591A\u51E0\u5E7E\u4F59]?[\u4E07\u4EBF\u842C\u5104]{1,2}`;
  ChineseNumeric2.DoubleAllFloatRegex = `(?<![\u767E\u4F70]\\s*\u5206\\s*\u4E4B\\s*((${ChineseNumeric2.AllIntRegex}[\u70B9\u9EDE]*)|${ChineseNumeric2.AllFloatRegex})*)${ChineseNumeric2.AllFloatRegex}(?!${ChineseNumeric2.ZeroToNineIntegerRegex}*\\s*[\u4E2A\u500B]\\s*[\u767E\u4F70]\\s*\u5206\\s*[\u70B9\u9EDE])`;
  ChineseNumeric2.DoubleExponentialNotationRegex = `(?<!${ChineseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E])(${ChineseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric2.ZeroToNineFullHalfRegex}+([\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+)?e(([-\uFF0D+\uFF0B]*[1-9\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19]${ChineseNumeric2.ZeroToNineFullHalfRegex}*)|[0\uFF10](?!${ChineseNumeric2.ZeroToNineFullHalfRegex}+))`;
  ChineseNumeric2.DoubleScientificNotationRegex = `(?<!${ChineseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E])(${ChineseNumeric2.NegativeNumberTermsRegexNum}\\s*)?(${ChineseNumeric2.ZeroToNineFullHalfRegex}+([\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+)?)\\^([-\uFF0D+\uFF0B]*[1-9\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19]${ChineseNumeric2.ZeroToNineFullHalfRegex}*)`;
  ChineseNumeric2.OrdinalRegex = `\u7B2C${ChineseNumeric2.AllIntRegex}`;
  ChineseNumeric2.OrdinalNumbersRegex = `\u7B2C${ChineseNumeric2.ZeroToNineFullHalfRegex}+`;
  ChineseNumeric2.AllFractionNumber = `${ChineseNumeric2.NegativeNumberTermsRegex}?((${ChineseNumeric2.ZeroToNineFullHalfRegex}+|${ChineseNumeric2.AllIntRegex})\\s*\u53C8\\s*)?${ChineseNumeric2.NegativeNumberTermsRegex}?(${ChineseNumeric2.ZeroToNineFullHalfRegex}+|${ChineseNumeric2.AllIntRegex})\\s*\u5206\\s*\u4E4B\\s*${ChineseNumeric2.NegativeNumberTermsRegex}?(${ChineseNumeric2.ZeroToNineFullHalfRegex}+|${ChineseNumeric2.AllIntRegex})`;
  ChineseNumeric2.FractionNotationSpecialsCharsRegex = `(${ChineseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric2.ZeroToNineFullHalfRegex}+\\s+${ChineseNumeric2.ZeroToNineFullHalfRegex}+[/\uFF0F]${ChineseNumeric2.ZeroToNineFullHalfRegex}+`;
  ChineseNumeric2.FractionNotationRegex = `(${ChineseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric2.ZeroToNineFullHalfRegex}+[/\uFF0F]${ChineseNumeric2.ZeroToNineFullHalfRegex}+`;
  ChineseNumeric2.PercentagePointRegex = `(?<!${ChineseNumeric2.AllIntRegex})(${ChineseNumeric2.AllFloatRegex}|${ChineseNumeric2.AllIntRegex})\\s*[\u4E2A\u500B]\\s*[\u767E\u4F70]\\s*\u5206\\s*[\u70B9\u9EDE]`;
  ChineseNumeric2.SimplePercentageRegex = `(?<!${ChineseNumeric2.ZeroToNineIntegerRegex})[\u767E\u4F70]\\s*\u5206\\s*\u4E4B\\s*(${ChineseNumeric2.AllFloatRegex}|${ChineseNumeric2.AllIntRegex}|[\u767E\u4F70])(?!${ChineseNumeric2.AllIntRegex})`;
  ChineseNumeric2.NumbersPercentagePointRegex = `(?<!${ChineseNumeric2.ZeroToNineIntegerRegex})[\u767E\u4F70]\\s*\u5206\\s*\u4E4B\\s*${ChineseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+(?!([\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+))`;
  ChineseNumeric2.NumbersPercentageWithSeparatorRegex = `(?<!${ChineseNumeric2.ZeroToNineIntegerRegex})[\u767E\u4F70]\\s*\u5206\\s*\u4E4B\\s*${ChineseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C]${ChineseNumeric2.ZeroToNineFullHalfRegex}{3})+[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+`;
  ChineseNumeric2.NumbersPercentageWithMultiplierRegex = `(?<!${ChineseNumeric2.ZeroToNineIntegerRegex})[\u767E\u4F70]\\s*\u5206\\s*\u4E4B\\s*${ChineseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)`;
  ChineseNumeric2.FractionPercentagePointRegex = `(?<!(${ChineseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]))${ChineseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+(?!([\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+))\\s*[\u4E2A\u500B]\\s*[\u767E\u4F70]\\s*\u5206\\s*[\u70B9\u9EDE]`;
  ChineseNumeric2.FractionPercentageWithSeparatorRegex = `${ChineseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C]${ChineseNumeric2.ZeroToNineFullHalfRegex}{3})+[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+\\s*[\u4E2A\u500B]\\s*[\u767E\u4F70]\\s*\u5206\\s*[\u70B9\u9EDE]`;
  ChineseNumeric2.FractionPercentageWithMultiplierRegex = `${ChineseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)\\s*[\u4E2A\u500B]\\s*[\u767E\u4F70]\\s*\u5206\\s*[\u70B9\u9EDE]`;
  ChineseNumeric2.SimpleNumbersPercentageRegex = `(?<!${ChineseNumeric2.ZeroToNineIntegerRegex})[\u767E\u4F70]\\s*\u5206\\s*\u4E4B\\s*${ChineseNumeric2.ZeroToNineFullHalfRegex}+(?!([\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+))`;
  ChineseNumeric2.SimpleNumbersPercentageWithMultiplierRegex = `(?<!${ChineseNumeric2.ZeroToNineIntegerRegex})[\u767E\u4F70]\\s*\u5206\\s*\u4E4B\\s*${ChineseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)`;
  ChineseNumeric2.SimpleNumbersPercentagePointRegex = `(?!${ChineseNumeric2.ZeroToNineIntegerRegex})[\u767E\u4F70]\\s*\u5206\\s*\u4E4B\\s*${ChineseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C]${ChineseNumeric2.ZeroToNineFullHalfRegex}{3})+`;
  ChineseNumeric2.IntegerPercentageRegex = `${ChineseNumeric2.ZeroToNineFullHalfRegex}+\\s*[\u4E2A\u500B]\\s*[\u767E\u4F70]\\s*\u5206\\s*[\u70B9\u9EDE]`;
  ChineseNumeric2.IntegerPercentageWithMultiplierRegex = `${ChineseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)\\s*[\u4E2A\u500B]\\s*[\u767E\u4F70]\\s*\u5206\\s*[\u70B9\u9EDE]`;
  ChineseNumeric2.NumbersFractionPercentageRegex = `${ChineseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C]${ChineseNumeric2.ZeroToNineFullHalfRegex}{3})+\\s*[\u4E2A\u500B]\\s*[\u767E\u4F70]\\s*\u5206\\s*[\u70B9\u9EDE]`;
  ChineseNumeric2.SimpleIntegerPercentageRegex = `(?<!%|\\d)${ChineseNumeric2.NegativeNumberTermsRegexNum}?${ChineseNumeric2.ZeroToNineFullHalfRegex}+([\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}+)?(\\s*)[\uFF05%](?!\\d)`;
  ChineseNumeric2.NumbersFoldsPercentageRegex = `${ChineseNumeric2.ZeroToNineFullHalfRegex}(([\\.\uFF0E]?|\\s*)${ChineseNumeric2.ZeroToNineFullHalfRegex})?\\s*\u6298`;
  ChineseNumeric2.FoldsPercentageRegex = `${ChineseNumeric2.ZeroToNineIntegerRegex}(\\s*[\u70B9\u9EDE]?\\s*${ChineseNumeric2.ZeroToNineIntegerRegex})?\\s*\u6298`;
  ChineseNumeric2.SimpleFoldsPercentageRegex = `${ChineseNumeric2.ZeroToNineFullHalfRegex}\\s*\u6210(\\s*(\u534A|${ChineseNumeric2.ZeroToNineFullHalfRegex}))?`;
  ChineseNumeric2.SpecialsPercentageRegex = `(${ChineseNumeric2.ZeroToNineIntegerRegex}|[\u5341\u62FE])\\s*\u6210(\\s*(\u534A|${ChineseNumeric2.ZeroToNineIntegerRegex}))?`;
  ChineseNumeric2.NumbersSpecialsPercentageRegex = `(${ChineseNumeric2.ZeroToNineFullHalfRegex}[\\.\uFF0E]${ChineseNumeric2.ZeroToNineFullHalfRegex}|[1\uFF11][0\uFF10])\\s*\u6210`;
  ChineseNumeric2.SimpleSpecialsPercentageRegex = `${ChineseNumeric2.ZeroToNineIntegerRegex}\\s*[\u70B9\u9EDE]\\s*${ChineseNumeric2.ZeroToNineIntegerRegex}\\s*\u6210`;
  ChineseNumeric2.SpecialsFoldsPercentageRegex = `\u534A\\s*\u6210|(?<=\u6253)[\u5BF9\u5C0D]\\s*\u6298|\u534A\\s*\u6298`;
  ChineseNumeric2.TillRegex = `(\u5230|\u81F3|--|-|\u2014|\u2014\u2014|~|\u2013)`;
  ChineseNumeric2.MoreRegex = `(\u5927\u4E8E|\u591A\u4E8E|\u9AD8\u4E8E|\u8D85\u8FC7|\u5927\u65BC|\u591A\u65BC|\u9AD8\u65BC|\u8D85\u904E|>)`;
  ChineseNumeric2.LessRegex = `(\u5C0F\u4E8E|\u5C11\u4E8E|\u4F4E\u4E8E|\u5C0F\u65BC|\u5C11\u65BC|\u4F4E\u65BC|\u4E0D\u5230|\u4E0D\u8DB3|<)`;
  ChineseNumeric2.EqualRegex = `(\u7B49\u4E8E|\u7B49\u65BC|=)`;
  ChineseNumeric2.MoreOrEqual = `((${ChineseNumeric2.MoreRegex}\\s*(\u6216|\u6216\u8005)?\\s*${ChineseNumeric2.EqualRegex})|\u81F3\u5C11|\u6700\u5C11|\u4E0D${ChineseNumeric2.LessRegex})`;
  ChineseNumeric2.MoreOrEqualSuffix = `(\u6216|\u6216\u8005)\\s*(\u4EE5\u4E0A|\u4E4B\u4E0A|\u66F4[\u5927\u591A\u9AD8])`;
  ChineseNumeric2.LessOrEqual = `((${ChineseNumeric2.LessRegex}\\s*(\u6216|\u6216\u8005)?\\s*${ChineseNumeric2.EqualRegex})|\u81F3\u591A|\u6700\u591A|\u4E0D${ChineseNumeric2.MoreRegex})`;
  ChineseNumeric2.LessOrEqualSuffix = `(\u6216|\u6216\u8005)\\s*(\u4EE5\u4E0B|\u4E4B\u4E0B|\u66F4[\u5C0F\u5C11\u4F4E])`;
  ChineseNumeric2.OneNumberRangeMoreRegex1 = `(${ChineseNumeric2.MoreOrEqual}|${ChineseNumeric2.MoreRegex})\\s*(?<number1>((?!([\u5E76\u4E14\u800C\u4E26\u7684\u540C\u6642\u65F6]|(\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)`;
  ChineseNumeric2.OneNumberRangeMoreRegex2 = `\u6BD4\\s*(?<number1>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*\u66F4?[\u5927\u591A\u9AD8]`;
  ChineseNumeric2.OneNumberRangeMoreRegex3 = `(?<number1>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002|[\u6216\u8005])).)+)\\s*(\u6216|\u6216\u8005)?\\s*([\u591A\u51E0\u4F59\u5E7E\u9918]|\u4EE5\u4E0A|\u4E4B\u4E0A|\u66F4[\u5927\u591A\u9AD8])(?![\u4E07\u4EBF\u842C\u5104]{1,2})`;
  ChineseNumeric2.OneNumberRangeLessRegex1 = `(${ChineseNumeric2.LessOrEqual}|${ChineseNumeric2.LessRegex})\\s*(?<number2>((?!([\u5E76\u4E14\u800C\u4E26\u7684\u540C\u6642\u65F6]|(\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)`;
  ChineseNumeric2.OneNumberRangeLessRegex2 = `\u6BD4\\s*(?<number2>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*\u66F4?[\u5C0F\u5C11\u4F4E]`;
  ChineseNumeric2.OneNumberRangeLessRegex3 = `(?<number2>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002|[\u6216\u8005])).)+)\\s*(\u6216|\u6216\u8005)?\\s*(\u4EE5\u4E0B|\u4E4B\u4E0B|\u66F4[\u5C0F\u5C11\u4F4E])`;
  ChineseNumeric2.OneNumberRangeMoreSeparateRegex = `^[.]`;
  ChineseNumeric2.OneNumberRangeLessSeparateRegex = `^[.]`;
  ChineseNumeric2.OneNumberRangeEqualRegex = `${ChineseNumeric2.EqualRegex}\\s*(?<number1>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)`;
  ChineseNumeric2.TwoNumberRangeRegex1 = `((\u4F4D\u4E8E|\u5728|\u4F4D\u65BC)|(?=(\\d|\\+|\\-)))\\s*(?<number1>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*(\u548C|\u4E0E|\u8207|${ChineseNumeric2.TillRegex})\\s*(?<number2>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002))[^\u4E4B])+)\\s*(\u4E4B)?(\u95F4|\u9593)`;
  ChineseNumeric2.TwoNumberRangeRegex2 = `(${ChineseNumeric2.OneNumberRangeMoreRegex1}|${ChineseNumeric2.OneNumberRangeMoreRegex2}|${ChineseNumeric2.OneNumberRangeMoreRegex3})\\s*(\u4E14|\u5E76\u4E14|\u800C\u4E14|\u4E26\u4E14|((\u7684)?\u540C\u6642)|((\u7684)?\u540C\u65F6)|\uFF0C)?\\s*(${ChineseNumeric2.OneNumberRangeLessRegex1}|${ChineseNumeric2.OneNumberRangeLessRegex2}|${ChineseNumeric2.OneNumberRangeLessRegex3})`;
  ChineseNumeric2.TwoNumberRangeRegex3 = `(${ChineseNumeric2.OneNumberRangeLessRegex1}|${ChineseNumeric2.OneNumberRangeLessRegex2}|${ChineseNumeric2.OneNumberRangeLessRegex3})\\s*(\u4E14|\u5E76\u4E14|\u800C\u4E14|\u4E26\u4E14|((\u7684)?\u540C\u6642)|((\u7684)?\u540C\u65F6)|\uFF0C)?\\s*(${ChineseNumeric2.OneNumberRangeMoreRegex1}|${ChineseNumeric2.OneNumberRangeMoreRegex2}|${ChineseNumeric2.OneNumberRangeMoreRegex3})`;
  ChineseNumeric2.TwoNumberRangeRegex4 = `(?<number1>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*${ChineseNumeric2.TillRegex}\\s*(?<number2>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)`;
  ChineseNumeric2.AmbiguousFractionConnectorsRegex = `^[.]`;
})(exports.ChineseNumeric || (exports.ChineseNumeric = {}));
var ChineseNumberParserConfiguration = class {
  constructor(ci) {
    if (!ci) {
      ci = new CultureInfo(Culture.Chinese);
    }
    this.cultureInfo = ci;
    this.langMarker = exports.ChineseNumeric.LangMarker;
    this.decimalSeparatorChar = exports.ChineseNumeric.DecimalSeparatorChar;
    this.fractionMarkerToken = exports.ChineseNumeric.FractionMarkerToken;
    this.nonDecimalSeparatorChar = exports.ChineseNumeric.NonDecimalSeparatorChar;
    this.halfADozenText = exports.ChineseNumeric.HalfADozenText;
    this.wordSeparatorToken = exports.ChineseNumeric.WordSeparatorToken;
    this.writtenDecimalSeparatorTexts = [];
    this.writtenGroupSeparatorTexts = [];
    this.writtenIntegerSeparatorTexts = [];
    this.writtenFractionSeparatorTexts = [];
    this.cardinalNumberMap = /* @__PURE__ */ new Map();
    this.ordinalNumberMap = /* @__PURE__ */ new Map();
    this.roundNumberMap = exports.ChineseNumeric.RoundNumberMap;
    this.halfADozenRegex = null;
    this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DigitalNumberRegex, "gis");
    this.zeroToNineMap = exports.ChineseNumeric.ZeroToNineMap;
    this.roundNumberMapChar = exports.ChineseNumeric.RoundNumberMapChar;
    this.fullToHalfMap = exports.ChineseNumeric.FullToHalfMap;
    this.tratoSimMap = exports.ChineseNumeric.TratoSimMap;
    this.unitMap = exports.ChineseNumeric.UnitMap;
    this.roundDirectList = exports.ChineseNumeric.RoundDirectList;
    this.digitNumRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DigitNumRegex, "gis");
    this.dozenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DozenRegex, "gis");
    this.percentageRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.PercentageRegex, "gis");
    this.doubleAndRoundRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DoubleAndRoundRegex, "gis");
    this.fracSplitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.FracSplitRegex, "gis");
    this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NegativeNumberSignRegex, "gis");
    this.pointRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.PointRegex, "gis");
    this.speGetNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SpeGetNumberRegex, "gis");
    this.pairRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.PairRegex, "gis");
    this.roundNumberIntegerRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.RoundNumberIntegerRegex, "gis");
  }
  normalizeTokenSet(tokens, context) {
    return tokens;
  }
  resolveCompositeNumber(numberStr) {
    return 0;
  }
};

// recognizers/recognizers-number/src/resources/japaneseNumeric.ts
exports.JapaneseNumeric = void 0;
((JapaneseNumeric2) => {
  JapaneseNumeric2.LangMarker = "";
  JapaneseNumeric2.DecimalSeparatorChar = ".";
  JapaneseNumeric2.FractionMarkerToken = "";
  JapaneseNumeric2.NonDecimalSeparatorChar = " ";
  JapaneseNumeric2.HalfADozenText = "";
  JapaneseNumeric2.WordSeparatorToken = "";
  JapaneseNumeric2.RoundNumberMap = /* @__PURE__ */ new Map([["k", 1e3], ["m", 1e6], ["g", 1e9], ["t", 1e12]]);
  JapaneseNumeric2.RoundNumberMapChar = /* @__PURE__ */ new Map([["\u5341", 10], ["\u767E", 100], ["\u5343", 1e3], ["\u4E07", 1e4], ["\u5104", 1e8], ["\u5146", 1e12]]);
  JapaneseNumeric2.ZeroToNineMap = /* @__PURE__ */ new Map([["0", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["\u96F6", 0], ["\u4E00", 1], ["\u4E8C", 2], ["\u4E09", 3], ["\u56DB", 4], ["\u4E94", 5], ["\u516D", 6], ["\u4E03", 7], ["\u516B", 8], ["\u4E5D", 9], ["\u534A", 0.5]]);
  JapaneseNumeric2.FullToHalfMap = /* @__PURE__ */ new Map([["\uFF10", "0"], ["\uFF11", "1"], ["\uFF12", "2"], ["\uFF13", "3"], ["\uFF14", "4"], ["\uFF15", "5"], ["\uFF16", "6"], ["\uFF17", "7"], ["\uFF18", "8"], ["\uFF19", "9"], ["\uFF0F", "/"], ["\uFF0D", "-"], ["\uFF0C", "'"], ["\u3001", "'"], ["\uFF27", "G"], ["\uFF2D", "M"], ["\uFF34", "T"], ["\uFF2B", "K"], ["\uFF4B", "k"], ["\uFF0E", "."]]);
  JapaneseNumeric2.UnitMap = /* @__PURE__ */ new Map([["\u4E07\u4E07", "\u5104"], ["\u5104\u4E07", "\u5146"], ["\u4E07\u5104", "\u5146"], [" ", ""]]);
  JapaneseNumeric2.RoundDirectList = ["\u4E07", "\u5104", "\u5146"];
  JapaneseNumeric2.DigitalNumberRegex = `((?<=(\\d|\\b))(k|t|m|g)(?=\\b))`;
  JapaneseNumeric2.ZeroToNineFullHalfRegex = `[\\d\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19\uFF10]`;
  JapaneseNumeric2.DigitNumRegex = `${JapaneseNumeric2.ZeroToNineFullHalfRegex}+`;
  JapaneseNumeric2.DozenRegex = `.*\u30C0\u30FC\u30B9$`;
  JapaneseNumeric2.PercentageRegex = `.+(?=\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8)|.*(?=[\uFF05%])`;
  JapaneseNumeric2.DoubleAndRoundRegex = `${JapaneseNumeric2.ZeroToNineFullHalfRegex}+(\\.${JapaneseNumeric2.ZeroToNineFullHalfRegex}+)?\\s*[\u4E07\u5104]{1,2}(\\s*(\u4EE5\u4E0A))?`;
  JapaneseNumeric2.FracSplitRegex = `[\u306F\u3068]|\u5206\\s*\u306E`;
  JapaneseNumeric2.ZeroToNineIntegerRegex = `[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D]`;
  JapaneseNumeric2.NegativeNumberTermsRegex = `(\u30DE\\s*\u30A4\\s*\u30CA\\s*\u30B9)`;
  JapaneseNumeric2.NegativeNumberTermsRegexNum = `(?<!(\\d+\\s*)|[-\uFF0D])[-\uFF0D]`;
  JapaneseNumeric2.NegativeNumberSignRegex = `^${JapaneseNumeric2.NegativeNumberTermsRegex}.*|^${JapaneseNumeric2.NegativeNumberTermsRegexNum}.*`;
  JapaneseNumeric2.SpeGetNumberRegex = `${JapaneseNumeric2.ZeroToNineFullHalfRegex}|${JapaneseNumeric2.ZeroToNineIntegerRegex}|[\u534A\u5BFE]|[\u5206\u5398]`;
  JapaneseNumeric2.PairRegex = ".*[\u5BFE\u81B3\u8DB3]$";
  JapaneseNumeric2.RoundNumberIntegerRegex = `[\u5341\u767E\u5343\u4E07\u5104\u5146]`;
  JapaneseNumeric2.WhiteListRegex = `(\u3002|\uFF0C|\u3001|\uFF08|\uFF09|\u201D\uFF5C\u56FD|\u9031\u9593|\u6642\u9593|\u6642|\u5339|\u30AD\u30ED|\u30C8\u30F3|\u5E74|\u500B|\u8DB3|\u672C|\\s|$)`;
  JapaneseNumeric2.NotSingleRegex = `(?<!(\u7B2C|\u3060\u3044))((${JapaneseNumeric2.RoundNumberIntegerRegex}+(${JapaneseNumeric2.ZeroToNineIntegerRegex}+|${JapaneseNumeric2.ZeroToNineFullHalfRegex}+|\u5341)\\s*))|((${JapaneseNumeric2.ZeroToNineIntegerRegex}+|${JapaneseNumeric2.ZeroToNineFullHalfRegex}+|\u5341)\\s*(${JapaneseNumeric2.RoundNumberIntegerRegex}\\s*){1,2})\\s*(([\u96F6]?(${JapaneseNumeric2.ZeroToNineIntegerRegex}+|${JapaneseNumeric2.ZeroToNineFullHalfRegex}+|\u5341)\\s*${JapaneseNumeric2.RoundNumberIntegerRegex}{0,1})\\s*)*\\s*(\\s*(\u4EE5\u4E0A)?)`;
  JapaneseNumeric2.SingleRegex = `((${JapaneseNumeric2.ZeroToNineIntegerRegex}|${JapaneseNumeric2.ZeroToNineFullHalfRegex}|\u5341)(?=${JapaneseNumeric2.WhiteListRegex}))`;
  JapaneseNumeric2.AllIntRegex = `((((${JapaneseNumeric2.ZeroToNineIntegerRegex}|[\u5341\u767E\u5343])\\s*${JapaneseNumeric2.RoundNumberIntegerRegex}*)|(${JapaneseNumeric2.ZeroToNineFullHalfRegex}\\s*${JapaneseNumeric2.RoundNumberIntegerRegex})){1,2}(\\s*[\u4EE5\u4E0A])?)`;
  JapaneseNumeric2.NumbersSpecialsChars = `((${JapaneseNumeric2.NegativeNumberTermsRegexNum}|${JapaneseNumeric2.NegativeNumberTermsRegex})\\s*)?${JapaneseNumeric2.ZeroToNineFullHalfRegex}+`;
  JapaneseNumeric2.NumbersSpecialsCharsWithSuffix = `${JapaneseNumeric2.NegativeNumberTermsRegexNum}?${JapaneseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)`;
  JapaneseNumeric2.DottedNumbersSpecialsChar = `${JapaneseNumeric2.NegativeNumberTermsRegexNum}?${JapaneseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C\u3001]${JapaneseNumeric2.ZeroToNineFullHalfRegex}{3})+`;
  JapaneseNumeric2.NumbersWithHalfDozen = `\u534A(${JapaneseNumeric2.RoundNumberIntegerRegex}|(\u30C0\u30FC\u30B9))`;
  JapaneseNumeric2.NumbersWithDozen = `${JapaneseNumeric2.AllIntRegex}(\u30C0\u30FC\u30B9)(?!${JapaneseNumeric2.AllIntRegex})`;
  JapaneseNumeric2.PointRegexStr = `[\\.\uFF0E]`;
  JapaneseNumeric2.AllFloatRegex = `${JapaneseNumeric2.NegativeNumberTermsRegex}?${JapaneseNumeric2.AllIntRegex}\\s*${JapaneseNumeric2.PointRegexStr}\\s*[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D](\\s*${JapaneseNumeric2.ZeroToNineIntegerRegex})*`;
  JapaneseNumeric2.NumbersWithAllowListRegex = `${JapaneseNumeric2.NegativeNumberTermsRegex}?(${JapaneseNumeric2.NotSingleRegex}|${JapaneseNumeric2.SingleRegex})(?!(${JapaneseNumeric2.AllIntRegex}*([\u3001.]${JapaneseNumeric2.ZeroToNineIntegerRegex}+)*|${JapaneseNumeric2.AllFloatRegex})*\\s*${JapaneseNumeric2.PercentageRegex}+)`;
  JapaneseNumeric2.NumbersAggressiveRegex = `((${JapaneseNumeric2.AllIntRegex})(?!(${JapaneseNumeric2.AllIntRegex}*([\u3001.]${JapaneseNumeric2.ZeroToNineIntegerRegex}+)*|${JapaneseNumeric2.AllFloatRegex})*\\s*${JapaneseNumeric2.PercentageRegex}*))`;
  JapaneseNumeric2.PointRegex = `${JapaneseNumeric2.PointRegexStr}`;
  JapaneseNumeric2.DoubleSpecialsChars = `(?<!(${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}*))(${JapaneseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+(?!${JapaneseNumeric2.ZeroToNineFullHalfRegex}*[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+)`;
  JapaneseNumeric2.DoubleSpecialsCharsWithNegatives = `(?<!(${JapaneseNumeric2.ZeroToNineFullHalfRegex}+|\\.\\.|\uFF0E\uFF0E))(${JapaneseNumeric2.NegativeNumberTermsRegexNum}\\s*)?[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+(?!${JapaneseNumeric2.ZeroToNineFullHalfRegex}*([\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+))`;
  JapaneseNumeric2.SimpleDoubleSpecialsChars = `(${JapaneseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C]${JapaneseNumeric2.ZeroToNineFullHalfRegex}{3})+[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+`;
  JapaneseNumeric2.DoubleWithMultiplierRegex = `(${JapaneseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)`;
  JapaneseNumeric2.DoubleWithThousandsRegex = `${JapaneseNumeric2.NegativeNumberTermsRegex}{0,1}\\s*(${JapaneseNumeric2.ZeroToNineFullHalfRegex}+([\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+)?\\s*[\u4E07\u4EBF\u842C\u5104]{1,2})`;
  JapaneseNumeric2.DoubleAllFloatRegex = `(?<!((${JapaneseNumeric2.AllIntRegex}[.]*)|${JapaneseNumeric2.AllFloatRegex})*)${JapaneseNumeric2.AllFloatRegex}(?!${JapaneseNumeric2.ZeroToNineIntegerRegex}*\\s*\u30D1\u30FC\u30BB\u30F3\u30C8)`;
  JapaneseNumeric2.DoubleExponentialNotationRegex = `(?<!${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E])(${JapaneseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric2.ZeroToNineFullHalfRegex}+([\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+)?e(([-\uFF0D+\uFF0B]*[1-9\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19]${JapaneseNumeric2.ZeroToNineFullHalfRegex}*)|[0\uFF10](?!${JapaneseNumeric2.ZeroToNineFullHalfRegex}+))`;
  JapaneseNumeric2.DoubleScientificNotationRegex = `(?<!${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E])(${JapaneseNumeric2.NegativeNumberTermsRegexNum}\\s*)?(${JapaneseNumeric2.ZeroToNineFullHalfRegex}+([\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+)?)\\^([-\uFF0D+\uFF0B]*[1-9\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19]${JapaneseNumeric2.ZeroToNineFullHalfRegex}*)`;
  JapaneseNumeric2.OrdinalRegex = `(\u7B2C|\u3060\u3044)${JapaneseNumeric2.AllIntRegex}`;
  JapaneseNumeric2.OrdinalNumbersRegex = `(\u7B2C|\u3060\u3044)${JapaneseNumeric2.ZeroToNineFullHalfRegex}+`;
  JapaneseNumeric2.AllFractionNumber = `${JapaneseNumeric2.NegativeNumberTermsRegex}{0,1}((${JapaneseNumeric2.ZeroToNineFullHalfRegex}+|${JapaneseNumeric2.AllIntRegex})\\s*[\u306F\u3068]{0,1}\\s*)?${JapaneseNumeric2.NegativeNumberTermsRegex}{0,1}(${JapaneseNumeric2.ZeroToNineFullHalfRegex}+|${JapaneseNumeric2.AllIntRegex})\\s*\u5206\\s*\u306E\\s*${JapaneseNumeric2.NegativeNumberTermsRegex}{0,1}(${JapaneseNumeric2.ZeroToNineFullHalfRegex}+|${JapaneseNumeric2.AllIntRegex})`;
  JapaneseNumeric2.FractionNotationSpecialsCharsRegex = `(${JapaneseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric2.ZeroToNineFullHalfRegex}+\\s+${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[/\uFF0F]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+`;
  JapaneseNumeric2.FractionNotationRegex = `(${JapaneseNumeric2.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[/\uFF0F]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+`;
  JapaneseNumeric2.PercentagePointRegex = `(?<!${JapaneseNumeric2.AllIntRegex})(${JapaneseNumeric2.AllFloatRegex}|${JapaneseNumeric2.AllIntRegex})\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.SimplePercentageRegex = `(${JapaneseNumeric2.AllFloatRegex}|${JapaneseNumeric2.AllIntRegex}|[\u767E])\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.NumbersPercentagePointRegex = `(${JapaneseNumeric2.ZeroToNineFullHalfRegex})+([\\.\uFF0E](${JapaneseNumeric2.ZeroToNineFullHalfRegex})+)?\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.NumbersPercentageWithSeparatorRegex = `(${JapaneseNumeric2.ZeroToNineFullHalfRegex}{1,3}[,\uFF0C\u3001]${JapaneseNumeric2.ZeroToNineFullHalfRegex}{3})+([\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+)*\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.NumbersPercentageWithMultiplierRegex = `(?<!${JapaneseNumeric2.ZeroToNineIntegerRegex})${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.FractionPercentagePointRegex = `(?<!(${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]))${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+(?!([\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+))\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.FractionPercentageWithSeparatorRegex = `${JapaneseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C\u3001]${JapaneseNumeric2.ZeroToNineFullHalfRegex}{3})+[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.FractionPercentageWithMultiplierRegex = `${JapaneseNumeric2.ZeroToNineFullHalfRegex}+[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.SimpleNumbersPercentageRegex = `(?<!${JapaneseNumeric2.ZeroToNineIntegerRegex})${JapaneseNumeric2.ZeroToNineFullHalfRegex}+\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8(?!([\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+))`;
  JapaneseNumeric2.SimpleNumbersPercentageWithMultiplierRegex = `(?<!${JapaneseNumeric2.ZeroToNineIntegerRegex})${JapaneseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.SimpleNumbersPercentagePointRegex = `(?!${JapaneseNumeric2.ZeroToNineIntegerRegex})${JapaneseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C]${JapaneseNumeric2.ZeroToNineFullHalfRegex}{3})+\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.IntegerPercentageRegex = `${JapaneseNumeric2.ZeroToNineFullHalfRegex}+\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.IntegerPercentageWithMultiplierRegex = `${JapaneseNumeric2.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|\uFF2D|\uFF2B|\uFF4B|\uFF27|\uFF34)\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.NumbersFractionPercentageRegex = `${JapaneseNumeric2.ZeroToNineFullHalfRegex}{1,3}([,\uFF0C]${JapaneseNumeric2.ZeroToNineFullHalfRegex}{3})+\\s*\u30D1\\s*\u30FC\\s*\u30BB\\s*\u30F3\\s*\u30C8`;
  JapaneseNumeric2.SimpleIntegerPercentageRegex = `${JapaneseNumeric2.NegativeNumberTermsRegexNum}?${JapaneseNumeric2.ZeroToNineFullHalfRegex}+([\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}+)?(\\s*)[\uFF05%]`;
  JapaneseNumeric2.NumbersFoldsPercentageRegex = `${JapaneseNumeric2.ZeroToNineFullHalfRegex}(([\\.\uFF0E]?|\\s*)${JapaneseNumeric2.ZeroToNineFullHalfRegex})?\\s*[\u306E]*\\s*\u5272\u5F15`;
  JapaneseNumeric2.FoldsPercentageRegex = `${JapaneseNumeric2.ZeroToNineIntegerRegex}(\\s*[.]?\\s*${JapaneseNumeric2.ZeroToNineIntegerRegex})?\\s*[\u306E]\\s*\u5272\u5F15`;
  JapaneseNumeric2.SimpleFoldsPercentageRegex = `${JapaneseNumeric2.ZeroToNineFullHalfRegex}\\s*\u5272(\\s*(\u534A|(${JapaneseNumeric2.ZeroToNineFullHalfRegex}\\s*\u5206\\s*${JapaneseNumeric2.ZeroToNineFullHalfRegex}\\s*\u5398)|${JapaneseNumeric2.ZeroToNineFullHalfRegex}))?`;
  JapaneseNumeric2.SpecialsPercentageRegex = `(${JapaneseNumeric2.ZeroToNineIntegerRegex}|[\u5341])\\s*\u5272(\\s*(\u534A|${JapaneseNumeric2.ZeroToNineIntegerRegex}))?`;
  JapaneseNumeric2.NumbersSpecialsPercentageRegex = `(${JapaneseNumeric2.ZeroToNineFullHalfRegex}[\\.\uFF0E]${JapaneseNumeric2.ZeroToNineFullHalfRegex}|[1\uFF11][0\uFF10])\\s*\u5272`;
  JapaneseNumeric2.SimpleSpecialsPercentageRegex = `${JapaneseNumeric2.ZeroToNineIntegerRegex}\\s*[.]\\s*${JapaneseNumeric2.ZeroToNineIntegerRegex}\\s*\u5272`;
  JapaneseNumeric2.SpecialsFoldsPercentageRegex = `\u534A\\s*\u5206|(?<=\u30C0\u30FC\u30B9)`;
  JapaneseNumeric2.TillRegex = `(\u304B\u3089|--|-|\u2014|\u2014\u2014|~)`;
  JapaneseNumeric2.MoreRegex = `(\u5927\u306A\u308A|\u5927\u304D\u3044|\u9AD8\u3044|\u5927\u304D\u304F|>)`;
  JapaneseNumeric2.LessRegex = `(\u5C0F\u306A\u308A|\u5C0F\u3055\u3044|\u4F4E\u3044|<)`;
  JapaneseNumeric2.EqualRegex = `(\u7B49\u3057\u3044|\u30A4\u30B3\u30FC\u30EB|=)`;
  JapaneseNumeric2.MoreOrEqual = `((\u5927\u306A\u308A\u304B\u30A4\u30B3\u30FC\u30EB)|(\u5927\u304D\u3044\u304B\u30A4\u30B3\u30FC\u30EB)|(\u5927\u306A\u308A\u304B\u7B49\u3057\u3044)|(\u5927\u304D\u3044\u304B\u7B49\u3057\u3044)|\u5C0F\u3055\u304F\u306A\u3044|\u4EE5\u4E0A|\u6700\u4F4E)`;
  JapaneseNumeric2.MoreOrEqualSuffix = `(\u3088\u308A(\u5927\u306A\u308A\u30A4\u30B3\u30FC\u30EB|\u5C0F\u3055\u304F\u306A\u3044))`;
  JapaneseNumeric2.LessOrEqual = `((${JapaneseNumeric2.LessRegex}\\s*(\u6216|\u6216\u8005)?\\s*${JapaneseNumeric2.EqualRegex})|(\u5C0F\u306A\u308A\u304B\u30A4\u30B3\u30FC\u30EB)|(\u5C0F\u306A\u308A\u304B\u7B49\u3057\u3044)|(\u5C0F\u3055\u3044\u304B\u30A4\u30B3\u30FC\u30EB)|(\u5C0F\u3055\u3044\u304B\u7B49\u3057\u3044)|(\u5C0F\u3055\u3044\u304B\u7B49\u3057\u3044)|\u5927\u3055\u304F\u306A\u3044|\u4EE5\u4E0B|\u6700\u5927)`;
  JapaneseNumeric2.LessOrEqualSuffix = `(\u5C0F\u306A\u308A\u30A4\u30B3\u30FC\u30EB|\u5927\u3055\u304F\u306A\u3044)`;
  JapaneseNumeric2.OneNumberRangeMoreRegex1 = `(?<number1>((?!(((\uFF0C|\u3001)(?!\\d+))|((,|\u3001)(?!\\d+))|\u3002)).)+)\\s*((\u3088\u308A)\\s*((${JapaneseNumeric2.MoreOrEqual}|${JapaneseNumeric2.MoreRegex}))|\u8D85\u3048\u308B|\u3092\u8D85\u3048\u308B)`;
  JapaneseNumeric2.OneNumberRangeMoreRegex2 = `(?<number1>((?!((\uFF0C|\u3001(?!\\d+))|(,|\u3001(?!\\d+))|\u3002)).)+)\\s*(\u3088\u308A)?(\u5927\u306A\u308A)`;
  JapaneseNumeric2.OneNumberRangeMoreRegex3 = `(?<number1>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*(\u4EE5\u4E0A|\u6700\u4F4E)(?![\u4E07\u5104]{1,2})`;
  JapaneseNumeric2.OneNumberRangeMoreRegex4 = `(${JapaneseNumeric2.MoreOrEqual}|${JapaneseNumeric2.MoreRegex})\\s*(?<number1>((?!(\u3068|\u306F|((\u3068)?\u540C\u6642\u306B)|((\u3068)?\u305D\u3057\u3066)|\u304C|\uFF0C|\u3001|,|(\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)`;
  JapaneseNumeric2.OneNumberRangeMoreSeparateRegex = `^[.]`;
  JapaneseNumeric2.OneNumberRangeLessSeparateRegex = `^[.]`;
  JapaneseNumeric2.OneNumberRangeLessRegex1 = `(?<number2>((?!(((\uFF0C|\u3001)(?!\\d+))|((,|\u3001)(?!\\d+))|\u3002)).)+)\\s*(\u3088\u308A)\\s*(${JapaneseNumeric2.LessOrEqual}|${JapaneseNumeric2.LessRegex})`;
  JapaneseNumeric2.OneNumberRangeLessRegex2 = `(?<number2>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*(\u3088\u308A)?(\u5C0F\u306A)`;
  JapaneseNumeric2.OneNumberRangeLessRegex3 = `(?<number2>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*(\u4EE5\u4E0B|\u672A\u6E80)(?![\u4E07\u5104]{1,2})`;
  JapaneseNumeric2.OneNumberRangeLessRegex4 = `(${JapaneseNumeric2.LessOrEqual}|${JapaneseNumeric2.LessRegex})\\s*(?<number2>((?!(\u3068|\u306F|((\u3068)?\u540C\u6642\u306B)|((\u3068)?\u305D\u3057\u3066)|\u304C|\uFF0C|\u3001|,|(\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)`;
  JapaneseNumeric2.OneNumberRangeEqualRegex = `(((?<number1>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*(\u306B)\\s*${JapaneseNumeric2.EqualRegex})|(${JapaneseNumeric2.EqualRegex}\\s*(?<number1>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)))`;
  JapaneseNumeric2.TwoNumberRangeRegex1 = `(?<number1>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*(\u3068|${JapaneseNumeric2.TillRegex})\\s*(?<number2>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*(\u306E\u9593)`;
  JapaneseNumeric2.TwoNumberRangeRegex2 = `(${JapaneseNumeric2.OneNumberRangeMoreRegex1}|${JapaneseNumeric2.OneNumberRangeMoreRegex2}|${JapaneseNumeric2.OneNumberRangeMoreRegex3}|${JapaneseNumeric2.OneNumberRangeMoreRegex4})\\s*(\u3068|\u306F|((\u3068)?\u540C\u6642\u306B)|((\u3068)?\u305D\u3057\u3066)|\u304C|\uFF0C|\u3001|,)?\\s*(${JapaneseNumeric2.OneNumberRangeLessRegex1}|${JapaneseNumeric2.OneNumberRangeLessRegex2}|${JapaneseNumeric2.OneNumberRangeLessRegex3}|${JapaneseNumeric2.OneNumberRangeLessRegex4})`;
  JapaneseNumeric2.TwoNumberRangeRegex3 = `(${JapaneseNumeric2.OneNumberRangeLessRegex1}|${JapaneseNumeric2.OneNumberRangeLessRegex2}|${JapaneseNumeric2.OneNumberRangeLessRegex3}|${JapaneseNumeric2.OneNumberRangeLessRegex4})\\s*(\u3068|\u306F|((\u3068)?\u540C\u6642\u306B)|((\u3068)?\u305D\u3057\u3066)|\u304C|\uFF0C|\u3001|,)?\\s*(${JapaneseNumeric2.OneNumberRangeMoreRegex1}|${JapaneseNumeric2.OneNumberRangeMoreRegex2}|${JapaneseNumeric2.OneNumberRangeMoreRegex3}|${JapaneseNumeric2.OneNumberRangeMoreRegex4})`;
  JapaneseNumeric2.TwoNumberRangeRegex4 = `(?<number1>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)\\s*${JapaneseNumeric2.TillRegex}\\s*(?<number2>((?!((\uFF0C(?!\\d+))|(,(?!\\d+))|\u3002)).)+)`;
  JapaneseNumeric2.AmbiguousFractionConnectorsRegex = `^[.]`;
})(exports.JapaneseNumeric || (exports.JapaneseNumeric = {}));
var JapaneseNumberParserConfiguration = class {
  // readonly NumberOptions Options { get; }
  // readonly Regex FractionPrepositionRegex { get; }
  // readonly string NonDecimalSeparatorText 
  constructor(ci) {
    if (!ci) {
      ci = new CultureInfo(Culture.Japanese);
    }
    this.cultureInfo = ci;
    this.langMarker = exports.JapaneseNumeric.LangMarker;
    this.decimalSeparatorChar = exports.JapaneseNumeric.DecimalSeparatorChar;
    this.fractionMarkerToken = exports.JapaneseNumeric.FractionMarkerToken;
    this.nonDecimalSeparatorChar = exports.JapaneseNumeric.NonDecimalSeparatorChar;
    this.halfADozenText = exports.JapaneseNumeric.HalfADozenText;
    this.wordSeparatorToken = exports.JapaneseNumeric.WordSeparatorToken;
    this.writtenDecimalSeparatorTexts = [];
    this.writtenGroupSeparatorTexts = [];
    this.writtenIntegerSeparatorTexts = [];
    this.writtenFractionSeparatorTexts = [];
    this.cardinalNumberMap = /* @__PURE__ */ new Map();
    this.ordinalNumberMap = /* @__PURE__ */ new Map();
    this.roundNumberMap = exports.JapaneseNumeric.RoundNumberMap;
    this.halfADozenRegex = null;
    this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DigitalNumberRegex, "gis");
    this.zeroToNineMap = exports.JapaneseNumeric.ZeroToNineMap;
    this.roundNumberMapChar = exports.JapaneseNumeric.RoundNumberMapChar;
    this.fullToHalfMap = exports.JapaneseNumeric.FullToHalfMap;
    this.tratoSimMap = null;
    this.unitMap = exports.JapaneseNumeric.UnitMap;
    this.roundDirectList = exports.JapaneseNumeric.RoundDirectList;
    this.digitNumRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DigitNumRegex, "gis");
    this.dozenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DozenRegex, "gis");
    this.percentageRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.PercentageRegex, "gis");
    this.doubleAndRoundRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DoubleAndRoundRegex, "gis");
    this.fracSplitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.FracSplitRegex, "gis");
    this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NegativeNumberSignRegex, "is");
    this.pointRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.PointRegex, "gis");
    this.speGetNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.SpeGetNumberRegex, "gis");
    this.pairRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.PairRegex, "gis");
    this.roundNumberIntegerRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.RoundNumberIntegerRegex, "gis");
  }
  normalizeTokenSet(tokens, context) {
    return tokens;
  }
  resolveCompositeNumber(numberStr) {
    return 0;
  }
};
var BaseNumberExtractor = class {
  constructor() {
    this.extractType = "";
    this.negativeNumberTermsRegex = null;
  }
  extract(source) {
    if (!source || source.trim().length === 0) {
      return [];
    }
    let result = new Array();
    let matchSource = /* @__PURE__ */ new Map();
    let matched = new Array(source.length);
    for (let i = 0; i < source.length; i++) {
      matched[i] = false;
    }
    let collections = this.regexes.map((o) => ({ matches: recognizersText.RegExpUtility.getMatches(o.regExp, source), value: o.value })).filter((o) => o.matches && o.matches.length);
    collections.forEach((collection) => {
      collection.matches.forEach((m) => {
        for (let j = 0; j < m.length; j++) {
          matched[m.index + j] = true;
        }
        matchSource.set(m, collection.value);
      });
    });
    let last = -1;
    for (let i = 0; i < source.length; i++) {
      if (matched[i]) {
        if (i + 1 === source.length || !matched[i + 1]) {
          let start = last + 1;
          let length = i - last;
          let substr = source.substring(start, start + length);
          let srcMatch = Array.from(matchSource.keys()).find((m) => m.index === start && m.length === length);
          if (this.negativeNumberTermsRegex !== null) {
            let match = source.substr(0, start).match(this.negativeNumberTermsRegex);
            if (match) {
              start = match.index;
              length = length + match[0].length;
              substr = match[0] + substr;
            }
          }
          if (srcMatch) {
            result.push({
              start,
              length,
              text: substr,
              type: this.extractType,
              data: matchSource.has(srcMatch) ? matchSource.get(srcMatch) : null
            });
          }
        }
      } else {
        last = i;
      }
    }
    return result;
  }
  generateLongFormatNumberRegexes(type, placeholder = exports.BaseNumbers.PlaceHolderDefault) {
    let thousandsMark = escapeRegExp(type.thousandsMark);
    let decimalsMark = escapeRegExp(type.decimalsMark);
    let regexDefinition = type.decimalsMark === "\0" ? exports.BaseNumbers.IntegerRegexDefinition(placeholder, thousandsMark) : exports.BaseNumbers.DoubleRegexDefinition(placeholder, thousandsMark, decimalsMark);
    return recognizersText.RegExpUtility.getSafeRegExp(regexDefinition, "gis");
  }
};
var BasePercentageExtractor = class {
  constructor(numberExtractor) {
    this.extractType = Constants.SYS_NUM_PERCENTAGE;
    this.numberExtractor = numberExtractor;
    this.regexes = this.initRegexes();
  }
  extract(source) {
    let originSource = source;
    let positionMap;
    let numExtResults;
    let preprocess = this.preprocessStrWithNumberExtracted(originSource);
    source = preprocess.source;
    positionMap = preprocess.positionMap;
    numExtResults = preprocess.numExtResults;
    let allMatches = this.regexes.map((rx) => recognizersText.RegExpUtility.getMatches(rx, source));
    let matched = new Array(source.length);
    for (let i = 0; i < source.length; i++) {
      matched[i] = false;
    }
    for (let i = 0; i < allMatches.length; i++) {
      allMatches[i].forEach((match) => {
        for (let j = 0; j < match.length; j++) {
          matched[j + match.index] = true;
        }
      });
    }
    let result = new Array();
    let last = -1;
    for (let i = 0; i < source.length; i++) {
      if (matched[i]) {
        if (i + 1 === source.length || matched[i + 1] === false) {
          let start = last + 1;
          let length = i - last;
          let substr = source.substring(start, start + length);
          let er = {
            start,
            length,
            text: substr,
            type: this.extractType
          };
          result.push(er);
        }
      } else {
        last = i;
      }
    }
    this.postProcessing(result, originSource, positionMap, numExtResults);
    return result;
  }
  // get the number extractor results and convert the extracted numbers to @sys.num, so that the regexes can work
  preprocessStrWithNumberExtracted(str) {
    let positionMap = /* @__PURE__ */ new Map();
    let numExtResults = this.numberExtractor.extract(str);
    let replaceText = exports.BaseNumbers.NumberReplaceToken;
    let match = new Array(str.length);
    let strParts = new Array();
    let start;
    let end;
    for (let i = 0; i < str.length; i++) {
      match[i] = -1;
    }
    for (let i = 0; i < numExtResults.length; i++) {
      let extraction = numExtResults[i];
      extraction.text;
      start = extraction.start;
      end = extraction.length + start;
      for (let j = start; j < end; j++) {
        if (match[j] === -1) {
          match[j] = i;
        }
      }
    }
    start = 0;
    for (let i = 1; i < str.length; i++) {
      if (match[i] !== match[i - 1]) {
        strParts.push([start, i - 1]);
        start = i;
      }
    }
    strParts.push([start, str.length - 1]);
    let ret = "";
    let index = 0;
    strParts.forEach((strPart) => {
      start = strPart[0];
      end = strPart[1];
      let type = match[start];
      if (type === -1) {
        ret += str.substring(start, end + 1);
        for (let i = start; i <= end; i++) {
          positionMap.set(index++, i);
        }
      } else {
        str.substring(start, end + 1);
        ret += replaceText;
        for (let i = 0; i < replaceText.length; i++) {
          positionMap.set(index++, start);
        }
      }
    });
    positionMap.set(index++, str.length);
    return {
      numExtResults,
      source: ret,
      positionMap
    };
  }
  // replace the @sys.num to the real patterns, directly modifies the ExtractResult
  postProcessing(results, originSource, positionMap, numExtResults) {
    let replaceText = exports.BaseNumbers.NumberReplaceToken;
    for (let i = 0; i < results.length; i++) {
      let start = results[i].start;
      let end = start + results[i].length;
      let str = results[i].text;
      if (positionMap.has(start) && positionMap.has(end)) {
        let originStart = positionMap.get(start);
        let originLenth = positionMap.get(end) - originStart;
        results[i].start = originStart;
        results[i].length = originLenth;
        results[i].text = originSource.substring(originStart, originStart + originLenth).trim();
        let numStart = str.indexOf(replaceText);
        if (numStart !== -1) {
          let numOriginStart = start + numStart;
          if (positionMap.has(numStart)) {
            let dataKey = originSource.substring(positionMap.get(numOriginStart), positionMap.get(numOriginStart + replaceText.length));
            for (let j = i; j < numExtResults.length; j++) {
              if (results[i].start === numExtResults[j].start && results[i].text.includes(numExtResults[j].text)) {
                results[i].data = [dataKey, numExtResults[j]];
                break;
              }
            }
          }
        }
      }
    }
  }
  // read the rules
  buildRegexes(regexStrs, ignoreCase = true) {
    return regexStrs.map((regexStr) => {
      let options = "gs";
      if (ignoreCase) {
        options += "i";
      }
      return recognizersText.RegExpUtility.getSafeRegExp(regexStr, options);
    });
  }
};
BasePercentageExtractor.numExtType = Constants.SYS_NUM;
var EnglishNumberExtractor = class extends BaseNumberExtractor {
  constructor(mode = 0 /* Default */) {
    super();
    this.extractType = Constants.SYS_NUM;
    this.negativeNumberTermsRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.NegativeNumberTermsRegex + "$", "is");
    let regexes = new Array();
    let cardExtract = null;
    switch (mode) {
      case 2 /* PureNumber */:
        cardExtract = new EnglishCardinalExtractor(exports.EnglishNumeric.PlaceHolderPureNumber);
        break;
      case 1 /* Currency */:
        regexes.push({ regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.CurrencyRegex, "gs"), value: "IntegerNum" });
        break;
    }
    if (cardExtract === null) {
      cardExtract = new EnglishCardinalExtractor();
    }
    cardExtract.regexes.forEach((r) => regexes.push(r));
    let fracExtract = new EnglishFractionExtractor();
    fracExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var EnglishCardinalExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = exports.EnglishNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_CARDINAL;
    let regexes = new Array();
    let intExtract = new EnglishIntegerExtractor(placeholder);
    intExtract.regexes.forEach((r) => regexes.push(r));
    let doubleExtract = new EnglishDoubleExtractor(placeholder);
    doubleExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var EnglishIntegerExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = exports.EnglishNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_INTEGER;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.NumbersWithPlaceHolder(placeholder), "gi"),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.NumbersWithSuffix, "gs"),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumComma, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumBlank, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumNoBreakSpace, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.RoundNumberIntegerRegexWithLocks, "gis"),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.NumbersWithDozenSuffix, "gis"),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.AllIntRegexWithLocks, "gis"),
        value: "IntegerEng"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.AllIntRegexWithDozenSuffixLocks, "gis"),
        value: "IntegerEng"
      }
    );
    this.regexes = regexes;
  }
};
var EnglishDoubleExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = exports.EnglishNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_DOUBLE;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.DoubleDecimalPointRegex(placeholder), "gis"),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.DoubleWithoutIntegralRegex(placeholder), "gis"),
        value: "DoubleNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.doubleNumCommaDot, placeholder),
        value: "DoubleNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.doubleNumNoBreakSpaceDot, placeholder),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.DoubleWithMultiplierRegex, "gs"),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.DoubleWithRoundNumber, "gis"),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.DoubleAllFloatRegex, "gis"),
        value: "DoubleEng"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.DoubleExponentialNotationRegex, "gis"),
        value: "DoublePow"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.DoubleCaretExponentialNotationRegex, "gis"),
        value: "DoublePow"
      }
    );
    this.regexes = regexes;
  }
};
var EnglishFractionExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_FRACTION;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.FractionNotationWithSpacesRegex, "gis"),
        value: "FracNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.FractionNotationRegex, "gis"),
        value: "FracNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.FractionNounRegex, "gis"),
        value: "FracEng"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.FractionNounWithArticleRegex, "gis"),
        value: "FracEng"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.FractionPrepositionRegex, "gis"),
        value: "FracEng"
      }
    );
    this.regexes = regexes;
  }
};
var EnglishOrdinalExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_ORDINAL;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.OrdinalSuffixRegex, "gis"),
        value: "OrdinalNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.OrdinalNumericRegex, "gis"),
        value: "OrdinalNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.OrdinalEnglishRegex, "gis"),
        value: "OrdEng"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishNumeric.OrdinalRoundNumberRegex, "gis"),
        value: "OrdEng"
      }
    );
    this.regexes = regexes;
  }
};
var EnglishPercentageExtractor = class extends BasePercentageExtractor {
  constructor() {
    super(new EnglishNumberExtractor());
  }
  initRegexes() {
    let regexStrs = [
      exports.EnglishNumeric.NumberWithSuffixPercentage,
      exports.EnglishNumeric.NumberWithPrefixPercentage
    ];
    return this.buildRegexes(regexStrs);
  }
};
var SpanishNumberExtractor = class extends BaseNumberExtractor {
  constructor(mode = 0 /* Default */) {
    super();
    this.extractType = Constants.SYS_NUM;
    let regexes = new Array();
    let cardExtract = null;
    switch (mode) {
      case 2 /* PureNumber */:
        cardExtract = new SpanishCardinalExtractor(exports.SpanishNumeric.PlaceHolderPureNumber);
        break;
      case 1 /* Currency */:
        regexes.push({ regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.CurrencyRegex, "gs"), value: "IntegerNum" });
        break;
    }
    if (cardExtract === null) {
      cardExtract = new SpanishCardinalExtractor();
    }
    cardExtract.regexes.forEach((r) => regexes.push(r));
    let fracExtract = new SpanishFractionExtractor();
    fracExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var SpanishCardinalExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = exports.SpanishNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_CARDINAL;
    let regexes = new Array();
    let intExtract = new SpanishIntegerExtractor(placeholder);
    intExtract.regexes.forEach((r) => regexes.push(r));
    let doubleExtract = new SpanishDoubleExtractor(placeholder);
    doubleExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var SpanishIntegerExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = exports.SpanishNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_INTEGER;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.NumbersWithPlaceHolder(placeholder), "gi"),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.NumbersWithSuffix, "gs"),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumDot, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumBlank, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumNoBreakSpace, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.RoundNumberIntegerRegexWithLocks),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.NumbersWithDozenSuffix),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.AllIntRegexWithLocks),
        value: "IntegerSpa"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.AllIntRegexWithDozenSuffixLocks),
        value: "IntegerSpa"
      }
    );
    this.regexes = regexes;
  }
};
var SpanishDoubleExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = exports.SpanishNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_DOUBLE;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.DoubleDecimalPointRegex(placeholder)),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.DoubleWithoutIntegralRegex(placeholder)),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.DoubleWithMultiplierRegex, "gs"),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.DoubleWithRoundNumber),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.DoubleAllFloatRegex),
        value: "DoubleSpa"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.DoubleExponentialNotationRegex),
        value: "DoublePow"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.DoubleCaretExponentialNotationRegex),
        value: "DoublePow"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.doubleNumDotComma, placeholder),
        value: "DoubleNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.doubleNumNoBreakSpaceComma, placeholder),
        value: "DoubleNum"
      }
    );
    this.regexes = regexes;
  }
};
var SpanishFractionExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_FRACTION;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.FractionNotationRegex),
        value: "FracNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.FractionNotationWithSpacesRegex),
        value: "FracNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.FractionNounRegex),
        value: "FracSpa"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.FractionNounWithArticleRegex),
        value: "FracSpa"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.FractionPrepositionRegex),
        value: "FracSpa"
      }
    );
    this.regexes = regexes;
  }
};
var SpanishOrdinalExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_ORDINAL;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.OrdinalSuffixRegex),
        value: "OrdinalNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishNumeric.OrdinalNounRegex),
        value: "OrdSpa"
      }
    );
    this.regexes = regexes;
  }
};
var SpanishPercentageExtractor = class extends BasePercentageExtractor {
  constructor() {
    super(new SpanishNumberExtractor());
  }
  initRegexes() {
    let regexStrs = [
      exports.SpanishNumeric.NumberWithPrefixPercentage
    ];
    return this.buildRegexes(regexStrs);
  }
};
var PortugueseNumberExtractor = class extends BaseNumberExtractor {
  constructor(mode = 0 /* Default */) {
    super();
    this.extractType = Constants.SYS_NUM;
    let regexes = new Array();
    let cardExtract = null;
    switch (mode) {
      case 2 /* PureNumber */:
        cardExtract = new PortugueseCardinalExtractor(PortugueseNumeric.PlaceHolderPureNumber);
        break;
      case 1 /* Currency */:
        regexes.push({ regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.CurrencyRegex, "gs"), value: "IntegerNum" });
        break;
    }
    if (cardExtract === null) {
      cardExtract = new PortugueseCardinalExtractor();
    }
    cardExtract.regexes.forEach((r) => regexes.push(r));
    let fracExtract = new PortugueseFractionExtractor();
    fracExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var PortugueseCardinalExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = PortugueseNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_CARDINAL;
    let regexes = new Array();
    let intExtract = new PortugueseIntegerExtractor(placeholder);
    intExtract.regexes.forEach((r) => regexes.push(r));
    let doubleExtract = new PortugueseDoubleExtractor(placeholder);
    doubleExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var PortugueseIntegerExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = PortugueseNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_INTEGER;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.NumbersWithPlaceHolder(placeholder), "gi"),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.NumbersWithSuffix, "gs"),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumDot, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumBlank, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumNoBreakSpace, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.RoundNumberIntegerRegexWithLocks),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.NumbersWithDozen2Suffix),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.NumbersWithDozenSuffix),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.AllIntRegexWithLocks),
        value: "IntegerPor"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.AllIntRegexWithDozenSuffixLocks),
        value: "IntegerPor"
      }
    );
    this.regexes = regexes;
  }
};
var PortugueseDoubleExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = PortugueseNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_DOUBLE;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.DoubleDecimalPointRegex(placeholder)),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.DoubleWithoutIntegralRegex(placeholder)),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.DoubleWithMultiplierRegex, "gs"),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.DoubleWithRoundNumber),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.DoubleAllFloatRegex),
        value: "DoublePor"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.DoubleExponentialNotationRegex),
        value: "DoublePow"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.DoubleCaretExponentialNotationRegex),
        value: "DoublePow"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.doubleNumDotComma, placeholder),
        value: "DoubleNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.doubleNumNoBreakSpaceComma, placeholder),
        value: "DoubleNum"
      }
    );
    this.regexes = regexes;
  }
};
var PortugueseFractionExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_FRACTION;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.FractionNotationRegex),
        value: "FracNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.FractionNotationWithSpacesRegex),
        value: "FracNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.FractionNounRegex),
        value: "FracPor"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.FractionNounWithArticleRegex),
        value: "FracPor"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.FractionPrepositionRegex),
        value: "FracPor"
      }
    );
    this.regexes = regexes;
  }
};
var PortugueseOrdinalExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_ORDINAL;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.OrdinalSuffixRegex),
        value: "OrdinalNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(PortugueseNumeric.OrdinalEnglishRegex),
        value: "OrdinalPor"
      }
    );
    this.regexes = regexes;
  }
};
var PortuguesePercentageExtractor = class extends BasePercentageExtractor {
  constructor() {
    super(new PortugueseNumberExtractor());
  }
  initRegexes() {
    let regexStrs = [
      PortugueseNumeric.NumberWithSuffixPercentage
    ];
    return this.buildRegexes(regexStrs);
  }
};
var FrenchNumberExtractor = class extends BaseNumberExtractor {
  constructor(mode = 0 /* Default */) {
    super();
    this.extractType = Constants.SYS_NUM;
    let regexes = new Array();
    let cardExtract = null;
    switch (mode) {
      case 2 /* PureNumber */:
        cardExtract = new FrenchCardinalExtractor(exports.FrenchNumeric.PlaceHolderPureNumber);
        break;
      case 1 /* Currency */:
        regexes.push({ regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.CurrencyRegex, "gs"), value: "IntegerNum" });
        break;
    }
    if (cardExtract === null) {
      cardExtract = new FrenchCardinalExtractor();
    }
    cardExtract.regexes.forEach((r) => regexes.push(r));
    let fracExtract = new FrenchFractionExtractor();
    fracExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var FrenchCardinalExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = exports.FrenchNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_CARDINAL;
    let regexes = new Array();
    let intExtract = new FrenchIntegerExtractor(placeholder);
    intExtract.regexes.forEach((r) => regexes.push(r));
    let doubleExtract = new FrenchDoubleExtractor(placeholder);
    doubleExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var FrenchIntegerExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = exports.FrenchNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_INTEGER;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.NumbersWithPlaceHolder(placeholder), "gi"),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.NumbersWithSuffix, "gs"),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumDot, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumBlank, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumNoBreakSpace, placeholder),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.RoundNumberIntegerRegexWithLocks),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.NumbersWithDozenSuffix),
        value: "IntegerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.AllIntRegexWithLocks),
        value: "IntegerFr"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.AllIntRegexWithDozenSuffixLocks),
        value: "IntegerFr"
      }
    );
    this.regexes = regexes;
  }
};
var FrenchDoubleExtractor = class extends BaseNumberExtractor {
  constructor(placeholder = exports.FrenchNumeric.PlaceHolderDefault) {
    super();
    this.extractType = Constants.SYS_NUM_DOUBLE;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.DoubleDecimalPointRegex(placeholder)),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.DoubleWithoutIntegralRegex(placeholder)),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.DoubleWithMultiplierRegex, "gs"),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.DoubleWithRoundNumber),
        value: "DoubleNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.DoubleAllFloatRegex),
        value: "DoubleFr"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.DoubleExponentialNotationRegex),
        value: "DoublePow"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.DoubleCaretExponentialNotationRegex),
        value: "DoublePow"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.doubleNumDotComma, placeholder),
        value: "DoubleNum"
      },
      {
        regExp: this.generateLongFormatNumberRegexes(LongFormatType.doubleNumNoBreakSpaceComma, placeholder),
        value: "DoubleNum"
      }
    );
    this.regexes = regexes;
  }
};
var FrenchFractionExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_FRACTION;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.FractionNotationRegex),
        value: "FracNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.FractionNotationWithSpacesRegex),
        value: "FracNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.FractionNounRegex),
        value: "FracFr"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.FractionNounWithArticleRegex),
        value: "FracFr"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.FractionPrepositionRegex),
        value: "FracFr"
      }
    );
    this.regexes = regexes;
  }
};
var FrenchOrdinalExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_ORDINAL;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.OrdinalSuffixRegex),
        value: "OrdinalNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchNumeric.OrdinalFrenchRegex),
        value: "OrdFr"
      }
    );
    this.regexes = regexes;
  }
};
var FrenchPercentageExtractor = class extends BasePercentageExtractor {
  constructor() {
    super(new FrenchNumberExtractor());
  }
  initRegexes() {
    let regexStrs = [
      exports.FrenchNumeric.NumberWithSuffixPercentage,
      exports.FrenchNumeric.NumberWithPrefixPercentage
    ];
    return this.buildRegexes(regexStrs);
  }
};
var ChineseNumberExtractorMode = /* @__PURE__ */ ((ChineseNumberExtractorMode2) => {
  ChineseNumberExtractorMode2[ChineseNumberExtractorMode2["Default"] = 0] = "Default";
  ChineseNumberExtractorMode2[ChineseNumberExtractorMode2["ExtractAll"] = 1] = "ExtractAll";
  return ChineseNumberExtractorMode2;
})(ChineseNumberExtractorMode || {});
var ChineseNumberExtractor = class extends BaseNumberExtractor {
  constructor(mode = 0 /* Default */) {
    super();
    this.extractType = Constants.SYS_NUM;
    let regexes = new Array();
    let cardExtract = new ChineseCardinalExtractor(mode);
    cardExtract.regexes.forEach((r) => regexes.push(r));
    let fracExtract = new ChineseFractionExtractor();
    fracExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var ChineseCardinalExtractor = class extends BaseNumberExtractor {
  constructor(mode = 0 /* Default */) {
    super();
    this.extractType = Constants.SYS_NUM_CARDINAL;
    let regexes = new Array();
    let intExtract = new ChineseIntegerExtractor(mode);
    intExtract.regexes.forEach((r) => regexes.push(r));
    let doubleExtract = new ChineseDoubleExtractor();
    doubleExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var ChineseIntegerExtractor = class extends BaseNumberExtractor {
  constructor(mode = 0 /* Default */) {
    super();
    this.extractType = Constants.SYS_NUM_INTEGER;
    let regexes = new Array(
      {
        // 123456,  －１２３４５６
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersSpecialsChars, "gi"),
        value: "IntegerNum"
      },
      {
        // 15k,  16 G
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersSpecialsCharsWithSuffix, "gs"),
        value: "IntegerNum"
      },
      {
        // 1,234,  ２，３３２，１１１
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DottedNumbersSpecialsChar, "gis"),
        value: "IntegerNum"
      },
      {
        // 半百  半打
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersWithHalfDozen, "gis"),
        value: "IntegerChs"
      },
      {
        // 一打  五十打
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersWithDozen, "gis"),
        value: "IntegerChs"
      }
    );
    switch (mode) {
      case 0 /* Default */:
        regexes.push({
          // 一百五十五, 负一亿三百二十二. Uses an allow list to avoid extracting "四" from "四川"
          regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersWithAllowListRegex, "gi"),
          value: "IntegerChs"
        });
        break;
      case 1 /* ExtractAll */:
        regexes.push({
          // 一百五十五, 负一亿三百二十二, "四" from "四川". Uses no allow lists and extracts all potential integers (useful in Units, for example).
          regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersAggressiveRegex, "gi"),
          value: "IntegerChs"
        });
        break;
    }
    this.regexes = regexes;
  }
};
var ChineseDoubleExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_DOUBLE;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DoubleSpecialsChars, "gis"),
        value: "DoubleNum"
      },
      {
        // (-)2.5, can avoid cases like ip address xx.xx.xx.xx
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DoubleSpecialsCharsWithNegatives, "gis"),
        value: "DoubleNum"
      },
      {
        // (-).2 
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SimpleDoubleSpecialsChars, "gis"),
        value: "DoubleNum"
      },
      {
        // 1.0 K
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DoubleWithMultiplierRegex, "gi"),
        value: "DoubleNum"
      },
      {
        // １５.２万
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DoubleWithThousandsRegex, "gi"),
        value: "DoubleChs"
      },
      {
        // 四十五点三三
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DoubleAllFloatRegex, "gi"),
        value: "DoubleChs"
      },
      {
        // 2e6, 21.2e0
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DoubleExponentialNotationRegex, "gis"),
        value: "DoublePow"
      },
      {
        // 2^5
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.DoubleScientificNotationRegex, "gis"),
        value: "DoublePow"
      }
    );
    this.regexes = regexes;
  }
};
var ChineseFractionExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_FRACTION;
    let regexes = new Array(
      {
        // -4 5/2, ４ ６／３
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.FractionNotationSpecialsCharsRegex, "gis"),
        value: "FracNum"
      },
      {
        // 8/3 
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.FractionNotationRegex, "gis"),
        value: "FracNum"
      },
      {
        // 四分之六十五
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.AllFractionNumber, "gi"),
        value: "FracChs"
      }
    );
    this.regexes = regexes;
  }
};
var ChineseOrdinalExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_ORDINAL;
    let regexes = new Array(
      {
        // 第一百五十四
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.OrdinalRegex, "gi"),
        value: "OrdinalChs"
      },
      {
        // 第２５６５,  第1234
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.OrdinalNumbersRegex, "gi"),
        value: "OrdinalChs"
      }
    );
    this.regexes = regexes;
  }
};
var ChinesePercentageExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_PERCENTAGE;
    let regexes = new Array(
      {
        // 二十个百分点,  四点五个百分点
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.PercentagePointRegex, "gi"),
        value: "PerChs"
      },
      {
        // 百分之五十  百分之一点五
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SimplePercentageRegex, "gi"),
        value: "PerChs"
      },
      {
        // 百分之５６.２　百分之１２
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersPercentagePointRegex, "gis"),
        value: "PerNum"
      },
      {
        // 百分之3,000  百分之１，１２３
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersPercentageWithSeparatorRegex, "gis"),
        value: "PerNum"
      },
      {
        // 百分之3.2 k 
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersPercentageWithMultiplierRegex, "gi"),
        value: "PerNum"
      },
      {
        // 12.56个百分点  ０.４个百分点
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.FractionPercentagePointRegex, "gis"),
        value: "PerNum"
      },
      {
        // 15,123个百分点  １１１，１１１个百分点
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.FractionPercentageWithSeparatorRegex, "gis"),
        value: "PerNum"
      },
      {
        // 12.1k个百分点  １５.1k个百分点
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.FractionPercentageWithMultiplierRegex, "gi"),
        value: "PerNum"
      },
      {
        // 百分之22  百分之１２０
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SimpleNumbersPercentageRegex, "gis"),
        value: "PerNum"
      },
      {
        // 百分之15k 
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SimpleNumbersPercentageWithMultiplierRegex, "gi"),
        value: "PerNum"
      },
      {
        // 百分之1,111  百分之９，９９９
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SimpleNumbersPercentagePointRegex, "gis"),
        value: "PerNum"
      },
      {
        // 12个百分点
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.IntegerPercentageRegex, "gis"),
        value: "PerNum"
      },
      {
        // 12k个百分点
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.IntegerPercentageWithMultiplierRegex, "gi"),
        value: "PerNum"
      },
      {
        // 2,123个百分点
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersFractionPercentageRegex, "gis"),
        value: "PerNum"
      },
      {
        // 32.5%
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SimpleIntegerPercentageRegex, "gis"),
        value: "PerNum"
      },
      {
        // 2折 ２.５折
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersFoldsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 三折 六点五折 七五折
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.FoldsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 5成 6成半 6成4
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SimpleFoldsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 七成半 七成五
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SpecialsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 2成 ２.５成
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.NumbersSpecialsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 三成 六点五成
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SimpleSpecialsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 打对折 半成
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseNumeric.SpecialsFoldsPercentageRegex, "gis"),
        value: "PerSpe"
      }
    );
    this.regexes = regexes;
  }
};
var JapaneseNumberExtractorMode = /* @__PURE__ */ ((JapaneseNumberExtractorMode2) => {
  JapaneseNumberExtractorMode2[JapaneseNumberExtractorMode2["Default"] = 0] = "Default";
  JapaneseNumberExtractorMode2[JapaneseNumberExtractorMode2["ExtractAll"] = 1] = "ExtractAll";
  return JapaneseNumberExtractorMode2;
})(JapaneseNumberExtractorMode || {});
var JapaneseNumberExtractor = class extends BaseNumberExtractor {
  constructor(mode = 0 /* Default */) {
    super();
    this.extractType = Constants.SYS_NUM;
    let regexes = new Array();
    let cardExtract = new JapaneseCardinalExtractor(mode);
    cardExtract.regexes.forEach((r) => regexes.push(r));
    let fracExtract = new JapaneseFractionExtractor();
    fracExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var JapaneseCardinalExtractor = class extends BaseNumberExtractor {
  constructor(mode = 0 /* Default */) {
    super();
    this.extractType = Constants.SYS_NUM_CARDINAL;
    let regexes = new Array();
    let intExtract = new JapaneseIntegerExtractor(mode);
    intExtract.regexes.forEach((r) => regexes.push(r));
    let doubleExtract = new JapaneseDoubleExtractor();
    doubleExtract.regexes.forEach((r) => regexes.push(r));
    this.regexes = regexes;
  }
};
var JapaneseIntegerExtractor = class extends BaseNumberExtractor {
  constructor(mode = 0 /* Default */) {
    super();
    this.extractType = Constants.SYS_NUM_INTEGER;
    let regexes = new Array(
      {
        // 123456,  －１２３４５６
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersSpecialsChars, "gi"),
        value: "IntegerNum"
      },
      {
        // 15k,  16 G
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersSpecialsCharsWithSuffix, "gi"),
        value: "IntegerNum"
      },
      {
        // 1,234,  ２，３３２，１１１
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DottedNumbersSpecialsChar, "gi"),
        value: "IntegerNum"
      },
      {
        // 半百  半ダース
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersWithHalfDozen, "gi"),
        value: "IntegerJpn"
      },
      {
        // 一ダース  五十ダース
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersWithDozen, "gi"),
        value: "IntegerJpn"
      }
    );
    switch (mode) {
      case 0 /* Default */:
        regexes.push({
          // 一百五十五, 负一亿三百二十二. Uses an allow list to avoid extracting "西九条" from "九"
          regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersWithAllowListRegex, "gi"),
          value: "IntegerJpn"
        });
        break;
      case 1 /* ExtractAll */:
        regexes.push({
          // 一百五十五, 负一亿三百二十二, "西九条" from "九". Uses no allow lists and extracts all potential integers (useful in Units, for example).
          regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersAggressiveRegex, "gi"),
          value: "IntegerJpn"
        });
        break;
    }
    this.regexes = regexes;
  }
};
var JapaneseDoubleExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_DOUBLE;
    let regexes = new Array(
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DoubleSpecialsChars, "gis"),
        value: "DoubleNum"
      },
      {
        // (-)2.5, can avoid cases like ip address xx.xx.xx.xx
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DoubleSpecialsCharsWithNegatives, "gis"),
        value: "DoubleNum"
      },
      {
        // (-).2
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.SimpleDoubleSpecialsChars, "gis"),
        value: "DoubleNum"
      },
      {
        // 1.0 K
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DoubleWithMultiplierRegex, "gis"),
        value: "DoubleNum"
      },
      {
        //１５.２万
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DoubleWithThousandsRegex, "gis"),
        value: "DoubleJpn"
      },
      {
        // 2e6, 21.2e0
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DoubleExponentialNotationRegex, "gis"),
        value: "DoublePow"
      },
      {
        // 2^5
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.DoubleScientificNotationRegex, "gis"),
        value: "DoublePow"
      }
    );
    this.regexes = regexes;
  }
};
var JapaneseFractionExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_FRACTION;
    let regexes = new Array(
      {
        // -4 5/2,  ４ ６／３
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.FractionNotationSpecialsCharsRegex, "gis"),
        value: "FracNum"
      },
      {
        // 8/3 
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.FractionNotationRegex, "gis"),
        value: "FracNum"
      },
      {
        // 五分の二 七分の三
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.AllFractionNumber, "gis"),
        value: "FracJpn"
      }
    );
    this.regexes = regexes;
  }
};
var JapaneseOrdinalExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_ORDINAL;
    let regexes = new Array(
      {
        // だい一百五十四
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.OrdinalRegex, "gi"),
        value: "OrdinalJpn"
      },
      {
        // だい２５６５
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.OrdinalNumbersRegex, "gi"),
        value: "OrdinalJpn"
      },
      {
        // 2折 ２.５折
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersFoldsPercentageRegex, "gi"),
        value: "OrdinalJpn"
      }
    );
    this.regexes = regexes;
  }
};
var JapanesePercentageExtractor = class extends BaseNumberExtractor {
  constructor() {
    super();
    this.extractType = Constants.SYS_NUM_PERCENTAGE;
    let regexes = new Array(
      {
        // 百パーセント 十五パーセント
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.SimplePercentageRegex, "gi"),
        value: "PerJpn"
      },
      {
        // 19パーセント　１パーセント
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersPercentagePointRegex, "gis"),
        value: "PerNum"
      },
      {
        // 3,000パーセント  １，１２３パーセント
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersPercentageWithSeparatorRegex, "gis"),
        value: "PerNum"
      },
      {
        // 3.2 k パーセント
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersPercentageWithMultiplierRegex, "gi"),
        value: "PerNum"
      },
      {
        // 15kパーセント
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.SimpleNumbersPercentageWithMultiplierRegex, "gi"),
        value: "PerNum"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.SimpleIntegerPercentageRegex, "gis"),
        value: "PerNum"
      },
      {
        // 2割引 ２.５割引
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersFoldsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 三割引 六点五折 七五折
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.FoldsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 5割 7割半
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.SimpleFoldsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 七割半
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.SpecialsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 2割 ２.５割
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.NumbersSpecialsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        // 三割
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.SimpleSpecialsPercentageRegex, "gis"),
        value: "PerSpe"
      },
      {
        regExp: recognizersText.RegExpUtility.getSafeRegExp(exports.JapaneseNumeric.SpecialsFoldsPercentageRegex, "gis"),
        value: "PerSpe"
      }
    );
    this.regexes = regexes;
  }
};

// recognizers/recognizers-number/src/number/numberRecognizer.ts
var NumberOptions = /* @__PURE__ */ ((NumberOptions2) => {
  NumberOptions2[NumberOptions2["None"] = 0] = "None";
  return NumberOptions2;
})(NumberOptions || {});
function recognizeNumber(query, culture, options = 0 /* None */, fallbackToDefaultCulture = true) {
  return recognizeByModel((recognizer) => recognizer.getNumberModel(culture, fallbackToDefaultCulture), query, culture, options);
}
function recognizeOrdinal(query, culture, options = 0 /* None */, fallbackToDefaultCulture = true) {
  return recognizeByModel((recognizer) => recognizer.getOrdinalModel(culture, fallbackToDefaultCulture), query, culture, options);
}
function recognizePercentage(query, culture, options = 0 /* None */, fallbackToDefaultCulture = true) {
  return recognizeByModel((recognizer) => recognizer.getPercentageModel(culture, fallbackToDefaultCulture), query, culture, options);
}
function recognizeByModel(getModelFunc, query, culture, options) {
  let recognizer = new NumberRecognizer(culture, options);
  let model = getModelFunc(recognizer);
  return model.parse(query);
}
var NumberRecognizer = class extends recognizersText.Recognizer {
  constructor(culture, options = 0 /* None */, lazyInitialization = false) {
    super(culture, options, lazyInitialization);
  }
  InitializeConfiguration() {
    this.registerModel("NumberModel", Culture.English, (options) => new NumberModel(
      AgnosticNumberParserFactory.getParser(4 /* Number */, new EnglishNumberParserConfiguration()),
      new EnglishNumberExtractor(2 /* PureNumber */)
    ));
    this.registerModel("OrdinalModel", Culture.English, (options) => new OrdinalModel(
      AgnosticNumberParserFactory.getParser(5 /* Ordinal */, new EnglishNumberParserConfiguration()),
      new EnglishOrdinalExtractor()
    ));
    this.registerModel("PercentModel", Culture.English, (options) => new PercentModel(
      AgnosticNumberParserFactory.getParser(6 /* Percentage */, new EnglishNumberParserConfiguration()),
      new EnglishPercentageExtractor()
    ));
    this.registerModel("NumberModel", Culture.Spanish, (options) => new NumberModel(
      AgnosticNumberParserFactory.getParser(4 /* Number */, new SpanishNumberParserConfiguration()),
      new SpanishNumberExtractor(2 /* PureNumber */)
    ));
    this.registerModel("OrdinalModel", Culture.Spanish, (options) => new OrdinalModel(
      AgnosticNumberParserFactory.getParser(5 /* Ordinal */, new SpanishNumberParserConfiguration()),
      new SpanishOrdinalExtractor()
    ));
    this.registerModel("PercentModel", Culture.Spanish, (options) => new PercentModel(
      AgnosticNumberParserFactory.getParser(6 /* Percentage */, new SpanishNumberParserConfiguration()),
      new SpanishPercentageExtractor()
    ));
    this.registerModel("NumberModel", Culture.Portuguese, (options) => new NumberModel(
      AgnosticNumberParserFactory.getParser(4 /* Number */, new PortugueseNumberParserConfiguration()),
      new PortugueseNumberExtractor(2 /* PureNumber */)
    ));
    this.registerModel("OrdinalModel", Culture.Portuguese, (options) => new OrdinalModel(
      AgnosticNumberParserFactory.getParser(5 /* Ordinal */, new PortugueseNumberParserConfiguration()),
      new PortugueseOrdinalExtractor()
    ));
    this.registerModel("PercentModel", Culture.Portuguese, (options) => new PercentModel(
      AgnosticNumberParserFactory.getParser(6 /* Percentage */, new PortugueseNumberParserConfiguration()),
      new PortuguesePercentageExtractor()
    ));
    this.registerModel("NumberModel", Culture.Chinese, (options) => new NumberModel(
      AgnosticNumberParserFactory.getParser(4 /* Number */, new ChineseNumberParserConfiguration()),
      new ChineseNumberExtractor()
    ));
    this.registerModel("OrdinalModel", Culture.Chinese, (options) => new OrdinalModel(
      AgnosticNumberParserFactory.getParser(5 /* Ordinal */, new ChineseNumberParserConfiguration()),
      new ChineseOrdinalExtractor()
    ));
    this.registerModel("PercentModel", Culture.Chinese, (options) => new PercentModel(
      AgnosticNumberParserFactory.getParser(6 /* Percentage */, new ChineseNumberParserConfiguration()),
      new ChinesePercentageExtractor()
    ));
    this.registerModel("NumberModel", Culture.Japanese, (options) => new NumberModel(
      AgnosticNumberParserFactory.getParser(4 /* Number */, new JapaneseNumberParserConfiguration()),
      new JapaneseNumberExtractor()
    ));
    this.registerModel("OrdinalModel", Culture.Japanese, (options) => new OrdinalModel(
      AgnosticNumberParserFactory.getParser(5 /* Ordinal */, new JapaneseNumberParserConfiguration()),
      new JapaneseOrdinalExtractor()
    ));
    this.registerModel("PercentModel", Culture.Japanese, (options) => new PercentModel(
      AgnosticNumberParserFactory.getParser(6 /* Percentage */, new JapaneseNumberParserConfiguration()),
      new JapanesePercentageExtractor()
    ));
    this.registerModel("NumberModel", Culture.French, (options) => new NumberModel(
      AgnosticNumberParserFactory.getParser(4 /* Number */, new FrenchNumberParserConfiguration()),
      new FrenchNumberExtractor(2 /* PureNumber */)
    ));
    this.registerModel("OrdinalModel", Culture.French, (options) => new OrdinalModel(
      AgnosticNumberParserFactory.getParser(5 /* Ordinal */, new FrenchNumberParserConfiguration()),
      new FrenchOrdinalExtractor()
    ));
    this.registerModel("PercentModel", Culture.French, (options) => new PercentModel(
      AgnosticNumberParserFactory.getParser(6 /* Percentage */, new FrenchNumberParserConfiguration()),
      new FrenchPercentageExtractor()
    ));
  }
  IsValidOptions(options) {
    return options >= 0 && options <= 0 /* None */;
  }
  getNumberModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("NumberModel", culture, fallbackToDefaultCulture);
  }
  getOrdinalModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("OrdinalModel", culture, fallbackToDefaultCulture);
  }
  getPercentageModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("PercentModel", culture, fallbackToDefaultCulture);
  }
};

Object.defineProperty(exports, "FormatUtility", {
  enumerable: true,
  get: function () { return recognizersText.FormatUtility; }
});
Object.defineProperty(exports, "Match", {
  enumerable: true,
  get: function () { return recognizersText.Match; }
});
Object.defineProperty(exports, "RegExpUtility", {
  enumerable: true,
  get: function () { return recognizersText.RegExpUtility; }
});
Object.defineProperty(exports, "StringUtility", {
  enumerable: true,
  get: function () { return recognizersText.StringUtility; }
});
exports.AbstractNumberModel = AbstractNumberModel;
exports.AgnosticNumberParserFactory = AgnosticNumberParserFactory;
exports.AgnosticNumberParserType = AgnosticNumberParserType;
exports.BaseNumberExtractor = BaseNumberExtractor;
exports.BaseNumberParser = BaseNumberParser;
exports.BasePercentageExtractor = BasePercentageExtractor;
exports.BasePercentageParser = BasePercentageParser;
exports.ChineseCardinalExtractor = ChineseCardinalExtractor;
exports.ChineseDoubleExtractor = ChineseDoubleExtractor;
exports.ChineseFractionExtractor = ChineseFractionExtractor;
exports.ChineseIntegerExtractor = ChineseIntegerExtractor;
exports.ChineseNumberExtractor = ChineseNumberExtractor;
exports.ChineseNumberExtractorMode = ChineseNumberExtractorMode;
exports.ChineseNumberParserConfiguration = ChineseNumberParserConfiguration;
exports.ChineseOrdinalExtractor = ChineseOrdinalExtractor;
exports.ChinesePercentageExtractor = ChinesePercentageExtractor;
exports.Constants = Constants;
exports.Culture = Culture;
exports.CultureInfo = CultureInfo;
exports.EnglishCardinalExtractor = EnglishCardinalExtractor;
exports.EnglishDoubleExtractor = EnglishDoubleExtractor;
exports.EnglishFractionExtractor = EnglishFractionExtractor;
exports.EnglishIntegerExtractor = EnglishIntegerExtractor;
exports.EnglishNumberExtractor = EnglishNumberExtractor;
exports.EnglishNumberParserConfiguration = EnglishNumberParserConfiguration;
exports.EnglishOrdinalExtractor = EnglishOrdinalExtractor;
exports.EnglishPercentageExtractor = EnglishPercentageExtractor;
exports.FrenchCardinalExtractor = FrenchCardinalExtractor;
exports.FrenchDoubleExtractor = FrenchDoubleExtractor;
exports.FrenchFractionExtractor = FrenchFractionExtractor;
exports.FrenchIntegerExtractor = FrenchIntegerExtractor;
exports.FrenchNumberExtractor = FrenchNumberExtractor;
exports.FrenchNumberParserConfiguration = FrenchNumberParserConfiguration;
exports.FrenchOrdinalExtractor = FrenchOrdinalExtractor;
exports.FrenchPercentageExtractor = FrenchPercentageExtractor;
exports.JapaneseCardinalExtractor = JapaneseCardinalExtractor;
exports.JapaneseDoubleExtractor = JapaneseDoubleExtractor;
exports.JapaneseFractionExtractor = JapaneseFractionExtractor;
exports.JapaneseIntegerExtractor = JapaneseIntegerExtractor;
exports.JapaneseNumberExtractor = JapaneseNumberExtractor;
exports.JapaneseNumberExtractorMode = JapaneseNumberExtractorMode;
exports.JapaneseNumberParserConfiguration = JapaneseNumberParserConfiguration;
exports.JapaneseOrdinalExtractor = JapaneseOrdinalExtractor;
exports.JapanesePercentageExtractor = JapanesePercentageExtractor;
exports.LongFormatType = LongFormatType;
exports.NumberMode = NumberMode;
exports.NumberModel = NumberModel;
exports.NumberOptions = NumberOptions;
exports.NumberRecognizer = NumberRecognizer;
exports.OrdinalModel = OrdinalModel;
exports.PercentModel = PercentModel;
exports.PortugueseCardinalExtractor = PortugueseCardinalExtractor;
exports.PortugueseDoubleExtractor = PortugueseDoubleExtractor;
exports.PortugueseFractionExtractor = PortugueseFractionExtractor;
exports.PortugueseIntegerExtractor = PortugueseIntegerExtractor;
exports.PortugueseNumberExtractor = PortugueseNumberExtractor;
exports.PortugueseNumberParserConfiguration = PortugueseNumberParserConfiguration;
exports.PortugueseOrdinalExtractor = PortugueseOrdinalExtractor;
exports.PortuguesePercentageExtractor = PortuguesePercentageExtractor;
exports.SpanishCardinalExtractor = SpanishCardinalExtractor;
exports.SpanishDoubleExtractor = SpanishDoubleExtractor;
exports.SpanishFractionExtractor = SpanishFractionExtractor;
exports.SpanishIntegerExtractor = SpanishIntegerExtractor;
exports.SpanishNumberExtractor = SpanishNumberExtractor;
exports.SpanishNumberParserConfiguration = SpanishNumberParserConfiguration;
exports.SpanishOrdinalExtractor = SpanishOrdinalExtractor;
exports.SpanishPercentageExtractor = SpanishPercentageExtractor;
exports.recognizeNumber = recognizeNumber;
exports.recognizeOrdinal = recognizeOrdinal;
exports.recognizePercentage = recognizePercentage;
