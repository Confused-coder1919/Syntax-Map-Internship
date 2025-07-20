import React from "react";
import Modal from "react-modal"
import {ModalContext} from "../Contexts/ModalContext.js"

class ModalDefinition extends React.Component {
  static contextType = ModalContext;

  componentDidMount(){
  }

  componentDidUpdate() {
}

  render() {
    return (
    <ModalContext.Consumer>{(context) => {
        console.log(context);
        const { isOpen, setClose } = context;
        console.log(context);
        return (
        <Modal isOpen={isOpen} onRequestClose={setClose}>

            {
                this.props.definition.map((def, index) => {
                    return <div style={{border: "solid"}} key={index}>{this.props.word}: {def.meanings.map((meaning, i) => {
                        return <div key={i}>Part of speech: {meaning.partOfSpeech} {meaning.definitions.map((d,j) => {
                            return <div key={j}><p>definition: {d.definition}</p><p>example: {d.example}</p></div>
                        })}</div>
                    })}
                    <p>Origin: {def.origin}</p>
                    <p>Phonetic: {def.phonetic}</p>
                    
                    </div>
                })
            }
        </Modal>);
    }
    }
    </ModalContext.Consumer>
    );
  }
}

export default ModalDefinition;