const GoalDao = require('./GoalDao');
const Goal = require('./Goal');

class GoalService {
    
    #goalDao = new GoalDao();

    constructor() {
    }

    // Get goals based on criteria
    SELECT(criteria, callback) {
        this.#goalDao.SELECT(criteria, callback);
    }    // Create a new goal
    INSERT(goalData, callback) {
        if (!goalData) {
            this.#goalDao.ErrorHandling({
                code: 400,
                message: "No goal data provided"
            }, callback);
            return;
        }
        
        // Create a new Goal instance from the provided data
        const goal = new Goal(null, null, goalData);
        
        // Validate required fields
        if (!goal.description || !goal.user_id || !goal.type) {
            this.#goalDao.ErrorHandling({
                code: 400,
                message: "Description, user_id and type are required"
            }, callback);
            return;
        }
        
        // Generate a timestamp-based ID if not provided
        if (!goal.id) {
            goal.id = Date.now().toString();
        }
        
        this.#goalDao.INSERT(goal, callback);
    }    // Update an existing goal
    UPDATE(goalData, callback) {
        if (!goalData || !goalData.id) {
            this.#goalDao.ErrorHandling({
                code: 400,
                message: "Goal ID is required for update"
            }, callback);
            return;
        }
        
        // Create a Goal instance with the updated data
        const goal = new Goal(null, null, goalData);
        
        this.#goalDao.UPDATE(goal, callback);
    }    // Delete a goal
    DELETE(goalData, callback) {
        if (!goalData || !goalData.id) {
            this.#goalDao.ErrorHandling({
                code: 400,
                message: "Goal ID is required for deletion"
            }, callback);
            return;
        }
        
        const goal = new Goal(null, null, goalData);
        
        this.#goalDao.DELETE(goal, callback);
    }
}

module.exports = GoalService;
