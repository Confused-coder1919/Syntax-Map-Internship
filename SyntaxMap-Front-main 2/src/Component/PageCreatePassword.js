import React from "react";
import { withRouter } from "react-router-dom";

class PageCreatePassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: "",
            checkPassword: "",
            error: "",
            token: this.props.match.params.token
        };
      }
      
  componentDidUpdate(){
  }

  componentDidMount() {
      fetch(process.env.REACT_APP_API_BASE_URL + "/token/check",{
            method: "Get",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization" : "Bearer " + this.state.token
            }
            })
            .then(res => {res.json()
            .then((res) => { console.log(res) })});//this.props.history.push()
  }

  handleConfirmPassword = e => {
    this.setState({checkPassword: e.target.value});
  }
  
  handlePassword = e => {
    this.setState({password: e.target.value});
  }

  handleSubmit = e => {
        e.preventDefault();
        if (this.state.password === this.state.checkPassword) {
        fetch(process.env.REACT_APP_API_BASE_URL + "/user/password",{
        method: "POST",
        body: JSON.stringify({
            user_password: this.state.password
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Authorization" : "Bearer " + this.state.token
        }
        })
        .then(res => {res.json()
        .then((res) => { this.setState({error: "You can log in"}); this.props.history.push("/login_register") })});
    }
    else
        this.setState({error: "password must be identical"})
  }

  render() {
    const error = this.state.error.length > 0 ? <p>{this.state.error}</p> : null

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
            <label>Password</label><input type="Password" onChange={this.handlePassword} required/><br/>
            <label>Confirm Password</label><input type="password" onChange={this.handleConfirmPassword} required/><br/>
            <input type="submit"/><br/>
        </form>
        {error}
      </div>
    );
  }
}

export default withRouter(PageCreatePassword);