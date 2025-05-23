const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
};

const isSalesManager = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role_id === 0) { // Assuming role_id 0 is Sales Manager
        return next();
    }
    return res.status(403).json({ message: 'Forbidden. Sales Manager access required.' });
};

module.exports = { isAuthenticated, isSalesManager }; 