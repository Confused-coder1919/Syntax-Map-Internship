const QuizDao = require('./QuizDao');

class QuizService {
    #quizDao = new QuizDao();

    INSERT(bodyNewQuiz, callback) {
        if (bodyNewQuiz) {
            this.#quizDao.INSERT(bodyNewQuiz, callback);
        } else {
            this.#quizDao.ErrorHandling({ code: null }, callback);
        }
    }

    UPDATE(quiz, callback) {
        this.#quizDao.UPDATE(quiz, callback);
    }

    SELECT(criteria, callback) {
        if (criteria) {
            this.#quizDao.SELECT(criteria, callback);
        } else {
            this.#quizDao.ErrorHandling({ code: null }, callback);
        }
    }

    DELETE(quiz, callback) {
        this.#quizDao.DELETE(quiz, callback);
    }
}

module.exports = QuizService;
