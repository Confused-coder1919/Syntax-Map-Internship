import React from "react";
import { Link } from "react-router-dom"

class FalseQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            questions: []
        };
      }
     

    getWords(){
        fetch(process.env.REACT_APP_API_BASE_URL + "",{
        method: "GET",
        headers: {
            "Authorization" : localStorage.getItem('jstoken')
        }
        })
        .then(res =>res.json())
        .then((res) => {
        console.log(res);
        this.setState({questions: res});
        });
    }
    
    componentDidMount() {
    console.log("componentDidMount");
  }
  render() {
    return (
      <div>
        <h3>Rework your weakness</h3>
        {this.questions.map((index, question) => {
            return <Fragment key={index}>
                    <p>{question.question_title}</p>
                    <p>The answer is: {question.right_answer}</p>
                    <p>a:{question.answer_title_a} b:{question.answer_title_b} c:{question.answer_title_c} d:{question.answer_title_d}</p>
                   </Fragment>;
        })}
      </div>
    );
  }
}

export default FalseQuestion;