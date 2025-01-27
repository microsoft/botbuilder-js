'use strict';

var recognizersTextNumber = require('../recognizers-number');
var recognizersTextNumberWithUnit = require('../recognizers-number-with-unit');
var recognizersTextDateTime = require('../recognizers-date-time');
var recognizersTextChoice = require('../recognizers-choice');
var recognizersTextSequence = require('../recognizers-sequence');

Object.defineProperty(exports, "Culture", {
  enumerable: true,
  get: function () { return recognizersTextNumber.Culture; }
});
Object.defineProperty(exports, "NumberOptions", {
  enumerable: true,
  get: function () { return recognizersTextNumber.NumberOptions; }
});
Object.defineProperty(exports, "recognizeNumber", {
  enumerable: true,
  get: function () { return recognizersTextNumber.recognizeNumber; }
});
Object.defineProperty(exports, "recognizeOrdinal", {
  enumerable: true,
  get: function () { return recognizersTextNumber.recognizeOrdinal; }
});
Object.defineProperty(exports, "recognizePercentage", {
  enumerable: true,
  get: function () { return recognizersTextNumber.recognizePercentage; }
});
Object.defineProperty(exports, "NumberWithUnitOptions", {
  enumerable: true,
  get: function () { return recognizersTextNumberWithUnit.NumberWithUnitOptions; }
});
Object.defineProperty(exports, "recognizeAge", {
  enumerable: true,
  get: function () { return recognizersTextNumberWithUnit.recognizeAge; }
});
Object.defineProperty(exports, "recognizeCurrency", {
  enumerable: true,
  get: function () { return recognizersTextNumberWithUnit.recognizeCurrency; }
});
Object.defineProperty(exports, "recognizeDimension", {
  enumerable: true,
  get: function () { return recognizersTextNumberWithUnit.recognizeDimension; }
});
Object.defineProperty(exports, "recognizeTemperature", {
  enumerable: true,
  get: function () { return recognizersTextNumberWithUnit.recognizeTemperature; }
});
Object.defineProperty(exports, "DateTimeOptions", {
  enumerable: true,
  get: function () { return recognizersTextDateTime.DateTimeOptions; }
});
Object.defineProperty(exports, "recognizeDateTime", {
  enumerable: true,
  get: function () { return recognizersTextDateTime.recognizeDateTime; }
});
Object.defineProperty(exports, "ChoiceOptions", {
  enumerable: true,
  get: function () { return recognizersTextChoice.ChoiceOptions; }
});
Object.defineProperty(exports, "recognizeBoolean", {
  enumerable: true,
  get: function () { return recognizersTextChoice.recognizeBoolean; }
});
Object.defineProperty(exports, "SequenceOptions", {
  enumerable: true,
  get: function () { return recognizersTextSequence.SequenceOptions; }
});
Object.defineProperty(exports, "recognizeEmail", {
  enumerable: true,
  get: function () { return recognizersTextSequence.recognizeEmail; }
});
Object.defineProperty(exports, "recognizeGUID", {
  enumerable: true,
  get: function () { return recognizersTextSequence.recognizeGUID; }
});
Object.defineProperty(exports, "recognizeHashtag", {
  enumerable: true,
  get: function () { return recognizersTextSequence.recognizeHashtag; }
});
Object.defineProperty(exports, "recognizeIpAddress", {
  enumerable: true,
  get: function () { return recognizersTextSequence.recognizeIpAddress; }
});
Object.defineProperty(exports, "recognizeMention", {
  enumerable: true,
  get: function () { return recognizersTextSequence.recognizeMention; }
});
Object.defineProperty(exports, "recognizePhoneNumber", {
  enumerable: true,
  get: function () { return recognizersTextSequence.recognizePhoneNumber; }
});
Object.defineProperty(exports, "recognizeURL", {
  enumerable: true,
  get: function () { return recognizersTextSequence.recognizeURL; }
});
