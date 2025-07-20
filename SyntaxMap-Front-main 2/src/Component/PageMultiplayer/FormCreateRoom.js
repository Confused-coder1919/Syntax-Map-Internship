import React from "react";
import ClientColyseus from "./ClientColyseus.js"
import {ClientColyseusContext} from "../../Contexts/ClientColyseusContext.js"
import Button from "../Button.js"
import Option from "../Option.js"

class FormCreateRoom extends React.Component {
    static contextType = ClientColyseusContext;

    constructor(props) {
        super(props);
        this.state = {
            Courses: [],
            course: null,
            name: "My room",
            mod: "speed_duel",
            maxPlayer: 2,
            pwd: "",
            nbQuestions: 5
        };
      }
      
  componentDidUpdate(){
  }

  componentDidMount() {
    console.log(this.context)
    fetch(process.env.REACT_APP_API_URL + "/course")
    .then(res =>res.json())
        .then((res) => {
            this.setState({Courses: res.courses, course:res.courses[0].course_title, course_id: res.courses[0].course_id})
    })
    .catch((err) => {console.log(err)});
  }

  handleCourse = e => {
    this.state.Courses.map((course) => {
    if(course.course_title === e.target.value)
        this.setState({course_id: course.course_id, course: e.target.value})
    })
  }
  handleMod = e => {
        this.setState({mod: e.target.value})
  }
  handleNbQuestions = e => {
        this.setState({nbQuestions: e.target.value})
  }
  handleMaxPlayer = e => {
        this.setState({maxPlayer: e.target.value})
  }
  handleName = e => {
        this.setState({name: e.target.value})
  }
  handlePwd = e => {
        this.setState({pwd: e.target.value})
  }
  render() {
    return (
    <ClientColyseusContext.Consumer>{(contextClientColyseus) => {
    return <div>
        <label>Room Name :</label><input type="text" defaultValue={this.state.name}/><br/>
        <label>Room Password :</label><input type="text"/><br/>
        <label>Course :</label><select onChange={this.handleCourse}>
        {
        this.state.Courses.map((course, index) => {
            return <Option key={index} value={course.course_title}/>;
        })
        }
        </select><br/>
        <label>Max Player :</label><input type="number" min="2" defaultValue="2"/><br/>
        <label>Number of questions :</label><select defaultValue='5' onChange={this.handleNbQuestions}>
            <option value='5'>5</option>
            <option value='10'>10</option>
            <option value='20'>20</option>
            <option value='40'>40</option>
        </select>
        <label>Mod :</label><select defaultValue="speed_duel" onChange={this.handleCourse}>
            <Option value="speed_duel"/>
            <Option value="my_room"/>
            <Option value="evaluation"/>
        </select><br/>
        <Button value="create room" onClick={()=>{contextClientColyseus.createRoom(this.state.mod, this.state.name, this.state.pwd, this.state.course, this.state.course_id, this.state.nbQuestions)}}/>
      </div>
      }
      }</ClientColyseusContext.Consumer>
    );
  }
}

export default FormCreateRoom;