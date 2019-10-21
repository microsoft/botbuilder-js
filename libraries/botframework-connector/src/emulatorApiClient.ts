/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AppCredentials } from "./auth/appCredentials";

export class EmulatorApiClient {
    public static async emulateOAuthCards(credentials: AppCredentials, emulatorUrl: string, emulate: boolean): Promise<boolean> {
        let token = await credentials.getToken();
        let requestUrl: string = emulatorUrl + (emulatorUrl.endsWith('/') ? '' : '/') + `api/usertoken/emulateOAuthCards?emulate=${ (!!emulate).toString() }`;

        const res = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${ token }`
            }
        });

        if (res.ok) {
            return true;
        } else {
            throw new Error(`EmulateOAuthCards failed with status code: ${ res.status }`);
        }
    }
}