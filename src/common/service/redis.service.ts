import { RedisClientType } from "@redis/client"
import { createClient } from "redis"
import { redisurl } from "../../conflig/conflig.service"
import { Types } from "mongoose";
import { EventEnum } from "../enum/event.enum";

export class redisService {
    private readonly client: RedisClientType
    constructor() {
        this.client= createClient({
            url: redisurl!
        });
        this.handleevent()
    }
    handleevent() {
        this.client.on("error", (error) => {
            console.log("connected.redis failed!", error);
        })
    }
    async connect(){
        this.client.connect()
    console.log("connected to redis successfuly" )
    };
    
 get_key = ({ userid }: { userid: Types.ObjectId }) => {
    return `revoketoken ::${userid}`
}
 otp_key = ({ email, subject = EventEnum.confirmemail }: { email: string, subject?: EventEnum }) => {
    return `otp::${email}::${subject}`
}
 max_otp_key = (email: string) => {
    return `otp ::${email}::max_tries`
}
 block_otp_key = (email: string) => {
    return ` ${this.otp_key({ email })}::blocked `
}

 setvalue = async ({ key, value, ttl }: { key: string, value: string, ttl: number }) => {
    try {
        const data = typeof value === "string" ? value : JSON.stringify(value)
        return ttl ? await this.client.set(key, data, { EX: ttl }) : await this.client.set(key, data)
    }
    catch (error) {
        console.log(error, "error on set operation ");

    }

}
 update = async ({ key, value, ttl }: { key: string, value: string, ttl: number }) => {
    try {
        if (!await this.client.exists(key)) return 0
        return await this.setvalue({ key, value, ttl })
    }
    catch (error) {
        console.log(error, "error on update operation ");

    }

}
 get = async (key: string) => {
    try {
        try { return JSON.parse(await this.client.get(key) as string) }
        catch (error) {
            return await this.client.get(key)
        }
    }
    catch (error) {
        console.log(error, "error on get operation ");

    }

}
 ttl = async (key: string) => {
    try {
        return await this.client.ttl(key)
    }
    catch (error) {
        console.log(error, "error to get ttl operation");
    }
}
 exists = async (key: string) => {
    try {
        return await this.client.exists(key)
    }
    catch (error) {
        console.log(error, "error to get exist operation");
    }
}
 deleletekey = async (key: string | string[]) => {
    try {
        if (key.length == 0) return 0
        return await this.client.del(key)
    }
    catch (error) {
        console.log(error, "error on delete operation");

    }

}
 expire = async ({ key, ttl }: { key: string, ttl: number }) => {
    try {
        return await this.client.expire(key, ttl)
    }
    catch (error) {
        console.log(error, "error to get exist operation operation");
    }

}
 keys = async (pattern: string) => {
    try {
        return await this.client.keys(`${pattern}*`)
    }
    catch (error) {
        console.log(error, "fail to get keys  operation ");

    }

}
 incr = async (key: string) => {
    try {
        return await this.client.keys(`${key}*`)
    }
    catch (error) {
        console.log(error, "fail to get keys  operation ");

    }

}}
    export default new redisService()