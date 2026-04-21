"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = hash;
exports.compare = compare;
const bcrypt_1 = require("bcrypt");
const conflig_service_1 = require("../../../conflig/conflig.service");
function hash({ plain_text, saltround = Number(conflig_service_1.saltrounds), }) {
    return (0, bcrypt_1.hashSync)(plain_text.toString(), Number(saltround));
}
function compare({ plain_text, cipher_text, }) {
    return (0, bcrypt_1.compareSync)(plain_text, cipher_text);
}
