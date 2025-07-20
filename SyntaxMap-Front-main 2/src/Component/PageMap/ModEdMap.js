import React from "react";
import ModEdMapSVG from "../SVGs/ModEdMapSVG.js"

class ModEdMap extends React.Component {
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
      <div className="modEdMap">
        <h1>MOD ED</h1>
        <ModEdMapSVG/>
      </div>
    );
  }
}

export default ModEdMap;