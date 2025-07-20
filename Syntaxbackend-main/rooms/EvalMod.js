const colyseus = require('colyseus');
const { EvalModState } = require('./schema/EvalModState');

exports.EvalMod = class extends colyseus.Room {

  onCreate (options) {
    this.setState(new EvalModState());

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message.
      //
    });

  }

  onJoin (client, options) {
    console.log(client.sessionId, "joined!");
  }

  onLeave (client, consented) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
