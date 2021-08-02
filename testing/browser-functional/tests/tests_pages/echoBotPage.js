/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const path = require('path');
const dotenv = require('dotenv');
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

module.exports = {
    url: process.env.TestURI,
    elements: {
        webchatContainer: {
            selector: 'div[id=webchat]>div'
        },
        webchatMessagesList: {
            selector: 'ul p'
        },
        webchatMessageInput: {
            selector: 'input[data-id=webchat-sendbox-input]'
        },
        webchatMessageInputSubmitButton: {
            selector: 'div.main > div:nth-child(3) > button'
        }
    }
}