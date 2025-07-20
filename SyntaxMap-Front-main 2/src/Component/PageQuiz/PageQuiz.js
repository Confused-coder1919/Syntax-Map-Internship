import React, { Fragment } from "react";
import Question from "./Question.js";
import Timer from "./Timer.js";
import Button from "../Button.js";
import { ModalContext } from "../../Contexts/ModalContext.js";
import { Link } from "react-router-dom";

class PageQuiz extends React.Component {
  static contextType = ModalContext;

  constructor(props) {
    super(props);
    this.state = {
      TimePerQuestion: 20,
      nb_questions: 5,
      Questions: [],
      index_q: -1,
      start: false,
      isPause: true,
      isFinished: false,
      popins: false,
      idQuestionWrong: [],
      time: 0,
      error: "",
      words: [],
      wasOpen: false,
      note: "",
      pathname: props.location.pathname,
      missingCourseData: false,
    };
  }

  componentWillUnmount() {
    // Save notes to backend on unmount
    fetch(process.env.REACT_APP_API_BASE_URL + "/notepad", {
      method: "POST",
      body: JSON.stringify({
        note: this.state.note,
        session_name: localStorage.getItem('session')
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": localStorage.getItem('jstoken')
      }
    })
      .then(res => res.json())
      .then(res => {
        console.log(res);
        // Update session info
        let date = new Date();
        let formattedDate = date.getFullYear() + '-';
        let tmp = (date.getMonth() + 1);
        formattedDate += (tmp < 10 ? "0" + tmp : tmp);
        formattedDate += '-' + date.getDate();

        let session = localStorage.getItem("session");
        if (!session || session.split("_")[0] !== formattedDate) {
          session = formattedDate + "_1";
        } else {
          let next_session = parseInt(session.split("_")[1]) + 1;
          session = formattedDate + "_" + next_session;
        }
        localStorage.setItem("session", session);
      })
      .catch(err => { console.log(err) });
  }

  componentDidMount() {
    // Pause timer when window not focused
    window.addEventListener('blur', () => { this.setState({ isPause: true }); });
    window.addEventListener('focus', () => { if (!this.state.popins) this.setState({ isPause: false }); });

    // Double click word selection to add to list
    document.body.addEventListener('dblclick', e => {
      const word = window.getSelection().toString().trim();
      if (!word) return;
      let tmp = this.state.words;
      if (tmp.indexOf(word) === -1) {
        tmp.push(word);
        this.setState({ words: tmp });
      }
    });

    console.log("componentDidMount");
    console.log(this.props.location.pathname);
    console.log(this.state.pathname);
    console.log(this.props.location.state?.course_id);
    console.log(localStorage.getItem('session'));
  }

  end() {
    this.setState({ isFinished: true });
    if (localStorage.getItem('jstoken')) {
      // Send results to backend
      fetch(process.env.REACT_APP_API_BASE_URL + "/dashboard", {
        method: "POST",
        body: JSON.stringify({
          total_question: this.state.nb_questions,
          nb_good: this.state.nb_questions - this.state.idQuestionWrong.length,
          time_remaining: this.state.time,
          time_per_question: this.state.TimePerQuestion,
          course_id: this.props.location.state.course_id,
          session_name: localStorage.getItem('session')
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Authorization": localStorage.getItem('jstoken')
        }
      }).then(res => res.json()).then(res => { console.log(res); }).catch(err => { console.log(err); });

      // Send mistakes
      fetch(process.env.REACT_APP_API_BASE_URL + "/mistakeQuestion", {
        method: "POST",
        body: JSON.stringify({
          questions_wrong_id: this.state.idQuestionWrong,
          session_name: localStorage.getItem('session')
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Authorization": localStorage.getItem('jstoken')
        }
      }).then(res => res.json()).then(res => { console.log(res); }).catch(err => { console.log(err); });

      // Update last session
      fetch(process.env.REACT_APP_API_BASE_URL + "/user/last_session", {
        method: "POST",
        body: JSON.stringify({
          session: localStorage.getItem('session')
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Authorization": localStorage.getItem('jstoken')
        }
      }).then(res => res.json()).then(res => { console.log(res); }).catch(err => { console.log(err); });
    }
  }

  goodAnswer() {
    this.setState({ index_q: this.state.index_q + 1 });
    if (this.state.index_q + 1 === this.state.Questions.length) this.end();
  }

  badAnswer(err) {
    var tmp = this.state.idQuestionWrong;
    tmp.push(this.state.index_q);
    this.setState({ isPause: true, popins: true, idQuestionWrong: tmp, error: err });
  }

  continue() {
    this.setState({ isPause: false, popins: false, index_q: this.state.index_q + 1 });
    if (this.state.index_q + 1 === this.state.Questions.length) this.end();
  }

  goBackToCourse() {
    window.location.replace(process.env.REACT_APP_TENSEMAP_URL);
  }

  handleTime = (e) => {
    this.setState({ TimePerQuestion: e.target.value });
  };

  handleNote = (e) => {
    this.setState({ note: e.target.value });
  };

  handleNbQuestion = (e) => {
    this.setState({ nb_questions: e.target.value });
  };

  onStart() {
    const courseTitle = this.props.location.state?.course_title || "PRESENT PERFECT";
    const courseId = this.props.location.state?.course_id;

    if (!courseId) {
      console.error("Error: course_id is missing. Cannot start quiz.");
      this.setState({ missingCourseData: true });
      return;
    }
    fetch(process.env.REACT_APP_API_BASE_URL + "/quiz/" + encodeURIComponent(courseTitle), {
      method: "POST",
      body: JSON.stringify({
        nb_questions: this.state.nb_questions,
        online_exam_ids: [courseId],
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch questions: ${res.status}`);
        return res.json();
      })
      .then((res) => {
        this.setState({
          Questions: res.questions,
          time: res.questions.length * this.state.TimePerQuestion,
          start: true,
          index_q: 0,
          isPause: false,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch quiz questions:", err);
      });
  }

  render() {
    if (
      this.context.isOpen !== this.state.isPause &&
      this.context.isOpen !== this.state.wasOpen
    )
      this.setState({ isPause: this.context.isOpen, wasOpen: this.context.isOpen });

    if (this.state.missingCourseData) {
      return (
        <div>
          <h2>Error: Missing course information.</h2>
          <p>
            We couldn’t start the quiz because the course data was not provided.
            Please go back and start the quiz correctly.
          </p>
          <Button value="Go Back" onClick={() => this.goBackToCourse()} />
        </div>
      );
    }

    let selectTime = (
      <select defaultValue="20" onChange={this.handleTime}>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
      </select>
    );

    let selectNbQuestion = (
      <select defaultValue="5" onChange={this.handleNbQuestion}>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="40">40</option>
      </select>
    );

    let informationDefinition = (
      <h3>
        You can double click a word to see its definition (While you read the
        definition, the timer is stopped)
      </h3>
    );

    let start = this.state.start ? (
      <Timer
        onEnd={null}
        action={() => this.setState({ time: this.state.time - 1 })}
        isFinished={this.state.isFinished}
        isPause={this.state.isPause}
        time={this.state.time}
      />
    ) : (
      <div>
        {informationDefinition}
        <p>
          YOU HAVE {selectTime} SECONDS PER QUESTION LET'S START WITH {selectNbQuestion} QUESTIONS
          !!!
        </p>
        <Button value="start" onClick={() => this.onStart()} />
      </div>
    );

    let question =
      this.state.index_q >= 0 && this.state.index_q < this.state.Questions.length ? (
        <Question
          onEnd={() => this.badAnswer("Time Out")}
          isFinished={this.state.isFinished}
          isPause={this.state.isPause}
          time={this.state.TimePerQuestion}
          onGood={() => this.goodAnswer()}
          onBad={() => this.badAnswer("You made a mistake")}
          question={this.state.Questions[this.state.index_q].question_title}
          a={[
            this.state.Questions[this.state.index_q].answer_title_a,
            this.state.Questions[this.state.index_q].answer_title_b,
            this.state.Questions[this.state.index_q].answer_title_c,
            this.state.Questions[this.state.index_q].answer_title_d,
          ]}
          ga={this.state.Questions[this.state.index_q].right_answer}
        />
      ) : null;

    let popins = this.state.popins ? (
      <div className="modal">
        <p>{this.state.error}. Do you want to go back to the course ?</p>
        <Button value="No" onClick={() => this.continue()} />
        <Button value="Yes" onClick={() => this.goBackToCourse()} />
      </div>
    ) : null;

    let correction =
      this.state.index_q === this.state.Questions.length ? (
        <Fragment>
          <p>
            Your result is {this.state.Questions.length - this.state.idQuestionWrong.length} /{" "}
            {this.state.Questions.length}
          </p>
          <Link to="/tensemap">
            <Button value="Go back to Syntaxe Map" />
          </Link>
          {this.state.Questions.map((question, index) => {
            if (this.state.idQuestionWrong.indexOf(index) >= 0) {
              return (
                <Fragment key={index}>
                  <p>{question.question_title}</p>
                  <p>The answer is: {question.right_answer}</p>
                  <p>
                    a:{question.answer_title_a} b:{question.answer_title_b} c:
                    {question.answer_title_c} d:{question.answer_title_d}
                  </p>
                </Fragment>
              );
            }
            return <Fragment key={index}></Fragment>;
          })}
        </Fragment>
      ) : null;

    let listWordsEnd =
      this.state.index_q === this.state.Questions.length && this.state.words.length > 0 ? (
        <Fragment>
          <p>Here's the words you searched during the batch</p>
          {this.state.words.map((word, index) => (
            <p key={index}>{word}</p>
          ))}
        </Fragment>
      ) : null;

    let notepad = this.state.index_q === this.state.Questions.length ? (
      <Fragment>
        <p>
          You can take a note for this batch. You'll be able to see it in your
          notepad
        </p>
        <textarea onChange={this.handleNote} />
      </Fragment>
    ) : null;

    return (
      <div>
        {start}
        {question}
        {popins}
        {correction}
        {listWordsEnd}
        {notepad}
      </div>
    );
  }
}

export default PageQuiz;
