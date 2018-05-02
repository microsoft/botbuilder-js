/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = class ConversationAccount {
    /**
     * @property isGroup
     */
    /**
     * @property name
     */

    /**
     * @property id
     */

    /**
     *
     * @param isGroup
     * @param name
     * @param id
     */
    constructor({isGroup, name, id} = {}) {
        Object.assign(this, {isGroup, name, id});
    }
};
