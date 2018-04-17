const base = 'application/vnd.microsoft.card.';
module.exports.cardContentTypes = {
    animation: `${base}animation`,
    audio: `${base}audio`,
    hero: `${base}hero`,
    receipt: `${base}receipt`,
    thumbnail: `${base}thumbnail`,
    signin: `${base}signin`,
    video: `${base}video`,
    adaptivecard: `${base}adaptive`
};
module.exports.isCard = function (contentType) {
    return contentType.includes(base);
};