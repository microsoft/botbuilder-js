
const runTest = require('./testEnd2EndInfrastructure.js').runTest;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiAsPromised);
chai.should();

describe('e2e', function () {
    describe('No Network', function () {
        describe('DoActionForm', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'cancel').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'help', 'cancel').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'add white-bread', 'add ham', 'add large', 'yes').should.be.fulfilled;
            });
            it('3', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'add white-bread', 'add ham', 'add large', 'no').should.be.fulfilled;
            });
            it('4', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'add white-bread', 'add ham', 'help', 'add large', 'yes').should.be.fulfilled;
            });
            it('5', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'add white-bread', 'add ham', 'cancel').should.be.fulfilled;
            });
            it('6', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'add large', 'add ham', 'add white-bread', 'yes').should.be.fulfilled;
            });
        });
        describe('DoActionFormThen', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'number 2', 'number 3', 'yes').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'number 42', 'number 64', 'number 27', 'yes').should.be.fulfilled;
            });
        });
        describe('DoActionFormMessage', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'to: Buckethead', 'message: hello', 'yes').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'message: hello', 'to: Buckethead', 'yes').should.be.fulfilled;
            });
        });
        describe('DoActionFormNoAllPrompt', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'to: Buckethead', 'message: hello', 'yes').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hello to Buckethead', 'yes').should.be.fulfilled;
            });
        });
        describe('DoActionFormPromptFallback', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'x: 42', 'y: 64', 'z: 32', 'yes').should.be.fulfilled;
            });
        });
        describe('DoActionProcess', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, '1').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, '3', '1', '2').should.be.fulfilled;
            });
        });
        describe('DoActionFormRegex', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'order sandwich', 'cancel').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'ORDER SANDWICH', 'help', 'cancel').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'ORDER sandwich', 'white-bread', 'ham', 'large', 'yes').should.be.fulfilled;
            });
            it('3', function () {
                return runTest(this.test.parent.title, this.test.title, 'order saaaaandwich', 'white-bread', 'ham', 'large', 'no').should.be.fulfilled;
            });
            it('4', function () {
                return runTest(this.test.parent.title, this.test.title, 'order sand', 'white-bread', 'ham', 'help', 'large', 'yes').should.be.fulfilled;
            });
            it('5', function () {
                return runTest(this.test.parent.title, this.test.title, 'order something', 'white-bread', 'ham', 'cancel').should.be.fulfilled;
            });
        });
        describe('DoActionCodeRecognizerProcess', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, '1').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, '3', '1', '2').should.be.fulfilled;
            });
        });
        describe('DoActionRespond', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, '1').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, '3', '1', '2').should.be.fulfilled;
            });
        });
        describe('DoActionRespondCode', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, '1', '2', '1', '2').should.be.fulfilled;
            });
        });
        describe('DoActionCodeRespond', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, '1').should.be.fulfilled;
            });
        });
        describe('DoActionRespondWithTemplates', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, '1').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, '3', '1', '2').should.be.fulfilled;
            });
        });
        describe('DoActionDialogFlow', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, '1', '2').should.be.fulfilled;
            });
        });
        describe('CodeRecognizer', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hello').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'g\'day mate').should.be.fulfilled;
            });
            it('3', function () {
                return runTest(this.test.parent.title, this.test.title, 'NOT-A-GREETING').should.be.fulfilled;
            });
        });
        describe('RegexRecognizer', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hello').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'HELLO').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'xHello').should.be.fulfilled;
            });
            it('3', function () {
                return runTest(this.test.parent.title, this.test.title, 'NoMatch').should.be.fulfilled;
            });
        });
        describe('AddRemoveEntity', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'add', 'get', 'remove', 'get').should.be.fulfilled;
            });
        });
        describe('AdaptiveCardAttachment', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('AdaptiveCardFeedbackOneOf', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('AdaptiveCardPrompt', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'book a table this weekend for 5').should.be.fulfilled;
            });
        });
        describe('DoActionRespondWithAdaptiveCard', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, '1').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, '3', '1', '2').should.be.fulfilled;
            });
        });

        describe('SinglePrompt', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'A').should.be.fulfilled;
            });
        });
        describe('SinglePromptSingleFeedback', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'value A').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'wrong A', 'value A').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'wrong A', 'again wrong A', 'value A').should.be.fulfilled;
            });
        });
        describe('SinglePromptSingleProcessSingleFeedback', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'TEST TEST TEST').should.be.fulfilled;
            });
        });
        describe('SinglePromptWithCodeSingleFeedback', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'value A').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'wrong A', 'value A').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'wrong A', 'again wrong A', 'value A').should.be.fulfilled;
            });
        });
        describe('MultipleProcessMultiplePromptSingleFeedbackNoCode', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'PROMPT-ENTITY-1', 'PROMPT-ENTITY-2').should.be.fulfilled;
            });
        });
        describe('SinglePromptWithCodeSingleFeedbackWithCode', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'A').should.be.fulfilled;
            });
        });
        describe('SinglePromptMultipleEntitySingleFeedback', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'valueX', 'valueA A', 'valueY', 'valueB B').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'valueX', 'valueA A valueB B').should.be.fulfilled;
            });
        });
        describe('CodeRecognizerPrompt', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'book a table this weekend for 5').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'book a table this weekend for 5', 'hi', 'book a table for 42').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'wrong wrong wrong', 'book a table tomorrow for 3').should.be.fulfilled;
            });
        });
        describe('SingleFeedback', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('SingleFeedbackWithCode', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('ResponseCode', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('Reprompt', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'value A').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'wrong', 'value A').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'wrong', 'wrong', 'value A').should.be.fulfilled;
            });
        });
        describe('MultipleFeedback', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('MultiplePrompt', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'A', 'B', 'C').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'A', 'B', 'C', 'hi', 'A', 'B', 'C').should.be.fulfilled;
            });
        });
        describe('MultipleProcess', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('MultipleTasksWithPrompt', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, '1', '64', '2', '36', '3').should.be.fulfilled;
            });
        });
        describe('MultipleTasks', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, '1').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, '2').should.be.fulfilled;
            });
        });
        describe('Branching', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', '0').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', '1').should.be.fulfilled;
            });
        });
        describe('DeepBranching', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'left', 'left', 'left').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'left', 'left', 'right').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'left', 'right', 'left').should.be.fulfilled;
            });
            it('3', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'left', 'right', 'right').should.be.fulfilled;
            });
            it('4', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'right', 'left', 'left').should.be.fulfilled;
            });
            it('5', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'right', 'left', 'right').should.be.fulfilled;
            });
            it('6', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'right', 'right', 'left').should.be.fulfilled;
            });
            it('7', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'right', 'right', 'right').should.be.fulfilled;
            });
        });
        describe('WideBranching', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', '1').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', '2').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', '3').should.be.fulfilled;
            });
            it('3', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', '4').should.be.fulfilled;
            });
        });
        describe('InitialState', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'hi').should.be.fulfilled;
            });
        });
        describe('FanOutFanIn', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, '5', '123').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, '15', '5').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, '15', '15', '456').should.be.fulfilled;
            });
        });
        describe('LoopWithProcess', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('LoopWithDecision', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('LoopWithPrompt', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('LoopWithMultiple', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('LoopWithLoop', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('LoopIrreducible', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi ABABAE').should.be.fulfilled;
            });
        });
        describe('Looping', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', '0', '5', '10', '15').should.be.fulfilled;
            });
        });
        describe('InlineFlowRespond', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'hi').should.be.fulfilled;
            });
        });
        describe('WhenValueInvalid', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('SingleProcess', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('SimpleResponse', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('ConditionalResponse', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'a').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'ab').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'abcde').should.be.fulfilled;
            });
        });
        describe('ConditionalResponseNested', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'a').should.be.fulfilled;
            });
        });
        describe('ConditionalResponseTwice', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'a').should.be.fulfilled;
            });
        });
        describe('FeedbackPerModality', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('PromptFeedbackPerModality', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'hey').should.be.fulfilled;
            });
        });
        describe('EmptyFeedback', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('IntentTipTask', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'help').should.be.fulfilled;
            });
        });
        describe('EmptyIntentTipTask', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'help').should.be.fulfilled;
            });
        });

        describe('SubDialog', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', '42', '84').should.be.fulfilled;
            });
        });
        describe('SharedDialogFlow', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('FlowRefFlowRefFlow', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('FlowRefSharedFlowRefSharedFlow', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('FlowRefWithPrompt', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', '24', 'value 24', '42', 'value 42', '48', 'value 48').should.be.fulfilled;
            });
        });
        describe('SinglePromptMultipleEntitySingleFeedback', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'valueX', 'valueA A', 'valueY', 'valueB B').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'valueX', 'valueA A valueB B').should.be.fulfilled;
            });
        });
        describe('XMLFeedback', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('SinglePromptSingleProcessSingleFeedbackTwice', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'Roxy', 'Music').should.be.fulfilled;
            });
        });
        describe('SingleProcessWithHttp', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('WhenPrompt', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'AA').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'AAA', 'BBB').should.be.fulfilled;
            });
        });
        describe('WhenPromptWithCard', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'file:///buttonclick.json').should.be.fulfilled;
            });
        });
        describe('DoActionWithCardAction', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'file:///buttonclick.json').should.be.fulfilled;
            });
        });
        describe('DoActionFormDatatypes', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'London', 'Seattle', '2017-11-14', 'yes').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'London', 'Seattle', 'this-is-not-a-date', '2017-12-25', 'yes').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'London', 'Seattle', 'wednesday 2 oclock', 'yes').should.be.fulfilled;
            });
        });
        describe('DoActionFormAllDatatypes', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', '2018-05-29', 'one million', 'fifty percent', 'second', '75 degrees', '50 years old', '10 meters', 'two hundred and fifty pounds', 'hello world', 'yes').should.be.fulfilled;
            });
        });
        describe('TaskTrigger', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
        describe('ConversationUpdate', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'file:///updateActivity.json', 'hi').should.be.fulfilled;
            });
        });
        describe('AgentResources', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
        });
    });

    describe('With LUIS', function () {

        this.timeout(30000);

        afterEach(function (done) { setTimeout(done, 1500); });

        describe('DoActionFormFallback', function () {
            it('0', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'summy side up eggs', 'ham', 'sourdough', 'yes').should.be.fulfilled;
            });
            it('1', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'over easy', 'ham', 'sourdough', 'yes').should.be.fulfilled;
            });
            it('2', function () {
                return runTest(this.test.parent.title, this.test.title, 'hi', 'sunny side up', 'bacon', 'whole wheat', 'yes').should.be.fulfilled;
            });
        });
        
        describe('DoActionLuisOnRecognize', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'book a table this weekend for 4').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'book a table this weekend for 4 please').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hello').should.be.fulfilled;
            });
        });
        describe('DoActionLuisProcessEntities', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'book a table this weekend for 4').should.be.fulfilled;
            });
        });
        describe('LuisHierarchicalEntities', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'i would like to fly from Seattle to London').should.be.fulfilled;
            });
        });
        describe('LuisCompositeEntities', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'i would like to fly from Seattle to London').should.be.fulfilled;
            });
        });
        describe('LuisBuiltin', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'please finish by tomorrow').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'please finish by tomorrow 6PM').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, 'you must be 21 years old to enter').should.be.fulfilled;
            });
        });
        describe('LuisIntentFeedback', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'bye').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'bye').should.be.fulfilled;
            });
        });
        describe('LuisPrompt', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'book a table this weekend for 5').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'book a table this weekend for 5', 'hi', 'book a table for 42').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'wrong wrong wrong', 'book a table tomorrow for 3').should.be.fulfilled;
            });
        });
        describe('LuisPromptOnRecognize', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'book a table for 1', 'book a table this weekend for 2').should.be.fulfilled;
            });
        });
        describe('LuisPromptConditionalResponse', function () {
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'book a table', 'I need a table for 5').should.be.fulfilled;
            });
        });
        describe('MultipleTasksWithLuisAndCode', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'g\'day mate').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, 'bye').should.be.fulfilled;
            });
            it('3', function () { 
                return runTest(this.test.parent.title, this.test.title, 'hi', 'struth').should.be.fulfilled;
            });
        });
        describe('LuisBuiltinResolution', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'please finish by tomorrow').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'book a table tomorrow for 3').should.be.fulfilled;
            });
        });
        describe('LuisMultipleEntity', function () {
            it('0', function () { 
                return runTest(this.test.parent.title, this.test.title, 'create a timer', '10 minutes and 52 seconds').should.be.fulfilled;
            });
            it('1', function () { 
                return runTest(this.test.parent.title, this.test.title, 'create a timer', 'no timer value', '10 minutes and 52 seconds').should.be.fulfilled;
            });
            it('2', function () { 
                return runTest(this.test.parent.title, this.test.title, 'create a timer', '30 seconds').should.be.fulfilled;
            });
        });
    });
});
