// Copyright (c) Microsoft Corporation. All rights reserved.

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const dialogFlow = require('../index.js');

//chai.Assertion.includeStack = true;
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiAsPromised);
chai.should();

describe('No Network', () => {
    describe('DialogFlow', () => {
        describe('Single Response', () => {

            const metadata = require('./data/singleResponse.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};
            const codeBehind = {};
            const context = { local: {}, responses: [] };

            const result = dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context).then((res) => {
                context.responses.should.be.an('array').lengthOf(1);
                context.responses[0].should.have.property('text', 'hello');
                context.responses[0].should.have.property('speak', 'hello');
                return res;
            });

            it('should succeed with status complete', () => {
                return result.should.eventually.have.property('status', 'complete');
            });
        });
        describe('Single Response with beforeResponse code behind', () => {
            
            const metadata = require('./data/respondBeforeResponse.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};
            const codeBehind = { 
                beforeResponseFunc: (context) => {
                    var response = context.responses.slice(-1).pop();
                    context.responses[context.responses.length - 1].text = '((((' + response.text + '))))';
                }
            };
            const context = { local: {}, responses: [] };

            const result = dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context).then((res) => {
                context.responses.should.be.an('array').lengthOf(1);
                context.responses[0].should.have.property('text', '((((hello))))');
                context.responses[0].should.have.property('speak', 'hello');
                return res;
            });

            it('should succeed with status complete', () => {
                return result.should.eventually.have.property('status', 'complete');
            });
        });
        describe('Single Response with beforeResponse errors', () => {
            
            const metadata = require('./data/respondBeforeResponse.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};
            const context = { local: {}, responses: [] };

            it('should be rejected because the code behind function threw an Error', () => {
                const codeBehind = { beforeResponseFunc: (context) => {
                    throw new Error('This is an error from code behind.');
                } };
                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith('This is an error from code behind.');
            });
            it('should be rejected because the code behind function threw undefined', () => {
                const codeBehind = { beforeResponseFunc: (context) => {
                    throw undefined;
                } };
                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith(undefined);
            });
            it('should be rejected because the code behind function rejected with an Error', () => {
                const codeBehind = { beforeResponseFunc: (context) => {
                    return Promise.reject(new Error('This is an error from code behind.'));
                } };
                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith('This is an error from code behind.');
            });
            it('should be rejected because the code behind function rejected with undefined', () => {
                const codeBehind = { beforeResponseFunc: (context) => {
                    return Promise.reject();
                } };
                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith(undefined);
            });
        });
        describe('Single Process', () => {
            
            const metadata = require('./data/singleProcess.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};
            const codeBehind = {
                func: (context) => {}
            };
            const context = { local: {}, responses: [] };

            const result = dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context).then((res) => {
                context.responses.should.be.an('array').lengthOf(0);
                return res;
            });

            it('should succeed with status complete', () => {
                return result.should.eventually.have.property('status', 'complete');
            });
        });
        describe('Single Process with responses from code behind', () => {
            
            const metadata = require('./data/singleProcess.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};
            const codeBehind = {
                func: (context) => { context.responses.push({ text: 'hello', speak: 'hi' }); }
            };
            const context = { local: {}, responses: [] };

            const result = dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context).then((res) => {
                context.responses.should.be.an('array').lengthOf(1);
                context.responses[0].should.have.property('text', 'hello');
                context.responses[0].should.have.property('speak', 'hi');
                return res;
            });

            it('should succeed with status complete', () => {
                return result.should.eventually.have.property('status', 'complete');
            });
        });
        describe('Single Process with code behind errors', () => {
            
            const metadata = require('./data/singleProcess.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};
            const context = { local: {}, responses: [] };

            it('should be rejected because the code behind function threw an Error', () => {

                const codeBehind = {
                    func: (context) => { throw new Error('Error from the code behind function.'); }
                };
                    
                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith('Error from the code behind function.');
            });
            it('should be rejected because the code behind function threw undefined', () => {

                const codeBehind = {
                    func: (context) => { throw undefined; }
                };
                
                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith(undefined);
            });
            it('should be rejected because the code behind function rejected with an Error', () => {

                const codeBehind = {
                    func: (context) => { return Promise.reject(new Error('Error from the code behind function.')); }
                };
                    
                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith('Error from the code behind function.');
            });
            it('should be rejected because the code behind function rejected with undefined', () => {

                const codeBehind = {
                    func: (context) => { return Promise.reject(); }
                };
                    
                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith(undefined);
            });
        });
        describe('Prompt and Response', () => {
            
            const metadata = require('./data/promptResponse.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};
            const codeBehind = {
                recognize_entity_a: (context) => { 
                    context.local.a =  context.request.text;
                    return true;
                }
            };

            it('should succeed', () => {
                
                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .then((result) => {

                        result.should.have.property('status', 'continue');

                        context.responses.should.be.an('array').lengthOf(1);
                        context.responses[0].should.have.property('text', 'prompt 1: type a value for a');
                        context.responses[0].should.have.property('speak', 'prompt 1: type a value for a');
                        
                        context.should.have.property('flow');
                        context.flow.should.have.property('stack');
                        context.flow.stack.should.be.an('array').length(1);
                        context.flow.stack[0].should.have.property('type', 'PromptFrame');
                        context.flow.stack[0].should.have.property('dialogFlowName', 'Dialog Flow');
                        context.flow.stack[0].should.have.property('stateName', 'Prompt');
                        context.flow.stack[0].should.have.property('turn', 0);
                        
                        context.responses = [];
                        context.request = { text: '42' };

                        return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context); 
                    })
                    .then((result) => {

                        result.should.have.property('status', 'complete');

                        context.responses.should.be.an('array').lengthOf(1);
                        context.responses[0].should.have.property('text', 'you said 42');
                        context.responses[0].should.have.property('speak', 'you said 42');
                        
                        context.should.have.property('flow');
                        context.flow.should.have.property('stack');
                        context.flow.stack.should.be.an('array').lengthOf(0);
                    })
                    .should.eventually.be.fulfilled;
            });
        });
        describe('Prompt code recognizer errors', () => {
            
            const metadata = require('./data/promptResponse.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};

            it('should be rejected because the code recognizer threw an Error', () => {

                const codeBehind = {
                    recognize_entity_a: (context) => {
                        throw new Error('This is an error from the code behind.');
                    }
                };
                    
                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .then((result) => {
                   
                        result.should.have.property('status', 'continue');
                        
                        context.responses = [];
                        context.request = { text: '42' };

                        return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context); 
                    })
                    .should.be.rejectedWith('This is an error from the code behind.');
            });
            it('should be rejected because the code recognizer threw undefined', () => {
                
                const codeBehind = {
                    recognize_entity_a: (context) => {
                        throw undefined;
                    }
                };
                    
                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .then((result) => {
                    
                        result.should.have.property('status', 'continue');
                        
                        context.responses = [];
                        context.request = { text: '42' };

                        return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context); 
                    })
                    .should.be.rejectedWith();
            });
            it('should be rejected because the code recognizer rejected with an Error', () => {

                const codeBehind = {
                    recognize_entity_a: (context) => {
                        return Promise.reject(new Error('This is an error from the code behind.'));
                    }
                };
                    
                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .then((result) => {
                   
                        result.should.have.property('status', 'continue');
                        
                        context.responses = [];
                        context.request = { text: '42' };

                        return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context); 
                    })
                    .should.be.rejectedWith('This is an error from the code behind.');
            });
            it('should be rejected because the code recognizer rejected with undefined', () => {
                
                const codeBehind = {
                    recognize_entity_a: (context) => {
                        return Promise.reject();
                    }
                };
                    
                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .then((result) => {
                    
                        result.should.have.property('status', 'continue');
                        
                        context.responses = [];
                        context.request = { text: '42' };

                        return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context); 
                    })
                    .should.be.rejectedWith();
            });
        });
        describe('Prompt with beforeResponse', () => {
            
            const metadata = require('./data/promptBeforeResponse.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};
            const codeBehind = {
                recognize_entity_a: (context) => { 
                    context.local.a = context.request.text;
                    return true;
                },
                promptBeforeResponseFunc: (context) => {
                    var response = context.responses.slice(-1).pop();
                    context.responses[context.responses.length - 1].text = '((((' + response.text + '))))';
                },
                respondBeforeResponseFunc: (context) => {
                    var response = context.responses.slice(-1).pop();
                    context.responses[context.responses.length - 1].text = '[[[[' + response.text + ']]]]';
                }
            };

            it('should succeed', () => {
                
                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .then((result) => {

                        result.should.have.property('status', 'continue');

                        context.responses.should.be.an('array').lengthOf(1);
                        context.responses[0].should.have.property('text', '((((prompt 1: type a value for a))))');
                        context.responses[0].should.have.property('speak', 'prompt 1: type a value for a');
                        
                        context.should.have.property('flow');
                        context.flow.should.have.property('stack');
                        context.flow.stack.should.be.an('array').lengthOf(1);
                        context.flow.stack[0].should.have.property('type', 'PromptFrame');
                        context.flow.stack[0].should.have.property('dialogFlowName', 'Dialog Flow');
                        context.flow.stack[0].should.have.property('stateName', 'Prompt');
                        context.flow.stack[0].should.have.property('turn', 0);
                        
                        context.responses = [];
                        context.request = { text: '42' };

                        return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context); 
                    })
                    .then((result) => {

                        result.should.have.property('status', 'complete');

                        context.responses.should.be.an('array').lengthOf(1);
                        context.responses[0].should.have.property('text', '[[[[you said 42]]]]');
                        context.responses[0].should.have.property('speak', 'you said 42');
                        
                        context.should.have.property('flow');
                        context.flow.should.have.property('stack');
                        context.flow.stack.should.be.an('array').length(0);
                    });
            });
        });
        describe('Prompt with promptWhen code behind', () => {
            
            const metadata = require('./data/promptWhen.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};
            const codeBehind = {
                recognize_entity_a: (context) => { 
                    context.local.a = context.request.text;
                    return true;
                },
                promptWhenFunc: (context) => {
                    return !('a' in context.local);
                },
            };

            it('should succeed', () => {
                
                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .then((result) => {

                        result.should.have.property('status', 'continue');

                        context.responses.should.be.an('array').lengthOf(1);
                        context.responses[0].should.have.property('text', 'prompt 1: type a value for a');
                        context.responses[0].should.have.property('speak', 'prompt 1: type a value for a');
                        
                        context.should.have.property('flow');
                        context.flow.should.have.property('stack');
                        context.flow.stack.should.be.an('array').lengthOf(1);
                        context.flow.stack[0].should.have.property('type', 'PromptFrame');
                        context.flow.stack[0].should.have.property('dialogFlowName', 'Dialog Flow');
                        context.flow.stack[0].should.have.property('stateName', 'Prompt');
                        context.flow.stack[0].should.have.property('turn', 0);
                        
                        context.responses = [];
                        context.request = { text: '42' };

                        return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context); 
                    })
                    .then((result) => {

                        result.should.have.property('status', 'complete');

                        context.responses.should.be.an('array').lengthOf(1);
                        context.responses[0].should.have.property('text', 'you said 42');
                        context.responses[0].should.have.property('speak', 'you said 42');
                        
                        context.should.have.property('flow');
                        context.flow.should.have.property('stack');
                        context.flow.stack.should.be.an('array').lengthOf(0);
                    });
            });
        });
        describe('Prompt with promptWhen code behind errors', () => {
            
            const metadata = require('./data/promptWhen.json');
            const templates = {};
            const cards = {};
            const sharedDialogFlows = {};
            const codeBehind = {
                recognize_entity_a: (context) => { 
                    context.local.a = context.request.text;
                    return true;
                }
            };

            it('should be rejected because the code behind threw an Error', () => {

                codeBehind.promptWhenFunc = (context) => {
                    throw new Error('This is an error from the code behind.');
                };

                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith('This is an error from the code behind.');
            });
            it('should be rejected because the code behind threw undefined', () => {
                
                codeBehind.promptWhenFunc = (context) => {
                    throw undefined;
                };

                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith(undefined);
            });
            it('should be rejected because the code behind rejected with an Error', () => {
                
                codeBehind.promptWhenFunc = (context) => {
                    return Promise.reject(new Error('This is an error from the code behind.'));
                };

                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith('This is an error from the code behind.');
            });
            it('should be rejected because the code behind rejected with undefined', () => {
                
                codeBehind.promptWhenFunc = (context) => {
                    return Promise.reject();
                };

                const context = { local: {}, responses: [] };

                return dialogFlow.run('Test', metadata, templates, cards, sharedDialogFlows, codeBehind, context)
                    .should.be.rejectedWith(undefined);
            });
        });
    });
});
