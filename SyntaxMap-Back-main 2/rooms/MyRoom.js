const colyseus = require('colyseus');
const { MyRoomState } = require('./schema/MyRoomState');

exports.MyRoom = class extends colyseus.Room {

  onCreate (options) {
    console.log(options);
    this.setState(new MyRoomState());

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message.
      //
    });
    this.setMetadata({name: options.name, course:options.course});
  }

  onJoin (client, options) {
    console.log(client.sessionId, "joined!");
    console.log(this.state);
  }

  onLeave (client, consented) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
