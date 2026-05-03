import { NextFunction, Request, Response } from "express";
import { IsignupType,IconfirmemailType, IsigninType, IresendotpType } from "./auth.dto";
import { HydratedDocument, Model, Types } from "mongoose";
import  usermodel, { Iuser } from "../../db/models/user.model";
import { AppError } from "../../common/utilis/global-error-handler";
import { userRepository} from "../../db/repositry/user repository ";
import {  compare,  hash} from "../../common/utilis/security/hash";
import { generateotp, sendemail } from "../../common/utilis/email/send email";
import { emailtemplete } from "../../common/utilis/email/emai.templete";
import { EventEnum } from "../../common/enum/event.enum";
import { eventemitter } from "../../common/utilis/email/email.events";
import { providerenum, RoleEnum } from "../../common/enum/userenum";
import { successresponse } from "../../common/utilis/response.success";
import redisService from "../../common/service/redis.service";
import { Hash, randomUUID } from "crypto";
import tokenService from "../../common/service/token service";
import { refreshsecret_admin, refreshsecretkey_user, secret_key_admin, secret_key_user} from "../../conflig/conflig.service";
import { OAuth2Client } from "google-auth-library";
import { TokenPayload } from "google-auth-library";
import { string } from "zod";
import { s3service } from "../../common/service/s3.servics";
import { xContentTypeOptions } from "helmet";

class userservice {
    private readonly _usermodel = new userRepository()
    private readonly _redisservice = redisService
    private readonly _tokenservice = tokenService
    private readonly _s3service=new s3service()
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
              secret_key: user?.role == RoleEnum.user ? secret_key_user! : secret_key_admin!,
            options: { expiresIn: "1h",jwtid:uuid }
          })
          const refresh_token=this._tokenservice.generatetoken({
            payload: { id: user._id, email: user.email },
              secret_key: user?.role == RoleEnum.user ? refreshsecretkey_user! : refreshsecret_admin!,
            options: { expiresIn: "7d",jwtid:uuid }
          })
successresponse({ res, message: "user signed in successfuly", data: { access_token,refresh_token}})

    }
     getprofile = async (req: Request, res: Response, next: NextFunction) => {
    
        successresponse({ res, message: "user signed in successfuly", data: {user: req.user } })

    }
  signupwithgmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, age, gender }: IsignupType = req.body

    if (await this._usermodel.findOne({ filter: { email } })) {
      throw new AppError("email already exists", 409)
    }

    const user: HydratedDocument<Iuser> = await this._usermodel.create({
      email,
      age,
      gender,
      provider: providerenum.google,
      confirmed: true
    } as Partial<Iuser>)

    successresponse({ res, message: "signup with gmail successfuly", data: { user } })
  }
  loginwithgmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: IsigninType = req.body

    const user = await this._usermodel.findOne({
      filter: {
        email,
        provider: providerenum.google
      }
    })

    if (!user) {
      throw new AppError("user not found", 404)
    }

    const uuid = randomUUID()

    const access_token = this._tokenservice.generatetoken({
      payload: { id: user._id, email: user.email },
      secret_key: user?.role == RoleEnum.user ? secret_key_user! : secret_key_admin!,
      options: { expiresIn: "1h", jwtid: uuid }
    })

    const refresh_token = this._tokenservice.generatetoken({
      payload: { id: user._id, email: user.email },
      secret_key: user?.role == RoleEnum.user ? refreshsecretkey_user! : refreshsecret_admin!,
      options: { expiresIn: "7d", jwtid: uuid }
    })

    successresponse({
      res,
      message: "login with gmail successfuly",
      data: { access_token, refresh_token }
    })
  }
  logout = async (req: Request, res: Response, next: NextFunction) => {

    const { decoded } = req

    await this._redisservice.setvalue({
      key: this._redisservice.revokedkey({
        userid: decoded.id,
        jti: decoded.jti!
      }),
      value: "revoked",
      ttl: 60 * 60 * 24
    })

    successresponse({ res, message: "logout successfuly" })
  }
