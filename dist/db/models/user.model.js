"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("../../common/enum/enum");
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
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enumm: enum_1.GenderEnum,
        default: enum_1.GenderEnum.male
    },
    role: {
        type: String,
        enum: enum_1.RoleEnum
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
const usermodel = mongoose_1.default.models.user || mongoose_1.default.model("user", userschema);
exports.default = usermodel;
