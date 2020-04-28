/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as assert from 'assert';
import { DialogExpression, AdaptiveDialog } from '../';

describe('expressionProperty tests', () => {
    it('DialogExpression', () => {
        const dialog = new AdaptiveDialog('AskNameDialog');
        const data = { test: dialog };
        let val = new DialogExpression('=test');
        let result = val.getValue(data);
        assert.equal(result, dialog);

        val = new DialogExpression('test');
        result = val.getValue(data);
        assert.equal(result, 'test');

        val = new DialogExpression(dialog);
        result = val.getValue(data);
        assert.equal(result, dialog);
    });

});