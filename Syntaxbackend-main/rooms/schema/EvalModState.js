const schema = require('@colyseus/schema');

const { Question } = require('./Question');

class EvalModState extends schema.Schema {
  constructor(){
    super();
    this.mySynchronizedProperty = "Hello world";
    this.listQuestions = [];
  }
}

schema.defineTypes(EvalModState, {
  mySynchronizedProperty: "string",
  listQuestions: [ Question ]
});

exports.EvalModState = EvalModState;