import React from "react";
import FormAddQuestion from "./FormAddQuestion.js"
import Button from "../Button.js"

class PageQuestionMod extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Questions: [],
            QuestionsFiltered: [],
            delete: false,
            page: 1,
            nbQuestionsPrinted: 100,
            questionIdDelete: -1,
            questionItemDelete: "",
            questionTitleDelete: "",
            titleFilter: "",
            itemFilter: "",
            difficultyFilter: "",
            update: false,
            verifiedFilter: true
        };
    }
      
    componentDidUpdate() {
        if (this.state.update) {
            const tmp = [];
            this.state.Questions.forEach((question) => {
                if (this.filter(question)) {
                    tmp.push(question);
                }
            });
            this.setState({ QuestionsFiltered: tmp, update: false });
        }
    }

    componentDidMount() {
        console.log("componentDidMount");
        console.log(localStorage.getItem("test"));
        fetch(process.env.REACT_APP_API_BASE_URL + "/quiz")
            .then(res => res.json())
            .then((res) => {
                this.setState({ Questions: res.questions, QuestionsFiltered: res.questions })
            })
            .catch((err) => { console.log(err) });
    }

    updateQuestion = e => {
        e.preventDefault();
        fetch(process.env.REACT_APP_API_BASE_URL + "/quiz/" + e.target[0].value, {
            method: 'PUT',
            body: JSON.stringify({
                question_id: e.target[0].value,
                online_exam_ids: e.target[1].value,
                question_title: e.target[2].value,
                answer_title_a: e.target[3].value,
                answer_title_b: e.target[4].value,
                answer_title_c: e.target[5].value,
                answer_title_d: e.target[6].value,
                right_answer: e.target[7].value,
                difficulty: e.target[8].value
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": localStorage.getItem('jstoken')
            }
        })
            .then(res => res.json())
            .then((res) => { console.log(res); })
            .catch((err) => { console.log(err) });
    }

    confirm(question_id, question_item, question_title) {
        this.setState({ questionIdDelete: question_id, questionItemDelete: question_item, questionTitleDelete: question_title, delete: true });
    }

    delete() {
        console.log(process.env.REACT_APP_API_BASE_URL + '/quiz/' + this.state.questionIdDelete);
        fetch(process.env.REACT_APP_API_BASE_URL + '/quiz/' + this.state.questionIdDelete, {
            method: 'DELETE',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": localStorage.getItem('jstoken')
            }
        })
            .then(res => res.json())
            .then((res) => { console.log(res); })
            .catch((err) => { console.log(err) });
        this.setState({ delete: false, questionIdDelete: -1 });
    }

    filter(question) {
        let cond = true;
        if (this.state.difficultyFilter)
            cond = this.state.difficultyFilter == question.difficulty;
        if (this.state.itemFilter && question.online_exam_ids) {
            cond = cond && question.online_exam_ids.join().includes(this.state.itemFilter);
        }
        cond = cond && question.question_title.includes(this.state.titleFilter);
        cond = cond && (question.verified == this.state.verifiedFilter);
        return cond;
    }

    titleFilter = e => {
        this.setState({ titleFilter: e.target.value, update: true });
    }
    difficultyFilter = e => {
        this.setState({ difficultyFilter: e.target.value, update: true });
    }
    itemFilter = e => {
        this.setState({ itemFilter: e.target.value, update: true });
    }
    verifiedFilter = e => {
        this.setState({ verifiedFilter: !this.state.verifiedFilter, update: true });
    }

    render() {
        const deletePopup = this.state.delete ? (
            <div>
                <p>Do you want to delete this question {this.state.questionIdDelete} {this.state.questionItemDelete} {this.state.questionTitleDelete}</p>
                <Button isDisable={false} value="Yes" onClick={() => this.delete()} name="Delete" />
                <Button isDisable={false} value="No" onClick={() => this.setState({ delete: false, questionIdDelete: -1 })} name="Delete" />
            </div>
        ) : null

        return (
            <div>
                <FormAddQuestion />
                <div className="Question">
                    <h4>Filter :</h4>
                    <label>Questions contain:</label><input type="text" onChange={this.titleFilter} />
                    <label>Difficulty:</label><input type="text" onChange={this.difficultyFilter} />
                    <label>Items :</label><input type="text" onChange={this.itemFilter} />
                    <label>Verified :</label><input type="checkbox" checked={this.state.verifiedFilter} onChange={this.verifiedFilter} />
                    <table>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Ids Item</th>
                                <th>Question</th>
                                <th>Answer A</th>
                                <th>Answer B</th>
                                <th>Answer C</th>
                                <th>Answer D</th>
                                <th>Right Answer</th>
                                <th>Difficulty</th>
                                <th>Verified</th>
                                <th>Update</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.QuestionsFiltered.map((question, index) => {
                                    const print = (this.state.questionIdDelete === question.question_id) ? deletePopup : null
                                    if (index < (this.state.page) * this.state.nbQuestionsPrinted && index >= (this.state.page - 1) * this.state.nbQuestionsPrinted && !this.state.update) {
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <form id={index} onSubmit={this.updateQuestion}></form>
                                                    <input form={index} type="hidden" value={question.question_id} />
                                                    {question.question_id}
                                                </td>
                                                <td>
                                                    <input form={index} type="hidden" value={question.online_exam_ids} />
                                                    {question.online_exam_ids ? question.online_exam_ids.join() : null}
                                                </td>
                                                <td>
                                                    <input form={index} type="text" defaultValue={question.question_title} />
                                                </td>
                                                <td>
                                                    <input form={index} type="text" defaultValue={question.answer_title_a} />
                                                </td>
                                                <td>
                                                    <input form={index} type="text" defaultValue={question.answer_title_b} />
                                                </td>
                                                <td>
                                                    <input form={index} type="text" defaultValue={question.answer_title_c} />
                                                </td>
                                                <td>
                                                    <input form={index} type="text" defaultValue={question.answer_title_d} />
                                                </td>
                                                <td>
                                                    <input form={index} type="text" defaultValue={question.right_answer} />
                                                </td>
                                                <td>
                                                    <input form={index} type="text" defaultValue={question.difficulty} />
                                                </td>
                                                <td>
                                                    <input form={index} type="checkbox" defaultChecked={question.verified} />
                                                </td>
                                                <td>
                                                    <input form={index} type="submit" />
                                                </td>
                                                <td>
                                                    <Button isDisable={false} value="delete" onClick={() => this.confirm(question.question_id, question.question_item, question.question_title)} name="Delete" />
                                                </td>
                                                <td>
                                                    {print}
                                                </td>
                                            </tr>
                                        )
                                    }
                                    return null
                                })
                            }
                        </tbody>
                    </table>
                    <Button value="<" isDisable={this.state.page === 1 ? true : false} onClick={() => this.setState({ page: (this.state.page - 1) })} name="Back" />
                    {this.state.page} / {Math.floor(this.state.QuestionsFiltered.length / this.state.nbQuestionsPrinted + 1)}
                    <Button value=">" isDisable={this.state.page === Math.floor(this.state.QuestionsFiltered.length / this.state.nbQuestionsPrinted + 1) ? true : false} onClick={() => this.setState({ page: (this.state.page + 1) })} name="Next" />
                </div>
            </div>
        );
    }
}

export default PageQuestionMod;
