export class Errors extends Error {
    public errors: Error[];

    constructor(errors: Error[], ...params) {
        super(...params);
        this.errors = errors;
    }
}
