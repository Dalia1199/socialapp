"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = require("fs");
const node_path_1 = require("node:path");
class notifictionservice {
    client;
    constructor() {
        const serviceAccount = JSON.parse((0, fs_1.readFileSync)((0, node_path_1.resolve)(__dirname, "../../conflig/social-app-cb578-firebase-adminsdk-fbsvc-3594383195.json"), "utf-8"));
        this.client = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount)
        });
    }
    async sendnotification({ token, data }) {
        const message = {
            token, data
        };
        return await this.client.messaging().send(message);
    }
    async sendnotifications({ tokens, data }) {
        await Promise.all(tokens.map((token) => {
            return this.sendnotification({ token, data });
        }));
    }
}
exports.default = new notifictionservice();
//# sourceMappingURL=notification.service.js.map