"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userenum_1 = require("../../common/enum/userenum");
const zod_1 = require("zod");
const userschema = new mongoose_1.default.Schema({
    fname: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 7,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 7,
        trim: true
    },
    profilepic: String,
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: function () {
            return this.provider == userenum_1.providerenum.system ? true : false;
        },
        trim: true,
        minLength: 6
    },
    provider: {
        type: String,
        enum: userenum_1.providerenum,
        default: userenum_1.providerenum.system
    },
    age: {
        type: Number,
        required: function () {
            return this.provider == userenum_1.providerenum.system ? true : false;
        },
    },
    gender: {
        type: String,
        enum: userenum_1.GenderEnum,
        default: userenum_1.GenderEnum.male
    },
    role: {
        type: String,
        enum: userenum_1.RoleEnum
    },
    confirmed: Boolean,
    adress: {
        type: zod_1.string,
        trim: true
    },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
userschema.virtual("username").get(function () {
    return this.fname + " " + this.lname;
}).set(function (val) {
    this.set({ fname: val.split(" ")[0], lname: val.split(" ")[1] });
});
// userschema.pre("findone",function(){
//     console.log("=====prehook====");
//     console.log(this.getquery());
//     const{paranoid,....rest}=this.getquery()
//     console.log({rest});
//     if (paranoid==false){
//         this.setquery({..rest});
//     }this.setquery({..rest,deletedAT:{$exists:false}})
// })
// userschema.pre("save", function () {
//     console.log("pre save hook");
//     console.log(this)
//     console.log (this.modifiedPaths());
//     if (this.isModified("password")) {
//         this.password = hash({ plaintext: this.password })
//     }
// })
//mongoose hooks
// async function test(){
//     const user =new usermodel({
//         username:"dalia",
//         email: `${Date.now()}@gmail.com`,
//         password:"123",
//         age:26,})
//     await user.save()
//     test()
// }
//mongoose hooks
// async function test(){
//     const user =new usermodel({
//         username:"dalia",
//         email: `${Date.now()}@gmail.com`,
//         password:"123",
//         age:26,})
//     await user.save()
//     test()
// }
const usermodel = mongoose_1.default.models.user || mongoose_1.default.model("user", userschema);
exports.default = usermodel;
//# sourceMappingURL=user.model.js.map