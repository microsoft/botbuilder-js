/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
    name: 'EchoBot',
    url: function(){
        return this.api.launchUrl;
    },
    elements: {
        webchatContainer: {
            selector: 'div[id=webchat]>div',
        },
        webchatMessagesList: {
            selector: 'section.webchat__basic-transcript__transcript',
        },
        webchatMessageInput: {
            selector: 'input[data-id=webchat-sendbox-input]',
        },
        webchatMessageInputSubmitButton: {
            selector: 'button.webchat__send-button',
        },
    },
};
