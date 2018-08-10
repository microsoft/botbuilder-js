"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
const entities = require("html-entities");
const QNAMAKER_TRACE_TYPE = 'https://www.qnamaker.ai/schemas/trace';
const QNAMAKER_TRACE_NAME = 'QnAMaker';
const QNAMAKER_TRACE_LABEL = 'QnAMaker Trace';
/**
 * @private
 */
const htmlentities = new entities.AllHtmlEntities();
/**
 * Manages querying an individual QnA Maker knowledge base for answers.
 */
class QnAMaker {
    /**
     * Creates a new QnAMaker instance.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param options (Optional) additional settings used to configure the instance.
     */
    constructor(endpoint, options) {
        this.endpoint = endpoint;
        // Initialize options
        this.options = Object.assign({
            scoreThreshold: 0.3,
            top: 1
        }, options);
    }
    /**
     * Calls [generateAnswer()](#generateanswer) and sends the answer as a message to the user.
     *
     * @remarks
     * Returns a value of `true` if an answer was found and sent. If multiple answers are
     * returned the first one will be delivered.
     * @param context Context for the current turn of conversation with the user.
     */
    answer(context) {
        const { top, scoreThreshold } = this.options;
        return this.generateAnswer(context.activity.text, top, scoreThreshold).then((answers) => {
            return this.emitTraceInfo(context, answers).then(() => {
                if (answers.length > 0) {
                    return context.sendActivity({ text: answers[0].answer, type: 'message' }).then(() => true);
                }
                else {
                    return Promise.resolve(false);
                }
            });
        });
    }
    /**
     * Calls the QnA Maker service to generate answer(s) for a question.
     *
     * @remarks
     * The returned answers will be sorted by score with the top scoring answer returned first.
     * @param question The question to answer.
     * @param top (Optional) number of answers to return. Defaults to a value of `1`.
     * @param scoreThreshold (Optional) minimum answer score needed to be considered a match to questions. Defaults to a value of `0.001`.
     */
    generateAnswer(question, top, scoreThreshold) {
        const q = question ? question.trim() : '';
        if (q.length > 0) {
            return this.callService(this.endpoint, question, typeof top === 'number' ? top : 1).then((answers) => {
                const minScore = typeof scoreThreshold === 'number' ? scoreThreshold : 0.001;
                return answers.filter((ans) => ans.score >= minScore).sort((a, b) => b.score - a.score);
            });
        }
        return Promise.resolve([]);
    }
    /**
     * Called internally to query the QnA Maker service.
     *
     * @remarks
     * This is exposed to enable better unit testing of the service.
     */
    callService(endpoint, question, top) {
        const url = `${endpoint.host}/knowledgebases/${endpoint.knowledgeBaseId}/generateanswer`;
        const headers = {};
        if (endpoint.host.endsWith('v2.0') || endpoint.host.endsWith('v3.0')) {
            headers['Ocp-Apim-Subscription-Key'] = endpoint.endpointKey;
        }
        else {
            headers['Authorization'] = `EndpointKey ${endpoint.endpointKey}`;
        }
        return request({
            url: url,
            method: 'POST',
            headers: headers,
            json: {
                question: question,
                top: top
            }
        }).then(result => {
            return result.answers.map((ans) => {
                ans.score = ans.score / 100;
                ans.answer = htmlentities.decode(ans.answer);
                if (ans.qnaId) {
                    ans.id = ans.qnaId;
                    delete ans['qnaId'];
                }
                return ans;
            });
        });
    }
    /**
     * Emits a trace event detailing a QnA Maker call and its results.
     *
     * @param context Context for the current turn of conversation with the user.
     * @param answers Answers returned by QnA Maker.
     */
    emitTraceInfo(context, answers) {
        let traceInfo = {
            message: context.activity,
            queryResults: answers,
            knowledgeBaseId: this.endpoint.knowledgeBaseId,
            scoreThreshold: this.options.scoreThreshold,
            top: this.options.top,
            strictFilters: [{}],
            metadataBoost: [{}],
        };
        return context.sendActivity({
            type: 'trace',
            valueType: QNAMAKER_TRACE_TYPE,
            name: QNAMAKER_TRACE_NAME,
            label: QNAMAKER_TRACE_LABEL,
            value: traceInfo
        });
    }
}
exports.QnAMaker = QnAMaker;
//# sourceMappingURL=qnaMaker.js.map