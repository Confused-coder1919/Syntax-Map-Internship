import React from "react";
import {ClientColyseusContext} from "../../Contexts/ClientColyseusContext.js"
import Button from "../Button.js"
import Option from "../Option.js"
import Timer from "../PageQuiz/Timer.js"
import PageQuizMultiplayer from "./PageQuizMultiplayer.js"

class PageLobby extends React.Component {
    static contextType = ClientColyseusContext;

    constructor(props) {
        super(props);
        this.state = {
            Courses: [],
            course: null,
            name: "My room",
            maxPlayer: 2,
            pwd: "",
            nbQuestions: 5,
            isStarted: false,
            timer: 1
        };
      }
      
  componentDidUpdate(){
  }

  componentWillUnmount(){
        this.context.room.leave();
  }

  componentDidMount() {
        console.log(this.context)
        
        const idRoom = this.props.location.pathname.split('/')[2]
        console.log(idRoom);
        if (!this.context.room || this.context.room.id !== idRoom)
            this.context.joinById(idRoom);

        if (this.context.isMaster) {
            
        }
        console.log("check data")
        console.log(this.context.room);
  }

  handleCourse = e => {
    this.state.Courses.map((course) => {
    if(course.course_title === e.target.value)
        this.setState({course_id: course.course_id, course: e.target.value})
    })
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
    if(this.state.isStarted)
        return <PageQuizMultiplayer room={contextClientColyseus.room} />
    if(contextClientColyseus.isStarted)
        return <Timer time={this.state.timer} isPaused={this.state.isStarted} isFinished={this.state.isStarted} action={() => {this.setState({timer: this.state.timer - 1});}} onEnd={() => {this.setState({timer:1, isStarted:true})}} />
    if(contextClientColyseus.isMaster) {
        if(this.state.Courses.length === 0)
            fetch(process.env.REACT_APP_API_URL + "/course")
                .then(res =>res.json())
                    .then((res) => {
                        this.setState({Courses: res.courses, course:res.courses[0].course_title, course_id: res.courses[0].course_id})
                })
                .catch((err) => {console.log(err)});
        return <div>
            <div>
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
                </select><br/>
                <Button value="save new setting" onClick={()=>{ contextClientColyseus.room.send('update', { roomPwd: this.state.pwd, roomName: this.state.name, course: this.state.course, course_id:this.state.course_id, nbQuestions: this.state.nbQuestions}) }}/>
            </div><br/><br/>
            <Button value="start" onClick={()=>{ contextClientColyseus.room.send('start', { message: "let's go!"}); this.setState({timer:1});} }/>
          </div>
          }
        return <p>Waiting for the owner to start</p>
      }
      }</ClientColyseusContext.Consumer>
    );
  }
}

export default PageLobby;