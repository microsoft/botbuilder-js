// Copyright (c) Microsoft Corporation. All rights reserved.

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const testLoad = require('./testLoad.js');
const testCreate = require('./testCreate.js');
const lg = require('../index.js');

//chai.Assertion.includeStack = true;
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiAsPromised);
chai.should();

describe('No Network', () => {
    
    describe('Language Generation', () => {

        describe('Feedback', () => {
            const result = lg.languageGeneration({}, undefined, testCreate.feedback('hello world'), {});
            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should echo text', () => {
                return result.should.become(testCreate.response('hello world'));
            });
        });

        describe('Feedback with Entities', () => {
            it('should substitute entities', () => {
                return lg.languageGeneration({}, undefined, testCreate.feedback('hello {x}'), { x: 'world' })
                    .should.become(testCreate.response('hello world'));
            });
            it('should substitute multiple entities', () => {
                return lg.languageGeneration({}, undefined, testCreate.feedback('{x} {y} {z}'), { x: '1', y: '2', z: '3' })
                    .should.become(testCreate.response('1 2 3'));
            });
        });

        describe('FeedbackOneOf', () => {
            const result = lg.languageGeneration({}, undefined, testCreate.feedbackOneOf('hi', 'hello', 'greetings'), {});

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text be oneOf', () => {
                return result.should.eventually.have.property('text').be.oneOf(['hi', 'hello', 'greetings']);
            });
            it('should have speak be oneOf', () => {
                return result.should.eventually.have.property('speak').be.oneOf(['hi', 'hello', 'greetings']);
            });
        });

        describe('FeedbackOneOf with Entities', () => {
            const result = lg.languageGeneration({}, undefined, testCreate.feedbackOneOf('hi {name}', 'hello {name}', 'greetings'), { name: 'Bob' });

            it('should have text be oneOf and substitute entities', () => {
                return result.should.eventually.have.property('text').be.oneOf(['hi Bob', 'hello Bob', 'greetings']);
            });
        });

        describe('FeedbackPerModality', () => {
            const result = lg.languageGeneration({}, undefined, testCreate.feedbackPerModality('hello', 'hi there'), {});

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text as text', () => {
                return result.should.eventually.have.property('text').equal('hello');
            });
            it('should have speak as speak', () => {
                return result.should.eventually.have.property('speak').equal('hi there');
            });
        });

        describe('FeedbackPerModality with Entities', () => {
            const result = lg.languageGeneration(
                {},
                undefined,
                testCreate.feedbackPerModality('Hello Mr {firstName} {lastName}', 'Hi there {firstName}'),
                { firstName: 'Mick', lastName: 'Jagger' });

            it('should have text as text', () => {
                return result.should.eventually.have.property('text').equal('Hello Mr Mick Jagger');
            });
            it('should have speak as speak', () => {
                return result.should.eventually.have.property('speak').equal('Hi there Mick');
            });
        });

        describe('FeedbackOneOf with FeedbackPerModality', () => {
            const result = lg.languageGeneration(
                {},
                undefined,
                testCreate.feedbackOneOf(
                    { text: 'hello', speak: 'hi' },
                    { text: 'greetings', speak: 'greetings' },
                    { text: 'hello', speak: 'goodday mate' },
                    'salutations'),
                {});

            it('should have text as text', () => {
                return result.should.eventually.have.property('text').be.oneOf(['hello', 'greetings', 'salutations']);
            });
            it('should have speak as speak', () => {
                return result.should.eventually.have.property('speak').be.oneOf(['hi', 'greetings', 'goodday mate', 'salutations']);
            });
        });

        describe('text and Speak evaluation can differ in structure', () => {
            const templates = testLoad.templates('different_modality.xml');
            const result = lg.languageGeneration(templates, undefined, testCreate.feedback('[Start]'), {});

            it('should have text as text', () => {
                return result.should.eventually.have.property('text').be.oneOf([
                    'Display.1',
                    'Display.2',
                    'Display.3']);
            });
            it('should have speak as speak', () => {
                return result.should.eventually.have.property('speak').be.oneOf([
                    'Speak.1.1.1',
                    'Speak.1.1.2',
                    'Speak.1.2.1',
                    'Speak.1.2.2',
                    'Speak.2.1.1',
                    'Speak.2.1.2',
                    'Speak.2.2.1',
                    'Speak.2.2.2']);
            });
        });

        describe('SimpleResponse', () => {
            const templates = testLoad.templates('simple.xml');
            const result = lg.languageGeneration(templates, undefined, testCreate.feedback(' [SimpleResponse2] '), {});

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal(' c ');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal(' c ');
            });
        });

        describe('SimpleResponse with dependency on other SimpleResponse', () => {
            const templates = testLoad.templates('simple.xml');
            const result = lg.languageGeneration(templates, undefined, testCreate.feedback(' [SimpleResponse0] '), {});

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal(' a b c ');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal(' a b c ');
            });
        });

        describe('SimpleResponse with multiple dependency on other SimpleResponse', () => {
            const templates = testLoad.templates('simple.xml');
            const result = lg.languageGeneration(templates, undefined, testCreate.feedback('y [SimpleResponse3] y'), {});

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('y x a b c x b c x c x y');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('y x a b c x b c x c x y');
            });
        });

        describe('SimpleResponse with Entites', () => {
            const templates = testLoad.templates('simple_entities.xml');
            const entities = { open: '{ ', close: ' }', r: 'RED', g: 'GREEN', b: 'BLUE' };
            const result = lg.languageGeneration(templates, undefined, testCreate.feedback('{open}[SimpleResponseRGB]{close}'), entities);

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('{ "r": "RED", "g": "GREEN", "b": "BLUE" }');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('{ "r": "RED", "g": "GREEN", "b": "BLUE" }');
            });
        });

        describe('SimpleResponse with dependency and Entites', () => {
            const templates = testLoad.templates('simple_entities.xml');
            const entities = { open: '{ ', close: ' }', r: 'RED', g: 'GREEN', b: 'BLUE' };
            const result = lg.languageGeneration(templates, undefined, testCreate.feedback('{open}[SimpleResponseRB]{close}'), entities);

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('{ "r": "RED", "g": "GREEN", "b": "BLUE" }');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('{ "r": "RED", "g": "GREEN", "b": "BLUE" }');
            });
        });

        describe('SimpleResponse with FeedbackPerModality', () => {
            const templates = testLoad.templates('simple_feedback.xml');
            const entities = { letter: 'A' };
            const result = lg.languageGeneration(templates, undefined, testCreate.feedback('[SimpleResponse-FeedbackModality]'), entities);

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('type the letter "A"');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('please type the letter "A"');
            });
        });

        describe('Consistent Randomness in FeedbackPerModality in FeedbackOneOf', () => {
            const templates = testLoad.templates('random_feedback.xml');
            const result = lg.languageGeneration(templates, undefined, testCreate.feedback('[Response-1]'), {});

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text and speak properties that are the same', () => {
                return result.should.eventually.satisfy(function (obj) { return obj.text === obj.speak; });
            });
        });

        describe('Empty Feedback', () => {
            const templates = testLoad.templates('simple_feedback.xml');
            const result = lg.languageGeneration(templates, undefined, testCreate.feedback('hello [SimpleResponse-Empty-Feedback] world'), {});

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('hello  world');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('hello  world');
            });
        });

        describe('All Characters in Feedback', () => {
            const templates = testLoad.templates('simple_feedback.xml');
            const result = lg.languageGeneration(templates, undefined, testCreate.feedback('[SimpleResponse-Characters-Feedback]'), {});

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`"\',.;:/?~!@#$%^&*()-+_+\\|');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`"\',.;:/?~!@#$%^&*()-+_+\\|');
            });
        });

        describe('ConditionalTemplate', () => {
            const codeBehind = { func: (activity, entities) => { return '2'; } };
            const templates = testLoad.templates('conditional.xml');
            const entities = {};
            const result = lg.languageGeneration(templates, codeBehind, testCreate.feedback('The color is [Conditional]'), entities);

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('The color is Green');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('The color is Green');
            });
        });

        describe('ConditionalTemplate with callback', () => {
            it('should have access to activity', () => {
                const activity = { text: '2' };
                const codeBehind = { func: (entities) => { return entities.request.text; } };
                const templates = testLoad.templates('conditional.xml');
                const entities = {request : activity};
                const result = lg.languageGeneration(templates, codeBehind, testCreate.feedback('The color is [Conditional]'), entities, () => { }, activity);
                return result.should.eventually.have.property('text').equal('The color is Green');
            });
        });

        describe('ConditionalTemplate with callback and modality', () => {
            it('should indicate to the code behind the particular modality for the call', () => {
                const activity = { text: '2' };
                let calledForDisplay = 0;
                let calledForSpeak = 0;
                let name = '';
                const codeBehind = { func: (entities) => {
                    name = entities.currentTemplate.name;
                    if (entities.currentTemplate.modalityDisplay) {
                        calledForDisplay++;
                    }
                    if (entities.currentTemplate.modalitySpeak) {
                        calledForSpeak++;
                    }
                    return entities.request.text;
                } };
                const templates = testLoad.templates('conditional_modality.xml');
                const entities = {request : activity};
                const result = lg.languageGeneration(templates, codeBehind, testCreate.feedback('The color is [Conditional]'), entities, () => { }, activity);
                return result.should.eventually.be.fulfilled.then((res) => {
                    expect(calledForDisplay).to.equal(1);
                    expect(calledForSpeak).to.equal(1);
                    expect(name).to.equal('Conditional');
                    return res;
                });
            });
        });

        describe('ConditionalTemplate with Entites', () => {
            const codeBehind = { func: (activity, entities) => { return 'small'; } };
            const templates = testLoad.templates('conditional_entities.xml');
            const entities = { a: 'abc' };
            const result = lg.languageGeneration(templates, codeBehind, testCreate.feedback('She said "[Conditional]"'), entities);

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('She said "abc is a small string"');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('She said "abc is a small string"');
            });
        });

        describe('ConditionalTemplate depending on ConditionalTemplate', () => {
            const codeBehind = {
                func1: (activity, entities) => { return 'small'; },
                func2: (activity, entities) => { return '3'; }
            };
            const templates = testLoad.templates('conditional_dependencies.xml');
            const entities = { a: 'abc', b: 'xyz' };
            const result = lg.languageGeneration(templates, codeBehind, testCreate.feedback('They said "[Conditional1]" {b}'), entities);

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('They said "abc is a small string a b c Blue" xyz');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('They said "abc is a small string a b c Blue" xyz');
            });
        });

        describe('Looping', () => {
            const entities = {};
            const templates = testLoad.templates('loop.xml');
            it('loops should be detected and rejected', () => {
                return lg.languageGeneration(templates, undefined, testCreate.feedback('start([x])'), entities)
                    .should.be.rejectedWith('Template definitions should not contain loops');
            });
        });

        describe('Arbitray Non-Looping Recursive Dependencies', () => {

            const codeBehind = { func: () => { return '2'; } };
            const templates = testLoad.templates('conditional_simple.xml');

            const entities = {};
            const result = lg.languageGeneration(templates, codeBehind, testCreate.feedback('[Conditional]'), entities);

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('green');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('green green');
            });
        });

        describe('Conditional Template Callback Function Problems', () => {

            const result = lg.languageGeneration(testLoad.templates('conditional.xml'), undefined, testCreate.feedback('[Conditional]'), {});

            it('should have text default to the first Case in a Conditional Template if there is no code-behind function provided', () => {
                return result.should.eventually.have.property('text').equal('Red');
            });
            it('should have speak default to the first Case in a Conditional Template if there is no code-behind function provided', () => {
                return result.should.eventually.have.property('speak').equal('Red');
            });

            it('should be rejected because the code being function returns a value that does not match a Conditional Template Case', () => {

                const codeBehind = { func: () => { return 'NOT-A-MATCH'; } };
                const templates = testLoad.templates('conditional.xml');

                return lg.languageGeneration(templates, codeBehind, testCreate.feedback('[Conditional]'), {})
                    .should.be.rejectedWith('The function "func" returned "NOT-A-MATCH" which does not match any of the cases');
            });
        });

        describe('Conditional Template Callback Function throws', () => {

            it('should be rejected because the code being function throw an Error', () => {

                const codeBehind = { func: () => { throw new Error('Error from the code behind function.'); } };
                const templates = testLoad.templates('conditional.xml');

                return lg.languageGeneration(templates, codeBehind, testCreate.feedback('[Conditional]'), {})
                    .should.be.rejectedWith('Error from the code behind function.');
            });
            
            it('should be rejected because the code being function throw undefined', () => {

                const codeBehind = { func: () => { throw undefined; } };
                const templates = testLoad.templates('conditional.xml');

                return lg.languageGeneration(templates, codeBehind, testCreate.feedback('[Conditional]'), {})
                    .should.be.rejectedWith(undefined);
            });
        });

        describe('Conditional Template Callback Function rejects Promise', () => {
            
            it('should be rejected because the code being function rejected a Promise with Error', () => {

                const codeBehind = { func: () => { return Promise.reject(new Error('Error from the code behind function.')); } };
                const templates = testLoad.templates('conditional.xml');

                return lg.languageGeneration(templates, codeBehind, testCreate.feedback('[Conditional]'), {})
                    .should.be.rejectedWith('Error from the code behind function.');
            });
            
            it('should be rejected because the code being function rejected with undefined', () => {

                const codeBehind = { func: () => { throw undefined; } };
                const templates = testLoad.templates('conditional.xml');

                return lg.languageGeneration(templates, codeBehind, testCreate.feedback('[Conditional]'), {})
                    .should.be.rejectedWith(undefined);
            });
        });
                    
        describe('Missing referenced Templates in Template Definitions', () => {

            it('should be rejected because the root Feedback references a Template that is missing', () => {

                const codeBehind = { func1: () => { return 'small'; }, func2: () => { return '2'; } };
                const templates = testLoad.templates('conditional_dependencies.xml');

                return lg.languageGeneration(templates, codeBehind, testCreate.feedback('[This-Template-Is-Missing]'), {})
                    .should.be.rejectedWith('Template "This-Template-Is-Missing" is not defined.');
            });

            it('should be rejected because a Template references another Template that is missing', () => {

                const codeBehind = { func1: () => { return 'small'; }, func2: () => { return '2'; } };
                const templates = testLoad.templates('missing_dependencies.xml');

                return lg.languageGeneration(templates, codeBehind, testCreate.feedback('[Conditional]'), {})
                    .should.be.rejectedWith('Template "Simple-Missing" is not defined.');
            });
        });

        describe('Missing referenced Entities in Template Definitions', () => {

            const templates = testLoad.templates('missing_entities.xml');

            const result = lg.languageGeneration(templates, undefined, testCreate.feedback('[SimpleResponseRGB]'), {});

            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text (with zero length strings substituted for values)', () => {
                return result.should.eventually.have.property('text').equal('"r": "", "g": "", "b": ""');
            });
            it('should have speak (with zero length strings substituted for values)', () => {
                return result.should.eventually.have.property('speak').equal('"r": "", "g": "", "b": ""');
            });
        });

        describe('Duplicate template names', () => {

            it('expect agent file processing to throw if more than one Template has the same name', () => {
                expect(() => { testLoad.templates('duplicate_template_names.xml', {}); }).to.throw('Template name "SimpleResponse" is not unique.');
            });
        });

        describe('Duplicate case names', () => {

            const codeBehind = { func: () => { return 'x'; } };

            it('expect agent file processing to throw if more than one Conditional Template Case has the same name', () => {
                expect(() => { testLoad.templates('duplicate_case_names.xml'); }).to.throw('The Case value "x" is not unique on Template "Conditional".');
            });
        });

        describe('Rade entity structure', () => {
            const feedback = {
                'type': 'Feedback',
                'value': '[Conditional1]'
            };

            const templates = {
                'Conditional1': {
                    'type': 'ConditionalResponseTemplate',
                    'cases': {
                        'small': {
                            'type': 'Feedback', 'value': '{a} is a small string'
                        }, 'medium': {
                            'type': 'Feedback', 'value': '{a} is a medium sized string'
                        }, 'large': {
                            'type': 'Feedback', 'value': '{a} is a large string'
                        }
                    },
                    onRun: 'func'
                }
            };

            const codeBehind = { func: function func(conversationContext) {
                var a = conversationContext.taskEntities.a;
                var entity = a[0].value;
                if (entity.length < 2 && conversationContext.request.text.length < 2) {
                    return 'small';
                }
                else if (entity.length >= 2 && entity.length < 4) {
                    return 'medium';
                }
                return 'large';
            } };

            const entities = {
                'taskEntities': {
                    'a': [
                        {
                            'type': 'a',
                            'value': 'aaaa'
                        }
                    ]
                },
                'global': {

                },
                'phraseListOverrides': {
                }
            };

            const accessor = function (entities) {
                return function (name) {
                    var entityValue = 'debug:undefined';
                    if (entities.taskEntities !== undefined
            && entities.taskEntities[name] !== undefined
            && Array.isArray(entities.taskEntities[name])
            && entities.taskEntities[name].length > 0) {
                        entityValue = entities.taskEntities[name][0].value;
                    }
                    return entityValue;
                };
            };

            entities.request = {};

            const result = lg.languageGeneration(templates, codeBehind, feedback, entities, accessor, {});
            it('should work with accessor and template onRun', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
        });
    });
});