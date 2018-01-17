define("botbuilder", [], function() { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @module botbuilder
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
/** List of activity types supported by the Bot Framework. */
exports.ActivityTypes = {
    /** A message sent from or to a user/group. */
    message: 'message',
    /** A user has added/removed the bot as a contact. */
    contactRelationUpdate: 'contactRelationUpdate',
    /** User(s) have either joined or left the conversation. */
    conversationUpdate: 'conversationUpdate',
    /** An indicator that the bot is typing. Should be periodically resent every few seconds. */
    typing: 'typing',
    /** The conversation is being ended by either the bot or user. */
    endOfConversation: 'endOfConversation',
    /** A named event sent from or to a client. */
    event: 'event',
    /** An operation is being invoked. */
    invoke: 'invoke'
};
/** Desired text format for a message being sent to a user. */
exports.TextFormats = {
    /** Message text should be rendered as plain text. */
    plain: 'plain',
    /** Message text should be rendered using markdown. */
    markdown: 'markdown'
};
/** Desired layout style for a list of attachments sent to a user. */
exports.AttachmentLayouts = {
    /** Attachments should be rendered as a list. */
    list: 'list',
    /** Attachments should be rendered using a carousel layout. */
    carousel: 'carousel'
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Middleware that's the base class for all intent recognizers.
 *
 * __Extends BotContext:__
 * * context.topIntent - The top recognized `Intent` for the users utterance.
 */
class IntentRecognizer {
    constructor() {
        this.enabledChain = [];
        this.recognizeChain = [];
        this.filterChain = [];
    }
    receiveActivity(context) {
        return this.recognize(context)
            .then((intents) => IntentRecognizer.findTopIntent(intents))
            .then((intent) => {
            if (intent && intent.score > 0.0) {
                context.topIntent = intent;
            }
            return { handled: false };
        });
    }
    /**
     * Recognizes intents for the current context. The return value is 0 or more recognized intents.
     * @param context Context for the current turn of the conversation.
     */
    recognize(context) {
        return new Promise((resolve, reject) => {
            this.runEnabled(context)
                .then((enabled) => {
                if (enabled) {
                    this.runRecognize(context)
                        .then((intents) => this.runFilter(context, intents || []))
                        .then((intents) => resolve(intents))
                        .catch((err) => reject(err));
                }
                else {
                    resolve([]);
                }
            })
                .catch((err) => reject(err));
        });
    }
    /**
     * Adds a handler that lets you conditionally determine if a recognizer should run. Multiple
     * handlers can be registered and they will be called in the reverse order they are added
     * so the last handler added will be the first called.
     * @param handler Function that will be called anytime the recognizer is run. If the handler
     * returns true the recognizer will be run. Returning false disables the recognizer.
     */
    onEnabled(handler) {
        this.enabledChain.unshift(handler);
        return this;
    }
    /**
     * Adds a handler that will be called to recognize the users intent. Multiple handlers can
     * be registered and they will be called in the reverse order they are added so the last
     * handler added will be the first called.
     * @param handler Function that will be called to recognize a users intent.
     */
    onRecognize(handler) {
        this.recognizeChain.unshift(handler);
        return this;
    }
    /**
     * Adds a handler that will be called post recognition to filter the output of the recognizer.
     * The filter receives all of the intents that were recognized and can return a subset, or
     * additional, or even all new intents as its response. This filtering adds a convenient second
     * layer of processing to intent recognition. Multiple handlers can be registered and they will
     * be called in the order they are added.
     * @param handler Function that will be called to filter the output intents. If an array is returned
     * that will become the new set of output intents passed on to the next filter. The final filter in
     * the chain will reduce the output set of intents to a single top scoring intent.
     */
    onFilter(handler) {
        this.filterChain.push(handler);
        return this;
    }
    runEnabled(context) {
        return new Promise((resolve, reject) => {
            const chain = this.enabledChain.slice();
            function next(i = 0) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context)).then((enabled) => {
                            if (typeof enabled === 'boolean' && enabled === false) {
                                resolve(false); // Short-circuit chain
                            }
                            else {
                                next(i + 1);
                            }
                        }).catch((err) => reject(err));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(true);
                }
            }
            next();
        });
    }
    runRecognize(context) {
        return new Promise((resolve, reject) => {
            let intents = [];
            const chain = this.recognizeChain.slice();
            function next(i = 0) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context)).then((result) => {
                            if (Array.isArray(result)) {
                                intents = intents.concat(result);
                            }
                            next(i + 1);
                        }).catch((err) => reject(err));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(intents);
                }
            }
            next();
        });
    }
    runFilter(context, intents) {
        return new Promise((resolve, reject) => {
            let filtered = intents;
            const chain = this.filterChain.slice();
            function next(i = 0) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context, filtered)).then((result) => {
                            if (Array.isArray(result)) {
                                filtered = result;
                            }
                            next(i + 1);
                        }).catch((err) => reject(err));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(filtered);
                }
            }
            next();
        });
    }
    /**
     * Finds the top scoring intent given a set of intents.
     * @param intents Array of intents to filter.
     */
    static findTopIntent(intents) {
        return new Promise((resolve, reject) => {
            let top = undefined;
            (intents || []).forEach((intent) => {
                if (!top || intent.score > top.score) {
                    top = intent;
                }
            });
            resolve(top);
        });
    }
}
exports.IntentRecognizer = IntentRecognizer;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const entityRules = __webpack_require__(12);
const breakingChars = " \n\r~`!@#$%^&*()-+={}|[]\\:\";'<>?,./";
/** Well known entity types. */
exports.EntityTypes = {
    attachment: 'attachment',
    string: 'string',
    number: 'number',
    boolean: 'boolean'
};
/**
 * A set of utility functions to simplify the recognition of entities within a users utterance.
 */
