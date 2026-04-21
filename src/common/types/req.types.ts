

import { HydratedDocument } from "mongoose";
import { Iuser } from "../../db/models/user.model";
import { JwtPayload } from "jsonwebtoken";

//  export interface IRequet extends Request {
//     user?:HydratedDocument<Iuser>;
// decoded?: JwtPayload}
declare module "express-serve-static-core"{
    interface Request {
        user:HydratedDocument<Iuser>;
        decoded:JwtPayload}
} 