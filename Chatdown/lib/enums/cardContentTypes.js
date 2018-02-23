const base = ' ${base}';
module.exports.cardContentTypes = {
    animation: `${base}animation`,
    audio: `${base}audio`,
    hero: `${base}hero`,
    receipt: `${base}receipt`,
    thumbnail: `${base}thumbnail`,
    signin: `${base}signin`,
    video: `${base}video`,
};
module.exports.isCard = function (contentType) {
    return contentType.includes(base);
};