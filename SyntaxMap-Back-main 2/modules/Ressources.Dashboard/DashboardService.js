const DashboardDao = require('./DashboardDao');
const Dashboard = require('./Dashboard');

class DashboardService {

	#dashboardDao = new DashboardDao();

	constructor () {
	}

	SELECT (criteria, callback) {
		if (criteria) {
		   this.#dashboardDao.SELECT(criteria, callback);
		} else {
			this.#dashboardDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	INSERT (bodyNewDashboard, callback) {
		if (bodyNewDashboard) {
			this.#dashboardDao.INSERT(bodyNewDashboard, callback);
		} else {
			this.#dashboardDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	UPDATE (dashboard, callback) {
		this.#dashboardDao.UPDATE(dashboard, callback);
	}

	DELETE (dashboard, callback) {
		this.#dashboardDao.DELETE(dashboard, callback);
	}

}

module.exports = DashboardService;
