const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');
//const lunr = require('../../lunr');
//const elasticLunr = require('elasticlunr');

// disable elasticlunr warnings
//elasticLunr.utils.warn = (function (global) {
//    return function (message) {    };
//  })(this);

const knowlegeBaseId = process.env.QNAKNOWLEDGEBASEID;
const subscriptionKey = process.env.QNASUBSCRIPTIONKEY;

describe('QnAMaker', function () {
    this.timeout(10000);
    if (!knowlegeBaseId) {
        console.warn('WARNING: skipping QnAMaker test suite because QNAKNOWLEDGEBASEID environment variable is not defined');
        return;
    }
    if (!subscriptionKey) {
        console.warn('WARNING: skipping QnAMaker test suite because QNASUBSCRIPTIONKEY environment variable is not defined');
        return;
    }

    it('remote service should work', function () {
        var qna = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1
        });

        return qna.getAnswers("how do I clean the stove?")
            .then(res => {
                assert(res);
                assert(res.length == 1);
                assert(res[0].answer.startsWith("BaseCamp: You can use a damp rag to clean around the Power Pack"));
            })
            .then(() => qna.getAnswers("is the stove hard to clean?"))
            .then(res => {
                assert(res);
                assert(res.length == 1);
                assert(res[0].answer.startsWith("BaseCamp: You can use a damp rag to clean around the Power Pack"));
            });
        ;
    });
/*
    it('local search should work', function () {
        let searchEngine = new lunr.LunrSearchEngine(new builder.MemoryStorage({path:'data'}));

        var qna = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1,
            searchEngine: searchEngine
        });

        return qna.getAnswers("how do I clean the stove?")
            .then(res => {
                assert(res);
                assert(res.length == 1);
                assert(res[0].answer.startsWith("BaseCamp: You can use a damp rag to clean around the Power Pack"));
            })
            .then(() => qna.getAnswers("is the stove hard to clean?"))
            .then(res => {
                assert(res);
                assert(res.length == 1);
                assert(res[0].answer.startsWith("BaseCamp: You can use a damp rag to clean around the Power Pack"));
            });
    });
*/

    it('routeToQnaMaker-service', function (done) {
        const adapter = new builder.TestAdapter();
        var qnaMaker = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1
        });
        const bot = new builder.Bot(adapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .onReceive((ctx) => {
                return qnaMaker.routeTo(ctx)
                .then((result) => {
                    if (result)
                        return result;
                    ctx.reply("boo hoo");
                    return true;
                });
            });
        adapter
            .test('what if it\s windy', "If it's windy, position the stove so the flame is blowing over the stainless steel fuel chamber away from the plastic power module.")
            .test('xyazkjdf', 'boo hoo')
            .then(() => done());
    });
/*
    it('routeToQnaMaker-local', function (done) {
        const adapter = new builder.TestAdapter();
        var qnaMaker = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1,
            searchEngine: new lunr.LunrSearchEngine(new builder.MemoryStorage({path:'data'}))
        });
        const bot = new builder.Bot(adapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .onReceive((ctx) => {
                return qnaMaker.routeTo(ctx)
                .then((result) => {
                    if (result)
                        return result;
                    ctx.reply("boo hoo");
                    return true;
                });
            });
        adapter
            .test('what if it\s windy', "If it's windy, position the stove so the flame is blowing over the stainless steel fuel chamber away from the plastic power module.")
            .test('xyazkjdf', 'boo hoo')
            .then(() => done());
    });
*/
});
