import React from "react";

class FormUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sentence: "",
      img: null,
      examples: [], // to store fetched examples
      loading: false,
      error: null,
      username: localStorage.getItem("username") || "foo" // example fallback username
    };
  }

  componentDidMount() {
    this.fetchExamples();
  }

  componentDidUpdate(prevProps) {
    // If course_id changes, refetch examples
    if (this.props.course_id !== prevProps.course_id) {
      this.fetchExamples();
    }
  }

  fetchExamples = () => {
    const { course_id, reload } = this.props;
    const { username } = this.state;

    if (!username || !course_id) return;

    this.setState({ loading: true, error: null });

    fetch(`${process.env.REACT_APP_API_BASE_URL}/userupload/user/${encodeURIComponent(username)}/${course_id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to fetch examples: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        this.setState({ examples: data, loading: false });
      })
      .catch((err) => {
        console.error("Error fetching examples:", err);
        this.setState({ error: err.message, loading: false });
      });
  };

  handleTextInput = (e) => {
    this.setState({ sentence: e.target.value });
  };

  handleImg = (e) => {
    if (!e.target.files[0]) {
      this.setState({ img: null });
      return;
    }
    this.setState({ img: e.target.files[0] });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { sentence, img, username } = this.state;
    const { course_id } = this.props;

    if (!username || !course_id) {
      alert("Missing user or course info.");
      return;
    }

    if (localStorage.getItem("jstoken")) {
      const formData = new FormData();
      formData.append("file", img);
      formData.append("course_id", course_id);
      formData.append("sentence", sentence);
      formData.append("user_name", username);

      fetch(process.env.REACT_APP_API_BASE_URL + "/userupload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: localStorage.getItem("jstoken"),
          // Do NOT set Content-Type here, let browser set it with boundary automatically
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to upload example");
          return res.json();
        })
        .then(() => {
          this.setState({ sentence: "", img: null });
          this.fetchExamples(); // Refresh the examples list after upload
          this.props.reload && this.props.reload();
        })
        .catch((err) => {
          console.error("Upload error:", err);
          alert("Failed to upload example");
        });
    } else {
      // fallback for non-logged users: local storage
      let jsonExemple = JSON.parse(localStorage.getItem("upload")) || { upload: [] };
      if (jsonExemple.upload.length < 3) {
        const data = {
          user_name: username,
          sentence: sentence,
          img: null,
          course_id: course_id,
        };
        jsonExemple.upload.push(data);
        localStorage.setItem("upload", JSON.stringify(jsonExemple));
        this.props.reload && this.props.reload();
        this.fetchExamples();
      } else {
        alert("Maximum of 3 uploads reached for non-logged in users.");
      }
    }
  };

  render() {
    const { sentence, examples, loading, error } = this.state;

    return (
      <div className="Upload">
        <h2>Upload your Examples</h2>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            value={sentence}
            placeholder="Type your example sentence"
            onChange={this.handleTextInput}
            required
          />
          <br />
          <input
            type="file"
            onChange={this.handleImg}
            accept="image/png, image/jpeg, image/gif"
          />
          <br />
          <input type="submit" value="Upload" />
          <br />
        </form>

        <hr />
        <h3>Your Uploaded Examples</h3>
        {loading && <p>Loading examples...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {!loading && examples.length === 0 && <p>No examples uploaded yet.</p>}
        <ul>
          {examples.map((ex) => (
            <li key={ex.id_upload || ex.id}>
              <p>{ex.sentence}</p>
              {ex.img && (
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL}/uploads/${ex.img}`}
                  alt="Example Upload"
                  style={{ maxWidth: "300px", maxHeight: "200px" }}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default FormUpload;
