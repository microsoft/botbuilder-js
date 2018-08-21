const TURN_COUNTER = 'turnCounter';

class TurnCounter {
    /**
     * 
     * @param {object} state state instance - can be user or conversation state.
     */
    constructor(state) {
        if(!state || !state.createProperty) throw('Invalid state provided. Need either converesation or user state');
        this.count = state.createProperty(TURN_COUNTER);
    }

    /**
     * 
     * @param {object} context context object
     */
    async get(context) {
        if(!context) throw ('Invalid context provided');
        return await this.count.get(context);
    }
    /**
     * 
     * @param {object} context context object
     * @param {number} value new count value to set
     */
    async set(context, value) {
        if(!context) throw ('Invalid context provided');
        if(isNaN(value)) throw ('Can only take numbers for TurnCounter state')
        // do any validations on value before grounding
        if(!value || value < 0) throw ('Invalid value for count');
        return this.count.set(context, value);
    }
}

module.exports = TurnCounter;