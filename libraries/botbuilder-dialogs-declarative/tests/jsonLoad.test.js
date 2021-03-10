const assert = require('assert');
const path = require('path');
const {
    TestFlow,
    MemoryStorage,
    ConversationState,
    UserState,
    TestAdapter,
    useBotState,
    ActivityTypes,
} = require('botbuilder-core');
const { DialogManager } = require('botbuilder-dialogs');
const { ResourceExtensions, LanguageGeneratorExtensions } = require('../../botbuilder-dialogs-adaptive/lib');
const { QnACardBuilder, RankerTypes, QnAMakerClientKey } = require('../../botbuilder-ai/lib');
const { ResourceExplorer } = require('../lib');
const { StringExpression } = require('adaptive-expressions');

class MockQnAMakerClient {
    getAnswers(_turnContext, _options, _telemetryProperties, _telemetryMetrics) {
        throw new Error('Not implemented');
    }
    getAnswersRaw(turnContext, options, _telemetryProperties, _telemetryMetrics) {
        const query = turnContext.activity.text;
        const result = {
            activeLearningEnabled: true,
            answers: [],
        };

        if (query === 'Q11') {
            result.answers = [
                { answer: 'A1', id: 15, score: 0.8, questions: ['Q1'], source: 'Editorial' },
                { answer: 'A2', id: 16, score: 0.78, questions: ['Q2'], source: 'Editorial' },
                { answer: 'A3', id: 17, score: 0.75, questions: ['Q3'], source: 'Editorial' },
                { answer: 'A4', id: 18, score: 0.5, questions: ['Q4'], source: 'Editorial' },
            ];
        }

        // Output for question only ranker.
        if (query === 'What ranker do you want to use?' && options.rankerType === RankerTypes.questionOnly) {
            result.answers = [
                {
                    answer: 'We are using QuestionOnly ranker.',
                    id: 25,
                    score: 0.8,
                    questions: ['Question only ranker'],
                    source: 'Editorial',
                },
            ];
        }

        // Output for question only ranker.
        if (query === 'Surface book 2 price' && options.isTest) {
            result.answers = [
                {
                    answer: 'Surface book 2 price is $1400.',
                    id: 26,
                    score: 0.8,
                    questions: ['Price range for surface laptop'],
                    source: 'Editorial',
                },
            ];
        }

        return result;
    }

    getLowScoreVariation(queryResult) {
        if (queryResult.length > 1) {
            return [
                { answer: 'A1', id: 15, score: 80, questions: ['Q1'], source: 'Editortial' },
                { answer: 'A2', id: 16, score: 78, questions: ['Q2'], source: 'Editortial' },
                { answer: 'A3', id: 17, score: 75, questions: ['Q3'], source: 'Editortial' },
            ];
        } else {
            return queryResult;
        }
    }

    callTrain(_feedbackRecords) {
        return undefined;
    }
}

const resourceExplorer = new ResourceExplorer().addFolder(path.join(__dirname, 'resources/JsonDialog'), true, false);

const initializeAdapter = (testName, sendTrace = false) => {
    const storage = new MemoryStorage();
    const convoState = new ConversationState(storage);
    const userState = new UserState(storage);
    const adapter = new TestAdapter(TestAdapter.createConversation(testName), undefined, sendTrace);
    useBotState(adapter, userState, convoState);
    return adapter;
};

const getTestFlow = (dialog, adapter) => {
    const dm = new DialogManager(dialog);
    ResourceExtensions.useResourceExplorer(dm, resourceExplorer);
    LanguageGeneratorExtensions.useLanguageGeneration(dm);

    dm.initialTurnState.set(QnAMakerClientKey, new MockQnAMakerClient());

    return new TestFlow(Promise.resolve(), adapter, (turnContext) => {
        return dm.onTurn(turnContext);
    });
};

const buildTestFlow = (resourceName, testName, sendTrace = false) => {
    const adapter = initializeAdapter(testName, sendTrace);
    const dialog = resourceExplorer.loadType(resourceName);
    return getTestFlow(dialog, adapter);
};

const buildQnAMakerTestFlow = (testName) => {
    const adapter = initializeAdapter(testName);
    const dialog = resourceExplorer.loadType('QnAMakerBot.main.dialog');
    return getTestFlow(dialog, adapter);
};

