"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_1 = require("../../common/middleware/authentication");
const storyservice_1 = __importDefault(require("./storyservice"));
const multer_cloud_1 = __importDefault(require("../../common/middleware/multer.cloud"));
const multerenum_1 = require("../../common/enum/multerenum");
const storyrouter = (0, express_1.Router)();
storyrouter.post("/", authentication_1.authentication, (0, multer_cloud_1.default)({ store_type: multerenum_1.store_enum.memory }).array("attachments"), storyservice_1.default.createstory);
storyrouter.delete("/:storyid", authentication_1.authentication, storyservice_1.default.deletestory);
//# sourceMappingURL=story.controller.js.map