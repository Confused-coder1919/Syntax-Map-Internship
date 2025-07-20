import React from "react";
import ModMapSVG from "../SVGs/ModMapSVG.js"

class ModMap extends React.Component {
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
      <div className="modMap">
        <h1>MOD</h1>
        <ModMapSVG/>
      </div>
    );
  }
}

export default ModMap;