// Vercel Serverless Function Entry Point
const app = require('./app.js');

// Export the Express app as a serverless function
module.exports = app;

// For development
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Vercel Serverless Function running on port ${PORT}`);
    });
}