import React from "react";
import { Fragment } from "react";
import FormAddClasse from "./FormAddClasse.js"

class PageProfessor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            classes: [],
            students: []
        };
      }
      /*
      
            reports: [],
            wrongQuestionId:[],
            wrongQuestionText:[]
      */
  componentDidUpdate(){
  }

  componentDidMount() {
    console.log("componentDidMount");
    //get Classes
    fetch(process.env.REACT_APP_API_BASE_URL + "/classe/user/",
      {
      headers:
        {"Authorization" : localStorage.getItem('jstoken')}
      })
      .then(res =>res.json())
      .then((res) => {
      if (res) {
        console.log(res);
        let tmp = [];
          for (var i = 0; i < res.classes.length; i++) {
              tmp.push(res.classes[i]);
          }
          this.setState({classes: tmp});
      }
    });
    //get result batch
    /*fetch(process.env.REACT_APP_API_URL + "/dashboard/user/",
      {
      headers:
        {"Authorization" : localStorage.getItem('jstoken')}
      })
      .then(res =>res.json())
      .then((res) => {
      if (res) {
        console.log(res);
        let tmp = [];
          for (var i = 0; i < res.dashboard.length; i++) {
              tmp.push(res.dashboard[i]);
          }
          this.setState({reports: tmp});
      }
    });*/
    //get wrong question id
    /*fetch(process.env.REACT_APP_API_URL + "/mistakeQuestion/user",
      {
      headers:
        {"Authorization" : localStorage.getItem('jstoken')}
      })
      .then(res =>res.json())
      .then((res) => {
      if (res) {
        console.log(res);
        let tmp = [];
        let question_ids = "";
        console.log(question_ids);
          for (var i = 0; i < res.mistakeQuestions.length; i++) {
              tmp.push(res.mistakeQuestions[i]);
              question_ids = question_ids + res.mistakeQuestions[i].questions_wrong_id.join();
              if (i !== res.mistakeQuestions.length - 1 && res.mistakeQuestions[i].questions_wrong_id.length > 0)
                question_ids = question_ids + ",";
          }
          if (question_ids[question_ids.length - 1] === ",")
            question_ids = question_ids.slice(0, -1);
          console.log(question_ids);
          this.setState({wrongQuestionId: tmp});
          //get wrong question by their id
          fetch(process.env.REACT_APP_API_URL + "/questions/notepad",{
          method: "POST",
          body: JSON.stringify({
              question_ids: question_ids
          }),
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Authorization" : localStorage.getItem('jstoken')
          }
          })
          .then(res =>res.json())
          .then((res) => {console.log(res);
          let tmp = [];
          for (var i = 0; i < res.questions.length; i++) {
              tmp.push(res.questions[i]);
          }
          this.setState({wrongQuestionText: tmp});})
          .catch((err) => {console.log(err)});
      }
    });*/
  }

  render() {
    return (
      <div>
        <h2>Classes</h2>
        <FormAddClasse/>
        <div>
            {
                this.state.classes.map((classe,index) => {
                    return <h4>{classe.classe_name}</h4>
                })
            }
        </div>
      </div>
    );
  }
}

export default PageProfessor;