"use strict";
// import { readonly, string } from "zod";
// import { emailenum } from "../../common/enum/emailenum";
// import { redisclient } from "./redis.connect";
// import mongoose, { Types } from "mongoose";
// import{createclient} from "redis"
// clsss redis service{
//     private readonly client;
//     constructor(){
//         this.client=createclient({
//             url:redisclient_url !
//         })
//         this.hadleevent()
Object.defineProperty(exports, "__esModule", { value: true });
exports.incr = exports.keys = exports.expire = exports.deleletekey = exports.exists = exports.ttl = exports.get = exports.update = exports.setvalue = exports.block_otp_key = exports.max_otp_key = exports.otp_key = exports.get_key = exports.revokedkey = void 0;
const event_enum_1 = require("../../common/enum/event.enum");
const redis_connect_1 = require("./redis.connect");
const revokedkey = ({ userid, jti }) => {
    return `revoketoken::${userid}::${jti}`;
};
exports.revokedkey = revokedkey;
const get_key = ({ userid }) => {
    return `revoketoken ::${userid}`;
};
exports.get_key = get_key;
const otp_key = ({ email, subject = event_enum_1.EventEnum.confirmemail }) => {
    return `otp::${email}::${subject}`;
};
exports.otp_key = otp_key;
const max_otp_key = (email) => {
    return `otp ::${email}::max_tries`;
};
exports.max_otp_key = max_otp_key;
const block_otp_key = (email) => {
    return ` ${(0, exports.otp_key)({ email })}::blocked `;
};
exports.block_otp_key = block_otp_key;
const setvalue = async ({ key, value, ttl }) => {
    try {
        const data = typeof value === "string" ? value : JSON.stringify(value);
        return ttl ? await redis_connect_1.redisclient.set(key, data, { EX: ttl }) : await redis_connect_1.redisclient.set(key, data);
    }
    catch (error) {
        console.log(error, "error on set operation ");
    }
};
exports.setvalue = setvalue;
const update = async ({ key, value, ttl }) => {
    try {
        if (!await redis_connect_1.redisclient.exists(key))
            return 0;
        return await (0, exports.setvalue)({ key, value, ttl });
    }
    catch (error) {
        console.log(error, "error on update operation ");
    }
};
exports.update = update;
const get = async (key) => {
    try {
        try {
            return JSON.parse(await redis_connect_1.redisclient.get(key));
        }
        catch (error) {
            return await redis_connect_1.redisclient.get(key);
        }
    }
    catch (error) {
        console.log(error, "error on get operation ");
    }
};
exports.get = get;
const ttl = async (key) => {
    try {
        return await redis_connect_1.redisclient.ttl(key);
    }
    catch (error) {
        console.log(error, "error to get ttl operation");
    }
};
exports.ttl = ttl;
const exists = async (key) => {
    try {
        return await redis_connect_1.redisclient.exists(key);
    }
    catch (error) {
        console.log(error, "error to get exist operation");
    }
};
exports.exists = exists;
const deleletekey = async (key) => {
    try {
        if (key.length == 0)
            return 0;
        return await redis_connect_1.redisclient.del(key);
    }
    catch (error) {
        console.log(error, "error on delete operation");
    }
};
exports.deleletekey = deleletekey;
const expire = async ({ key, ttl }) => {
    try {
        return await redis_connect_1.redisclient.expire(key, ttl);
    }
    catch (error) {
        console.log(error, "error to get exist operation operation");
    }
};
exports.expire = expire;
const keys = async (pattern) => {
    try {
        return await redis_connect_1.redisclient.keys(`${pattern}*`);
    }
    catch (error) {
        console.log(error, "fail to get keys  operation ");
    }
};
exports.keys = keys;
const incr = async (key) => {
    try {
        return await redis_connect_1.redisclient.keys(`${key}*`);
    }
    catch (error) {
        console.log(error, "fail to get keys  operation ");
    }
};
exports.incr = incr;
