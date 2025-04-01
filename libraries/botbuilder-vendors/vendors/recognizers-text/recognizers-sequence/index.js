'use strict';

var recognizersText = require('../recognizers-text');

// recognizers/recognizers-sequence/src/sequence/sequenceRecognizer.ts

// recognizers/recognizers-sequence/src/sequence/models.ts
var AbstractSequenceModel = class {
  constructor(parser, extractor) {
    this.extractor = extractor;
    this.parser = parser;
  }
  parse(query) {
    let extractResults = this.extractor.extract(query);
    let parseResults = extractResults.map((r) => this.parser.parse(r));
    return parseResults.map((o) => o).map((o) => ({
      start: o.start,
      end: o.start + o.length - 1,
      resolution: { "value": o.resolutionStr },
      text: o.text,
      typeName: this.modelTypeName
    }));
  }
};
var PhoneNumberModel = class extends AbstractSequenceModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "phonenumber";
  }
  parse(query) {
    let extractResults = this.extractor.extract(query);
    let parseResults = extractResults.map((r) => this.parser.parse(r));
    return parseResults.map((o) => o).map((o) => ({
      start: o.start,
      end: o.start + o.length - 1,
      resolution: {
        "value": o.resolutionStr,
        "score": o.value.toString()
      },
      text: o.text,
      typeName: this.modelTypeName
    }));
  }
};
var IpAddressModel = class extends AbstractSequenceModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "ip";
  }
  parse(query) {
    let extractResults = this.extractor.extract(query);
    let parseResults = extractResults.map((r) => this.parser.parse(r));
    return parseResults.map((o) => o).map((o) => ({
      start: o.start,
      end: o.start + o.length - 1,
      resolution: {
        "value": o.resolutionStr,
        "type": o.data
      },
      text: o.text,
      typeName: this.modelTypeName
    }));
  }
};
var MentionModel = class extends AbstractSequenceModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "mention";
  }
};
var HashtagModel = class extends AbstractSequenceModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "hashtag";
  }
};
var EmailModel = class extends AbstractSequenceModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "email";
  }
};
var URLModel = class extends AbstractSequenceModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "url";
  }
};
var GUIDModel = class extends AbstractSequenceModel {
  constructor() {
    super(...arguments);
    this.modelTypeName = "guid";
  }
};

