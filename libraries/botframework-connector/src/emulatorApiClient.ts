import { MicrosoftAppCredentials } from "./auth/microsoftAppCredentials";
import * as request from 'request';

export class EmulatorApiClient {
    public static async emulateOAuthCards(credentials: MicrosoftAppCredentials, emulatorUrl: string, emulate: boolean): Promise<boolean> {
        let token = await credentials.getToken();
        return new Promise<boolean>((resolve: any, reject: any): void => {
            let requestUrl: string = emulatorUrl + (emulatorUrl.endsWith('/') ? '' : '/') + `api/usertoken/emulateOAuthCards?emulate=${(!!emulate).toString()}`;

            const opt: request.Options = {
                method: 'POST',
                url: requestUrl,
                auth: {
                    bearer: token
                }
            };

            request(opt, (err: any, response: any, body: any) => {
               if (response.statusCode && response.statusCode < 300) {
                    resolve(true);
                } else {
                    reject(new Error(`EmulateOAuthCards failed with status code: ${ response.statusCode }`));
                }
            });
        });
    }
}

