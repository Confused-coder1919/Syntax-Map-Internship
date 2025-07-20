import React from "react";
import { Fragment } from "react"

class Dictionnary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            words: []
        };
      }
     

    getWords(){
        fetch(process.env.REACT_APP_API_URL + "/dictionnary/user",{
        method: "GET",
        headers: {
            "Authorization" : localStorage.getItem('jstoken')
        }
        })
        .then(res =>res.json())
        .then((res) => {
        console.log(res);
        this.setState({words: res});
        });
    }
    
    componentDidMount() {
    console.log("componentDidMount");
    this.getWords();
  }
  render() {
    return (
      <div>
        <h3>Your word</h3>
        {this.words.map((index, word) => {
            fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word)
            .then(res =>res.json())
            .then((res) => {console.log(res)
            return <Fragment><p>{word}</p><div>{res}</div></Fragment>});
            return null;
        })}
      </div>
    );
  }
}

export default Dictionnary;