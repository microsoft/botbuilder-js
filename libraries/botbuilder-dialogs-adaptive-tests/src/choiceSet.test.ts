/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import { TestRunner, AssertReply } from './testing';
import { Choice } from 'botbuilder-dialogs';
import { ObjectExpression } from 'botbuilder-dialogs-adaptive';
import { ChoiceSet } from 'botbuilder-dialogs-adaptive/lib/input/choiceSet';
import * as assert from 'assert';

interface Bar {
    choices: ChoiceSet;
}

describe('ChoiceSetTests', function () {
    this.timeout(10000);

    it('TestExpression', async () => {
        const state = {
            choices: [
                { value: "test1" } as Choice,
                { value: "test2" } as Choice,
                { value: "test3" } as Choice,
            ]
        }
        const ep = new ObjectExpression<ChoiceSet>("choices");
        const { value, error } = ep.tryGetValue(state);
        assert.equal('test1', value[0].value);
        assert.equal('test2', value[1].value);
        assert.equal('test3', value[2].value);
    });

    it('TestValue', async () => {
        const state = {}
        const ep = new ObjectExpression<ChoiceSet>(new ChoiceSet([{ value: 'test1' }, { value: 'test2' }, { value: 'test3' }]));
        const { value, error } = ep.tryGetValue(state);
        assert.equal('test1', value[0].value);
        assert.equal('test2', value[1].value);
        assert.equal('test3', value[2].value);
    });

    it('TestStringArrayAccess', async () => {
        const state = {}
        const stringArr = ['test1', 'test2', 'test3']
        const ep = new ObjectExpression<ChoiceSet>(new ChoiceSet(stringArr));
        const { value, error } = ep.tryGetValue(state);
        assert.equal('test1', value[0].value);
        assert.equal('test2', value[1].value);
        assert.equal('test3', value[2].value);
    });

    it('TestConverterExpressionAccess', async () => {
        const state = {
            test: [
                { value: "test1" } as Choice,
                { value: "test2" } as Choice,
                { value: "test3" } as Choice,
            ]
        }

        const sample = {
            choices: 'test'
        }

        const ep = new ObjectExpression<ChoiceSet>(sample.choices);
        const { value, error } = ep.tryGetValue(state);
        assert.equal('test1', value[0].value);
        assert.equal('test2', value[1].value);
        assert.equal('test3', value[2].value);
    });

    it('TestConvertObjectAccess', async () => {
        const state = {}

        const sample = {
            choices: [
                { value: 'test1' },
                { value: 'test2' },
                { value: 'test3' }
            ]
        }

        const json = JSON.stringify(sample)
        const bar = JSON.parse(json) as Bar
        
        // TS doesn't run 'new' automatically unlike C#
        const choicesBar = new ObjectExpression<ChoiceSet>(bar.choices);
        const { value, error } = choicesBar.tryGetValue(state);
        assert.equal('test1', value[0].value);
        assert.equal('test2', value[1].value);
        assert.equal('test3', value[2].value);
    });

    it('TestConvertStringAccess', async () => {
        const state = {}

        const sample = {
            choices: [
                'test1',
                'test2',
                'test3',
            ]
        }

        const json = JSON.stringify(sample)
        const bar = JSON.parse(json) as Bar
        bar.choices = new ChoiceSet(bar.choices)

        // TS doesn't run 'new' automatically unlike C#
        const choicesBar = new ObjectExpression<ChoiceSet>(bar.choices);
        const { value, error } = choicesBar.tryGetValue(state);
        assert.equal('test1', value[0].value);
        assert.equal('test2', value[1].value);
        assert.equal('test3', value[2].value);
    });

    it('TestConvertStringArray', async () => {
        const state = {}

        const sample = []
        sample.push('test1')
        sample.push('test2')
        sample.push('test3')

        const json = JSON.stringify(sample)
        const value = new ChoiceSet(JSON.parse(json))

        assert.equal('test1', value[0].value);
        assert.equal('test2', value[1].value);
        assert.equal('test3', value[2].value);
    });
});