class EntityRecognizers {
    static recognizeLocalizedRegExp(context, expId) {
        // Lookup expression
        let exp = undefined;
        const entities = [];
        const locale = context.request.locale || 'en';
        const utterance = context.request.text ? context.request.text.trim() : '';
        const rules = entityRules.find(locale);
        if (rules && rules.hasOwnProperty(expId)) {
            exp = rules[expId];
        }
        // Recognize expression
        if (exp) {
            let matches = matchAll(exp, utterance);
            matches.forEach((value) => {
                entities.push({
                    type: exports.EntityTypes.string,
                    value: value,
                    score: EntityRecognizers.coverageScore(utterance, value)
                });
            });
        }
        // Return matches
        return entities;
    }
    static recognizeLocalizedChoices(context, listId, options) {
        // Ensure cached
        const locale = context.request.locale || 'en';
        const utterance = context.request.text ? context.request.text.trim() : '';
        let cache = choiceCache[listId];
        if (!cache) {
            choiceCache[listId] = cache = {};
        }
        let choices = cache[locale];
        if (!choices) {
            // Map list to choices and cache
            const rules = entityRules.find(locale);
            if (rules && rules.hasOwnProperty(listId)) {
                cache[locale] = choices = EntityRecognizers.toChoices(rules[listId]);
            }
        }
        // Call recognizeChoices() with cached choice list.
        return choices ? EntityRecognizers.recognizeChoices(utterance, choices, options) : [];
    }
    /**
     * Converts a list in "value1=synonym1,synonym2|value2" format to a `Choice` array.
     * @param list Formatted list of choices to convert.
     */
    static toChoices(list) {
        let choices = [];
        if (list) {
            list.split('|').forEach((value, index) => {
                let pos = value.indexOf('=');
                if (pos > 0) {
                    choices.push({
                        value: value.substr(0, pos),
                        synonyms: value.substr(pos + 1).split(',')
                    });
                }
                else {
                    choices.push({
                        value: value,
                        synonyms: []
                    });
                }
            });
        }
        return choices;
    }
    /**
     * Recognizes any true/false or yes/no expressions in an utterance.
     * @param context Context for the current turn of the conversation.
     */
    static recognizeBooleans(context) {
        // Recognize boolean expressions.
        let entities = [];
        let results = EntityRecognizers.recognizeLocalizedChoices(context, 'boolean_choices', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let value = (result.value === 'true');
                entities.push({
                    type: exports.EntityTypes.boolean,
                    value: value,
                    score: result.score
                });
            });
        }
        return entities;
    }
    /**
     * Recognizes any numbers mentioned in an utterance.
     * @param context Context for the current turn of the conversation.
     * @param options (Optional) additional options to restrict the range of valid numbers that
     * will be recognized.
     */
    static recognizeNumbers(context, options) {
        function addEntity(n, score) {
            if ((typeof opt.minValue !== 'number' || n >= opt.minValue) &&
                (typeof opt.maxValue !== 'number' || n <= opt.maxValue) &&
                (!opt.integerOnly || Math.floor(n) == n)) {
                entities.push({
                    type: exports.EntityTypes.number,
                    value: n,
                    score: score
                });
            }
        }
        // Recognize any digit based numbers
        const opt = options || {};
        let entities = [];
        let matches = EntityRecognizers.recognizeLocalizedRegExp(context, 'number_exp');
        if (matches) {
            matches.forEach((entity) => {
                let n = Number(entity.value);
                addEntity(n, entity.score);
            });
        }
        // Recognize any term based numbers
        let results = EntityRecognizers.recognizeLocalizedChoices(context, 'number_terms', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let n = Number(result.value);
                addEntity(n, result.score);
            });
        }
        return entities;
    }
    /**
     * Recognizes any ordinals, like "the second one", mentioned in an utterance.
     * @param context Context for the current turn of the conversation.
     */
    static recognizeOrdinals(context) {
        // Recognize positive ordinals like "the first one"
        let entities = [];
        let results = EntityRecognizers.recognizeLocalizedChoices(context, 'number_ordinals', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let n = Number(result.value);
                entities.push({
                    type: exports.EntityTypes.number,
                    value: n,
                    score: result.score
                });
            });
        }
        // Recognize reverse ordinals like "the last one"
        results = EntityRecognizers.recognizeLocalizedChoices(context, 'number_reverse_ordinals', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let n = Number(result.value);
                entities.push({
                    type: exports.EntityTypes.number,
                    value: n,
                    score: result.score
                });
            });
        }
        return entities;
    }
    /**
     * Recognizes a set of choices (including synonyms) in an utterance.
     * @param context Context for the current turn of the conversation.
     * @param choices Array of choices to match against.
     * @param options (Optional) additional options to customize the recognition.
     */
    static recognizeChoices(utterance, choices, options) {
        const opt = options || {};
        let entities = [];
        choices.forEach((choice, index) => {
            // Build list of values to search over.
            let values = Array.isArray(choice.synonyms) ? choice.synonyms : (choice.synonyms || '').split('|');
            if (!opt.excludeValue) {
                values.push(choice.value);
            }
            if (choice.action && !opt.excludeAction) {
                let action = choice.action;
                if (action.title && action.title !== choice.value) {
                    values.push(action.title);
                }
                if (action.value && action.value !== choice.value && action.value !== action.title) {
                    values.push(action.value);
                }
            }
            // Recognize matched values.
            let match = EntityRecognizers.findTopEntity(EntityRecognizers.recognizeValues(utterance, values, options));
            if (match) {
                // Push the choice onto the list of matches. 
                entities.push({
                    type: exports.EntityTypes.string,
                    score: match.score,
                    value: choice.value
                });
            }
        });
        return entities;
    }
    /**
     * Recognizes a set of values mentioned in an utterance. The zero based index of the match is returned.
     * @param context Context for the current turn of the conversation.
     * @param value Array of values to match against. If a RegExp is provided the pattern will be matched
     * against the utterance.
     * @param options (Optional) additional options to customize the recognition that's performed.
     */
    static recognizeValues(utterance, values, options) {
        function indexOfToken(token, startPos) {
            for (let i = startPos; i < tokens.length; i++) {
                if (tokens[i] === token) {
                    return i;
                }
            }
            return -1;
        }
        function matchValue(vTokens, startPos) {
            // Match value to utterance 
            // - The tokens are matched in order so "second last" will match in 
            //   "the second from last one" but not in "the last from the second one".
            let matched = 0;
            let totalDeviation = 0;
            vTokens.forEach((token) => {
                let pos = indexOfToken(token, startPos);
                if (pos >= 0) {
                    let distance = matched > 0 ? pos - startPos : 0;
                    if (distance <= maxDistance) {
                        matched++;
                        totalDeviation += distance;
                        startPos = pos + 1;
                    }
                }
            });
            // Calculate score
            let score = 0.0;
            if (matched > 0 && (matched == vTokens.length || opt.allowPartialMatches)) {
                // Percentage of tokens matched. If matching "second last" in 
                // "the second from the last one" the completeness would be 1.0 since
                // all tokens were found.
                let completeness = matched / vTokens.length;
                // Accuracy of the match. In our example scenario the accuracy would 
                // be 0.5. 
                let accuracy = completeness * (matched / (matched + totalDeviation));
                // Calculate initial score on a scale from 0.0 - 1.0. For our example
                // we end up with an initial score of 0.166 because the utterance was
                // long and accuracy was low. We'll give this a boost in the next step.
                let initialScore = accuracy * (matched / tokens.length);
                // Calculate final score by changing the scale of the initial score from
                // 0.0 - 1.0 to 0.4 - 1.0. This will ensure that even a low score "can"
                // match. For our example we land on a final score of 0.4996.
                score = 0.4 + (0.6 * initialScore);
            }
            return score;
        }
        let opt = options || {};
        let entities = [];
        let text = utterance.trim().toLowerCase();
        let tokens = tokenize(text);
        let maxDistance = opt.hasOwnProperty('maxTokenDistance') ? opt.maxTokenDistance : 2;
        values.forEach((value, index) => {
            if (typeof value === 'string') {
                // To match "last one" in "the last time I chose the last one" we need 
                // to recursively search the utterance starting from each token position.
                let topScore = 0.0;
                let vTokens = tokenize(value.trim().toLowerCase());
                for (let i = 0; i < tokens.length; i++) {
                    let score = matchValue(vTokens, i);
                    if (score > topScore) {
                        topScore = score;
                    }
                }
                if (topScore > 0.0) {
                    entities.push({
                        type: exports.EntityTypes.number,
                        value: index,
                        score: topScore
                    });
                }
            }
            else {
                let matches = value.exec(text) || [];
                if (matches.length > 0) {
                    entities.push({
                        type: exports.EntityTypes.number,
                        value: index,
                        score: EntityRecognizers.coverageScore(text, matches[0])
                    });
                }
            }
        });
        return entities;
    }
    /**
     * Returns the entity with the highest score.
     * @param entities List of entities to filter.
     */
    static findTopEntity(entities) {
        let top;
        if (entities) {
            entities.forEach((entity) => {
                if (entity && entity.score && (!top || entity.score > top.score)) {
                    top = entity;
                }
            });
        }
        return top;
    }
    /** Calculates the coverage score for a recognized entity. */
    static coverageScore(utterance, entity, min = 0.4) {
        const coverage = (entity.length / utterance.length);
        return min + (coverage * (1.0 - min));
    }
}
EntityRecognizers.numOrdinals = {};
exports.EntityRecognizers = EntityRecognizers;
/** Matches all occurrences of an expression in a string. */
function matchAll(exp, text) {
    exp.lastIndex = 0;
    let matches = [];
    let match;
    while ((match = exp.exec(text)) != null) {
        matches.push(match[0]);
    }
    return matches;
}
/** Breaks a string of text into an array of tokens. */
function tokenize(text) {
    let tokens = [];
    if (text && text.length > 0) {
        let token = '';
        for (let i = 0; i < text.length; i++) {
            const chr = text[i];
            if (breakingChars.indexOf(chr) >= 0) {
                if (token.length > 0) {
                    tokens.push(token);
                }
                token = '';
            }
            else {
                token += chr;
            }
        }
        if (token.length > 0) {
            tokens.push(token);
        }
    }
    return tokens;
}
const expCache = {};
const choiceCache = {};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/** second comment block */
const middlewareSet_1 = __webpack_require__(4);
const activity_1 = __webpack_require__(0);
const botContext_1 = __webpack_require__(13);
/**
 * Manages all communication between the bot and a user.
 */
