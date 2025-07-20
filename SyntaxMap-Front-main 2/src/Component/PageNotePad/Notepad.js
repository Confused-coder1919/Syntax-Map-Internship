import React from "react";
import { Link } from "react-router-dom"

class Notepad extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          exemples: []
        };
      }

    componentDidMount(){
      fetch(process.env.REACT_APP_API_BASE_URL + "/userupload/user/" + this.props.course_id,
      {
      headers:
        {"Authorization" : localStorage.getItem('jstoken')}
      })
      .then(res =>res.json())
      .then((res) => {
      if (res) {
        console.log(res);
        let tmp = [];
          for (var i = 0; i < res.userUploads.length; i++) {
              tmp.push(res.userUploads[i].sentence);
          }
          this.setState({exemples: tmp});
      }
      });
    }

  render() {
    return (
      <div>
        <h1>Notepad</h1>
        {/* You can render your exemples here if needed */}
        {this.state.exemples && this.state.exemples.map((ex, idx) => (
          <p key={idx}>{ex}</p>
        ))}
      </div>
    );
  }
}

export default Notepad;
