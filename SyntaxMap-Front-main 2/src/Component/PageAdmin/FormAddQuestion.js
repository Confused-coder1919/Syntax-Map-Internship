import React from "react";
import { Fragment } from "react";

class FormAddQuestion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listCourse: [],
      course: [],
      question: "",
      answer: ["", "", "", ""],
      difficulty: "1",
      response: "",
      printMod: false,
    };
  }

  componentDidMount() {
    fetch(process.env.REACT_APP_API_BASE_URL + "/course")
      .then((res) => res.json())
      .then((res) => {
        this.setState({ listCourse: res.courses });
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);

    fetch(process.env.REACT_APP_API_BASE_URL + "/quiz", {
      method: "POST",
      body: JSON.stringify({
        quiz_data: this.state.answer,
        question_title: this.state.question,
        online_exam_ids: this.state.course,
        difficulty: this.state.difficulty,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        this.setState({
          question: "",
          answer: ["", "", "", ""],
          difficulty: "1",
          response: "successfully sent the question: " + res.msg,
        });
      });
  };

  handleQuestion = (e) => {
    this.setState({ question: e.target.value, response: "" });
  };

  handleAnswerA = (e) => {
    var tmp = this.state.answer;
    tmp[0] = e.target.value;
    this.setState({ answer: tmp, response: "" });
  };

  handleAnswerB = (e) => {
    var tmp = this.state.answer;
    tmp[1] = e.target.value;
    this.setState({ answer: tmp, response: "" });
  };

  handleAnswerC = (e) => {
    var tmp = this.state.answer;
    tmp[2] = e.target.value;
    this.setState({ answer: tmp, response: "" });
  };

  handleAnswerD = (e) => {
    var tmp = this.state.answer;
    tmp[3] = e.target.value;
    this.setState({ answer: tmp, response: "" });
  };

  handleRadio = (e) => {
    this.setState({ difficulty: e.target.value, response: "" });
  };

  handleCheckbox = (e) => {
    var tmp = this.state.course;
    var value = parseInt(e.target.value);
    var i = tmp.indexOf(value);
    if (i >= 0) {
      tmp.splice(i, 1);
    } else if (i !== 0) {
      tmp.push(value);
    }
    this.setState({ course: tmp, response: "" });
  };

  handleMod = (e) => {
    this.setState({ printMod: !this.state.printMod });
  };

  checkCombinaisonOrder(ordre, id) {
    let i = 0;
    let tmp = id;

    while (tmp > 0) {
      tmp = tmp - Math.pow(2, Math.floor(Math.log2(tmp)));
      i = i + 1;
    }

    if (i === ordre) return true;
    return false;
  }

  isMod(id) {
    if (id > 127 && id <= 65536 && !this.state.printMod) return false;
    return true;
  }

  render() {
    return (
      <div className="Upload">
        <h2>Add a Question</h2>
        <form onSubmit={this.handleSubmit}>
          <label>Combinaison rang 4</label>
          <br />
          {this.state.listCourse.map((course, index) => {
            if (this.checkCombinaisonOrder(4, course.course_id) && !course.hide)
              return (
                <Fragment key={index}>
                  <input
                    type="checkbox"
                    value={course.course_id}
                    name={course.course_title}
                    onChange={this.handleCheckbox}
                  />
                  <label
                    htmlFor={course.course_title}
                    style={{ borderRight: "solid 1px black", paddingRight: "0.5rem" }}
                  >
                    {course.course_item}
                  </label>{" "}
                </Fragment>
              );
            return null;
          })}
          <br />
          <label>Combinaison rang 3</label>
          <br />
          {this.state.listCourse.map((course, index) => {
            if (this.checkCombinaisonOrder(3, course.course_id) && !course.hide)
              return (
                <Fragment key={index}>
                  <input
                    type="checkbox"
                    value={course.course_id}
                    name={course.course_title}
                    onChange={this.handleCheckbox}
                  />
                  <label
                    htmlFor={course.course_title}
                    style={{ borderRight: "solid 1px black", paddingRight: "0.5rem" }}
                  >
                    {course.course_item}
                  </label>{" "}
                </Fragment>
              );
            return null;
          })}
          <br />
          <label>Combinaison rang 2</label>
          <br />
          {this.state.listCourse.map((course, index) => {
            if (this.checkCombinaisonOrder(2, course.course_id) && !course.hide)
              return (
                <Fragment key={index}>
                  <input
                    type="checkbox"
                    value={course.course_id}
                    name={course.course_title}
                    onChange={this.handleCheckbox}
                  />
                  <label
                    htmlFor={course.course_title}
                    style={{ borderRight: "solid 1px black", paddingRight: "0.5rem" }}
                  >
                    {course.course_item}
                  </label>{" "}
                </Fragment>
              );
            return null;
          })}
          <br />
          <label>Items simples</label>
          <br />
          {this.state.listCourse.map((course, index) => {
            if (
              (Number.isInteger(Math.log2(course.course_id)) && this.isMod(course.course_id)) ||
              course.course_id === 0
            )
              return (
                <Fragment key={index}>
                  <input
                    type="checkbox"
                    value={course.course_id}
                    name={course.course_title}
                    onChange={this.handleCheckbox}
                  />
                  <label
                    htmlFor={course.course_title}
                    style={{ borderRight: "solid 1px black", paddingRight: "0.5rem" }}
                  >
                    {course.course_item}
                  </label>{" "}
                </Fragment>
              );
            if (course.course_id === 127)
              return (
                <Fragment key={index}>
                  <input
                    type="checkbox"
                    onChange={this.handleMod}
                    value={course.course_id}
                    name={course.course_title}
                  />
                  <label
                    htmlFor={course.course_title}
                    style={{ borderRight: "solid 1px black", paddingRight: "0.5rem" }}
                  >
                    {course.course_item}
                  </label>{" "}
                </Fragment>
              );
            return null;
          })}
          <br />
          <label>Question</label>
          <input
            style={{ width: "100ch" }}
            type="text"
            value={this.state.question}
            onChange={this.handleQuestion}
            required
          />
          <label>Ex: It ____ a simple sentence</label>
          <br />
          <label>Good Answer</label>
          <input type="text" value={this.state.answer[0]} onChange={this.handleAnswerA} required />
          <br />
          <label>Bad Answer</label>
          <input type="text" value={this.state.answer[1]} onChange={this.handleAnswerB} required />
          <br />
          <label>Bad Answer</label>
          <input type="text" value={this.state.answer[2]} onChange={this.handleAnswerC} required />
          <br />
          <label>Bad Answer</label>
          <input type="text" value={this.state.answer[3]} onChange={this.handleAnswerD} required />
          <br />
          <label>Difficulty</label>
          <br />
          <input
            type="radio"
            id="facile"
            name="difficulty"
            value="1"
            checked={this.state.difficulty === "1"}
            onChange={this.handleRadio}
          />
          <label htmlFor="facile">Facile</label>
          <input
            type="radio"
            id="toeic"
            name="difficulty"
            value="3"
            checked={this.state.difficulty === "3"}
            onChange={this.handleRadio}
          />
          <label htmlFor="toeic">TOEIC</label>
          <br />
          <input type="submit" />
          <br />
        </form>
        {this.state.response}
        <p style={{ display: "none" }}>paragraphe test</p>
      </div>
    );
  }
}

export default FormAddQuestion;
