'use strict';

var XRegExp__namespace = require('xregexp');

// recognizers/recognizers-text/src/culture.ts
var _Culture = class _Culture {
  constructor(cultureName, cultureCode) {
    this.cultureName = cultureName;
    this.cultureCode = cultureCode;
  }
  static getSupportedCultureCodes() {
    return _Culture.supportedCultures.map((c) => c.cultureCode);
  }
  static mapToNearestLanguage(cultureCode) {
    if (cultureCode !== void 0) {
      cultureCode = cultureCode.toLowerCase();
      var supportedCultureCodes = _Culture.getSupportedCultureCodes();
      if (supportedCultureCodes.indexOf(cultureCode) < 0) {
        var culturePrefix = cultureCode.split("-")[0].trim();
        supportedCultureCodes.forEach(function(supportedCultureCode) {
          if (supportedCultureCode.startsWith(culturePrefix)) {
            cultureCode = supportedCultureCode;
          }
        });
      }
    }
    return cultureCode;
  }
};
_Culture.English = "en-us";
_Culture.Chinese = "zh-cn";
_Culture.Spanish = "es-es";
_Culture.Portuguese = "pt-br";
_Culture.French = "fr-fr";
_Culture.German = "de-de";
_Culture.Japanese = "ja-jp";
_Culture.Dutch = "nl-nl";
_Culture.Italian = "it-it";
_Culture.supportedCultures = [
  new _Culture("English", _Culture.English),
  new _Culture("Chinese", _Culture.Chinese),
  new _Culture("Spanish", _Culture.Spanish),
  new _Culture("Portuguese", _Culture.Portuguese),
  new _Culture("French", _Culture.French),
  new _Culture("German", _Culture.German),
  new _Culture("Japanese", _Culture.Japanese),
  new _Culture("Dutch", _Culture.Dutch),
  new _Culture("Italian", _Culture.Italian)
];
var Culture = _Culture;
var CultureInfo = class _CultureInfo {
  static getCultureInfo(cultureCode) {
    return new _CultureInfo(cultureCode);
  }
  constructor(cultureName) {
    this.code = cultureName;
  }
};
var FormatUtility = class {
  static preProcess(query, toLower = true) {
    if (toLower) {
      query = query.toLowerCase();
    }
    return query.replace(/０/g, "0").replace(/１/g, "1").replace(/２/g, "2").replace(/３/g, "3").replace(/４/g, "4").replace(/５/g, "5").replace(/６/g, "6").replace(/７/g, "7").replace(/８/g, "8").replace(/９/g, "9").replace(/：/g, ":").replace(/－/g, "-").replace(/，/g, ",").replace(/／/g, "/").replace(/Ｇ/g, "G").replace(/Ｍ/g, "M").replace(/Ｔ/g, "T").replace(/Ｋ/g, "K").replace(/ｋ/g, "k").replace(/．/g, ".").replace(/（/g, "(").replace(/）/g, ")");
  }
};
var Match = class {
  constructor(index, length, value, groups) {
    this.index = index;
    this.length = length;
    this.value = value;
    this.innerGroups = groups;
  }
  groups(key) {
    return this.innerGroups[key] ? this.innerGroups[key] : { value: "", index: 0, length: 0, captures: [] };
  }
};
var _RegExpUtility = class _RegExpUtility {
  static getMatches(regex, source) {
    if (!regex) return [];
    let rawRegex = regex.xregexp.source;
    if (!rawRegex.includes("(?<nlb__")) {
      return this.getMatchesSimple(regex, source);
    }
    let realMatches = new Array();
    let negativeLookbehindRegexes = new Array();
    let flags = regex.flags;
    let closePos = 0;
    let startPos = rawRegex.indexOf("(?<nlb__", 0);
    while (startPos >= 0) {
      closePos = this.getClosePos(rawRegex, startPos);
      let nlbRegex = XRegExp__namespace(rawRegex.substring(startPos, closePos + 1), flags);
      let nextRegex = _RegExpUtility.getNextRegex(rawRegex, startPos);
      nlbRegex.nextRegex = nextRegex ? XRegExp__namespace(nextRegex, flags) : null;
      negativeLookbehindRegexes.push(nlbRegex);
      rawRegex = rawRegex.substr(0, startPos) + rawRegex.substr(closePos + 1);
      startPos = rawRegex.indexOf("(?<nlb__", 0);
    }
    let tempRegex = XRegExp__namespace(rawRegex, flags);
    let tempMatches = _RegExpUtility.getMatchesSimple(tempRegex, source);
    tempMatches.forEach((match) => {
      let clean = true;
      negativeLookbehindRegexes.forEach((regex2) => {
        let negativeLookbehindMatches = _RegExpUtility.getMatchesSimple(regex2, source);
        negativeLookbehindMatches.forEach((negativeLookbehindMatch) => {
          let negativeLookbehindEnd = negativeLookbehindMatch.index + negativeLookbehindMatch.length;
          let nextRegex = regex2.nextRegex;
          if (match.index === negativeLookbehindEnd) {
            if (!nextRegex) {
              clean = false;
              return;
            } else {
              let nextMatch = _RegExpUtility.getFirstMatchIndex(nextRegex, source.substring(negativeLookbehindMatch.index));
              if (nextMatch.matched && (nextMatch.index === negativeLookbehindMatch.length || source.includes(nextMatch.value + match.value))) {
                clean = false;
                return;
              }
            }
          }
          if (negativeLookbehindMatch.value.includes(match.value)) {
            let preMatches = _RegExpUtility.getMatchesSimple(regex2, source.substring(0, match.index));
            preMatches.forEach((preMatch) => {
              if (source.includes(preMatch.value + match.value)) {
                clean = false;
                return;
              }
            });
          }
        });
        if (!clean) {
          return;
        }
      });
      if (clean) {
        realMatches.push(match);
      }
    });
    return realMatches;
  }
  static getMatchesSimple(regex, source) {
    let normalized = StringUtility.removeDiacriticsFromWordBoundaries(source);
    let matches = new Array();
    XRegExp__namespace.forEach(normalized, regex, (match) => {
      let positiveLookbehinds = [];
      let groups = {};
      let lastGroup = "";
      Object.keys(match).forEach((key) => {
        if (!key.includes("__")) return;
        if (key.startsWith("plb") && match[key]) {
          if (match[0].indexOf(match[key]) !== 0 && !StringUtility.isNullOrEmpty(lastGroup)) {
            let index2 = match.index + match[0].indexOf(match[key]);
            let length2 = match[key].length;
            let value2 = source.substr(index2, length2);
            groups[lastGroup].value = groups[lastGroup].value + value2;
          }
          positiveLookbehinds.push({ key, value: match[key] });
          return;
        }
        if (key.startsWith("nlb")) {
          return;
        }
        let groupKey = key.substr(0, key.lastIndexOf("__"));
        lastGroup = groupKey;
        if (!groups[groupKey]) groups[groupKey] = { value: "", index: 0, length: 0, captures: [] };
        if (match[key]) {
          let index2 = match.index + match[0].indexOf(match[key]);
          let length2 = match[key].length;
          let value2 = source.substr(index2, length2);
          groups[groupKey].index = index2;
          groups[groupKey].length = length2;
          groups[groupKey].value = value2;
          groups[groupKey].captures.push(value2);
        }
      });
      let value = match[0];
      let index = match.index;
      let length = value.length;
      if (positiveLookbehinds && positiveLookbehinds.length > 0 && value.indexOf(positiveLookbehinds[0].value) === 0) {
        value = source.substr(index, length).substr(positiveLookbehinds[0].value.length);
        index += positiveLookbehinds[0].value.length;
        length -= positiveLookbehinds[0].value.length;
      } else {
        value = source.substr(index, length);
      }
      matches.push(new Match(index, length, value, groups));
    });
    return matches;
  }
  static getSafeRegExp(source, flags) {
    let sanitizedSource = this.sanitizeGroups(source);
    return XRegExp__namespace(sanitizedSource, flags || "gis");
  }
  static getFirstMatchIndex(regex, source) {
    let matches = _RegExpUtility.getMatches(regex, source);
    if (matches.length) {
      return {
        matched: true,
        index: matches[0].index,
        value: matches[0].value
      };
    }
    return { matched: false, index: -1, value: null };
  }
  static split(regex, source) {
    return XRegExp__namespace.split(source, regex);
  }
  static isMatch(regex, source) {
    return !StringUtility.isNullOrEmpty(source) && this.getMatches(regex, source).length > 0;
  }
  static sanitizeGroups(source) {
    let index = 0;
    let result = XRegExp__namespace.replace(source, this.matchGroup, (match, name) => match.replace(name, `${name}__${index++}`));
    index = 0;
    result = XRegExp__namespace.replace(result, this.matchPositiveLookbehind, () => `(?<plb__${index++}>`);
    index = 0;
    result = XRegExp__namespace.replace(result, this.matchNegativeLookbehind, () => `(?<nlb__${index++}>`);
    return result;
  }
  static getNextRegex(source, startPos) {
    startPos = _RegExpUtility.getClosePos(source, startPos) + 1;
    let closePos = _RegExpUtility.getClosePos(source, startPos);
    if (source[startPos] !== "(") {
      closePos--;
    }
    let next = startPos === closePos ? null : source.substring(startPos, closePos + 1);
    return next;
  }
  static getClosePos(source, startPos) {
    let counter = 1;
    let closePos = startPos;
    while (counter > 0 && closePos < source.length) {
      let c = source[++closePos];
      if (c === "(") counter++;
      else if (c === ")") counter--;
    }
    return closePos;
  }
};
_RegExpUtility.matchGroup = XRegExp__namespace(String.raw`\?<(?<name>\w+)>`, "gis");
_RegExpUtility.matchPositiveLookbehind = XRegExp__namespace(String.raw`\(\?<=`, "gis");
_RegExpUtility.matchNegativeLookbehind = XRegExp__namespace(String.raw`\(\?<!`, "gis");
var RegExpUtility = _RegExpUtility;
var _StringUtility = class _StringUtility {
  static isNullOrWhitespace(input) {
    return !input || !input.trim();
  }
  static isNullOrEmpty(input) {
    return !input || input === "";
  }
  static isWhitespace(input) {
    return input && input !== "" && !input.trim();
  }
  static insertInto(input, value, index) {
    return input.substr(0, index) + value + input.substr(index);
  }
  static removeDiacriticsFromWordBoundaries(input) {
    return input.split(" ").map((s) => {
      let length = s.length;
      if (length === 0) return s;
      let first = _StringUtility.removeDiacritics(s.substring(0, 1));
      if (length === 1) return first;
      let last = length > 1 ? _StringUtility.removeDiacritics(s.substring(length - 1)) : "";
      let mid = s.substring(1, length - 1);
      return first + mid + last;
    }).join(" ");
  }
  static removeDiacritics(c) {
    let clean = _StringUtility.diacriticsRemovalMap[c];
    return !clean ? c : clean;
  }
};
_StringUtility.diacriticsRemovalMap = {
  "\u24B6": "A",
  "\uFF21": "A",
  "\xC0": "A",
  "\xC1": "A",
  "\xC2": "A",
  "\u1EA6": "A",
  "\u1EA4": "A",
  "\u1EAA": "A",
  "\u1EA8": "A",
  "\xC3": "A",
  "\u0100": "A",
  "\u0102": "A",
  "\u1EB0": "A",
  "\u1EAE": "A",
  "\u1EB4": "A",
  "\u1EB2": "A",
  "\u0226": "A",
  "\u01E0": "A",
  "\xC4": "A",
  "\u01DE": "A",
  "\u1EA2": "A",
  "\xC5": "A",
  "\u01FA": "A",
  "\u01CD": "A",
  "\u0200": "A",
  "\u0202": "A",
  "\u1EA0": "A",
  "\u1EAC": "A",
  "\u1EB6": "A",
  "\u1E00": "A",
  "\u0104": "A",
  "\u023A": "A",
  "\u2C6F": "A",
  "\u24B7": "B",
  "\uFF22": "B",
  "\u1E02": "B",
  "\u1E04": "B",
  "\u1E06": "B",
  "\u0243": "B",
  "\u0182": "B",
  "\u0181": "B",
  "\u24B8": "C",
  "\uFF23": "C",
  "\u0106": "C",
  "\u0108": "C",
  "\u010A": "C",
  "\u010C": "C",
  "\xC7": "C",
  "\u1E08": "C",
  "\u0187": "C",
  "\u023B": "C",
  "\uA73E": "C",
  "\u24B9": "D",
  "\uFF24": "D",
  "\u1E0A": "D",
  "\u010E": "D",
  "\u1E0C": "D",
  "\u1E10": "D",
  "\u1E12": "D",
  "\u1E0E": "D",
  "\u0110": "D",
  "\u018B": "D",
  "\u018A": "D",
  "\u0189": "D",
  "\uA779": "D",
  "\u24BA": "E",
  "\uFF25": "E",
  "\xC8": "E",
  "\xC9": "E",
  "\xCA": "E",
  "\u1EC0": "E",
  "\u1EBE": "E",
  "\u1EC4": "E",
  "\u1EC2": "E",
  "\u1EBC": "E",
  "\u0112": "E",
  "\u1E14": "E",
  "\u1E16": "E",
  "\u0114": "E",
  "\u0116": "E",
  "\xCB": "E",
  "\u1EBA": "E",
  "\u011A": "E",
  "\u0204": "E",
  "\u0206": "E",
  "\u1EB8": "E",
  "\u1EC6": "E",
  "\u0228": "E",
  "\u1E1C": "E",
  "\u0118": "E",
  "\u1E18": "E",
  "\u1E1A": "E",
  "\u0190": "E",
  "\u018E": "E",
  "\u24BB": "F",
  "\uFF26": "F",
  "\u1E1E": "F",
  "\u0191": "F",
  "\uA77B": "F",
  "\u24BC": "G",
  "\uFF27": "G",
  "\u01F4": "G",
  "\u011C": "G",
  "\u1E20": "G",
  "\u011E": "G",
  "\u0120": "G",
  "\u01E6": "G",
  "\u0122": "G",
  "\u01E4": "G",
  "\u0193": "G",
  "\uA7A0": "G",
  "\uA77D": "G",
  "\uA77E": "G",
  "\u24BD": "H",
  "\uFF28": "H",
  "\u0124": "H",
  "\u1E22": "H",
  "\u1E26": "H",
  "\u021E": "H",
  "\u1E24": "H",
  "\u1E28": "H",
  "\u1E2A": "H",
  "\u0126": "H",
  "\u2C67": "H",
  "\u2C75": "H",
  "\uA78D": "H",
  "\u24BE": "I",
  "\uFF29": "I",
  "\xCC": "I",
  "\xCD": "I",
  "\xCE": "I",
  "\u0128": "I",
  "\u012A": "I",
  "\u012C": "I",
  "\u0130": "I",
  "\xCF": "I",
  "\u1E2E": "I",
  "\u1EC8": "I",
  "\u01CF": "I",
  "\u0208": "I",
  "\u020A": "I",
  "\u1ECA": "I",
  "\u012E": "I",
  "\u1E2C": "I",
  "\u0197": "I",
  "\u24BF": "J",
  "\uFF2A": "J",
  "\u0134": "J",
  "\u0248": "J",
  "\u24C0": "K",
  "\uFF2B": "K",
  "\u1E30": "K",
  "\u01E8": "K",
  "\u1E32": "K",
  "\u0136": "K",
  "\u1E34": "K",
  "\u0198": "K",
  "\u2C69": "K",
  "\uA740": "K",
  "\uA742": "K",
  "\uA744": "K",
  "\uA7A2": "K",
  "\u24C1": "L",
  "\uFF2C": "L",
  "\u013F": "L",
  "\u0139": "L",
  "\u013D": "L",
  "\u1E36": "L",
  "\u1E38": "L",
  "\u013B": "L",
  "\u1E3C": "L",
  "\u1E3A": "L",
  "\u0141": "L",
  "\u023D": "L",
  "\u2C62": "L",
  "\u2C60": "L",
  "\uA748": "L",
  "\uA746": "L",
  "\uA780": "L",
  "\u24C2": "M",
  "\uFF2D": "M",
  "\u1E3E": "M",
  "\u1E40": "M",
  "\u1E42": "M",
  "\u2C6E": "M",
  "\u019C": "M",
  "\u24C3": "N",
  "\uFF2E": "N",
  "\u01F8": "N",
  "\u0143": "N",
  "\xD1": "N",
  "\u1E44": "N",
  "\u0147": "N",
  "\u1E46": "N",
  "\u0145": "N",
  "\u1E4A": "N",
  "\u1E48": "N",
  "\u0220": "N",
  "\u019D": "N",
  "\uA790": "N",
  "\uA7A4": "N",
  "\u24C4": "O",
  "\uFF2F": "O",
  "\xD2": "O",
  "\xD3": "O",
  "\xD4": "O",
  "\u1ED2": "O",
  "\u1ED0": "O",
  "\u1ED6": "O",
  "\u1ED4": "O",
  "\xD5": "O",
  "\u1E4C": "O",
  "\u022C": "O",
  "\u1E4E": "O",
  "\u014C": "O",
  "\u1E50": "O",
  "\u1E52": "O",
  "\u014E": "O",
  "\u022E": "O",
  "\u0230": "O",
  "\xD6": "O",
  "\u022A": "O",
  "\u1ECE": "O",
  "\u0150": "O",
  "\u01D1": "O",
  "\u020C": "O",
  "\u020E": "O",
  "\u01A0": "O",
  "\u1EDC": "O",
  "\u1EDA": "O",
  "\u1EE0": "O",
  "\u1EDE": "O",
  "\u1EE2": "O",
  "\u1ECC": "O",
  "\u1ED8": "O",
  "\u01EA": "O",
  "\u01EC": "O",
  "\xD8": "O",
  "\u01FE": "O",
  "\u0186": "O",
  "\u019F": "O",
  "\uA74A": "O",
  "\uA74C": "O",
  "\u24C5": "P",
  "\uFF30": "P",
  "\u1E54": "P",
  "\u1E56": "P",
  "\u01A4": "P",
  "\u2C63": "P",
  "\uA750": "P",
  "\uA752": "P",
  "\uA754": "P",
  "\u24C6": "Q",
  "\uFF31": "Q",
  "\uA756": "Q",
  "\uA758": "Q",
  "\u024A": "Q",
  "\u24C7": "R",
  "\uFF32": "R",
  "\u0154": "R",
  "\u1E58": "R",
  "\u0158": "R",
  "\u0210": "R",
  "\u0212": "R",
  "\u1E5A": "R",
  "\u1E5C": "R",
  "\u0156": "R",
  "\u1E5E": "R",
  "\u024C": "R",
  "\u2C64": "R",
  "\uA75A": "R",
  "\uA7A6": "R",
  "\uA782": "R",
  "\u24C8": "S",
  "\uFF33": "S",
  "\u1E9E": "S",
  "\u015A": "S",
  "\u1E64": "S",
  "\u015C": "S",
  "\u1E60": "S",
  "\u0160": "S",
  "\u1E66": "S",
  "\u1E62": "S",
  "\u1E68": "S",
  "\u0218": "S",
  "\u015E": "S",
  "\u2C7E": "S",
  "\uA7A8": "S",
  "\uA784": "S",
  "\u24C9": "T",
  "\uFF34": "T",
  "\u1E6A": "T",
  "\u0164": "T",
  "\u1E6C": "T",
  "\u021A": "T",
  "\u0162": "T",
  "\u1E70": "T",
  "\u1E6E": "T",
  "\u0166": "T",
  "\u01AC": "T",
  "\u01AE": "T",
  "\u023E": "T",
  "\uA786": "T",
  "\u24CA": "U",
  "\uFF35": "U",
  "\xD9": "U",
  "\xDA": "U",
  "\xDB": "U",
  "\u0168": "U",
  "\u1E78": "U",
  "\u016A": "U",
  "\u1E7A": "U",
  "\u016C": "U",
  "\xDC": "U",
  "\u01DB": "U",
  "\u01D7": "U",
  "\u01D5": "U",
  "\u01D9": "U",
  "\u1EE6": "U",
  "\u016E": "U",
  "\u0170": "U",
  "\u01D3": "U",
  "\u0214": "U",
  "\u0216": "U",
  "\u01AF": "U",
  "\u1EEA": "U",
  "\u1EE8": "U",
  "\u1EEE": "U",
  "\u1EEC": "U",
  "\u1EF0": "U",
  "\u1EE4": "U",
  "\u1E72": "U",
  "\u0172": "U",
  "\u1E76": "U",
  "\u1E74": "U",
  "\u0244": "U",
  "\u24CB": "V",
  "\uFF36": "V",
  "\u1E7C": "V",
  "\u1E7E": "V",
  "\u01B2": "V",
  "\uA75E": "V",
  "\u0245": "V",
  "\u24CC": "W",
  "\uFF37": "W",
  "\u1E80": "W",
  "\u1E82": "W",
  "\u0174": "W",
  "\u1E86": "W",
  "\u1E84": "W",
  "\u1E88": "W",
  "\u2C72": "W",
  "\u24CD": "X",
  "\uFF38": "X",
  "\u1E8A": "X",
  "\u1E8C": "X",
  "\u24CE": "Y",
  "\uFF39": "Y",
  "\u1EF2": "Y",
  "\xDD": "Y",
  "\u0176": "Y",
  "\u1EF8": "Y",
  "\u0232": "Y",
  "\u1E8E": "Y",
  "\u0178": "Y",
  "\u1EF6": "Y",
  "\u1EF4": "Y",
  "\u01B3": "Y",
  "\u024E": "Y",
  "\u1EFE": "Y",
  "\u24CF": "Z",
  "\uFF3A": "Z",
  "\u0179": "Z",
  "\u1E90": "Z",
  "\u017B": "Z",
  "\u017D": "Z",
  "\u1E92": "Z",
  "\u1E94": "Z",
  "\u01B5": "Z",
  "\u0224": "Z",
  "\u2C7F": "Z",
  "\u2C6B": "Z",
  "\uA762": "Z",
  "\u24D0": "a",
  "\uFF41": "a",
  "\u1E9A": "a",
  "\xE0": "a",
  "\xE1": "a",
  "\xE2": "a",
  "\u1EA7": "a",
  "\u1EA5": "a",
  "\u1EAB": "a",
  "\u1EA9": "a",
  "\xE3": "a",
  "\u0101": "a",
  "\u0103": "a",
  "\u1EB1": "a",
  "\u1EAF": "a",
  "\u1EB5": "a",
  "\u1EB3": "a",
  "\u0227": "a",
  "\u01E1": "a",
  "\xE4": "a",
  "\u01DF": "a",
  "\u1EA3": "a",
  "\xE5": "a",
  "\u01FB": "a",
  "\u01CE": "a",
  "\u0201": "a",
  "\u0203": "a",
  "\u1EA1": "a",
  "\u1EAD": "a",
  "\u1EB7": "a",
  "\u1E01": "a",
  "\u0105": "a",
  "\u2C65": "a",
  "\u0250": "a",
  "\u24D1": "b",
  "\uFF42": "b",
  "\u1E03": "b",
  "\u1E05": "b",
  "\u1E07": "b",
  "\u0180": "b",
  "\u0183": "b",
  "\u0253": "b",
  "\u24D2": "c",
  "\uFF43": "c",
  "\u0107": "c",
  "\u0109": "c",
  "\u010B": "c",
  "\u010D": "c",
  "\xE7": "c",
  "\u1E09": "c",
  "\u0188": "c",
  "\u023C": "c",
  "\uA73F": "c",
  "\u2184": "c",
  "\u24D3": "d",
  "\uFF44": "d",
  "\u1E0B": "d",
  "\u010F": "d",
  "\u1E0D": "d",
  "\u1E11": "d",
  "\u1E13": "d",
  "\u1E0F": "d",
  "\u0111": "d",
  "\u018C": "d",
  "\u0256": "d",
  "\u0257": "d",
  "\uA77A": "d",
  "\u24D4": "e",
  "\uFF45": "e",
  "\xE8": "e",
  "\xE9": "e",
  "\xEA": "e",
  "\u1EC1": "e",
  "\u1EBF": "e",
  "\u1EC5": "e",
  "\u1EC3": "e",
  "\u1EBD": "e",
  "\u0113": "e",
  "\u1E15": "e",
  "\u1E17": "e",
  "\u0115": "e",
  "\u0117": "e",
  "\xEB": "e",
  "\u1EBB": "e",
  "\u011B": "e",
  "\u0205": "e",
  "\u0207": "e",
  "\u1EB9": "e",
  "\u1EC7": "e",
  "\u0229": "e",
  "\u1E1D": "e",
  "\u0119": "e",
  "\u1E19": "e",
  "\u1E1B": "e",
  "\u0247": "e",
  "\u025B": "e",
  "\u01DD": "e",
  "\u24D5": "f",
  "\uFF46": "f",
  "\u1E1F": "f",
  "\u0192": "f",
  "\uA77C": "f",
  "\u24D6": "g",
  "\uFF47": "g",
  "\u01F5": "g",
  "\u011D": "g",
  "\u1E21": "g",
  "\u011F": "g",
  "\u0121": "g",
  "\u01E7": "g",
  "\u0123": "g",
  "\u01E5": "g",
  "\u0260": "g",
  "\uA7A1": "g",
  "\u1D79": "g",
  "\uA77F": "g",
  "\u24D7": "h",
  "\uFF48": "h",
  "\u0125": "h",
  "\u1E23": "h",
  "\u1E27": "h",
  "\u021F": "h",
  "\u1E25": "h",
  "\u1E29": "h",
  "\u1E2B": "h",
  "\u1E96": "h",
  "\u0127": "h",
  "\u2C68": "h",
  "\u2C76": "h",
  "\u0265": "h",
  "\u24D8": "i",
  "\uFF49": "i",
  "\xEC": "i",
  "\xED": "i",
  "\xEE": "i",
  "\u0129": "i",
  "\u012B": "i",
  "\u012D": "i",
  "\xEF": "i",
  "\u1E2F": "i",
  "\u1EC9": "i",
  "\u01D0": "i",
  "\u0209": "i",
  "\u020B": "i",
  "\u1ECB": "i",
  "\u012F": "i",
  "\u1E2D": "i",
  "\u0268": "i",
  "\u0131": "i",
  "\u24D9": "j",
  "\uFF4A": "j",
  "\u0135": "j",
  "\u01F0": "j",
  "\u0249": "j",
  "\u24DA": "k",
  "\uFF4B": "k",
  "\u1E31": "k",
  "\u01E9": "k",
  "\u1E33": "k",
  "\u0137": "k",
  "\u1E35": "k",
  "\u0199": "k",
  "\u2C6A": "k",
  "\uA741": "k",
  "\uA743": "k",
  "\uA745": "k",
  "\uA7A3": "k",
  "\u24DB": "l",
  "\uFF4C": "l",
  "\u0140": "l",
  "\u013A": "l",
  "\u013E": "l",
  "\u1E37": "l",
  "\u1E39": "l",
  "\u013C": "l",
  "\u1E3D": "l",
  "\u1E3B": "l",
  "\u017F": "l",
  "\u0142": "l",
  "\u019A": "l",
  "\u026B": "l",
  "\u2C61": "l",
  "\uA749": "l",
  "\uA781": "l",
  "\uA747": "l",
  "\u24DC": "m",
  "\uFF4D": "m",
  "\u1E3F": "m",
  "\u1E41": "m",
  "\u1E43": "m",
  "\u0271": "m",
  "\u026F": "m",
  "\u24DD": "n",
  "\uFF4E": "n",
  "\u01F9": "n",
  "\u0144": "n",
  "\xF1": "n",
  "\u1E45": "n",
  "\u0148": "n",
  "\u1E47": "n",
  "\u0146": "n",
  "\u1E4B": "n",
  "\u1E49": "n",
  "\u019E": "n",
  "\u0272": "n",
  "\u0149": "n",
  "\uA791": "n",
  "\uA7A5": "n",
  "\u24DE": "o",
  "\uFF4F": "o",
  "\xF2": "o",
  "\xF3": "o",
  "\xF4": "o",
  "\u1ED3": "o",
  "\u1ED1": "o",
  "\u1ED7": "o",
  "\u1ED5": "o",
  "\xF5": "o",
  "\u1E4D": "o",
  "\u022D": "o",
  "\u1E4F": "o",
  "\u014D": "o",
  "\u1E51": "o",
  "\u1E53": "o",
  "\u014F": "o",
  "\u022F": "o",
  "\u0231": "o",
  "\xF6": "o",
  "\u022B": "o",
  "\u1ECF": "o",
  "\u0151": "o",
  "\u01D2": "o",
  "\u020D": "o",
  "\u020F": "o",
  "\u01A1": "o",
  "\u1EDD": "o",
  "\u1EDB": "o",
  "\u1EE1": "o",
  "\u1EDF": "o",
  "\u1EE3": "o",
  "\u1ECD": "o",
  "\u1ED9": "o",
  "\u01EB": "o",
  "\u01ED": "o",
  "\xF8": "o",
  "\u01FF": "o",
  "\u0254": "o",
  "\uA74B": "o",
  "\uA74D": "o",
  "\u0275": "o",
  "\u24DF": "p",
  "\uFF50": "p",
  "\u1E55": "p",
  "\u1E57": "p",
  "\u01A5": "p",
  "\u1D7D": "p",
  "\uA751": "p",
  "\uA753": "p",
  "\uA755": "p",
  "\u24E0": "q",
  "\uFF51": "q",
  "\u024B": "q",
  "\uA757": "q",
  "\uA759": "q",
  "\u24E1": "r",
  "\uFF52": "r",
  "\u0155": "r",
  "\u1E59": "r",
  "\u0159": "r",
  "\u0211": "r",
  "\u0213": "r",
  "\u1E5B": "r",
  "\u1E5D": "r",
  "\u0157": "r",
  "\u1E5F": "r",
  "\u024D": "r",
  "\u027D": "r",
  "\uA75B": "r",
  "\uA7A7": "r",
  "\uA783": "r",
  "\u24E2": "s",
  "\uFF53": "s",
  "\xDF": "s",
  "\u015B": "s",
  "\u1E65": "s",
  "\u015D": "s",
  "\u1E61": "s",
  "\u0161": "s",
  "\u1E67": "s",
  "\u1E63": "s",
  "\u1E69": "s",
  "\u0219": "s",
  "\u015F": "s",
  "\u023F": "s",
  "\uA7A9": "s",
  "\uA785": "s",
  "\u1E9B": "s",
  "\u24E3": "t",
  "\uFF54": "t",
  "\u1E6B": "t",
  "\u1E97": "t",
  "\u0165": "t",
  "\u1E6D": "t",
  "\u021B": "t",
  "\u0163": "t",
  "\u1E71": "t",
  "\u1E6F": "t",
  "\u0167": "t",
  "\u01AD": "t",
  "\u0288": "t",
  "\u2C66": "t",
  "\uA787": "t",
  "\u24E4": "u",
  "\uFF55": "u",
  "\xF9": "u",
  "\xFA": "u",
  "\xFB": "u",
  "\u0169": "u",
  "\u1E79": "u",
  "\u016B": "u",
  "\u1E7B": "u",
  "\u016D": "u",
  "\xFC": "u",
  "\u01DC": "u",
  "\u01D8": "u",
  "\u01D6": "u",
  "\u01DA": "u",
  "\u1EE7": "u",
  "\u016F": "u",
  "\u0171": "u",
  "\u01D4": "u",
  "\u0215": "u",
  "\u0217": "u",
  "\u01B0": "u",
  "\u1EEB": "u",
  "\u1EE9": "u",
  "\u1EEF": "u",
  "\u1EED": "u",
  "\u1EF1": "u",
  "\u1EE5": "u",
  "\u1E73": "u",
  "\u0173": "u",
  "\u1E77": "u",
  "\u1E75": "u",
  "\u0289": "u",
  "\u24E5": "v",
  "\uFF56": "v",
  "\u1E7D": "v",
  "\u1E7F": "v",
  "\u028B": "v",
  "\uA75F": "v",
  "\u028C": "v",
  "\u24E6": "w",
  "\uFF57": "w",
  "\u1E81": "w",
  "\u1E83": "w",
  "\u0175": "w",
  "\u1E87": "w",
  "\u1E85": "w",
  "\u1E98": "w",
  "\u1E89": "w",
  "\u2C73": "w",
  "\u24E7": "x",
  "\uFF58": "x",
  "\u1E8B": "x",
  "\u1E8D": "x",
  "\u24E8": "y",
  "\uFF59": "y",
  "\u1EF3": "y",
  "\xFD": "y",
  "\u0177": "y",
  "\u1EF9": "y",
  "\u0233": "y",
  "\u1E8F": "y",
  "\xFF": "y",
  "\u1EF7": "y",
  "\u1E99": "y",
  "\u1EF5": "y",
  "\u01B4": "y",
  "\u024F": "y",
  "\u1EFF": "y",
  "\u24E9": "z",
  "\uFF5A": "z",
  "\u017A": "z",
  "\u1E91": "z",
  "\u017C": "z",
  "\u017E": "z",
  "\u1E93": "z",
  "\u1E95": "z",
  "\u01B6": "z",
  "\u0225": "z",
  "\u0240": "z",
  "\u2C6C": "z",
  "\uA763": "z"
};
var StringUtility = _StringUtility;

