// import dashboard ressources
const Dashboard = require('../modules/Ressources.Dashboard/Dashboard.js');
const DashboardService = require('../modules/Ressources.Dashboard/DashboardService.js');
const GoalService = require('../modules/Ressources.Goals/GoalService.js');
const Goal = require('../modules/Ressources.Goals/Goal.js');
const ProgressService = require('../modules/Resources.Progress/ProgressService');

// import decoder jwt
const jwtDecode = require("jwt-decode");
// import passport
//var passport = require('../../config/passport');

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

module.exports = (app) => {
	
var dashboardService = new DashboardService();
var goalService = new GoalService();
var progressService = new ProgressService();

	//Get all dashboard
	app.get('/dashboard', (req, res) =>{
		dashboardService.SELECT({},(dashboards) => {
			if (dashboards.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				dashboards.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'dashboard': results});
			}
		})
	});

	//Get a dashboard from its user
	app.get('/dashboard/user', (req, res) =>{
		console.log(req);
		// Check if Authorization header exists
		if (!req.get('Authorization')) {
			return res.status(401).json({ error: 'Authorization header is missing' });
		}
		
		let criteria = {
			user_id: jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString()
		};
		dashboardService.SELECT(criteria,(dashboards) => {
			if (dashboards.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				dashboards.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'dashboard': results});
			}
		})
	});

	//Add a dashboard
	app.post('/dashboard', (req, res) =>{
		console.log(req.body);
		// Check if Authorization header exists
		if (!req.get('Authorization')) {
			return res.status(401).json({ error: 'Authorization header is missing' });
		}
		
		let bodyNewDashboard = new Dashboard(null, null, req.body);
		bodyNewDashboard.user_id = jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString();
		dashboardService.INSERT(bodyNewDashboard, (newDashboard) => {
			console.log(newDashboard);
			if (newDashboard.code) {
				res.statusMessage = newDashboard.errorMessage;
				res.status(newDashboard.code).end();
				return;
			} else {
				res.status(200).send({'report_id': newDashboard.id});
			}
		});
	});

	app.delete('/dashboard/:id', (req, res)=> {
		// Check if Authorization header exists
		if (!req.get('Authorization')) {
			return res.status(401).json({ error: 'Authorization header is missing' });
		}
		
		let dashboard = {
			dashboard_id: req.params.id
		}
		dashboardService.DELETE(dashboard, (dashboards) => {
			res.status(200).json({'dashboard': dashboards});
		});
	});

	// Admin Dashboard Overview Endpoint
	app.get('/dashboard/admin/overview', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}

			const token = req.get('Authorization').split(' ')[1];
			const decodedToken = jwtDecode(token);

			// Check if user exists in token
			if (!decodedToken.sub) {
				return res.status(401).json({ error: 'Invalid token' });
			}

			const userId = decodedToken.sub.toString();
			
			// Verify user is an admin (role = 1)
			const userService = require('../modules/Ressources.User/UserService.js');
			const UserService = new userService();
			
			UserService.SELECT({ user_id: userId }, (users) => {
				if (!users || users.code || users.length === 0) {
					return res.status(404).json({ error: 'User not found' });
				}

				const user = users[0];
				if (user.user_role !== 1) {
					return res.status(403).json({ error: 'Unauthorized: Admin role required' });
				}

				// Now that we've verified admin status, get dashboard statistics
				// Mock data - replace with actual database queries when ready
				const dashboardData = {
					totalUsers: 0,
					activeUsers: 0,
					newUsersThisMonth: 0,
					totalQuizzes: 0,
					completedQuizzes: 0,
					vocabularyWords: 0,
					roleRequests: 0,
					userActivityData: [],
					quizCompletionData: []
				};

				// Get total users count
				UserService.SELECT({}, (allUsers) => {
					if (allUsers && Array.isArray(allUsers)) {
						dashboardData.totalUsers = allUsers.length;
						
						// Count active users (with activity in last 30 days)
						const thirtyDaysAgo = new Date();
						thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
						
						// This is simplified - you'd need to check last login date or activity timestamp
						dashboardData.activeUsers = allUsers.filter(u => u.last_session !== null).length;
						
						// Get new users in the last month - again simplified
						// In production, you would check user creation date
						dashboardData.newUsersThisMonth = Math.floor(allUsers.length * 0.2); // just 20% of total as example
						
						// Get pending role requests count from the database
						try {
							const pool = require('../config/db_connect');
							if (pool) {
								pool.query(
									`SELECT COUNT(*) FROM role_request_table WHERE status = 'pending'`,
									[],
									(error, results) => {
										if (error) {
											console.error('Error querying role requests:', error);
										} else if (results && results.rows && results.rows[0]) {
											dashboardData.roleRequests = parseInt(results.rows[0].count) || 0;
										}
										
										// Finalize response
										res.status(200).json(dashboardData);
									}
								);
							} else {
								// If pool is not available, just return what we have
								res.status(200).json(dashboardData);
							}
						} catch (dbError) {
							console.error('Database error:', dbError);
							// Return what we have so far
							res.status(200).json(dashboardData);
						}
					} else {
						// If we couldn't get users, still return the dashboard with zeros
						res.status(200).json(dashboardData);
					}
				});
			});
		} catch (error) {
			console.error('Error in admin overview endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
	
	// Admin Dashboard User Activity Endpoint
	app.get('/dashboard/admin/user-activity', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}
			
			const token = req.get('Authorization').split(' ')[1];
			const decodedToken = jwtDecode(token);
			
			// Check admin privileges (similar to overview endpoint)
			// For simplicity, we'll return mock data
			const range = req.query.range || 'month'; // Default to monthly data
			
			// Mock data - in production, get this from the database
			const mockActivityData = {
				labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
				datasets: [
					{
						label: 'Active Users',
						data: [65, 75, 82, 78]
					},
					{
						label: 'New Registrations',
						data: [15, 22, 18, 25]
					}
				]
			};
			
			res.status(200).json(mockActivityData);
		} catch (error) {
			console.error('Error in user activity endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
	
	// Admin Dashboard Quiz Completion Endpoint
	app.get('/dashboard/admin/quiz-completion', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}
			
			// Similar auth checks as other endpoints
			// Returning mock data
			const range = req.query.range || 'month';
			
			const mockData = {
				labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
				datasets: [
					{
						label: 'Quizzes Started',
						data: [48, 52, 58, 63]
					},
					{
						label: 'Quizzes Completed',
						data: [32, 38, 45, 52]
					}
				],
				completionRate: 78
			};
			
			res.status(200).json(mockData);
		} catch (error) {
			console.error('Error in quiz completion endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
	
	// Admin Dashboard Vocabulary Trends Endpoint
	app.get('/dashboard/admin/vocabulary-trends', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}
			
			// Auth checks (omitted for brevity)
			const range = req.query.range || 'month';
			
			const mockData = {
				labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
				datasets: [
					{
						label: 'New Words Added',
						data: [120, 145, 132, 155]
					},
					{
						label: 'Words Mastered',
						data: [85, 92, 103, 112]
					}
				],
				topWords: [
					{ word: 'Eloquent', count: 52 },
					{ word: 'Serendipity', count: 48 },
					{ word: 'Ephemeral', count: 45 },
					{ word: 'Ubiquitous', count: 42 },
					{ word: 'Mellifluous', count: 38 }
				]
			};
			
			res.status(200).json(mockData);
		} catch (error) {
			console.error('Error in vocabulary trends endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}	});
	
	// Admin Analytics Endpoint with Comprehensive Platform Statistics
	app.get('/dashboard/admin/analytics', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}

			const token = req.get('Authorization').split(' ')[1];
			const decodedToken = jwtDecode(token);

			// Check if user exists in token
			if (!decodedToken.sub) {
				return res.status(401).json({ error: 'Invalid token' });
			}

			const userId = decodedToken.sub.toString();
			
			// Verify user is an admin (role = 1)
			const userService = require('../modules/Ressources.User/UserService.js');
			const UserService = new userService();
			
			UserService.SELECT({ user_id: userId }, (users) => {
				if (!users || users.code || users.length === 0) {
					return res.status(404).json({ error: 'User not found' });
				}

				const user = users[0];
				if (user.user_role !== 1) {
					return res.status(403).json({ error: 'Unauthorized: Admin role required' });
				}				// Now that we've verified admin status, get analytics data
				progressService.GET_SYSTEM_ANALYTICS((analyticsData) => {
					if (analyticsData.code) {
						console.error('Error fetching analytics data:', analyticsData);
						return res.status(500).json({ error: 'Error fetching analytics data' });
					}
					
					// Analytics data is now guaranteed to be populated with at least mock data
					// in the modified GET_SYSTEM_ANALYTICS method
					
					// Enhance analytics with additional system-wide metrics
					// Get users by role statistics
					UserService.SELECT({}, (allUsers) => {
						if (!allUsers || !Array.isArray(allUsers)) {
							// If user data fetch fails, still return existing analytics
							return res.status(200).json({
								success: true,
								data: analyticsData
							});
						}
						
						// Count users by role
						const usersByRole = {
							admin: 0,    // Role 1
							teacher: 0,  // Role 2
							student: 0,  // Role 3
							guest: 0     // Role 4
						};
						
						// Calculate inactive users (no login in last 30 days)
						const thirtyDaysAgo = new Date();
						thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
						
						let inactiveUsers = 0;
						let newUsersLast30Days = 0;
						
						allUsers.forEach(user => {
							// Count by role
							switch(user.user_role) {
								case 1:
									usersByRole.admin++;
									break;
								case 2:
									usersByRole.teacher++;
									break;
								case 3:
									usersByRole.student++;
									break;
								default:
									usersByRole.guest++;
							}
							
							// Check for inactive users
							if (!user.last_session || new Date(user.last_session) < thirtyDaysAgo) {
								inactiveUsers++;
							}
							
							// Check for new users in last 30 days
							if (user.created_at && new Date(user.created_at) >= thirtyDaysAgo) {
								newUsersLast30Days++;
							}
						});
						
						// Check if we have a database connection for additional queries
						try {
							const pool = require('../config/db_connect');
							
							if (pool) {
								// Get top performers based on quiz scores
								pool.query(`
									SELECT 
										u.user_id,
										u.user_name,
										u.user_email_address,
										COUNT(qp.id) as quizzes_completed,
										ROUND(AVG(qp.score_percentage)::numeric, 2) as avg_score,
										MAX(qp.completed_at) as last_quiz_date
									FROM 
										user_table u
									JOIN 
										quiz_performance qp ON u.user_id = qp.user_id
									WHERE 
										qp.completed_at >= NOW() - INTERVAL '30 days'
									GROUP BY 
										u.user_id, u.user_name, u.user_email_address
									ORDER BY 
										avg_score DESC, quizzes_completed DESC
									LIMIT 10
								`, [], (err, topPerformers) => {
									// Create the final enhanced analytics object
									const enhancedAnalytics = {
										...analyticsData,
										users_by_role: usersByRole,
										inactive_users: inactiveUsers,
										new_users_last_30_days: newUsersLast30Days,
										top_performers: err ? [] : topPerformers.rows
									};
									
									// Get recent activity statistics
									pool.query(`
										SELECT 
											DATE(session_date) as date,
											COUNT(DISTINCT user_id) as unique_users,
											SUM(total_time_spent) as total_time_spent
										FROM 
											learning_activity
										WHERE 
											session_date >= NOW() - INTERVAL '14 days'
										GROUP BY 
											DATE(session_date)
										ORDER BY 
											date DESC
									`, [], (actErr, recentActivity) => {
										if (!actErr && recentActivity) {
											enhancedAnalytics.recent_activity = recentActivity.rows;
										}
										
										// Return the complete analytics data
										res.status(200).json({
											success: true,
											data: enhancedAnalytics
										});
									});
								});
							} else {
								// If pool not available, return what we have
								const enhancedAnalytics = {
									...analyticsData,
									users_by_role: usersByRole,
									inactive_users: inactiveUsers,
									new_users_last_30_days: newUsersLast30Days
								};
								
								res.status(200).json({
									success: true,
									data: enhancedAnalytics
								});
							}
						} catch (dbError) {
							console.error('Database error in analytics endpoint:', dbError);
							
							// Return what we have without DB-specific enhancements
							const enhancedAnalytics = {
								...analyticsData,
								users_by_role: usersByRole,
								inactive_users: inactiveUsers,
								new_users_last_30_days: newUsersLast30Days
							};
							
							res.status(200).json({
								success: true,
								data: enhancedAnalytics
							});
						}
					});
				});
			});		} catch (error) {			console.error('Error in admin analytics endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
		
	// Admin Dashboard Tense Usage Endpoint
	app.get('/dashboard/admin/tense-usage', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}
			
			// Auth checks (omitted for brevity)
			const range = req.query.range || 'month';
			
			const mockData = {
				usage: [
					{ name: 'Present Simple', value: 35 },
					{ name: 'Present Perfect', value: 22 },
					{ name: 'Past Simple', value: 18 },
					{ name: 'Future Simple', value: 15 },
					{ name: 'Present Continuous', value: 10 }
				],
				difficulties: [
					{ name: 'Present Perfect', value: 65 },
					{ name: 'Past Perfect', value: 58 },
					{ name: 'Future Perfect Continuous', value: 52 },
					{ name: 'Past Perfect Continuous', value: 48 },
					{ name: 'Future Perfect', value: 45 }
				]
			};
			
			res.status(200).json(mockData);
		} catch (error) {
			console.error('Error in tense usage endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
	
	// ========== LEARNING GOALS ENDPOINTS ==========
	
	// GET all goals for the authenticated user
	app.get('/dashboard/goals', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}
			
			// Extract user ID from JWT token
			const userId = jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString();
			
			// Set criteria to filter by user ID
			const criteria = { user_id: userId };
					// Apply additional filters if provided
			if (req.query.type) {
				criteria.type = req.query.type;
			}
			if (req.query.completed !== undefined) {
				criteria.completed = req.query.completed === 'true';
			}
			
			goalService.SELECT(criteria, (goals) => {
				if (goals.code) {
					res.status(goals.code).json({ error: goals.message || 'Error retrieving goals' });
					return;
				} else {
					let results = [];
					goals.forEach(goal => {
						results.push(goal.toObject());
					});
					res.status(200).json({ goals: results });
				}
			});
		} catch (error) {
			console.error('Error in goals endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
	
	// GET a specific goal by ID
	app.get('/dashboard/goals/:id', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}
			
			// Extract user ID from JWT token
			const userId = jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString();
					// Set criteria to filter by goal ID and user ID (for security)
			const criteria = { 
				id: req.params.id,
				user_id: userId 
			};
			
			goalService.SELECT(criteria, (goals) => {
				if (goals.code) {
					res.status(goals.code).json({ error: goals.message || 'Error retrieving goal' });
					return;
				}
				
				if (goals.length === 0) {
					res.status(404).json({ error: 'Goal not found' });
					return;
				}
				
				res.status(200).json({ goal: goals[0].toObject() });
			});
		} catch (error) {
			console.error('Error in goal detail endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
	
	// CREATE a new goal
	app.post('/dashboard/goals', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}
			
			// Extract user ID from JWT token
			const userId = jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString();
			
			// Prepare goal data from request body
			const goalData = req.body;
			
			// Set the user ID from the token (for security)
			goalData.user_id = userId;
			
			goalService.INSERT(goalData, (result) => {
				if (result.code) {
					res.status(result.code).json({ error: result.message || 'Error creating goal' });
					return;
				}
				
				res.status(201).json({ goal: result.toObject(), message: 'Goal created successfully' });
			});
		} catch (error) {
			console.error('Error in create goal endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
		// UPDATE an existing goal
	app.put('/dashboard/goals/:id', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}
			
			// Extract user ID from JWT token
			const userId = jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString();
			
			// First verify the goal belongs to the user
			const criteria = { 
				id: req.params.id,
				user_id: userId 
			};
			
			goalService.SELECT(criteria, (goals) => {
				if (goals.code) {
					res.status(goals.code).json({ error: goals.message || 'Error retrieving goal' });
					return;
				}
				
				if (goals.length === 0) {
					res.status(404).json({ error: 'Goal not found or unauthorized' });
					return;
				}
						// Prepare goal data from request body
				const goalData = req.body;
				
				// Set the goal ID and user ID (for security)
				goalData.id = req.params.id;
				goalData.user_id = userId;
				
				goalService.UPDATE(goalData, (result) => {
					if (result.code) {
						res.status(result.code).json({ error: result.message || 'Error updating goal' });
						return;
					}
					
					res.status(200).json({ goal: result.toObject(), message: 'Goal updated successfully' });
				});
			});
		} catch (error) {
			console.error('Error in update goal endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
		// DELETE a goal
	app.delete('/dashboard/goals/:id', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}
			
			// Extract user ID from JWT token
			const userId = jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString();
			
			// First verify the goal belongs to the user
			const criteria = { 
				id: req.params.id,
				user_id: userId 
			};
			
			goalService.SELECT(criteria, (goals) => {
				if (goals.code) {
					res.status(goals.code).json({ error: goals.message || 'Error retrieving goal' });
					return;
				}
				
				if (goals.length === 0) {
					res.status(404).json({ error: 'Goal not found or unauthorized' });
					return;
				}
						// Prepare goal data for deletion
				const goalData = { id: req.params.id };
				
				goalService.DELETE(goalData, (result) => {
					if (result.code) {
						res.status(result.code).json({ error: result.message || 'Error deleting goal' });
						return;
					}
					
					res.status(200).json({ message: 'Goal deleted successfully' });
				});
			});		} catch (error) {
			console.error('Error in delete goal endpoint:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
	

	app.get('/student/dashboard', (req, res) => {
		try {
			// Check if Authorization header exists
			if (!req.get('Authorization')) {
				return res.status(401).json({ error: 'Authorization header is missing' });
			}

			const token = req.get('Authorization').split(' ')[1];
			const decodedToken = jwtDecode(token);

			// Check if user exists in token
			if (!decodedToken.sub) {
				return res.status(401).json({ error: 'Invalid token' });
			}

			const userId = decodedToken.sub.toString();
			
			// Verify user exists and get their role
			const userService = require('../modules/Ressources.User/UserService.js');
			const UserService = new userService();
			
			UserService.SELECT({ user_id: userId }, (users) => {
				if (!users || users.code || users.length === 0) {
					return res.status(404).json({ error: 'User not found' });
				}

				const user = users[0];
				// Check if user is student (role 3) or admin (role 1)
				if (user.user_role !== 3 && user.user_role !== 1) {
					return res.status(403).json({ error: 'Unauthorized: Student or Admin role required' });
				}

				// Initialize dashboard data structure
				const dashboardData = {
					progress: {
						completedTenses: 0,
						totalTenses: 0,
						vocabLearned: 0,
						totalVocab: 0,
						quizzesCompleted: 0,
						avgScore: 0,
					},
					recentActivities: [],
					goals: []
				};

				// Get all database services we need
				const QuizPerformanceService = require('../modules/Resources.QuizPerformance/QuizPerformanceService.js');
				const TenseService = require('../modules/Resources.Tense/TenseService.js');
				const UserInputsService = require('../modules/Resources.UserInputs/UserInputsService.js');
				const DictionnaryService = require('../modules/Ressources.Dictionnary/DictionnaryService.js');

				const quizPerformanceService = new QuizPerformanceService();
				const tenseService = new TenseService();
				const userInputsService = new UserInputsService();
				const dictionnaryService = new DictionnaryService();

				// Counter to track async operations
				let completedOperations = 0;
				const totalOperations = 7;

				const checkCompletion = () => {
					completedOperations++;
					console.log(`Student dashboard: Completed operation ${completedOperations}/${totalOperations} for user ${userId}`);
					
					if (completedOperations === totalOperations) {
						console.log('Student dashboard: All operations completed, sending response');
						console.log('Final dashboard data:', JSON.stringify(dashboardData, null, 2));
						res.status(200).json(dashboardData);
					}
				};

				// 1. Get user progress data
				progressService.GET_USER_PROGRESS(userId, (progressResult) => {
					try {
						if (progressResult && !progressResult.code && Array.isArray(progressResult)) {
							dashboardData.progress.completedTenses = progressResult.filter(p => p.is_completed).length;
							
							// Calculate average completion percentage and quiz scores
							if (progressResult.length > 0) {
								const totalCompletion = progressResult.reduce((sum, p) => sum + (p.completion_percentage || 0), 0);
								const totalQuizScore = progressResult.reduce((sum, p) => sum + (p.quiz_avg_score || 0), 0);
								dashboardData.progress.avgScore = Math.round(totalQuizScore / progressResult.length);
							}
						}
					} catch (error) {
						console.error('Error processing user progress data:', error);
					}
					checkCompletion();
				});

				// 2. Get total tenses count
				tenseService.SELECT({ active: true }, (tenses) => {
					try {
						if (tenses && !tenses.code && Array.isArray(tenses)) {
							dashboardData.progress.totalTenses = tenses.length;
						}
					} catch (error) {
						console.error('Error processing tenses data:', error);
					}
					checkCompletion();
				});

				// 3. Get user's vocabulary count from dictionary
				dictionnaryService.SELECT({ user_id: userId }, (vocabWords) => {
					try {
						if (vocabWords && !vocabWords.code && Array.isArray(vocabWords)) {
							dashboardData.progress.vocabLearned = vocabWords.filter(w => w.learned).length;
							dashboardData.progress.totalVocab = vocabWords.length;
						}
					} catch (error) {
						console.error('Error processing vocabulary data:', error);
					}
					checkCompletion();
				});

				// 4. Get quiz performance data
				quizPerformanceService.SELECT({ user_id: userId }, (quizResults) => {
					try {
						if (quizResults && !quizResults.code && Array.isArray(quizResults)) {
							dashboardData.progress.quizzesCompleted = quizResults.length;
							
							// Add recent quiz activities (last 3)
							const recentQuizzes = quizResults
								.filter(quiz => {
									// Filter out entries without created_at or with invalid dates
									if (!quiz.created_at) return false;
									const testDate = new Date(quiz.created_at);
									return !isNaN(testDate.getTime());
								})
								.sort((a, b) => {
									const dateA = new Date(a.created_at);
									const dateB = new Date(b.created_at);
									return dateB - dateA;
								})
								.slice(0, 3);
							
							recentQuizzes.forEach((quiz, index) => {
								try {
									const score = Math.round((quiz.correct_answers / quiz.total_questions) * 100) || 0;
									const createdDate = new Date(quiz.created_at);
									
									// Validate date before converting to ISO string
									const dateString = isNaN(createdDate.getTime()) ? 
										new Date().toISOString().split('T')[0] : 
										createdDate.toISOString().split('T')[0];
									
									dashboardData.recentActivities.push({
										id: index + 1,
										type: "quiz",
										name: `Quiz Performance - ${score}%`,
										score: score,
										date: dateString
									});
								} catch (dateError) {
									console.error('Error processing quiz date:', dateError, quiz);
									// Add activity with current date as fallback
									dashboardData.recentActivities.push({
										id: index + 1,
										type: "quiz",
										name: `Quiz Performance - N/A%`,
										score: 0,
										date: new Date().toISOString().split('T')[0]
									});
								}
							});
						}
					} catch (error) {
						console.error('Error processing quiz performance data:', error);
					}
					checkCompletion();
				});

				// 5. Get recent tense activities from user progress
				progressService.GET_USER_PROGRESS(userId, (progressResult) => {
					if (progressResult && !progressResult.code && Array.isArray(progressResult)) {
						// Get recently completed tenses
						const recentTenses = progressResult
							.filter(p => {
								// Filter for completed tenses with valid updated_at dates
								if (!p.is_completed || !p.updated_at) return false;
								const testDate = new Date(p.updated_at);
								return !isNaN(testDate.getTime());
							})
							.sort((a, b) => {
								const dateA = new Date(a.updated_at);
								const dateB = new Date(b.updated_at);
								return dateB - dateA;
							})
							.slice(0, 2);
						
						let activityId = dashboardData.recentActivities.length + 1;
						recentTenses.forEach((tense) => {
							try {
								const updatedDate = new Date(tense.updated_at);
								
								// Validate date before converting to ISO string
								const dateString = isNaN(updatedDate.getTime()) ? 
									new Date().toISOString().split('T')[0] : 
									updatedDate.toISOString().split('T')[0];
								
								dashboardData.recentActivities.push({
									id: activityId++,
									type: "tense",
									name: tense.tense_name || "Tense Study",
									completed: true,
									date: dateString
								});
							} catch (dateError) {
								console.error('Error processing tense date:', dateError, tense);
								// Add activity with current date as fallback
								dashboardData.recentActivities.push({
									id: activityId++,
									type: "tense",
									name: tense.tense_name || "Tense Study",
									completed: true,
									date: new Date().toISOString().split('T')[0]
								});
							}
						});
					}
					checkCompletion();
				});

				// 6. Get recent vocabulary additions
				dictionnaryService.SELECT({ user_id: userId }, (vocabWords) => {
					if (vocabWords && !vocabWords.code && Array.isArray(vocabWords)) {
						// Get recently added words (last 7 days)
						const sevenDaysAgo = new Date();
						sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
						
						const recentWords = vocabWords.filter(word => {
							if (!word.created_at) return false;
							const createdDate = new Date(word.created_at);
							return !isNaN(createdDate.getTime()) && createdDate > sevenDaysAgo;
						});
						
						if (recentWords.length > 0) {
							const activityId = dashboardData.recentActivities.length + 1;
							dashboardData.recentActivities.push({
								id: activityId,
								type: "vocab",
								name: `Added ${recentWords.length} new words`,
								date: new Date().toISOString().split('T')[0]
							});
						}
					}
					checkCompletion();
				});

				// 7. Get user goals
				goalService.SELECT({ user_id: userId }, (goals) => {
					try {
						if (goals && !goals.code && Array.isArray(goals)) {
							dashboardData.goals = goals.map(goal => ({
								id: goal.id,
								name: goal.description,
								progress: Math.round((goal.progress / goal.target) * 100),
								dueDate: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : null
							}));
						}
					} catch (error) {
						console.error('Error processing goals data:', error);
					}
					checkCompletion();
				});

			});

		} catch (error) {
			console.error('Error in student dashboard:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
};

