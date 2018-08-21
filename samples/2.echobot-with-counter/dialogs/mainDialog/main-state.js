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
}

module.exports = TurnCounter;