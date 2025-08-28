const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(methodOverride('_method')); // Common usage with forms

// CORS headers (if needed beyond the `cors()` middleware)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Routes
app.get('/', (req, res) => {
    res.send({ status: 'ok' });
});

// Start server
app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`);
});
