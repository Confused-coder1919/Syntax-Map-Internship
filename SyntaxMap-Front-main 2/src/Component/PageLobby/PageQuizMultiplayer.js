import React from "react";
import { Fragment } from "react"
import QuestionMultiplayer from "./QuestionMultiplayer.js"
import Button from "../Button.js"
import { ModalContext }from "../../Contexts/ModalContext.js"
import { Link } from "react-router-dom"

class PageQuizMultiplayer extends React.Component {
    static contextType = ModalContext;
    
    constructor(props) {
        super(props);
        console.log(props)
        this.state = {
          room:props.room,
          TimePerQuestion: 20,
          nb_questions: 5,
          Questions: props.room.state.toJSON().listQuestions,
          index_q: 0,
          start: false,
          isFinished: false,
          idQuestionWrong: [],
          time: 0,
          error: "",
          words: [],
          wasOpen:false,
        };
      }
   
  componentWillUnmount() {
  }

  componentDidMount() {
  }

  end() {
    this.setState({isFinished : true});
    this.state.room.send("finish",{error:this.state.idQuestionWrong.length})
  }

  goodAnswer() {
        this.setState({index_q: this.state.index_q + 1});
        if (this.state.index_q + 1 === this.state.Questions.length)
            this.end()
  }
  
  badAnswer(err) {
        var tmp = this.state.idQuestionWrong;
        tmp.push(this.state.index_q);
        this.setState({isPause: true, popins: true, idQuestionWrong: tmp, error: err});
        this.continue();
  }

  continue() {
        this.setState({isPause: false, popins: false,index_q: this.state.index_q + 1});
        if (this.state.index_q + 1 === this.state.Questions.length) {
            this.end()
        }
  }

  goBackToCourse() {
        window.location.replace(process.env.REACT_APP_TENSEMAP_URL);
  }

  handleTime = e => {
        this.setState({TimePerQuestion:e.target.value});
  }
  
  handleNote = e => {
        this.setState({note:e.target.value});
  }

  handleNbQuestion = e => {
        this.setState({nb_questions:e.target.value});
  }

  render() {
  if (this.context.isOpen !== this.state.isPause && this.context.isOpen !== this.state.wasOpen)
    this.setState({isPause: this.context.isOpen, wasOpen: this.context.isOpen});

  // data to print
  let selectTime = <select defaultValue='20' onChange={this.handleTime}><option value='5'>5</option><option value='10'>10</option><option value='15'>15</option><option value='20'>20</option></select> // 5/10/15/20
  let selectNbQuestion = <select defaultValue='5' onChange={this.handleNbQuestion}><option value='5'>5</option><option value='10'>10</option><option value='20'>20</option><option value='40'>40</option></select> // 5/10/20/40
  let informationDefinition = <h3>You can double click a word to see its definition (While you read the definition, the timer is stoped)</h3>
  
  // state of the batch
  let question = (this.state.index_q >= 0 && this.state.index_q < this.state.Questions.length) ? <QuestionMultiplayer onEnd={() => {this.badAnswer("Time Out")}} isFinished={this.state.isFinished} isPause={this.state.isPause} time={this.state.TimePerQuestion} onGood={() => {this.goodAnswer()}} onBad={() => {this.badAnswer("You made a mistake")}} question={this.state.Questions[this.state.index_q].question_title} a={[this.state.Questions[this.state.index_q].answer_title_a,this.state.Questions[this.state.index_q].answer_title_b,this.state.Questions[this.state.index_q].answer_title_c,this.state.Questions[this.state.index_q].answer_title_d]} ga={this.state.Questions[this.state.index_q].right_answer}/> : null
  let correction = (this.state.index_q === this.state.Questions.length) ? <Fragment>
  <p>Your result is {this.state.Questions.length - this.state.idQuestionWrong.length} / {this.state.Questions.length}</p>
  {
    this.state.Questions.map((question,index) => {
        if (this.state.idQuestionWrong.indexOf(index) >= 0){
            //console.log(question.question_title);
            return <Fragment key={index}>
                    <p>{question.question_title}</p>
                    <p>The answer is: {question.right_answer}</p>
                    <p>a:{question.answer_title_a} b:{question.answer_title_b} c:{question.answer_title_c} d:{question.answer_title_d}</p>
                   </Fragment>
        }
        return <Fragment key={index}></Fragment>
    })
  }
  </Fragment> : null

    return (
      <div>
        { question }
        { correction }
      </div>
    );
  }
}

export default PageQuizMultiplayer;