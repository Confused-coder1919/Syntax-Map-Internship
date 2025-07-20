import React, { Fragment } from "react";

class Dictionnary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [],
      definitions: {}, // store fetched definitions keyed by word
    };
  }

  getWords() {
    fetch(process.env.REACT_APP_API_BASE_URL + "/dictionnary/user", {
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("jstoken"),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        this.setState({ words: res.dictionnary || [] }, () => {
          this.fetchDefinitions();
        });
      });
  }

  fetchDefinitions() {
    // Fetch dictionary definitions for each word
    this.state.words.forEach((wordObj) => {
      const word = wordObj.word; // assuming your word object has a "word" property
      if (!this.state.definitions[word]) {
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
          .then((res) => res.json())
          .then((def) => {
            this.setState((prevState) => ({
              definitions: {
                ...prevState.definitions,
                [word]: def,
              },
            }));
          })
          .catch((err) => {
            console.error("Error fetching definition for", word, err);
          });
      }
    });
  }

  componentDidMount() {
    console.log("componentDidMount");
    this.getWords();
  }

  render() {
    const { words, definitions } = this.state;

    return (
      <div>
        <h3>Your words</h3>
        {words.length === 0 && <p>No words found.</p>}
        {words.map((wordObj, idx) => {
          const word = wordObj.word;
          const def = definitions[word];

          return (
            <Fragment key={idx}>
              <h4>{word}</h4>
              {!def && <p>Loading definition...</p>}
              {def && Array.isArray(def) && def.length > 0 ? (
                <div>
                  {def.map((entry, i) => (
                    <div key={i}>
                      <p><strong>Part of Speech:</strong> {entry.meanings[0]?.partOfSpeech}</p>
                      {entry.meanings[0]?.definitions.map((d, j) => (
                        <p key={j}>{d.definition}</p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No definition found.</p>
              )}
            </Fragment>
          );
        })}
      </div>
    );
  }
}

export default Dictionnary;
