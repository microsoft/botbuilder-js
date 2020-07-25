

const {Dialog } = require('botbuilder-dialogs');
const assert = require('assert');

const templateText = "test activity";
const messageActivity = {
    type: 'message',
    text: 'test activity',
    recipient: 'UK8CH2281:TKGSUQHQE',
    from: 'BKGSYSTFG:TKGSUQHQE',
    locale: 'en-us'
};

const lgTelemetryData = {
    name : 'GeneratorResult',
    properties: {
        template : templateText,
        result : messageActivity
    }
};

class MockTelemetryClient {
    constructor() {
        this.telemetry = {};
    }
    
    trackEvent(t) {
        this.telemetry = t;
    }
}

class MockDialog extends Dialog {
    async beginDialog(dc, options) {
        this.telemetryClient.trackEvent(lgTelemetryData);
    }
}

describe('ActivityFactoryTest', function() {

    it('basic telemetry test', () => {
        const mockDialog = new MockDialog();
        mockDialog.telemetryClient = new MockTelemetryClient();
        mockDialog.beginDialog();
        const telemetry = mockDialog.telemetryClient.telemetry;
        assert.strictEqual(telemetry.name, 'GeneratorResult');
        assert.strictEqual(telemetry.properties.template, 'test activity');
        assert.strictEqual(telemetry.properties.result.text, 'test activity');
    });
});

