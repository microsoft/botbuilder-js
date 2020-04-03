/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IStatusCodeError, StatusCodes } from 'botframework-schema';

export type StatusCode = number;

export class AuthenticationError extends Error implements IStatusCodeError {
    constructor(
        public readonly message: string,
        public readonly statusCode: StatusCode
    ) {
        super(message);
    }

    public static isStatusCodeError(err: any): err is IStatusCodeError {
        return err && err.statusCode && typeof err.statusCode === "number";
    }

    public static determineStatusCodeAndBuildMessage(err: any): string {
        let code: number;
        let errMessage = err.message || 'Internet Server Error';
        const connectionHeader = `Connection: 'close'\r\n`;
        
        let builtMessage = '';
        code = AuthenticationError.determineStatusCode(errMessage);
        builtMessage = `HTTP/1.1 ${ code } ${ StatusCodes[code] }\r\n${ errMessage }\r\n${ connectionHeader }\r\n`;
        
        return builtMessage;
    }
    
    private static determineStatusCode(message: string): StatusCodes {
        if (typeof(message) === 'string') {
            if (message.toLowerCase().startsWith('unauthorized')) {
                return 401;
            } else if (message.toLowerCase().startsWith(`'authheader'`)) {
                return 400;
            } 
        }
        return 500;
    }

}