// recognizers/recognizers-sequence/src/resources/basePhoneNumbers.ts
exports.BasePhoneNumbers = void 0;
((BasePhoneNumbers2) => {
  BasePhoneNumbers2.NumberReplaceToken = "@builtin.phonenumber";
  BasePhoneNumbers2.GeneralPhoneNumberRegex = `(\\b(((\\d[\\s]?){7,15}\\d))(?!-)\\b)|(\\(\\d{5}\\)\\s?\\d{5,6})|\\+\\d{2}\\(\\d\\)\\d{10}`;
  BasePhoneNumbers2.BRPhoneNumberRegex = `(((\\B\\(\\s?))\\d{2,3}(\\s?\\))|(\\b\\d{2,3}))\\s?\\d{4,5}-?\\d{3,5}(?!-)\\b`;
  BasePhoneNumbers2.UKPhoneNumberRegex = `(((\\b(00)|\\B\\+)\\s?)?(\\b\\d{2}\\s?)?((\\s?\\(0\\)[-\\s]?|\\b|(?<=(\\b^#)\\d{2}))\\d{2,5}|\\(0\\d{3,4}\\))[/-]?\\s?(\\d{5,8}|\\d{3,4}[-\\s]?\\d{3,4})(?!-)\\b)`;
  BasePhoneNumbers2.DEPhoneNumberRegex = `((\\+\\d{2}\\s?((\\(0\\))?\\d\\s?)?|\\b)(\\d{2,4}\\s?[-/]?[\\s\\d]{7,10}\\d)(?!-)\\b)`;
  BasePhoneNumbers2.USPhoneNumberRegex = `((((\\B\\+)|\\b)1(\\s|-)?)|\\b)?(\\(\\d{3}\\)[-\\s]?|\\b\\d{3}\\s?[-\\.]?\\s?)\\d{3}\\s?[-\\.]?\\s?\\d{4}(\\s?(x|X|ext)\\s?\\d{3,5})?(?!-)\\b`;
  BasePhoneNumbers2.CNPhoneNumberRegex = `((\\b00\\s?)?\\+?86\\s?-?\\s?)?(((\\b|(?<=86))\\d{2,5}\\s?-?\\s?|\\(\\d{2,5}\\)\\s?)\\d{4}\\s?-?\\s?\\d{4}(\\s?-?\\s?\\d{4})?|(\\b|(?<=86))\\d{3}\\s?-?\\s?\\d{4}\\s?-?\\s?\\d{4})(?!-)\\b`;
  BasePhoneNumbers2.DKPhoneNumberRegex = `((\\(\\s?(\\+\\s?|00)45\\s?\\)\\s?)|(((?<!\\d)\\+\\s?|\\b00)45\\s?)|\\b)(\\s?\\(0\\)\\s?)?((\\d{8})|(\\d{4}\\s?-?\\s?\\d{4,6})|((\\d{2}[\\s-]){3}\\d{2})|(\\d{2}\\s?-?\\s?\\d{3}\\s?-?\\s?\\d{3}))(?!-)\\b`;
  BasePhoneNumbers2.ITPhoneNumberRegex = `((\\(\\s?(\\+\\s?|00)39\\s?\\)\\s?)|(((?<!\\d)\\+\\s?|\\b00)39\\s?)|\\b)((0[\\d\\s-]{4,12}\\d)|(3[\\d\\s-]{7,12}\\d))(?!-)\\b`;
  BasePhoneNumbers2.NLPhoneNumberRegex = `((((\\(\\s?(\\+\\s?|00)31\\s?\\)\\s?)|(((?<!\\d)\\+\\s?|\\b00)31\\s?))?(((\\b|(?<=31))0?\\d{1,3}|\\(\\s?0?\\d{1,3}\\s?\\)|\\(0\\)[-\\s]?\\d{1,3})\\s?-?[\\d\\s]{5,11}\\d))|\\b\\d{10,12})(?!-)\\b`;
  BasePhoneNumbers2.SpecialPhoneNumberRegex = `\\b(\\d{3,4}[/-]\\d{1,4}[/-]\\d{3,4})\\b`;
  BasePhoneNumbers2.TypicalDeductionRegexList = ["^\\d{3}-\\d{2}-\\d{4}$", "^\\d{5}-\\d{4}$"];
  BasePhoneNumbers2.PhoneNumberMaskRegex = `([0-9A-E]{2}(\\s[0-9A-E]{2}){7})`;
  BasePhoneNumbers2.CountryCodeRegex = `^(\\(\\s?(\\+\\s?|00)\\d{1,3}\\s?\\)|(\\+\\s?|00)\\d{1,3})`;
  BasePhoneNumbers2.AreaCodeIndicatorRegex = `\\(`;
  BasePhoneNumbers2.FormatIndicatorRegex = `(\\s|-|/|\\.)+`;
  BasePhoneNumbers2.SeparatorCharList = ["-", ".", "/", "+", "#", "*"];
})(exports.BasePhoneNumbers || (exports.BasePhoneNumbers = {}));
var BaseSequenceParser = class {
  parse(extResult) {
    let result = new recognizersText.ParseResult(extResult);
    result.resolutionStr = extResult.text;
    return result;
  }
};
var BaseIpParser = class extends BaseSequenceParser {
  parse(extResult) {
    let result = new recognizersText.ParseResult(extResult);
    result.resolutionStr = this.dropLeadingZeros(extResult.text);
    return result;
  }
  dropLeadingZeros(text) {
    let result = "";
    let number = "";
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (c == "." || c == ":") {
        if (number != "") {
          number = number == "0" ? number : number.replace(/^(0*)/, "");
          number = number == "" ? "0" : number;
          result += number;
        }
        result += text[i];
        number = "";
      } else {
        number += c.toString();
        if (i == text.length - 1) {
          number = number == "0" ? number : number.replace(/^(0*)/, "");
          number = number == "" ? "0" : number;
          result += number;
        }
      }
    }
    return result;
  }
};
var PhoneNumberParser = class extends BaseSequenceParser {
  constructor() {
    super(...arguments);
    this.scoreUpperLimit = 100;
    this.scoreLowerLimit = 0;
    this.baseScore = 30;
    this.countryCodeAward = 40;
    this.areaCodeAward = 30;
    this.formattedAward = 20;
    this.lengthAward = 10;
    this.typicalFormatDeductionScore = 40;
    this.continueDigitDeductionScore = 10;
    this.tailSameDeductionScore = 10;
    this.continueFormatIndicatorDeductionScore = 20;
    this.maxFormatIndicatorNum = 3;
    this.maxLengthAwardNum = 3;
    this.tailSameLimit = 2;
    this.phoneNumberLengthBase = 8;
    this.pureDigitLengthLimit = 11;
    this.tailSameDigitRegex = new RegExp("([\\d])\\1{2,10}$");
    this.pureDigitRegex = new RegExp("^\\d*$");
    this.continueDigitRegex = new RegExp("\\d{5}\\d*", "ig");
    this.digitRegex = new RegExp("\\d", "ig");
  }
  ScorePhoneNumber(phoneNumberText) {
    let score = this.baseScore;
    let countryCodeRegex = new RegExp(exports.BasePhoneNumbers.CountryCodeRegex);
    let areaCodeRegex = new RegExp(exports.BasePhoneNumbers.AreaCodeIndicatorRegex);
    let formatIndicatorRegex = new RegExp(exports.BasePhoneNumbers.FormatIndicatorRegex, "ig");
    score += countryCodeRegex.test(phoneNumberText) ? this.countryCodeAward : areaCodeRegex.test(phoneNumberText) ? this.areaCodeAward : 0;
    if (formatIndicatorRegex.test(phoneNumberText)) {
      var formatMathes = phoneNumberText.match(formatIndicatorRegex);
      var formatIndicatorCount = formatMathes.length;
      score += Math.min(formatIndicatorCount, this.maxFormatIndicatorNum) * this.formattedAward;
      score -= formatMathes.some((match) => match.length > 1) ? this.continueFormatIndicatorDeductionScore : 0;
    }
    if (this.tailSameDigitRegex.test(phoneNumberText)) {
      score -= (phoneNumberText.match(this.tailSameDigitRegex)[0].length - this.tailSameLimit) * this.tailSameDeductionScore;
    }
    if (this.digitRegex.test(phoneNumberText)) {
      score += Math.min(
        phoneNumberText.match(this.digitRegex).length - this.phoneNumberLengthBase,
        this.maxLengthAwardNum
      ) * this.lengthAward;
    }
    if (this.pureDigitRegex.test(phoneNumberText)) {
      score -= phoneNumberText.length > this.pureDigitLengthLimit ? (phoneNumberText.length - this.pureDigitLengthLimit) * this.lengthAward : 0;
    }
    score -= exports.BasePhoneNumbers.TypicalDeductionRegexList.some((o) => new RegExp(o).test(phoneNumberText)) ? this.typicalFormatDeductionScore : 0;
    if (this.continueDigitRegex.test(phoneNumberText)) {
      score -= Math.max(phoneNumberText.match(this.continueDigitRegex).length - 1, 0) * this.continueDigitDeductionScore;
    }
    return Math.max(Math.min(score, this.scoreUpperLimit), this.scoreLowerLimit) / (this.scoreUpperLimit - this.scoreLowerLimit);
  }
  parse(extResult) {
    let result = new recognizersText.ParseResult(extResult);
    result.resolutionStr = extResult.text;
    result.value = this.ScorePhoneNumber(extResult.text);
    return result;
  }
};
var IpParser = class extends BaseIpParser {
};
var MentionParser = class extends BaseSequenceParser {
};
var HashtagParser = class extends BaseSequenceParser {
};
var EmailParser = class extends BaseSequenceParser {
};
var URLParser = class extends BaseSequenceParser {
};
var GUIDParser = class extends BaseSequenceParser {
};

