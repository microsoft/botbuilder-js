const { QnAMakerDialog } = require('../lib');
const { DialogSet } = require('botbuilder-dialogs');
const assert = require('assert');



describe('QnAMakerDialog', function() {

    it('should add instance to a dialog set', async function(done) {
        const dialogs = new DialogSet();
        const qna = new QnAMakerDialog();

        dialogs.add(qna);
        done();

    });
});