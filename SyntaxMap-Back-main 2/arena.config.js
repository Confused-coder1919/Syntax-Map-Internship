const Arena = require("@colyseus/arena").default;
const { monitor } = require("@colyseus/monitor");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require('passport');
const multer = require('multer');
const multerParser = multer();

/**
 * Import your Room files
 */
const { MyRoom } = require("./rooms/MyRoom");
const { EvalMod } = require("./rooms/EvalMod");
const { SpeedMod } = require("./rooms/SpeedMod");

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', // Added this line
  'https://linguistic-com.herokuapp.com',
  'https://linguistic-com-qa.herokuapp.com'
];

module.exports = Arena({
  getId: () => "Your Colyseus App",

  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define('my_room', MyRoom);
    gameServer.define('evaluation', EvalMod);
    gameServer.define('speed_duel', SpeedMod);
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     */

    // Simple test route
    app.get("/", (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    // CORS middleware setup
    app.use(cors({
      origin: function(origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      credentials: true,
    }));

    app.use(multerParser.array());
    app.use(express.static('public'));

    app.use(bodyParser.json());

    require('./config/passportConfig')(passport);
    app.use(passport.initialize());

    require('./index-v2.js')(app);

    // Add the missing /matchmake route to avoid 404 and CORS issues
    app.get('/matchmake', (req, res) => {
      // Example response; replace with your actual matchmaking logic
      res.json({ message: 'Matchmaking endpoint is active' });
    });

    /**
     * Bind @colyseus/monitor
     * It is recommended to protect this route with a password.
     * Read more: https://docs.colyseus.io/tools/monitor/
     */
    app.use("/colyseus", monitor());
  },

  beforeListen: () => {
    /**
     * Before gameServer.listen() is called.
     * You can perform any last setup here.
     */
  }
});
