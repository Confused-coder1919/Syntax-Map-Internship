import React from "react";
import FormCreateRoom from "./FormCreateRoom.js"
import {ClientColyseusContext} from "../../Contexts/ClientColyseusContext.js"
import Button from "../Button.js"

class PageMultiplayer extends React.Component {
    static contextType = ClientColyseusContext;

    constructor(props) {
        super(props);
        this.state = {
            refreshRoom:{}
        };
      }
      
  componentDidUpdate(){
  }

  componentDidMount() {
    console.log(this.context)
    this.context.getAvailableRooms();
    this.setState({refreshRoom: setInterval(() => {
        this.context.getAvailableRooms();
    },60000)});
  }
  
  componentWillUnmount(){
    this.setState({refreshRoom: clearInterval(this.state.refreshRoom)})
  }

  render() {
    return (
    <ClientColyseusContext.Consumer>{(contextClientColyseus) => {
    return <div>
        <FormCreateRoom/>
        <table>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Mode</th>
                    <th>Course</th>
                    <th>Join</th>
                </tr>
            </thead>
            <tbody>
                { 
                    contextClientColyseus.roomsList.map((room, index) => {
                        console.log(room);
                        return <tr key={index}>
                            <td>
                                {room.roomId}
                            </td>
                            <td>
                                {room.name}
                            </td>
                            <td>
                                {room.metadata.course}
                            </td>
                            <td>
                                <Button onClick={()=>{contextClientColyseus.joinById(room.roomId)}} value="join" />
                            </td>
                        </tr>
                    })
                }
            </tbody>
        </table>
      </div>
      }
      }</ClientColyseusContext.Consumer>
    );
  }
}

export default PageMultiplayer;