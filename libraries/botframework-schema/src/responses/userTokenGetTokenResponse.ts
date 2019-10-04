import http = require('http');
import { TokenResponse } from "..";

/**
 * Contains response data for the getToken operation.
 */
export declare type UserTokenGetTokenResponse = TokenResponse & {
    /**
     * The underlying HTTP response.
     */
    _response: CustomResponse
};

declare type CustomResponseNoStatus = http.IncomingMessage & {
    /**
     * The response body as text (string format)
     */
    bodyAsText: string;
    /**
     * The response body as parsed JSON or XML
     */
    parsedBody: TokenResponse;
};

type Rename<T, K extends keyof T, N extends string> = Pick<T, Exclude<keyof T, K>> & { [P in N]: T[K] }

declare type CustomResponse = Rename<CustomResponseNoStatus, 'statusCode', 'status'>