forgetpassword = async (req: Request, res: Response, next: NextFunction) => {

  const { email } = req.body

  const user = await this._usermodel.findOne({
    filter: {
      email,
      provider: providerenum.system,
      confirmed: { $exists: true }
    }
  })

  if (!user) {
    throw new AppError("user not found")
  }

  await this.sendEmailOtp({ email, subject: EventEnum.forgetpassword })

  successresponse({ res, message: "otp sent to email" })
}

// private sendEmailOtp = async ({
//   email,
//   subject
// }: {
//   email: string
//   subject: EventEnum
// }) => {
//   const otp = await generateotp()

//   await sendemail({
//     to: email,
//     subject: "Reset password code",
//     html: emailtemplete(otp)
//   })

//   await this._redisservice.setvalue({
//     key: this._redisservice.otp_key({ email, subject }),
//     value: hash({ plain_text: `${otp}` }),
//     ttl: 60 * 2
//   })

//   await this._redisservice.setvalue({
//     key: this._redisservice.max_otp_key(email),
//     value: "1",
//     ttl: 60 * 30
//   })
// }

updatepassword = async (req: Request, res: Response, next: NextFunction) => {

    const { oldpassword, newpassword } = req.body
    const { user } = req

    const existuser = await this._usermodel.findOne({
      filter: { _id: user._id }
    })

    if (!existuser) {
      throw new AppError("user not found")
    }

    if (!compare({
      plain_text: oldpassword,
      cipher_text: existuser.password
    })) {
      throw new AppError("invalid old password")
    }

    await this._usermodel.findoneAndUpdate({
      id: user._id ,
      update: {
        password: hash({ plain_text: newpassword }),
        changecerdintial: Date.now()
      }
    })

    successresponse({ res, message: "password updated successfuly" })
  } 
    resetpassword = async (req: Request, res: Response, next: NextFunction) => {

    const { email,code,password } = req.body

const otpvalue= await redisService.get(redisService.otp_key({ email, subject: EventEnum.forgetpassword }))
    if (!otpvalue) {
      throw new Error("invalid or expired otp ")
    }

if (!compare({
    plain_text: code,
    cipher_text: otpvalue
  })) {
    throw new Error("invalid otp ")
  }

const user = await this._usermodel.findoneAndUpdate({
  filter: {
    email,
    confirmed: { $exists: true },
    provider: providerenum.system
  },
  update: {
    password: hash({ plain_text: password }),
    changecerdintial: new Date()
  }
})
if (!user) {
    throw new Error("user not found")}
await redisService.deleletekey(redisService.otp_key({ email, subject: EventEnum.forgetpassword }))
successresponse({ res, message: "password reset successfuly" })
  }
  const sendemailotp = async ({ email, subject } = {email:string, subject: string}) => {
    const isblocked = await redisService.ttl(redisService.block_otp_key( email)) as number
    if ( isblocked > 0) {
      throw new Error(`you already blocked  please try again  after ${isblocked} seconds`)
    }
    const ttlotp = await redisService.ttl(redisService.otp_key({ email, subject }))



    if (ttlotp > 0) {

      throw new Error(`you already have otp not expired yet please try again after ${ttlotp} seconds`)
    }

    if (await redisService.get(redisService.max_otp_key(email))) >= 3) {
      await redisService.setvalue({ key: redisService.block_otp_key({ email, subject }), value: 1, ttl: 15 * 60 })
      throw new Error(`you exceed the maximmu number of trials`)
    }
    const otp = await generateotp()
    eventemitter.emit(EventEnum.confirmemail, async () => {
      await sendemail({
        to: email,
        subject: "hello to social  app",
        html: emailtemplete(otp)
      })
      await  redisService.setvalue({ key: redisService.otp_key({ email, subject }), value: Hash({ plain_text: `${otp}` }), ttl: 60 * 2 })
      await redisService.incr(redisService.max_otp_key( email ))
    })

  }
  export const resendotp = async (req: Request, res: Response, next: NextFunction) => {
    const { email } : IresendotpType = req.body
    const user = await this._usermodel.findone({
      filter: { email, confirm: { $exists: false }, provider: providerenum.system },
    })
    if (!user) {
      throw new Error("user not exist or already confirmed");
    }
    await this.sendemailotp({ email, subject: EventEnum.confirmemail })

    successresponse({ res, message: "email confirmed successfuly" })
  }
