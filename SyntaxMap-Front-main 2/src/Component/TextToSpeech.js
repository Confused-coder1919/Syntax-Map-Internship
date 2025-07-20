import React from "react";
import Button from './Button.js';
import Option from './Option.js';
import '../css/Form.css'

class TextToSpeech extends React.Component {
   constructor(props) {
        super(props);
        
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {this.populateVoiceList()};
        }
        this.state = {
            synth: props.synth,
            Text: "",
            Rate: 1,
            voices: props.voices,
            voice: {}
      }
   }
  
   componentDidMount() {
    this.populateVoiceList();
   }

   componentDidUpdate(prevProps, prevState) {
   }

  populateVoiceList() {
      var voiceListTmp = this.state.synth.getVoices().sort(function (a, b) {
          const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
          if ( aname < bname ) return -1;
          else if ( aname === bname ) return 0;
          else return +1;
      });
      this.setState({voices: voiceListTmp,
      voice: voiceListTmp[0]});
  }
  
  apply() {
    return (
      <Button
        isDisable={false}
        value={this.props.button}
        onClick={() => this.readText()}
        name="Speak"
      />
    );
  }

  handleText = e => {
    this.setState({Text: e.target.value})
  }
  handleRate = e => {
    this.setState({Rate: e.target.value})
  }
  handleVoice = e => {
    var selectedOption = e.target.value;
    for(var i = 0; i < this.state.voices.length ; i++) {
      if((this.state.voices[i].name + ' (' + this.state.voices[i].lang + ')')=== selectedOption) {
        this.setState({voice: this.state.voices[i]})
        break;
      }
    }
  }
  readText() {
    //console.log(this.state.Text);
    if (this.state.synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (this.state.Text !== '') {
    var utterThis = new SpeechSynthesisUtterance(this.state.Text);
    utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
    }
    utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
    }
    utterThis.voice = this.state.voice;
    utterThis.pitch = 1;
    utterThis.rate = this.state.Rate;
    this.state.synth.speak(utterThis);
  }
  }

  render() {
    return (
      <div className="Right">
      <h2>TextToSpeech</h2>
      <hr/>
      <form>
        <textarea value={this.state.Text} onChange={this.handleText} placeholder="Type anything..."/><br/>
        <label>Rate : {this.state.Rate}</label>
        <input type="range" min="0.5" max="2" value={this.state.Rate} step="0.1" onChange={this.handleRate}/><br/>
        <label>Voice</label>
        <select onChange={this.handleVoice}>
        {
        this.state.voices.map((voice, index) => {
            return <Option key={index} value={voice.name + ' (' + voice.lang + ')'} dataLang={voice.lang} dataName={voice.name}/>;
        })
        }
        </select>
      </form>
        {this.apply()}
      </div>
    );
  }
}

export default TextToSpeech;