// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

// import uuid module
const { v4: uuidv4 } = require('uuid');

// import Goal resource
const Goal = require('./Goal.js');

// import Interface Dao
const InterfaceDao = require('../InterfaceDao.js');

class GoalDao extends InterfaceDao {

    constructor() {
        super();
    }

    // GOAL DAO : Public methods    // Get goals based on criteria
    SELECT(criteria, callback) {
        let query = "SELECT * FROM learning_goal WHERE 1=1";
        let values = [];
        let paramCount = 1;
        
        // Build query based on criteria
        if (criteria.id) {
            query += ` AND id = $${paramCount}`;
            values.push(criteria.id);
            paramCount++;
        }
        
        if (criteria.user_id) {
            query += ` AND user_id = $${paramCount}`;
            values.push(criteria.user_id);
            paramCount++;
        }
        
        if (criteria.type) {
            query += ` AND type = $${paramCount}`;
            values.push(criteria.type);
            paramCount++;
        }
        
        if (criteria.completed !== undefined) {
            query += ` AND completed = $${paramCount}`;
            values.push(criteria.completed);
            paramCount++;
        }
        
        // Add ordering
        query += " ORDER BY deadline ASC, created_at DESC";
        
        // Execute query
        pool.query(query, values)
            .then(res => {
                let goals = [];
                res.rows.forEach(row => {
                    goals.push(new Goal(null, row, null));
                });
                callback(goals);
            })
            .catch(err => {
                console.error("Error in GoalDao SELECT:", err);
                this.ErrorHandling({
                    code: 500,
                    message: "Database error when selecting goals"
                }, callback);
            });
    }    // Insert a new goal
    INSERT(goal, callback) {
        // Generate timestamp-based ID if not provided
        if (!goal.id) {
            goal.id = Date.now().toString();
        }
        
        const values = [
            goal.id,
            goal.user_id,
            goal.description,
            goal.type,
            goal.target || 100,
            goal.deadline,
            goal.progress || 0,
            goal.completed || false
        ];
        
        const query = `
            INSERT INTO learning_goal(
                id, user_id, description, type, target, 
                deadline, progress, completed, created_at, updated_at
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING *`;
            
        pool.query(query, values)
            .then(res => {
                callback(new Goal(null, res.rows[0], null));
            })
            .catch(err => {
                console.error("Error in GoalDao INSERT:", err);
                this.ErrorHandling({
                    code: 500,
                    message: "Database error when inserting goal"
                }, callback);
            });
    }    // Update an existing goal
    UPDATE(goal, callback) {
        const values = [
            goal.description,
            goal.type,
            goal.target,
            goal.deadline,
            goal.progress,
            goal.completed,
            goal.id
        ];
        
        const query = `
            UPDATE learning_goal
            SET description = $1, type = $2, target = $3, deadline = $4,
                progress = $5, completed = $6, updated_at = NOW()
            WHERE id = $7
            RETURNING *`;
            
        pool.query(query, values)
            .then(res => {
                if (res.rows.length > 0) {
                    callback(new Goal(null, res.rows[0], null));
                } else {
                    this.ErrorHandling({
                        code: 404,
                        message: "Goal not found"
                    }, callback);
                }
            })
            .catch(err => {
                console.error("Error in GoalDao UPDATE:", err);
                this.ErrorHandling({
                    code: 500,
                    message: "Database error when updating goal"
                }, callback);
            });
    }    // Delete a goal
    DELETE(goal, callback) {
        const query = "DELETE FROM learning_goal WHERE id = $1 RETURNING *";
        
        pool.query(query, [goal.id])
            .then(res => {
                if (res.rows.length > 0) {
                    callback(new Goal(null, res.rows[0], null));
                } else {
                    this.ErrorHandling({
                        code: 404,
                        message: "Goal not found"
                    }, callback);
                }
            })
            .catch(err => {
                console.error("Error in GoalDao DELETE:", err);
                this.ErrorHandling({
                    code: 500,
                    message: "Database error when deleting goal"
                }, callback);
            });
    }
}

module.exports = GoalDao;
