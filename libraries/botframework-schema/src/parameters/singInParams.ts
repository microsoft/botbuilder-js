import { RequestOptions } from "..";

export interface SignInParams extends RequestOptions {
    channelId?: string;
    codeChallenge?: string;
    emulatorUrl?: string;
    finalRedirect?: string;
}
