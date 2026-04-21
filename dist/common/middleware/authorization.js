"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
const authorization = (roles = []) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(401).json({ message: "Unauthorized - no user found" });
        }
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: "Not authorized" });
        }
        next();
    };
};
exports.authorization = authorization;