// recognizers/recognizers-sequence/src/resources/baseIp.ts
exports.BaseIp = void 0;
((BaseIp2) => {
  BaseIp2.Ipv4Regex = `\\b(1\\d{2}|2[0-4]\\d|25[0-5]|0?[1-9]\\d|0{0,2}\\d)((\\.(1\\d{2}|2[0-4]\\d|25[0-5]|0?[1-9]\\d|0{0,2}\\d)){3})\\b`;
  BaseIp2.BasicIpv6Element = `([\\da-fA-F]{1,4})`;
  BaseIp2.BasicIpv6Regex = `((${BaseIp2.BasicIpv6Element}:){7}${BaseIp2.BasicIpv6Element})`;
  BaseIp2.Ipv6EllipsisRegex1 = `(:(:${BaseIp2.BasicIpv6Element}){1,7})`;
  BaseIp2.Ipv6EllipsisRegex2 = `((${BaseIp2.BasicIpv6Element}:){1}((:${BaseIp2.BasicIpv6Element}){1,6}))`;
  BaseIp2.Ipv6EllipsisRegex3 = `((${BaseIp2.BasicIpv6Element}:){2}((:${BaseIp2.BasicIpv6Element}){1,5}))`;
  BaseIp2.Ipv6EllipsisRegex4 = `((${BaseIp2.BasicIpv6Element}:){3}((:${BaseIp2.BasicIpv6Element}){1,4}))`;
  BaseIp2.Ipv6EllipsisRegex5 = `((${BaseIp2.BasicIpv6Element}:){4}((:${BaseIp2.BasicIpv6Element}){1,3}))`;
  BaseIp2.Ipv6EllipsisRegex6 = `((${BaseIp2.BasicIpv6Element}:){5}((:${BaseIp2.BasicIpv6Element}){1,2}))`;
  BaseIp2.Ipv6EllipsisRegex7 = `((${BaseIp2.BasicIpv6Element}:){6}((:${BaseIp2.BasicIpv6Element}){1}))`;
  BaseIp2.Ipv6EllipsisRegex8 = `((${BaseIp2.BasicIpv6Element}:){7}(:))`;
  BaseIp2.Ipv6EllipsisRegexOther = `\\B::\\B|\\B:(:${BaseIp2.BasicIpv6Element}){1,7}\\b|\\b(${BaseIp2.BasicIpv6Element}:){1,7}:\\B`;
  BaseIp2.MergedIpv6Regex = `(${BaseIp2.BasicIpv6Regex}|${BaseIp2.Ipv6EllipsisRegex1}|${BaseIp2.Ipv6EllipsisRegex2}|${BaseIp2.Ipv6EllipsisRegex3}|${BaseIp2.Ipv6EllipsisRegex4}|${BaseIp2.Ipv6EllipsisRegex5}|${BaseIp2.Ipv6EllipsisRegex6}|${BaseIp2.Ipv6EllipsisRegex7}|${BaseIp2.Ipv6EllipsisRegex8})`;
  BaseIp2.Ipv6Regex = `(\\b${BaseIp2.MergedIpv6Regex}\\b)|(${BaseIp2.Ipv6EllipsisRegexOther})`;
})(exports.BaseIp || (exports.BaseIp = {}));

