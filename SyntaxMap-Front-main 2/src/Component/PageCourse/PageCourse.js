import React from "react";
import { withRouter } from "react-router-dom";  // import withRouter
import Course from './Course.js';
import FormUpload from "./FormUpload.js";

class PageCourse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Course_id: 0,
      Title: "No Course Found",
      TextCourse: "Something went Wrong",
      ButtonValue: "Start Exam",
      ButtonTextSpeech: "Speak it",
      Reload: false,
      examples: [],   // hold user uploaded examples
    };
  }

  componentDidMount() {
    this.fetchCourseData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.Reload && !prevState.Reload) {
      this.fetchCourseData();
      this.setState({ Reload: false });
    }
    // React to pathname changes (navigate to another course)
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.fetchCourseData();
    }
  }

  fetchCourseData() {
    const pathname = this.props.location.pathname;
    fetch(process.env.REACT_APP_API_BASE_URL + pathname)
      .then(async res => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        } else {
          const text = await res.text();
          throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
        }
      })
      .then(res => {
        if (res.courses && res.courses.length > 0) {
          this.setState(
            {
              Title: res.courses[0].course_title,
              TextCourse: res.courses[0].course_data,
              Course_id: res.courses[0].course_id,
            },
            () => {
              // Fetch examples after course data is set
              this.fetchExamples();
            }
          );
        } else {
          this.setState({
            Title: "No Course Found",
            TextCourse: "Course data is empty",
            Course_id: 0,
            examples: [],
          });
        }
      })
      .catch(err => {
        console.error('Failed to load course:', err);
        this.setState({
          Title: "No Course Found",
          TextCourse: "Could not fetch course data",
          Course_id: 0,
          examples: [],
        });
      });
  }

  fetchExamples() {
    if (!this.state.Title) return;
    const username = "foo"; // Replace with real username if you have authentication
    const courseTitle = encodeURIComponent(this.state.Title);
    
    fetch(`${process.env.REACT_APP_API_BASE_URL}/userupload/user/${username}/${courseTitle}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch examples: ${res.status}`);
        return res.json();
      })
      .then(data => {
        this.setState({ examples: data });
      })
      .catch(err => {
        console.error('Error fetching examples:', err);
        this.setState({ examples: [] });
      });
  }

  // Modified handler to navigate to quiz page with course data in location.state
  handleStartQuiz = () => {
    if (this.state.Course_id && this.state.Title) {
      this.props.history.push({
        pathname: `/quiz/${encodeURIComponent(this.state.Title)}`,
        state: {
          course_id: this.state.Course_id,
          course_title: this.state.Title,
        },
      });
    } else {
      alert("No course data available to start quiz");
    }
  };

  reload = () => {
    this.setState({ Reload: true });
  };

  render() {
    const course =
      this.state.Title !== "No Course Found" ? (
        <Course
          course_id={this.state.Course_id}
          reload={this.state.Reload}
          title={this.state.Title}
          course={this.state.TextCourse}
          button="Start Exam"
          onClick={this.handleStartQuiz}
        />
      ) : null;

    return (
      <div>
        <div className="Course">{course}</div>

        {/* Display uploaded examples */}
        <div>
          <h3>Your Examples</h3>
          {this.state.examples.length === 0 ? (
            <p>No examples found.</p>
          ) : (
            <ul>
              {this.state.examples.map((ex, idx) => (
                <li key={idx}>{ex.sentence || ex.text || JSON.stringify(ex)}</li>
              ))}
            </ul>
          )}
        </div>

        <FormUpload reload={this.reload} course_id={this.state.Course_id} />
      </div>
    );
  }
}

// Wrap with withRouter to get history prop
export default withRouter(PageCourse);
