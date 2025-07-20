const colyseus = require('colyseus');
const { SpeedModState } = require('./schema/SpeedModState');

const { Question } = require('./schema/Question');

// import question ressources
const QuestionClass = require('../modules/Ressources.Question/Question.js');
const QuestionService = require('../modules/Ressources.Question/QuestionService.js');

exports.SpeedMod = class extends colyseus.Room {

  onCreate (options) {
    this.setState(new SpeedModState(options));

    this.onMessage("start", (client, message) => {
      //
      // handle start room
      //
      this.clock.start();
      let criteria = {
				online_exam_ids: this.metadata.course_id,
				limit: this.metadata.nbQuestions,
				order: 'random'
		};
        console.log(criteria);
        this.state.winnerTime = 20 * criteria.limit + 10 * criteria.limit;
        this.state.timeLimit =  20 * criteria.limit;
        const questionService = new QuestionService();
        questionService.SELECT(criteria, (questions) => {
			if (questions.code) {
				return;
			} else {
                console.log(message);
				let results = [];
				questions.forEach(item => { results.push(new Question(item.toObject(true, true, true)));})
                this.state.listQuestions = results;
                console.log(this.state.listQuestions);
                this.clock.setTimeout(() => {this.broadcast("finish",{winner:this.winner})}, 20000 * criteria.limit)
                this.broadcast("start",{});
            }
      })
    });
    
    this.onMessage("chat", (client, message) => {
      //
      // handle "chat" message.
      //
      this.broadcast("chat", `(${client.sessionId}) ${message}`);
      console.log(message);
    });
    
    this.onMessage("update", (client, message) => {
      //
      // handle "update" room setting.
      //
      this.setMetadata({name: message.roomName, pwd:message.roomPwd, course:message.course, course_id:message.coursse_id, nbQuestions: message.nbQuestions});
      console.log(message);
    });
    
    this.onMessage("finish", (client, message) => {
        let time = message.errors * 10;
        if (time < this.state.winnerTime) {
            this.state.winner = client.sessionId
            this.state.winnerTime = time
        }
    })
    this.setMetadata({name: options.roomName, pwd:options.roomPwd, course:options.course, course_id: options.course_id, nbQuestions: options.nbQuestions});
    console.log(options);
  }

  onJoin (client, options) {
    console.log(client.sessionId, "joined!");
    if (this.clients.length === 1)
        client.send("master", {isMaster:true});
    else
        client.send("master", {isMaster:false});
  }

  onLeave (client, consented) {
    console.log(client.sessionId, "left!");
    console.log(this.clients);
        client.send("master", {isMaster:true});
    if (this.clients.length > 0)
        this.clients[0].send("master", {isMaster:true});
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
