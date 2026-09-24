const assert = require('assert');
const http = require('http');
const app = require('../app');

const server = app.listen(0, '127.0.0.1', () => {
    const port = server.address().port;

    http.get(`http://127.0.0.1:${port}/`, (res) => {
        let body = '';

        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            try {
                assert.strictEqual(res.statusCode, 200);
                assert.strictEqual(body, 'Hello World!');

                console.log('PASS: GET / returned HTTP 200 and Hello World!');

                server.close(() => {
                    process.exit(0);
                });
            } catch (error) {
                console.error('FAIL:', error.message);

                server.close(() => {
                    process.exit(1);
                });
            }
        });
    }).on('error', (error) => {
        console.error('FAIL:', error.message);

        server.close(() => {
            process.exit(1);
        });
    });
});
