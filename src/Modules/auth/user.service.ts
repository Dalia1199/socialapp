import { NextFunction, Request, Response } from "express";
import { IsignupType,IconfirmemailType, IsigninType } from "./auth.dto";
import { HydratedDocument, Model, Types } from "mongoose";
import  usermodel, { Iuser } from "../../db/models/user.model";
import { AppError } from "../../common/utilis/global-error-handler";
import { userRepository } from "../../db/repositry/user repository ";
import {  compare,  hash} from "../../common/utilis/security/hash";
import { generateotp, sendemail } from "../../common/utilis/email/send email";
import { emailtemplete } from "../../common/utilis/email/emai.templete";
import { EventEnum } from "../../common/enum/event.enum";
import { eventemitter } from "../../common/utilis/email/email.events";
import { providerenum } from "../../common/enum/userenum";
import { successresponse } from "../../common/utilis/response.success";
import redisService from "../../common/service/redis.service";
import { randomUUID } from "crypto";
import tokenService from "../../common/service/token service";
import { refreshsecretkey, secret_key } from "../../conflig/conflig.service";

class userservice {
    private readonly _usermodel = new userRepository()
    private readonly _redisservice = redisService
    private readonly _tokenservice = tokenService
    constructor() {
    }

    signup = async (req: Request, res: Response, next: NextFunction) => {
        let { email, password, age, gender }: IsignupType = req.body

        //concept data to object 
       if(await this._usermodel.findOne({filter:{email}})){
         throw new AppError("email already exists",409)
        }
     
             const otp=await generateotp()
             eventemitter.emit(EventEnum.confirmemail,async()=>{
        await sendemail({to:email,subject:"welcome to our app",html:emailtemplete(otp)})
        await this._redisservice.setvalue({ key: this._redisservice.otp_key({ email,subject: EventEnum.confirmemail }), value: hash({ plain_text: `${otp}` }), ttl: 60 * 2 })
        await this._redisservice.setvalue({ key: this._redisservice.max_otp_key( email ), value: "1", ttl: 60 * 30 })
             })
        const user: HydratedDocument<Iuser> = await this._usermodel.create({
            email,
            password: hash({ plain_text: password }),
            age, gender
        } as Partial<Iuser>)
        res.status(200).json({ message: "user signed up successfuly", user })
    }
    confirmemail = async (req: Request, res: Response, next: NextFunction) => {
        const { email, code }: IconfirmemailType= req.body
        const otpexist = await this._redisservice.get(this._redisservice.otp_key({ email }))
        if (!otpexist) {
            throw new AppError("otp expired");

        }
        if (!compare({
            plain_text: code, cipher_text: otpexist

        })) {
            throw new AppError("invalid otp ");
        }
        const user = await this._usermodel.findoneAndUpdate({
            filter: { email, confirmed: { $exists: false }, provider: providerenum.system },
            update: { confirmed: true }
        })
        if (!user) {
            throw new  AppError("user not exist");
        } 
        await this._redisservice.deleletekey(this._redisservice.otp_key({ email }))
        successresponse({ res, message: "email confirmed successfuly" })

    }

  signin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } : IsigninType = req.body
    const user = await this._usermodel.findOne({
       filter: { email ,
        provider: providerenum.system ,
        confirmed: {$exists:true}
       }
      })
      if (!user) {
        throw new AppError("invalid email or password", 400);}
        if (!compare({ plain_text: password, cipher_text: user.password })) {
          throw new AppError("invalid  password", 400);
        }
          const uuid=randomUUID()
          const access_token= this._tokenservice.generatetoken({
            payload: { id: user._id, email: user.email },
            secret_key: secret_key!,
            options: { expiresIn: "1h",jwtid:uuid }
          })
          const refresh_token=this._tokenservice.generatetoken({
            payload: { id: user._id, email: user.email },
            secret_key: refreshsecretkey!,
            options: { expiresIn: "7d",jwtid:uuid }
          })
successresponse({ res, message: "user signed in successfuly", data: { access_token,refresh_token}})

    }
     getprofile = async (req: Request, res: Response, next: NextFunction) => {
    
        successresponse({ res, message: "user signed in successfuly", data: {user: req.user } })

    }
}


export default new userservice()
// انا مش محتاجه ابعت parameter فبعت instance لكن لو عايزه ابعت parameter هبعت class نفسه