"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = require("../../db/repositry/user repository ");
class userservice {
    _usermodel = new user_repository_1.userRepository();
    constructor() {
    }
    signup = async (req, res, next) => {
        const { email, password, age, gender } = req.body;
        //concept data to object 
        const user = await this._usermodel.create({ email, password, age, gender });
        res.status(200).json({ message: "user signed up successfuly", user });
    };
    signin = async (req, res, next) => {
        res.status(200).json({ message: "user signed in successfuly" });
    };
}
exports.default = new userservice();
// انا مش محتاجه ابعت parameter فبعت instance لكن لو عايزه ابعت parameter هبعت class نفسه