// recognizers/recognizers-text/src/models.ts
var ModelResult = class {
};
var ModelFactoryKey = class {
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
};
var _ModelFactory = class _ModelFactory {
  constructor() {
    this.modelFactories = /* @__PURE__ */ new Map();
  }
  getModel(modelTypeName, culture, fallbackToDefaultCulture, options) {
    let result = this.tryGetModel(modelTypeName, culture, options);
    if (!result.containsModel && fallbackToDefaultCulture) {
      result = this.tryGetModel(modelTypeName, _ModelFactory.fallbackCulture, options);
    }
    if (result.containsModel) {
      return result.model;
    }
    throw new Error(`Could not find Model with the specified configuration: ${culture},${modelTypeName}`);
  }
  tryGetModel(modelTypeName, culture, options) {
    culture = Culture.mapToNearestLanguage(culture);
    let cacheResult = this.getModelFromCache(modelTypeName, culture, options);
    if (cacheResult) return { containsModel: true, model: cacheResult };
    let key = this.generateKey(modelTypeName, culture);
    if (this.modelFactories.has(key)) {
      let model = this.modelFactories.get(key)(options);
      this.registerModelInCache(modelTypeName, culture, options, model);
      return { containsModel: true, model };
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
      if (StringUtility.isNullOrEmpty(targetCulture) || modelFactoryKey.culture === targetCulture) {
        this.tryGetModel(modelFactoryKey.modelType, modelFactoryKey.culture, modelFactoryKey.options);
      }
    });
  }
  generateKey(modelTypeName, culture) {
    return new ModelFactoryKey(culture, modelTypeName).toString();
  }
  getModelFromCache(modelTypeName, culture, options) {
    let key = this.generateCacheKey(modelTypeName, culture, options);
    return _ModelFactory.cache.get(key);
  }
  registerModelInCache(modelTypeName, culture, options, model) {
    let key = this.generateCacheKey(modelTypeName, culture, options);
    _ModelFactory.cache.set(key, model);
  }
  generateCacheKey(modelTypeName, culture, options) {
    return new ModelFactoryKey(culture, modelTypeName, options).toString();
  }
};
_ModelFactory.fallbackCulture = Culture.English;
_ModelFactory.cache = /* @__PURE__ */ new Map();
var ModelFactory = _ModelFactory;

