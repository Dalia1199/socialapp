"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const conflig_service_1 = require("./conflig/conflig.service");
const global_error_handler_1 = require("./common/utilis/global-error-handler");
const user_controller_1 = __importDefault(require("./Modules/auth/user.controller"));
const connectiondb_1 = require("./db/connectiondb");
const app = (0, express_1.default)();
const port = Number(conflig_service_1.Port);
const bootstrap = () => {
    const limter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "too many requests from this ip,please try again later",
        handler: (req, res, next) => {
            // res.status(429).json({message: "too many requests from this ip,please try again later"
            // })
            throw new global_error_handler_1.AppError(`too many requests from this ip,please try again later`, 429);
        },
        legacyHeaders: false
    });
    app.use(express_1.default.json());
    app.use((0, cors_1.default)(), (0, helmet_1.default)(), limter);
    app.get("/", (req, res, next) => {
        res.status(200).json({ message: "welcome on socialmedia app 😊😊" });
    });
    app.use("/auth", user_controller_1.default);
    (0, connectiondb_1.checkconnection)();
    app.use("{/*demo}", (req, res, next) => {
        // throw new Error(`url ${req.originalUrl}with method ${req.method} not found`,{cause:404})
        throw new global_error_handler_1.AppError();
    });
    app.use(global_error_handler_1.globalerrorhandler);
    app.listen(port, () => {
        console.log(`server is running on port${port}`);
    });
};
exports.default = bootstrap;
