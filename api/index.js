const serverless = require('serverless-http');
const app = require('../server/index');

// Export the serverless handler for Vercel
module.exports = serverless(app);
