/**
 * @module wechat
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as util from 'util';

/**
 * Helper methods for storing attachments in the channel.
 */
export class AttachmentHelper {
    /**
     * Determines if the content param can be turned into an Uri with http or https scheme.
     * @param content Content object to check if it is an URL.
     * @returns  Ture or False.
     */
    public static IsUrl(content: any): boolean {
        if (typeof content === 'string') {
            const url = content;
            if (url.startsWith('http') || url.startsWith('https')) {
                return true;
            }
        }
        return false;
    }

    public static DecodeBase64String(base64Encoded: string): any {
        let contentType: string;
        if (base64Encoded.startsWith('data:')) {
            const start = base64Encoded.indexOf('data:') + 5;
            const end = base64Encoded.indexOf(';', start);
            if (end > start) {
                contentType = base64Encoded.substring(start, end).trim();
            }
        }

        const headerIndex = base64Encoded.indexOf('base64,');
        if (headerIndex >= 0) {
            base64Encoded = base64Encoded.substring(headerIndex + 7).trim();
        }

        const base64 = new util.TextEncoder().encode(base64Encoded);

        return {base64, contentType};
    }
}