"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = hash;
exports.compare = compare;
// import { hashSync,compareSync } from "bcrypt";
// import { saltrounds } from "../../../conflig/conflig.service";
// export function hash({plain_text,saltround=saltrounds}:{}){plain_text:string,saltround?:string
//     return hashSync(plain_text,Number(saltround))
// }
// export function compare ({plain_text,cipher_text}={}){
//     return compareSync(plain_text,cipher_text)
// }
const bcrypt_1 = require("bcrypt");
const conflig_service_1 = require("../../../conflig/conflig.service");
function hash({ plain_text, saltround = conflig_service_1.saltrounds, }) {
    return (0, bcrypt_1.hashSync)(plain_text, saltround);
}
function compare({ plain_text, cipher_text, }) {
    return (0, bcrypt_1.compareSync)(plain_text, cipher_text);
}