class Bot extends middlewareSet_1.MiddlewareSet {
    /**
     * Creates a new instance of a bot.
     * @param connector Connector used to link the bot to the user communication wise.
     */
    constructor(connector) {
        super();
        this.receivers = [];
        // Bind to connector
        this.connector = connector;
    }
    /** Returns the current connector. */
    get connector() {
        return this._connector;
    }
    /** Changes the bots connector. The previous connector will first be disconnected from.  */
    set connector(connector) {
        if (!connector) {
            throw new Error(`Please provide a Connector`);
        }
        // Disconnect from existing connector
        if (this._connector) {
            this._connector.onReceive = undefined;
        }
        // Connect to new connector
        this._connector = connector;
        this._connector.onReceive = (activity) => this.receive(activity);
    }
    /**
     * Creates a new context object given an activity. You should call `context.done()` once
     * finished using the created context object.
     * @param activity Activity to initialize the context object with.
     */
    createContext(activity) {
        const context = botContext_1.createBotContext(this, activity);
        return this.contextCreated(context).then(() => context);
    }
    /**
     * Creates a new context object given a conversation reference. This is useful for sending
     * proactive messages to a user. You should call `context.done()` once finished using the
     * created context object.
     * @param reference Previously saved conversation reference to initialize the context object
     * with.
     */
    createContextForConversation(reference) {
        const context = botContext_1.createBotContext(this);
        context.conversationReference = reference;
        return this.contextCreated(context).then(() => context);
    }
    /**
     * Registers a new receiver with the bot. All incoming activities are routed to receivers in
     * the order they're registered. The first receiver to return `{ handled: true }` prevents
     * the receivers after it from being called.
     * @param receivers One or more receivers to register.
     */
    onReceive(...receivers) {
        Array.prototype.push.apply(this.receivers, receivers);
        return this;
    }
    /**
     * Sends an outgoing set of activities to the user. Calling `context.then()` achieves the same
     * effect and is the preferred way of sending activities to the user.
     * @param context Context for the current turn of the conversation.
     * @param activities Set of activities to send.
     */
    post(context, ...activities) {
        // Address activities
        const ref = context.conversationReference;
        for (let i = 0; i < activities.length; i++) {
            const a = activities[i];
            if (!a.type) {
                a.type = activity_1.ActivityTypes.message;
            }
            a.channelId = ref.channelId;
            a.serviceUrl = ref.serviceUrl; // Drop in connector
            a.conversation = ref.conversation;
            a.from = ref.bot;
            a.recipient = ref.user; // Drop in connector
            a.replyToId = ref.activityId;
        }
        // Deliver activities
        if (activities.length > 0) {
            return this.postActivity(context, activities)
                .then(() => this.connector.post(activities))
                .then((response) => {
                response.handled = true;
                return response;
            });
        }
        else {
            return new Promise((resolve, reject) => {
                resolve({ handled: true, status: 200 });
            });
        }
    }
    /**
     * Dispatches an incoming set of activities. This method can be used to dispatch an activity
     * to the bot as if a user had sent it which is sometimes useful.
     * @param activity The activity that was received.
     */
    receive(activity) {
        return this.createContext(activity)
            .then((context) => this.routeActivity(context));
    }
    routeActivity(context) {
        let response;
        return this.receiveActivity(context)
            .then((r) => {
            return r && r.handled ? r : this.callReceivers(context);
        })
            .then((r) => {
            response = r || { status: 200 };
            return context.done();
        })
            .then(() => response);
    }
    callReceivers(context) {
        return new Promise((resolve, reject) => {
            const receivers = this.receivers.slice(0);
            function next(i = 0) {
                if (i < receivers.length) {
                    try {
                        const r = receivers[i];
                        const outer = r(context);
                        if (typeof outer === 'object' && outer.then) {
                            outer.then((inner) => {
                                if (typeof inner === 'object' && inner.handled) {
                                    resolve(inner);
                                }
                                else {
                                    next(i + 1);
                                }
                            });
                        }
                        else if (typeof outer === 'object' && outer.handled) {
                            resolve(outer);
                        }
                        else {
                            next(i + 1);
                        }
                    }
                    catch (e) {
                        reject(e);
                    }
                }
                else {
                    resolve({ handled: false });
                }
            }
            next();
        });
    }
}
exports.Bot = Bot;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A set of `Middleware` plugins. The set itself is middleware so you can easily package up a set
 * of middleware that can be composed into a bot with a single `bot.use(mySet)` call or even into
 * another middleware set using `set.use(mySet)`.
 */
class MiddlewareSet {
    constructor() {
        this._middleware = [];
    }
    /**
     * Removes all registered middleware from the set. This can be useful for unit testing.
     */
    removeAll() {
        this._middleware = [];
        return this;
    }
    /**
     * Returns the underlying array of middleware.
     */
    get middleware() {
        return this._middleware;
    }
    /**
     * Registers middleware plugin(s) with the bot or set.
     * @param middleware One or more middleware plugin(s) to register.
     */
    use(...middleware) {
        Array.prototype.push.apply(this._middleware, middleware);
        return this;
    }
    contextCreated(context) {
        return this.execute('contextCreated', [context], () => false);
    }
    receiveActivity(context) {
        return this.execute('receiveActivity', [context], (r) => (r && r.handled ? r.handled : false));
    }
    postActivity(context, activities) {
        return this.execute('postActivity', [context, activities], () => false, true);
    }
    contextDone(context) {
        return this.execute('contextDone', [context], () => false, true);
    }
    execute(pipe, args, finished, reverse = false) {
        // Find closures to call
        const closures = [];
        let i = reverse ? this._middleware.length - 1 : 0;
        const step = reverse ? -1 : 1;
        while (i >= 0 && i < this._middleware.length) {
            const plugin = this._middleware[i];
            if (typeof plugin[pipe] === 'function') {
                closures.push({ this: plugin, fn: plugin[pipe] });
            }
            i += step;
        }
        // Execute closures
        const that = this;
        return new Promise((resolve, reject) => {
            function next(i) {
                if (i < closures.length) {
                    try {
                        const closure = closures[i];
                        Promise.resolve(closure.fn.apply(closure.this, args)).then((result) => {
                            if (finished(result)) {
                                resolve(result);
                            }
                            else {
                                next(i + 1);
                            }
                        }, (err) => {
                            reject(err);
                        });
                    }
                    catch (e) {
                        reject(e);
                    }
                }
                else {
                    resolve(undefined);
                }
            }
            next(0);
        });
    }
}
exports.MiddlewareSet = MiddlewareSet;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/** second comment block */
const intentRecognizer_1 = __webpack_require__(1);
const entityRecognizers_1 = __webpack_require__(2);
/**
 * An intent recognizer for detecting the users intent using a series of regular expressions.
 *
 * One of the primary advantages of using a RegExpRecognizer is that you can easily switch between
 * the use of regular expressions and a LUIS model. This could be useful for running unit tests
 * locally without having to make a cloud request.
 *
 * The other advantage for non-LUIS bots is that it potentially lets your bot support multiple
 * languages by providing a unique set of expressions for each language.
 */
class RegExpRecognizer extends intentRecognizer_1.IntentRecognizer {
    /**
     * Creates a new instance of the recognizer.
     * @param settings (Optional) settings to customize the recognizer.
     */
    constructor(settings) {
        super();
        this.intents = {};
        this.settings = Object.assign({
            minScore: 0.0
        }, settings);
        if (this.settings.minScore < 0 || this.settings.minScore > 1.0) {
            throw new Error(`RegExpRecognizer: a minScore of '${this.settings.minScore}' is out of range.`);
        }
        this.onRecognize((context) => {
            const intents = [];
            const utterance = (context.request.text || '').trim();
            const minScore = this.settings.minScore;
            for (const name in this.intents) {
                const map = this.intents[name];
                const expressions = this.getExpressions(context, map);
                let top;
                (expressions || []).forEach((exp) => {
                    const intent = RegExpRecognizer.recognize(utterance, exp, minScore);
                    if (intent && (!top || intent.score > top.score)) {
                        top = intent;
                    }
                });
                if (top) {
                    top.name = name;
                    intents.push(top);
                }
            }
            return intents;
        });
    }
    /**
     * Adds a definition for a named intent to the recognizer.
     * @param name Name of the intent to return when one of the expression(s) is matched.
     * @param expressions Expression(s) to match for this intent. Passing a `RegExpLocaleMap` lets
     * specify an alternate set of expressions for each language that your bot supports.
     */
    addIntent(name, expressions) {
        if (this.intents.hasOwnProperty(name)) {
            throw new Error(`RegExpRecognizer: an intent name '${name}' already exists.`);
        }
        // Register as locale map
        if (Array.isArray(expressions)) {
            this.intents[name] = { '*': expressions };
        }
        else if (expressions instanceof RegExp) {
            this.intents[name] = { '*': [expressions] };
        }
        else {
            this.intents[name] = expressions;
        }
        return this;
    }
    getExpressions(context, map) {
        const locale = context.request.locale || '*';
        const entry = map.hasOwnProperty(locale) ? map[locale] : map['*'];
        return entry ? (Array.isArray(entry) ? entry : [entry]) : undefined;
    }
    /**
     * Matches a text string using the given expression. If matched, an `Intent` will be returned
     * containing a coverage score, from 0.0 to 1.0, indicating how much of the text matched
     * the expression. The more of the text the matched the greater the score. The name of
     * the intent will be the value of `expression.toString()` and any capture groups will be
     * returned as individual `string` entities.
     * @param text The text string to match against.
     * @param expression The expression to match.
     * @param minScore (Optional) minimum score to return for the coverage score. The default value
     * is 0.0 but if provided, the calculated coverage score will be scaled to a value between the
     * minScore and 1.0. For example, a expression that matches 50% of the text will result in a
     * base coverage score of 0.5. If the minScore supplied is also 0.5 the returned score will be
     * scaled to be 0.75 or 50% between 0.5 and 1.0. As another example, providing a minScore of 1.0
     * will always result in a match returning a score of 1.0.
     */
    static recognize(text, expression, minScore = 0.0) {
        if (typeof minScore !== 'number' || minScore < 0 || minScore > 1.0) {
            throw new Error(`RegExpRecognizer: a minScore of '${minScore}' is out of range for expression '${expression.toString()}'.`);
        }
        const matched = expression.exec(text);
        if (matched) {
            // Calculate coverage
            const coverage = matched[0].length / text.length;
            const score = minScore + ((1.0 - minScore) * coverage);
            // Populate entities
            const entities = [];
            if (matched.length > 1) {
                for (let i = 1; i < matched.length; i++) {
                    entities.push({ type: entityRecognizers_1.EntityTypes.string, score: 1.0, value: matched[i] });
                }
            }
            // Return intent
            return { name: expression.toString(), score: score, entities: entities };
        }
        return undefined;
    }
}
exports.RegExpRecognizer = RegExpRecognizer;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Middleware that simplifies adding a new service to the BotContext. Services expose themselves
 * as a new property of the BotContext and this class formalizes that process.
 *
 * This class is typically derived from but can also be used like
 * `bot.use(new BotService('myService', new MyService()));`. The registered service would be
 * accessible globally by developers through `context.myService`.
 *
 * __Extends BotContext:__
 * * context.<service name> - New service
 */
