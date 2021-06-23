/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Partially represents a FileReader from the W3C FileAPI Working Draft.
 * For more information, see https://w3c.github.io/FileAPI/#APIASynch.
 *
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface IBrowserFileReader {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    result: any;
    onload: (event: any) => void;
    readAsArrayBuffer: (blobOrFile: any) => void;
    /* eslint-enable @typescript-eslint/no-explicit-any */
}
