"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_1 = require("../../common/middleware/authentication");
const authorization_1 = require("../../common/middleware/authorization");
const validation_1 = require("../../common/middleware/validation");
const notification_service_1 = __importDefault(require("./notification.service"));
const notificationvalidation = __importStar(require("./notification.validation"));
const notificationrouter = (0, express_1.Router)();
notificationrouter.post("/", authentication_1.authentication, (0, authorization_1.authorization)(["admin"]), (0, validation_1.validation)(notificationvalidation.createnotificationschema), notification_service_1.default.createnotification);
notificationrouter.get("/all", authentication_1.authentication, (0, authorization_1.authorization)(["admin"]), notification_service_1.default.getnotifications);
notificationrouter.get("/", authentication_1.authentication, notification_service_1.default.getmynotifications);
notificationrouter.patch("/:notificationid/read", authentication_1.authentication, (0, validation_1.validation)(notificationvalidation.notificationidschema), notification_service_1.default.markasread);
notificationrouter.put("/:notificationid", authentication_1.authentication, (0, authorization_1.authorization)(["admin"]), (0, validation_1.validation)(notificationvalidation.updatenotificationschema), notification_service_1.default.updatenotification);
notificationrouter.delete("/:notificationid", authentication_1.authentication, (0, authorization_1.authorization)(["admin"]), (0, validation_1.validation)(notificationvalidation.notificationidschema), notification_service_1.default.deletenotification);
exports.default = notificationrouter;
//# sourceMappingURL=notification.controller.js.map