// recognizers/recognizers-sequence/src/resources/baseMention.ts
exports.BaseMention = void 0;
((BaseMention2) => {
  BaseMention2.MentionRegex = `@([a-zA-Z0-9_]+)(?![.]\\w)\\b`;
})(exports.BaseMention || (exports.BaseMention = {}));

// recognizers/recognizers-sequence/src/resources/baseHashtag.ts
exports.BaseHashtag = void 0;
((BaseHashtag2) => {
  BaseHashtag2.HashtagRegex = `((?<=\\s|^)#([a-zA-Z0-9_]+))`;
})(exports.BaseHashtag || (exports.BaseHashtag = {}));

// recognizers/recognizers-sequence/src/resources/baseEmail.ts
exports.BaseEmail = void 0;
((BaseEmail2) => {
  BaseEmail2.EmailRegex = `(([-a-zA-Z0-9_\\+\\.]+)@([-a-zA-Z\\d\\.]+)\\.([a-zA-Z\\.]{2,6}))`;
  BaseEmail2.IPv4Regex = `(?<ipv4>(\\d{1,3}\\.){3}\\d{1,3})`;
  BaseEmail2.NormalSuffixRegex = `(([0-9A-Za-z][-]*[0-9A-Za-z]*\\.)+(?<tld>[a-zA-Z][\\-a-zA-Z]{0,22}[a-zA-Z]))`;
  BaseEmail2.EmailPrefix = `(?("")("".+?(?<!\\\\)"")|(([0-9A-Za-z]((\\.(?!\\.))|[-!#\\$%&'\\*\\+/=\\?\\^\\{\\}\\|~\\w])*)(?<=[0-9A-Za-z])))`;
  BaseEmail2.EmailSuffix = `(?(\\[)(\\[${BaseEmail2.IPv4Regex}\\])|${BaseEmail2.NormalSuffixRegex})`;
  BaseEmail2.EmailRegex2 = `((${BaseEmail2.EmailPrefix})@(${BaseEmail2.EmailSuffix}))`;
})(exports.BaseEmail || (exports.BaseEmail = {}));

