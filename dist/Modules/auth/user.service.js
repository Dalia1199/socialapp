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
class userservice {
    _usermodel = new user_repository_1.userRepository();
    _redisservice = redis_service_1.default;
    _tokenservice = token_service_1.default;
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
        const { email, password } = req.body;
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
        const otp = await (0, send_email_1.generateotp)();
        email_events_1.eventemitter.emit(event_enum_1.EventEnum.forgetpassword, async () => {
            await (0, send_email_1.sendemail)({
                to: email,
                subject: "reset password",
                html: (0, emai_templete_1.emailtemplete)(otp)
            });
            await this._redisservice.setvalue({
                key: this._redisservice.otp_key({ email, subject: event_enum_1.EventEnum.forgetpassword }),
                value: (0, hash_1.hash)({ plain_text: `${otp}` }),
                ttl: 60 * 2
            });
        });
        (0, response_success_1.successresponse)({ res, message: "otp sent to email" });
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
}
exports.default = new userservice();
// انا مش محتاجه ابعت parameter فبعت instance لكن لو عايزه ابعت parameter هبعت class نفسه
