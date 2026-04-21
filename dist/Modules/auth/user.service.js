"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_error_handler_1 = require("../../common/utilis/global-error-handler");
const user_repository_1 = require("../../db/repositry/user repository ");
const hash_1 = require("../../common/utilis/security/hash");
const send_email_1 = require("../../common/utilis/email/send email");
const emai_templete_1 = require("../../common/utilis/email/emai.templete");
const event_enum_1 = require("../../common/enum/event.enum");
const email_events_1 = require("../../common/utilis/email/email.events");
const redis_service_1 = require("../../db/redis/redis.service");
const userenum_1 = require("../../common/enum/userenum");
const response_success_1 = require("../../common/utilis/response.success");
class userservice {
    _usermodel = new user_repository_1.userRepository();
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
            await (0, redis_service_1.setvalue)({ key: (0, redis_service_1.otp_key)({ email, subject: event_enum_1.EventEnum.confirmemail }), value: (0, hash_1.hash)({ plain_text: `${otp}` }), ttl: 60 * 2 });
            await (0, redis_service_1.setvalue)({ key: (0, redis_service_1.max_otp_key)(email), value: "1", ttl: 60 * 30 });
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
        const otpexist = await (0, redis_service_1.get)((0, redis_service_1.otp_key)({ email }));
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
        await (0, redis_service_1.deleletekey)((0, redis_service_1.otp_key)({ email }));
        (0, response_success_1.successresponse)({ res, message: "email confirmed successfuly" });
    };
    signin = async (req, res, next) => {
        res.status(200).json({ message: "user signed in successfuly" });
    };
}
exports.default = new userservice();
// انا مش محتاجه ابعت parameter فبعت instance لكن لو عايزه ابعت parameter هبعت class نفسه
