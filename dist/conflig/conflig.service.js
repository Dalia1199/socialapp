"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.password = exports.saltrounds = exports.mongourl = exports.Port = void 0;
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const NODE_ENV = process.env.NODE_ENV;
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, `../../.env.${NODE_ENV}`) });
exports.Port = Number(process.env.port) || 3000;
exports.mongourl = process.env.mongourl;
//الى راجع مش undefined
exports.saltrounds = process.env.saltrounds;
exports.password = process.env.password;
