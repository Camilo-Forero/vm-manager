import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "ifx_vm_super_secret_jwt_key_2026";
export function authenticateToken(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: "Authentication required. Please log in." });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: "Invalid or expired session token." });
    }
}
export function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }
    next();
}