// recognizers/recognizers-sequence/src/resources/baseURL.ts
exports.BaseURL = void 0;
((BaseURL2) => {
  BaseURL2.ProtocolRegex = `((https?|ftp):\\/\\/)`;
  BaseURL2.PortRegex = `(:\\d{1,5})`;
  BaseURL2.ExtractionRestrictionRegex = `(?<=\\s|[\\'""\\(\\[:]|^)`;
  BaseURL2.UrlPrefixRegex = `(${BaseURL2.ExtractionRestrictionRegex}${BaseURL2.ProtocolRegex}?|${BaseURL2.ProtocolRegex})[a-zA-Z0-9][-a-zA-Z0-9:%._\\+~#=]{0,256}\\.`;
  BaseURL2.UrlSuffixRegex = `${BaseURL2.PortRegex}?([/#][-a-zA-Z0-9:%_\\+.~#?!&//=]*)?(?![-a-zA-Z0-9:%_\\+~#?!&//=@])`;
  BaseURL2.UrlRegex = `${BaseURL2.UrlPrefixRegex}(?<Tld>[a-zA-Z]{2,18})${BaseURL2.UrlSuffixRegex}`;
  BaseURL2.UrlRegex2 = `((ht|f)tp(s?)\\:\\/\\/|www\\.)[0-9a-zA-Z]([-.\\w]*[0-9a-zA-Z])*(\\.(?<Tld>[0-9a-zA-Z]+))+(:(0-9)*)*(\\/?)([a-zA-Z0-9\\-\\.\\?\\,\\'\\/\\\\\\+&amp;%\\$#_=@]*)?`;
  BaseURL2.IpUrlRegex = `(?<IPurl>(${BaseURL2.ExtractionRestrictionRegex}${BaseURL2.ProtocolRegex}(${exports.BaseIp.Ipv4Regex}|localhost)${BaseURL2.UrlSuffixRegex}))`;
  BaseURL2.TldList = ["com", "org", "net", "int", "edu", "gov", "mil", "academy", "app", "aws", "bot", "buy", "cafe", "city", "cloud", "company", "eco", "education", "game", "games", "gmbh", "law", "limited", "live", "llc", "ltd", "ltda", "map", "med", "news", "ngo", "ong", "phd", "place", "radio", "science", "search", "shopping", "sport", "store", "tvs", "wiki", "work", "ac", "ad", "ae", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "as", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bl", "bm", "bn", "bo", "bq", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cu", "cv", "cw", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mf", "mg", "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "su", "sv", "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "um", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "ye", "yt", "za", "zm", "zw"];
})(exports.BaseURL || (exports.BaseURL = {}));

// recognizers/recognizers-sequence/src/resources/baseGUID.ts
exports.BaseGUID = void 0;
((BaseGUID2) => {
  BaseGUID2.GUIDRegexElement = `([A-Fa-f0-9]{8}(-[A-Fa-f0-9]{4}){3}-[A-Fa-f0-9]{12})`;
  BaseGUID2.GUIDRegex = `(${BaseGUID2.GUIDRegexElement}|\\{${BaseGUID2.GUIDRegexElement}\\}|urn:uuid:${BaseGUID2.GUIDRegexElement})`;
})(exports.BaseGUID || (exports.BaseGUID = {}));

// recognizers/recognizers-sequence/src/sequence/constants.ts
var Constants = class {
};
Constants.IP_REGEX_IPV4 = "ipv4";
Constants.IP_REGEX_IPV6 = "ipv6";
Constants.IPV6_ELLIPSIS = "::";
Constants.PHONE_NUMBER_REGEX_GENERAL = "GeneralPhoneNumber";
Constants.PHONE_NUMBER_REGEX_BR = "BRPhoneNumber";
Constants.PHONE_NUMBER_REGEX_UK = "UKPhoneNumber";
Constants.PHONE_NUMBER_REGEX_DE = "DEPhoneNumber";
Constants.PHONE_NUMBER_REGEX_US = "USPhoneNumber";
Constants.PHONE_NUMBER_REGEX_CN = "CNPhoneNumber";
Constants.PHONE_NUMBER_REGEX_DK = "DKPhoneNumber";
Constants.PHONE_NUMBER_REGEX_IT = "ITPhoneNumber";
Constants.PHONE_NUMBER_REGEX_NL = "NLPhoneNumber";
Constants.PHONE_NUMBER_REGEX_SPECIAL = "SpecialPhoneNumber";
Constants.MENTION_REGEX = "Mention";
Constants.HASHTAG_REGEX = "Hashtag";
Constants.EMAIL_REGEX = "Email";
Constants.URL_REGEX = "Url";
Constants.GUID_REGEX = "Guid";

// recognizers/recognizers-sequence/src/sequence/extractors.ts
var BaseSequenceExtractor = class {
  extract(source) {
    let results = new Array();
    if (recognizersText.StringUtility.isNullOrWhitespace(source)) {
      return results;
    }
    let matchSource = /* @__PURE__ */ new Map();
    let matched = new Array(source.length);
    this.regexes.forEach((typeExtracted, regex) => {
      recognizersText.RegExpUtility.getMatches(regex, source).forEach((match) => {
        for (var j = 0; j < match.length; j++) {
          matched[match.index + j] = true;
        }
        matchSource.set(match, typeExtracted);
      });
    });
    let lastNotMatched = -1;
    for (var i = 0; i < source.length; i++) {
      if (matched[i]) {
        if (i + 1 == source.length || !matched[i + 1]) {
          let start = lastNotMatched + 1;
          let length = i - lastNotMatched;
          let substr = source.substr(start, length);
          let matchFunc = (o) => o.index == start && o.length == length;
          var srcMatch = Array.from(matchSource.keys()).find(matchFunc);
          if (srcMatch) {
            results.push({
              start,
              length,
              text: substr,
              type: this.extractType,
              data: matchSource.has(srcMatch) ? matchSource.get(srcMatch) : null
            });
          }
        }
      } else {
        lastNotMatched = i;
      }
    }
    return results;
  }
};
var BasePhoneNumberExtractor = class extends BaseSequenceExtractor {
  constructor() {
    super();
    this.regexes = (/* @__PURE__ */ new Map()).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BasePhoneNumbers.BRPhoneNumberRegex), Constants.PHONE_NUMBER_REGEX_BR).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BasePhoneNumbers.GeneralPhoneNumberRegex), Constants.PHONE_NUMBER_REGEX_GENERAL).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BasePhoneNumbers.UKPhoneNumberRegex), Constants.PHONE_NUMBER_REGEX_UK).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BasePhoneNumbers.DEPhoneNumberRegex), Constants.PHONE_NUMBER_REGEX_DE).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BasePhoneNumbers.USPhoneNumberRegex), Constants.PHONE_NUMBER_REGEX_US).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BasePhoneNumbers.CNPhoneNumberRegex), Constants.PHONE_NUMBER_REGEX_CN).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BasePhoneNumbers.DKPhoneNumberRegex), Constants.PHONE_NUMBER_REGEX_DK).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BasePhoneNumbers.ITPhoneNumberRegex), Constants.PHONE_NUMBER_REGEX_IT).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BasePhoneNumbers.NLPhoneNumberRegex), Constants.PHONE_NUMBER_REGEX_NL).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BasePhoneNumbers.SpecialPhoneNumberRegex), Constants.PHONE_NUMBER_REGEX_SPECIAL);
  }
  extract(source) {
    let ers = super.extract(source);
    let ret = new Array();
    for (let er of ers) {
      let ch = source[er.start - 1];
      if (er.start === 0 || exports.BasePhoneNumbers.SeparatorCharList.indexOf(ch) === -1) {
        ret.push(er);
      }
    }
    return ret;
  }
};
var BaseIpExtractor = class extends BaseSequenceExtractor {
  constructor() {
    super();
    this.regexes = (/* @__PURE__ */ new Map()).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BaseIp.Ipv4Regex), Constants.IP_REGEX_IPV4).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BaseIp.Ipv6Regex), Constants.IP_REGEX_IPV6);
  }
  extract(source) {
    let results = new Array();
    if (recognizersText.StringUtility.isNullOrWhitespace(source)) {
      return results;
    }
    let matchSource = /* @__PURE__ */ new Map();
    let matched = new Array(source.length);
    this.regexes.forEach((typeExtracted, regex) => {
      recognizersText.RegExpUtility.getMatches(regex, source).forEach((match) => {
        for (var j = 0; j < match.length; j++) {
          matched[match.index + j] = true;
        }
        matchSource.set(match, typeExtracted);
      });
    });
    let lastNotMatched = -1;
    for (var i = 0; i < source.length; i++) {
      if (matched[i]) {
        if (i + 1 == source.length || !matched[i + 1]) {
          let start = lastNotMatched + 1;
          let length = i - lastNotMatched;
          let substr = source.substr(start, length);
          if (substr.startsWith(Constants.IPV6_ELLIPSIS) && start > 0 && this.isLetterOrDigit(source[start - 1])) {
            continue;
          } else if (substr.endsWith(Constants.IPV6_ELLIPSIS) && i + 1 < source.length && this.isLetterOrDigit(source[i + 1])) {
            continue;
          }
          let matchFunc = (o) => o.index == start && o.length == length;
          var srcMatch = Array.from(matchSource.keys()).find(matchFunc);
          if (srcMatch) {
            results.push({
              start,
              length,
              text: substr,
              type: this.extractType,
              data: matchSource.has(srcMatch) ? matchSource.get(srcMatch) : null
            });
          }
        }
      } else {
        lastNotMatched = i;
      }
    }
    return results;
  }
  isLetterOrDigit(c) {
    return new RegExp("[0-9a-zA-z]").test(c);
  }
};
var BaseMentionExtractor = class extends BaseSequenceExtractor {
  constructor() {
    super();
    this.regexes = (/* @__PURE__ */ new Map()).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BaseMention.MentionRegex), Constants.MENTION_REGEX);
  }
};
var BaseHashtagExtractor = class extends BaseSequenceExtractor {
  constructor() {
    super();
    this.regexes = (/* @__PURE__ */ new Map()).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BaseHashtag.HashtagRegex), Constants.HASHTAG_REGEX);
  }
};
var BaseEmailExtractor = class extends BaseSequenceExtractor {
  constructor() {
    super();
    this.regexes = (/* @__PURE__ */ new Map()).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BaseEmail.EmailRegex), Constants.EMAIL_REGEX);
  }
};
var BaseURLExtractor = class extends BaseSequenceExtractor {
  constructor() {
    super();
    this.regexes = (/* @__PURE__ */ new Map()).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BaseURL.UrlRegex), Constants.URL_REGEX).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BaseURL.UrlRegex2), Constants.URL_REGEX).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BaseURL.IpUrlRegex), Constants.URL_REGEX);
  }
};
var BaseGUIDExtractor = class extends BaseSequenceExtractor {
  constructor() {
    super();
    this.regexes = (/* @__PURE__ */ new Map()).set(recognizersText.RegExpUtility.getSafeRegExp(exports.BaseGUID.GUIDRegex), Constants.GUID_REGEX);
  }
};