class BotService {
    /**
     * Creates a new instance of a service definition.
     * @param name Name of the service being registered. This is the property off the context object
     * that will be used by developers to access the service.
     * @param instance (Optional) singleton instance of the service to add to the context object.
     * Dynamic instances can be added by implementing [getService()](#getservice).
     */
    constructor(name, instance) {
        this.name = name;
        this.instance = instance;
    }
    contextCreated(context) {
        if (context.hasOwnProperty(this.name)) {
            context.logger.log(`A service named '${this.name}' is already registered with the context object.`, TraceLevel.warning);
        }
        context[this.name] = this.getService(context);
    }
    /**
     * Overrided by derived classes to register a dynamic instance of the service.
     * @param context Context for the current turn of the conversation.
     */
    getService(context) {
        return this.instance;
    }
}
exports.BotService = BotService;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const storageMiddleware_1 = __webpack_require__(8);
/**
 * Middleware that implements an in memory based storage provider for a bot.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 */
class MemoryStorage extends storageMiddleware_1.StorageMiddleware {
    constructor(settings, memory = {}) {
        super(settings || {});
        this.memory = memory;
        this.etag = 1;
    }
    read(keys) {
        return new Promise((resolve, reject) => {
            const data = {};
            (keys || []).forEach((key) => {
                const item = this.memory[key];
                if (item) {
                    data[key] = JSON.parse(item);
                }
            });
            resolve(data);
        });
    }
    ;
    write(changes) {
        const that = this;
        function saveItem(key, item) {
            const clone = Object.assign({}, item);
            clone.eTag = (that.etag++).toString();
            that.memory[key] = JSON.stringify(clone);
        }
        return new Promise((resolve, reject) => {
            for (const key in changes) {
                const newItem = changes[key];
                const old = this.memory[key];
                if (!old || newItem.eTag === '*') {
                    saveItem(key, newItem);
                }
                else {
                    const oldItem = JSON.parse(old);
                    if (newItem.eTag === oldItem.eTag) {
                        saveItem(key, newItem);
                    }
                    else {
                        reject(new Error(`Storage: error writing "${key}" due to eTag conflict.`));
                    }
                }
            }
            resolve();
        });
    }
    ;
    delete(keys) {
        return new Promise((resolve, reject) => {
            (keys || []).forEach((key) => this.memory[key] = undefined);
            resolve();
        });
    }
    getStorage(context) {
        return this;
    }
}
exports.MemoryStorage = MemoryStorage;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/** second comment block */
const botService_1 = __webpack_require__(6);
/**
 * Abstract base class for all storage middleware.
 * @param Opt (Optional) settings to configure additional features of the storage provider.
 */
class StorageMiddleware extends botService_1.BotService {
    /**
     * Creates a new instance of the storage provider.
     * @param settings (Optional) settings to configure additional features of the storage provider.
     */
    constructor(settings) {
        super('storage');
        this.warningLogged = false;
        this.settings = Object.assign({
            optimizeWrites: true
        }, settings);
    }
    getService(context) {
        const storage = this.getStorage(context);
        return this.settings.optimizeWrites ? new WriteOptimizer(context, storage) : storage;
    }
}
exports.StorageMiddleware = StorageMiddleware;
class WriteOptimizer {
    constructor(context, storage) {
        this.context = context;
        this.storage = storage;
    }
    read(keys) {
        return this.storage.read(keys).then((items) => {
            // Remember hashes
            keys.forEach((key) => this.updatheashes(key, items[key]));
            return items;
        });
    }
    /** save StoreItems to storage  **/
    write(changes) {
        // Identify changes to commit
        let count = 0;
        const hashes = this.context.state.writeOptimizer || {};
        const newHashes = {};
        const commits = {};
        for (const key in changes) {
            const item = changes[key] || {};
            const hash = this.getHash(item);
            if (hashes[key] !== hash) {
                // New or changed item
                commits[key] = item;
                newHashes[key] = hash;
                count++;
            }
        }
        // Commit changes to storage
        if (count > 0) {
            return this.storage.write(commits).then(() => {
                // Update hashes
                for (const key in newHashes) {
                    this.updatheashes(key, newHashes[key]);
                }
            });
        }
        else {
            return Promise.resolve();
        }
    }
    /** Delete storeItems from storage **/
    delete(keys) {
        return this.storage.delete(keys).then(() => {
            // Remove hashes
            (keys || []).forEach((key) => this.updatheashes(key));
        });
    }
    updatheashes(key, itemOrHash) {
        // Ensure hashes
        let hashes = this.context.state.writeOptimizer;
        if (!hashes) {
            hashes = this.context.state.writeOptimizer = {};
        }
        // Update entry
        if (typeof itemOrHash === 'string') {
            hashes[key] = itemOrHash;
        }
        else if (itemOrHash) {
            hashes[key] = this.getHash(itemOrHash);
        }
        else if (hashes && hashes.hasOwnProperty(key)) {
            delete hashes[key];
        }
    }
    getHash(item) {
        const clone = Object.assign({}, item);
        if (clone.eTag) {
            delete clone.eTag;
        }
        ;
        return JSON.stringify(clone);
    }
}


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A set of utility functions designed to assist with the formatting of the various card types a
 * bot can return. All of these functions return an `Attachment` which can be added to an `Activity`
 * directly or passed as input to a `MessageStyler` function.
 */
