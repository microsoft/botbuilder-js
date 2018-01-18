/**
 * @module botbuilder-ai
 */
/** second comment block */
import { Activity, SearchEngine, SearchCatalog, SearchHit } from 'botbuilder';
import * as request from 'request-promise-native';
import * as entities from 'html-entities';

var htmlentities = new entities.AllHtmlEntities();

export interface QnAMakerResult {
    answer: string,
    score: number
}

interface QnA {
    qnaId: string;
    source: string;
    answer: string;
    questions: string[];
    metadata: any[]
}

interface QnAKnowledgeBase {
    qnaList: QnA[];
}

let qnaMakerServiceEndpoint = 'https://westus.api.cognitive.microsoft.com/qnamaker/v3.0/knowledgebases/';

export interface QnAMakerOptions {
    knowledgeBaseId: string;
    subscriptionKey: string;
    scoreThreshold: number;
    searchEngine: SearchEngine;
    top: number;
}

export class QnAMaker {
    private catalog?: SearchCatalog;
    private kbUrl: string;
    private answerUrl: string;
    private kbTrainUrl: string;

    constructor(private options: QnAMakerOptions) {
        this.kbUrl = `${qnaMakerServiceEndpoint}${options.knowledgeBaseId}`;
        this.answerUrl = `${qnaMakerServiceEndpoint}${options.knowledgeBaseId}/generateanswer`;
        this.kbTrainUrl = `${qnaMakerServiceEndpoint}${options.knowledgeBaseId}/train`;
        if (!options.scoreThreshold || options.scoreThreshold == 0)
            options.scoreThreshold = .3;
        if (!options.top || options.top == 0)
            options.top = 1;
    }

    public getAnswers(question: string): Promise<QnAMakerResult[]> {
        if (this.options.searchEngine) {
            return this.getSearchEngineAnswers(question);
        }
        else {
            return this.getServiceAnswers(question);
        }
    }

    private async getSearchEngineAnswers(question: string): Promise<QnAMakerResult[]> {
        if (!this.options.searchEngine)
            throw new Error("No searchEngine was provided");

        if (!this.catalog) {
            this.catalog = await this.options.searchEngine.getCatalog(this.options.knowledgeBaseId)
                .catch(() => this.createCatalogForKnowledgeBase());
        }
        let searchHits = await this.catalog.search(question);
        var answers: QnAMakerResult[] = [];
        if (searchHits && searchHits.length > 0) {
            for (let searchHit of searchHits) {
                if (searchHit.score > this.options.scoreThreshold) {
                    let doc: any = await this.catalog.get(searchHit.docId);
                    answers.push({
                        score: searchHit.score,
                        answer: doc.answer
                    });
                    if (answers.length >= this.options.top)
                        break;
                }
            };
        }
        return answers;
    }


    private getServiceAnswers(question: string): Promise<QnAMakerResult[]> {
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
                var answers: QnAMakerResult[] = [];
                if (result.answers && result.answers.length > 0) {
                    result.answers.forEach((ans: any) => {
                        ans.score /= 100;
                        if (ans.score > this.options.scoreThreshold) {
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
    private async createCatalogForKnowledgeBase(): Promise<SearchCatalog> {
        // create empty catalog
        let catalog = await this.options.searchEngine.createCatalog(this.options.knowledgeBaseId, "qnaId", ["question", "answer"]);

        // get knowledge base
        let knowledgeBase = await request({
            url: this.kbUrl,
            method: 'GET',
            headers: { 'Ocp-Apim-Subscription-Key': this.options.subscriptionKey }
        }).then((result) => <QnAKnowledgeBase>JSON.parse(result));

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
        await catalog.flush();
        return catalog;
    }

    routeTo(context: BotContext): Promise<boolean> {
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
                })
        }
        // no result
        return Promise.resolve(false);
    }
}



