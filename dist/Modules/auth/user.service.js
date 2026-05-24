"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const global_error_handler_1 = require("../../common/utilis/global-error-handler");
const user_repository_1 = require("../../db/repositry/user repository ");
const hash_1 = require("../../common/utilis/security/hash");
const send_email_1 = require("../../common/utilis/email/send email");
const emai_templete_1 = require("../../common/utilis/email/emai.templete");
const event_enum_1 = require("../../common/enum/event.enum");
const email_events_1 = require("../../common/utilis/email/email.events");
const userenum_1 = require("../../common/enum/userenum");
const response_success_1 = require("../../common/utilis/response.success");
const redis_service_1 = __importDefault(require("../../common/service/redis.service"));
const crypto_1 = require("crypto");
const token_service_1 = __importDefault(require("../../common/service/token service"));
const conflig_service_1 = require("../../conflig/conflig.service");
const google_auth_library_1 = require("google-auth-library");
const s3_servics_1 = require("../../common/service/s3.servics");
const notification_service_1 = __importDefault(require("../../common/service/notification.service"));
let users = [
    { id: 1, name: "ahmed", age: 32, gender: "male" },
    { id: 2, name: "mohamed", age: 40, gender: "female" },
    { id: 3, name: "dalia", age: 26, gender: "female" },
];
class userservice {
    _usermodel = new user_repository_1.userRepository();
    _redisservice = redis_service_1.default;
    _tokenservice = token_service_1.default;
    _s3service = new s3_servics_1.s3service();
    notificationservice = notification_service_1.default;
    constructor() {
    }
    signup = async (req, res, next) => {
        let { email, password, age, gender } = req.body;
        //concept data to object 
        if (await this._usermodel.findOne({ filter: { email } })) {
            throw new global_error_handler_1.AppError("email already exists", 409);
        }
        const otp = await (0, send_email_1.generateotp)();
        email_events_1.eventemitter.emit(event_enum_1.EventEnum.confirmemail, async () => {
            await (0, send_email_1.sendemail)({ to: email, subject: "welcome to our app", html: (0, emai_templete_1.emailtemplete)(otp) });
            await this._redisservice.setvalue({ key: this._redisservice.otp_key({ email, subject: event_enum_1.EventEnum.confirmemail }), value: (0, hash_1.hash)({ plain_text: `${otp}` }), ttl: 60 * 2 });
            await this._redisservice.setvalue({ key: this._redisservice.max_otp_key(email), value: "1", ttl: 60 * 30 });
        });
        const user = await this._usermodel.create({
            email,
            password: (0, hash_1.hash)({ plain_text: password }),
            age, gender
        });
        res.status(200).json({ message: "user signed up successfuly", user });
    };
    confirmemail = async (req, res, next) => {
        const { email, code } = req.body;
        const otpexist = await this._redisservice.get(this._redisservice.otp_key({ email }));
        if (!otpexist) {
            throw new global_error_handler_1.AppError("otp expired");
        }
        if (!(0, hash_1.compare)({
            plain_text: code, cipher_text: otpexist
        })) {
            throw new global_error_handler_1.AppError("invalid otp ");
        }
        const user = await this._usermodel.findoneAndUpdate({
            filter: { email, confirmed: { $exists: false }, provider: userenum_1.providerenum.system },
            update: { confirmed: true }
        });
        if (!user) {
            throw new global_error_handler_1.AppError("user not exist");
        }
        await this._redisservice.deleletekey(this._redisservice.otp_key({ email }));
        (0, response_success_1.successresponse)({ res, message: "email confirmed successfuly" });
    };
    signin = async (req, res, next) => {
        const { email, password, fcm } = req.body;
        const user = await this._usermodel.findOne({
            filter: { email,
                provider: userenum_1.providerenum.system,
                confirmed: { $exists: true }
            }
        });
        if (!user) {
            throw new global_error_handler_1.AppError("invalid email or password", 400);
        }
        if (!(0, hash_1.compare)({ plain_text: password, cipher_text: user.password })) {
            throw new global_error_handler_1.AppError("invalid  password", 400);
        }
        const uuid = (0, crypto_1.randomUUID)();
        const access_token = this._tokenservice.generatetoken({
            payload: { id: user._id, email: user.email },
            secret_key: user?.role == userenum_1.RoleEnum.user ? conflig_service_1.secret_key_user : conflig_service_1.secret_key_admin,
            options: { expiresIn: "1h", jwtid: uuid }
        });
        const refresh_token = this._tokenservice.generatetoken({
            payload: { id: user._id, email: user.email },
            secret_key: user?.role == userenum_1.RoleEnum.user ? conflig_service_1.refreshsecretkey_user : conflig_service_1.refreshsecret_admin,
            options: { expiresIn: "7d", jwtid: uuid }
        });
        if (fcm) {
            await this._redisservice.addfcm({ userid: user._id, fcmtoken: fcm });
            const tokens = await this._redisservice.getfcms(user._id);
            await this._redisservice.getfcms(user._id);
            await this.notificationservice.sendnotifications({
                tokens, data: {
                    title: `hi${user.fname}`,
                    body: `new login at ${new Date()}`
                }
            });
        }
        (0, response_success_1.successresponse)({ res, message: "user signed in successfuly", data: { access_token, refresh_token } });
    };
    getprofile = async (req, res, next) => {
        (0, response_success_1.successresponse)({ res, message: "user signed in successfuly", data: { user: req.user } });
    };
    signupwithgmail = async (req, res, next) => {
        const { email, age, gender } = req.body;
        if (await this._usermodel.findOne({ filter: { email } })) {
            throw new global_error_handler_1.AppError("email already exists", 409);
        }
        const user = await this._usermodel.create({
            email,
            age,
            gender,
            provider: userenum_1.providerenum.google,
            confirmed: true
        });
        (0, response_success_1.successresponse)({ res, message: "signup with gmail successfuly", data: { user } });
    };
    loginwithgmail = async (req, res, next) => {
        const { email } = req.body;
        const user = await this._usermodel.findOne({
            filter: {
                email,
                provider: userenum_1.providerenum.google
            }
        });
        if (!user) {
            throw new global_error_handler_1.AppError("user not found", 404);
        }
        const uuid = (0, crypto_1.randomUUID)();
        const access_token = this._tokenservice.generatetoken({
            payload: { id: user._id, email: user.email },
            secret_key: user?.role == userenum_1.RoleEnum.user ? conflig_service_1.secret_key_user : conflig_service_1.secret_key_admin,
            options: { expiresIn: "1h", jwtid: uuid }
        });
        const refresh_token = this._tokenservice.generatetoken({
            payload: { id: user._id, email: user.email },
            secret_key: user?.role == userenum_1.RoleEnum.user ? conflig_service_1.refreshsecretkey_user : conflig_service_1.refreshsecret_admin,
            options: { expiresIn: "7d", jwtid: uuid }
        });
        (0, response_success_1.successresponse)({
            res,
            message: "login with gmail successfuly",
            data: { access_token, refresh_token }
        });
    };
    logout = async (req, res, next) => {
        const { decoded } = req;
        await this._redisservice.setvalue({
            key: this._redisservice.revokedkey({
                userid: decoded.id,
                jti: decoded.jti
            }),
            value: "revoked",
            ttl: 60 * 60 * 24
        });
        (0, response_success_1.successresponse)({ res, message: "logout successfuly" });
    };
    forgetpassword = async (req, res, next) => {
        const { email } = req.body;
        const user = await this._usermodel.findOne({
            filter: {
                email,
                provider: userenum_1.providerenum.system,
                confirmed: { $exists: true }
            }
        });
        if (!user) {
            throw new global_error_handler_1.AppError("user not found");
        }
        await this.sendemailotp({ email, subject: event_enum_1.EventEnum.forgetpassword });
        (0, response_success_1.successresponse)({ res, message: "otp sent to email" });
    };
    sendEmailOtp = async ({ email, subject }) => {
        const otp = await (0, send_email_1.generateotp)();
        await (0, send_email_1.sendemail)({
            to: email,
            subject: "Reset password code",
            html: (0, emai_templete_1.emailtemplete)(otp)
        });
        await this._redisservice.setvalue({
            key: this._redisservice.otp_key({ email, subject }),
            value: (0, hash_1.hash)({ plain_text: `${otp}` }),
            ttl: 60 * 2
        });
        await this._redisservice.setvalue({
            key: this._redisservice.max_otp_key(email),
            value: "1",
            ttl: 60 * 30
        });
    };
    updatepassword = async (req, res, next) => {
        const { oldpassword, newpassword } = req.body;
        const { user } = req;
        const existuser = await this._usermodel.findOne({
            filter: { _id: user._id }
        });
        if (!existuser) {
            throw new global_error_handler_1.AppError("user not found");
        }
        if (!(0, hash_1.compare)({
            plain_text: oldpassword,
            cipher_text: existuser.password
        })) {
            throw new global_error_handler_1.AppError("invalid old password");
        }
        await this._usermodel.findoneAndUpdate({
            id: user._id,
            update: {
                password: (0, hash_1.hash)({ plain_text: newpassword }),
                changecerdintial: Date.now()
            }
        });
        (0, response_success_1.successresponse)({ res, message: "password updated successfuly" });
    };
    resetpassword = async (req, res, next) => {
        const { email, code, password } = req.body;
        const otpvalue = await redis_service_1.default.get(redis_service_1.default.otp_key({ email, subject: event_enum_1.EventEnum.forgetpassword }));
        if (!otpvalue) {
            throw new Error("invalid or expired otp ");
        }
        if (!(0, hash_1.compare)({
            plain_text: code,
            cipher_text: otpvalue
        })) {
            throw new Error("invalid otp ");
        }
        const user = await this._usermodel.findoneAndUpdate({
            filter: {
                email,
                confirmed: { $exists: true },
                provider: userenum_1.providerenum.system
            },
            update: {
                password: (0, hash_1.hash)({ plain_text: password }),
                changecerdintial: new Date()
            }
        });
        if (!user) {
            throw new Error("user not found");
        }
        await redis_service_1.default.deleletekey(redis_service_1.default.otp_key({ email, subject: event_enum_1.EventEnum.forgetpassword }));
        (0, response_success_1.successresponse)({ res, message: "password reset successfuly" });
    };
    sendemailotp = async ({ email, subject }) => {
        const isblocked = await redis_service_1.default.ttl(redis_service_1.default.block_otp_key(email));
        if (isblocked > 0) {
            throw new global_error_handler_1.AppError(`you already blocked  please try again  after ${isblocked} seconds`);
        }
        const ttlotp = await redis_service_1.default.ttl(redis_service_1.default.otp_key({ email, subject }));
        if (ttlotp > 0) {
            throw new global_error_handler_1.AppError(`you already have otp not expired yet please try again after ${ttlotp} seconds`);
        }
        const maxTries = await redis_service_1.default.get(redis_service_1.default.max_otp_key(email));
        if (Number(maxTries) >= 3) { // FIX: fixed broken parenthesis `>= 3)` — was syntax error
            await redis_service_1.default.setvalue({ key: redis_service_1.default.block_otp_key(email), value: "1", ttl: 15 * 60 }); // FIX: value must be string; block_otp_key takes email string
            throw new global_error_handler_1.AppError(`you exceed the maximmu number of trials`);
        }
        const otp = await (0, send_email_1.generateotp)();
        email_events_1.eventemitter.emit(event_enum_1.EventEnum.confirmemail, async () => {
            await (0, send_email_1.sendemail)({
                to: email,
                subject: "hello to social  app",
                html: (0, emai_templete_1.emailtemplete)(otp)
            });
            await redis_service_1.default.setvalue({ key: redis_service_1.default.otp_key({ email, subject }), value: (0, hash_1.hash)({ plain_text: `${otp}` }), ttl: 60 * 2 }); // FIX: was `Hash` (uppercase, wrong import) — fixed to `hash`
            await redis_service_1.default.incr(redis_service_1.default.max_otp_key(email));
        });
    };
    resendotp = async (req, res, next) => {
        const { email } = req.body;
        const user = await this._usermodel.findOne({
            filter: { email, confirm: { $exists: false }, provider: userenum_1.providerenum.system },
        });
        if (!user) {
            throw new Error("user not exist or already confirmed");
        }
        await this.sendemailotp({ email, subject: event_enum_1.EventEnum.confirmemail });
        (0, response_success_1.successresponse)({ res, message: "email confirmed successfuly" });
    };
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
    signupwithGmail = async (req, res, next) => {
        try {
            const { idtoken } = req.body;
            const client_id = process.env.GOOGLE_CLIENT_ID;
            const client = new google_auth_library_1.OAuth2Client(client_id);
            const ticket = await client.verifyIdToken({
                idToken: idtoken,
                audience: client_id
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new global_error_handler_1.AppError("invalid google token");
            }
            const { email, email_verified, name, picture } = payload;
            let user = await this._usermodel.findOne({
                filter: { email }
            });
            if (!user) {
                user = await this._usermodel.create({
                    email: email,
                    confirmed: email_verified,
                    username: name,
                    profilePic: picture,
                    provider: userenum_1.providerenum.google,
                });
            }
            if (user.provider !== userenum_1.providerenum.google) {
                throw new global_error_handler_1.AppError("please login with your email and password", 400);
            }
            const uuid = (0, crypto_1.randomUUID)();
            //login
            const access_token = this._tokenservice.generatetoken({
                payload: { id: user._id, email: user.email },
                secret_key: user?.role == userenum_1.RoleEnum.user ? conflig_service_1.secret_key_user : conflig_service_1.secret_key_admin,
                options: { expiresIn: "1h", jwtid: uuid }
            });
            (0, response_success_1.successresponse)({
                res,
                message: "signup with google successfuly",
                data: { access_token }
            });
        }
        catch (error) {
            next(error);
        }
    };
    uploadimage = async (req, res, next) => {
        const urls = await this._s3service.uploadfiles({
            files: req.files,
            path: "users/many",
            islarge: true
        });
        (0, response_success_1.successresponse)({ res, data: urls });
    };
    upload = async (req, res, next) => {
        try {
            const { Filename, ContentType } = req.body;
            const { url, key } = await this._s3service.CreatePresignedUrl({
                Filename,
                ContentType,
                path: `users/${req.user._id}`, // FIX: was a template literal string "users/${req.user._id}" (not evaluated)
            });
            await this._usermodel.findoneAndUpdate({
                filter: { _id: req?.user?._id },
                update: { profilepic: key }
            });
            (0, response_success_1.successresponse)({ res, data: { key, url } });
        }
        catch (error) {
            next(error);
        }
    };
    uploadfiles = async (req, res, next) => {
        try {
            const urls = await this._s3service.uploadfiles({
                files: req.files,
                path: `users/${req?.user?._id}`,
                islarge: true
            });
            (0, response_success_1.successresponse)({ res, data: urls });
        }
        catch (error) {
            next(error);
        }
    };
    //graphql
    getusersgraphql = async () => {
        return await this._usermodel.find({ filter: {} });
    };
    getuserqraphql = async (args) => {
        return await users.find(user => user.id == args.id);
    };
}
exports.default = new userservice();
// انا مش محتاجه ابعت parameter فبعت instance لكن لو عايزه ابعت parameter هبعت class نفسه
//# sourceMappingURL=user.service.js.map