import React from "react";
import { Link } from "react-router-dom";

class Course extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exemples: [],
      courseLines: props.course ? props.course.split(/\r?\n/) : [],
      loadingExamples: false,
      errorExamples: null,
    };
  }

  componentDidMount() {
    this.getMyExemple();
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.reload === true && prevProps.reload !== this.props.reload) ||
      prevProps.course_id !== this.props.course_id
    ) {
      this.getMyExemple();
    }
    if (this.props.course !== prevProps.course) {
      this.setState({ courseLines: this.props.course ? this.props.course.split(/\r?\n/) : [] });
    }
  }

  getMyExemple() {
    if (!this.props.course_id) {
      this.setState({ exemples: [] });
      return;
    }

    this.setState({ loadingExamples: true, errorExamples: null });

    if (localStorage.getItem('jstoken')) {
      fetch(process.env.REACT_APP_API_BASE_URL + "/userupload/user/" + this.props.course_id, {
        headers: { "Authorization": localStorage.getItem('jstoken') }
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((res) => {
        if (res && res.userUploads) {
          const exemples = res.userUploads.map(u => u.sentence);
          this.setState({ exemples, loadingExamples: false });
        } else {
          this.setState({ exemples: [], loadingExamples: false });
        }
      })
      .catch(err => {
        console.error("Failed to load user examples:", err);
        this.setState({ errorExamples: err.message, loadingExamples: false });
      });
    } else {
      try {
        const jsonExemple = JSON.parse(localStorage.getItem("upload")) || { upload: [] };
        const exemples = jsonExemple.upload
          .filter(u => u.course_id === this.props.course_id)
          .map(u => u.sentence);
        this.setState({ exemples, loadingExamples: false });
      } catch (err) {
        console.error("Failed to load local examples:", err);
        this.setState({ exemples: [], errorExamples: err.message, loadingExamples: false });
      }
    }
  }

  render() {
    const { exemples, courseLines, loadingExamples, errorExamples } = this.state;
    return (
      <div className="Left">
        <h2>{this.props.title}</h2>
        <hr />
        <h3>Your Examples</h3>
        {loadingExamples && <p>Loading examples...</p>}
        {errorExamples && <p style={{color: 'red'}}>Error loading examples: {errorExamples}</p>}
        {!loadingExamples && !errorExamples && (
          exemples.length === 0 ? (
            <p>No examples found.</p>
          ) : (
            exemples.map((exempl, index) => (
              <p key={index}>{exempl}</p>
            ))
          )
        )}
        <hr />
        {courseLines.map((part, index) => (
          <p key={index}>{part}</p>
        ))}
        <Link to={{ pathname: "/quiz/" + this.props.title, state: { course_id: this.props.course_id } }}>
          Go to Exam
        </Link>
      </div>
    );
  }
}

export default Course;
