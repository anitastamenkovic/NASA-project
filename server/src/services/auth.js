const passport = require('passport');
const cookieSession = require('cookie-session');
const { Strategy } = require('passport-google-oauth20');

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


function initializePassport(app) {
    passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));
    
    // Save the session to the cookie
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    // Read the session from the cookie
    passport.deserializeUser((id, done) => {
        done(null, id);
    });
    
    app.use(
        cookieSession({
            name: 'session',
            maxAge: 24 * 60 * 60 * 1000,
            keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
}

function authenticateGoogle(req, res) {
    passport.authenticate('google', {
        scope: ['email'],
    })(req, res);
}

function handleGoogleCallback(req, res) {
    passport.authenticate('google', {
        failureRedirect: '/failure',
        successRedirect: '/launch',
        session: true,
    })(req, res);
}

function logout(req, res) {
    req.logout();
    return res.redirect('/');
}

function checkLoggedIn(req, res, next) {
    console.log('Current user is:', req.user);
    const isLoggedIn = req.isAuthenticated() && req.user;
    if (!isLoggedIn) {
        return res.status(401).json({
            error: 'You need to log in to access this page.',
        });
    }
    next();
}

module.exports = {
    initializePassport,
    authenticateGoogle,
    handleGoogleCallback,
    checkLoggedIn,
    logout,
};
