class Goal {

    #id;
    #user_id;
    #description;
    #type;
    #target;
    #deadline;
    #progress;
    #completed;
    #created_at;
    #updated_at;

    constructor(goal, bddrow, bodyjson) {
        if (goal) {
            this.#id = goal.id;
            this.#user_id = goal.user_id;
            this.#description = goal.description;
            this.#type = goal.type;
            this.#target = goal.target;
            this.#deadline = goal.deadline;
            this.#progress = goal.progress;
            this.#completed = goal.completed;
            this.#created_at = goal.created_at;
            this.#updated_at = goal.updated_at;
        } else if (bddrow) {
            this.#id = bddrow.id;
            this.#user_id = bddrow.user_id;
            this.#description = bddrow.description;
            this.#type = bddrow.type;
            this.#target = bddrow.target;
            this.#deadline = bddrow.deadline;
            this.#progress = bddrow.progress;
            this.#completed = bddrow.completed;
            this.#created_at = bddrow.created_at;
            this.#updated_at = bddrow.updated_at;
        } else if (bodyjson) {
            this.#id = bodyjson.id;
            this.#user_id = bodyjson.user_id;
            this.#description = bodyjson.description;
            this.#type = bodyjson.type;
            this.#target = bodyjson.target || 100;
            this.#deadline = bodyjson.deadline;
            this.#progress = bodyjson.progress || 0;
            this.#completed = bodyjson.completed || false;
            this.#created_at = bodyjson.created_at;
            this.#updated_at = bodyjson.updated_at;
        } else {
            this.#id = null;
            this.#user_id = null;
            this.#description = null;
            this.#type = null;
            this.#target = 100;
            this.#deadline = null;
            this.#progress = 0;
            this.#completed = false;
            this.#created_at = null;
            this.#updated_at = null;
        }
    }

    toObject() {
        return {
            id: this.#id,
            user_id: this.#user_id,
            description: this.#description,
            type: this.#type,
            target: this.#target,
            deadline: this.#deadline,
            progress: this.#progress,
            completed: this.#completed,
            createdAt: this.#created_at,
            updatedAt: this.#updated_at
        };
    }

    // Getters
    get id() { return this.#id; }
    get user_id() { return this.#user_id; }
    get description() { return this.#description; }
    get type() { return this.#type; }
    get target() { return this.#target; }
    get deadline() { return this.#deadline; }
    get progress() { return this.#progress; }
    get completed() { return this.#completed; }
    get created_at() { return this.#created_at; }
    get updated_at() { return this.#updated_at; }    // Setters
    set id(value) { this.#id = value; }
    set user_id(value) { this.#user_id = value; }
    set description(value) { this.#description = value; }
    set type(value) { this.#type = value; }
    set target(value) { this.#target = value; }
    set deadline(value) { this.#deadline = value; }
    set progress(value) { this.#progress = value; }
    set completed(value) { this.#completed = value; }
    set updated_at(value) { this.#updated_at = value; }
}

module.exports = Goal;
