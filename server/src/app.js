const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const cookieSession = require('cookie-session');

const { checkLoggedIn } = require('./services/auth');

const api = require('./routes/api');

const config = {
    CLIENT_ID: process.env.OAUTH_CLIENT_ID,
    CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
};

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('profile', profile);
    done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

// Save the session to the cookie
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Read the session from the cookie
passport.deserializeUser((id, done) => {
    // User.findById(id).then(user => {
    //   done(null, user);
    // });
    done(null, id);
});

const app = express();

app.use(helmet());

app.use(
    cookieSession({
        name: 'session',
        maxAge: 24 * 60 * 60 * 1000,
        keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
    cors({
        origin: 'https://localhost:3000',
    })
);
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['email'],
    }),
    (req, res) => {
        console.log('Google log in');
    }
);
app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failure',
        successRedirect: '/launch',
        session: true,
    }),
    (req, res) => {
        console.log('Google callback');
    }
);
app.get('/auth/logout', (req, res) => {
    req.logout();
    return res.redirect('/');
});

app.get('/failure', (req, res) => {
    res.send('Failed to log in!');
});

app.use(checkLoggedIn);
app.use('/v1', api);

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
