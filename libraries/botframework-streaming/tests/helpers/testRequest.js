/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

class TestRequest {
    constructor() {
        this.method = 'GET';
    }

    isUpgradeRequest() {
        return this.upgradeRequestVal;
    }

    setIsUpgradeRequest(value) {
        // `ws` specific check
        this.method = 'GET';
        this.upgradeRequestVal = value;
    }

    get status() {
        return this.statusVal;
    }

    set status(value) {
        this.statusVal = value;
    }

    set path(value) {
        this.pathVal = value;
    }

    get path() {
        return this.pathVal;
    }

    set verb(value) {
        this.verbVal = value;
    }

    get verb() {
        return this.verbVal;
    }

    set streams(value) {
        this.streamsVal = value;
    }

    get streams() {
        return this.streamsVal;
    }

    get setHeaders() {
        return this.headersVal;
    }

    set setHeaders(value) {
        this.headers = value;
    }
}

module.exports.TestRequest = TestRequest;
