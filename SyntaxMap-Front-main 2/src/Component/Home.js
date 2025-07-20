import React from "react";
import { Link } from "react-router-dom"

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
      }

  render() {
    return (
      <div>
        <h1>Home</h1>
          <Link to="/tensemap">Go to tense map</Link><br/>
          <Link to="/addquestion">Go to add question</Link><br/>
          <Link to="/login_register">Go to Log in / Register</Link><br/>
          <Link to="/notepad">Notepad</Link>
      </div>
    );
  }
}

export default Home;