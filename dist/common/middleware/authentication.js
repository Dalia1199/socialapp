"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const global_error_handler_1 = require("../utilis/global-error-handler");
const conflig_service_1 = require("../../conflig/conflig.service");
const token_service_1 = __importDefault(require("../service/token service"));
const user_repository_1 = require("../../db/repositry/user repository ");
const redis_service_1 = __importDefault(require("../service/redis.service"));
const usermodel = new user_repository_1.userRepository();
const authentication = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        throw new global_error_handler_1.AppError("Token not found");
    }
    const [prefix, token] = authorization.split(" ");
    if (!token) {
        throw new global_error_handler_1.AppError("token not found");
    }
    let accesssecretkey = "";
    if (prefix == conflig_service_1.Prefix_user) {
        accesssecretkey = conflig_service_1.secret_key_user;
    }
    else if (prefix == conflig_service_1.Prefix_admin) {
        accesssecretkey = conflig_service_1.secret_key_admin;
    }
    else {
        throw new global_error_handler_1.AppError("invalid token prefix");
    }
    const decoded = token_service_1.default.verifytoken({
        token,
        secret_key: accesssecretkey,
    });
    if (!decoded || !decoded?.id) {
        throw new global_error_handler_1.AppError("Invalid token payload");
    }
    const user = await usermodel.findOne({ filter: { id: decoded.id } });
    if (!user) {
        throw new global_error_handler_1.AppError("User not found", 400);
    }
    if (!user.confirmed) {
        throw new global_error_handler_1.AppError("Please confirm your email to access this resource", 400);
    }
    // if (
    //     user.changeCredential?.getTime &&
    //     user.changeCredential.getTime() > decoded.iat * 1000
    // ) {
    //     throw new AppError("Token expired due to password change");
    // }
    const revokedtoken = await redis_service_1.default.get(redis_service_1.default.revokedkey({ userid: decoded.id, jti: decoded.jti }));
    if (revokedtoken) {
        throw new global_error_handler_1.AppError("Token has been revoked");
    }
    req.user = user;
    req.decoded = decoded;
    next();
};
exports.authentication = authentication;
