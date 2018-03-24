class GenerateAnswer {

    /**
     * @property {string} question
     */

    /**
     * @property {number} top
     */


    constructor({question /* string */, top /* number */} = {}) {
        Object.assign(this, {question /* string */, top /* number */});
    }
}

GenerateAnswer.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(GenerateAnswer.fromJSON);
    }

    const {question /* string */, top /* number */} = source;
    return new GenerateAnswer({question /* string */, top /* number */});
};

module.exports = GenerateAnswer;
