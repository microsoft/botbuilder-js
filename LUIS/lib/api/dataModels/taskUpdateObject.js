class TaskUpdateObject {

    /**
     * @property {string} version
     */


    constructor({version /* string */} = {}) {
        Object.assign(this, {version /* string */});
    }
}

TaskUpdateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(TaskUpdateObject.fromJSON);
    }

    const {version /* string */} = source;
    return new TaskUpdateObject({version /* string */});
};

module.exports = TaskUpdateObject;
