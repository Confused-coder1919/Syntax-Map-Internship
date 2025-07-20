const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");  // use HTTP for local dev
const cors = require("cors");
const passport = require('passport');
const { Server } = require('colyseus');
const { monitor } = require("@colyseus/monitor");
require('dotenv').config();

const { MyRoom } = require("./rooms/MyRoom");
const { EvalMod } = require("./rooms/EvalMod");
const { SpeedMod } = require("./rooms/SpeedMod");

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://linguistic-com.herokuapp.com',
  'https://linguistic-com-qa.herokuapp.com'
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (mobile apps, curl, postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(bodyParser.json());

require('./config/passportConfig')(passport);
app.use(passport.initialize());

require('./index-v2.js')(app); // your app routes

// Create HTTP server (for local dev)
const server = http.createServer(app);

// Initialize Colyseus game server with your HTTP server
const gameServer = new Server({ server });

gameServer.define('my_room', MyRoom);
gameServer.define('evaluation', EvalMod);
gameServer.define('speed_duel', SpeedMod);

// Add Colyseus monitor route (optional, for debugging)
app.use("/colyseus", monitor());

const PORT = process.env.PORT || 3000;
gameServer.listen(PORT);
console.log("Server started on port " + PORT);
