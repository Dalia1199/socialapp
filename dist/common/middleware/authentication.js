"use strict";
// import { Request, Response, NextFunction } from "express";
// import { secret_key } from "../../../conflig/conflig.service";
// import userModel from "../../db/models/user.model
// import { get, revokedKey } from "../../DB/redis/redis.service";
// import { verifyToken } from "../utils/token.service";
Object.defineProperty(exports, "__esModule", { value: true });
// export const authentication = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const authorization = req.headers.authorization;
//         if (!authorization) {
//             throw new Error("Token not found");
//         }
//         const [prefix, token] = authorization.split(" ");
//         if (prefix !== "Bearer" || !token) {
//             throw new Error("Invalid token format");
//         }
//         const decoded = verifyToken({
//             token,
//             secret_key,
//         });
//         if (!decoded || !decoded.id) {
//             throw new Error("Invalid token");
//         }
//         const user = await userModel.findById(decoded.id);
//         if (!user) {
//             throw new Error("User not found");
//         }
//         if (
//             user.changeCredential?.getTime &&
//             user.changeCredential.getTime() > decoded.iat * 1000
//         ) {
//             throw new Error("Token expired due to password change");
//         }
//         const isRevoked = await get(
//             revokedKey({ userId: decoded.id, jti: decoded.jti })
//         );
//         if (isRevoked) {
//             throw new Error("Token has been revoked");
//         }
//         (req as any).user = user;
//         (req as any).decoded = decoded;
//         next();
//     } catch (err) {
//         next(err);
//     }
// };
