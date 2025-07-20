import React from "react";

class FormAddClasse extends React.Component {

    constructor(props){
        super(props);
        this.state={
            classe_name: "",
            students_id: ""
        }
    }
    
  handleClasseNameInput = e => {
    this.setState({classe_name: e.target.value});
  }
  handleStudentIdInput = e => {
    this.setState({students_id: e.target.value});
  }

  handleSubmit = e => {
    e.preventDefault();
    console.log(e);
    //if (localStorage.getItem('jstoken') !== "") {
        fetch(process.env.REACT_APP_API_BASE_URL + "/classe",{
        method: "POST",
        body: JSON.stringify({
                students_id: this.state.students_id.split('\n'),
                classe_name: this.state.classe_name
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Authorization" : localStorage.getItem('jstoken')
        }
        })
        .then(res =>res.json())
        .then((res) => {console.log(res);})
        .catch((err) => {console.log(err)});
    //}
  }

  render() {
    return (
     <div className="Upload">
        <h2>Add a course</h2>
        <form onSubmit={this.handleSubmit}>
            <label>Classe name</label><input type="text" onChange={this.handleClasseNameInput}/><br/>
            <label>List Students id</label><textarea onChange={this.handleStudentIdInput}/><br/>
            <input type="submit"/><br/>
        </form>
     </div>
    );
  }
}

export default FormAddClasse;