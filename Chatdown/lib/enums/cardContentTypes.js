/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const base = 'application/vnd.microsoft.card.';
module.exports.cardContentTypes = {
    animation: `${base}animation`,
    audio: `${base}audio`,
    hero: `${base}hero`,
    receipt: `${base}receipt`,
    thumbnail: `${base}thumbnail`,
    signin: `${base}signin`,
    oauth: `${base}oauth`,
    media: `${base}media`,
    video: `${base}video`,
    adaptivecard: `${base}adaptive`
};
module.exports.isCard = function (contentType) {
    return contentType.includes(base);
};