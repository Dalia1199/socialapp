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
const s3_servics_1 = require("./common/service/s3.servics");
const response_success_1 = require("./common/utilis/response.success");
const promises_1 = require("stream/promises");
const post_controller_1 = __importDefault(require("./Modules/posts/post.controller"));
const story_controller_1 = __importDefault(require("./Modules/story/story.controller"));
const notification_controller_1 = __importDefault(require("./Modules/notifications/notification.controller"));
const qraphql_schema_1 = require("./Modules/graphql/qraphql.schema");
// import notificationService from "./common/service/notification.service";
const app = (0, express_1.default)();
const port = Number(conflig_service_1.Port);
const bootstrap = async () => {
    const limter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "too many requests from this ip,please try again later",
        handler: (req, res, next) => {
            throw new global_error_handler_1.AppError(`too many requests from this ip,please try again later`, 429);
        },
        legacyHeaders: false
    });
    app.use(express_1.default.json());
    app.use((0, cors_1.default)(), (0, helmet_1.default)(), limter);
    app.get("/", (req, res, next) => {
        res.status(200).json({ message: "welcome on socialmedia app 😊😊" });
    });
    // app.post("/send-notification",(req:Request,res:Response,next:NextFunction)=>{
    //     notificationService.sendnotification({
    //         token:req.body.token,
    //         data:{
    //             title:"welcome to social app",
    //             body:"have agood day"
    //         }
    //      })
    //     console.log({token:req.body.token});
    // })
    app.get("/upload", async (req, res, next) => {
        const { foldername } = req.query;
        console.log({ foldername });
        let result = await new s3_servics_1.s3service().getfiles(foldername);
        let resultmapped = result.Contents?.map((file) => {
            return { key: file.Key };
        });
        (0, response_success_1.successresponse)({ res, data: resultmapped });
    });
    //delete
    app.get("/upload-file", async (req, res, next) => {
        const { Key } = req.query;
        console.log({ Key });
        let result = await new s3_servics_1.s3service().deletefile(Key);
        (0, response_success_1.successresponse)({ res, data: result });
    });
    //delte files
    app.get("/upload-files", async (req, res, next) => {
        const { foldername } = req.body;
        let result = await new s3_servics_1.s3service().deletefolder(foldername);
        (0, response_success_1.successresponse)({ res, data: result });
    });
    app.get("/upload/pre-signed/*path", async (req, res, next) => {
        const { path } = req.params;
        const { download } = req.query;
        const key = path.join("/");
        const url = await new s3_servics_1.s3service().getpresignurl({ key, download });
        (0, response_success_1.successresponse)({ res, data: url });
    });
    app.get("/upload/*path", async (req, res, next) => {
        const { path } = req.params;
        const { download } = req.query;
        const Key = path.join("/");
        const result = await new s3_servics_1.s3service().getfile(Key);
        const stream = result.Body;
        res.setHeader("Content-type", result.ContentType);
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        if (download && download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${path.pop()}"`);
        }
        await (0, promises_1.pipeline)(stream, res);
    });
    (0, connectiondb_1.checkconnection)();
    //  await redisService.connect()
    app.use("/auth", user_controller_1.default);
    app.use("/posts", post_controller_1.default);
    app.use("/stories", story_controller_1.default);
    app.use("/notifications", notification_controller_1.default);
    app.use("/graphqql", createHandler({ schema: qraphql_schema_1.qraphqlschema }));
    app.use("{/*demo}", (req, res, next) => {
        // throw new Error(`url ${req.originalUrl}with method ${req.method} not found`,{cause:404})
        throw new global_error_handler_1.AppError("url not found", 404);
    });
    app.use(global_error_handler_1.globalerrorhandler);
    app.listen(port, () => {
        console.log(`server is running on port${port}`);
    });
};
exports.default = bootstrap;
//# sourceMappingURL=app.controller.js.map