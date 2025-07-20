import React from "react";
import FormSignIn from './FormSignIn.js';
import FormLogIn from "./FormLogIn.js";

class PageLoginRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formLogIn: true
        };
      }
      
  componentDidUpdate(){
  }

  componentDidMount() {
  }

  changeForm = e => {
    this.setState({formLogIn: !this.state.formLogIn});
  }

  render() {
    const form = (this.state.formLogIn)? <FormLogIn/> : <FormSignIn/>
    return (
      <div>
        <label>Change form</label><input type="checkbox" onChange={this.changeForm}/>
        {form}
      </div>
    );
  }
}

export default PageLoginRegister;