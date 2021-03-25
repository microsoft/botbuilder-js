/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const { OrchestratorAdaptiveRecognizer, LabelType } = require('../lib');
class MockResolver {
    constructor(score, entityScore) {
        this._score = score;
        this._entityScore = entityScore;
    }

    score(_text, labelType = LabelType.Intent) {
        if (labelType === LabelType.Intent) {
            return this._score;
        }
        else if (labelType === LabelType.Entity) {
            return this._entityScore;
        }
        
        throw new Error('Not supported!');
    }
}

class TestAdapterSettings {
    constructor(appId, appPassword) {
        this.appId = appId;
        this.appPassword = appPassword;
    }
}

module.exports = { MockResolver, TestAdapterSettings };
