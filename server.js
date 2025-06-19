require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    server.use('/static', express.static('public'));

    server.use((req, res) => {
        return handle(req, res);
    });

    const port = process.env.PORT || 5000;
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});
