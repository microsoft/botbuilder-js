// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Simple object used by the user state property accessor.
 * Used to store the user state.
 */
class UserProfile {
    constructor(location, time, partySize) {
        this.location = location;
        this.time = time;
        this.partySize = partySize;
    }
}

module.exports.UserProfile = UserProfile;
