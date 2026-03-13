export function requireRole(role) {
  return (req, res, next) => {
    const roles = req.auth.roles || req.auth.realm_access?.roles || [];
    if (!roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
}