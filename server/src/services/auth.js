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
    checkLoggedIn,
};
