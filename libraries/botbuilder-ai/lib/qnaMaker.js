"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
const entities = require("html-entities");
var htmlentities = new entities.AllHtmlEntities();
const GENERATEANSWER_PATH = '/qnamaker/v3.0/knowledgebases/generateanswer';
class QnAMaker {
    constructor(settings) {
        this.settings = Object.assign({
            scoreThreshold: 0.3,
            top: 1,
            answerBeforeNext: false
        }, settings);
        if (!this.settings.serviceEndpoint) {
            this.settings.serviceEndpoint = 'https://westus.api.cognitive.microsoft.com/';
        }
        else if (!this.settings.serviceEndpoint.endsWith('/')) {
            this.settings.serviceEndpoint += '/';
        }
    }
    onProcessRequest(context, next) {
        if (this.settings.answerBeforeNext) {
            // Attempt to answer user and only call next() if not answered
            return this.answer(context)
                .then((answered) => !answered ? next() : Promise.resolve());
        }
        else {
            // Call next() and then attempt to answer only if nothing else responded
            return next()
                .then(() => !context.responded ? this.answer(context).then(() => { }) : Promise.resolve());
        }
    }
    answer(context) {
        const { top, scoreThreshold } = this.settings;
        return this.generateAnswer(context.request.text, top, scoreThreshold).then((answers) => {
            if (answers.length > 0) {
                return context.sendActivity({ text: answers[0].answer, type: 'message' }).then(() => true);
            }
            else {
                return Promise.resolve(false);
            }
        });
    }
    generateAnswer(question, top, scoreThreshold) {
        const { serviceEndpoint } = this.settings;
        return this.callService(serviceEndpoint, question, typeof top === 'number' ? top : 1).then((answers) => {
            const minScore = typeof scoreThreshold === 'number' ? scoreThreshold : 0.0;
            return answers.filter((ans) => ans.score >= minScore).sort((a, b) => b.score - a.score);
        });
    }
    callService(serviceEndpoint, question, top) {
        return request({
            url: serviceEndpoint + GENERATEANSWER_PATH,
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': this.settings.subscriptionKey
            },
            json: {
                question: question,
                top: top
            }
        }).then(result => {
            const answers = [];
            return (result.answers || []).map((ans) => {
                return { score: ans.score / 100, answer: htmlentities.decode(ans.answer) };
            });
        });
    }
}
exports.QnAMaker = QnAMaker;
//# sourceMappingURL=qnaMaker.js.map