class CardStyler {
    /**
     * Returns an attachment for an adaptive card. The attachment will contain the card and the
     * appropriate `contentType`.
     *
     * Adaptive Cards are a new way for bots to send interactive and immersive card content to
     * users. For channels that don't yet support Adaptive Cards natively, the Bot Framework will
     * down render the card to an image that's been styled to look good on the target channel. For
     * channels that support [hero cards](#herocards) you can continue to include Adaptive Card
     * actions and they will be sent as buttons along with the rendered version of the card.
     *
     * For more information about Adaptive Cards and to download the latest SDK, visit
     * [adaptivecards.io](http://adaptivecards.io/).
     * @param card The adaptive card to return as an attachment.
     */
    static adaptiveCard(card) {
        return { contentType: CardStyler.contentTypes.adaptiveCard, content: card };
    }
    /**
     * Returns an attachment for an animation card.
     * @param title The cards title.
     * @param media Media URL's for the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static animationCard(title, media, buttons, other) {
        return mediaCard(CardStyler.contentTypes.animationCard, title, media, buttons, other);
    }
    /**
     * Returns an attachment for an audio card.
     * @param title The cards title.
     * @param media Media URL's for the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static audioCard(title, media, buttons, other) {
        return mediaCard(CardStyler.contentTypes.audioCard, title, media, buttons, other);
    }
    static heroCard(title, text, images, buttons, other) {
        const a = CardStyler.thumbnailCard(title, text, images, buttons, other);
        a.contentType = CardStyler.contentTypes.heroCard;
        return a;
    }
    /**
     * Returns an attachment for a receipt card. The attachment will contain the card and the
     * appropriate `contentType`.
     * @param card The adaptive card to return as an attachment.
     */
    static receiptCard(card) {
        return { contentType: CardStyler.contentTypes.receiptCard, content: card };
    }
    /**
     * Returns an attachment for a signin card. For channels that don't natively support signin
     * cards an alternative message will be rendered.
     * @param title The cards title.
     * @param url The link to the signin page the user needs to visit.
     * @param text (Optional) additional text to include on the card.
     */
    static signinCard(title, url, text) {
        const card = { buttons: [{ type: 'signin', title: title, value: url }] };
        if (text) {
            card.text = text;
        }
        return { contentType: CardStyler.contentTypes.signinCard, content: card };
    }
    static thumbnailCard(title, text, images, buttons, other) {
        if (typeof text !== 'string') {
            other = buttons;
            buttons = images;
            images = text;
            text = undefined;
        }
        const card = Object.assign({}, other);
        if (title) {
            card.title = title;
        }
        if (text) {
            card.text = text;
        }
        if (images) {
            card.images = CardStyler.images(images);
        }
        if (buttons) {
            card.buttons = CardStyler.actions(buttons);
        }
        return { contentType: CardStyler.contentTypes.thumbnailCard, content: card };
    }
    /**
     * Returns an attachment for a video card.
     * @param title The cards title.
     * @param media Media URL's for the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static videoCard(title, media, buttons, other) {
        return mediaCard(CardStyler.contentTypes.videoCard, title, media, buttons, other);
    }
    /**
     * Returns a properly formatted array of actions. Supports converting strings to `messageBack`
     * actions.
     * @param actions Array of card actions or strings. Strings will be converted to `messageBack` actions.
     */
    static actions(actions) {
        const list = [];
        (actions || []).forEach((a) => {
            if (typeof a === 'object') {
                list.push(a);
            }
            else {
                list.push({ type: 'messageBack', value: a.toString(), title: a.toString() });
            }
        });
        return list;
    }
    /**
     * Returns a properly formatted array of card images.
     * @param images Array of card images or strings. Strings will be converted to card images.
     */
    static images(images) {
        const list = [];
        (images || []).forEach((img) => {
            if (typeof img === 'object') {
                list.push(img);
            }
            else {
                list.push({ url: img });
            }
        });
        return list;
    }
    /**
     * Returns a properly formatted array of media url objects.
     * @param links Array of media url objects or strings. Strings will be converted to a media url object.
     */
    static media(links) {
        const list = [];
        (links || []).forEach((lnk) => {
            if (typeof lnk === 'object') {
                list.push(lnk);
            }
            else {
                list.push({ url: lnk });
            }
        });
        return list;
    }
}
/** List of content types for each card style. */
CardStyler.contentTypes = {
    adaptiveCard: 'application/vnd.microsoft.card.adaptive',
    animationCard: 'application/vnd.microsoft.card.animation',
    audioCard: 'application/vnd.microsoft.card.audio',
    heroCard: 'application/vnd.microsoft.card.hero',
    receiptCard: 'application/vnd.microsoft.card.receipt',
    signinCard: 'application/vnd.microsoft.card.signin',
    thumbnailCard: 'application/vnd.microsoft.card.thumbnail',
    videoCard: 'application/vnd.microsoft.card.video'
};
exports.CardStyler = CardStyler;
function mediaCard(contentType, title, media, buttons, other) {
    const card = Object.assign({}, other);
    if (title) {
        card.title = title;
    }
    if (media) {
        card.media = CardStyler.media(media);
    }
    if (buttons) {
        card.buttons = CardStyler.actions(buttons);
    }
    return { contentType: contentType, content: card };
}


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @module botbuilder
 */
/** second comment block */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(0));
__export(__webpack_require__(11));
__export(__webpack_require__(3));
__export(__webpack_require__(6));
__export(__webpack_require__(14));
__export(__webpack_require__(15));
__export(__webpack_require__(9));
__export(__webpack_require__(16));
__export(__webpack_require__(2));
__export(__webpack_require__(1));
__export(__webpack_require__(17));
__export(__webpack_require__(7));
__export(__webpack_require__(18));
__export(__webpack_require__(4));
__export(__webpack_require__(5));
__export(__webpack_require__(8));
__export(__webpack_require__(19));
__export(__webpack_require__(20));


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/** second comment block */
const intentRecognizer_1 = __webpack_require__(1);
const entityRecognizers_1 = __webpack_require__(2);
/**
 * An intent recognizer for detecting that the user has uploaded an attachment.
 */
class AttachmentRecognizer extends intentRecognizer_1.IntentRecognizer {
    /**
     * Creates a new instance of the recognizer.
     * @param settings (Optional) settings to customize the recognizer.
     */
    constructor(settings) {
        super();
        this.typeFilters = [];
        this.settings = Object.assign({
            intentName: 'Intents.AttachmentsReceived'
        }, settings);
        this.onRecognize((context) => {
            const intents = [];
            if (context.request.attachments && context.request.attachments.length > 0) {
                // Map attachments to entities
                const entities = [];
                context.request.attachments.forEach((a) => entities.push({
                    type: a.contentType || entityRecognizers_1.EntityTypes.attachment,
                    score: 1.0,
                    value: a
                }));
                // Filter by content type
                if (this.typeFilters.length > 0) {
                    // Sort by content type
                    const matches = {};
                    entities.forEach((entity) => {
                        if (matches.hasOwnProperty(entity.type)) {
                            matches[entity.type].push(entity);
                        }
                        else {
                            matches[entity.type] = [entity];
                        }
                    });
                    // Return intents for matches
                    this.typeFilters.forEach((filter) => {
                        const stringFilter = typeof filter.type === 'string';
                        for (const type in matches) {
                            let addIntent;
                            if (stringFilter) {
                                addIntent = type === filter.type;
                            }
                            else {
                                addIntent = filter.type.test(type);
                            }
                            if (addIntent) {
                                intents.push({
                                    score: 1.0,
                                    name: filter.intentName,
                                    entities: matches[type]
                                });
                            }
                        }
                    });
                }
                else {
                    // Return a single intent for all attachments
                    intents.push({
                        score: 1.0,
                        name: this.settings.intentName,
                        entities: entities
                    });
                }
            }
            return intents;
        });
    }
    /**
     * Add a new content type filter to the recognizer. Adding one or more `contentType()` filters
     * will result in only attachments of the specified type(s) being recognized.
     * @param contentType The `Attachment.contentType` to look for.
     * @param intentName Name of the intent to return when the given type is matched.
     */
    contentType(contentType, intentName) {
        this.typeFilters.push({ type: contentType, intentName: intentName });
        return this;
    }
}
exports.AttachmentRecognizer = AttachmentRecognizer;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @module botbuilder
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Finds the entity parsing rules for a specific locale.
 * @param locale Users preferred locale.
 * @param defaultLocale (Optional) default locale to use if users locale isn't supported. This defaults to 'en'.
 */
