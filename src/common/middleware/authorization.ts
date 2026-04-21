import { Request, Response, NextFunction } from "express";

type Role = "user" | "admin" | "moderator";

export const authorization = (roles: Role[] = []) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user?.role;

        if (!userRole) {
            return res.status(401).json({ message: "Unauthorized - no user found" });
        }

        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        next();
    };
};