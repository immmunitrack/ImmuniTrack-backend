// authorize is used after protect. It checks whether the authenticated user's role
// is allowed to access a route, for example authorize('admin') or authorize('employer').
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action' });
  }
  next();
};

module.exports = { authorize };
