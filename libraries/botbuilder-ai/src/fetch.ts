/* eslint-disable @typescript-eslint/explicit-function-return-type */
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// Purely import types from node-fetch
import type {
    RequestInfo as NodeRequestInfo,
    RequestInit as NodeRequestInit,
    Response as NodeResponse,
} from 'node-fetch';

type Fetch<U, I, R> = (url: U, init?: I) => Promise<R>;
type NodeFetch = Fetch<NodeRequestInfo, NodeRequestInit, NodeResponse>;
type BrowserFetch = Fetch<RequestInfo, RequestInit, Response>;
export type { NodeRequestInfo, NodeRequestInit, NodeResponse, NodeFetch };

/**
 * Gets the fetch library.
 * @returns {Promise<NodeFetch | BrowserFetch>} The fetch library.
 */
export async function getFetch(): Promise<NodeFetch | BrowserFetch> {
    if (typeof self !== 'undefined') {
        return self.fetch;
    }

    if (typeof window !== 'undefined') {
        return window.fetch;
    }

    try {
        const fetch = await import('node-fetch');
        return fetch?.default;
    } catch (err) {
        throw new Error('unable to load fetch');
    }
}

/**
 * Determine if `fetch` is of `NodeFetch` type
 * 
 * @param {NodeFetch | BrowserFetch} fetch a fetch instance to type check
 * @returns {boolean} true if `fetch` is of `NodeFetch` type
 */
export function isNodeFetch(fetch: NodeFetch | BrowserFetch): fetch is NodeFetch {
    return fetch != null && typeof window === 'undefined';
}

/**
 * Determine if `fetch` is of `BrowserFetch` type
 * 
 * @param {NodeFetch | BrowserFetch} fetch a fetch instance to type check
 * @returns {boolean} true if `fetch` is of `BrowserFetch` type
 */
export function isBrowserFetch(fetch: NodeFetch | BrowserFetch): fetch is BrowserFetch {
    return !isNodeFetch(fetch);
}

/**
 * Determine if `options` is of `NodeRequestInit` type
 * 
 * @param {NodeRequestInit | RequestInit} options options to type check
 * @returns {boolean} true if `options` is of `NodeRequestInit` type
 */
export function isNodeRequestInit(options: NodeRequestInit | RequestInit): options is NodeRequestInit {
    return options != null && typeof window === 'undefined';
}

/**
 * Determine if `options` is of `RequestInit` type
 * 
 * @param {NodeRequestInit | RequestInit} options options to type check
 * @returns {boolean} true if `options` is of `RequestInit` type
 */
export function isRequestInit(options: NodeRequestInit | RequestInit): options is RequestInit {
    return !isNodeRequestInit(options);
}
