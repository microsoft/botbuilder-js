/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

class TestRequest {
    constructor() {
        let headers = [];
    }

    isUpgradeRequest() {
        return this.upgradeRequestVal;
    }

    setIsUpgradeRequest(value) {
        this.upgradeRequestVal = value;
    }

    status() {
        return this.statusVal;
    }

    status(value) {
        this.statusVal = value;
    }

    path(value) {
        this.pathVal = value;
    }

    path() {
        return this.pathVal;
    }

    verb(value) {
        this.verbVal = value;
    }

    verb() {
        return this.verbVal;
    }

    streams(value) {
        this.streamsVal = value;
    }

    streams() {
        return this.streamsVal;
    }

    setHeaders() {
        return this.headersVal;
    }

    setHeaders(value) {
        this.headers = value;
    }

}

module.exports.TestRequest = TestRequest;