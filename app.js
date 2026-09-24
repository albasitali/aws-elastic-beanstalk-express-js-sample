const express = require('express');
const app = express();

//Environment variable setup for port
//const port = 8080;

const port = process.env.PORT || 8080;


app.get('/', (req, res) => res.send('Hello World!'));


// Start the web server only when this file is executed directly.
// This allows the Express application to be imported by automated tests.
if (require.main === module) {
    app.listen(port, () => {
        console.log(`App running on http://localhost:${port}`);
    });
}


//app server is running each time
//app.listen(port);
//console.log(`App running on http://localhost:${port}`);

module.exports = app;
