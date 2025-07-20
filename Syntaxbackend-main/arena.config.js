const Arena = require("@colyseus/arena").default;
const { monitor } = require("@colyseus/monitor");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const passport = require('passport');

/**
 * Import your Room files
 */
const { MyRoom } = require("./rooms/MyRoom");
const { EvalMod } = require("./rooms/EvalMod");
const { SpeedMod } = require("./rooms/SpeedMod");

// Allow localhost and any production URLs
const urls = ['http://localhost:3000', 'https://linguistic-com.herokuapp.com', 'https://linguistic-com-qa.herokuapp.com']

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
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });
        
        // Add a health-check endpoint for frontend connectivity detection
        app.get("/health-check", (req, res) => {
            res.status(200).send({ status: "ok" });
        });
        
        app.head("/health-check", (req, res) => {
            res.status(200).end();
        });
        
        // Use more secure CORS settings that still allow our frontend
        app.use(cors({
            origin: [
                'http://localhost:3000',               // Local development
                'https://syntaxfrontend.vercel.app',   // Production frontend
                
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            credentials: true,
            maxAge: 86400 // Cache preflight requests for 24 hours
        }));
        
        // Removed global multer configuration to prevent conflicts
        // Each route will handle its own file uploads with the centralized config
        
        app.use(express.static('public'));
        // Serve uploaded files from the uploads directory
        app.use('/uploads', express.static('uploads'));
        
        // Configure body-parser middleware with increased size limits
        app.use(bodyParser.json({ limit: '5mb' }));
        app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
        
        require('./config/passportConfig')(passport);
        app.use(passport.initialize());

        // Load all routes from the routes-v2 directory
        require('./index-v2.js')(app);
        
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },

    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }

});
