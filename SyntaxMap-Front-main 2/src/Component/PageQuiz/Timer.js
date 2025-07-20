import React from "react";

class Timer extends React.Component {
  constructor(props){
        super(props);
        this.state = {
            timer:{}
        };
  }

  componentDidMount() {
  this.setState({timer: setInterval(() => {
      if (!this.props.isPause && !this.props.isFinished) {
        this.props.action();
            if (this.props.time === 0) {
                this.props.onEnd();
            }
      }
  },1000)});
  }

  componentWillUnmount(){
    this.setState({timer: clearInterval(this.state.timer)})
  }

  render() {
    return (
    <div className="timer">
        {this.props.time}
    </div>
    );
  }
}

export default Timer;