import { Request, Response, NextFunction } from "express";
import { AppError } from "../utilis/global-error-handler";
import {Prefix,  secret_key} from "../../conflig/conflig.service"
import tokenService from "../service/token service";
import { userRepository } from "../../db/repositry/user repository ";
 import redisService from "../service/redis.service";
const usermodel = new userRepository()


export const authentication = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  
        const {authorization} = req.headers

        if (!authorization) {
            throw new  AppError("Token not found");
        }

        const [prefix, token]:  string[] = authorization.split(" ");

    if (prefix !==Prefix) {
            throw new  AppError("Invalid token prefix");
        } if (!token) {
            throw new  AppError("token not found");
        }

    const decoded = tokenService.verifytoken({
            token,
            secret_key:secret_key!,
        });

        if (!decoded?.id) {
            throw new AppError("Invalid token payload");
        }

        const user = await usermodel.findOne({ filter:{ id: decoded.id } })

        if (!user) {
            throw new AppError("User not found",400);
        }
if (!user.confirmed){
    throw new AppError("Please confirm your email to access this resource",400)
}
        // if (
        //     user.changeCredential?.getTime &&
        //     user.changeCredential.getTime() > decoded.iat * 1000
        // ) {
        //     throw new AppError("Token expired due to password change");
        // }

        const revokedtoken  = await  redisService.get(redisService.revokedkey({ userid: decoded.id, jti: decoded.jti! }));
       

        if (revokedtoken) {
            throw new AppError("Token has been revoked");
        }
       req.user = user
        req.decoded= decoded
     next()
    }