"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonDateReviver = (key, value) => {
    if (typeof value === 'string') {
        let dateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
        let dateParts = dateRegex.exec(value);
        if (dateParts) {
            // as Date
            // return new Date(Date.UTC(+dateParts[1], +dateParts[2] - 1, +dateParts[3], +dateParts[4], +dateParts[5], +dateParts[6]));
            return new Date(value);
        }
    }
    // keep as string
    return value;
};
//# sourceMappingURL=utils.js.map