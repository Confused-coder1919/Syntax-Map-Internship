import React from "react";

class FormSignIn extends React.Component {

    constructor(props){
        super(props);
        this.state={
            email: "",
            username:"",
            error: ""
        }
    }

  handleUsername = e => {
    this.setState({username: e.target.value});
  }
  
  handleEmail = e => {
    this.setState({email: e.target.value});
  }

  handleSubmit = e => {
    e.preventDefault();
    console.log(e);
    fetch(process.env.REACT_APP_API_URL + "/user/register",{
    method: "POST",
    body: JSON.stringify({
        user_name: this.state.username,
        user_email_address: this.state.email
    }),
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
    })
    .then(res => {res.json()
    .then((res) => { this.setState({error:res.msg}) })});
  }

  render() {
    const error = this.state.error.length > 0 ? <p>{this.state.error}</p> : null
    return (
     <div className="register">
        <h2>Register</h2>
        <form onSubmit={this.handleSubmit}>
            <label>Name</label><input type="text" onChange={this.handleUsername} required/><br/>
            <label>Email</label><input type="email" onChange={this.handleEmail} required/><br/>
            <label>Register</label><input type="submit"/><br/>
        </form>
        {error}
     </div>
    );
  }
}

export default FormSignIn;