// recognizers/recognizers-sequence/src/sequence/english/extractors.ts
var PhoneNumberExtractor = class extends BasePhoneNumberExtractor {
  extract(source) {
    var result = super.extract(source);
    var maskRegex = new RegExp(exports.BasePhoneNumbers.PhoneNumberMaskRegex, "g");
    var m;
    while ((m = maskRegex.exec(source)) != null) {
      for (var i = result.length - 1; i >= 0; --i) {
        if (result[i].start >= m.index && result[i].start + result[i].length <= m.index + m[0].length) {
          result.splice(i, 1);
        }
      }
    }
    return result;
  }
};
var IpExtractor = class extends BaseIpExtractor {
};
var MentionExtractor = class extends BaseMentionExtractor {
};
var HashtagExtractor = class extends BaseHashtagExtractor {
};
var EmailExtractor = class extends BaseEmailExtractor {
};
var URLExtractor = class extends BaseURLExtractor {
};
var GUIDExtractor = class extends BaseGUIDExtractor {
};

// recognizers/recognizers-sequence/src/sequence/sequenceRecognizer.ts
var SequenceOptions = /* @__PURE__ */ ((SequenceOptions2) => {
  SequenceOptions2[SequenceOptions2["None"] = 0] = "None";
  return SequenceOptions2;
})(SequenceOptions || {});
function recognizePhoneNumber(query, culture, options = 0 /* None */) {
  return recognizeByModel((recognizer) => recognizer.getPhoneNumberModel(), query, culture, options);
}
function recognizeIpAddress(query, culture, options = 0 /* None */) {
  return recognizeByModel((recognizer) => recognizer.getIpAddressModel(), query, culture, options);
}
function recognizeMention(query, culture, options = 0 /* None */) {
  return recognizeByModel((recognizer) => recognizer.getMentionModel(), query, culture, options);
}
function recognizeHashtag(query, culture, options = 0 /* None */) {
  return recognizeByModel((recognizer) => recognizer.getHashtagModel(), query, culture, options);
}
function recognizeEmail(query, culture, options = 0 /* None */) {
  return recognizeByModel((recognizer) => recognizer.getEmailModel(), query, culture, options);
}
function recognizeURL(query, culture, options = 0 /* None */) {
  return recognizeByModel((recognizer) => recognizer.getURLModel(), query, culture, options);
}
function recognizeGUID(query, culture, options = 0 /* None */) {
  return recognizeByModel((recognizer) => recognizer.getGUIDModel(), query, culture, options);
}
function recognizeByModel(getModelFunc, query, culture, options) {
  let recognizer = new SequenceRecognizer(culture, options);
  let model = getModelFunc(recognizer);
  return model.parse(query);
}
var SequenceRecognizer = class extends recognizersText.Recognizer {
  constructor(culture, options = 0 /* None */, lazyInitialization = false) {
    super(culture, options, lazyInitialization);
  }
  IsValidOptions(options) {
    return options >= 0 && options <= 0 /* None */;
  }
  InitializeConfiguration() {
    this.registerModel("PhoneNumberModel", recognizersText.Culture.English, (options) => new PhoneNumberModel(new PhoneNumberParser(), new PhoneNumberExtractor()));
    this.registerModel("IpAddressModel", recognizersText.Culture.English, (options) => new IpAddressModel(new IpParser(), new IpExtractor()));
    this.registerModel("MentionModel", recognizersText.Culture.English, (options) => new MentionModel(new MentionParser(), new MentionExtractor()));
    this.registerModel("HashtagModel", recognizersText.Culture.English, (options) => new HashtagModel(new HashtagParser(), new HashtagExtractor()));
    this.registerModel("EmailModel", recognizersText.Culture.English, (options) => new EmailModel(new EmailParser(), new EmailExtractor()));
    this.registerModel("URLModel", recognizersText.Culture.English, (options) => new URLModel(new URLParser(), new URLExtractor()));
    this.registerModel("GUIDModel", recognizersText.Culture.English, (options) => new GUIDModel(new GUIDParser(), new GUIDExtractor()));
  }
  getPhoneNumberModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("PhoneNumberModel", culture, fallbackToDefaultCulture);
  }
  getIpAddressModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("IpAddressModel", culture, fallbackToDefaultCulture);
  }
  getMentionModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("MentionModel", culture, fallbackToDefaultCulture);
  }
  getHashtagModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("HashtagModel", culture, fallbackToDefaultCulture);
  }
  getEmailModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("EmailModel", culture, fallbackToDefaultCulture);
  }
  getURLModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("URLModel", culture, fallbackToDefaultCulture);
  }
  getGUIDModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("GUIDModel", culture, fallbackToDefaultCulture);
  }
};

