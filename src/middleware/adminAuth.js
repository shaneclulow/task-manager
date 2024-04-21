
const adminAuth = async (req, res, next) => {
    
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: 'Access denied. Requires admin role.' });
    }
    next();
}

module.exports = adminAuth;
