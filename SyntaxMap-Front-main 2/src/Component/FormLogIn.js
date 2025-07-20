import React from "react";

class FormLogIn extends React.Component {

    constructor(props){
        super(props);
        this.state={
            email: "",
            password: "",
            error: ""
        }
    }
  
  handleEmail = e => {
    this.setState({email: e.target.value});
  }
  
  handlePassword = e => {
    this.setState({password: e.target.value});
  }
  
  handleSubmit = e => {
    e.preventDefault();
    console.log(e);
    fetch(process.env.REACT_APP_API_URL + "/user/login",{
    method: "POST",
    body: JSON.stringify({
        user_password: this.state.password,
        user_email_address: this.state.email
    }),
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
    })
    .then(res =>res.json())
    .then((res) => {
        console.log(res);
        if (res.err)
            this.setState({error: res.err});
        if (res.jwt.token) {
            localStorage.setItem("jstoken",res.jwt.token);
            let date = new Date();
            let formattedDate = date.getFullYear() + '-';
            let tmp = (date.getMonth() + 1);
                if (tmp < 10)
                    formattedDate += "0" + tmp;
                else
                    formattedDate += tmp;
                formattedDate += '-' + date.getDate();
            let session = res.last_session
            if (!session || session.split("_")[0] !== formattedDate)
                session = formattedDate + "_1";
            else {
                let next_session = parseInt(session.split("_")[1]) + 1;
                session = formattedDate + "_" + next_session;
            }
            localStorage.setItem("session", session);
            window.location.replace(process.env.REACT_APP_TENSEMAP_URL);
        }
    });
  }

  render() {
    const error = this.state.error.length > 0 ? <p>{this.state.error}</p> : null
    return (
     <div className="login">
        <h2>Log In</h2>
        <form onSubmit={this.handleSubmit}>
            <label>Email</label><input type="email" onChange={this.handleEmail} required/><br/>
            <label>Password</label><input type="password" onChange={this.handlePassword} required/><br/>
            <label>Login</label><input type="submit"/><br/>
        </form>
        {error}
     </div>
    );
  }
}

export default FormLogIn;