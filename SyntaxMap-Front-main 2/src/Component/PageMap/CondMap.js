import React from "react";
import CondMapSVG from "../SVGs/CondMapSVG.js"

class CondMap extends React.Component {
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
      <div className="condMap">
        <h1>CONDITIONNALS</h1>
        <CondMapSVG/>
      </div>
    );
  }
}

export default CondMap;