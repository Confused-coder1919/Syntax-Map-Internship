import React from "react";
import FormAddCourse from "./FormAddCourse.js"
import Button from "../Button.js"

class PageCourseMod extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Courses: [],
            delete: false,
            courseIdDelete: -1,
            courseItemDelete: "",
            courseTitleDelete: ""
        };
    }
      
    componentDidUpdate() {
    }

    componentDidMount() {
        console.log("componentDidMount");
        console.log(localStorage.getItem("test"));

        fetch(process.env.REACT_APP_API_BASE_URL + "/course")
            .then(res => res.json())
            .then((res) => {
                this.setState({ Courses: res.courses })
            })
            .catch((err) => { console.log(err) });
    }

    updateCourse = e => {
        e.preventDefault();
        console.log(e);
        console.log(e.target[0].value);
        console.log(e.target[1].value);
        console.log(e.target[2].value);
        console.log(e.target[3].value);
        console.log(e.target[4].checked);
        fetch(process.env.REACT_APP_API_BASE_URL + "/course/" + e.target[0].value, {
            method: 'PUT',
            body: JSON.stringify({
                course_id: e.target[0].value,
                course_item: e.target[1].value,
                course_title: e.target[2].value,
                course_data: e.target[3].value,
                course_image: null,
                hide: e.target[4].checked
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

    confirm(course_id, course_item, course_title) {
        this.setState({ courseIdDelete: course_id, courseItemDelete: course_item, courseTitleDelete: course_title, delete: true });
    }

    delete() {
        console.log(process.env.REACT_APP_API_BASE_URL + '/course/' + this.state.courseIdDelete);
        fetch(process.env.REACT_APP_API_BASE_URL + '/course/' + this.state.courseIdDelete, {
            method: 'DELETE',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": localStorage.getItem('jstoken')
            }
        })
        .then(res => res.json())
        .then((res) => { console.log(res); })
        .catch((err) => { console.log(err) });
        this.setState({ delete: false, courseIdDelete: -1 });
    }

    render() {
        const deletePopup = this.state.delete ? (
            <div>
                <p>Do you want to delete this course {this.state.courseIdDelete} {this.state.courseItemDelete} {this.state.courseTitleDelete}</p>
                <Button isDisable={false} value="Yes" onClick={() => this.delete()} name="Delete" />
                <Button isDisable={false} value="No" onClick={() => this.setState({ delete: false, courseIdDelete: -1 })} name="Delete" />
            </div>
        ) : null

        return (
            <div>
                <div className="Course">
                    <table>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Item</th>
                                <th>Title</th>
                                <th>Course</th>
                                <th>Image</th>
                                <th>Hide</th>
                                <th>Update</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.Courses.map((course, index) => {
                                    const print = (this.state.courseIdDelete === course.course_id) ? deletePopup : null
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <form id={index} onSubmit={this.updateCourse}></form>
                                                <input form={index} type="hidden" value={course.course_id} />
                                                {course.course_id}
                                            </td>
                                            <td>
                                                <input form={index} type="text" defaultValue={course.course_item} />
                                            </td>
                                            <td>
                                                <input form={index} type="text" defaultValue={course.course_title} />
                                            </td>
                                            <td>
                                                <textarea form={index} defaultValue={course.course_data} />
                                            </td>
                                            <td>
                                                {course.course_image}
                                            </td>
                                            <td>
                                                <input form={index} type="checkbox" defaultChecked={course.hide} />
                                            </td>
                                            <td>
                                                <input form={index} type="submit" />
                                            </td>
                                            <td>
                                                <Button isDisable={false} value="delete" onClick={() => this.confirm(course.course_id, course.course_item, course.course_title)} name="Delete" />
                                            </td>
                                            <td>
                                                {print}
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                    <FormAddCourse />
                </div>
            </div>
        );
    }
}

export default PageCourseMod;
