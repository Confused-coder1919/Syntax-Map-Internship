const QuizPerformanceDao = require('./QuizPerformanceDao');
const QuizPerformance = require('./QuizPerformance');

class QuizPerformanceService {
  #quizPerformanceDao = new QuizPerformanceDao();

  INSERT(quizPerformance, callback) {
    if (quizPerformance) {
      this.#quizPerformanceDao.INSERT(quizPerformance, callback);
    } else {
      this.#quizPerformanceDao.ErrorHandling({ code: '_NULL_OBJ' }, callback);
    }
  }

  SELECT(criteria, callback) {
    this.#quizPerformanceDao.SELECT(criteria, callback);
  }

  UPDATE(quizPerformance, callback) {
    if (quizPerformance && quizPerformance.id) {
      this.#quizPerformanceDao.UPDATE(quizPerformance, callback);
    } else {
      this.#quizPerformanceDao.ErrorHandling({ code: '_NULL_ID' }, callback);
    }
  }

  DELETE(quizPerformance, callback) {
    if (quizPerformance && quizPerformance.id) {
      this.#quizPerformanceDao.DELETE(quizPerformance, callback);
    } else {
      this.#quizPerformanceDao.ErrorHandling({ code: '_NULL_ID' }, callback);
    }
  }

  // Additional methods for complex queries
  GET_USER_STATS(userId, callback) {
    if (!userId) {
      return this.#quizPerformanceDao.ErrorHandling({ code: '_NULL_USER' }, callback);
    }
    this.#quizPerformanceDao.GET_USER_STATS(userId, callback);
  }

  GET_USER_TENSE_STATS(userId, callback) {
    if (!userId) {
      return this.#quizPerformanceDao.ErrorHandling({ code: '_NULL_USER' }, callback);
    }
    this.#quizPerformanceDao.GET_USER_TENSE_STATS(userId, callback);
  }
}

module.exports = QuizPerformanceService;