// recognizers/recognizers-text/src/recognizer.ts
var Recognizer = class {
  constructor(targetCulture, options, lazyInitialization) {
    this.modelFactory = new ModelFactory();
    if (!this.IsValidOptions(options)) throw new Error(`${options} is not a valid options value.`);
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
};

// recognizers/recognizers-text/src/extractors.ts
var ExtractResult = class {
  static isOverlap(erA, erB) {
    return !(erA.start >= erB.start + erB.length) && !(erB.start >= erA.start + erA.length);
  }
  static isCover(er1, er2) {
    return er2.start < er1.start && er2.start + er2.length >= er1.start + er1.length || er2.start <= er1.start && er2.start + er2.length > er1.start + er1.length;
  }
  static getFromText(source) {
    return {
      start: 0,
      length: source.length,
      text: source,
      type: "custom"
    };
  }
};

// recognizers/recognizers-text/src/parsers.ts
var ParseResult = class extends ExtractResult {
  constructor(er) {
    super();
    if (er) {
      this.length = er.length;
      this.start = er.start;
      this.data = er.data;
      this.text = er.text;
      this.type = er.type;
    }
    this.resolutionStr = "";
  }
};

exports.Culture = Culture;
exports.CultureInfo = CultureInfo;
exports.ExtractResult = ExtractResult;
exports.FormatUtility = FormatUtility;
exports.Match = Match;
exports.ModelFactory = ModelFactory;
exports.ModelResult = ModelResult;
exports.ParseResult = ParseResult;
exports.Recognizer = Recognizer;
exports.RegExpUtility = RegExpUtility;
exports.StringUtility = StringUtility;
