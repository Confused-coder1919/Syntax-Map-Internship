import React, { Fragment } from "react";

class PageNotepad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reports: [],
      words: [],
      wrongQuestionId: [],
      wrongQuestionText: [],
      notes: []
    };
  }

  componentDidMount() {
    console.log("componentDidMount");

    // ✅ get result batch
    fetch(process.env.REACT_APP_API_BASE_URL + "/dashboard/user/", {
      headers: { Authorization: localStorage.getItem("jstoken") }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && Array.isArray(res.dashboard)) {
          console.log(res);
          this.setState({ reports: res.dashboard });
        }
      })
      .catch((err) => console.error(err));

    // ✅ get words
    fetch(process.env.REACT_APP_API_BASE_URL + "/dictionnary/user/", {
      headers: { Authorization: localStorage.getItem("jstoken") }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && Array.isArray(res.dictionnary)) {
          console.log(res);
          this.setState({ words: res.dictionnary });
        }
      })
      .catch((err) => console.error(err));

    // ✅ get notes
    fetch(process.env.REACT_APP_API_BASE_URL + "/notepad/user/", {
      headers: { Authorization: localStorage.getItem("jstoken") }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && Array.isArray(res.notepads)) {
          console.log(res);
          this.setState({ notes: res.notepads });
        }
      })
      .catch((err) => console.error(err));

    // ✅ get wrong question id
    fetch(process.env.REACT_APP_API_BASE_URL + "/mistakeQuestion/user", {
      headers: { Authorization: localStorage.getItem("jstoken") }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && Array.isArray(res.mistakeQuestions)) {
          console.log(res);
          let tmp = [];
          let question_ids = "";

          res.mistakeQuestions.forEach((item, index) => {
            tmp.push(item);

            if (Array.isArray(item.questions_wrong_id)) {
              question_ids += item.questions_wrong_id.join();

              if (
                index !== res.mistakeQuestions.length - 1 &&
                item.questions_wrong_id.length > 0
              ) {
                question_ids += ",";
              }
            }
          });

          if (question_ids.endsWith(",")) {
            question_ids = question_ids.slice(0, -1);
          }

          console.log(question_ids);
          this.setState({ wrongQuestionId: tmp });

          // ✅ get wrong question by their id
          if (question_ids) {
            fetch(process.env.REACT_APP_API_BASE_URL + "/questions/notepad", {
              method: "POST",
              body: JSON.stringify({ question_ids }),
              headers: {
                "Content-type": "application/json; charset=UTF-8",
                Authorization: localStorage.getItem("jstoken")
              }
            })
              .then((res) => res.json())
              .then((res) => {
                console.log(res);
                if (res && Array.isArray(res.questions)) {
                  this.setState({ wrongQuestionText: res.questions });
                }
              })
              .catch((err) => console.error(err));
          }
        }
      })
      .catch((err) => console.error(err));
  }

  handleNote = (e) => {
    console.log(e.target.value);
  };

  updateNote = (e) => {
    e.preventDefault();
    console.log(e);
    const noteId = e.target[0].value;
    const sessionName = e.target[1].value;
    const note = e.target[2].value;

    fetch(process.env.REACT_APP_API_BASE_URL + "/notepad/" + noteId, {
      method: "PUT",
      body: JSON.stringify({
        note_id: noteId,
        session_name: sessionName,
        note: note
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: localStorage.getItem("jstoken")
      }
    })
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  };

  render() {
    return (
      <div>
        <h2>Notepad</h2>
        <table>
          <thead>
            <tr>
              <th>Session</th>
              <th>Note</th>
              <th>Words</th>
              <th>Mistakes Question</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {this.state.reports.map((report, index) => {
              return (
                <tr key={index}>
                  <td>{report.session_name}</td>
                  <td>
                    {this.state.notes.map((note, i) => {
                      if (note.session_name === report.session_name) {
                        return (
                          <form key={i} onSubmit={this.updateNote}>
                            <input type="hidden" value={note.note_id} />
                            <input type="hidden" value={note.session_name} />
                            <textarea
                              defaultValue={note.note}
                              onInput={this.handleNote}
                            />
                            <br />
                            <input type="submit" />
                          </form>
                        );
                      }
                      return null;
                    })}
                  </td>
                  <td>
                    {this.state.words.map((word, i) => {
                      if (word.session_name === report.session_name) {
                        return <p key={i}>{word.word}</p>;
                      }
                      return null;
                    })}
                  </td>
                  <td>
                    {this.state.wrongQuestionId.map((mistake, i) => {
                      if (mistake.session_name === report.session_name) {
                        return this.state.wrongQuestionText.map(
                          (question, ind) => {
                            if (
                              Array.isArray(mistake.questions_wrong_id) &&
                              mistake.questions_wrong_id.includes(
                                question.question_id
                              )
                            ) {
                              return (
                                <Fragment key={ind}>
                                  <p>{question.question_title}</p>
                                  <p>
                                    a: {question.answer_title_a} b:{" "}
                                    {question.answer_title_b} c:{" "}
                                    {question.answer_title_c} d:{" "}
                                    {question.answer_title_d}
                                  </p>
                                </Fragment>
                              );
                            }
                            return null;
                          }
                        );
                      }
                      return null;
                    })}
                  </td>
                  <td>
                    score:{" "}
                    {report.total_question
                      ? (report.nb_good / report.total_question) * 100
                      : 0}
                    % time used:{" "}
                    {report.time_per_question && report.total_question
                      ? 100 -
                        (report.time_remaining /
                          (report.time_per_question * report.total_question)) *
                          100
                      : 0}
                    %
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default PageNotepad;
