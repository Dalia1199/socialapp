"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateotp = exports.sendemail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const conflig_service_1 = require("../../../conflig/conflig.service");
const sendemail = async (mailoptions) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: conflig_service_1.Email,
            pass: conflig_service_1.password,
        },
    });
    const info = await transporter.sendMail({
        from: `"dalia"<${conflig_service_1.Email}>`,
        ...mailoptions
    });
    console.log("Message sent:", info.messageId);
    return info.accepted.length > 0 ? true : false;
};
exports.sendemail = sendemail;
const generateotp = async () => {
    return Math.floor(Math.random() * 90000 * 10000);
};
exports.generateotp = generateotp;
