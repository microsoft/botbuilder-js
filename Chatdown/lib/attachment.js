class Attachment {
    constructor({ contentType = '', contentUrl = '', content = null }) {
        Object.assign(this, { contentType, contentUrl, content });
    }
}

module.exports = Attachment;