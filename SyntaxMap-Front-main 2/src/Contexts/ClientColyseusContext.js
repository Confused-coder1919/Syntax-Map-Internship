import React, { createContext, Component } from 'react';
import { withRouter } from "react-router-dom";

import * as Colyseus from 'colyseus.js'

// Use environment variable or fallback to localhost
const baseHttpUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
// Convert http(s) to ws(s)
const baseWsUrl = baseHttpUrl.replace(/^http/, 'ws');

export const ClientColyseusContext = createContext();

class ClientColyseusContextProvider extends Component {
	
    state = {
		isAuth: false,
		clientColyseus: new Colyseus.Client(baseWsUrl),
		room: null,
        isMaster: false,
        isStarted: false,
        roomsList: []
	};

    componentDidMount() {
        console.log("clientColyseus context")
        console.log(this.state.clientColyseus)
        this.getAvailableRooms();
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
        
        room.onMessage("master", (type, message) => {
            this.setState({isMaster: type.isMaster});
            console.log("received message:", type, "=>", message);
        });
        room.onMessage("start", (type, message) => {
            this.setState({isStarted: true});
            console.log("received message:", type, "=>", message);
        });
        room.onMessage("finish", (type, message) => {
            this.setState({isStarted: false});
            console.log("received message:", type, "=>", message);
        });
        room.onLeave(function() {
            console.log("LEFT ROOM", arguments);
        });

        room.onStateChange(function(state) {
            console.log("state change: ", state.toJSON());
        });
    }

    join = () => {
        this.state.clientColyseus.join(document.getElementById('room_name').value, { code: "one" }).then((r) => {
            this.setState({room:r});
            this.addListeners(this.state.room);
        }).catch(e => {
            console.error(e.code, e.message);
        });
    }

    create = (roomType, roomName, roomPwd, course, course_id, nbQuestions) =>{
        this.state.clientColyseus.create(roomType, { roomPwd: roomPwd, roomName: roomName, course: course, course_id: course_id, nbQuestions: nbQuestions }).then((r) => {
            this.setState({room:r})
            console.log("create room")
            this.addListeners(this.state.room);
            this.props.history.push('/multiplayer/' + r.id);
        });
    }

    joinOrCreate = () => {
        this.state.clientColyseus.joinOrCreate(document.getElementById('room_name').value, { code: "one" }).then((r) => {
            this.setState({room:r})
            this.addListeners(this.state.room);
        });
    }

    joinById = (id) => {
        this.state.clientColyseus.joinById(id).then(r => {
            this.setState({room:r});
            this.addListeners(this.state.room);
            this.props.history.push('/multiplayer/' + r.id);
        });
    }

    getAvailableRooms = () => {
        this.state.clientColyseus.getAvailableRooms().then((rooms) => {
            this.setState({roomsList: rooms});
            console.log(rooms);
        }).catch(e => {
            console.error(e);
        });
    }

    reconnect = () => {
        this.state.clientColyseus.reconnect(this.state.room.id, this.state.room.sessionId).then(r => {
            this.setState({room:r});
            this.addListeners(this.state.room);
        });
    }

    closeConnection = () => {
        this.state.room.connection.close();
    }

	render() {
	    return (
		    <ClientColyseusContext.Provider 
                value={{
                    ...this.state, 
                    createRoom: this.create, 
                    joinRoom: this.join, 
                    joinById: this.joinById, 
                    leaveRoom: this.closeConnection, 
                    getAvailableRooms: this.getAvailableRooms
                }}>
			    {this.props.children}
		    </ClientColyseusContext.Provider>
	    );
	}
}

export default withRouter(ClientColyseusContextProvider);
