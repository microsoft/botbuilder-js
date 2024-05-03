(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.microsoftRecognizersTextNumberWithUnit = {})));
}(this, (function (exports) { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var culture = createCommonjsModule(function (module, exports) {
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

});

unwrapExports(culture);

var xregexp = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/*!
 * XRegExp 4.2.0
 * <xregexp.com>
 * Steven Levithan (c) 2007-present MIT License
 */

/**
 * XRegExp provides augmented, extensible regular expressions. You get additional regex syntax and
 * flags, beyond what browsers support natively. XRegExp is also a regex utility belt with tools to
 * make your client-side grepping simpler and more powerful, while freeing you from related
 * cross-browser inconsistencies.
 */
// ==--------------------------==
// Private stuff
// ==--------------------------==
// Property name used for extended regex instance data
var REGEX_DATA = 'xregexp'; // Optional features that can be installed and uninstalled

var features = {
  astral: false,
  namespacing: false
}; // Native methods to use and restore ('native' is an ES3 reserved keyword)

var nativ = {
  exec: RegExp.prototype.exec,
  test: RegExp.prototype.test,
  match: String.prototype.match,
  replace: String.prototype.replace,
  split: String.prototype.split
}; // Storage for fixed/extended native methods

var fixed = {}; // Storage for regexes cached by `XRegExp.cache`

var regexCache = {}; // Storage for pattern details cached by the `XRegExp` constructor

var patternCache = {}; // Storage for regex syntax tokens added internally or by `XRegExp.addToken`

var tokens = []; // Token scopes

var defaultScope = 'default';
var classScope = 'class'; // Regexes that match native regex syntax, including octals

var nativeTokens = {
  // Any native multicharacter token in default scope, or any single character
  'default': /\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|\(\?(?:[:=!]|<[=!])|[?*+]\?|{\d+(?:,\d*)?}\??|[\s\S]/,
  // Any native multicharacter token in character class scope, or any single character
  'class': /\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|[\s\S]/
}; // Any backreference or dollar-prefixed character in replacement strings

var replacementToken = /\$(?:{([\w$]+)}|<([\w$]+)>|(\d\d?|[\s\S]))/g; // Check for correct `exec` handling of nonparticipating capturing groups

var correctExecNpcg = nativ.exec.call(/()??/, '')[1] === undefined; // Check for ES6 `flags` prop support

var hasFlagsProp = /x/.flags !== undefined; // Shortcut to `Object.prototype.toString`

var _ref = {},
    toString = _ref.toString;

function hasNativeFlag(flag) {
  // Can't check based on the presence of properties/getters since browsers might support such
  // properties even when they don't support the corresponding flag in regex construction (tested
  // in Chrome 48, where `'unicode' in /x/` is true but trying to construct a regex with flag `u`
  // throws an error)
  var isSupported = true;

  try {
    // Can't use regex literals for testing even in a `try` because regex literals with
    // unsupported flags cause a compilation error in IE
    new RegExp('', flag);
  } catch (exception) {
    isSupported = false;
  }

  return isSupported;
} // Check for ES6 `u` flag support


var hasNativeU = hasNativeFlag('u'); // Check for ES6 `y` flag support

var hasNativeY = hasNativeFlag('y'); // Tracker for known flags, including addon flags

var registeredFlags = {
  g: true,
  i: true,
  m: true,
  u: hasNativeU,
  y: hasNativeY
};
/**
 * Attaches extended data and `XRegExp.prototype` properties to a regex object.
 *
 * @private
 * @param {RegExp} regex Regex to augment.
 * @param {Array} captureNames Array with capture names, or `null`.
 * @param {String} xSource XRegExp pattern used to generate `regex`, or `null` if N/A.
 * @param {String} xFlags XRegExp flags used to generate `regex`, or `null` if N/A.
 * @param {Boolean} [isInternalOnly=false] Whether the regex will be used only for internal
 *   operations, and never exposed to users. For internal-only regexes, we can improve perf by
 *   skipping some operations like attaching `XRegExp.prototype` properties.
 * @returns {RegExp} Augmented regex.
 */

function augment(regex, captureNames, xSource, xFlags, isInternalOnly) {
  regex[REGEX_DATA] = {
    captureNames: captureNames
  };

  if (isInternalOnly) {
    return regex;
  } // Can't auto-inherit these since the XRegExp constructor returns a nonprimitive value


  if (regex.__proto__) {
    regex.__proto__ = XRegExp.prototype;
  } else {
    for (var p in XRegExp.prototype) {
      // An `XRegExp.prototype.hasOwnProperty(p)` check wouldn't be worth it here, since this
      // is performance sensitive, and enumerable `Object.prototype` or `RegExp.prototype`
      // extensions exist on `regex.prototype` anyway
      regex[p] = XRegExp.prototype[p];
    }
  }

  regex[REGEX_DATA].source = xSource; // Emulate the ES6 `flags` prop by ensuring flags are in alphabetical order

  regex[REGEX_DATA].flags = xFlags ? xFlags.split('').sort().join('') : xFlags;
  return regex;
}
/**
 * Removes any duplicate characters from the provided string.
 *
 * @private
 * @param {String} str String to remove duplicate characters from.
 * @returns {String} String with any duplicate characters removed.
 */


function clipDuplicates(str) {
  return nativ.replace.call(str, /([\s\S])(?=[\s\S]*\1)/g, '');
}
/**
 * Copies a regex object while preserving extended data and augmenting with `XRegExp.prototype`
 * properties. The copy has a fresh `lastIndex` property (set to zero). Allows adding and removing
 * flags g and y while copying the regex.
 *
 * @private
 * @param {RegExp} regex Regex to copy.
 * @param {Object} [options] Options object with optional properties:
 *   - `addG` {Boolean} Add flag g while copying the regex.
 *   - `addY` {Boolean} Add flag y while copying the regex.
 *   - `removeG` {Boolean} Remove flag g while copying the regex.
 *   - `removeY` {Boolean} Remove flag y while copying the regex.
 *   - `isInternalOnly` {Boolean} Whether the copied regex will be used only for internal
 *     operations, and never exposed to users. For internal-only regexes, we can improve perf by
 *     skipping some operations like attaching `XRegExp.prototype` properties.
 *   - `source` {String} Overrides `<regex>.source`, for special cases.
 * @returns {RegExp} Copy of the provided regex, possibly with modified flags.
 */


function copyRegex(regex, options) {
  if (!XRegExp.isRegExp(regex)) {
    throw new TypeError('Type RegExp expected');
  }

  var xData = regex[REGEX_DATA] || {};
  var flags = getNativeFlags(regex);
  var flagsToAdd = '';
  var flagsToRemove = '';
  var xregexpSource = null;
  var xregexpFlags = null;
  options = options || {};

  if (options.removeG) {
    flagsToRemove += 'g';
  }

  if (options.removeY) {
    flagsToRemove += 'y';
  }

  if (flagsToRemove) {
    flags = nativ.replace.call(flags, new RegExp("[".concat(flagsToRemove, "]+"), 'g'), '');
  }

  if (options.addG) {
    flagsToAdd += 'g';
  }

  if (options.addY) {
    flagsToAdd += 'y';
  }

  if (flagsToAdd) {
    flags = clipDuplicates(flags + flagsToAdd);
  }

  if (!options.isInternalOnly) {
    if (xData.source !== undefined) {
      xregexpSource = xData.source;
    } // null or undefined; don't want to add to `flags` if the previous value was null, since
    // that indicates we're not tracking original precompilation flags


    if (xData.flags != null) {
      // Flags are only added for non-internal regexes by `XRegExp.globalize`. Flags are never
      // removed for non-internal regexes, so don't need to handle it
      xregexpFlags = flagsToAdd ? clipDuplicates(xData.flags + flagsToAdd) : xData.flags;
    }
  } // Augment with `XRegExp.prototype` properties, but use the native `RegExp` constructor to avoid
  // searching for special tokens. That would be wrong for regexes constructed by `RegExp`, and
  // unnecessary for regexes constructed by `XRegExp` because the regex has already undergone the
  // translation to native regex syntax


  regex = augment(new RegExp(options.source || regex.source, flags), hasNamedCapture(regex) ? xData.captureNames.slice(0) : null, xregexpSource, xregexpFlags, options.isInternalOnly);
  return regex;
}
/**
 * Converts hexadecimal to decimal.
 *
 * @private
 * @param {String} hex
 * @returns {Number}
 */


function dec(hex) {
  return parseInt(hex, 16);
}
/**
 * Returns a pattern that can be used in a native RegExp in place of an ignorable token such as an
 * inline comment or whitespace with flag x. This is used directly as a token handler function
 * passed to `XRegExp.addToken`.
 *
 * @private
 * @param {String} match Match arg of `XRegExp.addToken` handler
 * @param {String} scope Scope arg of `XRegExp.addToken` handler
 * @param {String} flags Flags arg of `XRegExp.addToken` handler
 * @returns {String} Either '' or '(?:)', depending on which is needed in the context of the match.
 */


function getContextualTokenSeparator(match, scope, flags) {
  if ( // No need to separate tokens if at the beginning or end of a group
  match.input[match.index - 1] === '(' || match.input[match.index + match[0].length] === ')' || // No need to separate tokens if before or after a `|`
  match.input[match.index - 1] === '|' || match.input[match.index + match[0].length] === '|' || // No need to separate tokens if at the beginning or end of the pattern
  match.index < 1 || match.index + match[0].length >= match.input.length || // No need to separate tokens if at the beginning of a noncapturing group or lookahead.
  // The way this is written relies on:
  // - The search regex matching only 3-char strings.
  // - Although `substr` gives chars from the end of the string if given a negative index,
  //   the resulting substring will be too short to match. Ex: `'abcd'.substr(-1, 3) === 'd'`
  nativ.test.call(/^\(\?[:=!]/, match.input.substr(match.index - 3, 3)) || // Avoid separating tokens when the following token is a quantifier
  isQuantifierNext(match.input, match.index + match[0].length, flags)) {
    return '';
  } // Keep tokens separated. This avoids e.g. inadvertedly changing `\1 1` or `\1(?#)1` to `\11`.
  // This also ensures all tokens remain as discrete atoms, e.g. it avoids converting the syntax
  // error `(? :` into `(?:`.


  return '(?:)';
}
/**
 * Returns native `RegExp` flags used by a regex object.
 *
 * @private
 * @param {RegExp} regex Regex to check.
 * @returns {String} Native flags in use.
 */


function getNativeFlags(regex) {
  return hasFlagsProp ? regex.flags : // Explicitly using `RegExp.prototype.toString` (rather than e.g. `String` or concatenation
  // with an empty string) allows this to continue working predictably when
  // `XRegExp.proptotype.toString` is overridden
  nativ.exec.call(/\/([a-z]*)$/i, RegExp.prototype.toString.call(regex))[1];
}
/**
 * Determines whether a regex has extended instance data used to track capture names.
 *
 * @private
 * @param {RegExp} regex Regex to check.
 * @returns {Boolean} Whether the regex uses named capture.
 */


function hasNamedCapture(regex) {
  return !!(regex[REGEX_DATA] && regex[REGEX_DATA].captureNames);
}
/**
 * Converts decimal to hexadecimal.
 *
 * @private
 * @param {Number|String} dec
 * @returns {String}
 */


function hex(dec) {
  return parseInt(dec, 10).toString(16);
}
/**
 * Checks whether the next nonignorable token after the specified position is a quantifier.
 *
 * @private
 * @param {String} pattern Pattern to search within.
 * @param {Number} pos Index in `pattern` to search at.
 * @param {String} flags Flags used by the pattern.
 * @returns {Boolean} Whether the next nonignorable token is a quantifier.
 */


function isQuantifierNext(pattern, pos, flags) {
  return nativ.test.call(flags.indexOf('x') !== -1 ? // Ignore any leading whitespace, line comments, and inline comments
  /^(?:\s|#[^#\n]*|\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/ : // Ignore any leading inline comments
  /^(?:\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/, pattern.slice(pos));
}
/**
 * Determines whether a value is of the specified type, by resolving its internal [[Class]].
 *
 * @private
 * @param {*} value Object to check.
 * @param {String} type Type to check for, in TitleCase.
 * @returns {Boolean} Whether the object matches the type.
 */


function isType(value, type) {
  return toString.call(value) === "[object ".concat(type, "]");
}
/**
 * Adds leading zeros if shorter than four characters. Used for fixed-length hexadecimal values.
 *
 * @private
 * @param {String} str
 * @returns {String}
 */


function pad4(str) {
  while (str.length < 4) {
    str = "0".concat(str);
  }

  return str;
}
/**
 * Checks for flag-related errors, and strips/applies flags in a leading mode modifier. Offloads
 * the flag preparation logic from the `XRegExp` constructor.
 *
 * @private
 * @param {String} pattern Regex pattern, possibly with a leading mode modifier.
 * @param {String} flags Any combination of flags.
 * @returns {Object} Object with properties `pattern` and `flags`.
 */


function prepareFlags(pattern, flags) {
  // Recent browsers throw on duplicate flags, so copy this behavior for nonnative flags
  if (clipDuplicates(flags) !== flags) {
    throw new SyntaxError("Invalid duplicate regex flag ".concat(flags));
  } // Strip and apply a leading mode modifier with any combination of flags except g or y


  pattern = nativ.replace.call(pattern, /^\(\?([\w$]+)\)/, function ($0, $1) {
    if (nativ.test.call(/[gy]/, $1)) {
      throw new SyntaxError("Cannot use flag g or y in mode modifier ".concat($0));
    } // Allow duplicate flags within the mode modifier


    flags = clipDuplicates(flags + $1);
    return '';
  }); // Throw on unknown native or nonnative flags

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = flags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var flag = _step.value;

      if (!registeredFlags[flag]) {
        throw new SyntaxError("Unknown regex flag ".concat(flag));
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return {
    pattern: pattern,
    flags: flags
  };
}
/**
 * Prepares an options object from the given value.
 *
 * @private
 * @param {String|Object} value Value to convert to an options object.
 * @returns {Object} Options object.
 */


function prepareOptions(value) {
  var options = {};

  if (isType(value, 'String')) {
    XRegExp.forEach(value, /[^\s,]+/, function (match) {
      options[match] = true;
    });
    return options;
  }

  return value;
}
/**
 * Registers a flag so it doesn't throw an 'unknown flag' error.
 *
 * @private
 * @param {String} flag Single-character flag to register.
 */


function registerFlag(flag) {
  if (!/^[\w$]$/.test(flag)) {
    throw new Error('Flag must be a single character A-Za-z0-9_$');
  }

  registeredFlags[flag] = true;
}
/**
 * Runs built-in and custom regex syntax tokens in reverse insertion order at the specified
 * position, until a match is found.
 *
 * @private
 * @param {String} pattern Original pattern from which an XRegExp object is being built.
 * @param {String} flags Flags being used to construct the regex.
 * @param {Number} pos Position to search for tokens within `pattern`.
 * @param {Number} scope Regex scope to apply: 'default' or 'class'.
 * @param {Object} context Context object to use for token handler functions.
 * @returns {Object} Object with properties `matchLength`, `output`, and `reparse`; or `null`.
 */


function runTokens(pattern, flags, pos, scope, context) {
  var i = tokens.length;
  var leadChar = pattern[pos];
  var result = null;
  var match;
  var t; // Run in reverse insertion order

  while (i--) {
    t = tokens[i];

    if (t.leadChar && t.leadChar !== leadChar || t.scope !== scope && t.scope !== 'all' || t.flag && !(flags.indexOf(t.flag) !== -1)) {
      continue;
    }

    match = XRegExp.exec(pattern, t.regex, pos, 'sticky');

    if (match) {
      result = {
        matchLength: match[0].length,
        output: t.handler.call(context, match, scope, flags),
        reparse: t.reparse
      }; // Finished with token tests

      break;
    }
  }

  return result;
}
/**
 * Enables or disables implicit astral mode opt-in. When enabled, flag A is automatically added to
 * all new regexes created by XRegExp. This causes an error to be thrown when creating regexes if
 * the Unicode Base addon is not available, since flag A is registered by that addon.
 *
 * @private
 * @param {Boolean} on `true` to enable; `false` to disable.
 */


function setAstral(on) {
  features.astral = on;
}
/**
 * Adds named capture groups to the `groups` property of match arrays. See here for details:
 * https://github.com/tc39/proposal-regexp-named-groups
 *
 * @private
 * @param {Boolean} on `true` to enable; `false` to disable.
 */


function setNamespacing(on) {
  features.namespacing = on;
}
/**
 * Returns the object, or throws an error if it is `null` or `undefined`. This is used to follow
 * the ES5 abstract operation `ToObject`.
 *
 * @private
 * @param {*} value Object to check and return.
 * @returns {*} The provided object.
 */


function toObject(value) {
  // null or undefined
  if (value == null) {
    throw new TypeError('Cannot convert null or undefined to object');
  }

  return value;
} // ==--------------------------==
// Constructor
// ==--------------------------==

/**
 * Creates an extended regular expression object for matching text with a pattern. Differs from a
 * native regular expression in that additional syntax and flags are supported. The returned object
 * is in fact a native `RegExp` and works with all native methods.
 *
 * @class XRegExp
 * @constructor
 * @param {String|RegExp} pattern Regex pattern string, or an existing regex object to copy.
 * @param {String} [flags] Any combination of flags.
 *   Native flags:
 *     - `g` - global
 *     - `i` - ignore case
 *     - `m` - multiline anchors
 *     - `u` - unicode (ES6)
 *     - `y` - sticky (Firefox 3+, ES6)
 *   Additional XRegExp flags:
 *     - `n` - explicit capture
 *     - `s` - dot matches all (aka singleline)
 *     - `x` - free-spacing and line comments (aka extended)
 *     - `A` - astral (requires the Unicode Base addon)
 *   Flags cannot be provided when constructing one `RegExp` from another.
 * @returns {RegExp} Extended regular expression object.
 * @example
 *
 * // With named capture and flag x
 * XRegExp(`(?<year>  [0-9]{4} ) -?  # year
 *          (?<month> [0-9]{2} ) -?  # month
 *          (?<day>   [0-9]{2} )     # day`, 'x');
 *
 * // Providing a regex object copies it. Native regexes are recompiled using native (not XRegExp)
 * // syntax. Copies maintain extended data, are augmented with `XRegExp.prototype` properties, and
 * // have fresh `lastIndex` properties (set to zero).
 * XRegExp(/regex/);
 */


function XRegExp(pattern, flags) {
  if (XRegExp.isRegExp(pattern)) {
    if (flags !== undefined) {
      throw new TypeError('Cannot supply flags when copying a RegExp');
    }

    return copyRegex(pattern);
  } // Copy the argument behavior of `RegExp`


  pattern = pattern === undefined ? '' : String(pattern);
  flags = flags === undefined ? '' : String(flags);

  if (XRegExp.isInstalled('astral') && !(flags.indexOf('A') !== -1)) {
    // This causes an error to be thrown if the Unicode Base addon is not available
    flags += 'A';
  }

  if (!patternCache[pattern]) {
    patternCache[pattern] = {};
  }

  if (!patternCache[pattern][flags]) {
    var context = {
      hasNamedCapture: false,
      captureNames: []
    };
    var scope = defaultScope;
    var output = '';
    var pos = 0;
    var result; // Check for flag-related errors, and strip/apply flags in a leading mode modifier

    var applied = prepareFlags(pattern, flags);
    var appliedPattern = applied.pattern;
    var appliedFlags = applied.flags; // Use XRegExp's tokens to translate the pattern to a native regex pattern.
    // `appliedPattern.length` may change on each iteration if tokens use `reparse`

    while (pos < appliedPattern.length) {
      do {
        // Check for custom tokens at the current position
        result = runTokens(appliedPattern, appliedFlags, pos, scope, context); // If the matched token used the `reparse` option, splice its output into the
        // pattern before running tokens again at the same position

        if (result && result.reparse) {
          appliedPattern = appliedPattern.slice(0, pos) + result.output + appliedPattern.slice(pos + result.matchLength);
        }
      } while (result && result.reparse);

      if (result) {
        output += result.output;
        pos += result.matchLength || 1;
      } else {
        // Get the native token at the current position
        var _XRegExp$exec = XRegExp.exec(appliedPattern, nativeTokens[scope], pos, 'sticky'),
            _XRegExp$exec2 = _slicedToArray(_XRegExp$exec, 1),
            token = _XRegExp$exec2[0];

        output += token;
        pos += token.length;

        if (token === '[' && scope === defaultScope) {
          scope = classScope;
        } else if (token === ']' && scope === classScope) {
          scope = defaultScope;
        }
      }
    }

    patternCache[pattern][flags] = {
      // Use basic cleanup to collapse repeated empty groups like `(?:)(?:)` to `(?:)`. Empty
      // groups are sometimes inserted during regex transpilation in order to keep tokens
      // separated. However, more than one empty group in a row is never needed.
      pattern: nativ.replace.call(output, /(?:\(\?:\))+/g, '(?:)'),
      // Strip all but native flags
      flags: nativ.replace.call(appliedFlags, /[^gimuy]+/g, ''),
      // `context.captureNames` has an item for each capturing group, even if unnamed
      captures: context.hasNamedCapture ? context.captureNames : null
    };
  }

  var generated = patternCache[pattern][flags];
  return augment(new RegExp(generated.pattern, generated.flags), generated.captures, pattern, flags);
} // Add `RegExp.prototype` to the prototype chain


XRegExp.prototype = /(?:)/; // ==--------------------------==
// Public properties
// ==--------------------------==

/**
 * The XRegExp version number as a string containing three dot-separated parts. For example,
 * '2.0.0-beta-3'.
 *
 * @static
 * @memberOf XRegExp
 * @type String
 */

XRegExp.version = '4.2.0'; // ==--------------------------==
// Public methods
// ==--------------------------==
// Intentionally undocumented; used in tests and addons

XRegExp._clipDuplicates = clipDuplicates;
XRegExp._hasNativeFlag = hasNativeFlag;
XRegExp._dec = dec;
XRegExp._hex = hex;
XRegExp._pad4 = pad4;
/**
 * Extends XRegExp syntax and allows custom flags. This is used internally and can be used to
 * create XRegExp addons. If more than one token can match the same string, the last added wins.
 *
 * @memberOf XRegExp
 * @param {RegExp} regex Regex object that matches the new token.
 * @param {Function} handler Function that returns a new pattern string (using native regex syntax)
 *   to replace the matched token within all future XRegExp regexes. Has access to persistent
 *   properties of the regex being built, through `this`. Invoked with three arguments:
 *   - The match array, with named backreference properties.
 *   - The regex scope where the match was found: 'default' or 'class'.
 *   - The flags used by the regex, including any flags in a leading mode modifier.
 *   The handler function becomes part of the XRegExp construction process, so be careful not to
 *   construct XRegExps within the function or you will trigger infinite recursion.
 * @param {Object} [options] Options object with optional properties:
 *   - `scope` {String} Scope where the token applies: 'default', 'class', or 'all'.
 *   - `flag` {String} Single-character flag that triggers the token. This also registers the
 *     flag, which prevents XRegExp from throwing an 'unknown flag' error when the flag is used.
 *   - `optionalFlags` {String} Any custom flags checked for within the token `handler` that are
 *     not required to trigger the token. This registers the flags, to prevent XRegExp from
 *     throwing an 'unknown flag' error when any of the flags are used.
 *   - `reparse` {Boolean} Whether the `handler` function's output should not be treated as
 *     final, and instead be reparseable by other tokens (including the current token). Allows
 *     token chaining or deferring.
 *   - `leadChar` {String} Single character that occurs at the beginning of any successful match
 *     of the token (not always applicable). This doesn't change the behavior of the token unless
 *     you provide an erroneous value. However, providing it can increase the token's performance
 *     since the token can be skipped at any positions where this character doesn't appear.
 * @example
 *
 * // Basic usage: Add \a for the ALERT control code
 * XRegExp.addToken(
 *   /\\a/,
 *   () => '\\x07',
 *   {scope: 'all'}
 * );
 * XRegExp('\\a[\\a-\\n]+').test('\x07\n\x07'); // -> true
 *
 * // Add the U (ungreedy) flag from PCRE and RE2, which reverses greedy and lazy quantifiers.
 * // Since `scope` is not specified, it uses 'default' (i.e., transformations apply outside of
 * // character classes only)
 * XRegExp.addToken(
 *   /([?*+]|{\d+(?:,\d*)?})(\??)/,
 *   (match) => `${match[1]}${match[2] ? '' : '?'}`,
 *   {flag: 'U'}
 * );
 * XRegExp('a+', 'U').exec('aaa')[0]; // -> 'a'
 * XRegExp('a+?', 'U').exec('aaa')[0]; // -> 'aaa'
 */

XRegExp.addToken = function (regex, handler, options) {
  options = options || {};
  var _options = options,
      optionalFlags = _options.optionalFlags;

  if (options.flag) {
    registerFlag(options.flag);
  }

  if (optionalFlags) {
    optionalFlags = nativ.split.call(optionalFlags, '');
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = optionalFlags[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var flag = _step2.value;
        registerFlag(flag);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  } // Add to the private list of syntax tokens


  tokens.push({
    regex: copyRegex(regex, {
      addG: true,
      addY: hasNativeY,
      isInternalOnly: true
    }),
    handler: handler,
    scope: options.scope || defaultScope,
    flag: options.flag,
    reparse: options.reparse,
    leadChar: options.leadChar
  }); // Reset the pattern cache used by the `XRegExp` constructor, since the same pattern and flags
  // might now produce different results

  XRegExp.cache.flush('patterns');
};
/**
 * Caches and returns the result of calling `XRegExp(pattern, flags)`. On any subsequent call with
 * the same pattern and flag combination, the cached copy of the regex is returned.
 *
 * @memberOf XRegExp
 * @param {String} pattern Regex pattern string.
 * @param {String} [flags] Any combination of XRegExp flags.
 * @returns {RegExp} Cached XRegExp object.
 * @example
 *
 * while (match = XRegExp.cache('.', 'gs').exec(str)) {
 *   // The regex is compiled once only
 * }
 */


XRegExp.cache = function (pattern, flags) {
  if (!regexCache[pattern]) {
    regexCache[pattern] = {};
  }

  return regexCache[pattern][flags] || (regexCache[pattern][flags] = XRegExp(pattern, flags));
}; // Intentionally undocumented; used in tests


XRegExp.cache.flush = function (cacheName) {
  if (cacheName === 'patterns') {
    // Flush the pattern cache used by the `XRegExp` constructor
    patternCache = {};
  } else {
    // Flush the regex cache populated by `XRegExp.cache`
    regexCache = {};
  }
};
/**
 * Escapes any regular expression metacharacters, for use when matching literal strings. The result
 * can safely be used at any point within a regex that uses any flags.
 *
 * @memberOf XRegExp
 * @param {String} str String to escape.
 * @returns {String} String with regex metacharacters escaped.
 * @example
 *
 * XRegExp.escape('Escaped? <.>');
 * // -> 'Escaped\?\ <\.>'
 */


XRegExp.escape = function (str) {
  return nativ.replace.call(toObject(str), /[-\[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};
/**
 * Executes a regex search in a specified string. Returns a match array or `null`. If the provided
 * regex uses named capture, named backreference properties are included on the match array.
 * Optional `pos` and `sticky` arguments specify the search start position, and whether the match
 * must start at the specified position only. The `lastIndex` property of the provided regex is not
 * used, but is updated for compatibility. Also fixes browser bugs compared to the native
 * `RegExp.prototype.exec` and can be used reliably cross-browser.
 *
 * @memberOf XRegExp
 * @param {String} str String to search.
 * @param {RegExp} regex Regex to search with.
 * @param {Number} [pos=0] Zero-based index at which to start the search.
 * @param {Boolean|String} [sticky=false] Whether the match must start at the specified position
 *   only. The string `'sticky'` is accepted as an alternative to `true`.
 * @returns {Array} Match array with named backreference properties, or `null`.
 * @example
 *
 * // Basic use, with named backreference
 * let match = XRegExp.exec('U+2620', XRegExp('U\\+(?<hex>[0-9A-F]{4})'));
 * match.hex; // -> '2620'
 *
 * // With pos and sticky, in a loop
 * let pos = 2, result = [], match;
 * while (match = XRegExp.exec('<1><2><3><4>5<6>', /<(\d)>/, pos, 'sticky')) {
 *   result.push(match[1]);
 *   pos = match.index + match[0].length;
 * }
 * // result -> ['2', '3', '4']
 */


XRegExp.exec = function (str, regex, pos, sticky) {
  var cacheKey = 'g';
  var addY = false;
  var fakeY = false;
  var match;
  addY = hasNativeY && !!(sticky || regex.sticky && sticky !== false);

  if (addY) {
    cacheKey += 'y';
  } else if (sticky) {
    // Simulate sticky matching by appending an empty capture to the original regex. The
    // resulting regex will succeed no matter what at the current index (set with `lastIndex`),
    // and will not search the rest of the subject string. We'll know that the original regex
    // has failed if that last capture is `''` rather than `undefined` (i.e., if that last
    // capture participated in the match).
    fakeY = true;
    cacheKey += 'FakeY';
  }

  regex[REGEX_DATA] = regex[REGEX_DATA] || {}; // Shares cached copies with `XRegExp.match`/`replace`

  var r2 = regex[REGEX_DATA][cacheKey] || (regex[REGEX_DATA][cacheKey] = copyRegex(regex, {
    addG: true,
    addY: addY,
    source: fakeY ? "".concat(regex.source, "|()") : undefined,
    removeY: sticky === false,
    isInternalOnly: true
  }));
  pos = pos || 0;
  r2.lastIndex = pos; // Fixed `exec` required for `lastIndex` fix, named backreferences, etc.

  match = fixed.exec.call(r2, str); // Get rid of the capture added by the pseudo-sticky matcher if needed. An empty string means
  // the original regexp failed (see above).

  if (fakeY && match && match.pop() === '') {
    match = null;
  }

  if (regex.global) {
    regex.lastIndex = match ? r2.lastIndex : 0;
  }

  return match;
};
/**
 * Executes a provided function once per regex match. Searches always start at the beginning of the
 * string and continue until the end, regardless of the state of the regex's `global` property and
 * initial `lastIndex`.
 *
 * @memberOf XRegExp
 * @param {String} str String to search.
 * @param {RegExp} regex Regex to search with.
 * @param {Function} callback Function to execute for each match. Invoked with four arguments:
 *   - The match array, with named backreference properties.
 *   - The zero-based match index.
 *   - The string being traversed.
 *   - The regex object being used to traverse the string.
 * @example
 *
 * // Extracts every other digit from a string
 * const evens = [];
 * XRegExp.forEach('1a2345', /\d/, (match, i) => {
 *   if (i % 2) evens.push(+match[0]);
 * });
 * // evens -> [2, 4]
 */


XRegExp.forEach = function (str, regex, callback) {
  var pos = 0;
  var i = -1;
  var match;

  while (match = XRegExp.exec(str, regex, pos)) {
    // Because `regex` is provided to `callback`, the function could use the deprecated/
    // nonstandard `RegExp.prototype.compile` to mutate the regex. However, since `XRegExp.exec`
    // doesn't use `lastIndex` to set the search position, this can't lead to an infinite loop,
    // at least. Actually, because of the way `XRegExp.exec` caches globalized versions of
    // regexes, mutating the regex will not have any effect on the iteration or matched strings,
    // which is a nice side effect that brings extra safety.
    callback(match, ++i, str, regex);
    pos = match.index + (match[0].length || 1);
  }
};
/**
 * Copies a regex object and adds flag `g`. The copy maintains extended data, is augmented with
 * `XRegExp.prototype` properties, and has a fresh `lastIndex` property (set to zero). Native
 * regexes are not recompiled using XRegExp syntax.
 *
 * @memberOf XRegExp
 * @param {RegExp} regex Regex to globalize.
 * @returns {RegExp} Copy of the provided regex with flag `g` added.
 * @example
 *
 * const globalCopy = XRegExp.globalize(/regex/);
 * globalCopy.global; // -> true
 */


XRegExp.globalize = function (regex) {
  return copyRegex(regex, {
    addG: true
  });
};
/**
 * Installs optional features according to the specified options. Can be undone using
 * `XRegExp.uninstall`.
 *
 * @memberOf XRegExp
 * @param {Object|String} options Options object or string.
 * @example
 *
 * // With an options object
 * XRegExp.install({
 *   // Enables support for astral code points in Unicode addons (implicitly sets flag A)
 *   astral: true,
 *
 *   // Adds named capture groups to the `groups` property of matches
 *   namespacing: true
 * });
 *
 * // With an options string
 * XRegExp.install('astral namespacing');
 */


XRegExp.install = function (options) {
  options = prepareOptions(options);

  if (!features.astral && options.astral) {
    setAstral(true);
  }

  if (!features.namespacing && options.namespacing) {
    setNamespacing(true);
  }
};
/**
 * Checks whether an individual optional feature is installed.
 *
 * @memberOf XRegExp
 * @param {String} feature Name of the feature to check. One of:
 *   - `astral`
 *   - `namespacing`
 * @returns {Boolean} Whether the feature is installed.
 * @example
 *
 * XRegExp.isInstalled('astral');
 */


XRegExp.isInstalled = function (feature) {
  return !!features[feature];
};
/**
 * Returns `true` if an object is a regex; `false` if it isn't. This works correctly for regexes
 * created in another frame, when `instanceof` and `constructor` checks would fail.
 *
 * @memberOf XRegExp
 * @param {*} value Object to check.
 * @returns {Boolean} Whether the object is a `RegExp` object.
 * @example
 *
 * XRegExp.isRegExp('string'); // -> false
 * XRegExp.isRegExp(/regex/i); // -> true
 * XRegExp.isRegExp(RegExp('^', 'm')); // -> true
 * XRegExp.isRegExp(XRegExp('(?s).')); // -> true
 */


XRegExp.isRegExp = function (value) {
  return toString.call(value) === '[object RegExp]';
}; // isType(value, 'RegExp');

/**
 * Returns the first matched string, or in global mode, an array containing all matched strings.
 * This is essentially a more convenient re-implementation of `String.prototype.match` that gives
 * the result types you actually want (string instead of `exec`-style array in match-first mode,
 * and an empty array instead of `null` when no matches are found in match-all mode). It also lets
 * you override flag g and ignore `lastIndex`, and fixes browser bugs.
 *
 * @memberOf XRegExp
 * @param {String} str String to search.
 * @param {RegExp} regex Regex to search with.
 * @param {String} [scope='one'] Use 'one' to return the first match as a string. Use 'all' to
 *   return an array of all matched strings. If not explicitly specified and `regex` uses flag g,
 *   `scope` is 'all'.
 * @returns {String|Array} In match-first mode: First match as a string, or `null`. In match-all
 *   mode: Array of all matched strings, or an empty array.
 * @example
 *
 * // Match first
 * XRegExp.match('abc', /\w/); // -> 'a'
 * XRegExp.match('abc', /\w/g, 'one'); // -> 'a'
 * XRegExp.match('abc', /x/g, 'one'); // -> null
 *
 * // Match all
 * XRegExp.match('abc', /\w/g); // -> ['a', 'b', 'c']
 * XRegExp.match('abc', /\w/, 'all'); // -> ['a', 'b', 'c']
 * XRegExp.match('abc', /x/, 'all'); // -> []
 */


XRegExp.match = function (str, regex, scope) {
  var global = regex.global && scope !== 'one' || scope === 'all';
  var cacheKey = (global ? 'g' : '') + (regex.sticky ? 'y' : '') || 'noGY';
  regex[REGEX_DATA] = regex[REGEX_DATA] || {}; // Shares cached copies with `XRegExp.exec`/`replace`

  var r2 = regex[REGEX_DATA][cacheKey] || (regex[REGEX_DATA][cacheKey] = copyRegex(regex, {
    addG: !!global,
    removeG: scope === 'one',
    isInternalOnly: true
  }));
  var result = nativ.match.call(toObject(str), r2);

  if (regex.global) {
    regex.lastIndex = scope === 'one' && result ? // Can't use `r2.lastIndex` since `r2` is nonglobal in this case
    result.index + result[0].length : 0;
  }

  return global ? result || [] : result && result[0];
};
/**
 * Retrieves the matches from searching a string using a chain of regexes that successively search
 * within previous matches. The provided `chain` array can contain regexes and or objects with
 * `regex` and `backref` properties. When a backreference is specified, the named or numbered
 * backreference is passed forward to the next regex or returned.
 *
 * @memberOf XRegExp
 * @param {String} str String to search.
 * @param {Array} chain Regexes that each search for matches within preceding results.
 * @returns {Array} Matches by the last regex in the chain, or an empty array.
 * @example
 *
 * // Basic usage; matches numbers within <b> tags
 * XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [
 *   XRegExp('(?is)<b>.*?</b>'),
 *   /\d+/
 * ]);
 * // -> ['2', '4', '56']
 *
 * // Passing forward and returning specific backreferences
 * html = '<a href="http://xregexp.com/api/">XRegExp</a>\
 *         <a href="http://www.google.com/">Google</a>';
 * XRegExp.matchChain(html, [
 *   {regex: /<a href="([^"]+)">/i, backref: 1},
 *   {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
 * ]);
 * // -> ['xregexp.com', 'www.google.com']
 */


XRegExp.matchChain = function (str, chain) {
  return function recurseChain(values, level) {
    var item = chain[level].regex ? chain[level] : {
      regex: chain[level]
    };
    var matches = [];

    function addMatch(match) {
      if (item.backref) {
        var ERR_UNDEFINED_GROUP = "Backreference to undefined group: ".concat(item.backref);
        var isNamedBackref = isNaN(item.backref);

        if (isNamedBackref && XRegExp.isInstalled('namespacing')) {
          // `groups` has `null` as prototype, so using `in` instead of `hasOwnProperty`
          if (!(item.backref in match.groups)) {
            throw new ReferenceError(ERR_UNDEFINED_GROUP);
          }
        } else if (!match.hasOwnProperty(item.backref)) {
          throw new ReferenceError(ERR_UNDEFINED_GROUP);
        }

        var backrefValue = isNamedBackref && XRegExp.isInstalled('namespacing') ? match.groups[item.backref] : match[item.backref];
        matches.push(backrefValue || '');
      } else {
        matches.push(match[0]);
      }
    }

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = values[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var value = _step3.value;
        XRegExp.forEach(value, item.regex, addMatch);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return level === chain.length - 1 || !matches.length ? matches : recurseChain(matches, level + 1);
  }([str], 0);
};
/**
 * Returns a new string with one or all matches of a pattern replaced. The pattern can be a string
 * or regex, and the replacement can be a string or a function to be called for each match. To
 * perform a global search and replace, use the optional `scope` argument or include flag g if using
 * a regex. Replacement strings can use `${n}` or `$<n>` for named and numbered backreferences.
 * Replacement functions can use named backreferences via `arguments[0].name`. Also fixes browser
 * bugs compared to the native `String.prototype.replace` and can be used reliably cross-browser.
 *
 * @memberOf XRegExp
 * @param {String} str String to search.
 * @param {RegExp|String} search Search pattern to be replaced.
 * @param {String|Function} replacement Replacement string or a function invoked to create it.
 *   Replacement strings can include special replacement syntax:
 *     - $$ - Inserts a literal $ character.
 *     - $&, $0 - Inserts the matched substring.
 *     - $` - Inserts the string that precedes the matched substring (left context).
 *     - $' - Inserts the string that follows the matched substring (right context).
 *     - $n, $nn - Where n/nn are digits referencing an existent capturing group, inserts
 *       backreference n/nn.
 *     - ${n}, $<n> - Where n is a name or any number of digits that reference an existent capturing
 *       group, inserts backreference n.
 *   Replacement functions are invoked with three or more arguments:
 *     - The matched substring (corresponds to $& above). Named backreferences are accessible as
 *       properties of this first argument.
 *     - 0..n arguments, one for each backreference (corresponding to $1, $2, etc. above).
 *     - The zero-based index of the match within the total search string.
 *     - The total string being searched.
 * @param {String} [scope='one'] Use 'one' to replace the first match only, or 'all'. If not
 *   explicitly specified and using a regex with flag g, `scope` is 'all'.
 * @returns {String} New string with one or all matches replaced.
 * @example
 *
 * // Regex search, using named backreferences in replacement string
 * const name = XRegExp('(?<first>\\w+) (?<last>\\w+)');
 * XRegExp.replace('John Smith', name, '$<last>, $<first>');
 * // -> 'Smith, John'
 *
 * // Regex search, using named backreferences in replacement function
 * XRegExp.replace('John Smith', name, (match) => `${match.last}, ${match.first}`);
 * // -> 'Smith, John'
 *
 * // String search, with replace-all
 * XRegExp.replace('RegExp builds RegExps', 'RegExp', 'XRegExp', 'all');
 * // -> 'XRegExp builds XRegExps'
 */


XRegExp.replace = function (str, search, replacement, scope) {
  var isRegex = XRegExp.isRegExp(search);
  var global = search.global && scope !== 'one' || scope === 'all';
  var cacheKey = (global ? 'g' : '') + (search.sticky ? 'y' : '') || 'noGY';
  var s2 = search;

  if (isRegex) {
    search[REGEX_DATA] = search[REGEX_DATA] || {}; // Shares cached copies with `XRegExp.exec`/`match`. Since a copy is used, `search`'s
    // `lastIndex` isn't updated *during* replacement iterations

    s2 = search[REGEX_DATA][cacheKey] || (search[REGEX_DATA][cacheKey] = copyRegex(search, {
      addG: !!global,
      removeG: scope === 'one',
      isInternalOnly: true
    }));
  } else if (global) {
    s2 = new RegExp(XRegExp.escape(String(search)), 'g');
  } // Fixed `replace` required for named backreferences, etc.


  var result = fixed.replace.call(toObject(str), s2, replacement);

  if (isRegex && search.global) {
    // Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
    search.lastIndex = 0;
  }

  return result;
};
/**
 * Performs batch processing of string replacements. Used like `XRegExp.replace`, but accepts an
 * array of replacement details. Later replacements operate on the output of earlier replacements.
 * Replacement details are accepted as an array with a regex or string to search for, the
 * replacement string or function, and an optional scope of 'one' or 'all'. Uses the XRegExp
 * replacement text syntax, which supports named backreference properties via `${name}` or
 * `$<name>`.
 *
 * @memberOf XRegExp
 * @param {String} str String to search.
 * @param {Array} replacements Array of replacement detail arrays.
 * @returns {String} New string with all replacements.
 * @example
 *
 * str = XRegExp.replaceEach(str, [
 *   [XRegExp('(?<name>a)'), 'z${name}'],
 *   [/b/gi, 'y'],
 *   [/c/g, 'x', 'one'], // scope 'one' overrides /g
 *   [/d/, 'w', 'all'],  // scope 'all' overrides lack of /g
 *   ['e', 'v', 'all'],  // scope 'all' allows replace-all for strings
 *   [/f/g, ($0) => $0.toUpperCase()]
 * ]);
 */


XRegExp.replaceEach = function (str, replacements) {
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = replacements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var r = _step4.value;
      str = XRegExp.replace(str, r[0], r[1], r[2]);
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  return str;
};
/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 *
 * @memberOf XRegExp
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * XRegExp.split('a b c', ' ');
 * // -> ['a', 'b', 'c']
 *
 * // With limit
 * XRegExp.split('a b c', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * XRegExp.split('..word1..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', '..']
 */


XRegExp.split = function (str, separator, limit) {
  return fixed.split.call(toObject(str), separator, limit);
};
/**
 * Executes a regex search in a specified string. Returns `true` or `false`. Optional `pos` and
 * `sticky` arguments specify the search start position, and whether the match must start at the
 * specified position only. The `lastIndex` property of the provided regex is not used, but is
 * updated for compatibility. Also fixes browser bugs compared to the native
 * `RegExp.prototype.test` and can be used reliably cross-browser.
 *
 * @memberOf XRegExp
 * @param {String} str String to search.
 * @param {RegExp} regex Regex to search with.
 * @param {Number} [pos=0] Zero-based index at which to start the search.
 * @param {Boolean|String} [sticky=false] Whether the match must start at the specified position
 *   only. The string `'sticky'` is accepted as an alternative to `true`.
 * @returns {Boolean} Whether the regex matched the provided value.
 * @example
 *
 * // Basic use
 * XRegExp.test('abc', /c/); // -> true
 *
 * // With pos and sticky
 * XRegExp.test('abc', /c/, 0, 'sticky'); // -> false
 * XRegExp.test('abc', /c/, 2, 'sticky'); // -> true
 */
// Do this the easy way :-)


XRegExp.test = function (str, regex, pos, sticky) {
  return !!XRegExp.exec(str, regex, pos, sticky);
};
/**
 * Uninstalls optional features according to the specified options. All optional features start out
 * uninstalled, so this is used to undo the actions of `XRegExp.install`.
 *
 * @memberOf XRegExp
 * @param {Object|String} options Options object or string.
 * @example
 *
 * // With an options object
 * XRegExp.uninstall({
 *   // Disables support for astral code points in Unicode addons
 *   astral: true,
 *
 *   // Don't add named capture groups to the `groups` property of matches
 *   namespacing: true
 * });
 *
 * // With an options string
 * XRegExp.uninstall('astral namespacing');
 */


XRegExp.uninstall = function (options) {
  options = prepareOptions(options);

  if (features.astral && options.astral) {
    setAstral(false);
  }

  if (features.namespacing && options.namespacing) {
    setNamespacing(false);
  }
};
/**
 * Returns an XRegExp object that is the union of the given patterns. Patterns can be provided as
 * regex objects or strings. Metacharacters are escaped in patterns provided as strings.
 * Backreferences in provided regex objects are automatically renumbered to work correctly within
 * the larger combined pattern. Native flags used by provided regexes are ignored in favor of the
 * `flags` argument.
 *
 * @memberOf XRegExp
 * @param {Array} patterns Regexes and strings to combine.
 * @param {String} [flags] Any combination of XRegExp flags.
 * @param {Object} [options] Options object with optional properties:
 *   - `conjunction` {String} Type of conjunction to use: 'or' (default) or 'none'.
 * @returns {RegExp} Union of the provided regexes and strings.
 * @example
 *
 * XRegExp.union(['a+b*c', /(dogs)\1/, /(cats)\1/], 'i');
 * // -> /a\+b\*c|(dogs)\1|(cats)\2/i
 *
 * XRegExp.union([/man/, /bear/, /pig/], 'i', {conjunction: 'none'});
 * // -> /manbearpig/i
 */


XRegExp.union = function (patterns, flags, options) {
  options = options || {};
  var conjunction = options.conjunction || 'or';
  var numCaptures = 0;
  var numPriorCaptures;
  var captureNames;

  function rewrite(match, paren, backref) {
    var name = captureNames[numCaptures - numPriorCaptures]; // Capturing group

    if (paren) {
      ++numCaptures; // If the current capture has a name, preserve the name

      if (name) {
        return "(?<".concat(name, ">");
      } // Backreference

    } else if (backref) {
      // Rewrite the backreference
      return "\\".concat(+backref + numPriorCaptures);
    }

    return match;
  }

  if (!(isType(patterns, 'Array') && patterns.length)) {
    throw new TypeError('Must provide a nonempty array of patterns to merge');
  }

  var parts = /(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*\]/g;
  var output = [];
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = patterns[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var pattern = _step5.value;

      if (XRegExp.isRegExp(pattern)) {
        numPriorCaptures = numCaptures;
        captureNames = pattern[REGEX_DATA] && pattern[REGEX_DATA].captureNames || []; // Rewrite backreferences. Passing to XRegExp dies on octals and ensures patterns are
        // independently valid; helps keep this simple. Named captures are put back

        output.push(nativ.replace.call(XRegExp(pattern.source).source, parts, rewrite));
      } else {
        output.push(XRegExp.escape(pattern));
      }
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  var separator = conjunction === 'none' ? '' : '|';
  return XRegExp(output.join(separator), flags);
}; // ==--------------------------==
// Fixed/extended native methods
// ==--------------------------==

/**
 * Adds named capture support (with backreferences returned as `result.name`), and fixes browser
 * bugs in the native `RegExp.prototype.exec`. Use via `XRegExp.exec`.
 *
 * @memberOf RegExp
 * @param {String} str String to search.
 * @returns {Array} Match array with named backreference properties, or `null`.
 */


fixed.exec = function (str) {
  var origLastIndex = this.lastIndex;
  var match = nativ.exec.apply(this, arguments);

  if (match) {
    // Fix browsers whose `exec` methods don't return `undefined` for nonparticipating capturing
    // groups. This fixes IE 5.5-8, but not IE 9's quirks mode or emulation of older IEs. IE 9
    // in standards mode follows the spec.
    if (!correctExecNpcg && match.length > 1 && match.indexOf('') !== -1) {
      var r2 = copyRegex(this, {
        removeG: true,
        isInternalOnly: true
      }); // Using `str.slice(match.index)` rather than `match[0]` in case lookahead allowed
      // matching due to characters outside the match

      nativ.replace.call(String(str).slice(match.index), r2, function () {
        var len = arguments.length; // Skip index 0 and the last 2

        for (var i = 1; i < len - 2; ++i) {
          if ((i < 0 || arguments.length <= i ? undefined : arguments[i]) === undefined) {
            match[i] = undefined;
          }
        }
      });
    } // Attach named capture properties


    var groupsObject = match;

    if (XRegExp.isInstalled('namespacing')) {
      // https://tc39.github.io/proposal-regexp-named-groups/#sec-regexpbuiltinexec
      match.groups = Object.create(null);
      groupsObject = match.groups;
    }

    if (this[REGEX_DATA] && this[REGEX_DATA].captureNames) {
      // Skip index 0
      for (var i = 1; i < match.length; ++i) {
        var name = this[REGEX_DATA].captureNames[i - 1];

        if (name) {
          groupsObject[name] = match[i];
        }
      }
    } // Fix browsers that increment `lastIndex` after zero-length matches


    if (this.global && !match[0].length && this.lastIndex > match.index) {
      this.lastIndex = match.index;
    }
  }

  if (!this.global) {
    // Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
    this.lastIndex = origLastIndex;
  }

  return match;
};
/**
 * Fixes browser bugs in the native `RegExp.prototype.test`.
 *
 * @memberOf RegExp
 * @param {String} str String to search.
 * @returns {Boolean} Whether the regex matched the provided value.
 */


fixed.test = function (str) {
  // Do this the easy way :-)
  return !!fixed.exec.call(this, str);
};
/**
 * Adds named capture support (with backreferences returned as `result.name`), and fixes browser
 * bugs in the native `String.prototype.match`.
 *
 * @memberOf String
 * @param {RegExp|*} regex Regex to search with. If not a regex object, it is passed to `RegExp`.
 * @returns {Array} If `regex` uses flag g, an array of match strings or `null`. Without flag g,
 *   the result of calling `regex.exec(this)`.
 */


fixed.match = function (regex) {
  if (!XRegExp.isRegExp(regex)) {
    // Use the native `RegExp` rather than `XRegExp`
    regex = new RegExp(regex);
  } else if (regex.global) {
    var result = nativ.match.apply(this, arguments); // Fixes IE bug

    regex.lastIndex = 0;
    return result;
  }

  return fixed.exec.call(regex, toObject(this));
};
/**
 * Adds support for `${n}` (or `$<n>`) tokens for named and numbered backreferences in replacement
 * text, and provides named backreferences to replacement functions as `arguments[0].name`. Also
 * fixes browser bugs in replacement text syntax when performing a replacement using a nonregex
 * search value, and the value of a replacement regex's `lastIndex` property during replacement
 * iterations and upon completion. Note that this doesn't support SpiderMonkey's proprietary third
 * (`flags`) argument. Use via `XRegExp.replace`.
 *
 * @memberOf String
 * @param {RegExp|String} search Search pattern to be replaced.
 * @param {String|Function} replacement Replacement string or a function invoked to create it.
 * @returns {String} New string with one or all matches replaced.
 */


fixed.replace = function (search, replacement) {
  var isRegex = XRegExp.isRegExp(search);
  var origLastIndex;
  var captureNames;
  var result;

  if (isRegex) {
    if (search[REGEX_DATA]) {
      captureNames = search[REGEX_DATA].captureNames;
    } // Only needed if `search` is nonglobal


    origLastIndex = search.lastIndex;
  } else {
    search += ''; // Type-convert
  } // Don't use `typeof`; some older browsers return 'function' for regex objects


  if (isType(replacement, 'Function')) {
    // Stringifying `this` fixes a bug in IE < 9 where the last argument in replacement
    // functions isn't type-converted to a string
    result = nativ.replace.call(String(this), search, function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (captureNames) {
        var groupsObject;

        if (XRegExp.isInstalled('namespacing')) {
          // https://tc39.github.io/proposal-regexp-named-groups/#sec-regexpbuiltinexec
          groupsObject = Object.create(null);
          args.push(groupsObject);
        } else {
          // Change the `args[0]` string primitive to a `String` object that can store
          // properties. This really does need to use `String` as a constructor
          args[0] = new String(args[0]);
          groupsObject = args[0];
        } // Store named backreferences


        for (var i = 0; i < captureNames.length; ++i) {
          if (captureNames[i]) {
            groupsObject[captureNames[i]] = args[i + 1];
          }
        }
      } // Update `lastIndex` before calling `replacement`. Fixes IE, Chrome, Firefox, Safari
      // bug (last tested IE 9, Chrome 17, Firefox 11, Safari 5.1)


      if (isRegex && search.global) {
        search.lastIndex = args[args.length - 2] + args[0].length;
      } // ES6 specs the context for replacement functions as `undefined`


      return replacement.apply(void 0, args);
    });
  } else {
    // Ensure that the last value of `args` will be a string when given nonstring `this`,
    // while still throwing on null or undefined context
    result = nativ.replace.call(this == null ? this : String(this), search, function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return nativ.replace.call(String(replacement), replacementToken, replacer);

      function replacer($0, bracketed, angled, dollarToken) {
        bracketed = bracketed || angled; // Named or numbered backreference with curly or angled braces

        if (bracketed) {
          // XRegExp behavior for `${n}` or `$<n>`:
          // 1. Backreference to numbered capture, if `n` is an integer. Use `0` for the
          //    entire match. Any number of leading zeros may be used.
          // 2. Backreference to named capture `n`, if it exists and is not an integer
          //    overridden by numbered capture. In practice, this does not overlap with
          //    numbered capture since XRegExp does not allow named capture to use a bare
          //    integer as the name.
          // 3. If the name or number does not refer to an existing capturing group, it's
          //    an error.
          var n = +bracketed; // Type-convert; drop leading zeros

          if (n <= args.length - 3) {
            return args[n] || '';
          } // Groups with the same name is an error, else would need `lastIndexOf`


          n = captureNames ? captureNames.indexOf(bracketed) : -1;

          if (n < 0) {
            throw new SyntaxError("Backreference to undefined group ".concat($0));
          }

          return args[n + 1] || '';
        } // Else, special variable or numbered backreference without curly braces


        if (dollarToken === '$') {
          // $$
          return '$';
        }

        if (dollarToken === '&' || +dollarToken === 0) {
          // $&, $0 (not followed by 1-9), $00
          return args[0];
        }

        if (dollarToken === '`') {
          // $` (left context)
          return args[args.length - 1].slice(0, args[args.length - 2]);
        }

        if (dollarToken === "'") {
          // $' (right context)
          return args[args.length - 1].slice(args[args.length - 2] + args[0].length);
        } // Else, numbered backreference without braces


        dollarToken = +dollarToken; // Type-convert; drop leading zero
        // XRegExp behavior for `$n` and `$nn`:
        // - Backrefs end after 1 or 2 digits. Use `${..}` or `$<..>` for more digits.
        // - `$1` is an error if no capturing groups.
        // - `$10` is an error if less than 10 capturing groups. Use `${1}0` or `$<1>0`
        //   instead.
        // - `$01` is `$1` if at least one capturing group, else it's an error.
        // - `$0` (not followed by 1-9) and `$00` are the entire match.
        // Native behavior, for comparison:
        // - Backrefs end after 1 or 2 digits. Cannot reference capturing group 100+.
        // - `$1` is a literal `$1` if no capturing groups.
        // - `$10` is `$1` followed by a literal `0` if less than 10 capturing groups.
        // - `$01` is `$1` if at least one capturing group, else it's a literal `$01`.
        // - `$0` is a literal `$0`.

        if (!isNaN(dollarToken)) {
          if (dollarToken > args.length - 3) {
            throw new SyntaxError("Backreference to undefined group ".concat($0));
          }

          return args[dollarToken] || '';
        } // `$` followed by an unsupported char is an error, unlike native JS


        throw new SyntaxError("Invalid token ".concat($0));
      }
    });
  }

  if (isRegex) {
    if (search.global) {
      // Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
      search.lastIndex = 0;
    } else {
      // Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
      search.lastIndex = origLastIndex;
    }
  }

  return result;
};
/**
 * Fixes browser bugs in the native `String.prototype.split`. Use via `XRegExp.split`.
 *
 * @memberOf String
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 */


fixed.split = function (separator, limit) {
  if (!XRegExp.isRegExp(separator)) {
    // Browsers handle nonregex split correctly, so use the faster native method
    return nativ.split.apply(this, arguments);
  }

  var str = String(this);
  var output = [];
  var origLastIndex = separator.lastIndex;
  var lastLastIndex = 0;
  var lastLength; // Values for `limit`, per the spec:
  // If undefined: pow(2,32) - 1
  // If 0, Infinity, or NaN: 0
  // If positive number: limit = floor(limit); if (limit >= pow(2,32)) limit -= pow(2,32);
  // If negative number: pow(2,32) - floor(abs(limit))
  // If other: Type-convert, then use the above rules
  // This line fails in very strange ways for some values of `limit` in Opera 10.5-10.63, unless
  // Opera Dragonfly is open (go figure). It works in at least Opera 9.5-10.1 and 11+

  limit = (limit === undefined ? -1 : limit) >>> 0;
  XRegExp.forEach(str, separator, function (match) {
    // This condition is not the same as `if (match[0].length)`
    if (match.index + match[0].length > lastLastIndex) {
      output.push(str.slice(lastLastIndex, match.index));

      if (match.length > 1 && match.index < str.length) {
        Array.prototype.push.apply(output, match.slice(1));
      }

      lastLength = match[0].length;
      lastLastIndex = match.index + lastLength;
    }
  });

  if (lastLastIndex === str.length) {
    if (!nativ.test.call(separator, '') || lastLength) {
      output.push('');
    }
  } else {
    output.push(str.slice(lastLastIndex));
  }

  separator.lastIndex = origLastIndex;
  return output.length > limit ? output.slice(0, limit) : output;
}; // ==--------------------------==
// Built-in syntax/flag tokens
// ==--------------------------==

/*
 * Letter escapes that natively match literal characters: `\a`, `\A`, etc. These should be
 * SyntaxErrors but are allowed in web reality. XRegExp makes them errors for cross-browser
 * consistency and to reserve their syntax, but lets them be superseded by addons.
 */


XRegExp.addToken(/\\([ABCE-RTUVXYZaeg-mopqyz]|c(?![A-Za-z])|u(?![\dA-Fa-f]{4}|{[\dA-Fa-f]+})|x(?![\dA-Fa-f]{2}))/, function (match, scope) {
  // \B is allowed in default scope only
  if (match[1] === 'B' && scope === defaultScope) {
    return match[0];
  }

  throw new SyntaxError("Invalid escape ".concat(match[0]));
}, {
  scope: 'all',
  leadChar: '\\'
});
/*
 * Unicode code point escape with curly braces: `\u{N..}`. `N..` is any one or more digit
 * hexadecimal number from 0-10FFFF, and can include leading zeros. Requires the native ES6 `u` flag
 * to support code points greater than U+FFFF. Avoids converting code points above U+FFFF to
 * surrogate pairs (which could be done without flag `u`), since that could lead to broken behavior
 * if you follow a `\u{N..}` token that references a code point above U+FFFF with a quantifier, or
 * if you use the same in a character class.
 */

XRegExp.addToken(/\\u{([\dA-Fa-f]+)}/, function (match, scope, flags) {
  var code = dec(match[1]);

  if (code > 0x10FFFF) {
    throw new SyntaxError("Invalid Unicode code point ".concat(match[0]));
  }

  if (code <= 0xFFFF) {
    // Converting to \uNNNN avoids needing to escape the literal character and keep it
    // separate from preceding tokens
    return "\\u".concat(pad4(hex(code)));
  } // If `code` is between 0xFFFF and 0x10FFFF, require and defer to native handling


  if (hasNativeU && flags.indexOf('u') !== -1) {
    return match[0];
  }

  throw new SyntaxError('Cannot use Unicode code point above \\u{FFFF} without flag u');
}, {
  scope: 'all',
  leadChar: '\\'
});
/*
 * Empty character class: `[]` or `[^]`. This fixes a critical cross-browser syntax inconsistency.
 * Unless this is standardized (per the ES spec), regex syntax can't be accurately parsed because
 * character class endings can't be determined.
 */

XRegExp.addToken(/\[(\^?)\]/, // For cross-browser compatibility with ES3, convert [] to \b\B and [^] to [\s\S].
// (?!) should work like \b\B, but is unreliable in some versions of Firefox

/* eslint-disable no-confusing-arrow */
function (match) {
  return match[1] ? '[\\s\\S]' : '\\b\\B';
},
/* eslint-enable no-confusing-arrow */
{
  leadChar: '['
});
/*
 * Comment pattern: `(?# )`. Inline comments are an alternative to the line comments allowed in
 * free-spacing mode (flag x).
 */

XRegExp.addToken(/\(\?#[^)]*\)/, getContextualTokenSeparator, {
  leadChar: '('
});
/*
 * Whitespace and line comments, in free-spacing mode (aka extended mode, flag x) only.
 */

XRegExp.addToken(/\s+|#[^\n]*\n?/, getContextualTokenSeparator, {
  flag: 'x'
});
/*
 * Dot, in dotall mode (aka singleline mode, flag s) only.
 */

XRegExp.addToken(/\./, function () {
  return '[\\s\\S]';
}, {
  flag: 's',
  leadChar: '.'
});
/*
 * Named backreference: `\k<name>`. Backreference names can use the characters A-Z, a-z, 0-9, _,
 * and $ only. Also allows numbered backreferences as `\k<n>`.
 */

XRegExp.addToken(/\\k<([\w$]+)>/, function (match) {
  // Groups with the same name is an error, else would need `lastIndexOf`
  var index = isNaN(match[1]) ? this.captureNames.indexOf(match[1]) + 1 : +match[1];
  var endIndex = match.index + match[0].length;

  if (!index || index > this.captureNames.length) {
    throw new SyntaxError("Backreference to undefined group ".concat(match[0]));
  } // Keep backreferences separate from subsequent literal numbers. This avoids e.g.
  // inadvertedly changing `(?<n>)\k<n>1` to `()\11`.


  return "\\".concat(index).concat(endIndex === match.input.length || isNaN(match.input[endIndex]) ? '' : '(?:)');
}, {
  leadChar: '\\'
});
/*
 * Numbered backreference or octal, plus any following digits: `\0`, `\11`, etc. Octals except `\0`
 * not followed by 0-9 and backreferences to unopened capture groups throw an error. Other matches
 * are returned unaltered. IE < 9 doesn't support backreferences above `\99` in regex syntax.
 */

XRegExp.addToken(/\\(\d+)/, function (match, scope) {
  if (!(scope === defaultScope && /^[1-9]/.test(match[1]) && +match[1] <= this.captureNames.length) && match[1] !== '0') {
    throw new SyntaxError("Cannot use octal escape or backreference to undefined group ".concat(match[0]));
  }

  return match[0];
}, {
  scope: 'all',
  leadChar: '\\'
});
/*
 * Named capturing group; match the opening delimiter only: `(?<name>`. Capture names can use the
 * characters A-Z, a-z, 0-9, _, and $ only. Names can't be integers. Supports Python-style
 * `(?P<name>` as an alternate syntax to avoid issues in some older versions of Opera which natively
 * supported the Python-style syntax. Otherwise, XRegExp might treat numbered backreferences to
 * Python-style named capture as octals.
 */

XRegExp.addToken(/\(\?P?<([\w$]+)>/, function (match) {
  // Disallow bare integers as names because named backreferences are added to match arrays
  // and therefore numeric properties may lead to incorrect lookups
  if (!isNaN(match[1])) {
    throw new SyntaxError("Cannot use integer as capture name ".concat(match[0]));
  }

  if (!XRegExp.isInstalled('namespacing') && (match[1] === 'length' || match[1] === '__proto__')) {
    throw new SyntaxError("Cannot use reserved word as capture name ".concat(match[0]));
  }

  if (this.captureNames.indexOf(match[1]) !== -1) {
    throw new SyntaxError("Cannot use same name for multiple groups ".concat(match[0]));
  }

  this.captureNames.push(match[1]);
  this.hasNamedCapture = true;
  return '(';
}, {
  leadChar: '('
});
/*
 * Capturing group; match the opening parenthesis only. Required for support of named capturing
 * groups. Also adds explicit capture mode (flag n).
 */

XRegExp.addToken(/\((?!\?)/, function (match, scope, flags) {
  if (flags.indexOf('n') !== -1) {
    return '(?:';
  }

  this.captureNames.push(null);
  return '(';
}, {
  optionalFlags: 'n',
  leadChar: '('
});
var _default = XRegExp;
exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(xregexp);

var build = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*!
 * XRegExp.build 4.2.0
 * <xregexp.com>
 * Steven Levithan (c) 2012-present MIT License
 */
var _default = function _default(XRegExp) {
  var REGEX_DATA = 'xregexp';
  var subParts = /(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*\]/g;
  var parts = XRegExp.union([/\({{([\w$]+)}}\)|{{([\w$]+)}}/, subParts], 'g', {
    conjunction: 'or'
  });
  /**
   * Strips a leading `^` and trailing unescaped `$`, if both are present.
   *
   * @private
   * @param {String} pattern Pattern to process.
   * @returns {String} Pattern with edge anchors removed.
   */

  function deanchor(pattern) {
    // Allow any number of empty noncapturing groups before/after anchors, because regexes
    // built/generated by XRegExp sometimes include them
    var leadingAnchor = /^(?:\(\?:\))*\^/;
    var trailingAnchor = /\$(?:\(\?:\))*$/;

    if (leadingAnchor.test(pattern) && trailingAnchor.test(pattern) && // Ensure that the trailing `$` isn't escaped
    trailingAnchor.test(pattern.replace(/\\[\s\S]/g, ''))) {
      return pattern.replace(leadingAnchor, '').replace(trailingAnchor, '');
    }

    return pattern;
  }
  /**
   * Converts the provided value to an XRegExp. Native RegExp flags are not preserved.
   *
   * @private
   * @param {String|RegExp} value Value to convert.
   * @param {Boolean} [addFlagX] Whether to apply the `x` flag in cases when `value` is not
   *   already a regex generated by XRegExp
   * @returns {RegExp} XRegExp object with XRegExp syntax applied.
   */


  function asXRegExp(value, addFlagX) {
    var flags = addFlagX ? 'x' : '';
    return XRegExp.isRegExp(value) ? value[REGEX_DATA] && value[REGEX_DATA].captureNames ? // Don't recompile, to preserve capture names
    value : // Recompile as XRegExp
    XRegExp(value.source, flags) : // Compile string as XRegExp
    XRegExp(value, flags);
  }

  function interpolate(substitution) {
    return substitution instanceof RegExp ? substitution : XRegExp.escape(substitution);
  }

  function reduceToSubpatternsObject(subpatterns, interpolated, subpatternIndex) {
    subpatterns["subpattern".concat(subpatternIndex)] = interpolated;
    return subpatterns;
  }

  function embedSubpatternAfter(raw, subpatternIndex, rawLiterals) {
    var hasSubpattern = subpatternIndex < rawLiterals.length - 1;
    return raw + (hasSubpattern ? "{{subpattern".concat(subpatternIndex, "}}") : '');
  }
  /**
   * Provides tagged template literals that create regexes with XRegExp syntax and flags. The
   * provided pattern is handled as a raw string, so backslashes don't need to be escaped.
   *
   * Interpolation of strings and regexes shares the features of `XRegExp.build`. Interpolated
   * patterns are treated as atomic units when quantified, interpolated strings have their special
   * characters escaped, a leading `^` and trailing unescaped `$` are stripped from interpolated
   * regexes if both are present, and any backreferences within an interpolated regex are
   * rewritten to work within the overall pattern.
   *
   * @memberOf XRegExp
   * @param {String} [flags] Any combination of XRegExp flags.
   * @returns {Function} Handler for template literals that construct regexes with XRegExp syntax.
   * @example
   *
   * const h12 = /1[0-2]|0?[1-9]/;
   * const h24 = /2[0-3]|[01][0-9]/;
   * const hours = XRegExp.tag('x')`${h12} : | ${h24}`;
   * const minutes = /^[0-5][0-9]$/;
   * // Note that explicitly naming the 'minutes' group is required for named backreferences
   * const time = XRegExp.tag('x')`^ ${hours} (?<minutes>${minutes}) $`;
   * time.test('10:59'); // -> true
   * XRegExp.exec('10:59', time).minutes; // -> '59'
   */


  XRegExp.tag = function (flags) {
    return function (literals) {
      for (var _len = arguments.length, substitutions = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        substitutions[_key - 1] = arguments[_key];
      }

      var subpatterns = substitutions.map(interpolate).reduce(reduceToSubpatternsObject, {});
      var pattern = literals.raw.map(embedSubpatternAfter).join('');
      return XRegExp.build(pattern, subpatterns, flags);
    };
  };
  /**
   * Builds regexes using named subpatterns, for readability and pattern reuse. Backreferences in
   * the outer pattern and provided subpatterns are automatically renumbered to work correctly.
   * Native flags used by provided subpatterns are ignored in favor of the `flags` argument.
   *
   * @memberOf XRegExp
   * @param {String} pattern XRegExp pattern using `{{name}}` for embedded subpatterns. Allows
   *   `({{name}})` as shorthand for `(?<name>{{name}})`. Patterns cannot be embedded within
   *   character classes.
   * @param {Object} subs Lookup object for named subpatterns. Values can be strings or regexes. A
   *   leading `^` and trailing unescaped `$` are stripped from subpatterns, if both are present.
   * @param {String} [flags] Any combination of XRegExp flags.
   * @returns {RegExp} Regex with interpolated subpatterns.
   * @example
   *
   * const time = XRegExp.build('(?x)^ {{hours}} ({{minutes}}) $', {
   *   hours: XRegExp.build('{{h12}} : | {{h24}}', {
   *     h12: /1[0-2]|0?[1-9]/,
   *     h24: /2[0-3]|[01][0-9]/
   *   }, 'x'),
   *   minutes: /^[0-5][0-9]$/
   * });
   * time.test('10:59'); // -> true
   * XRegExp.exec('10:59', time).minutes; // -> '59'
   */


  XRegExp.build = function (pattern, subs, flags) {
    flags = flags || ''; // Used with `asXRegExp` calls for `pattern` and subpatterns in `subs`, to work around how
    // some browsers convert `RegExp('\n')` to a regex that contains the literal characters `\`
    // and `n`. See more details at <https://github.com/slevithan/xregexp/pull/163>.

    var addFlagX = flags.indexOf('x') !== -1;
    var inlineFlags = /^\(\?([\w$]+)\)/.exec(pattern); // Add flags within a leading mode modifier to the overall pattern's flags

    if (inlineFlags) {
      flags = XRegExp._clipDuplicates(flags + inlineFlags[1]);
    }

    var data = {};

    for (var p in subs) {
      if (subs.hasOwnProperty(p)) {
        // Passing to XRegExp enables extended syntax and ensures independent validity,
        // lest an unescaped `(`, `)`, `[`, or trailing `\` breaks the `(?:)` wrapper. For
        // subpatterns provided as native regexes, it dies on octals and adds the property
        // used to hold extended regex instance data, for simplicity.
        var sub = asXRegExp(subs[p], addFlagX);
        data[p] = {
          // Deanchoring allows embedding independently useful anchored regexes. If you
          // really need to keep your anchors, double them (i.e., `^^...$$`).
          pattern: deanchor(sub.source),
          names: sub[REGEX_DATA].captureNames || []
        };
      }
    } // Passing to XRegExp dies on octals and ensures the outer pattern is independently valid;
    // helps keep this simple. Named captures will be put back.


    var patternAsRegex = asXRegExp(pattern, addFlagX); // 'Caps' is short for 'captures'

    var numCaps = 0;
    var numPriorCaps;
    var numOuterCaps = 0;
    var outerCapsMap = [0];
    var outerCapNames = patternAsRegex[REGEX_DATA].captureNames || [];
    var output = patternAsRegex.source.replace(parts, function ($0, $1, $2, $3, $4) {
      var subName = $1 || $2;
      var capName;
      var intro;
      var localCapIndex; // Named subpattern

      if (subName) {
        if (!data.hasOwnProperty(subName)) {
          throw new ReferenceError("Undefined property ".concat($0));
        } // Named subpattern was wrapped in a capturing group


        if ($1) {
          capName = outerCapNames[numOuterCaps];
          outerCapsMap[++numOuterCaps] = ++numCaps; // If it's a named group, preserve the name. Otherwise, use the subpattern name
          // as the capture name

          intro = "(?<".concat(capName || subName, ">");
        } else {
          intro = '(?:';
        }

        numPriorCaps = numCaps;
        var rewrittenSubpattern = data[subName].pattern.replace(subParts, function (match, paren, backref) {
          // Capturing group
          if (paren) {
            capName = data[subName].names[numCaps - numPriorCaps];
            ++numCaps; // If the current capture has a name, preserve the name

            if (capName) {
              return "(?<".concat(capName, ">");
            } // Backreference

          } else if (backref) {
            localCapIndex = +backref - 1; // Rewrite the backreference

            return data[subName].names[localCapIndex] ? // Need to preserve the backreference name in case using flag `n`
            "\\k<".concat(data[subName].names[localCapIndex], ">") : "\\".concat(+backref + numPriorCaps);
          }

          return match;
        });
        return "".concat(intro).concat(rewrittenSubpattern, ")");
      } // Capturing group


      if ($3) {
        capName = outerCapNames[numOuterCaps];
        outerCapsMap[++numOuterCaps] = ++numCaps; // If the current capture has a name, preserve the name

        if (capName) {
          return "(?<".concat(capName, ">");
        } // Backreference

      } else if ($4) {
        localCapIndex = +$4 - 1; // Rewrite the backreference

        return outerCapNames[localCapIndex] ? // Need to preserve the backreference name in case using flag `n`
        "\\k<".concat(outerCapNames[localCapIndex], ">") : "\\".concat(outerCapsMap[+$4]);
      }

      return $0;
    });
    return XRegExp(output, flags);
  };
};

exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(build);

var matchrecursive = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*!
 * XRegExp.matchRecursive 4.2.0
 * <xregexp.com>
 * Steven Levithan (c) 2009-present MIT License
 */
var _default = function _default(XRegExp) {
  /**
   * Returns a match detail object composed of the provided values.
   *
   * @private
   */
  function row(name, value, start, end) {
    return {
      name: name,
      value: value,
      start: start,
      end: end
    };
  }
  /**
   * Returns an array of match strings between outermost left and right delimiters, or an array of
   * objects with detailed match parts and position data. An error is thrown if delimiters are
   * unbalanced within the data.
   *
   * @memberOf XRegExp
   * @param {String} str String to search.
   * @param {String} left Left delimiter as an XRegExp pattern.
   * @param {String} right Right delimiter as an XRegExp pattern.
   * @param {String} [flags] Any native or XRegExp flags, used for the left and right delimiters.
   * @param {Object} [options] Lets you specify `valueNames` and `escapeChar` options.
   * @returns {Array} Array of matches, or an empty array.
   * @example
   *
   * // Basic usage
   * let str = '(t((e))s)t()(ing)';
   * XRegExp.matchRecursive(str, '\\(', '\\)', 'g');
   * // -> ['t((e))s', '', 'ing']
   *
   * // Extended information mode with valueNames
   * str = 'Here is <div> <div>an</div></div> example';
   * XRegExp.matchRecursive(str, '<div\\s*>', '</div>', 'gi', {
   *   valueNames: ['between', 'left', 'match', 'right']
   * });
   * // -> [
   * // {name: 'between', value: 'Here is ',       start: 0,  end: 8},
   * // {name: 'left',    value: '<div>',          start: 8,  end: 13},
   * // {name: 'match',   value: ' <div>an</div>', start: 13, end: 27},
   * // {name: 'right',   value: '</div>',         start: 27, end: 33},
   * // {name: 'between', value: ' example',       start: 33, end: 41}
   * // ]
   *
   * // Omitting unneeded parts with null valueNames, and using escapeChar
   * str = '...{1}.\\{{function(x,y){return {y:x}}}';
   * XRegExp.matchRecursive(str, '{', '}', 'g', {
   *   valueNames: ['literal', null, 'value', null],
   *   escapeChar: '\\'
   * });
   * // -> [
   * // {name: 'literal', value: '...',  start: 0, end: 3},
   * // {name: 'value',   value: '1',    start: 4, end: 5},
   * // {name: 'literal', value: '.\\{', start: 6, end: 9},
   * // {name: 'value',   value: 'function(x,y){return {y:x}}', start: 10, end: 37}
   * // ]
   *
   * // Sticky mode via flag y
   * str = '<1><<<2>>><3>4<5>';
   * XRegExp.matchRecursive(str, '<', '>', 'gy');
   * // -> ['1', '<<2>>', '3']
   */


  XRegExp.matchRecursive = function (str, left, right, flags, options) {
    flags = flags || '';
    options = options || {};
    var global = flags.indexOf('g') !== -1;
    var sticky = flags.indexOf('y') !== -1; // Flag `y` is controlled internally

    var basicFlags = flags.replace(/y/g, '');
    var _options = options,
        escapeChar = _options.escapeChar;
    var vN = options.valueNames;
    var output = [];
    var openTokens = 0;
    var delimStart = 0;
    var delimEnd = 0;
    var lastOuterEnd = 0;
    var outerStart;
    var innerStart;
    var leftMatch;
    var rightMatch;
    var esc;
    left = XRegExp(left, basicFlags);
    right = XRegExp(right, basicFlags);

    if (escapeChar) {
      if (escapeChar.length > 1) {
        throw new Error('Cannot use more than one escape character');
      }

      escapeChar = XRegExp.escape(escapeChar); // Example of concatenated `esc` regex:
      // `escapeChar`: '%'
      // `left`: '<'
      // `right`: '>'
      // Regex is: /(?:%[\S\s]|(?:(?!<|>)[^%])+)+/

      esc = new RegExp("(?:".concat(escapeChar, "[\\S\\s]|(?:(?!").concat( // Using `XRegExp.union` safely rewrites backreferences in `left` and `right`.
      // Intentionally not passing `basicFlags` to `XRegExp.union` since any syntax
      // transformation resulting from those flags was already applied to `left` and
      // `right` when they were passed through the XRegExp constructor above.
      XRegExp.union([left, right], '', {
        conjunction: 'or'
      }).source, ")[^").concat(escapeChar, "])+)+"), // Flags `gy` not needed here
      flags.replace(/[^imu]+/g, ''));
    }

    while (true) {
      // If using an escape character, advance to the delimiter's next starting position,
      // skipping any escaped characters in between
      if (escapeChar) {
        delimEnd += (XRegExp.exec(str, esc, delimEnd, 'sticky') || [''])[0].length;
      }

      leftMatch = XRegExp.exec(str, left, delimEnd);
      rightMatch = XRegExp.exec(str, right, delimEnd); // Keep the leftmost match only

      if (leftMatch && rightMatch) {
        if (leftMatch.index <= rightMatch.index) {
          rightMatch = null;
        } else {
          leftMatch = null;
        }
      } // Paths (LM: leftMatch, RM: rightMatch, OT: openTokens):
      // LM | RM | OT | Result
      // 1  | 0  | 1  | loop
      // 1  | 0  | 0  | loop
      // 0  | 1  | 1  | loop
      // 0  | 1  | 0  | throw
      // 0  | 0  | 1  | throw
      // 0  | 0  | 0  | break
      // The paths above don't include the sticky mode special case. The loop ends after the
      // first completed match if not `global`.


      if (leftMatch || rightMatch) {
        delimStart = (leftMatch || rightMatch).index;
        delimEnd = delimStart + (leftMatch || rightMatch)[0].length;
      } else if (!openTokens) {
        break;
      }

      if (sticky && !openTokens && delimStart > lastOuterEnd) {
        break;
      }

      if (leftMatch) {
        if (!openTokens) {
          outerStart = delimStart;
          innerStart = delimEnd;
        }

        ++openTokens;
      } else if (rightMatch && openTokens) {
        if (! --openTokens) {
          if (vN) {
            if (vN[0] && outerStart > lastOuterEnd) {
              output.push(row(vN[0], str.slice(lastOuterEnd, outerStart), lastOuterEnd, outerStart));
            }

            if (vN[1]) {
              output.push(row(vN[1], str.slice(outerStart, innerStart), outerStart, innerStart));
            }

            if (vN[2]) {
              output.push(row(vN[2], str.slice(innerStart, delimStart), innerStart, delimStart));
            }

            if (vN[3]) {
              output.push(row(vN[3], str.slice(delimStart, delimEnd), delimStart, delimEnd));
            }
          } else {
            output.push(str.slice(innerStart, delimStart));
          }

          lastOuterEnd = delimEnd;

          if (!global) {
            break;
          }
        }
      } else {
        throw new Error('Unbalanced delimiter found in string');
      } // If the delimiter matched an empty string, avoid an infinite loop


      if (delimStart === delimEnd) {
        ++delimEnd;
      }
    }

    if (global && !sticky && vN && vN[0] && str.length > lastOuterEnd) {
      output.push(row(vN[0], str.slice(lastOuterEnd), lastOuterEnd, str.length));
    }

    return output;
  };
};

exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(matchrecursive);

var unicodeBase = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*!
 * XRegExp Unicode Base 4.2.0
 * <xregexp.com>
 * Steven Levithan (c) 2008-present MIT License
 */
var _default = function _default(XRegExp) {
  /**
   * Adds base support for Unicode matching:
   * - Adds syntax `\p{..}` for matching Unicode tokens. Tokens can be inverted using `\P{..}` or
   *   `\p{^..}`. Token names ignore case, spaces, hyphens, and underscores. You can omit the
   *   braces for token names that are a single letter (e.g. `\pL` or `PL`).
   * - Adds flag A (astral), which enables 21-bit Unicode support.
   * - Adds the `XRegExp.addUnicodeData` method used by other addons to provide character data.
   *
   * Unicode Base relies on externally provided Unicode character data. Official addons are
   * available to provide data for Unicode categories, scripts, blocks, and properties.
   *
   * @requires XRegExp
   */
  // ==--------------------------==
  // Private stuff
  // ==--------------------------==
  // Storage for Unicode data
  var unicode = {}; // Reuse utils

  var dec = XRegExp._dec;
  var hex = XRegExp._hex;
  var pad4 = XRegExp._pad4; // Generates a token lookup name: lowercase, with hyphens, spaces, and underscores removed

  function normalize(name) {
    return name.replace(/[- _]+/g, '').toLowerCase();
  } // Gets the decimal code of a literal code unit, \xHH, \uHHHH, or a backslash-escaped literal


  function charCode(chr) {
    var esc = /^\\[xu](.+)/.exec(chr);
    return esc ? dec(esc[1]) : chr.charCodeAt(chr[0] === '\\' ? 1 : 0);
  } // Inverts a list of ordered BMP characters and ranges


  function invertBmp(range) {
    var output = '';
    var lastEnd = -1;
    XRegExp.forEach(range, /(\\x..|\\u....|\\?[\s\S])(?:-(\\x..|\\u....|\\?[\s\S]))?/, function (m) {
      var start = charCode(m[1]);

      if (start > lastEnd + 1) {
        output += "\\u".concat(pad4(hex(lastEnd + 1)));

        if (start > lastEnd + 2) {
          output += "-\\u".concat(pad4(hex(start - 1)));
        }
      }

      lastEnd = charCode(m[2] || m[1]);
    });

    if (lastEnd < 0xFFFF) {
      output += "\\u".concat(pad4(hex(lastEnd + 1)));

      if (lastEnd < 0xFFFE) {
        output += '-\\uFFFF';
      }
    }

    return output;
  } // Generates an inverted BMP range on first use


  function cacheInvertedBmp(slug) {
    var prop = 'b!';
    return unicode[slug][prop] || (unicode[slug][prop] = invertBmp(unicode[slug].bmp));
  } // Combines and optionally negates BMP and astral data


  function buildAstral(slug, isNegated) {
    var item = unicode[slug];
    var combined = '';

    if (item.bmp && !item.isBmpLast) {
      combined = "[".concat(item.bmp, "]").concat(item.astral ? '|' : '');
    }

    if (item.astral) {
      combined += item.astral;
    }

    if (item.isBmpLast && item.bmp) {
      combined += "".concat(item.astral ? '|' : '', "[").concat(item.bmp, "]");
    } // Astral Unicode tokens always match a code point, never a code unit


    return isNegated ? "(?:(?!".concat(combined, ")(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\0-\uFFFF]))") : "(?:".concat(combined, ")");
  } // Builds a complete astral pattern on first use


  function cacheAstral(slug, isNegated) {
    var prop = isNegated ? 'a!' : 'a=';
    return unicode[slug][prop] || (unicode[slug][prop] = buildAstral(slug, isNegated));
  } // ==--------------------------==
  // Core functionality
  // ==--------------------------==

  /*
   * Add astral mode (flag A) and Unicode token syntax: `\p{..}`, `\P{..}`, `\p{^..}`, `\pC`.
   */


  XRegExp.addToken( // Use `*` instead of `+` to avoid capturing `^` as the token name in `\p{^}`
  /\\([pP])(?:{(\^?)([^}]*)}|([A-Za-z]))/, function (match, scope, flags) {
    var ERR_DOUBLE_NEG = 'Invalid double negation ';
    var ERR_UNKNOWN_NAME = 'Unknown Unicode token ';
    var ERR_UNKNOWN_REF = 'Unicode token missing data ';
    var ERR_ASTRAL_ONLY = 'Astral mode required for Unicode token ';
    var ERR_ASTRAL_IN_CLASS = 'Astral mode does not support Unicode tokens within character classes'; // Negated via \P{..} or \p{^..}

    var isNegated = match[1] === 'P' || !!match[2]; // Switch from BMP (0-FFFF) to astral (0-10FFFF) mode via flag A

    var isAstralMode = flags.indexOf('A') !== -1; // Token lookup name. Check `[4]` first to avoid passing `undefined` via `\p{}`

    var slug = normalize(match[4] || match[3]); // Token data object

    var item = unicode[slug];

    if (match[1] === 'P' && match[2]) {
      throw new SyntaxError(ERR_DOUBLE_NEG + match[0]);
    }

    if (!unicode.hasOwnProperty(slug)) {
      throw new SyntaxError(ERR_UNKNOWN_NAME + match[0]);
    } // Switch to the negated form of the referenced Unicode token


    if (item.inverseOf) {
      slug = normalize(item.inverseOf);

      if (!unicode.hasOwnProperty(slug)) {
        throw new ReferenceError("".concat(ERR_UNKNOWN_REF + match[0], " -> ").concat(item.inverseOf));
      }

      item = unicode[slug];
      isNegated = !isNegated;
    }

    if (!(item.bmp || isAstralMode)) {
      throw new SyntaxError(ERR_ASTRAL_ONLY + match[0]);
    }

    if (isAstralMode) {
      if (scope === 'class') {
        throw new SyntaxError(ERR_ASTRAL_IN_CLASS);
      }

      return cacheAstral(slug, isNegated);
    }

    return scope === 'class' ? isNegated ? cacheInvertedBmp(slug) : item.bmp : "".concat((isNegated ? '[^' : '[') + item.bmp, "]");
  }, {
    scope: 'all',
    optionalFlags: 'A',
    leadChar: '\\'
  });
  /**
   * Adds to the list of Unicode tokens that XRegExp regexes can match via `\p` or `\P`.
   *
   * @memberOf XRegExp
   * @param {Array} data Objects with named character ranges. Each object may have properties
   *   `name`, `alias`, `isBmpLast`, `inverseOf`, `bmp`, and `astral`. All but `name` are
   *   optional, although one of `bmp` or `astral` is required (unless `inverseOf` is set). If
   *   `astral` is absent, the `bmp` data is used for BMP and astral modes. If `bmp` is absent,
   *   the name errors in BMP mode but works in astral mode. If both `bmp` and `astral` are
   *   provided, the `bmp` data only is used in BMP mode, and the combination of `bmp` and
   *   `astral` data is used in astral mode. `isBmpLast` is needed when a token matches orphan
   *   high surrogates *and* uses surrogate pairs to match astral code points. The `bmp` and
   *   `astral` data should be a combination of literal characters and `\xHH` or `\uHHHH` escape
   *   sequences, with hyphens to create ranges. Any regex metacharacters in the data should be
   *   escaped, apart from range-creating hyphens. The `astral` data can additionally use
   *   character classes and alternation, and should use surrogate pairs to represent astral code
   *   points. `inverseOf` can be used to avoid duplicating character data if a Unicode token is
   *   defined as the exact inverse of another token.
   * @example
   *
   * // Basic use
   * XRegExp.addUnicodeData([{
   *   name: 'XDigit',
   *   alias: 'Hexadecimal',
   *   bmp: '0-9A-Fa-f'
   * }]);
   * XRegExp('\\p{XDigit}:\\p{Hexadecimal}+').test('0:3D'); // -> true
   */

  XRegExp.addUnicodeData = function (data) {
    var ERR_NO_NAME = 'Unicode token requires name';
    var ERR_NO_DATA = 'Unicode token has no character data ';
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        if (!item.name) {
          throw new Error(ERR_NO_NAME);
        }

        if (!(item.inverseOf || item.bmp || item.astral)) {
          throw new Error(ERR_NO_DATA + item.name);
        }

        unicode[normalize(item.name)] = item;

        if (item.alias) {
          unicode[normalize(item.alias)] = item;
        }
      } // Reset the pattern cache used by the `XRegExp` constructor, since the same pattern and
      // flags might now produce different results

    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    XRegExp.cache.flush('patterns');
  };
  /**
   * @ignore
   *
   * Return a reference to the internal Unicode definition structure for the given Unicode
   * Property if the given name is a legal Unicode Property for use in XRegExp `\p` or `\P` regex
   * constructs.
   *
   * @memberOf XRegExp
   * @param {String} name Name by which the Unicode Property may be recognized (case-insensitive),
   *   e.g. `'N'` or `'Number'`. The given name is matched against all registered Unicode
   *   Properties and Property Aliases.
   * @returns {Object} Reference to definition structure when the name matches a Unicode Property.
   *
   * @note
   * For more info on Unicode Properties, see also http://unicode.org/reports/tr18/#Categories.
   *
   * @note
   * This method is *not* part of the officially documented API and may change or be removed in
   * the future. It is meant for userland code that wishes to reuse the (large) internal Unicode
   * structures set up by XRegExp.
   */


  XRegExp._getUnicodeProperty = function (name) {
    var slug = normalize(name);
    return unicode[slug];
  };
};

exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(unicodeBase);

var blocks = [
    {
        'name': 'InAdlam',
        'astral': '\uD83A[\uDD00-\uDD5F]'
    },
    {
        'name': 'InAegean_Numbers',
        'astral': '\uD800[\uDD00-\uDD3F]'
    },
    {
        'name': 'InAhom',
        'astral': '\uD805[\uDF00-\uDF3F]'
    },
    {
        'name': 'InAlchemical_Symbols',
        'astral': '\uD83D[\uDF00-\uDF7F]'
    },
    {
        'name': 'InAlphabetic_Presentation_Forms',
        'bmp': '\uFB00-\uFB4F'
    },
    {
        'name': 'InAnatolian_Hieroglyphs',
        'astral': '\uD811[\uDC00-\uDE7F]'
    },
    {
        'name': 'InAncient_Greek_Musical_Notation',
        'astral': '\uD834[\uDE00-\uDE4F]'
    },
    {
        'name': 'InAncient_Greek_Numbers',
        'astral': '\uD800[\uDD40-\uDD8F]'
    },
    {
        'name': 'InAncient_Symbols',
        'astral': '\uD800[\uDD90-\uDDCF]'
    },
    {
        'name': 'InArabic',
        'bmp': '\u0600-\u06FF'
    },
    {
        'name': 'InArabic_Extended_A',
        'bmp': '\u08A0-\u08FF'
    },
    {
        'name': 'InArabic_Mathematical_Alphabetic_Symbols',
        'astral': '\uD83B[\uDE00-\uDEFF]'
    },
    {
        'name': 'InArabic_Presentation_Forms_A',
        'bmp': '\uFB50-\uFDFF'
    },
    {
        'name': 'InArabic_Presentation_Forms_B',
        'bmp': '\uFE70-\uFEFF'
    },
    {
        'name': 'InArabic_Supplement',
        'bmp': '\u0750-\u077F'
    },
    {
        'name': 'InArmenian',
        'bmp': '\u0530-\u058F'
    },
    {
        'name': 'InArrows',
        'bmp': '\u2190-\u21FF'
    },
    {
        'name': 'InAvestan',
        'astral': '\uD802[\uDF00-\uDF3F]'
    },
    {
        'name': 'InBalinese',
        'bmp': '\u1B00-\u1B7F'
    },
    {
        'name': 'InBamum',
        'bmp': '\uA6A0-\uA6FF'
    },
    {
        'name': 'InBamum_Supplement',
        'astral': '\uD81A[\uDC00-\uDE3F]'
    },
    {
        'name': 'InBasic_Latin',
        'bmp': '\0-\x7F'
    },
    {
        'name': 'InBassa_Vah',
        'astral': '\uD81A[\uDED0-\uDEFF]'
    },
    {
        'name': 'InBatak',
        'bmp': '\u1BC0-\u1BFF'
    },
    {
        'name': 'InBengali',
        'bmp': '\u0980-\u09FF'
    },
    {
        'name': 'InBhaiksuki',
        'astral': '\uD807[\uDC00-\uDC6F]'
    },
    {
        'name': 'InBlock_Elements',
        'bmp': '\u2580-\u259F'
    },
    {
        'name': 'InBopomofo',
        'bmp': '\u3100-\u312F'
    },
    {
        'name': 'InBopomofo_Extended',
        'bmp': '\u31A0-\u31BF'
    },
    {
        'name': 'InBox_Drawing',
        'bmp': '\u2500-\u257F'
    },
    {
        'name': 'InBrahmi',
        'astral': '\uD804[\uDC00-\uDC7F]'
    },
    {
        'name': 'InBraille_Patterns',
        'bmp': '\u2800-\u28FF'
    },
    {
        'name': 'InBuginese',
        'bmp': '\u1A00-\u1A1F'
    },
    {
        'name': 'InBuhid',
        'bmp': '\u1740-\u175F'
    },
    {
        'name': 'InByzantine_Musical_Symbols',
        'astral': '\uD834[\uDC00-\uDCFF]'
    },
    {
        'name': 'InCJK_Compatibility',
        'bmp': '\u3300-\u33FF'
    },
    {
        'name': 'InCJK_Compatibility_Forms',
        'bmp': '\uFE30-\uFE4F'
    },
    {
        'name': 'InCJK_Compatibility_Ideographs',
        'bmp': '\uF900-\uFAFF'
    },
    {
        'name': 'InCJK_Compatibility_Ideographs_Supplement',
        'astral': '\uD87E[\uDC00-\uDE1F]'
    },
    {
        'name': 'InCJK_Radicals_Supplement',
        'bmp': '\u2E80-\u2EFF'
    },
    {
        'name': 'InCJK_Strokes',
        'bmp': '\u31C0-\u31EF'
    },
    {
        'name': 'InCJK_Symbols_And_Punctuation',
        'bmp': '\u3000-\u303F'
    },
    {
        'name': 'InCJK_Unified_Ideographs',
        'bmp': '\u4E00-\u9FFF'
    },
    {
        'name': 'InCJK_Unified_Ideographs_Extension_A',
        'bmp': '\u3400-\u4DBF'
    },
    {
        'name': 'InCJK_Unified_Ideographs_Extension_B',
        'astral': '[\uD840-\uD868][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDF]'
    },
    {
        'name': 'InCJK_Unified_Ideographs_Extension_C',
        'astral': '\uD869[\uDF00-\uDFFF]|[\uD86A-\uD86C][\uDC00-\uDFFF]|\uD86D[\uDC00-\uDF3F]'
    },
    {
        'name': 'InCJK_Unified_Ideographs_Extension_D',
        'astral': '\uD86D[\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1F]'
    },
    {
        'name': 'InCJK_Unified_Ideographs_Extension_E',
        'astral': '\uD86E[\uDC20-\uDFFF]|[\uD86F-\uD872][\uDC00-\uDFFF]|\uD873[\uDC00-\uDEAF]'
    },
    {
        'name': 'InCJK_Unified_Ideographs_Extension_F',
        'astral': '\uD873[\uDEB0-\uDFFF]|[\uD874-\uD879][\uDC00-\uDFFF]|\uD87A[\uDC00-\uDFEF]'
    },
    {
        'name': 'InCarian',
        'astral': '\uD800[\uDEA0-\uDEDF]'
    },
    {
        'name': 'InCaucasian_Albanian',
        'astral': '\uD801[\uDD30-\uDD6F]'
    },
    {
        'name': 'InChakma',
        'astral': '\uD804[\uDD00-\uDD4F]'
    },
    {
        'name': 'InCham',
        'bmp': '\uAA00-\uAA5F'
    },
    {
        'name': 'InCherokee',
        'bmp': '\u13A0-\u13FF'
    },
    {
        'name': 'InCherokee_Supplement',
        'bmp': '\uAB70-\uABBF'
    },
    {
        'name': 'InChess_Symbols',
        'astral': '\uD83E[\uDE00-\uDE6F]'
    },
    {
        'name': 'InCombining_Diacritical_Marks',
        'bmp': '\u0300-\u036F'
    },
    {
        'name': 'InCombining_Diacritical_Marks_Extended',
        'bmp': '\u1AB0-\u1AFF'
    },
    {
        'name': 'InCombining_Diacritical_Marks_For_Symbols',
        'bmp': '\u20D0-\u20FF'
    },
    {
        'name': 'InCombining_Diacritical_Marks_Supplement',
        'bmp': '\u1DC0-\u1DFF'
    },
    {
        'name': 'InCombining_Half_Marks',
        'bmp': '\uFE20-\uFE2F'
    },
    {
        'name': 'InCommon_Indic_Number_Forms',
        'bmp': '\uA830-\uA83F'
    },
    {
        'name': 'InControl_Pictures',
        'bmp': '\u2400-\u243F'
    },
    {
        'name': 'InCoptic',
        'bmp': '\u2C80-\u2CFF'
    },
    {
        'name': 'InCoptic_Epact_Numbers',
        'astral': '\uD800[\uDEE0-\uDEFF]'
    },
    {
        'name': 'InCounting_Rod_Numerals',
        'astral': '\uD834[\uDF60-\uDF7F]'
    },
    {
        'name': 'InCuneiform',
        'astral': '\uD808[\uDC00-\uDFFF]'
    },
    {
        'name': 'InCuneiform_Numbers_And_Punctuation',
        'astral': '\uD809[\uDC00-\uDC7F]'
    },
    {
        'name': 'InCurrency_Symbols',
        'bmp': '\u20A0-\u20CF'
    },
    {
        'name': 'InCypriot_Syllabary',
        'astral': '\uD802[\uDC00-\uDC3F]'
    },
    {
        'name': 'InCyrillic',
        'bmp': '\u0400-\u04FF'
    },
    {
        'name': 'InCyrillic_Extended_A',
        'bmp': '\u2DE0-\u2DFF'
    },
    {
        'name': 'InCyrillic_Extended_B',
        'bmp': '\uA640-\uA69F'
    },
    {
        'name': 'InCyrillic_Extended_C',
        'bmp': '\u1C80-\u1C8F'
    },
    {
        'name': 'InCyrillic_Supplement',
        'bmp': '\u0500-\u052F'
    },
    {
        'name': 'InDeseret',
        'astral': '\uD801[\uDC00-\uDC4F]'
    },
    {
        'name': 'InDevanagari',
        'bmp': '\u0900-\u097F'
    },
    {
        'name': 'InDevanagari_Extended',
        'bmp': '\uA8E0-\uA8FF'
    },
    {
        'name': 'InDingbats',
        'bmp': '\u2700-\u27BF'
    },
    {
        'name': 'InDogra',
        'astral': '\uD806[\uDC00-\uDC4F]'
    },
    {
        'name': 'InDomino_Tiles',
        'astral': '\uD83C[\uDC30-\uDC9F]'
    },
    {
        'name': 'InDuployan',
        'astral': '\uD82F[\uDC00-\uDC9F]'
    },
    {
        'name': 'InEarly_Dynastic_Cuneiform',
        'astral': '\uD809[\uDC80-\uDD4F]'
    },
    {
        'name': 'InEgyptian_Hieroglyphs',
        'astral': '\uD80C[\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F]'
    },
    {
        'name': 'InElbasan',
        'astral': '\uD801[\uDD00-\uDD2F]'
    },
    {
        'name': 'InEmoticons',
        'astral': '\uD83D[\uDE00-\uDE4F]'
    },
    {
        'name': 'InEnclosed_Alphanumeric_Supplement',
        'astral': '\uD83C[\uDD00-\uDDFF]'
    },
    {
        'name': 'InEnclosed_Alphanumerics',
        'bmp': '\u2460-\u24FF'
    },
    {
        'name': 'InEnclosed_CJK_Letters_And_Months',
        'bmp': '\u3200-\u32FF'
    },
    {
        'name': 'InEnclosed_Ideographic_Supplement',
        'astral': '\uD83C[\uDE00-\uDEFF]'
    },
    {
        'name': 'InEthiopic',
        'bmp': '\u1200-\u137F'
    },
    {
        'name': 'InEthiopic_Extended',
        'bmp': '\u2D80-\u2DDF'
    },
    {
        'name': 'InEthiopic_Extended_A',
        'bmp': '\uAB00-\uAB2F'
    },
    {
        'name': 'InEthiopic_Supplement',
        'bmp': '\u1380-\u139F'
    },
    {
        'name': 'InGeneral_Punctuation',
        'bmp': '\u2000-\u206F'
    },
    {
        'name': 'InGeometric_Shapes',
        'bmp': '\u25A0-\u25FF'
    },
    {
        'name': 'InGeometric_Shapes_Extended',
        'astral': '\uD83D[\uDF80-\uDFFF]'
    },
    {
        'name': 'InGeorgian',
        'bmp': '\u10A0-\u10FF'
    },
    {
        'name': 'InGeorgian_Extended',
        'bmp': '\u1C90-\u1CBF'
    },
    {
        'name': 'InGeorgian_Supplement',
        'bmp': '\u2D00-\u2D2F'
    },
    {
        'name': 'InGlagolitic',
        'bmp': '\u2C00-\u2C5F'
    },
    {
        'name': 'InGlagolitic_Supplement',
        'astral': '\uD838[\uDC00-\uDC2F]'
    },
    {
        'name': 'InGothic',
        'astral': '\uD800[\uDF30-\uDF4F]'
    },
    {
        'name': 'InGrantha',
        'astral': '\uD804[\uDF00-\uDF7F]'
    },
    {
        'name': 'InGreek_And_Coptic',
        'bmp': '\u0370-\u03FF'
    },
    {
        'name': 'InGreek_Extended',
        'bmp': '\u1F00-\u1FFF'
    },
    {
        'name': 'InGujarati',
        'bmp': '\u0A80-\u0AFF'
    },
    {
        'name': 'InGunjala_Gondi',
        'astral': '\uD807[\uDD60-\uDDAF]'
    },
    {
        'name': 'InGurmukhi',
        'bmp': '\u0A00-\u0A7F'
    },
    {
        'name': 'InHalfwidth_And_Fullwidth_Forms',
        'bmp': '\uFF00-\uFFEF'
    },
    {
        'name': 'InHangul_Compatibility_Jamo',
        'bmp': '\u3130-\u318F'
    },
    {
        'name': 'InHangul_Jamo',
        'bmp': '\u1100-\u11FF'
    },
    {
        'name': 'InHangul_Jamo_Extended_A',
        'bmp': '\uA960-\uA97F'
    },
    {
        'name': 'InHangul_Jamo_Extended_B',
        'bmp': '\uD7B0-\uD7FF'
    },
    {
        'name': 'InHangul_Syllables',
        'bmp': '\uAC00-\uD7AF'
    },
    {
        'name': 'InHanifi_Rohingya',
        'astral': '\uD803[\uDD00-\uDD3F]'
    },
    {
        'name': 'InHanunoo',
        'bmp': '\u1720-\u173F'
    },
    {
        'name': 'InHatran',
        'astral': '\uD802[\uDCE0-\uDCFF]'
    },
    {
        'name': 'InHebrew',
        'bmp': '\u0590-\u05FF'
    },
    {
        'name': 'InHigh_Private_Use_Surrogates',
        'bmp': '\uDB80-\uDBFF'
    },
    {
        'name': 'InHigh_Surrogates',
        'bmp': '\uD800-\uDB7F'
    },
    {
        'name': 'InHiragana',
        'bmp': '\u3040-\u309F'
    },
    {
        'name': 'InIPA_Extensions',
        'bmp': '\u0250-\u02AF'
    },
    {
        'name': 'InIdeographic_Description_Characters',
        'bmp': '\u2FF0-\u2FFF'
    },
    {
        'name': 'InIdeographic_Symbols_And_Punctuation',
        'astral': '\uD81B[\uDFE0-\uDFFF]'
    },
    {
        'name': 'InImperial_Aramaic',
        'astral': '\uD802[\uDC40-\uDC5F]'
    },
    {
        'name': 'InIndic_Siyaq_Numbers',
        'astral': '\uD83B[\uDC70-\uDCBF]'
    },
    {
        'name': 'InInscriptional_Pahlavi',
        'astral': '\uD802[\uDF60-\uDF7F]'
    },
    {
        'name': 'InInscriptional_Parthian',
        'astral': '\uD802[\uDF40-\uDF5F]'
    },
    {
        'name': 'InJavanese',
        'bmp': '\uA980-\uA9DF'
    },
    {
        'name': 'InKaithi',
        'astral': '\uD804[\uDC80-\uDCCF]'
    },
    {
        'name': 'InKana_Extended_A',
        'astral': '\uD82C[\uDD00-\uDD2F]'
    },
    {
        'name': 'InKana_Supplement',
        'astral': '\uD82C[\uDC00-\uDCFF]'
    },
    {
        'name': 'InKanbun',
        'bmp': '\u3190-\u319F'
    },
    {
        'name': 'InKangxi_Radicals',
        'bmp': '\u2F00-\u2FDF'
    },
    {
        'name': 'InKannada',
        'bmp': '\u0C80-\u0CFF'
    },
    {
        'name': 'InKatakana',
        'bmp': '\u30A0-\u30FF'
    },
    {
        'name': 'InKatakana_Phonetic_Extensions',
        'bmp': '\u31F0-\u31FF'
    },
    {
        'name': 'InKayah_Li',
        'bmp': '\uA900-\uA92F'
    },
    {
        'name': 'InKharoshthi',
        'astral': '\uD802[\uDE00-\uDE5F]'
    },
    {
        'name': 'InKhmer',
        'bmp': '\u1780-\u17FF'
    },
    {
        'name': 'InKhmer_Symbols',
        'bmp': '\u19E0-\u19FF'
    },
    {
        'name': 'InKhojki',
        'astral': '\uD804[\uDE00-\uDE4F]'
    },
    {
        'name': 'InKhudawadi',
        'astral': '\uD804[\uDEB0-\uDEFF]'
    },
    {
        'name': 'InLao',
        'bmp': '\u0E80-\u0EFF'
    },
    {
        'name': 'InLatin_1_Supplement',
        'bmp': '\x80-\xFF'
    },
    {
        'name': 'InLatin_Extended_A',
        'bmp': '\u0100-\u017F'
    },
    {
        'name': 'InLatin_Extended_Additional',
        'bmp': '\u1E00-\u1EFF'
    },
    {
        'name': 'InLatin_Extended_B',
        'bmp': '\u0180-\u024F'
    },
    {
        'name': 'InLatin_Extended_C',
        'bmp': '\u2C60-\u2C7F'
    },
    {
        'name': 'InLatin_Extended_D',
        'bmp': '\uA720-\uA7FF'
    },
    {
        'name': 'InLatin_Extended_E',
        'bmp': '\uAB30-\uAB6F'
    },
    {
        'name': 'InLepcha',
        'bmp': '\u1C00-\u1C4F'
    },
    {
        'name': 'InLetterlike_Symbols',
        'bmp': '\u2100-\u214F'
    },
    {
        'name': 'InLimbu',
        'bmp': '\u1900-\u194F'
    },
    {
        'name': 'InLinear_A',
        'astral': '\uD801[\uDE00-\uDF7F]'
    },
    {
        'name': 'InLinear_B_Ideograms',
        'astral': '\uD800[\uDC80-\uDCFF]'
    },
    {
        'name': 'InLinear_B_Syllabary',
        'astral': '\uD800[\uDC00-\uDC7F]'
    },
    {
        'name': 'InLisu',
        'bmp': '\uA4D0-\uA4FF'
    },
    {
        'name': 'InLow_Surrogates',
        'bmp': '\uDC00-\uDFFF'
    },
    {
        'name': 'InLycian',
        'astral': '\uD800[\uDE80-\uDE9F]'
    },
    {
        'name': 'InLydian',
        'astral': '\uD802[\uDD20-\uDD3F]'
    },
    {
        'name': 'InMahajani',
        'astral': '\uD804[\uDD50-\uDD7F]'
    },
    {
        'name': 'InMahjong_Tiles',
        'astral': '\uD83C[\uDC00-\uDC2F]'
    },
    {
        'name': 'InMakasar',
        'astral': '\uD807[\uDEE0-\uDEFF]'
    },
    {
        'name': 'InMalayalam',
        'bmp': '\u0D00-\u0D7F'
    },
    {
        'name': 'InMandaic',
        'bmp': '\u0840-\u085F'
    },
    {
        'name': 'InManichaean',
        'astral': '\uD802[\uDEC0-\uDEFF]'
    },
    {
        'name': 'InMarchen',
        'astral': '\uD807[\uDC70-\uDCBF]'
    },
    {
        'name': 'InMasaram_Gondi',
        'astral': '\uD807[\uDD00-\uDD5F]'
    },
    {
        'name': 'InMathematical_Alphanumeric_Symbols',
        'astral': '\uD835[\uDC00-\uDFFF]'
    },
    {
        'name': 'InMathematical_Operators',
        'bmp': '\u2200-\u22FF'
    },
    {
        'name': 'InMayan_Numerals',
        'astral': '\uD834[\uDEE0-\uDEFF]'
    },
    {
        'name': 'InMedefaidrin',
        'astral': '\uD81B[\uDE40-\uDE9F]'
    },
    {
        'name': 'InMeetei_Mayek',
        'bmp': '\uABC0-\uABFF'
    },
    {
        'name': 'InMeetei_Mayek_Extensions',
        'bmp': '\uAAE0-\uAAFF'
    },
    {
        'name': 'InMende_Kikakui',
        'astral': '\uD83A[\uDC00-\uDCDF]'
    },
    {
        'name': 'InMeroitic_Cursive',
        'astral': '\uD802[\uDDA0-\uDDFF]'
    },
    {
        'name': 'InMeroitic_Hieroglyphs',
        'astral': '\uD802[\uDD80-\uDD9F]'
    },
    {
        'name': 'InMiao',
        'astral': '\uD81B[\uDF00-\uDF9F]'
    },
    {
        'name': 'InMiscellaneous_Mathematical_Symbols_A',
        'bmp': '\u27C0-\u27EF'
    },
    {
        'name': 'InMiscellaneous_Mathematical_Symbols_B',
        'bmp': '\u2980-\u29FF'
    },
    {
        'name': 'InMiscellaneous_Symbols',
        'bmp': '\u2600-\u26FF'
    },
    {
        'name': 'InMiscellaneous_Symbols_And_Arrows',
        'bmp': '\u2B00-\u2BFF'
    },
    {
        'name': 'InMiscellaneous_Symbols_And_Pictographs',
        'astral': '\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]'
    },
    {
        'name': 'InMiscellaneous_Technical',
        'bmp': '\u2300-\u23FF'
    },
    {
        'name': 'InModi',
        'astral': '\uD805[\uDE00-\uDE5F]'
    },
    {
        'name': 'InModifier_Tone_Letters',
        'bmp': '\uA700-\uA71F'
    },
    {
        'name': 'InMongolian',
        'bmp': '\u1800-\u18AF'
    },
    {
        'name': 'InMongolian_Supplement',
        'astral': '\uD805[\uDE60-\uDE7F]'
    },
    {
        'name': 'InMro',
        'astral': '\uD81A[\uDE40-\uDE6F]'
    },
    {
        'name': 'InMultani',
        'astral': '\uD804[\uDE80-\uDEAF]'
    },
    {
        'name': 'InMusical_Symbols',
        'astral': '\uD834[\uDD00-\uDDFF]'
    },
    {
        'name': 'InMyanmar',
        'bmp': '\u1000-\u109F'
    },
    {
        'name': 'InMyanmar_Extended_A',
        'bmp': '\uAA60-\uAA7F'
    },
    {
        'name': 'InMyanmar_Extended_B',
        'bmp': '\uA9E0-\uA9FF'
    },
    {
        'name': 'InNKo',
        'bmp': '\u07C0-\u07FF'
    },
    {
        'name': 'InNabataean',
        'astral': '\uD802[\uDC80-\uDCAF]'
    },
    {
        'name': 'InNew_Tai_Lue',
        'bmp': '\u1980-\u19DF'
    },
    {
        'name': 'InNewa',
        'astral': '\uD805[\uDC00-\uDC7F]'
    },
    {
        'name': 'InNumber_Forms',
        'bmp': '\u2150-\u218F'
    },
    {
        'name': 'InNushu',
        'astral': '\uD82C[\uDD70-\uDEFF]'
    },
    {
        'name': 'InOgham',
        'bmp': '\u1680-\u169F'
    },
    {
        'name': 'InOl_Chiki',
        'bmp': '\u1C50-\u1C7F'
    },
    {
        'name': 'InOld_Hungarian',
        'astral': '\uD803[\uDC80-\uDCFF]'
    },
    {
        'name': 'InOld_Italic',
        'astral': '\uD800[\uDF00-\uDF2F]'
    },
    {
        'name': 'InOld_North_Arabian',
        'astral': '\uD802[\uDE80-\uDE9F]'
    },
    {
        'name': 'InOld_Permic',
        'astral': '\uD800[\uDF50-\uDF7F]'
    },
    {
        'name': 'InOld_Persian',
        'astral': '\uD800[\uDFA0-\uDFDF]'
    },
    {
        'name': 'InOld_Sogdian',
        'astral': '\uD803[\uDF00-\uDF2F]'
    },
    {
        'name': 'InOld_South_Arabian',
        'astral': '\uD802[\uDE60-\uDE7F]'
    },
    {
        'name': 'InOld_Turkic',
        'astral': '\uD803[\uDC00-\uDC4F]'
    },
    {
        'name': 'InOptical_Character_Recognition',
        'bmp': '\u2440-\u245F'
    },
    {
        'name': 'InOriya',
        'bmp': '\u0B00-\u0B7F'
    },
    {
        'name': 'InOrnamental_Dingbats',
        'astral': '\uD83D[\uDE50-\uDE7F]'
    },
    {
        'name': 'InOsage',
        'astral': '\uD801[\uDCB0-\uDCFF]'
    },
    {
        'name': 'InOsmanya',
        'astral': '\uD801[\uDC80-\uDCAF]'
    },
    {
        'name': 'InPahawh_Hmong',
        'astral': '\uD81A[\uDF00-\uDF8F]'
    },
    {
        'name': 'InPalmyrene',
        'astral': '\uD802[\uDC60-\uDC7F]'
    },
    {
        'name': 'InPau_Cin_Hau',
        'astral': '\uD806[\uDEC0-\uDEFF]'
    },
    {
        'name': 'InPhags_Pa',
        'bmp': '\uA840-\uA87F'
    },
    {
        'name': 'InPhaistos_Disc',
        'astral': '\uD800[\uDDD0-\uDDFF]'
    },
    {
        'name': 'InPhoenician',
        'astral': '\uD802[\uDD00-\uDD1F]'
    },
    {
        'name': 'InPhonetic_Extensions',
        'bmp': '\u1D00-\u1D7F'
    },
    {
        'name': 'InPhonetic_Extensions_Supplement',
        'bmp': '\u1D80-\u1DBF'
    },
    {
        'name': 'InPlaying_Cards',
        'astral': '\uD83C[\uDCA0-\uDCFF]'
    },
    {
        'name': 'InPrivate_Use_Area',
        'bmp': '\uE000-\uF8FF'
    },
    {
        'name': 'InPsalter_Pahlavi',
        'astral': '\uD802[\uDF80-\uDFAF]'
    },
    {
        'name': 'InRejang',
        'bmp': '\uA930-\uA95F'
    },
    {
        'name': 'InRumi_Numeral_Symbols',
        'astral': '\uD803[\uDE60-\uDE7F]'
    },
    {
        'name': 'InRunic',
        'bmp': '\u16A0-\u16FF'
    },
    {
        'name': 'InSamaritan',
        'bmp': '\u0800-\u083F'
    },
    {
        'name': 'InSaurashtra',
        'bmp': '\uA880-\uA8DF'
    },
    {
        'name': 'InSharada',
        'astral': '\uD804[\uDD80-\uDDDF]'
    },
    {
        'name': 'InShavian',
        'astral': '\uD801[\uDC50-\uDC7F]'
    },
    {
        'name': 'InShorthand_Format_Controls',
        'astral': '\uD82F[\uDCA0-\uDCAF]'
    },
    {
        'name': 'InSiddham',
        'astral': '\uD805[\uDD80-\uDDFF]'
    },
    {
        'name': 'InSinhala',
        'bmp': '\u0D80-\u0DFF'
    },
    {
        'name': 'InSinhala_Archaic_Numbers',
        'astral': '\uD804[\uDDE0-\uDDFF]'
    },
    {
        'name': 'InSmall_Form_Variants',
        'bmp': '\uFE50-\uFE6F'
    },
    {
        'name': 'InSogdian',
        'astral': '\uD803[\uDF30-\uDF6F]'
    },
    {
        'name': 'InSora_Sompeng',
        'astral': '\uD804[\uDCD0-\uDCFF]'
    },
    {
        'name': 'InSoyombo',
        'astral': '\uD806[\uDE50-\uDEAF]'
    },
    {
        'name': 'InSpacing_Modifier_Letters',
        'bmp': '\u02B0-\u02FF'
    },
    {
        'name': 'InSpecials',
        'bmp': '\uFFF0-\uFFFF'
    },
    {
        'name': 'InSundanese',
        'bmp': '\u1B80-\u1BBF'
    },
    {
        'name': 'InSundanese_Supplement',
        'bmp': '\u1CC0-\u1CCF'
    },
    {
        'name': 'InSuperscripts_And_Subscripts',
        'bmp': '\u2070-\u209F'
    },
    {
        'name': 'InSupplemental_Arrows_A',
        'bmp': '\u27F0-\u27FF'
    },
    {
        'name': 'InSupplemental_Arrows_B',
        'bmp': '\u2900-\u297F'
    },
    {
        'name': 'InSupplemental_Arrows_C',
        'astral': '\uD83E[\uDC00-\uDCFF]'
    },
    {
        'name': 'InSupplemental_Mathematical_Operators',
        'bmp': '\u2A00-\u2AFF'
    },
    {
        'name': 'InSupplemental_Punctuation',
        'bmp': '\u2E00-\u2E7F'
    },
    {
        'name': 'InSupplemental_Symbols_And_Pictographs',
        'astral': '\uD83E[\uDD00-\uDDFF]'
    },
    {
        'name': 'InSupplementary_Private_Use_Area_A',
        'astral': '[\uDB80-\uDBBF][\uDC00-\uDFFF]'
    },
    {
        'name': 'InSupplementary_Private_Use_Area_B',
        'astral': '[\uDBC0-\uDBFF][\uDC00-\uDFFF]'
    },
    {
        'name': 'InSutton_SignWriting',
        'astral': '\uD836[\uDC00-\uDEAF]'
    },
    {
        'name': 'InSyloti_Nagri',
        'bmp': '\uA800-\uA82F'
    },
    {
        'name': 'InSyriac',
        'bmp': '\u0700-\u074F'
    },
    {
        'name': 'InSyriac_Supplement',
        'bmp': '\u0860-\u086F'
    },
    {
        'name': 'InTagalog',
        'bmp': '\u1700-\u171F'
    },
    {
        'name': 'InTagbanwa',
        'bmp': '\u1760-\u177F'
    },
    {
        'name': 'InTags',
        'astral': '\uDB40[\uDC00-\uDC7F]'
    },
    {
        'name': 'InTai_Le',
        'bmp': '\u1950-\u197F'
    },
    {
        'name': 'InTai_Tham',
        'bmp': '\u1A20-\u1AAF'
    },
    {
        'name': 'InTai_Viet',
        'bmp': '\uAA80-\uAADF'
    },
    {
        'name': 'InTai_Xuan_Jing_Symbols',
        'astral': '\uD834[\uDF00-\uDF5F]'
    },
    {
        'name': 'InTakri',
        'astral': '\uD805[\uDE80-\uDECF]'
    },
    {
        'name': 'InTamil',
        'bmp': '\u0B80-\u0BFF'
    },
    {
        'name': 'InTangut',
        'astral': '[\uD81C-\uD821][\uDC00-\uDFFF]'
    },
    {
        'name': 'InTangut_Components',
        'astral': '\uD822[\uDC00-\uDEFF]'
    },
    {
        'name': 'InTelugu',
        'bmp': '\u0C00-\u0C7F'
    },
    {
        'name': 'InThaana',
        'bmp': '\u0780-\u07BF'
    },
    {
        'name': 'InThai',
        'bmp': '\u0E00-\u0E7F'
    },
    {
        'name': 'InTibetan',
        'bmp': '\u0F00-\u0FFF'
    },
    {
        'name': 'InTifinagh',
        'bmp': '\u2D30-\u2D7F'
    },
    {
        'name': 'InTirhuta',
        'astral': '\uD805[\uDC80-\uDCDF]'
    },
    {
        'name': 'InTransport_And_Map_Symbols',
        'astral': '\uD83D[\uDE80-\uDEFF]'
    },
    {
        'name': 'InUgaritic',
        'astral': '\uD800[\uDF80-\uDF9F]'
    },
    {
        'name': 'InUnified_Canadian_Aboriginal_Syllabics',
        'bmp': '\u1400-\u167F'
    },
    {
        'name': 'InUnified_Canadian_Aboriginal_Syllabics_Extended',
        'bmp': '\u18B0-\u18FF'
    },
    {
        'name': 'InVai',
        'bmp': '\uA500-\uA63F'
    },
    {
        'name': 'InVariation_Selectors',
        'bmp': '\uFE00-\uFE0F'
    },
    {
        'name': 'InVariation_Selectors_Supplement',
        'astral': '\uDB40[\uDD00-\uDDEF]'
    },
    {
        'name': 'InVedic_Extensions',
        'bmp': '\u1CD0-\u1CFF'
    },
    {
        'name': 'InVertical_Forms',
        'bmp': '\uFE10-\uFE1F'
    },
    {
        'name': 'InWarang_Citi',
        'astral': '\uD806[\uDCA0-\uDCFF]'
    },
    {
        'name': 'InYi_Radicals',
        'bmp': '\uA490-\uA4CF'
    },
    {
        'name': 'InYi_Syllables',
        'bmp': '\uA000-\uA48F'
    },
    {
        'name': 'InYijing_Hexagram_Symbols',
        'bmp': '\u4DC0-\u4DFF'
    },
    {
        'name': 'InZanabazar_Square',
        'astral': '\uD806[\uDE00-\uDE4F]'
    }
];

var unicodeBlocks = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _blocks = _interopRequireDefault(blocks);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * XRegExp Unicode Blocks 4.2.0
 * <xregexp.com>
 * Steven Levithan (c) 2010-present MIT License
 * Unicode data by Mathias Bynens <mathiasbynens.be>
 */
var _default = function _default(XRegExp) {
  /**
   * Adds support for all Unicode blocks. Block names use the prefix 'In'. E.g.,
   * `\p{InBasicLatin}`. Token names are case insensitive, and any spaces, hyphens, and
   * underscores are ignored.
   *
   * Uses Unicode 11.0.0.
   *
   * @requires XRegExp, Unicode Base
   */
  if (!XRegExp.addUnicodeData) {
    throw new ReferenceError('Unicode Base must be loaded before Unicode Blocks');
  }

  XRegExp.addUnicodeData(_blocks.default);
};

exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(unicodeBlocks);

var categories = [
    {
        'name': 'C',
        'alias': 'Other',
        'isBmpLast': true,
        'bmp': '\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0530\u0557\u0558\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EE\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB\u07FC\u082E\u082F\u083F\u085C\u085D\u085F\u086B-\u089F\u08B5\u08BE-\u08D2\u08E2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A77-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D04\u0D0D\u0D11\u0D45\u0D49\u0D50-\u0D53\u0D64\u0D65\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180E\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1ABF-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C89-\u1C8F\u1CBB\u1CBC\u1CC8-\u1CCF\u1CFA-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20C0-\u20CF\u20F1-\u20FF\u218C-\u218F\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2B97\u2BC9\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E4F-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FF0-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA6F8-\uA6FF\uA7BA-\uA7F6\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C6-\uA8CD\uA8DA-\uA8DF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB66-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF',
        'astral': '\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDCFF\uDD03-\uDD06\uDD34-\uDD36\uDD8F\uDD9C-\uDD9F\uDDA1-\uDDCF\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEFC-\uDEFF\uDF24-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDFC4-\uDFC7\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6E\uDD70-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56\uDC9F-\uDCA6\uDCB0-\uDCDF\uDCF3\uDCF6-\uDCFA\uDD1C-\uDD1E\uDD3A-\uDD3E\uDD40-\uDD7F\uDDB8-\uDDBB\uDDD0\uDDD1\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE49-\uDE4F\uDE59-\uDE5F\uDEA0-\uDEBF\uDEE7-\uDEEA\uDEF7-\uDEFF\uDF36-\uDF38\uDF56\uDF57\uDF73-\uDF77\uDF92-\uDF98\uDF9D-\uDFA8\uDFB0-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCF9\uDD28-\uDD2F\uDD3A-\uDE5F\uDE7F-\uDEFF\uDF28-\uDF2F\uDF5A-\uDFFF]|\uD804[\uDC4E-\uDC51\uDC70-\uDC7E\uDCBD\uDCC2-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD47-\uDD4F\uDD77-\uDD7F\uDDCE\uDDCF\uDDE0\uDDF5-\uDDFF\uDE12\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEAA-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC5A\uDC5C\uDC5F-\uDC7F\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDDE-\uDDFF\uDE45-\uDE4F\uDE5A-\uDE5F\uDE6D-\uDE7F\uDEB8-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF40-\uDFFF]|\uD806[\uDC3C-\uDC9F\uDCF3-\uDCFE\uDD00-\uDDFF\uDE48-\uDE4F\uDE84\uDE85\uDEA3-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC46-\uDC4F\uDC6D-\uDC6F\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF9-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F\uDC75-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD823-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83F\uD87B-\uD87D\uD87F-\uDB3F\uDB41-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDE6D\uDE70-\uDECF\uDEEE\uDEEF\uDEF6-\uDEFF\uDF46-\uDF4F\uDF5A\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE9B-\uDEFF\uDF45-\uDF4F\uDF7F-\uDF8E\uDFA0-\uDFDF\uDFE2-\uDFFF]|\uD821[\uDFF2-\uDFFF]|\uD822[\uDEF3-\uDFFF]|\uD82C[\uDD1F-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A\uDC9B\uDCA0-\uDFFF]|\uD834[\uDCF6-\uDCFF\uDD27\uDD28\uDD73-\uDD7A\uDDE9-\uDDFF\uDE46-\uDEDF\uDEF4-\uDEFF\uDF57-\uDF5F\uDF79-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]|\uD836[\uDE8C-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDFFF]|\uD83A[\uDCC5\uDCC6\uDCD7-\uDCFF\uDD4B-\uDD4F\uDD5A-\uDD5D\uDD60-\uDFFF]|\uD83B[\uDC00-\uDC70\uDCB5-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDEEF\uDEF2-\uDFFF]|\uD83C[\uDC2C-\uDC2F\uDC94-\uDC9F\uDCAF\uDCB0\uDCC0\uDCD0\uDCF6-\uDCFF\uDD0D-\uDD0F\uDD6C-\uDD6F\uDDAD-\uDDE5\uDE03-\uDE0F\uDE3C-\uDE3F\uDE49-\uDE4F\uDE52-\uDE5F\uDE66-\uDEFF]|\uD83D[\uDED5-\uDEDF\uDEED-\uDEEF\uDEFA-\uDEFF\uDF74-\uDF7F\uDFD9-\uDFFF]|\uD83E[\uDC0C-\uDC0F\uDC48-\uDC4F\uDC5A-\uDC5F\uDC88-\uDC8F\uDCAE-\uDCFF\uDD0C-\uDD0F\uDD3F\uDD71\uDD72\uDD77-\uDD79\uDD7B\uDDA3-\uDDAF\uDDBA-\uDDBF\uDDC3-\uDDCF\uDE00-\uDE5F\uDE6E-\uDFFF]|\uD869[\uDED7-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uDB40[\uDC00-\uDCFF\uDDF0-\uDFFF]'
    },
    {
        'name': 'Cc',
        'alias': 'Control',
        'bmp': '\0-\x1F\x7F-\x9F'
    },
    {
        'name': 'Cf',
        'alias': 'Format',
        'bmp': '\xAD\u0600-\u0605\u061C\u06DD\u070F\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB',
        'astral': '\uD804[\uDCBD\uDCCD]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]'
    },
    {
        'name': 'Cn',
        'alias': 'Unassigned',
        'bmp': '\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0530\u0557\u0558\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EE\u05F5-\u05FF\u061D\u070E\u074B\u074C\u07B2-\u07BF\u07FB\u07FC\u082E\u082F\u083F\u085C\u085D\u085F\u086B-\u089F\u08B5\u08BE-\u08D2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A77-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D04\u0D0D\u0D11\u0D45\u0D49\u0D50-\u0D53\u0D64\u0D65\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1ABF-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C89-\u1C8F\u1CBB\u1CBC\u1CC8-\u1CCF\u1CFA-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u2065\u2072\u2073\u208F\u209D-\u209F\u20C0-\u20CF\u20F1-\u20FF\u218C-\u218F\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2B97\u2BC9\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E4F-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FF0-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA6F8-\uA6FF\uA7BA-\uA7F6\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C6-\uA8CD\uA8DA-\uA8DF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB66-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD\uFEFE\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFF8\uFFFE\uFFFF',
        'astral': '\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDCFF\uDD03-\uDD06\uDD34-\uDD36\uDD8F\uDD9C-\uDD9F\uDDA1-\uDDCF\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEFC-\uDEFF\uDF24-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDFC4-\uDFC7\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6E\uDD70-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56\uDC9F-\uDCA6\uDCB0-\uDCDF\uDCF3\uDCF6-\uDCFA\uDD1C-\uDD1E\uDD3A-\uDD3E\uDD40-\uDD7F\uDDB8-\uDDBB\uDDD0\uDDD1\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE49-\uDE4F\uDE59-\uDE5F\uDEA0-\uDEBF\uDEE7-\uDEEA\uDEF7-\uDEFF\uDF36-\uDF38\uDF56\uDF57\uDF73-\uDF77\uDF92-\uDF98\uDF9D-\uDFA8\uDFB0-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCF9\uDD28-\uDD2F\uDD3A-\uDE5F\uDE7F-\uDEFF\uDF28-\uDF2F\uDF5A-\uDFFF]|\uD804[\uDC4E-\uDC51\uDC70-\uDC7E\uDCC2-\uDCCC\uDCCE\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD47-\uDD4F\uDD77-\uDD7F\uDDCE\uDDCF\uDDE0\uDDF5-\uDDFF\uDE12\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEAA-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC5A\uDC5C\uDC5F-\uDC7F\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDDE-\uDDFF\uDE45-\uDE4F\uDE5A-\uDE5F\uDE6D-\uDE7F\uDEB8-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF40-\uDFFF]|\uD806[\uDC3C-\uDC9F\uDCF3-\uDCFE\uDD00-\uDDFF\uDE48-\uDE4F\uDE84\uDE85\uDEA3-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC46-\uDC4F\uDC6D-\uDC6F\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF9-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F\uDC75-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD823-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83F\uD87B-\uD87D\uD87F-\uDB3F\uDB41-\uDB7F][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDE6D\uDE70-\uDECF\uDEEE\uDEEF\uDEF6-\uDEFF\uDF46-\uDF4F\uDF5A\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE9B-\uDEFF\uDF45-\uDF4F\uDF7F-\uDF8E\uDFA0-\uDFDF\uDFE2-\uDFFF]|\uD821[\uDFF2-\uDFFF]|\uD822[\uDEF3-\uDFFF]|\uD82C[\uDD1F-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A\uDC9B\uDCA4-\uDFFF]|\uD834[\uDCF6-\uDCFF\uDD27\uDD28\uDDE9-\uDDFF\uDE46-\uDEDF\uDEF4-\uDEFF\uDF57-\uDF5F\uDF79-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]|\uD836[\uDE8C-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDFFF]|\uD83A[\uDCC5\uDCC6\uDCD7-\uDCFF\uDD4B-\uDD4F\uDD5A-\uDD5D\uDD60-\uDFFF]|\uD83B[\uDC00-\uDC70\uDCB5-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDEEF\uDEF2-\uDFFF]|\uD83C[\uDC2C-\uDC2F\uDC94-\uDC9F\uDCAF\uDCB0\uDCC0\uDCD0\uDCF6-\uDCFF\uDD0D-\uDD0F\uDD6C-\uDD6F\uDDAD-\uDDE5\uDE03-\uDE0F\uDE3C-\uDE3F\uDE49-\uDE4F\uDE52-\uDE5F\uDE66-\uDEFF]|\uD83D[\uDED5-\uDEDF\uDEED-\uDEEF\uDEFA-\uDEFF\uDF74-\uDF7F\uDFD9-\uDFFF]|\uD83E[\uDC0C-\uDC0F\uDC48-\uDC4F\uDC5A-\uDC5F\uDC88-\uDC8F\uDCAE-\uDCFF\uDD0C-\uDD0F\uDD3F\uDD71\uDD72\uDD77-\uDD79\uDD7B\uDDA3-\uDDAF\uDDBA-\uDDBF\uDDC3-\uDDCF\uDE00-\uDE5F\uDE6E-\uDFFF]|\uD869[\uDED7-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uDB40[\uDC00\uDC02-\uDC1F\uDC80-\uDCFF\uDDF0-\uDFFF]|[\uDBBF\uDBFF][\uDFFE\uDFFF]'
    },
    {
        'name': 'Co',
        'alias': 'Private_Use',
        'bmp': '\uE000-\uF8FF',
        'astral': '[\uDB80-\uDBBE\uDBC0-\uDBFE][\uDC00-\uDFFF]|[\uDBBF\uDBFF][\uDC00-\uDFFD]'
    },
    {
        'name': 'Cs',
        'alias': 'Surrogate',
        'bmp': '\uD800-\uDFFF'
    },
    {
        'name': 'L',
        'alias': 'Letter',
        'bmp': 'A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7B9\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC',
        'astral': '\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDF00-\uDF1C\uDF27\uDF30-\uDF45]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFF1]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]'
    },
    {
        'name': 'LC',
        'alias': 'Cased_Letter',
        'bmp': 'A-Za-z\xB5\xC0-\xD6\xD8-\xF6\xF8-\u01BA\u01BC-\u01BF\u01C4-\u0293\u0295-\u02AF\u0370-\u0373\u0376\u0377\u037B-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0560-\u0588\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FD-\u10FF\u13A0-\u13F5\u13F8-\u13FD\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2134\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2C7B\u2C7E-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA640-\uA66D\uA680-\uA69B\uA722-\uA76F\uA771-\uA787\uA78B-\uA78E\uA790-\uA7B9\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF21-\uFF3A\uFF41-\uFF5A',
        'astral': '\uD801[\uDC00-\uDC4F\uDCB0-\uDCD3\uDCD8-\uDCFB]|\uD803[\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD806[\uDCA0-\uDCDF]|\uD81B[\uDE40-\uDE7F]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDD00-\uDD43]'
    },
    {
        'name': 'Ll',
        'alias': 'Lowercase_Letter',
        'bmp': 'a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A',
        'astral': '\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD83A[\uDD22-\uDD43]'
    },
    {
        'name': 'Lm',
        'alias': 'Modifier_Letter',
        'bmp': '\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5\u06E6\u07F4\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C\uA69D\uA717-\uA71F\uA770\uA788\uA7F8\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E\uFF9F',
        'astral': '\uD81A[\uDF40-\uDF43]|\uD81B[\uDF93-\uDF9F\uDFE0\uDFE1]'
    },
    {
        'name': 'Lo',
        'alias': 'Other_Letter',
        'bmp': '\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05EF-\u05F2\u0620-\u063F\u0641-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1100-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC',
        'astral': '\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC50-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDD00-\uDD23\uDF00-\uDF1C\uDF27\uDF30-\uDF45]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50]|\uD821[\uDC00-\uDFF1]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]'
    },
    {
        'name': 'Lt',
        'alias': 'Titlecase_Letter',
        'bmp': '\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC'
    },
    {
        'name': 'Lu',
        'alias': 'Uppercase_Letter',
        'bmp': 'A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uFF21-\uFF3A',
        'astral': '\uD801[\uDC00-\uDC27\uDCB0-\uDCD3]|\uD803[\uDC80-\uDCB2]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21]'
    },
    {
        'name': 'M',
        'alias': 'Mark',
        'bmp': '\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F',
        'astral': '\uD800[\uDDFD\uDEE0\uDF76-\uDF7A]|\uD802[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F\uDEE5\uDEE6]|\uD803[\uDD24-\uDD27\uDF46-\uDF50]|\uD804[\uDC00-\uDC02\uDC38-\uDC46\uDC7F-\uDC82\uDCB0-\uDCBA\uDD00-\uDD02\uDD27-\uDD34\uDD45\uDD46\uDD73\uDD80-\uDD82\uDDB3-\uDDC0\uDDC9-\uDDCC\uDE2C-\uDE37\uDE3E\uDEDF-\uDEEA\uDF00-\uDF03\uDF3B\uDF3C\uDF3E-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF62\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC35-\uDC46\uDC5E\uDCB0-\uDCC3\uDDAF-\uDDB5\uDDB8-\uDDC0\uDDDC\uDDDD\uDE30-\uDE40\uDEAB-\uDEB7\uDF1D-\uDF2B]|\uD806[\uDC2C-\uDC3A\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE3E\uDE47\uDE51-\uDE5B\uDE8A-\uDE99]|\uD807[\uDC2F-\uDC36\uDC38-\uDC3F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD31-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD45\uDD47\uDD8A-\uDD8E\uDD90\uDD91\uDD93-\uDD97\uDEF3-\uDEF6]|\uD81A[\uDEF0-\uDEF4\uDF30-\uDF36]|\uD81B[\uDF51-\uDF7E\uDF8F-\uDF92]|\uD82F[\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDCD0-\uDCD6\uDD44-\uDD4A]|\uDB40[\uDD00-\uDDEF]'
    },
    {
        'name': 'Mc',
        'alias': 'Spacing_Mark',
        'bmp': '\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E\u094F\u0982\u0983\u09BE-\u09C0\u09C7\u09C8\u09CB\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB\u0ACC\u0B02\u0B03\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0D02\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2\u0DF3\u0F3E\u0F3F\u0F7F\u102B\u102C\u1031\u1038\u103B\u103C\u1056\u1057\u1062-\u1064\u1067-\u106D\u1083\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7\u17C8\u1923-\u1926\u1929-\u192B\u1930\u1931\u1933-\u1938\u1A19\u1A1A\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43\u1B44\u1B82\u1BA1\u1BA6\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2\u1BF3\u1C24-\u1C2B\u1C34\u1C35\u1CE1\u1CF2\u1CF3\u1CF7\u302E\u302F\uA823\uA824\uA827\uA880\uA881\uA8B4-\uA8C3\uA952\uA953\uA983\uA9B4\uA9B5\uA9BA\uA9BB\uA9BD-\uA9C0\uAA2F\uAA30\uAA33\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE\uAAEF\uAAF5\uABE3\uABE4\uABE6\uABE7\uABE9\uABEA\uABEC',
        'astral': '\uD804[\uDC00\uDC02\uDC82\uDCB0-\uDCB2\uDCB7\uDCB8\uDD2C\uDD45\uDD46\uDD82\uDDB3-\uDDB5\uDDBF\uDDC0\uDE2C-\uDE2E\uDE32\uDE33\uDE35\uDEE0-\uDEE2\uDF02\uDF03\uDF3E\uDF3F\uDF41-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF62\uDF63]|\uD805[\uDC35-\uDC37\uDC40\uDC41\uDC45\uDCB0-\uDCB2\uDCB9\uDCBB-\uDCBE\uDCC1\uDDAF-\uDDB1\uDDB8-\uDDBB\uDDBE\uDE30-\uDE32\uDE3B\uDE3C\uDE3E\uDEAC\uDEAE\uDEAF\uDEB6\uDF20\uDF21\uDF26]|\uD806[\uDC2C-\uDC2E\uDC38\uDE39\uDE57\uDE58\uDE97]|\uD807[\uDC2F\uDC3E\uDCA9\uDCB1\uDCB4\uDD8A-\uDD8E\uDD93\uDD94\uDD96\uDEF5\uDEF6]|\uD81B[\uDF51-\uDF7E]|\uD834[\uDD65\uDD66\uDD6D-\uDD72]'
    },
    {
        'name': 'Me',
        'alias': 'Enclosing_Mark',
        'bmp': '\u0488\u0489\u1ABE\u20DD-\u20E0\u20E2-\u20E4\uA670-\uA672'
    },
    {
        'name': 'Mn',
        'alias': 'Nonspacing_Mark',
        'bmp': '\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u09FE\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C04\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D00\u0D01\u0D3B\u0D3C\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F',
        'astral': '\uD800[\uDDFD\uDEE0\uDF76-\uDF7A]|\uD802[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F\uDEE5\uDEE6]|\uD803[\uDD24-\uDD27\uDF46-\uDF50]|\uD804[\uDC01\uDC38-\uDC46\uDC7F-\uDC81\uDCB3-\uDCB6\uDCB9\uDCBA\uDD00-\uDD02\uDD27-\uDD2B\uDD2D-\uDD34\uDD73\uDD80\uDD81\uDDB6-\uDDBE\uDDC9-\uDDCC\uDE2F-\uDE31\uDE34\uDE36\uDE37\uDE3E\uDEDF\uDEE3-\uDEEA\uDF00\uDF01\uDF3B\uDF3C\uDF40\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC38-\uDC3F\uDC42-\uDC44\uDC46\uDC5E\uDCB3-\uDCB8\uDCBA\uDCBF\uDCC0\uDCC2\uDCC3\uDDB2-\uDDB5\uDDBC\uDDBD\uDDBF\uDDC0\uDDDC\uDDDD\uDE33-\uDE3A\uDE3D\uDE3F\uDE40\uDEAB\uDEAD\uDEB0-\uDEB5\uDEB7\uDF1D-\uDF1F\uDF22-\uDF25\uDF27-\uDF2B]|\uD806[\uDC2F-\uDC37\uDC39\uDC3A\uDE01-\uDE0A\uDE33-\uDE38\uDE3B-\uDE3E\uDE47\uDE51-\uDE56\uDE59-\uDE5B\uDE8A-\uDE96\uDE98\uDE99]|\uD807[\uDC30-\uDC36\uDC38-\uDC3D\uDC3F\uDC92-\uDCA7\uDCAA-\uDCB0\uDCB2\uDCB3\uDCB5\uDCB6\uDD31-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD45\uDD47\uDD90\uDD91\uDD95\uDD97\uDEF3\uDEF4]|\uD81A[\uDEF0-\uDEF4\uDF30-\uDF36]|\uD81B[\uDF8F-\uDF92]|\uD82F[\uDC9D\uDC9E]|\uD834[\uDD67-\uDD69\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDCD0-\uDCD6\uDD44-\uDD4A]|\uDB40[\uDD00-\uDDEF]'
    },
    {
        'name': 'N',
        'alias': 'Number',
        'bmp': '0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D58-\u0D5E\u0D66-\u0D78\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19',
        'astral': '\uD800[\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDEE1-\uDEFB\uDF20-\uDF23\uDF41\uDF4A\uDFD1-\uDFD5]|\uD801[\uDCA0-\uDCA9]|\uD802[\uDC58-\uDC5F\uDC79-\uDC7F\uDCA7-\uDCAF\uDCFB-\uDCFF\uDD16-\uDD1B\uDDBC\uDDBD\uDDC0-\uDDCF\uDDD2-\uDDFF\uDE40-\uDE48\uDE7D\uDE7E\uDE9D-\uDE9F\uDEEB-\uDEEF\uDF58-\uDF5F\uDF78-\uDF7F\uDFA9-\uDFAF]|\uD803[\uDCFA-\uDCFF\uDD30-\uDD39\uDE60-\uDE7E\uDF1D-\uDF26\uDF51-\uDF54]|\uD804[\uDC52-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDDE1-\uDDF4\uDEF0-\uDEF9]|\uD805[\uDC50-\uDC59\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF3B]|\uD806[\uDCE0-\uDCF2]|\uD807[\uDC50-\uDC6C\uDD50-\uDD59\uDDA0-\uDDA9]|\uD809[\uDC00-\uDC6E]|\uD81A[\uDE60-\uDE69\uDF50-\uDF59\uDF5B-\uDF61]|\uD81B[\uDE80-\uDE96]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDFCE-\uDFFF]|\uD83A[\uDCC7-\uDCCF\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4]|\uD83C[\uDD00-\uDD0C]'
    },
    {
        'name': 'Nd',
        'alias': 'Decimal_Number',
        'bmp': '0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19',
        'astral': '\uD801[\uDCA0-\uDCA9]|\uD803[\uDD30-\uDD39]|\uD804[\uDC66-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDEF0-\uDEF9]|\uD805[\uDC50-\uDC59\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF39]|\uD806[\uDCE0-\uDCE9]|\uD807[\uDC50-\uDC59\uDD50-\uDD59\uDDA0-\uDDA9]|\uD81A[\uDE60-\uDE69\uDF50-\uDF59]|\uD835[\uDFCE-\uDFFF]|\uD83A[\uDD50-\uDD59]'
    },
    {
        'name': 'Nl',
        'alias': 'Letter_Number',
        'bmp': '\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF',
        'astral': '\uD800[\uDD40-\uDD74\uDF41\uDF4A\uDFD1-\uDFD5]|\uD809[\uDC00-\uDC6E]'
    },
    {
        'name': 'No',
        'alias': 'Other_Number',
        'bmp': '\xB2\xB3\xB9\xBC-\xBE\u09F4-\u09F9\u0B72-\u0B77\u0BF0-\u0BF2\u0C78-\u0C7E\u0D58-\u0D5E\u0D70-\u0D78\u0F2A-\u0F33\u1369-\u137C\u17F0-\u17F9\u19DA\u2070\u2074-\u2079\u2080-\u2089\u2150-\u215F\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA830-\uA835',
        'astral': '\uD800[\uDD07-\uDD33\uDD75-\uDD78\uDD8A\uDD8B\uDEE1-\uDEFB\uDF20-\uDF23]|\uD802[\uDC58-\uDC5F\uDC79-\uDC7F\uDCA7-\uDCAF\uDCFB-\uDCFF\uDD16-\uDD1B\uDDBC\uDDBD\uDDC0-\uDDCF\uDDD2-\uDDFF\uDE40-\uDE48\uDE7D\uDE7E\uDE9D-\uDE9F\uDEEB-\uDEEF\uDF58-\uDF5F\uDF78-\uDF7F\uDFA9-\uDFAF]|\uD803[\uDCFA-\uDCFF\uDE60-\uDE7E\uDF1D-\uDF26\uDF51-\uDF54]|\uD804[\uDC52-\uDC65\uDDE1-\uDDF4]|\uD805[\uDF3A\uDF3B]|\uD806[\uDCEA-\uDCF2]|\uD807[\uDC5A-\uDC6C]|\uD81A[\uDF5B-\uDF61]|\uD81B[\uDE80-\uDE96]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD83A[\uDCC7-\uDCCF]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4]|\uD83C[\uDD00-\uDD0C]'
    },
    {
        'name': 'P',
        'alias': 'Punctuation',
        'bmp': '!-#%-\\*,-\\/:;\\?@\\[-\\]_\\{\\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4E\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65',
        'astral': '\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]'
    },
    {
        'name': 'Pc',
        'alias': 'Connector_Punctuation',
        'bmp': '_\u203F\u2040\u2054\uFE33\uFE34\uFE4D-\uFE4F\uFF3F'
    },
    {
        'name': 'Pd',
        'alias': 'Dash_Punctuation',
        'bmp': '\\-\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A\u2E3B\u2E40\u301C\u3030\u30A0\uFE31\uFE32\uFE58\uFE63\uFF0D'
    },
    {
        'name': 'Pe',
        'alias': 'Close_Punctuation',
        'bmp': '\\)\\]\\}\u0F3B\u0F3D\u169C\u2046\u207E\u208E\u2309\u230B\u232A\u2769\u276B\u276D\u276F\u2771\u2773\u2775\u27C6\u27E7\u27E9\u27EB\u27ED\u27EF\u2984\u2986\u2988\u298A\u298C\u298E\u2990\u2992\u2994\u2996\u2998\u29D9\u29DB\u29FD\u2E23\u2E25\u2E27\u2E29\u3009\u300B\u300D\u300F\u3011\u3015\u3017\u3019\u301B\u301E\u301F\uFD3E\uFE18\uFE36\uFE38\uFE3A\uFE3C\uFE3E\uFE40\uFE42\uFE44\uFE48\uFE5A\uFE5C\uFE5E\uFF09\uFF3D\uFF5D\uFF60\uFF63'
    },
    {
        'name': 'Pf',
        'alias': 'Final_Punctuation',
        'bmp': '\xBB\u2019\u201D\u203A\u2E03\u2E05\u2E0A\u2E0D\u2E1D\u2E21'
    },
    {
        'name': 'Pi',
        'alias': 'Initial_Punctuation',
        'bmp': '\xAB\u2018\u201B\u201C\u201F\u2039\u2E02\u2E04\u2E09\u2E0C\u2E1C\u2E20'
    },
    {
        'name': 'Po',
        'alias': 'Other_Punctuation',
        'bmp': '!-#%-\'\\*,\\.\\/:;\\?@\\\xA1\xA7\xB6\xB7\xBF\u037E\u0387\u055A-\u055F\u0589\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u166D\u166E\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u1805\u1807-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2016\u2017\u2020-\u2027\u2030-\u2038\u203B-\u203E\u2041-\u2043\u2047-\u2051\u2053\u2055-\u205E\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00\u2E01\u2E06-\u2E08\u2E0B\u2E0E-\u2E16\u2E18\u2E19\u2E1B\u2E1E\u2E1F\u2E2A-\u2E2E\u2E30-\u2E39\u2E3C-\u2E3F\u2E41\u2E43-\u2E4E\u3001-\u3003\u303D\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFE10-\uFE16\uFE19\uFE30\uFE45\uFE46\uFE49-\uFE4C\uFE50-\uFE52\uFE54-\uFE57\uFE5F-\uFE61\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF07\uFF0A\uFF0C\uFF0E\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3C\uFF61\uFF64\uFF65',
        'astral': '\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]'
    },
    {
        'name': 'Ps',
        'alias': 'Open_Punctuation',
        'bmp': '\\(\\[\\{\u0F3A\u0F3C\u169B\u201A\u201E\u2045\u207D\u208D\u2308\u230A\u2329\u2768\u276A\u276C\u276E\u2770\u2772\u2774\u27C5\u27E6\u27E8\u27EA\u27EC\u27EE\u2983\u2985\u2987\u2989\u298B\u298D\u298F\u2991\u2993\u2995\u2997\u29D8\u29DA\u29FC\u2E22\u2E24\u2E26\u2E28\u2E42\u3008\u300A\u300C\u300E\u3010\u3014\u3016\u3018\u301A\u301D\uFD3F\uFE17\uFE35\uFE37\uFE39\uFE3B\uFE3D\uFE3F\uFE41\uFE43\uFE47\uFE59\uFE5B\uFE5D\uFF08\uFF3B\uFF5B\uFF5F\uFF62'
    },
    {
        'name': 'S',
        'alias': 'Symbol',
        'bmp': '\\$\\+<->\\^`\\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20BF\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B98-\u2BC8\u2BCA-\u2BFE\u2CE5-\u2CEA\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u32FE\u3300-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uFB29\uFBB2-\uFBC1\uFDFC\uFDFD\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD',
        'astral': '\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9B\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD83B[\uDCAC\uDCB0\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD10-\uDD6B\uDD70-\uDDAC\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED4\uDEE0-\uDEEC\uDEF0-\uDEF9\uDF00-\uDF73\uDF80-\uDFD8]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDD00-\uDD0B\uDD10-\uDD3E\uDD40-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF\uDE60-\uDE6D]'
    },
    {
        'name': 'Sc',
        'alias': 'Currency_Symbol',
        'bmp': '\\$\xA2-\xA5\u058F\u060B\u07FE\u07FF\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BF\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6',
        'astral': '\uD83B\uDCB0'
    },
    {
        'name': 'Sk',
        'alias': 'Modifier_Symbol',
        'bmp': '\\^`\xA8\xAF\xB4\xB8\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u309B\u309C\uA700-\uA716\uA720\uA721\uA789\uA78A\uAB5B\uFBB2-\uFBC1\uFF3E\uFF40\uFFE3',
        'astral': '\uD83C[\uDFFB-\uDFFF]'
    },
    {
        'name': 'Sm',
        'alias': 'Math_Symbol',
        'bmp': '\\+<->\\|~\xAC\xB1\xD7\xF7\u03F6\u0606-\u0608\u2044\u2052\u207A-\u207C\u208A-\u208C\u2118\u2140-\u2144\u214B\u2190-\u2194\u219A\u219B\u21A0\u21A3\u21A6\u21AE\u21CE\u21CF\u21D2\u21D4\u21F4-\u22FF\u2320\u2321\u237C\u239B-\u23B3\u23DC-\u23E1\u25B7\u25C1\u25F8-\u25FF\u266F\u27C0-\u27C4\u27C7-\u27E5\u27F0-\u27FF\u2900-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2AFF\u2B30-\u2B44\u2B47-\u2B4C\uFB29\uFE62\uFE64-\uFE66\uFF0B\uFF1C-\uFF1E\uFF5C\uFF5E\uFFE2\uFFE9-\uFFEC',
        'astral': '\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD83B[\uDEF0\uDEF1]'
    },
    {
        'name': 'So',
        'alias': 'Other_Symbol',
        'bmp': '\xA6\xA9\xAE\xB0\u0482\u058D\u058E\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u09FA\u0B70\u0BF3-\u0BF8\u0BFA\u0C7F\u0D4F\u0D79\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116\u2117\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u214A\u214C\u214D\u214F\u218A\u218B\u2195-\u2199\u219C-\u219F\u21A1\u21A2\u21A4\u21A5\u21A7-\u21AD\u21AF-\u21CD\u21D0\u21D1\u21D3\u21D5-\u21F3\u2300-\u2307\u230C-\u231F\u2322-\u2328\u232B-\u237B\u237D-\u239A\u23B4-\u23DB\u23E2-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u25B6\u25B8-\u25C0\u25C2-\u25F7\u2600-\u266E\u2670-\u2767\u2794-\u27BF\u2800-\u28FF\u2B00-\u2B2F\u2B45\u2B46\u2B4D-\u2B73\u2B76-\u2B95\u2B98-\u2BC8\u2BCA-\u2BFE\u2CE5-\u2CEA\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u32FE\u3300-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA828-\uA82B\uA836\uA837\uA839\uAA77-\uAA79\uFDFD\uFFE4\uFFE8\uFFED\uFFEE\uFFFC\uFFFD',
        'astral': '\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9B\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD83B\uDCAC|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD10-\uDD6B\uDD70-\uDDAC\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFA]|\uD83D[\uDC00-\uDED4\uDEE0-\uDEEC\uDEF0-\uDEF9\uDF00-\uDF73\uDF80-\uDFD8]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDD00-\uDD0B\uDD10-\uDD3E\uDD40-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF\uDE60-\uDE6D]'
    },
    {
        'name': 'Z',
        'alias': 'Separator',
        'bmp': ' \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000'
    },
    {
        'name': 'Zl',
        'alias': 'Line_Separator',
        'bmp': '\u2028'
    },
    {
        'name': 'Zp',
        'alias': 'Paragraph_Separator',
        'bmp': '\u2029'
    },
    {
        'name': 'Zs',
        'alias': 'Space_Separator',
        'bmp': ' \xA0\u1680\u2000-\u200A\u202F\u205F\u3000'
    }
];

var unicodeCategories = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _categories = _interopRequireDefault(categories);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * XRegExp Unicode Categories 4.2.0
 * <xregexp.com>
 * Steven Levithan (c) 2010-present MIT License
 * Unicode data by Mathias Bynens <mathiasbynens.be>
 */
var _default = function _default(XRegExp) {
  /**
   * Adds support for Unicode's general categories. E.g., `\p{Lu}` or `\p{Uppercase Letter}`. See
   * category descriptions in UAX #44 <http://unicode.org/reports/tr44/#GC_Values_Table>. Token
   * names are case insensitive, and any spaces, hyphens, and underscores are ignored.
   *
   * Uses Unicode 11.0.0.
   *
   * @requires XRegExp, Unicode Base
   */
  if (!XRegExp.addUnicodeData) {
    throw new ReferenceError('Unicode Base must be loaded before Unicode Categories');
  }

  XRegExp.addUnicodeData(_categories.default);
};

exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(unicodeCategories);

var properties = [
    {
        'name': 'ASCII',
        'bmp': '\0-\x7F'
    },
    {
        'name': 'Alphabetic',
        'bmp': 'A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0345\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05EF-\u05F2\u0610-\u061A\u0620-\u0657\u0659-\u065F\u066E-\u06D3\u06D5-\u06DC\u06E1-\u06E8\u06ED-\u06EF\u06FA-\u06FC\u06FF\u0710-\u073F\u074D-\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0817\u081A-\u082C\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08DF\u08E3-\u08E9\u08F0-\u093B\u093D-\u094C\u094E-\u0950\u0955-\u0963\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD-\u09C4\u09C7\u09C8\u09CB\u09CC\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09F0\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3E-\u0A42\u0A47\u0A48\u0A4B\u0A4C\u0A51\u0A59-\u0A5C\u0A5E\u0A70-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD-\u0AC5\u0AC7-\u0AC9\u0ACB\u0ACC\u0AD0\u0AE0-\u0AE3\u0AF9-\u0AFC\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D-\u0B44\u0B47\u0B48\u0B4B\u0B4C\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD0\u0BD7\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4C\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCC\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4C\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E46\u0E4D\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0ECD\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F71-\u0F81\u0F88-\u0F97\u0F99-\u0FBC\u1000-\u1036\u1038\u103B-\u103F\u1050-\u1062\u1065-\u1068\u106E-\u1086\u108E\u109C\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1713\u1720-\u1733\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17B3\u17B6-\u17C8\u17D7\u17DC\u1820-\u1878\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u1938\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A1B\u1A20-\u1A5E\u1A61-\u1A74\u1AA7\u1B00-\u1B33\u1B35-\u1B43\u1B45-\u1B4B\u1B80-\u1BA9\u1BAC-\u1BAF\u1BBA-\u1BE5\u1BE7-\u1BF1\u1C00-\u1C35\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1D00-\u1DBF\u1DE7-\u1DF4\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u24B6-\u24E9\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA674-\uA67B\uA67F-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7B9\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA827\uA840-\uA873\uA880-\uA8C3\uA8C5\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA92A\uA930-\uA952\uA960-\uA97C\uA980-\uA9B2\uA9B4-\uA9BF\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA60-\uAA76\uAA7A\uAA7E-\uAABE\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF5\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC',
        'astral': '\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD27\uDF00-\uDF1C\uDF27\uDF30-\uDF45]|\uD804[\uDC00-\uDC45\uDC82-\uDCB8\uDCD0-\uDCE8\uDD00-\uDD32\uDD44-\uDD46\uDD50-\uDD72\uDD76\uDD80-\uDDBF\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE34\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEE8\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D-\uDF44\uDF47\uDF48\uDF4B\uDF4C\uDF50\uDF57\uDF5D-\uDF63]|\uD805[\uDC00-\uDC41\uDC43-\uDC45\uDC47-\uDC4A\uDC80-\uDCC1\uDCC4\uDCC5\uDCC7\uDD80-\uDDB5\uDDB8-\uDDBE\uDDD8-\uDDDD\uDE00-\uDE3E\uDE40\uDE44\uDE80-\uDEB5\uDF00-\uDF1A\uDF1D-\uDF2A]|\uD806[\uDC00-\uDC38\uDCA0-\uDCDF\uDCFF\uDE00-\uDE32\uDE35-\uDE3E\uDE50-\uDE83\uDE86-\uDE97\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC3E\uDC40\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD41\uDD43\uDD46\uDD47\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD96\uDD98\uDEE0-\uDEF6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF36\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF44\uDF50-\uDF7E\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFF1]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9E]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD47]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD30-\uDD49\uDD50-\uDD69\uDD70-\uDD89]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]'
    },
    {
        'name': 'Any',
        'isBmpLast': true,
        'bmp': '\0-\uFFFF',
        'astral': '[\uD800-\uDBFF][\uDC00-\uDFFF]'
    },
    {
        'name': 'Default_Ignorable_Code_Point',
        'bmp': '\xAD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8',
        'astral': '\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|[\uDB40-\uDB43][\uDC00-\uDFFF]'
    },
    {
        'name': 'Lowercase',
        'bmp': 'a-z\xAA\xB5\xBA\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02B8\u02C0\u02C1\u02E0-\u02E4\u0345\u0371\u0373\u0377\u037A-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1DBF\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u2071\u207F\u2090-\u209C\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2170-\u217F\u2184\u24D0-\u24E9\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7D\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B-\uA69D\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7F8-\uA7FA\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A',
        'astral': '\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD83A[\uDD22-\uDD43]'
    },
    {
        'name': 'Noncharacter_Code_Point',
        'bmp': '\uFDD0-\uFDEF\uFFFE\uFFFF',
        'astral': '[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]'
    },
    {
        'name': 'Uppercase',
        'bmp': 'A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2160-\u216F\u2183\u24B6-\u24CF\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uFF21-\uFF3A',
        'astral': '\uD801[\uDC00-\uDC27\uDCB0-\uDCD3]|\uD803[\uDC80-\uDCB2]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21]|\uD83C[\uDD30-\uDD49\uDD50-\uDD69\uDD70-\uDD89]'
    },
    {
        'name': 'White_Space',
        'bmp': '\t-\r \x85\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000'
    }
];

var unicodeProperties = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _properties = _interopRequireDefault(properties);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * XRegExp Unicode Properties 4.2.0
 * <xregexp.com>
 * Steven Levithan (c) 2012-present MIT License
 * Unicode data by Mathias Bynens <mathiasbynens.be>
 */
var _default = function _default(XRegExp) {
  /**
   * Adds properties to meet the UTS #18 Level 1 RL1.2 requirements for Unicode regex support. See
   * <http://unicode.org/reports/tr18/#RL1.2>. Following are definitions of these properties from
   * UAX #44 <http://unicode.org/reports/tr44/>:
   *
   * - Alphabetic
   *   Characters with the Alphabetic property. Generated from: Lowercase + Uppercase + Lt + Lm +
   *   Lo + Nl + Other_Alphabetic.
   *
   * - Default_Ignorable_Code_Point
   *   For programmatic determination of default ignorable code points. New characters that should
   *   be ignored in rendering (unless explicitly supported) will be assigned in these ranges,
   *   permitting programs to correctly handle the default rendering of such characters when not
   *   otherwise supported.
   *
   * - Lowercase
   *   Characters with the Lowercase property. Generated from: Ll + Other_Lowercase.
   *
   * - Noncharacter_Code_Point
   *   Code points permanently reserved for internal use.
   *
   * - Uppercase
   *   Characters with the Uppercase property. Generated from: Lu + Other_Uppercase.
   *
   * - White_Space
   *   Spaces, separator characters and other control characters which should be treated by
   *   programming languages as "white space" for the purpose of parsing elements.
   *
   * The properties ASCII, Any, and Assigned are also included but are not defined in UAX #44. UTS
   * #18 RL1.2 additionally requires support for Unicode scripts and general categories. These are
   * included in XRegExp's Unicode Categories and Unicode Scripts addons.
   *
   * Token names are case insensitive, and any spaces, hyphens, and underscores are ignored.
   *
   * Uses Unicode 11.0.0.
   *
   * @requires XRegExp, Unicode Base
   */
  if (!XRegExp.addUnicodeData) {
    throw new ReferenceError('Unicode Base must be loaded before Unicode Properties');
  }

  var unicodeData = _properties.default; // Add non-generated data

  unicodeData.push({
    name: 'Assigned',
    // Since this is defined as the inverse of Unicode category Cn (Unassigned), the Unicode
    // Categories addon is required to use this property
    inverseOf: 'Cn'
  });
  XRegExp.addUnicodeData(unicodeData);
};

exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(unicodeProperties);

var scripts = [
    {
        'name': 'Adlam',
        'astral': '\uD83A[\uDD00-\uDD4A\uDD50-\uDD59\uDD5E\uDD5F]'
    },
    {
        'name': 'Ahom',
        'astral': '\uD805[\uDF00-\uDF1A\uDF1D-\uDF2B\uDF30-\uDF3F]'
    },
    {
        'name': 'Anatolian_Hieroglyphs',
        'astral': '\uD811[\uDC00-\uDE46]'
    },
    {
        'name': 'Arabic',
        'bmp': '\u0600-\u0604\u0606-\u060B\u060D-\u061A\u061C\u061E\u0620-\u063F\u0641-\u064A\u0656-\u066F\u0671-\u06DC\u06DE-\u06FF\u0750-\u077F\u08A0-\u08B4\u08B6-\u08BD\u08D3-\u08E1\u08E3-\u08FF\uFB50-\uFBC1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFD\uFE70-\uFE74\uFE76-\uFEFC',
        'astral': '\uD803[\uDE60-\uDE7E]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB\uDEF0\uDEF1]'
    },
    {
        'name': 'Armenian',
        'bmp': '\u0531-\u0556\u0559-\u0588\u058A\u058D-\u058F\uFB13-\uFB17'
    },
    {
        'name': 'Avestan',
        'astral': '\uD802[\uDF00-\uDF35\uDF39-\uDF3F]'
    },
    {
        'name': 'Balinese',
        'bmp': '\u1B00-\u1B4B\u1B50-\u1B7C'
    },
    {
        'name': 'Bamum',
        'bmp': '\uA6A0-\uA6F7',
        'astral': '\uD81A[\uDC00-\uDE38]'
    },
    {
        'name': 'Bassa_Vah',
        'astral': '\uD81A[\uDED0-\uDEED\uDEF0-\uDEF5]'
    },
    {
        'name': 'Batak',
        'bmp': '\u1BC0-\u1BF3\u1BFC-\u1BFF'
    },
    {
        'name': 'Bengali',
        'bmp': '\u0980-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09FE'
    },
    {
        'name': 'Bhaiksuki',
        'astral': '\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC45\uDC50-\uDC6C]'
    },
    {
        'name': 'Bopomofo',
        'bmp': '\u02EA\u02EB\u3105-\u312F\u31A0-\u31BA'
    },
    {
        'name': 'Brahmi',
        'astral': '\uD804[\uDC00-\uDC4D\uDC52-\uDC6F\uDC7F]'
    },
    {
        'name': 'Braille',
        'bmp': '\u2800-\u28FF'
    },
    {
        'name': 'Buginese',
        'bmp': '\u1A00-\u1A1B\u1A1E\u1A1F'
    },
    {
        'name': 'Buhid',
        'bmp': '\u1740-\u1753'
    },
    {
        'name': 'Canadian_Aboriginal',
        'bmp': '\u1400-\u167F\u18B0-\u18F5'
    },
    {
        'name': 'Carian',
        'astral': '\uD800[\uDEA0-\uDED0]'
    },
    {
        'name': 'Caucasian_Albanian',
        'astral': '\uD801[\uDD30-\uDD63\uDD6F]'
    },
    {
        'name': 'Chakma',
        'astral': '\uD804[\uDD00-\uDD34\uDD36-\uDD46]'
    },
    {
        'name': 'Cham',
        'bmp': '\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA5C-\uAA5F'
    },
    {
        'name': 'Cherokee',
        'bmp': '\u13A0-\u13F5\u13F8-\u13FD\uAB70-\uABBF'
    },
    {
        'name': 'Common',
        'bmp': '\0-@\\[-`\\{-\xA9\xAB-\xB9\xBB-\xBF\xD7\xF7\u02B9-\u02DF\u02E5-\u02E9\u02EC-\u02FF\u0374\u037E\u0385\u0387\u0589\u0605\u060C\u061B\u061F\u0640\u06DD\u08E2\u0964\u0965\u0E3F\u0FD5-\u0FD8\u10FB\u16EB-\u16ED\u1735\u1736\u1802\u1803\u1805\u1CD3\u1CE1\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5-\u1CF7\u2000-\u200B\u200E-\u2064\u2066-\u2070\u2074-\u207E\u2080-\u208E\u20A0-\u20BF\u2100-\u2125\u2127-\u2129\u212C-\u2131\u2133-\u214D\u214F-\u215F\u2189-\u218B\u2190-\u2426\u2440-\u244A\u2460-\u27FF\u2900-\u2B73\u2B76-\u2B95\u2B98-\u2BC8\u2BCA-\u2BFE\u2E00-\u2E4E\u2FF0-\u2FFB\u3000-\u3004\u3006\u3008-\u3020\u3030-\u3037\u303C-\u303F\u309B\u309C\u30A0\u30FB\u30FC\u3190-\u319F\u31C0-\u31E3\u3220-\u325F\u327F-\u32CF\u3358-\u33FF\u4DC0-\u4DFF\uA700-\uA721\uA788-\uA78A\uA830-\uA839\uA92E\uA9CF\uAB5B\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE66\uFE68-\uFE6B\uFEFF\uFF01-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFF70\uFF9E\uFF9F\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFF9-\uFFFD',
        'astral': '\uD800[\uDD00-\uDD02\uDD07-\uDD33\uDD37-\uDD3F\uDD90-\uDD9B\uDDD0-\uDDFC\uDEE1-\uDEFB]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD66\uDD6A-\uDD7A\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDEE0-\uDEF3\uDF00-\uDF56\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDFCB\uDFCE-\uDFFF]|\uD83B[\uDC71-\uDCB4]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD00-\uDD0C\uDD10-\uDD6B\uDD70-\uDDAC\uDDE6-\uDDFF\uDE01\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED4\uDEE0-\uDEEC\uDEF0-\uDEF9\uDF00-\uDF73\uDF80-\uDFD8]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDD00-\uDD0B\uDD10-\uDD3E\uDD40-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF\uDE60-\uDE6D]|\uDB40[\uDC01\uDC20-\uDC7F]'
    },
    {
        'name': 'Coptic',
        'bmp': '\u03E2-\u03EF\u2C80-\u2CF3\u2CF9-\u2CFF'
    },
    {
        'name': 'Cuneiform',
        'astral': '\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC70-\uDC74\uDC80-\uDD43]'
    },
    {
        'name': 'Cypriot',
        'astral': '\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F]'
    },
    {
        'name': 'Cyrillic',
        'bmp': '\u0400-\u0484\u0487-\u052F\u1C80-\u1C88\u1D2B\u1D78\u2DE0-\u2DFF\uA640-\uA69F\uFE2E\uFE2F'
    },
    {
        'name': 'Deseret',
        'astral': '\uD801[\uDC00-\uDC4F]'
    },
    {
        'name': 'Devanagari',
        'bmp': '\u0900-\u0950\u0953-\u0963\u0966-\u097F\uA8E0-\uA8FF'
    },
    {
        'name': 'Dogra',
        'astral': '\uD806[\uDC00-\uDC3B]'
    },
    {
        'name': 'Duployan',
        'astral': '\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9C-\uDC9F]'
    },
    {
        'name': 'Egyptian_Hieroglyphs',
        'astral': '\uD80C[\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]'
    },
    {
        'name': 'Elbasan',
        'astral': '\uD801[\uDD00-\uDD27]'
    },
    {
        'name': 'Ethiopic',
        'bmp': '\u1200-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u137C\u1380-\u1399\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E'
    },
    {
        'name': 'Georgian',
        'bmp': '\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u10FF\u1C90-\u1CBA\u1CBD-\u1CBF\u2D00-\u2D25\u2D27\u2D2D'
    },
    {
        'name': 'Glagolitic',
        'bmp': '\u2C00-\u2C2E\u2C30-\u2C5E',
        'astral': '\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]'
    },
    {
        'name': 'Gothic',
        'astral': '\uD800[\uDF30-\uDF4A]'
    },
    {
        'name': 'Grantha',
        'astral': '\uD804[\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]'
    },
    {
        'name': 'Greek',
        'bmp': '\u0370-\u0373\u0375-\u0377\u037A-\u037D\u037F\u0384\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03E1\u03F0-\u03FF\u1D26-\u1D2A\u1D5D-\u1D61\u1D66-\u1D6A\u1DBF\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FC4\u1FC6-\u1FD3\u1FD6-\u1FDB\u1FDD-\u1FEF\u1FF2-\u1FF4\u1FF6-\u1FFE\u2126\uAB65',
        'astral': '\uD800[\uDD40-\uDD8E\uDDA0]|\uD834[\uDE00-\uDE45]'
    },
    {
        'name': 'Gujarati',
        'bmp': '\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AF1\u0AF9-\u0AFF'
    },
    {
        'name': 'Gunjala_Gondi',
        'astral': '\uD807[\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD98\uDDA0-\uDDA9]'
    },
    {
        'name': 'Gurmukhi',
        'bmp': '\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A76'
    },
    {
        'name': 'Han',
        'bmp': '\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FEF\uF900-\uFA6D\uFA70-\uFAD9',
        'astral': '[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]'
    },
    {
        'name': 'Hangul',
        'bmp': '\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC'
    },
    {
        'name': 'Hanifi_Rohingya',
        'astral': '\uD803[\uDD00-\uDD27\uDD30-\uDD39]'
    },
    {
        'name': 'Hanunoo',
        'bmp': '\u1720-\u1734'
    },
    {
        'name': 'Hatran',
        'astral': '\uD802[\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDCFF]'
    },
    {
        'name': 'Hebrew',
        'bmp': '\u0591-\u05C7\u05D0-\u05EA\u05EF-\u05F4\uFB1D-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFB4F'
    },
    {
        'name': 'Hiragana',
        'bmp': '\u3041-\u3096\u309D-\u309F',
        'astral': '\uD82C[\uDC01-\uDD1E]|\uD83C\uDE00'
    },
    {
        'name': 'Imperial_Aramaic',
        'astral': '\uD802[\uDC40-\uDC55\uDC57-\uDC5F]'
    },
    {
        'name': 'Inherited',
        'bmp': '\u0300-\u036F\u0485\u0486\u064B-\u0655\u0670\u0951\u0952\u1AB0-\u1ABE\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u200C\u200D\u20D0-\u20F0\u302A-\u302D\u3099\u309A\uFE00-\uFE0F\uFE20-\uFE2D',
        'astral': '\uD800[\uDDFD\uDEE0]|\uD804\uDF3B|\uD834[\uDD67-\uDD69\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD]|\uDB40[\uDD00-\uDDEF]'
    },
    {
        'name': 'Inscriptional_Pahlavi',
        'astral': '\uD802[\uDF60-\uDF72\uDF78-\uDF7F]'
    },
    {
        'name': 'Inscriptional_Parthian',
        'astral': '\uD802[\uDF40-\uDF55\uDF58-\uDF5F]'
    },
    {
        'name': 'Javanese',
        'bmp': '\uA980-\uA9CD\uA9D0-\uA9D9\uA9DE\uA9DF'
    },
    {
        'name': 'Kaithi',
        'astral': '\uD804[\uDC80-\uDCC1\uDCCD]'
    },
    {
        'name': 'Kannada',
        'bmp': '\u0C80-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2'
    },
    {
        'name': 'Katakana',
        'bmp': '\u30A1-\u30FA\u30FD-\u30FF\u31F0-\u31FF\u32D0-\u32FE\u3300-\u3357\uFF66-\uFF6F\uFF71-\uFF9D',
        'astral': '\uD82C\uDC00'
    },
    {
        'name': 'Kayah_Li',
        'bmp': '\uA900-\uA92D\uA92F'
    },
    {
        'name': 'Kharoshthi',
        'astral': '\uD802[\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE38-\uDE3A\uDE3F-\uDE48\uDE50-\uDE58]'
    },
    {
        'name': 'Khmer',
        'bmp': '\u1780-\u17DD\u17E0-\u17E9\u17F0-\u17F9\u19E0-\u19FF'
    },
    {
        'name': 'Khojki',
        'astral': '\uD804[\uDE00-\uDE11\uDE13-\uDE3E]'
    },
    {
        'name': 'Khudawadi',
        'astral': '\uD804[\uDEB0-\uDEEA\uDEF0-\uDEF9]'
    },
    {
        'name': 'Lao',
        'bmp': '\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF'
    },
    {
        'name': 'Latin',
        'bmp': 'A-Za-z\xAA\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02E0-\u02E4\u1D00-\u1D25\u1D2C-\u1D5C\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1DBE\u1E00-\u1EFF\u2071\u207F\u2090-\u209C\u212A\u212B\u2132\u214E\u2160-\u2188\u2C60-\u2C7F\uA722-\uA787\uA78B-\uA7B9\uA7F7-\uA7FF\uAB30-\uAB5A\uAB5C-\uAB64\uFB00-\uFB06\uFF21-\uFF3A\uFF41-\uFF5A'
    },
    {
        'name': 'Lepcha',
        'bmp': '\u1C00-\u1C37\u1C3B-\u1C49\u1C4D-\u1C4F'
    },
    {
        'name': 'Limbu',
        'bmp': '\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1940\u1944-\u194F'
    },
    {
        'name': 'Linear_A',
        'astral': '\uD801[\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]'
    },
    {
        'name': 'Linear_B',
        'astral': '\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA]'
    },
    {
        'name': 'Lisu',
        'bmp': '\uA4D0-\uA4FF'
    },
    {
        'name': 'Lycian',
        'astral': '\uD800[\uDE80-\uDE9C]'
    },
    {
        'name': 'Lydian',
        'astral': '\uD802[\uDD20-\uDD39\uDD3F]'
    },
    {
        'name': 'Mahajani',
        'astral': '\uD804[\uDD50-\uDD76]'
    },
    {
        'name': 'Makasar',
        'astral': '\uD807[\uDEE0-\uDEF8]'
    },
    {
        'name': 'Malayalam',
        'bmp': '\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4F\u0D54-\u0D63\u0D66-\u0D7F'
    },
    {
        'name': 'Mandaic',
        'bmp': '\u0840-\u085B\u085E'
    },
    {
        'name': 'Manichaean',
        'astral': '\uD802[\uDEC0-\uDEE6\uDEEB-\uDEF6]'
    },
    {
        'name': 'Marchen',
        'astral': '\uD807[\uDC70-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6]'
    },
    {
        'name': 'Masaram_Gondi',
        'astral': '\uD807[\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]'
    },
    {
        'name': 'Medefaidrin',
        'astral': '\uD81B[\uDE40-\uDE9A]'
    },
    {
        'name': 'Meetei_Mayek',
        'bmp': '\uAAE0-\uAAF6\uABC0-\uABED\uABF0-\uABF9'
    },
    {
        'name': 'Mende_Kikakui',
        'astral': '\uD83A[\uDC00-\uDCC4\uDCC7-\uDCD6]'
    },
    {
        'name': 'Meroitic_Cursive',
        'astral': '\uD802[\uDDA0-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDDFF]'
    },
    {
        'name': 'Meroitic_Hieroglyphs',
        'astral': '\uD802[\uDD80-\uDD9F]'
    },
    {
        'name': 'Miao',
        'astral': '\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]'
    },
    {
        'name': 'Modi',
        'astral': '\uD805[\uDE00-\uDE44\uDE50-\uDE59]'
    },
    {
        'name': 'Mongolian',
        'bmp': '\u1800\u1801\u1804\u1806-\u180E\u1810-\u1819\u1820-\u1878\u1880-\u18AA',
        'astral': '\uD805[\uDE60-\uDE6C]'
    },
    {
        'name': 'Mro',
        'astral': '\uD81A[\uDE40-\uDE5E\uDE60-\uDE69\uDE6E\uDE6F]'
    },
    {
        'name': 'Multani',
        'astral': '\uD804[\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA9]'
    },
    {
        'name': 'Myanmar',
        'bmp': '\u1000-\u109F\uA9E0-\uA9FE\uAA60-\uAA7F'
    },
    {
        'name': 'Nabataean',
        'astral': '\uD802[\uDC80-\uDC9E\uDCA7-\uDCAF]'
    },
    {
        'name': 'New_Tai_Lue',
        'bmp': '\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u19DE\u19DF'
    },
    {
        'name': 'Newa',
        'astral': '\uD805[\uDC00-\uDC59\uDC5B\uDC5D\uDC5E]'
    },
    {
        'name': 'Nko',
        'bmp': '\u07C0-\u07FA\u07FD-\u07FF'
    },
    {
        'name': 'Nushu',
        'astral': '\uD81B\uDFE1|\uD82C[\uDD70-\uDEFB]'
    },
    {
        'name': 'Ogham',
        'bmp': '\u1680-\u169C'
    },
    {
        'name': 'Ol_Chiki',
        'bmp': '\u1C50-\u1C7F'
    },
    {
        'name': 'Old_Hungarian',
        'astral': '\uD803[\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDCFF]'
    },
    {
        'name': 'Old_Italic',
        'astral': '\uD800[\uDF00-\uDF23\uDF2D-\uDF2F]'
    },
    {
        'name': 'Old_North_Arabian',
        'astral': '\uD802[\uDE80-\uDE9F]'
    },
    {
        'name': 'Old_Permic',
        'astral': '\uD800[\uDF50-\uDF7A]'
    },
    {
        'name': 'Old_Persian',
        'astral': '\uD800[\uDFA0-\uDFC3\uDFC8-\uDFD5]'
    },
    {
        'name': 'Old_Sogdian',
        'astral': '\uD803[\uDF00-\uDF27]'
    },
    {
        'name': 'Old_South_Arabian',
        'astral': '\uD802[\uDE60-\uDE7F]'
    },
    {
        'name': 'Old_Turkic',
        'astral': '\uD803[\uDC00-\uDC48]'
    },
    {
        'name': 'Oriya',
        'bmp': '\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B77'
    },
    {
        'name': 'Osage',
        'astral': '\uD801[\uDCB0-\uDCD3\uDCD8-\uDCFB]'
    },
    {
        'name': 'Osmanya',
        'astral': '\uD801[\uDC80-\uDC9D\uDCA0-\uDCA9]'
    },
    {
        'name': 'Pahawh_Hmong',
        'astral': '\uD81A[\uDF00-\uDF45\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]'
    },
    {
        'name': 'Palmyrene',
        'astral': '\uD802[\uDC60-\uDC7F]'
    },
    {
        'name': 'Pau_Cin_Hau',
        'astral': '\uD806[\uDEC0-\uDEF8]'
    },
    {
        'name': 'Phags_Pa',
        'bmp': '\uA840-\uA877'
    },
    {
        'name': 'Phoenician',
        'astral': '\uD802[\uDD00-\uDD1B\uDD1F]'
    },
    {
        'name': 'Psalter_Pahlavi',
        'astral': '\uD802[\uDF80-\uDF91\uDF99-\uDF9C\uDFA9-\uDFAF]'
    },
    {
        'name': 'Rejang',
        'bmp': '\uA930-\uA953\uA95F'
    },
    {
        'name': 'Runic',
        'bmp': '\u16A0-\u16EA\u16EE-\u16F8'
    },
    {
        'name': 'Samaritan',
        'bmp': '\u0800-\u082D\u0830-\u083E'
    },
    {
        'name': 'Saurashtra',
        'bmp': '\uA880-\uA8C5\uA8CE-\uA8D9'
    },
    {
        'name': 'Sharada',
        'astral': '\uD804[\uDD80-\uDDCD\uDDD0-\uDDDF]'
    },
    {
        'name': 'Shavian',
        'astral': '\uD801[\uDC50-\uDC7F]'
    },
    {
        'name': 'Siddham',
        'astral': '\uD805[\uDD80-\uDDB5\uDDB8-\uDDDD]'
    },
    {
        'name': 'SignWriting',
        'astral': '\uD836[\uDC00-\uDE8B\uDE9B-\uDE9F\uDEA1-\uDEAF]'
    },
    {
        'name': 'Sinhala',
        'bmp': '\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF4',
        'astral': '\uD804[\uDDE1-\uDDF4]'
    },
    {
        'name': 'Sogdian',
        'astral': '\uD803[\uDF30-\uDF59]'
    },
    {
        'name': 'Sora_Sompeng',
        'astral': '\uD804[\uDCD0-\uDCE8\uDCF0-\uDCF9]'
    },
    {
        'name': 'Soyombo',
        'astral': '\uD806[\uDE50-\uDE83\uDE86-\uDEA2]'
    },
    {
        'name': 'Sundanese',
        'bmp': '\u1B80-\u1BBF\u1CC0-\u1CC7'
    },
    {
        'name': 'Syloti_Nagri',
        'bmp': '\uA800-\uA82B'
    },
    {
        'name': 'Syriac',
        'bmp': '\u0700-\u070D\u070F-\u074A\u074D-\u074F\u0860-\u086A'
    },
    {
        'name': 'Tagalog',
        'bmp': '\u1700-\u170C\u170E-\u1714'
    },
    {
        'name': 'Tagbanwa',
        'bmp': '\u1760-\u176C\u176E-\u1770\u1772\u1773'
    },
    {
        'name': 'Tai_Le',
        'bmp': '\u1950-\u196D\u1970-\u1974'
    },
    {
        'name': 'Tai_Tham',
        'bmp': '\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA0-\u1AAD'
    },
    {
        'name': 'Tai_Viet',
        'bmp': '\uAA80-\uAAC2\uAADB-\uAADF'
    },
    {
        'name': 'Takri',
        'astral': '\uD805[\uDE80-\uDEB7\uDEC0-\uDEC9]'
    },
    {
        'name': 'Tamil',
        'bmp': '\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BFA'
    },
    {
        'name': 'Tangut',
        'astral': '\uD81B\uDFE0|[\uD81C-\uD820][\uDC00-\uDFFF]|\uD821[\uDC00-\uDFF1]|\uD822[\uDC00-\uDEF2]'
    },
    {
        'name': 'Telugu',
        'bmp': '\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C78-\u0C7F'
    },
    {
        'name': 'Thaana',
        'bmp': '\u0780-\u07B1'
    },
    {
        'name': 'Thai',
        'bmp': '\u0E01-\u0E3A\u0E40-\u0E5B'
    },
    {
        'name': 'Tibetan',
        'bmp': '\u0F00-\u0F47\u0F49-\u0F6C\u0F71-\u0F97\u0F99-\u0FBC\u0FBE-\u0FCC\u0FCE-\u0FD4\u0FD9\u0FDA'
    },
    {
        'name': 'Tifinagh',
        'bmp': '\u2D30-\u2D67\u2D6F\u2D70\u2D7F'
    },
    {
        'name': 'Tirhuta',
        'astral': '\uD805[\uDC80-\uDCC7\uDCD0-\uDCD9]'
    },
    {
        'name': 'Ugaritic',
        'astral': '\uD800[\uDF80-\uDF9D\uDF9F]'
    },
    {
        'name': 'Vai',
        'bmp': '\uA500-\uA62B'
    },
    {
        'name': 'Warang_Citi',
        'astral': '\uD806[\uDCA0-\uDCF2\uDCFF]'
    },
    {
        'name': 'Yi',
        'bmp': '\uA000-\uA48C\uA490-\uA4C6'
    },
    {
        'name': 'Zanabazar_Square',
        'astral': '\uD806[\uDE00-\uDE47]'
    }
];

var unicodeScripts = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _scripts = _interopRequireDefault(scripts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * XRegExp Unicode Scripts 4.2.0
 * <xregexp.com>
 * Steven Levithan (c) 2010-present MIT License
 * Unicode data by Mathias Bynens <mathiasbynens.be>
 */
var _default = function _default(XRegExp) {
  /**
   * Adds support for all Unicode scripts. E.g., `\p{Latin}`. Token names are case insensitive,
   * and any spaces, hyphens, and underscores are ignored.
   *
   * Uses Unicode 11.0.0.
   *
   * @requires XRegExp, Unicode Base
   */
  if (!XRegExp.addUnicodeData) {
    throw new ReferenceError('Unicode Base must be loaded before Unicode Scripts');
  }

  XRegExp.addUnicodeData(_scripts.default);
};

exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(unicodeScripts);

var lib = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _xregexp = _interopRequireDefault(xregexp);

var _build = _interopRequireDefault(build);

var _matchrecursive = _interopRequireDefault(matchrecursive);

var _unicodeBase = _interopRequireDefault(unicodeBase);

var _unicodeBlocks = _interopRequireDefault(unicodeBlocks);

var _unicodeCategories = _interopRequireDefault(unicodeCategories);

var _unicodeProperties = _interopRequireDefault(unicodeProperties);

var _unicodeScripts = _interopRequireDefault(unicodeScripts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(_build.default)(_xregexp.default);
(_matchrecursive.default)(_xregexp.default);
(_unicodeBase.default)(_xregexp.default);
(_unicodeBlocks.default)(_xregexp.default);
(_unicodeCategories.default)(_xregexp.default);
(_unicodeProperties.default)(_xregexp.default);
(_unicodeScripts.default)(_xregexp.default);
var _default = _xregexp.default;
exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(lib);

var utilities = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

class FormatUtility {
    static preProcess(query, toLower = true) {
        if (toLower) {
            query = query.toLowerCase();
        }
        return query
            .replace(/０/g, "0")
            .replace(/１/g, "1")
            .replace(/２/g, "2")
            .replace(/３/g, "3")
            .replace(/４/g, "4")
            .replace(/５/g, "5")
            .replace(/６/g, "6")
            .replace(/７/g, "7")
            .replace(/８/g, "8")
            .replace(/９/g, "9")
            .replace(/：/g, ":")
            .replace(/－/g, "-")
            .replace(/，/g, ",")
            .replace(/／/g, "/")
            .replace(/Ｇ/g, "G")
            .replace(/Ｍ/g, "M")
            .replace(/Ｔ/g, "T")
            .replace(/Ｋ/g, "K")
            .replace(/ｋ/g, "k")
            .replace(/．/g, ".")
            .replace(/（/g, "(")
            .replace(/）/g, ")");
    }
}
exports.FormatUtility = FormatUtility;
class Match {
    constructor(index, length, value, groups) {
        this.index = index;
        this.length = length;
        this.value = value;
        this.innerGroups = groups;
    }
    groups(key) {
        return this.innerGroups[key] ? this.innerGroups[key] : { value: '', index: 0, length: 0, captures: [] };
    }
}
exports.Match = Match;
class RegExpUtility {
    static getMatches(regex, source) {
        if (!regex)
            return [];
        let rawRegex = regex.xregexp.source;
        if (!rawRegex.includes('(?<nlb__')) {
            return this.getMatchesSimple(regex, source);
        }
        let realMatches = new Array();
        let negativeLookbehindRegexes = new Array();
        let flags = regex.flags;
        let closePos = 0;
        let startPos = rawRegex.indexOf('(?<nlb__', 0);
        while (startPos >= 0) {
            closePos = this.getClosePos(rawRegex, startPos);
            let nlbRegex = lib(rawRegex.substring(startPos, closePos + 1), flags);
            let nextRegex = RegExpUtility.getNextRegex(rawRegex, startPos);
            nlbRegex.nextRegex = nextRegex ? lib(nextRegex, flags) : null;
            negativeLookbehindRegexes.push(nlbRegex);
            rawRegex = rawRegex.substr(0, startPos) + rawRegex.substr(closePos + 1);
            startPos = rawRegex.indexOf('(?<nlb__', 0);
        }
        let tempRegex = lib(rawRegex, flags);
        let tempMatches = RegExpUtility.getMatchesSimple(tempRegex, source);
        tempMatches.forEach(match => {
            let clean = true;
            negativeLookbehindRegexes.forEach(regex => {
                let negativeLookbehindMatches = RegExpUtility.getMatchesSimple(regex, source);
                negativeLookbehindMatches.forEach(negativeLookbehindMatch => {
                    let negativeLookbehindEnd = negativeLookbehindMatch.index + negativeLookbehindMatch.length;
                    let nextRegex = regex.nextRegex;
                    if (match.index === negativeLookbehindEnd) {
                        if (!nextRegex) {
                            clean = false;
                            return;
                        }
                        else {
                            let nextMatch = RegExpUtility.getFirstMatchIndex(nextRegex, source.substring(negativeLookbehindMatch.index));
                            if (nextMatch.matched && ((nextMatch.index === negativeLookbehindMatch.length) || (source.includes(nextMatch.value + match.value)))) {
                                clean = false;
                                return;
                            }
                        }
                    }
                    if (negativeLookbehindMatch.value.includes(match.value)) {
                        let preMatches = RegExpUtility.getMatchesSimple(regex, source.substring(0, match.index));
                        preMatches.forEach(preMatch => {
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
        // Word boundary (\b) in JS is not unicode-aware, so words starting/ending with accentuated characters will not match
        // use a normalized string to match, the return matches' values using the original one
        // http://blog.stevenlevithan.com/archives/javascript-regex-and-unicode
        // https://stackoverflow.com/questions/2881445/utf-8-word-boundary-regex-in-javascript
        let normalized = StringUtility.removeDiacriticsFromWordBoundaries(source);
        let matches = new Array();
        lib.forEach(normalized, regex, match => {
            let positiveLookbehinds = [];
            let groups = {};
            let lastGroup = '';
            Object.keys(match).forEach(key => {
                if (!key.includes('__'))
                    return;
                if (key.startsWith('plb') && match[key]) {
                    if (match[0].indexOf(match[key]) !== 0 && !StringUtility.isNullOrEmpty(lastGroup)) {
                        let index = match.index + match[0].indexOf(match[key]);
                        let length = match[key].length;
                        let value = source.substr(index, length);
                        groups[lastGroup].value = groups[lastGroup].value + value;
                    }
                    positiveLookbehinds.push({ key: key, value: match[key] });
                    return;
                }
                if (key.startsWith('nlb')) {
                    return;
                }
                let groupKey = key.substr(0, key.lastIndexOf('__'));
                lastGroup = groupKey;
                if (!groups[groupKey])
                    groups[groupKey] = { value: '', index: 0, length: 0, captures: [] };
                if (match[key]) {
                    let index = match.index + match[0].indexOf(match[key]);
                    let length = match[key].length;
                    let value = source.substr(index, length);
                    groups[groupKey].index = index;
                    groups[groupKey].length = length;
                    groups[groupKey].value = value;
                    groups[groupKey].captures.push(value);
                }
            });
            let value = match[0];
            let index = match.index;
            let length = value.length;
            if (positiveLookbehinds && positiveLookbehinds.length > 0 && value.indexOf(positiveLookbehinds[0].value) === 0) {
                value = source.substr(index, length).substr(positiveLookbehinds[0].value.length);
                index += positiveLookbehinds[0].value.length;
                length -= positiveLookbehinds[0].value.length;
            }
            else {
                value = source.substr(index, length);
            }
            matches.push(new Match(index, length, value, groups));
        });
        return matches;
    }
    static getSafeRegExp(source, flags) {
        let sanitizedSource = this.sanitizeGroups(source);
        return lib(sanitizedSource, flags || 'gis');
    }
    static getFirstMatchIndex(regex, source) {
        let matches = RegExpUtility.getMatches(regex, source);
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
        return lib.split(source, regex);
    }
    static isMatch(regex, source) {
        return !StringUtility.isNullOrEmpty(source)
            && this.getMatches(regex, source).length > 0;
    }
    static sanitizeGroups(source) {
        let index = 0;
        let result = lib.replace(source, this.matchGroup, (match, name) => match.replace(name, `${name}__${index++}`));
        index = 0;
        result = lib.replace(result, this.matchPositiveLookbehind, () => `(?<plb__${index++}>`);
        index = 0;
        result = lib.replace(result, this.matchNegativeLookbehind, () => `(?<nlb__${index++}>`);
        return result;
    }
    static getNextRegex(source, startPos) {
        startPos = RegExpUtility.getClosePos(source, startPos) + 1;
        let closePos = RegExpUtility.getClosePos(source, startPos);
        if (source[startPos] !== '(') {
            closePos--;
        }
        let next = (startPos === closePos)
            ? null
            : source.substring(startPos, closePos + 1);
        return next;
    }
    static getClosePos(source, startPos) {
        let counter = 1;
        let closePos = startPos;
        while (counter > 0 && closePos < source.length) {
            let c = source[++closePos];
            if (c === '(')
                counter++;
            else if (c === ')')
                counter--;
        }
        return closePos;
    }
}
RegExpUtility.matchGroup = lib(String.raw `\?<(?<name>\w+)>`, 'gis');
RegExpUtility.matchPositiveLookbehind = lib(String.raw `\(\?<=`, 'gis');
RegExpUtility.matchNegativeLookbehind = lib(String.raw `\(\?<!`, 'gis');
exports.RegExpUtility = RegExpUtility;
class StringUtility {
    static isNullOrWhitespace(input) {
        return !input || !input.trim();
    }
    static isNullOrEmpty(input) {
        return !input || input === '';
    }
    static isWhitespace(input) {
        return input && input !== '' && !input.trim();
    }
    static insertInto(input, value, index) {
        return input.substr(0, index) + value + input.substr(index);
    }
    static removeDiacriticsFromWordBoundaries(input) {
        return input
            .split(' ')
            .map((s) => {
            let length = s.length;
            if (length === 0)
                return s;
            let first = StringUtility.removeDiacritics(s.substring(0, 1));
            if (length === 1)
                return first;
            let last = length > 1 ? StringUtility.removeDiacritics(s.substring(length - 1)) : '';
            let mid = s.substring(1, length - 1);
            // console.log(first + mid + last)
            return first + mid + last;
        })
            .join(' ');
    }
    static removeDiacritics(c) {
        let clean = StringUtility.diacriticsRemovalMap[c];
        return !clean ? c : clean;
    }
}
StringUtility.diacriticsRemovalMap = {
    "Ⓐ": "A",
    "Ａ": "A",
    "À": "A",
    "Á": "A",
    "Â": "A",
    "Ầ": "A",
    "Ấ": "A",
    "Ẫ": "A",
    "Ẩ": "A",
    "Ã": "A",
    "Ā": "A",
    "Ă": "A",
    "Ằ": "A",
    "Ắ": "A",
    "Ẵ": "A",
    "Ẳ": "A",
    "Ȧ": "A",
    "Ǡ": "A",
    "Ä": "A",
    "Ǟ": "A",
    "Ả": "A",
    "Å": "A",
    "Ǻ": "A",
    "Ǎ": "A",
    "Ȁ": "A",
    "Ȃ": "A",
    "Ạ": "A",
    "Ậ": "A",
    "Ặ": "A",
    "Ḁ": "A",
    "Ą": "A",
    "Ⱥ": "A",
    "Ɐ": "A",
    "Ⓑ": "B",
    "Ｂ": "B",
    "Ḃ": "B",
    "Ḅ": "B",
    "Ḇ": "B",
    "Ƀ": "B",
    "Ƃ": "B",
    "Ɓ": "B",
    "Ⓒ": "C",
    "Ｃ": "C",
    "Ć": "C",
    "Ĉ": "C",
    "Ċ": "C",
    "Č": "C",
    "Ç": "C",
    "Ḉ": "C",
    "Ƈ": "C",
    "Ȼ": "C",
    "Ꜿ": "C",
    "Ⓓ": "D",
    "Ｄ": "D",
    "Ḋ": "D",
    "Ď": "D",
    "Ḍ": "D",
    "Ḑ": "D",
    "Ḓ": "D",
    "Ḏ": "D",
    "Đ": "D",
    "Ƌ": "D",
    "Ɗ": "D",
    "Ɖ": "D",
    "Ꝺ": "D",
    "Ⓔ": "E",
    "Ｅ": "E",
    "È": "E",
    "É": "E",
    "Ê": "E",
    "Ề": "E",
    "Ế": "E",
    "Ễ": "E",
    "Ể": "E",
    "Ẽ": "E",
    "Ē": "E",
    "Ḕ": "E",
    "Ḗ": "E",
    "Ĕ": "E",
    "Ė": "E",
    "Ë": "E",
    "Ẻ": "E",
    "Ě": "E",
    "Ȅ": "E",
    "Ȇ": "E",
    "Ẹ": "E",
    "Ệ": "E",
    "Ȩ": "E",
    "Ḝ": "E",
    "Ę": "E",
    "Ḙ": "E",
    "Ḛ": "E",
    "Ɛ": "E",
    "Ǝ": "E",
    "Ⓕ": "F",
    "Ｆ": "F",
    "Ḟ": "F",
    "Ƒ": "F",
    "Ꝼ": "F",
    "Ⓖ": "G",
    "Ｇ": "G",
    "Ǵ": "G",
    "Ĝ": "G",
    "Ḡ": "G",
    "Ğ": "G",
    "Ġ": "G",
    "Ǧ": "G",
    "Ģ": "G",
    "Ǥ": "G",
    "Ɠ": "G",
    "Ꞡ": "G",
    "Ᵹ": "G",
    "Ꝿ": "G",
    "Ⓗ": "H",
    "Ｈ": "H",
    "Ĥ": "H",
    "Ḣ": "H",
    "Ḧ": "H",
    "Ȟ": "H",
    "Ḥ": "H",
    "Ḩ": "H",
    "Ḫ": "H",
    "Ħ": "H",
    "Ⱨ": "H",
    "Ⱶ": "H",
    "Ɥ": "H",
    "Ⓘ": "I",
    "Ｉ": "I",
    "Ì": "I",
    "Í": "I",
    "Î": "I",
    "Ĩ": "I",
    "Ī": "I",
    "Ĭ": "I",
    "İ": "I",
    "Ï": "I",
    "Ḯ": "I",
    "Ỉ": "I",
    "Ǐ": "I",
    "Ȉ": "I",
    "Ȋ": "I",
    "Ị": "I",
    "Į": "I",
    "Ḭ": "I",
    "Ɨ": "I",
    "Ⓙ": "J",
    "Ｊ": "J",
    "Ĵ": "J",
    "Ɉ": "J",
    "Ⓚ": "K",
    "Ｋ": "K",
    "Ḱ": "K",
    "Ǩ": "K",
    "Ḳ": "K",
    "Ķ": "K",
    "Ḵ": "K",
    "Ƙ": "K",
    "Ⱪ": "K",
    "Ꝁ": "K",
    "Ꝃ": "K",
    "Ꝅ": "K",
    "Ꞣ": "K",
    "Ⓛ": "L",
    "Ｌ": "L",
    "Ŀ": "L",
    "Ĺ": "L",
    "Ľ": "L",
    "Ḷ": "L",
    "Ḹ": "L",
    "Ļ": "L",
    "Ḽ": "L",
    "Ḻ": "L",
    "Ł": "L",
    "Ƚ": "L",
    "Ɫ": "L",
    "Ⱡ": "L",
    "Ꝉ": "L",
    "Ꝇ": "L",
    "Ꞁ": "L",
    "Ⓜ": "M",
    "Ｍ": "M",
    "Ḿ": "M",
    "Ṁ": "M",
    "Ṃ": "M",
    "Ɱ": "M",
    "Ɯ": "M",
    "Ⓝ": "N",
    "Ｎ": "N",
    "Ǹ": "N",
    "Ń": "N",
    "Ñ": "N",
    "Ṅ": "N",
    "Ň": "N",
    "Ṇ": "N",
    "Ņ": "N",
    "Ṋ": "N",
    "Ṉ": "N",
    "Ƞ": "N",
    "Ɲ": "N",
    "Ꞑ": "N",
    "Ꞥ": "N",
    "Ⓞ": "O",
    "Ｏ": "O",
    "Ò": "O",
    "Ó": "O",
    "Ô": "O",
    "Ồ": "O",
    "Ố": "O",
    "Ỗ": "O",
    "Ổ": "O",
    "Õ": "O",
    "Ṍ": "O",
    "Ȭ": "O",
    "Ṏ": "O",
    "Ō": "O",
    "Ṑ": "O",
    "Ṓ": "O",
    "Ŏ": "O",
    "Ȯ": "O",
    "Ȱ": "O",
    "Ö": "O",
    "Ȫ": "O",
    "Ỏ": "O",
    "Ő": "O",
    "Ǒ": "O",
    "Ȍ": "O",
    "Ȏ": "O",
    "Ơ": "O",
    "Ờ": "O",
    "Ớ": "O",
    "Ỡ": "O",
    "Ở": "O",
    "Ợ": "O",
    "Ọ": "O",
    "Ộ": "O",
    "Ǫ": "O",
    "Ǭ": "O",
    "Ø": "O",
    "Ǿ": "O",
    "Ɔ": "O",
    "Ɵ": "O",
    "Ꝋ": "O",
    "Ꝍ": "O",
    "Ⓟ": "P",
    "Ｐ": "P",
    "Ṕ": "P",
    "Ṗ": "P",
    "Ƥ": "P",
    "Ᵽ": "P",
    "Ꝑ": "P",
    "Ꝓ": "P",
    "Ꝕ": "P",
    "Ⓠ": "Q",
    "Ｑ": "Q",
    "Ꝗ": "Q",
    "Ꝙ": "Q",
    "Ɋ": "Q",
    "Ⓡ": "R",
    "Ｒ": "R",
    "Ŕ": "R",
    "Ṙ": "R",
    "Ř": "R",
    "Ȑ": "R",
    "Ȓ": "R",
    "Ṛ": "R",
    "Ṝ": "R",
    "Ŗ": "R",
    "Ṟ": "R",
    "Ɍ": "R",
    "Ɽ": "R",
    "Ꝛ": "R",
    "Ꞧ": "R",
    "Ꞃ": "R",
    "Ⓢ": "S",
    "Ｓ": "S",
    "ẞ": "S",
    "Ś": "S",
    "Ṥ": "S",
    "Ŝ": "S",
    "Ṡ": "S",
    "Š": "S",
    "Ṧ": "S",
    "Ṣ": "S",
    "Ṩ": "S",
    "Ș": "S",
    "Ş": "S",
    "Ȿ": "S",
    "Ꞩ": "S",
    "Ꞅ": "S",
    "Ⓣ": "T",
    "Ｔ": "T",
    "Ṫ": "T",
    "Ť": "T",
    "Ṭ": "T",
    "Ț": "T",
    "Ţ": "T",
    "Ṱ": "T",
    "Ṯ": "T",
    "Ŧ": "T",
    "Ƭ": "T",
    "Ʈ": "T",
    "Ⱦ": "T",
    "Ꞇ": "T",
    "Ⓤ": "U",
    "Ｕ": "U",
    "Ù": "U",
    "Ú": "U",
    "Û": "U",
    "Ũ": "U",
    "Ṹ": "U",
    "Ū": "U",
    "Ṻ": "U",
    "Ŭ": "U",
    "Ü": "U",
    "Ǜ": "U",
    "Ǘ": "U",
    "Ǖ": "U",
    "Ǚ": "U",
    "Ủ": "U",
    "Ů": "U",
    "Ű": "U",
    "Ǔ": "U",
    "Ȕ": "U",
    "Ȗ": "U",
    "Ư": "U",
    "Ừ": "U",
    "Ứ": "U",
    "Ữ": "U",
    "Ử": "U",
    "Ự": "U",
    "Ụ": "U",
    "Ṳ": "U",
    "Ų": "U",
    "Ṷ": "U",
    "Ṵ": "U",
    "Ʉ": "U",
    "Ⓥ": "V",
    "Ｖ": "V",
    "Ṽ": "V",
    "Ṿ": "V",
    "Ʋ": "V",
    "Ꝟ": "V",
    "Ʌ": "V",
    "Ⓦ": "W",
    "Ｗ": "W",
    "Ẁ": "W",
    "Ẃ": "W",
    "Ŵ": "W",
    "Ẇ": "W",
    "Ẅ": "W",
    "Ẉ": "W",
    "Ⱳ": "W",
    "Ⓧ": "X",
    "Ｘ": "X",
    "Ẋ": "X",
    "Ẍ": "X",
    "Ⓨ": "Y",
    "Ｙ": "Y",
    "Ỳ": "Y",
    "Ý": "Y",
    "Ŷ": "Y",
    "Ỹ": "Y",
    "Ȳ": "Y",
    "Ẏ": "Y",
    "Ÿ": "Y",
    "Ỷ": "Y",
    "Ỵ": "Y",
    "Ƴ": "Y",
    "Ɏ": "Y",
    "Ỿ": "Y",
    "Ⓩ": "Z",
    "Ｚ": "Z",
    "Ź": "Z",
    "Ẑ": "Z",
    "Ż": "Z",
    "Ž": "Z",
    "Ẓ": "Z",
    "Ẕ": "Z",
    "Ƶ": "Z",
    "Ȥ": "Z",
    "Ɀ": "Z",
    "Ⱬ": "Z",
    "Ꝣ": "Z",
    "ⓐ": "a",
    "ａ": "a",
    "ẚ": "a",
    "à": "a",
    "á": "a",
    "â": "a",
    "ầ": "a",
    "ấ": "a",
    "ẫ": "a",
    "ẩ": "a",
    "ã": "a",
    "ā": "a",
    "ă": "a",
    "ằ": "a",
    "ắ": "a",
    "ẵ": "a",
    "ẳ": "a",
    "ȧ": "a",
    "ǡ": "a",
    "ä": "a",
    "ǟ": "a",
    "ả": "a",
    "å": "a",
    "ǻ": "a",
    "ǎ": "a",
    "ȁ": "a",
    "ȃ": "a",
    "ạ": "a",
    "ậ": "a",
    "ặ": "a",
    "ḁ": "a",
    "ą": "a",
    "ⱥ": "a",
    "ɐ": "a",
    "ⓑ": "b",
    "ｂ": "b",
    "ḃ": "b",
    "ḅ": "b",
    "ḇ": "b",
    "ƀ": "b",
    "ƃ": "b",
    "ɓ": "b",
    "ⓒ": "c",
    "ｃ": "c",
    "ć": "c",
    "ĉ": "c",
    "ċ": "c",
    "č": "c",
    "ç": "c",
    "ḉ": "c",
    "ƈ": "c",
    "ȼ": "c",
    "ꜿ": "c",
    "ↄ": "c",
    "ⓓ": "d",
    "ｄ": "d",
    "ḋ": "d",
    "ď": "d",
    "ḍ": "d",
    "ḑ": "d",
    "ḓ": "d",
    "ḏ": "d",
    "đ": "d",
    "ƌ": "d",
    "ɖ": "d",
    "ɗ": "d",
    "ꝺ": "d",
    "ⓔ": "e",
    "ｅ": "e",
    "è": "e",
    "é": "e",
    "ê": "e",
    "ề": "e",
    "ế": "e",
    "ễ": "e",
    "ể": "e",
    "ẽ": "e",
    "ē": "e",
    "ḕ": "e",
    "ḗ": "e",
    "ĕ": "e",
    "ė": "e",
    "ë": "e",
    "ẻ": "e",
    "ě": "e",
    "ȅ": "e",
    "ȇ": "e",
    "ẹ": "e",
    "ệ": "e",
    "ȩ": "e",
    "ḝ": "e",
    "ę": "e",
    "ḙ": "e",
    "ḛ": "e",
    "ɇ": "e",
    "ɛ": "e",
    "ǝ": "e",
    "ⓕ": "f",
    "ｆ": "f",
    "ḟ": "f",
    "ƒ": "f",
    "ꝼ": "f",
    "ⓖ": "g",
    "ｇ": "g",
    "ǵ": "g",
    "ĝ": "g",
    "ḡ": "g",
    "ğ": "g",
    "ġ": "g",
    "ǧ": "g",
    "ģ": "g",
    "ǥ": "g",
    "ɠ": "g",
    "ꞡ": "g",
    "ᵹ": "g",
    "ꝿ": "g",
    "ⓗ": "h",
    "ｈ": "h",
    "ĥ": "h",
    "ḣ": "h",
    "ḧ": "h",
    "ȟ": "h",
    "ḥ": "h",
    "ḩ": "h",
    "ḫ": "h",
    "ẖ": "h",
    "ħ": "h",
    "ⱨ": "h",
    "ⱶ": "h",
    "ɥ": "h",
    "ⓘ": "i",
    "ｉ": "i",
    "ì": "i",
    "í": "i",
    "î": "i",
    "ĩ": "i",
    "ī": "i",
    "ĭ": "i",
    "ï": "i",
    "ḯ": "i",
    "ỉ": "i",
    "ǐ": "i",
    "ȉ": "i",
    "ȋ": "i",
    "ị": "i",
    "į": "i",
    "ḭ": "i",
    "ɨ": "i",
    "ı": "i",
    "ⓙ": "j",
    "ｊ": "j",
    "ĵ": "j",
    "ǰ": "j",
    "ɉ": "j",
    "ⓚ": "k",
    "ｋ": "k",
    "ḱ": "k",
    "ǩ": "k",
    "ḳ": "k",
    "ķ": "k",
    "ḵ": "k",
    "ƙ": "k",
    "ⱪ": "k",
    "ꝁ": "k",
    "ꝃ": "k",
    "ꝅ": "k",
    "ꞣ": "k",
    "ⓛ": "l",
    "ｌ": "l",
    "ŀ": "l",
    "ĺ": "l",
    "ľ": "l",
    "ḷ": "l",
    "ḹ": "l",
    "ļ": "l",
    "ḽ": "l",
    "ḻ": "l",
    "ſ": "l",
    "ł": "l",
    "ƚ": "l",
    "ɫ": "l",
    "ⱡ": "l",
    "ꝉ": "l",
    "ꞁ": "l",
    "ꝇ": "l",
    "ⓜ": "m",
    "ｍ": "m",
    "ḿ": "m",
    "ṁ": "m",
    "ṃ": "m",
    "ɱ": "m",
    "ɯ": "m",
    "ⓝ": "n",
    "ｎ": "n",
    "ǹ": "n",
    "ń": "n",
    "ñ": "n",
    "ṅ": "n",
    "ň": "n",
    "ṇ": "n",
    "ņ": "n",
    "ṋ": "n",
    "ṉ": "n",
    "ƞ": "n",
    "ɲ": "n",
    "ŉ": "n",
    "ꞑ": "n",
    "ꞥ": "n",
    "ⓞ": "o",
    "ｏ": "o",
    "ò": "o",
    "ó": "o",
    "ô": "o",
    "ồ": "o",
    "ố": "o",
    "ỗ": "o",
    "ổ": "o",
    "õ": "o",
    "ṍ": "o",
    "ȭ": "o",
    "ṏ": "o",
    "ō": "o",
    "ṑ": "o",
    "ṓ": "o",
    "ŏ": "o",
    "ȯ": "o",
    "ȱ": "o",
    "ö": "o",
    "ȫ": "o",
    "ỏ": "o",
    "ő": "o",
    "ǒ": "o",
    "ȍ": "o",
    "ȏ": "o",
    "ơ": "o",
    "ờ": "o",
    "ớ": "o",
    "ỡ": "o",
    "ở": "o",
    "ợ": "o",
    "ọ": "o",
    "ộ": "o",
    "ǫ": "o",
    "ǭ": "o",
    "ø": "o",
    "ǿ": "o",
    "ɔ": "o",
    "ꝋ": "o",
    "ꝍ": "o",
    "ɵ": "o",
    "ⓟ": "p",
    "ｐ": "p",
    "ṕ": "p",
    "ṗ": "p",
    "ƥ": "p",
    "ᵽ": "p",
    "ꝑ": "p",
    "ꝓ": "p",
    "ꝕ": "p",
    "ⓠ": "q",
    "ｑ": "q",
    "ɋ": "q",
    "ꝗ": "q",
    "ꝙ": "q",
    "ⓡ": "r",
    "ｒ": "r",
    "ŕ": "r",
    "ṙ": "r",
    "ř": "r",
    "ȑ": "r",
    "ȓ": "r",
    "ṛ": "r",
    "ṝ": "r",
    "ŗ": "r",
    "ṟ": "r",
    "ɍ": "r",
    "ɽ": "r",
    "ꝛ": "r",
    "ꞧ": "r",
    "ꞃ": "r",
    "ⓢ": "s",
    "ｓ": "s",
    "ß": "s",
    "ś": "s",
    "ṥ": "s",
    "ŝ": "s",
    "ṡ": "s",
    "š": "s",
    "ṧ": "s",
    "ṣ": "s",
    "ṩ": "s",
    "ș": "s",
    "ş": "s",
    "ȿ": "s",
    "ꞩ": "s",
    "ꞅ": "s",
    "ẛ": "s",
    "ⓣ": "t",
    "ｔ": "t",
    "ṫ": "t",
    "ẗ": "t",
    "ť": "t",
    "ṭ": "t",
    "ț": "t",
    "ţ": "t",
    "ṱ": "t",
    "ṯ": "t",
    "ŧ": "t",
    "ƭ": "t",
    "ʈ": "t",
    "ⱦ": "t",
    "ꞇ": "t",
    "ⓤ": "u",
    "ｕ": "u",
    "ù": "u",
    "ú": "u",
    "û": "u",
    "ũ": "u",
    "ṹ": "u",
    "ū": "u",
    "ṻ": "u",
    "ŭ": "u",
    "ü": "u",
    "ǜ": "u",
    "ǘ": "u",
    "ǖ": "u",
    "ǚ": "u",
    "ủ": "u",
    "ů": "u",
    "ű": "u",
    "ǔ": "u",
    "ȕ": "u",
    "ȗ": "u",
    "ư": "u",
    "ừ": "u",
    "ứ": "u",
    "ữ": "u",
    "ử": "u",
    "ự": "u",
    "ụ": "u",
    "ṳ": "u",
    "ų": "u",
    "ṷ": "u",
    "ṵ": "u",
    "ʉ": "u",
    "ⓥ": "v",
    "ｖ": "v",
    "ṽ": "v",
    "ṿ": "v",
    "ʋ": "v",
    "ꝟ": "v",
    "ʌ": "v",
    "ⓦ": "w",
    "ｗ": "w",
    "ẁ": "w",
    "ẃ": "w",
    "ŵ": "w",
    "ẇ": "w",
    "ẅ": "w",
    "ẘ": "w",
    "ẉ": "w",
    "ⱳ": "w",
    "ⓧ": "x",
    "ｘ": "x",
    "ẋ": "x",
    "ẍ": "x",
    "ⓨ": "y",
    "ｙ": "y",
    "ỳ": "y",
    "ý": "y",
    "ŷ": "y",
    "ỹ": "y",
    "ȳ": "y",
    "ẏ": "y",
    "ÿ": "y",
    "ỷ": "y",
    "ẙ": "y",
    "ỵ": "y",
    "ƴ": "y",
    "ɏ": "y",
    "ỿ": "y",
    "ⓩ": "z",
    "ｚ": "z",
    "ź": "z",
    "ẑ": "z",
    "ż": "z",
    "ž": "z",
    "ẓ": "z",
    "ẕ": "z",
    "ƶ": "z",
    "ȥ": "z",
    "ɀ": "z",
    "ⱬ": "z",
    "ꝣ": "z"
};
exports.StringUtility = StringUtility;

});

unwrapExports(utilities);

var models = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });


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
    constructor(culture$$1, modelType, options = null) {
        this.culture = culture$$1 ? culture$$1.toLowerCase() : null;
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
    getModel(modelTypeName, culture$$1, fallbackToDefaultCulture, options) {
        let result = this.tryGetModel(modelTypeName, culture$$1, options);
        if (!result.containsModel && fallbackToDefaultCulture) {
            result = this.tryGetModel(modelTypeName, ModelFactory.fallbackCulture, options);
        }
        if (result.containsModel) {
            return result.model;
        }
        throw new Error(`Could not find Model with the specified configuration: ${culture$$1},${modelTypeName}`);
    }
    tryGetModel(modelTypeName, culture$$1, options) {
        culture$$1 = culture.Culture.mapToNearestLanguage(culture$$1);
        let cacheResult = this.getModelFromCache(modelTypeName, culture$$1, options);
        if (cacheResult)
            return { containsModel: true, model: cacheResult };
        let key = this.generateKey(modelTypeName, culture$$1);
        if (this.modelFactories.has(key)) {
            let model = this.modelFactories.get(key)(options);
            this.registerModelInCache(modelTypeName, culture$$1, options, model);
            return { containsModel: true, model: model };
        }
        return { containsModel: false };
    }
    registerModel(modelTypeName, culture$$1, modelCreator) {
        let key = this.generateKey(modelTypeName, culture$$1);
        if (this.modelFactories.has(key)) {
            throw new Error(`${culture$$1}-${modelTypeName} has already been registered.`);
        }
        this.modelFactories.set(key, modelCreator);
    }
    initializeModels(targetCulture, options) {
        this.modelFactories.forEach((value, key) => {
            let modelFactoryKey = ModelFactoryKey.fromString(key);
            if (utilities.StringUtility.isNullOrEmpty(targetCulture) || modelFactoryKey.culture === targetCulture) {
                this.tryGetModel(modelFactoryKey.modelType, modelFactoryKey.culture, modelFactoryKey.options);
            }
        });
    }
    generateKey(modelTypeName, culture$$1) {
        return new ModelFactoryKey(culture$$1, modelTypeName).toString();
    }
    getModelFromCache(modelTypeName, culture$$1, options) {
        let key = this.generateCacheKey(modelTypeName, culture$$1, options);
        return ModelFactory.cache.get(key);
    }
    registerModelInCache(modelTypeName, culture$$1, options, model) {
        let key = this.generateCacheKey(modelTypeName, culture$$1, options);
        ModelFactory.cache.set(key, model);
    }
    generateCacheKey(modelTypeName, culture$$1, options) {
        return new ModelFactoryKey(culture$$1, modelTypeName, options).toString();
    }
}
ModelFactory.fallbackCulture = culture.Culture.English;
ModelFactory.cache = new Map();
exports.ModelFactory = ModelFactory;

});

unwrapExports(models);

var recognizer = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

class Recognizer {
    constructor(targetCulture, options, lazyInitialization) {
        this.modelFactory = new models.ModelFactory();
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

});

unwrapExports(recognizer);

var extractors = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExtractResult {
    static isOverlap(erA, erB) {
        return !(erA.start >= erB.start + erB.length) && !(erB.start >= erA.start + erA.length);
    }
    static isCover(er1, er2) {
        return ((er2.start < er1.start) && ((er2.start + er2.length) >= (er1.start + er1.length)))
            || ((er2.start <= er1.start) && ((er2.start + er2.length) > (er1.start + er1.length)));
    }
    static getFromText(source) {
        return {
            start: 0,
            length: source.length,
            text: source,
            type: 'custom'
        };
    }
}
exports.ExtractResult = ExtractResult;

});

unwrapExports(extractors);

var parsers = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

class ParseResult extends extractors.ExtractResult {
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
}
exports.ParseResult = ParseResult;

});

unwrapExports(parsers);

var recognizersText = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

exports.Culture = culture.Culture;
exports.CultureInfo = culture.CultureInfo;

exports.ModelResult = models.ModelResult;
exports.ModelFactory = models.ModelFactory;

exports.Recognizer = recognizer.Recognizer;

exports.ExtractResult = extractors.ExtractResult;

exports.ParseResult = parsers.ParseResult;

exports.FormatUtility = utilities.FormatUtility;
exports.StringUtility = utilities.StringUtility;
exports.Match = utilities.Match;
exports.RegExpUtility = utilities.RegExpUtility;

});

unwrapExports(recognizersText);

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrimEnd = /\s+$/;

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
var rsComboSymbolsRange = '\\u20d0-\\u20f0';
var rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']';
var rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange + ']?';
var rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return baseFindIndex(array, baseIsNaN, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the last unmatched string symbol.
 */
function charsEndIndex(strSymbols, chrSymbols) {
  var index = strSymbols.length;

  while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
var symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Removes trailing whitespace or specified characters from `string`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {string} Returns the trimmed string.
 * @example
 *
 * _.trimEnd('  abc  ');
 * // => '  abc'
 *
 * _.trimEnd('-_-abc-_-', '_-');
 * // => '-_-abc'
 */
function trimEnd(string, chars, guard) {
  string = toString(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrimEnd, '');
  }
  if (!string || !(chars = baseToString(chars))) {
    return string;
  }
  var strSymbols = stringToArray(string),
      end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;

  return castSlice(strSymbols, 0, end).join('');
}

var lodash_trimend = trimEnd;

var bignumber = createCommonjsModule(function (module) {
(function (globalObject) {
  'use strict';

/*
 *      bignumber.js v7.2.1
 *      A JavaScript library for arbitrary-precision arithmetic.
 *      https://github.com/MikeMcl/bignumber.js
 *      Copyright (c) 2018 Michael Mclaughlin <M8ch88l@gmail.com>
 *      MIT Licensed.
 *
 *      BigNumber.prototype methods     |  BigNumber methods
 *                                      |
 *      absoluteValue            abs    |  clone
 *      comparedTo                      |  config               set
 *      decimalPlaces            dp     |      DECIMAL_PLACES
 *      dividedBy                div    |      ROUNDING_MODE
 *      dividedToIntegerBy       idiv   |      EXPONENTIAL_AT
 *      exponentiatedBy          pow    |      RANGE
 *      integerValue                    |      CRYPTO
 *      isEqualTo                eq     |      MODULO_MODE
 *      isFinite                        |      POW_PRECISION
 *      isGreaterThan            gt     |      FORMAT
 *      isGreaterThanOrEqualTo   gte    |      ALPHABET
 *      isInteger                       |  isBigNumber
 *      isLessThan               lt     |  maximum              max
 *      isLessThanOrEqualTo      lte    |  minimum              min
 *      isNaN                           |  random
 *      isNegative                      |
 *      isPositive                      |
 *      isZero                          |
 *      minus                           |
 *      modulo                   mod    |
 *      multipliedBy             times  |
 *      negated                         |
 *      plus                            |
 *      precision                sd     |
 *      shiftedBy                       |
 *      squareRoot               sqrt   |
 *      toExponential                   |
 *      toFixed                         |
 *      toFormat                        |
 *      toFraction                      |
 *      toJSON                          |
 *      toNumber                        |
 *      toPrecision                     |
 *      toString                        |
 *      valueOf                         |
 *
 */


  var BigNumber,
    isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,

    mathceil = Math.ceil,
    mathfloor = Math.floor,

    bignumberError = '[BigNumber Error] ',
    tooManyDigits = bignumberError + 'Number primitive has more than 15 significant digits: ',

    BASE = 1e14,
    LOG_BASE = 14,
    MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
    // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
    POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
    SQRT_BASE = 1e7,

    // EDITABLE
    // The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
    // the arguments to toExponential, toFixed, toFormat, and toPrecision.
    MAX = 1E9;                                   // 0 to MAX_INT32


  /*
   * Create and return a BigNumber constructor.
   */
  function clone(configObject) {
    var div, convertBase, parseNumeric,
      P = BigNumber.prototype = { constructor: BigNumber, toString: null, valueOf: null },
      ONE = new BigNumber(1),


      //----------------------------- EDITABLE CONFIG DEFAULTS -------------------------------


      // The default values below must be integers within the inclusive ranges stated.
      // The values can also be changed at run-time using BigNumber.set.

      // The maximum number of decimal places for operations involving division.
      DECIMAL_PLACES = 20,                     // 0 to MAX

      // The rounding mode used when rounding to the above decimal places, and when using
      // toExponential, toFixed, toFormat and toPrecision, and round (default value).
      // UP         0 Away from zero.
      // DOWN       1 Towards zero.
      // CEIL       2 Towards +Infinity.
      // FLOOR      3 Towards -Infinity.
      // HALF_UP    4 Towards nearest neighbour. If equidistant, up.
      // HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
      // HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
      // HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
      // HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
      ROUNDING_MODE = 4,                       // 0 to 8

      // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

      // The exponent value at and beneath which toString returns exponential notation.
      // Number type: -7
      TO_EXP_NEG = -7,                         // 0 to -MAX

      // The exponent value at and above which toString returns exponential notation.
      // Number type: 21
      TO_EXP_POS = 21,                         // 0 to MAX

      // RANGE : [MIN_EXP, MAX_EXP]

      // The minimum exponent value, beneath which underflow to zero occurs.
      // Number type: -324  (5e-324)
      MIN_EXP = -1e7,                          // -1 to -MAX

      // The maximum exponent value, above which overflow to Infinity occurs.
      // Number type:  308  (1.7976931348623157e+308)
      // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
      MAX_EXP = 1e7,                           // 1 to MAX

      // Whether to use cryptographically-secure random number generation, if available.
      CRYPTO = false,                          // true or false

      // The modulo mode used when calculating the modulus: a mod n.
      // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
      // The remainder (r) is calculated as: r = a - n * q.
      //
      // UP        0 The remainder is positive if the dividend is negative, else is negative.
      // DOWN      1 The remainder has the same sign as the dividend.
      //             This modulo mode is commonly known as 'truncated division' and is
      //             equivalent to (a % n) in JavaScript.
      // FLOOR     3 The remainder has the same sign as the divisor (Python %).
      // HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
      // EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
      //             The remainder is always positive.
      //
      // The truncated division, floored division, Euclidian division and IEEE 754 remainder
      // modes are commonly used for the modulus operation.
      // Although the other rounding modes can also be used, they may not give useful results.
      MODULO_MODE = 1,                         // 0 to 9

      // The maximum number of significant digits of the result of the exponentiatedBy operation.
      // If POW_PRECISION is 0, there will be unlimited significant digits.
      POW_PRECISION = 0,                    // 0 to MAX

      // The format specification used by the BigNumber.prototype.toFormat method.
      FORMAT = {
        decimalSeparator: '.',
        groupSeparator: ',',
        groupSize: 3,
        secondaryGroupSize: 0,
        fractionGroupSeparator: '\xA0',      // non-breaking space
        fractionGroupSize: 0
      },

      // The alphabet used for base conversion.
      // It must be at least 2 characters long, with no '.' or repeated character.
      // '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
      ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';


    //------------------------------------------------------------------------------------------


    // CONSTRUCTOR


    /*
     * The BigNumber constructor and exported function.
     * Create and return a new instance of a BigNumber object.
     *
     * n {number|string|BigNumber} A numeric value.
     * [b] {number} The base of n. Integer, 2 to ALPHABET.length inclusive.
     */
    function BigNumber(n, b) {
      var alphabet, c, caseChanged, e, i, isNum, len, str,
        x = this;

      // Enable constructor usage without new.
      if (!(x instanceof BigNumber)) {

        // Don't throw on constructor call without new (#81).
        // '[BigNumber Error] Constructor call without new: {n}'
        //throw Error(bignumberError + ' Constructor call without new: ' + n);
        return new BigNumber(n, b);
      }

      if (b == null) {

        // Duplicate.
        if (n instanceof BigNumber) {
          x.s = n.s;
          x.e = n.e;
          x.c = (n = n.c) ? n.slice() : n;
          return;
        }

        isNum = typeof n == 'number';

        if (isNum && n * 0 == 0) {

          // Use `1 / n` to handle minus zero also.
          x.s = 1 / n < 0 ? (n = -n, -1) : 1;

          // Faster path for integers.
          if (n === ~~n) {
            for (e = 0, i = n; i >= 10; i /= 10, e++);
            x.e = e;
            x.c = [n];
            return;
          }

          str = n + '';
        } else {
          if (!isNumeric.test(str = n + '')) return parseNumeric(x, str, isNum);
          x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
        }

        // Decimal point?
        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

        // Exponential form?
        if ((i = str.search(/e/i)) > 0) {

          // Determine exponent.
          if (e < 0) e = i;
          e += +str.slice(i + 1);
          str = str.substring(0, i);
        } else if (e < 0) {

          // Integer.
          e = str.length;
        }

      } else {

        // '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
        intCheck(b, 2, ALPHABET.length, 'Base');
        str = n + '';

        // Allow exponential notation to be used with base 10 argument, while
        // also rounding to DECIMAL_PLACES as with other bases.
        if (b == 10) {
          x = new BigNumber(n instanceof BigNumber ? n : str);
          return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
        }

        isNum = typeof n == 'number';

        if (isNum) {

          // Avoid potential interpretation of Infinity and NaN as base 44+ values.
          if (n * 0 != 0) return parseNumeric(x, str, isNum, b);

          x.s = 1 / n < 0 ? (str = str.slice(1), -1) : 1;

          // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
          if (BigNumber.DEBUG && str.replace(/^0\.0*|\./, '').length > 15) {
            throw Error
             (tooManyDigits + n);
          }

          // Prevent later check for length on converted number.
          isNum = false;
        } else {
          x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
        }

        alphabet = ALPHABET.slice(0, b);
        e = i = 0;

        // Check that str is a valid base b number.
        // Don't use RegExp so alphabet can contain special characters.
        for (len = str.length; i < len; i++) {
          if (alphabet.indexOf(c = str.charAt(i)) < 0) {
            if (c == '.') {

              // If '.' is not the first character and it has not be found before.
              if (i > e) {
                e = len;
                continue;
              }
            } else if (!caseChanged) {

              // Allow e.g. hexadecimal 'FF' as well as 'ff'.
              if (str == str.toUpperCase() && (str = str.toLowerCase()) ||
                  str == str.toLowerCase() && (str = str.toUpperCase())) {
                caseChanged = true;
                i = -1;
                e = 0;
                continue;
              }
            }

            return parseNumeric(x, n + '', isNum, b);
          }
        }

        str = convertBase(str, b, 10, x.s);

        // Decimal point?
        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
        else e = str.length;
      }

      // Determine leading zeros.
      for (i = 0; str.charCodeAt(i) === 48; i++);

      // Determine trailing zeros.
      for (len = str.length; str.charCodeAt(--len) === 48;);

      str = str.slice(i, ++len);

      if (str) {
        len -= i;

        // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
        if (isNum && BigNumber.DEBUG &&
          len > 15 && (n > MAX_SAFE_INTEGER || n !== mathfloor(n))) {
            throw Error
             (tooManyDigits + (x.s * n));
        }

        e = e - i - 1;

         // Overflow?
        if (e > MAX_EXP) {

          // Infinity.
          x.c = x.e = null;

        // Underflow?
        } else if (e < MIN_EXP) {

          // Zero.
          x.c = [x.e = 0];
        } else {
          x.e = e;
          x.c = [];

          // Transform base

          // e is the base 10 exponent.
          // i is where to slice str to get the first element of the coefficient array.
          i = (e + 1) % LOG_BASE;
          if (e < 0) i += LOG_BASE;

          if (i < len) {
            if (i) x.c.push(+str.slice(0, i));

            for (len -= LOG_BASE; i < len;) {
              x.c.push(+str.slice(i, i += LOG_BASE));
            }

            str = str.slice(i);
            i = LOG_BASE - str.length;
          } else {
            i -= len;
          }

          for (; i--; str += '0');
          x.c.push(+str);
        }
      } else {

        // Zero.
        x.c = [x.e = 0];
      }
    }


    // CONSTRUCTOR PROPERTIES


    BigNumber.clone = clone;

    BigNumber.ROUND_UP = 0;
    BigNumber.ROUND_DOWN = 1;
    BigNumber.ROUND_CEIL = 2;
    BigNumber.ROUND_FLOOR = 3;
    BigNumber.ROUND_HALF_UP = 4;
    BigNumber.ROUND_HALF_DOWN = 5;
    BigNumber.ROUND_HALF_EVEN = 6;
    BigNumber.ROUND_HALF_CEIL = 7;
    BigNumber.ROUND_HALF_FLOOR = 8;
    BigNumber.EUCLID = 9;


    /*
     * Configure infrequently-changing library-wide settings.
     *
     * Accept an object with the following optional properties (if the value of a property is
     * a number, it must be an integer within the inclusive range stated):
     *
     *   DECIMAL_PLACES   {number}           0 to MAX
     *   ROUNDING_MODE    {number}           0 to 8
     *   EXPONENTIAL_AT   {number|number[]}  -MAX to MAX  or  [-MAX to 0, 0 to MAX]
     *   RANGE            {number|number[]}  -MAX to MAX (not zero)  or  [-MAX to -1, 1 to MAX]
     *   CRYPTO           {boolean}          true or false
     *   MODULO_MODE      {number}           0 to 9
     *   POW_PRECISION       {number}           0 to MAX
     *   ALPHABET         {string}           A string of two or more unique characters which does
     *                                       not contain '.'.
     *   FORMAT           {object}           An object with some of the following properties:
     *      decimalSeparator       {string}
     *      groupSeparator         {string}
     *      groupSize              {number}
     *      secondaryGroupSize     {number}
     *      fractionGroupSeparator {string}
     *      fractionGroupSize      {number}
     *
     * (The values assigned to the above FORMAT object properties are not checked for validity.)
     *
     * E.g.
     * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
     *
     * Ignore properties/parameters set to null or undefined, except for ALPHABET.
     *
     * Return an object with the properties current values.
     */
    BigNumber.config = BigNumber.set = function (obj) {
      var p, v;

      if (obj != null) {

        if (typeof obj == 'object') {

          // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
          // '[BigNumber Error] DECIMAL_PLACES {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'DECIMAL_PLACES')) {
            v = obj[p];
            intCheck(v, 0, MAX, p);
            DECIMAL_PLACES = v;
          }

          // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
          // '[BigNumber Error] ROUNDING_MODE {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'ROUNDING_MODE')) {
            v = obj[p];
            intCheck(v, 0, 8, p);
            ROUNDING_MODE = v;
          }

          // EXPONENTIAL_AT {number|number[]}
          // Integer, -MAX to MAX inclusive or
          // [integer -MAX to 0 inclusive, 0 to MAX inclusive].
          // '[BigNumber Error] EXPONENTIAL_AT {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'EXPONENTIAL_AT')) {
            v = obj[p];
            if (isArray(v)) {
              intCheck(v[0], -MAX, 0, p);
              intCheck(v[1], 0, MAX, p);
              TO_EXP_NEG = v[0];
              TO_EXP_POS = v[1];
            } else {
              intCheck(v, -MAX, MAX, p);
              TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
            }
          }

          // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
          // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
          // '[BigNumber Error] RANGE {not a primitive number|not an integer|out of range|cannot be zero}: {v}'
          if (obj.hasOwnProperty(p = 'RANGE')) {
            v = obj[p];
            if (isArray(v)) {
              intCheck(v[0], -MAX, -1, p);
              intCheck(v[1], 1, MAX, p);
              MIN_EXP = v[0];
              MAX_EXP = v[1];
            } else {
              intCheck(v, -MAX, MAX, p);
              if (v) {
                MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
              } else {
                throw Error
                 (bignumberError + p + ' cannot be zero: ' + v);
              }
            }
          }

          // CRYPTO {boolean} true or false.
          // '[BigNumber Error] CRYPTO not true or false: {v}'
          // '[BigNumber Error] crypto unavailable'
          if (obj.hasOwnProperty(p = 'CRYPTO')) {
            v = obj[p];
            if (v === !!v) {
              if (v) {
                if (typeof crypto != 'undefined' && crypto &&
                 (crypto.getRandomValues || crypto.randomBytes)) {
                  CRYPTO = v;
                } else {
                  CRYPTO = !v;
                  throw Error
                   (bignumberError + 'crypto unavailable');
                }
              } else {
                CRYPTO = v;
              }
            } else {
              throw Error
               (bignumberError + p + ' not true or false: ' + v);
            }
          }

          // MODULO_MODE {number} Integer, 0 to 9 inclusive.
          // '[BigNumber Error] MODULO_MODE {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'MODULO_MODE')) {
            v = obj[p];
            intCheck(v, 0, 9, p);
            MODULO_MODE = v;
          }

          // POW_PRECISION {number} Integer, 0 to MAX inclusive.
          // '[BigNumber Error] POW_PRECISION {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'POW_PRECISION')) {
            v = obj[p];
            intCheck(v, 0, MAX, p);
            POW_PRECISION = v;
          }

          // FORMAT {object}
          // '[BigNumber Error] FORMAT not an object: {v}'
          if (obj.hasOwnProperty(p = 'FORMAT')) {
            v = obj[p];
            if (typeof v == 'object') FORMAT = v;
            else throw Error
             (bignumberError + p + ' not an object: ' + v);
          }

          // ALPHABET {string}
          // '[BigNumber Error] ALPHABET invalid: {v}'
          if (obj.hasOwnProperty(p = 'ALPHABET')) {
            v = obj[p];

            // Disallow if only one character, or contains '.' or a repeated character.
            if (typeof v == 'string' && !/^.$|\.|(.).*\1/.test(v)) {
              ALPHABET = v;
            } else {
              throw Error
               (bignumberError + p + ' invalid: ' + v);
            }
          }

        } else {

          // '[BigNumber Error] Object expected: {v}'
          throw Error
           (bignumberError + 'Object expected: ' + obj);
        }
      }

      return {
        DECIMAL_PLACES: DECIMAL_PLACES,
        ROUNDING_MODE: ROUNDING_MODE,
        EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
        RANGE: [MIN_EXP, MAX_EXP],
        CRYPTO: CRYPTO,
        MODULO_MODE: MODULO_MODE,
        POW_PRECISION: POW_PRECISION,
        FORMAT: FORMAT,
        ALPHABET: ALPHABET
      };
    };


    /*
     * Return true if v is a BigNumber instance, otherwise return false.
     *
     * v {any}
     */
    BigNumber.isBigNumber = function (v) {
      return v instanceof BigNumber || v && v._isBigNumber === true || false;
    };


    /*
     * Return a new BigNumber whose value is the maximum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.maximum = BigNumber.max = function () {
      return maxOrMin(arguments, P.lt);
    };


    /*
     * Return a new BigNumber whose value is the minimum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.minimum = BigNumber.min = function () {
      return maxOrMin(arguments, P.gt);
    };


    /*
     * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
     * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
     * zeros are produced).
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp}'
     * '[BigNumber Error] crypto unavailable'
     */
    BigNumber.random = (function () {
      var pow2_53 = 0x20000000000000;

      // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
      // Check if Math.random() produces more than 32 bits of randomness.
      // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
      // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
      var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
       ? function () { return mathfloor(Math.random() * pow2_53); }
       : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
         (Math.random() * 0x800000 | 0); };

      return function (dp) {
        var a, b, e, k, v,
          i = 0,
          c = [],
          rand = new BigNumber(ONE);

        if (dp == null) dp = DECIMAL_PLACES;
        else intCheck(dp, 0, MAX);

        k = mathceil(dp / LOG_BASE);

        if (CRYPTO) {

          // Browsers supporting crypto.getRandomValues.
          if (crypto.getRandomValues) {

            a = crypto.getRandomValues(new Uint32Array(k *= 2));

            for (; i < k;) {

              // 53 bits:
              // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
              // 11111 11111111 11111111 11111111 11100000 00000000 00000000
              // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
              //                                     11111 11111111 11111111
              // 0x20000 is 2^21.
              v = a[i] * 0x20000 + (a[i + 1] >>> 11);

              // Rejection sampling:
              // 0 <= v < 9007199254740992
              // Probability that v >= 9e15, is
              // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
              if (v >= 9e15) {
                b = crypto.getRandomValues(new Uint32Array(2));
                a[i] = b[0];
                a[i + 1] = b[1];
              } else {

                // 0 <= v <= 8999999999999999
                // 0 <= (v % 1e14) <= 99999999999999
                c.push(v % 1e14);
                i += 2;
              }
            }
            i = k / 2;

          // Node.js supporting crypto.randomBytes.
          } else if (crypto.randomBytes) {

            // buffer
            a = crypto.randomBytes(k *= 7);

            for (; i < k;) {

              // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
              // 0x100000000 is 2^32, 0x1000000 is 2^24
              // 11111 11111111 11111111 11111111 11111111 11111111 11111111
              // 0 <= v < 9007199254740992
              v = ((a[i] & 31) * 0x1000000000000) + (a[i + 1] * 0x10000000000) +
                 (a[i + 2] * 0x100000000) + (a[i + 3] * 0x1000000) +
                 (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];

              if (v >= 9e15) {
                crypto.randomBytes(7).copy(a, i);
              } else {

                // 0 <= (v % 1e14) <= 99999999999999
                c.push(v % 1e14);
                i += 7;
              }
            }
            i = k / 7;
          } else {
            CRYPTO = false;
            throw Error
             (bignumberError + 'crypto unavailable');
          }
        }

        // Use Math.random.
        if (!CRYPTO) {

          for (; i < k;) {
            v = random53bitInt();
            if (v < 9e15) c[i++] = v % 1e14;
          }
        }

        k = c[--i];
        dp %= LOG_BASE;

        // Convert trailing digits to zeros according to dp.
        if (k && dp) {
          v = POWS_TEN[LOG_BASE - dp];
          c[i] = mathfloor(k / v) * v;
        }

        // Remove trailing elements which are zero.
        for (; c[i] === 0; c.pop(), i--);

        // Zero?
        if (i < 0) {
          c = [e = 0];
        } else {

          // Remove leading elements which are zero and adjust exponent accordingly.
          for (e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

          // Count the digits of the first element of c to determine leading zeros, and...
          for (i = 1, v = c[0]; v >= 10; v /= 10, i++);

          // adjust the exponent accordingly.
          if (i < LOG_BASE) e -= LOG_BASE - i;
        }

        rand.e = e;
        rand.c = c;
        return rand;
      };
    })();


    // PRIVATE FUNCTIONS


    // Called by BigNumber and BigNumber.prototype.toString.
    convertBase = (function () {
      var decimal = '0123456789';

      /*
       * Convert string of baseIn to an array of numbers of baseOut.
       * Eg. toBaseOut('255', 10, 16) returns [15, 15].
       * Eg. toBaseOut('ff', 16, 10) returns [2, 5, 5].
       */
      function toBaseOut(str, baseIn, baseOut, alphabet) {
        var j,
          arr = [0],
          arrL,
          i = 0,
          len = str.length;

        for (; i < len;) {
          for (arrL = arr.length; arrL--; arr[arrL] *= baseIn);

          arr[0] += alphabet.indexOf(str.charAt(i++));

          for (j = 0; j < arr.length; j++) {

            if (arr[j] > baseOut - 1) {
              if (arr[j + 1] == null) arr[j + 1] = 0;
              arr[j + 1] += arr[j] / baseOut | 0;
              arr[j] %= baseOut;
            }
          }
        }

        return arr.reverse();
      }

      // Convert a numeric string of baseIn to a numeric string of baseOut.
      // If the caller is toString, we are converting from base 10 to baseOut.
      // If the caller is BigNumber, we are converting from baseIn to base 10.
      return function (str, baseIn, baseOut, sign, callerIsToString) {
        var alphabet, d, e, k, r, x, xc, y,
          i = str.indexOf('.'),
          dp = DECIMAL_PLACES,
          rm = ROUNDING_MODE;

        // Non-integer.
        if (i >= 0) {
          k = POW_PRECISION;

          // Unlimited precision.
          POW_PRECISION = 0;
          str = str.replace('.', '');
          y = new BigNumber(baseIn);
          x = y.pow(str.length - i);
          POW_PRECISION = k;

          // Convert str as if an integer, then restore the fraction part by dividing the
          // result by its base raised to a power.

          y.c = toBaseOut(toFixedPoint(coeffToString(x.c), x.e, '0'),
           10, baseOut, decimal);
          y.e = y.c.length;
        }

        // Convert the number as integer.

        xc = toBaseOut(str, baseIn, baseOut, callerIsToString
         ? (alphabet = ALPHABET, decimal)
         : (alphabet = decimal, ALPHABET));

        // xc now represents str as an integer and converted to baseOut. e is the exponent.
        e = k = xc.length;

        // Remove trailing zeros.
        for (; xc[--k] == 0; xc.pop());

        // Zero?
        if (!xc[0]) return alphabet.charAt(0);

        // Does str represent an integer? If so, no need for the division.
        if (i < 0) {
          --e;
        } else {
          x.c = xc;
          x.e = e;

          // The sign is needed for correct rounding.
          x.s = sign;
          x = div(x, y, dp, rm, baseOut);
          xc = x.c;
          r = x.r;
          e = x.e;
        }

        // xc now represents str converted to baseOut.

        // THe index of the rounding digit.
        d = e + dp + 1;

        // The rounding digit: the digit to the right of the digit that may be rounded up.
        i = xc[d];

        // Look at the rounding digits and mode to determine whether to round up.

        k = baseOut / 2;
        r = r || d < 0 || xc[d + 1] != null;

        r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
              : i > k || i == k &&(rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
               rm == (x.s < 0 ? 8 : 7));

        // If the index of the rounding digit is not greater than zero, or xc represents
        // zero, then the result of the base conversion is zero or, if rounding up, a value
        // such as 0.00001.
        if (d < 1 || !xc[0]) {

          // 1^-dp or 0
          str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0))
              : alphabet.charAt(0);
        } else {

          // Truncate xc to the required number of decimal places.
          xc.length = d;

          // Round up?
          if (r) {

            // Rounding up may mean the previous digit has to be rounded up and so on.
            for (--baseOut; ++xc[--d] > baseOut;) {
              xc[d] = 0;

              if (!d) {
                ++e;
                xc = [1].concat(xc);
              }
            }
          }

          // Determine trailing zeros.
          for (k = xc.length; !xc[--k];);

          // E.g. [4, 11, 15] becomes 4bf.
          for (i = 0, str = ''; i <= k; str += alphabet.charAt(xc[i++]));

          // Add leading zeros, decimal point and trailing zeros as required.
          str = toFixedPoint(str, e, alphabet.charAt(0));
        }

        // The caller will add the sign.
        return str;
      };
    })();


    // Perform division in the specified base. Called by div and convertBase.
    div = (function () {

      // Assume non-zero x and k.
      function multiply(x, k, base) {
        var m, temp, xlo, xhi,
          carry = 0,
          i = x.length,
          klo = k % SQRT_BASE,
          khi = k / SQRT_BASE | 0;

        for (x = x.slice(); i--;) {
          xlo = x[i] % SQRT_BASE;
          xhi = x[i] / SQRT_BASE | 0;
          m = khi * xlo + xhi * klo;
          temp = klo * xlo + ((m % SQRT_BASE) * SQRT_BASE) + carry;
          carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
          x[i] = temp % base;
        }

        if (carry) x = [carry].concat(x);

        return x;
      }

      function compare(a, b, aL, bL) {
        var i, cmp;

        if (aL != bL) {
          cmp = aL > bL ? 1 : -1;
        } else {

          for (i = cmp = 0; i < aL; i++) {

            if (a[i] != b[i]) {
              cmp = a[i] > b[i] ? 1 : -1;
              break;
            }
          }
        }

        return cmp;
      }

      function subtract(a, b, aL, base) {
        var i = 0;

        // Subtract b from a.
        for (; aL--;) {
          a[aL] -= i;
          i = a[aL] < b[aL] ? 1 : 0;
          a[aL] = i * base + a[aL] - b[aL];
        }

        // Remove leading zeros.
        for (; !a[0] && a.length > 1; a.splice(0, 1));
      }

      // x: dividend, y: divisor.
      return function (x, y, dp, rm, base) {
        var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
          yL, yz,
          s = x.s == y.s ? 1 : -1,
          xc = x.c,
          yc = y.c;

        // Either NaN, Infinity or 0?
        if (!xc || !xc[0] || !yc || !yc[0]) {

          return new BigNumber(

           // Return NaN if either NaN, or both Infinity or 0.
           !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN :

            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            xc && xc[0] == 0 || !yc ? s * 0 : s / 0
         );
        }

        q = new BigNumber(s);
        qc = q.c = [];
        e = x.e - y.e;
        s = dp + e + 1;

        if (!base) {
          base = BASE;
          e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
          s = s / LOG_BASE | 0;
        }

        // Result exponent may be one less then the current value of e.
        // The coefficients of the BigNumbers from convertBase may have trailing zeros.
        for (i = 0; yc[i] == (xc[i] || 0); i++);

        if (yc[i] > (xc[i] || 0)) e--;

        if (s < 0) {
          qc.push(1);
          more = true;
        } else {
          xL = xc.length;
          yL = yc.length;
          i = 0;
          s += 2;

          // Normalise xc and yc so highest order digit of yc is >= base / 2.

          n = mathfloor(base / (yc[0] + 1));

          // Not necessary, but to handle odd bases where yc[0] == (base / 2) - 1.
          // if (n > 1 || n++ == 1 && yc[0] < base / 2) {
          if (n > 1) {
            yc = multiply(yc, n, base);
            xc = multiply(xc, n, base);
            yL = yc.length;
            xL = xc.length;
          }

          xi = yL;
          rem = xc.slice(0, yL);
          remL = rem.length;

          // Add zeros to make remainder as long as divisor.
          for (; remL < yL; rem[remL++] = 0);
          yz = yc.slice();
          yz = [0].concat(yz);
          yc0 = yc[0];
          if (yc[1] >= base / 2) yc0++;
          // Not necessary, but to prevent trial digit n > base, when using base 3.
          // else if (base == 3 && yc0 == 1) yc0 = 1 + 1e-15;

          do {
            n = 0;

            // Compare divisor and remainder.
            cmp = compare(yc, rem, yL, remL);

            // If divisor < remainder.
            if (cmp < 0) {

              // Calculate trial digit, n.

              rem0 = rem[0];
              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

              // n is how many times the divisor goes into the current remainder.
              n = mathfloor(rem0 / yc0);

              //  Algorithm:
              //  product = divisor multiplied by trial digit (n).
              //  Compare product and remainder.
              //  If product is greater than remainder:
              //    Subtract divisor from product, decrement trial digit.
              //  Subtract product from remainder.
              //  If product was less than remainder at the last compare:
              //    Compare new remainder and divisor.
              //    If remainder is greater than divisor:
              //      Subtract divisor from remainder, increment trial digit.

              if (n > 1) {

                // n may be > base only when base is 3.
                if (n >= base) n = base - 1;

                // product = divisor * trial digit.
                prod = multiply(yc, n, base);
                prodL = prod.length;
                remL = rem.length;

                // Compare product and remainder.
                // If product > remainder then trial digit n too high.
                // n is 1 too high about 5% of the time, and is not known to have
                // ever been more than 1 too high.
                while (compare(prod, rem, prodL, remL) == 1) {
                  n--;

                  // Subtract divisor from product.
                  subtract(prod, yL < prodL ? yz : yc, prodL, base);
                  prodL = prod.length;
                  cmp = 1;
                }
              } else {

                // n is 0 or 1, cmp is -1.
                // If n is 0, there is no need to compare yc and rem again below,
                // so change cmp to 1 to avoid it.
                // If n is 1, leave cmp as -1, so yc and rem are compared again.
                if (n == 0) {

                  // divisor < remainder, so n must be at least 1.
                  cmp = n = 1;
                }

                // product = divisor
                prod = yc.slice();
                prodL = prod.length;
              }

              if (prodL < remL) prod = [0].concat(prod);

              // Subtract product from remainder.
              subtract(rem, prod, remL, base);
              remL = rem.length;

               // If product was < remainder.
              if (cmp == -1) {

                // Compare divisor and new remainder.
                // If divisor < new remainder, subtract divisor from remainder.
                // Trial digit n too low.
                // n is 1 too low about 5% of the time, and very rarely 2 too low.
                while (compare(yc, rem, yL, remL) < 1) {
                  n++;

                  // Subtract divisor from remainder.
                  subtract(rem, yL < remL ? yz : yc, remL, base);
                  remL = rem.length;
                }
              }
            } else if (cmp === 0) {
              n++;
              rem = [0];
            } // else cmp === 1 and n will be 0

            // Add the next digit, n, to the result array.
            qc[i++] = n;

            // Update the remainder.
            if (rem[0]) {
              rem[remL++] = xc[xi] || 0;
            } else {
              rem = [xc[xi]];
              remL = 1;
            }
          } while ((xi++ < xL || rem[0] != null) && s--);

          more = rem[0] != null;

          // Leading zero?
          if (!qc[0]) qc.splice(0, 1);
        }

        if (base == BASE) {

          // To calculate q.e, first get the number of digits of qc[0].
          for (i = 1, s = qc[0]; s >= 10; s /= 10, i++);

          round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);

        // Caller is convertBase.
        } else {
          q.e = e;
          q.r = +more;
        }

        return q;
      };
    })();


    /*
     * Return a string representing the value of BigNumber n in fixed-point or exponential
     * notation rounded to the specified decimal places or significant digits.
     *
     * n: a BigNumber.
     * i: the index of the last digit required (i.e. the digit that may be rounded up).
     * rm: the rounding mode.
     * id: 1 (toExponential) or 2 (toPrecision).
     */
    function format(n, i, rm, id) {
      var c0, e, ne, len, str;

      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);

      if (!n.c) return n.toString();

      c0 = n.c[0];
      ne = n.e;

      if (i == null) {
        str = coeffToString(n.c);
        str = id == 1 || id == 2 && ne <= TO_EXP_NEG
         ? toExponential(str, ne)
         : toFixedPoint(str, ne, '0');
      } else {
        n = round(new BigNumber(n), i, rm);

        // n.e may have changed if the value was rounded up.
        e = n.e;

        str = coeffToString(n.c);
        len = str.length;

        // toPrecision returns exponential notation if the number of significant digits
        // specified is less than the number of digits necessary to represent the integer
        // part of the value in fixed-point notation.

        // Exponential notation.
        if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {

          // Append zeros?
          for (; len < i; str += '0', len++);
          str = toExponential(str, e);

        // Fixed-point notation.
        } else {
          i -= ne;
          str = toFixedPoint(str, e, '0');

          // Append zeros?
          if (e + 1 > len) {
            if (--i > 0) for (str += '.'; i--; str += '0');
          } else {
            i += e - len;
            if (i > 0) {
              if (e + 1 == len) str += '.';
              for (; i--; str += '0');
            }
          }
        }
      }

      return n.s < 0 && c0 ? '-' + str : str;
    }


    // Handle BigNumber.max and BigNumber.min.
    function maxOrMin(args, method) {
      var m, n,
        i = 0;

      if (isArray(args[0])) args = args[0];
      m = new BigNumber(args[0]);

      for (; ++i < args.length;) {
        n = new BigNumber(args[i]);

        // If any number is NaN, return NaN.
        if (!n.s) {
          m = n;
          break;
        } else if (method.call(m, n)) {
          m = n;
        }
      }

      return m;
    }


    /*
     * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
     * Called by minus, plus and times.
     */
    function normalise(n, c, e) {
      var i = 1,
        j = c.length;

       // Remove trailing zeros.
      for (; !c[--j]; c.pop());

      // Calculate the base 10 exponent. First get the number of digits of c[0].
      for (j = c[0]; j >= 10; j /= 10, i++);

      // Overflow?
      if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {

        // Infinity.
        n.c = n.e = null;

      // Underflow?
      } else if (e < MIN_EXP) {

        // Zero.
        n.c = [n.e = 0];
      } else {
        n.e = e;
        n.c = c;
      }

      return n;
    }


    // Handle values that fail the validity test in BigNumber.
    parseNumeric = (function () {
      var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
        dotAfter = /^([^.]+)\.$/,
        dotBefore = /^\.([^.]+)$/,
        isInfinityOrNaN = /^-?(Infinity|NaN)$/,
        whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

      return function (x, str, isNum, b) {
        var base,
          s = isNum ? str : str.replace(whitespaceOrPlus, '');

        // No exception on ±Infinity or NaN.
        if (isInfinityOrNaN.test(s)) {
          x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
          x.c = x.e = null;
        } else {
          if (!isNum) {

            // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
            s = s.replace(basePrefix, function (m, p1, p2) {
              base = (p2 = p2.toLowerCase()) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
              return !b || b == base ? p1 : m;
            });

            if (b) {
              base = b;

              // E.g. '1.' to '1', '.1' to '0.1'
              s = s.replace(dotAfter, '$1').replace(dotBefore, '0.$1');
            }

            if (str != s) return new BigNumber(s, base);
          }

          // '[BigNumber Error] Not a number: {n}'
          // '[BigNumber Error] Not a base {b} number: {n}'
          if (BigNumber.DEBUG) {
            throw Error
              (bignumberError + 'Not a' + (b ? ' base ' + b : '') + ' number: ' + str);
          }

          // NaN
          x.c = x.e = x.s = null;
        }
      }
    })();


    /*
     * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
     * If r is truthy, it is known that there are more digits after the rounding digit.
     */
    function round(x, sd, rm, r) {
      var d, i, j, k, n, ni, rd,
        xc = x.c,
        pows10 = POWS_TEN;

      // if x is not Infinity or NaN...
      if (xc) {

        // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
        // n is a base 1e14 number, the value of the element of array x.c containing rd.
        // ni is the index of n within x.c.
        // d is the number of digits of n.
        // i is the index of rd within n including leading zeros.
        // j is the actual index of rd within n (if < 0, rd is a leading zero).
        out: {

          // Get the number of digits of the first element of xc.
          for (d = 1, k = xc[0]; k >= 10; k /= 10, d++);
          i = sd - d;

          // If the rounding digit is in the first element of xc...
          if (i < 0) {
            i += LOG_BASE;
            j = sd;
            n = xc[ni = 0];

            // Get the rounding digit at index j of n.
            rd = n / pows10[d - j - 1] % 10 | 0;
          } else {
            ni = mathceil((i + 1) / LOG_BASE);

            if (ni >= xc.length) {

              if (r) {

                // Needed by sqrt.
                for (; xc.length <= ni; xc.push(0));
                n = rd = 0;
                d = 1;
                i %= LOG_BASE;
                j = i - LOG_BASE + 1;
              } else {
                break out;
              }
            } else {
              n = k = xc[ni];

              // Get the number of digits of n.
              for (d = 1; k >= 10; k /= 10, d++);

              // Get the index of rd within n.
              i %= LOG_BASE;

              // Get the index of rd within n, adjusted for leading zeros.
              // The number of leading zeros of n is given by LOG_BASE - d.
              j = i - LOG_BASE + d;

              // Get the rounding digit at index j of n.
              rd = j < 0 ? 0 : n / pows10[d - j - 1] % 10 | 0;
            }
          }

          r = r || sd < 0 ||

          // Are there any non-zero digits after the rounding digit?
          // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
          // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
           xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);

          r = rm < 4
           ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
           : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 &&

            // Check whether the digit to the left of the rounding digit is odd.
            ((i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10) & 1 ||
             rm == (x.s < 0 ? 8 : 7));

          if (sd < 1 || !xc[0]) {
            xc.length = 0;

            if (r) {

              // Convert sd to decimal places.
              sd -= x.e + 1;

              // 1, 0.1, 0.01, 0.001, 0.0001 etc.
              xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
              x.e = -sd || 0;
            } else {

              // Zero.
              xc[0] = x.e = 0;
            }

            return x;
          }

          // Remove excess digits.
          if (i == 0) {
            xc.length = ni;
            k = 1;
            ni--;
          } else {
            xc.length = ni + 1;
            k = pows10[LOG_BASE - i];

            // E.g. 56700 becomes 56000 if 7 is the rounding digit.
            // j > 0 means i > number of leading zeros of n.
            xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
          }

          // Round up?
          if (r) {

            for (; ;) {

              // If the digit to be rounded up is in the first element of xc...
              if (ni == 0) {

                // i will be the length of xc[0] before k is added.
                for (i = 1, j = xc[0]; j >= 10; j /= 10, i++);
                j = xc[0] += k;
                for (k = 1; j >= 10; j /= 10, k++);

                // if i != k the length has increased.
                if (i != k) {
                  x.e++;
                  if (xc[0] == BASE) xc[0] = 1;
                }

                break;
              } else {
                xc[ni] += k;
                if (xc[ni] != BASE) break;
                xc[ni--] = 0;
                k = 1;
              }
            }
          }

          // Remove trailing zeros.
          for (i = xc.length; xc[--i] === 0; xc.pop());
        }

        // Overflow? Infinity.
        if (x.e > MAX_EXP) {
          x.c = x.e = null;

        // Underflow? Zero.
        } else if (x.e < MIN_EXP) {
          x.c = [x.e = 0];
        }
      }

      return x;
    }


    // PROTOTYPE/INSTANCE METHODS


    /*
     * Return a new BigNumber whose value is the absolute value of this BigNumber.
     */
    P.absoluteValue = P.abs = function () {
      var x = new BigNumber(this);
      if (x.s < 0) x.s = 1;
      return x;
    };


    /*
     * Return
     *   1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
     *   -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
     *   0 if they have the same value,
     *   or null if the value of either is NaN.
     */
    P.comparedTo = function (y, b) {
      return compare(this, new BigNumber(y, b));
    };


    /*
     * If dp is undefined or null or true or false, return the number of decimal places of the
     * value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
     *
     * Otherwise, if dp is a number, return a new BigNumber whose value is the value of this
     * BigNumber rounded to a maximum of dp decimal places using rounding mode rm, or
     * ROUNDING_MODE if rm is omitted.
     *
     * [dp] {number} Decimal places: integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.decimalPlaces = P.dp = function (dp, rm) {
      var c, n, v,
        x = this;

      if (dp != null) {
        intCheck(dp, 0, MAX);
        if (rm == null) rm = ROUNDING_MODE;
        else intCheck(rm, 0, 8);

        return round(new BigNumber(x), dp + x.e + 1, rm);
      }

      if (!(c = x.c)) return null;
      n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;

      // Subtract the number of trailing zeros of the last number.
      if (v = c[v]) for (; v % 10 == 0; v /= 10, n--);
      if (n < 0) n = 0;

      return n;
    };


    /*
     *  n / 0 = I
     *  n / N = N
     *  n / I = 0
     *  0 / n = 0
     *  0 / 0 = N
     *  0 / N = N
     *  0 / I = 0
     *  N / n = N
     *  N / 0 = N
     *  N / N = N
     *  N / I = N
     *  I / n = I
     *  I / 0 = I
     *  I / N = N
     *  I / I = N
     *
     * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
     * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
     */
    P.dividedBy = P.div = function (y, b) {
      return div(this, new BigNumber(y, b), DECIMAL_PLACES, ROUNDING_MODE);
    };


    /*
     * Return a new BigNumber whose value is the integer part of dividing the value of this
     * BigNumber by the value of BigNumber(y, b).
     */
    P.dividedToIntegerBy = P.idiv = function (y, b) {
      return div(this, new BigNumber(y, b), 0, 1);
    };


    /*
     * Return a BigNumber whose value is the value of this BigNumber exponentiated by n.
     *
     * If m is present, return the result modulo m.
     * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
     * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using ROUNDING_MODE.
     *
     * The modular power operation works efficiently when x, n, and m are integers, otherwise it
     * is equivalent to calculating x.exponentiatedBy(n).modulo(m) with a POW_PRECISION of 0.
     *
     * n {number|string|BigNumber} The exponent. An integer.
     * [m] {number|string|BigNumber} The modulus.
     *
     * '[BigNumber Error] Exponent not an integer: {n}'
     */
    P.exponentiatedBy = P.pow = function (n, m) {
      var half, isModExp, k, more, nIsBig, nIsNeg, nIsOdd, y,
        x = this;

      n = new BigNumber(n);

      // Allow NaN and ±Infinity, but not other non-integers.
      if (n.c && !n.isInteger()) {
        throw Error
          (bignumberError + 'Exponent not an integer: ' + n);
      }

      if (m != null) m = new BigNumber(m);

      // Exponent of MAX_SAFE_INTEGER is 15.
      nIsBig = n.e > 14;

      // If x is NaN, ±Infinity, ±0 or ±1, or n is ±Infinity, NaN or ±0.
      if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {

        // The sign of the result of pow when x is negative depends on the evenness of n.
        // If +n overflows to ±Infinity, the evenness of n would be not be known.
        y = new BigNumber(Math.pow(+x.valueOf(), nIsBig ? 2 - isOdd(n) : +n));
        return m ? y.mod(m) : y;
      }

      nIsNeg = n.s < 0;

      if (m) {

        // x % m returns NaN if abs(m) is zero, or m is NaN.
        if (m.c ? !m.c[0] : !m.s) return new BigNumber(NaN);

        isModExp = !nIsNeg && x.isInteger() && m.isInteger();

        if (isModExp) x = x.mod(m);

      // Overflow to ±Infinity: >=2**1e10 or >=1.0000024**1e15.
      // Underflow to ±0: <=0.79**1e10 or <=0.9999975**1e15.
      } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0
        // [1, 240000000]
        ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7
        // [80000000000000]  [99999750000000]
        : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {

        // If x is negative and n is odd, k = -0, else k = 0.
        k = x.s < 0 && isOdd(n) ? -0 : 0;

        // If x >= 1, k = ±Infinity.
        if (x.e > -1) k = 1 / k;

        // If n is negative return ±0, else return ±Infinity.
        return new BigNumber(nIsNeg ? 1 / k : k);

      } else if (POW_PRECISION) {

        // Truncating each coefficient array to a length of k after each multiplication
        // equates to truncating significant digits to POW_PRECISION + [28, 41],
        // i.e. there will be a minimum of 28 guard digits retained.
        k = mathceil(POW_PRECISION / LOG_BASE + 2);
      }

      if (nIsBig) {
        half = new BigNumber(0.5);
        nIsOdd = isOdd(n);
      } else {
        nIsOdd = n % 2;
      }

      if (nIsNeg) n.s = 1;

      y = new BigNumber(ONE);

      // Performs 54 loop iterations for n of 9007199254740991.
      for (; ;) {

        if (nIsOdd) {
          y = y.times(x);
          if (!y.c) break;

          if (k) {
            if (y.c.length > k) y.c.length = k;
          } else if (isModExp) {
            y = y.mod(m);    //y = y.minus(div(y, m, 0, MODULO_MODE).times(m));
          }
        }

        if (nIsBig) {
          n = n.times(half);
          round(n, n.e + 1, 1);
          if (!n.c[0]) break;
          nIsBig = n.e > 14;
          nIsOdd = isOdd(n);
        } else {
          n = mathfloor(n / 2);
          if (!n) break;
          nIsOdd = n % 2;
        }

        x = x.times(x);

        if (k) {
          if (x.c && x.c.length > k) x.c.length = k;
        } else if (isModExp) {
          x = x.mod(m);    //x = x.minus(div(x, m, 0, MODULO_MODE).times(m));
        }
      }

      if (isModExp) return y;
      if (nIsNeg) y = ONE.div(y);

      return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber rounded to an integer
     * using rounding mode rm, or ROUNDING_MODE if rm is omitted.
     *
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {rm}'
     */
    P.integerValue = function (rm) {
      var n = new BigNumber(this);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);
      return round(n, n.e + 1, rm);
    };


    /*
     * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isEqualTo = P.eq = function (y, b) {
      return compare(this, new BigNumber(y, b)) === 0;
    };


    /*
     * Return true if the value of this BigNumber is a finite number, otherwise return false.
     */
    P.isFinite = function () {
      return !!this.c;
    };


    /*
     * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isGreaterThan = P.gt = function (y, b) {
      return compare(this, new BigNumber(y, b)) > 0;
    };


    /*
     * Return true if the value of this BigNumber is greater than or equal to the value of
     * BigNumber(y, b), otherwise return false.
     */
    P.isGreaterThanOrEqualTo = P.gte = function (y, b) {
      return (b = compare(this, new BigNumber(y, b))) === 1 || b === 0;

    };


    /*
     * Return true if the value of this BigNumber is an integer, otherwise return false.
     */
    P.isInteger = function () {
      return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
    };


    /*
     * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isLessThan = P.lt = function (y, b) {
      return compare(this, new BigNumber(y, b)) < 0;
    };


    /*
     * Return true if the value of this BigNumber is less than or equal to the value of
     * BigNumber(y, b), otherwise return false.
     */
    P.isLessThanOrEqualTo = P.lte = function (y, b) {
      return (b = compare(this, new BigNumber(y, b))) === -1 || b === 0;
    };


    /*
     * Return true if the value of this BigNumber is NaN, otherwise return false.
     */
    P.isNaN = function () {
      return !this.s;
    };


    /*
     * Return true if the value of this BigNumber is negative, otherwise return false.
     */
    P.isNegative = function () {
      return this.s < 0;
    };


    /*
     * Return true if the value of this BigNumber is positive, otherwise return false.
     */
    P.isPositive = function () {
      return this.s > 0;
    };


    /*
     * Return true if the value of this BigNumber is 0 or -0, otherwise return false.
     */
    P.isZero = function () {
      return !!this.c && this.c[0] == 0;
    };


    /*
     *  n - 0 = n
     *  n - N = N
     *  n - I = -I
     *  0 - n = -n
     *  0 - 0 = 0
     *  0 - N = N
     *  0 - I = -I
     *  N - n = N
     *  N - 0 = N
     *  N - N = N
     *  N - I = N
     *  I - n = I
     *  I - 0 = I
     *  I - N = N
     *  I - I = N
     *
     * Return a new BigNumber whose value is the value of this BigNumber minus the value of
     * BigNumber(y, b).
     */
    P.minus = function (y, b) {
      var i, j, t, xLTy,
        x = this,
        a = x.s;

      y = new BigNumber(y, b);
      b = y.s;

      // Either NaN?
      if (!a || !b) return new BigNumber(NaN);

      // Signs differ?
      if (a != b) {
        y.s = -b;
        return x.plus(y);
      }

      var xe = x.e / LOG_BASE,
        ye = y.e / LOG_BASE,
        xc = x.c,
        yc = y.c;

      if (!xe || !ye) {

        // Either Infinity?
        if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber(yc ? x : NaN);

        // Either zero?
        if (!xc[0] || !yc[0]) {

          // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
          return yc[0] ? (y.s = -b, y) : new BigNumber(xc[0] ? x :

           // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
           ROUNDING_MODE == 3 ? -0 : 0);
        }
      }

      xe = bitFloor(xe);
      ye = bitFloor(ye);
      xc = xc.slice();

      // Determine which is the bigger number.
      if (a = xe - ye) {

        if (xLTy = a < 0) {
          a = -a;
          t = xc;
        } else {
          ye = xe;
          t = yc;
        }

        t.reverse();

        // Prepend zeros to equalise exponents.
        for (b = a; b--; t.push(0));
        t.reverse();
      } else {

        // Exponents equal. Check digit by digit.
        j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;

        for (a = b = 0; b < j; b++) {

          if (xc[b] != yc[b]) {
            xLTy = xc[b] < yc[b];
            break;
          }
        }
      }

      // x < y? Point xc to the array of the bigger number.
      if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

      b = (j = yc.length) - (i = xc.length);

      // Append zeros to xc if shorter.
      // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
      if (b > 0) for (; b--; xc[i++] = 0);
      b = BASE - 1;

      // Subtract yc from xc.
      for (; j > a;) {

        if (xc[--j] < yc[j]) {
          for (i = j; i && !xc[--i]; xc[i] = b);
          --xc[i];
          xc[j] += BASE;
        }

        xc[j] -= yc[j];
      }

      // Remove leading zeros and adjust exponent accordingly.
      for (; xc[0] == 0; xc.splice(0, 1), --ye);

      // Zero?
      if (!xc[0]) {

        // Following IEEE 754 (2008) 6.3,
        // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
        y.s = ROUNDING_MODE == 3 ? -1 : 1;
        y.c = [y.e = 0];
        return y;
      }

      // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
      // for finite x and y.
      return normalise(y, xc, ye);
    };


    /*
     *   n % 0 =  N
     *   n % N =  N
     *   n % I =  n
     *   0 % n =  0
     *  -0 % n = -0
     *   0 % 0 =  N
     *   0 % N =  N
     *   0 % I =  0
     *   N % n =  N
     *   N % 0 =  N
     *   N % N =  N
     *   N % I =  N
     *   I % n =  N
     *   I % 0 =  N
     *   I % N =  N
     *   I % I =  N
     *
     * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
     * BigNumber(y, b). The result depends on the value of MODULO_MODE.
     */
    P.modulo = P.mod = function (y, b) {
      var q, s,
        x = this;

      y = new BigNumber(y, b);

      // Return NaN if x is Infinity or NaN, or y is NaN or zero.
      if (!x.c || !y.s || y.c && !y.c[0]) {
        return new BigNumber(NaN);

      // Return x if y is Infinity or x is zero.
      } else if (!y.c || x.c && !x.c[0]) {
        return new BigNumber(x);
      }

      if (MODULO_MODE == 9) {

        // Euclidian division: q = sign(y) * floor(x / abs(y))
        // r = x - qy    where  0 <= r < abs(y)
        s = y.s;
        y.s = 1;
        q = div(x, y, 0, 3);
        y.s = s;
        q.s *= s;
      } else {
        q = div(x, y, 0, MODULO_MODE);
      }

      y = x.minus(q.times(y));

      // To match JavaScript %, ensure sign of zero is sign of dividend.
      if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;

      return y;
    };


    /*
     *  n * 0 = 0
     *  n * N = N
     *  n * I = I
     *  0 * n = 0
     *  0 * 0 = 0
     *  0 * N = N
     *  0 * I = N
     *  N * n = N
     *  N * 0 = N
     *  N * N = N
     *  N * I = N
     *  I * n = I
     *  I * 0 = N
     *  I * N = N
     *  I * I = I
     *
     * Return a new BigNumber whose value is the value of this BigNumber multiplied by the value
     * of BigNumber(y, b).
     */
    P.multipliedBy = P.times = function (y, b) {
      var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
        base, sqrtBase,
        x = this,
        xc = x.c,
        yc = (y = new BigNumber(y, b)).c;

      // Either NaN, ±Infinity or ±0?
      if (!xc || !yc || !xc[0] || !yc[0]) {

        // Return NaN if either is NaN, or one is 0 and the other is Infinity.
        if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
          y.c = y.e = y.s = null;
        } else {
          y.s *= x.s;

          // Return ±Infinity if either is ±Infinity.
          if (!xc || !yc) {
            y.c = y.e = null;

          // Return ±0 if either is ±0.
          } else {
            y.c = [0];
            y.e = 0;
          }
        }

        return y;
      }

      e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
      y.s *= x.s;
      xcL = xc.length;
      ycL = yc.length;

      // Ensure xc points to longer array and xcL to its length.
      if (xcL < ycL) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

      // Initialise the result array with zeros.
      for (i = xcL + ycL, zc = []; i--; zc.push(0));

      base = BASE;
      sqrtBase = SQRT_BASE;

      for (i = ycL; --i >= 0;) {
        c = 0;
        ylo = yc[i] % sqrtBase;
        yhi = yc[i] / sqrtBase | 0;

        for (k = xcL, j = i + k; j > i;) {
          xlo = xc[--k] % sqrtBase;
          xhi = xc[k] / sqrtBase | 0;
          m = yhi * xlo + xhi * ylo;
          xlo = ylo * xlo + ((m % sqrtBase) * sqrtBase) + zc[j] + c;
          c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
          zc[j--] = xlo % base;
        }

        zc[j] = c;
      }

      if (c) {
        ++e;
      } else {
        zc.splice(0, 1);
      }

      return normalise(y, zc, e);
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber negated,
     * i.e. multiplied by -1.
     */
    P.negated = function () {
      var x = new BigNumber(this);
      x.s = -x.s || null;
      return x;
    };


    /*
     *  n + 0 = n
     *  n + N = N
     *  n + I = I
     *  0 + n = n
     *  0 + 0 = 0
     *  0 + N = N
     *  0 + I = I
     *  N + n = N
     *  N + 0 = N
     *  N + N = N
     *  N + I = N
     *  I + n = I
     *  I + 0 = I
     *  I + N = N
     *  I + I = I
     *
     * Return a new BigNumber whose value is the value of this BigNumber plus the value of
     * BigNumber(y, b).
     */
    P.plus = function (y, b) {
      var t,
        x = this,
        a = x.s;

      y = new BigNumber(y, b);
      b = y.s;

      // Either NaN?
      if (!a || !b) return new BigNumber(NaN);

      // Signs differ?
       if (a != b) {
        y.s = -b;
        return x.minus(y);
      }

      var xe = x.e / LOG_BASE,
        ye = y.e / LOG_BASE,
        xc = x.c,
        yc = y.c;

      if (!xe || !ye) {

        // Return ±Infinity if either ±Infinity.
        if (!xc || !yc) return new BigNumber(a / 0);

        // Either zero?
        // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
        if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0);
      }

      xe = bitFloor(xe);
      ye = bitFloor(ye);
      xc = xc.slice();

      // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
      if (a = xe - ye) {
        if (a > 0) {
          ye = xe;
          t = yc;
        } else {
          a = -a;
          t = xc;
        }

        t.reverse();
        for (; a--; t.push(0));
        t.reverse();
      }

      a = xc.length;
      b = yc.length;

      // Point xc to the longer array, and b to the shorter length.
      if (a - b < 0) t = yc, yc = xc, xc = t, b = a;

      // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
      for (a = 0; b;) {
        a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
        xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
      }

      if (a) {
        xc = [a].concat(xc);
        ++ye;
      }

      // No need to check for zero, as +x + +y != 0 && -x + -y != 0
      // ye = MAX_EXP + 1 possible
      return normalise(y, xc, ye);
    };


    /*
     * If sd is undefined or null or true or false, return the number of significant digits of
     * the value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
     * If sd is true include integer-part trailing zeros in the count.
     *
     * Otherwise, if sd is a number, return a new BigNumber whose value is the value of this
     * BigNumber rounded to a maximum of sd significant digits using rounding mode rm, or
     * ROUNDING_MODE if rm is omitted.
     *
     * sd {number|boolean} number: significant digits: integer, 1 to MAX inclusive.
     *                     boolean: whether to count integer-part trailing zeros: true or false.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
     */
    P.precision = P.sd = function (sd, rm) {
      var c, n, v,
        x = this;

      if (sd != null && sd !== !!sd) {
        intCheck(sd, 1, MAX);
        if (rm == null) rm = ROUNDING_MODE;
        else intCheck(rm, 0, 8);

        return round(new BigNumber(x), sd, rm);
      }

      if (!(c = x.c)) return null;
      v = c.length - 1;
      n = v * LOG_BASE + 1;

      if (v = c[v]) {

        // Subtract the number of trailing zeros of the last element.
        for (; v % 10 == 0; v /= 10, n--);

        // Add the number of digits of the first element.
        for (v = c[0]; v >= 10; v /= 10, n++);
      }

      if (sd && x.e + 1 > n) n = x.e + 1;

      return n;
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
     * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
     *
     * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {k}'
     */
    P.shiftedBy = function (k) {
      intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
      return this.times('1e' + k);
    };


    /*
     *  sqrt(-n) =  N
     *  sqrt(N) =  N
     *  sqrt(-I) =  N
     *  sqrt(I) =  I
     *  sqrt(0) =  0
     *  sqrt(-0) = -0
     *
     * Return a new BigNumber whose value is the square root of the value of this BigNumber,
     * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
     */
    P.squareRoot = P.sqrt = function () {
      var m, n, r, rep, t,
        x = this,
        c = x.c,
        s = x.s,
        e = x.e,
        dp = DECIMAL_PLACES + 4,
        half = new BigNumber('0.5');

      // Negative/NaN/Infinity/zero?
      if (s !== 1 || !c || !c[0]) {
        return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
      }

      // Initial estimate.
      s = Math.sqrt(+x);

      // Math.sqrt underflow/overflow?
      // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
      if (s == 0 || s == 1 / 0) {
        n = coeffToString(c);
        if ((n.length + e) % 2 == 0) n += '0';
        s = Math.sqrt(n);
        e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);

        if (s == 1 / 0) {
          n = '1e' + e;
        } else {
          n = s.toExponential();
          n = n.slice(0, n.indexOf('e') + 1) + e;
        }

        r = new BigNumber(n);
      } else {
        r = new BigNumber(s + '');
      }

      // Check for zero.
      // r could be zero if MIN_EXP is changed after the this value was created.
      // This would cause a division by zero (x/t) and hence Infinity below, which would cause
      // coeffToString to throw.
      if (r.c[0]) {
        e = r.e;
        s = e + dp;
        if (s < 3) s = 0;

        // Newton-Raphson iteration.
        for (; ;) {
          t = r;
          r = half.times(t.plus(div(x, t, dp, 1)));

          if (coeffToString(t.c  ).slice(0, s) === (n =
             coeffToString(r.c)).slice(0, s)) {

            // The exponent of r may here be one less than the final result exponent,
            // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
            // are indexed correctly.
            if (r.e < e) --s;
            n = n.slice(s - 3, s + 1);

            // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
            // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
            // iteration.
            if (n == '9999' || !rep && n == '4999') {

              // On the first iteration only, check to see if rounding up gives the
              // exact result as the nines may infinitely repeat.
              if (!rep) {
                round(t, t.e + DECIMAL_PLACES + 2, 0);

                if (t.times(t).eq(x)) {
                  r = t;
                  break;
                }
              }

              dp += 4;
              s += 4;
              rep = 1;
            } else {

              // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
              // result. If not, then there are further digits and m will be truthy.
              if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

                // Truncate to the first rounding digit.
                round(r, r.e + DECIMAL_PLACES + 2, 1);
                m = !r.times(r).eq(x);
              }

              break;
            }
          }
        }
      }

      return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
    };


    /*
     * Return a string representing the value of this BigNumber in exponential notation and
     * rounded using ROUNDING_MODE to dp fixed decimal places.
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.toExponential = function (dp, rm) {
      if (dp != null) {
        intCheck(dp, 0, MAX);
        dp++;
      }
      return format(this, dp, rm, 1);
    };


    /*
     * Return a string representing the value of this BigNumber in fixed-point notation rounding
     * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
     *
     * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
     * but e.g. (-0.00001).toFixed(0) is '-0'.
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.toFixed = function (dp, rm) {
      if (dp != null) {
        intCheck(dp, 0, MAX);
        dp = dp + this.e + 1;
      }
      return format(this, dp, rm);
    };


    /*
     * Return a string representing the value of this BigNumber in fixed-point notation rounded
     * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
     * of the FORMAT object (see BigNumber.set).
     *
     * FORMAT = {
     *      decimalSeparator : '.',
     *      groupSeparator : ',',
     *      groupSize : 3,
     *      secondaryGroupSize : 0,
     *      fractionGroupSeparator : '\xA0',    // non-breaking space
     *      fractionGroupSize : 0
     * };
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.toFormat = function (dp, rm) {
      var str = this.toFixed(dp, rm);

      if (this.c) {
        var i,
          arr = str.split('.'),
          g1 = +FORMAT.groupSize,
          g2 = +FORMAT.secondaryGroupSize,
          groupSeparator = FORMAT.groupSeparator,
          intPart = arr[0],
          fractionPart = arr[1],
          isNeg = this.s < 0,
          intDigits = isNeg ? intPart.slice(1) : intPart,
          len = intDigits.length;

        if (g2) i = g1, g1 = g2, g2 = i, len -= i;

        if (g1 > 0 && len > 0) {
          i = len % g1 || g1;
          intPart = intDigits.substr(0, i);

          for (; i < len; i += g1) {
            intPart += groupSeparator + intDigits.substr(i, g1);
          }

          if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
          if (isNeg) intPart = '-' + intPart;
        }

        str = fractionPart
         ? intPart + FORMAT.decimalSeparator + ((g2 = +FORMAT.fractionGroupSize)
          ? fractionPart.replace(new RegExp('\\d{' + g2 + '}\\B', 'g'),
           '$&' + FORMAT.fractionGroupSeparator)
          : fractionPart)
         : intPart;
      }

      return str;
    };


    /*
     * Return a string array representing the value of this BigNumber as a simple fraction with
     * an integer numerator and an integer denominator. The denominator will be a positive
     * non-zero value less than or equal to the specified maximum denominator. If a maximum
     * denominator is not specified, the denominator will be the lowest value necessary to
     * represent the number exactly.
     *
     * [md] {number|string|BigNumber} Integer >= 1, or Infinity. The maximum denominator.
     *
     * '[BigNumber Error] Argument {not an integer|out of range} : {md}'
     */
    P.toFraction = function (md) {
      var arr, d, d0, d1, d2, e, exp, n, n0, n1, q, s,
        x = this,
        xc = x.c;

      if (md != null) {
        n = new BigNumber(md);

        // Throw if md is less than one or is not an integer, unless it is Infinity.
        if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
          throw Error
            (bignumberError + 'Argument ' +
              (n.isInteger() ? 'out of range: ' : 'not an integer: ') + md);
        }
      }

      if (!xc) return x.toString();

      d = new BigNumber(ONE);
      n1 = d0 = new BigNumber(ONE);
      d1 = n0 = new BigNumber(ONE);
      s = coeffToString(xc);

      // Determine initial denominator.
      // d is a power of 10 and the minimum max denominator that specifies the value exactly.
      e = d.e = s.length - x.e - 1;
      d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
      md = !md || n.comparedTo(d) > 0 ? (e > 0 ? d : n1) : n;

      exp = MAX_EXP;
      MAX_EXP = 1 / 0;
      n = new BigNumber(s);

      // n0 = d1 = 0
      n0.c[0] = 0;

      for (; ;)  {
        q = div(n, d, 0, 1);
        d2 = d0.plus(q.times(d1));
        if (d2.comparedTo(md) == 1) break;
        d0 = d1;
        d1 = d2;
        n1 = n0.plus(q.times(d2 = n1));
        n0 = d2;
        d = n.minus(q.times(d2 = d));
        n = d2;
      }

      d2 = div(md.minus(d0), d1, 0, 1);
      n0 = n0.plus(d2.times(n1));
      d0 = d0.plus(d2.times(d1));
      n0.s = n1.s = x.s;
      e *= 2;

      // Determine which fraction is closer to x, n0/d0 or n1/d1
      arr = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
         div(n0, d0, e, ROUNDING_MODE).minus(x).abs()) < 1
          ? [n1.toString(), d1.toString()]
          : [n0.toString(), d0.toString()];

      MAX_EXP = exp;
      return arr;
    };


    /*
     * Return the value of this BigNumber converted to a number primitive.
     */
    P.toNumber = function () {
      return +this;
    };


    /*
     * Return a string representing the value of this BigNumber rounded to sd significant digits
     * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
     * necessary to represent the integer part of the value in fixed-point notation, then use
     * exponential notation.
     *
     * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
     */
    P.toPrecision = function (sd, rm) {
      if (sd != null) intCheck(sd, 1, MAX);
      return format(this, sd, rm, 2);
    };


    /*
     * Return a string representing the value of this BigNumber in base b, or base 10 if b is
     * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
     * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
     * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
     * TO_EXP_NEG, return exponential notation.
     *
     * [b] {number} Integer, 2 to ALPHABET.length inclusive.
     *
     * '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
     */
    P.toString = function (b) {
      var str,
        n = this,
        s = n.s,
        e = n.e;

      // Infinity or NaN?
      if (e === null) {

        if (s) {
          str = 'Infinity';
          if (s < 0) str = '-' + str;
        } else {
          str = 'NaN';
        }
      } else {
        str = coeffToString(n.c);

        if (b == null) {
          str = e <= TO_EXP_NEG || e >= TO_EXP_POS
           ? toExponential(str, e)
           : toFixedPoint(str, e, '0');
        } else {
          intCheck(b, 2, ALPHABET.length, 'Base');
          str = convertBase(toFixedPoint(str, e, '0'), 10, b, s, true);
        }

        if (s < 0 && n.c[0]) str = '-' + str;
      }

      return str;
    };


    /*
     * Return as toString, but do not accept a base argument, and include the minus sign for
     * negative zero.
     */
    P.valueOf = P.toJSON = function () {
      var str,
        n = this,
        e = n.e;

      if (e === null) return n.toString();

      str = coeffToString(n.c);

      str = e <= TO_EXP_NEG || e >= TO_EXP_POS
        ? toExponential(str, e)
        : toFixedPoint(str, e, '0');

      return n.s < 0 ? '-' + str : str;
    };


    P._isBigNumber = true;

    if (configObject != null) BigNumber.set(configObject);

    return BigNumber;
  }


  // PRIVATE HELPER FUNCTIONS


  function bitFloor(n) {
    var i = n | 0;
    return n > 0 || n === i ? i : i - 1;
  }


  // Return a coefficient array as a string of base 10 digits.
  function coeffToString(a) {
    var s, z,
      i = 1,
      j = a.length,
      r = a[0] + '';

    for (; i < j;) {
      s = a[i++] + '';
      z = LOG_BASE - s.length;
      for (; z--; s = '0' + s);
      r += s;
    }

    // Determine trailing zeros.
    for (j = r.length; r.charCodeAt(--j) === 48;);
    return r.slice(0, j + 1 || 1);
  }


  // Compare the value of BigNumbers x and y.
  function compare(x, y) {
    var a, b,
      xc = x.c,
      yc = y.c,
      i = x.s,
      j = y.s,
      k = x.e,
      l = y.e;

    // Either NaN?
    if (!i || !j) return null;

    a = xc && !xc[0];
    b = yc && !yc[0];

    // Either zero?
    if (a || b) return a ? b ? 0 : -j : i;

    // Signs differ?
    if (i != j) return i;

    a = i < 0;
    b = k == l;

    // Either Infinity?
    if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;

    // Compare exponents.
    if (!b) return k > l ^ a ? 1 : -1;

    j = (k = xc.length) < (l = yc.length) ? k : l;

    // Compare digit by digit.
    for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;

    // Compare lengths.
    return k == l ? 0 : k > l ^ a ? 1 : -1;
  }


  /*
   * Check that n is a primitive number, an integer, and in range, otherwise throw.
   */
  function intCheck(n, min, max, name) {
    if (n < min || n > max || n !== (n < 0 ? mathceil(n) : mathfloor(n))) {
      throw Error
       (bignumberError + (name || 'Argument') + (typeof n == 'number'
         ? n < min || n > max ? ' out of range: ' : ' not an integer: '
         : ' not a primitive number: ') + n);
    }
  }


  function isArray(obj) {
    return Object.prototype.toString.call(obj) == '[object Array]';
  }


  // Assumes finite n.
  function isOdd(n) {
    var k = n.c.length - 1;
    return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
  }


  function toExponential(str, e) {
    return (str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str) +
     (e < 0 ? 'e' : 'e+') + e;
  }


  function toFixedPoint(str, e, z) {
    var len, zs;

    // Negative exponent?
    if (e < 0) {

      // Prepend zeros.
      for (zs = z + '.'; ++e; zs += z);
      str = zs + str;

    // Positive exponent
    } else {
      len = str.length;

      // Append zeros.
      if (++e > len) {
        for (zs = z, e -= len; --e; zs += z);
        str += zs;
      } else if (e < len) {
        str = str.slice(0, e) + '.' + str.slice(e);
      }
    }

    return str;
  }


  // EXPORT


  BigNumber = clone();
  BigNumber['default'] = BigNumber.BigNumber = BigNumber;

  // AMD.
  if (typeof undefined == 'function' && undefined.amd) {
    undefined(function () { return BigNumber; });

  // Node.js and other environments that support module.exports.
  } else if ('object' != 'undefined' && module.exports) {
    module.exports = BigNumber;

  // Browser.
  } else {
    if (!globalObject) {
      globalObject = typeof self != 'undefined' && self ? self : window;
    }

    globalObject.BigNumber = BigNumber;
  }
})(commonjsGlobal);
});

var constants = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Constants {
}
Constants.SYS_NUM_CARDINAL = "builtin.num.cardinal";
Constants.SYS_NUM_DOUBLE = "builtin.num.double";
Constants.SYS_NUM_FRACTION = "builtin.num.fraction";
Constants.SYS_NUM_INTEGER = "builtin.num.integer";
Constants.SYS_NUM = "builtin.num";
Constants.SYS_NUM_ORDINAL = "builtin.num.ordinal";
Constants.SYS_NUM_PERCENTAGE = "builtin.num.percentage";
// NARROW NO-BREAK SPACE
Constants.NO_BREAK_SPACE = '\u202f';
exports.Constants = Constants;

});

unwrapExports(constants);

var models$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

var NumberMode;
(function (NumberMode) {
    // Default is for unit and datetime
    NumberMode[NumberMode["Default"] = 0] = "Default";
    // Add 67.5 billion & million support.
    NumberMode[NumberMode["Currency"] = 1] = "Currency";
    // Don't extract number from cases like 16ml
    NumberMode[NumberMode["PureNumber"] = 2] = "PureNumber";
})(NumberMode = exports.NumberMode || (exports.NumberMode = {}));
class LongFormatType {
    constructor(thousandsMark, decimalsMark) {
        this.thousandsMark = thousandsMark;
        this.decimalsMark = decimalsMark;
    }
}
// Reference : https://www.wikiwand.com/en/Decimal_mark
// Value : 1234567.89
// 1,234,567
LongFormatType.integerNumComma = new LongFormatType(',', '\0');
// 1.234.567
LongFormatType.integerNumDot = new LongFormatType('.', '\0');
// 1 234 567
LongFormatType.integerNumBlank = new LongFormatType(' ', '\0');
// 1 234 567
LongFormatType.integerNumNoBreakSpace = new LongFormatType(constants.Constants.NO_BREAK_SPACE, '\0');
// 1'234'567
LongFormatType.integerNumQuote = new LongFormatType('\'', '\0');
// 1,234,567.89
LongFormatType.doubleNumCommaDot = new LongFormatType(',', '.');
// 1,234,567·89
LongFormatType.doubleNumCommaCdot = new LongFormatType(',', '·');
// 1 234 567,89
LongFormatType.doubleNumBlankComma = new LongFormatType(' ', ',');
// 1 234 567,89
LongFormatType.doubleNumNoBreakSpaceComma = new LongFormatType(constants.Constants.NO_BREAK_SPACE, ',');
// 1 234 567.89
LongFormatType.doubleNumBlankDot = new LongFormatType(' ', '.');
// 1 234 567.89
LongFormatType.doubleNumNoBreakSpaceDot = new LongFormatType(constants.Constants.NO_BREAK_SPACE, '.');
// 1.234.567,89
LongFormatType.doubleNumDotComma = new LongFormatType('.', ',');
// 1'234'567,89
LongFormatType.doubleNumQuoteComma = new LongFormatType('\'', ',');
exports.LongFormatType = LongFormatType;
class AbstractNumberModel {
    constructor(parser, extractor) {
        this.extractor = extractor;
        this.parser = parser;
    }
    parse(query) {
        let extractResults = this.extractor.extract(query);
        let parseNums = extractResults.map(r => this.parser.parse(r));
        return parseNums
            .map(o => o)
            .map(o => ({
            start: o.start,
            end: o.start + o.length - 1,
            resolution: { value: o.resolutionStr },
            text: o.text,
            typeName: this.modelTypeName
        }));
    }
}
exports.AbstractNumberModel = AbstractNumberModel;
class NumberModel extends AbstractNumberModel {
    constructor() {
        super(...arguments);
        this.modelTypeName = "number";
    }
}
exports.NumberModel = NumberModel;
class OrdinalModel extends AbstractNumberModel {
    constructor() {
        super(...arguments);
        this.modelTypeName = "ordinal";
    }
}
exports.OrdinalModel = OrdinalModel;
class PercentModel extends AbstractNumberModel {
    constructor() {
        super(...arguments);
        this.modelTypeName = "percentage";
    }
}
exports.PercentModel = PercentModel;

});

unwrapExports(models$2);

var culture$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class Culture extends recognizersText.Culture {
    constructor(cultureName, cultureCode, longFormat) {
        super(cultureName, cultureCode);
        this.longFormat = longFormat;
    }
}
Culture.supportedCultures = [
    new Culture("English", Culture.English, new models$2.LongFormatType(',', '.')),
    new Culture("Chinese", Culture.Chinese, null),
    new Culture("Spanish", Culture.Spanish, new models$2.LongFormatType('.', ',')),
    new Culture("Portuguese", Culture.Portuguese, new models$2.LongFormatType('.', ',')),
    new Culture("French", Culture.French, new models$2.LongFormatType('.', ',')),
    new Culture("Japanese", Culture.Japanese, new models$2.LongFormatType(',', '.'))
];
exports.Culture = Culture;
class CultureInfo extends recognizersText.CultureInfo {
    format(value) {
        let bigNumber = new bignumber.BigNumber(value);
        let s;
        if (bigNumber.decimalPlaces()) {
            s = bigNumber.precision(15, bignumber.BigNumber.ROUND_HALF_UP).toString();
        }
        else {
            s = bigNumber.toString().toUpperCase();
        }
        if (s.indexOf('.') > -1) {
            // trim leading 0 from decimal places
            s = lodash_trimend(s, '0');
        }
        if (s.indexOf('e-') > -1) {
            // mimic .NET behavior by adding leading 0 to exponential. E.g.: 1E-07
            let p = s.split('e-');
            p[1] = p[1].length === 1 ? ('0' + p[1]) : p[1];
            s = p.join('E-');
        }
        // TODO: Use BigNumber.toFormat instead
        let culture = Culture.supportedCultures.find(c => c.cultureCode === this.code);
        if (culture && culture.longFormat) {
            return s
                .split(',')
                .map(t => t.split('.').join(culture.longFormat.decimalsMark))
                .join(culture.longFormat.thousandsMark);
        }
        return s;
    }
}
exports.CultureInfo = CultureInfo;

});

unwrapExports(culture$2);

var lodash_sortby = createCommonjsModule(function (module, exports) {
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * The base implementation of `_.sortBy` which uses `comparer` to define the
 * sort order of `array` and replaces criteria objects with their corresponding
 * values.
 *
 * @private
 * @param {Array} array The array to sort.
 * @param {Function} comparer The function to define sort order.
 * @returns {Array} Returns `array`.
 */
function baseSortBy(array, comparer) {
  var length = array.length;

  array.sort(comparer);
  while (length--) {
    array[length] = array[length].value;
  }
  return array;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object),
    nativeMax = Math.max;

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, bitmask, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = getTag(object);
    objTag = objTag == argsTag ? objectTag : objTag;
  }
  if (!othIsArr) {
    othTag = getTag(other);
    othTag = othTag == argsTag ? objectTag : othTag;
  }
  var objIsObj = objTag == objectTag && !isHostObject(object),
      othIsObj = othTag == objectTag && !isHostObject(other),
      isSameTag = objTag == othTag;

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
  }
  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
}

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
  };
}

/**
 * The base implementation of `_.orderBy` without param guards.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
 * @param {string[]} orders The sort orders of `iteratees`.
 * @returns {Array} Returns the new sorted array.
 */
function baseOrderBy(collection, iteratees, orders) {
  var index = -1;
  iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(baseIteratee));

  var result = baseMap(collection, function(value, key, collection) {
    var criteria = arrayMap(iteratees, function(iteratee) {
      return iteratee(value);
    });
    return { 'criteria': criteria, 'index': ++index, 'value': value };
  });

  return baseSortBy(result, function(object, other) {
    return compareMultiple(object, other, orders);
  });
}

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Compares values to sort them in ascending order.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {number} Returns the sort order indicator for `value`.
 */
function compareAscending(value, other) {
  if (value !== other) {
    var valIsDefined = value !== undefined,
        valIsNull = value === null,
        valIsReflexive = value === value,
        valIsSymbol = isSymbol(value);

    var othIsDefined = other !== undefined,
        othIsNull = other === null,
        othIsReflexive = other === other,
        othIsSymbol = isSymbol(other);

    if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
        (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
        (valIsNull && othIsDefined && othIsReflexive) ||
        (!valIsDefined && othIsReflexive) ||
        !valIsReflexive) {
      return 1;
    }
    if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
        (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
        (othIsNull && valIsDefined && valIsReflexive) ||
        (!othIsDefined && valIsReflexive) ||
        !othIsReflexive) {
      return -1;
    }
  }
  return 0;
}

/**
 * Used by `_.orderBy` to compare multiple properties of a value to another
 * and stable sort them.
 *
 * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
 * specify an order of "desc" for descending or "asc" for ascending sort order
 * of corresponding values.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {boolean[]|string[]} orders The order to sort by for each property.
 * @returns {number} Returns the sort order indicator for `object`.
 */
function compareMultiple(object, other, orders) {
  var index = -1,
      objCriteria = object.criteria,
      othCriteria = other.criteria,
      length = objCriteria.length,
      ordersLength = orders.length;

  while (++index < length) {
    var result = compareAscending(objCriteria[index], othCriteria[index]);
    if (result) {
      if (index >= ordersLength) {
        return result;
      }
      var order = orders[index];
      return result * (order == 'desc' ? -1 : 1);
    }
  }
  // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
  // that causes it, under certain circumstances, to provide the same value for
  // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
  // for more details.
  //
  // This also ensures a stable sort in V8 and other engines.
  // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
  return object.index - other.index;
}

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!seen.has(othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, customizer, bitmask, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= UNORDERED_COMPARE_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = isKey(path, object) ? [path] : castPath(path);

  var result,
      index = -1,
      length = path.length;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result) {
    return result;
  }
  var length = object ? object.length : 0;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  string = toString(string);

  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates an array of elements, sorted in ascending order by the results of
 * running each element in a collection thru each iteratee. This method
 * performs a stable sort, that is, it preserves the original sort order of
 * equal elements. The iteratees are invoked with one argument: (value).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {...(Function|Function[])} [iteratees=[_.identity]]
 *  The iteratees to sort by.
 * @returns {Array} Returns the new sorted array.
 * @example
 *
 * var users = [
 *   { 'user': 'fred',   'age': 48 },
 *   { 'user': 'barney', 'age': 36 },
 *   { 'user': 'fred',   'age': 40 },
 *   { 'user': 'barney', 'age': 34 }
 * ];
 *
 * _.sortBy(users, function(o) { return o.user; });
 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
 *
 * _.sortBy(users, ['user', 'age']);
 * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
 *
 * _.sortBy(users, 'user', function(o) {
 *   return Math.floor(o.age / 10);
 * });
 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
 */
var sortBy = baseRest(function(collection, iteratees) {
  if (collection == null) {
    return [];
  }
  var length = iteratees.length;
  if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
    iteratees = [];
  } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
    iteratees = [iteratees[0]];
  }
  return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
});

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = sortBy;
});

var parsers$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




// The exponent value(s) at which toString returns exponential notation.
bignumber.BigNumber.config({ EXPONENTIAL_AT: [-5, 15] });
class BaseNumberParser {
    constructor(config) {
        this.config = config;
        let singleIntFrac = `${this.config.wordSeparatorToken}| -|${this.getKeyRegex(this.config.cardinalNumberMap)}|${this.getKeyRegex(this.config.ordinalNumberMap)}`;
        this.textNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(String.raw `(?=\b)(${singleIntFrac})(?=\b)`, "gis");
        this.arabicNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(String.raw `\d+`, "is");
        this.roundNumberSet = new Set();
        this.config.roundNumberMap.forEach((value, key) => this.roundNumberSet.add(key));
    }
    parse(extResult) {
        // check if the parser is configured to support specific types
        if (this.supportedTypes && !this.supportedTypes.find(t => t === extResult.type)) {
            return null;
        }
        let ret = null;
        let extra = extResult.data;
        if (!extra) {
            if (this.arabicNumberRegex.test(extResult.text)) {
                extra = "Num";
            }
            else {
                extra = this.config.langMarker;
            }
        }
        // Resolve symbol prefix
        let isNegative = false;
        let matchNegative = extResult.text.match(this.config.negativeNumberSignRegex);
        if (matchNegative) {
            isNegative = true;
            extResult.text = extResult.text.substr(matchNegative[1].length);
        }
        if (extra.includes("Num")) {
            ret = this.digitNumberParse(extResult);
        }
        else if (extra.includes(`Frac${this.config.langMarker}`)) // Frac is a special number, parse via another method
         {
            ret = this.fracLikeNumberParse(extResult);
        }
        else if (extra.includes(this.config.langMarker)) {
            ret = this.textNumberParse(extResult);
        }
        else if (extra.includes("Pow")) {
            ret = this.powerNumberParse(extResult);
        }
        if (ret && ret.value !== null) {
            if (isNegative) {
                // Recover to the original extracted Text
                ret.text = matchNegative[1] + extResult.text;
                // Check if ret.value is a BigNumber
                if (typeof ret.value === "number") {
                    ret.value = -ret.value;
                }
                else {
                    ret.value.s = -1;
                }
            }
            ret.resolutionStr = this.config.cultureInfo
                ? this.config.cultureInfo.format(ret.value)
                : ret.value.toString();
        }
        return ret;
    }
    getKeyRegex(regexMap) {
        let keys = new Array();
        regexMap.forEach((value, key) => keys.push(key));
        let sortKeys = lodash_sortby(keys, key => key.length).reverse();
        return sortKeys.join('|');
    }
    digitNumberParse(extResult) {
        let result = {
            start: extResult.start,
            length: extResult.length,
            text: extResult.text,
            type: extResult.type
        };
        // [1] 24
        // [2] 12 32/33
        // [3] 1,000,000
        // [4] 234.567
        // [5] 44/55
        // [6] 2 hundred
        // dot occured.
        let power = 1;
        let tmpIndex = -1;
        let startIndex = 0;
        let handle = extResult.text.toLowerCase();
        let matches = recognizersText.RegExpUtility.getMatches(this.config.digitalNumberRegex, handle);
        if (matches) {
            matches.forEach(match => {
                // HACK: Matching regex may be buggy, may include a digit before the unit
                match.value = match.value.replace(/\d/g, '');
                match.length = match.value.length;
                let rep = this.config.roundNumberMap.get(match.value);
                // \\s+ for filter the spaces.
                power *= rep;
                // tslint:disable-next-line:no-conditional-assignment
                while ((tmpIndex = handle.indexOf(match.value, startIndex)) >= 0) {
                    let front = lodash_trimend(handle.substring(0, tmpIndex));
                    startIndex = front.length;
                    handle = front + handle.substring(tmpIndex + match.length);
                }
            });
        }
        // scale used in the calculate of double
        result.value = this.getDigitalValue(handle, power);
        return result;
    }
    isDigit(c) {
        return c >= '0' && c <= '9';
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
            let smallValue = this.isDigit(smallPart[0])
                ? this.getDigitalValue(smallPart, 1)
                : this.getIntValue(this.getMatches(smallPart));
            let bigValue = this.isDigit(bigPart[0])
                ? this.getDigitalValue(bigPart, 1)
                : this.getIntValue(this.getMatches(bigPart));
            result.value = smallValue / bigValue;
        }
        else {
            let words = resultText.split(" ").filter(s => s && s.length);
            let fracWords = Array.from(this.config.normalizeTokenSet(words, result));
            // Split fraction with integer
            let splitIndex = fracWords.length - 1;
            let currentValue = this.config.resolveCompositeNumber(fracWords[splitIndex]);
            let roundValue = 1;
            for (splitIndex = fracWords.length - 2; splitIndex >= 0; splitIndex--) {
                if (this.config.writtenFractionSeparatorTexts.indexOf(fracWords[splitIndex]) > -1 ||
                    this.config.writtenIntegerSeparatorTexts.indexOf(fracWords[splitIndex]) > -1) {
                    continue;
                }
                let previousValue = currentValue;
                currentValue = this.config.resolveCompositeNumber(fracWords[splitIndex]);
                let smHundreds = 100;
                // previous : hundred
                // current : one
                if ((previousValue >= smHundreds && previousValue > currentValue)
                    || (previousValue < smHundreds && this.isComposable(currentValue, previousValue))) {
                    if (previousValue < smHundreds && currentValue >= roundValue) {
                        roundValue = currentValue;
                    }
                    else if (previousValue < smHundreds && currentValue < roundValue) {
                        splitIndex++;
                        break;
                    }
                    // current is the first word
                    if (splitIndex === 0) {
                        // scan, skip the first word
                        splitIndex = 1;
                        while (splitIndex <= fracWords.length - 2) {
                            // e.g. one hundred thousand
                            // frac[i+1] % 100 && frac[i] % 100 = 0
                            if (this.config.resolveCompositeNumber(fracWords[splitIndex]) >= smHundreds
                                && !(this.config.writtenFractionSeparatorTexts.indexOf(fracWords[splitIndex + 1]) > -1)
                                && this.config.resolveCompositeNumber(fracWords[splitIndex + 1]) < smHundreds) {
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
                    let split = fracWords[i].split('-');
                    fracPart.push(split[0]);
                    fracPart.push("-");
                    fracPart.push(split[1]);
                }
                else {
                    fracPart.push(fracWords[i]);
                }
            }
            fracWords.splice(splitIndex, fracWords.length - splitIndex);
            // denomi = denominator
            let denomiValue = this.getIntValue(fracPart);
            // Split mixed number with fraction
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
            // Find mixed number
            if (mixedIndex !== fracWords.length && numerValue < denomiValue) {
                // intValue + numerValue / denomiValue
                result.value = new bignumber.BigNumber(intValue).plus(new bignumber.BigNumber(numerValue).dividedBy(denomiValue));
            }
            else {
                // (intValue + numerValue) / denomiValue
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
        let numGroup = this.splitMulti(handle, Array.from(this.config.writtenDecimalSeparatorTexts)).filter(s => s && s.length > 0);
        let intPart = numGroup[0];
        let matchStrs = intPart
            ? intPart.match(this.textNumberRegex).map(s => s.toLowerCase())
            : new Array();
        // Get the value recursively
        let intPartRet = this.getIntValue(matchStrs);
        let pointPartRet = 0;
        if (numGroup.length === 2) {
            let pointPart = numGroup[1];
            let matchStrs = pointPart.match(this.textNumberRegex).map(s => s.toLowerCase());
            pointPartRet += this.getPointValue(matchStrs);
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
        // [1] 1e10
        // [2] 1.1^-23
        let calStack = new Array();
        let scale = new bignumber.BigNumber(10);
        let dot = false;
        let isNegative = false;
        let tmp = new bignumber.BigNumber(0);
        for (let i = 0; i < handle.length; i++) {
            let ch = handle[i];
            if (ch === '^' || ch === 'E') {
                if (isNegative) {
                    calStack.push(tmp.negated());
                }
                else {
                    calStack.push(tmp);
                }
                tmp = new bignumber.BigNumber(0);
                scale = new bignumber.BigNumber(10);
                dot = false;
                isNegative = false;
            }
            else if (ch.charCodeAt(0) - 48 >= 0 && ch.charCodeAt(0) - 48 <= 9) {
                if (dot) {
                    // tmp = tmp + scale * (ch.charCodeAt(0) - 48);
                    // scale *= 0.1;
                    tmp = tmp.plus(scale.times(ch.charCodeAt(0) - 48));
                    scale = scale.times(0.1);
                }
                else {
                    // tmp = tmp * scale + (ch.charCodeAt(0) - 48);
                    tmp = tmp.times(scale).plus(ch.charCodeAt(0) - 48);
                }
            }
            else if (ch === this.config.decimalSeparatorChar) {
                dot = true;
                scale = new bignumber.BigNumber(0.1);
            }
            else if (ch === '-') {
                isNegative = !isNegative;
            }
            else if (ch === '+') {
                continue;
            }
            if (i === handle.length - 1) {
                if (isNegative) {
                    calStack.push(tmp.negated());
                }
                else {
                    calStack.push(tmp);
                }
            }
        }
        let ret = 0;
        if (isE) {
            // ret = calStack.shift() * Math.pow(10, calStack.shift());
            ret = calStack.shift().times(Math.pow(10, calStack.shift().toNumber())).toNumber();
        }
        else {
            ret = Math.pow(calStack.shift().toNumber(), calStack.shift().toNumber());
        }
        result.value = ret;
        result.resolutionStr = ret.toString(); // @TODO Possible Culture bug.
        return result;
    }
    splitMulti(str, tokens) {
        let tempChar = tokens[0]; // We can use the first token as a temporary join character
        for (let i = 0; i < tokens.length; i++) {
            str = str.split(tokens[i]).join(tempChar);
        }
        return str.split(tempChar);
    }
    getMatches(input) {
        let matches = input.match(this.textNumberRegex);
        return (matches || []).map(match => {
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
        // Scan from end to start, find the end word
        for (let i = matchStrs.length - 1; i >= 0; i--) {
            if (this.roundNumberSet.has(matchStrs[i])) {
                // if false,then continue
                // You will meet hundred first, then thousand.
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
            matchStrs.forEach(matchStr => {
                let isCardinal = this.config.cardinalNumberMap.has(matchStr);
                let isOrdinal = this.config.ordinalNumberMap.has(matchStr);
                if (isCardinal || isOrdinal) {
                    let matchValue = isCardinal
                        ? this.config.cardinalNumberMap.get(matchStr)
                        : this.config.ordinalNumberMap.get(matchStr);
                    // This is just for ordinal now. Not for fraction ever.
                    if (isOrdinal) {
                        let fracPart = this.config.ordinalNumberMap.get(matchStr);
                        if (tempStack.length > 0) {
                            let intPart = tempStack.pop();
                            // if intPart >= fracPart, it means it is an ordinal number
                            // it begins with an integer, ends with an ordinal
                            // e.g. ninety-ninth
                            if (intPart >= fracPart) {
                                tempStack.push(intPart + fracPart);
                            }
                            // another case of the type is ordinal
                            // e.g. three hundredth
                            else {
                                while (tempStack.length > 0) {
                                    intPart = intPart + tempStack.pop();
                                }
                                tempStack.push(intPart * fracPart);
                            }
                        }
                        else {
                            tempStack.push(fracPart);
                        }
                    }
                    else if (this.config.cardinalNumberMap.has(matchStr)) {
                        if (oldSym === "-") {
                            let sum = tempStack.pop() + matchValue;
                            tempStack.push(sum);
                        }
                        else if (oldSym === this.config.writtenIntegerSeparatorTexts[0] || tempStack.length < 2) {
                            tempStack.push(matchValue);
                        }
                        else if (tempStack.length >= 2) {
                            let sum = tempStack.pop() + matchValue;
                            sum = tempStack.pop() + sum;
                            tempStack.push(sum);
                        }
                    }
                }
                else {
                    let complexValue = this.config.resolveCompositeNumber(matchStr);
                    if (complexValue !== 0) {
                        tempStack.push(complexValue);
                    }
                }
                oldSym = matchStr;
            });
            tempStack.forEach(stackValue => {
                tempValue += stackValue;
            });
        }
        else {
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
            // Calculate the part like "thirty-one"
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
        }
        else {
            let scale = new bignumber.BigNumber(0.1);
            for (let i = 0; i < matchStrs.length; i++) {
                ret += scale.times(this.config.cardinalNumberMap.get(matchStrs[i])).toNumber();
                // scale *= 0.1;
                scale = scale.times(0.1);
            }
        }
        return ret;
    }
    skipNonDecimalSeparator(ch, distance, culture) {
        var decimalLength = 3;
        // Special cases for multi-language countries where decimal separators can be used interchangeably. Mostly informally.
        // Ex: South Africa, Namibia; Puerto Rico in ES; or in Canada for EN and FR.
        // "me pidio $5.00 prestados" and "me pidio $5,00 prestados" -> currency $5
        var cultureRegex = recognizersText.RegExpUtility.getSafeRegExp(String.raw `^(en|es|fr)(-)?\b`, "is");
        return (ch == this.config.nonDecimalSeparatorChar && !(distance <= decimalLength && (cultureRegex.exec(culture.code) !== null)));
    }
    getDigitalValue(digitsStr, power) {
        let tmp = new bignumber.BigNumber(0);
        let scale = new bignumber.BigNumber(10);
        let decimalSeparator = false;
        var strLength = digitsStr.length;
        let isNegative = false;
        let isFrac = digitsStr.includes('/');
        let calStack = new Array();
        for (let i = 0; i < digitsStr.length; i++) {
            let ch = digitsStr[i];
            var skippableNonDecimal = this.skipNonDecimalSeparator(ch, strLength - i, this.config.cultureInfo);
            if (!isFrac && (ch === ' ' || skippableNonDecimal)) {
                continue;
            }
            if (ch === ' ' || ch === '/') {
                calStack.push(tmp);
                tmp = new bignumber.BigNumber(0);
            }
            else if (ch >= '0' && ch <= '9') {
                if (decimalSeparator) {
                    // tmp = tmp + scale * (ch.charCodeAt(0) - 48);
                    // scale *= 0.1;
                    tmp = tmp.plus(scale.times(ch.charCodeAt(0) - 48));
                    scale = scale.times(0.1);
                }
                else {
                    // tmp = tmp * scale + (ch.charCodeAt(0) - 48);
                    tmp = tmp.times(scale).plus(ch.charCodeAt(0) - 48);
                }
            }
            else if (ch === this.config.decimalSeparatorChar || (!skippableNonDecimal && ch == this.config.nonDecimalSeparatorChar)) {
                decimalSeparator = true;
                scale = new bignumber.BigNumber(0.1);
            }
            else if (ch === '-') {
                isNegative = true;
            }
        }
        calStack.push(tmp);
        // if the number is a fraction.
        let calResult = new bignumber.BigNumber(0);
        if (isFrac) {
            let deno = calStack.pop();
            let mole = calStack.pop();
            // calResult += mole / deno;
            calResult = calResult.plus(mole.dividedBy(deno));
        }
        while (calStack.length > 0) {
            calResult = calResult.plus(calStack.pop());
        }
        // calResult *= power;
        calResult = calResult.times(power);
        if (isNegative) {
            return calResult.negated().toNumber();
        }
        return calResult.toNumber();
    }
}
exports.BaseNumberParser = BaseNumberParser;
class BasePercentageParser extends BaseNumberParser {
    parse(extResult) {
        let originText = extResult.text;
        // do replace text & data from extended info
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
}
exports.BasePercentageParser = BasePercentageParser;

});

unwrapExports(parsers$2);

var cjkParsers = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });



const recognizers_text_2 = recognizersText;
class BaseCJKNumberParser extends parsers$2.BaseNumberParser {
    constructor(config) {
        super(config);
        this.config = config;
    }
    toString(value) {
        return this.config.cultureInfo
            ? this.config.cultureInfo.format(value)
            : value.toString();
    }
    parse(extResult) {
        let extra = '';
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
        }
        else if (extra.includes("Num")) {
            getExtResult.text = this.replaceFullWithHalf(getExtResult.text);
            result = this.digitNumberParse(getExtResult);
            if (this.config.negativeNumberSignRegex.test(getExtResult.text) && result.value > 0) {
                result.value = -result.value;
            }
            result.resolutionStr = this.toString(result.value);
        }
        else if (extra.includes("Pow")) {
            getExtResult.text = this.replaceFullWithHalf(getExtResult.text);
            result = this.powerNumberParse(getExtResult);
            result.resolutionStr = this.toString(result.value);
        }
        else if (extra.includes("Frac")) {
            result = this.fracParseCJK(getExtResult);
        }
        else if (extra.includes("Dou")) {
            result = this.douParseCJK(getExtResult);
        }
        else if (extra.includes("Integer")) {
            result = this.intParseCJK(getExtResult);
        }
        else if (extra.includes("Ordinal")) {
            result = this.ordParseCJK(getExtResult);
        }
        if (result) {
            result.text = extResult.text;
        }
        return result;
    }
    replaceTraditionalWithSimplified(value) {
        if (recognizers_text_2.StringUtility.isNullOrWhitespace(value)) {
            return value;
        }
        if (this.config.tratoSimMap == null) {
            return value;
        }
        let result = '';
        for (let index = 0; index < value.length; index++) {
            result = result.concat(this.config.tratoSimMap.get(value.charAt(index)) || value.charAt(index));
        }
        return result;
    }
    replaceFullWithHalf(value) {
        if (recognizers_text_2.StringUtility.isNullOrWhitespace(value)) {
            return value;
        }
        let result = '';
        for (let index = 0; index < value.length; index++) {
            result = result.concat(this.config.fullToHalfMap.get(value.charAt(index)) || value.charAt(index));
        }
        return result;
    }
    replaceUnit(value) {
        if (recognizers_text_2.StringUtility.isNullOrEmpty(value))
            return value;
        let result = value;
        this.config.unitMap.forEach((value, key) => {
            result = result.replace(new RegExp(key, 'g'), value);
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
            if (resultText === "半額" || resultText === "半折" || resultText === "半折") {
                result.value = 50;
            }
            else if (resultText === "10成" || resultText === "10割" || resultText === "十割") {
                result.value = 100;
            }
            else {
                let matches = recognizers_text_2.RegExpUtility.getMatches(this.config.speGetNumberRegex, resultText);
                let intNumber;
                if (matches.length === 2) {
                    let intNumberChar = matches[0].value.charAt(0);
                    if (intNumberChar === '対' || intNumberChar === "对") {
                        intNumber = 5;
                    }
                    else if (intNumberChar === "十" || intNumberChar === "拾") {
                        intNumber = 10;
                    }
                    else {
                        intNumber = this.config.zeroToNineMap.get(intNumberChar);
                    }
                    let pointNumberChar = matches[1].value.charAt(0);
                    let pointNumber;
                    if (pointNumberChar === "半") {
                        pointNumber = 0.5;
                    }
                    else {
                        pointNumber = this.config.zeroToNineMap.get(pointNumberChar) * 0.1;
                    }
                    result.value = (intNumber + pointNumber) * 10;
                }
                else if (matches.length === 5) {
                    // Deal the Japanese percentage case like "xxx割xxx分xxx厘", get the integer value and convert into result.
                    let intNumberChar = matches[0].value.charAt(0);
                    let pointNumberChar = matches[1].value.charAt(0);
                    let dotNumberChar = matches[3].value.charAt(0);
                    let pointNumber = this.config.zeroToNineMap.get(pointNumberChar) * 0.1;
                    let dotNumber = this.config.zeroToNineMap.get(dotNumberChar) * 0.01;
                    intNumber = this.config.zeroToNineMap.get(intNumberChar);
                    result.value = (intNumber + pointNumber + dotNumber) * 10;
                }
                else {
                    let intNumberChar = matches[0].value.charAt(0);
                    if (intNumberChar === '対' || intNumberChar === "对") {
                        intNumber = 5;
                    }
                    else if (intNumberChar === "十" || intNumberChar === "拾") {
                        intNumber = 10;
                    }
                    else {
                        intNumber = this.config.zeroToNineMap.get(intNumberChar);
                    }
                    result.value = intNumber * 10;
                }
            }
        }
        else if (extResult.data.includes("Num")) {
            let doubleMatch = recognizers_text_2.RegExpUtility.getMatches(this.config.percentageRegex, resultText).pop();
            let doubleText = doubleMatch.value;
            if (doubleText.includes("k") || doubleText.includes("K") || doubleText.includes("ｋ") || doubleText.includes("Ｋ")) {
                power = 1000;
            }
            if (doubleText.includes("M") || doubleText.includes("Ｍ")) {
                power = 1000000;
            }
            if (doubleText.includes("G") || doubleText.includes("Ｇ")) {
                power = 1000000000;
            }
            if (doubleText.includes("T") || doubleText.includes("Ｔ")) {
                power = 1000000000000;
            }
            result.value = this.getDigitValueCJK(resultText, power);
        }
        else {
            let doubleMatch = recognizers_text_2.RegExpUtility.getMatches(this.config.percentageRegex, resultText).pop();
            let doubleText = this.replaceUnit(doubleMatch.value);
            let splitResult = recognizers_text_2.RegExpUtility.split(this.config.pointRegex, doubleText);
            if (splitResult[0] === "") {
                splitResult[0] = "零";
            }
            let doubleValue = this.getIntValueCJK(splitResult[0]);
            if (splitResult.length === 2) {
                if (recognizers_text_2.RegExpUtility.isMatch(this.config.negativeNumberSignRegex, splitResult[0])) {
                    doubleValue -= this.getPointValueCJK(splitResult[1]);
                }
                else {
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
        let splitResult = recognizers_text_2.RegExpUtility.split(this.config.fracSplitRegex, resultText);
        let intPart = "";
        let demoPart = "";
        let numPart = "";
        if (splitResult.length === 3) {
            intPart = splitResult[0] || "";
            demoPart = splitResult[1] || "";
            numPart = splitResult[2] || "";
        }
        else {
            intPart = "零";
            demoPart = splitResult[0] || "";
            numPart = splitResult[1] || "";
        }
        let intValue = this.isDigitCJK(intPart)
            ? this.getDigitValueCJK(intPart, 1.0)
            : this.getIntValueCJK(intPart);
        let numValue = this.isDigitCJK(numPart)
            ? this.getDigitValueCJK(numPart, 1.0)
            : this.getIntValueCJK(numPart);
        let demoValue = this.isDigitCJK(demoPart)
            ? this.getDigitValueCJK(demoPart, 1.0)
            : this.getIntValueCJK(demoPart);
        if (recognizers_text_2.RegExpUtility.isMatch(this.config.negativeNumberSignRegex, intPart)) {
            result.value = intValue - numValue / demoValue;
        }
        else {
            result.value = intValue + numValue / demoValue;
        }
        result.resolutionStr = this.toString(result.value);
        return result;
    }
    douParseCJK(extResult) {
        let result = new recognizersText.ParseResult(extResult);
        let resultText = extResult.text;
        if (recognizers_text_2.RegExpUtility.isMatch(this.config.doubleAndRoundRegex, resultText)) {
            resultText = this.replaceUnit(resultText);
            let power = this.config.roundNumberMapChar.get(resultText.charAt(resultText.length - 1));
            result.value = this.getDigitValueCJK(resultText.substr(0, resultText.length - 1), power);
        }
        else {
            resultText = this.replaceUnit(resultText);
            let splitResult = recognizers_text_2.RegExpUtility.split(this.config.pointRegex, resultText);
            if (splitResult[0] === "") {
                splitResult[0] = "零";
            }
            if (recognizers_text_2.RegExpUtility.isMatch(this.config.negativeNumberSignRegex, splitResult[0])) {
                result.value = this.getIntValueCJK(splitResult[0]) - this.getPointValueCJK(splitResult[1]);
            }
            else {
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
        if (recognizers_text_2.RegExpUtility.isMatch(this.config.digitNumRegex, resultText) && !recognizers_text_2.RegExpUtility.isMatch(this.config.roundNumberIntegerRegex, resultText)) {
            result.value = this.getDigitValueCJK(resultText, 1);
        }
        else {
            result.value = this.getIntValueCJK(resultText);
        }
        result.resolutionStr = this.toString(result.value);
        return result;
    }
    getDigitValueCJK(value, power) {
        let isNegative = false;
        let resultStr = value;
        if (recognizers_text_2.RegExpUtility.isMatch(this.config.negativeNumberSignRegex, resultStr)) {
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
        if (recognizers_text_2.RegExpUtility.isMatch(this.config.dozenRegex, resultStr)) {
            isDozen = true;
            if (this.config.cultureInfo.code.toLowerCase() === culture$2.Culture.Chinese) {
                resultStr = resultStr.substr(0, resultStr.length - 1);
            }
            else if (this.config.cultureInfo.code.toLowerCase() === culture$2.Culture.Japanese) {
                resultStr = resultStr.substr(0, resultStr.length - 3);
            }
        }
        else if (recognizers_text_2.RegExpUtility.isMatch(this.config.pairRegex, resultStr)) {
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
        if (recognizers_text_2.RegExpUtility.isMatch(this.config.negativeNumberSignRegex, resultStr)) {
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
                    }
                    else {
                        partValue += beforeValue * roundDefault;
                        intValue += partValue * roundRecent;
                    }
                    roundBefore = -1;
                    partValue = 0;
                }
                else {
                    isRoundBefore = true;
                    partValue += beforeValue * roundRecent;
                    roundBefore = roundRecent;
                    if ((index === resultStr.length - 1) || this.config.roundDirectList.some(o => o === currentChar)) {
                        intValue += partValue;
                        partValue = 0;
                    }
                }
                hasNumber = false;
                beforeValue = 0;
                roundDefault = roundRecent / 10;
            }
            else if (this.config.zeroToNineMap.has(currentChar)) {
                hasNumber = true;
                if (index !== resultStr.length - 1) {
                    if ((currentChar === "零") && !this.config.roundNumberMapChar.has(resultStr.charAt(index + 1))) {
                        roundDefault = 1;
                    }
                    else {
                        beforeValue = beforeValue * 10 + this.config.zeroToNineMap.get(currentChar);
                        isRoundBefore = false;
                    }
                }
                else {
                    if (index === resultStr.length - 1 && this.config.cultureInfo.code.toLowerCase() === culture$2.Culture.Japanese) {
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
        return !recognizers_text_2.StringUtility.isNullOrEmpty(value)
            && recognizers_text_2.RegExpUtility.isMatch(this.config.digitNumRegex, value);
    }
}
exports.BaseCJKNumberParser = BaseCJKNumberParser;

});

unwrapExports(cjkParsers);

var agnosticNumberParser = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




var AgnosticNumberParserType;
(function (AgnosticNumberParserType) {
    AgnosticNumberParserType[AgnosticNumberParserType["Cardinal"] = 0] = "Cardinal";
    AgnosticNumberParserType[AgnosticNumberParserType["Double"] = 1] = "Double";
    AgnosticNumberParserType[AgnosticNumberParserType["Fraction"] = 2] = "Fraction";
    AgnosticNumberParserType[AgnosticNumberParserType["Integer"] = 3] = "Integer";
    AgnosticNumberParserType[AgnosticNumberParserType["Number"] = 4] = "Number";
    AgnosticNumberParserType[AgnosticNumberParserType["Ordinal"] = 5] = "Ordinal";
    AgnosticNumberParserType[AgnosticNumberParserType["Percentage"] = 6] = "Percentage";
})(AgnosticNumberParserType = exports.AgnosticNumberParserType || (exports.AgnosticNumberParserType = {}));
class AgnosticNumberParserFactory {
    static getParser(type, languageConfiguration) {
        let isChinese = languageConfiguration.cultureInfo.code.toLowerCase() === culture$2.Culture.Chinese;
        let isJapanese = languageConfiguration.cultureInfo.code.toLowerCase() === culture$2.Culture.Japanese;
        let parser;
        if (isChinese) {
            parser = new cjkParsers.BaseCJKNumberParser(languageConfiguration);
        }
        else if (isJapanese) {
            parser = new cjkParsers.BaseCJKNumberParser(languageConfiguration);
        }
        else {
            parser = new parsers$2.BaseNumberParser(languageConfiguration);
        }
        switch (type) {
            case AgnosticNumberParserType.Cardinal:
                parser.supportedTypes = [constants.Constants.SYS_NUM_CARDINAL, constants.Constants.SYS_NUM_INTEGER, constants.Constants.SYS_NUM_DOUBLE];
                break;
            case AgnosticNumberParserType.Double:
                parser.supportedTypes = [constants.Constants.SYS_NUM_DOUBLE];
                break;
            case AgnosticNumberParserType.Fraction:
                parser.supportedTypes = [constants.Constants.SYS_NUM_FRACTION];
                break;
            case AgnosticNumberParserType.Integer:
                parser.supportedTypes = [constants.Constants.SYS_NUM_INTEGER];
                break;
            case AgnosticNumberParserType.Ordinal:
                parser.supportedTypes = [constants.Constants.SYS_NUM_ORDINAL];
                break;
            case AgnosticNumberParserType.Percentage:
                if (!isChinese && !isJapanese) {
                    parser = new parsers$2.BasePercentageParser(languageConfiguration);
                }
                break;
        }
        return parser;
    }
}
exports.AgnosticNumberParserFactory = AgnosticNumberParserFactory;

});

unwrapExports(agnosticNumberParser);

var baseNumbers = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var BaseNumbers;
(function (BaseNumbers) {
    BaseNumbers.NumberReplaceToken = '@builtin.num';
    BaseNumbers.FractionNumberReplaceToken = '@builtin.num.fraction';
    BaseNumbers.IntegerRegexDefinition = (placeholder, thousandsmark) => { return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!(\\d+\\.|\\d+,))))\\d{1,3}(${thousandsmark}\\d{3})+(?=${placeholder})`; };
    BaseNumbers.DoubleRegexDefinition = (placeholder, thousandsmark, decimalmark) => { return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\.|\\d+,)))\\d{1,3}(${thousandsmark}\\d{3})+${decimalmark}\\d+(?=${placeholder})`; };
    BaseNumbers.PlaceHolderDefault = '\\D|\\b';
})(BaseNumbers = exports.BaseNumbers || (exports.BaseNumbers = {}));

});

unwrapExports(baseNumbers);

var englishNumeric = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });

var EnglishNumeric;
(function (EnglishNumeric) {
    EnglishNumeric.LangMarker = 'Eng';
    EnglishNumeric.RoundNumberIntegerRegex = `(hundred|thousand|million|billion|trillion)`;
    EnglishNumeric.ZeroToNineIntegerRegex = `(three|seven|eight|four|five|zero|nine|one|two|six)`;
    EnglishNumeric.NegativeNumberTermsRegex = `((minus|negative)\\s+)`;
    EnglishNumeric.NegativeNumberSignRegex = `^${EnglishNumeric.NegativeNumberTermsRegex}.*`;
    EnglishNumeric.AnIntRegex = `(an|a)(?=\\s)`;
    EnglishNumeric.TenToNineteenIntegerRegex = `(seventeen|thirteen|fourteen|eighteen|nineteen|fifteen|sixteen|eleven|twelve|ten)`;
    EnglishNumeric.TensNumberIntegerRegex = `(seventy|twenty|thirty|eighty|ninety|forty|fifty|sixty)`;
    EnglishNumeric.SeparaIntRegex = `(((${EnglishNumeric.TenToNineteenIntegerRegex}|(${EnglishNumeric.TensNumberIntegerRegex}(\\s+(and\\s+)?|\\s*-\\s*)${EnglishNumeric.ZeroToNineIntegerRegex})|${EnglishNumeric.TensNumberIntegerRegex}|${EnglishNumeric.ZeroToNineIntegerRegex})(\\s+${EnglishNumeric.RoundNumberIntegerRegex})*))|((${EnglishNumeric.AnIntRegex}(\\s+${EnglishNumeric.RoundNumberIntegerRegex})+))`;
    EnglishNumeric.AllIntRegex = `((((${EnglishNumeric.TenToNineteenIntegerRegex}|(${EnglishNumeric.TensNumberIntegerRegex}(\\s+(and\\s+)?|\\s*-\\s*)${EnglishNumeric.ZeroToNineIntegerRegex})|${EnglishNumeric.TensNumberIntegerRegex}|${EnglishNumeric.ZeroToNineIntegerRegex}|${EnglishNumeric.AnIntRegex})(\\s+${EnglishNumeric.RoundNumberIntegerRegex})+)\\s+(and\\s+)?)*${EnglishNumeric.SeparaIntRegex})`;
    EnglishNumeric.PlaceHolderPureNumber = `\\b`;
    EnglishNumeric.PlaceHolderDefault = `\\D|\\b`;
    EnglishNumeric.NumbersWithPlaceHolder = (placeholder) => { return `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+(?!([\\.,]\\d+[a-zA-Z]))(?=${placeholder})`; };
    EnglishNumeric.NumbersWithSuffix = `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+\\s*(K|k|M|T|G)(?=\\b)`;
    EnglishNumeric.RoundNumberIntegerRegexWithLocks = `(?<=\\b)\\d+\\s+${EnglishNumeric.RoundNumberIntegerRegex}(?=\\b)`;
    EnglishNumeric.NumbersWithDozenSuffix = `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+\\s+dozen(s)?(?=\\b)`;
    EnglishNumeric.AllIntRegexWithLocks = `((?<=\\b)${EnglishNumeric.AllIntRegex}(?=\\b))`;
    EnglishNumeric.AllIntRegexWithDozenSuffixLocks = `(?<=\\b)(((half\\s+)?a\\s+dozen)|(${EnglishNumeric.AllIntRegex}\\s+dozen(s)?))(?=\\b)`;
    EnglishNumeric.RoundNumberOrdinalRegex = `(hundredth|thousandth|millionth|billionth|trillionth)`;
    EnglishNumeric.BasicOrdinalRegex = `(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|thirtieth|fortieth|fiftieth|sixtieth|seventieth|eightieth|ninetieth)`;
    EnglishNumeric.SuffixBasicOrdinalRegex = `(((((${EnglishNumeric.TensNumberIntegerRegex}(\\s+(and\\s+)?|\\s*-\\s*)${EnglishNumeric.ZeroToNineIntegerRegex})|${EnglishNumeric.TensNumberIntegerRegex}|${EnglishNumeric.ZeroToNineIntegerRegex}|${EnglishNumeric.AnIntRegex})(\\s+${EnglishNumeric.RoundNumberIntegerRegex})+)\\s+(and\\s+)?)*(${EnglishNumeric.TensNumberIntegerRegex}(\\s+|\\s*-\\s*))?${EnglishNumeric.BasicOrdinalRegex})`;
    EnglishNumeric.SuffixRoundNumberOrdinalRegex = `((${EnglishNumeric.AllIntRegex}\\s+)${EnglishNumeric.RoundNumberOrdinalRegex})`;
    EnglishNumeric.AllOrdinalRegex = `(${EnglishNumeric.SuffixBasicOrdinalRegex}|${EnglishNumeric.SuffixRoundNumberOrdinalRegex})`;
    EnglishNumeric.OrdinalSuffixRegex = `(?<=\\b)((\\d*(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|0th))|(11th|12th))(?=\\b)`;
    EnglishNumeric.OrdinalNumericRegex = `(?<=\\b)(\\d{1,3}(\\s*,\\s*\\d{3})*\\s*th)(?=\\b)`;
    EnglishNumeric.OrdinalRoundNumberRegex = `(?<!(a|an)\\s+)${EnglishNumeric.RoundNumberOrdinalRegex}`;
    EnglishNumeric.OrdinalEnglishRegex = `(?<=\\b)${EnglishNumeric.AllOrdinalRegex}(?=\\b)`;
    EnglishNumeric.FractionNotationWithSpacesRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+\\d+[/]\\d+(?=(\\b[^/]|$))`;
    EnglishNumeric.FractionNotationRegex = `(((?<=\\W|^)-\\s*)|(?<![/-])(?<=\\b))\\d+[/]\\d+(?=(\\b[^/]|$))`;
    EnglishNumeric.FractionNounRegex = `(?<=\\b)(${EnglishNumeric.AllIntRegex}\\s+(and\\s+)?)?(${EnglishNumeric.AllIntRegex})(\\s+|\\s*-\\s*)(((${EnglishNumeric.AllOrdinalRegex})|(${EnglishNumeric.RoundNumberOrdinalRegex}))s|halves|quarters)(?=\\b)`;
    EnglishNumeric.FractionNounWithArticleRegex = `(?<=\\b)(${EnglishNumeric.AllIntRegex}\\s+(and\\s+)?)?(a|an|one)(\\s+|\\s*-\\s*)(?!\\bfirst\\b|\\bsecond\\b)((${EnglishNumeric.AllOrdinalRegex})|(${EnglishNumeric.RoundNumberOrdinalRegex})|half|quarter)(?=\\b)`;
    EnglishNumeric.FractionPrepositionRegex = `(?<=\\b)(?<numerator>(${EnglishNumeric.AllIntRegex})|((?<![\\.,])\\d+))\\s+(over|in|out\\s+of)\\s+(?<denominator>(${EnglishNumeric.AllIntRegex})|(\\d+)(?![\\.,]))(?=\\b)`;
    EnglishNumeric.FractionPrepositionWithinPercentModeRegex = `(?<=\\b)(?<numerator>(${EnglishNumeric.AllIntRegex})|((?<![\\.,])\\d+))\\s+over\\s+(?<denominator>(${EnglishNumeric.AllIntRegex})|(\\d+)(?![\\.,]))(?=\\b)`;
    EnglishNumeric.AllPointRegex = `((\\s+${EnglishNumeric.ZeroToNineIntegerRegex})+|(\\s+${EnglishNumeric.SeparaIntRegex}))`;
    EnglishNumeric.AllFloatRegex = `${EnglishNumeric.AllIntRegex}(\\s+point)${EnglishNumeric.AllPointRegex}`;
    EnglishNumeric.DoubleWithMultiplierRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))\\d+[\\.,]\\d+\\s*(K|k|M|G|T|B|b)(?=\\b)`;
    EnglishNumeric.DoubleExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))(\\d+([\\.,]\\d+)?)e([+-]*[1-9]\\d*)(?=\\b)`;
    EnglishNumeric.DoubleCaretExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))(\\d+([\\.,]\\d+)?)\\^([+-]*[1-9]\\d*)(?=\\b)`;
    EnglishNumeric.DoubleDecimalPointRegex = (placeholder) => { return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))\\d+[\\.,]\\d+(?!([\\.,]\\d+))(?=${placeholder})`; };
    EnglishNumeric.DoubleWithoutIntegralRegex = (placeholder) => { return `(?<=\\s|^)(?<!(\\d+))[\\.,]\\d+(?!([\\.,]\\d+))(?=${placeholder})`; };
    EnglishNumeric.DoubleWithRoundNumber = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))\\d+[\\.,]\\d+\\s+${EnglishNumeric.RoundNumberIntegerRegex}(?=\\b)`;
    EnglishNumeric.DoubleAllFloatRegex = `((?<=\\b)${EnglishNumeric.AllFloatRegex}(?=\\b))`;
    EnglishNumeric.CurrencyRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(B|b|m|t|g)(?=\\b)`;
    EnglishNumeric.ConnectorRegex = `(?<spacer>and)`;
    EnglishNumeric.NumberWithSuffixPercentage = `(?<!%)(${baseNumbers.BaseNumbers.NumberReplaceToken})(\\s*)(%(?!${baseNumbers.BaseNumbers.NumberReplaceToken})|(per cents|per cent|cents|cent|percentage|percents|percent)\\b)`;
    EnglishNumeric.FractionNumberWithSuffixPercentage = `((${baseNumbers.BaseNumbers.FractionNumberReplaceToken})\\s+of)`;
    EnglishNumeric.NumberWithPrefixPercentage = `(per cent of|percent of|percents of)(\\s*)(${baseNumbers.BaseNumbers.NumberReplaceToken})`;
    EnglishNumeric.NumberWithPrepositionPercentage = `(${baseNumbers.BaseNumbers.NumberReplaceToken})\\s*(in|out\\s+of)\\s*(${baseNumbers.BaseNumbers.NumberReplaceToken})`;
    EnglishNumeric.TillRegex = `(to|through|--|-|—|——|~|–)`;
    EnglishNumeric.MoreRegex = `((bigger|greater|more|higher|larger)(\\s+than)?|above|over|(?<!<|=)>)`;
    EnglishNumeric.LessRegex = `((less|lower|smaller|fewer)(\\s+than)?|below|under|(?<!>|=)<)`;
    EnglishNumeric.EqualRegex = `(equal(s|ing)?(\\s+(to|than))?|(?<!<|>)=)`;
    EnglishNumeric.MoreOrEqualPrefix = `((no\\s+${EnglishNumeric.LessRegex})|(at\\s+least))`;
    EnglishNumeric.MoreOrEqual = `((${EnglishNumeric.MoreRegex}\\s+(or)?\\s+${EnglishNumeric.EqualRegex})|(${EnglishNumeric.EqualRegex}\\s+(or)?\\s+${EnglishNumeric.MoreRegex})|${EnglishNumeric.MoreOrEqualPrefix}(\\s+(or)?\\s+${EnglishNumeric.EqualRegex})?|(${EnglishNumeric.EqualRegex}\\s+(or)?\\s+)?${EnglishNumeric.MoreOrEqualPrefix}|>\\s*=)`;
    EnglishNumeric.MoreOrEqualSuffix = `((and|or)\\s+(more|greater|higher|larger|bigger)((?!\\s+than)|(\\s+than(?!(\\s*\\d+)))))`;
    EnglishNumeric.LessOrEqualPrefix = `((no\\s+${EnglishNumeric.MoreRegex})|(at\\s+most))`;
    EnglishNumeric.LessOrEqual = `((${EnglishNumeric.LessRegex}\\s+(or)?\\s+${EnglishNumeric.EqualRegex})|(${EnglishNumeric.EqualRegex}\\s+(or)?\\s+${EnglishNumeric.LessRegex})|${EnglishNumeric.LessOrEqualPrefix}(\\s+(or)?\\s+${EnglishNumeric.EqualRegex})?|(${EnglishNumeric.EqualRegex}\\s+(or)?\\s+)?${EnglishNumeric.LessOrEqualPrefix}|<\\s*=)`;
    EnglishNumeric.LessOrEqualSuffix = `((and|or)\\s+(less|lower|smaller|fewer)((?!\\s+than)|(\\s+than(?!(\\s*\\d+)))))`;
    EnglishNumeric.NumberSplitMark = `(?![,.](?!\\d+))`;
    EnglishNumeric.MoreRegexNoNumberSucceed = `((bigger|greater|more|higher|larger)((?!\\s+than)|\\s+(than(?!(\\s*\\d+))))|(above|over)(?!(\\s*\\d+)))`;
    EnglishNumeric.LessRegexNoNumberSucceed = `((less|lower|smaller|fewer)((?!\\s+than)|\\s+(than(?!(\\s*\\d+))))|(below|under)(?!(\\s*\\d+)))`;
    EnglishNumeric.EqualRegexNoNumberSucceed = `(equal(s|ing)?((?!\\s+(to|than))|(\\s+(to|than)(?!(\\s*\\d+)))))`;
    EnglishNumeric.OneNumberRangeMoreRegex1 = `(${EnglishNumeric.MoreOrEqual}|${EnglishNumeric.MoreRegex})\\s*(the\\s+)?(?<number1>(${EnglishNumeric.NumberSplitMark}.)+)`;
    EnglishNumeric.OneNumberRangeMoreRegex2 = `(?<number1>(${EnglishNumeric.NumberSplitMark}.)+)\\s*${EnglishNumeric.MoreOrEqualSuffix}`;
    EnglishNumeric.OneNumberRangeMoreSeparateRegex = `(${EnglishNumeric.EqualRegex}\\s+(?<number1>(${EnglishNumeric.NumberSplitMark}.)+)(\\s+or\\s+)${EnglishNumeric.MoreRegexNoNumberSucceed})|(${EnglishNumeric.MoreRegex}\\s+(?<number1>(${EnglishNumeric.NumberSplitMark}.)+)(\\s+or\\s+)${EnglishNumeric.EqualRegexNoNumberSucceed})`;
    EnglishNumeric.OneNumberRangeLessRegex1 = `(${EnglishNumeric.LessOrEqual}|${EnglishNumeric.LessRegex})\\s*(the\\s+)?(?<number2>(${EnglishNumeric.NumberSplitMark}.)+)`;
    EnglishNumeric.OneNumberRangeLessRegex2 = `(?<number2>(${EnglishNumeric.NumberSplitMark}.)+)\\s*${EnglishNumeric.LessOrEqualSuffix}`;
    EnglishNumeric.OneNumberRangeLessSeparateRegex = `(${EnglishNumeric.EqualRegex}\\s+(?<number1>(${EnglishNumeric.NumberSplitMark}.)+)(\\s+or\\s+)${EnglishNumeric.LessRegexNoNumberSucceed})|(${EnglishNumeric.LessRegex}\\s+(?<number1>(${EnglishNumeric.NumberSplitMark}.)+)(\\s+or\\s+)${EnglishNumeric.EqualRegexNoNumberSucceed})`;
    EnglishNumeric.OneNumberRangeEqualRegex = `${EnglishNumeric.EqualRegex}\\s*(the\\s+)?(?<number1>(${EnglishNumeric.NumberSplitMark}.)+)`;
    EnglishNumeric.TwoNumberRangeRegex1 = `between\\s*(the\\s+)?(?<number1>(${EnglishNumeric.NumberSplitMark}.)+)\\s*and\\s*(the\\s+)?(?<number2>(${EnglishNumeric.NumberSplitMark}.)+)`;
    EnglishNumeric.TwoNumberRangeRegex2 = `(${EnglishNumeric.OneNumberRangeMoreRegex1}|${EnglishNumeric.OneNumberRangeMoreRegex2})\\s*(and|but|,)\\s*(${EnglishNumeric.OneNumberRangeLessRegex1}|${EnglishNumeric.OneNumberRangeLessRegex2})`;
    EnglishNumeric.TwoNumberRangeRegex3 = `(${EnglishNumeric.OneNumberRangeLessRegex1}|${EnglishNumeric.OneNumberRangeLessRegex2})\\s*(and|but|,)\\s*(${EnglishNumeric.OneNumberRangeMoreRegex1}|${EnglishNumeric.OneNumberRangeMoreRegex2})`;
    EnglishNumeric.TwoNumberRangeRegex4 = `(from\\s+)?(?<number1>(${EnglishNumeric.NumberSplitMark}(?!\\bfrom\\b).)+)\\s*${EnglishNumeric.TillRegex}\\s*(the\\s+)?(?<number2>(${EnglishNumeric.NumberSplitMark}.)+)`;
    EnglishNumeric.AmbiguousFractionConnectorsRegex = `(\\bin\\b)`;
    EnglishNumeric.DecimalSeparatorChar = '.';
    EnglishNumeric.FractionMarkerToken = 'over';
    EnglishNumeric.NonDecimalSeparatorChar = ',';
    EnglishNumeric.HalfADozenText = 'six';
    EnglishNumeric.WordSeparatorToken = 'and';
    EnglishNumeric.WrittenDecimalSeparatorTexts = ['point'];
    EnglishNumeric.WrittenGroupSeparatorTexts = ['punto'];
    EnglishNumeric.WrittenIntegerSeparatorTexts = ['and'];
    EnglishNumeric.WrittenFractionSeparatorTexts = ['and'];
    EnglishNumeric.HalfADozenRegex = `half\\s+a\\s+dozen`;
    EnglishNumeric.DigitalNumberRegex = `((?<=\\b)(hundred|thousand|million|billion|trillion|dozen(s)?)(?=\\b))|((?<=(\\d|\\b))(k|t|m|g|b)(?=\\b))`;
    EnglishNumeric.CardinalNumberMap = new Map([["a", 1], ["zero", 0], ["an", 1], ["one", 1], ["two", 2], ["three", 3], ["four", 4], ["five", 5], ["six", 6], ["seven", 7], ["eight", 8], ["nine", 9], ["ten", 10], ["eleven", 11], ["twelve", 12], ["dozen", 12], ["dozens", 12], ["thirteen", 13], ["fourteen", 14], ["fifteen", 15], ["sixteen", 16], ["seventeen", 17], ["eighteen", 18], ["nineteen", 19], ["twenty", 20], ["thirty", 30], ["forty", 40], ["fifty", 50], ["sixty", 60], ["seventy", 70], ["eighty", 80], ["ninety", 90], ["hundred", 100], ["thousand", 1000], ["million", 1000000], ["billion", 1000000000], ["trillion", 1000000000000]]);
    EnglishNumeric.OrdinalNumberMap = new Map([["first", 1], ["second", 2], ["secondary", 2], ["half", 2], ["third", 3], ["fourth", 4], ["quarter", 4], ["fifth", 5], ["sixth", 6], ["seventh", 7], ["eighth", 8], ["ninth", 9], ["tenth", 10], ["eleventh", 11], ["twelfth", 12], ["thirteenth", 13], ["fourteenth", 14], ["fifteenth", 15], ["sixteenth", 16], ["seventeenth", 17], ["eighteenth", 18], ["nineteenth", 19], ["twentieth", 20], ["thirtieth", 30], ["fortieth", 40], ["fiftieth", 50], ["sixtieth", 60], ["seventieth", 70], ["eightieth", 80], ["ninetieth", 90], ["hundredth", 100], ["thousandth", 1000], ["millionth", 1000000], ["billionth", 1000000000], ["trillionth", 1000000000000], ["firsts", 1], ["halves", 2], ["thirds", 3], ["fourths", 4], ["quarters", 4], ["fifths", 5], ["sixths", 6], ["sevenths", 7], ["eighths", 8], ["ninths", 9], ["tenths", 10], ["elevenths", 11], ["twelfths", 12], ["thirteenths", 13], ["fourteenths", 14], ["fifteenths", 15], ["sixteenths", 16], ["seventeenths", 17], ["eighteenths", 18], ["nineteenths", 19], ["twentieths", 20], ["thirtieths", 30], ["fortieths", 40], ["fiftieths", 50], ["sixtieths", 60], ["seventieths", 70], ["eightieths", 80], ["ninetieths", 90], ["hundredths", 100], ["thousandths", 1000], ["millionths", 1000000], ["billionths", 1000000000], ["trillionths", 1000000000000]]);
    EnglishNumeric.RoundNumberMap = new Map([["hundred", 100], ["thousand", 1000], ["million", 1000000], ["billion", 1000000000], ["trillion", 1000000000000], ["hundredth", 100], ["thousandth", 1000], ["millionth", 1000000], ["billionth", 1000000000], ["trillionth", 1000000000000], ["hundredths", 100], ["thousandths", 1000], ["millionths", 1000000], ["billionths", 1000000000], ["trillionths", 1000000000000], ["dozen", 12], ["dozens", 12], ["k", 1000], ["m", 1000000], ["g", 1000000000], ["b", 1000000000], ["t", 1000000000000]]);
    EnglishNumeric.AmbiguityFiltersDict = new Map([["\\bone\\b", "\\b(the|this|that|which)\\s+(one)\\b"]]);
})(EnglishNumeric = exports.EnglishNumeric || (exports.EnglishNumeric = {}));

});

unwrapExports(englishNumeric);

var parserConfiguration = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });



class EnglishNumberParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new culture$2.CultureInfo(culture$2.Culture.English);
        }
        this.cultureInfo = ci;
        this.langMarker = englishNumeric.EnglishNumeric.LangMarker;
        this.decimalSeparatorChar = englishNumeric.EnglishNumeric.DecimalSeparatorChar;
        this.fractionMarkerToken = englishNumeric.EnglishNumeric.FractionMarkerToken;
        this.nonDecimalSeparatorChar = englishNumeric.EnglishNumeric.NonDecimalSeparatorChar;
        this.halfADozenText = englishNumeric.EnglishNumeric.HalfADozenText;
        this.wordSeparatorToken = englishNumeric.EnglishNumeric.WordSeparatorToken;
        this.writtenDecimalSeparatorTexts = englishNumeric.EnglishNumeric.WrittenDecimalSeparatorTexts;
        this.writtenGroupSeparatorTexts = englishNumeric.EnglishNumeric.WrittenGroupSeparatorTexts;
        this.writtenIntegerSeparatorTexts = englishNumeric.EnglishNumeric.WrittenIntegerSeparatorTexts;
        this.writtenFractionSeparatorTexts = englishNumeric.EnglishNumeric.WrittenFractionSeparatorTexts;
        this.cardinalNumberMap = englishNumeric.EnglishNumeric.CardinalNumberMap;
        this.ordinalNumberMap = englishNumeric.EnglishNumeric.OrdinalNumberMap;
        this.roundNumberMap = englishNumeric.EnglishNumeric.RoundNumberMap;
        this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.NegativeNumberSignRegex, "is");
        this.halfADozenRegex = recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.HalfADozenRegex, "gis");
        this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.DigitalNumberRegex, "gis");
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
                }
                else {
                    fracWords.push(tokenList[i]);
                }
            }
            else if ((i < tokenLen - 2) && tokenList[i + 1] === "-") {
                if (this.ordinalNumberMap.has(tokenList[i + 2])) {
                    fracWords.push(tokenList[i]);
                    fracWords.push(tokenList[i + 2]);
                }
                else {
                    fracWords.push(tokenList[i] + tokenList[i + 1] + tokenList[i + 2]);
                }
                i += 2;
            }
            else {
                fracWords.push(tokenList[i]);
            }
        }
        return fracWords;
    }
    resolveCompositeNumber(numberStr) {
        if (numberStr.includes("-")) {
            let numbers = numberStr.split('-');
            let ret = 0;
            numbers.forEach(num => {
                if (this.ordinalNumberMap.has(num)) {
                    ret += this.ordinalNumberMap.get(num);
                }
                else if (this.cardinalNumberMap.has(num)) {
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
}
exports.EnglishNumberParserConfiguration = EnglishNumberParserConfiguration;

});

unwrapExports(parserConfiguration);

var spanishNumeric = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });

var SpanishNumeric;
(function (SpanishNumeric) {
    SpanishNumeric.LangMarker = 'Spa';
    SpanishNumeric.HundredsNumberIntegerRegex = `(cuatrocient[ao]s|trescient[ao]s|seiscient[ao]s|setecient[ao]s|ochocient[ao]s|novecient[ao]s|doscient[ao]s|quinient[ao]s|(?<!por\\s+)(cien(to)?))`;
    SpanishNumeric.RoundNumberIntegerRegex = `(mil millones|mil|millones|mill[oó]n|billones|bill[oó]n|trillones|trill[oó]n|cuatrillones|cuatrill[oó]n|quintillones|quintill[oó]n|sextillones|sextill[oó]n|septillones|septill[oó]n)`;
    SpanishNumeric.ZeroToNineIntegerRegex = `(cuatro|cinco|siete|nueve|cero|tres|seis|ocho|dos|un[ao]?)`;
    SpanishNumeric.TenToNineteenIntegerRegex = `(diecisiete|diecinueve|diecis[eé]is|dieciocho|catorce|quince|trece|diez|once|doce)`;
    SpanishNumeric.TwentiesIntegerRegex = `(veinticuatro|veinticinco|veintisiete|veintinueve|veintitr[eé]s|veintis[eé]is|veintiocho|veintid[oó]s|ventiun[ao]|veinti[uú]n[oa]?|veinte)`;
    SpanishNumeric.TensNumberIntegerRegex = `(cincuenta|cuarenta|treinta|sesenta|setenta|ochenta|noventa)`;
    SpanishNumeric.NegativeNumberTermsRegex = `^[.]`;
    SpanishNumeric.NegativeNumberSignRegex = `^(${SpanishNumeric.NegativeNumberTermsRegex}\\s+).*`;
    SpanishNumeric.DigitsNumberRegex = `\\d|\\d{1,3}(\\.\\d{3})`;
    SpanishNumeric.BelowHundredsRegex = `((${SpanishNumeric.TenToNineteenIntegerRegex}|${SpanishNumeric.TwentiesIntegerRegex}|(${SpanishNumeric.TensNumberIntegerRegex}(\\s+y\\s+${SpanishNumeric.ZeroToNineIntegerRegex})?))|${SpanishNumeric.ZeroToNineIntegerRegex})`;
    SpanishNumeric.BelowThousandsRegex = `(${SpanishNumeric.HundredsNumberIntegerRegex}(\\s+${SpanishNumeric.BelowHundredsRegex})?|${SpanishNumeric.BelowHundredsRegex})`;
    SpanishNumeric.SupportThousandsRegex = `((${SpanishNumeric.BelowThousandsRegex}|${SpanishNumeric.BelowHundredsRegex})\\s+${SpanishNumeric.RoundNumberIntegerRegex}(\\s+${SpanishNumeric.RoundNumberIntegerRegex})?)`;
    SpanishNumeric.SeparaIntRegex = `(${SpanishNumeric.SupportThousandsRegex}(\\s+${SpanishNumeric.SupportThousandsRegex})*(\\s+${SpanishNumeric.BelowThousandsRegex})?|${SpanishNumeric.BelowThousandsRegex})`;
    SpanishNumeric.AllIntRegex = `(${SpanishNumeric.SeparaIntRegex}|mil(\\s+${SpanishNumeric.BelowThousandsRegex})?)`;
    SpanishNumeric.PlaceHolderPureNumber = `\\b`;
    SpanishNumeric.PlaceHolderDefault = `\\D|\\b`;
    SpanishNumeric.NumbersWithPlaceHolder = (placeholder) => { return `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+(?!([\\.,]\\d+[a-zA-Z]))(?=${placeholder})`; };
    SpanishNumeric.NumbersWithSuffix = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(k|M|T|G)(?=\\b)`;
    SpanishNumeric.RoundNumberIntegerRegexWithLocks = `(?<=\\b)(${SpanishNumeric.DigitsNumberRegex})+\\s+${SpanishNumeric.RoundNumberIntegerRegex}(?=\\b)`;
    SpanishNumeric.NumbersWithDozenSuffix = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+docenas?(?=\\b)`;
    SpanishNumeric.AllIntRegexWithLocks = `((?<=\\b)${SpanishNumeric.AllIntRegex}(?=\\b))`;
    SpanishNumeric.AllIntRegexWithDozenSuffixLocks = `(?<=\\b)(((media\\s+)?\\s+docena)|(${SpanishNumeric.AllIntRegex}\\s+(y|con)\\s+)?(${SpanishNumeric.AllIntRegex}\\s+docenas?))(?=\\b)`;
    SpanishNumeric.SimpleRoundOrdinalRegex = `(mil[eé]simo|millon[eé]sim[oa]|billon[eé]sim[oa]|trillon[eé]sim[oa]|cuatrillon[eé]sim[oa]|quintillon[eé]sim[oa]|sextillon[eé]sim[oa]|septillon[eé]sim[oa])`;
    SpanishNumeric.OneToNineOrdinalRegex = `(primer[oa]|segund[oa]|tercer[oa]|cuart[oa]|quint[oa]|sext[oa]|s[eé]ptim[oa]|octav[oa]|noven[oa])`;
    SpanishNumeric.TensOrdinalRegex = `(nonag[eé]sim[oa]|octog[eé]sim[oa]|septuag[eé]sim[oa]|sexag[eé]sim[oa]|quincuag[eé]sim[oa]|cuadrag[eé]sim[oa]|trig[eé]sim[oa]|vig[eé]sim[oa]|d[eé]cim[oa])`;
    SpanishNumeric.HundredOrdinalRegex = `(cent[eé]sim[oa]|ducent[eé]sim[oa]|tricent[eé]sim[oa]|cuadringent[eé]sim[oa]|quingent[eé]sim[oa]|sexcent[eé]sim[oa]|septingent[eé]sim[oa]|octingent[eé]sim[oa]|noningent[eé]sim[oa])`;
    SpanishNumeric.SpecialUnderHundredOrdinalRegex = `(und[eé]cim[oa]|duod[eé]cimo|decimoctav[oa])`;
    SpanishNumeric.UnderHundredOrdinalRegex = `(((${SpanishNumeric.TensOrdinalRegex}(\\s)?)?${SpanishNumeric.OneToNineOrdinalRegex})|${SpanishNumeric.TensOrdinalRegex}|${SpanishNumeric.SpecialUnderHundredOrdinalRegex})`;
    SpanishNumeric.UnderThousandOrdinalRegex = `(((${SpanishNumeric.HundredOrdinalRegex}(\\s)?)?${SpanishNumeric.UnderHundredOrdinalRegex})|${SpanishNumeric.HundredOrdinalRegex})`;
    SpanishNumeric.OverThousandOrdinalRegex = `((${SpanishNumeric.AllIntRegex})([eé]sim[oa]))`;
    SpanishNumeric.ComplexOrdinalRegex = `((${SpanishNumeric.OverThousandOrdinalRegex}(\\s)?)?${SpanishNumeric.UnderThousandOrdinalRegex}|${SpanishNumeric.OverThousandOrdinalRegex})`;
    SpanishNumeric.SufixRoundOrdinalRegex = `((${SpanishNumeric.AllIntRegex})(${SpanishNumeric.SimpleRoundOrdinalRegex}))`;
    SpanishNumeric.ComplexRoundOrdinalRegex = `(((${SpanishNumeric.SufixRoundOrdinalRegex}(\\s)?)?${SpanishNumeric.ComplexOrdinalRegex})|${SpanishNumeric.SufixRoundOrdinalRegex})`;
    SpanishNumeric.AllOrdinalRegex = `${SpanishNumeric.ComplexOrdinalRegex}|${SpanishNumeric.SimpleRoundOrdinalRegex}|${SpanishNumeric.ComplexRoundOrdinalRegex}`;
    SpanishNumeric.OrdinalSuffixRegex = `(?<=\\b)(\\d*(1r[oa]|2d[oa]|3r[oa]|4t[oa]|5t[oa]|6t[oa]|7m[oa]|8v[oa]|9n[oa]|0m[oa]|11[vm][oa]|12[vm][oa]))(?=\\b)`;
    SpanishNumeric.OrdinalNounRegex = `(?<=\\b)${SpanishNumeric.AllOrdinalRegex}(?=\\b)`;
    SpanishNumeric.SpecialFractionInteger = `(((${SpanishNumeric.AllIntRegex})i?(${SpanishNumeric.ZeroToNineIntegerRegex})|(${SpanishNumeric.AllIntRegex}))a?v[oa]s?)`;
    SpanishNumeric.FractionNotationRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+[/]\\d+(?=(\\b[^/]|$))`;
    SpanishNumeric.FractionNotationWithSpacesRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+\\d+[/]\\d+(?=(\\b[^/]|$))`;
    SpanishNumeric.FractionNounRegex = `(?<=\\b)(${SpanishNumeric.AllIntRegex}\\s+((y|con)\\s+)?)?(${SpanishNumeric.AllIntRegex})(\\s+((y|con)\\s)?)(((${SpanishNumeric.AllOrdinalRegex})s?|(${SpanishNumeric.SpecialFractionInteger})|(${SpanishNumeric.SufixRoundOrdinalRegex})s?)|medi[oa]s?|tercios?)(?=\\b)`;
    SpanishNumeric.FractionNounWithArticleRegex = `(?<=\\b)(${SpanishNumeric.AllIntRegex}\\s+(y\\s+)?)?(un|un[oa])(\\s+)((${SpanishNumeric.AllOrdinalRegex})|(${SpanishNumeric.SufixRoundOrdinalRegex})|(y\\s+)?medi[oa]s?)(?=\\b)`;
    SpanishNumeric.FractionPrepositionRegex = `(?<=\\b)(?<numerator>(${SpanishNumeric.AllIntRegex})|((?<!\\.)\\d+))\\s+sobre\\s+(?<denominator>(${SpanishNumeric.AllIntRegex})|((\\d+)(?!\\.)))(?=\\b)`;
    SpanishNumeric.AllPointRegex = `((\\s+${SpanishNumeric.ZeroToNineIntegerRegex})+|(\\s+${SpanishNumeric.AllIntRegex}))`;
    SpanishNumeric.AllFloatRegex = `${SpanishNumeric.AllIntRegex}(\\s+(coma|con))${SpanishNumeric.AllPointRegex}`;
    SpanishNumeric.DoubleDecimalPointRegex = (placeholder) => { return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))\\d+[\\.,]\\d+(?!([\\.,]\\d+))(?=${placeholder})`; };
    SpanishNumeric.DoubleWithoutIntegralRegex = (placeholder) => { return `(?<=\\s|^)(?<!(\\d+))[\\.,]\\d+(?!([\\.,]\\d+))(?=${placeholder})`; };
    SpanishNumeric.DoubleWithMultiplierRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\[\\.,])))\\d+[\\.,]\\d+\\s*(K|k|M|G|T)(?=\\b)`;
    SpanishNumeric.DoubleWithRoundNumber = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\[\\.,])))\\d+[\\.,]\\d+\\s+${SpanishNumeric.RoundNumberIntegerRegex}(?=\\b)`;
    SpanishNumeric.DoubleAllFloatRegex = `((?<=\\b)${SpanishNumeric.AllFloatRegex}(?=\\b))`;
    SpanishNumeric.DoubleExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))(\\d+([\\.,]\\d+)?)e([+-]*[1-9]\\d*)(?=\\b)`;
    SpanishNumeric.DoubleCaretExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[\\.,])))(\\d+([\\.,]\\d+)?)\\^([+-]*[1-9]\\d*)(?=\\b)`;
    SpanishNumeric.NumberWithPrefixPercentage = `(?<!%)(${baseNumbers.BaseNumbers.NumberReplaceToken})(\\s*)(%(?!${baseNumbers.BaseNumbers.NumberReplaceToken})|(por ciento|por cien)\\b)`;
    SpanishNumeric.CurrencyRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(B|b|m|t|g)(?=\\b)`;
    SpanishNumeric.DecimalSeparatorChar = ',';
    SpanishNumeric.FractionMarkerToken = 'sobre';
    SpanishNumeric.NonDecimalSeparatorChar = '.';
    SpanishNumeric.HalfADozenText = 'seis';
    SpanishNumeric.WordSeparatorToken = 'y';
    SpanishNumeric.WrittenDecimalSeparatorTexts = ['coma', 'con'];
    SpanishNumeric.WrittenGroupSeparatorTexts = ['punto'];
    SpanishNumeric.WrittenIntegerSeparatorTexts = ['y'];
    SpanishNumeric.WrittenFractionSeparatorTexts = ['con'];
    SpanishNumeric.HalfADozenRegex = `media\\s+docena`;
    SpanishNumeric.DigitalNumberRegex = `((?<=\\b)(mil|millones|mill[oó]n|billones|bill[oó]n|trillones|trill[oó]n|docenas?)(?=\\b))|((?<=(\\d|\\b))(k|t|m|g)(?=\\b))`;
    SpanishNumeric.CardinalNumberMap = new Map([["cero", 0], ["un", 1], ["una", 1], ["uno", 1], ["dos", 2], ["tres", 3], ["cuatro", 4], ["cinco", 5], ["seis", 6], ["siete", 7], ["ocho", 8], ["nueve", 9], ["diez", 10], ["once", 11], ["doce", 12], ["docena", 12], ["docenas", 12], ["trece", 13], ["catorce", 14], ["quince", 15], ["dieciseis", 16], ["dieciséis", 16], ["diecisiete", 17], ["dieciocho", 18], ["diecinueve", 19], ["veinte", 20], ["ventiuna", 21], ["ventiuno", 21], ["veintiun", 21], ["veintiún", 21], ["veintiuno", 21], ["veintiuna", 21], ["veintidos", 22], ["veintidós", 22], ["veintitres", 23], ["veintitrés", 23], ["veinticuatro", 24], ["veinticinco", 25], ["veintiseis", 26], ["veintiséis", 26], ["veintisiete", 27], ["veintiocho", 28], ["veintinueve", 29], ["treinta", 30], ["cuarenta", 40], ["cincuenta", 50], ["sesenta", 60], ["setenta", 70], ["ochenta", 80], ["noventa", 90], ["cien", 100], ["ciento", 100], ["doscientas", 200], ["doscientos", 200], ["trescientas", 300], ["trescientos", 300], ["cuatrocientas", 400], ["cuatrocientos", 400], ["quinientas", 500], ["quinientos", 500], ["seiscientas", 600], ["seiscientos", 600], ["setecientas", 700], ["setecientos", 700], ["ochocientas", 800], ["ochocientos", 800], ["novecientas", 900], ["novecientos", 900], ["mil", 1000], ["millon", 1000000], ["millón", 1000000], ["millones", 1000000], ["billon", 1000000000000], ["billón", 1000000000000], ["billones", 1000000000000], ["trillon", 1000000000000000000], ["trillón", 1000000000000000000], ["trillones", 1000000000000000000]]);
    SpanishNumeric.OrdinalNumberMap = new Map([["primero", 1], ["primera", 1], ["primer", 1], ["segundo", 2], ["segunda", 2], ["medio", 2], ["media", 2], ["tercero", 3], ["tercera", 3], ["tercer", 3], ["tercio", 3], ["cuarto", 4], ["cuarta", 4], ["quinto", 5], ["quinta", 5], ["sexto", 6], ["sexta", 6], ["septimo", 7], ["septima", 7], ["octavo", 8], ["octava", 8], ["noveno", 9], ["novena", 9], ["decimo", 10], ["decima", 10], ["undecimo", 11], ["undecima", 11], ["duodecimo", 12], ["duodecima", 12], ["decimotercero", 13], ["decimotercera", 13], ["decimocuarto", 14], ["decimocuarta", 14], ["decimoquinto", 15], ["decimoquinta", 15], ["decimosexto", 16], ["decimosexta", 16], ["decimoseptimo", 17], ["decimoseptima", 17], ["decimoctavo", 18], ["decimoctava", 18], ["decimonoveno", 19], ["decimonovena", 19], ["vigesimo", 20], ["vigesima", 20], ["trigesimo", 30], ["trigesima", 30], ["cuadragesimo", 40], ["cuadragesima", 40], ["quincuagesimo", 50], ["quincuagesima", 50], ["sexagesimo", 60], ["sexagesima", 60], ["septuagesimo", 70], ["septuagesima", 70], ["octogesimo", 80], ["octogesima", 80], ["nonagesimo", 90], ["nonagesima", 90], ["centesimo", 100], ["centesima", 100], ["ducentesimo", 200], ["ducentesima", 200], ["tricentesimo", 300], ["tricentesima", 300], ["cuadringentesimo", 400], ["cuadringentesima", 400], ["quingentesimo", 500], ["quingentesima", 500], ["sexcentesimo", 600], ["sexcentesima", 600], ["septingentesimo", 700], ["septingentesima", 700], ["octingentesimo", 800], ["octingentesima", 800], ["noningentesimo", 900], ["noningentesima", 900], ["milesimo", 1000], ["milesima", 1000], ["millonesimo", 1000000], ["millonesima", 1000000], ["billonesimo", 1000000000000], ["billonesima", 1000000000000]]);
    SpanishNumeric.PrefixCardinalMap = new Map([["dos", 2], ["tres", 3], ["cuatro", 4], ["cinco", 5], ["seis", 6], ["siete", 7], ["ocho", 8], ["nueve", 9], ["diez", 10], ["once", 11], ["doce", 12], ["trece", 13], ["catorce", 14], ["quince", 15], ["dieciseis", 16], ["dieciséis", 16], ["diecisiete", 17], ["dieciocho", 18], ["diecinueve", 19], ["veinte", 20], ["ventiuna", 21], ["veintiun", 21], ["veintiún", 21], ["veintidos", 22], ["veintitres", 23], ["veinticuatro", 24], ["veinticinco", 25], ["veintiseis", 26], ["veintisiete", 27], ["veintiocho", 28], ["veintinueve", 29], ["treinta", 30], ["cuarenta", 40], ["cincuenta", 50], ["sesenta", 60], ["setenta", 70], ["ochenta", 80], ["noventa", 90], ["cien", 100], ["doscientos", 200], ["trescientos", 300], ["cuatrocientos", 400], ["quinientos", 500], ["seiscientos", 600], ["setecientos", 700], ["ochocientos", 800], ["novecientos", 900]]);
    SpanishNumeric.SuffixOrdinalMap = new Map([["milesimo", 1000], ["millonesimo", 1000000], ["billonesimo", 1000000000000]]);
    SpanishNumeric.RoundNumberMap = new Map([["mil", 1000], ["milesimo", 1000], ["millon", 1000000], ["millón", 1000000], ["millones", 1000000], ["millonesimo", 1000000], ["billon", 1000000000000], ["billón", 1000000000000], ["billones", 1000000000000], ["billonesimo", 1000000000000], ["trillon", 1000000000000000000], ["trillón", 1000000000000000000], ["trillones", 1000000000000000000], ["trillonesimo", 1000000000000000000], ["docena", 12], ["docenas", 12], ["k", 1000], ["m", 1000000], ["g", 1000000000], ["t", 1000000000000]]);
    SpanishNumeric.AmbiguousFractionConnectorsRegex = `^[.]`;
})(SpanishNumeric = exports.SpanishNumeric || (exports.SpanishNumeric = {}));

});

unwrapExports(spanishNumeric);

var parserConfiguration$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });



class SpanishNumberParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new culture$2.CultureInfo(culture$2.Culture.Spanish);
        }
        this.cultureInfo = ci;
        this.langMarker = spanishNumeric.SpanishNumeric.LangMarker;
        this.decimalSeparatorChar = spanishNumeric.SpanishNumeric.DecimalSeparatorChar;
        this.fractionMarkerToken = spanishNumeric.SpanishNumeric.FractionMarkerToken;
        this.nonDecimalSeparatorChar = spanishNumeric.SpanishNumeric.NonDecimalSeparatorChar;
        this.halfADozenText = spanishNumeric.SpanishNumeric.HalfADozenText;
        this.wordSeparatorToken = spanishNumeric.SpanishNumeric.WordSeparatorToken;
        this.writtenDecimalSeparatorTexts = spanishNumeric.SpanishNumeric.WrittenDecimalSeparatorTexts;
        this.writtenGroupSeparatorTexts = spanishNumeric.SpanishNumeric.WrittenGroupSeparatorTexts;
        this.writtenIntegerSeparatorTexts = spanishNumeric.SpanishNumeric.WrittenIntegerSeparatorTexts;
        this.writtenFractionSeparatorTexts = spanishNumeric.SpanishNumeric.WrittenFractionSeparatorTexts;
        let ordinalNumberMap = new Map(spanishNumeric.SpanishNumeric.OrdinalNumberMap);
        spanishNumeric.SpanishNumeric.PrefixCardinalMap.forEach((prefixValue, prefixKey) => {
            spanishNumeric.SpanishNumeric.SuffixOrdinalMap.forEach((suffixValue, suffixKey) => {
                if (!ordinalNumberMap.has(prefixKey + suffixKey)) {
                    ordinalNumberMap.set(prefixKey + suffixKey, prefixValue * suffixValue);
                }
            });
        });
        this.cardinalNumberMap = spanishNumeric.SpanishNumeric.CardinalNumberMap;
        this.ordinalNumberMap = ordinalNumberMap;
        this.roundNumberMap = spanishNumeric.SpanishNumeric.RoundNumberMap;
        this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.NegativeNumberSignRegex, "is");
        this.halfADozenRegex = recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.HalfADozenRegex);
        this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.DigitalNumberRegex);
    }
    normalizeTokenSet(tokens, context) {
        let result = new Array();
        tokens.forEach((token) => {
            let tempWord = token.replace(/^s+/, '').replace(/s+$/, '');
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
                }
                else {
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
            if ((i + 1) === numberStr.length) {
                finalValue += value;
                strBuilder = "";
                i = lastGoodChar++;
                value = 0;
            }
        }
        return finalValue;
    }
}
exports.SpanishNumberParserConfiguration = SpanishNumberParserConfiguration;

});

unwrapExports(parserConfiguration$2);

var portugueseNumeric = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });

var PortugueseNumeric;
(function (PortugueseNumeric) {
    PortugueseNumeric.LangMarker = 'Por';
    PortugueseNumeric.HundredsNumberIntegerRegex = `(quatrocent[ao]s|trezent[ao]s|seiscent[ao]s|setecent[ao]s|oitocent[ao]s|novecent[ao]s|duzent[ao]s|quinhent[ao]s|cem|(?<!por\\s+)(cento))`;
    PortugueseNumeric.RoundNumberIntegerRegex = `(mil|milh[ãa]o|milh[õo]es|bilh[ãa]o|bilh[õo]es|trilh[ãa]o|trilh[õo]es|qua[td]rilh[ãa]o|qua[td]rilh[õo]es|quintilh[ãa]o|quintilh[õo]es)`;
    PortugueseNumeric.ZeroToNineIntegerRegex = `(quatro|cinco|sete|nove|zero|tr[êe]s|seis|oito|dois|duas|um|uma)`;
    PortugueseNumeric.TenToNineteenIntegerRegex = `(dez[ea]sseis|dez[ea]ssete|dez[ea]nove|dezoito|quatorze|catorze|quinze|treze|d[ée]z|onze|doze)`;
    PortugueseNumeric.TensNumberIntegerRegex = `(cinquenta|quarenta|trinta|sessenta|setenta|oitenta|noventa|vinte)`;
    PortugueseNumeric.DigitsNumberRegex = `\\d|\\d{1,3}(\\.\\d{3})`;
    PortugueseNumeric.BelowHundredsRegex = `((${PortugueseNumeric.TenToNineteenIntegerRegex}|(${PortugueseNumeric.TensNumberIntegerRegex}(\\s+e\\s+${PortugueseNumeric.ZeroToNineIntegerRegex})?))|${PortugueseNumeric.ZeroToNineIntegerRegex})`;
    PortugueseNumeric.BelowThousandsRegex = `(${PortugueseNumeric.HundredsNumberIntegerRegex}(\\s+e\\s+${PortugueseNumeric.BelowHundredsRegex})?|${PortugueseNumeric.BelowHundredsRegex})`;
    PortugueseNumeric.SupportThousandsRegex = `((${PortugueseNumeric.BelowThousandsRegex}|${PortugueseNumeric.BelowHundredsRegex})\\s+${PortugueseNumeric.RoundNumberIntegerRegex}(\\s+${PortugueseNumeric.RoundNumberIntegerRegex})?)`;
    PortugueseNumeric.NegativeNumberTermsRegex = `^[.]`;
    PortugueseNumeric.NegativeNumberSignRegex = `^(${PortugueseNumeric.NegativeNumberTermsRegex}\\s+).*`;
    PortugueseNumeric.SeparaIntRegex = `(${PortugueseNumeric.SupportThousandsRegex}(\\s+${PortugueseNumeric.SupportThousandsRegex})*(\\s+${PortugueseNumeric.BelowThousandsRegex})?|${PortugueseNumeric.BelowThousandsRegex})`;
    PortugueseNumeric.AllIntRegex = `(${PortugueseNumeric.SeparaIntRegex}|mil(\\s+${PortugueseNumeric.BelowThousandsRegex})?)`;
    PortugueseNumeric.AllPointRegex = `((\\s+${PortugueseNumeric.ZeroToNineIntegerRegex})+|(\\s+${PortugueseNumeric.AllIntRegex}))`;
    PortugueseNumeric.SpecialFractionInteger = `(((${PortugueseNumeric.AllIntRegex})i?(${PortugueseNumeric.ZeroToNineIntegerRegex})|(${PortugueseNumeric.AllIntRegex}))\\s+a?v[oa]s?)`;
    PortugueseNumeric.PlaceHolderDefault = `\\D|\\b`;
    PortugueseNumeric.PlaceHolderPureNumber = `\\b`;
    PortugueseNumeric.AllIntRegexWithLocks = `((?<=\\b)${PortugueseNumeric.AllIntRegex}(?=\\b))`;
    PortugueseNumeric.AllIntRegexWithDozenSuffixLocks = `(?<=\\b)(((meia)?\\s+(d[úu]zia))|(${PortugueseNumeric.AllIntRegex}\\s+(e|com)\\s+)?(${PortugueseNumeric.AllIntRegex}\\s+(d[úu]zia(s)?|dezena(s)?)))(?=\\b)`;
    PortugueseNumeric.NumbersWithPlaceHolder = (placeholder) => { return `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+(?!(,\\d+[a-zA-Z]))(?=${placeholder})`; };
    PortugueseNumeric.NumbersWithSuffix = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(k|M|T|G)(?=\\b)`;
    PortugueseNumeric.RoundNumberIntegerRegexWithLocks = `(?<=\\b)(${PortugueseNumeric.DigitsNumberRegex})+\\s+${PortugueseNumeric.RoundNumberIntegerRegex}(?=\\b)`;
    PortugueseNumeric.NumbersWithDozenSuffix = `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+\\s+dezena(s)?(?=\\b)`;
    PortugueseNumeric.NumbersWithDozen2Suffix = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+d[úu]zia(s)(?=\\b)`;
    PortugueseNumeric.SimpleRoundOrdinalRegex = `(mil[eé]sim[oa]|milion[eé]sim[oa]|bilion[eé]sim[oa]|trilion[eé]sim[oa]|quatrilion[eé]sim[oa]|quintilion[eé]sim[oa])`;
    PortugueseNumeric.OneToNineOrdinalRegex = `(primeir[oa]|segund[oa]|terceir[oa]|quart[oa]|quint[oa]|sext[oa]|s[eé]tim[oa]|oitav[oa]|non[oa])`;
    PortugueseNumeric.TensOrdinalRegex = `(nonag[eé]sim[oa]|octog[eé]sim[oa]|setuag[eé]sim[oa]|septuag[eé]sim[oa]|sexag[eé]sim[oa]|quinquag[eé]sim[oa]|quadrag[eé]sim[oa]|trig[eé]sim[oa]|vig[eé]sim[oa]|d[eé]cim[oa])`;
    PortugueseNumeric.HundredOrdinalRegex = `(cent[eé]sim[oa]|ducent[eé]sim[oa]|tricent[eé]sim[oa]|cuadringent[eé]sim[oa]|quingent[eé]sim[oa]|sexcent[eé]sim[oa]|septingent[eé]sim[oa]|octingent[eé]sim[oa]|noningent[eé]sim[oa])`;
    PortugueseNumeric.SpecialUnderHundredOrdinalRegex = `(und[eé]cim[oa]|duod[eé]cimo)`;
    PortugueseNumeric.UnderHundredOrdinalRegex = `(((${PortugueseNumeric.TensOrdinalRegex}(\\s)?)?${PortugueseNumeric.OneToNineOrdinalRegex})|${PortugueseNumeric.TensOrdinalRegex}|${PortugueseNumeric.SpecialUnderHundredOrdinalRegex})`;
    PortugueseNumeric.UnderThousandOrdinalRegex = `(((${PortugueseNumeric.HundredOrdinalRegex}(\\s)?)?${PortugueseNumeric.UnderHundredOrdinalRegex})|${PortugueseNumeric.HundredOrdinalRegex})`;
    PortugueseNumeric.OverThousandOrdinalRegex = `((${PortugueseNumeric.AllIntRegex})([eé]sim[oa]))`;
    PortugueseNumeric.ComplexOrdinalRegex = `((${PortugueseNumeric.OverThousandOrdinalRegex}(\\s)?)?${PortugueseNumeric.UnderThousandOrdinalRegex}|${PortugueseNumeric.OverThousandOrdinalRegex})`;
    PortugueseNumeric.SuffixRoundOrdinalRegex = `((${PortugueseNumeric.AllIntRegex})(${PortugueseNumeric.SimpleRoundOrdinalRegex}))`;
    PortugueseNumeric.ComplexRoundOrdinalRegex = `(((${PortugueseNumeric.SuffixRoundOrdinalRegex}(\\s)?)?${PortugueseNumeric.ComplexOrdinalRegex})|${PortugueseNumeric.SuffixRoundOrdinalRegex})`;
    PortugueseNumeric.AllOrdinalRegex = `${PortugueseNumeric.ComplexOrdinalRegex}|${PortugueseNumeric.SimpleRoundOrdinalRegex}|${PortugueseNumeric.ComplexRoundOrdinalRegex}`;
    PortugueseNumeric.OrdinalSuffixRegex = `(?<=\\b)(\\d*(1[oaº]|2[oaº]|3[oaº]|4[oaº]|5[oaº]|6[oaº]|7[oaº]|8[oaº]|9[oaº]|0[oaº]|1.º|2.º|3.º|4.º|5.º|6.º|7.º|8.º|9.º))(?=\\b)`;
    PortugueseNumeric.OrdinalEnglishRegex = `(?<=\\b)${PortugueseNumeric.AllOrdinalRegex}(?=\\b)`;
    PortugueseNumeric.FractionNotationRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+[/]\\d+(?=(\\b[^/]|$))`;
    PortugueseNumeric.FractionNotationWithSpacesRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+\\d+[/]\\d+(?=(\\b[^/]|$))`;
    PortugueseNumeric.FractionNounRegex = `(?<=\\b)(${PortugueseNumeric.AllIntRegex}\\s+((e|com)\\s+)?)?(${PortugueseNumeric.AllIntRegex})(\\s+((e|com)\\s)?)(((${PortugueseNumeric.AllOrdinalRegex})s?|(${PortugueseNumeric.SpecialFractionInteger})|(${PortugueseNumeric.SuffixRoundOrdinalRegex})s?)|mei[oa]?|ter[çc]o?)(?=\\b)`;
    PortugueseNumeric.FractionNounWithArticleRegex = `(?<=\\b)(${PortugueseNumeric.AllIntRegex}\\s+(e\\s+)?)?(um|um[as])(\\s+)((${PortugueseNumeric.AllOrdinalRegex})|(${PortugueseNumeric.SuffixRoundOrdinalRegex})|(e\\s+)?mei[oa]?)(?=\\b)`;
    PortugueseNumeric.FractionPrepositionRegex = `(?<=\\b)(?<numerator>(${PortugueseNumeric.AllIntRegex})|((?<!\\.)\\d+))\\s+sobre\\s+(?<denominator>(${PortugueseNumeric.AllIntRegex})|((\\d+)(?!\\.)))(?=\\b)`;
    PortugueseNumeric.AllFloatRegex = `${PortugueseNumeric.AllIntRegex}(\\s+(vírgula|virgula|e|ponto))${PortugueseNumeric.AllPointRegex}`;
    PortugueseNumeric.DoubleWithMultiplierRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\,)))\\d+,\\d+\\s*(K|k|M|G|T)(?=\\b)`;
    PortugueseNumeric.DoubleExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+,)))(\\d+(,\\d+)?)e([+-]*[1-9]\\d*)(?=\\b)`;
    PortugueseNumeric.DoubleCaretExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+,)))(\\d+(,\\d+)?)\\^([+-]*[1-9]\\d*)(?=\\b)`;
    PortugueseNumeric.DoubleDecimalPointRegex = (placeholder) => { return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+,)))\\d+,\\d+(?!(,\\d+))(?=${placeholder})`; };
    PortugueseNumeric.DoubleWithoutIntegralRegex = (placeholder) => { return `(?<=\\s|^)(?<!(\\d+)),\\d+(?!(,\\d+))(?=${placeholder})`; };
    PortugueseNumeric.DoubleWithRoundNumber = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\,)))\\d+,\\d+\\s+${PortugueseNumeric.RoundNumberIntegerRegex}(?=\\b)`;
    PortugueseNumeric.DoubleAllFloatRegex = `((?<=\\b)${PortugueseNumeric.AllFloatRegex}(?=\\b))`;
    PortugueseNumeric.CurrencyRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(B|b|m|t|g)(?=\\b)`;
    PortugueseNumeric.NumberWithSuffixPercentage = `(?<!%)(${baseNumbers.BaseNumbers.NumberReplaceToken})(\\s*)(%(?!${baseNumbers.BaseNumbers.NumberReplaceToken})|(por cento|pontos percentuais)\\b)`;
    PortugueseNumeric.AmbiguousFractionConnectorsRegex = `^[.]`;
    PortugueseNumeric.DecimalSeparatorChar = ',';
    PortugueseNumeric.FractionMarkerToken = 'sobre';
    PortugueseNumeric.NonDecimalSeparatorChar = '.';
    PortugueseNumeric.HalfADozenText = 'seis';
    PortugueseNumeric.WordSeparatorToken = 'e';
    PortugueseNumeric.WrittenDecimalSeparatorTexts = ['virgula', 'vírgula'];
    PortugueseNumeric.WrittenGroupSeparatorTexts = ['ponto'];
    PortugueseNumeric.WrittenIntegerSeparatorTexts = ['e'];
    PortugueseNumeric.WrittenFractionSeparatorTexts = ['com'];
    PortugueseNumeric.WrittenFractionSuffix = ['avo', 'ava'];
    PortugueseNumeric.PluralSuffix = 's';
    PortugueseNumeric.HalfADozenRegex = `meia\\s+d[uú]zia`;
    PortugueseNumeric.DigitalNumberRegex = `((?<=\\b)(mil|cem|milh[oõ]es|milh[aã]o|bilh[oõ]es|bilh[aã]o|trilh[oõ]es|trilh[aã]o|milhares|centena|centenas|dezena|dezenas?)(?=\\b))|((?<=(\\d|\\b))(k|t|m|g)(?=\\b))`;
    PortugueseNumeric.CardinalNumberMap = new Map([["zero", 0], ["hum", 1], ["um", 1], ["uma", 1], ["dois", 2], ["duas", 2], ["meia", 2], ["meio", 2], ["tres", 3], ["três", 3], ["quatro", 4], ["cinco", 5], ["seis", 6], ["sete", 7], ["oito", 8], ["nove", 9], ["dez", 10], ["dezena", 10], ["déz", 10], ["onze", 11], ["doze", 12], ["dúzia", 12], ["duzia", 12], ["dúzias", 12], ["duzias", 12], ["treze", 13], ["catorze", 14], ["quatorze", 14], ["quinze", 15], ["dezesseis", 16], ["dezasseis", 16], ["dezessete", 17], ["dezassete", 17], ["dezoito", 18], ["dezenove", 19], ["dezanove", 19], ["vinte", 20], ["trinta", 30], ["quarenta", 40], ["cinquenta", 50], ["cincoenta", 50], ["sessenta", 60], ["setenta", 70], ["oitenta", 80], ["noventa", 90], ["cem", 100], ["cento", 100], ["duzentos", 200], ["duzentas", 200], ["trezentos", 300], ["trezentas", 300], ["quatrocentos", 400], ["quatrocentas", 400], ["quinhentos", 500], ["quinhentas", 500], ["seiscentos", 600], ["seiscentas", 600], ["setecentos", 700], ["setecentas", 700], ["oitocentos", 800], ["oitocentas", 800], ["novecentos", 900], ["novecentas", 900], ["mil", 1000], ["milhão", 1000000], ["milhao", 1000000], ["milhões", 1000000], ["milhoes", 1000000], ["bilhão", 1000000000], ["bilhao", 1000000000], ["bilhões", 1000000000], ["bilhoes", 1000000000], ["trilhão", 1000000000000], ["trilhao", 1000000000000], ["trilhões", 1000000000000], ["trilhoes", 1000000000000]]);
    PortugueseNumeric.OrdinalNumberMap = new Map([["primeiro", 1], ["primeira", 1], ["segundo", 2], ["segunda", 2], ["terceiro", 3], ["terceira", 3], ["quarto", 4], ["quarta", 4], ["quinto", 5], ["quinta", 5], ["sexto", 6], ["sexta", 6], ["sétimo", 7], ["setimo", 7], ["sétima", 7], ["setima", 7], ["oitavo", 8], ["oitava", 8], ["nono", 9], ["nona", 9], ["décimo", 10], ["decimo", 10], ["décima", 10], ["decima", 10], ["undécimo", 11], ["undecimo", 11], ["undécima", 11], ["undecima", 11], ["duodécimo", 11], ["duodecimo", 11], ["duodécima", 11], ["duodecima", 11], ["vigésimo", 20], ["vigesimo", 20], ["vigésima", 20], ["vigesima", 20], ["trigésimo", 30], ["trigesimo", 30], ["trigésima", 30], ["trigesima", 30], ["quadragésimo", 40], ["quadragesimo", 40], ["quadragésima", 40], ["quadragesima", 40], ["quinquagésimo", 50], ["quinquagesimo", 50], ["quinquagésima", 50], ["quinquagesima", 50], ["sexagésimo", 60], ["sexagesimo", 60], ["sexagésima", 60], ["sexagesima", 60], ["septuagésimo", 70], ["septuagesimo", 70], ["septuagésima", 70], ["septuagesima", 70], ["setuagésimo", 70], ["setuagesimo", 70], ["setuagésima", 70], ["setuagesima", 70], ["octogésimo", 80], ["octogesimo", 80], ["octogésima", 80], ["octogesima", 80], ["nonagésimo", 90], ["nonagesimo", 90], ["nonagésima", 90], ["nonagesima", 90], ["centesimo", 100], ["centésimo", 100], ["centesima", 100], ["centésima", 100], ["ducentésimo", 200], ["ducentesimo", 200], ["ducentésima", 200], ["ducentesima", 200], ["tricentésimo", 300], ["tricentesimo", 300], ["tricentésima", 300], ["tricentesima", 300], ["trecentésimo", 300], ["trecentesimo", 300], ["trecentésima", 300], ["trecentesima", 300], ["quadringentésimo", 400], ["quadringentesimo", 400], ["quadringentésima", 400], ["quadringentesima", 400], ["quingentésimo", 500], ["quingentesimo", 500], ["quingentésima", 500], ["quingentesima", 500], ["sexcentésimo", 600], ["sexcentesimo", 600], ["sexcentésima", 600], ["sexcentesima", 600], ["seiscentésimo", 600], ["seiscentesimo", 600], ["seiscentésima", 600], ["seiscentesima", 600], ["septingentésimo", 700], ["septingentesimo", 700], ["septingentésima", 700], ["septingentesima", 700], ["setingentésimo", 700], ["setingentesimo", 700], ["setingentésima", 700], ["setingentesima", 700], ["octingentésimo", 800], ["octingentesimo", 800], ["octingentésima", 800], ["octingentesima", 800], ["noningentésimo", 900], ["noningentesimo", 900], ["noningentésima", 900], ["noningentesima", 900], ["nongentésimo", 900], ["nongentesimo", 900], ["nongentésima", 900], ["nongentesima", 900], ["milésimo", 1000], ["milesimo", 1000], ["milésima", 1000], ["milesima", 1000], ["milionésimo", 1000000], ["milionesimo", 1000000], ["milionésima", 1000000], ["milionesima", 1000000], ["bilionésimo", 1000000000], ["bilionesimo", 1000000000], ["bilionésima", 1000000000], ["bilionesima", 1000000000]]);
    PortugueseNumeric.PrefixCardinalMap = new Map([["hum", 1], ["dois", 2], ["tres", 3], ["três", 3], ["quatro", 4], ["cinco", 5], ["seis", 6], ["sete", 7], ["oito", 8], ["nove", 9], ["dez", 10], ["onze", 11], ["doze", 12], ["treze", 13], ["catorze", 14], ["quatorze", 14], ["quinze", 15], ["dezesseis", 16], ["dezasseis", 16], ["dezessete", 17], ["dezassete", 17], ["dezoito", 18], ["dezenove", 19], ["dezanove", 19], ["vinte", 20], ["trinta", 30], ["quarenta", 40], ["cinquenta", 50], ["cincoenta", 50], ["sessenta", 60], ["setenta", 70], ["oitenta", 80], ["noventa", 90], ["cem", 100], ["duzentos", 200], ["trezentos", 300], ["quatrocentos", 400], ["quinhentos", 500], ["seiscentos", 600], ["setecentos", 700], ["oitocentos", 800], ["novecentos", 900]]);
    PortugueseNumeric.SuffixOrdinalMap = new Map([["milesimo", 1000], ["milionesimo", 1000000], ["bilionesimo", 1000000000], ["trilionesimo", 1000000000000]]);
    PortugueseNumeric.RoundNumberMap = new Map([["mil", 1000], ["milesimo", 1000], ["milhão", 1000000], ["milhao", 1000000], ["milhões", 1000000], ["milhoes", 1000000], ["milionésimo", 1000000], ["milionesimo", 1000000], ["bilhão", 1000000000], ["bilhao", 1000000000], ["bilhões", 1000000000], ["bilhoes", 1000000000], ["bilionésimo", 1000000000], ["bilionesimo", 1000000000], ["trilhão", 1000000000000], ["trilhao", 1000000000000], ["trilhões", 1000000000000], ["trilhoes", 1000000000000], ["trilionésimo", 1000000000000], ["trilionesimo", 1000000000000], ["dezena", 10], ["dezenas", 10], ["dúzia", 12], ["duzia", 12], ["dúzias", 12], ["duzias", 12], ["k", 1000], ["m", 1000000], ["g", 1000000000], ["t", 1000000000000]]);
})(PortugueseNumeric = exports.PortugueseNumeric || (exports.PortugueseNumeric = {}));

});

unwrapExports(portugueseNumeric);

var parserConfiguration$4 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });



class PortugueseNumberParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new culture$2.CultureInfo(culture$2.Culture.Portuguese);
        }
        this.cultureInfo = ci;
        this.langMarker = portugueseNumeric.PortugueseNumeric.LangMarker;
        this.decimalSeparatorChar = portugueseNumeric.PortugueseNumeric.DecimalSeparatorChar;
        this.fractionMarkerToken = portugueseNumeric.PortugueseNumeric.FractionMarkerToken;
        this.nonDecimalSeparatorChar = portugueseNumeric.PortugueseNumeric.NonDecimalSeparatorChar;
        this.halfADozenText = portugueseNumeric.PortugueseNumeric.HalfADozenText;
        this.wordSeparatorToken = portugueseNumeric.PortugueseNumeric.WordSeparatorToken;
        this.writtenDecimalSeparatorTexts = portugueseNumeric.PortugueseNumeric.WrittenDecimalSeparatorTexts;
        this.writtenGroupSeparatorTexts = portugueseNumeric.PortugueseNumeric.WrittenGroupSeparatorTexts;
        this.writtenIntegerSeparatorTexts = portugueseNumeric.PortugueseNumeric.WrittenIntegerSeparatorTexts;
        this.writtenFractionSeparatorTexts = portugueseNumeric.PortugueseNumeric.WrittenFractionSeparatorTexts;
        let ordinalNumberMap = new Map(portugueseNumeric.PortugueseNumeric.OrdinalNumberMap);
        portugueseNumeric.PortugueseNumeric.PrefixCardinalMap.forEach((prefixValue, prefixKey) => {
            portugueseNumeric.PortugueseNumeric.SuffixOrdinalMap.forEach((suffixValue, suffixKey) => {
                if (!ordinalNumberMap.has(prefixKey + suffixKey)) {
                    ordinalNumberMap.set(prefixKey + suffixKey, prefixValue * suffixValue);
                }
            });
        });
        this.cardinalNumberMap = portugueseNumeric.PortugueseNumeric.CardinalNumberMap;
        this.ordinalNumberMap = ordinalNumberMap;
        this.roundNumberMap = portugueseNumeric.PortugueseNumeric.RoundNumberMap;
        this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.NegativeNumberSignRegex, "is");
        this.halfADozenRegex = recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.HalfADozenRegex);
        this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.DigitalNumberRegex);
    }
    normalizeTokenSet(tokens, context) {
        let result = new Array();
        tokens.forEach((token) => {
            let tempWord = token.replace(/^s+/, '').replace(/s+$/, '');
            if (this.ordinalNumberMap.has(tempWord)) {
                result.push(tempWord);
                return;
            }
            // ends with 'avo' or 'ava'
            if (portugueseNumeric.PortugueseNumeric.WrittenFractionSuffix.some(suffix => tempWord.endsWith(suffix))) {
                let origTempWord = tempWord;
                let newLength = origTempWord.length;
                tempWord = origTempWord.substring(0, newLength - 3);
                if (!tempWord) {
                    return;
                }
                else if (this.cardinalNumberMap.has(tempWord)) {
                    result.push(tempWord);
                    return;
                }
                else {
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
            if ((i + 1) === numberStr.length) {
                finalValue += value;
                strBuilder = "";
                i = lastGoodChar++;
                value = 0;
            }
        }
        return finalValue;
    }
}
exports.PortugueseNumberParserConfiguration = PortugueseNumberParserConfiguration;

});

unwrapExports(parserConfiguration$4);

var frenchNumeric = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });

var FrenchNumeric;
(function (FrenchNumeric) {
    FrenchNumeric.LangMarker = 'Fr';
    FrenchNumeric.RoundNumberIntegerRegex = `(cent|mille|millions|million|milliard|milliards|billion|billions)`;
    FrenchNumeric.ZeroToNineIntegerRegex = `(et un|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf)`;
    FrenchNumeric.TenToNineteenIntegerRegex = `((seize|quinze|quatorze|treize|douze|onze)|dix(\\Wneuf|\\Whuit|\\Wsept)?)`;
    FrenchNumeric.TensNumberIntegerRegex = `(quatre\\Wvingt(s|\\Wdix)?|soixante\\Wdix|vingt|trente|quarante|cinquante|soixante|septante|octante|huitante|nonante)`;
    FrenchNumeric.DigitsNumberRegex = `\\d|\\d{1,3}(\\.\\d{3})`;
    FrenchNumeric.NegativeNumberTermsRegex = `^[.]`;
    FrenchNumeric.NegativeNumberSignRegex = `^(${FrenchNumeric.NegativeNumberTermsRegex}\\s+).*`;
    FrenchNumeric.HundredsNumberIntegerRegex = `((${FrenchNumeric.ZeroToNineIntegerRegex}(\\s+cent))|cent|((\\s+cent\\s)+${FrenchNumeric.TensNumberIntegerRegex}))`;
    FrenchNumeric.BelowHundredsRegex = `((${FrenchNumeric.TenToNineteenIntegerRegex}|(${FrenchNumeric.TensNumberIntegerRegex}([-\\s]+(${FrenchNumeric.TenToNineteenIntegerRegex}|${FrenchNumeric.ZeroToNineIntegerRegex}))?))|${FrenchNumeric.ZeroToNineIntegerRegex})`;
    FrenchNumeric.BelowThousandsRegex = `((${FrenchNumeric.HundredsNumberIntegerRegex}(\\s+${FrenchNumeric.BelowHundredsRegex})?|${FrenchNumeric.BelowHundredsRegex}|${FrenchNumeric.TenToNineteenIntegerRegex})|cent\\s+${FrenchNumeric.TenToNineteenIntegerRegex})`;
    FrenchNumeric.SupportThousandsRegex = `((${FrenchNumeric.BelowThousandsRegex}|${FrenchNumeric.BelowHundredsRegex})\\s+${FrenchNumeric.RoundNumberIntegerRegex}(\\s+${FrenchNumeric.RoundNumberIntegerRegex})?)`;
    FrenchNumeric.SeparaIntRegex = `(${FrenchNumeric.SupportThousandsRegex}(\\s+${FrenchNumeric.SupportThousandsRegex})*(\\s+${FrenchNumeric.BelowThousandsRegex})?|${FrenchNumeric.BelowThousandsRegex})`;
    FrenchNumeric.AllIntRegex = `(${FrenchNumeric.SeparaIntRegex}|mille(\\s+${FrenchNumeric.BelowThousandsRegex})?)`;
    FrenchNumeric.NumbersWithPlaceHolder = (placeholder) => { return `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+(?!([,\\.]\\d+[a-zA-Z]))(?=${placeholder})`; };
    FrenchNumeric.NumbersWithSuffix = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(k|M|T|G)(?=\\b)`;
    FrenchNumeric.RoundNumberIntegerRegexWithLocks = `(?<=\\b)(${FrenchNumeric.DigitsNumberRegex})+\\s+${FrenchNumeric.RoundNumberIntegerRegex}(?=\\b)`;
    FrenchNumeric.NumbersWithDozenSuffix = `(((?<!\\d+\\s*)-\\s*)|(?<=\\b))\\d+\\s+douzaine(s)?(?=\\b)`;
    FrenchNumeric.AllIntRegexWithLocks = `((?<=\\b)${FrenchNumeric.AllIntRegex}(?=\\b))`;
    FrenchNumeric.AllIntRegexWithDozenSuffixLocks = `(?<=\\b)(((demi\\s+)?\\s+douzaine)|(${FrenchNumeric.AllIntRegex}\\s+douzaines?))(?=\\b)`;
    FrenchNumeric.SimpleRoundOrdinalRegex = `(centi[eè]me|milli[eè]me|millioni[eè]me|milliardi[eè]me|billioni[eè]me)`;
    FrenchNumeric.OneToNineOrdinalRegex = `(premier|premi[eè]re|deuxi[eè]me|second[e]|troisi[eè]me|tiers|tierce|quatri[eè]me|cinqui[eè]me|sixi[eè]me|septi[eè]me|huiti[eè]me|neuvi[eè]me)`;
    FrenchNumeric.SpecialUnderHundredOrdinalRegex = `(onzi[eè]me|douzi[eè]me)`;
    FrenchNumeric.TensOrdinalRegex = `(quatre-vingt-dixi[eè]me|quatre-vingti[eè]me|huitanti[eè]me|octanti[eè]me|soixante-dixi[eè]me|septanti[eè]me|soixanti[eè]me|cinquanti[eè]me|quaranti[eè]me|trenti[eè]me|vingti[eè]me)`;
    FrenchNumeric.HundredOrdinalRegex = `(${FrenchNumeric.AllIntRegex}(\\s+(centi[eè]me\\s)))`;
    FrenchNumeric.UnderHundredOrdinalRegex = `(((${FrenchNumeric.AllIntRegex}(\\W)?)?${FrenchNumeric.OneToNineOrdinalRegex})|(${FrenchNumeric.TensNumberIntegerRegex}(\\W)?)?${FrenchNumeric.OneToNineOrdinalRegex}|${FrenchNumeric.TensOrdinalRegex}|${FrenchNumeric.SpecialUnderHundredOrdinalRegex})`;
    FrenchNumeric.UnderThousandOrdinalRegex = `(((${FrenchNumeric.HundredOrdinalRegex}(\\s)?)?${FrenchNumeric.UnderHundredOrdinalRegex})|((${FrenchNumeric.AllIntRegex}(\\W)?)?${FrenchNumeric.SimpleRoundOrdinalRegex})|${FrenchNumeric.HundredOrdinalRegex})`;
    FrenchNumeric.OverThousandOrdinalRegex = `((${FrenchNumeric.AllIntRegex})(i[eè]me))`;
    FrenchNumeric.ComplexOrdinalRegex = `((${FrenchNumeric.OverThousandOrdinalRegex}(\\s)?)?${FrenchNumeric.UnderThousandOrdinalRegex}|${FrenchNumeric.OverThousandOrdinalRegex}|${FrenchNumeric.UnderHundredOrdinalRegex})`;
    FrenchNumeric.SuffixOrdinalRegex = `((${FrenchNumeric.AllIntRegex})(${FrenchNumeric.SimpleRoundOrdinalRegex}))`;
    FrenchNumeric.ComplexRoundOrdinalRegex = `(((${FrenchNumeric.SuffixOrdinalRegex}(\\s)?)?${FrenchNumeric.ComplexOrdinalRegex})|${FrenchNumeric.SuffixOrdinalRegex})`;
    FrenchNumeric.AllOrdinalRegex = `(${FrenchNumeric.ComplexOrdinalRegex}|${FrenchNumeric.SimpleRoundOrdinalRegex}|${FrenchNumeric.ComplexRoundOrdinalRegex})`;
    FrenchNumeric.PlaceHolderPureNumber = `\\b`;
    FrenchNumeric.PlaceHolderDefault = `\\D|\\b`;
    FrenchNumeric.OrdinalSuffixRegex = `(?<=\\b)((\\d*(1er|2e|2eme|3e|3eme|4e|4eme|5e|5eme|6e|6eme|7e|7eme|8e|8eme|9e|9eme|0e|0eme))|(11e|11eme|12e|12eme))(?=\\b)`;
    FrenchNumeric.OrdinalFrenchRegex = `(?<=\\b)${FrenchNumeric.AllOrdinalRegex}(?=\\b)`;
    FrenchNumeric.FractionNotationWithSpacesRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s+\\d+[/]\\d+(?=(\\b[^/]|$))`;
    FrenchNumeric.FractionNotationRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+[/]\\d+(?=(\\b[^/]|$))`;
    FrenchNumeric.FractionNounRegex = `(?<=\\b)(${FrenchNumeric.AllIntRegex}\\s+((et)\\s+)?)?(${FrenchNumeric.AllIntRegex})(\\s+((et)\\s)?)(((${FrenchNumeric.AllOrdinalRegex})s?|(${FrenchNumeric.SuffixOrdinalRegex})s?)|demis?|tiers?|quarts?)(?=\\b)`;
    FrenchNumeric.FractionNounWithArticleRegex = `(?<=\\b)(${FrenchNumeric.AllIntRegex}\\s+(et\\s+)?)?(un|une)(\\s+)((${FrenchNumeric.AllOrdinalRegex})|(${FrenchNumeric.SuffixOrdinalRegex})|(et\\s+)?demis?)(?=\\b)`;
    FrenchNumeric.FractionPrepositionRegex = `(?<=\\b)(?<numerator>(${FrenchNumeric.AllIntRegex})|((?<!\\.)\\d+))\\s+sur\\s+(?<denominator>(${FrenchNumeric.AllIntRegex})|((\\d+)(?!\\.)))(?=\\b)`;
    FrenchNumeric.AllPointRegex = `((\\s+${FrenchNumeric.ZeroToNineIntegerRegex})+|(\\s+${FrenchNumeric.SeparaIntRegex}))`;
    FrenchNumeric.AllFloatRegex = `(${FrenchNumeric.AllIntRegex}(\\s+(virgule|point))${FrenchNumeric.AllPointRegex})`;
    FrenchNumeric.DoubleDecimalPointRegex = (placeholder) => { return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[,\\.])))\\d+[,\\.]\\d+(?!([,\\.]\\d+))(?=${placeholder})`; };
    FrenchNumeric.DoubleWithoutIntegralRegex = (placeholder) => { return `(?<=\\s|^)(?<!(\\d+))[,\\.]\\d+(?!([,\\.]\\d+))(?=${placeholder})`; };
    FrenchNumeric.DoubleWithMultiplierRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\[,\\.])))\\d+[,\\.]\\d+\\s*(K|k|M|G|T)(?=\\b)`;
    FrenchNumeric.DoubleWithRoundNumber = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\[,\\.])))\\d+[,\\.]\\d+\\s+${FrenchNumeric.RoundNumberIntegerRegex}(?=\\b)`;
    FrenchNumeric.DoubleAllFloatRegex = `((?<=\\b)${FrenchNumeric.AllFloatRegex}(?=\\b))`;
    FrenchNumeric.DoubleExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[,\\.])))(\\d+([,\\.]\\d+)?)e([+-]*[1-9]\\d*)(?=\\b)`;
    FrenchNumeric.DoubleCaretExponentialNotationRegex = `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+[,\\.])))(\\d+([,\\.]\\d+)?)\\^([+-]*[1-9]\\d*)(?=\\b)`;
    FrenchNumeric.CurrencyRegex = `(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(B|b|m|t|g)(?=\\b)`;
    FrenchNumeric.NumberWithSuffixPercentage = `(?<!%)(${baseNumbers.BaseNumbers.NumberReplaceToken})(\\s*)(%(?!${baseNumbers.BaseNumbers.NumberReplaceToken})|(pourcentages|pourcents|pourcentage|pourcent)\\b)`;
    FrenchNumeric.NumberWithPrefixPercentage = `((?<!${baseNumbers.BaseNumbers.NumberReplaceToken})%|pourcent|pourcent des|pourcentage de)(\\s*)(${baseNumbers.BaseNumbers.NumberReplaceToken})(?=\\s|$)`;
    FrenchNumeric.DecimalSeparatorChar = ',';
    FrenchNumeric.FractionMarkerToken = 'sur';
    FrenchNumeric.NonDecimalSeparatorChar = '.';
    FrenchNumeric.HalfADozenText = 'six';
    FrenchNumeric.WordSeparatorToken = 'et';
    FrenchNumeric.WrittenDecimalSeparatorTexts = ['virgule'];
    FrenchNumeric.WrittenGroupSeparatorTexts = ['point', 'points'];
    FrenchNumeric.WrittenIntegerSeparatorTexts = ['et', '-'];
    FrenchNumeric.WrittenFractionSeparatorTexts = ['et', 'sur'];
    FrenchNumeric.HalfADozenRegex = `(?<=\\b)+demi\\s+douzaine`;
    FrenchNumeric.DigitalNumberRegex = `((?<=\\b)(cent|mille|million|millions|milliard|milliards|billions|billion|douzaine(s)?)(?=\\b))|((?<=(\\d|\\b))(k|t|m|g|b)(?=\\b))`;
    FrenchNumeric.AmbiguousFractionConnectorsRegex = `^[.]`;
    FrenchNumeric.CardinalNumberMap = new Map([["zéro", 0], ["zero", 0], ["un", 1], ["une", 1], ["deux", 2], ["trois", 3], ["quatre", 4], ["cinq", 5], ["six", 6], ["sept", 7], ["huit", 8], ["neuf", 9], ["dix", 10], ["onze", 11], ["douze", 12], ["treize", 13], ["quatorze", 14], ["quinze", 15], ["seize", 16], ["dix-sept", 17], ["dix-huit", 18], ["dix-neuf", 19], ["vingt", 20], ["trente", 30], ["quarante", 40], ["cinquante", 50], ["soixante", 60], ["soixante-dix", 70], ["septante", 70], ["quatre-vingts", 80], ["quatre-vingt", 80], ["quatre vingts", 80], ["quatre vingt", 80], ["quatre-vingt-dix", 90], ["quatre-vingt dix", 90], ["quatre vingt dix", 90], ["quatre-vingts-dix", 90], ["quatre-vingts-onze", 91], ["quatre-vingt-onze", 91], ["quatre-vingts-douze", 92], ["quatre-vingt-douze", 92], ["quatre-vingts-treize", 93], ["quatre-vingt-treize", 93], ["quatre-vingts-quatorze", 94], ["quatre-vingt-quatorze", 94], ["quatre-vingts-quinze", 95], ["quatre-vingt-quinze", 95], ["quatre-vingts-seize", 96], ["quatre-vingt-seize", 96], ["huitante", 80], ["octante", 80], ["nonante", 90], ["cent", 100], ["mille", 1000], ["un million", 1000000], ["million", 1000000], ["millions", 1000000], ["un milliard", 1000000000], ["milliard", 1000000000], ["milliards", 1000000000], ["un mille milliards", 1000000000000], ["un billion", 1000000000000]]);
    FrenchNumeric.OrdinalNumberMap = new Map([["premier", 1], ["première", 1], ["premiere", 1], ["deuxième", 2], ["deuxieme", 2], ["second", 2], ["seconde", 2], ["troisième", 3], ["demi", 2], ["tiers", 3], ["tierce", 3], ["quart", 4], ["quarts", 4], ["troisieme", 3], ["quatrième", 4], ["quatrieme", 4], ["cinquième", 5], ["cinquieme", 5], ["sixième", 6], ["sixieme", 6], ["septième", 7], ["septieme", 7], ["huitième", 8], ["huitieme", 8], ["neuvième", 9], ["neuvieme", 9], ["dixième", 10], ["dixieme", 10], ["onzième", 11], ["onzieme", 11], ["douzième", 12], ["douzieme", 12], ["treizième", 13], ["treizieme", 13], ["quatorzième", 14], ["quatorizieme", 14], ["quinzième", 15], ["quinzieme", 15], ["seizième", 16], ["seizieme", 16], ["dix-septième", 17], ["dix-septieme", 17], ["dix-huitième", 18], ["dix-huitieme", 18], ["dix-neuvième", 19], ["dix-neuvieme", 19], ["vingtième", 20], ["vingtieme", 20], ["trentième", 30], ["trentieme", 30], ["quarantième", 40], ["quarantieme", 40], ["cinquantième", 50], ["cinquantieme", 50], ["soixantième", 60], ["soixantieme", 60], ["soixante-dixième", 70], ["soixante-dixieme", 70], ["septantième", 70], ["septantieme", 70], ["quatre-vingtième", 80], ["quatre-vingtieme", 80], ["huitantième", 80], ["huitantieme", 80], ["octantième", 80], ["octantieme", 80], ["quatre-vingt-dixième", 90], ["quatre-vingt-dixieme", 90], ["nonantième", 90], ["nonantieme", 90], ["centième", 100], ["centieme", 100], ["millième", 1000], ["millieme", 1000], ["millionième", 1000000], ["millionieme", 1000000], ["milliardième", 1000000000], ["milliardieme", 1000000000], ["billionieme", 1000000000000], ["billionième", 1000000000000], ["trillionième", 1000000000000000000], ["trillionieme", 1000000000000000000]]);
    FrenchNumeric.PrefixCardinalMap = new Map([["deux", 2], ["trois", 3], ["quatre", 4], ["cinq", 5], ["six", 6], ["sept", 7], ["huit", 8], ["neuf", 9], ["dix", 10], ["onze", 11], ["douze", 12], ["treize", 13], ["quatorze", 14], ["quinze", 15], ["seize", 16], ["dix sept", 17], ["dix-sept", 17], ["dix-huit", 18], ["dix huit", 18], ["dix-neuf", 19], ["dix neuf", 19], ["vingt", 20], ["vingt-et-un", 21], ["vingt et un", 21], ["vingt-deux", 21], ["vingt deux", 22], ["vingt-trois", 23], ["vingt trois", 23], ["vingt-quatre", 24], ["vingt quatre", 24], ["vingt-cinq", 25], ["vingt cinq", 25], ["vingt-six", 26], ["vingt six", 26], ["vingt-sept", 27], ["vingt sept", 27], ["vingt-huit", 28], ["vingt huit", 28], ["vingt-neuf", 29], ["vingt neuf", 29], ["trente", 30], ["quarante", 40], ["cinquante", 50], ["soixante", 60], ["soixante-dix", 70], ["soixante dix", 70], ["septante", 70], ["quatre-vingt", 80], ["quatre vingt", 80], ["huitante", 80], ["octante", 80], ["nonante", 90], ["quatre vingt dix", 90], ["quatre-vingt-dix", 90], ["cent", 100], ["deux cent", 200], ["trois cents", 300], ["quatre cents", 400], ["cinq cent", 500], ["six cent", 600], ["sept cent", 700], ["huit cent", 800], ["neuf cent", 900]]);
    FrenchNumeric.SuffixOrdinalMap = new Map([["millième", 1000], ["million", 1000000], ["milliardième", 1000000000000]]);
    FrenchNumeric.RoundNumberMap = new Map([["cent", 100], ["mille", 1000], ["million", 1000000], ["millions", 1000000], ["milliard", 1000000000], ["milliards", 1000000000], ["billion", 1000000000000], ["billions", 1000000000000], ["centieme", 100], ["centième", 100], ["millieme", 1000], ["millième", 1000], ["millionième", 1000000], ["millionieme", 1000000], ["milliardième", 1000000000], ["milliardieme", 1000000000], ["billionième", 1000000000000], ["billionieme", 1000000000000], ["centiemes", 100], ["centièmes", 100], ["millièmes", 1000], ["milliemes", 1000], ["millionièmes", 1000000], ["millioniemes", 1000000], ["milliardièmes", 1000000000], ["milliardiemes", 1000000000], ["billionièmes", 1000000000000], ["billioniemes", 1000000000000], ["douzaine", 12], ["douzaines", 12], ["k", 1000], ["m", 1000000], ["g", 1000000000], ["b", 1000000000], ["t", 1000000000000]]);
})(FrenchNumeric = exports.FrenchNumeric || (exports.FrenchNumeric = {}));

});

unwrapExports(frenchNumeric);

var parserConfiguration$6 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });



class FrenchNumberParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new culture$2.CultureInfo(culture$2.Culture.French);
        }
        this.cultureInfo = ci;
        this.langMarker = frenchNumeric.FrenchNumeric.LangMarker;
        this.decimalSeparatorChar = frenchNumeric.FrenchNumeric.DecimalSeparatorChar;
        this.fractionMarkerToken = frenchNumeric.FrenchNumeric.FractionMarkerToken;
        this.nonDecimalSeparatorChar = frenchNumeric.FrenchNumeric.NonDecimalSeparatorChar;
        this.halfADozenText = frenchNumeric.FrenchNumeric.HalfADozenText;
        this.wordSeparatorToken = frenchNumeric.FrenchNumeric.WordSeparatorToken;
        this.writtenDecimalSeparatorTexts = frenchNumeric.FrenchNumeric.WrittenDecimalSeparatorTexts;
        this.writtenGroupSeparatorTexts = frenchNumeric.FrenchNumeric.WrittenGroupSeparatorTexts;
        this.writtenIntegerSeparatorTexts = frenchNumeric.FrenchNumeric.WrittenIntegerSeparatorTexts;
        this.writtenFractionSeparatorTexts = frenchNumeric.FrenchNumeric.WrittenFractionSeparatorTexts;
        this.cardinalNumberMap = frenchNumeric.FrenchNumeric.CardinalNumberMap;
        this.ordinalNumberMap = frenchNumeric.FrenchNumeric.OrdinalNumberMap;
        this.roundNumberMap = frenchNumeric.FrenchNumeric.RoundNumberMap;
        this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.NegativeNumberSignRegex, "is");
        this.halfADozenRegex = recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.HalfADozenRegex);
        this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.DigitalNumberRegex);
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
            if ((i + 1) === numberStr.length) {
                finalValue += value;
                strBuilder = "";
                i = lastGoodChar++;
                value = 0;
            }
        }
        return finalValue;
    }
}
exports.FrenchNumberParserConfiguration = FrenchNumberParserConfiguration;

});

unwrapExports(parserConfiguration$6);

var chineseNumeric = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var ChineseNumeric;
(function (ChineseNumeric) {
    ChineseNumeric.LangMarker = '';
    ChineseNumeric.DecimalSeparatorChar = '.';
    ChineseNumeric.FractionMarkerToken = '';
    ChineseNumeric.NonDecimalSeparatorChar = ' ';
    ChineseNumeric.HalfADozenText = '';
    ChineseNumeric.WordSeparatorToken = '';
    ChineseNumeric.RoundNumberMap = new Map([["k", 1000], ["m", 1000000], ["g", 1000000000], ["t", 1000000000000]]);
    ChineseNumeric.RoundNumberMapChar = new Map([["十", 10], ["百", 100], ["千", 1000], ["万", 10000], ["亿", 100000000], ["兆", 1000000000000], ["拾", 10], ["佰", 100], ["仟", 1000], ["萬", 10000], ["億", 100000000]]);
    ChineseNumeric.ZeroToNineMap = new Map([["0", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["零", 0], ["一", 1], ["二", 2], ["三", 3], ["四", 4], ["五", 5], ["六", 6], ["七", 7], ["八", 8], ["九", 9], ["〇", 0], ["壹", 1], ["贰", 2], ["貳", 2], ["叁", 3], ["肆", 4], ["伍", 5], ["陆", 6], ["陸", 6], ["柒", 7], ["捌", 8], ["玖", 9], ["０", 0], ["１", 1], ["２", 2], ["３", 3], ["４", 4], ["５", 5], ["６", 6], ["７", 7], ["８", 8], ["９", 9], ["半", 0.5], ["两", 2], ["兩", 2], ["俩", 2], ["倆", 2], ["仨", 3]]);
    ChineseNumeric.FullToHalfMap = new Map([["０", "0"], ["１", "1"], ["２", "2"], ["３", "3"], ["４", "4"], ["５", "5"], ["６", "6"], ["７", "7"], ["８", "8"], ["９", "9"], ["／", "/"], ["－", "-"], ["，", "\'"], ["Ｇ", "G"], ["Ｍ", "M"], ["Ｔ", "T"], ["Ｋ", "K"], ["ｋ", "k"], ["．", "."]]);
    ChineseNumeric.TratoSimMap = new Map([["佰", "百"], ["點", "点"], ["個", "个"], ["幾", "几"], ["對", "对"], ["雙", "双"]]);
    ChineseNumeric.UnitMap = new Map([["萬萬", "億"], ["億萬", "兆"], ["萬億", "兆"], ["万万", "亿"], ["万亿", "兆"], ["亿万", "兆"], [" ", ""], ["多", ""], ["余", ""], ["几", ""]]);
    ChineseNumeric.RoundDirectList = ['万', '萬', '亿', '兆', '億'];
    ChineseNumeric.DigitalNumberRegex = `((?<=(\\d|\\b))(k|t|m|g)(?=\\b))`;
    ChineseNumeric.ZeroToNineFullHalfRegex = `[\\d１２３４５６７８９０]`;
    ChineseNumeric.DigitNumRegex = `${ChineseNumeric.ZeroToNineFullHalfRegex}+`;
    ChineseNumeric.DozenRegex = `.*打$`;
    ChineseNumeric.PercentageRegex = `(?<=百\\s*分\\s*之).+|.+(?=个\\s*百\\s*分\\s*点)|.*(?=[％%])`;
    ChineseNumeric.DoubleAndRoundRegex = `${ChineseNumeric.ZeroToNineFullHalfRegex}+(\\.${ChineseNumeric.ZeroToNineFullHalfRegex}+)?\\s*[多几余]?[万亿萬億]{1,2}`;
    ChineseNumeric.FracSplitRegex = `又|分\\s*之`;
    ChineseNumeric.ZeroToNineIntegerRegex = `[一二三四五六七八九零壹贰貳叁肆伍陆陸柒捌玖〇两兩俩倆仨]`;
    ChineseNumeric.NegativeNumberTermsRegex = `[负負]`;
    ChineseNumeric.NegativeNumberTermsRegexNum = `((?<!(\\d+\\s*)|[-－])[-－])`;
    ChineseNumeric.NegativeNumberSignRegex = `^${ChineseNumeric.NegativeNumberTermsRegex}.*|^${ChineseNumeric.NegativeNumberTermsRegexNum}.*`;
    ChineseNumeric.SpeGetNumberRegex = `${ChineseNumeric.ZeroToNineFullHalfRegex}|${ChineseNumeric.ZeroToNineIntegerRegex}|[十拾半对對]`;
    ChineseNumeric.PairRegex = '.*[双对雙對]$';
    ChineseNumeric.RoundNumberIntegerRegex = `(((?<![十百千拾佰仟])[十百千拾佰仟])|([万亿兆萬億]))`;
    ChineseNumeric.WhiteListRegex = `(。|，|、|（|）|“|”|[到以至]|[国國]|周|夜|[点點]|[个個]|倍|票|[项項]|[亩畝]|分|元|角|天|加|[减減]|乘|除|是|[對对]|打|公[里裏]|公[顷頃]|公分|平方|方|米|厘|毫|[条條]|船|[车車]|[辆輛]|群|[页頁]|杯|人|[张張]|次|位|份|批|[届屆]|[级級]|[种種]|套|[笔筆]|根|[块塊]|件|座|步|[颗顆]|棵|[节節]|支|只|名|年|月|日|[号號]|朵|克|[吨噸]|磅|[码碼]|英尺|英寸|升|加[仑侖]|立方|[台臺]|套|[罗羅]|令|卷|[头頭]|箱|包|桶|袋|[块塊]|家|行|期|[层層]|度|面|所|架|把|片|[阵陣]|[间間]|等|[叠疊]|碟|下|起|手|季|部|人|小[时時]|[时時]|秒|[样樣]|章|段|星|州|款|代|维|重|[户戸]|楼|路|篇|句|键|本|生|者|字|郎|道|边|场|口|线|世|岸|金|类|番|组|卦|眼|系|声|更|带|色|战|成|轮|食|首|幡|站|股|井|流|开|刻|洲|回|宮|集|练|週|和|环|甲|处|省|里|海|遍|品|体|王|尾|新|隻|版|阶|板|侧|波|身|则|扫|房|彩|木|军|居|晚|岛|课|式|通|相|区|文|端|味|田|心|胎|班|出|连|单|事|丝|副|岁|旁|幕|些|枚|招|卡|幅|言|街|指|辈|室|堆|作|封|厢|声|城|族|圈|脸|目|排|模|夕|网|市|向|极|驱|科|提|核|村|审|刀|册|例|关|粒|局|山|寸|碗|瞬|联|游|脚|宅|线|格|入|趟|貫|界|社|肢|技|滴|问|笑|院|堂|尺|寨|档|举|盘|门|客|餐|艘|毛|丈|剑|曲|任|叶|团|派|嘴|桥|抹|枝|贯|伏|拳|列|机|盒|队|进制|栋|席|斤|词|击|题|型|宗|柱|钱|拍|剧|旬|命|扇|匹|湖|壶|觉|叉|校|泉|具|串|射|证|大批|球|横|竖|尊|轴|观|审|石|束|弹|株|领|委|栏|炮|鼎|町|帆|斗|缕|桌|针|帧|转|落|足|梯|县|投|试|帮|掌|箭|盏|锅|计|大片|学期|截|顶|屋|介|剑|桂|旗|巷|挥|晃|员|翼|池|围|勺|宿|库|棒|冠|树|缸|伙|签|揽|坨|匙|桩|顿|纸|隅|诺|案|刊|厂|杆|袭|仓|床|担|帖|屏|盏|腔|贴|窍|洞|円|坪|泡|园|馆|湾|拨|枪|职|亭|背|維|[護护戸]|樓|鍵|邊|場|線|類|組|聲|帶|戰|輪|開|練|環|處|裏|體|隻|階|側|則|掃|軍|居|島|課|式|區|連|單|絲|歲|廂|聲|臉|網|極|驅|審|冊|關|聯|遊|腳|線|貫|問|檔|舉|盤|門|劍|曲|任|葉|團|派|嘴|橋|抹|枝|貫|伏|拳|列|機|盒|隊|進制|棟|詞|擊|題|錢|壺|覺|證|大批|球|橫|豎|尊|軸|觀|審|彈|領|委|欄|釘|鬥|縷|針|幀|轉|縣|試|幫|盞|鍋|計|學期|截|頂|介|劍|桂|旗|巷|揮|晃|員|圍|勺|宿|庫|棒|冠|樹|缸|夥|簽|攬|樁|頓|紙|隅|諾|廠|桿|襲|倉|擔|盞|貼|竅|洞|坪|泡|員|館|灣|撥|槍|職|\\s|$)`;
    ChineseNumeric.NotSingleRegex = `((${ChineseNumeric.ZeroToNineIntegerRegex}|${ChineseNumeric.ZeroToNineFullHalfRegex}|[十拾])\\s*(\\s*[多几幾余]?\\s*${ChineseNumeric.RoundNumberIntegerRegex}){1,2}|[十拾]|${ChineseNumeric.RoundNumberIntegerRegex}\\s*(${ChineseNumeric.ZeroToNineIntegerRegex}|${ChineseNumeric.ZeroToNineFullHalfRegex}|零))\\s*(((${ChineseNumeric.ZeroToNineIntegerRegex}|${ChineseNumeric.ZeroToNineFullHalfRegex})\\s*(\\s*[多几幾余]?\\s*${ChineseNumeric.RoundNumberIntegerRegex}){1,2}|零)\\s*)*${ChineseNumeric.ZeroToNineIntegerRegex}?`;
    ChineseNumeric.SingleRegex = `(?<!${ChineseNumeric.ZeroToNineIntegerRegex})${ChineseNumeric.ZeroToNineIntegerRegex}(?=${ChineseNumeric.WhiteListRegex})`;
    ChineseNumeric.AllIntRegex = `(((${ChineseNumeric.ZeroToNineIntegerRegex}|${ChineseNumeric.ZeroToNineFullHalfRegex}|[十拾])\\s*(\\s*[多几幾余]?\\s*${ChineseNumeric.RoundNumberIntegerRegex}){1,2}|[十拾]|${ChineseNumeric.RoundNumberIntegerRegex}\\s*(${ChineseNumeric.ZeroToNineIntegerRegex}|${ChineseNumeric.ZeroToNineFullHalfRegex}|零))\\s*(((${ChineseNumeric.ZeroToNineIntegerRegex}|${ChineseNumeric.ZeroToNineFullHalfRegex})\\s*(\\s*[多几幾余]?\\s*${ChineseNumeric.RoundNumberIntegerRegex}){1,2}|零)\\s*)*${ChineseNumeric.ZeroToNineIntegerRegex}?|${ChineseNumeric.ZeroToNineIntegerRegex})`;
    ChineseNumeric.NumbersSpecialsChars = `((${ChineseNumeric.NegativeNumberTermsRegexNum}|${ChineseNumeric.NegativeNumberTermsRegex})\\s*)?${ChineseNumeric.ZeroToNineFullHalfRegex}+`;
    ChineseNumeric.NumbersSpecialsCharsWithSuffix = `${ChineseNumeric.NegativeNumberTermsRegexNum}?${ChineseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)`;
    ChineseNumeric.DottedNumbersSpecialsChar = `${ChineseNumeric.NegativeNumberTermsRegexNum}?${ChineseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，]${ChineseNumeric.ZeroToNineFullHalfRegex}{3})+`;
    ChineseNumeric.NumbersWithHalfDozen = `半(${ChineseNumeric.RoundNumberIntegerRegex}|打)`;
    ChineseNumeric.NumbersWithDozen = `${ChineseNumeric.AllIntRegex}[双雙对對打](?!${ChineseNumeric.AllIntRegex})`;
    ChineseNumeric.PointRegexStr = `[点點\\.．]`;
    ChineseNumeric.AllFloatRegex = `${ChineseNumeric.NegativeNumberTermsRegex}?${ChineseNumeric.AllIntRegex}\\s*${ChineseNumeric.PointRegexStr}\\s*[一二三四五六七八九零壹贰貳叁肆伍陆陸柒捌玖〇](\\s*${ChineseNumeric.ZeroToNineIntegerRegex})*`;
    ChineseNumeric.NumbersWithAllowListRegex = `(?<![百佰]\\s*分\\s*之\\s*(${ChineseNumeric.AllIntRegex}[点點]*|${ChineseNumeric.AllFloatRegex})*)${ChineseNumeric.NegativeNumberTermsRegex}?(${ChineseNumeric.NotSingleRegex}|${ChineseNumeric.SingleRegex})(?!(${ChineseNumeric.AllIntRegex}*([点點]${ChineseNumeric.ZeroToNineIntegerRegex}+)*|${ChineseNumeric.AllFloatRegex})*\\s*[个個]\\s*[百佰]\\s*分\\s*[点點])`;
    ChineseNumeric.NumbersAggressiveRegex = `(?<![百佰]\\s*分\\s*之\\s*(${ChineseNumeric.AllIntRegex}[点點]*|${ChineseNumeric.AllFloatRegex})*)${ChineseNumeric.NegativeNumberTermsRegex}?${ChineseNumeric.AllIntRegex}(?!(${ChineseNumeric.AllIntRegex}*([点點]${ChineseNumeric.ZeroToNineIntegerRegex}+)*|${ChineseNumeric.AllFloatRegex})*\\s*[个個]\\s*[百佰]\\s*分\\s*[点點])`;
    ChineseNumeric.PointRegex = `${ChineseNumeric.PointRegexStr}`;
    ChineseNumeric.DoubleSpecialsChars = `(?<!(${ChineseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}*))(${ChineseNumeric.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+(?!${ChineseNumeric.ZeroToNineFullHalfRegex}*[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+)`;
    ChineseNumeric.DoubleSpecialsCharsWithNegatives = `(?<!(${ChineseNumeric.ZeroToNineFullHalfRegex}+|\\.\\.|．．))(${ChineseNumeric.NegativeNumberTermsRegexNum}\\s*)?[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+(?!${ChineseNumeric.ZeroToNineFullHalfRegex}*([\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+))`;
    ChineseNumeric.SimpleDoubleSpecialsChars = `(${ChineseNumeric.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，]${ChineseNumeric.ZeroToNineFullHalfRegex}{3})+[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+`;
    ChineseNumeric.DoubleWithMultiplierRegex = `(${ChineseNumeric.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)`;
    ChineseNumeric.DoubleWithThousandsRegex = `${ChineseNumeric.NegativeNumberTermsRegex}?${ChineseNumeric.ZeroToNineFullHalfRegex}+([\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+)?\\s*[多几幾余]?[万亿萬億]{1,2}`;
    ChineseNumeric.DoubleAllFloatRegex = `(?<![百佰]\\s*分\\s*之\\s*((${ChineseNumeric.AllIntRegex}[点點]*)|${ChineseNumeric.AllFloatRegex})*)${ChineseNumeric.AllFloatRegex}(?!${ChineseNumeric.ZeroToNineIntegerRegex}*\\s*[个個]\\s*[百佰]\\s*分\\s*[点點])`;
    ChineseNumeric.DoubleExponentialNotationRegex = `(?<!${ChineseNumeric.ZeroToNineFullHalfRegex}+[\\.．])(${ChineseNumeric.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric.ZeroToNineFullHalfRegex}+([\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+)?e(([-－+＋]*[1-9１２３４５６７８９]${ChineseNumeric.ZeroToNineFullHalfRegex}*)|[0０](?!${ChineseNumeric.ZeroToNineFullHalfRegex}+))`;
    ChineseNumeric.DoubleScientificNotationRegex = `(?<!${ChineseNumeric.ZeroToNineFullHalfRegex}+[\\.．])(${ChineseNumeric.NegativeNumberTermsRegexNum}\\s*)?(${ChineseNumeric.ZeroToNineFullHalfRegex}+([\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+)?)\\^([-－+＋]*[1-9１２３４５６７８９]${ChineseNumeric.ZeroToNineFullHalfRegex}*)`;
    ChineseNumeric.OrdinalRegex = `第${ChineseNumeric.AllIntRegex}`;
    ChineseNumeric.OrdinalNumbersRegex = `第${ChineseNumeric.ZeroToNineFullHalfRegex}+`;
    ChineseNumeric.AllFractionNumber = `${ChineseNumeric.NegativeNumberTermsRegex}?((${ChineseNumeric.ZeroToNineFullHalfRegex}+|${ChineseNumeric.AllIntRegex})\\s*又\\s*)?${ChineseNumeric.NegativeNumberTermsRegex}?(${ChineseNumeric.ZeroToNineFullHalfRegex}+|${ChineseNumeric.AllIntRegex})\\s*分\\s*之\\s*${ChineseNumeric.NegativeNumberTermsRegex}?(${ChineseNumeric.ZeroToNineFullHalfRegex}+|${ChineseNumeric.AllIntRegex})`;
    ChineseNumeric.FractionNotationSpecialsCharsRegex = `(${ChineseNumeric.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric.ZeroToNineFullHalfRegex}+\\s+${ChineseNumeric.ZeroToNineFullHalfRegex}+[/／]${ChineseNumeric.ZeroToNineFullHalfRegex}+`;
    ChineseNumeric.FractionNotationRegex = `(${ChineseNumeric.NegativeNumberTermsRegexNum}\\s*)?${ChineseNumeric.ZeroToNineFullHalfRegex}+[/／]${ChineseNumeric.ZeroToNineFullHalfRegex}+`;
    ChineseNumeric.PercentagePointRegex = `(?<!${ChineseNumeric.AllIntRegex})(${ChineseNumeric.AllFloatRegex}|${ChineseNumeric.AllIntRegex})\\s*[个個]\\s*[百佰]\\s*分\\s*[点點]`;
    ChineseNumeric.SimplePercentageRegex = `(?<!${ChineseNumeric.ZeroToNineIntegerRegex})[百佰]\\s*分\\s*之\\s*(${ChineseNumeric.AllFloatRegex}|${ChineseNumeric.AllIntRegex}|[百佰])(?!${ChineseNumeric.AllIntRegex})`;
    ChineseNumeric.NumbersPercentagePointRegex = `(?<!${ChineseNumeric.ZeroToNineIntegerRegex})[百佰]\\s*分\\s*之\\s*${ChineseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+(?!([\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+))`;
    ChineseNumeric.NumbersPercentageWithSeparatorRegex = `(?<!${ChineseNumeric.ZeroToNineIntegerRegex})[百佰]\\s*分\\s*之\\s*${ChineseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，]${ChineseNumeric.ZeroToNineFullHalfRegex}{3})+[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+`;
    ChineseNumeric.NumbersPercentageWithMultiplierRegex = `(?<!${ChineseNumeric.ZeroToNineIntegerRegex})[百佰]\\s*分\\s*之\\s*${ChineseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)`;
    ChineseNumeric.FractionPercentagePointRegex = `(?<!(${ChineseNumeric.ZeroToNineFullHalfRegex}+[\\.．]))${ChineseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+(?!([\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+))\\s*[个個]\\s*[百佰]\\s*分\\s*[点點]`;
    ChineseNumeric.FractionPercentageWithSeparatorRegex = `${ChineseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，]${ChineseNumeric.ZeroToNineFullHalfRegex}{3})+[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+\\s*[个個]\\s*[百佰]\\s*分\\s*[点點]`;
    ChineseNumeric.FractionPercentageWithMultiplierRegex = `${ChineseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)\\s*[个個]\\s*[百佰]\\s*分\\s*[点點]`;
    ChineseNumeric.SimpleNumbersPercentageRegex = `(?<!${ChineseNumeric.ZeroToNineIntegerRegex})[百佰]\\s*分\\s*之\\s*${ChineseNumeric.ZeroToNineFullHalfRegex}+(?!([\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+))`;
    ChineseNumeric.SimpleNumbersPercentageWithMultiplierRegex = `(?<!${ChineseNumeric.ZeroToNineIntegerRegex})[百佰]\\s*分\\s*之\\s*${ChineseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)`;
    ChineseNumeric.SimpleNumbersPercentagePointRegex = `(?!${ChineseNumeric.ZeroToNineIntegerRegex})[百佰]\\s*分\\s*之\\s*${ChineseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，]${ChineseNumeric.ZeroToNineFullHalfRegex}{3})+`;
    ChineseNumeric.IntegerPercentageRegex = `${ChineseNumeric.ZeroToNineFullHalfRegex}+\\s*[个個]\\s*[百佰]\\s*分\\s*[点點]`;
    ChineseNumeric.IntegerPercentageWithMultiplierRegex = `${ChineseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)\\s*[个個]\\s*[百佰]\\s*分\\s*[点點]`;
    ChineseNumeric.NumbersFractionPercentageRegex = `${ChineseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，]${ChineseNumeric.ZeroToNineFullHalfRegex}{3})+\\s*[个個]\\s*[百佰]\\s*分\\s*[点點]`;
    ChineseNumeric.SimpleIntegerPercentageRegex = `(?<!%|\\d)${ChineseNumeric.NegativeNumberTermsRegexNum}?${ChineseNumeric.ZeroToNineFullHalfRegex}+([\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}+)?(\\s*)[％%](?!\\d)`;
    ChineseNumeric.NumbersFoldsPercentageRegex = `${ChineseNumeric.ZeroToNineFullHalfRegex}(([\\.．]?|\\s*)${ChineseNumeric.ZeroToNineFullHalfRegex})?\\s*折`;
    ChineseNumeric.FoldsPercentageRegex = `${ChineseNumeric.ZeroToNineIntegerRegex}(\\s*[点點]?\\s*${ChineseNumeric.ZeroToNineIntegerRegex})?\\s*折`;
    ChineseNumeric.SimpleFoldsPercentageRegex = `${ChineseNumeric.ZeroToNineFullHalfRegex}\\s*成(\\s*(半|${ChineseNumeric.ZeroToNineFullHalfRegex}))?`;
    ChineseNumeric.SpecialsPercentageRegex = `(${ChineseNumeric.ZeroToNineIntegerRegex}|[十拾])\\s*成(\\s*(半|${ChineseNumeric.ZeroToNineIntegerRegex}))?`;
    ChineseNumeric.NumbersSpecialsPercentageRegex = `(${ChineseNumeric.ZeroToNineFullHalfRegex}[\\.．]${ChineseNumeric.ZeroToNineFullHalfRegex}|[1１][0０])\\s*成`;
    ChineseNumeric.SimpleSpecialsPercentageRegex = `${ChineseNumeric.ZeroToNineIntegerRegex}\\s*[点點]\\s*${ChineseNumeric.ZeroToNineIntegerRegex}\\s*成`;
    ChineseNumeric.SpecialsFoldsPercentageRegex = `半\\s*成|(?<=打)[对對]\\s*折|半\\s*折`;
    ChineseNumeric.TillRegex = `(到|至|--|-|—|——|~|–)`;
    ChineseNumeric.MoreRegex = `(大于|多于|高于|超过|大於|多於|高於|超過|>)`;
    ChineseNumeric.LessRegex = `(小于|少于|低于|小於|少於|低於|不到|不足|<)`;
    ChineseNumeric.EqualRegex = `(等于|等於|=)`;
    ChineseNumeric.MoreOrEqual = `((${ChineseNumeric.MoreRegex}\\s*(或|或者)?\\s*${ChineseNumeric.EqualRegex})|至少|最少|不${ChineseNumeric.LessRegex})`;
    ChineseNumeric.MoreOrEqualSuffix = `(或|或者)\\s*(以上|之上|更[大多高])`;
    ChineseNumeric.LessOrEqual = `((${ChineseNumeric.LessRegex}\\s*(或|或者)?\\s*${ChineseNumeric.EqualRegex})|至多|最多|不${ChineseNumeric.MoreRegex})`;
    ChineseNumeric.LessOrEqualSuffix = `(或|或者)\\s*(以下|之下|更[小少低])`;
    ChineseNumeric.OneNumberRangeMoreRegex1 = `(${ChineseNumeric.MoreOrEqual}|${ChineseNumeric.MoreRegex})\\s*(?<number1>((?!([并且而並的同時时]|(，(?!\\d+))|(,(?!\\d+))|。)).)+)`;
    ChineseNumeric.OneNumberRangeMoreRegex2 = `比\\s*(?<number1>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*更?[大多高]`;
    ChineseNumeric.OneNumberRangeMoreRegex3 = `(?<number1>((?!((，(?!\\d+))|(,(?!\\d+))|。|[或者])).)+)\\s*(或|或者)?\\s*([多几余幾餘]|以上|之上|更[大多高])(?![万亿萬億]{1,2})`;
    ChineseNumeric.OneNumberRangeLessRegex1 = `(${ChineseNumeric.LessOrEqual}|${ChineseNumeric.LessRegex})\\s*(?<number2>((?!([并且而並的同時时]|(，(?!\\d+))|(,(?!\\d+))|。)).)+)`;
    ChineseNumeric.OneNumberRangeLessRegex2 = `比\\s*(?<number2>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*更?[小少低]`;
    ChineseNumeric.OneNumberRangeLessRegex3 = `(?<number2>((?!((，(?!\\d+))|(,(?!\\d+))|。|[或者])).)+)\\s*(或|或者)?\\s*(以下|之下|更[小少低])`;
    ChineseNumeric.OneNumberRangeMoreSeparateRegex = `^[.]`;
    ChineseNumeric.OneNumberRangeLessSeparateRegex = `^[.]`;
    ChineseNumeric.OneNumberRangeEqualRegex = `${ChineseNumeric.EqualRegex}\\s*(?<number1>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)`;
    ChineseNumeric.TwoNumberRangeRegex1 = `((位于|在|位於)|(?=(\\d|\\+|\\-)))\\s*(?<number1>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*(和|与|與|${ChineseNumeric.TillRegex})\\s*(?<number2>((?!((，(?!\\d+))|(,(?!\\d+))|。))[^之])+)\\s*(之)?(间|間)`;
    ChineseNumeric.TwoNumberRangeRegex2 = `(${ChineseNumeric.OneNumberRangeMoreRegex1}|${ChineseNumeric.OneNumberRangeMoreRegex2}|${ChineseNumeric.OneNumberRangeMoreRegex3})\\s*(且|并且|而且|並且|((的)?同時)|((的)?同时)|，)?\\s*(${ChineseNumeric.OneNumberRangeLessRegex1}|${ChineseNumeric.OneNumberRangeLessRegex2}|${ChineseNumeric.OneNumberRangeLessRegex3})`;
    ChineseNumeric.TwoNumberRangeRegex3 = `(${ChineseNumeric.OneNumberRangeLessRegex1}|${ChineseNumeric.OneNumberRangeLessRegex2}|${ChineseNumeric.OneNumberRangeLessRegex3})\\s*(且|并且|而且|並且|((的)?同時)|((的)?同时)|，)?\\s*(${ChineseNumeric.OneNumberRangeMoreRegex1}|${ChineseNumeric.OneNumberRangeMoreRegex2}|${ChineseNumeric.OneNumberRangeMoreRegex3})`;
    ChineseNumeric.TwoNumberRangeRegex4 = `(?<number1>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*${ChineseNumeric.TillRegex}\\s*(?<number2>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)`;
    ChineseNumeric.AmbiguousFractionConnectorsRegex = `^[.]`;
})(ChineseNumeric = exports.ChineseNumeric || (exports.ChineseNumeric = {}));

});

unwrapExports(chineseNumeric);

var parserConfiguration$8 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });



class ChineseNumberParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new culture$2.CultureInfo(culture$2.Culture.Chinese);
        }
        this.cultureInfo = ci;
        this.langMarker = chineseNumeric.ChineseNumeric.LangMarker;
        this.decimalSeparatorChar = chineseNumeric.ChineseNumeric.DecimalSeparatorChar;
        this.fractionMarkerToken = chineseNumeric.ChineseNumeric.FractionMarkerToken;
        this.nonDecimalSeparatorChar = chineseNumeric.ChineseNumeric.NonDecimalSeparatorChar;
        this.halfADozenText = chineseNumeric.ChineseNumeric.HalfADozenText;
        this.wordSeparatorToken = chineseNumeric.ChineseNumeric.WordSeparatorToken;
        this.writtenDecimalSeparatorTexts = [];
        this.writtenGroupSeparatorTexts = [];
        this.writtenIntegerSeparatorTexts = [];
        this.writtenFractionSeparatorTexts = [];
        this.cardinalNumberMap = new Map();
        this.ordinalNumberMap = new Map();
        this.roundNumberMap = chineseNumeric.ChineseNumeric.RoundNumberMap;
        this.halfADozenRegex = null;
        this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DigitalNumberRegex, "gis");
        this.zeroToNineMap = chineseNumeric.ChineseNumeric.ZeroToNineMap;
        this.roundNumberMapChar = chineseNumeric.ChineseNumeric.RoundNumberMapChar;
        this.fullToHalfMap = chineseNumeric.ChineseNumeric.FullToHalfMap;
        this.tratoSimMap = chineseNumeric.ChineseNumeric.TratoSimMap;
        this.unitMap = chineseNumeric.ChineseNumeric.UnitMap;
        this.roundDirectList = chineseNumeric.ChineseNumeric.RoundDirectList;
        this.digitNumRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DigitNumRegex, "gis");
        this.dozenRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DozenRegex, "gis");
        this.percentageRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.PercentageRegex, "gis");
        this.doubleAndRoundRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DoubleAndRoundRegex, "gis");
        this.fracSplitRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.FracSplitRegex, "gis");
        this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NegativeNumberSignRegex, "gis");
        this.pointRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.PointRegex, "gis");
        this.speGetNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SpeGetNumberRegex, "gis");
        this.pairRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.PairRegex, "gis");
        this.roundNumberIntegerRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.RoundNumberIntegerRegex, "gis");
    }
    normalizeTokenSet(tokens, context) {
        return tokens;
    }
    resolveCompositeNumber(numberStr) {
        return 0;
    }
}
exports.ChineseNumberParserConfiguration = ChineseNumberParserConfiguration;

});

unwrapExports(parserConfiguration$8);

var japaneseNumeric = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var JapaneseNumeric;
(function (JapaneseNumeric) {
    JapaneseNumeric.LangMarker = '';
    JapaneseNumeric.DecimalSeparatorChar = '.';
    JapaneseNumeric.FractionMarkerToken = '';
    JapaneseNumeric.NonDecimalSeparatorChar = ' ';
    JapaneseNumeric.HalfADozenText = '';
    JapaneseNumeric.WordSeparatorToken = '';
    JapaneseNumeric.RoundNumberMap = new Map([["k", 1000], ["m", 1000000], ["g", 1000000000], ["t", 1000000000000]]);
    JapaneseNumeric.RoundNumberMapChar = new Map([["十", 10], ["百", 100], ["千", 1000], ["万", 10000], ["億", 100000000], ["兆", 1000000000000]]);
    JapaneseNumeric.ZeroToNineMap = new Map([["0", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["零", 0], ["一", 1], ["二", 2], ["三", 3], ["四", 4], ["五", 5], ["六", 6], ["七", 7], ["八", 8], ["九", 9], ["半", 0.5]]);
    JapaneseNumeric.FullToHalfMap = new Map([["０", "0"], ["１", "1"], ["２", "2"], ["３", "3"], ["４", "4"], ["５", "5"], ["６", "6"], ["７", "7"], ["８", "8"], ["９", "9"], ["／", "/"], ["－", "-"], ["，", "\'"], ["、", "\'"], ["Ｇ", "G"], ["Ｍ", "M"], ["Ｔ", "T"], ["Ｋ", "K"], ["ｋ", "k"], ["．", "."]]);
    JapaneseNumeric.UnitMap = new Map([["万万", "億"], ["億万", "兆"], ["万億", "兆"], [" ", ""]]);
    JapaneseNumeric.RoundDirectList = ['万', '億', '兆'];
    JapaneseNumeric.DigitalNumberRegex = `((?<=(\\d|\\b))(k|t|m|g)(?=\\b))`;
    JapaneseNumeric.ZeroToNineFullHalfRegex = `[\\d１２３４５６７８９０]`;
    JapaneseNumeric.DigitNumRegex = `${JapaneseNumeric.ZeroToNineFullHalfRegex}+`;
    JapaneseNumeric.DozenRegex = `.*ダース$`;
    JapaneseNumeric.PercentageRegex = `.+(?=パ\\s*ー\\s*セ\\s*ン\\s*ト)|.*(?=[％%])`;
    JapaneseNumeric.DoubleAndRoundRegex = `${JapaneseNumeric.ZeroToNineFullHalfRegex}+(\\.${JapaneseNumeric.ZeroToNineFullHalfRegex}+)?\\s*[万億]{1,2}(\\s*(以上))?`;
    JapaneseNumeric.FracSplitRegex = `[はと]|分\\s*の`;
    JapaneseNumeric.ZeroToNineIntegerRegex = `[一二三四五六七八九]`;
    JapaneseNumeric.NegativeNumberTermsRegex = `(マ\\s*イ\\s*ナ\\s*ス)`;
    JapaneseNumeric.NegativeNumberTermsRegexNum = `(?<!(\\d+\\s*)|[-－])[-－]`;
    JapaneseNumeric.NegativeNumberSignRegex = `^${JapaneseNumeric.NegativeNumberTermsRegex}.*|^${JapaneseNumeric.NegativeNumberTermsRegexNum}.*`;
    JapaneseNumeric.SpeGetNumberRegex = `${JapaneseNumeric.ZeroToNineFullHalfRegex}|${JapaneseNumeric.ZeroToNineIntegerRegex}|[半対]|[分厘]`;
    JapaneseNumeric.PairRegex = '.*[対膳足]$';
    JapaneseNumeric.RoundNumberIntegerRegex = `[十百千万億兆]`;
    JapaneseNumeric.WhiteListRegex = `(。|，|、|（|）|”｜国|週間|時間|時|匹|キロ|トン|年|個|足|本|\\s|$)`;
    JapaneseNumeric.NotSingleRegex = `(?<!(第|だい))((${JapaneseNumeric.RoundNumberIntegerRegex}+(${JapaneseNumeric.ZeroToNineIntegerRegex}+|${JapaneseNumeric.ZeroToNineFullHalfRegex}+|十)\\s*))|((${JapaneseNumeric.ZeroToNineIntegerRegex}+|${JapaneseNumeric.ZeroToNineFullHalfRegex}+|十)\\s*(${JapaneseNumeric.RoundNumberIntegerRegex}\\s*){1,2})\\s*(([零]?(${JapaneseNumeric.ZeroToNineIntegerRegex}+|${JapaneseNumeric.ZeroToNineFullHalfRegex}+|十)\\s*${JapaneseNumeric.RoundNumberIntegerRegex}{0,1})\\s*)*\\s*(\\s*(以上)?)`;
    JapaneseNumeric.SingleRegex = `((${JapaneseNumeric.ZeroToNineIntegerRegex}|${JapaneseNumeric.ZeroToNineFullHalfRegex}|十)(?=${JapaneseNumeric.WhiteListRegex}))`;
    JapaneseNumeric.AllIntRegex = `((((${JapaneseNumeric.ZeroToNineIntegerRegex}|[十百千])\\s*${JapaneseNumeric.RoundNumberIntegerRegex}*)|(${JapaneseNumeric.ZeroToNineFullHalfRegex}\\s*${JapaneseNumeric.RoundNumberIntegerRegex})){1,2}(\\s*[以上])?)`;
    JapaneseNumeric.NumbersSpecialsChars = `((${JapaneseNumeric.NegativeNumberTermsRegexNum}|${JapaneseNumeric.NegativeNumberTermsRegex})\\s*)?${JapaneseNumeric.ZeroToNineFullHalfRegex}+`;
    JapaneseNumeric.NumbersSpecialsCharsWithSuffix = `${JapaneseNumeric.NegativeNumberTermsRegexNum}?${JapaneseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)`;
    JapaneseNumeric.DottedNumbersSpecialsChar = `${JapaneseNumeric.NegativeNumberTermsRegexNum}?${JapaneseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，、]${JapaneseNumeric.ZeroToNineFullHalfRegex}{3})+`;
    JapaneseNumeric.NumbersWithHalfDozen = `半(${JapaneseNumeric.RoundNumberIntegerRegex}|(ダース))`;
    JapaneseNumeric.NumbersWithDozen = `${JapaneseNumeric.AllIntRegex}(ダース)(?!${JapaneseNumeric.AllIntRegex})`;
    JapaneseNumeric.PointRegexStr = `[\\.．]`;
    JapaneseNumeric.AllFloatRegex = `${JapaneseNumeric.NegativeNumberTermsRegex}?${JapaneseNumeric.AllIntRegex}\\s*${JapaneseNumeric.PointRegexStr}\\s*[一二三四五六七八九](\\s*${JapaneseNumeric.ZeroToNineIntegerRegex})*`;
    JapaneseNumeric.NumbersWithAllowListRegex = `${JapaneseNumeric.NegativeNumberTermsRegex}?(${JapaneseNumeric.NotSingleRegex}|${JapaneseNumeric.SingleRegex})(?!(${JapaneseNumeric.AllIntRegex}*([、.]${JapaneseNumeric.ZeroToNineIntegerRegex}+)*|${JapaneseNumeric.AllFloatRegex})*\\s*${JapaneseNumeric.PercentageRegex}+)`;
    JapaneseNumeric.NumbersAggressiveRegex = `((${JapaneseNumeric.AllIntRegex})(?!(${JapaneseNumeric.AllIntRegex}*([、.]${JapaneseNumeric.ZeroToNineIntegerRegex}+)*|${JapaneseNumeric.AllFloatRegex})*\\s*${JapaneseNumeric.PercentageRegex}*))`;
    JapaneseNumeric.PointRegex = `${JapaneseNumeric.PointRegexStr}`;
    JapaneseNumeric.DoubleSpecialsChars = `(?<!(${JapaneseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}*))(${JapaneseNumeric.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+(?!${JapaneseNumeric.ZeroToNineFullHalfRegex}*[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+)`;
    JapaneseNumeric.DoubleSpecialsCharsWithNegatives = `(?<!(${JapaneseNumeric.ZeroToNineFullHalfRegex}+|\\.\\.|．．))(${JapaneseNumeric.NegativeNumberTermsRegexNum}\\s*)?[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+(?!${JapaneseNumeric.ZeroToNineFullHalfRegex}*([\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+))`;
    JapaneseNumeric.SimpleDoubleSpecialsChars = `(${JapaneseNumeric.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，]${JapaneseNumeric.ZeroToNineFullHalfRegex}{3})+[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+`;
    JapaneseNumeric.DoubleWithMultiplierRegex = `(${JapaneseNumeric.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)`;
    JapaneseNumeric.DoubleWithThousandsRegex = `${JapaneseNumeric.NegativeNumberTermsRegex}{0,1}\\s*(${JapaneseNumeric.ZeroToNineFullHalfRegex}+([\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+)?\\s*[万亿萬億]{1,2})`;
    JapaneseNumeric.DoubleAllFloatRegex = `(?<!((${JapaneseNumeric.AllIntRegex}[.]*)|${JapaneseNumeric.AllFloatRegex})*)${JapaneseNumeric.AllFloatRegex}(?!${JapaneseNumeric.ZeroToNineIntegerRegex}*\\s*パーセント)`;
    JapaneseNumeric.DoubleExponentialNotationRegex = `(?<!${JapaneseNumeric.ZeroToNineFullHalfRegex}+[\\.．])(${JapaneseNumeric.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric.ZeroToNineFullHalfRegex}+([\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+)?e(([-－+＋]*[1-9１２３４５６７８９]${JapaneseNumeric.ZeroToNineFullHalfRegex}*)|[0０](?!${JapaneseNumeric.ZeroToNineFullHalfRegex}+))`;
    JapaneseNumeric.DoubleScientificNotationRegex = `(?<!${JapaneseNumeric.ZeroToNineFullHalfRegex}+[\\.．])(${JapaneseNumeric.NegativeNumberTermsRegexNum}\\s*)?(${JapaneseNumeric.ZeroToNineFullHalfRegex}+([\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+)?)\\^([-－+＋]*[1-9１２３４５６７８９]${JapaneseNumeric.ZeroToNineFullHalfRegex}*)`;
    JapaneseNumeric.OrdinalRegex = `(第|だい)${JapaneseNumeric.AllIntRegex}`;
    JapaneseNumeric.OrdinalNumbersRegex = `(第|だい)${JapaneseNumeric.ZeroToNineFullHalfRegex}+`;
    JapaneseNumeric.AllFractionNumber = `${JapaneseNumeric.NegativeNumberTermsRegex}{0,1}((${JapaneseNumeric.ZeroToNineFullHalfRegex}+|${JapaneseNumeric.AllIntRegex})\\s*[はと]{0,1}\\s*)?${JapaneseNumeric.NegativeNumberTermsRegex}{0,1}(${JapaneseNumeric.ZeroToNineFullHalfRegex}+|${JapaneseNumeric.AllIntRegex})\\s*分\\s*の\\s*${JapaneseNumeric.NegativeNumberTermsRegex}{0,1}(${JapaneseNumeric.ZeroToNineFullHalfRegex}+|${JapaneseNumeric.AllIntRegex})`;
    JapaneseNumeric.FractionNotationSpecialsCharsRegex = `(${JapaneseNumeric.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric.ZeroToNineFullHalfRegex}+\\s+${JapaneseNumeric.ZeroToNineFullHalfRegex}+[/／]${JapaneseNumeric.ZeroToNineFullHalfRegex}+`;
    JapaneseNumeric.FractionNotationRegex = `(${JapaneseNumeric.NegativeNumberTermsRegexNum}\\s*)?${JapaneseNumeric.ZeroToNineFullHalfRegex}+[/／]${JapaneseNumeric.ZeroToNineFullHalfRegex}+`;
    JapaneseNumeric.PercentagePointRegex = `(?<!${JapaneseNumeric.AllIntRegex})(${JapaneseNumeric.AllFloatRegex}|${JapaneseNumeric.AllIntRegex})\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.SimplePercentageRegex = `(${JapaneseNumeric.AllFloatRegex}|${JapaneseNumeric.AllIntRegex}|[百])\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.NumbersPercentagePointRegex = `(${JapaneseNumeric.ZeroToNineFullHalfRegex})+([\\.．](${JapaneseNumeric.ZeroToNineFullHalfRegex})+)?\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.NumbersPercentageWithSeparatorRegex = `(${JapaneseNumeric.ZeroToNineFullHalfRegex}{1,3}[,，、]${JapaneseNumeric.ZeroToNineFullHalfRegex}{3})+([\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+)*\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.NumbersPercentageWithMultiplierRegex = `(?<!${JapaneseNumeric.ZeroToNineIntegerRegex})${JapaneseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.FractionPercentagePointRegex = `(?<!(${JapaneseNumeric.ZeroToNineFullHalfRegex}+[\\.．]))${JapaneseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+(?!([\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+))\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.FractionPercentageWithSeparatorRegex = `${JapaneseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，、]${JapaneseNumeric.ZeroToNineFullHalfRegex}{3})+[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.FractionPercentageWithMultiplierRegex = `${JapaneseNumeric.ZeroToNineFullHalfRegex}+[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.SimpleNumbersPercentageRegex = `(?<!${JapaneseNumeric.ZeroToNineIntegerRegex})${JapaneseNumeric.ZeroToNineFullHalfRegex}+\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト(?!([\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+))`;
    JapaneseNumeric.SimpleNumbersPercentageWithMultiplierRegex = `(?<!${JapaneseNumeric.ZeroToNineIntegerRegex})${JapaneseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.SimpleNumbersPercentagePointRegex = `(?!${JapaneseNumeric.ZeroToNineIntegerRegex})${JapaneseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，]${JapaneseNumeric.ZeroToNineFullHalfRegex}{3})+\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.IntegerPercentageRegex = `${JapaneseNumeric.ZeroToNineFullHalfRegex}+\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.IntegerPercentageWithMultiplierRegex = `${JapaneseNumeric.ZeroToNineFullHalfRegex}+\\s*(K|k|M|G|T|Ｍ|Ｋ|ｋ|Ｇ|Ｔ)\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.NumbersFractionPercentageRegex = `${JapaneseNumeric.ZeroToNineFullHalfRegex}{1,3}([,，]${JapaneseNumeric.ZeroToNineFullHalfRegex}{3})+\\s*パ\\s*ー\\s*セ\\s*ン\\s*ト`;
    JapaneseNumeric.SimpleIntegerPercentageRegex = `${JapaneseNumeric.NegativeNumberTermsRegexNum}?${JapaneseNumeric.ZeroToNineFullHalfRegex}+([\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}+)?(\\s*)[％%]`;
    JapaneseNumeric.NumbersFoldsPercentageRegex = `${JapaneseNumeric.ZeroToNineFullHalfRegex}(([\\.．]?|\\s*)${JapaneseNumeric.ZeroToNineFullHalfRegex})?\\s*[の]*\\s*割引`;
    JapaneseNumeric.FoldsPercentageRegex = `${JapaneseNumeric.ZeroToNineIntegerRegex}(\\s*[.]?\\s*${JapaneseNumeric.ZeroToNineIntegerRegex})?\\s*[の]\\s*割引`;
    JapaneseNumeric.SimpleFoldsPercentageRegex = `${JapaneseNumeric.ZeroToNineFullHalfRegex}\\s*割(\\s*(半|(${JapaneseNumeric.ZeroToNineFullHalfRegex}\\s*分\\s*${JapaneseNumeric.ZeroToNineFullHalfRegex}\\s*厘)|${JapaneseNumeric.ZeroToNineFullHalfRegex}))?`;
    JapaneseNumeric.SpecialsPercentageRegex = `(${JapaneseNumeric.ZeroToNineIntegerRegex}|[十])\\s*割(\\s*(半|${JapaneseNumeric.ZeroToNineIntegerRegex}))?`;
    JapaneseNumeric.NumbersSpecialsPercentageRegex = `(${JapaneseNumeric.ZeroToNineFullHalfRegex}[\\.．]${JapaneseNumeric.ZeroToNineFullHalfRegex}|[1１][0０])\\s*割`;
    JapaneseNumeric.SimpleSpecialsPercentageRegex = `${JapaneseNumeric.ZeroToNineIntegerRegex}\\s*[.]\\s*${JapaneseNumeric.ZeroToNineIntegerRegex}\\s*割`;
    JapaneseNumeric.SpecialsFoldsPercentageRegex = `半\\s*分|(?<=ダース)`;
    JapaneseNumeric.TillRegex = `(から|--|-|—|——|~)`;
    JapaneseNumeric.MoreRegex = `(大なり|大きい|高い|大きく|>)`;
    JapaneseNumeric.LessRegex = `(小なり|小さい|低い|<)`;
    JapaneseNumeric.EqualRegex = `(等しい|イコール|=)`;
    JapaneseNumeric.MoreOrEqual = `((大なりかイコール)|(大きいかイコール)|(大なりか等しい)|(大きいか等しい)|小さくない|以上|最低)`;
    JapaneseNumeric.MoreOrEqualSuffix = `(より(大なりイコール|小さくない))`;
    JapaneseNumeric.LessOrEqual = `((${JapaneseNumeric.LessRegex}\\s*(或|或者)?\\s*${JapaneseNumeric.EqualRegex})|(小なりかイコール)|(小なりか等しい)|(小さいかイコール)|(小さいか等しい)|(小さいか等しい)|大さくない|以下|最大)`;
    JapaneseNumeric.LessOrEqualSuffix = `(小なりイコール|大さくない)`;
    JapaneseNumeric.OneNumberRangeMoreRegex1 = `(?<number1>((?!(((，|、)(?!\\d+))|((,|、)(?!\\d+))|。)).)+)\\s*((より)\\s*((${JapaneseNumeric.MoreOrEqual}|${JapaneseNumeric.MoreRegex}))|超える|を超える)`;
    JapaneseNumeric.OneNumberRangeMoreRegex2 = `(?<number1>((?!((，|、(?!\\d+))|(,|、(?!\\d+))|。)).)+)\\s*(より)?(大なり)`;
    JapaneseNumeric.OneNumberRangeMoreRegex3 = `(?<number1>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*(以上|最低)(?![万億]{1,2})`;
    JapaneseNumeric.OneNumberRangeMoreRegex4 = `(${JapaneseNumeric.MoreOrEqual}|${JapaneseNumeric.MoreRegex})\\s*(?<number1>((?!(と|は|((と)?同時に)|((と)?そして)|が|，|、|,|(，(?!\\d+))|(,(?!\\d+))|。)).)+)`;
    JapaneseNumeric.OneNumberRangeMoreSeparateRegex = `^[.]`;
    JapaneseNumeric.OneNumberRangeLessSeparateRegex = `^[.]`;
    JapaneseNumeric.OneNumberRangeLessRegex1 = `(?<number2>((?!(((，|、)(?!\\d+))|((,|、)(?!\\d+))|。)).)+)\\s*(より)\\s*(${JapaneseNumeric.LessOrEqual}|${JapaneseNumeric.LessRegex})`;
    JapaneseNumeric.OneNumberRangeLessRegex2 = `(?<number2>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*(より)?(小な)`;
    JapaneseNumeric.OneNumberRangeLessRegex3 = `(?<number2>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*(以下|未満)(?![万億]{1,2})`;
    JapaneseNumeric.OneNumberRangeLessRegex4 = `(${JapaneseNumeric.LessOrEqual}|${JapaneseNumeric.LessRegex})\\s*(?<number2>((?!(と|は|((と)?同時に)|((と)?そして)|が|，|、|,|(，(?!\\d+))|(,(?!\\d+))|。)).)+)`;
    JapaneseNumeric.OneNumberRangeEqualRegex = `(((?<number1>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*(に)\\s*${JapaneseNumeric.EqualRegex})|(${JapaneseNumeric.EqualRegex}\\s*(?<number1>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)))`;
    JapaneseNumeric.TwoNumberRangeRegex1 = `(?<number1>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*(と|${JapaneseNumeric.TillRegex})\\s*(?<number2>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*(の間)`;
    JapaneseNumeric.TwoNumberRangeRegex2 = `(${JapaneseNumeric.OneNumberRangeMoreRegex1}|${JapaneseNumeric.OneNumberRangeMoreRegex2}|${JapaneseNumeric.OneNumberRangeMoreRegex3}|${JapaneseNumeric.OneNumberRangeMoreRegex4})\\s*(と|は|((と)?同時に)|((と)?そして)|が|，|、|,)?\\s*(${JapaneseNumeric.OneNumberRangeLessRegex1}|${JapaneseNumeric.OneNumberRangeLessRegex2}|${JapaneseNumeric.OneNumberRangeLessRegex3}|${JapaneseNumeric.OneNumberRangeLessRegex4})`;
    JapaneseNumeric.TwoNumberRangeRegex3 = `(${JapaneseNumeric.OneNumberRangeLessRegex1}|${JapaneseNumeric.OneNumberRangeLessRegex2}|${JapaneseNumeric.OneNumberRangeLessRegex3}|${JapaneseNumeric.OneNumberRangeLessRegex4})\\s*(と|は|((と)?同時に)|((と)?そして)|が|，|、|,)?\\s*(${JapaneseNumeric.OneNumberRangeMoreRegex1}|${JapaneseNumeric.OneNumberRangeMoreRegex2}|${JapaneseNumeric.OneNumberRangeMoreRegex3}|${JapaneseNumeric.OneNumberRangeMoreRegex4})`;
    JapaneseNumeric.TwoNumberRangeRegex4 = `(?<number1>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)\\s*${JapaneseNumeric.TillRegex}\\s*(?<number2>((?!((，(?!\\d+))|(,(?!\\d+))|。)).)+)`;
    JapaneseNumeric.AmbiguousFractionConnectorsRegex = `^[.]`;
})(JapaneseNumeric = exports.JapaneseNumeric || (exports.JapaneseNumeric = {}));

});

unwrapExports(japaneseNumeric);

var parserConfiguration$10 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });



class JapaneseNumberParserConfiguration {
    // readonly NumberOptions Options { get; }
    // readonly Regex FractionPrepositionRegex { get; }
    // readonly string NonDecimalSeparatorText 
    constructor(ci) {
        if (!ci) {
            ci = new culture$2.CultureInfo(culture$2.Culture.Japanese);
        }
        this.cultureInfo = ci;
        this.langMarker = japaneseNumeric.JapaneseNumeric.LangMarker;
        this.decimalSeparatorChar = japaneseNumeric.JapaneseNumeric.DecimalSeparatorChar;
        this.fractionMarkerToken = japaneseNumeric.JapaneseNumeric.FractionMarkerToken;
        this.nonDecimalSeparatorChar = japaneseNumeric.JapaneseNumeric.NonDecimalSeparatorChar;
        this.halfADozenText = japaneseNumeric.JapaneseNumeric.HalfADozenText;
        this.wordSeparatorToken = japaneseNumeric.JapaneseNumeric.WordSeparatorToken;
        this.writtenDecimalSeparatorTexts = [];
        this.writtenGroupSeparatorTexts = [];
        this.writtenIntegerSeparatorTexts = [];
        this.writtenFractionSeparatorTexts = [];
        this.cardinalNumberMap = new Map();
        this.ordinalNumberMap = new Map();
        this.roundNumberMap = japaneseNumeric.JapaneseNumeric.RoundNumberMap;
        this.halfADozenRegex = null;
        this.digitalNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DigitalNumberRegex, "gis");
        this.zeroToNineMap = japaneseNumeric.JapaneseNumeric.ZeroToNineMap;
        this.roundNumberMapChar = japaneseNumeric.JapaneseNumeric.RoundNumberMapChar;
        this.fullToHalfMap = japaneseNumeric.JapaneseNumeric.FullToHalfMap;
        this.tratoSimMap = null;
        this.unitMap = japaneseNumeric.JapaneseNumeric.UnitMap;
        this.roundDirectList = japaneseNumeric.JapaneseNumeric.RoundDirectList;
        this.digitNumRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DigitNumRegex, "gis");
        this.dozenRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DozenRegex, "gis");
        this.percentageRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.PercentageRegex, "gis");
        this.doubleAndRoundRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DoubleAndRoundRegex, "gis");
        this.fracSplitRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.FracSplitRegex, "gis");
        this.negativeNumberSignRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NegativeNumberSignRegex, "is");
        this.pointRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.PointRegex, "gis");
        this.speGetNumberRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.SpeGetNumberRegex, "gis");
        this.pairRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.PairRegex, "gis");
        this.roundNumberIntegerRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.RoundNumberIntegerRegex, "gis");
    }
    normalizeTokenSet(tokens, context) {
        return tokens;
    }
    resolveCompositeNumber(numberStr) {
        return 0;
    }
}
exports.JapaneseNumberParserConfiguration = JapaneseNumberParserConfiguration;

});

unwrapExports(parserConfiguration$10);

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/** `Object#toString` result references. */
var symbolTag$1 = '[object Symbol]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reHasRegExpChar = RegExp(reRegExpChar.source);

/** Detect free variable `global` from Node.js. */
var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf$1 = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$1 = freeGlobal$1 || freeSelf$1 || Function('return this')();

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$1 = objectProto$1.toString;

/** Built-in value references. */
var Symbol$2 = root$1.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : undefined;
var symbolToString$1 = symbolProto$1 ? symbolProto$1.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString$1(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol$1(value)) {
    return symbolToString$1 ? symbolToString$1.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$1(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$1(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$1(value) && objectToString$1.call(value) == symbolTag$1);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString$1(value) {
  return value == null ? '' : baseToString$1(value);
}

/**
 * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
 * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp(string) {
  string = toString$1(string);
  return (string && reHasRegExpChar.test(string))
    ? string.replace(reRegExpChar, '\\$&')
    : string;
}

var lodash_escaperegexp = escapeRegExp;

var extractors$4 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class BaseNumberExtractor {
    constructor() {
        this.extractType = "";
        this.negativeNumberTermsRegex = null;
    }
    extract(source) {
        if (!source || source.trim().length === 0) {
            return [];
        }
        let result = new Array();
        let matchSource = new Map();
        let matched = new Array(source.length);
        for (let i = 0; i < source.length; i++) {
            matched[i] = false;
        }
        let collections = this.regexes
            .map(o => ({ matches: recognizersText.RegExpUtility.getMatches(o.regExp, source), value: o.value }))
            .filter(o => o.matches && o.matches.length);
        collections.forEach(collection => {
            collection.matches.forEach(m => {
                for (let j = 0; j < m.length; j++) {
                    matched[m.index + j] = true;
                }
                // Keep Source Data for extra information
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
                    let srcMatch = Array.from(matchSource.keys()).find(m => m.index === start && m.length === length);
                    // Extract negative numbers
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
                            start: start,
                            length: length,
                            text: substr,
                            type: this.extractType,
                            data: matchSource.has(srcMatch) ? matchSource.get(srcMatch) : null
                        });
                    }
                }
            }
            else {
                last = i;
            }
        }
        return result;
    }
    generateLongFormatNumberRegexes(type, placeholder = baseNumbers.BaseNumbers.PlaceHolderDefault) {
        let thousandsMark = lodash_escaperegexp(type.thousandsMark);
        let decimalsMark = lodash_escaperegexp(type.decimalsMark);
        let regexDefinition = type.decimalsMark === '\0'
            ? baseNumbers.BaseNumbers.IntegerRegexDefinition(placeholder, thousandsMark)
            : baseNumbers.BaseNumbers.DoubleRegexDefinition(placeholder, thousandsMark, decimalsMark);
        return recognizersText.RegExpUtility.getSafeRegExp(regexDefinition, "gis");
    }
}
exports.BaseNumberExtractor = BaseNumberExtractor;
class BasePercentageExtractor {
    constructor(numberExtractor) {
        this.extractType = constants.Constants.SYS_NUM_PERCENTAGE;
        this.numberExtractor = numberExtractor;
        this.regexes = this.initRegexes();
    }
    extract(source) {
        let originSource = source;
        let positionMap;
        let numExtResults;
        // preprocess the source sentence via extracting and replacing the numbers in it
        let preprocess = this.preprocessStrWithNumberExtracted(originSource);
        source = preprocess.source;
        positionMap = preprocess.positionMap;
        numExtResults = preprocess.numExtResults;
        let allMatches = this.regexes.map(rx => recognizersText.RegExpUtility.getMatches(rx, source));
        let matched = new Array(source.length);
        for (let i = 0; i < source.length; i++) {
            matched[i] = false;
        }
        for (let i = 0; i < allMatches.length; i++) {
            allMatches[i].forEach(match => {
                for (let j = 0; j < match.length; j++) {
                    matched[j + match.index] = true;
                }
            });
        }
        let result = new Array();
        let last = -1;
        // get index of each matched results
        for (let i = 0; i < source.length; i++) {
            if (matched[i]) {
                if (i + 1 === source.length || matched[i + 1] === false) {
                    let start = last + 1;
                    let length = i - last;
                    let substr = source.substring(start, start + length);
                    let er = {
                        start: start,
                        length: length,
                        text: substr,
                        type: this.extractType
                    };
                    result.push(er);
                }
            }
            else {
                last = i;
            }
        }
        // post-processing, restoring the extracted numbers
        this.postProcessing(result, originSource, positionMap, numExtResults);
        return result;
    }
    // get the number extractor results and convert the extracted numbers to @sys.num, so that the regexes can work
    preprocessStrWithNumberExtracted(str) {
        let positionMap = new Map();
        let numExtResults = this.numberExtractor.extract(str);
        let replaceText = baseNumbers.BaseNumbers.NumberReplaceToken;
        let match = new Array(str.length);
        let strParts = new Array();
        let start;
        let end;
        for (let i = 0; i < str.length; i++) {
            match[i] = -1;
        }
        for (let i = 0; i < numExtResults.length; i++) {
            let extraction = numExtResults[i];
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
        strParts.forEach(strPart => {
            start = strPart[0];
            end = strPart[1];
            let type = match[start];
            if (type === -1) {
                ret += str.substring(start, end + 1);
                for (let i = start; i <= end; i++) {
                    positionMap.set(index++, i);
                }
            }
            else {
                let originalText = str.substring(start, end + 1);
                ret += replaceText;
                for (let i = 0; i < replaceText.length; i++) {
                    positionMap.set(index++, start);
                }
            }
        });
        positionMap.set(index++, str.length);
        return {
            numExtResults: numExtResults,
            source: ret,
            positionMap: positionMap
        };
    }
    // replace the @sys.num to the real patterns, directly modifies the ExtractResult
    postProcessing(results, originSource, positionMap, numExtResults) {
        let replaceText = baseNumbers.BaseNumbers.NumberReplaceToken;
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
        return regexStrs.map(regexStr => {
            let options = "gs";
            if (ignoreCase) {
                options += "i";
            }
            return recognizersText.RegExpUtility.getSafeRegExp(regexStr, options);
        });
    }
}
BasePercentageExtractor.numExtType = constants.Constants.SYS_NUM;
exports.BasePercentageExtractor = BasePercentageExtractor;

});

unwrapExports(extractors$4);

var extractors$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class EnglishNumberExtractor extends extractors$4.BaseNumberExtractor {
    constructor(mode = models$2.NumberMode.Default) {
        super();
        this.extractType = constants.Constants.SYS_NUM;
        this.negativeNumberTermsRegex = recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.NegativeNumberTermsRegex + "$", "is");
        let regexes = new Array();
        // Add Cardinal
        let cardExtract = null;
        switch (mode) {
            case models$2.NumberMode.PureNumber:
                cardExtract = new EnglishCardinalExtractor(englishNumeric.EnglishNumeric.PlaceHolderPureNumber);
                break;
            case models$2.NumberMode.Currency:
                regexes.push({ regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.CurrencyRegex, "gs"), value: "IntegerNum" });
                break;
            case models$2.NumberMode.Default:
                break;
        }
        if (cardExtract === null) {
            cardExtract = new EnglishCardinalExtractor();
        }
        cardExtract.regexes.forEach(r => regexes.push(r));
        // Add Fraction
        let fracExtract = new EnglishFractionExtractor();
        fracExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.EnglishNumberExtractor = EnglishNumberExtractor;
class EnglishCardinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = englishNumeric.EnglishNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_CARDINAL;
        let regexes = new Array();
        // Add Integer Regexes
        let intExtract = new EnglishIntegerExtractor(placeholder);
        intExtract.regexes.forEach(r => regexes.push(r));
        // Add Double Regexes
        let doubleExtract = new EnglishDoubleExtractor(placeholder);
        doubleExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.EnglishCardinalExtractor = EnglishCardinalExtractor;
class EnglishIntegerExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = englishNumeric.EnglishNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_INTEGER;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.NumbersWithPlaceHolder(placeholder), "gi"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.NumbersWithSuffix, "gs"),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumComma, placeholder),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumBlank, placeholder),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumNoBreakSpace, placeholder),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.RoundNumberIntegerRegexWithLocks, "gis"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.NumbersWithDozenSuffix, "gis"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.AllIntRegexWithLocks, "gis"),
            value: "IntegerEng"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.AllIntRegexWithDozenSuffixLocks, "gis"),
            value: "IntegerEng"
        });
        this.regexes = regexes;
    }
}
exports.EnglishIntegerExtractor = EnglishIntegerExtractor;
class EnglishDoubleExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = englishNumeric.EnglishNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_DOUBLE;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.DoubleDecimalPointRegex(placeholder), "gis"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.DoubleWithoutIntegralRegex(placeholder), "gis"),
            value: "DoubleNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.doubleNumCommaDot, placeholder),
            value: "DoubleNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.doubleNumNoBreakSpaceDot, placeholder),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.DoubleWithMultiplierRegex, "gs"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.DoubleWithRoundNumber, "gis"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.DoubleAllFloatRegex, "gis"),
            value: "DoubleEng"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.DoubleExponentialNotationRegex, "gis"),
            value: "DoublePow"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.DoubleCaretExponentialNotationRegex, "gis"),
            value: "DoublePow"
        });
        this.regexes = regexes;
    }
}
exports.EnglishDoubleExtractor = EnglishDoubleExtractor;
class EnglishFractionExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_FRACTION;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.FractionNotationWithSpacesRegex, "gis"),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.FractionNotationRegex, "gis"),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.FractionNounRegex, "gis"),
            value: "FracEng"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.FractionNounWithArticleRegex, "gis"),
            value: "FracEng"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.FractionPrepositionRegex, "gis"),
            value: "FracEng"
        });
        this.regexes = regexes;
    }
}
exports.EnglishFractionExtractor = EnglishFractionExtractor;
class EnglishOrdinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_ORDINAL;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.OrdinalSuffixRegex, "gis"),
            value: "OrdinalNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.OrdinalNumericRegex, "gis"),
            value: "OrdinalNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.OrdinalEnglishRegex, "gis"),
            value: "OrdEng"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(englishNumeric.EnglishNumeric.OrdinalRoundNumberRegex, "gis"),
            value: "OrdEng"
        });
        this.regexes = regexes;
    }
}
exports.EnglishOrdinalExtractor = EnglishOrdinalExtractor;
class EnglishPercentageExtractor extends extractors$4.BasePercentageExtractor {
    constructor() {
        super(new EnglishNumberExtractor());
    }
    initRegexes() {
        let regexStrs = [
            englishNumeric.EnglishNumeric.NumberWithSuffixPercentage,
            englishNumeric.EnglishNumeric.NumberWithPrefixPercentage
        ];
        return this.buildRegexes(regexStrs);
    }
}
exports.EnglishPercentageExtractor = EnglishPercentageExtractor;

});

unwrapExports(extractors$2);

var extractors$6 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class SpanishNumberExtractor extends extractors$4.BaseNumberExtractor {
    constructor(mode = models$2.NumberMode.Default) {
        super();
        this.extractType = constants.Constants.SYS_NUM;
        let regexes = new Array();
        // Add Cardinal
        let cardExtract = null;
        switch (mode) {
            case models$2.NumberMode.PureNumber:
                cardExtract = new SpanishCardinalExtractor(spanishNumeric.SpanishNumeric.PlaceHolderPureNumber);
                break;
            case models$2.NumberMode.Currency:
                regexes.push({ regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.CurrencyRegex, "gs"), value: "IntegerNum" });
                break;
            case models$2.NumberMode.Default:
                break;
        }
        if (cardExtract === null) {
            cardExtract = new SpanishCardinalExtractor();
        }
        cardExtract.regexes.forEach(r => regexes.push(r));
        // Add Fraction
        let fracExtract = new SpanishFractionExtractor();
        fracExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.SpanishNumberExtractor = SpanishNumberExtractor;
class SpanishCardinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = spanishNumeric.SpanishNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_CARDINAL;
        let regexes = new Array();
        // Add Integer Regexes
        let intExtract = new SpanishIntegerExtractor(placeholder);
        intExtract.regexes.forEach(r => regexes.push(r));
        // Add Double Regexes
        let doubleExtract = new SpanishDoubleExtractor(placeholder);
        doubleExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.SpanishCardinalExtractor = SpanishCardinalExtractor;
class SpanishIntegerExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = spanishNumeric.SpanishNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_INTEGER;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.NumbersWithPlaceHolder(placeholder), "gi"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.NumbersWithSuffix, "gs"),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumDot, placeholder),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumBlank, placeholder),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumNoBreakSpace, placeholder),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.RoundNumberIntegerRegexWithLocks),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.NumbersWithDozenSuffix),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.AllIntRegexWithLocks),
            value: "IntegerSpa"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.AllIntRegexWithDozenSuffixLocks),
            value: "IntegerSpa"
        });
        this.regexes = regexes;
    }
}
exports.SpanishIntegerExtractor = SpanishIntegerExtractor;
class SpanishDoubleExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = spanishNumeric.SpanishNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_DOUBLE;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.DoubleDecimalPointRegex(placeholder)),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.DoubleWithoutIntegralRegex(placeholder)),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.DoubleWithMultiplierRegex, "gs"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.DoubleWithRoundNumber),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.DoubleAllFloatRegex),
            value: "DoubleSpa"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.DoubleExponentialNotationRegex),
            value: "DoublePow"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.DoubleCaretExponentialNotationRegex),
            value: "DoublePow"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.doubleNumDotComma, placeholder),
            value: "DoubleNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.doubleNumNoBreakSpaceComma, placeholder),
            value: "DoubleNum"
        });
        this.regexes = regexes;
    }
}
exports.SpanishDoubleExtractor = SpanishDoubleExtractor;
class SpanishFractionExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_FRACTION;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.FractionNotationRegex),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.FractionNotationWithSpacesRegex),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.FractionNounRegex),
            value: "FracSpa"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.FractionNounWithArticleRegex),
            value: "FracSpa"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.FractionPrepositionRegex),
            value: "FracSpa"
        });
        this.regexes = regexes;
    }
}
exports.SpanishFractionExtractor = SpanishFractionExtractor;
class SpanishOrdinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_ORDINAL;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.OrdinalSuffixRegex),
            value: "OrdinalNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(spanishNumeric.SpanishNumeric.OrdinalNounRegex),
            value: "OrdSpa"
        });
        this.regexes = regexes;
    }
}
exports.SpanishOrdinalExtractor = SpanishOrdinalExtractor;
class SpanishPercentageExtractor extends extractors$4.BasePercentageExtractor {
    constructor() {
        super(new SpanishNumberExtractor());
    }
    initRegexes() {
        let regexStrs = [
            spanishNumeric.SpanishNumeric.NumberWithPrefixPercentage
        ];
        return this.buildRegexes(regexStrs);
    }
}
exports.SpanishPercentageExtractor = SpanishPercentageExtractor;

});

unwrapExports(extractors$6);

var extractors$8 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class PortugueseNumberExtractor extends extractors$4.BaseNumberExtractor {
    constructor(mode = models$2.NumberMode.Default) {
        super();
        this.extractType = constants.Constants.SYS_NUM;
        let regexes = new Array();
        // Add Cardinal
        let cardExtract = null;
        switch (mode) {
            case models$2.NumberMode.PureNumber:
                cardExtract = new PortugueseCardinalExtractor(portugueseNumeric.PortugueseNumeric.PlaceHolderPureNumber);
                break;
            case models$2.NumberMode.Currency:
                regexes.push({ regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.CurrencyRegex, "gs"), value: "IntegerNum" });
                break;
            case models$2.NumberMode.Default:
                break;
        }
        if (cardExtract === null) {
            cardExtract = new PortugueseCardinalExtractor();
        }
        cardExtract.regexes.forEach(r => regexes.push(r));
        // Add Fraction
        let fracExtract = new PortugueseFractionExtractor();
        fracExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.PortugueseNumberExtractor = PortugueseNumberExtractor;
class PortugueseCardinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = portugueseNumeric.PortugueseNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_CARDINAL;
        let regexes = new Array();
        // Add Integer Regexes
        let intExtract = new PortugueseIntegerExtractor(placeholder);
        intExtract.regexes.forEach(r => regexes.push(r));
        // Add Double Regexes
        let doubleExtract = new PortugueseDoubleExtractor(placeholder);
        doubleExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.PortugueseCardinalExtractor = PortugueseCardinalExtractor;
class PortugueseIntegerExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = portugueseNumeric.PortugueseNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_INTEGER;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.NumbersWithPlaceHolder(placeholder), "gi"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.NumbersWithSuffix, "gs"),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumDot, placeholder),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumBlank, placeholder),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumNoBreakSpace, placeholder),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.RoundNumberIntegerRegexWithLocks),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.NumbersWithDozen2Suffix),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.NumbersWithDozenSuffix),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.AllIntRegexWithLocks),
            value: "IntegerPor"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.AllIntRegexWithDozenSuffixLocks),
            value: "IntegerPor"
        });
        this.regexes = regexes;
    }
}
exports.PortugueseIntegerExtractor = PortugueseIntegerExtractor;
class PortugueseDoubleExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = portugueseNumeric.PortugueseNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_DOUBLE;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.DoubleDecimalPointRegex(placeholder)),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.DoubleWithoutIntegralRegex(placeholder)),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.DoubleWithMultiplierRegex, "gs"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.DoubleWithRoundNumber),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.DoubleAllFloatRegex),
            value: "DoublePor"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.DoubleExponentialNotationRegex),
            value: "DoublePow"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.DoubleCaretExponentialNotationRegex),
            value: "DoublePow"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.doubleNumDotComma, placeholder),
            value: "DoubleNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.doubleNumNoBreakSpaceComma, placeholder),
            value: "DoubleNum"
        });
        this.regexes = regexes;
    }
}
exports.PortugueseDoubleExtractor = PortugueseDoubleExtractor;
class PortugueseFractionExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_FRACTION;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.FractionNotationRegex),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.FractionNotationWithSpacesRegex),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.FractionNounRegex),
            value: "FracPor"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.FractionNounWithArticleRegex),
            value: "FracPor"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.FractionPrepositionRegex),
            value: "FracPor"
        });
        this.regexes = regexes;
    }
}
exports.PortugueseFractionExtractor = PortugueseFractionExtractor;
class PortugueseOrdinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_ORDINAL;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.OrdinalSuffixRegex),
            value: "OrdinalNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(portugueseNumeric.PortugueseNumeric.OrdinalEnglishRegex),
            value: "OrdinalPor"
        });
        this.regexes = regexes;
    }
}
exports.PortugueseOrdinalExtractor = PortugueseOrdinalExtractor;
class PortuguesePercentageExtractor extends extractors$4.BasePercentageExtractor {
    constructor() {
        super(new PortugueseNumberExtractor());
    }
    initRegexes() {
        let regexStrs = [
            portugueseNumeric.PortugueseNumeric.NumberWithSuffixPercentage
        ];
        return this.buildRegexes(regexStrs);
    }
}
exports.PortuguesePercentageExtractor = PortuguesePercentageExtractor;

});

unwrapExports(extractors$8);

var extractors$10 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class FrenchNumberExtractor extends extractors$4.BaseNumberExtractor {
    constructor(mode = models$2.NumberMode.Default) {
        super();
        this.extractType = constants.Constants.SYS_NUM;
        let regexes = new Array();
        // Add Cardinal
        let cardExtract = null;
        switch (mode) {
            case models$2.NumberMode.PureNumber:
                cardExtract = new FrenchCardinalExtractor(frenchNumeric.FrenchNumeric.PlaceHolderPureNumber);
                break;
            case models$2.NumberMode.Currency:
                regexes.push({ regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.CurrencyRegex, "gs"), value: "IntegerNum" });
                break;
            case models$2.NumberMode.Default:
                break;
        }
        if (cardExtract === null) {
            cardExtract = new FrenchCardinalExtractor();
        }
        cardExtract.regexes.forEach(r => regexes.push(r));
        // Add Fraction
        let fracExtract = new FrenchFractionExtractor();
        fracExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.FrenchNumberExtractor = FrenchNumberExtractor;
class FrenchCardinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = frenchNumeric.FrenchNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_CARDINAL;
        let regexes = new Array();
        // Add Integer Regexes
        let intExtract = new FrenchIntegerExtractor(placeholder);
        intExtract.regexes.forEach(r => regexes.push(r));
        // Add Double Regexes
        let doubleExtract = new FrenchDoubleExtractor(placeholder);
        doubleExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.FrenchCardinalExtractor = FrenchCardinalExtractor;
class FrenchIntegerExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = frenchNumeric.FrenchNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_INTEGER;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.NumbersWithPlaceHolder(placeholder), "gi"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.NumbersWithSuffix, "gs"),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumDot, placeholder),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumBlank, placeholder),
            value: "IntegerNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.integerNumNoBreakSpace, placeholder),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.RoundNumberIntegerRegexWithLocks),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.NumbersWithDozenSuffix),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.AllIntRegexWithLocks),
            value: "IntegerFr"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.AllIntRegexWithDozenSuffixLocks),
            value: "IntegerFr"
        });
        this.regexes = regexes;
    }
}
exports.FrenchIntegerExtractor = FrenchIntegerExtractor;
class FrenchDoubleExtractor extends extractors$4.BaseNumberExtractor {
    constructor(placeholder = frenchNumeric.FrenchNumeric.PlaceHolderDefault) {
        super();
        this.extractType = constants.Constants.SYS_NUM_DOUBLE;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.DoubleDecimalPointRegex(placeholder)),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.DoubleWithoutIntegralRegex(placeholder)),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.DoubleWithMultiplierRegex, "gs"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.DoubleWithRoundNumber),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.DoubleAllFloatRegex),
            value: "DoubleFr"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.DoubleExponentialNotationRegex),
            value: "DoublePow"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.DoubleCaretExponentialNotationRegex),
            value: "DoublePow"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.doubleNumDotComma, placeholder),
            value: "DoubleNum"
        }, {
            regExp: this.generateLongFormatNumberRegexes(models$2.LongFormatType.doubleNumNoBreakSpaceComma, placeholder),
            value: "DoubleNum"
        });
        this.regexes = regexes;
    }
}
exports.FrenchDoubleExtractor = FrenchDoubleExtractor;
class FrenchFractionExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_FRACTION;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.FractionNotationRegex),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.FractionNotationWithSpacesRegex),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.FractionNounRegex),
            value: "FracFr"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.FractionNounWithArticleRegex),
            value: "FracFr"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.FractionPrepositionRegex),
            value: "FracFr"
        });
        this.regexes = regexes;
    }
}
exports.FrenchFractionExtractor = FrenchFractionExtractor;
class FrenchOrdinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_ORDINAL;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.OrdinalSuffixRegex),
            value: "OrdinalNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(frenchNumeric.FrenchNumeric.OrdinalFrenchRegex),
            value: "OrdFr"
        });
        this.regexes = regexes;
    }
}
exports.FrenchOrdinalExtractor = FrenchOrdinalExtractor;
class FrenchPercentageExtractor extends extractors$4.BasePercentageExtractor {
    constructor() {
        super(new FrenchNumberExtractor());
    }
    initRegexes() {
        let regexStrs = [
            frenchNumeric.FrenchNumeric.NumberWithSuffixPercentage,
            frenchNumeric.FrenchNumeric.NumberWithPrefixPercentage
        ];
        return this.buildRegexes(regexStrs);
    }
}
exports.FrenchPercentageExtractor = FrenchPercentageExtractor;

});

unwrapExports(extractors$10);

var extractors$12 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




var ChineseNumberExtractorMode;
(function (ChineseNumberExtractorMode) {
    // Number extraction with an allow list that filters what numbers to extract.
    ChineseNumberExtractorMode[ChineseNumberExtractorMode["Default"] = 0] = "Default";
    // Extract all number-related terms aggressively.
    ChineseNumberExtractorMode[ChineseNumberExtractorMode["ExtractAll"] = 1] = "ExtractAll";
})(ChineseNumberExtractorMode = exports.ChineseNumberExtractorMode || (exports.ChineseNumberExtractorMode = {}));
class ChineseNumberExtractor extends extractors$4.BaseNumberExtractor {
    constructor(mode = ChineseNumberExtractorMode.Default) {
        super();
        this.extractType = constants.Constants.SYS_NUM;
        let regexes = new Array();
        // Add Cardinal
        let cardExtract = new ChineseCardinalExtractor(mode);
        cardExtract.regexes.forEach(r => regexes.push(r));
        // Add Fraction
        let fracExtract = new ChineseFractionExtractor();
        fracExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.ChineseNumberExtractor = ChineseNumberExtractor;
class ChineseCardinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor(mode = ChineseNumberExtractorMode.Default) {
        super();
        this.extractType = constants.Constants.SYS_NUM_CARDINAL;
        let regexes = new Array();
        // Add Integer Regexes
        let intExtract = new ChineseIntegerExtractor(mode);
        intExtract.regexes.forEach(r => regexes.push(r));
        // Add Double Regexes
        let doubleExtract = new ChineseDoubleExtractor();
        doubleExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.ChineseCardinalExtractor = ChineseCardinalExtractor;
class ChineseIntegerExtractor extends extractors$4.BaseNumberExtractor {
    constructor(mode = ChineseNumberExtractorMode.Default) {
        super();
        this.extractType = constants.Constants.SYS_NUM_INTEGER;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersSpecialsChars, "gi"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersSpecialsCharsWithSuffix, "gs"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DottedNumbersSpecialsChar, "gis"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersWithHalfDozen, "gis"),
            value: "IntegerChs"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersWithDozen, "gis"),
            value: "IntegerChs"
        });
        switch (mode) {
            case ChineseNumberExtractorMode.Default:
                regexes.push({
                    regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersWithAllowListRegex, "gi"),
                    value: "IntegerChs"
                });
                break;
            case ChineseNumberExtractorMode.ExtractAll:
                regexes.push({
                    regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersAggressiveRegex, "gi"),
                    value: "IntegerChs"
                });
                break;
        }
        this.regexes = regexes;
    }
}
exports.ChineseIntegerExtractor = ChineseIntegerExtractor;
class ChineseDoubleExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_DOUBLE;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DoubleSpecialsChars, "gis"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DoubleSpecialsCharsWithNegatives, "gis"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SimpleDoubleSpecialsChars, "gis"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DoubleWithMultiplierRegex, "gi"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DoubleWithThousandsRegex, "gi"),
            value: "DoubleChs"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DoubleAllFloatRegex, "gi"),
            value: "DoubleChs"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DoubleExponentialNotationRegex, "gis"),
            value: "DoublePow"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.DoubleScientificNotationRegex, "gis"),
            value: "DoublePow"
        });
        this.regexes = regexes;
    }
}
exports.ChineseDoubleExtractor = ChineseDoubleExtractor;
class ChineseFractionExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_FRACTION;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.FractionNotationSpecialsCharsRegex, "gis"),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.FractionNotationRegex, "gis"),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.AllFractionNumber, "gi"),
            value: "FracChs"
        });
        this.regexes = regexes;
    }
}
exports.ChineseFractionExtractor = ChineseFractionExtractor;
class ChineseOrdinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_ORDINAL;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.OrdinalRegex, "gi"),
            value: "OrdinalChs"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.OrdinalNumbersRegex, "gi"),
            value: "OrdinalChs"
        });
        this.regexes = regexes;
    }
}
exports.ChineseOrdinalExtractor = ChineseOrdinalExtractor;
class ChinesePercentageExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_PERCENTAGE;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.PercentagePointRegex, "gi"),
            value: "PerChs"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SimplePercentageRegex, "gi"),
            value: "PerChs"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersPercentagePointRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersPercentageWithSeparatorRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersPercentageWithMultiplierRegex, "gi"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.FractionPercentagePointRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.FractionPercentageWithSeparatorRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.FractionPercentageWithMultiplierRegex, "gi"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SimpleNumbersPercentageRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SimpleNumbersPercentageWithMultiplierRegex, "gi"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SimpleNumbersPercentagePointRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.IntegerPercentageRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.IntegerPercentageWithMultiplierRegex, "gi"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersFractionPercentageRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SimpleIntegerPercentageRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersFoldsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.FoldsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SimpleFoldsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SpecialsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.NumbersSpecialsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SimpleSpecialsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(chineseNumeric.ChineseNumeric.SpecialsFoldsPercentageRegex, "gis"),
            value: "PerSpe"
        });
        this.regexes = regexes;
    }
}
exports.ChinesePercentageExtractor = ChinesePercentageExtractor;

});

unwrapExports(extractors$12);

var extractors$14 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




var JapaneseNumberExtractorMode;
(function (JapaneseNumberExtractorMode) {
    // Number extraction with an allow list that filters what numbers to extract.
    JapaneseNumberExtractorMode[JapaneseNumberExtractorMode["Default"] = 0] = "Default";
    // Extract all number-related terms aggressively.
    JapaneseNumberExtractorMode[JapaneseNumberExtractorMode["ExtractAll"] = 1] = "ExtractAll";
})(JapaneseNumberExtractorMode = exports.JapaneseNumberExtractorMode || (exports.JapaneseNumberExtractorMode = {}));
class JapaneseNumberExtractor extends extractors$4.BaseNumberExtractor {
    constructor(mode = JapaneseNumberExtractorMode.Default) {
        super();
        this.extractType = constants.Constants.SYS_NUM;
        let regexes = new Array();
        // Add Cardinal
        let cardExtract = new JapaneseCardinalExtractor(mode);
        cardExtract.regexes.forEach(r => regexes.push(r));
        // Add Fraction
        let fracExtract = new JapaneseFractionExtractor();
        fracExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.JapaneseNumberExtractor = JapaneseNumberExtractor;
class JapaneseCardinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor(mode = JapaneseNumberExtractorMode.Default) {
        super();
        this.extractType = constants.Constants.SYS_NUM_CARDINAL;
        let regexes = new Array();
        // Add Integer Regexes
        let intExtract = new JapaneseIntegerExtractor(mode);
        intExtract.regexes.forEach(r => regexes.push(r));
        // Add Double Regexes
        let doubleExtract = new JapaneseDoubleExtractor();
        doubleExtract.regexes.forEach(r => regexes.push(r));
        this.regexes = regexes;
    }
}
exports.JapaneseCardinalExtractor = JapaneseCardinalExtractor;
class JapaneseIntegerExtractor extends extractors$4.BaseNumberExtractor {
    constructor(mode = JapaneseNumberExtractorMode.Default) {
        super();
        this.extractType = constants.Constants.SYS_NUM_INTEGER;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersSpecialsChars, "gi"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersSpecialsCharsWithSuffix, "gi"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DottedNumbersSpecialsChar, "gi"),
            value: "IntegerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersWithHalfDozen, "gi"),
            value: "IntegerJpn"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersWithDozen, "gi"),
            value: "IntegerJpn"
        });
        switch (mode) {
            case JapaneseNumberExtractorMode.Default:
                regexes.push({
                    regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersWithAllowListRegex, "gi"),
                    value: "IntegerJpn"
                });
                break;
            case JapaneseNumberExtractorMode.ExtractAll:
                regexes.push({
                    regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersAggressiveRegex, "gi"),
                    value: "IntegerJpn"
                });
                break;
        }
        this.regexes = regexes;
    }
}
exports.JapaneseIntegerExtractor = JapaneseIntegerExtractor;
class JapaneseDoubleExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_DOUBLE;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DoubleSpecialsChars, "gis"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DoubleSpecialsCharsWithNegatives, "gis"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.SimpleDoubleSpecialsChars, "gis"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DoubleWithMultiplierRegex, "gis"),
            value: "DoubleNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DoubleWithThousandsRegex, "gis"),
            value: "DoubleJpn"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DoubleExponentialNotationRegex, "gis"),
            value: "DoublePow"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.DoubleScientificNotationRegex, "gis"),
            value: "DoublePow"
        });
        this.regexes = regexes;
    }
}
exports.JapaneseDoubleExtractor = JapaneseDoubleExtractor;
class JapaneseFractionExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_FRACTION;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.FractionNotationSpecialsCharsRegex, "gis"),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.FractionNotationRegex, "gis"),
            value: "FracNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.AllFractionNumber, "gis"),
            value: "FracJpn"
        });
        this.regexes = regexes;
    }
}
exports.JapaneseFractionExtractor = JapaneseFractionExtractor;
class JapaneseOrdinalExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_ORDINAL;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.OrdinalRegex, "gi"),
            value: "OrdinalJpn"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.OrdinalNumbersRegex, "gi"),
            value: "OrdinalJpn"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersFoldsPercentageRegex, "gi"),
            value: "OrdinalJpn"
        });
        this.regexes = regexes;
    }
}
exports.JapaneseOrdinalExtractor = JapaneseOrdinalExtractor;
class JapanesePercentageExtractor extends extractors$4.BaseNumberExtractor {
    constructor() {
        super();
        this.extractType = constants.Constants.SYS_NUM_PERCENTAGE;
        let regexes = new Array({
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.SimplePercentageRegex, "gi"),
            value: "PerJpn"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersPercentagePointRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersPercentageWithSeparatorRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersPercentageWithMultiplierRegex, "gi"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.SimpleNumbersPercentageWithMultiplierRegex, "gi"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.SimpleIntegerPercentageRegex, "gis"),
            value: "PerNum"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersFoldsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.FoldsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.SimpleFoldsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.SpecialsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.NumbersSpecialsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.SimpleSpecialsPercentageRegex, "gis"),
            value: "PerSpe"
        }, {
            regExp: recognizersText.RegExpUtility.getSafeRegExp(japaneseNumeric.JapaneseNumeric.SpecialsFoldsPercentageRegex, "gis"),
            value: "PerSpe"
        });
        this.regexes = regexes;
    }
}
exports.JapanesePercentageExtractor = JapanesePercentageExtractor;

});

unwrapExports(extractors$14);

var numberRecognizer = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
















var NumberOptions;
(function (NumberOptions) {
    NumberOptions[NumberOptions["None"] = 0] = "None";
})(NumberOptions = exports.NumberOptions || (exports.NumberOptions = {}));
function recognizeNumber(query, culture, options = NumberOptions.None, fallbackToDefaultCulture = true) {
    return recognizeByModel(recognizer => recognizer.getNumberModel(culture, fallbackToDefaultCulture), query, culture, options);
}
exports.recognizeNumber = recognizeNumber;
function recognizeOrdinal(query, culture, options = NumberOptions.None, fallbackToDefaultCulture = true) {
    return recognizeByModel(recognizer => recognizer.getOrdinalModel(culture, fallbackToDefaultCulture), query, culture, options);
}
exports.recognizeOrdinal = recognizeOrdinal;
function recognizePercentage(query, culture, options = NumberOptions.None, fallbackToDefaultCulture = true) {
    return recognizeByModel(recognizer => recognizer.getPercentageModel(culture, fallbackToDefaultCulture), query, culture, options);
}
exports.recognizePercentage = recognizePercentage;
function recognizeByModel(getModelFunc, query, culture, options) {
    let recognizer = new NumberRecognizer(culture, options);
    let model = getModelFunc(recognizer);
    return model.parse(query);
}
class NumberRecognizer extends recognizersText.Recognizer {
    constructor(culture, options = NumberOptions.None, lazyInitialization = false) {
        super(culture, options, lazyInitialization);
    }
    InitializeConfiguration() {
        //#region English
        this.registerModel("NumberModel", culture$2.Culture.English, (options) => new models$2.NumberModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Number, new parserConfiguration.EnglishNumberParserConfiguration()), new extractors$2.EnglishNumberExtractor(models$2.NumberMode.PureNumber)));
        this.registerModel("OrdinalModel", culture$2.Culture.English, (options) => new models$2.OrdinalModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Ordinal, new parserConfiguration.EnglishNumberParserConfiguration()), new extractors$2.EnglishOrdinalExtractor()));
        this.registerModel("PercentModel", culture$2.Culture.English, (options) => new models$2.PercentModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Percentage, new parserConfiguration.EnglishNumberParserConfiguration()), new extractors$2.EnglishPercentageExtractor()));
        //#endregion
        //#region Spanish
        this.registerModel("NumberModel", culture$2.Culture.Spanish, (options) => new models$2.NumberModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Number, new parserConfiguration$2.SpanishNumberParserConfiguration()), new extractors$6.SpanishNumberExtractor(models$2.NumberMode.PureNumber)));
        this.registerModel("OrdinalModel", culture$2.Culture.Spanish, (options) => new models$2.OrdinalModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Ordinal, new parserConfiguration$2.SpanishNumberParserConfiguration()), new extractors$6.SpanishOrdinalExtractor()));
        this.registerModel("PercentModel", culture$2.Culture.Spanish, (options) => new models$2.PercentModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Percentage, new parserConfiguration$2.SpanishNumberParserConfiguration()), new extractors$6.SpanishPercentageExtractor()));
        //#endregion
        //#region Portuguese
        this.registerModel("NumberModel", culture$2.Culture.Portuguese, (options) => new models$2.NumberModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Number, new parserConfiguration$4.PortugueseNumberParserConfiguration()), new extractors$8.PortugueseNumberExtractor(models$2.NumberMode.PureNumber)));
        this.registerModel("OrdinalModel", culture$2.Culture.Portuguese, (options) => new models$2.OrdinalModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Ordinal, new parserConfiguration$4.PortugueseNumberParserConfiguration()), new extractors$8.PortugueseOrdinalExtractor()));
        this.registerModel("PercentModel", culture$2.Culture.Portuguese, (options) => new models$2.PercentModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Percentage, new parserConfiguration$4.PortugueseNumberParserConfiguration()), new extractors$8.PortuguesePercentageExtractor()));
        //#endregion
        //#region Chinese
        this.registerModel("NumberModel", culture$2.Culture.Chinese, (options) => new models$2.NumberModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Number, new parserConfiguration$8.ChineseNumberParserConfiguration()), new extractors$12.ChineseNumberExtractor()));
        this.registerModel("OrdinalModel", culture$2.Culture.Chinese, (options) => new models$2.OrdinalModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Ordinal, new parserConfiguration$8.ChineseNumberParserConfiguration()), new extractors$12.ChineseOrdinalExtractor()));
        this.registerModel("PercentModel", culture$2.Culture.Chinese, (options) => new models$2.PercentModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Percentage, new parserConfiguration$8.ChineseNumberParserConfiguration()), new extractors$12.ChinesePercentageExtractor()));
        //#endregion
        //#region Japanese
        this.registerModel("NumberModel", culture$2.Culture.Japanese, (options) => new models$2.NumberModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Number, new parserConfiguration$10.JapaneseNumberParserConfiguration()), new extractors$14.JapaneseNumberExtractor()));
        this.registerModel("OrdinalModel", culture$2.Culture.Japanese, (options) => new models$2.OrdinalModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Ordinal, new parserConfiguration$10.JapaneseNumberParserConfiguration()), new extractors$14.JapaneseOrdinalExtractor()));
        this.registerModel("PercentModel", culture$2.Culture.Japanese, (options) => new models$2.PercentModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Percentage, new parserConfiguration$10.JapaneseNumberParserConfiguration()), new extractors$14.JapanesePercentageExtractor()));
        //#endregion
        //#region French
        this.registerModel("NumberModel", culture$2.Culture.French, (options) => new models$2.NumberModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Number, new parserConfiguration$6.FrenchNumberParserConfiguration()), new extractors$10.FrenchNumberExtractor(models$2.NumberMode.PureNumber)));
        this.registerModel("OrdinalModel", culture$2.Culture.French, (options) => new models$2.OrdinalModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Ordinal, new parserConfiguration$6.FrenchNumberParserConfiguration()), new extractors$10.FrenchOrdinalExtractor()));
        this.registerModel("PercentModel", culture$2.Culture.French, (options) => new models$2.PercentModel(agnosticNumberParser.AgnosticNumberParserFactory.getParser(agnosticNumberParser.AgnosticNumberParserType.Percentage, new parserConfiguration$6.FrenchNumberParserConfiguration()), new extractors$10.FrenchPercentageExtractor()));
        //#endregion
    }
    IsValidOptions(options) {
        return options >= 0 && options <= NumberOptions.None;
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
}
exports.default = NumberRecognizer;

});

unwrapExports(numberRecognizer);

var recognizersTextNumber = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

exports.NumberRecognizer = numberRecognizer.default;
exports.NumberOptions = numberRecognizer.NumberOptions;
exports.recognizeNumber = numberRecognizer.recognizeNumber;
exports.recognizeOrdinal = numberRecognizer.recognizeOrdinal;
exports.recognizePercentage = numberRecognizer.recognizePercentage;

exports.Culture = culture$2.Culture;
exports.CultureInfo = culture$2.CultureInfo;

exports.FormatUtility = recognizersText.FormatUtility;
exports.StringUtility = recognizersText.StringUtility;
exports.Match = recognizersText.Match;
exports.RegExpUtility = recognizersText.RegExpUtility;

exports.BaseNumbers = baseNumbers.BaseNumbers;

exports.EnglishNumeric = englishNumeric.EnglishNumeric;

exports.SpanishNumeric = spanishNumeric.SpanishNumeric;

exports.FrenchNumeric = frenchNumeric.FrenchNumeric;

exports.ChineseNumeric = chineseNumeric.ChineseNumeric;

exports.JapaneseNumeric = japaneseNumeric.JapaneseNumeric;

exports.Constants = constants.Constants;

exports.BaseNumberExtractor = extractors$4.BaseNumberExtractor;
exports.BasePercentageExtractor = extractors$4.BasePercentageExtractor;

exports.NumberMode = models$2.NumberMode;
exports.LongFormatType = models$2.LongFormatType;
exports.AbstractNumberModel = models$2.AbstractNumberModel;
exports.NumberModel = models$2.NumberModel;
exports.OrdinalModel = models$2.OrdinalModel;
exports.PercentModel = models$2.PercentModel;

exports.AgnosticNumberParserType = agnosticNumberParser.AgnosticNumberParserType;
exports.AgnosticNumberParserFactory = agnosticNumberParser.AgnosticNumberParserFactory;

exports.BaseNumberParser = parsers$2.BaseNumberParser;
exports.BasePercentageParser = parsers$2.BasePercentageParser;

exports.EnglishCardinalExtractor = extractors$2.EnglishCardinalExtractor;
exports.EnglishDoubleExtractor = extractors$2.EnglishDoubleExtractor;
exports.EnglishFractionExtractor = extractors$2.EnglishFractionExtractor;
exports.EnglishIntegerExtractor = extractors$2.EnglishIntegerExtractor;
exports.EnglishNumberExtractor = extractors$2.EnglishNumberExtractor;
exports.EnglishOrdinalExtractor = extractors$2.EnglishOrdinalExtractor;
exports.EnglishPercentageExtractor = extractors$2.EnglishPercentageExtractor;

exports.EnglishNumberParserConfiguration = parserConfiguration.EnglishNumberParserConfiguration;

exports.SpanishCardinalExtractor = extractors$6.SpanishCardinalExtractor;
exports.SpanishDoubleExtractor = extractors$6.SpanishDoubleExtractor;
exports.SpanishFractionExtractor = extractors$6.SpanishFractionExtractor;
exports.SpanishIntegerExtractor = extractors$6.SpanishIntegerExtractor;
exports.SpanishNumberExtractor = extractors$6.SpanishNumberExtractor;
exports.SpanishOrdinalExtractor = extractors$6.SpanishOrdinalExtractor;
exports.SpanishPercentageExtractor = extractors$6.SpanishPercentageExtractor;

exports.SpanishNumberParserConfiguration = parserConfiguration$2.SpanishNumberParserConfiguration;

exports.PortugueseCardinalExtractor = extractors$8.PortugueseCardinalExtractor;
exports.PortugueseDoubleExtractor = extractors$8.PortugueseDoubleExtractor;
exports.PortugueseFractionExtractor = extractors$8.PortugueseFractionExtractor;
exports.PortugueseIntegerExtractor = extractors$8.PortugueseIntegerExtractor;
exports.PortugueseNumberExtractor = extractors$8.PortugueseNumberExtractor;
exports.PortugueseOrdinalExtractor = extractors$8.PortugueseOrdinalExtractor;
exports.PortuguesePercentageExtractor = extractors$8.PortuguesePercentageExtractor;

exports.PortugueseNumberParserConfiguration = parserConfiguration$4.PortugueseNumberParserConfiguration;

exports.FrenchCardinalExtractor = extractors$10.FrenchCardinalExtractor;
exports.FrenchDoubleExtractor = extractors$10.FrenchDoubleExtractor;
exports.FrenchFractionExtractor = extractors$10.FrenchFractionExtractor;
exports.FrenchIntegerExtractor = extractors$10.FrenchIntegerExtractor;
exports.FrenchNumberExtractor = extractors$10.FrenchNumberExtractor;
exports.FrenchOrdinalExtractor = extractors$10.FrenchOrdinalExtractor;
exports.FrenchPercentageExtractor = extractors$10.FrenchPercentageExtractor;

exports.FrenchNumberParserConfiguration = parserConfiguration$6.FrenchNumberParserConfiguration;

exports.ChineseCardinalExtractor = extractors$12.ChineseCardinalExtractor;
exports.ChineseDoubleExtractor = extractors$12.ChineseDoubleExtractor;
exports.ChineseFractionExtractor = extractors$12.ChineseFractionExtractor;
exports.ChineseIntegerExtractor = extractors$12.ChineseIntegerExtractor;
exports.ChineseNumberExtractor = extractors$12.ChineseNumberExtractor;
exports.ChineseOrdinalExtractor = extractors$12.ChineseOrdinalExtractor;
exports.ChinesePercentageExtractor = extractors$12.ChinesePercentageExtractor;
exports.ChineseNumberExtractorMode = extractors$12.ChineseNumberExtractorMode;

exports.ChineseNumberParserConfiguration = parserConfiguration$8.ChineseNumberParserConfiguration;

exports.JapaneseCardinalExtractor = extractors$14.JapaneseCardinalExtractor;
exports.JapaneseDoubleExtractor = extractors$14.JapaneseDoubleExtractor;
exports.JapaneseFractionExtractor = extractors$14.JapaneseFractionExtractor;
exports.JapaneseIntegerExtractor = extractors$14.JapaneseIntegerExtractor;
exports.JapaneseNumberExtractor = extractors$14.JapaneseNumberExtractor;
exports.JapaneseOrdinalExtractor = extractors$14.JapaneseOrdinalExtractor;
exports.JapanesePercentageExtractor = extractors$14.JapanesePercentageExtractor;
exports.JapaneseNumberExtractorMode = extractors$14.JapaneseNumberExtractorMode;

exports.JapaneseNumberParserConfiguration = parserConfiguration$10.JapaneseNumberParserConfiguration;

});

unwrapExports(recognizersTextNumber);

var models$4 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

var CompositeEntityType;
(function (CompositeEntityType) {
    CompositeEntityType[CompositeEntityType["Age"] = 0] = "Age";
    CompositeEntityType[CompositeEntityType["Currency"] = 1] = "Currency";
    CompositeEntityType[CompositeEntityType["Dimension"] = 2] = "Dimension";
    CompositeEntityType[CompositeEntityType["Temperature"] = 3] = "Temperature";
})(CompositeEntityType = exports.CompositeEntityType || (exports.CompositeEntityType = {}));
class AbstractNumberWithUnitModel {
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
                    }
                    else {
                        parseResults.push(r);
                    }
                }
            }
            let modelResults = parseResults.map(o => ({
                start: o.start,
                end: o.start + o.length - 1,
                resolution: this.getResolution(o.value),
                text: o.text,
                typeName: this.modelTypeName
            }));
            modelResults.forEach(result => {
                let bAdd = true;
                extractionResults.forEach(extractionResult => {
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
        if (typeof data === 'undefined')
            return null;
        let result = typeof data === "string"
            ? { value: data.toString() }
            : { value: data.number, unit: data.unit };
        if (data.isoCurrency) {
            result['isoCurrency'] = data.isoCurrency;
        }
        return result;
    }
}
exports.AbstractNumberWithUnitModel = AbstractNumberWithUnitModel;
class AgeModel extends AbstractNumberWithUnitModel {
    constructor() {
        super(...arguments);
        this.modelTypeName = "age";
    }
}
exports.AgeModel = AgeModel;
class CurrencyModel extends AbstractNumberWithUnitModel {
    constructor() {
        super(...arguments);
        this.modelTypeName = "currency";
    }
}
exports.CurrencyModel = CurrencyModel;
class DimensionModel extends AbstractNumberWithUnitModel {
    constructor() {
        super(...arguments);
        this.modelTypeName = "dimension";
    }
}
exports.DimensionModel = DimensionModel;
class TemperatureModel extends AbstractNumberWithUnitModel {
    constructor() {
        super(...arguments);
        this.modelTypeName = "temperature";
    }
}
exports.TemperatureModel = TemperatureModel;

});

unwrapExports(models$4);

var baseUnits = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var BaseUnits;
(function (BaseUnits) {
    BaseUnits.HourRegex = `(?<hour>00|01|02|03|04|05|06|07|08|09|0|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|1|2|3|4|5|6|7|8|9)(h)?`;
    BaseUnits.MinuteRegex = `(?<min>00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|0|1|2|3|4|5|6|7|8|9)(?!\\d)`;
    BaseUnits.SecondRegex = `(?<sec>00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|0|1|2|3|4|5|6|7|8|9)`;
    BaseUnits.PmNonUnitRegex = `(${BaseUnits.HourRegex}\\s*:\\s*${BaseUnits.MinuteRegex}(\\s*:\\s*${BaseUnits.SecondRegex})?\\s*pm)`;
    BaseUnits.AmbiguousTimeTerm = 'pm';
})(BaseUnits = exports.BaseUnits || (exports.BaseUnits = {}));

});

unwrapExports(baseUnits);

var constants$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

class Constants {
}
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
Constants.AMBIGUOUS_TIME_TERM = baseUnits.BaseUnits.AmbiguousTimeTerm;
// For currencies without ISO codes, we use internal values prefixed by '_'.
// These values should never be present in parse output.
Constants.FAKE_ISO_CODE_PREFIX = "_";
exports.Constants = Constants;

});

unwrapExports(constants$2);

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** `Object#toString` result references. */
var symbolTag$2 = '[object Symbol]';

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$2 = objectProto$2.toString;

/**
 * The base implementation of methods like `_.max` and `_.min` which accepts a
 * `comparator` to determine the extremum value.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The iteratee invoked per iteration.
 * @param {Function} comparator The comparator used to compare values.
 * @returns {*} Returns the extremum value.
 */
function baseExtremum(array, iteratee, comparator) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    var value = array[index],
        current = iteratee(value);

    if (current != null && (computed === undefined
          ? (current === current && !isSymbol$2(current))
          : comparator(current, computed)
        )) {
      var computed = current,
          result = value;
    }
  }
  return result;
}

/**
 * The base implementation of `_.gt` which doesn't coerce arguments to numbers.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if `value` is greater than `other`,
 *  else `false`.
 */
function baseGt(value, other) {
  return value > other;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$2(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$2(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$2(value) && objectToString$2.call(value) == symbolTag$2);
}

/**
 * This method returns the first argument given to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * Computes the maximum value of `array`. If `array` is empty or falsey,
 * `undefined` is returned.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {*} Returns the maximum value.
 * @example
 *
 * _.max([4, 2, 8, 6]);
 * // => 8
 *
 * _.max([]);
 * // => undefined
 */
function max(array) {
  return (array && array.length)
    ? baseExtremum(array, identity, baseGt)
    : undefined;
}

var lodash_max = max;

var extractors$16 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class NumberWithUnitExtractor {
    constructor(config) {
        this.config = config;
        if (this.config.suffixList && this.config.suffixList.size > 0) {
            this.suffixRegexes = this.buildRegexFromSet(Array.from(this.config.suffixList.values()));
        }
        else {
            this.suffixRegexes = new Set(); // empty
        }
        if (this.config.prefixList && this.config.prefixList.size > 0) {
            let maxLength = 0;
            this.config.prefixList.forEach(preMatch => {
                let len = lodash_max(preMatch.split('|').filter(s => s && s.length).map(s => s.length));
                maxLength = maxLength >= len ? maxLength : len;
            });
            // 2 is the maxium length of spaces.
            this.maxPrefixMatchLen = maxLength + 2;
            this.prefixRegexes = this.buildRegexFromSet(Array.from(this.config.prefixList.values()));
        }
        else {
            this.prefixRegexes = new Set(); // empty
        }
        this.separateRegex = this.buildSeparateRegexFromSet();
    }
    extract(source) {
        if (!this.preCheckStr(source)) {
            return new Array();
        }
        let mappingPrefix = new Map();
        let matched = new Array(source.length);
        let numbers = this.config.unitNumExtractor.extract(source);
        let result = new Array();
        let sourceLen = source.length;
        /* Mix prefix and numbers, make up a prefix-number combination */
        if (this.maxPrefixMatchLen !== 0) {
            numbers.forEach(num => {
                if (num.start === undefined || num.length === undefined) {
                    return;
                }
                let maxFindPref = Math.min(this.maxPrefixMatchLen, num.start);
                if (maxFindPref === 0) {
                    return;
                }
                /* Scan from left to right , find the longest match */
                let leftStr = source.substring(num.start - maxFindPref, num.start - maxFindPref + maxFindPref);
                
                let lastIndex = leftStr.length;
                let bestMatch = null;
                this.prefixRegexes.forEach(regex => {
                    let collection = recognizersText.RegExpUtility.getMatches(regex, leftStr).filter(m => m.length);
                    if (collection.length === 0) {
                        return;
                    }
                    collection.forEach(match => {
                        if (leftStr.substring(match.index, lastIndex).trim() === match.value) {
                            if (bestMatch === null || bestMatch.index >= match.index) {
                                bestMatch = match;
                            }
                        }
                    });
                });
                if (bestMatch !== null) {
                    let unitStr = leftStr.substring(bestMatch.index, lastIndex);
                    mappingPrefix.set(num.start, {
                        offset: lastIndex - bestMatch.index,
                        unitString: unitStr
                    });
                }
            });
        }
        for (let num of numbers) {
            if (num.start === undefined || num.length === undefined) {
                continue;
            }
            let start = num.start;
            let length = num.length;
            let maxFindLen = sourceLen - start - length;
            let prefixUnit = mappingPrefix.has(start) ? mappingPrefix.get(start) : null;
            if (maxFindLen > 0) {
                let rightSub = source.substring(start + length, start + length + maxFindLen);
                let unitMatch = Array.from(this.suffixRegexes.values()).map(r => recognizersText.RegExpUtility.getMatches(r, rightSub))
                    .filter(m => m.length > 0);
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
                        start: start,
                        length: length + maxlen,
                        text: substr,
                        type: this.config.extractType
                    };
                    if (prefixUnit !== null) {
                        er.start -= prefixUnit.offset;
                        er.length += prefixUnit.offset;
                        er.text = prefixUnit.unitString + er.text;
                    }
                    /* Relative position will be used in Parser */
                    num.start = start - er.start;
                    er.data = num;
                    let isDimensionFallsInPmTime = false;
                    if (er.type === constants$2.Constants.SYS_UNIT_DIMENSION) {
                        let nonUnitMatch = recognizersText.RegExpUtility.getMatches(this.config.pmNonUnitRegex, source);
                        nonUnitMatch.forEach(match => {
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
                /* Relative position will be used in Parser */
                num.start = start - er.start;
                er.data = num;
                result.push(er);
            }
        }
        // extract Separate unit
        if (this.separateRegex !== null) {
            this.extractSeparateUnits(source, result);
        }
        return result;
    }
    validateUnit(source) {
        return source.substring(0, 1) !== '-';
    }
    preCheckStr(str) {
        return str && str.length;
    }
    extractSeparateUnits(source, numDependResults) {
        // Default is false
        let matchResult = new Array(source.length);
        numDependResults.forEach(numDependResult => {
            let start = numDependResult.start;
            let i = 0;
            do {
                matchResult[start + i++] = true;
            } while (i < numDependResult.length);
        });
        // Extract all SeparateUnits, then merge it with numDependResults
        let matchCollection = recognizersText.RegExpUtility.getMatches(this.separateRegex, source);
        if (matchCollection.length > 0) {
            matchCollection.forEach(match => {
                let i = 0;
                while (i < match.length && !matchResult[match.index + i]) {
                    i++;
                }
                if (i === match.length) {
                    // Mark as extracted
                    for (let j = 0; j < i; j++) {
                        matchResult[j] = true;
                    }
                    let isDimensionFallsInPmTime = false;
                    if (match.value === constants$2.Constants.AMBIGUOUS_TIME_TERM) {
                        let nonUnitMatch = recognizersText.RegExpUtility.getMatches(this.config.pmNonUnitRegex, source);
                        nonUnitMatch.forEach(time => {
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
        return new Set(collection.map(regexString => {
            let regexTokens = regexString.split('|').map(lodash_escaperegexp);
            let pattern = `${this.config.buildPrefix}(${regexTokens.join('|')})${this.config.buildSuffix}`;
            let options = "gs";
            if (ignoreCase)
                options += "i";
            return recognizersText.RegExpUtility.getSafeRegExp(pattern, options);
        }));
    }
    buildSeparateRegexFromSet(ignoreCase = true) {
        let separateWords = new Set();
        if (this.config.prefixList && this.config.prefixList.size) {
            for (let addWord of this.config.prefixList.values()) {
                addWord.split('|').filter(s => s && s.length)
                    .filter(this.validateUnit)
                    .forEach(word => separateWords.add(word));
            }
        }
        if (this.config.suffixList && this.config.suffixList.size) {
            for (let addWord of this.config.suffixList.values()) {
                addWord.split('|').filter(s => s && s.length)
                    .filter(this.validateUnit)
                    .forEach(word => separateWords.add(word));
            }
        }
        if (this.config.ambiguousUnitList && this.config.ambiguousUnitList.length) {
            for (let abandonWord of this.config.ambiguousUnitList) {
                if (separateWords.has(abandonWord)) {
                    separateWords.delete(abandonWord);
                }
            }
        }
        let regexTokens = Array.from(separateWords.values()).map(lodash_escaperegexp);
        if (regexTokens.length === 0) {
            return null;
        }
        // Sort SeparateWords using descending length.
        regexTokens = regexTokens.sort(this.dinoComparer);
        let pattern = `${this.config.buildPrefix}(${regexTokens.join('|')})${this.config.buildSuffix}`;
        let options = "gs";
        if (ignoreCase)
            options += "i";
        return recognizersText.RegExpUtility.getSafeRegExp(pattern, options);
    }
    dinoComparer(x, y) {
        if (x === null) {
            if (y === null) {
                // If x is null and y is null, they're
                // equal.
                return 0;
            }
            else {
                // If x is null and y is not null, y
                // is greater.
                return 1;
            }
        }
        else {
            // If x is not null...
            //
            if (y === null) 
            // ...and y is null, x is greater.
            {
                return -1;
            }
            else {
                // ...and y is not null, compare the
                // lengths of the two strings.
                //
                let retval = y.length - x.length;
                if (retval !== 0) {
                    // If the strings are not of equal length,
                    // the longer string is greater.
                    //
                    return retval;
                }
                else {
                    // If the strings are of equal length,
                    // sort them with ordinary string comparison.
                    //
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
}
exports.NumberWithUnitExtractor = NumberWithUnitExtractor;
class BaseMergedUnitExtractor {
    constructor(config) {
        this.config = config;
        this.innerExtractor = new NumberWithUnitExtractor(config);
    }
    extract(source) {
        let result = new Array();
        if (this.config.extractType === constants$2.Constants.SYS_UNIT_CURRENCY) {
            result = this.mergeCompoundUnits(source);
        }
        else {
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
            if (ers[i].data != null && ers[i].data.data != null && !ers[i].data.data.startsWith('Integer')) {
                groups[i + 1] = groups[i] + 1;
                continue;
            }
            let middleBegin = ers[i].start + ers[i].length;
            let middleEnd = ers[i + 1].start;
            let middleStr = source.substring(middleBegin, middleEnd).trim().toLowerCase();
            // Separated by whitespace
            if (recognizersText.StringUtility.isNullOrEmpty(middleStr)) {
                groups[i + 1] = groups[i];
                continue;
            }
            // Separated by connectors
            let match = recognizersText.RegExpUtility.getMatches(this.config.compoundUnitConnectorRegex, middleStr).pop();
            if (match && match.index === 0 && match.length === middleStr.length) {
                groups[i + 1] = groups[i];
            }
            else {
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
            // Reduce extract results in same group
            if (i + 1 < ers.length && groups[i + 1] === groups[i]) {
                let group = groups[i];
                let periodBegin = result[group].start;
                let periodEnd = ers[i + 1].start + ers[i + 1].length;
                result[group].length = periodEnd - periodBegin;
                result[group].text = source.substring(periodBegin, periodEnd);
                result[group].type = constants$2.Constants.SYS_UNIT_CURRENCY;
                result[group].data.push(ers[i + 1]);
            }
        }
        for (let i = 0; i < result.length; i++) {
            let innerData = result[i].data;
            if (innerData && innerData.length === 1) {
                result[i] = innerData[0];
            }
        }
        result = result.filter(er => er.type !== recognizersTextNumber.Constants.SYS_NUM);
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
            // Separated by whitespace
            if (recognizersText.StringUtility.isNullOrEmpty(middleStr)) {
                unitNumbers.push(numErs[i]);
                continue;
            }
            // Separated by connectors
            let match = recognizersText.RegExpUtility.getMatches(this.config.compoundUnitConnectorRegex, middleStr).pop();
            if (match && match.index === 0 && match.length === middleStr.length) {
                unitNumbers.push(numErs[i]);
            }
        }
        unitNumbers.forEach(extractResult => {
            let overlap = false;
            result.forEach(er => {
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
}
exports.BaseMergedUnitExtractor = BaseMergedUnitExtractor;
class PrefixUnitResult {
}
exports.PrefixUnitResult = PrefixUnitResult;

});

unwrapExports(extractors$16);

/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}

var lodash_last = last;

var utilities$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

class DictionaryUtils {
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
        let values = source.trim().split('|');
        values.forEach(token => {
            if (recognizersText.StringUtility.isNullOrWhitespace(token) || dictionary.has(token)) {
                return;
            }
            dictionary.set(token, key);
        });
    }
}
exports.DictionaryUtils = DictionaryUtils;

});

unwrapExports(utilities$2);

var baseCurrency = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var BaseCurrency;
(function (BaseCurrency) {
    BaseCurrency.CurrencyFractionMapping = new Map([["CNY", "FEN|JIAO"], ["__D", "CENT"], ["RUB", "KOPEK"], ["AFN", "PUL"], ["EUR", "CENT"], ["ALL", "QINDARKE"], ["_ALP", "PENNY"], ["GBP", "PENNY"], ["_GGP", "PENNY"], ["DZD", "SANTEEM"], ["AOA", "CENTIMO"], ["ARS", "CENTAVO"], ["AMD", "LUMA"], ["AWG", "CENT"], ["_AP", "PENNY"], ["SHP", "PENNY"], ["AUD", "CENT"], ["AZN", "QƏPIK"], ["BSD", "CENT"], ["BHD", "FILS"], ["BDT", "POISHA"], ["BBD", "CENT"], ["BYN", "KAPYEYKA"], ["BZD", "CENT"], ["XOF", "CENTIME"], ["BMD", "CENT"], ["BTN", "CHETRUM"], ["INR", "PAISA"], ["BOB", "CENTAVO"], ["USD", "CENT"], ["BAM", "FENING"], ["BWP", "THEBE"], ["BRL", "CENTAVO"], ["_BD", "CENT"], ["BND", "SEN"], ["SGD", "CENT"], ["BGN", "STOTINKA"], ["BIF", "CENTIME"], ["KHR", "SEN"], ["XAF", "CENTIME"], ["CAD", "CENT"], ["CVE", "CENTAVO"], ["KYD", "CENT"], ["CLP", "CENTAVO"], ["COP", "CENTAVO"], ["KMF", "CENTIME"], ["CDF", "CENTIME"], ["NZD", "CENT"], ["_CKD", "CENT"], ["CRC", "CENTIMO"], ["HRK", "LIPA"], ["CUC", "CENTAVO"], ["CUP", "CENTAVO"], ["CZK", "HALER"], ["DKK", "ØRE"], ["DJF", "CENTIME"], ["DOP", "CENTAVO"], ["EGP", "PIASTRE"], ["ERN", "CENT"], ["ETB", "SANTIM"], ["FKP", "PENNY"], ["_FOK", "OYRA"], ["FJD", "CENT"], ["XPF", "CENTIME"], ["GMD", "BUTUT"], ["GEL", "TETRI"], ["GHS", "PESEWA"], ["GIP", "PENNY"], ["GTQ", "CENTAVO"], ["GNF", "CENTIME"], ["GYD", "CENT"], ["HTG", "CENTIME"], ["HNL", "CENTAVO"], ["HKD", "CENT"], ["HUF", "FILLER"], ["ISK", "EYRIR"], ["IDR", "SEN"], ["IRR", "DINAR"], ["IQD", "FILS"], ["IMP", "PENNY"], ["ILS", "AGORA"], ["JMD", "CENT"], ["JPY", "SEN"], ["JEP", "PENNY"], ["JOD", "PIASTRE"], ["KZT", "TIIN"], ["KES", "CENT"], ["_KID", "CENT"], ["KPW", "CHON"], ["KRW", "JEON"], ["KWD", "FILS"], ["KGS", "TYIYN"], ["LAK", "ATT"], ["LBP", "PIASTRE"], ["LSL", "SENTE"], ["ZAR", "CENT"], ["LRD", "CENT"], ["LYD", "DIRHAM"], ["CHF", "RAPPEN"], ["MOP", "AVO"], ["MKD", "DENI"], ["MGA", "IRAIMBILANJA"], ["MWK", "TAMBALA"], ["MYR", "SEN"], ["MVR", "LAARI"], ["MRO", "KHOUMS"], ["MUR", "CENT"], ["MXN", "CENTAVO"], ["_MD", "CENT"], ["MDL", "BAN"], ["MNT", "MONGO"], ["MAD", "CENTIME"], ["MZN", "CENTAVO"], ["MMK", "PYA"], ["NAD", "CENT"], ["_ND", "CENT"], ["NPR", "PAISA"], ["NIO", "CENTAVO"], ["NGN", "KOBO"], ["_NID", "CENT"], ["TRY", "KURUS"], ["NOK", "ØRE"], ["OMR", "BAISA"], ["PKR", "PAISA"], ["_PD", "CENT"], ["PAB", "CENTESIMO"], ["PGK", "TOEA"], ["PYG", "CENTIMO"], ["PEN", "CENTIMO"], ["_PND", "CENT"], ["PLN", "GROSZ"], ["QAR", "DIRHAM"], ["RON", "BAN"], ["RWF", "CENTIME"], ["WST", "SENE"], ["STD", "CENTIMO"], ["SAR", "HALALA"], ["RSD", "PARA"], ["SCR", "CENT"], ["SLL", "CENT"], ["SBD", "CENT"], ["SOS", "CENT"], ["_SS", "CENT"], ["_SP", "PENNY"], ["SSP", "PIASTRE"], ["LKR", "CENT"], ["SDG", "PIASTRE"], ["SRD", "CENT"], ["SZL", "CENT"], ["SEK", "ORE"], ["SYP", "PIASTRE"], ["TWD", "CENT"], ["TJS", "DIRAM"], ["TZS", "CENT"], ["THB", "SATANG"], ["PRB", "KOPEK"], ["TTD", "CENT"], ["_TP", "PENNY"], ["TND", "MILLIME"], ["TMT", "TENNESI"], ["TVD", "CENT"], ["UGX", "CENT"], ["UAH", "KOPIYKA"], ["AED", "FILS"], ["UYU", "CENTESIMO"], ["VEF", "CENTIMO"], ["YER", "FILS"], ["ZMW", "NGWEE"]]);
    BaseCurrency.CurrencyFractionalRatios = new Map([["Kopek", 100], ["Pul", 100], ["Cent", 100], ["Qindarkë", 100], ["Penny", 100], ["Santeem", 100], ["Cêntimo", 100], ["Centavo", 100], ["Luma", 100], ["Qəpik", 100], ["Fils", 1000], ["Poisha", 100], ["Kapyeyka", 100], ["Centime", 100], ["Chetrum", 100], ["Paisa", 100], ["Fening", 100], ["Thebe", 100], ["Sen", 100], ["Stotinka", 100], ["Jiao", 10], ["Fen", 100], ["Céntimo", 100], ["Lipa", 100], ["Haléř", 100], ["Øre", 100], ["Piastre", 100], ["Santim", 100], ["Oyra", 100], ["Butut", 100], ["Tetri", 100], ["Pesewa", 100], ["Fillér", 100], ["Eyrir", 100], ["Dinar", 100], ["Agora", 100], ["Tïın", 100], ["Chon", 100], ["Jeon", 100], ["Tyiyn", 100], ["Att", 100], ["Sente", 100], ["Dirham", 1000], ["Rappen", 100], ["Avo", 100], ["Deni", 100], ["Iraimbilanja", 5], ["Tambala", 100], ["Laari", 100], ["Khoums", 5], ["Ban", 100], ["Möngö", 100], ["Pya", 100], ["Kobo", 100], ["Kuruş", 100], ["Baisa", 1000], ["Centésimo", 100], ["Toea", 100], ["Sentimo", 100], ["Grosz", 100], ["Sene", 100], ["Halala", 100], ["Para", 100], ["Öre", 100], ["Diram", 100], ["Satang", 100], ["Seniti", 100], ["Millime", 1000], ["Tennesi", 100], ["Kopiyka", 100], ["Tiyin", 100], ["Hào", 10], ["Ngwee", 100]]);
})(BaseCurrency = exports.BaseCurrency || (exports.BaseCurrency = {}));

});

unwrapExports(baseCurrency);

var parsers$4 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });






class UnitValue {
    constructor() {
        this.number = "";
        this.unit = "";
    }
}
exports.UnitValue = UnitValue;
class UnitValueIso extends UnitValue {
    constructor() {
        super(...arguments);
        this.isoCurrency = "";
    }
}
exports.UnitValueIso = UnitValueIso;
class BaseNumberWithUnitParserConfiguration {
    constructor(cultureInfo) {
        this.cultureInfo = cultureInfo;
        this.unitMap = new Map();
        this.currencyFractionNumMap = baseCurrency.BaseCurrency.CurrencyFractionalRatios;
        this.currencyFractionMapping = baseCurrency.BaseCurrency.CurrencyFractionMapping;
    }
    BindDictionary(dictionary) {
        utilities$2.DictionaryUtils.bindDictionary(dictionary, this.unitMap);
    }
}
exports.BaseNumberWithUnitParserConfiguration = BaseNumberWithUnitParserConfiguration;
class NumberWithUnitParser {
    constructor(config) {
        this.config = config;
    }
    parse(extResult) {
        let ret = new recognizersText.ParseResult(extResult);
        let numberResult;
        if (extResult.data && typeof extResult.data === "object") {
            numberResult = extResult.data;
        }
        else if (extResult.type === constants$2.Constants.SYS_NUM) {
            ret.value = this.config.internalNumberParser.parse(extResult).value;
            return ret;
        }
        else {
            // if there is no unitResult, means there is just unit
            numberResult = { start: -1, length: 0, text: null, type: null };
        }
        // key contains units
        let key = extResult.text;
        let unitKeyBuild = '';
        let unitKeys = new Array();
        for (let i = 0; i <= key.length; i++) {
            if (i === key.length) {
                if (unitKeyBuild.length !== 0) {
                    this.addIfNotContained(unitKeys, unitKeyBuild.trim());
                }
            }
            // numberResult.start is a relative position
            else if (i === numberResult.start) {
                if (unitKeyBuild.length !== 0) {
                    this.addIfNotContained(unitKeys, unitKeyBuild.trim());
                    unitKeyBuild = '';
                }
                let o = numberResult.start + numberResult.length - 1;
                if (o !== null && !isNaN(o)) {
                    i = o;
                }
            }
            else {
                unitKeyBuild += key[i];
            }
        }
        /* Unit type depends on last unit in suffix.*/
        let lastUnit = lodash_last(unitKeys);
        let normalizedLastUnit = lastUnit.toLowerCase();
        if (this.config.connectorToken && this.config.connectorToken.length && normalizedLastUnit.indexOf(this.config.connectorToken) === 0) {
            normalizedLastUnit = normalizedLastUnit.substring(this.config.connectorToken.length).trim();
            lastUnit = lastUnit.substring(this.config.connectorToken.length).trim();
        }
        if (key && key.length && (this.config.unitMap !== null)) {
            let unitValue = null;
            if (this.config.unitMap.has(lastUnit)) {
                unitValue = this.config.unitMap.get(lastUnit);
            }
            else if (this.config.unitMap.has(normalizedLastUnit)) {
                unitValue = this.config.unitMap.get(normalizedLastUnit);
            }
            if (unitValue) {
                let numValue = numberResult.text && numberResult.text.length ? this.config.internalNumberParser.parse(numberResult) : null;
                let resolutionStr = numValue ? numValue.resolutionStr : null;
                ret.value = { number: resolutionStr, unit: unitValue };
                ret.resolutionStr = (`${resolutionStr} ${unitValue}`).trim();
            }
        }
        return ret;
    }
    addIfNotContained(keys, newKey) {
        if (!keys.some(key => key.includes(newKey))) {
            keys.push(newKey);
        }
    }
}
exports.NumberWithUnitParser = NumberWithUnitParser;
class BaseCurrencyParser {
    constructor(config) {
        this.config = config;
        this.numberWithUnitParser = new NumberWithUnitParser(config);
    }
    parse(extResult) {
        let result = null;
        if (extResult.data instanceof Array) {
            result = this.mergeCompoundUnit(extResult);
        }
        else {
            result = this.numberWithUnitParser.parse(extResult);
            let value = result.value;
            if (!this.config.currencyNameToIsoCodeMap.has(value.unit) || this.config.currencyNameToIsoCodeMap.get(value.unit).startsWith(constants$2.Constants.FAKE_ISO_CODE_PREFIX)) {
                result.value = {
                    unit: value.unit,
                    number: value.number
                };
            }
            else {
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
        let numberValue = 0.0;
        let mainUnitValue = '';
        let mainUnitIsoCode = '';
        let fractionUnitsString = '';
        for (let i = 0; i < compoundUnit.length; i++) {
            let extractResult = compoundUnit[i];
            let parseResult = this.numberWithUnitParser.parse(extractResult);
            let parseResultValue = parseResult.value;
            let unitValue = parseResultValue != null ? parseResultValue.unit : null;
            // Process a new group
            if (count === 0) {
                if (extractResult.type !== constants$2.Constants.SYS_UNIT_CURRENCY) {
                    continue;
                }
                // Initialize a new result
                result = new recognizersText.ParseResult(extractResult);
                mainUnitValue = unitValue;
                numberValue = parseFloat(parseResultValue.number);
                result.resolutionStr = parseResult.resolutionStr;
                if (this.config.currencyNameToIsoCodeMap.has(unitValue)) {
                    mainUnitIsoCode = this.config.currencyNameToIsoCodeMap.get(unitValue);
                }
                // If the main unit can't be recognized, finish process this group.
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
            }
            else {
                // Match pure number as fraction unit.
                if (extractResult.type === recognizersTextNumber.Constants.SYS_NUM) {
                    numberValue += parseResult.value * (1.0 / 100);
                    result.resolutionStr += ' ' + parseResult.resolutionStr;
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
                    numberValue += parseFloat(parseResultValue.number) * (1.0 / fractionNumValue);
                    result.resolutionStr += ' ' + parseResult.resolutionStr;
                    result.length = parseResult.start + parseResult.length - result.start;
                }
                else {
                    // If the fraction unit doesn't match the main unit, finish process this group.
                    if (result !== null) {
                        if (recognizersText.StringUtility.isNullOrEmpty(mainUnitIsoCode) || mainUnitIsoCode.startsWith(constants$2.Constants.FAKE_ISO_CODE_PREFIX)) {
                            result.value = {
                                number: numberValue.toString(),
                                unit: mainUnitValue
                            };
                        }
                        else {
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
            if (recognizersText.StringUtility.isNullOrEmpty(mainUnitIsoCode) || mainUnitIsoCode.startsWith(constants$2.Constants.FAKE_ISO_CODE_PREFIX)) {
                result.value = {
                    number: numberValue.toString(),
                    unit: mainUnitValue
                };
            }
            else {
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
        let unitsMap = new Map();
        utilities$2.DictionaryUtils.bindUnitsString(unitsMap, '', fractionUnitsString);
        return unitsMap.has(fractionUnitCode);
    }
    resolveText(prs, source, bias) {
        prs.forEach(parseResult => {
            if (parseResult.start !== null && parseResult.length !== null) {
                parseResult.text = source.substr(parseResult.start - bias, parseResult.length);
            }
        });
    }
}
exports.BaseCurrencyParser = BaseCurrencyParser;
class BaseMergedUnitParser {
    constructor(config) {
        this.config = config;
        this.numberWithUnitParser = new NumberWithUnitParser(config);
        this.currencyParser = new BaseCurrencyParser(config);
    }
    parse(extResult) {
        let result;
        if (extResult.type === constants$2.Constants.SYS_UNIT_CURRENCY) {
            result = this.currencyParser.parse(extResult);
        }
        else {
            result = this.numberWithUnitParser.parse(extResult);
        }
        return result;
    }
}
exports.BaseMergedUnitParser = BaseMergedUnitParser;

});

unwrapExports(parsers$4);

var englishNumericWithUnit = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var EnglishNumericWithUnit;
(function (EnglishNumericWithUnit) {
    EnglishNumericWithUnit.AgeSuffixList = new Map([["Year", "years old|year old|year-old|years-old|-year-old|-years-old|years of age|year of age"], ["Month", "months old|month old|month-old|months-old|-month-old|-months-old|month of age|months of age"], ["Week", "weeks old|week old|week-old|weeks-old|-week-old|-weeks-old|week of age|weeks of age"], ["Day", "days old|day old|day-old|days-old|-day-old|-days-old|day of age|days of age"]]);
    EnglishNumericWithUnit.AreaSuffixList = new Map([["Square kilometer", "sq km|sq kilometer|sq kilometre|sq kilometers|sq kilometres|square kilometer|square kilometre|square kilometers|square kilometres|km2|km^2|km²"], ["Square hectometer", "sq hm|sq hectometer|sq hectometre|sq hectometers|sq hectometres|square hectometer|square hectometre|square hectometers|square hectometres|hm2|hm^2|hm²|hectare|hectares"], ["Square decameter", "sq dam|sq decameter|sq decametre|sq decameters|sq decametres|square decameter|square decametre|square decameters|square decametres|sq dekameter|sq dekametre|sq dekameters|sq dekametres|square dekameter|square dekametre|square dekameters|square dekametres|dam2|dam^2|dam²"], ["Square meter", "sq m|sq meter|sq metre|sq meters|sq metres|sq metre|square meter|square meters|square metre|square metres|m2|m^2|m²"], ["Square decimeter", "sq dm|sq decimeter|sq decimetre|sq decimeters|sq decimetres|square decimeter|square decimetre|square decimeters|square decimetres|dm2|dm^2|dm²"], ["Square centimeter", "sq cm|sq centimeter|sq centimetre|sq centimeters|sq centimetres|square centimeter|square centimetre|square centimeters|square centimetres|cm2|cm^2|cm²"], ["Square millimeter", "sq mm|sq millimeter|sq millimetre|sq millimeters|sq millimetres|square millimeter|square millimetre|square millimeters|square millimetres|mm2|mm^2|mm²"], ["Square inch", "sq in|sq inch|square inch|square inches|in2|in^2|in²"], ["Square foot", "sqft|sq ft|sq foot|sq feet|square foot|square feet|feet2|feet^2|feet²|ft2|ft^2|ft²"], ["Square mile", "sq mi|sq mile|sqmiles|square mile|square miles|mi2|mi^2|mi²"], ["Square yard", "sq yd|sq yard|sq yards|square yard|square yards|yd2|yd^2|yd²"], ["Acre", "-acre|acre|acres"]]);
    EnglishNumericWithUnit.CurrencySuffixList = new Map([["Abkhazian apsar", "abkhazian apsar|apsars"], ["Afghan afghani", "afghan afghani|؋|afn|afghanis|afghani"], ["Pul", "pul"], ["Euro", "euros|euro|€|eur"], ["Cent", "cents|cent|-cents|-cent|sen"], ["Albanian lek", "albanian lek|leks|lek"], ["Qindarkë", "qindarkë|qindarkës|qindarke|qindarkes"], ["Angolan kwanza", "angolan kwanza|kz|aoa|kwanza|kwanzas|angolan kwanzas"], ["Armenian dram", "armenian drams|armenian dram"], ["Aruban florin", "aruban florin|ƒ|awg|aruban florins"], ["Bangladeshi taka", "bangladeshi taka|৳|bdt|taka|takas|bangladeshi takas"], ["Paisa", "poisha|paisa"], ["Bhutanese ngultrum", "Bhutanese ngultrum|nu.|btn"], ["Chetrum", "chetrums|chetrum"], ["Bolivian boliviano", "bolivian boliviano|bob|bs.|bolivia boliviano|bolivia bolivianos|bolivian bolivianos"], ["Bosnia and Herzegovina convertible mark", "bosnia and herzegovina convertible mark|bam"], ["Fening", "fenings|fenings"], ["Botswana pula", "botswana pula|bwp|pula|pulas|botswana pulas"], ["Thebe", "thebe"], ["Brazilian real", "brazilian real|r$|brl|brazil real|brazil reals|brazilian reals"], ["Bulgarian lev", "bulgarian lev|bgn|лв|bulgaria lev|bulgaria levs|bulgarian levs"], ["Stotinka", "stotinki|stotinka"], ["Cambodian riel", "cambodian riel|khr|៛|cambodia riel|cambodia riels|cambodian riels"], ["Cape Verdean escudo", "cape verdean escudo|cve"], ["Costa Rican colón", "costa rican colón|costa rican colóns|crc|₡|costa rica colón|costa rica colóns|costa rican colon|costa rican colons|costa rica colon|costa rica colons"], ["Salvadoran colón", "svc|salvadoran colón|salvadoran colóns|salvador colón|salvador colóns|salvadoran colon|salvadoran colons|salvador colon|salvador colons"], ["Céntimo", "céntimo"], ["Croatian kuna", "croatian kuna|kn|hrk|croatia kuna|croatian kunas|croatian kuna kunas"], ["Lipa", "lipa"], ["Czech koruna", "czech koruna|czk|Kč|czech korunas"], ["Haléř", "haléř"], ["Eritrean nakfa", "eritrean nakfa|nfk|ern|eritrean nakfas"], ["Ethiopian birr", "ethiopian birr|etb"], ["Gambian dalasi", "gmd"], ["Butut", "bututs|butut"], ["Georgian lari", "Georgian lari|lari|gel|₾"], ["Tetri", "tetri"], ["Ghanaian cedi", "Ghanaian cedi|ghs|₵|gh₵"], ["Pesewa", "pesewas|pesewa"], ["Guatemalan quetzal", "guatemalan quetzal|gtq|guatemala quetzal"], ["Haitian gourde", "haitian gourde|htg"], ["Honduran lempira", "honduran lempira|hnl"], ["Hungarian forint", "hungarian forint|huf|ft|hungary forint|hungary forints|hungarian forints"], ["Fillér", "fillér"], ["Iranian rial", "iranian rial|irr|iran rial|iran rials|iranian rials"], ["Yemeni rial", "yemeni rial|yer|yemeni rials"], ["Israeli new shekel", "₪|ils|agora"], ["Lithuanian litas", "ltl|lithuanian litas|lithuan litas|lithuanian lit|lithuan lit"], ["Japanese yen", "japanese yen|jpy|yen|-yen|¥|yens|japanese yens|japan yen|japan yens"], ["Kazakhstani tenge", "Kazakhstani tenge|kzt"], ["Kenyan shilling", "kenyan shilling|sh|kes"], ["North Korean won", "north korean won|kpw|north korean wons"], ["South Korean won", "south korean won|krw|south korean wons"], ["Korean won", "korean won|₩|korean wons"], ["Kyrgyzstani som", "kyrgyzstani som|kgs"], ["Uzbekitan som", "uzbekitan som|uzs"], ["Lao kip", "lao kip|lak|₭n|₭"], ["Att", "att"], ["Lesotho loti", "lesotho loti|lsl|loti"], ["Sente", "sente|lisente"], ["South African rand", "south african rand|zar|south africa rand|south africa rands|south african rands"], ["Macanese pataca", "macanese pataca|mop$|mop"], ["Avo", "avos|avo"], ["Macedonian denar", "macedonian denar|mkd|ден"], ["Deni", "deni"], ["Malagasy ariary", "malagasy ariary|mga"], ["Iraimbilanja", "iraimbilanja"], ["Malawian kwacha", "malawian kwacha|mk|mwk"], ["Tambala", "tambala"], ["Malaysian ringgit", "malaysian ringgit|rm|myr|malaysia ringgit|malaysia ringgits|malaysian ringgits"], ["Mauritanian ouguiya", "mauritanian ouguiya|um|mro|mauritania ouguiya|mauritania ouguiyas|mauritanian ouguiyas"], ["Khoums", "khoums"], ["Mongolian tögrög", "mongolian tögrög|mnt|₮|mongolia tögrög|mongolia tögrögs|mongolian tögrögs|mongolian togrog|mongolian togrogs|mongolia togrog|mongolia togrogs"], ["Mozambican metical", "mozambican metical|mt|mzn|mozambica metical|mozambica meticals|mozambican meticals"], ["Burmese kyat", "Burmese kyat|ks|mmk"], ["Pya", "pya"], ["Nicaraguan córdoba", "nicaraguan córdoba|nio"], ["Nigerian naira", "nigerian naira|naira|ngn|₦|nigeria naira|nigeria nairas|nigerian nairas"], ["Kobo", "kobo"], ["Turkish lira", "turkish lira|try|tl|turkey lira|turkey liras|turkish liras"], ["Kuruş", "kuruş"], ["Omani rial", "omani rial|omr|ر.ع."], ["Panamanian balboa", "panamanian balboa|b/.|pab"], ["Centesimo", "centesimo|céntimo"], ["Papua New Guinean kina", "papua new guinean kina|kina|pgk"], ["Toea", "toea"], ["Paraguayan guaraní", "paraguayan guaraní|₲|pyg"], ["Peruvian sol", "peruvian sol|soles|sol|peruvian nuevo sol"], ["Polish złoty", "złoty|polish złoty|zł|pln|zloty|polish zloty|poland zloty|poland złoty"], ["Grosz", "groszy|grosz|grosze"], ["Qatari riyal", "qatari riyal|qar|qatari riyals|qatar riyal|qatar riyals"], ["Saudi riyal", "saudi riyal|sar|saudi riyals"], ["Riyal", "riyal|riyals|rial|﷼"], ["Dirham", "dirham|dirhem|dirhm"], ["Halala", "halalas|halala"], ["Samoan tālā", "samoan tālā|tālā|tala|ws$|samoa|wst|samoan tala"], ["Sene", "sene"], ["São Tomé and Príncipe dobra", "são tomé and príncipe dobra|dobras|dobra|std"], ["Sierra Leonean leone", "sierra Leonean leone|sll|leone|le"], ["Peseta", "pesetas|peseta"], ["Netherlands guilder", "florin|netherlands antillean guilder|ang|ƒ|nederlandse gulden|guilders|guilder|gulden|-guilders|-guilder|dutch guilders|dutch guilder|fl"], ["Swazi lilangeni", "swazi lilangeni|lilangeni|szl|emalangeni"], ["Tajikistani somoni", "tajikistani somoni|tjs|somoni"], ["Diram", "dirams|diram"], ["Thai baht", "thai baht|฿|thb|baht"], ["Satang", "satang|satangs"], ["Tongan paʻanga", "tongan paʻanga|paʻanga|tongan pa'anga|pa'anga"], ["Seniti", "seniti"], ["Ukrainian hryvnia", "ukrainian hryvnia|hyrvnia|uah|₴|ukrain hryvnia|ukrain hryvnias|ukrainian hryvnias"], ["Vanuatu vatu", "vanuatu vatu|vatu|vuv"], ["Venezuelan bolívar", "venezuelan bolívar|venezuelan bolívars|bs.f.|vef|bolívar fuerte|venezuelan bolivar|venezuelan bolivars|venezuela bolivar|venezuela bolivarsvenezuelan bolivar|venezuelan bolivars"], ["Vietnamese dong", "vietnamese dong|vnd|đồng|vietnam dong|vietnamese dongs|vietnam dongs"], ["Zambian kwacha", "zambian kwacha|zk|zmw|zambia kwacha|kwachas|zambian kwachas"], ["Moroccan dirham", "moroccan dirham|mad|د.م."], ["United Arab Emirates dirham", "united arab emirates dirham|د.إ|aed"], ["Azerbaijani manat", "azerbaijani manat|azn"], ["Turkmenistan manat", "turkmenistan manat|turkmenistan new manat|tmt"], ["Manat", "manats|manat"], ["Qəpik", "qəpik"], ["Somali shilling", "somali shillings|somali shilling|shilin soomaali|-shilin soomaali|scellino|shilin|sh.so.|sos"], ["Somaliland shilling", "somaliland shillings|somaliland shilling|soomaaliland shilin"], ["Tanzanian shilling", "tanzanian shilling|tanzanian shillings|tsh|tzs|tanzania shilling|tanzania shillings"], ["Ugandan shilling", "ugandan shilling|ugandan shillings|sh|ugx|uganda shilling|uganda shillings"], ["Romanian leu", "romanian leu|lei|ron|romania leu"], ["Moldovan leu", "moldovan leu|mdl|moldova leu"], ["Leu", "leu"], ["Ban", "bani|-ban|ban"], ["Nepalese rupee", "nepalese rupee|npr"], ["Pakistani rupee", "pakistani rupee|pkr"], ["Indian rupee", "indian rupee|inr|₹|india rupee"], ["Seychellois rupee", "seychellois rupee|scr|sr|sre"], ["Mauritian rupee", "mauritian rupee|mur"], ["Maldivian rufiyaa", "maldivian rufiyaa|rf|mvr|.ރ|maldive rufiyaa"], ["Sri Lankan rupee", "sri Lankan rupee|lkr|රු|ரூ"], ["Indonesian rupiah", "Indonesian rupiah|rupiah|perak|rp|idr"], ["Rupee", "rupee|rs"], ["Danish krone", "danish krone|dkk|denmark krone|denmark krones|danish krones"], ["Norwegian krone", "norwegian krone|nok|norway krone|norway krones|norwegian krones"], ["Faroese króna", "faroese króna|faroese krona"], ["Icelandic króna", "icelandic króna|isk|icelandic krona|iceland króna|iceland krona"], ["Swedish krona", "swedish krona|sek|swedan krona"], ["Krone", "kronor|krona|króna|krone|krones|kr|-kr"], ["Øre", "Øre|oyra|eyrir"], ["West African CFA franc", "west african cfa franc|xof|west africa cfa franc|west africa franc|west african franc"], ["Central African CFA franc", "central african cfa franc|xaf|central africa cfa franc|central african franc|central africa franc"], ["Comorian franc", "comorian franc|kmf"], ["Congolese franc", "congolese franc|cdf"], ["Burundian franc", "burundian franc|bif"], ["Djiboutian franc", "djiboutian franc|djf"], ["CFP franc", "cfp franc|xpf"], ["Guinean franc", "guinean franc|gnf"], ["Swiss franc", "swiss francs|swiss franc|chf|sfr."], ["Rwandan franc", "Rwandan franc|rwf|rf|r₣|frw"], ["Belgian franc", "belgian franc|bi.|b.fr.|bef|belgium franc"], ["Rappen", "rappen|-rappen"], ["Franc", "francs|franc|fr.|fs"], ["Centime", "centimes|centime|santim"], ["Russian ruble", "russian ruble|₽|rub|russia ruble|russia ₽|russian ₽|russian rubles|russia rubles"], ["New Belarusian ruble", "new belarusian ruble|byn|new belarus ruble|new belarus rubles|new belarusian rubles"], ["Old Belarusian ruble", "old belarusian ruble|byr|old belarus ruble|old belarus rubles|old belarusian rubles"], ["Transnistrian ruble", "transnistrian ruble|prb|р."], ["Belarusian ruble", "belarusian ruble|belarus ruble|belarus rubles|belarusian rubles"], ["Kopek", "kopek|kopeks"], ["Kapyeyka", "kapyeyka"], ["Ruble", "rubles|ruble|br"], ["Algerian dinar", "algerian dinar|د.ج|dzd|algerian dinars|algeria dinar|algeria dinars"], ["Bahraini dinar", "bahraini dinars|bahraini dinar|bhd|.د.ب"], ["Santeem", "santeem|santeems"], ["Iraqi dinar", "iraqi dinars|iraqi dinar|iraq dinars|iraq dinar|iqd|ع.د"], ["Jordanian dinar", "jordanian dinars|jordanian dinar|د.ا|jod|jordan dinar|jordan dinars"], ["Kuwaiti dinar", "kuwaiti dinars|kuwaiti dinar|kwd|د.ك"], ["Libyan dinar", "libyan dinars|libyan dinar|libya dinars|libya dinar|lyd"], ["Serbian dinar", "serbian dinars|serbian dinar|din.|rsd|дин.|serbia dinars|serbia dinar"], ["Tunisian dinar", "tunisian dinars|tunisian dinar|tnd|tunisia dinars|tunisia dinar"], ["Yugoslav dinar", "yugoslav dinars|yugoslav dinar|yun"], ["Dinar", "dinars|dinar|denar|-dinars|-dinar"], ["Fils", "fils|fulūs|-fils|-fil"], ["Para", "para|napa"], ["Millime", "millimes|millime"], ["Argentine peso", "argentine peso|ars|argetina peso|argetina pesos|argentine pesos"], ["Chilean peso", "chilean pesos|chilean peso|clp|chile peso|chile peso"], ["Colombian peso", "colombian pesos|colombian peso|cop|colombia peso|colombia pesos"], ["Cuban convertible peso", "cuban convertible pesos|cuban convertible peso|cuc|cuba convertible pesos|cuba convertible peso"], ["Cuban peso", "cuban pesos|cuban peso|cup|cuba pesos|cuba peso"], ["Dominican peso", "dominican pesos|dominican peso|dop|dominica pesos|dominica peso"], ["Mexican peso", "mexican pesos|mexican peso|mxn|mexico pesos|mexico peso"], ["Philippine peso", "piso|philippine pesos|philippine peso|₱|php"], ["Uruguayan peso", "uruguayan pesos|uruguayan peso|uyu"], ["Peso", "pesos|peso"], ["Centavo", "centavos|centavo"], ["Alderney pound", "alderney pounds|alderney pound|alderney £"], ["British pound", "british pounds|british pound|british £|gbp|pound sterling|pound sterlings|sterling|pound scot|pound scots"], ["Guernsey pound", "guernsey pounds|guernsey £|ggp"], ["Ascension pound", "ascension pounds|ascension pound|ascension £"], ["Saint Helena pound", "saint helena pounds|saint helena pound|saint helena £|shp"], ["Egyptian pound", "egyptian pounds|egyptian pound|egyptian £|egp|ج.م|egypt pounds|egypt pound"], ["Falkland Islands pound", "falkland islands pounds|falkland islands pound|falkland islands £|fkp|falkland island pounds|falkland island pound|falkland island £"], ["Gibraltar pound", "gibraltar pounds|gibraltar pound|gibraltar £|gip"], ["Manx pound", "manx pounds|manx pound|manx £|imp"], ["Jersey pound", "jersey pounds|jersey pound|jersey £|jep"], ["Lebanese pound", "lebanese pounds|lebanese pound|lebanese £|lebanan pounds|lebanan pound|lebanan £|lbp|ل.ل"], ["South Georgia and the South Sandwich Islands pound", "south georgia and the south sandwich islands pounds|south georgia and the south sandwich islands pound|south georgia and the south sandwich islands £"], ["South Sudanese pound", "south sudanese pounds|south sudanese pound|south sudanese £|ssp|south sudan pounds|south sudan pound|south sudan £"], ["Sudanese pound", "sudanese pounds|sudanese pound|sudanese £|ج.س.|sdg|sudan pounds|sudan pound|sudan £"], ["Syrian pound", "syrian pounds|syrian pound|syrian £|ل.س|syp|syria pounds|syria pound|syria £"], ["Tristan da Cunha pound", "tristan da cunha pounds|tristan da cunha pound|tristan da cunha £"], ["Pound", "pounds|pound|-pounds|-pound|£"], ["Pence", "pence"], ["Shilling", "shillings|shilling|shilingi"], ["Penny", "pennies|penny"], ["United States dollar", "united states dollars|united states dollar|united states $|u.s. dollars|u.s. dollar|u s dollar|u s dollars|usd|american dollars|american dollar|us$|us dollar|us dollars|u.s dollar|u.s dollars"], ["East Caribbean dollar", "east caribbean dollars|east caribbean dollar|east Caribbean $|xcd"], ["Australian dollar", "australian dollars|australian dollar|australian $|australian$|aud|australia dollars|australia dollar|australia $|australia$"], ["Bahamian dollar", "bahamian dollars|bahamian dollar|bahamian $|bahamian$|bsd|bahamia dollars|bahamia dollar|bahamia $|bahamia$"], ["Barbadian dollar", "barbadian dollars|barbadian dollar|barbadian $|bbd"], ["Belize dollar", "belize dollars|belize dollar|belize $|bzd"], ["Bermudian dollar", "bermudian dollars|bermudian dollar|bermudian $|bmd|bermudia dollars|bermudia dollar|bermudia $"], ["British Virgin Islands dollar", "british virgin islands dollars|british virgin islands dollar|british virgin islands $|bvi$|virgin islands dollars|virgin islands dolalr|virgin islands $|virgin island dollars|virgin island dollar|virgin island $"], ["Brunei dollar", "brunei dollar|brunei $|bnd"], ["Sen", "sen"], ["Singapore dollar", "singapore dollars|singapore dollar|singapore $|s$|sgd"], ["Canadian dollar", "canadian dollars|canadian dollar|canadian $|cad|can$|c$|canada dollars|canada dolllar|canada $"], ["Cayman Islands dollar", "cayman islands dollars|cayman islands dollar|cayman islands $|kyd|ci$|cayman island dollar|cayman island doolars|cayman island $"], ["New Zealand dollar", "new zealand dollars|new zealand dollar|new zealand $|nz$|nzd|kiwi"], ["Cook Islands dollar", "cook islands dollars|cook islands dollar|cook islands $|cook island dollars|cook island dollar|cook island $"], ["Fijian dollar", "fijian dollars|fijian dollar|fijian $|fjd|fiji dollars|fiji dollar|fiji $"], ["Guyanese dollar", "guyanese dollars|guyanese dollar|gyd|gy$"], ["Hong Kong dollar", "hong kong dollars|hong kong dollar|hong kong $|hk$|hkd|hk dollars|hk dollar|hk $|hongkong$"], ["Jamaican dollar", "jamaican dollars|jamaican dollar|jamaican $|j$|jamaica dollars|jamaica dollar|jamaica $|jmd"], ["Kiribati dollar", "kiribati dollars|kiribati dollar|kiribati $"], ["Liberian dollar", "liberian dollars|liberian dollar|liberian $|liberia dollars|liberia dollar|liberia $|lrd"], ["Micronesian dollar", "micronesian dollars|micronesian dollar|micronesian $"], ["Namibian dollar", "namibian dollars|namibian dollar|namibian $|nad|n$|namibia dollars|namibia dollar|namibia $"], ["Nauruan dollar", "nauruan dollars|nauruan dollar|nauruan $"], ["Niue dollar", "niue dollars|niue dollar|niue $"], ["Palauan dollar", "palauan dollars|palauan dollar|palauan $"], ["Pitcairn Islands dollar", "pitcairn islands dollars|pitcairn islands dollar|pitcairn islands $|pitcairn island dollars|pitcairn island dollar|pitcairn island $"], ["Solomon Islands dollar", "solomon islands dollars|solomon islands dollar|solomon islands $|si$|sbd|solomon island dollars|solomon island dollar|solomon island $"], ["Surinamese dollar", "surinamese dollars|surinamese dollar|surinamese $|srd"], ["New Taiwan dollar", "new taiwan dollars|new taiwan dollar|nt$|twd|ntd"], ["Trinidad and Tobago dollar", "trinidad and tobago dollars|trinidad and tobago dollar|trinidad and tobago $|trinidad $|trinidad dollar|trinidad dollars|trinidadian dollar|trinidadian dollars|trinidadian $|ttd"], ["Tuvaluan dollar", "tuvaluan dollars|tuvaluan dollar|tuvaluan $"], ["Dollar", "dollars|dollar|$"], ["Chinese yuan", "yuan|kuai|chinese yuan|renminbi|cny|rmb|￥|元"], ["Fen", "fen"], ["Jiao", "jiao|mao"], ["Finnish markka", "suomen markka|finnish markka|finsk mark|fim|markkaa|markka"], ["Penni", "penniä|penni"]]);
    EnglishNumericWithUnit.CurrencyNameToIsoCodeMap = new Map([["Afghan afghani", "AFN"], ["Euro", "EUR"], ["Albanian lek", "ALL"], ["Angolan kwanza", "AOA"], ["Armenian dram", "AMD"], ["Aruban florin", "AWG"], ["Bangladeshi taka", "BDT"], ["Bhutanese ngultrum", "BTN"], ["Bolivian boliviano", "BOB"], ["Bosnia and Herzegovina convertible mark", "BAM"], ["Botswana pula", "BWP"], ["Brazilian real", "BRL"], ["Bulgarian lev", "BGN"], ["Cambodian riel", "KHR"], ["Cape Verdean escudo", "CVE"], ["Costa Rican colón", "CRC"], ["Croatian kuna", "HRK"], ["Czech koruna", "CZK"], ["Eritrean nakfa", "ERN"], ["Ethiopian birr", "ETB"], ["Gambian dalasi", "GMD"], ["Georgian lari", "GEL"], ["Ghanaian cedi", "GHS"], ["Guatemalan quetzal", "GTQ"], ["Haitian gourde", "HTG"], ["Honduran lempira", "HNL"], ["Hungarian forint", "HUF"], ["Iranian rial", "IRR"], ["Yemeni rial", "YER"], ["Israeli new shekel", "ILS"], ["Japanese yen", "JPY"], ["Kazakhstani tenge", "KZT"], ["Kenyan shilling", "KES"], ["North Korean won", "KPW"], ["South Korean won", "KRW"], ["Kyrgyzstani som", "KGS"], ["Lao kip", "LAK"], ["Lesotho loti", "LSL"], ["South African rand", "ZAR"], ["Macanese pataca", "MOP"], ["Macedonian denar", "MKD"], ["Malagasy ariary", "MGA"], ["Malawian kwacha", "MWK"], ["Malaysian ringgit", "MYR"], ["Mauritanian ouguiya", "MRO"], ["Mongolian tögrög", "MNT"], ["Mozambican metical", "MZN"], ["Burmese kyat", "MMK"], ["Nicaraguan córdoba", "NIO"], ["Nigerian naira", "NGN"], ["Turkish lira", "TRY"], ["Omani rial", "OMR"], ["Panamanian balboa", "PAB"], ["Papua New Guinean kina", "PGK"], ["Paraguayan guaraní", "PYG"], ["Peruvian sol", "PEN"], ["Polish złoty", "PLN"], ["Qatari riyal", "QAR"], ["Saudi riyal", "SAR"], ["Samoan tālā", "WST"], ["São Tomé and Príncipe dobra", "STD"], ["Sierra Leonean leone", "SLL"], ["Swazi lilangeni", "SZL"], ["Tajikistani somoni", "TJS"], ["Thai baht", "THB"], ["Ukrainian hryvnia", "UAH"], ["Vanuatu vatu", "VUV"], ["Venezuelan bolívar", "VEF"], ["Zambian kwacha", "ZMW"], ["Moroccan dirham", "MAD"], ["United Arab Emirates dirham", "AED"], ["Azerbaijani manat", "AZN"], ["Turkmenistan manat", "TMT"], ["Somali shilling", "SOS"], ["Tanzanian shilling", "TZS"], ["Ugandan shilling", "UGX"], ["Romanian leu", "RON"], ["Moldovan leu", "MDL"], ["Nepalese rupee", "NPR"], ["Pakistani rupee", "PKR"], ["Indian rupee", "INR"], ["Seychellois rupee", "SCR"], ["Mauritian rupee", "MUR"], ["Maldivian rufiyaa", "MVR"], ["Sri Lankan rupee", "LKR"], ["Indonesian rupiah", "IDR"], ["Danish krone", "DKK"], ["Norwegian krone", "NOK"], ["Icelandic króna", "ISK"], ["Swedish krona", "SEK"], ["West African CFA franc", "XOF"], ["Central African CFA franc", "XAF"], ["Comorian franc", "KMF"], ["Congolese franc", "CDF"], ["Burundian franc", "BIF"], ["Djiboutian franc", "DJF"], ["CFP franc", "XPF"], ["Guinean franc", "GNF"], ["Swiss franc", "CHF"], ["Rwandan franc", "RWF"], ["Russian ruble", "RUB"], ["Transnistrian ruble", "PRB"], ["Belarusian ruble", "BYN"], ["Algerian dinar", "DZD"], ["Bahraini dinar", "BHD"], ["Iraqi dinar", "IQD"], ["Jordanian dinar", "JOD"], ["Kuwaiti dinar", "KWD"], ["Libyan dinar", "LYD"], ["Serbian dinar", "RSD"], ["Tunisian dinar", "TND"], ["Argentine peso", "ARS"], ["Chilean peso", "CLP"], ["Colombian peso", "COP"], ["Cuban convertible peso", "CUC"], ["Cuban peso", "CUP"], ["Dominican peso", "DOP"], ["Mexican peso", "MXN"], ["Uruguayan peso", "UYU"], ["British pound", "GBP"], ["Saint Helena pound", "SHP"], ["Egyptian pound", "EGP"], ["Falkland Islands pound", "FKP"], ["Gibraltar pound", "GIP"], ["Manx pound", "IMP"], ["Jersey pound", "JEP"], ["Lebanese pound", "LBP"], ["South Sudanese pound", "SSP"], ["Sudanese pound", "SDG"], ["Syrian pound", "SYP"], ["United States dollar", "USD"], ["Australian dollar", "AUD"], ["Bahamian dollar", "BSD"], ["Barbadian dollar", "BBD"], ["Belize dollar", "BZD"], ["Bermudian dollar", "BMD"], ["Brunei dollar", "BND"], ["Singapore dollar", "SGD"], ["Canadian dollar", "CAD"], ["Cayman Islands dollar", "KYD"], ["New Zealand dollar", "NZD"], ["Fijian dollar", "FJD"], ["Guyanese dollar", "GYD"], ["Hong Kong dollar", "HKD"], ["Jamaican dollar", "JMD"], ["Liberian dollar", "LRD"], ["Namibian dollar", "NAD"], ["Solomon Islands dollar", "SBD"], ["Surinamese dollar", "SRD"], ["New Taiwan dollar", "TWD"], ["Trinidad and Tobago dollar", "TTD"], ["Tuvaluan dollar", "TVD"], ["Chinese yuan", "CNY"], ["Rial", "__RI"], ["Shiling", "__S"], ["Som", "__SO"], ["Dirham", "__DR"], ["Dinar", "_DN"], ["Dollar", "__D"], ["Manat", "__MA"], ["Rupee", "__R"], ["Krone", "__K"], ["Krona", "__K"], ["Crown", "__K"], ["Frank", "__F"], ["Mark", "__M"], ["Ruble", "__RB"], ["Peso", "__PE"], ["Pound", "__P"], ["Tristan da Cunha pound", "_TP"], ["South Georgia and the South Sandwich Islands pound", "_SP"], ["Somaliland shilling", "_SS"], ["Pitcairn Islands dollar", "_PND"], ["Palauan dollar", "_PD"], ["Niue dollar", "_NID"], ["Nauruan dollar", "_ND"], ["Micronesian dollar", "_MD"], ["Kiribati dollar", "_KID"], ["Guernsey pound", "_GGP"], ["Faroese króna", "_FOK"], ["Cook Islands dollar", "_CKD"], ["British Virgin Islands dollar", "_BD"], ["Ascension pound", "_AP"], ["Alderney pound", "_ALP"], ["Abkhazian apsar", "_AA"]]);
    EnglishNumericWithUnit.FractionalUnitNameToCodeMap = new Map([["Jiao", "JIAO"], ["Kopek", "KOPEK"], ["Pul", "PUL"], ["Cent", "CENT"], ["Qindarkë", "QINDARKE"], ["Penny", "PENNY"], ["Santeem", "SANTEEM"], ["Cêntimo", "CENTIMO"], ["Centavo", "CENTAVO"], ["Luma", "LUMA"], ["Qəpik", "QƏPIK"], ["Fils", "FILS"], ["Poisha", "POISHA"], ["Kapyeyka", "KAPYEYKA"], ["Centime", "CENTIME"], ["Chetrum", "CHETRUM"], ["Paisa", "PAISA"], ["Fening", "FENING"], ["Thebe", "THEBE"], ["Sen", "SEN"], ["Stotinka", "STOTINKA"], ["Fen", "FEN"], ["Céntimo", "CENTIMO"], ["Lipa", "LIPA"], ["Haléř", "HALER"], ["Øre", "ØRE"], ["Piastre", "PIASTRE"], ["Santim", "SANTIM"], ["Oyra", "OYRA"], ["Butut", "BUTUT"], ["Tetri", "TETRI"], ["Pesewa", "PESEWA"], ["Fillér", "FILLER"], ["Eyrir", "EYRIR"], ["Dinar", "DINAR"], ["Agora", "AGORA"], ["Tïın", "TIIN"], ["Chon", "CHON"], ["Jeon", "JEON"], ["Tyiyn", "TYIYN"], ["Att", "ATT"], ["Sente", "SENTE"], ["Dirham", "DIRHAM"], ["Rappen", "RAPPEN"], ["Avo", "AVO"], ["Deni", "DENI"], ["Iraimbilanja", "IRAIMBILANJA"], ["Tambala", "TAMBALA"], ["Laari", "LAARI"], ["Khoums", "KHOUMS"], ["Ban", "BAN"], ["Möngö", "MONGO"], ["Pya", "PYA"], ["Kobo", "KOBO"], ["Kuruş", "KURUS"], ["Baisa", "BAISA"], ["Centésimo", "CENTESIMO"], ["Toea", "TOEA"], ["Sentimo", "SENTIMO"], ["Grosz", "GROSZ"], ["Sene", "SENE"], ["Halala", "HALALA"], ["Para", "PARA"], ["Öre", "ORE"], ["Diram", "DIRAM"], ["Satang", "SATANG"], ["Seniti", "SENITI"], ["Millime", "MILLIME"], ["Tennesi", "TENNESI"], ["Kopiyka", "KOPIYKA"], ["Tiyin", "TIYIN"], ["Hào", "HAO"], ["Ngwee", "NGWEE"]]);
    EnglishNumericWithUnit.CompoundUnitConnectorRegex = `(?<spacer>and)`;
    EnglishNumericWithUnit.CurrencyPrefixList = new Map([["Dollar", "$"], ["United States dollar", "united states $|us$|us $|u.s. $|u.s $"], ["East Caribbean dollar", "east caribbean $"], ["Australian dollar", "australian $|australia $"], ["Bahamian dollar", "bahamian $|bahamia $"], ["Barbadian dollar", "barbadian $|barbadin $"], ["Belize dollar", "belize $"], ["Bermudian dollar", "bermudian $"], ["British Virgin Islands dollar", "british virgin islands $|bvi$|virgin islands $|virgin island $|british virgin island $"], ["Brunei dollar", "brunei $|b$"], ["Sen", "sen"], ["Singapore dollar", "singapore $|s$"], ["Canadian dollar", "canadian $|can$|c$|c $|canada $"], ["Cayman Islands dollar", "cayman islands $|ci$|cayman island $"], ["New Zealand dollar", "new zealand $|nz$|nz $"], ["Cook Islands dollar", "cook islands $|cook island $"], ["Fijian dollar", "fijian $|fiji $"], ["Guyanese dollar", "gy$|gy $|g$|g $"], ["Hong Kong dollar", "hong kong $|hk$|hkd|hk $"], ["Jamaican dollar", "jamaican $|j$|jamaica $"], ["Kiribati dollar", "kiribati $"], ["Liberian dollar", "liberian $|liberia $"], ["Micronesian dollar", "micronesian $"], ["Namibian dollar", "namibian $|nad|n$|namibia $"], ["Nauruan dollar", "nauruan $"], ["Niue dollar", "niue $"], ["Palauan dollar", "palauan $"], ["Pitcairn Islands dollar", "pitcairn islands $|pitcairn island $"], ["Solomon Islands dollar", "solomon islands $|si$|si $|solomon island $"], ["Surinamese dollar", "surinamese $|surinam $"], ["New Taiwan dollar", "nt$|nt $"], ["Trinidad and Tobago dollar", "trinidad and tobago $|trinidad $|trinidadian $"], ["Tuvaluan dollar", "tuvaluan $"], ["Samoan tālā", "ws$"], ["Chinese yuan", "￥"], ["Japanese yen", "¥"], ["Euro", "€"], ["Pound", "£"], ["Costa Rican colón", "₡"], ["Turkish lira", "₺"]]);
    EnglishNumericWithUnit.AmbiguousCurrencyUnitList = ['din.', 'kiwi', 'kina', 'kobo', 'lari', 'lipa', 'napa', 'para', 'sfr.', 'taka', 'tala', 'toea', 'vatu', 'yuan', 'ang', 'ban', 'bob', 'btn', 'byr', 'cad', 'cop', 'cup', 'dop', 'gip', 'jod', 'kgs', 'lak', 'lei', 'mga', 'mop', 'nad', 'omr', 'pul', 'sar', 'sbd', 'scr', 'sdg', 'sek', 'sen', 'sol', 'sos', 'std', 'try', 'yer', 'yen'];
    EnglishNumericWithUnit.InformationSuffixList = new Map([["Bit", "-bit|bit|bits"], ["Kilobit", "kilobit|kilobits|kb|Kb|kbit"], ["Megabit", "megabit|megabits|mb|Mb|mbit"], ["Gigabit", "gigabit|gigabits|gb|Gb|gbit"], ["Terabit", "terabit|terabits|tb|Tb|tbit"], ["Petabit", "petabit|petabits|pb|Pb|pbit"], ["Byte", "-byte|byte|bytes"], ["Kilobyte", "-kilobyte|-kilobytes|kilobyte|kB|KB|kilobytes|kilo byte|kilo bytes|kbyte"], ["Megabyte", "-megabyte|-megabytes|megabyte|mB|MB|megabytes|mega byte|mega bytes|mbyte"], ["Gigabyte", "-gigabyte|-gigabytes|gigabyte|gB|GB|gigabytes|giga byte|giga bytes|gbyte"], ["Terabyte", "-terabyte|-terabytes|terabyte|tB|TB|terabytes|tera byte|tera bytes|tbyte"], ["Petabyte", "-petabyte|-petabytes|petabyte|pB|PB|petabytes|peta byte|peta bytes|pbyte"]]);
    EnglishNumericWithUnit.AmbiguousDimensionUnitList = ['barrel', 'barrels', 'grain', 'pound', 'stone', 'yards', 'yard', 'cord', 'dram', 'feet', 'foot', 'gill', 'knot', 'peck', 'cup', 'fps', 'pts', 'in', 'dm', '\"'];
    EnglishNumericWithUnit.BuildPrefix = `(?<=(\\s|^))`;
    EnglishNumericWithUnit.BuildSuffix = `(?=(\\s|\\W|$))`;
    EnglishNumericWithUnit.LengthSuffixList = new Map([["Kilometer", "km|kilometer|kilometre|kilometers|kilometres|kilo meter|kilo meters|kilo metres|kilo metre"], ["Hectometer", "hm|hectometer|hectometre|hectometers|hectometres|hecto meter|hecto meters|hecto metres|hecto metre"], ["Decameter", "dam|decameter|decametre|decameters|decametres|deca meter|deca meters|deca metres|deca metre"], ["Meter", "m|meter|metre|meters|metres"], ["Decimeter", "dm|decimeter|decimeters|decimetre|decimetres|deci meter|deci meters|deci metres|deci metre"], ["Centimeter", "cm|centimeter|centimeters|centimetre|centimetres|centi meter|centi meters|centi metres|centi metre"], ["Millimeter", "mm|millimeter|millimeters|millimetre|millimetres|milli meter|milli meters|milli metres|milli metre"], ["Micrometer", "μm|micrometer|micrometre|micrometers|micrometres|micro meter|micro meters|micro metres|micro metre"], ["Nanometer", "nm|nanometer|nanometre|nanometers|nanometres|nano meter|nano meters|nano metres|nano metre"], ["Picometer", "pm|picometer|picometre|picometers|picometres|pico meter|pico meters|pico metres|pico metre"], ["Mile", "-mile|mile|miles"], ["Yard", "yard|yards"], ["Inch", "-inch|inch|inches|in|\""], ["Foot", "-foot|foot|feet|ft"], ["Light year", "light year|light-year|light years|light-years"], ["Pt", "pt|pts"]]);
    EnglishNumericWithUnit.AmbiguousLengthUnitList = ['m', 'yard', 'yards', 'pm', 'pt', 'pts'];
    EnglishNumericWithUnit.SpeedSuffixList = new Map([["Meter per second", "meters / second|m/s|meters per second|metres per second|meter per second|metre per second"], ["Kilometer per hour", "km/h|kilometres per hour|kilometers per hour|kilometer per hour|kilometre per hour"], ["Kilometer per minute", "km/min|kilometers per minute|kilometres per minute|kilometer per minute|kilometre per minute"], ["Kilometer per second", "km/s|kilometers per second|kilometres per second|kilometer per second|kilometre per second"], ["Mile per hour", "mph|mile per hour|miles per hour|mi/h|mile / hour|miles / hour|miles an hour"], ["Knot", "kt|knot|kn"], ["Foot per second", "ft/s|foot/s|foot per second|feet per second|fps"], ["Foot per minute", "ft/min|foot/min|foot per minute|feet per minute"], ["Yard per minute", "yards per minute|yard per minute|yards / minute|yards/min|yard/min"], ["Yard per second", "yards per second|yard per second|yards / second|yards/s|yard/s"]]);
    EnglishNumericWithUnit.TemperatureSuffixList = new Map([["F", "degrees fahrenheit|degree fahrenheit|deg fahrenheit|degs fahrenheit|fahrenheit|°f|degrees farenheit|degree farenheit|deg farenheit|degs farenheit|degrees f|degree f|deg f|degs f|farenheit|f"], ["K", "k|kelvin"], ["R", "rankine|°r"], ["D", "delisle|°de"], ["C", "degrees celsius|degree celsius|deg celsius|degs celsius|celsius|degrees celcius|degree celcius|celcius|deg celcius|degs celcius|degrees centigrade|degree centigrade|centigrade|degrees centigrate|degree centigrate|degs centigrate|deg centigrate|centigrate|degrees c|degree c|deg c|degs c|°c|c"], ["Degree", "degree|degrees|deg.|deg|°"]]);
    EnglishNumericWithUnit.AmbiguousTemperatureUnitList = ['c', 'f', 'k'];
    EnglishNumericWithUnit.VolumeSuffixList = new Map([["Cubic meter", "m3|cubic meter|cubic meters|cubic metre|cubic metres"], ["Cubic centimeter", "cubic centimeter|cubic centimetre|cubic centimeters|cubic centimetres"], ["Cubic millimiter", "cubic millimiter|cubic millimitre|cubic millimiters|cubic millimitres"], ["Hectoliter", "hectoliter|hectolitre|hectoliters|hectolitres"], ["Decaliter", "decaliter|decalitre|dekaliter|dekalitre|decaliters|decalitres|dekaliters|dekalitres"], ["Liter", "l|litre|liter|liters|litres"], ["Deciliter", "dl|deciliter|decilitre|deciliters|decilitres"], ["Centiliter", "cl|centiliter|centilitre|centiliters|centilitres"], ["Milliliter", "ml|mls|millilitre|milliliter|millilitres|milliliters"], ["Cubic yard", "cubic yard|cubic yards"], ["Cubic inch", "cubic inch|cubic inches"], ["Cubic foot", "cubic foot|cubic feet"], ["Cubic mile", "cubic mile|cubic miles"], ["Fluid ounce", "fl oz|fluid ounce|fluid ounces"], ["Teaspoon", "teaspoon|teaspoons"], ["Tablespoon", "tablespoon|tablespoons"], ["Pint", "pint|pints"], ["Volume unit", "fluid dram|gill|quart|minim|barrel|cord|peck|bushel|hogshead"]]);
    EnglishNumericWithUnit.AmbiguousVolumeUnitList = ['l', 'ounce', 'oz', 'cup', 'peck', 'cord', 'gill'];
    EnglishNumericWithUnit.WeightSuffixList = new Map([["Kilogram", "kg|kilogram|kilograms|kilo|kilos"], ["Gram", "g|gram|grams"], ["Milligram", "mg|milligram|milligrams"], ["Barrel", "barrels|barrel"], ["Gallon", "-gallon|gallons|gallon"], ["Metric ton", "metric tons|metric ton"], ["Ton", "-ton|ton|tons|tonne|tonnes"], ["Pound", "pound|pounds|lb"], ["Ounce", "-ounce|ounce|oz|ounces"], ["Weight unit", "pennyweight|grain|british long ton|US short hundredweight|stone|dram"]]);
    EnglishNumericWithUnit.AmbiguousWeightUnitList = ['g', 'oz', 'stone', 'dram'];
})(EnglishNumericWithUnit = exports.EnglishNumericWithUnit || (exports.EnglishNumericWithUnit = {}));

});

unwrapExports(englishNumericWithUnit);

var base = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class EnglishNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        this.cultureInfo = ci;
        this.unitNumExtractor = new recognizersTextNumber.EnglishNumberExtractor();
        this.buildPrefix = englishNumericWithUnit.EnglishNumericWithUnit.BuildPrefix;
        this.buildSuffix = englishNumericWithUnit.EnglishNumericWithUnit.BuildSuffix;
        this.connectorToken = '';
        this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(englishNumericWithUnit.EnglishNumericWithUnit.CompoundUnitConnectorRegex);
        this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(baseUnits.BaseUnits.PmNonUnitRegex);
    }
}
exports.EnglishNumberWithUnitExtractorConfiguration = EnglishNumberWithUnitExtractorConfiguration;
class EnglishNumberWithUnitParserConfiguration extends parsers$4.BaseNumberWithUnitParserConfiguration {
    constructor(ci) {
        super(ci);
        this.internalNumberExtractor = new recognizersTextNumber.EnglishNumberExtractor(recognizersTextNumber.NumberMode.Default);
        this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.EnglishNumberParserConfiguration());
        this.connectorToken = '';
        this.currencyNameToIsoCodeMap = englishNumericWithUnit.EnglishNumericWithUnit.CurrencyNameToIsoCodeMap;
        this.currencyFractionCodeList = englishNumericWithUnit.EnglishNumericWithUnit.FractionalUnitNameToCodeMap;
    }
}
exports.EnglishNumberWithUnitParserConfiguration = EnglishNumberWithUnitParserConfiguration;

});

unwrapExports(base);

var currency = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class EnglishCurrencyExtractorConfiguration extends base.EnglishNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_CURRENCY;
        // Reference Source: https:// en.wikipedia.org/wiki/List_of_circulating_currencies
        this.suffixList = englishNumericWithUnit.EnglishNumericWithUnit.CurrencySuffixList;
        this.prefixList = englishNumericWithUnit.EnglishNumericWithUnit.CurrencyPrefixList;
        this.ambiguousUnitList = englishNumericWithUnit.EnglishNumericWithUnit.AmbiguousCurrencyUnitList;
    }
}
exports.EnglishCurrencyExtractorConfiguration = EnglishCurrencyExtractorConfiguration;
class EnglishCurrencyParserConfiguration extends base.EnglishNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
        }
        super(ci);
        this.BindDictionary(englishNumericWithUnit.EnglishNumericWithUnit.CurrencySuffixList);
        this.BindDictionary(englishNumericWithUnit.EnglishNumericWithUnit.CurrencyPrefixList);
    }
}
exports.EnglishCurrencyParserConfiguration = EnglishCurrencyParserConfiguration;

});

unwrapExports(currency);

var temperature = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class EnglishTemperatureExtractorConfiguration extends base.EnglishNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_TEMPERATURE;
        this.suffixList = englishNumericWithUnit.EnglishNumericWithUnit.TemperatureSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = englishNumericWithUnit.EnglishNumericWithUnit.AmbiguousTemperatureUnitList;
    }
}
exports.EnglishTemperatureExtractorConfiguration = EnglishTemperatureExtractorConfiguration;
class EnglishTemperatureParserConfiguration extends base.EnglishNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
        }
        super(ci);
        this.BindDictionary(englishNumericWithUnit.EnglishNumericWithUnit.TemperatureSuffixList);
    }
}
exports.EnglishTemperatureParserConfiguration = EnglishTemperatureParserConfiguration;

});

unwrapExports(temperature);

var dimension = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




const dimensionSuffixList = new Map([
    ...englishNumericWithUnit.EnglishNumericWithUnit.InformationSuffixList,
    ...englishNumericWithUnit.EnglishNumericWithUnit.AreaSuffixList,
    ...englishNumericWithUnit.EnglishNumericWithUnit.LengthSuffixList,
    ...englishNumericWithUnit.EnglishNumericWithUnit.SpeedSuffixList,
    ...englishNumericWithUnit.EnglishNumericWithUnit.VolumeSuffixList,
    ...englishNumericWithUnit.EnglishNumericWithUnit.WeightSuffixList
]);
class EnglishDimensionExtractorConfiguration extends base.EnglishNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_DIMENSION;
        this.suffixList = dimensionSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = englishNumericWithUnit.EnglishNumericWithUnit.AmbiguousDimensionUnitList;
    }
}
exports.EnglishDimensionExtractorConfiguration = EnglishDimensionExtractorConfiguration;
class EnglishDimensionParserConfiguration extends base.EnglishNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
        }
        super(ci);
        this.BindDictionary(dimensionSuffixList);
    }
}
exports.EnglishDimensionParserConfiguration = EnglishDimensionParserConfiguration;

});

unwrapExports(dimension);

var age = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class EnglishAgeExtractorConfiguration extends base.EnglishNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_AGE;
        this.suffixList = englishNumericWithUnit.EnglishNumericWithUnit.AgeSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = new Array();
    }
}
exports.EnglishAgeExtractorConfiguration = EnglishAgeExtractorConfiguration;
class EnglishAgeParserConfiguration extends base.EnglishNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.English);
        }
        super(ci);
        this.BindDictionary(englishNumericWithUnit.EnglishNumericWithUnit.AgeSuffixList);
    }
}
exports.EnglishAgeParserConfiguration = EnglishAgeParserConfiguration;

});

unwrapExports(age);

var spanishNumericWithUnit = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var SpanishNumericWithUnit;
(function (SpanishNumericWithUnit) {
    SpanishNumericWithUnit.AgeSuffixList = new Map([["Año", "años|año"], ["Mes", "meses|mes"], ["Semana", "semanas|semana"], ["Día", "dias|días|día|dia"]]);
    SpanishNumericWithUnit.AreaSuffixList = new Map([["Kilómetro cuadrado", "kilómetro cuadrado|kilómetros cuadrados|km2|km^2|km²"], ["Hectómetro cuadrado", "hectómetro cuadrado|hectómetros cuadrados|hm2|hm^2|hm²|hectárea|hectáreas"], ["Decámetro cuadrado", "decámetro cuadrado|decámetros cuadrados|dam2|dam^2|dam²|área|áreas"], ["Metro cuadrado", "metro cuadrado|metros cuadrados|m2|m^2|m²"], ["Decímetro cuadrado", "decímetro cuadrado|decímetros cuadrados|dm2|dm^2|dm²"], ["Centímetro cuadrado", "centímetro cuadrado|centímetros cuadrados|cm2|cm^2|cm²"], ["Milímetro cuadrado", "milímetro cuadrado|milímetros cuadrados|mm2|mm^2|mm²"], ["Pulgada cuadrado", "pulgada cuadrada|pulgadas cuadradas"], ["Pie cuadrado", "pie cuadrado|pies cuadrados|pie2|pie^2|pie²|ft2|ft^2|ft²"], ["Yarda cuadrado", "yarda cuadrada|yardas cuadradas|yd2|yd^2|yd²"], ["Acre", "acre|acres"]]);
    SpanishNumericWithUnit.AreaAmbiguousValues = ['área', 'áreas'];
    SpanishNumericWithUnit.CurrencySuffixList = new Map([["Dólar", "dólar|dólares"], ["Peso", "peso|pesos"], ["Rublo", "rublo|rublos"], ["Libra", "libra|libras"], ["Florín", "florín|florines"], ["Dinar", "dinar|dinares"], ["Franco", "franco|francos"], ["Rupia", "rupia|rupias"], ["Escudo", "escudo|escudos"], ["Chelín", "chelín|chelines"], ["Lira", "lira|liras"], ["Centavo", "centavo|centavos"], ["Céntimo", "céntimo|céntimos"], ["Centésimo", "centésimo|centésimos"], ["Penique", "penique|peniques"], ["Euro", "euro|euros|€|eur"], ["Céntimo de Euro", "céntimo de euro|céntimos de euros"], ["Dólar del Caribe Oriental", "dólar del Caribe Oriental|dólares del Caribe Oriental|ec$|xcd"], ["Centavo del Caribe Oriental", "centavo del Caribe Oriental|centavos del Caribe Oriental"], ["Franco CFA de África Occidental", "franco CFA de África Occidental|francos CFA de África Occidental|fcfa|xof"], ["Céntimo de CFA de África Occidental", "céntimo de CFA de África Occidental|céntimos de CFA de África Occidental"], ["Franco CFA de África Central", "franco CFA de África Central|francos CFA de África Central|xaf"], ["Céntimo de CFA de África Central", "céntimo de CFA de África Central|céntimos de CFA de África Central"], ["Apsar", "apsar|apsares"], ["Afgani afgano", "afgani afgano|؋|afn|afganis|afgani"], ["Pul", "pul|puls"], ["Lek albanés", "lek|lekë|lekes|lek albanés"], ["Qindarka", "qindarka|qindarkë|qindarkas"], ["Kwanza angoleño", "kwanza angoleño|kwanzas angoleños|kwanza angoleños|kwanzas angoleño|kwanzas|aoa|kz"], ["Cêntimo angoleño", "cêntimo angoleño|cêntimo|cêntimos"], ["Florín antillano neerlandés", "florín antillano neerlandés|florínes antillano neerlandés|ƒ antillano neerlandés|ang|naƒ"], ["Cent antillano neerlandés", "cent|centen"], ["Riyal saudí", "riyal saudí|riyales saudí|sar"], ["Halalá saudí", "halalá saudí|hallalah"], ["Dinar argelino", "dinar argelino|dinares argelinos|dzd"], ["Céntimo argelino", "centimo argelino|centimos argelinos|"], ["Peso argentino", "peso argentino|pesos argentinos|peso|pesos|ar$|ars"], ["Centavo argentino", "centavo argentino|centavos argentinos|centavo|ctvo.|ctvos."], ["Dram armenio", "dram armenio|dram armenios|dram|դր."], ["Luma armenio", "luma armenio|luma armenios"], ["Florín arubeño", "florín arubeño|florines arubeños|ƒ arubeños|aƒ|awg"], ["Yotin arubeño", "yotin arubeño|yotines arubeños"], ["Dólar australiano", "dólar australiano|dólares australianos|a$|aud"], ["Centavo australiano", "centavo australiano|centavos australianos"], ["Manat azerí", "manat azerí|man|azn"], ["Qəpik azerí", "qəpik azerí|qəpik"], ["Dólar bahameño", "dólar bahameño|dólares bahameños|b$|bsd"], ["Centavo bahameño", "centavo bahameño|centavos bahameños"], ["Dinar bahreiní", "dinar bahreiní|dinares bahreinies|bhd"], ["Fil bahreiní", "fil bahreiní|fils bahreinies"], ["Taka bangladeshí", "taka bangladeshí|takas bangladeshí|bdt"], ["Poisha bangladeshí", "poisha bangladeshí|poishas bangladeshí"], ["Dólar de Barbados", "dólar de barbados|dólares de barbados|bbd"], ["Centavo de Barbados", "centavo de barbados|centavos de barbados"], ["Dólar beliceño", "dólar beliceño|dólares beliceños|bz$|bzd"], ["Centavo beliceño", "centavo beliceño|centavos beliceños"], ["Dólar bermudeño", "dólar bermudeño|dólares bermudeños|bd$|bmd"], ["Centavo bermudeño", "centavo bermudeño|centavos bermudeños"], ["Rublo bielorruso", "rublo bielorruso|rublos bielorrusos|br|byr"], ["Kópek bielorruso", "kópek bielorruso|kópeks bielorrusos|kap"], ["Kyat birmano", "kyat birmano|kyats birmanos|mmk"], ["Pya birmano", "pya birmano|pyas birmanos"], ["Boliviano", "boliviano|bolivianos|bob|bs"], ["Centésimo Boliviano", "centésimo boliviano|centésimos bolivianos"], ["Marco bosnioherzegovino", "marco convertible|marco bosnioherzegovino|marcos convertibles|marcos bosnioherzegovinos|bam"], ["Feningas bosnioherzegovino", "feninga convertible|feninga bosnioherzegovina|feningas convertibles"], ["Pula", "pula|bwp"], ["Thebe", "thebe"], ["Real brasileño", "real brasileño|reales brasileños|r$|brl"], ["Centavo brasileño", "centavo brasileño|centavos brasileños"], ["Dólar de Brunéi", "dólar de brunei|dólares de brunéi|bnd"], ["Sen de Brunéi", "sen|sen de brunéi"], ["Lev búlgaro", "lev búlgaro|leva búlgaros|lv|bgn"], ["Stotinki búlgaro", "stotinka búlgaro|stotinki búlgaros"], ["Franco de Burundi", "franco de burundi|francos de burundi|fbu|fib"], ["Céntimo Burundi", "céntimo burundi|céntimos burundies"], ["Ngultrum butanés", "ngultrum butanés|ngultrum butaneses|btn"], ["Chetrum  butanés", "chetrum butanés|chetrum butaneses"], ["Escudo caboverdiano", "escudo caboverdiano|escudos caboverdianos|cve"], ["Riel camboyano", "riel camboyano|rieles camboyanos|khr"], ["Dólar canadiense", "dólar canadiense|dólares canadienses|c$|cad"], ["Centavo canadiense", "centavo canadiense|centavos canadienses"], ["Peso chileno", "peso chileno|pesos chilenos|cpl"], ["Yuan chino", "yuan chino|yuanes chinos|yuan|yuanes|renminbi|rmb|cny|¥"], ["Peso colombiano", "peso colombiano|pesos colombianos|cop|col$"], ["Centavo colombiano", "centavo colombiano|centavos colombianos"], ["Franco comorano", "franco comorano|francos comoranos|kmf|₣"], ["Franco congoleño", "franco congoleño|francos congoleños|cdf"], ["Céntimo congoleño", "céntimo congoleño|céntimos congoleños"], ["Won norcoreano", "won norcoreano|wŏn norcoreano|wŏn norcoreanos|kpw"], ["Chon norcoreano", "chon norcoreano|chŏn norcoreano|chŏn norcoreanos|chon norcoreanos"], ["Won surcoreano", "wŏn surcoreano|won surcoreano|wŏnes surcoreanos|wones surcoreanos|krw"], ["Chon surcoreano", "chon surcoreano|chŏn surcoreano|chŏn surcoreanos|chon surcoreanos"], ["Colón costarricense", "colón costarricense|colones costarricenses|crc"], ["Kuna croata", "kuna croata|kuna croatas|hrk"], ["Lipa croata", "lipa croata|lipa croatas"], ["Peso cubano", "peso cubano|pesos cubanos|cup"], ["Peso cubano convertible", "peso cubano convertible|pesos cubanos convertible|cuc"], ["Corona danesa", "corona danesa|coronas danesas|dkk"], ["Libra egipcia", "libra egipcia|libras egipcias|egp|le"], ["Piastra egipcia", "piastra egipcia|piastras egipcias"], ["Colón salvadoreño", "colón salvadoreño|colones salvadoreños|svc"], ["Dirham de los Emiratos Árabes Unidos", "dirham|dirhams|dirham de los Emiratos Árabes Unidos|aed|dhs"], ["Nakfa", "nakfa|nfk|ern"], ["Céntimo de Nakfa", "céntimo de nakfa|céntimos de nakfa"], ["Peseta", "peseta|pesetas|pts.|ptas.|esp"], ["Dólar estadounidense", "dólar estadounidense|dólares estadounidenses|usd|u$d|us$"], ["Corona estonia", "corona estonia|coronas estonias|eek"], ["Senti estonia", "senti estonia|senti estonias"], ["Birr etíope", "birr etíope|birr etíopes|br|etb"], ["Santim etíope", "santim etíope|santim etíopes"], ["Peso filipino", "peso filipino|pesos filipinos|php"], ["Marco finlandés", "marco finlandés|marcos finlandeses"], ["Dólar fiyiano", "dólar fiyiano|dólares fiyianos|fj$|fjd"], ["Centavo fiyiano", "centavo fiyiano|centavos fiyianos"], ["Dalasi", "dalasi|gmd"], ["Bututs", "butut|bututs"], ["Lari georgiano", "lari georgiano|lari georgianos|gel"], ["Tetri georgiano", "tetri georgiano|tetri georgianos"], ["Cedi", "cedi|ghs|gh₵"], ["Pesewa", "pesewa"], ["Libra gibraltareña", "libra gibraltareña|libras gibraltareñas|gip"], ["Penique gibraltareña", "penique gibraltareña|peniques gibraltareñas"], ["Quetzal guatemalteco", "quetzal guatemalteco|quetzales guatemaltecos|quetzal|quetzales|gtq"], ["Centavo guatemalteco", "centavo guatemalteco|centavos guatemaltecos"], ["Libra de Guernsey", "libra de Guernsey|libras de Guernsey|ggp"], ["Penique de Guernsey", "penique de Guernsey|peniques de Guernsey"], ["Franco guineano", "franco guineano|francos guineanos|gnf|fg"], ["Céntimo guineano", "céntimo guineano|céntimos guineanos"], ["Dólar guyanés", "dólar guyanés|dólares guyaneses|gyd|gy"], ["Gourde haitiano", "gourde haitiano|gourde haitianos|htg"], ["Céntimo haitiano", "céntimo haitiano|céntimos haitianos"], ["Lempira hondureño", "lempira hondureño|lempira hondureños|hnl"], ["Centavo hondureño", "centavo hondureño|centavos hondureño"], ["Dólar de Hong Kong", "dólar de hong kong|dólares de hong kong|hk$|hkd"], ["Forinto húngaro", "forinto húngaro|forinto húngaros|huf"], ["Rupia india", "rupia india|rupias indias|inr"], ["Paisa india", "paisa india|paise indias"], ["Rupia indonesia", "rupia indonesia|rupias indonesias|idr"], ["Sen indonesia", "sen indonesia|sen indonesias"], ["Rial iraní", "rial iraní|rial iranies|irr"], ["Dinar iraquí", "dinar iraquí|dinares iraquies|iqd"], ["Fil iraquí", "fil iraquí|fils iraquies"], ["Libra manesa", "libra manesa|libras manesas|imp"], ["Penique manes", "penique manes|peniques maneses"], ["Corona islandesa", "corona islandesa|coronas islandesas|isk|íkr"], ["Aurar islandes", "aurar islandes|aurar islandeses"], ["Dólar de las Islas Caimán", "dólar de las Islas Caimán|dólares de las Islas Caimán|ci$|kyd"], ["Dólar de las Islas Cook", "dólar de las Islas Cook|dólares de las Islas Cook"], ["Corona feroesa", "corona feroesa|coronas feroesas|fkr"], ["Libra malvinense", "libra malvinense|libras malvinenses|fk£|fkp"], ["Dólar de las Islas Salomón", "dólar de las Islas Salomón|dólares de las Islas Salomón|sbd"], ["Nuevo shéquel", "nuevo shéquel|nuevos shéquel|ils"], ["Agorot", "agorot"], ["Dólar jamaiquino", "dólar jamaiquino|dólares jamaiquinos|j$|ja$|jmd"], ["Yen", "yen|yenes|jpy"], ["Libra de Jersey", "libra de Jersey|libras de Jersey|jep"], ["Dinar jordano", "dinar jordano|dinares jordanos|jd|jod"], ["Piastra jordano", "piastra jordano|piastras jordanos"], ["Tenge kazajo", "tenge|tenge kazajo|kzt"], ["Chelín keniano", "chelín keniano|chelines kenianos|ksh|kes"], ["Som kirguís", "som kirguís|kgs"], ["Tyiyn", "tyiyn"], ["Dólar de Kiribati", "dólar de Kiribati|dólares de Kiribati"], ["Dinar kuwaití", "dinar kuwaití|dinares kuwaití"], ["Kip laosiano", "kip|kip laosiano|kip laosianos|lak"], ["Att laosiano", "att|att laosiano|att laosianos"], ["Loti", "loti|maloti|lsl"], ["Sente", "sente|lisente"], ["Libra libanesa", "libra libanesa|libras libanesas|lbp"], ["Dólar liberiano", "dólar liberiano|dólares liberianos|l$|lrd"], ["Dinar libio", "dinar libio|dinares libios|ld|lyd"], ["Dirham libio", "dirham libio|dirhams libios"], ["Litas lituana", "litas lituana|litai lituanas|ltl"], ["Pataca macaense", "pataca macaense|patacas macaenses|mop$|mop"], ["Avo macaense", "avo macaense|avos macaenses"], ["Ho macaense", "ho macaense|ho macaenses"], ["Denar macedonio", "denar macedonio|denare macedonios|den|mkd"], ["Deni macedonio", "deni macedonio|deni macedonios"], ["Ariary malgache", "ariary malgache|ariary malgaches|mga"], ["Iraimbilanja malgache", "iraimbilanja malgache|iraimbilanja malgaches"], ["Ringgit malayo", "ringgit malayo|ringgit malayos|rm|myr"], ["Sen malayo", "sen malayo|sen malayos"], ["Kwacha malauí", "kwacha malauí|mk|mwk"], ["Támbala malauí", "támbala malauí"], ["Rupia de Maldivas", "rupia de Maldivas|rupias de Maldivas|mvr"], ["Dirham marroquí", "dirham marroquí|dirhams marroquies|mad"], ["Rupia de Mauricio", "rupia de Mauricio|rupias de Mauricio|mur"], ["Uguiya", "uguiya|uguiyas|mro"], ["Jum", "jum|jums"], ["Peso mexicano", "peso mexicano|pesos mexicanos|mxn"], ["Centavo mexicano", "centavo mexicano|centavos mexicanos"], ["Leu moldavo", "leu moldavo|lei moldavos|mdl"], ["Ban moldavo", "ban moldavo|bani moldavos"], ["Tugrik mongol", "tugrik mongol|tugrik|tugrik mongoles|tug|mnt"], ["Metical mozambiqueño", "metical|metical mozambiqueño|meticales|meticales mozambiqueños|mtn|mzn"], ["Dram de Nagorno Karabaj", "dram de Nagorno Karabaj|drams de Nagorno Karabaj|"], ["Luma de Nagorno Karabaj", "luma de Nagorno Karabaj"], ["Dólar namibio", "dólar namibio|dólares namibios|n$|nad"], ["Centavo namibio", "centavo namibio|centavos namibios"], ["Rupia nepalí", "rupia nepalí|rupias nepalies|npr"], ["Paisa nepalí", "paisa nepalí|paisas nepalies"], ["Córdoba nicaragüense", "córdoba nicaragüense|córdobas nicaragüenses|c$|nio"], ["Centavo nicaragüense", "centavo nicaragüense|centavos nicaragüenses"], ["Naira", "naira|ngn"], ["Kobo", "kobo"], ["Corona noruega", "corona noruega|coronas noruegas|nok"], ["Franco CFP", "franco cfp|francos cfp|xpf"], ["Dólar neozelandés", "dólar neozelandés|dólares neozelandeses|dólar de Nueva Zelanda|dólares de Nueva Zelanda|nz$|nzd"], ["Centavo neozelandés", "centavo neozelandés|centavo de Nueva Zelanda|centavos de Nueva Zelanda|centavos neozelandeses"], ["Rial omaní", "rial omaní|riales omanies|omr"], ["Baisa omaní", "baisa omaní|baisa omanies"], ["Florín neerlandés", "florín neerlandés|florines neerlandeses|nlg"], ["Rupia pakistaní", "rupia pakistaní|rupias pakistanies|pkr"], ["Paisa pakistaní", "paisa pakistaní|paisas pakistanies"], ["Balboa panameño", "balboa panameño|balboa panameños|pab"], ["Centésimo panameño", "centésimo panameño|centésimos panameños"], ["Kina", "kina|pkg|pgk"], ["Toea", "toea"], ["Guaraní", "guaraní|guaranies|gs|pyg"], ["Sol", "sol|soles|nuevo sol|pen|s#."], ["Céntimo de sol", "céntimo de sol|céntimos de sol"], ["Złoty", "złoty|esloti|eslotis|zł|pln"], ["Groszy", "groszy"], ["Riyal qatarí", "riyal qatarí|riyal qataries|qr|qar"], ["Dirham qatarí", "dirham qatarí|dirhams qataries"], ["Libra esterlina", "libra esterlina|libras esterlinas|gbp"], ["Corona checa", "corona checa|coronas checas|kc|czk"], ["Peso dominicano", "peso dominicano|pesos dominicanos|rd$|dop"], ["Centavo dominicano", "centavo dominicano|centavos dominicanos"], ["Franco ruandés", "franco ruandés|francos ruandeses|rf|rwf"], ["Céntimo ruandés", "céntimo ruandés|céntimos ruandeses"], ["Leu rumano", "leu rumano|lei rumanos|ron"], ["Ban rumano", "ban rumano|bani rumanos"], ["Rublo ruso", "rublo ruso|rublos rusos|rub"], ["Kopek ruso", "kopek ruso|kopeks rusos"], ["Tala", "tala|tālā|ws$|sat|wst"], ["Sene", "sene"], ["Libra de Santa Helena", "libra de Santa Helena|libras de Santa Helena|shp"], ["Penique de Santa Helena", "penique de Santa Helena|peniques de Santa Helena"], ["Dobra", "dobra|db|std"], ["Dinar serbio", "dinar serbio|dinares serbios|rsd"], ["Para serbio", "para serbio|para serbios"], ["Rupia de Seychelles", "rupia de Seychelles|rupias de Seychelles|scr"], ["Centavo de Seychelles", "centavo de Seychelles|centavos de Seychelles"], ["Leone", "leone|le|sll"], ["Dólar de Singapur", "dólar de singapur|dólares de singapur|sgb"], ["Centavo de Singapur", "centavo de Singapur|centavos de Singapur"], ["Libra siria", "libra siria|libras sirias|s£|syp"], ["Piastra siria", "piastra siria|piastras sirias"], ["Chelín somalí", "chelín somalí|chelines somalies|sos"], ["Centavo somalí", "centavo somalí|centavos somalies"], ["Chelín somalilandés", "chelín somalilandés|chelines somalilandeses"], ["Centavo somalilandés", "centavo somalilandés|centavos somalilandeses"], ["Rupia de Sri Lanka", "rupia de Sri Lanka|rupias de Sri Lanka|lkr"], ["Céntimo de Sri Lanka", "céntimo de Sri Lanka|céntimos de Sri Lanka"], ["Lilangeni", "lilangeni|emalangeni|szl"], ["Rand sudafricano", "rand|rand sudafricano|zar"], ["Libra sudanesa", "libra sudanesa|libras sudanesas|sdg"], ["Piastra sudanesa", "piastra sudanesa|piastras sudanesas"], ["Libra sursudanesa", "libra sursudanesa|libras sursudanesa|ssp"], ["Piastra sursudanesa", "piastra sursudanesa|piastras sursudanesas"], ["Corona sueca", "corona sueca|coronas suecas|sek"], ["Franco suizo", "franco suizo|francos suizos|sfr|chf"], ["Rappen suizo", "rappen suizo|rappens suizos"], ["Dólar surinamés", "óolar surinamés|dólares surinameses|srd"], ["Centavo surinamés", "centavo surinamés|centavos surinamés"], ["Baht tailandés", "baht tailandés|baht tailandeses|thb"], ["Satang tailandés", "satang tailandés|satang tailandeses"], ["Nuevo dólar taiwanés", "nuevo dólar taiwanés|dólar taiwanés|dólares taiwaneses|twd"], ["Centavo taiwanés", "centavo taiwanés|centavos taiwaneses"], ["Chelín tanzano", "chelín tanzano|chelines tanzanos|tzs"], ["Centavo tanzano", "centavo tanzano|centavos tanzanos"], ["Somoni tayiko", "somoni tayiko|somoni|tjs"], ["Diram", "diram|dirams"], ["Paʻanga", "dólar tongano|dólares tonganos|paʻanga|pa'anga|top"], ["Seniti", "seniti"], ["Rublo de Transnistria", "rublo de Transnistria|rublos de Transnistria"], ["Kopek de Transnistria", "kopek de Transnistria|kopeks de Transnistria"], ["Dólar trinitense", "dólar trinitense|dólares trinitenses|ttd"], ["Centavo trinitense", "centavo trinitense|centavos trinitenses"], ["Dinar tunecino", "dinar tunecino|dinares tunecinos|tnd"], ["Millime tunecino", "millime tunecino|millimes tunecinos"], ["Lira turca", "lira turca|liras turcas|try"], ["Kuruş turca", "kuruş turca|kuruş turcas"], ["Manat turkmeno", "manat turkmeno|manat turkmenos|tmt"], ["Tennesi turkmeno", "tennesi turkmeno|tenge turkmeno"], ["Dólar tuvaluano", "dólar tuvaluano|dólares tuvaluanos"], ["Centavo tuvaluano", "centavo tuvaluano|centavos tuvaluanos"], ["Grivna", "grivna|grivnas|uah"], ["Kopiyka", "kopiyka|kópeks"], ["Chelín ugandés", "chelín ugandés|chelines ugandeses|ugx"], ["Centavo ugandés", "centavo ugandés|centavos ugandeses"], ["Peso uruguayo", "peso uruguayo|pesos uruguayos|uyu"], ["Centésimo uruguayo", "centésimo uruguayo|centésimos uruguayos"], ["Som uzbeko", "som uzbeko|som uzbekos|uzs"], ["Tiyin uzbeko", "tiyin uzbeko|tiyin uzbekos"], ["Vatu", "vatu|vuv"], ["Bolívar fuerte", "bolívar fuerte|bolívar|bolívares|vef"], ["Céntimo de bolívar", "céntimo de bolívar|céntimos de bolívar"], ["Đồng vietnamita", "Đồng vietnamita|dong vietnamita|dong vietnamitas|vnd"], ["Hào vietnamita", "Hào vietnamita|hao vietnamita|hao vietnamitas"], ["Rial yemení", "rial yemení|riales yemenies|yer"], ["Fils yemení", "fils yemení|fils yemenies"], ["Franco yibutiano", "franco yibutiano|francos yibutianos|djf"], ["Dinar yugoslavo", "dinar yugoslavo|dinares yugoslavos|yud"], ["Kwacha zambiano", "kwacha zambiano|kwacha zambianos|zmw"], ["Ngwee zambiano", "ngwee zambiano|ngwee zambianos"]]);
    SpanishNumericWithUnit.CompoundUnitConnectorRegex = `(?<spacer>[^.])`;
    SpanishNumericWithUnit.CurrencyPrefixList = new Map([["Dólar", "$"], ["Dólar estadounidense", "us$|u$d|usd"], ["Dólar del Caribe Oriental", "ec$|xcd"], ["Dólar australiano", "a$|aud"], ["Dólar bahameño", "b$|bsd"], ["Dólar de Barbados", "bds$|bbd"], ["Dólar beliceño", "bz$|bzd"], ["Dólar bermudeño", "bd$|bmd"], ["Dólar de Brunéi", "brunéi $|bnd"], ["Dólar de Singapur", "s$|sgd"], ["Dólar canadiense", "c$|can$|cad"], ["Dólar de las Islas Caimán", "ci$|kyd"], ["Dólar neozelandés", "nz$|nzd"], ["Dólar fiyiano", "fj$|fjd"], ["Dólar guyanés", "gy$|gyd"], ["Dólar de Hong Kong", "hk$|hkd"], ["Dólar jamaiquino", "j$|ja$|jmd"], ["Dólar liberiano", "l$|lrd"], ["Dólar namibio", "n$|nad"], ["Dólar de las Islas Salomón", "si$|sbd"], ["Nuevo dólar taiwanés", "nt$|twd"], ["Real brasileño", "r$|brl"], ["Guaraní", "₲|gs.|pyg"], ["Dólar trinitense", "tt$|ttd"], ["Yuan chino", "￥|cny|rmb"], ["Yen", "¥|jpy"], ["Euro", "€|eur"], ["Florín", "ƒ"], ["Libra", "£|gbp"], ["Colón costarricense", "₡"], ["Lira turca", "₺"]]);
    SpanishNumericWithUnit.AmbiguousCurrencyUnitList = ['le'];
    SpanishNumericWithUnit.DimensionSuffixList = new Map([["Kilómetro", "km|kilometro|kilómetro|kilometros|kilómetros"], ["Hectómetro", "hm|hectometro|hectómetro|hectometros|hectómetros"], ["Decámetro", "decametro|decámetro|decametros|decámetros|dam"], ["Metro", "m|m.|metro|metros"], ["Decímetro", "dm|decimetro|decímetro|decimetros|decímetros"], ["Centímetro", "cm|centimetro|centímetro|centimetros|centimetros"], ["Milímetro", "mm|milimetro|milímetro|milimetros|milímetros"], ["Micrómetro", "µm|um|micrometro|micrómetro|micrometros|micrómetros|micrón|micrónes"], ["Nanómetro", "nm|nanometro|nanómetro|nanometros|nanómetros"], ["Picómetro", "pm|picometro|picómetro|picometros|picometros"], ["Milla", "mi|milla|millas"], ["Yarda", "yd|yarda|yardas"], ["Pulgada", "pulgada|pulgadas|\""], ["Pie", "pie|pies|ft"], ["Año luz", "año luz|años luz|al"], ["Metro por segundo", "metro/segundo|m/s|metro por segundo|metros por segundo|metros por segundos"], ["Kilómetro por hora", "km/h|kilómetro por hora|kilometro por hora|kilómetros por hora|kilometros por hora|kilómetro/hora|kilometro/hora|kilómetros/hora|kilometros/hora"], ["Kilómetro por minuto", "km/min|kilómetro por minuto|kilometro por minuto|kilómetros por minuto|kilometros por minuto|kilómetro/minuto|kilometro/minuto|kilómetros/minuto|kilometros/minuto"], ["Kilómetro por segundo", "km/seg|kilómetro por segundo|kilometro por segundo|kilómetros por segundo|kilometros por segundo|kilómetro/segundo|kilometro/segundo|kilómetros/segundo|kilometros/segundo"], ["Milla por hora", "mph|milla por hora|mi/h|milla/hora|millas/hora|millas por hora"], ["Nudo", "kt|nudo|nudos|kn"], ["Pie por segundo", "ft/s|pie/s|ft/seg|pie/seg|pie por segundo|pies por segundo"], ["Pie por minuto", "ft/min|pie/min|pie por minuto|pies por minuto"], ["Yarda por minuto", "yardas por minuto|yardas/minuto|yardas/min"], ["Yarda por segundo", "yardas por segundo|yardas/segundo|yardas/seg"], ["Kilómetro cuadrado", "kilómetro cuadrado|kilómetros cuadrados|km2|km^2|km²"], ["Hectómetro cuadrado", "hectómetro cuadrado|hectómetros cuadrados|hm2|hm^2|hm²|hectárea|hectáreas"], ["Decámetro cuadrado", "decámetro cuadrado|decámetros cuadrados|dam2|dam^2|dam²|área|áreas"], ["Metro cuadrado", "metro cuadrado|metros cuadrados|m2|m^2|m²"], ["Decímetro cuadrado", "decímetro cuadrado|decímetros cuadrados|dm2|dm^2|dm²"], ["Centímetro cuadrado", "centímetro cuadrado|centímetros cuadrados|cm2|cm^2|cm²"], ["Milímetro cuadrado", "milímetro cuadrado|milímetros cuadrados|mm2|mm^2|mm²"], ["Pulgada cuadrado", "pulgada cuadrada|pulgadas cuadradas"], ["Pie cuadrado", "pie cuadrado|pies cuadrados|pie2|pie^2|pie²|ft2|ft^2|ft²"], ["Yarda cuadrado", "yarda cuadrada|yardas cuadradas|yd2|yd^2|yd²"], ["Acre", "acre|acres"], ["Kilómetro cúbico", "kilómetro cúbico|kilómetros cúbico|km3|km^3|km³"], ["Hectómetro cúbico", "hectómetro cúbico|hectómetros cúbico|hm3|hm^3|hm³"], ["Decámetro cúbico", "decámetro cúbico|decámetros cúbico|dam3|dam^3|dam³"], ["Metro cúbico", "metro cúbico|metros cúbico|m3|m^3|m³"], ["Decímetro cúbico", "decímetro cúbico|decímetros cúbico|dm3|dm^3|dm³"], ["Centímetro cúbico", "centímetro cúbico|centímetros cúbico|cc|cm3|cm^3|cm³"], ["Milímetro cúbico", "milímetro cúbico|milímetros cúbico|mm3|mm^3|mm³"], ["Pulgada cúbica", "pulgada cúbics|pulgadas cúbicas"], ["Pie cúbico", "pie cúbico|pies cúbicos|pie3|pie^3|pie³|ft3|ft^3|ft³"], ["Yarda cúbica", "yarda cúbica|yardas cúbicas|yd3|yd^3|yd³"], ["Hectolitro", "hectolitro|hectolitros|hl"], ["Litro", "litro|litros|lts|l"], ["Mililitro", "mililitro|mililitros|ml"], ["Galón", "galón|galones"], ["Pinta", "pinta|pintas"], ["Barril", "barril|barriles"], ["Onza líquida", "onza líquida|onzas líquidas"], ["Tonelada métrica", "tonelada métrica|toneladas métricas"], ["Tonelada", "ton|tonelada|toneladas"], ["Kilogramo", "kg|kilogramo|kilogramos"], ["Hectogramo", "hg|hectogramo|hectogramos"], ["Decagramo", "dag|decagramo|decagramos"], ["Gramo", "g|gr|gramo|gramos"], ["Decigramo", "dg|decigramo|decigramos"], ["Centigramo", "cg|centigramo|centigramos"], ["Miligramo", "mg|miligramo|miligramos"], ["Microgramo", "µg|ug|microgramo|microgramos"], ["Nanogramo", "ng|nanogramo|nanogramos"], ["Picogramo", "pg|picogramo|picogramos"], ["Libra", "lb|libra|libras"], ["Onza", "oz|onza|onzas"], ["Grano", "grano|granos"], ["Quilate", "ct|kt|quilate|quilates"], ["bit", "bit|bits"], ["kilobit", "kilobit|kilobits|kb|kbit"], ["megabit", "megabit|megabits|Mb|Mbit"], ["gigabit", "gigabit|gigabits|Gb|Gbit"], ["terabit", "terabit|terabits|Tb|Tbit"], ["petabit", "petabit|petabits|Pb|Pbit"], ["kibibit", "kibibit|kibibits|kib|kibit"], ["mebibit", "mebibit|mebibits|Mib|Mibit"], ["gibibit", "gibibit|gibibits|Gib|Gibit"], ["tebibit", "tebibit|tebibits|Tib|Tibit"], ["pebibit", "pebibit|pebibits|Pib|Pibit"], ["byte", "byte|bytes"], ["kilobyte", "kilobyte|kilobytes|kB|kByte"], ["megabyte", "megabyte|megabytes|MB|MByte"], ["gigabyte", "gigabyte|gigabytes|GB|GByte"], ["terabyte", "terabyte|terabytes|TB|TByte"], ["petabyte", "petabyte|petabytes|PB|PByte"], ["kibibyte", "kibibyte|kibibytes|kiB|kiByte"], ["mebibyte", "mebibyte|mebibytes|MiB|MiByte"], ["gibibyte", "gibibyte|gibibytes|GiB|GiByte"], ["tebibyte", "tebibyte|tebibytes|TiB|TiByte"], ["pebibyte", "pebibyte|pebibytes|PiB|PiByte"]]);
    SpanishNumericWithUnit.AmbiguousDimensionUnitList = ['al', 'mi', 'área', 'áreas', 'pie', 'pies'];
    SpanishNumericWithUnit.LengthSuffixList = new Map([["Kilómetro", "km|kilometro|kilómetro|kilometros|kilómetros"], ["Hectómetro", "hm|hectometro|hectómetro|hectometros|hectómetros"], ["Decámetro", "decametro|decámetro|decametros|decámetros|dam"], ["Metro", "m|m.|metro|metros"], ["Decímetro", "dm|decimetro|decímetro|decimetros|decímetros"], ["Centímetro", "cm|centimetro|centímetro|centimetros|centimetros"], ["Milímetro", "mm|milimetro|milímetro|milimetros|milímetros"], ["Micrómetro", "µm|um|micrometro|micrómetro|micrometros|micrómetros|micrón|micrónes"], ["Nanómetro", "nm|nanometro|nanómetro|nanometros|nanómetros"], ["Picómetro", "pm|picometro|picómetro|picometros|picómetros"], ["Milla", "mi|milla|millas"], ["Yarda", "yd|yarda|yardas"], ["Pulgada", "pulgada|pulgadas|\""], ["Pie", "pie|pies|ft"], ["Año luz", "año luz|años luz|al"]]);
    SpanishNumericWithUnit.AmbiguousLengthUnitList = ['mi', 'área', 'áreas'];
    SpanishNumericWithUnit.BuildPrefix = `(?<=(\\s|^|\\P{L}))`;
    SpanishNumericWithUnit.BuildSuffix = `(?=(\\s|\\P{L}|$))`;
    SpanishNumericWithUnit.ConnectorToken = 'de';
    SpanishNumericWithUnit.SpeedSuffixList = new Map([["Metro por segundo", "metro/segundo|m/s|metro por segundo|metros por segundo|metros por segundos"], ["Kilómetro por hora", "km/h|kilómetro por hora|kilometro por hora|kilómetros por hora|kilometros por hora|kilómetro/hora|kilometro/hora|kilómetros/hora|kilometros/hora"], ["Kilómetro por minuto", "km/min|kilómetro por minuto|kilometro por minuto|kilómetros por minuto|kilometros por minuto|kilómetro/minuto|kilometro/minuto|kilómetros/minuto|kilometros/minuto"], ["Kilómetro por segundo", "km/seg|kilómetro por segundo|kilometro por segundo|kilómetros por segundo|kilometros por segundo|kilómetro/segundo|kilometro/segundo|kilómetros/segundo|kilometros/segundo"], ["Milla por hora", "mph|milla por hora|mi/h|milla/hora|millas/hora|millas por hora"], ["Nudo", "kt|nudo|nudos|kn"], ["Pie por segundo", "ft/s|pie/s|ft/seg|pie/seg|pie por segundo|pies por segundo"], ["Pie por minuto", "ft/min|pie/min|pie por minuto|pies por minuto"], ["Yarda por minuto", "yardas por minuto|yardas/minuto|yardas/min"], ["Yarda por segundo", "yardas por segundo|yardas/segundo|yardas/seg"]]);
    SpanishNumericWithUnit.AmbiguousSpeedUnitList = ['nudo', 'nudos'];
    SpanishNumericWithUnit.TemperatureSuffixList = new Map([["Kelvin", "k|kelvin"], ["Rankine", "r|rankine"], ["Grado Celsius", "°c|grados c|grado celsius|grados celsius|celsius|grado centígrado|grados centígrados|centígrado|centígrados"], ["Grado Fahrenheit", "°f|grados f|grado fahrenheit|grados fahrenheit|fahrenheit"], ["Grado Réaumur", "°r|°re|grados r|grado réaumur|grados réaumur|réaumur"], ["Grado Delisle", "°d|grados d|grado delisle|grados delisle|delisle"], ["Grado", "°|grados|grado"]]);
    SpanishNumericWithUnit.VolumeSuffixList = new Map([["Kilómetro cúbico", "kilómetro cúbico|kilómetros cúbico|km3|km^3|km³"], ["Hectómetro cúbico", "hectómetro cúbico|hectómetros cúbico|hm3|hm^3|hm³"], ["Decámetro cúbico", "decámetro cúbico|decámetros cúbico|dam3|dam^3|dam³"], ["Metro cúbico", "metro cúbico|metros cúbico|m3|m^3|m³"], ["Decímetro cúbico", "decímetro cúbico|decímetros cúbico|dm3|dm^3|dm³"], ["Centímetro cúbico", "centímetro cúbico|centímetros cúbico|cc|cm3|cm^3|cm³"], ["Milímetro cúbico", "milímetro cúbico|milímetros cúbico|mm3|mm^3|mm³"], ["Pulgada cúbica", "pulgada cúbica|pulgadas cúbicas"], ["Pie cúbico", "pie cúbico|pies cúbicos|pie3|pie^3|pie³|ft3|ft^3|ft³"], ["Yarda cúbica", "yarda cúbica|yardas cúbicas|yd3|yd^3|yd³"], ["Hectolitro", "hectolitro|hectolitros|hl"], ["Litro", "litro|litros|lts|l"], ["Mililitro", "mililitro|mililitros|ml"], ["Galón", "galón|galones"], ["Pinta", "pinta|pintas"], ["Barril", "barril|barriles|bbl"], ["Onza líquida", "onza líquida|onzas líquidas"]]);
    SpanishNumericWithUnit.WeightSuffixList = new Map([["Tonelada métrica", "tonelada métrica|toneladas métricas"], ["Tonelada", "ton|tonelada|toneladas"], ["Kilogramo", "kg|kilogramo|kilogramos"], ["Hectogramo", "hg|hectogramo|hectogramos"], ["Decagramo", "dag|decagramo|decagramos"], ["Gramo", "g|gr|gramo|gramos"], ["Decigramo", "dg|decigramo|decigramos"], ["Centigramo", "cg|centigramo|centigramos"], ["Miligramo", "mg|miligramo|miligramos"], ["Microgramo", "µg|ug|microgramo|microgramos"], ["Nanogramo", "ng|nanogramo|nanogramos"], ["Picogramo", "pg|picogramo|picogramos"], ["Libra", "lb|libra|libras"], ["Onza", "oz|onza|onzas"], ["Grano", "grano|granos|gr"], ["Quilate", "ct|kt|quilate|quilates"]]);
})(SpanishNumericWithUnit = exports.SpanishNumericWithUnit || (exports.SpanishNumericWithUnit = {}));

});

unwrapExports(spanishNumericWithUnit);

var base$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class SpanishNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        this.cultureInfo = ci;
        this.unitNumExtractor = new recognizersTextNumber.SpanishNumberExtractor();
        this.buildPrefix = spanishNumericWithUnit.SpanishNumericWithUnit.BuildPrefix;
        this.buildSuffix = spanishNumericWithUnit.SpanishNumericWithUnit.BuildSuffix;
        this.connectorToken = spanishNumericWithUnit.SpanishNumericWithUnit.ConnectorToken;
        this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(spanishNumericWithUnit.SpanishNumericWithUnit.CompoundUnitConnectorRegex);
        this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(baseUnits.BaseUnits.PmNonUnitRegex);
    }
}
exports.SpanishNumberWithUnitExtractorConfiguration = SpanishNumberWithUnitExtractorConfiguration;
class SpanishNumberWithUnitParserConfiguration extends parsers$4.BaseNumberWithUnitParserConfiguration {
    constructor(ci) {
        super(ci);
        this.internalNumberExtractor = new recognizersTextNumber.SpanishNumberExtractor(recognizersTextNumber.NumberMode.Default);
        this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.SpanishNumberParserConfiguration());
        this.connectorToken = spanishNumericWithUnit.SpanishNumericWithUnit.ConnectorToken;
    }
}
exports.SpanishNumberWithUnitParserConfiguration = SpanishNumberWithUnitParserConfiguration;

});

unwrapExports(base$2);

var currency$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class SpanishCurrencyExtractorConfiguration extends base$2.SpanishNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_CURRENCY;
        // Reference Source: https:// en.wikipedia.org/wiki/List_of_circulating_currencies
        this.suffixList = spanishNumericWithUnit.SpanishNumericWithUnit.CurrencySuffixList;
        this.prefixList = spanishNumericWithUnit.SpanishNumericWithUnit.CurrencyPrefixList;
        this.ambiguousUnitList = spanishNumericWithUnit.SpanishNumericWithUnit.AmbiguousCurrencyUnitList;
    }
}
exports.SpanishCurrencyExtractorConfiguration = SpanishCurrencyExtractorConfiguration;
class SpanishCurrencyParserConfiguration extends base$2.SpanishNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
        }
        super(ci);
        this.BindDictionary(spanishNumericWithUnit.SpanishNumericWithUnit.CurrencySuffixList);
        this.BindDictionary(spanishNumericWithUnit.SpanishNumericWithUnit.CurrencyPrefixList);
    }
}
exports.SpanishCurrencyParserConfiguration = SpanishCurrencyParserConfiguration;

});

unwrapExports(currency$2);

var temperature$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class SpanishTemperatureExtractorConfiguration extends base$2.SpanishNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_TEMPERATURE;
        this.suffixList = spanishNumericWithUnit.SpanishNumericWithUnit.TemperatureSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = new Array();
    }
}
exports.SpanishTemperatureExtractorConfiguration = SpanishTemperatureExtractorConfiguration;
class SpanishTemperatureParserConfiguration extends base$2.SpanishNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
        }
        super(ci);
        this.BindDictionary(spanishNumericWithUnit.SpanishNumericWithUnit.TemperatureSuffixList);
    }
}
exports.SpanishTemperatureParserConfiguration = SpanishTemperatureParserConfiguration;

});

unwrapExports(temperature$2);

var dimension$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class SpanishDimensionExtractorConfiguration extends base$2.SpanishNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_DIMENSION;
        this.suffixList = spanishNumericWithUnit.SpanishNumericWithUnit.DimensionSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = spanishNumericWithUnit.SpanishNumericWithUnit.AmbiguousDimensionUnitList;
    }
}
exports.SpanishDimensionExtractorConfiguration = SpanishDimensionExtractorConfiguration;
class SpanishDimensionParserConfiguration extends base$2.SpanishNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
        }
        super(ci);
        this.BindDictionary(spanishNumericWithUnit.SpanishNumericWithUnit.DimensionSuffixList);
    }
}
exports.SpanishDimensionParserConfiguration = SpanishDimensionParserConfiguration;

});

unwrapExports(dimension$2);

var age$2 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class SpanishAgeExtractorConfiguration extends base$2.SpanishNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_AGE;
        this.suffixList = spanishNumericWithUnit.SpanishNumericWithUnit.AgeSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = new Array();
    }
}
exports.SpanishAgeExtractorConfiguration = SpanishAgeExtractorConfiguration;
class SpanishAgeParserConfiguration extends base$2.SpanishNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Spanish);
        }
        super(ci);
        this.BindDictionary(spanishNumericWithUnit.SpanishNumericWithUnit.AgeSuffixList);
    }
}
exports.SpanishAgeParserConfiguration = SpanishAgeParserConfiguration;

});

unwrapExports(age$2);

var portugueseNumericWithUnit = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var PortugueseNumericWithUnit;
(function (PortugueseNumericWithUnit) {
    PortugueseNumericWithUnit.AgeSuffixList = new Map([["Ano", "anos|ano"], ["Mês", "meses|mes|mês"], ["Semana", "semanas|semana"], ["Dia", "dias|dia"]]);
    PortugueseNumericWithUnit.AreaSuffixList = new Map([["Quilômetro quadrado", "quilômetro quadrado|quilómetro quadrado|quilometro quadrado|quilômetros quadrados|quilómetros quadrados|quilomeros quadrados|km2|km^2|km²"], ["Hectare", "hectômetro quadrado|hectómetro quadrado|hectômetros quadrados|hectómetros cuadrados|hm2|hm^2|hm²|hectare|hectares"], ["Decâmetro quadrado", "decâmetro quadrado|decametro quadrado|decâmetros quadrados|decametro quadrado|dam2|dam^2|dam²|are|ares"], ["Metro quadrado", "metro quadrado|metros quadrados|m2|m^2|m²"], ["Decímetro quadrado", "decímetro quadrado|decimentro quadrado|decímetros quadrados|decimentros quadrados|dm2|dm^2|dm²"], ["Centímetro quadrado", "centímetro quadrado|centimetro quadrado|centímetros quadrados|centrimetros quadrados|cm2|cm^2|cm²"], ["Milímetro quadrado", "milímetro quadrado|milimetro quadrado|milímetros quadrados|militmetros quadrados|mm2|mm^2|mm²"], ["Polegada quadrada", "polegada quadrada|polegadas quadradas|in2|in^2|in²"], ["Pé quadrado", "pé quadrado|pe quadrado|pés quadrados|pes quadrados|pé2|pé^2|pé²|sqft|sq ft|ft2|ft^2|ft²"], ["Jarda quadrada", "jarda quadrada|jardas quadradas|yd2|yd^2|yd²"], ["Milha quadrada", "milha quadrada|milhas quadradas|mi2|mi^2|mi²"], ["Acre", "acre|acres"]]);
    PortugueseNumericWithUnit.CurrencySuffixList = new Map([["Dólar", "dólar|dolar|dólares|dolares"], ["Peso", "peso|pesos"], ["Coroa", "coroa|coroas"], ["Rublo", "rublo|rublos"], ["Libra", "libra|libras"], ["Florim", "florim|florins|ƒ"], ["Dinar", "dinar|dinares"], ["Franco", "franco|francos"], ["Rupia", "rúpia|rupia|rúpias|rupias"], ["Escudo", "escudo|escudos"], ["Xelim", "xelim|xelins|xelims"], ["Lira", "lira|liras"], ["Centavo", "centavo|cêntimo|centimo|centavos|cêntimos|centimo"], ["Centésimo", "centésimo|centésimos"], ["Pêni", "pêni|péni|peni|penies|pennies"], ["Manat", "manat|manate|mánate|man|manats|manates|mánates"], ["Euro", "euro|euros|€|eur"], ["Centavo de Euro", "centavo de euro|cêntimo de euro|centimo de euro|centavos de euro|cêntimos de euro|centimos de euro"], ["Dólar do Caribe Oriental", "dólar do Caribe Oriental|dolar do Caribe Oriental|dólares do Caribe Oriental|dolares do Caribe Oriental|dólar das Caraíbas Orientais|dolar das Caraibas Orientais|dólares das Caraíbas Orientais|dolares das Caraibas Orientais|ec$|xcd"], ["Centavo do Caribe Oriental", "centavo do Caribe Oriental|centavo das Caraíbas Orientais|cêntimo do Caribe Oriental|cêntimo das Caraíbas Orientais|centavos do Caribe Oriental|centavos das Caraíbas Orientais|cêntimos do Caribe Oriental|cêntimos das Caraíbas Orientais"], ["Franco CFA da África Ocidental", "franco CFA da África Ocidental|franco CFA da Africa Ocidental|francos CFA da África Occidental|francos CFA da Africa Occidental|franco CFA Ocidental|xof"], ["Centavo de CFA da África Ocidental", "centavo de CFA da Africa Occidental|centavos de CFA da África Ocidental|cêntimo de CFA da Africa Occidental|cêntimos de CFA da África Ocidental"], ["Franco CFA da África Central", "franco CFA da África Central|franco CFA da Africa Central|francos CFA da África Central|francos CFA da Africa Central|franco CFA central|xaf"], ["Centavo de CFA da África Central", "centavo de CFA de África Central|centavos de CFA da África Central|cêntimo de CFA de África Central|cêntimos de CFA da África Central"], ["Apsar abcásio", "apsar abcásio|apsar abecásio|apsar abcasio|apsar|apsares"], ["Afegani afegão", "afegani afegão|afegane afegão|؋|afn|afegane|afgane|afegâni|afeganis|afeganes|afganes|afegânis"], ["Pul", "pul|pules|puls"], ["Lek albanês", "lek|lekë|lekes|lek albanês|leque|leques|all"], ["Qindarke", "qindarka|qindarkë|qindarke|qindarkas"], ["Kwanza angolano", "kwanza angolano|kwanzas angolanos|kwanza|kwanzas|aoa|kz"], ["Cêntimo angolano", "cêntimo angolano|cêntimo|cêntimos"], ["Florim das Antilhas Holandesas", "florim das antilhas holandesas|florim das antilhas neerlandesas|ang"], ["Rial saudita", "rial saudita|riais sauditas|riyal saudita|riyals sauditas|riyal|riyals|sar"], ["Halala saudita", "halala saudita|halala|hallalah"], ["Dinar argelino", "dinar argelino|dinares argelinos|dzd"], ["Cêntimo argelino", "centimo argelino|centimos argelinos|cêntimo argelino|cêntimos argelinos|centavo argelino|centavos argelinos"], ["Peso argentino", "peso argentino|pesos argentinos|peso|pesos|ar$|ars"], ["Centavo argentino", "centavo argentino|centavos argentinos|centavo|ctvo.|ctvos."], ["Dram armênio", "dram armênio|dram armênios|dram arménio|dram arménios|dram armenio|dram armenios|dram|drame|drames|դր."], ["Luma armênio", "luma armênio|lumas armênios|luma arménio|lumas arménios|luma armenio|lumas armenios|luma|lumas"], ["Florim arubano", "florín arubeño|florines arubeños|ƒ arubeños|aƒ|awg"], ["Dólar australiano", "dólar australiano|dólares australianos|dolar australiano|dolares australianos|a$|aud"], ["Centavo australiano", "centavo australiano|centavos australianos"], ["Manat azeri", "manat azeri|manats azeris|azn|manat azerbaijanês|manat azerbaijano|manats azerbaijaneses|manats azerbaijanos"], ["Qəpik azeri", "qəpik azeri|qəpik|qəpiks"], ["Dólar bahamense", "dólar bahamense|dólares bahamense|dolar bahamense|dolares bahamense|dólar baamiano|dólares baamiano|dolar baamiano|dolares baamiano|b$|bsd"], ["Centavo bahamense", "centavo bahamense|centavos bahamense"], ["Dinar bareinita", "dinar bareinita|dinar baremita|dinares bareinitas|dinares baremitas|bhd"], ["Fil bareinita", "fil bareinita|fil baremita|fils bareinitas|fils baremitas"], ["Taka bengali", "taka bengali|takas bengalis|taca|tacas|taka|takas|bdt"], ["Poisha bengali", "poisha bengali|poishas bengalis"], ["Dólar de Barbados", "dólar de barbados|dólares de barbados|dolar de barbados|dolares de barbados|dólar dos barbados|dólares dos barbados|bbd"], ["Centavo de Barbados", "centavo de barbados|centavos de barbados|centavo dos barbados|centavos dos barbados"], ["Dólar de Belize", "dólar de belize|dólares de belize|dolar de belize|dolares de belize|dólar do belize|dólares do belize|dolar do belize|dolares do belize|bz$|bzd"], ["Centavo de Belize", "centavo de belize|centavos de belize|cêntimo do belize|cêntimos do belize"], ["Dólar bermudense", "dólar bermudense|dólares bermudenses|bd$|bmd"], ["Centavo bermudense", "centavo bermudense|centavos bermudenses|cêntimo bermudense| cêntimos bermudenses"], ["Rublo bielorrusso", "rublo bielorrusso|rublos bielorrussos|br|byr"], ["Copeque bielorusso", "copeque bielorrusso|copeques bielorrussos|kopek bielorrusso|kopeks bielorrussos|kap"], ["Quiate mianmarense", "quiate mianmarense|quiates mianmarenses|kyat mianmarense|kyates mianmarenses|quiate myanmarense|quiates myanmarenses|kyat myanmarense|kyates myanmarenses|quiate birmanês|quite birmanes|quiates birmaneses|kyat birmanês|kyat birmanes|kyates birmaneses|mmk"], ["Pya mianmarense", "pya mianmarense|pyas mianmarenses|pya myanmarense|pyas myanmarenses|pya birmanês|pya birmanes|pyas birmaneses"], ["Boliviano", "boliviano|bolivianos|bob|bs"], ["Centavo Boliviano", "centavo boliviano|centavos bolivianos"], ["Marco da Bósnia e Herzegovina", "marco conversível|marco conversivel|marco convertível|marco convertivel|marcos conversíveis|marcos conversiveis|marcos convertíveis|marcos convertivies|bam"], ["Fening da Bósnia e Herzegovina", "fening conversível|fening conversivel|fening convertível|fening convertivel|fenings conversíveis|fenings conversiveis|fenings convertíveis|fenings convertiveis"], ["Pula", "pula|pulas|bwp"], ["Thebe", "thebe|thebes"], ["Real brasileiro", "real brasileiro|real do brasil|real|reais brasileiros|reais do brasil|reais|r$|brl"], ["Centavo brasileiro", "centavo de real|centavo brasileiro|centavos de real|centavos brasileiros"], ["Dólar de Brunei", "dólar de brunei|dolar de brunei|dólar do brunei|dolar do brunei|dólares de brunéi|dolares de brunei|dólares do brunei|dolares do brunei|bnd"], ["Sen de Brunei", "sen de brunei|sen do brunei|sens de brunei|sens do brunei"], ["Lev búlgaro", "lev búlgaro|leve búlgaro|leves búlgaros|lev bulgaro|leve bulgaro|leves bulgaros|lv|bgn"], ["Stotinka búlgaro", "stotinka búlgaro|stotinki búlgaros|stotinka bulgaro|stotinki bulgaros"], ["Franco do Burundi", "franco do burundi|francos do burundi|fbu|fib"], ["Centavo Burundi", "centavo burundi|cêntimo burundi|centimo burundi|centavos burundi|cêntimo burundi|centimo burundi"], ["Ngultrum butanês", "ngultrum butanês|ngultrum butanes|ngúltrume butanês|ngultrume butanes|ngultrum butaneses|ngúltrumes butaneses|ngultrumes butaneses|btn"], ["Chetrum  butanês", "chetrum butanês|chetrum butanes|chetrum butaneses"], ["Escudo cabo-verdiano", "escudo cabo-verdiano|escudos cabo-verdianos|cve"], ["Riel cambojano", "riel cambojano|riéis cambojanos|rieis cambojanos|khr"], ["Dólar canadense", "dólar canadense|dolar canadense|dólares canadenses|dolares canadenses|c$|cad"], ["Centavo canadense", "centavo canadense|centavos canadenses"], ["Peso chileno", "peso chileno|pesos chilenos|cpl"], ["Yuan chinês", "yuan chinês|yuan chines|yuans chineses|yuan|yuans|renminbi|rmb|cny|¥"], ["Peso colombiano", "peso colombiano|pesos colombianos|cop|col$"], ["Centavo colombiano", "centavo colombiano|centavos colombianos"], ["Franco comorense", "franco comorense|francos comorenses|kmf|₣"], ["Franco congolês", "franco congolês|franco congoles|francos congoleses|cdf"], ["Centavo congolês", "centavo congolês|centavo congoles|centavos congoleses|cêntimo congolês|centimo congoles|cêntimos congoleses|cêntimos congoleses"], ["Won norte-coreano", "won norte-coreano|wŏn norte-coreano|won norte-coreanos|wŏn norte-coreanos|kpw"], ["Chon norte-coreano", "chon norte-coreano|chŏn norte-coreano|chŏn norte-coreanos|chon norte-coreanos"], ["Won sul-coreano", "wŏn sul-coreano|won sul-coreano|wŏnes sul-coreanos|wones sul-coreanos|krw"], ["Jeon sul-coreano", "jeons sul-coreano|jeons sul-coreanos"], ["Colón costarriquenho", "colón costarriquenho|colon costarriquenho|colons costarriquenho|colones costarriquenhos|crc"], ["Kuna croata", "kuna croata|kunas croatas|hrk"], ["Lipa croata", "lipa croata|lipas croatas"], ["Peso cubano", "peso cubano|pesos cubanos|cup"], ["Peso cubano convertível", "peso cubano conversível|pesos cubanos conversíveis|peso cubano conversivel|pesos cubanos conversiveis|peso cubano convertível|pesos cubanos convertíveis|peso cubano convertivel|pesos cubanos convertiveis|cuc"], ["Coroa dinamarquesa", "coroa dinamarquesa|coroas dinamarquesas|dkk"], ["Libra egípcia", "libra egípcia|libra egipcia|libras egípcias|libras egipcias|egp|le"], ["Piastra egípcia", "piastra egípcia|piastra egipcia|pisastras egípcias|piastras egipcias"], ["Dirham dos Emirados Árabes Unidos", "dirham|dirhams|dirham dos emirados arabes unidos|aed|dhs"], ["Nakfa", "nakfa|nfk|ern"], ["Centavo de Nakfa", "cêntimo de nakfa|cêntimos de nakfa|centavo de nafka|centavos de nafka"], ["Peseta", "peseta|pesetas|pts.|ptas.|esp"], ["Dólar estadunidense", "dólar dos estados unidos|dolar dos estados unidos|dólar estadunidense|dólar americano|dólares dos estados unidos|dolares dos estados unidos|dólares estadunidenses|dólares americanos|dolar estadunidense|dolar americano|dolares estadunidenses|dolares americanos|usd|u$d|us$"], ["Coroa estoniana", "coroa estoniana|coroas estonianas|eek"], ["Senti estoniano", "senti estoniano|senti estonianos"], ["Birr etíope", "birr etíope|birr etiope|birr etíopes|birr etiopes|br|etb"], ["Santim etíope", "santim etíope|santim etiope|santim etíopes|santim etiopes"], ["Peso filipino", "peso filipino|pesos filipinos|php"], ["Marco finlandês", "marco finlandês|marco finlandes|marcos finlandeses"], ["Dólar fijiano", "dólar fijiano|dolar fijiano|dólares fijianos|dolares fijianos|fj$|fjd"], ["Centavo fijiano", "centavo fijiano|centavos fijianos"], ["Dalasi gambiano", "dalasi|gmd"], ["Bututs", "butut|bututs"], ["Lari georgiano", "lari georgiano|lari georgianos|gel"], ["Tetri georgiano", "tetri georgiano|tetri georgianos"], ["Cedi", "cedi|ghs|gh₵"], ["Pesewa", "pesewa"], ["Libra de Gibraltar", "libra de gibraltar|libras de gibraltar|gip"], ["Peni de Gibraltar", "peni de gibraltar|penies de gibraltar"], ["Quetzal guatemalteco", "quetzal guatemalteco|quetzales guatemaltecos|quetzal|quetzales|gtq"], ["Centavo guatemalteco", "centavo guatemalteco|centavos guatemaltecos"], ["Libra de Guernsey", "libra de Guernsey|libras de Guernsey|ggp"], ["Peni de Guernsey", "peni de Guernsey|penies de Guernsey"], ["Franco da Guiné", "franco da guiné|franco da guine| franco guineense|francos da guiné|francos da guine|francos guineense|gnf|fg"], ["Centavo da Guiné", "cêntimo guineense|centimo guineense|centavo guineense|cêntimos guineenses|centimos guineenses|centavos guineenses"], ["Dólar guianense", "dólar guianense|dólares guianense|dolar guianense|dolares guianense|gyd|gy"], ["Gurde haitiano", "gurde haitiano|gourde|gurdes haitianos|htg"], ["Centavo haitiano", "cêntimo haitiano|cêntimos haitianos|centavo haitiano|centavos haitianos"], ["Lempira hondurenha", "lempira hondurenha|lempiras hondurenhas|lempira|lempiras|hnl"], ["Centavo hondurenho", "centavo hondurenho|centavos hondurehos|cêntimo hondurenho|cêntimos hondurenhos"], ["Dólar de Hong Kong", "dólar de hong kong|dolar de hong kong|dólares de hong kong|dolares de hong kong|hk$|hkd"], ["Florim húngaro", "florim húngaro|florim hungaro|florins húngaros|florins hungaros|forinte|forintes|huf"], ["Filér húngaro", "fillér|filér|filler|filer"], ["Rupia indiana", "rúpia indiana|rupia indiana|rupias indianas|inr"], ["Paisa indiana", "paisa indiana|paisas indianas"], ["Rupia indonésia", "rupia indonesia|rupia indonésia|rupias indonesias|rupias indonésias|idr"], ["Sen indonésio", "send indonésio|sen indonesio|sen indonésios|sen indonesios"], ["Rial iraniano", "rial iraniano|riais iranianos|irr"], ["Dinar iraquiano", "dinar iraquiano|dinares iraquianos|iqd"], ["Fil iraquiano", "fil iraquiano|fils iraquianos|files iraquianos"], ["Libra manesa", "libra manesa|libras manesas|imp"], ["Peni manês", "peni manes|peni manês|penies maneses"], ["Coroa islandesa", "coroa islandesa|coroas islandesas|isk|íkr"], ["Aurar islandês", "aurar islandês|aurar islandes|aurar islandeses|eyrir"], ["Dólar das Ilhas Cayman", "dólar das ilhas cayman|dolar das ilhas cayman|dólar das ilhas caimão|dólares das ilhas cayman|dolares das ilhas cayman|dólares das ilhas caimão|ci$|kyd"], ["Dólar das Ilhas Cook", "dólar das ilhas cook|dolar das ilhas cook|dólares das ilhas cook|dolares das ilhas cook"], ["Coroa feroesa", "coroa feroesa|coroas feroesas|fkr"], ["Libra das Malvinas", "libra das malvinas|libras das malvinas|fk£|fkp"], ["Dólar das Ilhas Salomão", "dólar das ilhas salomão|dolar das ilhas salomao|dólares das ilhas salomão|dolares das ilhas salomao|sbd"], ["Novo shekel israelense", "novo shekel|novos shekeles|novo shequel|novo siclo|novo xéquel|shekeles novos|novos sheqalim|sheqalim novos|ils"], ["Agora", "agora|agorot"], ["Dólar jamaicano", "dólar jamaicano|dolar jamaicano|dólares jamaicanos|dolares jamaicanos|j$|ja$|jmd"], ["Yen", "yen|iene|yenes|ienes|jpy"], ["Libra de Jersey", "libra de Jersey|libras de Jersey|jep"], ["Dinar jordaniano", "dinar jordaniano|dinar jordano|dinares jordanianos|dinares jordanos|jd|jod"], ["Piastra jordaniana", "piastra jordaniana|piastra jordano|piastras jordanianas|piastra jordaniano|piastras jordanianos|piastras jordanos"], ["Tengue cazaque", "tenge|tengue|tengué|tengue cazaque|kzt"], ["Tiyin", "tiyin|tiyins"], ["Xelim queniano", "xelim queniano|xelins quenianos|ksh|kes"], ["Som quirguiz", "som quirguiz|som quirguizes|soms quirguizes|kgs"], ["Tyiyn", "tyiyn|tyiyns"], ["Dólar de Kiribati", "dólar de kiribati|dolar de kiribati|dólares de kiribati|dolares de kiribati"], ["Dinar kuwaitiano", "dinar kuwaitiano|dinar cuaitiano|dinares kuwaitiano|dinares cuaitianos|kwd"], ["Quipe laosiano", "quipe|quipes|kipe|kipes|kip|kip laosiano|kip laociano|kips laosianos|kips laocianos|lak"], ["Att laosiano", "at|att|att laosiano|att laosianos"], ["Loti do Lesoto", "loti|lóti|maloti|lotis|lótis|lsl"], ["Sente", "sente|lisente"], ["Libra libanesa", "libra libanesa|libras libanesas|lbp"], ["Dólar liberiano", "dólar liberiano|dolar liberiano|dólares liberianos|dolares liberianos|l$|lrd"], ["Dinar libio", "dinar libio|dinar líbio|dinares libios|dinares líbios|ld|lyd"], ["Dirham libio", "dirham libio|dirhams libios|dirham líbio|dirhams líbios"], ["Litas lituana", "litas lituana|litai lituanas|ltl"], ["Pataca macaense", "pataca macaense|patacas macaenses|mop$|mop"], ["Avo macaense", "avo macaense|avos macaenses"], ["Ho macaense", "ho macaense|ho macaenses"], ["Dinar macedônio", "denar macedonio|denare macedonios|denar macedônio|denar macedónio|denare macedônio|denare macedónio|dinar macedonio|dinar macedônio|dinar macedónio|dinares macedonios|dinares macedônios|dinares macedónios|den|mkd"], ["Deni macedônio", "deni macedonio|deni macedônio|deni macedónio|denis macedonios|denis macedônios|denis macedónios"], ["Ariary malgaxe", "ariai malgaxe|ariary malgaxe|ariary malgaxes|ariaris|mga"], ["Iraimbilanja", "iraimbilanja|iraimbilanjas"], ["Ringuite malaio", "ringgit malaio|ringgit malaios|ringgits malaios|ringuite malaio|ringuites malaios|rm|myr"], ["Sen malaio", "sen malaio|sen malaios|centavo malaio|centavos malaios|cêntimo malaio|cêntimos malaios"], ["Kwacha do Malawi", "kwacha|cuacha|quacha|mk|mwk"], ["Tambala", "tambala|tambalas|tambala malawi"], ["Rupia maldiva", "rupia maldiva|rupias maldivas|rupia das maldivas| rupias das maldivas|mvr"], ["Dirame marroquino", "dirame marroquino|dirham marroquinho|dirhams marroquinos|dirames marroquinos|mad"], ["Rupia maurícia", "rupia maurícia|rupia de Maurício|rupia mauricia|rupia de mauricio|rupias de mauricio|rupias de maurício|rupias mauricias|rupias maurícias|mur"], ["Uguia", "uguia|uguias|oguia|ouguiya|oguias|mro"], ["Kume", "kumes|kume|khoums"], ["Peso mexicano", "peso mexicano|pesos mexicanos|mxn"], ["Centavo mexicano", "centavo mexicano|centavos mexicanos"], ["Leu moldávio", "leu moldavo|lei moldavos|leu moldávio|leu moldavio|lei moldávios|lei moldavios|leus moldavos|leus moldavios|leus moldávios|mdl"], ["Ban moldávio", "ban moldavo|bani moldavos"], ["Tugrik mongol", "tugrik mongol|tugrik|tugriks mongóis|tugriks mongois|tug|mnt"], ["Metical moçambicao", "metical|metical moçambicano|metical mocambicano|meticais|meticais moçambicanos|meticais mocambicanos|mtn|mzn"], ["Dólar namibiano", "dólar namibiano|dólares namibianos|dolar namibio|dolares namibios|n$|nad"], ["Centavo namibiano", "centavo namibiano|centavos namibianos|centavo namibio|centavos namibianos"], ["Rupia nepalesa", "rupia nepalesa|rupias nepalesas|npr"], ["Paisa nepalesa", "paisa nepalesa|paisas nepalesas"], ["Córdova nicaraguense", "córdova nicaraguense|cordova nicaraguense|cordova nicaraguana|córdoba nicaragüense|córdobas nicaragüenses|cordobas nicaraguenses|córdovas nicaraguenses|cordovas nicaraguenses|córdovas nicaraguanasc$|nio"], ["Centavo nicaraguense", "centavo nicaragüense|centavos nicaraguenses|centavo nicaraguano|centavos nicaraguenses|centavo nicaraguano|centavos nicaraguanos"], ["Naira", "naira|ngn"], ["Kobo", "kobo"], ["Coroa norueguesa", "coroa norueguesa|coroas norueguesas|nok"], ["Franco CFP", "franco cfp|francos cfp|xpf"], ["Dólar neozelandês", "dólar neozelandês|dolar neozelandes|dólares neozelandeses|dolares neozelandeses|dólar da nova zelândia|dolar da nova zelandia|dólares da nova zelândia|dolares da nova zelandia|nz$|nzd"], ["Centavo neozelandês", "centavo neozelandês|centavo neozelandes|centavo da nova zelandia|centavo da nova zelândia|centavos da nova zelandia|centavos neozelandeses|centavos da nova zelândia"], ["Rial omanense", "rial omani|riais omanis|rial omanense|riais omanenses|omr"], ["Baisa omanense", "baisa omani|baisas omanis|baisa omanense|baisas omanenses"], ["Florim holandês", "florim holandês|florim holandes|florins holandeses|nlg"], ["Rupia paquistanesa", "rupia paquistanesa|rupias paquistanesas|pkr"], ["Paisa paquistanesa", "paisa paquistanesa|paisas paquistanesasas"], ["Balboa panamenho", "balboa panamenho|balboas panamenhos|balboa|pab|balboa panamense|balboas panamenses"], ["Centavo panamenho", "centavo panamenho|cêntimo panamenho|centavos panamenhos|cêntimos panamenhos|cêntimo panamense|cêntimos panamenses"], ["Kina", "kina|kina papuásia|kinas|kinas papuásias|pkg|pgk"], ["Toea", "toea"], ["Guarani", "guarani|guaranis|gs|pyg"], ["Novo Sol", "novo sol peruano|novos sóis peruanos|sol|soles|sóis|nuevo sol|pen|s#."], ["Centavo de sol", "cêntimo de sol|cêntimos de sol|centavo de sol|centavos de sol"], ["Złoty", "złoty|złotys|zloty|zlotys|zloti|zlotis|zlóti|zlótis|zlote|zł|pln"], ["Groszy", "groszy|grosz"], ["Rial catariano", "rial qatari|riais qataris|rial catarense|riais catarenses|rial catariano|riais catarianos|qr|qar"], ["Dirame catariano", "dirame catariano|dirames catarianos|dirame qatari|dirames qataris|dirame catarense|dirames catarenses|dirham qatari|dirhams qataris|dirham catarense|dirhams catarenses|dirham catariano|dirhams catariano"], ["Libra esterlina", "libra esterlina|libras esterlinas|gbp"], ["Coroa checa", "coroa checa|coroas checas|kc|czk"], ["Peso dominicano", "peso dominicano|pesos dominicanos|rd$|dop"], ["Centavo dominicano", "centavo dominicano|centavos dominicanos"], ["Franco ruandês", "franco ruandês|franco ruandes|francos ruandeses|rf|rwf"], ["Céntimo ruandês", "cêntimo ruandês|centimo ruandes|centavo ruandês|centavo ruandes|cêntimos ruandeses|centimos ruandeses|centavos ruandeses"], ["Leu romeno", "leu romeno|lei romenos|leus romenos|ron"], ["Ban romeno", "ban romeno|bani romeno|bans romenos"], ["Rublo russo", "rublo russo|rublos russos|rub|р."], ["Copeque ruso", "copeque russo|copeques russos|kopek ruso|kopeks rusos|copeque|copeques|kopek|kopeks"], ["Tala samoano", "tala|tālā|talas|tala samonano|talas samoanos|ws$|sat|wst"], ["Sene samoano", "sene"], ["Libra de Santa Helena", "libra de santa helena|libras de santa helena|shp"], ["Pêni de Santa Helena", "peni de santa helena|penies de santa helena"], ["Dobra", "dobra|dobras|db|std"], ["Dinar sérvio", "dinar sérvio|dinar servio|dinar serbio|dinares sérvios|dinares servios|dinares serbios|rsd"], ["Para sérvio", "para sérvio|para servio|para serbio|paras sérvios|paras servios|paras serbios"], ["Rupia seichelense", "rupia de seicheles|rupias de seicheles|rupia seichelense|rupias seichelenses|scr"], ["Centavo seichelense", "centavo de seicheles|centavos de seicheles|centavo seichelense|centavos seichelenses"], ["Leone serra-leonino", "leone|leones|leone serra-leonino|leones serra-leoninos|le|sll"], ["Dólar de Cingapura", "dólar de singapura|dolar de singapura|dórar de cingapura|dolar de cingapura|dólares de singapura|dolares de singapura|dólares de cingapura|dolares de cingapura|sgb"], ["Centavo de Cingapura", "centavo de singapura|centavos de singapura|centavo de cingapura|centavos de cingapura"], ["Libra síria", "libra síria|libra siria|libras sírias|libras sirias|s£|syp"], ["Piastra síria", "piastra siria|piastras sirias|piastra síria|piastras sírias"], ["Xelim somali", "xelim somali|xelins somalis|xelim somaliano|xelins somalianos|sos"], ["Centavo somali", "centavo somapli|centavos somalis|centavo somaliano|centavos somalianos"], ["Xelim da Somalilândia", "xelim da somalilândia|xelins da somalilândia|xelim da somalilandia|xelins da somalilandia"], ["Centavo da Somalilândia", "centavo da somalilândia|centavos da somalilândia|centavo da somalilandia|centavos da somalilandia"], ["Rupia do Sri Lanka", "rupia do sri lanka|rupia do sri lanca|rupias do sri lanka|rupias do sri lanca|rupia cingalesa|rupias cingalesas|lkr"], ["Lilangeni", "lilangeni|lilangenis|emalangeni|szl"], ["Rand sul-africano", "rand|rand sul-africano|rands|rands sul-africanos|zar"], ["Libra sudanesa", "libra sudanesa|libras sudanesas|sdg"], ["Piastra sudanesa", "piastra sudanesa|piastras sudanesas"], ["Libra sul-sudanesa", "libra sul-sudanesa|libras sul-sudanesas|ssp"], ["Piastra sul-sudanesa", "piastra sul-sudanesa|piastras sul-sudanesas"], ["Coroa sueca", "coroa sueca|coroas suecas|sek"], ["Franco suíço", "franco suíço|franco suico|francos suíços|francos suicos|sfr|chf"], ["Rappen suíço", "rappen suíço|rappen suico|rappens suíços|rappens suicos"], ["Dólar surinamês", "dólar surinamês|dolar surinames|dólar do Suriname|dolar do Suriname|dólares surinameses|dolares surinameses|dólares do Suriname|dolares do Suriname|srd"], ["Centavo surinamês", "centavo surinamês|centavo surinames|centavos surinameses"], ["Baht tailandês", "baht tailandês|bath tailandes|baht tailandeses|thb"], ["Satang tailandês", "satang tailandês|satang tailandes|satang tailandeses"], ["Novo dólar taiwanês", "novo dólar taiwanês|novo dolar taiwanes|dólar taiwanês|dolar taiwanes|dólares taiwaneses|dolares taiwaneses|twd"], ["Centavo taiwanês", "centavo taiwanês|centavo taiwanes|centavos taiwaneses"], ["Xelim tanzaniano", "xelim tanzaniano|xelins tanzanianos|tzs"], ["Centavo tanzaniano", "centavo tanzaniano|centavos tanzanianos"], ["Somoni tajique", "somoni tajique|somoni|somonis tajiques|somonis|tjs"], ["Diram tajique", "diram tajique|dirams tajiques|dirames tajiques"], ["Paʻanga", "paanga|paangas|paʻanga|pa'anga|top"], ["Seniti", "seniti"], ["Rublo transdniestriano", "rublo transdniestriano|rublos transdniestriano"], ["Copeque transdniestriano", "copeque transdniestriano|copeques transdniestriano"], ["Dólar de Trinidade e Tobago", "dólar de trinidade e tobago|dólares trinidade e tobago|dolar de trinidade e tobago|dolares trinidade e tobago|dólar de trinidad e tobago|dólares trinidad e tobago|ttd"], ["Centavo de Trinidade e Tobago", "centavo de trinidade e tobago|centavos de trinidade e tobago|centavo de trinidad e tobago|centavos de trinidad e tobago"], ["Dinar tunisiano", "dinar tunisiano|dinares tunisianos|dinar tunisino|dinares tunisinos|tnd"], ["Milim tunisiano", "milim tunisiano|milim tunesianos|millime tunisianos|millimes tunisianos|milim tunisino|milim tunisinos|millime tunisinos|millimes tunisinos"], ["Lira turca", "lira turca|liras turcas|try"], ["Kuruş turco", "kuruş turco|kuruş turcos"], ["Manat turcomeno", "manat turcomeno|manats turcomenos|tmt"], ["Tennesi turcomeno", "tennesi turcomeno|tennesis turcomenos|tenge turcomenos|tenges turcomenos"], ["Dólar tuvaluano", "dólar tuvaluano|dolar tuvaluano|dólares tuvaluanos|dolares tuvaluanos"], ["Centavo tuvaluano", "centavo tuvaluano|centavos tuvaluanos"], ["Grívnia", "grívnia|grivnia|grívnias|grivnias|grivna|grivnas|uah"], ["Copeque ucraniano", "kopiyka|copeque ucraniano|copeques ucranianos"], ["Xelim ugandês", "xelim ugandês|xelim ugandes|xelins ugandeses|ugx"], ["Centavo ugandês", "centavo ugandês|centavo ugandes|centavos ugandeses"], ["Peso uruguaio", "peso uruguaio|pesos uruguayis|uyu"], ["Centésimo uruguayo", "centésimo uruguaio|centesimo uruguaio|centésimos uruguaios|centesimos uruguaios"], ["Som uzbeque", "som uzbeque|som uzbeques|soms uzbeques|somes uzbeques|som usbeque|som usbeques|soms usbeques|somes usbeques|uzs"], ["Tiyin uzbeque", "tiyin uzbeque|tiyin uzbeques|tiyins uzbeques|tiyin usbeque|tiyin usbeques|tiyins usbeques"], ["Vatu", "vatu|vatus|vuv"], ["Bolívar forte venezuelano", "bolívar forte|bolivar forte|bolívar|bolivar|bolívares|bolivares|vef"], ["Centavo de bolívar", "cêntimo de bolívar|cêntimos de bolívar|centavo de bolívar|centavo de bolivar|centavos de bolívar|centavos de bolivar"], ["Dongue vietnamita", "dongue vietnamita|Đồng vietnamita|dong vietnamita|dongues vietnamitas|dongs vietnamitas|vnd"], ["Hào vietnamita", "hào vietnamita|hao vietnamita|hào vietnamitas|hàos vietnamitas|haos vietnamitas"], ["Rial iemenita", "rial iemenita|riais iemenitas|yer"], ["Fils iemenita", "fils iemenita|fils iemenitas"], ["Franco djibutiano", "franco djibutiano|francos djibutianos|franco jibutiano|francos jibutianos|djf"], ["Dinar iugoslavo", "dinar iugoslavo|dinares iugoslavos|dinar jugoslavo|dinares jugoslavos|yud"], ["Kwacha zambiano", "kwacha zambiano|kwacha zambianos|kwachas zambianos|zmw"], ["Ngwee zambiano", "ngwee zambiano|ngwee zambianos|ngwees zambianos"]]);
    PortugueseNumericWithUnit.CompoundUnitConnectorRegex = `(?<spacer>[^.])`;
    PortugueseNumericWithUnit.CurrencyPrefixList = new Map([["Dólar", "$"], ["Dólar estadunidense", "us$|u$d|usd"], ["Dólar do Caribe Oriental", "ec$|xcd"], ["Dólar australiano", "a$|aud"], ["Dólar bahamense", "b$|bsd"], ["Dólar de Barbados", "bds$|bbd"], ["Dólar de Belizebe", "bz$|bzd"], ["Dólar bermudense", "bd$|bmd"], ["Dólar de Brunebi", "brunéi $|bnd"], ["Dólar de Cingapura", "s$|sgd"], ["Dólar canadense", "c$|can$|cad"], ["Dólar das Ilhas Cayman", "ci$|kyd"], ["Dólar neozelandês", "nz$|nzd"], ["Dólar fijgiano", "fj$|fjd"], ["Dólar guianense", "gy$|gyd"], ["Dólar de Hong Kong", "hk$|hkd"], ["Dólar jamaicano", "j$|ja$|jmd"], ["Dólar liberiano", "l$|lrd"], ["Dólar namibiano", "n$|nad"], ["Dólar das Ilhas Salomão", "si$|sbd"], ["Novo dólar taiwanês", "nt$|twd"], ["Real brasileiro", "r$|brl"], ["Guarani", "₲|gs.|pyg"], ["Dólar de Trinidade e Tobago", "tt$|ttd"], ["Yuan chinês", "￥|cny|rmb"], ["Yen", "¥|jpy"], ["Euro", "€|eur"], ["Florim", "ƒ"], ["Libra", "£|gbp"], ["Colón costarriquenho", "₡"], ["Lira turca", "₺"]]);
    PortugueseNumericWithUnit.AmbiguousCurrencyUnitList = ['le'];
    PortugueseNumericWithUnit.InformationSuffixList = new Map([["bit", "bit|bits"], ["kilobit", "kilobit|kilobits|kb|kbit"], ["megabit", "megabit|megabits|Mb|Mbit"], ["gigabit", "gigabit|gigabits|Gb|Gbit"], ["terabit", "terabit|terabits|Tb|Tbit"], ["petabit", "petabit|petabits|Pb|Pbit"], ["kibibit", "kibibit|kibibits|kib|kibit"], ["mebibit", "mebibit|mebibits|Mib|Mibit"], ["gibibit", "gibibit|gibibits|Gib|Gibit"], ["tebibit", "tebibit|tebibits|Tib|Tibit"], ["pebibit", "pebibit|pebibits|Pib|Pibit"], ["byte", "byte|bytes"], ["kilobyte", "kilobyte|kilobytes|kB|kByte"], ["megabyte", "megabyte|megabytes|MB|MByte"], ["gigabyte", "gigabyte|gigabytes|GB|GByte"], ["terabyte", "terabyte|terabytes|TB|TByte"], ["petabyte", "petabyte|petabytes|PB|PByte"], ["kibibyte", "kibibyte|kibibytes|kiB|kiByte"], ["mebibyte", "mebibyte|mebibytes|MiB|MiByte"], ["gibibyte", "gibibyte|gibibytes|GiB|GiByte"], ["tebibyte", "tebibyte|tebibytes|TiB|TiByte"], ["pebibyte", "pebibyte|pebibytes|PiB|PiByte"]]);
    PortugueseNumericWithUnit.AmbiguousDimensionUnitList = ['ton', 'tonelada', 'área', 'area', 'áreas', 'areas', 'milha', 'milhas'];
    PortugueseNumericWithUnit.BuildPrefix = `(?<=(\\s|^|\\P{L}))`;
    PortugueseNumericWithUnit.BuildSuffix = `(?=(\\s|\\P{L}|$))`;
    PortugueseNumericWithUnit.ConnectorToken = 'de';
    PortugueseNumericWithUnit.LengthSuffixList = new Map([["Quilômetro", "km|quilometro|quilômetro|quilómetro|quilometros|quilômetros|quilómetros"], ["Hectômetro", "hm|hectometro|hectômetro|hectómetro|hectometros|hectômetros|hectómetros"], ["Decâmetro", "decametro|decâmetro|decámetro|decametros|decâmetro|decámetros|dam"], ["Metro", "m|m.|metro|metros"], ["Decímetro", "dm|decimetro|decímetro|decimetros|decímetros"], ["Centímetro", "cm|centimetro|centímetro|centimetros|centimetros"], ["Milímetro", "mm|milimetro|milímetro|milimetros|milímetros"], ["Micrômetro", "µm|um|micrometro|micrômetro|micrómetro|micrometros|micrômetros|micrómetros|micron|mícron|microns|mícrons|micra"], ["Nanômetro", "nm|nanometro|nanômetro|nanómetro|nanometros|nanômetros|nanómetros|milimicron|milimícron|milimicrons|milimícrons"], ["Picômetro", "pm|picometro|picômetro|picómetro|picometros|picômetros|picómetros"], ["Milha", "mi|milha|milhas"], ["Jarda", "yd|jarda|jardas"], ["Polegada", "polegada|polegadas|\""], ["Pé", "pé|pe|pés|pes|ft"], ["Ano luz", "ano luz|anos luz|al"]]);
    PortugueseNumericWithUnit.AmbiguousLengthUnitList = ['mi', 'milha', 'milhas'];
    PortugueseNumericWithUnit.SpeedSuffixList = new Map([["Metro por segundo", "metro/segundo|m/s|metro por segundo|metros por segundo|metros por segundos"], ["Quilômetro por hora", "km/h|quilômetro por hora|quilómetro por hora|quilometro por hora|quilômetros por hora|quilómetros por hora|quilometros por hora|quilômetro/hora|quilómetro/hora|quilometro/hora|quilômetros/hora|quilómetros/hora|quilometros/hora"], ["Quilômetro por minuto", "km/min|quilômetro por minuto|quilómetro por minuto|quilometro por minuto|quilômetros por minuto|quilómetros por minuto|quilometros por minuto|quilômetro/minuto|quilómetro/minuto|quilometro/minuto|quilômetros/minuto|quilómetros/minuto|quilometros/minuto"], ["Quilômetro por segundo", "km/seg|quilômetro por segundo|quilómetro por segundo|quilometro por segundo|quilômetros por segundo|quilómetros por segundo|quilometros por segundo|quilômetro/segundo|quilómetro/segundo|quilometro/segundo|quilômetros/segundo|quilómetros/segundo|quilometros/segundo"], ["Milha por hora", "mph|milha por hora|mi/h|milha/hora|milhas/hora|milhas por hora"], ["Nó", "kt|nó|nós|kn"], ["Pé por segundo", "ft/s|pé/s|pe/s|ft/seg|pé/seg|pe/seg|pé por segundo|pe por segundo|pés por segundo|pes por segundo"], ["Pé por minuto", "ft/min|pé/mind|pe/min|pé por minuto|pe por minuto|pés por minuto|pes por minuto"], ["Jarda por minuto", "jardas por minuto|jardas/minuto|jardas/min"], ["Jarda por segundo", "jardas por segundo|jardas/segundo|jardas/seg"]]);
    PortugueseNumericWithUnit.AmbiguousSpeedUnitList = ['nó', 'no', 'nós', 'nos'];
    PortugueseNumericWithUnit.TemperatureSuffixList = new Map([["Kelvin", "k|kelvin"], ["Grau Rankine", "r|°r|°ra|grau rankine|graus rankine| rankine"], ["Grau Celsius", "°c|grau c|grau celsius|graus c|graus celsius|celsius|grau centígrado|grau centrigrado|graus centígrados|graus centigrados|centígrado|centígrados|centigrado|centigrados"], ["Grau Fahrenheit", "°f|grau f|graus f|grau fahrenheit|graus fahrenheit|fahrenheit"], ["Grau", "°|graus|grau"]]);
    PortugueseNumericWithUnit.VolumeSuffixList = new Map([["Quilômetro cúbico", "quilômetro cúbico|quilómetro cúbico|quilometro cubico|quilômetros cúbicos|quilómetros cúbicos|quilometros cubicos|km3|km^3|km³"], ["Hectômetro cúbico", "hectômetro cúbico|hectómetro cúbico|hectometro cubico|hectômetros cúbicos|hectómetros cúbicos|hectometros cubicos|hm3|hm^3|hm³"], ["Decâmetro cúbico", "decâmetro cúbico|decámetro cúbico|decametro cubico|decâmetros cúbicos|decámetros cúbicos|decametros cubicosdam3|dam^3|dam³"], ["Metro cúbico", "metro cúbico|metro cubico|metros cúbicos|metros cubicos|m3|m^3|m³"], ["Decímetro cúbico", "decímetro cúbico|decimetro cubico|decímetros cúbicos|decimetros cubicos|dm3|dm^3|dm³"], ["Centímetro cúbico", "centímetro cúbico|centimetro cubico|centímetros cúbicos|centrimetros cubicos|cc|cm3|cm^3|cm³"], ["Milímetro cúbico", "milímetro cúbico|milimetro cubico|milímetros cúbicos|milimetros cubicos|mm3|mm^3|mm³"], ["Polegada cúbica", "polegada cúbica|polegada cubica|polegadas cúbicas|polegadas cubicas"], ["Pé cúbico", "pé cúbico|pe cubico|pés cúbicos|pes cubicos|pé3|pe3|pé^3|pe^3|pé³|pe³|ft3|ft^3|ft³"], ["Jarda cúbica", "jarda cúbica|jarda cubica|jardas cúbicas|jardas cubicas|yd3|yd^3|yd³"], ["Hectolitro", "hectolitro|hectolitros|hl"], ["Litro", "litro|litros|lts|l"], ["Mililitro", "mililitro|mililitros|ml"], ["Galão", "galão|galões|galao|galoes"], ["Pint", "pinta|pintas|pinto|pintos|quartilho|quartilhos|pint|pints"], ["Barril", "barril|barris|bbl"], ["Onça líquida", "onça líquida|onca liquida|onças líquidas|oncas liquidas"]]);
    PortugueseNumericWithUnit.WeightSuffixList = new Map([["Tonelada métrica", "tonelada métrica|tonelada metrica|toneladas métricas|toneladas metricas"], ["Tonelada", "ton|tonelada|toneladas"], ["Quilograma", "kg|quilograma|quilogramas|quilo|quilos|kilo|kilos"], ["Hectograma", "hg|hectograma|hectogramas"], ["Decagrama", "dag|decagrama|decagramas"], ["Grama", "g|gr|grama|gramas"], ["Decigrama", "dg|decigrama|decigramas"], ["Centigrama", "cg|centigrama|centigramas"], ["Miligrama", "mg|miligrama|miligramas"], ["Micrograma", "µg|ug|micrograma|microgramas"], ["Nanograma", "ng|nanograma|nanogramas"], ["Picograma", "pg|picograma|picogramas"], ["Libra", "lb|libra|libras"], ["Onça", "oz|onça|onca|onças|oncas"], ["Grão", "grão|grao|grãos|graos|gr"], ["Quilate", "ct|kt|quilate|quilates"]]);
})(PortugueseNumericWithUnit = exports.PortugueseNumericWithUnit || (exports.PortugueseNumericWithUnit = {}));

});

unwrapExports(portugueseNumericWithUnit);

var base$4 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class PortugueseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        this.cultureInfo = ci;
        this.unitNumExtractor = new recognizersTextNumber.PortugueseNumberExtractor();
        this.buildPrefix = portugueseNumericWithUnit.PortugueseNumericWithUnit.BuildPrefix;
        this.buildSuffix = portugueseNumericWithUnit.PortugueseNumericWithUnit.BuildSuffix;
        this.connectorToken = portugueseNumericWithUnit.PortugueseNumericWithUnit.ConnectorToken;
        this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(portugueseNumericWithUnit.PortugueseNumericWithUnit.CompoundUnitConnectorRegex);
        this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(baseUnits.BaseUnits.PmNonUnitRegex);
    }
}
exports.PortugueseNumberWithUnitExtractorConfiguration = PortugueseNumberWithUnitExtractorConfiguration;
class PortugueseNumberWithUnitParserConfiguration extends parsers$4.BaseNumberWithUnitParserConfiguration {
    constructor(ci) {
        super(ci);
        this.internalNumberExtractor = new recognizersTextNumber.PortugueseNumberExtractor(recognizersTextNumber.NumberMode.Default);
        this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.PortugueseNumberParserConfiguration());
        this.connectorToken = portugueseNumericWithUnit.PortugueseNumericWithUnit.ConnectorToken;
    }
}
exports.PortugueseNumberWithUnitParserConfiguration = PortugueseNumberWithUnitParserConfiguration;

});

unwrapExports(base$4);

var currency$4 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class PortugueseCurrencyExtractorConfiguration extends base$4.PortugueseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_CURRENCY;
        // Reference Source: https:// en.wikipedia.org/wiki/List_of_circulating_currencies
        this.suffixList = portugueseNumericWithUnit.PortugueseNumericWithUnit.CurrencySuffixList;
        this.prefixList = portugueseNumericWithUnit.PortugueseNumericWithUnit.CurrencyPrefixList;
        this.ambiguousUnitList = portugueseNumericWithUnit.PortugueseNumericWithUnit.AmbiguousCurrencyUnitList;
    }
}
exports.PortugueseCurrencyExtractorConfiguration = PortugueseCurrencyExtractorConfiguration;
class PortugueseCurrencyParserConfiguration extends base$4.PortugueseNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
        }
        super(ci);
        this.BindDictionary(portugueseNumericWithUnit.PortugueseNumericWithUnit.CurrencySuffixList);
        this.BindDictionary(portugueseNumericWithUnit.PortugueseNumericWithUnit.CurrencyPrefixList);
    }
}
exports.PortugueseCurrencyParserConfiguration = PortugueseCurrencyParserConfiguration;

});

unwrapExports(currency$4);

var temperature$4 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class PortugueseTemperatureExtractorConfiguration extends base$4.PortugueseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_TEMPERATURE;
        this.suffixList = portugueseNumericWithUnit.PortugueseNumericWithUnit.TemperatureSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = new Array();
    }
}
exports.PortugueseTemperatureExtractorConfiguration = PortugueseTemperatureExtractorConfiguration;
class PortugueseTemperatureParserConfiguration extends base$4.PortugueseNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
        }
        super(ci);
        this.BindDictionary(portugueseNumericWithUnit.PortugueseNumericWithUnit.TemperatureSuffixList);
    }
}
exports.PortugueseTemperatureParserConfiguration = PortugueseTemperatureParserConfiguration;

});

unwrapExports(temperature$4);

var dimension$4 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




const dimensionSuffixList = new Map([
    ...portugueseNumericWithUnit.PortugueseNumericWithUnit.InformationSuffixList,
    ...portugueseNumericWithUnit.PortugueseNumericWithUnit.AreaSuffixList,
    ...portugueseNumericWithUnit.PortugueseNumericWithUnit.LengthSuffixList,
    ...portugueseNumericWithUnit.PortugueseNumericWithUnit.SpeedSuffixList,
    ...portugueseNumericWithUnit.PortugueseNumericWithUnit.VolumeSuffixList,
    ...portugueseNumericWithUnit.PortugueseNumericWithUnit.WeightSuffixList
]);
class PortugueseDimensionExtractorConfiguration extends base$4.PortugueseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_DIMENSION;
        this.suffixList = dimensionSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = portugueseNumericWithUnit.PortugueseNumericWithUnit.AmbiguousDimensionUnitList;
    }
}
exports.PortugueseDimensionExtractorConfiguration = PortugueseDimensionExtractorConfiguration;
class PortugueseDimensionParserConfiguration extends base$4.PortugueseNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
        }
        super(ci);
        this.BindDictionary(dimensionSuffixList);
    }
}
exports.PortugueseDimensionParserConfiguration = PortugueseDimensionParserConfiguration;

});

unwrapExports(dimension$4);

var age$4 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class PortugueseAgeExtractorConfiguration extends base$4.PortugueseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_AGE;
        this.suffixList = portugueseNumericWithUnit.PortugueseNumericWithUnit.AgeSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = new Array();
    }
}
exports.PortugueseAgeExtractorConfiguration = PortugueseAgeExtractorConfiguration;
class PortugueseAgeParserConfiguration extends base$4.PortugueseNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Portuguese);
        }
        super(ci);
        this.BindDictionary(portugueseNumericWithUnit.PortugueseNumericWithUnit.AgeSuffixList);
    }
}
exports.PortugueseAgeParserConfiguration = PortugueseAgeParserConfiguration;

});

unwrapExports(age$4);

var chineseNumericWithUnit = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var ChineseNumericWithUnit;
(function (ChineseNumericWithUnit) {
    ChineseNumericWithUnit.AgeAmbiguousValues = ['岁'];
    ChineseNumericWithUnit.AgeSuffixList = new Map([["Year", "岁|周岁"], ["Month", "个月大|月大"], ["Week", "周大"], ["Day", "天大"]]);
    ChineseNumericWithUnit.BuildPrefix = '';
    ChineseNumericWithUnit.BuildSuffix = '';
    ChineseNumericWithUnit.ConnectorToken = '';
    ChineseNumericWithUnit.CurrencySuffixList = new Map([["Afghan afghani", "阿富汗尼"], ["Pul", "普尔"], ["Euro", "欧元"], ["Cent", "美分"], ["Albanian lek", "阿尔巴尼亚列克|列克"], ["Angolan kwanza", "安哥拉宽扎|宽扎"], ["Armenian dram", "亚美尼亚德拉姆"], ["Aruban florin", "阿鲁巴弗罗林|阿鲁巴币"], ["Bangladeshi taka", "塔卡|孟加拉塔卡"], ["Paisa", "派萨|帕萨"], ["Bhutanese ngultrum", "不丹努尔特鲁姆|不丹努扎姆|努扎姆"], ["Chetrum", "切特鲁姆"], ["Bolivian boliviano", "玻利维亚诺|玻利维亚币"], ["Bosnia and Herzegovina convertible mark", "波斯尼亚和黑塞哥维那可兑换马克|波赫可兑换马克"], ["Botswana pula", "博茨瓦纳普拉|普拉"], ["Thebe", "thebe"], ["Brazilian real", "巴西雷亚尔"], ["Bulgarian lev", "保加利亚列弗|保加利亚列瓦"], ["Stotinka", "斯托丁卡"], ["Cambodian riel", "瑞尔"], ["Cape Verdean escudo", "佛得角埃斯库多|维德角埃斯库多"], ["Croatian kuna", "克罗地亚库纳|克罗地亚库那|克罗埃西亚库纳"], ["Lipa", "利巴"], ["Eritrean nakfa", "厄立特里亚纳克法"], ["Ethiopian birr", "埃塞俄比亚比尔|埃塞俄比亚元"], ["Gambian dalasi", "冈比亚达拉西|甘比亚达拉西"], ["Butut", "布达|布图"], ["Georgian lari", "格鲁吉亚拉里"], ["Tetri", "特特里|泰特里"], ["Ghanaian cedi", "塞地|加纳塞地"], ["Pesewa", "比塞瓦"], ["Guatemalan quetzal", "瓜地马拉格查尔"], ["Haitian gourde", "海地古德"], ["Honduran lempira", "洪都拉斯伦皮拉"], ["Hungarian forint", "匈牙利福林|匈牙利货币|匈牙利福林币"], ["Iranian rial", "伊朗里亚尔|伊朗莱尔"], ["Yemeni rial", "叶门莱尔|叶门里亚尔"], ["Israeli new shekel", "₪|ils|以色列币|以色列新克尔|谢克尔"], ["Japanese yen", "日元|日本元|日币|日圆"], ["Sen", "日本銭"], ["Kazakhstani tenge", "哈萨克斯坦坚戈"], ["Kenyan shilling", "肯尼亚先令"], ["North Korean won", "朝鲜圆|朝鲜元"], ["South Korean won", "韩元|韩圆"], ["Korean won", "₩"], ["Kyrgyzstani som", "吉尔吉斯斯坦索姆"], ["Lao kip", "基普|老挝基普|老挝币"], ["Att", "att"], ["Lesotho loti", "莱索托洛提|莱索托马洛蒂"], ["South African rand", "南非兰特"], ["Macedonian denar", "马其顿代纳尔|马其顿币|第纳尔|代纳尔"], ["Deni", "第尼"], ["Malagasy ariary", "马达加斯加阿里亚里"], ["Iraimbilanja", "伊莱姆比拉贾"], ["Malawian kwacha", "马拉威克瓦查"], ["Tambala", "坦巴拉"], ["Malaysian ringgit", "马来西亚币|马币|马来西亚林吉特"], ["Mauritanian ouguiya", "毛里塔尼亚乌吉亚"], ["Khoums", "库姆斯"], ["Mozambican metical", "莫桑比克梅蒂卡尔|梅蒂卡尔"], ["Burmese kyat", "缅甸元|缅元"], ["Pya", "缅分"], ["Nigerian naira", "尼日利亚奈拉|尼日利亚币|奈拉"], ["Kobo", "考包"], ["Turkish lira", "土耳其里拉"], ["Kuruş", "库鲁"], ["Omani rial", "阿曼里亚尔|阿曼莱尔"], ["Panamanian balboa", "巴拿马巴波亚"], ["Centesimo", "意大利分|乌拉圭分|巴拿马分"], ["Papua New Guinean kina", "基那"], ["Toea", "托亚|托伊"], ["Peruvian sol", "秘鲁索尔"], ["Polish złoty", "波兰币|波兰兹罗提|兹罗提"], ["Grosz", "格罗希"], ["Qatari riyal", "卡达里亚尔"], ["Saudi riyal", "沙特里亚尔"], ["Riyal", "里亚尔|"], ["Dirham", "迪拉姆"], ["Halala", "哈拉"], ["Samoan tālā", "萨摩亚塔拉"], ["Sierra Leonean leone", "塞拉利昂利昂|利昂"], ["Peseta", "比塞塔|西班牙比塞塔|西班牙币"], ["Swazi lilangeni", "斯威士兰里兰吉尼|兰吉尼"], ["Tajikistani somoni", "塔吉克斯坦索莫尼"], ["Thai baht", "泰铢|泰元"], ["Satang", "萨当"], ["Tongan paʻanga", "汤加潘加|潘加"], ["Ukrainian hryvnia", "乌克兰格里夫纳|格里夫纳"], ["Vanuatu vatu", "瓦努阿图瓦图"], ["Vietnamese dong", "越南盾"], ["Indonesian rupiah", "印度尼西亚盾"], ["Netherlands guilder", "荷兰盾|荷属安的列斯盾|列斯盾"], ["Surinam florin", "苏里南盾"], ["Guilder", "盾"], ["Zambian kwacha", "赞比亚克瓦查"], ["Moroccan dirham", "摩洛哥迪拉姆"], ["United Arab Emirates dirham", "阿联酋迪拉姆"], ["Azerbaijani manat", "阿塞拜疆马纳特"], ["Turkmenistan manat", "土库曼马纳特"], ["Manat", "马纳特"], ["Somali shilling", "索马里先令|索马利先令"], ["Somaliland shilling", "索马里兰先令"], ["Tanzanian shilling", "坦桑尼亚先令"], ["Ugandan shilling", "乌干达先令"], ["Romanian leu", "罗马尼亚列伊"], ["Moldovan leu", "摩尔多瓦列伊"], ["Leu", "列伊"], ["Ban", "巴尼"], ["Nepalese rupee", "尼泊尔卢比"], ["Pakistani rupee", "巴基斯坦卢比"], ["Indian rupee", "印度卢比"], ["Seychellois rupee", "塞舌尔卢比"], ["Mauritian rupee", "毛里求斯卢比"], ["Maldivian rufiyaa", "马尔代夫卢比"], ["Sri Lankan rupee", "斯里兰卡卢比"], ["Rupee", "卢比"], ["Czech koruna", "捷克克朗"], ["Danish krone", "丹麦克朗|丹麦克郎"], ["Norwegian krone", "挪威克朗"], ["Faroese króna", "法罗克朗"], ["Icelandic króna", "冰岛克朗"], ["Swedish krona", "瑞典克朗"], ["Krone", "克朗"], ["Øre", "奥依拉|奥拉|埃利"], ["West African CFA franc", "非共体法郎"], ["Central African CFA franc", "中非法郎|中非金融合作法郎"], ["Comorian franc", "科摩罗法郎"], ["Congolese franc", "刚果法郎"], ["Burundian franc", "布隆迪法郎"], ["Djiboutian franc", "吉布提法郎"], ["CFP franc", "太平洋法郎"], ["Guinean franc", "几内亚法郎"], ["Swiss franc", "瑞士法郎"], ["Rwandan franc", "卢旺达法郎"], ["Belgian franc", "比利时法郎"], ["Rappen", "瑞士分|瑞士生丁"], ["Franc", "法郎"], ["Centime", "生丁|仙士"], ["Russian ruble", "俄国卢布|俄罗斯卢布"], ["Transnistrian ruble", "德涅斯特卢布"], ["Belarusian ruble", "白俄罗斯卢布"], ["Kopek", "戈比"], ["Ruble", "卢布"], ["Algerian dinar", "阿尔及利亚第纳尔"], ["Bahraini dinar", "巴林第纳尔"], ["Iraqi dinar", "伊拉克第纳尔|"], ["Jordanian dinar", "约旦第纳尔"], ["Kuwaiti dinar", "科威特第纳尔|科威特币"], ["Libyan dinar", "利比亚第纳尔"], ["Serbian dinar", "塞尔维亚第纳尔|塞尔维亚币"], ["Tunisian dinar", "突尼斯第纳尔"], ["Dinar", "第纳尔"], ["Fils", "费尔"], ["Para", "帕拉"], ["Millime", "米利姆"], ["Argentine peso", "阿根廷比索"], ["Chilean peso", "智利比索"], ["Colombian peso", "哥伦比亚比索"], ["Cuban peso", "古巴比索"], ["Dominican peso", "多米尼加比索"], ["Mexican peso", "墨西哥比索"], ["Philippine peso", "菲律宾比索"], ["Uruguayan peso", "乌拉圭比索"], ["Peso", "比索"], ["Centavo", "仙|菲辅币"], ["Alderney pound", "奥尔德尼镑"], ["British pound", "英镑"], ["Guernsey pound", "根西镑"], ["Saint Helena pound", "圣赫勒拿镑"], ["Egyptian pound", "埃及镑"], ["Falkland Islands pound", "福克兰镑"], ["Gibraltar pound", "直布罗陀镑"], ["Manx pound", "马恩岛镑"], ["Jersey pound", "泽西岛镑"], ["Lebanese pound", "黎巴嫩镑"], ["South Sudanese pound", "南苏丹镑"], ["Sudanese pound", "苏丹镑"], ["Syrian pound", "叙利亚镑"], ["Pound", "英镑"], ["Pence", "便士"], ["Shilling", "先令"], ["United States dollar", "美元|美金|美圆"], ["East Caribbean dollar", "东加勒比元"], ["Australian dollar", "澳大利亚元|澳元"], ["Bahamian dollar", "巴哈马元"], ["Barbadian dollar", "巴巴多斯元"], ["Belize dollar", "伯利兹元"], ["Bermudian dollar", "百慕大元"], ["Brunei dollar", "文莱元"], ["Singapore dollar", "新加坡元|新元"], ["Canadian dollar", "加元|加拿大元"], ["Cayman Islands dollar", "开曼岛元|"], ["New Zealand dollar", "新西兰元|纽元"], ["Cook Islands dollar", "库克群岛元"], ["Fijian dollar", "斐济元|斐币"], ["Guyanese dollar", "圭亚那元"], ["Hong Kong dollar", "蚊|港元|港圆|港币"], ["Macau Pataca", "澳元|澳门币|澳门元"], ["New Taiwan dollar", "箍|新台币|台币"], ["Jamaican dollar", "牙买加元"], ["Kiribati dollar", "吉里巴斯元"], ["Liberian dollar", "利比里亚元"], ["Namibian dollar", "纳米比亚元"], ["Surinamese dollar", "苏里南元"], ["Trinidad and Tobago dollar", "特立尼达多巴哥元"], ["Tuvaluan dollar", "吐瓦鲁元"], ["Chinese yuan", "人民币|人民币元|块钱|块|元|圆"], ["Fen", "分钱|分"], ["Jiao", "毛钱|毛|角钱|角"], ["Finnish markka", "芬兰马克"], ["Penni", "盆尼"]]);
    ChineseNumericWithUnit.CurrencyNameToIsoCodeMap = new Map([["Afghan afghani", "AFN"], ["Euro", "EUR"], ["Albanian lek", "ALL"], ["Angolan kwanza", "AOA"], ["Armenian dram", "AMD"], ["Aruban florin", "AWG"], ["Bangladeshi taka", "BDT"], ["Bhutanese ngultrum", "BTN"], ["Bolivian boliviano", "BOB"], ["Bosnia and Herzegovina convertible mark", "BAM"], ["Botswana pula", "BWP"], ["Brazilian real", "BRL"], ["Bulgarian lev", "BGN"], ["Cambodian riel", "KHR"], ["Cape Verdean escudo", "CVE"], ["Costa Rican colón", "CRC"], ["Croatian kuna", "HRK"], ["Czech koruna", "CZK"], ["Eritrean nakfa", "ERN"], ["Ethiopian birr", "ETB"], ["Gambian dalasi", "GMD"], ["Georgian lari", "GEL"], ["Ghanaian cedi", "GHS"], ["Guatemalan quetzal", "GTQ"], ["Haitian gourde", "HTG"], ["Honduran lempira", "HNL"], ["Hungarian forint", "HUF"], ["Iranian rial", "IRR"], ["Yemeni rial", "YER"], ["Israeli new shekel", "ILS"], ["Japanese yen", "JPY"], ["Kazakhstani tenge", "KZT"], ["Kenyan shilling", "KES"], ["North Korean won", "KPW"], ["South Korean won", "KRW"], ["Kyrgyzstani som", "KGS"], ["Lao kip", "LAK"], ["Lesotho loti", "LSL"], ["South African rand", "ZAR"], ["Macanese pataca", "MOP"], ["Macedonian denar", "MKD"], ["Malagasy ariary", "MGA"], ["Malawian kwacha", "MWK"], ["Malaysian ringgit", "MYR"], ["Mauritanian ouguiya", "MRO"], ["Mongolian tögrög", "MNT"], ["Mozambican metical", "MZN"], ["Burmese kyat", "MMK"], ["Nicaraguan córdoba", "NIO"], ["Nigerian naira", "NGN"], ["Turkish lira", "TRY"], ["Omani rial", "OMR"], ["Panamanian balboa", "PAB"], ["Papua New Guinean kina", "PGK"], ["Paraguayan guaraní", "PYG"], ["Peruvian sol", "PEN"], ["Polish złoty", "PLN"], ["Qatari riyal", "QAR"], ["Saudi riyal", "SAR"], ["Samoan tālā", "WST"], ["São Tomé and Príncipe dobra", "STD"], ["Sierra Leonean leone", "SLL"], ["Swazi lilangeni", "SZL"], ["Tajikistani somoni", "TJS"], ["Thai baht", "THB"], ["Ukrainian hryvnia", "UAH"], ["Vanuatu vatu", "VUV"], ["Venezuelan bolívar", "VEF"], ["Zambian kwacha", "ZMW"], ["Moroccan dirham", "MAD"], ["United Arab Emirates dirham", "AED"], ["Azerbaijani manat", "AZN"], ["Turkmenistan manat", "TMT"], ["Somali shilling", "SOS"], ["Tanzanian shilling", "TZS"], ["Ugandan shilling", "UGX"], ["Romanian leu", "RON"], ["Moldovan leu", "MDL"], ["Nepalese rupee", "NPR"], ["Pakistani rupee", "PKR"], ["Indian rupee", "INR"], ["Seychellois rupee", "SCR"], ["Mauritian rupee", "MUR"], ["Maldivian rufiyaa", "MVR"], ["Sri Lankan rupee", "LKR"], ["Indonesian rupiah", "IDR"], ["Danish krone", "DKK"], ["Norwegian krone", "NOK"], ["Icelandic króna", "ISK"], ["Swedish krona", "SEK"], ["West African CFA franc", "XOF"], ["Central African CFA franc", "XAF"], ["Comorian franc", "KMF"], ["Congolese franc", "CDF"], ["Burundian franc", "BIF"], ["Djiboutian franc", "DJF"], ["CFP franc", "XPF"], ["Guinean franc", "GNF"], ["Swiss franc", "CHF"], ["Rwandan franc", "RWF"], ["Russian ruble", "RUB"], ["Transnistrian ruble", "PRB"], ["Belarusian ruble", "BYN"], ["Algerian dinar", "DZD"], ["Bahraini dinar", "BHD"], ["Iraqi dinar", "IQD"], ["Jordanian dinar", "JOD"], ["Kuwaiti dinar", "KWD"], ["Libyan dinar", "LYD"], ["Serbian dinar", "RSD"], ["Tunisian dinar", "TND"], ["Argentine peso", "ARS"], ["Chilean peso", "CLP"], ["Colombian peso", "COP"], ["Cuban convertible peso", "CUC"], ["Cuban peso", "CUP"], ["Dominican peso", "DOP"], ["Mexican peso", "MXN"], ["Uruguayan peso", "UYU"], ["British pound", "GBP"], ["Saint Helena pound", "SHP"], ["Egyptian pound", "EGP"], ["Falkland Islands pound", "FKP"], ["Gibraltar pound", "GIP"], ["Manx pound", "IMP"], ["Jersey pound", "JEP"], ["Lebanese pound", "LBP"], ["South Sudanese pound", "SSP"], ["Sudanese pound", "SDG"], ["Syrian pound", "SYP"], ["United States dollar", "USD"], ["Australian dollar", "AUD"], ["Bahamian dollar", "BSD"], ["Barbadian dollar", "BBD"], ["Belize dollar", "BZD"], ["Bermudian dollar", "BMD"], ["Brunei dollar", "BND"], ["Singapore dollar", "SGD"], ["Canadian dollar", "CAD"], ["Cayman Islands dollar", "KYD"], ["New Zealand dollar", "NZD"], ["Fijian dollar", "FJD"], ["Guyanese dollar", "GYD"], ["Hong Kong dollar", "HKD"], ["Jamaican dollar", "JMD"], ["Liberian dollar", "LRD"], ["Namibian dollar", "NAD"], ["Solomon Islands dollar", "SBD"], ["Surinamese dollar", "SRD"], ["New Taiwan dollar", "TWD"], ["Trinidad and Tobago dollar", "TTD"], ["Tuvaluan dollar", "TVD"], ["Chinese yuan", "CNY"], ["Rial", "__RI"], ["Shiling", "__S"], ["Som", "__SO"], ["Dirham", "__DR"], ["Dinar", "_DN"], ["Dollar", "__D"], ["Manat", "__MA"], ["Rupee", "__R"], ["Krone", "__K"], ["Krona", "__K"], ["Crown", "__K"], ["Frank", "__F"], ["Mark", "__M"], ["Ruble", "__RB"], ["Peso", "__PE"], ["Pound", "__P"], ["Tristan da Cunha pound", "_TP"], ["South Georgia and the South Sandwich Islands pound", "_SP"], ["Somaliland shilling", "_SS"], ["Pitcairn Islands dollar", "_PND"], ["Palauan dollar", "_PD"], ["Niue dollar", "_NID"], ["Nauruan dollar", "_ND"], ["Micronesian dollar", "_MD"], ["Kiribati dollar", "_KID"], ["Guernsey pound", "_GGP"], ["Faroese króna", "_FOK"], ["Cook Islands dollar", "_CKD"], ["British Virgin Islands dollar", "_BD"], ["Ascension pound", "_AP"], ["Alderney pound", "_ALP"], ["Abkhazian apsar", "_AA"]]);
    ChineseNumericWithUnit.FractionalUnitNameToCodeMap = new Map([["Jiao", "JIAO"], ["Kopek", "KOPEK"], ["Pul", "PUL"], ["Cent", "CENT"], ["Qindarkë", "QINDARKE"], ["Penny", "PENNY"], ["Santeem", "SANTEEM"], ["Cêntimo", "CENTIMO"], ["Centavo", "CENTAVO"], ["Luma", "LUMA"], ["Qəpik", "QƏPIK"], ["Fils", "FILS"], ["Poisha", "POISHA"], ["Kapyeyka", "KAPYEYKA"], ["Centime", "CENTIME"], ["Chetrum", "CHETRUM"], ["Paisa", "PAISA"], ["Fening", "FENING"], ["Thebe", "THEBE"], ["Sen", "SEN"], ["Stotinka", "STOTINKA"], ["Fen", "FEN"], ["Céntimo", "CENTIMO"], ["Lipa", "LIPA"], ["Haléř", "HALER"], ["Øre", "ØRE"], ["Piastre", "PIASTRE"], ["Santim", "SANTIM"], ["Oyra", "OYRA"], ["Butut", "BUTUT"], ["Tetri", "TETRI"], ["Pesewa", "PESEWA"], ["Fillér", "FILLER"], ["Eyrir", "EYRIR"], ["Dinar", "DINAR"], ["Agora", "AGORA"], ["Tïın", "TIIN"], ["Chon", "CHON"], ["Jeon", "JEON"], ["Tyiyn", "TYIYN"], ["Att", "ATT"], ["Sente", "SENTE"], ["Dirham", "DIRHAM"], ["Rappen", "RAPPEN"], ["Avo", "AVO"], ["Deni", "DENI"], ["Iraimbilanja", "IRAIMBILANJA"], ["Tambala", "TAMBALA"], ["Laari", "LAARI"], ["Khoums", "KHOUMS"], ["Ban", "BAN"], ["Möngö", "MONGO"], ["Pya", "PYA"], ["Kobo", "KOBO"], ["Kuruş", "KURUS"], ["Baisa", "BAISA"], ["Centésimo", "CENTESIMO"], ["Toea", "TOEA"], ["Sentimo", "SENTIMO"], ["Grosz", "GROSZ"], ["Sene", "SENE"], ["Halala", "HALALA"], ["Para", "PARA"], ["Öre", "ORE"], ["Diram", "DIRAM"], ["Satang", "SATANG"], ["Seniti", "SENITI"], ["Millime", "MILLIME"], ["Tennesi", "TENNESI"], ["Kopiyka", "KOPIYKA"], ["Tiyin", "TIYIN"], ["Hào", "HAO"], ["Ngwee", "NGWEE"]]);
    ChineseNumericWithUnit.CompoundUnitConnectorRegex = `(?<spacer>又|再)`;
    ChineseNumericWithUnit.CurrencyPrefixList = new Map([["Dollar", "$"], ["United States dollar", "us$"], ["British Virgin Islands dollar", "bvi$"], ["Brunei dollar", "b$"], ["Sen", "sen"], ["Singapore dollar", "s$"], ["Canadian dollar", "can$|c$|c $"], ["Cayman Islands dollar", "ci$"], ["New Zealand dollar", "nz$|nz $"], ["Guyanese dollar", "gy$|gy $|g$|g $"], ["Hong Kong dollar", "hk$|hkd|hk $"], ["Jamaican dollar", "j$"], ["Namibian dollar", "nad|n$|n $"], ["Solomon Islands dollar", "si$|si $"], ["New Taiwan dollar", "nt$|nt $"], ["Samoan tālā", "ws$"], ["Chinese yuan", "￥"], ["Japanese yen", "¥"], ["Turkish lira", "₺"], ["Euro", "€"], ["Pound", "£"], ["Costa Rican colón", "₡"]]);
    ChineseNumericWithUnit.CurrencyAmbiguousValues = ['元', '仙', '分', '圆', '块', '毛', '盾', '箍', '蚊', '角'];
    ChineseNumericWithUnit.DimensionSuffixList = new Map([["Meter", "米|公尺|m"], ["Kilometer", "千米|公里|km"], ["Decimeter", "分米|公寸|dm"], ["Centimeter", "釐米|厘米|公分|cm"], ["Micrometer", "毫米|公釐|mm"], ["Microns", "微米"], ["Picometer", "皮米"], ["Nanometer", "纳米"], ["Li", "里|市里"], ["Zhang", "丈"], ["Chi", "市尺|尺"], ["Cun", "市寸|寸"], ["Fen", "市分|分"], ["Hao", "毫"], ["Mile", "英里"], ["Inch", "英寸"], ["Foot", "呎|英尺"], ["Yard", "码"], ["Knot", "海里"], ["Light year", "光年"], ["Meter per second", "米每秒|米/秒|m/s"], ["Kilometer per hour", "公里每小时|千米每小时|公里/小时|千米/小时|km/h"], ["Kilometer per minute", "公里每分钟|千米每分钟|公里/分钟|千米/分钟|km/min"], ["Kilometer per second", "公里每秒|千米每秒|公里/秒|千米/秒|km/s"], ["Mile per hour", "英里每小时|英里/小时"], ["Foot per second", "英尺每小时|英尺/小时"], ["Foot per minute", "英尺每分钟|英尺/分钟"], ["Yard per minute", "码每分|码/分"], ["Yard per second", "码每秒|码/秒"], ["Square centimetre", "平方厘米"], ["Square decimeter", "平方分米"], ["Square meter", "平方米"], ["Square kilometer", "平方公里"], ["Acre", "英亩|公亩"], ["Hectare", "公顷"], ["Mu", "亩|市亩"], ["Liter", "公升|升|l"], ["Milliliter", "毫升|ml"], ["Cubic meter", "立方米"], ["Cubic decimeter", "立方分米"], ["Cubic millimeter", "立方毫米"], ["Cubic feet", "立方英尺"], ["Gallon", "加仑"], ["Pint", "品脱"], ["Dou", "市斗|斗"], ["Dan", "市石|石"], ["Kilogram", "千克|公斤|kg"], ["Jin", "市斤|斤"], ["Milligram", "毫克|mg"], ["Barrel", "桶"], ["Pot", "罐"], ["Gram", "克|g"], ["Ton", "公吨|吨|t"], ["Pound", "磅"], ["Ounce", "盎司"], ["Bit", "比特|位|b"], ["Byte", "字节|byte"], ["Kilobyte", "千字节|kb"], ["Megabyte", "兆字节|mb"], ["Gigabyte", "十亿字节|千兆字节|gb"], ["Terabyte", "万亿字节|兆兆字节|tb"], ["Petabyte", "千兆兆|千万亿字节|pb"]]);
    ChineseNumericWithUnit.DimensionAmbiguousValues = ['丈', '位', '克', '分', '升', '寸', '尺', '斗', '斤', '桶', '毫', '石', '码', '磅', '米', '罐', '里', 'm', 'km', 'dm', 'cm', 'mm', 'l', 'ml', 'kg', 'mg', 'g', 't', 'b', 'byte', 'kb', 'mb', 'gb', 'tb', 'pb'];
    ChineseNumericWithUnit.TemperatureSuffixList = new Map([["F", "华氏温度|华氏度|°f"], ["K", "k|开尔文温度|开氏度|凯氏度"], ["R", "兰氏温度|°r"], ["C", "摄氏温度|摄氏度|°c"], ["Degree", "度"]]);
    ChineseNumericWithUnit.TemperaturePrefixList = new Map([["F", "华氏温度|华氏"], ["K", "开氏温度|开氏"], ["R", "兰氏温度|兰氏"], ["C", "摄氏温度|摄氏"]]);
    ChineseNumericWithUnit.TemperatureAmbiguousValues = ['度', 'k'];
})(ChineseNumericWithUnit = exports.ChineseNumericWithUnit || (exports.ChineseNumericWithUnit = {}));

});

unwrapExports(chineseNumericWithUnit);

var base$6 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class ChineseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        this.cultureInfo = ci;
        this.unitNumExtractor = new recognizersTextNumber.ChineseNumberExtractor(recognizersTextNumber.ChineseNumberExtractorMode.ExtractAll);
        this.buildPrefix = chineseNumericWithUnit.ChineseNumericWithUnit.BuildPrefix;
        this.buildSuffix = chineseNumericWithUnit.ChineseNumericWithUnit.BuildSuffix;
        this.connectorToken = chineseNumericWithUnit.ChineseNumericWithUnit.ConnectorToken;
        this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(chineseNumericWithUnit.ChineseNumericWithUnit.CompoundUnitConnectorRegex);
        this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(baseUnits.BaseUnits.PmNonUnitRegex);
    }
}
exports.ChineseNumberWithUnitExtractorConfiguration = ChineseNumberWithUnitExtractorConfiguration;
class ChineseNumberWithUnitParserConfiguration extends parsers$4.BaseNumberWithUnitParserConfiguration {
    constructor(ci) {
        super(ci);
        this.internalNumberExtractor = new recognizersTextNumber.ChineseNumberExtractor(recognizersTextNumber.ChineseNumberExtractorMode.Default);
        this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.ChineseNumberParserConfiguration());
        this.connectorToken = '';
        this.currencyNameToIsoCodeMap = chineseNumericWithUnit.ChineseNumericWithUnit.CurrencyNameToIsoCodeMap;
        this.currencyFractionCodeList = chineseNumericWithUnit.ChineseNumericWithUnit.FractionalUnitNameToCodeMap;
    }
}
exports.ChineseNumberWithUnitParserConfiguration = ChineseNumberWithUnitParserConfiguration;

});

unwrapExports(base$6);

var currency$6 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class ChineseCurrencyExtractorConfiguration extends base$6.ChineseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_CURRENCY;
        // Reference Source: https:// en.wikipedia.org/wiki/List_of_circulating_currencies
        this.suffixList = chineseNumericWithUnit.ChineseNumericWithUnit.CurrencySuffixList;
        this.prefixList = chineseNumericWithUnit.ChineseNumericWithUnit.CurrencyPrefixList;
        this.ambiguousUnitList = chineseNumericWithUnit.ChineseNumericWithUnit.CurrencyAmbiguousValues;
        
    }
}
exports.ChineseCurrencyExtractorConfiguration = ChineseCurrencyExtractorConfiguration;
class ChineseCurrencyParserConfiguration extends base$6.ChineseNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
        }
        super(ci);
        this.BindDictionary(chineseNumericWithUnit.ChineseNumericWithUnit.CurrencySuffixList);
        this.BindDictionary(chineseNumericWithUnit.ChineseNumericWithUnit.CurrencyPrefixList);
    }
}
exports.ChineseCurrencyParserConfiguration = ChineseCurrencyParserConfiguration;

});

unwrapExports(currency$6);

var temperature$6 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class ChineseTemperatureExtractorConfiguration extends base$6.ChineseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_TEMPERATURE;
        this.suffixList = chineseNumericWithUnit.ChineseNumericWithUnit.TemperatureSuffixList;
        this.prefixList = chineseNumericWithUnit.ChineseNumericWithUnit.TemperaturePrefixList;
        this.ambiguousUnitList = chineseNumericWithUnit.ChineseNumericWithUnit.TemperatureAmbiguousValues;
    }
}
exports.ChineseTemperatureExtractorConfiguration = ChineseTemperatureExtractorConfiguration;
class ChineseTemperatureParserConfiguration extends base$6.ChineseNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
        }
        super(ci);
        this.BindDictionary(chineseNumericWithUnit.ChineseNumericWithUnit.TemperaturePrefixList);
        this.BindDictionary(chineseNumericWithUnit.ChineseNumericWithUnit.TemperatureSuffixList);
    }
}
exports.ChineseTemperatureParserConfiguration = ChineseTemperatureParserConfiguration;

});

unwrapExports(temperature$6);

var dimension$6 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class ChineseDimensionExtractorConfiguration extends base$6.ChineseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_DIMENSION;
        this.suffixList = chineseNumericWithUnit.ChineseNumericWithUnit.DimensionSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = chineseNumericWithUnit.ChineseNumericWithUnit.DimensionAmbiguousValues;
    }
}
exports.ChineseDimensionExtractorConfiguration = ChineseDimensionExtractorConfiguration;
class ChineseDimensionParserConfiguration extends base$6.ChineseNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
        }
        super(ci);
        this.BindDictionary(chineseNumericWithUnit.ChineseNumericWithUnit.DimensionSuffixList);
    }
}
exports.ChineseDimensionParserConfiguration = ChineseDimensionParserConfiguration;

});

unwrapExports(dimension$6);

var age$6 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class ChineseAgeExtractorConfiguration extends base$6.ChineseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_AGE;
        this.suffixList = chineseNumericWithUnit.ChineseNumericWithUnit.AgeSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = chineseNumericWithUnit.ChineseNumericWithUnit.AgeAmbiguousValues;
    }
}
exports.ChineseAgeExtractorConfiguration = ChineseAgeExtractorConfiguration;
class ChineseAgeParserConfiguration extends base$6.ChineseNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese);
        }
        super(ci);
        this.BindDictionary(chineseNumericWithUnit.ChineseNumericWithUnit.AgeSuffixList);
    }
}
exports.ChineseAgeParserConfiguration = ChineseAgeParserConfiguration;

});

unwrapExports(age$6);

var japaneseNumericWithUnit = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var JapaneseNumericWithUnit;
(function (JapaneseNumericWithUnit) {
    JapaneseNumericWithUnit.AgeAmbiguousValues = ['歳'];
    JapaneseNumericWithUnit.AgeSuffixList = new Map([["Year", "歳"], ["Month", "ヶ月"], ["Week", "週間|週"], ["Day", "日間|日齢|日大"]]);
    JapaneseNumericWithUnit.BuildPrefix = '';
    JapaneseNumericWithUnit.BuildSuffix = '';
    JapaneseNumericWithUnit.ConnectorToken = '';
    JapaneseNumericWithUnit.CurrencySuffixList = new Map([["Afghan afghani", "アフガニ"], ["Pul", "プル"], ["Euro", "ユーロ"], ["Cent", "セント"], ["Albanian lek", "アルバニアレク|アルバニア・レク|レク"], ["Angolan kwanza", "アンゴラクワンザ|アンゴラ・クワンザ|クワンザ"], ["Armenian dram", "アルメニアドラム|アルメニア・ドラム|ドラム"], ["Aruban florin", "アルバ・フロリン|フロリン"], ["Bangladeshi taka", "タカ|バングラデシュ・タカ"], ["Paisa", "パイサ"], ["Bhutanese ngultrum", "ニュルタム|ブータン・ニュルタム|ブータンニュルタム"], ["Chetrum", "チェルタム"], ["Bolivian boliviano", "ボリビアーノ"], ["Bosnia and Herzegovina convertible mark", "兌換マルク"], ["Botswana pula", "ボツワナ・プラ|ボツワナプラ|プラ"], ["Thebe", "テベ"], ["Brazilian real", "ブラジル・レアル|ブラジルレアル|レアル"], ["Bulgarian lev", "ブルガリア・レフ|ブルガリアレフ|レフ"], ["Stotinka", "ストティンカ"], ["Cambodian riel", "カンボジア・リエル|カンボジアリエル|リエル"], ["Cape Verdean escudo", "カーボベルデ・エスクード"], ["Croatian kuna", "クロアチアクーナ|クロアチア・クーナ|クーナ"], ["Lipa", "リパ"], ["Eritrean nakfa", "エリトリア・ナクファ|エリトリアナクファ|ナクファ"], ["Ethiopian birr", "エチオピア・ブル|エチオピアブル|ブル"], ["Gambian dalasi", "ガンビア・ダラシ|ガンビアダラシ|ダラシ"], ["Butut", "ブトゥツ"], ["Georgian lari", "ジョージア・ラリ|ジョージアラリ|ラリ"], ["Tetri", "テトリ"], ["Ghanaian cedi", "ガーナ・セディ|ガーナセディ|セディ"], ["Pesewa", "ペセワ"], ["Guatemalan quetzal", "グアテマラ・ケツァル|グアテマラケツァル|ケツァル"], ["Haitian gourde", "ハイチ・グールド|ハイチグールド|グールド"], ["Honduran lempira", "ホンジュラス・レンピラ|ホンジュラスレンピラ|レンピラ"], ["Hungarian forint", "ハンガリー・フォリント|ハンガリーフォリント|フォリント"], ["Iranian rial", "イラン・リアル"], ["Yemeni rial", "イエメン・リアル"], ["Israeli new shekel", "₪|ils|イスラエル・新シェケル|イスラエル新シェケル"], ["Japanese yen", "円"], ["Sen", "銭"], ["Kazakhstani tenge", "テンゲ|カザフスタン・テンゲ|カザフスタンテンゲ"], ["Kenyan shilling", "ケニア・シリング"], ["North Korean won", "北朝鮮ウォン"], ["South Korean won", "韓国ウォン"], ["Korean won", "₩"], ["Kyrgyzstani som", "キルギス・ソム|ソム"], ["Lao kip", "キップ|ラオス・キップ|ラオスキップ"], ["Att", "att"], ["Lesotho loti", "ロチ|レソト・ロチ|レソトロチ"], ["South African rand", "ランド|南アフリカ・ランド|南アフリカランド"], ["Macedonian denar", "マケドニア・デナール"], ["Deni", "デニ"], ["Malagasy ariary", "アリアリ|マダガスカル・アリアリ|マダガスカルアリアリ"], ["Iraimbilanja", "イライムビランジャ"], ["Malawian kwacha", "マラウイ・クワチャ"], ["Tambala", "タンバラ"], ["Malaysian ringgit", "リンギット|マレーシア・リンギット"], ["Mauritanian ouguiya", "ウギア|モーリタニア・ウギア|モーリタニアウギア"], ["Khoums", "コウム"], ["Mozambican metical", "メティカル|モザンビーク・メティカル|モザンビークメティカル"], ["Burmese kyat", "チャット|ミャンマー・チャット|ミャンマーチャット"], ["Pya", "ピャー"], ["Nigerian naira", "ナイラ|ナイジェリア・ナイラ|ナイジェリアナイラ"], ["Kobo", "コボ"], ["Turkish lira", "トルコリラ"], ["Kuruş", "クルシュ"], ["Omani rial", "オマーン・リアル"], ["Panamanian balboa", "バルボア|パナマ・バルボア|パナマバルボア"], ["Centesimo", "センテシモ"], ["Papua New Guinean kina", "キナ|パプア・ニューギニア・キナ"], ["Toea", "トエア"], ["Peruvian sol", "ヌエボ・ソル"], ["Polish złoty", "ズウォティ|ポーランド・ズウォティ|ポーランドズウォティ"], ["Grosz", "グロシュ"], ["Qatari riyal", "カタール・リヤル"], ["Saudi riyal", "サウジアラビア・リヤル"], ["Riyal", "リヤル"], ["Dirham", "ディルハム"], ["Halala", "ハララ"], ["Samoan tālā", "タラ|サモア・タラ|サモアタラ"], ["Sierra Leonean leone", "レオン|シエラレオネ・レオン|シエラレオネレオン"], ["Peseta", "ユーロ"], ["Swazi lilangeni", "リランゲニ|スワジランド・リランゲニ|スワジランドリランゲニ"], ["Tajikistani somoni", "ソモニ|タジキスタン・ソモニ|タジキスタンソモニ"], ["Thai baht", "バーツ|タイ・バーツ|タイバーツ"], ["Satang", "サタン"], ["Tongan paʻanga", "パアンガ|トンガ・パアンガ|トンガパアンガ"], ["Ukrainian hryvnia", "フリヴニャ|ウクライナ・フリヴニャ|ウクライナフリヴニャ"], ["Vanuatu vatu", "バツ|バヌアツ・バツ|バヌアツバツ"], ["Vietnamese dong", "ドン|ベトナム・ドン|ベトナムドン"], ["Indonesian rupiah", "ルピア|インドネシア・ルピア|インドネシアルピア"], ["Netherlands guilder", "ユーロ|オランダ・ユーロ"], ["Surinam florin", "スリナム・ドル"], ["Zambian kwacha", "ザンビア・クワチャ"], ["Moroccan dirham", "モロッコ・ディルハム"], ["United Arab Emirates dirham", "UAEディルハム"], ["Azerbaijani manat", "アゼルバイジャン・マナト"], ["Turkmenistan manat", "トルクメニスタン・マナト"], ["Manat", "マナト"], ["Somali shilling", "ソマリア・シリング"], ["Somaliland shilling", "ソマリランド・シリング"], ["Tanzanian shilling", "タンザニア・シリング"], ["Ugandan shilling", "ウガンダ・シリング"], ["Romanian leu", "ルーマニア・レウ"], ["Moldovan leu", "モルドバ・レウ"], ["Leu", "レウ"], ["Ban", "バン"], ["Nepalese rupee", "ネパール・ルピー"], ["Pakistani rupee", "パキスタン・ルピー"], ["Indian rupee", "インド・ルピー"], ["Seychellois rupee", "セーシェル・ルピー"], ["Mauritian rupee", "モーリシャス・ルピー"], ["Maldivian rufiyaa", "ルフィヤ|モルディブ・ルフィヤ|モルディブルフィヤ"], ["Sri Lankan rupee", "スリランカ・ルピー"], ["Rupee", "ルピー"], ["Czech koruna", "チェコ・コルナ"], ["Danish krone", "デンマーク・クローネ"], ["Norwegian krone", "ノルウェー・クローネ"], ["Faroese króna", "フェロー・クローネ"], ["Icelandic króna", "アイスランド・クローナ"], ["Swedish krona", "スウェーデン・クローナ"], ["Krone", "クローナ"], ["Øre", "オーレ"], ["West African CFA franc", "CFAフラン"], ["Central African CFA franc", "CFAフラン"], ["Comorian franc", "コモロ・フラン"], ["Congolese franc", "コンゴ・フラン"], ["Burundian franc", "ブルンジ・フラン"], ["Djiboutian franc", "ジブチ・フラン"], ["CFP franc", "CFPフラン"], ["Guinean franc", "ギニア・フラン"], ["Swiss franc", "スイス・フラン"], ["Rwandan franc", "ルワンダ・フラン"], ["Belgian franc", "ベルギー・フラン"], ["Rappen", "Rappen"], ["Franc", "フラン"], ["Centime", "サンチーム"], ["Russian ruble", "ロシア・ルーブル"], ["Transnistrian ruble", "沿ドニエストル・ルーブル"], ["Belarusian ruble", "ベラルーシ・ルーブル"], ["Kopek", "カペイカ"], ["Ruble", "ルーブル"], ["Algerian dinar", "アルジェリア・ディナール"], ["Bahraini dinar", "バーレーン・ディナール"], ["Iraqi dinar", "イラク・ディナール"], ["Jordanian dinar", "ヨルダン・ディナール"], ["Kuwaiti dinar", "クウェート・ディナール"], ["Libyan dinar", "リビア・ディナール"], ["Serbian dinar", "セルビア・ディナール"], ["Tunisian dinar", "チュニジア・ディナール"], ["Dinar", "ディナール"], ["Fils", "フィルス"], ["Para", "パラ"], ["Millime", "ミリム"], ["Argentine peso", "ペソ|アルゼンチン・ペソ"], ["Chilean peso", "チリ・ペソ"], ["Colombian peso", "コロンビア・ペソ"], ["Cuban peso", "兌換ペソ"], ["Dominican peso", "ドミニカ・ペソ"], ["Mexican peso", "メキシコ・ペソ"], ["Philippine peso", "フィリピン・ペソ"], ["Uruguayan peso", "ウルグアイ・ペソ"], ["Peso", "ペソ"], ["Centavo", "センターボ"], ["Alderney pound", "ガーンジー・ポンド"], ["British pound", "UKポンド"], ["Guernsey pound", "ガーンジー・ポンド"], ["Saint Helena pound", "セントヘレナ・ポンド"], ["Egyptian pound", "エジプト・ポンド"], ["Falkland Islands pound", "フォークランド諸島ポンド"], ["Gibraltar pound", "ジブラルタル・ポンド"], ["Manx pound", "マン島ポンド"], ["Jersey pound", "ジャージー・ポンド"], ["Lebanese pound", "レバノン・ポンド"], ["South Sudanese pound", "南スーダン・ポンド"], ["Sudanese pound", "スーダン・ポンド"], ["Syrian pound", "シリア・ポンド"], ["Pound", "ポンド"], ["Pence", "ペニー"], ["Shilling", "シリング"], ["United States dollar", "ドル|USドル"], ["East Caribbean dollar", "東カリブ・ドル"], ["Australian dollar", "オーストラリア・ドル"], ["Bahamian dollar", "バハマ・ドル"], ["Barbadian dollar", "バルバドス・ドル"], ["Belize dollar", "ベリーズ・ドル"], ["Bermudian dollar", "バミューダ・ドル"], ["Brunei dollar", "ブルネイ・ドル"], ["Singapore dollar", "シンガポール・ドル"], ["Canadian dollar", "カナダ・ドル"], ["Cayman Islands dollar", "ケイマン諸島・ドル"], ["New Zealand dollar", "ニュージーランド・ドル"], ["Cook Islands dollar", "ニュージーランド・ドル|ニュージーランド・ドル"], ["Fijian dollar", "フィジー・ドル|フィジー・ドル"], ["Guyanese dollar", "ガイアナ・ドル|ガイアナ・ドル"], ["Hong Kong dollar", "香港ドル"], ["Macau Pataca", "マカオ・パタカ|マカオ・パタカ"], ["New Taiwan dollar", "ニュー台湾ドル|ニュー台湾ドル"], ["Jamaican dollar", "ジャマイカ・ドル|ジャマイカドル"], ["Kiribati dollar", "オーストラリア・ドル|オーストラリアドル"], ["Liberian dollar", "リベリア・ドル|リベリアドル"], ["Namibian dollar", "ナミビア・ドル|ナミビアドル"], ["Surinamese dollar", "スリナム・ドル|スリナムドル"], ["Trinidad and Tobago dollar", "トリニダード・トバゴ・ドル|トリニダードトバゴ・ドル"], ["Tuvaluan dollar", "ツバル・ドル|ツバルドル"], ["Chinese yuan", "人民元"], ["Fen", "分"], ["Jiao", "角"], ["Finnish markka", "フィンランド・マルカ"], ["Penni", "ペニー"]]);
    JapaneseNumericWithUnit.CurrencyNameToIsoCodeMap = new Map([["Afghan afghani", "AFN"], ["Euro", "EUR"], ["Albanian lek", "ALL"], ["Angolan kwanza", "AOA"], ["Armenian dram", "AMD"], ["Aruban florin", "AWG"], ["Bangladeshi taka", "BDT"], ["Bhutanese ngultrum", "BTN"], ["Bolivian boliviano", "BOB"], ["Bosnia and Herzegovina convertible mark", "BAM"], ["Botswana pula", "BWP"], ["Brazilian real", "BRL"], ["Bulgarian lev", "BGN"], ["Cambodian riel", "KHR"], ["Cape Verdean escudo", "CVE"], ["Costa Rican colón", "CRC"], ["Croatian kuna", "HRK"], ["Czech koruna", "CZK"], ["Eritrean nakfa", "ERN"], ["Ethiopian birr", "ETB"], ["Gambian dalasi", "GMD"], ["Georgian lari", "GEL"], ["Ghanaian cedi", "GHS"], ["Guatemalan quetzal", "GTQ"], ["Haitian gourde", "HTG"], ["Honduran lempira", "HNL"], ["Hungarian forint", "HUF"], ["Iranian rial", "IRR"], ["Yemeni rial", "YER"], ["Israeli new shekel", "ILS"], ["Japanese yen", "JPY"], ["Kazakhstani tenge", "KZT"], ["Kenyan shilling", "KES"], ["North Korean won", "KPW"], ["South Korean won", "KRW"], ["Kyrgyzstani som", "KGS"], ["Lao kip", "LAK"], ["Lesotho loti", "LSL"], ["South African rand", "ZAR"], ["Macanese pataca", "MOP"], ["Macedonian denar", "MKD"], ["Malagasy ariary", "MGA"], ["Malawian kwacha", "MWK"], ["Malaysian ringgit", "MYR"], ["Mauritanian ouguiya", "MRO"], ["Mongolian tögrög", "MNT"], ["Mozambican metical", "MZN"], ["Burmese kyat", "MMK"], ["Nicaraguan córdoba", "NIO"], ["Nigerian naira", "NGN"], ["Turkish lira", "TRY"], ["Omani rial", "OMR"], ["Panamanian balboa", "PAB"], ["Papua New Guinean kina", "PGK"], ["Paraguayan guaraní", "PYG"], ["Peruvian sol", "PEN"], ["Polish złoty", "PLN"], ["Qatari riyal", "QAR"], ["Saudi riyal", "SAR"], ["Samoan tālā", "WST"], ["São Tomé and Príncipe dobra", "STD"], ["Sierra Leonean leone", "SLL"], ["Swazi lilangeni", "SZL"], ["Tajikistani somoni", "TJS"], ["Thai baht", "THB"], ["Ukrainian hryvnia", "UAH"], ["Vanuatu vatu", "VUV"], ["Venezuelan bolívar", "VEF"], ["Zambian kwacha", "ZMW"], ["Moroccan dirham", "MAD"], ["United Arab Emirates dirham", "AED"], ["Azerbaijani manat", "AZN"], ["Turkmenistan manat", "TMT"], ["Somali shilling", "SOS"], ["Tanzanian shilling", "TZS"], ["Ugandan shilling", "UGX"], ["Romanian leu", "RON"], ["Moldovan leu", "MDL"], ["Nepalese rupee", "NPR"], ["Pakistani rupee", "PKR"], ["Indian rupee", "INR"], ["Seychellois rupee", "SCR"], ["Mauritian rupee", "MUR"], ["Maldivian rufiyaa", "MVR"], ["Sri Lankan rupee", "LKR"], ["Indonesian rupiah", "IDR"], ["Danish krone", "DKK"], ["Norwegian krone", "NOK"], ["Icelandic króna", "ISK"], ["Swedish krona", "SEK"], ["West African CFA franc", "XOF"], ["Central African CFA franc", "XAF"], ["Comorian franc", "KMF"], ["Congolese franc", "CDF"], ["Burundian franc", "BIF"], ["Djiboutian franc", "DJF"], ["CFP franc", "XPF"], ["Guinean franc", "GNF"], ["Swiss franc", "CHF"], ["Rwandan franc", "RWF"], ["Russian ruble", "RUB"], ["Transnistrian ruble", "PRB"], ["Belarusian ruble", "BYN"], ["Algerian dinar", "DZD"], ["Bahraini dinar", "BHD"], ["Iraqi dinar", "IQD"], ["Jordanian dinar", "JOD"], ["Kuwaiti dinar", "KWD"], ["Libyan dinar", "LYD"], ["Serbian dinar", "RSD"], ["Tunisian dinar", "TND"], ["Argentine peso", "ARS"], ["Chilean peso", "CLP"], ["Colombian peso", "COP"], ["Cuban convertible peso", "CUC"], ["Cuban peso", "CUP"], ["Dominican peso", "DOP"], ["Mexican peso", "MXN"], ["Uruguayan peso", "UYU"], ["British pound", "GBP"], ["Saint Helena pound", "SHP"], ["Egyptian pound", "EGP"], ["Falkland Islands pound", "FKP"], ["Gibraltar pound", "GIP"], ["Manx pound", "IMP"], ["Jersey pound", "JEP"], ["Lebanese pound", "LBP"], ["South Sudanese pound", "SSP"], ["Sudanese pound", "SDG"], ["Syrian pound", "SYP"], ["United States dollar", "USD"], ["Australian dollar", "AUD"], ["Bahamian dollar", "BSD"], ["Barbadian dollar", "BBD"], ["Belize dollar", "BZD"], ["Bermudian dollar", "BMD"], ["Brunei dollar", "BND"], ["Singapore dollar", "SGD"], ["Canadian dollar", "CAD"], ["Cayman Islands dollar", "KYD"], ["New Zealand dollar", "NZD"], ["Fijian dollar", "FJD"], ["Guyanese dollar", "GYD"], ["Hong Kong dollar", "HKD"], ["Jamaican dollar", "JMD"], ["Liberian dollar", "LRD"], ["Namibian dollar", "NAD"], ["Solomon Islands dollar", "SBD"], ["Surinamese dollar", "SRD"], ["New Taiwan dollar", "TWD"], ["Trinidad and Tobago dollar", "TTD"], ["Tuvaluan dollar", "TVD"], ["Chinese yuan", "CNY"], ["Rial", "__RI"], ["Shiling", "__S"], ["Som", "__SO"], ["Dirham", "__DR"], ["Dinar", "_DN"], ["Dollar", "__D"], ["Manat", "__MA"], ["Rupee", "__R"], ["Krone", "__K"], ["Krona", "__K"], ["Crown", "__K"], ["Frank", "__F"], ["Mark", "__M"], ["Ruble", "__RB"], ["Peso", "__PE"], ["Pound", "__P"], ["Tristan da Cunha pound", "_TP"], ["South Georgia and the South Sandwich Islands pound", "_SP"], ["Somaliland shilling", "_SS"], ["Pitcairn Islands dollar", "_PND"], ["Palauan dollar", "_PD"], ["Niue dollar", "_NID"], ["Nauruan dollar", "_ND"], ["Micronesian dollar", "_MD"], ["Kiribati dollar", "_KID"], ["Guernsey pound", "_GGP"], ["Faroese króna", "_FOK"], ["Cook Islands dollar", "_CKD"], ["British Virgin Islands dollar", "_BD"], ["Ascension pound", "_AP"], ["Alderney pound", "_ALP"], ["Abkhazian apsar", "_AA"]]);
    JapaneseNumericWithUnit.FractionalUnitNameToCodeMap = new Map([["Jiao", "JIAO"], ["Kopek", "KOPEK"], ["Pul", "PUL"], ["Cent", "CENT"], ["Qindarkë", "QINDARKE"], ["Penny", "PENNY"], ["Santeem", "SANTEEM"], ["Cêntimo", "CENTIMO"], ["Centavo", "CENTAVO"], ["Luma", "LUMA"], ["Qəpik", "QƏPIK"], ["Fils", "FILS"], ["Poisha", "POISHA"], ["Kapyeyka", "KAPYEYKA"], ["Centime", "CENTIME"], ["Chetrum", "CHETRUM"], ["Paisa", "PAISA"], ["Fening", "FENING"], ["Thebe", "THEBE"], ["Sen", "SEN"], ["Stotinka", "STOTINKA"], ["Fen", "FEN"], ["Céntimo", "CENTIMO"], ["Lipa", "LIPA"], ["Haléř", "HALER"], ["Øre", "ØRE"], ["Piastre", "PIASTRE"], ["Santim", "SANTIM"], ["Oyra", "OYRA"], ["Butut", "BUTUT"], ["Tetri", "TETRI"], ["Pesewa", "PESEWA"], ["Fillér", "FILLER"], ["Eyrir", "EYRIR"], ["Dinar", "DINAR"], ["Agora", "AGORA"], ["Tïın", "TIIN"], ["Chon", "CHON"], ["Jeon", "JEON"], ["Tyiyn", "TYIYN"], ["Att", "ATT"], ["Sente", "SENTE"], ["Dirham", "DIRHAM"], ["Rappen", "RAPPEN"], ["Avo", "AVO"], ["Deni", "DENI"], ["Iraimbilanja", "IRAIMBILANJA"], ["Tambala", "TAMBALA"], ["Laari", "LAARI"], ["Khoums", "KHOUMS"], ["Ban", "BAN"], ["Möngö", "MONGO"], ["Pya", "PYA"], ["Kobo", "KOBO"], ["Kuruş", "KURUS"], ["Baisa", "BAISA"], ["Centésimo", "CENTESIMO"], ["Toea", "TOEA"], ["Sentimo", "SENTIMO"], ["Grosz", "GROSZ"], ["Sene", "SENE"], ["Halala", "HALALA"], ["Para", "PARA"], ["Öre", "ORE"], ["Diram", "DIRAM"], ["Satang", "SATANG"], ["Seniti", "SENITI"], ["Millime", "MILLIME"], ["Tennesi", "TENNESI"], ["Kopiyka", "KOPIYKA"], ["Tiyin", "TIYIN"], ["Hào", "HAO"], ["Ngwee", "NGWEE"]]);
    JapaneseNumericWithUnit.CompoundUnitConnectorRegex = `(?<spacer>と)`;
    JapaneseNumericWithUnit.CurrencyPrefixList = new Map([["Dollar", "$"], ["United States dollar", "us$"], ["British Virgin Islands dollar", "bvi$"], ["Brunei dollar", "b$"], ["Sen", "sen"], ["Singapore dollar", "s$"], ["Canadian dollar", "can$|c$|c $"], ["Cayman Islands dollar", "ci$"], ["New Zealand dollar", "nz$|nz $"], ["Guyanese dollar", "gy$|gy $|g$|g $"], ["Hong Kong dollar", "hk$|hkd|hk $"], ["Jamaican dollar", "j$"], ["Namibian dollar", "nad|n$|n $"], ["Solomon Islands dollar", "si$|si $"], ["New Taiwan dollar", "nt$|nt $"], ["Samoan tālā", "ws$"], ["Chinese yuan", "￥"], ["Japanese yen", "¥|\\"], ["Turkish lira", "₺"], ["Euro", "€"], ["Pound", "£"], ["Costa Rican colón", "₡"]]);
    JapaneseNumericWithUnit.CurrencyAmbiguousValues = ['円', '銭', '\\'];
})(JapaneseNumericWithUnit = exports.JapaneseNumericWithUnit || (exports.JapaneseNumericWithUnit = {}));

});

unwrapExports(japaneseNumericWithUnit);

var base$8 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class JapaneseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        this.cultureInfo = ci;
        this.unitNumExtractor = new recognizersTextNumber.JapaneseNumberExtractor(recognizersTextNumber.JapaneseNumberExtractorMode.ExtractAll);
        this.buildPrefix = japaneseNumericWithUnit.JapaneseNumericWithUnit.BuildPrefix;
        this.buildSuffix = japaneseNumericWithUnit.JapaneseNumericWithUnit.BuildSuffix;
        this.connectorToken = japaneseNumericWithUnit.JapaneseNumericWithUnit.ConnectorToken;
        this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(japaneseNumericWithUnit.JapaneseNumericWithUnit.CompoundUnitConnectorRegex);
        this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(baseUnits.BaseUnits.PmNonUnitRegex);
    }
}
exports.JapaneseNumberWithUnitExtractorConfiguration = JapaneseNumberWithUnitExtractorConfiguration;
class JapaneseNumberWithUnitParserConfiguration extends parsers$4.BaseNumberWithUnitParserConfiguration {
    constructor(ci) {
        super(ci);
        this.internalNumberExtractor = new recognizersTextNumber.JapaneseNumberExtractor(recognizersTextNumber.JapaneseNumberExtractorMode.Default);
        this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.JapaneseNumberParserConfiguration());
        this.connectorToken = '';
        this.currencyNameToIsoCodeMap = japaneseNumericWithUnit.JapaneseNumericWithUnit.CurrencyNameToIsoCodeMap;
        this.currencyFractionCodeList = japaneseNumericWithUnit.JapaneseNumericWithUnit.FractionalUnitNameToCodeMap;
    }
}
exports.JapaneseNumberWithUnitParserConfiguration = JapaneseNumberWithUnitParserConfiguration;

});

unwrapExports(base$8);

var currency$8 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class JapaneseCurrencyExtractorConfiguration extends base$8.JapaneseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Japanese);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_CURRENCY;
        // Reference Source: https:// en.wikipedia.org/wiki/List_of_circulating_currencies
        this.suffixList = japaneseNumericWithUnit.JapaneseNumericWithUnit.CurrencySuffixList;
        this.prefixList = japaneseNumericWithUnit.JapaneseNumericWithUnit.CurrencyPrefixList;
        this.ambiguousUnitList = japaneseNumericWithUnit.JapaneseNumericWithUnit.CurrencyAmbiguousValues;
        
    }
}
exports.JapaneseCurrencyExtractorConfiguration = JapaneseCurrencyExtractorConfiguration;
class JapaneseCurrencyParserConfiguration extends base$8.JapaneseNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Japanese);
        }
        super(ci);
        this.BindDictionary(japaneseNumericWithUnit.JapaneseNumericWithUnit.CurrencySuffixList);
        this.BindDictionary(japaneseNumericWithUnit.JapaneseNumericWithUnit.CurrencyPrefixList);
    }
}
exports.JapaneseCurrencyParserConfiguration = JapaneseCurrencyParserConfiguration;

});

unwrapExports(currency$8);

var age$8 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class JapaneseAgeExtractorConfiguration extends base$8.JapaneseNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Japanese);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_AGE;
        this.suffixList = japaneseNumericWithUnit.JapaneseNumericWithUnit.AgeSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = japaneseNumericWithUnit.JapaneseNumericWithUnit.AgeAmbiguousValues;
    }
}
exports.JapaneseAgeExtractorConfiguration = JapaneseAgeExtractorConfiguration;
class JapaneseAgeParserConfiguration extends base$8.JapaneseNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Japanese);
        }
        super(ci);
        this.BindDictionary(japaneseNumericWithUnit.JapaneseNumericWithUnit.AgeSuffixList);
    }
}
exports.JapaneseAgeParserConfiguration = JapaneseAgeParserConfiguration;

});

unwrapExports(age$8);

var frenchNumericWithUnit = createCommonjsModule(function (module, exports) {
"use strict";
// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var FrenchNumericWithUnit;
(function (FrenchNumericWithUnit) {
    FrenchNumericWithUnit.AgeSuffixList = new Map([["Ans", "ans"], ["Mois", "mois d'âge|mois d'age|mois"], ["Semaines", "semaine|semaines|semaines d'âge|semaines d'age"], ["Jour", "jours|jour"]]);
    FrenchNumericWithUnit.AreaSuffixList = new Map([["Kilomètre carré", "km2|km^2|km²|kilomètres carrés|kilomètre carré"], ["Hectomètre carré", "hm2|hm^2|hm²|hectomètre carré|hectomètres carrés"], ["Décamètre carré", "dam2|dam^2|dam²|décamètre carré|décamètres carrés"], ["Mètre carré", "m2|m^2|m²|mètre carré|mètres carrés"], ["Décimètre carré", "dm2|dm^2|dm²|décimètre carré|décimètres carrés"], ["Centimètre carré", "cm2|cm^2|cm²|centimètre carré|centimètres carrés"], ["Millimètre carré", "mm2|mm^2|mm²|millimètre carré|millimètres carrés"], ["Pouce carré", "pouces2|po2|pouce carré|pouces carrés|in^2|in²|in2"], ["Pied carré", "pied carré|pieds carrés|pi2|pi^2|pi²"], ["Mile carré", "mile carré|miles carrés|mi2|mi^2|mi²"], ["Acre", "acre|acres"]]);
    FrenchNumericWithUnit.CurrencySuffixList = new Map([["Abkhazie apsar", "abkhazie apsar|apsars"], ["Afghan afghani", "afghan afghani|؋|afn|afghanis|afghani"], ["Pul", "pul"], ["Euro", "euros|euro|€|eur|d'euros"], ["Cent", "cents|cent|-cents|-cent|sen"], ["lek Albanais", "lek albanais|leks|lek"], ["Qindarkë", "qindarkë|qindarkës|qindarke|qindarkes"], ["Kwanza angolais", "kwanza angolais|kz|aoa|kwanza|kwanzas"], ["Dram arménien", "dram arménien|drams arméniens"], ["Florins d'Aruba", "florins aruba|ƒ|awg"], ["Bangladeshi taka", "bangladeshi taka|৳|bdt|taka|takas|bangladeshi takas"], ["Paisa", "poisha|paisa"], ["Ngultrum bhoutanais", "ngultrum bhoutanais|nu.|btn"], ["Chetrum", "chetrums|chetrum"], ["Boliviano bolivien", "boliviano bolivien|bolivianos bolivien|bolivianos bolivie|boliviano bolivie|bob|bs."], ["Bosnie-Herzégovine mark convertible", "bosnie-herzégovine mark convertible|bosnie-et-herzégovine mark convertible|bam"], ["Fening", "fening|fenings"], ["Pula", "pula|bwp"], ["Thebe", "thebe"], ["Réal brésilien", "réal brésilien|réals brésilien|r$|brl|real bresil|reals bresilien"], ["Lev bulgare", "lev bulgare|levs bulgare|lv|bgn"], ["Stotinki búlgaro", "stotinki bulgare"], ["Riel cambodgien", "riel cambodgien|khr|៛"], ["Escudo du cap-vert", "escudo cap-verdien|cve"], ["Colon du costa rica", "colon du costa rica|colons du costa rica|crc|₡"], ["Colon du salvador", "colon du salvador|colons du salvador|svc"], ["Kuna croate", "kuna croate|kunas croate|kn|hrk"], ["Lipa", "lipa"], ["Couronne tchèque", "couronne tchèque|couronnes tchèque|czk|Kč"], ["Haléř", "haléř"], ["Nakfas érythréens", "nakfas érythréens|nfk|ern|nakfa érythréens"], ["Birr éthiopien", "birr éthiopien|birrs éthiopien|etb"], ["Dalasi gambienne", "gmd"], ["Butut", "bututs|butut"], ["Lari géorgien", "lari géorgie|lari géorgiens|gel|₾"], ["Tetri géorgien", "tetri géorgie|tetris géorgiens"], ["Cedi", "cedi|ghs|cedi ghanéen|gh₵"], ["Pesewa", "pesewa|pesewas"], ["Quetzal guatémaltèque", "quetzal guatémaltèque|gtq|quetzal|quetzales"], ["Gourdes haïtiennes", "gourdes haïtiennes|gourdes|htg|gourde haïtienne"], ["Lempira hondurien", "lempira hondurien|hnl"], ["Forint hongrois", "forint hongrois|huf|fg|forints hongrois"], ["Fillér", "fillér"], ["Rial iranien", "rial iranien|irr|rials iranien|rials iraniens"], ["Litas lituanien", "litas lituanien|ltl|lit lithuanien|litas lithuanie"], ["Yen Japonais", "yen japonais|yen japon|yens|jpy|yen|¥|-yen"], ["Tenge kazakh", "tenge kazakh|kzt"], ["Shilling kényan", "shilling kényan|sh|kes|shillings kényans"], ["Won coréen", "won coréen|won coréens|₩"], ["Won sud-coréen", "won sud-coréen|won sud coréen|won sud-coréens|krw"], ["Corée du nord won", "corée du nord won|corée nord won|kpw"], ["Som Kirghizie", "som kirghizie|kgs"], ["Sum Ouzbékistan", "sum ouzbékistan|sum ouzbeks|sum ouzbéks|uzs"], ["Kip laotien", "kip laotien|lak|₭n|₭"], ["Att", "att"], ["Loti", "loti|maloti|lsl"], ["Sente", "sente|lisente"], ["Rand sud-africain", "rand sud-africain|zar"], ["Pataca macanais", "pataca macanais|mop$|mop"], ["Avo", "avos|avo"], ["Dinar macédonien", "dinar macédonien|mkd|ден"], ["Deni", "deni"], ["Ariary malagache", "ariary malagache|mga"], ["Iraimbilanja", "Iraimbilanja"], ["Kwacha malawien", "kwacha malawien|mk|mwk"], ["Tambala", "Tambala"], ["Ringitt malaisien", "ringitt malaisien|rm|myr|ringitts malaisien"], ["Ouguiya mauritanienne", "ouguiya|um|mro|ouguiya mauritanien|ouguiya mauritanienne"], ["Khoums", "khoums"], ["Togrogs mongoles", "togrogs mongoles|togrogs|tugriks|tögrög|mnt|₮|tögrög mongoles|tögrög mongolie|togrogs mongolie"], ["Metical mozambique", "metical du mozambique|metical mozambique|mt|mzn|meticals mozambique"], ["Kyat birmanie", "kyat birmanie|ks|mmk"], ["Pya", "pya"], ["Cordoba nicaraguayen", "cordoba nicaraguayen|córdoba nicaraguayen|nio|córdoba oro|cordoba oro nicaraguayen"], ["Naira nigérians", "naira nigérians|naira|ngm|₦|nairas nigérians"], ["Livre turque", "livre turque|try|tl|livre turques"], ["Kuruş", "kuruş"], ["Rials omanais", "rials omanais|omr|ر.ع.|rial omanais"], ["Balboa panaméennes", "balboa panaméennes|balboa|pab"], ["Kina", "kina|pkg|pgk"], ["Toea", "toea"], ["Guaraní paraguayen", "guaraní paraguayen|₲|pyg"], ["Sol péruvien", "nuevo sol péruvien|soles|sol|sol péruvien"], ["Złoty polonais", "złoty polonais|złoty|zł|pln|zloty|zloty polonais"], ["Groxz", "groszy|grosz|grosze"], ["Riyal qatari", "riyal qatari|qar|riyals qatari"], ["Riyal saudi", "riyal saudi|sar|riyals saudi"], ["Riyal", "riyal|riyals|rial|﷼"], ["Dirham", "dirham|dirhem|dirhm"], ["Halala", "halalas|halala"], ["Tala", "tala|tālā|ws$|sat|wst"], ["Sene", "sene"], ["Dobra", "dobra|db|std"], ["Leone", "leone|sll"], ["Florins Néerlandais", "florins hollandais|florins néerlandais|florins|ang|ƒ|florin|fl |"], ["Lilangeni", "lilangeni|szl"], ["Somoni tadjikistan", "somoni tadjikistan|tjs|somoni"], ["Diram", "dirams|diram"], ["Baht thaïlandais", "baht thaïlandais|baht thailandais|baht thaï|baht thai|baht|฿|thb"], ["Satang", "satang|satangs"], ["Paʻanga", "paʻanga|pa'anga|top"], ["Hryvnia ukrainien", "hryvnia ukrainien|hyrvnia|uah|₴|hryvnias ukrainien|hryvnia ukrainienne"], ["Vanuatu vatu", "vanuatu vatu|vatu|vuv"], ["Bolívar vénézuélien", "bolívar vénézuélien|bolivar venezuelien|bs.f.|vef|bolívars vénézuélien|bolivars venezuelien"], ["Dong vietnamien", "dong vietnamien|dongs vietnamiens|dong|đồng|vnd|dông|dông vietnamiens"], ["Kwacha de Zambie", "kwacha de zambie|zk|zmw|kwachas"], ["Dirham marocain", "dirham marocain|mad|د.م."], ["Dirham des Émirats arabes unis", "dirham des Émirats arabes unis|د.إ|aed"], ["Manat azerbaïdjanais", "manat azerbaïdjanais|manat azerbaidjanais|azn"], ["Manat turkmène", "manat turkmène|tmt|manat turkmene"], ["Manat", "manats|manat"], ["Qəpik", "qəpik"], ["Shilling somalien", "shilling somalien|shillings somalien|sos"], ["Shilling tanzanien", "shilling tanzanien|shillings tanzanien|tzs|tsh|shilling tanzanienne|shillings tanzanienne"], ["Shilling ougandais", "shilling ougandais|shillings ougandais|sh|ugx"], ["Leu roumain", "leu roumain|lei|leu roumaine|ron"], ["Leu moldave", "leu meoldave|mdl"], ["Leu", "leu"], ["Ban", "bani|-ban|ban"], ["Roupie népalaise", "roupie népalaise|roupie nepalaise|npr"], ["Roupie pakistanaise", "roupie pakistanaise|pkr"], ["Roupie indienne", "roupie indienne|inr|roupie indien|inr|₹"], ["Roupie seychelloise", "roupie seychelloise|scr|sr|sre"], ["Roupie mauricienne", "roupie mauricienne|mur"], ["Rufiyaa maldives", "rufiyaa maldives|mvr|.ރ|rf"], ["Roupie srilankaise", "roupie srilankaise|lrk|රු|ரூ"], ["Rupiah Indonésie", "rupia indonésie|rupia indonesie|rupiah|rp|idr"], ["Roupie", "roupie"], ["Couronne danoise", "couronne danoise|dkk|couronnes danoise|couronne danemark|couronnes danemark"], ["Couronne norvégienne", "couronne norvégienne|couronne norvegienne|couronnes norvégienne|couronnes norvegienne|nok"], ["Couronne féroïenne", "couronne féroïenne|couronne feroienne"], ["Couronne suédoise", "couronne suédoise|couronne suéde|sek|couronnes suédoise|couronne suedoise"], ["Couronne", "couronne|couronnes"], ["Øre", "Øre|oyra|eyrir"], ["Franc CFA de l'Afrique de l'Ouest", "franc cfa de l''afrique de l''ouest|franc cfa ouest africain|franc cfa|francs cfa|fcfa|frs cfa|cfa francs|xof"], ["Franc CFA d'Afrique centrale", "franc cfa d''afrique centrale|franc cfa centrale|frs cfa centrale|xaf"], ["Franc comorien", "franc comorien|kmf"], ["Franc congolais", "franc congolais|cdf"], ["Franc burundais", "franc burundais|bif"], ["Franc djiboutienne", "franc djiboutienne|djf"], ["Franc CFP", "franc cfp|xpf"], ["Franc guinéen", "franc guinéen|gnf"], ["Franc Suisse", "franc suisse|chf|sfr.|francs suisses"], ["Franc rwandais", "franc rwandais|rwf|rw|r₣|frw"], ["Franc belge", "franc belge|bi.|b.fr.|bef"], ["Rappen", "rappen|-rappen"], ["Franc", "francs|franc|fr.|fs"], ["Centimes", "centimes|centime|santim"], ["Rouble russe", "rouble russe|rub|₽|₽ russe|roubles russe|roubles russes|₽ russes"], ["Nouveau rouble biélorusse", "nouveau rouble biélorusse|byn|nouveau roubles biélorusse|nouveau rouble bielorusse|nouveau roubles biélorusse"], ["Rouble transnistriens", "rouble transnistriens|prb"], ["Rouble biélorusses", "rouble biélorusses|roubles biélorusses|rouble bielorusses|roubles bielorusses"], ["Kopek", "kopek|kopeks"], ["Kapyeyka", "kapyeyka"], ["Rouble", "roubles|rouble|br"], ["Dinar algérien", "dinar algérien|د.ج|dzd|dinars algérien|dinar algerien|dinars algerien"], ["Dinar de bahreïn", "dinar de bahreïn|bhd|.د.ب|dinar de bahrein"], ["Santeem", "santeem|santeems"], ["Dinar iraquien", "dinar iraquien|dinars iraquien|iqd|ع.د|dinar iraquienne|dinars iraquienne"], ["Dinar jordanien", "dinar jordanien|dinars jordanien|د.ا|jod"], ["Dinar koweïtien", "dinar koweïtien|dinar koweitien|dinars koweïtien|kwd|د.ك"], ["Dinar libyen", "dinar libyen|dinars libyen|lyd"], ["Dinar serbe", "dinar serbe|dinars serbe|rsd|дин."], ["Dinar tunisien", "dinar tunisien|dinars tunisien|tnd"], ["Dinar yougoslave", "dinar yougoslave|dinars yougoslave|yun"], ["Dinar", "dinars|dinar|denar|-dinars|-dinar"], ["Fils", "fils|fulūs|-fils|-fil"], ["Para", "para|napa"], ["Millime", "millimes|millime"], ["Peso argentin", "peso argentin|ars|pesos argentin|peso argentine|pesos argentine"], ["Peso chilien", "peso chilien|pesos chilien|clp"], ["Peso colombien", "peso colombien|pesos colombien|cop|peso colombie|pesos colombien"], ["Peso cubains convertibles", "peso cubains convertibles|pesos cubains convertibles|cuc"], ["Peso cubains", "peso cubaines|pesos cubaines|peso cubaine|pesos cubaines|cup"], ["Peso dominicain", "peso dominicain|pesos dominicain|dop|peso dominicaine|pesos dominicaine"], ["Peso philippin", "peso philippin|pesos philippin|piso|₱|php"], ["Peso uruguayen", "peso uruguayen|pesos uruguayen|uyu"], ["Peso", "pesos|Peso"], ["Centavo", "centavos|Centavo"], ["Livre britannique", "livre britannique|livres britannique|gbp|£ britannique"], ["Livre guernesey", "livre guernesey|£ guernesey|ggp"], ["Livre ascension", "livre ascension|livres ascension|£ ascension"], ["Livre sainte-hélène", "livre de sainte-hélène|livre sainte-hélène|livre sainte-helene|livre de sainte hélène|shp"], ["Livre égyptienne", "livre égyptienne|livre egyptienne|egp|ج.م"], ["Livre des îles falkland", "livre des îles falkland|livre des iles falkland|fkp|£ iles falkland"], ["Livre gibraltar", "livre gibraltar|livre de gibraltar|£ gibraltar|gip"], ["Livre manx", "imp|livre manx|£ manx"], ["Livre jersey", "livre de jersey|livre jersey|jep|£ jersey"], ["Livre libanaise", "livre libanaise|£ libanaise|livres libanaise|lbp|ل.ل"], ["Livre des îles malouines", "livre des îles malouines|livre des iles malouines|£ iles malouines"], ["Livre sud-soudanaise", "livre sud-soudanaise|livre sud soudanaise|livre du soudan du sud|livres sud-soudanaises|livre sud soudan|livre soudan sud"], ["Livre soudanaise", "livre soudanaise|livres soudanaise|sdg|£ soudan|ج.س.|livre soudan|livres soudan"], ["Livre syrienne", "livre syrienne|ل.س|syp|livre syrie|livres syrie|£ syrie"], ["Livre", "livre|livres|-livre|-livres|£"], ["Pence", "pence"], ["Shilling", "shilling|shillings"], ["Penny", "penny|sou|centime"], ["Dollar Américain", "dollar américain|$ américain|$ americain|usd|$usd|$ usd|dollar americain|dollar États-Unis|dollar des États-Unis|dollar États Unis|dollar etats unis|dollar etats-unis|$ etats-unis|$ États-Unis"], ["Dollar des Caraïbes orientales", "dollar des caraïbes orientales|dollar des caraibes orientales|xcd|$ caraibes orientales|$ caraïbes orientales"], ["Dollar Australien", "dollar australien|dollars australiens|$ australien|aud|$australien|australien $|$ australie|dollar australie"], ["Dollar des bahamas", "dollar des bahamas|dollar bahamas|$ bahamas|bsd|bahama $|dollar bahama|$ bahamas"], ["Dollar bermudes", "dollar des bermudes|dollar bermude|dollar bermudes|$ bermudes|bmd"], ["Dollar belize", "dollar de Belize|dollar belizien|bzd|$ belize"], ["Dollar îles Vierges britanniques", "dollar îles vierges britanniques|dollar iles vierges britanniques|$ iles vierges britanniques"], ["Dollar brunei", "dollar de brunei|$ brunei|bnd|dollar brunei"], ["Sen", "sen"], ["Dollar singapour", "dollar de singapour|dollar singapour|$ sinapour|sgd|$s"], ["Dollar Canadien", "dollar canadien|dollars canadien|$ canadien|cad|$can|$c|$ c|dollar canada|dollar canadienne|$ canada|$cad|cad$"], ["Dollar iles caimanes", "dollars des îles caïmanes|dollar des îles caïmanes|dollars des iles caimanes|dollar iles caimanes|kyd|$ci"], ["Dollar néo-zélandais", "dollar néo-zélandais|dollar néo zélandais|dollar neo-zelandais|dollar neo zelandais|$nz|$ néo-zélandais|$ neo zelandais"], ["Dollar îles cook", "dollar îles cook|dollar iles cook|$ iles cook"], ["Dollar des fidji", "dollar des fidji|$ fidji|dollar fidji|dollar de fidji|dollars des fidji|dollars de fidji"], ["Dollar guyanien", "dollar guyanien|dollar du guyana|dollar dre guyana|$ guayana|gyd|$gy"], ["Dollar de Hong Kong", "dollar hong kong|dollar hongkong|dollar de hong kong|dollar de hongkong|$hk|$ hk|hkd|hk $|hk$|dollar hk|$hongkong|dollars hongkong|dollars hong kong"], ["Dollar jamaïcain", "dollar jamaïcain|dollars jamaïcain|dollar jamaicain|dollars jamaicain|$j|$ jamaïque|dollar jamaïque|jmd"], ["Dollar libérien", "dollar libérien|dollars libérien|dollar liberien|dollars liberien|lrd|$ libérien|$ liberia|$ liberien"], ["Dollar namibien", "dollar namibien|dollars namibien|$ namibien|nad|$n|dollar namibie|dollars namibie|$ namibie"], ["Dollar des îles salomon", "dollar des îles Salomon|dollar des iles salomon|$si|sbd|$ iles salomon|$ îles salomon"], ["Dollar du suriname", "dollar du suriname|srd|$ du suriname|$ suriname|dollar suriname|dollars suriname|dollars du suriname"], ["Nouveau dollar de Taïwan", "nouveau dollar de taïwan|nouveau dollar de taiwan|twd|ntd|$nt"], ["Dollar trinidadien", "dollar trinidadien|dollars trinidadien|ttd|$ trinidadien"], ["Dollar", "dollar|$|dollars"], ["Yuan Chinois", "yuan|yuans|yuan chinois|renminbi|cny|rmb|￥"], ["Fen", "fen"], ["Jiao", "jiao"], ["Mark Finlandais", "marks finlandais|mark finlandais|fim|mark"]]);
    FrenchNumericWithUnit.CompoundUnitConnectorRegex = `(?<spacer>[^.])`;
    FrenchNumericWithUnit.CurrencyPrefixList = new Map([["Dollar", "$"], ["Dollar États-Unis", "$us|usd|us$"], ["Dollar Caraïbes orientales", "xcd|$ec"], ["Dollar australien", "a$|$a|aud"], ["Dollar bahamas", "bsd|b$"], ["Dollar barbadien", "bbd|bds$"], ["Dollar de belize", "bz$|bzd"], ["Dollar des bermudes", "bd$|bmd"], ["Dollar de brunei", "brunei $|bnd"], ["Dollar de Singapour", "s$|sgd"], ["Dollar Canadien", "cad|$ ca|$ca|$ c"], ["Dollar des îles Caïmans", "ci$|kyd"], ["Dollar néo-zélandais", "nz$|nzd"], ["Dollar de Fidji", "$fj|fjd"], ["Dolar guyanien", "g$|gyd"], ["Dollar de Hong Kong", "hkd|hk$"], ["Dollar jamaïcain", "j$|jmd"], ["Dollar libérien", "lrd|l$"], ["Dollar namibien", "nad|n$"], ["Dollar des îles Salomon", "$ si|$si|sbd"], ["Nouveau dollar de Taïwan", "nt$|twd"], ["Réal brésilien", "r$|brl|reais"], ["Guaraní paraguayen", "₲|gs.|pyg"], ["Dollar trinidadien", "ttd|titis"], ["Yuan renminbi", "cny|rmb|¥|元"], ["Yen", "¥|jpy"], ["Euro", "€|eur"], ["Pound", "£"], ["Florín", "ƒ"], ["Livre", "£|gbp"]]);
    FrenchNumericWithUnit.AmbiguousCurrencyUnitList = ['din.', 'kina', 'lari', 'taka', 'tala', 'vatu', 'yuan', 'bob', 'btn', 'cop', 'cup', 'dop', 'gip', 'jod', 'kgs', 'lak', 'mga', 'mop', 'nad', 'omr', 'sar', 'sbd', 'scr', 'sdg', 'sek', 'sos', 'std', 'try', 'yer'];
    FrenchNumericWithUnit.InformationSuffixList = new Map([["Bit", "-bit|bit|bits"], ["Kilobit", "kilobit|kilobits|kb|kbit|kbits"], ["Megabit", "megabit|megabits|Mb|Mbit|mégabit|mégabits"], ["Gigabit", "gigabit|gigabits|Gb|Gbit"], ["Terabit", "terabit|terabits|Tb|Tbit|térabit|térabits"], ["Petabit", "petabit|petabits|Pb|Pbit|pétabit|pétabits"], ["octet", "octet|octets|-octet"], ["Kilooctet", "kilo-octet|kilo-octets|kilooctet|kilooctets|ko|kio|kB|KiB|kilobyte|kilobytes"], ["Mégaoctet", "mégaoctet|mégaoctets|méga-octet|méga-octets|Mo|Mio|MB|mégabyte|mégabytes"], ["Gigaoctet", "gigaoctet|gigaoctets|Go|Gio|GB|GiB|gigabyte|gigabytes"], ["Téraoctet", "téraoctet|téraoctets|To|Tio|TB|TiB|térabyte|térabytes"], ["Pétaoctet", "pétaoctet|pétaoctets|Po|Pio|PB|PiB|pétabyte|pétabytes"]]);
    FrenchNumericWithUnit.AmbiguousDimensionUnitList = ['mi', 'barils', 'grain', 'l', 'pierre', 'fps', 'pts'];
    FrenchNumericWithUnit.BuildPrefix = `(?<=(\\s|^|\\P{L}))`;
    FrenchNumericWithUnit.BuildSuffix = `(?=(\\s|\\P{L}|$))`;
    FrenchNumericWithUnit.ConnectorToken = 'de';
    FrenchNumericWithUnit.LengthSuffixList = new Map([["Kilomètres", "km|kilomètres|kilomètre|kilometres|kilometre|-km"], ["Hectomètre", "hm|hectomètre|hectomètres|hectometre|hectometres|-hm"], ["Décamètre", "dam|décamètre|décamètres|decametre|decametres|-dm"], ["Mètres", "m|mètres|mètre|metres|metre|m.|-m"], ["Décimètres", "dm|décimètres|décimètre|decimetres|decimetre"], ["Centimètres", "cm|centimètres|centimètre|centimetres|centimetre"], ["Millimètres", "mm|millimètres|millimètre|millimetre|millimetres"], ["Micromètres", "µm|um|micromètres|micromètre|micrometres|micrometre"], ["Nanomètres", "nm|nanometre|nanometres|nanomètres|nanomètre"], ["Picomètres", "pm|picomètre|picomètres|picometres|picometre"], ["Mile", "mi|mile|miles"], ["Pied", "pied|pieds"], ["Yard", "yards|yard|yd"], ["Pouce", "pouce|pouces"]]);
    FrenchNumericWithUnit.AmbiguousLengthUnitList = ['m', 'yard', 'yards', 'pm', 'pt', 'pts'];
    FrenchNumericWithUnit.AmbuguousLengthUnitList = ['m', 'pouce', 'pm'];
    FrenchNumericWithUnit.SpeedSuffixList = new Map([["Mètre par seconde", "m/s|metres/seconde|metres par seconde|metre par seconde|metres par secondes|mètre par seconde|mètres par seconde|mètres par secondes"], ["Kilomètre par heure", "km/h|kilomètre par heure|kilomètres par heure|kilomètres par heures|kilometres par heure|kilometre par heure"], ["Kilomètre par minute", "km/m|kilomètre par minute|kilomètres par minute|kilomètres par minutes|kilometre par minute|kilometre par minutes"], ["Kilomètre par seconde", "km/s|km à la seconde|km a la seconde|kilomètre par seconde|kilomètres par seconde|kilometre par seconde|kilometres par seconde"], ["Miles par heure", "mph|miles par heure|miles à l'heure|miles a l'heure|miles un heure"], ["Noeuds", "noeud|noeuds|nuds"], ["Pied par seconde", "ft/s|pied par seconde|pieds par seconde|pied/s|pieds/s"], ["Pied par minute", "pieds/minute|pied/minute|ft/minute|ft/min|pied/min"]]);
    FrenchNumericWithUnit.TemperatureSuffixList = new Map([["Kelvin", "k|K|kelvin"], ["F", "°f|degres f|degrés f|deg f|° f|degrés fahrenheit|degres fahrenheit|fahrenheit"], ["R", "rankine|°r|° r"], ["C", "°c|deg c|degrés celsius|degrés c|degres celsius|celsius|deg celsius|degs celsius|centigrade|deg centigrade|degs centigrade|degrés centigrade|degres centigrade|degré centigrade|degre centigrade"], ["Degré", "degrés|degres|deg.|°| °|degré|degre|deg"]]);
    FrenchNumericWithUnit.VolumeSuffixList = new Map([["Mètre cube", "m3|m^3|m³|mètre cube|mètres cube|metre cube|metres cube"], ["Centimètre cube", "cm3|cm^3|cm³|centimètre cube|centimètres cube|centimetre cube|centimetres cube"], ["Millimètre cube", "mm3|mm^3|mm³|millimètre cube|millimètres cube|millimetre cube|millimetres cube"], ["Kilomètre cube", "km3|km^3|km³|kilomètre cube|kilomètres cube|kilometre cube|kilometres cube"], ["Pieds cube", "pieds cubes|pieds cube|pied cube|pied cubes"], ["Litre", "litre|litres|lts|l"], ["Millilitre", "ml|millilitre|millilitres"], ["Gallon", "gallon|gallons"], ["Pintes", "pintes"], ["Onces", "onces|once|oz"], ["Décilitre", "dl|décilitre|decilitre|décilitres|decilitres"], ["Centilitre", "cl|centilitres|centilitre"], ["Onces liquides", "onces liquides|once liquide|once liquides"], ["Baril", "baril|barils|bbl"]]);
    FrenchNumericWithUnit.AmbiguousVolumeUnitList = ['ounce', 'oz', 'l', 'cup', 'peck', 'cord', 'gill'];
    FrenchNumericWithUnit.WeightSuffixList = new Map([["Kilogramme", "kg|kilogramme|kilogrammes|kilo|kilos"], ["Gram", "g|gramme|grammes"], ["Milligramme", "mg|milligramme|milligrammes"], ["Tonne métrique", "tonne métrique|tonnes métrique|tonnes métriques|tonne metrique|tonnes metrique"], ["Tonne", "tonne|tonnes|-tonnes|-tonne"], ["Livre", "livre|livres"]]);
    FrenchNumericWithUnit.AmbiguousWeightUnitList = ['g', 'oz', 'stone', 'dram'];
})(FrenchNumericWithUnit = exports.FrenchNumericWithUnit || (exports.FrenchNumericWithUnit = {}));

});

unwrapExports(frenchNumericWithUnit);

var base$10 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





class FrenchNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        this.cultureInfo = ci;
        this.unitNumExtractor = new recognizersTextNumber.FrenchNumberExtractor();
        this.buildPrefix = frenchNumericWithUnit.FrenchNumericWithUnit.BuildPrefix;
        this.buildSuffix = frenchNumericWithUnit.FrenchNumericWithUnit.BuildSuffix;
        this.connectorToken = frenchNumericWithUnit.FrenchNumericWithUnit.ConnectorToken;
        this.compoundUnitConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(frenchNumericWithUnit.FrenchNumericWithUnit.CompoundUnitConnectorRegex);
        this.pmNonUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(baseUnits.BaseUnits.PmNonUnitRegex);
    }
}
exports.FrenchNumberWithUnitExtractorConfiguration = FrenchNumberWithUnitExtractorConfiguration;
class FrenchNumberWithUnitParserConfiguration extends parsers$4.BaseNumberWithUnitParserConfiguration {
    constructor(ci) {
        super(ci);
        this.internalNumberExtractor = new recognizersTextNumber.FrenchNumberExtractor(recognizersTextNumber.NumberMode.Default);
        this.internalNumberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.FrenchNumberParserConfiguration());
        this.connectorToken = frenchNumericWithUnit.FrenchNumericWithUnit.ConnectorToken;
    }
}
exports.FrenchNumberWithUnitParserConfiguration = FrenchNumberWithUnitParserConfiguration;

});

unwrapExports(base$10);

var currency$10 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class FrenchCurrencyExtractorConfiguration extends base$10.FrenchNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_CURRENCY;
        // Reference Source: https:// en.wikipedia.org/wiki/List_of_circulating_currencies
        this.suffixList = frenchNumericWithUnit.FrenchNumericWithUnit.CurrencySuffixList;
        this.prefixList = frenchNumericWithUnit.FrenchNumericWithUnit.CurrencyPrefixList;
        this.ambiguousUnitList = frenchNumericWithUnit.FrenchNumericWithUnit.AmbiguousCurrencyUnitList;
    }
}
exports.FrenchCurrencyExtractorConfiguration = FrenchCurrencyExtractorConfiguration;
class FrenchCurrencyParserConfiguration extends base$10.FrenchNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
        }
        super(ci);
        this.BindDictionary(frenchNumericWithUnit.FrenchNumericWithUnit.CurrencySuffixList);
        this.BindDictionary(frenchNumericWithUnit.FrenchNumericWithUnit.CurrencyPrefixList);
    }
}
exports.FrenchCurrencyParserConfiguration = FrenchCurrencyParserConfiguration;

});

unwrapExports(currency$10);

var temperature$8 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class FrenchTemperatureExtractorConfiguration extends base$10.FrenchNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_TEMPERATURE;
        this.suffixList = frenchNumericWithUnit.FrenchNumericWithUnit.TemperatureSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = new Array();
    }
}
exports.FrenchTemperatureExtractorConfiguration = FrenchTemperatureExtractorConfiguration;
class FrenchTemperatureParserConfiguration extends base$10.FrenchNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
        }
        super(ci);
        this.connectorToken = null;
        this.BindDictionary(frenchNumericWithUnit.FrenchNumericWithUnit.TemperatureSuffixList);
    }
}
exports.FrenchTemperatureParserConfiguration = FrenchTemperatureParserConfiguration;

});

unwrapExports(temperature$8);

var dimension$8 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




const dimensionSuffixList = new Map([
    ...frenchNumericWithUnit.FrenchNumericWithUnit.InformationSuffixList,
    ...frenchNumericWithUnit.FrenchNumericWithUnit.AreaSuffixList,
    ...frenchNumericWithUnit.FrenchNumericWithUnit.LengthSuffixList,
    ...frenchNumericWithUnit.FrenchNumericWithUnit.SpeedSuffixList,
    ...frenchNumericWithUnit.FrenchNumericWithUnit.VolumeSuffixList,
    ...frenchNumericWithUnit.FrenchNumericWithUnit.WeightSuffixList
]);
class FrenchDimensionExtractorConfiguration extends base$10.FrenchNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_DIMENSION;
        this.suffixList = dimensionSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = frenchNumericWithUnit.FrenchNumericWithUnit.AmbiguousDimensionUnitList;
    }
}
exports.FrenchDimensionExtractorConfiguration = FrenchDimensionExtractorConfiguration;
class FrenchDimensionParserConfiguration extends base$10.FrenchNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
        }
        super(ci);
        this.BindDictionary(dimensionSuffixList);
    }
}
exports.FrenchDimensionParserConfiguration = FrenchDimensionParserConfiguration;

});

unwrapExports(dimension$8);

var age$10 = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




class FrenchAgeExtractorConfiguration extends base$10.FrenchNumberWithUnitExtractorConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
        }
        super(ci);
        this.extractType = constants$2.Constants.SYS_UNIT_AGE;
        this.suffixList = frenchNumericWithUnit.FrenchNumericWithUnit.AgeSuffixList;
        this.prefixList = new Map();
        this.ambiguousUnitList = new Array();
    }
}
exports.FrenchAgeExtractorConfiguration = FrenchAgeExtractorConfiguration;
class FrenchAgeParserConfiguration extends base$10.FrenchNumberWithUnitParserConfiguration {
    constructor(ci) {
        if (!ci) {
            ci = new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.French);
        }
        super(ci);
        this.BindDictionary(frenchNumericWithUnit.FrenchNumericWithUnit.AgeSuffixList);
    }
}
exports.FrenchAgeParserConfiguration = FrenchAgeParserConfiguration;

});

unwrapExports(age$10);

var numberWithUnitRecognizer = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });



























var NumberWithUnitOptions;
(function (NumberWithUnitOptions) {
    NumberWithUnitOptions[NumberWithUnitOptions["None"] = 0] = "None";
})(NumberWithUnitOptions = exports.NumberWithUnitOptions || (exports.NumberWithUnitOptions = {}));
function recognizeCurrency(query, culture, options = NumberWithUnitOptions.None, fallbackToDefaultCulture = true) {
    return recognizeByModel(recognizer => recognizer.getCurrencyModel(culture, fallbackToDefaultCulture), query, culture, options);
}
exports.recognizeCurrency = recognizeCurrency;
function recognizeTemperature(query, culture, options = NumberWithUnitOptions.None, fallbackToDefaultCulture = true) {
    return recognizeByModel(recognizer => recognizer.getTemperatureModel(culture, fallbackToDefaultCulture), query, culture, options);
}
exports.recognizeTemperature = recognizeTemperature;
function recognizeDimension(query, culture, options = NumberWithUnitOptions.None, fallbackToDefaultCulture = true) {
    return recognizeByModel(recognizer => recognizer.getDimensionModel(culture, fallbackToDefaultCulture), query, culture, options);
}
exports.recognizeDimension = recognizeDimension;
function recognizeAge(query, culture, options = NumberWithUnitOptions.None, fallbackToDefaultCulture = true) {
    return recognizeByModel(recognizer => recognizer.getAgeModel(culture, fallbackToDefaultCulture), query, culture, options);
}
exports.recognizeAge = recognizeAge;
function recognizeByModel(getModelFunc, query, culture, options) {
    let recognizer = new NumberWithUnitRecognizer(culture, options);
    let model = getModelFunc(recognizer);
    return model.parse(query);
}
class NumberWithUnitRecognizer extends recognizersText.Recognizer {
    constructor(culture, options = NumberWithUnitOptions.None, lazyInitialization = false) {
        super(culture, options, lazyInitialization);
    }
    InitializeConfiguration() {
        //#region English
        this.registerModel("CurrencyModel", recognizersTextNumber.Culture.English, (options) => new models$4.CurrencyModel(new Map([
            [new extractors$16.BaseMergedUnitExtractor(new currency.EnglishCurrencyExtractorConfiguration()), new parsers$4.BaseMergedUnitParser(new currency.EnglishCurrencyParserConfiguration())]
        ])));
        this.registerModel("TemperatureModel", recognizersTextNumber.Culture.English, (options) => new models$4.TemperatureModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new temperature.EnglishTemperatureExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new temperature.EnglishTemperatureParserConfiguration())]
        ])));
        this.registerModel("DimensionModel", recognizersTextNumber.Culture.English, (options) => new models$4.DimensionModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new dimension.EnglishDimensionExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new dimension.EnglishDimensionParserConfiguration())]
        ])));
        this.registerModel("AgeModel", recognizersTextNumber.Culture.English, (options) => new models$4.AgeModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new age.EnglishAgeExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new age.EnglishAgeParserConfiguration())]
        ])));
        //#endregion
        //#region Spanish
        this.registerModel("CurrencyModel", recognizersTextNumber.Culture.Spanish, (options) => new models$4.CurrencyModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new currency$2.SpanishCurrencyExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new currency$2.SpanishCurrencyParserConfiguration())]
        ])));
        this.registerModel("TemperatureModel", recognizersTextNumber.Culture.Spanish, (options) => new models$4.TemperatureModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new temperature$2.SpanishTemperatureExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new temperature$2.SpanishTemperatureParserConfiguration())]
        ])));
        this.registerModel("DimensionModel", recognizersTextNumber.Culture.Spanish, (options) => new models$4.DimensionModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new dimension$2.SpanishDimensionExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new dimension$2.SpanishDimensionParserConfiguration())]
        ])));
        this.registerModel("AgeModel", recognizersTextNumber.Culture.Spanish, (options) => new models$4.AgeModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new age$2.SpanishAgeExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new age$2.SpanishAgeParserConfiguration())]
        ])));
        //#endregion
        //#region Portuguese
        this.registerModel("CurrencyModel", recognizersTextNumber.Culture.Portuguese, (options) => new models$4.CurrencyModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new currency$4.PortugueseCurrencyExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new currency$4.PortugueseCurrencyParserConfiguration())]
        ])));
        this.registerModel("TemperatureModel", recognizersTextNumber.Culture.Portuguese, (options) => new models$4.TemperatureModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new temperature$4.PortugueseTemperatureExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new temperature$4.PortugueseTemperatureParserConfiguration())]
        ])));
        this.registerModel("DimensionModel", recognizersTextNumber.Culture.Portuguese, (options) => new models$4.DimensionModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new dimension$4.PortugueseDimensionExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new dimension$4.PortugueseDimensionParserConfiguration())]
        ])));
        this.registerModel("AgeModel", recognizersTextNumber.Culture.Portuguese, (options) => new models$4.AgeModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new age$4.PortugueseAgeExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new age$4.PortugueseAgeParserConfiguration())]
        ])));
        //#endregion
        //#region Chinese
        this.registerModel("CurrencyModel", recognizersTextNumber.Culture.Chinese, (options) => new models$4.CurrencyModel(new Map([
            [new extractors$16.BaseMergedUnitExtractor(new currency$6.ChineseCurrencyExtractorConfiguration()), new parsers$4.BaseMergedUnitParser(new currency$6.ChineseCurrencyParserConfiguration())],
            [new extractors$16.NumberWithUnitExtractor(new currency.EnglishCurrencyExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new currency.EnglishCurrencyParserConfiguration())]
        ])));
        this.registerModel("TemperatureModel", recognizersTextNumber.Culture.Chinese, (options) => new models$4.TemperatureModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new temperature$6.ChineseTemperatureExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new temperature$6.ChineseTemperatureParserConfiguration())],
            [new extractors$16.NumberWithUnitExtractor(new temperature.EnglishTemperatureExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new temperature.EnglishTemperatureParserConfiguration())]
        ])));
        this.registerModel("DimensionModel", recognizersTextNumber.Culture.Chinese, (options) => new models$4.DimensionModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new dimension$6.ChineseDimensionExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new dimension$6.ChineseDimensionParserConfiguration())],
            [new extractors$16.NumberWithUnitExtractor(new dimension.EnglishDimensionExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new dimension.EnglishDimensionParserConfiguration())]
        ])));
        this.registerModel("AgeModel", recognizersTextNumber.Culture.Chinese, (options) => new models$4.AgeModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new age$6.ChineseAgeExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new age$6.ChineseAgeParserConfiguration())],
            [new extractors$16.NumberWithUnitExtractor(new age.EnglishAgeExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new age.EnglishAgeParserConfiguration())]
        ])));
        //#endregion
        //#region Japanese
        this.registerModel("CurrencyModel", recognizersTextNumber.Culture.Japanese, (options) => new models$4.CurrencyModel(new Map([
            [new extractors$16.BaseMergedUnitExtractor(new currency$8.JapaneseCurrencyExtractorConfiguration()), new parsers$4.BaseMergedUnitParser(new currency$8.JapaneseCurrencyParserConfiguration())],
            [new extractors$16.NumberWithUnitExtractor(new currency.EnglishCurrencyExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new currency.EnglishCurrencyParserConfiguration())]
        ])));
        this.registerModel("AgeModel", recognizersTextNumber.Culture.Japanese, (options) => new models$4.AgeModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new age$8.JapaneseAgeExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new age$8.JapaneseAgeParserConfiguration())],
            [new extractors$16.NumberWithUnitExtractor(new age.EnglishAgeExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new age.EnglishAgeParserConfiguration())]
        ])));
        //#endregion
        //#region French
        this.registerModel("CurrencyModel", recognizersTextNumber.Culture.French, (options) => new models$4.CurrencyModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new currency$10.FrenchCurrencyExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new currency$10.FrenchCurrencyParserConfiguration())]
        ])));
        this.registerModel("TemperatureModel", recognizersTextNumber.Culture.French, (options) => new models$4.TemperatureModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new temperature$8.FrenchTemperatureExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new temperature$8.FrenchTemperatureParserConfiguration())]
        ])));
        this.registerModel("DimensionModel", recognizersTextNumber.Culture.French, (options) => new models$4.DimensionModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new dimension$8.FrenchDimensionExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new dimension$8.FrenchDimensionParserConfiguration())]
        ])));
        this.registerModel("AgeModel", recognizersTextNumber.Culture.French, (options) => new models$4.AgeModel(new Map([
            [new extractors$16.NumberWithUnitExtractor(new age$10.FrenchAgeExtractorConfiguration()), new parsers$4.NumberWithUnitParser(new age$10.FrenchAgeParserConfiguration())]
        ])));
        //#endregion
    }
    IsValidOptions(options) {
        return options >= 0 && options <= NumberWithUnitOptions.None;
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
}
exports.default = NumberWithUnitRecognizer;

});

unwrapExports(numberWithUnitRecognizer);

var recognizersTextNumberWithUnit = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

exports.NumberWithUnitRecognizer = numberWithUnitRecognizer.default;
exports.NumberWithUnitOptions = numberWithUnitRecognizer.NumberWithUnitOptions;
exports.recognizeTemperature = numberWithUnitRecognizer.recognizeTemperature;
exports.recognizeDimension = numberWithUnitRecognizer.recognizeDimension;
exports.recognizeCurrency = numberWithUnitRecognizer.recognizeCurrency;
exports.recognizeAge = numberWithUnitRecognizer.recognizeAge;

exports.Culture = recognizersTextNumber.Culture;
exports.CultureInfo = recognizersTextNumber.CultureInfo;

exports.Constants = constants$2.Constants;

exports.NumberWithUnitExtractor = extractors$16.NumberWithUnitExtractor;
exports.PrefixUnitResult = extractors$16.PrefixUnitResult;
exports.BaseMergedUnitExtractor = extractors$16.BaseMergedUnitExtractor;

exports.CompositeEntityType = models$4.CompositeEntityType;
exports.AbstractNumberWithUnitModel = models$4.AbstractNumberWithUnitModel;
exports.AgeModel = models$4.AgeModel;
exports.CurrencyModel = models$4.CurrencyModel;
exports.DimensionModel = models$4.DimensionModel;
exports.TemperatureModel = models$4.TemperatureModel;

exports.UnitValue = parsers$4.UnitValue;
exports.UnitValueIso = parsers$4.UnitValueIso;
exports.NumberWithUnitParser = parsers$4.NumberWithUnitParser;
exports.BaseNumberWithUnitParserConfiguration = parsers$4.BaseNumberWithUnitParserConfiguration;
exports.BaseCurrencyParser = parsers$4.BaseCurrencyParser;
exports.BaseMergedUnitParser = parsers$4.BaseMergedUnitParser;

exports.EnglishAgeExtractorConfiguration = age.EnglishAgeExtractorConfiguration;
exports.EnglishAgeParserConfiguration = age.EnglishAgeParserConfiguration;

exports.EnglishNumberWithUnitExtractorConfiguration = base.EnglishNumberWithUnitExtractorConfiguration;
exports.EnglishNumberWithUnitParserConfiguration = base.EnglishNumberWithUnitParserConfiguration;

exports.EnglishCurrencyExtractorConfiguration = currency.EnglishCurrencyExtractorConfiguration;
exports.EnglishCurrencyParserConfiguration = currency.EnglishCurrencyParserConfiguration;

exports.EnglishDimensionExtractorConfiguration = dimension.EnglishDimensionExtractorConfiguration;
exports.EnglishDimensionParserConfiguration = dimension.EnglishDimensionParserConfiguration;

exports.EnglishTemperatureExtractorConfiguration = temperature.EnglishTemperatureExtractorConfiguration;
exports.EnglishTemperatureParserConfiguration = temperature.EnglishTemperatureParserConfiguration;

exports.SpanishAgeExtractorConfiguration = age$2.SpanishAgeExtractorConfiguration;
exports.SpanishAgeParserConfiguration = age$2.SpanishAgeParserConfiguration;

exports.SpanishNumberWithUnitExtractorConfiguration = base$2.SpanishNumberWithUnitExtractorConfiguration;
exports.SpanishNumberWithUnitParserConfiguration = base$2.SpanishNumberWithUnitParserConfiguration;

exports.SpanishCurrencyExtractorConfiguration = currency$2.SpanishCurrencyExtractorConfiguration;
exports.SpanishCurrencyParserConfiguration = currency$2.SpanishCurrencyParserConfiguration;

exports.SpanishDimensionExtractorConfiguration = dimension$2.SpanishDimensionExtractorConfiguration;
exports.SpanishDimensionParserConfiguration = dimension$2.SpanishDimensionParserConfiguration;

exports.SpanishTemperatureExtractorConfiguration = temperature$2.SpanishTemperatureExtractorConfiguration;
exports.SpanishTemperatureParserConfiguration = temperature$2.SpanishTemperatureParserConfiguration;

exports.PortugueseAgeExtractorConfiguration = age$4.PortugueseAgeExtractorConfiguration;
exports.PortugueseAgeParserConfiguration = age$4.PortugueseAgeParserConfiguration;

exports.PortugueseNumberWithUnitExtractorConfiguration = base$4.PortugueseNumberWithUnitExtractorConfiguration;
exports.PortugueseNumberWithUnitParserConfiguration = base$4.PortugueseNumberWithUnitParserConfiguration;

exports.PortugueseCurrencyExtractorConfiguration = currency$4.PortugueseCurrencyExtractorConfiguration;
exports.PortugueseCurrencyParserConfiguration = currency$4.PortugueseCurrencyParserConfiguration;

exports.PortugueseDimensionExtractorConfiguration = dimension$4.PortugueseDimensionExtractorConfiguration;
exports.PortugueseDimensionParserConfiguration = dimension$4.PortugueseDimensionParserConfiguration;

exports.PortugueseTemperatureExtractorConfiguration = temperature$4.PortugueseTemperatureExtractorConfiguration;
exports.PortugueseTemperatureParserConfiguration = temperature$4.PortugueseTemperatureParserConfiguration;

exports.ChineseAgeExtractorConfiguration = age$6.ChineseAgeExtractorConfiguration;
exports.ChineseAgeParserConfiguration = age$6.ChineseAgeParserConfiguration;

exports.ChineseNumberWithUnitExtractorConfiguration = base$6.ChineseNumberWithUnitExtractorConfiguration;
exports.ChineseNumberWithUnitParserConfiguration = base$6.ChineseNumberWithUnitParserConfiguration;

exports.ChineseCurrencyExtractorConfiguration = currency$6.ChineseCurrencyExtractorConfiguration;
exports.ChineseCurrencyParserConfiguration = currency$6.ChineseCurrencyParserConfiguration;

exports.ChineseDimensionExtractorConfiguration = dimension$6.ChineseDimensionExtractorConfiguration;
exports.ChineseDimensionParserConfiguration = dimension$6.ChineseDimensionParserConfiguration;

exports.ChineseTemperatureExtractorConfiguration = temperature$6.ChineseTemperatureExtractorConfiguration;
exports.ChineseTemperatureParserConfiguration = temperature$6.ChineseTemperatureParserConfiguration;

exports.JapaneseAgeExtractorConfiguration = age$8.JapaneseAgeExtractorConfiguration;
exports.JapaneseAgeParserConfiguration = age$8.JapaneseAgeParserConfiguration;

exports.JapaneseNumberWithUnitExtractorConfiguration = base$8.JapaneseNumberWithUnitExtractorConfiguration;
exports.JapaneseNumberWithUnitParserConfiguration = base$8.JapaneseNumberWithUnitParserConfiguration;

exports.JapaneseCurrencyExtractorConfiguration = currency$8.JapaneseCurrencyExtractorConfiguration;
exports.JapaneseCurrencyParserConfiguration = currency$8.JapaneseCurrencyParserConfiguration;

exports.EnglishNumericWithUnit = englishNumericWithUnit.EnglishNumericWithUnit;

exports.SpanishNumericWithUnit = spanishNumericWithUnit.SpanishNumericWithUnit;

exports.PortugueseNumericWithUnit = portugueseNumericWithUnit.PortugueseNumericWithUnit;

exports.ChineseNumericWithUnit = chineseNumericWithUnit.ChineseNumericWithUnit;

exports.JapaneseNumericWithUnit = japaneseNumericWithUnit.JapaneseNumericWithUnit;

});

var recognizersTextNumberWithUnit$1 = unwrapExports(recognizersTextNumberWithUnit);
var recognizersTextNumberWithUnit_1 = recognizersTextNumberWithUnit.NumberWithUnitRecognizer;
var recognizersTextNumberWithUnit_2 = recognizersTextNumberWithUnit.NumberWithUnitOptions;
var recognizersTextNumberWithUnit_3 = recognizersTextNumberWithUnit.recognizeTemperature;
var recognizersTextNumberWithUnit_4 = recognizersTextNumberWithUnit.recognizeDimension;
var recognizersTextNumberWithUnit_5 = recognizersTextNumberWithUnit.recognizeCurrency;
var recognizersTextNumberWithUnit_6 = recognizersTextNumberWithUnit.recognizeAge;
var recognizersTextNumberWithUnit_7 = recognizersTextNumberWithUnit.Culture;
var recognizersTextNumberWithUnit_8 = recognizersTextNumberWithUnit.CultureInfo;
var recognizersTextNumberWithUnit_9 = recognizersTextNumberWithUnit.Constants;
var recognizersTextNumberWithUnit_10 = recognizersTextNumberWithUnit.NumberWithUnitExtractor;
var recognizersTextNumberWithUnit_11 = recognizersTextNumberWithUnit.PrefixUnitResult;
var recognizersTextNumberWithUnit_12 = recognizersTextNumberWithUnit.BaseMergedUnitExtractor;
var recognizersTextNumberWithUnit_13 = recognizersTextNumberWithUnit.CompositeEntityType;
var recognizersTextNumberWithUnit_14 = recognizersTextNumberWithUnit.AbstractNumberWithUnitModel;
var recognizersTextNumberWithUnit_15 = recognizersTextNumberWithUnit.AgeModel;
var recognizersTextNumberWithUnit_16 = recognizersTextNumberWithUnit.CurrencyModel;
var recognizersTextNumberWithUnit_17 = recognizersTextNumberWithUnit.DimensionModel;
var recognizersTextNumberWithUnit_18 = recognizersTextNumberWithUnit.TemperatureModel;
var recognizersTextNumberWithUnit_19 = recognizersTextNumberWithUnit.UnitValue;
var recognizersTextNumberWithUnit_20 = recognizersTextNumberWithUnit.UnitValueIso;
var recognizersTextNumberWithUnit_21 = recognizersTextNumberWithUnit.NumberWithUnitParser;
var recognizersTextNumberWithUnit_22 = recognizersTextNumberWithUnit.BaseNumberWithUnitParserConfiguration;
var recognizersTextNumberWithUnit_23 = recognizersTextNumberWithUnit.BaseCurrencyParser;
var recognizersTextNumberWithUnit_24 = recognizersTextNumberWithUnit.BaseMergedUnitParser;
var recognizersTextNumberWithUnit_25 = recognizersTextNumberWithUnit.EnglishAgeExtractorConfiguration;
var recognizersTextNumberWithUnit_26 = recognizersTextNumberWithUnit.EnglishAgeParserConfiguration;
var recognizersTextNumberWithUnit_27 = recognizersTextNumberWithUnit.EnglishNumberWithUnitExtractorConfiguration;
var recognizersTextNumberWithUnit_28 = recognizersTextNumberWithUnit.EnglishNumberWithUnitParserConfiguration;
var recognizersTextNumberWithUnit_29 = recognizersTextNumberWithUnit.EnglishCurrencyExtractorConfiguration;
var recognizersTextNumberWithUnit_30 = recognizersTextNumberWithUnit.EnglishCurrencyParserConfiguration;
var recognizersTextNumberWithUnit_31 = recognizersTextNumberWithUnit.EnglishDimensionExtractorConfiguration;
var recognizersTextNumberWithUnit_32 = recognizersTextNumberWithUnit.EnglishDimensionParserConfiguration;
var recognizersTextNumberWithUnit_33 = recognizersTextNumberWithUnit.EnglishTemperatureExtractorConfiguration;
var recognizersTextNumberWithUnit_34 = recognizersTextNumberWithUnit.EnglishTemperatureParserConfiguration;
var recognizersTextNumberWithUnit_35 = recognizersTextNumberWithUnit.SpanishAgeExtractorConfiguration;
var recognizersTextNumberWithUnit_36 = recognizersTextNumberWithUnit.SpanishAgeParserConfiguration;
var recognizersTextNumberWithUnit_37 = recognizersTextNumberWithUnit.SpanishNumberWithUnitExtractorConfiguration;
var recognizersTextNumberWithUnit_38 = recognizersTextNumberWithUnit.SpanishNumberWithUnitParserConfiguration;
var recognizersTextNumberWithUnit_39 = recognizersTextNumberWithUnit.SpanishCurrencyExtractorConfiguration;
var recognizersTextNumberWithUnit_40 = recognizersTextNumberWithUnit.SpanishCurrencyParserConfiguration;
var recognizersTextNumberWithUnit_41 = recognizersTextNumberWithUnit.SpanishDimensionExtractorConfiguration;
var recognizersTextNumberWithUnit_42 = recognizersTextNumberWithUnit.SpanishDimensionParserConfiguration;
var recognizersTextNumberWithUnit_43 = recognizersTextNumberWithUnit.SpanishTemperatureExtractorConfiguration;
var recognizersTextNumberWithUnit_44 = recognizersTextNumberWithUnit.SpanishTemperatureParserConfiguration;
var recognizersTextNumberWithUnit_45 = recognizersTextNumberWithUnit.PortugueseAgeExtractorConfiguration;
var recognizersTextNumberWithUnit_46 = recognizersTextNumberWithUnit.PortugueseAgeParserConfiguration;
var recognizersTextNumberWithUnit_47 = recognizersTextNumberWithUnit.PortugueseNumberWithUnitExtractorConfiguration;
var recognizersTextNumberWithUnit_48 = recognizersTextNumberWithUnit.PortugueseNumberWithUnitParserConfiguration;
var recognizersTextNumberWithUnit_49 = recognizersTextNumberWithUnit.PortugueseCurrencyExtractorConfiguration;
var recognizersTextNumberWithUnit_50 = recognizersTextNumberWithUnit.PortugueseCurrencyParserConfiguration;
var recognizersTextNumberWithUnit_51 = recognizersTextNumberWithUnit.PortugueseDimensionExtractorConfiguration;
var recognizersTextNumberWithUnit_52 = recognizersTextNumberWithUnit.PortugueseDimensionParserConfiguration;
var recognizersTextNumberWithUnit_53 = recognizersTextNumberWithUnit.PortugueseTemperatureExtractorConfiguration;
var recognizersTextNumberWithUnit_54 = recognizersTextNumberWithUnit.PortugueseTemperatureParserConfiguration;
var recognizersTextNumberWithUnit_55 = recognizersTextNumberWithUnit.ChineseAgeExtractorConfiguration;
var recognizersTextNumberWithUnit_56 = recognizersTextNumberWithUnit.ChineseAgeParserConfiguration;
var recognizersTextNumberWithUnit_57 = recognizersTextNumberWithUnit.ChineseNumberWithUnitExtractorConfiguration;
var recognizersTextNumberWithUnit_58 = recognizersTextNumberWithUnit.ChineseNumberWithUnitParserConfiguration;
var recognizersTextNumberWithUnit_59 = recognizersTextNumberWithUnit.ChineseCurrencyExtractorConfiguration;
var recognizersTextNumberWithUnit_60 = recognizersTextNumberWithUnit.ChineseCurrencyParserConfiguration;
var recognizersTextNumberWithUnit_61 = recognizersTextNumberWithUnit.ChineseDimensionExtractorConfiguration;
var recognizersTextNumberWithUnit_62 = recognizersTextNumberWithUnit.ChineseDimensionParserConfiguration;
var recognizersTextNumberWithUnit_63 = recognizersTextNumberWithUnit.ChineseTemperatureExtractorConfiguration;
var recognizersTextNumberWithUnit_64 = recognizersTextNumberWithUnit.ChineseTemperatureParserConfiguration;
var recognizersTextNumberWithUnit_65 = recognizersTextNumberWithUnit.JapaneseAgeExtractorConfiguration;
var recognizersTextNumberWithUnit_66 = recognizersTextNumberWithUnit.JapaneseAgeParserConfiguration;
var recognizersTextNumberWithUnit_67 = recognizersTextNumberWithUnit.JapaneseNumberWithUnitExtractorConfiguration;
var recognizersTextNumberWithUnit_68 = recognizersTextNumberWithUnit.JapaneseNumberWithUnitParserConfiguration;
var recognizersTextNumberWithUnit_69 = recognizersTextNumberWithUnit.JapaneseCurrencyExtractorConfiguration;
var recognizersTextNumberWithUnit_70 = recognizersTextNumberWithUnit.JapaneseCurrencyParserConfiguration;
var recognizersTextNumberWithUnit_71 = recognizersTextNumberWithUnit.EnglishNumericWithUnit;
var recognizersTextNumberWithUnit_72 = recognizersTextNumberWithUnit.SpanishNumericWithUnit;
var recognizersTextNumberWithUnit_73 = recognizersTextNumberWithUnit.PortugueseNumericWithUnit;
var recognizersTextNumberWithUnit_74 = recognizersTextNumberWithUnit.ChineseNumericWithUnit;
var recognizersTextNumberWithUnit_75 = recognizersTextNumberWithUnit.JapaneseNumericWithUnit;

exports['default'] = recognizersTextNumberWithUnit$1;
exports.NumberWithUnitRecognizer = recognizersTextNumberWithUnit_1;
exports.NumberWithUnitOptions = recognizersTextNumberWithUnit_2;
exports.recognizeTemperature = recognizersTextNumberWithUnit_3;
exports.recognizeDimension = recognizersTextNumberWithUnit_4;
exports.recognizeCurrency = recognizersTextNumberWithUnit_5;
exports.recognizeAge = recognizersTextNumberWithUnit_6;
exports.Culture = recognizersTextNumberWithUnit_7;
exports.CultureInfo = recognizersTextNumberWithUnit_8;
exports.Constants = recognizersTextNumberWithUnit_9;
exports.NumberWithUnitExtractor = recognizersTextNumberWithUnit_10;
exports.PrefixUnitResult = recognizersTextNumberWithUnit_11;
exports.BaseMergedUnitExtractor = recognizersTextNumberWithUnit_12;
exports.CompositeEntityType = recognizersTextNumberWithUnit_13;
exports.AbstractNumberWithUnitModel = recognizersTextNumberWithUnit_14;
exports.AgeModel = recognizersTextNumberWithUnit_15;
exports.CurrencyModel = recognizersTextNumberWithUnit_16;
exports.DimensionModel = recognizersTextNumberWithUnit_17;
exports.TemperatureModel = recognizersTextNumberWithUnit_18;
exports.UnitValue = recognizersTextNumberWithUnit_19;
exports.UnitValueIso = recognizersTextNumberWithUnit_20;
exports.NumberWithUnitParser = recognizersTextNumberWithUnit_21;
exports.BaseNumberWithUnitParserConfiguration = recognizersTextNumberWithUnit_22;
exports.BaseCurrencyParser = recognizersTextNumberWithUnit_23;
exports.BaseMergedUnitParser = recognizersTextNumberWithUnit_24;
exports.EnglishAgeExtractorConfiguration = recognizersTextNumberWithUnit_25;
exports.EnglishAgeParserConfiguration = recognizersTextNumberWithUnit_26;
exports.EnglishNumberWithUnitExtractorConfiguration = recognizersTextNumberWithUnit_27;
exports.EnglishNumberWithUnitParserConfiguration = recognizersTextNumberWithUnit_28;
exports.EnglishCurrencyExtractorConfiguration = recognizersTextNumberWithUnit_29;
exports.EnglishCurrencyParserConfiguration = recognizersTextNumberWithUnit_30;
exports.EnglishDimensionExtractorConfiguration = recognizersTextNumberWithUnit_31;
exports.EnglishDimensionParserConfiguration = recognizersTextNumberWithUnit_32;
exports.EnglishTemperatureExtractorConfiguration = recognizersTextNumberWithUnit_33;
exports.EnglishTemperatureParserConfiguration = recognizersTextNumberWithUnit_34;
exports.SpanishAgeExtractorConfiguration = recognizersTextNumberWithUnit_35;
exports.SpanishAgeParserConfiguration = recognizersTextNumberWithUnit_36;
exports.SpanishNumberWithUnitExtractorConfiguration = recognizersTextNumberWithUnit_37;
exports.SpanishNumberWithUnitParserConfiguration = recognizersTextNumberWithUnit_38;
exports.SpanishCurrencyExtractorConfiguration = recognizersTextNumberWithUnit_39;
exports.SpanishCurrencyParserConfiguration = recognizersTextNumberWithUnit_40;
exports.SpanishDimensionExtractorConfiguration = recognizersTextNumberWithUnit_41;
exports.SpanishDimensionParserConfiguration = recognizersTextNumberWithUnit_42;
exports.SpanishTemperatureExtractorConfiguration = recognizersTextNumberWithUnit_43;
exports.SpanishTemperatureParserConfiguration = recognizersTextNumberWithUnit_44;
exports.PortugueseAgeExtractorConfiguration = recognizersTextNumberWithUnit_45;
exports.PortugueseAgeParserConfiguration = recognizersTextNumberWithUnit_46;
exports.PortugueseNumberWithUnitExtractorConfiguration = recognizersTextNumberWithUnit_47;
exports.PortugueseNumberWithUnitParserConfiguration = recognizersTextNumberWithUnit_48;
exports.PortugueseCurrencyExtractorConfiguration = recognizersTextNumberWithUnit_49;
exports.PortugueseCurrencyParserConfiguration = recognizersTextNumberWithUnit_50;
exports.PortugueseDimensionExtractorConfiguration = recognizersTextNumberWithUnit_51;
exports.PortugueseDimensionParserConfiguration = recognizersTextNumberWithUnit_52;
exports.PortugueseTemperatureExtractorConfiguration = recognizersTextNumberWithUnit_53;
exports.PortugueseTemperatureParserConfiguration = recognizersTextNumberWithUnit_54;
exports.ChineseAgeExtractorConfiguration = recognizersTextNumberWithUnit_55;
exports.ChineseAgeParserConfiguration = recognizersTextNumberWithUnit_56;
exports.ChineseNumberWithUnitExtractorConfiguration = recognizersTextNumberWithUnit_57;
exports.ChineseNumberWithUnitParserConfiguration = recognizersTextNumberWithUnit_58;
exports.ChineseCurrencyExtractorConfiguration = recognizersTextNumberWithUnit_59;
exports.ChineseCurrencyParserConfiguration = recognizersTextNumberWithUnit_60;
exports.ChineseDimensionExtractorConfiguration = recognizersTextNumberWithUnit_61;
exports.ChineseDimensionParserConfiguration = recognizersTextNumberWithUnit_62;
exports.ChineseTemperatureExtractorConfiguration = recognizersTextNumberWithUnit_63;
exports.ChineseTemperatureParserConfiguration = recognizersTextNumberWithUnit_64;
exports.JapaneseAgeExtractorConfiguration = recognizersTextNumberWithUnit_65;
exports.JapaneseAgeParserConfiguration = recognizersTextNumberWithUnit_66;
exports.JapaneseNumberWithUnitExtractorConfiguration = recognizersTextNumberWithUnit_67;
exports.JapaneseNumberWithUnitParserConfiguration = recognizersTextNumberWithUnit_68;
exports.JapaneseCurrencyExtractorConfiguration = recognizersTextNumberWithUnit_69;
exports.JapaneseCurrencyParserConfiguration = recognizersTextNumberWithUnit_70;
exports.EnglishNumericWithUnit = recognizersTextNumberWithUnit_71;
exports.SpanishNumericWithUnit = recognizersTextNumberWithUnit_72;
exports.PortugueseNumericWithUnit = recognizersTextNumberWithUnit_73;
exports.ChineseNumericWithUnit = recognizersTextNumberWithUnit_74;
exports.JapaneseNumericWithUnit = recognizersTextNumberWithUnit_75;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=recognizers-text-number-with-unit.umd.js.map
