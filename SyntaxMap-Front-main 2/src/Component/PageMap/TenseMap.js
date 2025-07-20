import React from "react";
import TenseMapSVG from "../SVGs/TenseMapSVG.js"

class TenseMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hidden: false
        };
      }
      
  handleClickLeft() {
    console.log(this.state.ButtonValue);
  }

  render() {
    return (
      <div className="tenseMap">
        <h1>Tense Map</h1>
        <TenseMapSVG/>
      </div>
    );
  }
}

export default TenseMap;