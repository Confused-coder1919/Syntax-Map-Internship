import React from "react";
import {render, findDOMNode} from 'react-dom';

import * as Colyseus from 'colyseus.js'

class ClientColyseus extends React.Component {

  constructor(props) {
    super(props);
    this.client = new Colyseus.Client('ws://' + "localhost" + ':8080');
    this.room = null;
      
    this.state = {
      currentText: "",
      messages : [],
      nameRoom: ""
    };
  }

  componentDidMount(){
        console.log("ClientColyseus class")
        console.log(this.client)
  }

  onUpdateRemote (newState, patches) {
    console.log("new state: ", newState, "patches:", patches)
    this.setState(newState, this.autoScroll.bind(this))
  }

  autoScroll () {
    var domMessages = findDOMNode(this.refs.messages)
    domMessages.scrollTop = domMessages.scrollHeight
  }

  onInputChange (e) {
    e.preventDefault()

    this.setState({ currentText: e.target.value })
  }

  onSubmit (e) {
    e.preventDefault()
    this.chatRoom.send(this.state.currentText)
    this.setState({currentText: ""})
  }
  addListeners (room) {
          console.log('joined!');
          room.onMessage("*", (type, message) => {
              console.log("received message:", type, "=>", message);
          });

          room.onLeave(function() {
              console.log("LEFT ROOM", arguments);
          });

          room.onStateChange(function(state) {
              console.log("state change: ", state.toJSON());
          });
      }
   join () {
          this.client.join(document.getElementById('room_name').value, { code: "one" }).then((r) => {
              this.room = r;
              this.addListeners(this.room);
          }).catch(e => {
              console.error(e.code, e.message);
          });
      }

      create () {
          this.client.create(document.getElementById('room_name').value, { name: "quelquechose", course:"PRESENT SIMPLE" }).then((r) => {
              this.room = r
              console.log("create room")
              this.addListeners(this.room);
          });
      }

      joinOrCreate () {
          this.client.joinOrCreate(document.getElementById('room_name').value, { code: "one" }).then((r) => {
              this.room = r
              this.addListeners(this.room);
          });
      }

      joinByLastId () {
          this.client.joinById(this.room.id).then(r => {
            this.room = r;
            this.addListeners(this.room);
          });
      }

      getAvailableRooms() {
          this.client.getAvailableRooms().then((rooms) => {
              console.log(rooms);
          }).catch(e => {
              console.error(e);
          });
      }

      reconnect() {
        this.client.reconnect(this.room.id, this.room.sessionId).then(r => {
            this.room = r;
            this.addListeners(this.room);
        });
      }

      closeConnection() {
        this.room.connection.close();
      }

  handleSubmit = (e) => {
        e.preventDefault()

        this.room.send(document.getElementById('message_type').value, document.getElementById('message_data').value);

        // room.send(document.getElementById('input').value);
        document.getElementById('message_data').value = null
      }
      handleNameRoom = (e) => {

        this.setState({nameRoom: e.target.value})
      }
  render() {
    return <div>
      <strong>Messages</strong><br/>
    <form id="form" onSubmit={this.handleSubmit}>
      Room name: <input type="text" id="room_name" value={this.state.nameRoom} onChange={this.handleNameRoom} /> <br/>

      Send data: <input type="text" id="message_type" onChange={() => {}} value="" placeholder="messageType" />
                 <input type="text" id="message_data" onChange={() => {}} value="" placeholder="data" />
                 <input type="submit" value="send" />
    </form>
    <div id="messages"></div>
        <button onClick={()=> {this.join()}}>Join</button>
        <button onClick={()=> {this.joinOrCreate()}}>Join or create</button>
        <button onClick={()=> {this.create()}}>Create</button>
        <button onClick={()=> {this.joinByLastId()}}>Join by last id</button>
        <button onClick={()=> {this.getAvailableRooms()}}>List avaiable rooms</button>
        <button onClick={()=> {this.closeConnection()}}>Close connection</button>
        <button onClick={()=> {this.reconnect()}}>Re-join last closed connection</button>
    </div>
  }

}

export default ClientColyseus ;