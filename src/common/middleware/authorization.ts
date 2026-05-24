import { Request, Response, NextFunction } from "express";
import { AppError } from "../utilis/global-error-handler";
import { GraphQLError } from "graphql";

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
export const authorizationg= async(roles:string[],role:string)=>{
    if(!roles.includes(role)){
        throw new GraphQLError("authorization failed",
            {
                extensions:{
                code:"forbidden",
               status:403,
               message:"you don't have permission to access"
            }
        });
    }
}