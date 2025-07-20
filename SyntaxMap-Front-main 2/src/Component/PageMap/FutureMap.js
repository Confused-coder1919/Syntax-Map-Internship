import React from "react";
import FutureMapSVG from "../SVGs/FutureMapSVG.js"

class FutureMap extends React.Component {
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
      <div className="futureMap">
        <h1>NO FUTURE</h1>
        <FutureMapSVG/>
      </div>
    );
  }
}

export default FutureMap;