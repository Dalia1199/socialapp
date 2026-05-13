"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_REGION = exports.AWS_SECRET_ACCESS_KEY = exports.AWS_ACCESS_KEY = exports.AWS_BUCKET_NAME = exports.Prefix_user = exports.Prefix_admin = exports.Prefix = exports.refreshsecret_admin = exports.secret_key_admin = exports.secret_key_user = exports.refreshsecretkey_user = exports.redisurl = exports.Email = exports.password = exports.saltrounds = exports.mongourl = exports.Port = void 0;
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const NODE_ENV = process.env.NODE_ENV;
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, `../../.env.${NODE_ENV}`) });
exports.Port = Number(process.env.port) || 3000;
exports.mongourl = process.env.mongourl;
//الى راجع مش undefined
exports.saltrounds = process.env.saltrounds;
exports.password = process.env.password;
exports.Email = process.env.Email;
exports.redisurl = process.env.redisurl;
exports.refreshsecretkey_user = process.env.refreshsecretkey_user;
exports.secret_key_user = process.env.secret_key_user;
exports.secret_key_admin = process.env.secret_key_admin;
exports.refreshsecret_admin = process.env.refreshsecret_admin;
exports.Prefix = process.env.prefix;
exports.Prefix_admin = process.env.prefix_admin;
exports.Prefix_user = process.env.prefix_user;
exports.AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
exports.AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
exports.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
exports.AWS_REGION = process.env.AWS_REGION;
//# sourceMappingURL=conflig.service.js.map