import {resolve}from "path";
import { config } from "dotenv";
const NODE_ENV= process.env.NODE_ENV
config ({path:resolve(__dirname,`../../.env.${NODE_ENV}`)})
export const Port:number =Number(process.env.port)||3000
export const mongourl:string=process.env.mongourl!;
//الى راجع مش undefined
export const saltrounds:string=process.env.saltrounds!;
export const password=process.env.password!
export const Email = process.env.Email
export const redisurl = process.env.redisurl
export const refreshsecretkey_user = process.env.refreshsecretkey_user
export const secret_key_user = process.env.secret_key_user
export const secret_key_admin = process.env.secret_key_admin
export const refreshsecret_admin = process.env.refreshsecret_admin
export const Prefix = process.env.prefix
export const Prefix_admin = process.env.prefix_admin
export const Prefix_user = process.env.prefix_user