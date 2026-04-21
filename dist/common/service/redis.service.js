"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const redis_1 = require("redis");
const conflig_service_1 = require("../../conflig/conflig.service");
const event_enum_1 = require("../enum/event.enum");
class redisService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: conflig_service_1.redisurl
        });
        this.handleevent();
    }
    handleevent() {
        this.client.on("error", (error) => {
            console.log("connected.redis failed!", error);
        });
    }
    async connect() {
        this.client.connect();
        console.log("connected to redis successfuly");
    }
    ;
    revokedkey = ({ userid, jti }) => {
        return `revoketoken::${userid}::${jti}`;
    };
    get_key = ({ userid }) => {
        return `revoketoken ::${userid}`;
    };
    otp_key = ({ email, subject = event_enum_1.EventEnum.confirmemail }) => {
        return `otp::${email}::${subject}`;
    };
    max_otp_key = (email) => {
        return `otp ::${email}::max_tries`;
    };
    block_otp_key = (email) => {
        return ` ${this.otp_key({ email })}::blocked `;
    };
    setvalue = async ({ key, value, ttl }) => {
        try {
            const data = typeof value === "string" ? value : JSON.stringify(value);
            return ttl ? await this.client.set(key, data, { EX: ttl }) : await this.client.set(key, data);
        }
        catch (error) {
            console.log(error, "error on set operation ");
        }
    };
    update = async ({ key, value, ttl }) => {
        try {
            if (!await this.client.exists(key))
                return 0;
            return await this.setvalue({ key, value, ttl });
        }
        catch (error) {
            console.log(error, "error on update operation ");
        }
    };
    get = async (key) => {
        try {
            try {
                return JSON.parse(await this.client.get(key));
            }
            catch (error) {
                return await this.client.get(key);
            }
        }
        catch (error) {
            console.log(error, "error on get operation ");
        }
    };
    ttl = async (key) => {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            console.log(error, "error to get ttl operation");
        }
    };
    exists = async (key) => {
        try {
            return await this.client.exists(key);
        }
        catch (error) {
            console.log(error, "error to get exist operation");
        }
    };
    deleletekey = async (key) => {
        try {
            if (key.length == 0)
                return 0;
            return await this.client.del(key);
        }
        catch (error) {
            console.log(error, "error on delete operation");
        }
    };
    expire = async ({ key, ttl }) => {
        try {
            return await this.client.expire(key, ttl);
        }
        catch (error) {
            console.log(error, "error to get exist operation operation");
        }
    };
    keys = async (pattern) => {
        try {
            return await this.client.keys(`${pattern}*`);
        }
        catch (error) {
            console.log(error, "fail to get keys  operation ");
        }
    };
    incr = async (key) => {
        try {
            return await this.client.keys(`${key}*`);
        }
        catch (error) {
            console.log(error, "fail to get keys  operation ");
        }
    };
}
exports.redisService = redisService;
exports.default = new redisService();