//   signupwithGmail=async(req:Request,res:Response,next:NextFunction)=>{

//     const {idtoken}=req.body
//     console.log(idtoken,"idtoken");
//     const client=new OAuth2Client();
//     const ticket=await client.verifyIdToken({
//       idToken:idtoken,
//       audience:client_id!;
//     })
//     const payload=ticket.getPayload();
//     console.log(payload,"payload");
//     const{email, email_verified, name, picture} = payload as TokenPayload
//     let user=await this._usermodel.findOne({filter:{email}})
//     if(!user){
//       user=await this._usermodel.create({
//         email:email!,

//         confirmed: email_verified !,
//         username: name!,
        
//         provider: providerenum.google,
//       } as Partial<Iuser>);
//     }
//     if (user.provider !== providerenum.google) {
//       throw new AppError("please login with your email and password", 400);

//     }
//   }
// const access_token=generatetoken({
//     payload:{id:user._id,email:user.email,provider:providerenum.google},
//     secret_key:user?.role==RoleEnum.user?secret_key_user!:secret_key_admin!,
//     options:{expiresIn:"1h"}

// })
// successresponse({ res, status:201, message: "signup with google successfuly", data: { access_token } })
  signupwithGmail = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { idtoken } = req.body

      const client = new OAuth2Client(client_id)

      const ticket = await client.verifyIdToken({
        idToken: idtoken,
        audience: client_id!
      })

      const payload = ticket.getPayload();

      if (!payload) {
        throw new AppError("invalid google token")
      }

      const { email, email_verified, name, picture } = payload as TokenPayload

      let user = await this._usermodel.findOne({
        filter: { email }
      })

      if (!user) {
        user = await this._usermodel.create({
          email: email!,
          confirmed: email_verified!,
          username: name!,
          profilePic: picture,
          provider: providerenum.google,
        } as Partial<Iuser>)
      }

      if (user.provider !== providerenum.google) {
        throw new AppError("please login with your email and password", 400)
      }

      const uuid = randomUUID()
//login
      const access_token = this._tokenservice.generatetoken({
        payload: { id: user._id, email: user.email },
        secret_key: user?.role == RoleEnum.user ? secret_key_user! : secret_key_admin!,
        options: { expiresIn: "1h", jwtid: uuid }
      })

      successresponse({
        res,
        message: "signup with google successfuly",
        data: { access_token }
      })

    } catch (error) {
      next(error)
    }
  }
  uploadimage=async(req:Request,res:Response,next:NextFunction)=>{
    const urls=await  this._s3service.uploadfiles({
      files=req.files as Express.Multer.File[],
      path:"users/many",
      islarge:true
    

    })
    successresponse({ res, data: urls})

  }
  upload = async (req: Request, res: Response, next: NextFunction) => {
    const{Filename,ContentType}=req.body
    const {url,key}}=await this._s3service.CreatePresignedUrl({
      Filename,
      ContentType,
      path:"users/${req.user._id}",


    })
   await this._usermodel.findoneAndUpdate({
    filter:{_id:req?.user?._id},
    update:{profilepic:Key}
   })
    successresponse({ res, data: {Key,url }})

  }
upload files= async (req: Request, res: Response, next: NextFunction) => {
const urls=await this._s3service.uploadfiles({
  files:req.files as Express.Multer.File[],
  path:`users/${req?.user?._id}`,
  islarge:true
})
successresponse({ res, data:  urls  })

  }

export default new userservice()
// انا مش محتاجه ابعت parameter فبعت instance لكن لو عايزه ابعت parameter هبعت class نفسه