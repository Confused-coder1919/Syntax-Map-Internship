const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http"); // Changed from https to http
const cors = require("cors");
const passport = require('passport');
const { Server } = require('colyseus');
const { monitor } = require("@colyseus/monitor");
const path = require('path');
const dotenv = require('dotenv');

// First try to load .env file
const envResult = dotenv.config({ path: path.join(__dirname, '.env') });

if (envResult.error) {
  console.warn('⚠️ .env file not found or has errors. Using system environment variables.');
} else {
  console.log('✅ Environment variables loaded from .env file');
}

// This will prevent any other attempt to load environment-specific files
process.env.NODE_ENV_LOADED = 'true';

const { MyRoom } = require("./rooms/MyRoom");
const { EvalMod } = require("./rooms/EvalMod");
const { SpeedMod } = require("./rooms/SpeedMod");

// Configure CORS middleware to allow cross-origin requests
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://syntaxmap.vercel.app',
      'https://syntaxfrontend.vercel.app',
      'https://syntaxbackend.onrender.com',
      'https://flying-raven-gladly.ngrok-free.app',
      /\.ngrok-free\.app$/,
    ];
    
    // Check if the origin is allowed
    const allowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (allowed) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      // For security, we should use false to block unallowed origins in production
      // But for now, allow all origins to fix CORS issues
      callback(null, true); 
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true
}));

// Handle OPTIONS requests explicitly
app.options('*', cors());

// Apply body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add health-check endpoint for frontend connectivity detection
app.get('/health-check', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// Support HEAD requests for health-check (used by frontend connectivity tests)
app.head('/health-check', (req, res) => {
  res.status(200).end();
});

// Initialize passport configuration
require('./config/passportConfig')(passport);
app.use(passport.initialize());

// Initialize routes
require('./index-v2.js')(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Create server
const server = http.createServer(app); // Changed from https to http
const gameServer = new Server({ server });

// Define game rooms
gameServer.define('my_room', MyRoom);
gameServer.define('evaluation', EvalMod);
gameServer.define('speed_duel', SpeedMod);

// Add Colyseus monitor
app.use("/colyseus", monitor());

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});

// Check database connection
const db = require('./config/db_connect');
db.connect()
  .then(() => {
    console.log('Database connection successful');
  })
  .catch(err => {
    console.error('Database connection error:', err);
    // Don't exit process on database error, just log it
  });