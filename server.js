// Root server entrypoint for deployment platforms (Render, Railway, Heroku, etc.)
const path = require('path');

// Change working directory to backend folder so relative paths and configs work seamlessly
process.chdir(path.join(__dirname, 'backend'));

// Start backend Express + Socket.IO server
require('./backend/server.js');
