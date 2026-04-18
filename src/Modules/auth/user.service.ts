import { NextFunction, Request, Response } from "express";
import { issignuptype } from "./auth.dto";
import { HydratedDocument, Model, Types } from "mongoose";
import usermodel, { Iuser } from "../../db/models/user.model";
import { BaseRepository } from "../../db/repositry/base.repository";
import { AppError } from "../../common/utilis/global-error-handler";
import { userRepository } from "../../db/repositry/user repository ";
import {  hash } from "node:crypto";

class userservice {
    private readonly _usermodel = new userRepository()
    constructor() {
    }

    signup = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password, age, gender }: issignuptype = req.body
        //concept data to object 
        const user: HydratedDocument<Iuser> = await this._usermodel.create({ email,
             password:hash({plain_text:password}), 
             age, gender } as Partial<Iuser>)

        res.status(200).json({ message: "user signed up successfuly", user })
    }

    signin = async (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json({ message: "user signed in successfuly" })
    }
}
export default new userservice()
// انا مش محتاجه ابعت parameter فبعت instance لكن لو عايزه ابعت parameter هبعت class نفسه