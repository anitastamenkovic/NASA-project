const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

const {
    initializePassport,
    authenticateGoogle,
    handleGoogleCallback,
    checkLoggedIn,
    logout,
} = require('./services/auth');
const api = require('./routes/api');

const app = express();

app.use(helmet());
initializePassport(app);
app.use(
    cors({
        origin: 'https://localhost:3000',
    })
);
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/auth/google', authenticateGoogle);
app.get('/auth/google/callback', handleGoogleCallback);
app.get('/auth/logout', logout);

app.get('/failure', (req, res) => {
    res.send('Failed to log in!');
});

app.use(checkLoggedIn);
app.use('/v1', api);

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
