"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("../utils");
var chrono = require("chrono-node");
var consts = require("../consts");
var EntityRecognizer = /** @class */ (function () {
    function EntityRecognizer() {
    }
    EntityRecognizer.findEntity = function (entities, type) {
        for (var i = 0; entities && i < entities.length; i++) {
            if (entities[i].type == type) {
                return entities[i];
            }
        }
        return null;
    };
    EntityRecognizer.findAllEntities = function (entities, type) {
        var found = [];
        for (var i = 0; entities && i < entities.length; i++) {
            if (entities[i].type == type) {
                found.push(entities[i]);
            }
        }
        return found;
    };
    EntityRecognizer.parseTime = function (entities) {
        if (typeof entities == 'string') {
            entities = [EntityRecognizer.recognizeTime(entities)];
        }
        return EntityRecognizer.resolveTime(entities);
    };
    EntityRecognizer.resolveTime = function (entities) {
        var _this = this;
        var now = new Date();
        var resolvedDate;
        var date;
        var time;
        entities.forEach(function (entity) {
            if (entity.resolution) {
                switch (entity.resolution.resolution_type || entity.type) {
                    case 'builtin.datetime':
                    case 'builtin.datetime.date':
                    case 'builtin.datetime.time':
                        var parts = (entity.resolution.date || entity.resolution.time).split('T');
                        if (!date && _this.dateExp.test(parts[0])) {
                            date = parts[0];
                        }
                        if (!time && parts[1]) {
                            time = 'T' + parts[1];
                            if (time == 'TMO') {
                                time = 'T08:00:00';
                            }
                            else if (time == 'TNI') {
                                time = 'T20:00:00';
                            }
                            else if (time.length == 3) {
                                time = time + ':00:00';
                            }
                            else if (time.length == 6) {
                                time = time + ':00';
                            }
                        }
                        break;
                    case 'chrono.duration':
                        // Date is already calculated
                        var duration = entity;
                        resolvedDate = duration.resolution.start;
                }
            }
        });
        if (!resolvedDate && (date || time)) {
            // The user can just say "at 9am" so we'll use today if no date.
            if (!date) {
                date = utils.toDate8601(now);
            }
            if (time) {
                date += time;
            }
            resolvedDate = new Date(date);
        }
        return resolvedDate;
    };
    EntityRecognizer.recognizeTime = function (utterance, refDate) {
        var response;
        try {
            var results = chrono.parse(utterance, refDate);
            if (results && results.length > 0) {
                var duration = results[0];
                response = {
                    type: 'chrono.duration',
                    entity: duration.text,
                    startIndex: duration.index,
                    endIndex: duration.index + duration.text.length,
                    resolution: {
                        resolution_type: 'chrono.duration',
                        start: duration.start.date()
                    }
                };
                if (duration.end) {
                    response.resolution.end = duration.end.date();
                }
                if (duration.ref) {
                    response.resolution.ref = duration.ref;
                }
                // Calculate a confidence score based on text coverage and call compareConfidence.
                response.score = duration.text.length / utterance.length;
            }
        }
        catch (err) {
            console.error('Error recognizing time: ' + err.toString());
            response = null;
        }
        return response;
    };
    EntityRecognizer.parseNumber = function (entities) {
        var entity;
        if (typeof entities == 'string') {
            entity = { type: 'text', entity: entities.trim() };
        }
        else {
            entity = EntityRecognizer.findEntity(entities, 'builtin.number');
        }
        if (entity) {
            var match = this.numberExp.exec(entity.entity);
            if (match) {
                return Number(match[0]);
            }
            var oWordMatch = this.findBestMatch(this.ordinalWords, entity.entity, 1.0);
            if (oWordMatch) {
                return oWordMatch.index + 1;
            }
        }
        return Number.NaN;
    };
    EntityRecognizer.parseBoolean = function (utterance, context) {
        utterance = utterance.trim();
        if (context) {
            var locale = context.preferredLocale();
            var pattern = context.localizer.trygettext(locale, 'yesExp', consts.Library.system);
            if (pattern) {
                EntityRecognizer.yesExp = new RegExp(pattern, 'i');
            }
            pattern = context.localizer.trygettext(locale, 'noExp', consts.Library.system);
            if (pattern) {
                EntityRecognizer.noExp = new RegExp(pattern, 'i');
            }
        }
        if (EntityRecognizer.yesExp.test(utterance)) {
            return true;
        }
        else if (EntityRecognizer.noExp.test(utterance)) {
            return false;
        }
        return undefined;
    };
    EntityRecognizer.findBestMatch = function (choices, utterance, threshold) {
        if (threshold === void 0) { threshold = 0.6; }
        var best;
        var matches = EntityRecognizer.findAllMatches(choices, utterance, threshold);
        matches.forEach(function (value) {
            if (!best || value.score > best.score) {
                best = value;
            }
        });
        return best;
    };
    EntityRecognizer.findAllMatches = function (choices, utterance, threshold) {
        if (threshold === void 0) { threshold = 0.6; }
        var matches = [];
        utterance = utterance.trim().toLowerCase();
        var tokens = utterance.split(' ');
        EntityRecognizer.expandChoices(choices).forEach(function (choice, index) {
            var score = 0.0;
            var value = choice.trim().toLowerCase();
            if (value.indexOf(utterance) >= 0) {
                score = utterance.length / value.length;
            }
            else if (utterance.indexOf(value) >= 0) {
                score = Math.min(0.5 + (value.length / utterance.length), 0.9);
            }
            else {
                var matched = {};
                tokens.forEach(function (token) {
                    if (value.indexOf(token) >= 0) {
                        if (!matched[token]) {
                            matched[token] = 1;
                        }
                    }
                });
                var tokenizedValue = value.split(' ');
                var tokenScore = 0;
                for (var token in matched) {
                    tokenizedValue.forEach(function (val) {
                        if (val.indexOf(token) >= 0 && token.length <= val.length / 2) {
                            matched[token]--;
                        }
                        else if (val.indexOf(token) == -1) {
                        }
                        else {
                            matched[token]++;
                        }
                    });
                }
                for (var token in matched) {
                    if (matched[token] > 0) {
                        tokenScore += token.length;
                    }
                }
                score = tokenScore / value.length;
                score = score > 1 ? 1 : score;
            }
            if (score >= threshold) {
                matches.push({ index: index, entity: choice, score: score });
            }
        });
        return matches;
    };
    EntityRecognizer.expandChoices = function (choices) {
        if (!choices) {
            return [];
        }
        else if (Array.isArray(choices)) {
            return choices;
        }
        else if (typeof choices == 'string') {
            return choices.split('|');
        }
        else if (typeof choices == 'object') {
            var list = [];
            for (var key in choices) {
                list.push(key);
            }
            return list;
        }
        else {
            return [choices.toString()];
        }
    };
    EntityRecognizer.dateExp = /^\d{4}-\d{2}-\d{2}/i;
    EntityRecognizer.yesExp = /^(1|y|yes|yep|sure|ok|true)(\W|$)/i;
    EntityRecognizer.noExp = /^(2|n|no|nope|not|false)(\W|$)/i;
    EntityRecognizer.numberExp = /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/;
    EntityRecognizer.ordinalWords = 'first|second|third|fourth|fifth|sixth|seventh|eigth|ninth|tenth';
    return EntityRecognizer;
}());
exports.EntityRecognizer = EntityRecognizer;
