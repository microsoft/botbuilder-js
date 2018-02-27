"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
const entities = require("html-entities");
var htmlentities = new entities.AllHtmlEntities();
const v3path = '/qnamaker/v3.0/knowledgebases/';
class QnAMaker {
    constructor(options) {
        this.options = Object.assign({
            scoreThreshold: 0.3,
            serviceEndpoint: 'https://westus.api.cognitive.microsoft.com',
            top: 1
        }, options);
        const endpoint = this.options.serviceEndpoint;
        this.kbUrl = `${endpoint + v3path + options.knowledgeBaseId}`;
        this.answerUrl = `${this.kbUrl}/generateanswer`;
        this.kbTrainUrl = `${this.kbUrl}/train`;
    }
    getAnswers(question) {
        return this.getServiceAnswers(question);
    }
    getServiceAnswers(question) {
        return request({
            url: this.answerUrl,
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': this.options.subscriptionKey
            },
            json: {
                question: question,
                top: this.options.top
            }
        })
            .then(result => {
            const answers = [];
            const scoreThreshold = this.options.scoreThreshold;
            if (result.answers && result.answers.length > 0) {
                result.answers.forEach((ans) => {
                    ans.score /= 100;
                    if (ans.score >= scoreThreshold) {
                        answers.push({
                            score: ans.score,
                            answer: htmlentities.decode(ans.answer)
                        });
                    }
                });
            }
            return answers;
        });
    }
}
exports.QnAMaker = QnAMaker;
//# sourceMappingURL=qnaMaker.js.map