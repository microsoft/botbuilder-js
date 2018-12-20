"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var entities = require("html-entities");
var request = require("request-promise-native");
var pjson = require('../package.json');
var os = require("os");
var QNAMAKER_TRACE_TYPE = 'https://www.qnamaker.ai/schemas/trace';
var QNAMAKER_TRACE_NAME = 'QnAMaker';
var QNAMAKER_TRACE_LABEL = 'QnAMaker Trace';
/**
 * @private
 */
var htmlentities = new entities.AllHtmlEntities();
/**
 * Query a QnA Maker knowledge base for answers.
 *
 * @remarks
 * This class is used to make queries to a single QnA Maker knowledge base and return the result.
 *
 * Use this to process incoming messages with the [getAnswers()](#getAnswers) method.
 */
var QnAMaker = /** @class */ (function () {
    /**
     * Creates a new QnAMaker instance.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param options (Optional) additional settings used to configure the instance.
     */
    function QnAMaker(endpoint, options) {
        if (options === void 0) { options = {}; }
        this.endpoint = endpoint;
        this.validate(endpoint);
        var _a = options.scoreThreshold, scoreThreshold = _a === void 0 ? 0.3 : _a, _b = options.top, top = _b === void 0 ? 1 : _b, _c = options.strictFilters, strictFilters = _c === void 0 ? [] : _c, _d = options.metadataBoost, metadataBoost = _d === void 0 ? [] : _d;
        this._options = {
            scoreThreshold: scoreThreshold,
            top: top,
            strictFilters: strictFilters,
            metadataBoost: metadataBoost
        };
        this.validate(this._options);
    }
    /**
     * Calls the QnA Maker service to generate answer(s) for a question.
     *
     * @remarks
     * Returns an array of answers sorted by score with the top scoring answer returned first.
     *
     * In addition to returning the results from QnA Maker, [getAnswers()](#getAnswers) will also
     * emit a trace activity that contains the QnA Maker results.
     *
     * @param context The Turn Context that contains the user question to be queried against your knowledge base.
     * @param options (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance.
     */
    QnAMaker.prototype.getAnswers = function (context, options) {
        return __awaiter(this, void 0, void 0, function () {
            var queryResult, queryOptions, question, answers, sortedQnaAnswers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!context) {
                            throw new Error('Invalid argument. QnAMaker.getAnswers() requires a TurnContext.');
                        }
                        queryResult = [];
                        queryOptions = __assign({}, this._options, options);
                        question = this.getTrimmedMessageText(context);
                        if (!(question.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.queryQnaService(this.endpoint, question, queryOptions)];
                    case 1:
                        answers = _a.sent();
                        sortedQnaAnswers = this.sortAnswersWithinThreshold(answers, queryOptions);
                        queryResult.push.apply(queryResult, sortedQnaAnswers);
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.emitTraceInfo(context, queryResult, queryOptions)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, queryResult];
                }
            });
        });
    };
    /**
     * Gets the message from the Activity in the TurnContext, trimmed of whitespaces.
     */
    QnAMaker.prototype.getTrimmedMessageText = function (context) {
        var question = context && context.activity ? context.activity.text : '';
        var trimmedQuestion = question ? question.trim() : '';
        return trimmedQuestion;
    };
    /**
     * Called internally to query the QnA Maker service.
     */
    QnAMaker.prototype.queryQnaService = function (endpoint, question, options) {
        return __awaiter(this, void 0, void 0, function () {
            var url, headers, isLegacyProtocol, queryOptions, qnaResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = endpoint.host + "/knowledgebases/" + endpoint.knowledgeBaseId + "/generateanswer";
                        headers = {};
                        isLegacyProtocol = endpoint.host.endsWith('v2.0') || endpoint.host.endsWith('v3.0');
                        queryOptions = __assign({}, this._options, options);
                        if (isLegacyProtocol) {
                            headers['Ocp-Apim-Subscription-Key'] = endpoint.endpointKey;
                        }
                        else {
                            headers.Authorization = "EndpointKey " + endpoint.endpointKey;
                        }
                        headers['User-Agent'] = this.getUserAgent();
                        return [4 /*yield*/, request({
                                url: url,
                                method: 'POST',
                                headers: headers,
                                json: __assign({ question: question }, queryOptions)
                            })];
                    case 1:
                        qnaResult = _a.sent();
                        return [2 /*return*/, qnaResult.answers.map(function (ans) {
                                ans.score = ans.score / 100;
                                ans.answer = htmlentities.decode(ans.answer);
                                if (ans.qnaId) {
                                    ans.id = ans.qnaId;
                                    delete ans.qnaId;
                                }
                                return ans;
                            })];
                }
            });
        });
    };
    /**
     * Sorts all QnAMakerResult from highest-to-lowest scoring.
     * Filters QnAMakerResults within threshold specified (default threshold: .001).
     */
    QnAMaker.prototype.sortAnswersWithinThreshold = function (answers, queryOptions) {
        if (answers === void 0) { answers = []; }
        var minScore = typeof queryOptions.scoreThreshold === 'number' ? queryOptions.scoreThreshold : 0.001;
        var sortedQnaAnswers = answers.filter(function (ans) { return ans.score >= minScore; }).sort(function (a, b) { return b.score - a.score; });
        return sortedQnaAnswers;
    };
    QnAMaker.prototype.validate = function (qnaParameter) {
        if (this.isEndpoint(qnaParameter)) {
            this.validateEndpoint(qnaParameter);
        }
        if (this.isOptions(qnaParameter)) {
            this.validateOptions(qnaParameter);
        }
    };
    QnAMaker.prototype.getUserAgent = function () {
        var packageUserAgent = pjson.name + "/" + pjson.version;
        var platformUserAgent = "(" + os.arch() + "-" + os.type() + "-" + os.release() + "; Node.js,Version=" + process.version + ")";
        var userAgent = packageUserAgent + " " + platformUserAgent;
        return userAgent;
    };
    /**
     * Emits a trace event detailing a QnA Maker call and its results.
     *
     * @param context Context for the current turn of conversation with the user.
     * @param answers Answers returned by QnA Maker.
     */
    QnAMaker.prototype.emitTraceInfo = function (context, answers, queryOptions) {
        var requestOptions = __assign({}, this._options, queryOptions);
        var scoreThreshold = requestOptions.scoreThreshold, top = requestOptions.top, strictFilters = requestOptions.strictFilters, metadataBoost = requestOptions.metadataBoost;
        var traceInfo = {
            message: context.activity,
            queryResults: answers,
            knowledgeBaseId: this.endpoint.knowledgeBaseId,
            scoreThreshold: scoreThreshold,
            top: top,
            strictFilters: strictFilters,
            metadataBoost: metadataBoost
        };
        return context.sendActivity({
            type: 'trace',
            valueType: QNAMAKER_TRACE_TYPE,
            name: QNAMAKER_TRACE_NAME,
            label: QNAMAKER_TRACE_LABEL,
            value: traceInfo
        });
    };
    QnAMaker.prototype.isEndpoint = function (qnaParameter) {
        return qnaParameter.knowledgeBaseId !== undefined
            && qnaParameter.endpointKey !== undefined
            && qnaParameter.host !== undefined;
    };
    QnAMaker.prototype.validateEndpoint = function (endpoint) {
        if (!endpoint) {
            throw new Error('Must provide a QnAMakerEndpoint.');
        }
        var knowledgeBaseId = endpoint.knowledgeBaseId, host = endpoint.host, endpointKey = endpoint.endpointKey;
        if (!knowledgeBaseId || typeof knowledgeBaseId !== 'string') {
            throw new Error('Must provide valid knowledgeBaseId string in QnAMakerEndpoint.');
        }
        if (!host || typeof host !== 'string') {
            throw new Error('Must provide valid host path string in QnAMakerEndpoint.');
        }
        if (!endpointKey || typeof endpointKey !== 'string') {
            throw new Error('Must provide valid endpointKey string in QnAMakerEndpoint.');
        }
    };
    QnAMaker.prototype.isOptions = function (options) {
        var scoreThreshold = options.scoreThreshold, top = options.top, strictFilters = options.strictFilters, metadataBoost = options.metadataBoost;
        return scoreThreshold !== undefined
            || top !== undefined
            || strictFilters !== undefined
            || metadataBoost !== undefined;
    };
    QnAMaker.prototype.validateOptions = function (options) {
        var scoreThreshold = options.scoreThreshold, top = options.top;
        if (scoreThreshold) {
            this.validateScoreThreshold(scoreThreshold);
        }
        if (top) {
            this.validateTop(top);
        }
    };
    QnAMaker.prototype.validateScoreThreshold = function (scoreThreshold) {
        if (typeof scoreThreshold !== 'number' || !this.isValidScore(scoreThreshold)) {
            throw new Error('Invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.');
        }
    };
    QnAMaker.prototype.isValidScore = function (number) {
        return number > 0 && number < 1;
    };
    QnAMaker.prototype.validateTop = function (qnaOptionTop) {
        if (!Number.isInteger(qnaOptionTop) || qnaOptionTop < 1) {
            throw new Error('Invalid "top" value. QnAMakerOptions.top must be an integer greater than 0.');
        }
    };
    /**
     * Calls [generateAnswer()](#generateanswer) and sends the resulting answer as a reply to the user.
     *
     * @remarks
     * Returns a value of `true` if an answer was found and sent. If multiple answers are
     * returned the first one will be delivered.
     * @param context Context for the current turn of conversation with the user.
     */
    QnAMaker.prototype.answer = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, top, scoreThreshold, answers;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this._options, top = _a.top, scoreThreshold = _a.scoreThreshold;
                        return [4 /*yield*/, this.generateAnswer(context.activity.text, top, scoreThreshold)];
                    case 1:
                        answers = _b.sent();
                        return [4 /*yield*/, this.emitTraceInfo(context, answers, this._options)];
                    case 2:
                        _b.sent();
                        if (!(answers.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, context.sendActivity({ text: answers[0].answer, type: 'message' })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 4: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Calls the QnA Maker service to generate answer(s) for a question.
     *
     * @deprecated  Instead, favor using [QnAMaker.getAnswers()](#getAnswers) to generate answers for a question.
     *
     * @remarks
     * Returns an array of answers sorted by score with the top scoring answer returned first.
     *
     * @param question The question to answer.
     * @param top (Optional) number of answers to return. Defaults to a value of `1`.
     * @param scoreThreshold (Optional) minimum answer score needed to be considered a match to questions. Defaults to a value of `0.001`.
     */
    QnAMaker.prototype.generateAnswer = function (question, top, scoreThreshold) {
        return __awaiter(this, void 0, void 0, function () {
            var trimmedAnswer, answers, minScore_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trimmedAnswer = question ? question.trim() : '';
                        if (!(trimmedAnswer.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.callService(this.endpoint, question, typeof top === 'number' ? top : 1)];
                    case 1:
                        answers = _a.sent();
                        minScore_1 = typeof scoreThreshold === 'number' ? scoreThreshold : 0.001;
                        return [2 /*return*/, answers.filter(function (ans) { return ans.score >= minScore_1; }).sort(function (a, b) { return b.score - a.score; })];
                    case 2: return [2 /*return*/, []];
                }
            });
        });
    };
    /**
     * Called internally to query the QnA Maker service.
     *
     * @remarks
     * This is exposed to enable better unit testing of the service.
     */
    QnAMaker.prototype.callService = function (endpoint, question, top) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.queryQnaService(endpoint, question, { top: top })];
            });
        });
    };
    return QnAMaker;
}());
exports.QnAMaker = QnAMaker;
