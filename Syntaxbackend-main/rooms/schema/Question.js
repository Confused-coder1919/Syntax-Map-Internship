const schema = require('@colyseus/schema');

class Question extends schema.Schema {
    constructor(props) {
        super(props);
        this.question_title = props.question_title;
        this.answer_title_a = props.answer_title_a;
        this.answer_title_b = props.answer_title_b;
        this.answer_title_c = props.answer_title_c;
        this.answer_title_d = props.answer_title_d;
        this.right_answer = props.right_answer;
        this.question_id = props.question_id;
    }
}
schema.defineTypes(Question, {
    question_title: "string",
    answer_title_a: "string",
    answer_title_b: "string",
    answer_title_c: "string",
    answer_title_d: "string",
    right_answer: "string",
    question_id: "number"
});

exports.Question = Question;