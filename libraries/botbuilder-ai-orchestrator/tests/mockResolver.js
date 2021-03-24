/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

class MockResolver {
    constructor(score, entityScore = null) {
        this._score = score;
        this._entityScore 
    }

    score(_text, labelType = 1) {
        if (labelType == 1) {
            return this._score;
        }
        else if (labelType == 2) {
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