function find(locale, defaultLocale) {
    if (!defaultLocale) {
        defaultLocale = 'en';
    }
    if (!locale) {
        locale = defaultLocale;
    }
    const pos = locale.indexOf('-');
    const parentLocale = pos > 0 ? locale.substr(0, pos) : locale;
    return locales[locale] || locales[parentLocale] || locales[defaultLocale];
}
exports.find = find;
const locales = {};
locales['en'] = {
    boolean_choices: "true=y,yes,yep,sure,ok,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,nope,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first|2=2nd,second|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};
locales['de'] = {
    boolean_choices: "true=y,yes,ja,richtig,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,nein,falsch,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=null|1=eins|2=zwei|3=drei|4=vier|5=fünf|6=sechs|7=sieben|8=acht|9=neun|10=zehn|11=elf|12=zwölf|13=dreizehn|14=vierzehn|15=fünfzehn|16=sechzehn|17=siebzehn|18=achtzehn|19=neunzehn|20=zwanzig",
    number_ordinals: "1=1st,erste|2=2nd,zweite|3=3rd,dritte|4=4th,vierte|5=5th,fünfte|6=6th,sechste|7=7th,siebte|8=8th,achte|9=9th,neunte|10=10th,zehnte",
    number_reverse_ordinals: "-1=letzte,zuletzt|-2=vorletzte,daneben, zweite von letzter|-3=dritter von letzter,drittel bis zum letzten|-4=vierte von letzter,vierte bis zuletzt|-5=fünfte vom letzten,fünfte bis zuletzt"
};
// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['es'] = {
    boolean_choices: "true=y,yes,s,sí,si,vale,ok,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,falso,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first|2=2nd,second|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};
locales['fr'] = {
    boolean_choices: "true=y,yes,oui,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,non,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zéro,zero|1=un,une|2=deux|3=trois|4=quatre|5=cinq|6=six|7=sept|8=huit|9=neuf|10=dix|11=onze|12=douze|13=treize|14=quatorze|15=quinze|16=seize|17=dix-sept|18=dix-huit|19=dix-neuf|20=vingt",
    number_ordinals: "1=1er,1re,premier,premiere,première|2=2e,2ème,2eme,deuxieme,deuxième,second,seconde|3=3e,3ème,3eme,troisieme,troisième|4=4e,4ème,4eme,quatrieme,quatrième|5=5e,5ème,5eme,cinquieme,cinquième|6=6e,6ème,6eme,sixieme,sixième|7=7e,7ème,7eme,septieme,septième|8=8e,8ème,8eme,huitieme,huitième|9=9e,9ème,9eme,neuvieme,neuvième|10=10e,10ème,10eme,dixieme,dixième",
    number_reverse_ordinals: "-1=dernier,derniere,dernière|-2=avant-dernier,avant-derniere,avant-dernière",
};
// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['it'] = {
    boolean_choices: "true=y,yes,sì,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first|2=2nd,second|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};
// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['nl'] = {
    boolean_choices: "true=y,yes,ja,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,nee,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first|2=2nd,second|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};
// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['pt'] = {
    boolean_choices: "true=y,yes,sim,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,não,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first|2=2nd,second|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};
// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['ru'] = {
    boolean_choices: "true=y,yes,да,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,нет,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first|2=2nd,second|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};
// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['tr'] = {
    boolean_choices: "true=y,yes,evet,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,hayır,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first|2=2nd,second|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};
// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['zh-hans'] = {
    boolean_choices: "true=y,yes,\u662f,\u786e\u8ba4,\u662f\u7684,\u597d\u7684,\u597d,\u6ca1\u95ee\u9898,\u5bf9,\u5bf9\u7684,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,\u4e0d,\u4e0d\u662f,\u4e0d\u5bf9,\u4e0d\u77e5\u9053,\u4e0d\u884c,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first|2=2nd,second|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/** second comment block */
const activity_1 = __webpack_require__(0);
const bot_1 = __webpack_require__(3);
const regExpRecognizer_1 = __webpack_require__(5);
/**
 * Creates a new BotContext instance.
 * @param bot Bot the context is for.
 * @param request (Optional) request to initialize the context with.
 */
function createBotContext(bot, request) {
    const ctx = {};
    ctx.bot = bot;
    ctx.request = request || {};
    ctx.responses = [];
    ctx.conversationReference = {};
    ctx.state = {};
    // Populate conversation reference
    if (request) {
        ctx.conversationReference = {
            activityId: request.id,
            user: request.from,
            bot: request.recipient,
            conversation: request.conversation,
            channelId: request.channelId,
            serviceUrl: request.serviceUrl
        };
    }
    // Generate null logger
    ctx.logger = {};
    ctx.logger.flush = () => {
        return new Promise((resolve, reject) => {
            resolve();
        });
    };
    ['logRequest', 'startRequest', 'logDependency', 'startDependency', 'logAvailability',
        'logEvent', 'logException', 'logException', 'logMetric', 'log'].forEach((method) => {
        ctx.logger[method] = () => { };
    });
    // Add methods
    // !!!!!!! Be sure to use "this." when accessing members of the context object because
    // !!!!!!! you could be working with a clone.
    ctx.clone = function clone() {
        return Object.assign({}, this);
    };
    ctx.delay = function delay(duration) {
        const context = this;
        context.responses.push({ type: 'delay', value: duration });
        return this;
    };
    ctx.done = function done() {
        const context = this;
        let response;
        return context.then()
            .then((r) => {
            // Save response and call contextDone() pipe
            response = r || { status: 200 };
            return context.bot.contextDone(context);
        })
            .then(() => {
            // Dispose of context object
            // BUGBUG: In the case of a clone this would only delete the clones members
            for (var key in context) {
                delete context[key];
            }
            return response;
        });
    };
    ctx.findEntities = function findEntities(intent, type) {
        const context = this;
        if (!type && (typeof intent !== 'object' || !intent.hasOwnProperty('name'))) {
            type = intent;
            intent = undefined;
        }
        const entities = [];
        const topIntent = intent || context.topIntent;
        if (type && topIntent && topIntent.entities) {
            topIntent.entities.forEach((entity) => {
                let matches = typeof type === 'string' ? (entity.type === type) : type.test(entity.type);
                if (matches) {
                    entities.push(entity);
                }
            });
        }
        return entities;
    };
    ctx.getEntity = function getEntity(intent, type, occurrence) {
        const context = this;
        if (!occurrence && (typeof intent !== 'object' || !intent.hasOwnProperty('name'))) {
            occurrence = type;
            type = intent;
            intent = undefined;
        }
        if (typeof occurrence !== 'number') {
            occurrence = 0;
        }
        const entities = context.findEntities(intent, type);
        return occurrence < entities.length ? entities[occurrence].value : undefined;
    };
    ctx.ifRegExp = function ifRegExp(expression, onMatch) {
        const context = this;
        let intent;
        if (context.request.type === activity_1.ActivityTypes.message) {
            const utterance = (context.request.text || '').toLocaleLowerCase();
            intent = regExpRecognizer_1.RegExpRecognizer.recognize(utterance, expression);
        }
        if (intent && onMatch) {
            onMatch(intent);
        }
        return intent;
    };
    ctx.ifIntent = function ifIntent(name, onMatch) {
        const context = this;
        let intent;
        if (context.topIntent) {
            const n = context.topIntent.name;
            if ((typeof name === 'string' && n === name) || name.test(n)) {
                intent = context.topIntent;
            }
        }
        if (intent && onMatch) {
            onMatch(intent);
        }
        return intent;
    };
    ctx.post = function post() {
        const context = this;
        const args = context.responses || [];
        args.unshift(context);
        return bot_1.Bot.prototype.post.apply(context.bot, args)
            .then((r) => {
            context.responses = [];
            return r;
        });
    };
    ctx.say = function say(text, speak, additional) {
        const context = this;
        // Check other parameters
        if (!additional && typeof speak === 'object') {
            additional = speak;
            speak = undefined;
        }
        // Compose MESSAGE activity
        const activity = Object.assign({
            type: activity_1.ActivityTypes.message,
            text: text || '',
        }, additional || {});
        if (typeof speak === 'string') {
            activity.speak = speak;
        }
        // Append to responses
        context.responses.push(activity);
        return this;
    };
    ctx.send = function send(activity) {
        // Append to responses
        if (!activity || !activity.type) {
            throw new Error(`BotContext: send() called with an undefined activity or a missing 'activity.type'.`);
        }
        this.responses.push(activity);
        return this;
    };
    ctx.typing = function typing() {
        const context = this;
        context.responses.push({ type: activity_1.ActivityTypes.typing });
        return this;
    };
    return ctx;
}
exports.createBotContext = createBotContext;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Middleware for tracking conversation and user state using the `context.storage`
 * provider.
 *
 * __Extends BotContext:__
 * * context.state.user - User persisted state
 * * context.state.conversation - Conversation persisted data
 *
 * __Depends on:__
 * * context.storage - Storage provider for storing and retrieving objects
 */
class BotStateManager {
    /**
     * Creates a new instance of the state manager.
     * @param settings (Optional) settings to adjust the behavior of the state manager.
     */
    constructor(settings) {
        this.settings = Object.assign({
            persistUserState: true,
            persistConversationState: true,
            writeBeforePost: true,
            lastWriterWins: true
        }, settings || {});
    }
    contextCreated(context) {
        // read state from storage
        return this.read(context, []).then(() => { });
    }
    postActivity(context, activities) {
        if (this.settings.writeBeforePost) {
            // save state 
            return this.write(context, {});
        }
    }
    contextDone(context) {
        // save state 
        return this.write(context, {});
    }
    read(context, keys) {
        // Ensure storage
        if (!context.storage) {
            return Promise.reject(new Error(`BotStateManager: context.storage not found.`));
        }
        // Calculate keys
        if (this.settings.persistUserState) {
            keys.push(this.userKey(context));
        }
        if (this.settings.persistConversationState) {
            keys.push(this.conversationKey(context));
        }
        // Read values
        return context.storage.read(keys).then((data) => {
            // Copy data to context
            keys.forEach((key) => {
                switch (key.split('/')[0]) {
                    case 'user':
                        context.state.user = data[key] || {};
                        break;
                    case 'conversation':
                        context.state.conversation = data[key] || {};
                        break;
                }
            });
            return data;
        });
    }
    write(context, changes) {
        // Ensure storage
        if (!context.storage) {
            return Promise.reject(new Error(`BotStateManager: context.storage not found.`));
        }
        // Append changes
        if (this.settings.persistUserState) {
            changes[this.userKey(context)] = context.state.user || {};
        }
        if (this.settings.persistConversationState) {
            changes[this.conversationKey(context)] = context.state.conversation || {};
        }
        // Update eTags
        if (this.settings.lastWriterWins) {
            for (const key in changes) {
                changes[key].eTag = '*';
            }
        }
        // Write changes
        return context.storage.write(changes);
    }
    userKey(context) {
        const ref = context.conversationReference;
        return 'user/' + ref.channelId + '/' + ref.user.id;
    }
    conversationKey(context) {
        const ref = context.conversationReference;
        return 'conversation/' + ref.channelId + '/' + ref.conversation.id;
    }
}
exports.BotStateManager = BotStateManager;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/** second comment block */
const memoryStorage_1 = __webpack_require__(7);
/**
 * Storage middleware that uses browser local storage.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 */
class BrowserLocalStorage extends memoryStorage_1.MemoryStorage {
    constructor(options) {
        super(options, localStorage);
    }
}
exports.BrowserLocalStorage = BrowserLocalStorage;
/**
 * Storage middleware that uses browser session storage.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 */
class BrowserSessionStorage extends memoryStorage_1.MemoryStorage {
    constructor(options) {
        super(options, sessionStorage);
    }
}
exports.BrowserSessionStorage = BrowserSessionStorage;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Middleware for logging activity to the console.
 *
 * __Extends BotContext:__
 * * context.logger - Logs activity and analytics within the bot.
*/
class ConsoleLogger {
    contextCreated(context) {
        // Wrap parent log() method
        const parentLog = context.logger.log;
        context.logger.log = (message, traceLevel, properties) => {
            switch (traceLevel) {
                default:
                case TraceLevel.log:
                    console.log(message);
                    break;
                case TraceLevel.debug:
                    console.debug(message);
                    break;
                case TraceLevel.information:
                    console.info(message);
                    break;
                case TraceLevel.warning:
                    console.warn(message);
                    break;
                case TraceLevel.error:
                case TraceLevel.critical:
                    console.error(message);
                    break;
            }
            parentLog(message, traceLevel, properties);
        };
        // Wrap parents logException() method
        const parentLogException = context.logger.logException;
        context.logger.logException = (exception, message, properties, metrics) => {
            let msg = message && message.length > 0 ? message + '/n' : '';
            console.error(msg + exception.stack);
            parentLogException(exception, message, properties, metrics);
        };
    }
}
exports.ConsoleLogger = ConsoleLogger;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/** second comment block */
const intentRecognizer_1 = __webpack_require__(1);
var RecognizeOrder;
(function (RecognizeOrder) {
    RecognizeOrder[RecognizeOrder["parallel"] = 0] = "parallel";
    RecognizeOrder[RecognizeOrder["series"] = 1] = "series";
})(RecognizeOrder = exports.RecognizeOrder || (exports.RecognizeOrder = {}));
/**
 * Optimizes the execution of multiple intent recognizers. An intent recognizer set can be
 * configured to execute its recognizers either in parallel (the default) or in series. The
 * output of the set will be a single intent that had the highest score.
 *
 * The intent recognizer set is itself an intent recognizer which means that it can be
 * conditionally disabled or have its output filtered just like any other recognizer. It can
 * even be composed into other recognizer sets allowing for sophisticated recognizer
 * hierarchies to be created.
 */
class IntentRecognizerSet extends intentRecognizer_1.IntentRecognizer {
    /**
     * Creates a new instance of a recognizer set.
     * @param settings (Optional) settings to customize the sets execution strategy.
     */
    constructor(settings) {
        super();
        this.recognizers = [];
        this.settings = Object.assign({
            recognizeOrder: RecognizeOrder.parallel,
            stopOnExactMatch: true
        }, settings);
        this.onRecognize((context) => {
            if (this.settings.recognizeOrder === RecognizeOrder.parallel) {
                return this.recognizeInParallel(context);
            }
            else {
                return this.recognizeInSeries(context);
            }
        });
    }
    /**
     * Adds recognizer(s) to the set. Recognizers will be evaluated in the order they're
     * added to the set.
     * @param recognizers One or more recognizers to add to the set.
     */
    add(...recognizers) {
        Array.prototype.push.apply(this.recognizers, recognizers);
        return this;
    }
    recognizeInParallel(context) {
        // Call recognize on all children
        const promises = [];
        this.recognizers.forEach((r) => promises.push(r.recognize(context)));
        // Wait for all of the promises to resolve
        return Promise.all(promises).then((results) => {
            // Merge intents
            let intents = [];
            results.forEach((r) => intents = intents.concat(r));
            return intents;
        });
    }
    recognizeInSeries(context) {
        return new Promise((resolve, reject) => {
            let intents = [];
            const that = this;
            function next(i = 0) {
                if (i < that.recognizers.length) {
                    that.recognizers[i].recognize(context)
                        .then((r) => {
                        intents = intents.concat(r);
                        if (that.settings.stopOnExactMatch && that.hasExactMatch(r)) {
                            resolve(intents);
                        }
                        else {
                            next(i + 1);
                        }
                    })
                        .catch((err) => reject(err));
                }
                else {
                    resolve(intents);
                }
            }
            next();
        });
    }
    hasExactMatch(intents) {
        intents.forEach((intent) => {
            if (intent.score >= 1.0) {
                return true;
            }
        });
        return false;
    }
}
exports.IntentRecognizerSet = IntentRecognizerSet;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @module botbuilder
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
const activity = __webpack_require__(0);
const cardStyler_1 = __webpack_require__(9);
/**
 * A set of utility functions to assist with the formatting of the various message types a bot can
 * return.
 */
class MessageStyler {
    /**
     * Returns a simple text message.
     * @param text Text to include in the message.
     * @param speak (Optional) SSML to include in the message.
     */
    static text(text, speak) {
        const msg = {
            type: activity.ActivityTypes.message,
            text: text || ''
        };
        if (speak) {
            msg.speak = speak;
        }
        return msg;
    }
    /**
     * Returns a message that includes a set of suggested actions and optional text.
     * @param actions Array of card actions or strings to include. Strings will be converted to `messageBack` actions.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static suggestedActions(actions, text, speak) {
        const msg = {
            type: activity.ActivityTypes.message,
            suggestedActions: {
                actions: cardStyler_1.CardStyler.actions(actions)
            }
        };
        if (text) {
            msg.text = text;
        }
        if (speak) {
            msg.speak = speak;
        }
        return msg;
    }
    /**
     * Returns a single message activity containing an attachment.
     * @param attachment Adaptive card to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static attachment(attachment, text, speak) {
        return attachmentActivity(activity.AttachmentLayouts.list, [attachment], text, speak);
    }
    /**
     * Returns a message that will display a set of attachments in list form.
     * @param attachments Array of attachments to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static list(attachments, text, speak) {
        return attachmentActivity(activity.AttachmentLayouts.list, attachments, text, speak);
    }
    /**
     * Returns a message that will display a set of attachments using a carousel layout.
     * @param attachments Array of attachments to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static carousel(attachments, text, speak) {
        return attachmentActivity(activity.AttachmentLayouts.carousel, attachments, text, speak);
    }
    /**
     * Returns a message that will display a single image or video to a user.
     * @param url Url of the image/video to send.
     * @param contentType The MIME type of the image/video.
     * @param name (Optional) Name of the image/video file.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static contentUrl(url, contentType, name, text, speak) {
        const a = { contentType: contentType, contentUrl: url };
        if (name) {
            a.name = name;
        }
        return attachmentActivity(activity.AttachmentLayouts.list, [a], text, speak);
    }
}
exports.MessageStyler = MessageStyler;
function attachmentActivity(attachmentLayout, attachments, text, speak) {
    const msg = {
        type: activity.ActivityTypes.message,
        attachmentLayout: attachmentLayout,
        attachments: attachments
    };
    if (text) {
        msg.text = text;
    }
    if (speak) {
        msg.speak = speak;
    }
    return msg;
}


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @module botbuilder
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Template engine for rendering dynamic JSON objects.
 */
class Templates {
    constructor() {
        this.templates = {};
    }
    /**
     * Registers a new JSON template. The template will be compiled and cached.
     * @param name Name of the template to register.
     * @param json JSON template.
     */
    add(name, json) {
        this.templates[name] = Templates.compile(json, this.templates);
        return this;
    }
    /**
     * Registers a named function that can be called within a template.
     * @param name Name of the function to register.
     * @param fn Function to register.
     */
    addFunction(name, fn) {
        this.templates[name] = fn;
        return this;
    }
    /**
     * Renders a registered JSON template to a string using the given data object.
     * @param name Name of the registered template to render.
     * @param data Data object to render template against.
     */
    render(name, data) {
        return this.templates[name](data);
    }
    /**
     * Renders a registered JSON template using the given data object. The rendered string will
     * be `JSON.parsed()` into a JSON object prior to returning.
     * @param name Name of the registered template to render.
     * @param data Data object to render template against.
     */
    renderAsJSON(name, data) {
        return JSON.parse(this.render(name, data));
    }
    /**
     * Compiles a JSON template into a function that can be called to render a JSON object using
     * a data object.
     * @param json The JSON template to compile.
     * @param templates (Optional) map of template functions (and other compiled templates) that
     * can be called at render time.
     */
    static compile(json, templates) {
        // Convert objects to strings for parsing
        if (typeof json !== 'string') {
            json = JSON.stringify(json);
        }
        // Parse JSON into an array of template functions. These will be called in order
        // to build up the output JSON object as a string.
        const parsed = parse(json, templates);
        // Return closure that will execute the parsed template.
        return (data, path) => {
            // Check for optional path.
            // - Templates can be executed as children of other templates so the path
            //   specifies the property off the parent to execute the template for. 
            let obj = '';
            if (path) {
                const value = getValue(data, path);
                if (Array.isArray(value)) {
                    // Execute for each child object
                    let connector = '';
                    obj += '[';
                    value.forEach((child) => {
                        obj += connector;
                        parsed.forEach((fn) => obj += fn(child));
                        connector = ',';
                    });
                    obj += ']';
                }
                else if (typeof value === 'object') {
                    parsed.forEach((fn) => obj += fn(value));
                }
            }
            else {
                parsed.forEach((fn) => obj += fn(data));
            }
            return obj;
        };
    }
}
exports.Templates = Templates;
var ParseState;
(function (ParseState) {
    ParseState[ParseState["none"] = 0] = "none";
    ParseState[ParseState["string"] = 1] = "string";
    ParseState[ParseState["path"] = 2] = "path";
})(ParseState || (ParseState = {}));
function parse(json, templates) {
    const parsed = [];
    let txt = '';
    let endString = '';
    let endPath = '';
    let nextState = ParseState.none;
    let state = ParseState.none;
    for (let i = 0, l = json.length; i < l; i++) {
        const char = json[i];
        switch (state) {
            case ParseState.none:
            default:
                if ((char == '\'' || char == '"') && i < (l - 1)) {
                    // Check for literal
                    if (json[i + 1] == '!') {
                        i++; // <- skip next char
                        state = ParseState.path;
                        parsed.push(appendText(txt));
                        endPath = char;
                        nextState = ParseState.none;
                        txt = '';
                    }
                    else {
                        state = ParseState.string;
                        endString = char;
                        txt += char;
                    }
                }
                else {
                    txt += char;
                }
                break;
            case ParseState.string:
                if (char == '$' && i < (l - 1) && json[i + 1] == '{') {
                    i++; // <- skip next char
                    state = ParseState.path;
                    parsed.push(appendText(txt));
                    endPath = '}';
                    nextState = ParseState.string;
                    txt = '';
                }
                else if (char == endString && json[i - 1] !== '\\') {
                    state = ParseState.none;
                    txt += char;
                }
                else {
                    txt += char;
                }
                break;
            case ParseState.path:
                if (char == endPath) {
                    state = nextState;
                    const trimmed = txt.trim();
                    if (trimmed && trimmed[trimmed.length - 1] == ')') {
                        let open = txt.indexOf('(');
                        const close = txt.lastIndexOf(')');
                        if (open && close) {
                            const name = txt.substr(0, open++);
                            const args = close > open ? txt.substr(open, close - open) : '';
                            parsed.push(appendFunction(name, args, templates));
                        }
                        else {
                            parsed.push(appendProperty(txt));
                        }
                    }
                    else {
                        parsed.push(appendProperty(txt));
                    }
                    txt = '';
                }
                else {
                    txt += char;
                }
                break;
        }
    }
    if (txt.length > 0) {
        parsed.push(appendText(txt));
    }
    return parsed;
}
function appendText(text) {
    return (data) => text;
}
function appendFunction(name, args, templates) {
    return (data) => {
        const result = templates[name](data, args);
        return typeof result === 'string' ? result : JSON.stringify(result);
    };
}
function appendProperty(path) {
    return (data) => {
        const result = getValue(data, path);
        return typeof result === 'string' ? result : JSON.stringify(result);
    };
}
function getValue(data, path) {
    let value = data;
    const parts = path.split('.');
    for (let i = 0, l = parts.length; i < l; i++) {
        const member = parts[i].trim();
        if (typeof value === 'object') {
            value = value[member];
        }
        else {
            value = undefined;
            break;
        }
    }
    return value;
}


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const activity_1 = __webpack_require__(0);
/**
 * Test connector used for unit tests.
 */
class TestConnector {
    /**
     * Creates a new instance of the test connector.
     * @param reference (Optional) conversation reference that lets you customize the address
     * information for messages sent during a test.
     */
    constructor(reference) {
        this.handlers = {};
        this.nextId = 0;
        this.reference = Object.assign({}, reference, {
            channelId: 'test',
            serviceUrl: 'https://test.com',
            user: { id: 'user', name: 'User1' },
            bot: { id: 'bot', name: 'Bot' },
            conversation: { id: 'Convo1' }
        });
    }
    post(activities) {
        return new Promise((resolve, reject) => {
            let id = activities && activities.length > 0 ? activities[0].replyToId : undefined;
            if (id && this.handlers.hasOwnProperty(id)) {
                const result = this.handlers[id](activities) || { status: 200 };
                if (result.status >= 400) {
                    reject(new Error(`Test failed with status of '${result.status}'.`));
                }
                else {
                    resolve(result);
                }
            }
            else {
                reject(new Error(`Test handler not found for id '${id}'`));
            }
        });
    }
    /**
     * Executes an individual test.
     * @param activity Text string or activity to send to the bot.
     * @param handler Function to receive the bots response. This function can theoretically be called
     * multiple times for a single activity given that bots can call `context.then()` to send the
     * current queue of responses at anytime.
     */
    test(activity, handler) {
        let p = new Promise((resolve, reject) => {
            let a = (typeof activity === 'string' ? { text: activity } : activity);
            if (!a.type) {
                a.type = activity_1.ActivityTypes.message;
            }
            a.channelId = this.reference.channelId;
            a.from = this.reference.user;
            a.recipient = this.reference.bot;
            a.conversation = this.reference.conversation;
            a.serviceUrl = this.reference.serviceUrl;
            const id = a.id = (this.nextId++).toString();
            this.handlers[id] = handler;
            this.onReceive(a)
                .then((response) => {
                delete this.handlers[id];
                resolve(response);
            })
                .catch((err) => {
                delete this.handlers[id];
                reject(err);
            });
        });
        return new Test(p, this);
    }
    /**
     * Executes an individual test using a simplified `userSays` then `botSays` pair of messages.
     * @param userSays Users utterance to the bot.
     * @param botSays Expected responses from the bot.
     * @param message Message to assert with when the responses don't match.
     */
    say(userSays, botSays, message) {
        return this.test(userSays, (activities) => assertSay(activities, userSays, botSays, message));
    }
}
exports.TestConnector = TestConnector;
function assertSay(activities, userSays, botSays, message) {
    if (Array.isArray(botSays)) {
        for (let iBotSay in botSays) {
            let botSay = botSays[iBotSay];
            if (activities[0].text == botSay)
                return;
        }
        throw new Error(`${message || ''} user said:${userSays} bot said:${activities[0].text} Expected:${botSays}`);
    }
    else {
        if (activities[0].text !== botSays) {
            throw new Error(`${message || ''} user said:${userSays} bot said:${activities[0].text} Expected:${botSays}`);
        }
    }
}
class Test {
    constructor(p, connector) {
        this.p = p;
        this.connector = connector;
    }
    test(activity, handler) {
        let p = this.p.then((response) => this.connector.test(activity, handler).p);
        return new Test(p, this.connector);
    }
    say(userSays, botSays, message) {
        return this.test(userSays, (activities) => assertSay(activities, userSays, botSays, message));
    }
    then(onFulfilled, onRejected) {
        let p = this.p.then(onFulfilled, onRejected);
        return new Test(p, this.connector);
    }
    catch(onRejected) {
        let p = this.p.catch(onRejected);
        return new Test(p, this.connector);
    }
}
exports.Test = Test;


/***/ })
/******/ ])});;