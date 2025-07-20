import React from "react";
import Button from "../Button.js"

class QuestionMultiplayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          time: this.props.time,
          letterToIndex: new Map([['a', 0], ['b', 1], ['c', 2], ['d', 3], ['A', 0], ['B', 1], ['C', 2], ['D', 3]])
        };
      }
      
  componentDidMount() {
    console.log("componentDidMount");
    }


  componentDidUpdate(prevProps) {
  if (this.props.question !== prevProps.question) {
    this.setState({time: this.props.time});
  }
}

  handleClickAnswer(selectAnswer) {
    console.log(this.state.letterToIndex);
    console.log(selectAnswer);
    if (selectAnswer === this.props.a[this.state.letterToIndex.get(this.props.ga)]){
        console.log("good");
        this.props.onGood();
        }
    else{
        console.log("bad");
        this.props.onBad();
        }
  }

  reportQuestion() {
    fetch(process.env.REACT_APP_API_URL + "/report_question",{
    method: "PUT",
    body: JSON.stringify({
        question_title: this.state.question
    }),
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
    })
    .then(res =>res.json())
    .then((res) => {
        console.log(res);
    });
  }

  render() {
    return (
      <div>
        <h2>{this.props.question}</h2>
        <Button isDisable={this.props.isPause} value={this.props.a[0]} onClick={() => this.handleClickAnswer(this.props.a[0])} name="Exam"/>
        <Button isDisable={this.props.isPause} value={this.props.a[1]} onClick={() => this.handleClickAnswer(this.props.a[1])} name="Exam"/>
        <Button isDisable={this.props.isPause} value={this.props.a[2]} onClick={() => this.handleClickAnswer(this.props.a[2])} name="Exam"/>
        <Button isDisable={this.props.isPause} value={this.props.a[3]} onClick={() => this.handleClickAnswer(this.props.a[3])} name="Exam"/><br/><br/><br/>
        <Button isDisable={false} value="Report error" onClick={() => this.reportQuestion()} name="Report"/>
      </div>
    );
  }
}

export default QuestionMultiplayer;