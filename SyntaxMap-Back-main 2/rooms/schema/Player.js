const schema = require('@colyseus/schema');

exports.Player = class Player extends schema.Schema {
    constructor() {
        super();
        this.index_question = 0;
    }
}
schema.defineTypes(Player, {
    index_question: "number"
});

exports.Player = Player