const buildQnAMakerTestFlowIsTest = (testName) => {
    const adapter = initializeAdapter(testName);
    const dialog = resourceExplorer.loadType('QnAMakerBot.main.dialog');
    dialog.triggers[0].actions[0].isTest = true;
    return getTestFlow(dialog, adapter);
};

const buildQnAMakerTestFlowRankerTypeQuestionOnly = (testName) => {
    const adapter = initializeAdapter(testName);
    const dialog = resourceExplorer.loadType('QnAMakerBot.main.dialog');
    dialog.triggers[0].actions[0].rankerType = new StringExpression(RankerTypes.questionOnly);
    return getTestFlow(dialog, adapter);
};

describe('Json load tests', function () {
    this.timeout(5000);

    it('DoubleReference', async () => {
        await buildTestFlow('DoubleReference.dialog', this.fullTitle())
            .sendConversationUpdate()
            .assertReply('what is your name?')
            .send('c')
            .assertReply('sub0')
            .startTest();
    });

    it('CycleDetection', async () => {
        await buildTestFlow('Root.dialog', this.fullTitle())
            .sendConversationUpdate()
            .assertReply('Hello')
            .send('Hello what?')
            .assertReply('World')
            .send('World what?')
            .assertReply('Hello')
            .send('Hello what?')
            .assertReply('World')
            .send('World what?')
            .assertReply('Hello')
            .send('Hello what?')
            .assertReply('World')
            .send('World what?')
            .assertReply('Hello')
            .startTest();
    });

    it('Actions', async () => {
        await buildTestFlow('Actions.main.dialog', this.fullTitle())
            .sendConversationUpdate()
            .assertReply('Action 1')
            .assertReply('Action 2')
            .assertReply('Action 3')
            .startTest();
    });

    it('EndTurn', async () => {
        await buildTestFlow('EndTurn.main.dialog', this.fullTitle())
            .send('hello')
            .assertReply("What's up?")
            .send('Nothing')
            .assertReply('Oh I see!')
            .startTest();
    });

    it('IfProerty', async () => {
        await buildTestFlow('IfCondition.main.dialog', this.fullTitle())
            .sendConversationUpdate()
            .assertReply("Hello, I'm Zoidberg. What is your name?")
            .send('Carlos')
            .assertReply('Hello Carlos, nice to talk to you!')
            .startTest();
    });

    it('SwitchCondition', async () => {
        await buildTestFlow('SwitchCondition.main.dialog', this.fullTitle())
            .send('Hi')
            .assertReply('Age is 22!')
            .startTest();
    });

    it('TextInputWithoutProperty', async () => {
        await buildTestFlow('TextInput.WithoutProperty.main.dialog', this.fullTitle())
            .sendConversationUpdate()
            .assertReply("Hello, I'm Zoidberg. What is your name?")
            .send('Carlos')
            .assertReply('Hello, nice to talk to you!')
            .startTest();
    });

    it('TextInput', async () => {
        await buildTestFlow('TextInput.main.dialog', this.fullTitle())
            .sendConversationUpdate()
            .assertReply("Hello, I'm Zoidberg. What is your name?")
            .send('Cancel')
            .assertReply('Cancel')
            .assertReply("Hello, I'm Zoidberg. What is your name?")
            .send('Carlos  ') // outputFormat = trim(this.value)
            .assertReply('Hello Carlos, nice to talk to you!')
            .assertReply("Hello, I'm Zoidberg. What is your name?")
            .send('Cancel') // allowInterruptions = notRecognized
            .assertReply('Hello Cancel, nice to talk to you!')
            .startTest();
    });

    it('NumberInput', async () => {
        await buildTestFlow('NumberInput.main.dialog', this.fullTitle())
            .sendConversationUpdate()
            .assertReply('What is your age?')
            .send('Blablabla')
            .assertReply('Please input a number.')
            .send('4')
            .assertReply('Hello, your age is 4!')
            .assertReply('2 * 2.2 equals?')
            .send('4.4')
            .assertReply("2 * 2.2 equals 4.4, that's right!")
            .startTest();
    });

    it('RepeatDialog', async () => {
        await buildTestFlow('RepeatDialog.main.dialog', this.fullTitle())
            .sendConversationUpdate()
            .assertReply('RepeatDialog.main.dialog starting')
            .assertReply('Hello, what is your name?')
            .send('Carlos')
            .assertReply('Hello Carlos, nice to meet you! (type cancel to end this)')
            .send('hi')
            .assertReply('RepeatDialog.main.dialog starting')
            .assertReply('Hello Carlos, nice to meet you! (type cancel to end this)')
            .startTest();
    });

    it('TraceAndLog', async () => {
        await buildTestFlow('TraceAndLog.main.dialog', this.fullTitle(), true)
            .sendConversationUpdate()
            .assertReply('Hello, what is your name?')
            .send('Carlos')
            .assertReply((activity) => {
                assert.strictEqual(activity.valueType, 'https://www.botframework.com/schemas/botState');
                assert.strictEqual(activity.type, ActivityTypes.Trace);
            })
            .assertReply((activity) => {
                assert.strictEqual(activity.type, ActivityTypes.Trace);
                assert.strictEqual(activity.valueType, 'memory');
                assert.strictEqual(activity.value.name, 'Carlos');
            })
            .startTest();
    });

    it('DoActions', async () => {
        await buildTestFlow('DoActions.main.dialog', this.fullTitle())
            .send({ type: ActivityTypes.ConversationUpdate, membersAdded: [{ id: 'bot', name: 'Bot' }] })
            .sendConversationUpdate()
            .assertReply("Hello, I'm Zoidberg. What is your name?")
            .send('Carlos')
            .assertReply('Hello Carlos, nice to talk to you!')
            .assertReply('Hey, I can tell you a joke, or tell your fortune')
            .send('Do you know a joke?')
            .assertReply('Why did the chicken cross the road?')
            .send('Why?')
            .assertReply('To get to the other side')
            .send('What happend in the future?')
            .assertReply('Seeing into the future...')
            .assertReply('I see great things happening...')
            .assertReply('Perhaps even a successful bot demo')
            .startTest();
    });

    it('BeginDialog', async () => {
        await buildTestFlow('BeginDialog.main.dialog', this.fullTitle())
            .send({ type: ActivityTypes.ConversationUpdate, membersAdded: [{ id: 'bot', name: 'Bot' }] })
            .sendConversationUpdate()
            .assertReply("Hello, I'm Zoidberg. What is your name?")
            .send('Carlos')
            .assertReply('Hello Carlos, nice to talk to you!')
            .assertReply('Hey, I can tell you a joke, or tell your fortune')
            .send('Do you know a joke?')
            .assertReply('Why did the chicken cross the road?')
            .send('Why?')
            .assertReply('To get to the other side')
            .send('What happend in the future?')
            .assertReply('Seeing into the future...')
            .assertReply('I see great things in your future...')
            .assertReply('Potentially a successful demo')
            .startTest();
    });

    it('ChoiceInput', async () => {
        await buildTestFlow('ChoiceInput.main.dialog', this.fullTitle())
            .sendConversationUpdate()
            .assertReply('Please select a value from below:\n\n   1. Test1\n   2. Test2\n   3. Test3')
            .send('Test1')
            .assertReply('You select: Test1')
            .startTest();
    });

    it('ExternalLanguage', async () => {
        await buildTestFlow('ExternalLanguage.main.dialog', this.fullTitle())
            .sendConversationUpdate()
            .assertReplyOneOf([
                'Zoidberg here, welcome to my world!',
                "Hello, my name is Zoidberg and I'll be your guide.",
                'Hail Zoidberg!',
            ])
            .assertReplyOneOf(['Hello. What is your name?', "I would like to know you better, what's your name?"])
            .send('Carlos')
            .assertReplyOneOf(['Hello Carlos, nice to talk to you!', 'Hi Carlos, you seem nice!', 'Whassup Carlos?'])
            .send('Help')
            .assertReply('I can tell jokes and also forsee the future!')
            .send('Do you know a joke?')
            .assertReply('Why did the chicken cross the road?')
            .send('Why?')
            .assertReply('To get to the other side')
            .send('What happened in the future?')
            .assertReply('I see great things in your future...')
            .assertReply('Potentially a successful demo')
            .startTest();
    });

    it('ToDoBot', async () => {
        await buildTestFlow('ToDoBot.main.dialog', this.fullTitle())
            .send({ type: ActivityTypes.ConversationUpdate, membersAdded: [{ id: 'bot', name: 'Bot' }] })
            .sendConversationUpdate()
            .assertReply('Hi! I\'m a ToDo bot. Say "add a todo named first" to get started.')
            .send('add a todo named first')
            .assertReply('Successfully added a todo named "first"')
            .send('add a todo named second')
            .assertReply('Successfully added a todo named "second"')
            .send('add a todo')
            .assertReply('OK, please enter the title of your todo.')
            .send('third')
            .assertReply('Successfully added a todo named "third"')
            .send('show todos')
            .assertReplyOneOf([
                'Your most recent 3 tasks are\n* first\n* second\n* third',
                'Your most recent 3 tasks are\r\n* first\n* second\n* third',
            ])
            .send('delete todo named second')
            .assertReply('Successfully removed a todo named "second"')
            .send('show todos')
            .assertReplyOneOf([
                'Your most recent 2 tasks are\r\n* first\n* third',
                'Your most recent 2 tasks are\n* first\n* third',
            ])
            .send('add a todo')
            .assertReply('OK, please enter the title of your todo.')
            .send('cancel')
            .assertReply('ok.')
            .startTest();
    });

    it('HttpRequest', async () => {
        await buildTestFlow('HttpRequest.main.dialog', this.fullTitle())
            .send({ type: ActivityTypes.ConversationUpdate, membersAdded: [{ id: 'bot', name: 'Bot' }] })
            .assertReply('Welcome! Here is a http request sample, please enter a name for you visual pet.')
            .send('TestPetName')
            .assertReply("Great! Your pet's name is TestPetName")
            .assertReply('Now please enter the id of your pet, this could help you find your pet later.')
            .send('12121')
            .assertReply('Done! You have added a pet named "TestPetName" with id "12121"')
            .assertReply('Now try to specify the id of your pet, and I will help your find it out from the store.')
            .send('12121')
            .assertReply('Great! I found your pet named "TestPetName"')
            .startTest();
    });

    it('QnAMakerDialog_ActiveLearning_WithProperResponse', async () => {
        const suggestionList = ['Q1', 'Q2', 'Q3'];
        const suggestionActivity = QnACardBuilder.getSuggestionsCard(
            suggestionList,
            'Did you mean:',
            'None of the above.'
        );
        await buildQnAMakerTestFlow(this.fullTitle())
            .send('Q11')
            .assertReply((reply, _description) => {
                assert(reply.attachments);
                assert.deepStrictEqual(reply.attachments, suggestionActivity.attachments);
            })
            .send('Q1')
            .assertReply('A1')
            .startTest();
    });

    it('QnAMakerDialog_ActiveLearning_WithNoResponse', async () => {
        const suggestionList = ['Q1', 'Q2', 'Q3'];
        const suggestionActivity = QnACardBuilder.getSuggestionsCard(
            suggestionList,
            'Did you mean:',
            'None of the above.'
        );
        const noAnswerActivity = 'Answers not found in kb.';
        await buildQnAMakerTestFlow(this.fullTitle())
            .send('Q11')
            .assertReply((reply, _description) => {
                assert(reply.attachments);
                assert.deepStrictEqual(reply.attachments, suggestionActivity.attachments);
            })
            .send('Q12')
            .assertReply(noAnswerActivity)
            .startTest();
    });

    it('QnAmakerDialog_ActiveLearning_WithNontOfAboveQuery', async () => {
        const suggestionList = ['Q1', 'Q2', 'Q3'];
        const suggestionActivity = QnACardBuilder.getSuggestionsCard(
            suggestionList,
            'Did you mean:',
            'None of the above.'
        );
        await buildQnAMakerTestFlow(this.fullTitle())
            .send('Q11')
            .assertReply((reply, _description) => {
                assert(reply.attachments);
                assert.deepStrictEqual(reply.attachments, suggestionActivity.attachments);
            })
            .send('None of the above.')
            .assertReply('Thanks for the feedback.')
            .startTest();
    });

    it('QnAMakerDialog_isTest', async () => {
        await buildQnAMakerTestFlowIsTest(this.fullTitle())
            .send('Surface book 2 price')
            .assertReply('Surface book 2 price is $1400.')
            .startTest();
    });

    it('QnAMakerDialog_RankerType_QuestionOnly', async () => {
        await buildQnAMakerTestFlowRankerTypeQuestionOnly(this.fullTitle())
            .send('What ranker do you want to use?')
            .assertReply('We are using QuestionOnly ranker.')
            .startTest();
    });
});
