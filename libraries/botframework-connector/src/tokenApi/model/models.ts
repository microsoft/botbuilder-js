export * from './aadResourceUrls';
export * from './errorResponse';
export * from './innerHttpError';
export * from './modelError';
export * from './tokenResponse';
export * from './tokenStatus';

import { AadResourceUrls } from './aadResourceUrls';
import { ErrorResponse } from './errorResponse';
import { InnerHttpError } from './innerHttpError';
import { ModelError } from './modelError';
import { TokenResponse } from './tokenResponse';
import { TokenStatus } from './tokenStatus';

/* tslint:disable:no-unused-variable */
let primitives = [
                    "string",
                    "boolean",
                    "double",
                    "integer",
                    "long",
                    "float",
                    "number",
                    "any"
                 ];
                 
let enumsMap: {[index: string]: any} = {
}

let typeMap: {[index: string]: any} = {
    "AadResourceUrls": AadResourceUrls,
    "ErrorResponse": ErrorResponse,
    "InnerHttpError": InnerHttpError,
    "ModelError": ModelError,
    "TokenResponse": TokenResponse,
    "TokenStatus": TokenStatus,
}

export class ObjectSerializer {
    public static findCorrectType(data: any, expectedType: string) {
        if (data == undefined) {
            return expectedType;
        } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        } else if (expectedType === "Date") {
            return expectedType;
        } else {
            if (enumsMap[expectedType]) {
                return expectedType;
            }

            if (!typeMap[expectedType]) {
                return expectedType; // w/e we don't know the type
            }

            // Check the discriminator
            let discriminatorProperty = typeMap[expectedType].discriminator;
            if (discriminatorProperty == null) {
                return expectedType; // the type does not have a discriminator. use it.
            } else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if(typeMap[discriminatorType]){
                        return discriminatorType; // use the type given in the discriminator
                    } else {
                        return expectedType; // discriminator did not map to a type
                    }
                } else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }

}