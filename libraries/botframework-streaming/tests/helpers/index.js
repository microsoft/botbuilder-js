/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { FauxSock } = require('./fauxSock');
const { FauxSocket } = require('./fauxSocket');
const { sleep } = require('./sleep');
const { TestRequest } = require('./testRequest');
const { waitFor } = require('./waitFor');

module.exports.FauxSock = FauxSock;
module.exports.FauxSocket = FauxSocket;
module.exports.sleep = sleep;
module.exports.TestRequest = TestRequest;
module.exports.waitFor = waitFor;
