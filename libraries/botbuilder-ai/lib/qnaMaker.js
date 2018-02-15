"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        if (this.options.searchEngine) {
            return this.getSearchEngineAnswers(question);
        }
        else {
            return this.getServiceAnswers(question);
        }
    }
    getSearchEngineAnswers(question) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.options.searchEngine)
                throw new Error("No searchEngine was provided");
            if (!this.catalog) {
                this.catalog = yield this.options.searchEngine.getCatalog(this.options.knowledgeBaseId)
                    .catch(() => this.createCatalogForKnowledgeBase());
            }
            let searchHits = yield this.catalog.search(question);
            var answers = [];
            if (searchHits && searchHits.length > 0) {
                const scoreThreshold = this.options.scoreThreshold;
                const top = this.options.top;
                for (let searchHit of searchHits) {
                    if (searchHit.score >= scoreThreshold) {
                        let doc = yield this.catalog.get(searchHit.docId);
                        answers.push({
                            score: searchHit.score,
                            answer: doc.answer
                        });
                        if (answers.length >= top)
                            break;
                    }
                }
                ;
            }
            return answers;
        });
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
    /** build catalog */
    createCatalogForKnowledgeBase() {
        return __awaiter(this, void 0, void 0, function* () {
            // create empty catalog
            let catalog = yield this.options.searchEngine.createCatalog(this.options.knowledgeBaseId, "qnaId", ["question", "answer"]);
            // get knowledge base
            let knowledgeBase = yield request({
                url: this.kbUrl,
                method: 'GET',
                headers: { 'Ocp-Apim-Subscription-Key': this.options.subscriptionKey }
            }).then((result) => JSON.parse(result));
            // proces each line
            for (let qna of knowledgeBase.qnaList) {
                // index question/answer as a document
                catalog.add({
                    qnaId: qna.qnaId,
                    question: qna.questions.join('\n'),
                    answer: qna.answer
                });
            }
            // flush changes
            yield catalog.flush();
            return catalog;
        });
    }
    routeTo(context) {
        if (context.request && context.request.text && context.request.text.length > 0) {
            return this
                .getAnswers(context.request.text)
                .then((answers) => {
                if (answers.length > 0) {
                    let answer = answers[0];
                    // send reply as response
                    context.reply(answer.answer);
                    return true;
                }
                // no result found
                return false;
            }).catch(error => {
                // failure
                return Promise.reject(error);
            });
        }
        // no result
        return Promise.resolve(false);
    }
}
exports.QnAMaker = QnAMaker;
//# sourceMappingURL=qnaMaker.js.map