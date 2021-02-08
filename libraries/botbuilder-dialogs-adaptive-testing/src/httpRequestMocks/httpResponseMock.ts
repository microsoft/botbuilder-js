/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Types of response content.
 */
export enum ResponseContentType {
    String = 'String',
    ByteArray = 'ByteArray',
}

/**
 * Response status codes.
 */
export enum ResponseStatusCode {
    Continue = 100,
    SwitchingProtocols = 101,
    OK = 200,
    Created = 201,
    Accepted = 202,
    NonAuthoritativeInformation = 203,
    NoContent = 204,
    ResetContent = 205,
    PartialContent = 206,
    Ambiguous = 300,
    MultipleChoices = 300,
    Moved = 301,
    MovedPermanently = 301,
    Found = 302,
    Redirect = 302,
    RedirectMethod = 303,
    SeeOther = 303,
    NotModified = 304,
    UseProxy = 305,
    Unused = 306,
    RedirectKeepVerb = 307,
    TemporaryRedirect = 307,
    BadRequest = 400,
    Unauthorized = 401,
    PaymentRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    NotAcceptable = 406,
    ProxyAuthenticationRequired = 407,
    RequestTimeout = 408,
    Conflict = 409,
    Gone = 410,
    LengthRequired = 411,
    PreconditionFailed = 412,
    RequestEntityTooLarge = 413,
    RequestUriTooLong = 414,
    UnsupportedMediaType = 415,
    RequestedRangeNotSatisfiable = 416,
    ExpectationFailed = 417,
    UpgradeRequired = 426,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
    HttpVersionNotSupported = 505,
}

/**
 * Http response content.
 */
export type ResponseContent = string | Record<string, unknown>;

/**
 * Http response mock used in HttpRequestSequenceMock.
 */
export interface HttpResponseMock {
    /**
     * The status code.
     */
    statusCode?: ResponseStatusCode;

    /**
     * The reason phrase. (Not supported yet)
     */
    reasonPhrase?: string;

    /**
     * The content type.
     */
    contentType?: ResponseContentType;

    /**
     * The content.
     */
    content: ResponseContent;
}

/**
 * Http response message.
 */
export interface HttpResponseMessage {
    statusCode: ResponseStatusCode;
    content: ResponseContent;
}
