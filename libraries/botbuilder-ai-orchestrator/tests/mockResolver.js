/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class MockResolver {
    constructor(score)
    {
        this._score = score;
    }

    score(text) 
    {
        return this._score;
    }
}

class TestAdapterSettings {
    constructor(appId, appPassword) {
        this.appId = appId;
        this.appPassword = appPassword;
    }
}

module.exports = {MockResolver, TestAdapterSettings};