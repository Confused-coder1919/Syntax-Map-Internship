const schema = require('@colyseus/schema');

const { Question } = require('./Question');

class SpeedModState extends schema.Schema {
  constructor(props){
    super(props);
    console.log(props);
    this.mySynchronizedProperty = "Hello world";
    this.listQuestions = [];
    this.winner = "";
    this.winnerTime = 0;
    this.timeLimit = 0;
    this.currentTime = 0;
  }
}

schema.defineTypes(SpeedModState, {
  mySynchronizedProperty: "string",
  listQuestions: [ Question ],
  winner: "string",
  winnerTime: "number",
  timeLimit: "number",
  currentTime: "number"
});

exports.SpeedModState = SpeedModState;