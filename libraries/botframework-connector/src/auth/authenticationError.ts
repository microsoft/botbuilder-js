/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IStatusCodeError, StatusCodes } from 'botframework-schema';

export type StatusCode = number;

export class AuthenticationError extends Error implements IStatusCodeError {
    constructor(
        message: string,
        public readonly statusCode: StatusCode
    ) {
        super(message);
    }

    public static isStatusCodeError(err: any): err is IStatusCodeError {
        return !!(err && typeof err.statusCode === "number");
    }

    /**
     * Used to determine a status code from the error message for non-`IStatusCodeError`'s.
     * @param err The error thrown, used to determine an appropriate status code.
     */
    public static determineStatusCodeAndBuildMessage(err: any): string {
        const errMessage: string = (err && err.message) ? err.message : 'Internal Server Error';
        const code: number = AuthenticationError.determineStatusCode(errMessage);
        const connectionHeader = `Connection: 'close'\r\n`;
        
        return `HTTP/1.1 ${ code } ${ StatusCodes[code] }\r\n${ errMessage }\r\n${ connectionHeader }\r\n`;
    }
    
    private static determineStatusCode(message: string): StatusCode {
        if (typeof message === 'string') {
            if (message.toLowerCase().startsWith('unauthorized')) {
                return StatusCodes.UNAUTHORIZED;
            } else if (message.toLowerCase().startsWith(`'authheader'`)) {
                return StatusCodes.BAD_REQUEST;
            } 
        }
        return StatusCodes.INTERNAL_SERVER_ERROR;
    }

}