Object.defineProperty(exports, "Culture", {
  enumerable: true,
  get: function () { return recognizersText.Culture; }
});
exports.AbstractSequenceModel = AbstractSequenceModel;
exports.BaseEmailExtractor = BaseEmailExtractor;
exports.BaseGUIDExtractor = BaseGUIDExtractor;
exports.BaseHashtagExtractor = BaseHashtagExtractor;
exports.BaseIpExtractor = BaseIpExtractor;
exports.BaseIpParser = BaseIpParser;
exports.BaseMentionExtractor = BaseMentionExtractor;
exports.BasePhoneNumberExtractor = BasePhoneNumberExtractor;
exports.BaseSequenceExtractor = BaseSequenceExtractor;
exports.BaseSequenceParser = BaseSequenceParser;
exports.BaseURLExtractor = BaseURLExtractor;
exports.EmailExtractor = EmailExtractor;
exports.EmailModel = EmailModel;
exports.EmailParser = EmailParser;
exports.GUIDExtractor = GUIDExtractor;
exports.GUIDModel = GUIDModel;
exports.GUIDParser = GUIDParser;
exports.HashtagExtractor = HashtagExtractor;
exports.HashtagModel = HashtagModel;
exports.HashtagParser = HashtagParser;
exports.IpAddressModel = IpAddressModel;
exports.IpExtractor = IpExtractor;
exports.IpParser = IpParser;
exports.MentionExtractor = MentionExtractor;
exports.MentionModel = MentionModel;
exports.MentionParser = MentionParser;
exports.PhoneNumberExtractor = PhoneNumberExtractor;
exports.PhoneNumberModel = PhoneNumberModel;
exports.PhoneNumberParser = PhoneNumberParser;
exports.SequenceOptions = SequenceOptions;
exports.SequenceRecognizer = SequenceRecognizer;
exports.URLExtractor = URLExtractor;
exports.URLModel = URLModel;
exports.URLParser = URLParser;
exports.recognizeEmail = recognizeEmail;
exports.recognizeGUID = recognizeGUID;
exports.recognizeHashtag = recognizeHashtag;
exports.recognizeIpAddress = recognizeIpAddress;
exports.recognizeMention = recognizeMention;
exports.recognizePhoneNumber = recognizePhoneNumber;
exports.recognizeURL = recognizeURL;
