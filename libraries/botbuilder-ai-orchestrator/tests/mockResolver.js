/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const { LabelType } = require('../lib');
class MockResolver {
    constructor(score, entityScore) {
        this._score = score;
        this._entityScore = entityScore;
    }

    score(_text, labelType = LabelType.Intent) {
        switch (labelType) {
            case LabelType.Intent:
                return this._score;
            case LabelType.Entity:
                return this._entityScore;
            default:
                throw new Error('Label type not supported!');
        }
    }
}

class TestAdapterSettings {
    constructor(appId, appPassword) {
        this.appId = appId;
        this.appPassword = appPassword;
    }
}

module.exports = { MockResolver, TestAdapterSettings };
